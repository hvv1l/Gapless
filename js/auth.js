// ============================================================================
// ФАЙЛ: js/auth.js
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

  initAuthListener() {
    if (!window.supabaseClient) return;

    window.supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "USER_UPDATED") && session && session.user) {
        await this.syncProfileFromSession(session.user);
        if (window.AuthUI) window.AuthUI.pendingConfirmationEmail = null;
        if (window.renderCurrentModule) window.renderCurrentModule();
      }
    });
  },

  async syncProfileFromSession(user) {
    this.currentUserId = user.id;
    const fallbackName = (user.user_metadata && user.user_metadata.username) || user.email.split("@")[0];
    let username = fallbackName;

    if (window.supabaseClient) {
      try {
        const { data: profile } = await window.supabaseClient
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          if (profile.username) username = profile.username;
          if (profile.level) AppState.data.selectedLevel = profile.level;
          if (profile.native_lang) AppState.data.nativeLang = profile.native_lang;
          if (typeof profile.onboarding_completed === "boolean") {
            AppState.data.onboardingCompleted = profile.onboarding_completed;
          }
          if (profile.word_status && Object.keys(profile.word_status).length > 0) {
            GaplessDB.setCloudWordStatus(profile.word_status);
          }
        }
      } catch (e) {}
    }

    AppState.data.userName = username;
    AppState.data.userEmail = user.email;
    AppState.data.isAuthenticated = true;
    AppState.save();
  },

  async saveProgressToCloud() {
    if (!window.supabaseClient || !this.currentUserId) return;
    try {
      await window.supabaseClient
        .from("profiles")
        .update({
          level: AppState.data.selectedLevel || "B1",
          native_lang: AppState.data.nativeLang || "ru",
          onboarding_completed: !!AppState.data.onboardingCompleted,
          word_status: GaplessDB.userWordStatus || {},
          updated_at: new Date().toISOString()
        })
        .eq("id", this.currentUserId);
    } catch (e) {}
  },

  async signUp(email, password, username) {
    const cleanEmail = email.toLowerCase().trim();
    if (!window.supabaseClient) {
      showToast("Вставь ключи Supabase в js/auth.js");
      return { status: "error" };
    }

    try {
      const redirectUrl = window.location.origin + window.location.pathname;
      const { data, error } = await window.supabaseClient.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { username: username, level: AppState.data.selectedLevel || "B1" }
        }
      });

      if (error) {
        showToast("Ошибка: " + error.message);
        return { status: "error" };
      }

      if (data && data.user && !data.session) {
        showToast("📩 Письмо отправлено на " + cleanEmail);
        return { status: "confirm_email", email: cleanEmail };
      }

      if (data && data.session) {
        GaplessDB.clearLocalStatus();
        await this.syncProfileFromSession(data.user);
        showToast("✓ Аккаунт создан!");
        return { status: "ok" };
      }

      return { status: "confirm_email", email: cleanEmail };
    } catch (e) {
      showToast("Ошибка сети");
      return { status: "error" };
    }
  },

  async resendConfirmation(email) {
    if (!window.supabaseClient || !email) return;
    try {
      const redirectUrl = window.location.origin + window.location.pathname;
      await window.supabaseClient.auth.resend({ type: "signup", email: email, options: { emailRedirectTo: redirectUrl } });
      showToast("📩 Письмо отправлено повторно!");
    } catch (e) {}
  },

  async signIn(email, password) {
    const cleanEmail = email.toLowerCase().trim();
    if (!window.supabaseClient) {
      showToast("Вставь ключи Supabase в js/auth.js");
      return false;
    }

    try {
      const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email: cleanEmail, password: password });

      if (error) {
        if (error.message.toLowerCase().includes("not confirmed")) {
          showToast("Сначала подтверди почту по ссылке в письме!");
        } else {
          showToast("Неверный Email или пароль");
        }
        return false;
      }

      if (data && data.user) {
        GaplessDB.clearLocalStatus();
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
    this.currentUserId = null;
    GaplessDB.clearLocalStatus();
    AppState.data.isAuthenticated = false;
    AppState.data.onboardingCompleted = false;
    AppState.data.userName = "";
    AppState.data.userEmail = "";
    AppState.data.activeTab = "today";
    AppState.save();
    showToast("Вы вышли из аккаунта");
    if (window.renderCurrentModule) window.renderCurrentModule();
  }
};

