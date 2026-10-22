// ============================================================================
// ФАЙЛ: js/dashboard.js
// Главный экран («Сегодня»), 15-минутка (Слова + Правила + Видео), Упражнения и Профиль
// ============================================================================

const DashboardModule = {
  activeExercise: null, // null | 'flashcards' | 'rules' | 'video'
  isDailyRoutine: false, // Запущено ли внутри комплексной 15-минутки
  cardIndex: 0,
  isFlipped: false,
  sessionDeck: [],

  // Состояние для правил
  dailyRulesDeck: [],
  ruleIndex: 0,
  ruleQuizSelected: null,
  ruleRefreshOffset: 0,

  // Состояние для видео-разбора
  videoDeck: [],
  videoIndex: 0,
  videoCheckResult: null,
  videoReplayKey: 0,

  // Комплексный запуск 15-минутки: Карточки -> Правила дня -> Видео-фрагмент
  startDaily15Min() {
    this.isDailyRoutine = true;
    const level = AppState.data.selectedLevel || "B1";
    const gaps = GaplessDB.getUserGapWords(level);
    this.sessionDeck = gaps.slice(0, 8); // Оптимальная пачка слов на сессию
    this.cardIndex = 0;
    this.isFlipped = false;

    this.dailyRulesDeck = GaplessRulesDB.getDailyRules(level, 2, this.ruleRefreshOffset);
    this.ruleIndex = 0;
    this.ruleQuizSelected = null;

    this.videoDeck = GaplessRulesDB.getVideosForLevel(level);
    this.videoIndex = 0;
    this.videoCheckResult = null;

    this.activeExercise = this.sessionDeck.length > 0 ? "flashcards" : "rules";
    AppState.data.activeTab = "exercises";
    AppState.save();
    if (window.updateNavigationBars) window.updateNavigationBars();
    this.render();
  },

  // Отдельный запуск карточек
  startFlashcards() {
    this.isDailyRoutine = false;
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

  // Отдельный запуск правил уровня пользователя
  startRulesExercise(randomizeNew = false) {
    this.isDailyRoutine = false;
    if (randomizeNew) this.ruleRefreshOffset++;
    const level = AppState.data.selectedLevel || "B1";
    this.dailyRulesDeck = GaplessRulesDB.getDailyRules(level, 2, this.ruleRefreshOffset);
    this.ruleIndex = 0;
    this.ruleQuizSelected = null;
    this.activeExercise = "rules";
    AppState.data.activeTab = "exercises";
    AppState.save();
    if (window.updateNavigationBars) window.updateNavigationBars();
    this.render();
  },

  // Отдельный запуск видео-разбора по таймкоду
  startVideoExercise() {
    this.isDailyRoutine = false;
    const level = AppState.data.selectedLevel || "B1";
    this.videoDeck = GaplessRulesDB.getVideosForLevel(level);
    this.videoIndex = 0;
    this.videoCheckResult = null;
    this.videoReplayKey++;
    this.activeExercise = "video";
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

    // Если это 15-минутка и слова закончились — автоматически переходим к Правилам дня
    if (this.isDailyRoutine && this.cardIndex >= this.sessionDeck.length) {
      this.activeExercise = "rules";
      this.ruleIndex = 0;
      this.ruleQuizSelected = null;
    }

    this.render();
  },

  answerRuleQuiz(optionIdx) {
    this.ruleQuizSelected = optionIdx;
    const rule = this.dailyRulesDeck[this.ruleIndex];
    const isUk = AppState.data.nativeLang === "uk";
    if (rule && optionIdx === rule.quiz.correct) {
      showToast(isUk ? "✓ Правильно!" : "✓ Верно!");
      if (!Array.isArray(AppState.data.learnedRules)) AppState.data.learnedRules = [];
      if (!AppState.data.learnedRules.includes(rule.id)) {
        AppState.data.learnedRules.push(rule.id);
        AppState.save();
      }
    } else {
      showToast(isUk ? "Подумай ще раз!" : "Попробуй еще раз!");
    }
    this.render();
  },

  nextRule() {
    this.ruleQuizSelected = null;
    this.ruleIndex++;
    if (this.ruleIndex >= this.dailyRulesDeck.length) {
      if (this.isDailyRoutine) {
        this.activeExercise = "video";
        this.videoIndex = 0;
        this.videoCheckResult = null;
      } else {
        const isUk = AppState.data.nativeLang === "uk";
        showToast(isUk ? "🎉 Правила на сьогодні пройдено!" : "🎉 Правила на сегодня пройдены!");
        this.activeExercise = null;
      }
    }
    this.render();
  },

  replayVideoSegment() {
    this.videoReplayKey++;
    const iframe = document.getElementById("yt-segment-player");
    const clip = this.videoDeck[this.videoIndex];
    if (iframe && clip) {
      iframe.src = `https://www.youtube.com/embed/${clip.videoId}?start=${clip.start}&end=${clip.end}&autoplay=1&controls=1&rel=0&modestbranding=1&cc_load_policy=0&t=${this.videoReplayKey}`;
    }
  },

  checkVideoAnswer() {
    const input = document.getElementById("video-answer-input");
    const clip = this.videoDeck[this.videoIndex];
    if (!input || !clip) return;

    const userRaw = input.value.trim();
    if (!userRaw) {
      showToast(AppState.data.nativeLang === "uk" ? "Введи почуту фразу" : "Введи услышанную фразу");
      return;
    }

    const normalize = (str) => str.toLowerCase().replace(/[^a-z0-9\s']/g, "").split(/\s+/).filter(Boolean);
    const targetWords = normalize(clip.transcript);
    const userWords = normalize(userRaw);

    let matched = 0;
    const diffHtml = clip.transcript.split(" ").map((originalWord) => {
      const cleanOrig = originalWord.toLowerCase().replace(/[^a-z0-9']/g, "");
      const isFound = userWords.includes(cleanOrig);
      if (isFound) matched++;
      return `<span class="px-1.5 py-0.5 rounded-md font-bold ${isFound ? 'bg-mint-500/20 text-mint-500' : 'bg-amber-500/20 text-amber-500 underline'}">${originalWord}</span>`;
    }).join(" ");

    const accuracy = Math.round((matched / Math.max(1, targetWords.length)) * 100);
    this.videoCheckResult = {
      userRaw,
      accuracy,
      diffHtml,
      isSuccess: accuracy >= 75
    };

    const isUk = AppState.data.nativeLang === "uk";
    showToast(accuracy >= 75 ? (isUk ? `🎉 Чудово! Точність ${accuracy}%` : `🎉 Отлично! Точность ${accuracy}%`) : (isUk ? `Точність ${accuracy}%. Перевір підказку` : `Точность ${accuracy}%. Сверься с оригиналом`));
    this.render();
  },

  nextVideoClip() {
    this.videoCheckResult = null;
    this.videoIndex++;
    if (this.videoIndex >= this.videoDeck.length || this.isDailyRoutine) {
      const isUk = AppState.data.nativeLang === "uk";
      showToast(this.isDailyRoutine ? (isUk ? "🏆 15-хвилинку повністю виконано!" : "🏆 15-минутка полностью выполнена!") : (isUk ? "✓ Відео-розбір завершено!" : "✓ Видео-разбор завершен!"));
      this.activeExercise = null;
      this.isDailyRoutine = false;
    }
    this.render();
  },

  restartCalibration() {
    AppState.data.onboardingCompleted = false;
    AppState.data.onboardingStep = 2;
    AppState.save();
    if (window.renderCurrentModule) window.renderCurrentModule();
  },

  renderRoutineStepper(isUk) {
    if (!this.isDailyRoutine) return "";
    const steps = [
      { id: "flashcards", label: isUk ? "1. Слова" : "1. Слова" },
      { id: "rules", label: isUk ? "2. Правила" : "2. Правила" },
      { id: "video", label: isUk ? "3. Відео" : "3. Видео" }
    ];
    return `
      <div class="grid grid-cols-3 gap-1.5 bg-slate-200/70 dark:bg-slate-900 p-1 rounded-xl mb-3 border border-slate-200 dark:border-slate-800">
        ${steps.map(s => `
          <div class="py-1 text-center rounded-lg text-[11px] font-extrabold transition ${this.activeExercise === s.id ? 'bg-ocean-500 text-white shadow-sm' : 'text-slate-500'}">
            ${s.label}
          </div>
        `).join("")}
      </div>
    `;
  },

  render() {
    const container = document.getElementById("app-root");
    if (!container) return;

    const tab = AppState.data.activeTab || "today";
    const lang = AppState.data.nativeLang === "uk" ? "uk" : "ru";
    const isUk = lang === "uk";
    const level = AppState.data.selectedLevel || "B1";
    const stats = GaplessDB.getStatistics(level);
    const learnedRulesCount = Array.isArray(AppState.data.learnedRules) ? AppState.data.learnedRules.length : 0;

    // ========================================================================
    // 1. ВКЛАДКА «ПРОФИЛЬ»
    // ========================================================================
    if (tab === "profile") {
      container.innerHTML = `
        <div class="p-5 space-y-4 pb-24 fade-in">
          <div class="p-6 rounded-3xl bg-gradient-to-br from-ocean-600 via-ocean-500 to-mint-600 text-white shadow-xl space-y-3">
            <div class="flex items-center justify-between">
              <span class="text-xs uppercase tracking-wider font-extrabold opacity-80">Gapless Profile</span>
              <span class="px-2.5 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-sm">Level ${level}</span>
            </div>
            <div>
              <div class="text-xl font-extrabold">@${AppState.data.userName || "User"}</div>
              <div class="text-xs opacity-85">${AppState.data.userEmail || ""}</div>
            </div>
          </div>

          <div class="grid grid-cols-3 gap-2.5">
            <div class="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <div class="text-xl font-extrabold text-mint-500">${stats.known}</div>
              <div class="text-[11px] text-slate-400 font-semibold mt-0.5">${isUk ? 'Вивчено слів' : 'Изучено слов'}</div>
            </div>
            <div class="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <div class="text-xl font-extrabold text-gap-500">${stats.gaps}</div>
              <div class="text-[11px] text-slate-400 font-semibold mt-0.5">${isUk ? 'Прогалини' : 'Пробелы'}</div>
            </div>
            <div class="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center shadow-sm">
              <div class="text-xl font-extrabold text-ocean-500">${learnedRulesCount}</div>
              <div class="text-[11px] text-slate-400 font-semibold mt-0.5">${isUk ? 'Правил' : 'Правил'}</div>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm">
            <div class="text-xs font-bold uppercase tracking-wider text-slate-400">${isUk ? 'Налаштування аккаунта' : 'Настройки аккаунта'}</div>
            
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold">${isUk ? 'Мова інтерфейсу' : 'Язык интерфейса'}</span>
              <div class="flex gap-1.5">
                <button onclick="AppState.data.nativeLang='ru'; AppState.save(); renderCurrentModule();" class="px-3 py-1.5 rounded-xl text-xs font-bold ${!isUk ? 'bg-ocean-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}">RU</button>
                <button onclick="AppState.data.nativeLang='uk'; AppState.save(); renderCurrentModule();" class="px-3 py-1.5 rounded-xl text-xs font-bold ${isUk ? 'bg-ocean-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}">UA</button>
              </div>
            </div>

            <div class="flex items-center justify-between">
              <span class="text-xs font-bold">${isUk ? 'Поточний рівень' : 'Текущий уровень'}</span>
              <div class="flex gap-1">
                ${["A1", "A2", "B1", "B2", "C1"].map(lvl => `
                  <button onclick="AppState.data.selectedLevel='${lvl}'; AppState.save(); DashboardModule.render();"
                    class="px-2.5 py-1 rounded-lg text-xs font-bold ${level === lvl ? 'bg-ocean-500 text-white shadow-sm' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}">
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
    // 2. ВКЛАДКА «УПРАЖНЕНИЯ» И АКТИВНЫЕ ТРЕНАЖЕРЫ
    // ========================================================================
    if (tab === "exercises") {
      // 2.1 ТРЕНАЖЕР: КАРТОЧКИ СЛОВ
      if (this.activeExercise === "flashcards") {
        const currentWord = this.sessionDeck[this.cardIndex];

        if (!currentWord || this.cardIndex >= this.sessionDeck.length) {
          container.innerHTML = `
            <div class="p-6 my-auto text-center space-y-4 fade-in">
              <div class="w-16 h-16 bg-mint-500/20 text-mint-500 rounded-full flex items-center justify-center text-3xl mx-auto">🎉</div>
              <h2 class="text-xl font-extrabold">${isUk ? 'Картки пройдено!' : 'Карточки пройдены!'}</h2>
              <p class="text-xs text-slate-400">${isUk ? 'Ти повторив усі слова у цій сесії.' : 'Ты успешно проработал слова в этой сессии.'}</p>
              <div class="flex flex-col gap-2 max-w-xs mx-auto pt-2">
                <button onclick="DashboardModule.startRulesExercise()" class="w-full py-3 rounded-xl bg-ocean-600 text-white text-xs font-bold shadow-md">
                  📘 ${isUk ? 'Перейти до правил дня →' : 'Перейти к правилам дня →'}
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
            <div>
              ${this.renderRoutineStepper(isUk)}
              <div class="flex items-center justify-between">
                <button onclick="DashboardModule.activeExercise = null; DashboardModule.isDailyRoutine = false; DashboardModule.render();" class="text-xs font-bold text-ocean-500 py-1 px-2 rounded-lg hover:bg-ocean-500/10">
                  ← ${isUk ? 'Назад' : 'Назад'}
                </button>
                <span class="text-xs font-extrabold text-slate-400">${this.cardIndex + 1} / ${this.sessionDeck.length}</span>
              </div>
            </div>

            <div class="perspective w-full max-w-xs mx-auto h-72 cursor-pointer my-auto" onclick="DashboardModule.flipCard()">
              <div id="active-flip-card" class="flip-card w-full h-full relative rounded-3xl shadow-xl ${this.isFlipped ? 'flipped' : ''}">
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

      // 2.2 ТРЕНАЖЕР: ИЗУЧЕНИЕ ПРАВИЛ УРОВНЯ ПОЛЬЗОВАТЕЛЯ
      if (this.activeExercise === "rules") {
        const rule = this.dailyRulesDeck[this.ruleIndex];
        if (!rule) {
          this.activeExercise = null;
          this.render();
          return;
        }

        const isCorrectAnswer = this.ruleQuizSelected === rule.quiz.correct;

        container.innerHTML = `
          <div class="p-5 space-y-4 pb-24 fade-in">
            ${this.renderRoutineStepper(isUk)}
            <div class="flex items-center justify-between">
              <button onclick="DashboardModule.activeExercise = null; DashboardModule.isDailyRoutine = false; DashboardModule.render();" class="text-xs font-bold text-ocean-500 py-1 px-2 rounded-lg hover:bg-ocean-500/10">
                ← ${isUk ? 'Назад' : 'Назад'}
              </button>
              <div class="flex items-center gap-2">
                <button onclick="DashboardModule.startRulesExercise(true)" class="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-ocean-500 transition">
                  🎲 ${isUk ? 'Інше правило' : 'Другое правило'}
                </button>
                <span class="text-xs font-extrabold text-slate-400">${this.ruleIndex + 1} / ${this.dailyRulesDeck.length}</span>
              </div>
            </div>

            <div class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3.5">
              <div class="flex items-center justify-between">
                <span class="px-2.5 py-0.5 rounded-full bg-gap-500/15 text-gap-500 text-[10px] font-extrabold uppercase tracking-wider">
                  ${isUk ? 'Правило дня' : 'Правило дня'} • ${rule.level}
                </span>
              </div>

              <h2 class="text-lg font-extrabold leading-snug">${isUk ? rule.titleUk : rule.titleRu}</h2>

              <div class="p-3 rounded-2xl bg-ocean-500/10 border border-ocean-500/20 text-ocean-600 dark:text-ocean-400 font-mono text-xs font-bold">
                📐 ${rule.formula}
              </div>

              <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                ${isUk ? rule.descUk : rule.descRu}
              </p>

              <div class="space-y-2 pt-1">
                <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">${isUk ? 'Приклади:' : 'Примеры:'}</div>
                ${rule.examples.map(ex => `
                  <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 text-xs space-y-0.5">
                    <div class="font-bold text-slate-900 dark:text-white">${ex.en}</div>
                    <div class="text-slate-500">${isUk ? ex.uk : ex.ru}</div>
                  </div>
                `).join("")}
              </div>
            </div>

            <!-- Мини-проверка по правилу -->
            <div class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
              <div class="text-xs font-extrabold uppercase tracking-wider text-ocean-500">
                ⚡ ${isUk ? 'Перевір себе:' : 'Проверь себя:'}
              </div>
              <div class="text-sm font-bold">${rule.quiz.question}</div>
              <div class="grid grid-cols-3 gap-2">
                ${rule.quiz.options.map((opt, idx) => {
                  const isChosen = this.ruleQuizSelected === idx;
                  const isRight = idx === rule.quiz.correct;
                  let btnStyle = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-transparent";
                  if (isChosen) {
                    btnStyle = isRight
                      ? "bg-mint-500 text-white border-mint-500 shadow-sm"
                      : "bg-red-500/20 text-red-500 border-red-500/40";
                  }
                  return `
                    <button onclick="DashboardModule.answerRuleQuiz(${idx})" class="py-2.5 px-3 rounded-xl border text-xs font-bold transition ${btnStyle}">
                      ${opt}
                    </button>
                  `;
                }).join("")}
              </div>

              ${isCorrectAnswer ? `
                <button onclick="DashboardModule.nextRule()" class="w-full mt-2 py-3.5 rounded-2xl bg-gradient-to-r from-ocean-600 to-mint-600 text-white font-bold text-xs shadow-md transition">
                  ${this.isDailyRoutine && this.ruleIndex + 1 >= this.dailyRulesDeck.length
                    ? (isUk ? 'Далі: Розбір відео →' : 'Далее: Разбор видео →')
                    : (isUk ? 'Наступне правило →' : 'Следующее правило →')}
                </button>
              ` : ''}
            </div>
          </div>
        `;
        return;
      }

      // 2.3 ТРЕНАЖЕР: РАЗБОР ВИДЕО-ФРАГМЕНТА YOUTUBE ПО ТАЙМКОДУ
      if (this.activeExercise === "video") {
        const clip = this.videoDeck[this.videoIndex];
        if (!clip) {
          this.activeExercise = null;
          this.render();
          return;
        }

        const embedUrl = `https://www.youtube.com/embed/${clip.videoId}?start=${clip.start}&end=${clip.end}&autoplay=1&controls=1&rel=0&modestbranding=1&cc_load_policy=0&t=${this.videoReplayKey}`;

        container.innerHTML = `
          <div class="p-5 space-y-4 pb-24 fade-in">
            ${this.renderRoutineStepper(isUk)}
            <div class="flex items-center justify-between">
              <button onclick="DashboardModule.activeExercise = null; DashboardModule.isDailyRoutine = false; DashboardModule.render();" class="text-xs font-bold text-ocean-500 py-1 px-2 rounded-lg hover:bg-ocean-500/10">
                ← ${isUk ? 'Назад' : 'Назад'}
              </button>
              <span class="text-xs font-extrabold text-slate-400">
                🎬 ${this.videoIndex + 1} / ${this.videoDeck.length} • ${clip.level}
              </span>
            </div>

            <div class="rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg">
              <div class="aspect-video w-full bg-black">
                <iframe id="yt-segment-player" class="w-full h-full" src="${embedUrl}" title="YouTube segment" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
              </div>
              <div class="p-3.5 bg-white dark:bg-slate-900 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                <div>
                  <div class="text-xs font-extrabold">${isUk ? clip.titleUk : clip.titleRu}</div>
                  <div class="text-[11px] text-slate-400">${isUk ? 'Таймкод:' : 'Таймкод:'} 0:${String(clip.start).padStart(2, '0')} – 0:${String(clip.end).padStart(2, '0')}</div>
                </div>
                <button onclick="DashboardModule.replayVideoSegment()" class="px-3 py-1.5 rounded-xl bg-ocean-500/15 text-ocean-500 text-xs font-bold hover:bg-ocean-500/25 transition">
                  🔁 ${isUk ? 'Повторити уривок' : 'Повторить отрывок'}
                </button>
              </div>
            </div>

            <div class="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
              <div class="flex items-center justify-between">
                <label class="text-xs font-extrabold">${isUk ? 'Напиши англійською, що сказали у відео:' : 'Напиши на английском, что сказали в видео:'}</label>
              </div>
              <div class="text-[11px] text-slate-400">💡 ${isUk ? 'Підказка:' : 'Подсказка:'} ${isUk ? clip.hintUk : clip.hintRu}</div>

              <textarea id="video-answer-input" rows="2" placeholder="${isUk ? 'Введи почуті слова...' : 'Введи услышанные слова...'}"
                class="w-full p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-ocean-500 resize-none">${this.videoCheckResult ? this.videoCheckResult.userRaw : ''}</textarea>

              <button onclick="DashboardModule.checkVideoAnswer()" class="w-full py-3 rounded-2xl bg-ocean-600 hover:bg-ocean-500 text-white font-bold text-xs shadow-md transition">
                ✓ ${isUk ? 'Перевірити відповідь' : 'Проверить ответ'}
              </button>

              ${this.videoCheckResult ? `
                <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2 mt-2">
                  <div class="flex items-center justify-between text-xs font-bold">
                    <span>${isUk ? 'Оригінал фрази:' : 'Оригинал фразы:'}</span>
                    <span class="${this.videoCheckResult.isSuccess ? 'text-mint-500' : 'text-amber-500'}">${this.videoCheckResult.accuracy}%</span>
                  </div>
                  <div class="flex flex-wrap gap-1 text-xs leading-relaxed">
                    ${this.videoCheckResult.diffHtml}
                  </div>
                  <button onclick="DashboardModule.nextVideoClip()" class="w-full mt-2 py-2.5 rounded-xl bg-mint-600 hover:bg-mint-500 text-white font-bold text-xs transition">
                    ${this.isDailyRoutine ? (isUk ? '🎉 Завершити 15-хвилинку' : '🎉 Завершить 15-минутку') : (isUk ? 'Наступний фрагмент →' : 'Следующий фрагмент →')}
                  </button>
                </div>
              ` : ''}
            </div>
          </div>
        `;
        return;
      }

      // 2.4 СПИСОК ВСЕХ УПРАЖНЕНИЙ
      container.innerHTML = `
        <div class="p-5 space-y-4 pb-24 fade-in">
          <div>
            <h1 class="text-xl font-extrabold tracking-tight">${isUk ? 'Вправи та практика' : 'Упражнения и практика'}</h1>
            <p class="text-xs text-slate-500">${isUk ? 'Комплексна програма під твій рівень ' : 'Комплексная программа под твой уровень '}<b>${level}</b></p>
          </div>

          <!-- Главный баннер комплексной 15-минутки -->
          <div onclick="DashboardModule.startDaily15Min()" class="p-5 rounded-3xl bg-gradient-to-r from-ocean-600 to-mint-600 text-white cursor-pointer shadow-lg hover:opacity-95 transition space-y-2">
            <div class="flex items-center justify-between">
              <span class="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold uppercase tracking-wider">3 в 1 • Daily Routine</span>
              <span class="text-sm font-extrabold">→</span>
            </div>
            <div class="text-base font-extrabold">🚀 ${isUk ? 'Запустити щоденну 15-хвилинку' : 'Запустить ежедневную 15-минутку'}</div>
            <div class="text-xs opacity-90">${isUk ? 'Картки прогалин + Випадкові правила дня + Відео-розбір' : 'Карточки пробелов + Случайные правила дня + Видео-разбор'}</div>
          </div>

          <div class="space-y-3">
            <!-- 1. Карточки пробелов -->
            <div onclick="DashboardModule.startFlashcards()" class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-ocean-500 transition flex items-center justify-between shadow-sm">
              <div class="flex items-center gap-3.5">
                <div class="w-11 h-11 rounded-2xl bg-ocean-500/15 text-ocean-500 flex items-center justify-center text-xl">🃏</div>
                <div>
                  <div class="text-sm font-extrabold">${isUk ? 'Картки прогалин (Слова)' : 'Карточки пробелов (Слова)'}</div>
                  <div class="text-xs text-slate-400 mt-0.5">${isUk ? `Доступно для повторення: ${stats.gaps} сл.` : `Доступно для повторения: ${stats.gaps} сл.`}</div>
                </div>
              </div>
              <span class="text-ocean-500 font-bold">→</span>
            </div>

            <!-- 2. Изучение правил -->
            <div onclick="DashboardModule.startRulesExercise()" class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-gap-500 transition flex items-center justify-between shadow-sm">
              <div class="flex items-center gap-3.5">
                <div class="w-11 h-11 rounded-2xl bg-gap-500/15 text-gap-500 flex items-center justify-center text-xl">📘</div>
                <div>
                  <div class="text-sm font-extrabold">${isUk ? 'Вивчення правил (Граматика)' : 'Изучение правил (Грамматика)'}</div>
                  <div class="text-xs text-slate-400 mt-0.5">${isUk ? `Випадкові правила на день для рівня ${level}` : `Случайные правила на день для уровня ${level}`}</div>
                </div>
              </div>
              <span class="text-gap-500 font-bold">→</span>
            </div>

            <!-- 3. Разбор видео-фрагмента -->
            <div onclick="DashboardModule.startVideoExercise()" class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-amber-500 transition flex items-center justify-between shadow-sm">
              <div class="flex items-center gap-3.5">
                <div class="w-11 h-11 rounded-2xl bg-amber-500/15 text-amber-500 flex items-center justify-center text-xl">🎬</div>
                <div>
                  <div class="text-sm font-extrabold">${isUk ? 'Розбір відео-фрагмента (YouTube)' : 'Разбор видео-фрагмента (YouTube)'}</div>
                  <div class="text-xs text-slate-400 mt-0.5">${isUk ? 'Слухай таймкод та пиши, що сказали у відео' : 'Слушай таймкод и пиши, что сказали в видео'}</div>
                </div>
              </div>
              <span class="text-amber-500 font-bold">→</span>
            </div>

            <!-- 4. Практика в чате -->
            <div onclick="switchAppTab('chat')" class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-mint-500 transition flex items-center justify-between shadow-sm">
              <div class="flex items-center gap-3.5">
                <div class="w-11 h-11 rounded-2xl bg-mint-500/15 text-mint-500 flex items-center justify-center text-xl">💬</div>
                <div>
                  <div class="text-sm font-extrabold">${isUk ? 'Практика у чаті 1-на-1' : 'Практика в чате 1-на-1'}</div>
                  <div class="text-xs text-slate-400 mt-0.5">${isUk ? 'Пошук співрозмовника за рівнем, друзі та AI' : 'Поиск собеседника по уровню, друзья и AI'}</div>
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
    const todayRule = GaplessRulesDB.getDailyRules(level, 1)[0];

    container.innerHTML = `
      <div class="p-5 space-y-4 pb-24 fade-in">
        <div class="p-6 rounded-3xl bg-gradient-to-br from-ocean-500 via-ocean-600 to-mint-500 text-white shadow-xl space-y-3">
          <div class="flex items-center justify-between">
            <span class="text-xs uppercase tracking-wider font-extrabold opacity-85">Gapless Daily</span>
            <span class="px-2.5 py-1 rounded-full bg-white/20 text-xs font-bold backdrop-blur-sm">Level ${level}</span>
          </div>
          <div>
            <h2 class="text-2xl font-extrabold">${isUk ? 'Привіт, ' : 'Привет, '}${AppState.data.userName || 'Alex'}!</h2>
            <p class="text-xs opacity-90 mt-0.5">${isUk ? 'Твій план на 15 хвилин сформовано.' : 'Твой план на 15 минут сформирован.'}</p>
          </div>
          <div class="grid grid-cols-3 gap-2 pt-1">
            <div class="bg-black/15 p-2.5 rounded-2xl text-center">
              <div class="text-lg font-extrabold text-mint-200">${stats.known}</div>
              <div class="text-[10px] opacity-80">${isUk ? 'Вивчено' : 'Изучено'}</div>
            </div>
            <div class="bg-black/15 p-2.5 rounded-2xl text-center">
              <div class="text-lg font-extrabold text-amber-200">${stats.gaps}</div>
              <div class="text-[10px] opacity-80">${isUk ? 'Прогалини' : 'Пробелы'}</div>
            </div>
            <div class="bg-black/15 p-2.5 rounded-2xl text-center">
              <div class="text-lg font-extrabold text-white">${learnedRulesCount}</div>
              <div class="text-[10px] opacity-80">${isUk ? 'Правила' : 'Правила'}</div>
            </div>
          </div>
        </div>

        <div class="space-y-2.5">
          <button onclick="DashboardModule.startDaily15Min()" class="w-full p-4 rounded-2xl bg-white dark:bg-slate-900 border-2 border-ocean-500/40 text-left hover:border-ocean-500 transition flex items-center justify-between shadow-sm">
            <div class="flex items-center gap-3">
              <div class="w-11 h-11 rounded-2xl bg-ocean-500/15 flex items-center justify-center text-xl">🚀</div>
              <div>
                <div class="text-sm font-extrabold">${isUk ? 'Запустити 15-хвилинку (3 в 1)' : 'Запустить 15-минутку (3 в 1)'}</div>
                <div class="text-xs text-slate-400">${isUk ? 'Слова + Правило дня + Відео за таймкодом' : 'Слова + Правило дня + Видео по таймкоду'}</div>
              </div>
            </div>
            <span class="text-ocean-500 font-bold">→</span>
          </button>

          <div class="grid grid-cols-2 gap-2.5">
            <button onclick="DashboardModule.startRulesExercise()" class="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left hover:border-gap-500 transition shadow-sm space-y-1">
              <div class="text-lg">📘</div>
              <div class="text-xs font-extrabold">${isUk ? 'Правило дня' : 'Правило дня'}</div>
              <div class="text-[11px] text-slate-400 truncate">${todayRule ? (isUk ? todayRule.titleUk : todayRule.titleRu) : level}</div>
            </button>

            <button onclick="DashboardModule.startVideoExercise()" class="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left hover:border-amber-500 transition shadow-sm space-y-1">
              <div class="text-lg">🎬</div>
              <div class="text-xs font-extrabold">${isUk ? 'Відео-розбір' : 'Видео-разбор'}</div>
              <div class="text-[11px] text-slate-400 truncate">${isUk ? 'YouTube за таймкодом' : 'YouTube по таймкоду'}</div>
            </button>
          </div>
        </div>

        ${gapPreview.length > 0 ? `
          <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-sm">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400">${isUk ? 'Найближчі слова на вивчення' : 'Ближайшие слова на изучение'}</span>
              <button onclick="DashboardModule.startFlashcards()" class="text-xs font-bold text-ocean-500 hover:underline">${isUk ? 'Вчити всі →' : 'Учить все →'}</button>
            </div>
            <div class="flex flex-wrap gap-1.5">
              ${gapPreview.map(w => `
                <span onclick="GaplessDB.wordsMap.get('${w.en.toLowerCase()}').speak()" class="cursor-pointer px-2.5 py-1 rounded-xl bg-gap-500/10 text-gap-600 dark:text-gap-400 text-xs font-semibold hover:bg-gap-500/20 transition">
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
