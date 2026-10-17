// ============================================================================
// ФАЙЛ: js/auth-ui.js
// UI-модуль авторизации: экран входа/регистрации и проверка сессии
// ============================================================================

const AuthUI = {
  isRegisterMode: false,

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.renderAuthScreen();
  },

  async handleAuthSubmit() {
    const email = document.getElementById("auth-email").value.trim();
    const password = document.getElementById("auth-pass").value.trim();
    const usernameEl = document.getElementById("auth-username");
    const username = usernameEl ? usernameEl.value.trim() : "";

    if (!email || !password) {
      showToast("Заполни все поля");
      return;
    }

    if (this.isRegisterMode) {
      if (!username) {
        showToast("Введи никнейм");
        return;
      }
      const success = await AuthModule.signUp(email, password, username);
      if (success) {
        AppState.data.onboardingCompleted = true; // Сразу пускаем в приложение
        AppState.save();
        renderCurrentModule();
      }
    } else {
      const success = await AuthModule.signIn(email, password);
      if (success) {
        AppState.data.onboardingCompleted = true;
        AppState.save();
        renderCurrentModule();
      }
    }
  },

  // Отрисовка экрана авторизации, если пользователь не вошел
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
          <h1 class="text-2xl font-extrabold tracking-tight">Gapless</h1>
          <p class="text-xs text-slate-500">
            ${this.isRegisterMode 
              ? (isUk ? 'Створи аккаунт, щоб зберігати прогрес онлайн' : 'Создай аккаунт, чтобы сохранять прогресс онлайн')
              : (isUk ? 'Увійди в свій аккаунт для синхронізації' : 'Войди в свой аккаунт для синхронизации')}
          </p>
        </div>

        <div class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3.5 shadow-sm">
          ${this.isRegisterMode ? `
            <div>
              <label class="block text-[11px] font-bold text-slate-400 uppercase mb-1">${isUk ? 'Нікнейм' : 'Никнейм'}</label>
              <input id="auth-username" type="text" placeholder="Alex" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-ocean-500" />
            </div>
          ` : ''}

          <div>
            <label class="block text-[11px] font-bold text-slate-400 uppercase mb-1">Email</label>
            <input id="auth-email" type="email" placeholder="name@example.com" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-ocean-500" />
          </div>

          <div>
            <label class="block text-[11px] font-bold text-slate-400 uppercase mb-1">${isUk ? 'Пароль' : 'Пароль'}</label>
            <input id="auth-pass" type="password" placeholder="••••••••" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-ocean-500" />
          </div>

          <button onclick="AuthUI.handleAuthSubmit()" class="w-full py-3.5 rounded-xl bg-ocean-600 hover:bg-ocean-500 text-white font-bold text-xs shadow-md transition">
            ${this.isRegisterMode ? (isUk ? 'Зареєструватися' : 'Зарегистрироваться') : (isUk ? 'Увійти в аккаунт' : 'Войти в аккаунт')}
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