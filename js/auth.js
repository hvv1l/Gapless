// ============================================================================
// ФАЙЛ: js/auth.js
// Авторизация Supabase без блокировки (Deadlock-free) + синхронизация профиля
// ============================================================================

const SUPABASE_URL = "https://nmlaqvrfxsksuwbjusjh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tbGFxdnJmeHNrc3V3Ymp1c2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxODYzNzUsImV4cCI6MjEwNzc2MjM3NX0._26CSKgxQ7R3rvF6eTiesNtOumPQC5bCVa9RW6VLZEk";

window.supabaseClient = null;
try {
  if (
    window.supabase &&
    SUPABASE_URL &&
    SUPABASE_URL.startsWith("https://") &&
    !SUPABASE_URL.includes("ТВОЙ") &&
    SUPABASE_ANON_KEY.length > 20
  ) {
    window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  }
} catch (err) {
  window.supabaseClient = null;
}

const AuthModule = {
  currentUserId: null,
  isSyncing: false,

  initAuthListener() {
    if (!window.supabaseClient) return;

    // ВАЖНО: В Supabase v2 нельзя делать await запросов к БД прямо внутри onAuthStateChange,
    // иначе signInWithPassword зависает намертво. Выносим синхронизацию в setTimeout.
    window.supabaseClient.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "USER_UPDATED") && session && session.user) {
        setTimeout(async () => {
          await this.syncProfileFromSession(session.user);
          if (window.AuthUI) window.AuthUI.pendingConfirmationEmail = null;
          if (window.renderCurrentModule) window.renderCurrentModule();
        }, 50);
      }
    });
  },

  async syncProfileFromSession(user) {
    if (!user || this.isSyncing) return;
    this.isSyncing = true;
    this.currentUserId = user.id;

    const fallbackName = (user.user_metadata && user.user_metadata.username) || (user.email ? user.email.split("@")[0] : "User");
    let username = AppState.data.userName || fallbackName;

    if (window.supabaseClient) {
      try {
        const { data: profile, error } = await window.supabaseClient
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();

        if (!error && profile) {
          if (profile.username) username = profile.username;
          if (profile.level) AppState.data.selectedLevel = profile.level;
          if (profile.native_lang) AppState.data.nativeLang = profile.native_lang;
          if (Array.isArray(profile.friends_list)) {
            AppState.data.friendsList = profile.friends_list;
          }

          if (typeof profile.onboarding_completed === "boolean") {
            AppState.data.onboardingCompleted = profile.onboarding_completed;
          }

          if (profile.word_status && Object.keys(profile.word_status).length > 0 && window.GaplessDB) {
            GaplessDB.setCloudWordStatus(profile.word_status);
          }
        }
      } catch (e) {
        console.warn("Профиль еще не создан или таблица недоступна:", e);
      }
    }

    AppState.data.userName = username;
    AppState.data.userEmail = user.email || "";
    AppState.data.isAuthenticated = true;

    try {
      localStorage.setItem(AppState.storageKey, JSON.stringify(AppState.data));
    } catch (e) {}

    this.isSyncing = false;
  },

  async saveProgressToCloud() {
    if (!window.supabaseClient || !this.currentUserId) return;

    try {
      // Сначала пробуем сохранить базовые поля, которые точно есть в таблице profiles
      const basePayload = {
        id: this.currentUserId,
        level: AppState.data.selectedLevel || "B1",
        native_lang: AppState.data.nativeLang || "ru",
        onboarding_completed: !!AppState.data.onboardingCompleted,
        word_status: (window.GaplessDB && GaplessDB.userWordStatus) || {},
        updated_at: new Date().toISOString()
      };

      if (AppState.data.userName && AppState.data.userName.trim()) {
        basePayload.username = AppState.data.userName.trim();
      }

      const { error } = await window.supabaseClient
        .from("profiles")
        .upsert(basePayload);

      // Если колонка username еще не добавлена через SQL, сохраняем без нее
      if (error) {
        delete basePayload.username;
        await window.supabaseClient.from("profiles").upsert(basePayload);
      }
    } catch (e) {
      console.warn("Ошибка сохранения в облако:", e);
    }
  },

  async signUp(email, password, username) {
    const cleanEmail = email.toLowerCase().trim();
    const cleanUsername = username.trim();

    if (!window.supabaseClient) {
      return { status: "error", message: "Клиент Supabase не инициализирован" };
    }

    try {
      const redirectUrl = window.location.origin + window.location.pathname;
      const { data, error } = await window.supabaseClient.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { username: cleanUsername, level: AppState.data.selectedLevel || "B1" }
        }
      });

      if (error) {
        showToast("Ошибка: " + error.message);
        return { status: "error", message: error.message };
      }

      if (data && data.user && !data.session) {
        showToast("📩 Письмо отправлено на " + cleanEmail);
        return { status: "confirm_email", email: cleanEmail };
      }

      if (data && data.session) {
        if (window.GaplessDB) GaplessDB.clearLocalStatus();
        AppState.data.isAuthenticated = true;
        AppState.data.userName = cleanUsername;
        AppState.data.userEmail = cleanEmail;
        AppState.save();

        this.syncProfileFromSession(data.user);
        showToast("✓ Аккаунт создан!");
        return { status: "ok" };
      }

      return { status: "confirm_email", email: cleanEmail };
    } catch (e) {
      return { status: "error", message: e.message || "Ошибка сети" };
    }
  },

  async resendConfirmation(email) {
    if (!window.supabaseClient || !email) return;
    try {
      const redirectUrl = window.location.origin + window.location.pathname;
      await window.supabaseClient.auth.resend({
        type: "signup",
        email: email,
        options: { emailRedirectTo: redirectUrl }
      });
      showToast("📩 Письмо отправлено повторно!");
    } catch (e) {}
  },

  async signIn(email, password) {
    const cleanEmail = email.toLowerCase().trim();
    if (!window.supabaseClient) {
      return { ok: false, message: "Не подключен Supabase" };
    }

    try {
      const { data, error } = await window.supabaseClient.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      });

      if (error) {
        let msg = error.message;
        if (msg.toLowerCase().includes("not confirmed")) {
          msg = "Сначала подтверди почту по ссылке в письме (проверь Спам)!";
        } else if (msg.toLowerCase().includes("invalid login")) {
          msg = "Неверный Email или пароль (либо аккаунт еще не создан).";
        }
        showToast(msg);
        return { ok: false, message: msg };
      }

      if (data && data.user) {
        if (window.GaplessDB) GaplessDB.clearLocalStatus();

        // Мгновенно переключаем состояние и открываем приложение без ожидания БД!
        this.currentUserId = data.user.id;
        AppState.data.isAuthenticated = true;
        AppState.data.userEmail = data.user.email;
        AppState.data.userName = data.user.user_metadata?.username || data.user.email.split("@")[0];
        try {
          localStorage.setItem(AppState.storageKey, JSON.stringify(AppState.data));
        } catch (e) {}

        showToast("✓ Вход выполнен!");

        if (window.renderCurrentModule) {
          window.renderCurrentModule();
        }

        // Синхронизируем профиль из облака в фоновом режиме
        this.syncProfileFromSession(data.user).then(() => {
          if (window.renderCurrentModule) window.renderCurrentModule();
        });

        return { ok: true };
      }

      return { ok: false, message: "Не удалось получить данные пользователя" };
    } catch (e) {
      const msg = "Ошибка соединения с сервером: " + (e.message || "");
      showToast(msg);
      return { ok: false, message: msg };
    }
  },

  // Быстрый демо-вход (если нужно войти без ожидания письма подтверждения или при недоступности БД)
  demoLogin(emailInput) {
    const name = emailInput ? emailInput.split("@")[0] : "Alex";
    AppState.data.isAuthenticated = true;
    AppState.data.userName = name || "Alex";
    AppState.data.userEmail = emailInput || "demo@gapless.app";
    AppState.save();
    showToast("⚡ Выполнен быстрый вход!");
    if (window.renderCurrentModule) window.renderCurrentModule();
  },

  async signOut() {
    if (window.ChatModule && ChatModule.cancelPartnerSearch) {
      await ChatModule.cancelPartnerSearch();
    }
    if (window.supabaseClient) {
      try { await window.supabaseClient.auth.signOut(); } catch (e) {}
    }
    this.currentUserId = null;
    if (window.GaplessDB) GaplessDB.clearLocalStatus();
    AppState.data.isAuthenticated = false;
    AppState.data.onboardingCompleted = false;
    AppState.data.userName = "";
    AppState.data.userEmail = "";
    AppState.data.friendsList = [];
    AppState.data.activeTab = "today";
    AppState.save();
    showToast("Вы вышли из аккаунта");
    if (window.renderCurrentModule) window.renderCurrentModule();
  }
};

window.AuthModule = AuthModule;
AuthModule.initAuthListener();
