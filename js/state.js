// ============================================================================
// ФАЙЛ: js/state.js
// ============================================================================

const AppState = {
  storageKey: "gapless_app_settings_v2",

  data: {
    isAuthenticated: false,
    onboardingCompleted: false,
    onboardingStep: 1,
    nativeLang: "ru",
    theme: "dark",
    selectedLevel: "B1",
    filterMode: "clusters",
    categoryFilter: "all",
    showTranslation: false,
    showTranscription: false,
    userName: "",
    userEmail: "",
    activeTab: "today",
    friendsList: []
  },

  init() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.data = { ...this.data, ...JSON.parse(saved) };
      }
    } catch (e) {}
    this.applyTheme();
  },

  save() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    } catch (e) {}
    if (window.AuthModule && window.AuthModule.saveProgressToCloud) {
      window.AuthModule.saveProgressToCloud();
    }
  },

  applyTheme() {
    const html = document.documentElement;
    if (this.data.theme === "dark") html.classList.add("dark");
    else html.classList.remove("dark");
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
