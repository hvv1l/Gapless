// ============================================================================
// ФАЙЛ: js/auth-ui.js
// Экран Входа и Регистрации с проверкой аккаунта
// ============================================================================

const AuthUI = {
  isRegisterMode: true, // Для новых пользователей сразу открываем регистрацию

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.renderAuthScreen();
  },

  async handleAuthSubmit() {
    const emailEl = document.getElementById("auth-email");
    const passEl = document.getElementById("auth-pass");
    const userEl = document.getElementById("auth-username");

    const email = emailEl ? emailEl.value.trim() : "";
    const password = passEl ? passEl.value.trim() : "";
    const username = userEl ? userEl.value.trim() : "";

    if (!email || !password) {
      showToast("Введи Email и пароль");
      return;
    }

    if (this.isRegisterMode && !username) {
      showToast("Придумай никнейм");
      return;
    }

    // 1. Если подключен реальный Supabase — регистрируем/входим через облако
    if (window.supabaseClient) {
      if (this.isRegisterMode) {
        const ok = await AuthModule.signUp(email, password, username);
        if (!ok) return;
      } else {
        const ok = await AuthModule.signIn(email, password);
        if (!ok) return;
      }
    } else {
      // 2. Локальная база аккаунтов (чтобы регистрация работала даже до настройки Supabase)
      const accountsRaw = localStorage.getItem("gapless_accounts_db") || "{}";
      const accounts = JSON.parse(accountsRaw);

      if (this.isRegisterMode) {
        if (accounts[email]) {
          showToast("Этот Email уже зарегистрирован. Нажми «Войти»");
          return;
        }
        accounts[email] = { email, password, username };
        localStorage.setItem("gapless_accounts_db", JSON.stringify(accounts));
        AppState.data.userName = username;
        AppState.data.userEmail = email;
        showToast("✓ Аккаунт создан!");
      } else {
        const acc = accounts[email];
        if (!acc || acc.password !== password) {
          showToast("Неверный Email или пароль");
          return;
        }
        AppState.data.userName = acc.username;
        AppState.data.userEmail = acc.email;
        showToast("✓ С возвращением, " + acc.username + "!");
      }
    }

    AppState.data.isAuthenticated = true;
    AppState.data.activeTab = "today";
    AppState.save();
    renderCurrentModule();
  },

  logout() {
    if (window.supabaseClient) {
      window.supabaseClient.auth.signOut();
    }
    AppState.data.isAuthenticated = false;
    AppState.data.activeTab = "today";
    AppState.save();
    showToast("Вы вышли из аккаунта");
    renderCurrentModule();
  },

  renderAuthScreen() {
    const container = document.getElementById("app-root");
    if (!container) return;
    const isUk = AppState.data.nativeLang === "uk";

    container.innerHTML = `
      <div class="p-6 my-auto flex-1 flex flex-col justify-center max-w-sm mx-auto w-full fade-in space-y-5">
        <div class="text-center space-y-2">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-ocean-500 to-mint-500 flex items-center justify-center text-white font-extrabold text-2xl mx-auto shadow-lg">
            G
          </div>
          <h1 class="text-2xl font-extrabold tracking-tight">
            ${this.isRegisterMode ? (isUk ? 'Реєстрація в Gapless' : 'Регистрация в Gapless') : (isUk ? 'Вхід у Gapless' : 'Вход в Gapless')}
          </h1>
          <p class="text-xs text-slate-500">
            ${this.isRegisterMode 
              ? (isUk ? 'Створи особистий аккаунт для збереження прогресу та друзів' : 'Создай личный аккаунт для сохранения своих пробелов и друзей')
              : (isUk ? 'Увійди у свій профіль' : 'Войди в свой существующий профиль')}
          </p>
        </div>

        <div class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3.5 shadow-sm">
          ${this.isRegisterMode ? `
            <div>
              <label class="block text-[11px] font-bold text-slate-400 uppercase mb-1">${isUk ? 'Твій нікнейм' : 'Твой никнейм'}</label>
              <input id="auth-username" type="text" placeholder="Alex" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-ocean-500" />
            </div>
          ` : ''}

          <div>
            <label class="block text-[11px] font-bold text-slate-400 uppercase mb-1">Email</label>
            <input id="auth-email" type="email" placeholder="name@example.com" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-ocean-500" />
          </div>

          <div>
            <label class="block text-[11px] font-bold text-slate-400 uppercase mb-1">${isUk ? 'Пароль' : 'Пароль'}</label>
            <input id="auth-pass" type="password" placeholder="••••••••" onkeydown="if(event.key==='Enter') AuthUI.handleAuthSubmit()" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-ocean-500" />
          </div>

          <button onclick="AuthUI.handleAuthSubmit()" class="w-full py-3.5 rounded-xl bg-gradient-to-r from-ocean-600 to-mint-600 hover:from-ocean-500 hover:to-mint-500 text-white font-bold text-xs shadow-md transition">
            ${this.isRegisterMode ? (isUk ? 'Створити аккаунт →' : 'Создать аккаунт →') : (isUk ? 'Увійти →' : 'Войти →')}
          </button>
        </div>

        <div class="text-center">
          <button onclick="AuthUI.toggleMode()" class="text-xs text-ocean-500 font-bold hover:underline">
            ${this.isRegisterMode ? (isUk ? 'Вже є аккаунт? Увійти' : 'Уже есть аккаунт? Войти') : (isUk ? 'Ще немає аккаунта? Зареєструватися' : 'Еще нет аккаунта? Зарегистрироваться')}
          </button>
        </div>
      </div>
    `;
  }
};