AuthModule.initAuthListener();
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

  initAuthListener() {
    if (!window.supabaseClient) return;

    window.supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION" || event === "USER_UPDATED") && session && session.user) {
        await this.syncProfileFromSession(session.user);
        if (window.AuthUI) window.AuthUI.pendingConfirmationEmail = null;
        if (window.renderCurrentModule) window.renderCurrentModule();
      }
    });
  },

  async syncProfileFromSession(user) {
    this.currentUserId = user.id;
    const fallbackName = (user.user_metadata && user.user_metadata.username) || user.email.split("@")[0];
    let username = fallbackName;

    if (window.supabaseClient) {
      try {
        const { data: profile } = await window.supabaseClient
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profile) {
          if (profile.username) username = profile.username;
          if (profile.level) AppState.data.selectedLevel = profile.level;
          if (profile.native_lang) AppState.data.nativeLang = profile.native_lang;
          
          if (typeof profile.onboarding_completed === "boolean") {
            AppState.data.onboardingCompleted = profile.onboarding_completed;
          }

          if (profile.word_status && Object.keys(profile.word_status).length > 0) {
            GaplessDB.setCloudWordStatus(profile.word_status);
          }
        }
      } catch (e) {}
    }

    AppState.data.userName = username;
    AppState.data.userEmail = user.email;
    AppState.data.isAuthenticated = true;
    AppState.save();
  },

  // Жесткое немедленное сохранение прогресса в Supabase
  async saveProgressToCloud() {
    if (!window.supabaseClient || !this.currentUserId) return;

    try {
      await window.supabaseClient
        .from("profiles")
        .update({
          level: AppState.data.selectedLevel || "B1",
          native_lang: AppState.data.nativeLang || "ru",
          onboarding_completed: !!AppState.data.onboardingCompleted,
          word_status: GaplessDB.userWordStatus || {},
          updated_at: new Date().toISOString()
        })
        .eq("id", this.currentUserId);
    } catch (e) {
      console.warn("Ошибка сохранения в облако:", e);
    }
  },

  async signUp(email, password, username) {
    const cleanEmail = email.toLowerCase().trim();
    if (!window.supabaseClient) {
      showToast("Вставь ключи Supabase в js/auth.js");
      return { status: "error" };
    }

    try {
      const redirectUrl = window.location.origin + window.location.pathname;
      const { data, error } = await window.supabaseClient.auth.signUp({
        email: cleanEmail,
        password: password,
        options: {
          emailRedirectTo: redirectUrl,
          data: { username: username, level: AppState.data.selectedLevel || "B1" }
        }
      });

      if (error) {
        showToast("Ошибка: " + error.message);
        return { status: "error" };
      }

      if (data && data.user && !data.session) {
        showToast("📩 Письмо отправлено на " + cleanEmail);
        return { status: "confirm_email", email: cleanEmail };
      }

      if (data && data.session) {
        GaplessDB.clearLocalStatus();
        await this.syncProfileFromSession(data.user);
        showToast("✓ Аккаунт создан!");
        return { status: "ok" };
      }

      return { status: "confirm_email", email: cleanEmail };
    } catch (e) {
      showToast("Ошибка сети");
      return { status: "error" };
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
        GaplessDB.clearLocalStatus();
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
    this.currentUserId = null;
    GaplessDB.clearLocalStatus();
    AppState.data.isAuthenticated = false;
    AppState.data.onboardingCompleted = false;
    AppState.data.userName = "";
    AppState.data.userEmail = "";
    AppState.data.activeTab = "today";
    AppState.save();
    showToast("Вы вышли из аккаунта");
    if (window.renderCurrentModule) window.renderCurrentModule();
  }
};

AuthModule.initAuthListener();
