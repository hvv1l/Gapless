// ============================================================================
// ФАЙЛ: js/auth-ui.js
// Экран Входа, Регистрации и Ожидания подтверждения почты (с защитой от зависаний)
// ============================================================================

const AuthUI = {
  isRegisterMode: true,
  isSubmitting: false,
  pendingConfirmationEmail: null,
  lastErrorMessage: "",

  toggleMode() {
    this.isRegisterMode = !this.isRegisterMode;
    this.pendingConfirmationEmail = null;
    this.lastErrorMessage = "";
    this.isSubmitting = false;
    this.renderAuthScreen();
  },

  async handleAuthSubmit(event) {
    if (event) event.preventDefault();
    if (this.isSubmitting) return;

    const emailEl = document.getElementById("auth-email");
    const passEl = document.getElementById("auth-pass");
    const userEl = document.getElementById("auth-username");
    const submitBtn = document.getElementById("auth-submit-btn");

    const email = emailEl ? emailEl.value.trim() : "";
    const password = passEl ? passEl.value.trim() : "";
    const username = userEl ? userEl.value.trim() : "";

    this.lastErrorMessage = "";

    if (!email || !password) {
      this.lastErrorMessage = "Введи Email и пароль";
      showToast(this.lastErrorMessage);
      this.renderErrorBox();
      return;
    }

    if (password.length < 6) {
      this.lastErrorMessage = "Пароль должен быть не менее 6 символов";
      showToast(this.lastErrorMessage);
      this.renderErrorBox();
      return;
    }

    if (this.isRegisterMode && !username) {
      this.lastErrorMessage = "Введи свой никнейм";
      showToast(this.lastErrorMessage);
      this.renderErrorBox();
      return;
    }

    this.isSubmitting = true;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "⏳ Подожди...";
    }

    try {
      if (this.isRegisterMode) {
        const result = await AuthModule.signUp(email, password, username);

        if (result.status === "confirm_email") {
          this.pendingConfirmationEmail = result.email;
          this.renderAuthScreen();
          return;
        }
        if (result.status === "ok") {
          AppState.data.activeTab = "today";
          AppState.save();
          if (window.renderCurrentModule) window.renderCurrentModule();
          return;
        }
        if (result.message) {
          this.lastErrorMessage = result.message;
          this.renderErrorBox();
        }
      } else {
        const result = await AuthModule.signIn(email, password);

        if (result && result.ok) {
          AppState.data.activeTab = "today";
          AppState.save();
          if (window.renderCurrentModule) window.renderCurrentModule();
          return;
        } else {
          this.lastErrorMessage = (result && result.message) || "Не удалось войти. Проверь Email и пароль.";
          this.renderErrorBox();
        }
      }
    } catch (err) {
      this.lastErrorMessage = err.message || "Неизвестная ошибка при входе";
      this.renderErrorBox();
    } finally {
      this.isSubmitting = false;
      if (submitBtn) {
        const isUk = AppState.data.nativeLang === "uk";
        submitBtn.disabled = false;
        submitBtn.textContent = this.isRegisterMode
          ? (isUk ? "Зареєструватися →" : "Зарегистрироваться →")
          : (isUk ? "Увійти →" : "Войти →");
      }
    }
  },

  renderErrorBox() {
    const errBox = document.getElementById("auth-error-box");
    if (!errBox) return;
    if (!this.lastErrorMessage) {
      errBox.classList.add("hidden");
      errBox.textContent = "";
    } else {
      errBox.classList.remove("hidden");
      errBox.textContent = "⚠️ " + this.lastErrorMessage;
    }
  },

  renderAuthScreen() {
    const container = document.getElementById("app-root");
    if (!container) return;
    const isUk = AppState.data.nativeLang === "uk";

    if (this.pendingConfirmationEmail) {
      container.innerHTML = `
        <div class="p-6 my-auto flex-1 flex flex-col justify-center max-w-sm mx-auto w-full fade-in space-y-5 text-center">
          <div class="w-16 h-16 rounded-3xl bg-ocean-500/15 text-ocean-500 flex items-center justify-center text-3xl mx-auto shadow-sm">
            📩
          </div>
          <div class="space-y-2">
            <h2 class="text-xl font-extrabold tracking-tight">
              ${isUk ? 'Підтверди свою пошту' : 'Подтверди свою почту'}
            </h2>
            <p class="text-xs text-slate-500 leading-relaxed">
              ${isUk 
                ? `Ми надіслали лист із посиланням для активації на <b>${this.pendingConfirmationEmail}</b>. Перейди за посиланням у листі (перевір папку «Спам»).`
                : `Мы отправили письмо со ссылкой активации на <b>${this.pendingConfirmationEmail}</b>. Перейди по ссылке в письме (проверь также папку «Спам»).`}
            </p>
          </div>

          <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <button onclick="AuthUI.isRegisterMode = false; AuthUI.pendingConfirmationEmail = null; AuthUI.renderAuthScreen();"
              class="w-full py-3 rounded-xl bg-ocean-600 hover:bg-ocean-500 text-white font-bold text-xs shadow-sm transition">
              ${isUk ? 'Я підтвердив пошту → Увійти' : 'Я подтвердил почту → Войти'}
            </button>
            <button onclick="AuthModule.resendConfirmation('${this.pendingConfirmationEmail}')"
              class="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs hover:opacity-80 transition">
              ${isUk ? 'Надіслати лист ще раз' : 'Отправить письмо еще раз'}
            </button>
            <button onclick="AuthModule.demoLogin('${this.pendingConfirmationEmail}')"
              class="w-full py-2.5 rounded-xl bg-mint-500/15 text-mint-600 dark:text-mint-400 font-bold text-xs hover:opacity-80 transition">
              ⚡ ${isUk ? 'Пропустити підтвердження (Демо-вхід)' : 'Пропустить подтверждение (Быстрый вход)'}
            </button>
          </div>

          <button onclick="AuthUI.pendingConfirmationEmail = null; AuthUI.renderAuthScreen();"
            class="text-xs text-slate-400 hover:text-slate-600 font-semibold">
            ← ${isUk ? 'Повернутися назад' : 'Вернуться назад'}
          </button>
        </div>
      `;
      return;
    }

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
              ? (isUk ? 'На пошту прийде посилання для підтвердження аккаунта' : 'На почту придет ссылка для подтверждения аккаунта')
              : (isUk ? 'Увійди у свій підтверджений аккаунт' : 'Войди в свой подтвержденный аккаунт')}
          </p>
        </div>

        <form onsubmit="AuthUI.handleAuthSubmit(event)" class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3.5 shadow-sm">
          <div id="auth-error-box" class="hidden p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-semibold"></div>

          ${this.isRegisterMode ? `
            <div>
              <label class="block text-[11px] font-bold text-slate-400 uppercase mb-1">${isUk ? 'Твій нікнейм' : 'Твой никнейм'}</label>
              <input id="auth-username" type="text" autocomplete="username" placeholder="Alex"
                class="w-full px-3.5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-ocean-500" />
            </div>
          ` : ''}

          <div>
            <label class="block text-[11px] font-bold text-slate-400 uppercase mb-1">Email</label>
            <input id="auth-email" type="email" autocomplete="email" placeholder="name@example.com"
              class="w-full px-3.5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-ocean-500" />
          </div>

          <div>
            <label class="block text-[11px] font-bold text-slate-400 uppercase mb-1">${isUk ? 'Пароль (від 6 символів)' : 'Пароль (от 6 символов)'}</label>
            <input id="auth-pass" type="password" autocomplete="current-password" placeholder="••••••••"
              class="w-full px-3.5 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-ocean-500" />
          </div>

          <button id="auth-submit-btn" type="submit"
            class="w-full py-3.5 rounded-xl bg-gradient-to-r from-ocean-600 to-mint-600 hover:from-ocean-500 hover:to-mint-500 active:scale-[0.99] text-white font-bold text-sm shadow-md transition">
            ${this.isRegisterMode ? (isUk ? 'Зареєструватися →' : 'Зарегистрироваться →') : (isUk ? 'Увійти →' : 'Войти →')}
          </button>

          <button type="button" onclick="AuthModule.demoLogin(document.getElementById('auth-email')?.value)"
            class="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-ocean-500 font-bold text-xs transition">
            ⚡ ${isUk ? 'Швидкий вхід (тестовий режим без пошти)' : 'Быстрый вход (тестовый режим без почты)'}
          </button>
        </form>

        <div class="text-center">
          <button type="button" onclick="AuthUI.toggleMode()" class="py-2 px-4 text-xs text-ocean-500 font-bold hover:underline">
            ${this.isRegisterMode ? (isUk ? 'Вже є аккаунт? Увійти' : 'Уже есть аккаунт? Войти') : (isUk ? 'Ще немає аккаунта? Створити' : 'Еще нет аккаунта? Создать')}
          </button>
        </div>
      </div>
    `;
  }
};

window.AuthUI = AuthUI;
