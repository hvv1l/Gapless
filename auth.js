// ============================================================================
// ФАЙЛ: js/auth.js
// Модуль авторизации, регистрации и управления аккаунтом через Supabase Auth
// ============================================================================

const AuthModule = {
  async signUp(email, password, username) {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient.auth.signUp({ email, password });
    if (error) {
      showToast("Ошибка регистрации: " + error.message);
      return false;
    }
    if (data.user) {
      // Создаем профиль в таблице profiles
      await supabaseClient.from("profiles").insert([
        { id: data.user.id, username, email, level: AppState.data.selectedLevel }
      ]);
      AppState.data.userName = username;
      AppState.data.userEmail = email;
      AppState.save();
      showToast("✓ Аккаунт успешно создан!");
      return true;
    }
  },

  async signIn(email, password) {
    if (!supabaseClient) return;
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
    if (error) {
      showToast("Ошибка входа: " + error.message);
      return false;
    }
    if (data.user) {
      // Загружаем профиль
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", data.user.id)
        .single();
      
      if (profile) {
        AppState.data.userName = profile.username;
        AppState.data.userEmail = profile.email;
        AppState.data.selectedLevel = profile.level || "B1";
      }
      AppState.save();
      showToast("✓ Вход выполнен!");
      return true;
    }
  },

  async signOut() {
    if (!supabaseClient) return;
    await supabaseClient.auth.signOut();
    AppState.data.userName = "";
    AppState.data.userEmail = "";
    AppState.save();
    showToast("Вы вышли из аккаунта");
    renderCurrentModule();
  },

  async checkUserSession() {
    if (!supabaseClient) return;
    const { data: { session } } = await supabaseClient.auth.getSession();
    if (session && session.user) {
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("*")
        .eq("id", session.user.id)
        .single();
      if (profile) {
        AppState.data.userName = profile.username;
        AppState.data.userEmail = profile.email;
      }
    }
  }
};