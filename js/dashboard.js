// ============================================================================
// ФАЙЛ: js/dashboard.js
// Главный экран («Сегодня»), Упражнения и Профиль
// ============================================================================

const DashboardModule = {
  activeExercise: null,

  render() {
    const container = document.getElementById("app-root");
    if (!container) return;

    const tab = AppState.data.activeTab || "today";
    const isUk = AppState.data.nativeLang === "uk";

    // 1. ВКЛАДКА «ПРОФИЛЬ»
    if (tab === "profile") {
      const stats = GaplessDB.getStatistics(AppState.data.selectedLevel);
      container.innerHTML = `
        <div class="p-5 space-y-4 pb-24 fade-in">
          <div class="p-6 rounded-3xl bg-gradient-to-br from-ocean-600 to-mint-600 text-white shadow-xl space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs uppercase tracking-wider font-extrabold opacity-80">Gapless Profile</span>
              <span class="px-2.5 py-1 rounded-full bg-white/20 text-xs font-bold">${AppState.data.selectedLevel}</span>
            </div>
            <div>
              <div class="text-xl font-extrabold">${AppState.data.userName || "User"}</div>
              <div class="text-xs opacity-85">${AppState.data.userEmail || "No email"}</div>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <div class="text-2xl font-extrabold text-mint-500">${stats.known}</div>
              <div class="text-xs text-slate-400 font-semibold mt-1">${isUk ? 'Вивчено слів' : 'Изучено слов'}</div>
            </div>
            <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center">
              <div class="text-2xl font-extrabold text-gap-500">${stats.gaps}</div>
              <div class="text-xs text-slate-400 font-semibold mt-1">${isUk ? 'Мої прогалини' : 'Мои пробелы'}</div>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
            <div class="text-xs font-bold uppercase tracking-wider text-slate-400">${isUk ? 'Налаштування' : 'Настройки'}</div>
            <div class="flex items-center justify-between py-1">
              <span class="text-xs font-bold">${isUk ? 'Мова інтерфейсу' : 'Язык интерфейса'}</span>
              <div class="flex gap-1.5">
                <button onclick="AppState.data.nativeLang='ru'; AppState.save(); DashboardModule.render();" class="px-3 py-1.5 rounded-xl text-xs font-bold ${AppState.data.nativeLang==='ru' ? 'bg-ocean-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}">RU</button>
                <button onclick="AppState.data.nativeLang='uk'; AppState.save(); DashboardModule.render();" class="px-3 py-1.5 rounded-xl text-xs font-bold ${AppState.data.nativeLang==='uk' ? 'bg-ocean-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}">UA</button>
              </div>
            </div>
          </div>
        </div>
      `;
      return;
    }

    // 2. ВКЛАДКА «УПРАЖНЕНИЯ»
    if (tab === "exercises") {
      const stats = GaplessDB.getStatistics();
      container.innerHTML = `
        <div class="p-5 space-y-4 pb-24 fade-in">
          <div>
            <h1 class="text-xl font-extrabold tracking-tight">${isUk ? 'Вправи' : 'Упражнения'}</h1>
            <p class="text-xs text-slate-500">${isUk ? 'Обирай інструмент для тренування' : 'Выбирай инструмент для тренировки'}</p>
          </div>

          <div class="space-y-3">
            <div onclick="showToast('Запуск карточек пропусков...')" class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-ocean-500/50 transition flex items-center justify-between">
              <div>
                <div class="text-sm font-bold text-ocean-500">🃏 ${isUk ? 'Картки моїх прогалин' : 'Карточки моих пробелов'}</div>
                <div class="text-xs text-slate-400 mt-0.5">${isUk ? `Тренування слів (${stats.gaps} сл.)` : `Тренировка слов (${stats.gaps} сл.)`}</div>
              </div>
              <span class="text-slate-400">→</span>
            </div>

            <div onclick="switchAppTab('chat')" class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-ocean-500/50 transition flex items-center justify-between">
              <div>
                <div class="text-sm font-bold text-mint-500">💬 ${isUk ? 'Живий чат з практикою' : 'Живой чат с практикой'}</div>
                <div class="text-xs text-slate-400 mt-0.5">${isUk ? 'Спілкування з AI та друзями' : 'Общение с AI и друзьями'}</div>
              </div>
              <span class="text-slate-400">→</span>
            </div>
          </div>
        </div>
      `;
      return;
    }

    // 3. ВКЛАДКА «СЕГОДНЯ» (Главное меню)
    const stats = GaplessDB.getStatistics(AppState.data.selectedLevel);
    container.innerHTML = `
      <div class="p-5 space-y-4 pb-24 fade-in">
        <div class="p-6 rounded-3xl bg-gradient-to-br from-ocean-500 to-mint-500 text-white shadow-xl space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs uppercase tracking-wider font-extrabold opacity-85">Gapless Daily</span>
            <span class="px-2.5 py-1 rounded-full bg-white/20 text-xs font-bold">Level ${AppState.data.selectedLevel}</span>
          </div>
          <div>
            <h2 class="text-2xl font-extrabold">${isUk ? 'Привіт, ' : 'Привет, '}${AppState.data.userName || 'Alex'}!</h2>
            <p class="text-xs opacity-90 mt-0.5">${isUk ? 'Твоя щоденна база слів готова до повторення.' : 'Твоя ежедневная база слов готова к повторению.'}</p>
          </div>
          <div class="grid grid-cols-2 gap-2 pt-1">
            <div class="bg-black/15 p-3 rounded-2xl text-center">
              <div class="text-lg font-extrabold text-mint-200">${stats.known}</div>
              <div class="text-[10px] opacity-80">${isUk ? 'Вивчено' : 'Изучено'}</div>
            </div>
            <div class="bg-black/15 p-3 rounded-2xl text-center">
              <div class="text-lg font-extrabold text-amber-200">${stats.gaps}</div>
              <div class="text-[10px] opacity-80">${isUk ? 'Прогалини' : 'Пробелы'}</div>
            </div>
          </div>
        </div>

        <div class="space-y-3">
          <button onclick="switchAppTab('exercises')" class="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left hover:border-ocean-500 transition flex items-center justify-between shadow-sm">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-ocean-500/15 flex items-center justify-center text-lg">🚀</div>
              <div>
                <div class="text-sm font-extrabold">${isUk ? 'Розпочати тренування' : 'Начать тренировку'}</div>
                <div class="text-xs text-slate-400">${isUk ? 'Картки та прогалини рівня' : 'Карточки и пробелы уровня'} ${AppState.data.selectedLevel}</div>
              </div>
            </div>
            <span class="text-ocean-500 font-bold">→</span>
          </button>

          <button onclick="switchAppTab('chat')" class="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left hover:border-ocean-500 transition flex items-center justify-between shadow-sm">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-mint-500/15 flex items-center justify-center text-lg">💬</div>
              <div>
                <div class="text-sm font-extrabold">${isUk ? 'Онлайн чат практики' : 'Онлайн чат практики'}</div>
                <div class="text-xs text-slate-400">${isUk ? 'Спілкування та живі діалози' : 'Общение и живые диалоги'}</div>
              </div>
            </div>
            <span class="text-mint-500 font-bold">→</span>
          </button>
        </div>
      </div>
    `;
  }
};
