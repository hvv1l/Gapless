// ============================================================================
// ФАЙЛ: js/dashboard.js
// Главный экран («Сегодня»), 15-минутка (Карточки) и Персональный Профиль
// ============================================================================

const DashboardModule = {
  activeExercise: null, // null | 'flashcards'
  cardIndex: 0,
  isFlipped: false,
  sessionDeck: [],

  startFlashcards() {
    const gaps = GaplessDB.getUserGapWords(AppState.data.selectedLevel);
    this.sessionDeck = [...gaps];
    this.activeExercise = "flashcards";
    this.cardIndex = 0;
    this.isFlipped = false;
    AppState.data.activeTab = "exercises";
    AppState.save();
    if (window.updateNavigationBars) window.updateNavigationBars();
    this.render();
  },

  flipCard() {
    this.isFlipped = !this.isFlipped;
    const cardEl = document.getElementById("active-flip-card");
    if (cardEl) {
      cardEl.classList.toggle("flipped", this.isFlipped);
    }
  },

  speakCurrentWord(event) {
    if (event) event.stopPropagation();
    const currentWord = this.sessionDeck[this.cardIndex];
    if (currentWord && typeof currentWord.speak === "function") {
      currentWord.speak();
    }
  },

  markCard(isKnown) {
    const currentWord = this.sessionDeck[this.cardIndex];
    const isUk = AppState.data.nativeLang === "uk";

    if (currentWord && isKnown) {
      GaplessDB.setWordStatus(currentWord.en, "known");
      showToast(isUk ? `✓ «${currentWord.en}» вивчено!` : `✓ «${currentWord.en}» изучено!`);
    }

    this.isFlipped = false;
    this.cardIndex++;
    this.render();
  },

  restartCalibration() {
    AppState.data.onboardingCompleted = false;
    AppState.data.onboardingStep = 2;
    AppState.save();
    if (window.renderCurrentModule) window.renderCurrentModule();
  },

  render() {
    const container = document.getElementById("app-root");
    if (!container) return;

    const tab = AppState.data.activeTab || "today";
    const lang = AppState.data.nativeLang === "uk" ? "uk" : "ru";
    const isUk = lang === "uk";
    const level = AppState.data.selectedLevel || "B1";
    const stats = GaplessDB.getStatistics(level);

    // ========================================================================
    // 1. ВКЛАДКА «ПРОФИЛЬ»
    // ========================================================================
    if (tab === "profile") {
      container.innerHTML = `
        <div class="p-5 space-y-4 pb-24 fade-in">
          <div class="p-6 rounded-3xl bg-gradient-to-br from-ocean-600 to-mint-600 text-white shadow-xl space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs uppercase tracking-wider font-extrabold opacity-80">Gapless Profile</span>
              <span class="px-2.5 py-1 rounded-full bg-white/20 text-xs font-bold">Level ${level}</span>
            </div>
            <div>
              <div class="text-xl font-extrabold">${AppState.data.userName || "User"}</div>
              <div class="text-xs opacity-85">${AppState.data.userEmail || ""}</div>
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

          <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
            <div class="text-xs font-bold uppercase tracking-wider text-slate-400">${isUk ? 'Налаштування аккаунта' : 'Настройки аккаунта'}</div>
            
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold">${isUk ? 'Мова інтерфейсу' : 'Язык интерфейса'}</span>
              <div class="flex gap-1.5">
                <button onclick="AppState.data.nativeLang='ru'; AppState.save(); renderCurrentModule();" class="px-3 py-1.5 rounded-xl text-xs font-bold ${!isUk ? 'bg-ocean-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}">RU</button>
                <button onclick="AppState.data.nativeLang='uk'; AppState.save(); renderCurrentModule();" class="px-3 py-1.5 rounded-xl text-xs font-bold ${isUk ? 'bg-ocean-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}">UA</button>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-xs font-bold">${isUk ? 'Поточний орієнтир' : 'Текущий уровень'}</span>
              <div class="flex gap-1">
                ${["A1", "A2", "B1", "B2", "C1"].map(lvl => `
                  <button onclick="AppState.data.selectedLevel='${lvl}'; AppState.save(); DashboardModule.render();"
                    class="px-2.5 py-1 rounded-lg text-xs font-bold ${level === lvl ? 'bg-ocean-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}">
                    ${lvl}
                  </button>
                `).join("")}
              </div>
            </div>

            <button onclick="DashboardModule.restartCalibration()" class="w-full py-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-ocean-500/15 hover:text-ocean-500 text-xs font-bold transition">
              ⚙️ ${isUk ? 'Пройти калібрування прогалин заново' : 'Пройти калибровку пробелов заново'}
            </button>
          </div>
        </div>
      `;
      return;
    }

    // ========================================================================
    // 2. ВКЛАДКА «УПРАЖНЕНИЯ» (И ТРЕНАЖЕР 15-МИНУТКИ)
    // ========================================================================
    if (tab === "exercises") {
      if (this.activeExercise === "flashcards") {
        const currentWord = this.sessionDeck[this.cardIndex];

        if (!currentWord || this.cardIndex >= this.sessionDeck.length) {
          container.innerHTML = `
            <div class="p-6 my-auto text-center space-y-4 fade-in">
              <div class="w-16 h-16 bg-mint-500/20 text-mint-500 rounded-full flex items-center justify-center text-3xl mx-auto">🎉</div>
              <h2 class="text-xl font-extrabold">${isUk ? '15-хвилинку завершено!' : '15-минутка завершена!'}</h2>
              <p class="text-xs text-slate-400">${isUk ? 'Ти повторив усі слова у цій сесії.' : 'Ты успешно проработал слова в этой сессии.'}</p>
              <div class="flex flex-col gap-2 max-w-xs mx-auto pt-2">
                <button onclick="DashboardModule.startFlashcards()" class="w-full py-3 rounded-xl bg-ocean-600 text-white text-xs font-bold shadow-md">
                  🔄 ${isUk ? 'Повторити прогалини, що залишилися' : 'Повторить оставшиеся пробелы'}
                </button>
                <button onclick="DashboardModule.activeExercise = null; DashboardModule.render();" class="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold">
                  ← ${isUk ? 'До списку вправ' : 'К списку упражнений'}
                </button>
              </div>
            </div>
          `;
          return;
        }

        container.innerHTML = `
          <div class="p-5 flex flex-col h-[calc(100vh-135px)] justify-between fade-in">
            <div class="flex items-center justify-between">
              <button onclick="DashboardModule.activeExercise = null; DashboardModule.render();" class="text-xs font-bold text-ocean-500 py-1 px-2 rounded-lg hover:bg-ocean-500/10">
                ← ${isUk ? 'Назад' : 'Назад'}
              </button>
              <span class="text-xs font-extrabold text-slate-400">${this.cardIndex + 1} / ${this.sessionDeck.length}</span>
            </div>

            <div class="perspective w-full max-w-xs mx-auto h-72 cursor-pointer my-auto" onclick="DashboardModule.flipCard()">
              <div id="active-flip-card" class="flip-card w-full h-full relative rounded-3xl shadow-xl ${this.isFlipped ? 'flipped' : ''}">
                
                <!-- Лицевая сторона -->
                <div class="flip-face absolute inset-0 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl flex flex-col items-center justify-center p-6 text-center">
                  <span class="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-ocean-500/10 text-ocean-500 mb-3">
                    ${currentWord.getCategoryTitle(lang)} • ${currentWord.level}
                  </span>
                  <div class="text-3xl font-extrabold text-slate-900 dark:text-white mb-1">${currentWord.en}</div>
                  <div class="text-xs text-slate-400 mb-4">${currentWord.tr || ''}</div>
                  <button onclick="DashboardModule.speakCurrentWord(event)" class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sm hover:scale-105 transition">
                    🔊
                  </button>
                  <span class="text-[11px] text-slate-400 mt-5">${isUk ? 'Натисни на картку, щоб перевернути' : 'Нажми на карточку, чтобы перевернуть'}</span>
                </div>

                <!-- Обратная сторона -->
                <div class="flip-face flip-back absolute inset-0 bg-gradient-to-br from-ocean-600 to-mint-600 text-white rounded-3xl flex flex-col items-center justify-center p-6 text-center">
                  <div class="text-2xl font-extrabold mb-3">${currentWord.getTranslation(lang)}</div>
                  ${currentWord.example ? `<p class="text-xs opacity-90 italic bg-black/15 p-3 rounded-2xl">"${currentWord.example}"</p>` : ''}
                </div>

              </div>
            </div>

            <div class="grid grid-cols-2 gap-3 pt-2">
              <button onclick="DashboardModule.markCard(false)" class="py-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 font-extrabold text-xs active:scale-95 transition">
                ⏳ ${isUk ? 'Ще вчити' : 'Еще учу'}
              </button>
              <button onclick="DashboardModule.markCard(true)" class="py-3.5 rounded-2xl bg-mint-500/15 border border-mint-500/30 text-mint-600 dark:text-mint-400 font-extrabold text-xs active:scale-95 transition">
                ✓ ${isUk ? 'Вже знаю' : 'Уже знаю'}
              </button>
            </div>
          </div>
        `;
        return;
      }

      container.innerHTML = `
        <div class="p-5 space-y-4 pb-24 fade-in">
          <div>
            <h1 class="text-xl font-extrabold tracking-tight">${isUk ? 'Вправи' : 'Упражнения'}</h1>
            <p class="text-xs text-slate-500">${isUk ? 'Закривай свої прогалини щодня за 15 хвилин' : 'Закрывай свои пробелы каждый день за 15 минут'}</p>
          </div>

          <div class="space-y-3">
            <div onclick="DashboardModule.startFlashcards()" class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-ocean-500 transition flex items-center justify-between shadow-sm">
              <div class="flex items-center gap-3.5">
                <div class="w-11 h-11 rounded-2xl bg-ocean-500/15 text-ocean-500 flex items-center justify-center text-xl">🃏</div>
                <div>
                  <div class="text-sm font-extrabold">${isUk ? '15-хвилинка: Картки прогалин' : '15-минутка: Карточки пробелов'}</div>
                  <div class="text-xs text-slate-400 mt-0.5">${isUk ? `Доступно для повторення: ${stats.gaps} сл.` : `Доступно для повторения: ${stats.gaps} сл.`}</div>
                </div>
              </div>
              <span class="text-ocean-500 font-bold">→</span>
            </div>

            <div onclick="switchAppTab('chat')" class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-mint-500 transition flex items-center justify-between shadow-sm">
              <div class="flex items-center gap-3.5">
                <div class="w-11 h-11 rounded-2xl bg-mint-500/15 text-mint-500 flex items-center justify-center text-xl">💬</div>
                <div>
                  <div class="text-sm font-extrabold">${isUk ? 'Практика слів у живому чаті' : 'Практика слов в живом чате'}</div>
                  <div class="text-xs text-slate-400 mt-0.5">${isUk ? 'Діалоги з AI-напарником та друзями' : 'Диалоги с AI-напарником и друзьями'}</div>
                </div>
              </div>
              <span class="text-mint-500 font-bold">→</span>
            </div>
          </div>
        </div>
      `;
      return;
    }

    // ========================================================================
    // 3. ВКЛАДКА «СЕГОДНЯ» (Главный экран)
    // ========================================================================
    const gapPreview = GaplessDB.getUserGapWords(level).slice(0, 6);

    container.innerHTML = `
      <div class="p-5 space-y-4 pb-24 fade-in">
        <div class="p-6 rounded-3xl bg-gradient-to-br from-ocean-500 to-mint-500 text-white shadow-xl space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs uppercase tracking-wider font-extrabold opacity-85">Gapless Daily</span>
            <span class="px-2.5 py-1 rounded-full bg-white/20 text-xs font-bold">Level ${level}</span>
          </div>
          <div>
            <h2 class="text-2xl font-extrabold">${isUk ? 'Привіт, ' : 'Привет, '}${AppState.data.userName || 'Alex'}!</h2>
            <p class="text-xs opacity-90 mt-0.5">${isUk ? 'Твоя персональна програма прогалин готова.' : 'Твоя персональная программа пробелов готова.'}</p>
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
          <button onclick="DashboardModule.startFlashcards()" class="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left hover:border-ocean-500 transition flex items-center justify-between shadow-sm">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-ocean-500/15 flex items-center justify-center text-lg">🚀</div>
              <div>
                <div class="text-sm font-extrabold">${isUk ? 'Запустити 15-хвилинку' : 'Запустить 15-минутку'}</div>
                <div class="text-xs text-slate-400">${isUk ? `Тренування карток (${stats.gaps} сл.)` : `Тренировка карточек (${stats.gaps} сл.)`}</div>
              </div>
            </div>
            <span class="text-ocean-500 font-bold">→</span>
          </button>

          <button onclick="switchAppTab('chat')" class="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left hover:border-ocean-500 transition flex items-center justify-between shadow-sm">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-xl bg-mint-500/15 flex items-center justify-center text-lg">💬</div>
              <div>
                <div class="text-sm font-extrabold">${isUk ? 'Онлайн чат практики' : 'Онлайн чат практики'}</div>
                <div class="text-xs text-slate-400">${isUk ? 'Спілкування з AI та живими людьми' : 'Общение с AI и живыми людьми'}</div>
              </div>
            </div>
            <span class="text-mint-500 font-bold">→</span>
          </button>
        </div>

        ${gapPreview.length > 0 ? `
          <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400">${isUk ? 'Найближчі слова на вивчення' : 'Ближайшие слова на изучение'}</span>
              <button onclick="DashboardModule.startFlashcards()" class="text-xs font-bold text-ocean-500 hover:underline">${isUk ? 'Вчити всі →' : 'Учить все →'}</button>
            </div>
            <div class="flex flex-wrap gap-1.5">
              ${gapPreview.map(w => `
                <span onclick="w_speak='${w.en}'; GaplessDB.wordsMap.get('${w.en.toLowerCase()}').speak()" class=" cursor-pointer px-2.5 py-1 rounded-xl bg-gap-500/10 text-gap-600 dark:text-gap-400 text-xs font-semibold hover:bg-gap-500/20 transition">
                  🔊 ${w.en} <span class="opacity-70 font-normal">— ${w.getTranslation(lang)}</span>
                </span>
              `).join("")}
            </div>
          </div>
        ` : ''}
      </div>
    `;
  }
};
