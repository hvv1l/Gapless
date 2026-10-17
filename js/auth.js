// ============================================================================
// ФАЙЛ: js/auth.js
// Модуль авторизации с поддержкой подтверждения Email через Supabase
// ============================================================================

// 🔑 ВСТАВЬ СВОЙ URL И ANON KEY ИЗ SUPABASE PROJECT SETTINGS:
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
  console.warn("Supabase не настроен:", err);
  window.supabaseClient = null;
}

const AuthModule = {
  // Слушатель перехода по ссылке из письма подтверждения
  initAuthListener() {
    if (!window.supabaseClient) return;

    window.supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if ((event === "SIGNED_IN" || event === "USER_UPDATED") && session && session.user) {
        await this.syncProfileFromSession(session.user);
        if (window.AuthUI) window.AuthUI.pendingConfirmationEmail = null;
        if (window.renderCurrentModule) window.renderCurrentModule();
      }
    });
  },

  async syncProfileFromSession(user) {
    const fallbackName = (user.user_metadata && user.user_metadata.username) || user.email.split("@")[0];
    let username = fallbackName;

    if (window.supabaseClient) {
      try {
        const { data: profile } = await window.supabaseClient
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile && profile.username) {
          username = profile.username;
          if (profile.level) AppState.data.selectedLevel = profile.level;
        }
      } catch (e) {}
    }

    AppState.data.userName = username;
    AppState.data.userEmail = user.email;
    AppState.data.isAuthenticated = true;
    AppState.save();
  },

  // Регистрация с отправкой письма на почту
  async signUp(email, password, username) {
    const cleanEmail = email.toLowerCase().trim();

    if (!window.supabaseClient) {
      showToast("Вставь ключи Supabase в js/auth.js для отправки писем");
      return { status: "error" };
    }

    try {
      // Чистый URL нашего сайта для возврата из письма
      const redirectUrl = window.location.origin + window.location.pathname;

      const { data, error } = await window.supabaseClient.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            username: username,
            level: AppState.data.selectedLevel || "B1"
          }
        }
      });

      if (error) {
        showToast("Ошибка: " + error.message);
        return { status: "error" };
      }

      // Если в Supabase включено подтверждение почты — user создается, но session === null
      if (data && data.user && !data.session) {
        showToast("📩 Письмо отправлено на " + cleanEmail);
        return { status: "confirm_email", email: cleanEmail };
      }

      // Если подтверждение выключено и пустило сразу
      if (data && data.session) {
        await this.syncProfileFromSession(data.user);
        showToast("✓ Аккаунт создан!");
        return { status: "ok" };
      }

      return { status: "confirm_email", email: cleanEmail };
    } catch (e) {
      showToast("Ошибка сети при регистрации");
      return { status: "error" };
    }
  },

  // Повторная отправка письма подтверждения
  async resendConfirmation(email) {
    if (!window.supabaseClient || !email) return;
    try {
      const redirectUrl = window.location.origin + window.location.pathname;
      const { error } = await window.supabaseClient.auth.resend({
        type: "signup",
        email: email,
        options: { emailRedirectTo: redirectUrl }
      });
      if (error) {
        showToast("Подожди минуту перед повторной отправкой");
      } else {
        showToast("📩 Письмо отправлено повторно!");
      }
    } catch (e) {
      showToast("Ошибка при повторной отправке");
    }
  },

  // Вход по Email и паролю (пускает только после подтверждения почты)
  async signIn(email, password) {
    const cleanEmail = email.toLowerCase().trim();

    if (!window.supabaseClient) {
      showToast("Вставь ключи Supabase в js/auth.js");
      return false;
    }

    try {
      const { data, error } = await window.supabaseClient.auth.signInWithPassword({
        email: cleanEmail,
        password: password
      });

      if (error) {
        if (error.message.toLowerCase().includes("not confirmed")) {
          showToast("Сначала подтверди почту по ссылке в письме!");
        } else {
          showToast("Неверный Email или пароль");
        }
        return false;
      }

      if (data && data.user) {
        await this.syncProfileFromSession(data.user);
        showToast("✓ Вход выполнен!");
        return true;
      }
    } catch (e) {
      showToast("Ошибка соединения");
    }
    return false;
  },

  async signOut() {
    if (window.supabaseClient) {
      try { await window.supabaseClient.auth.signOut(); } catch (e) {}
    }
    AppState.data.isAuthenticated = false;
    AppState.data.activeTab = "today";
    AppState.save();
    showToast("Вы вышли из аккаунта");
    if (window.renderCurrentModule) window.renderCurrentModule();
  }
};

AuthModule.initAuthListener();
