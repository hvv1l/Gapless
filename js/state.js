// ============================================================================
// ФАЙЛ: js/state.js
// Управление состоянием профиля, темой оформления и навигацией между модулями
// ============================================================================

const AppState = {
  storageKey: "gapless_app_settings_v1",

  // Настройки по умолчанию
  data: {
    onboardingCompleted: false,
    onboardingStep: 1,         // 1: Приветствие, 2: Уровень, 3: Фильтр БД, 4: Финал
    nativeLang: "ru",          // 'ru' | 'uk'
    theme: "dark",             // 'dark' | 'light'
    selectedLevel: "B1",       // Стартовый ориентир (A0..C1)
    filterMode: "clusters",    // 'clusters' (пачками) | 'single' (по одному)
    categoryFilter: "all",     // Фильтр по смысловой теме ('all', 'family', 'food'...)
    showTranslation: false,    // Показывать ли перевод прямо на плашках
    showTranscription: false,  // Показывать ли транскрипцию
    userName: "",
    userEmail: "",
    activeTab: "today",        // Вкладка нижнего меню ('today', 'base', 'chat', 'profile')
    xp: 120,
    streakDays: 3
  },

  init() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.data = { ...this.data, ...JSON.parse(saved) };
      }
    } catch (e) {
      console.warn("Настройки по умолчанию");
    }
    this.applyTheme();
  },

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {}
  },

  applyTheme() {
    const html = document.documentElement;
    if (this.data.theme === "dark") {
      html.classList.add("dark");
    } else {
      html.classList.remove("dark");
    }
    const btn = document.getElementById("header-theme-btn");
    if (btn) btn.textContent = this.data.theme === "dark" ? "🌙" : "☀️";
  },

  toggleTheme() {
    this.data.theme = this.data.theme === "dark" ? "light" : "dark";
    this.applyTheme();
    this.save();
    if (window.renderCurrentModule) window.renderCurrentModule();
  }
};

// Глобальное всплывающее уведомление (Тост)
function showToast(message) {
  const toast = document.getElementById("app-toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.remove("opacity-0", "translate-y-2");
  toast.classList.add("opacity-100", "translate-y-0");
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => {
    toast.classList.remove("opacity-100", "translate-y-0");
    toast.classList.add("opacity-0", "translate-y-2");
  }, 1800);
}