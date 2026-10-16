// ============================================================================
// ФАЙЛ: js/dashboard.js
// Модуль 2:
// - Вкладка «Сегодня»: Цельное Ежедневное задание (Базовый минимум / 15-минутка)
// - Вкладка «Упражнения»: Свободный выбор тренировок (Карточки, Слух, Правила, Тест)
// - Вкладка «Профиль»: Статистика и управление Базой слов
// ============================================================================

const DashboardModule = {
  // --- Состояние Ежедневного задания (Базового минимума) ---
  dailyState: "idle",    // 'idle' (стартовый экран), 'running' (идет поток), 'completed' (выполнено)
  dailyStep: 1,          // 1: Карточки (5 шт) -> 2: На слух -> 3: Правило -> 4: Финал
  cardMixMode: "mix",    // 'old' | 'mix' | 'new'
  dailyCardsTarget: 5,   // Сколько карточек нужно пройти в рамках 15-минутки
  dailyCardsDone: 0,

  // --- Состояние Вкладки «Упражнения» ---
  activeExercise: null,  // null (меню) | 'cards' | 'listening' | 'grammar' | 'quiz'

  // --- Общие переменные для карточек, аудио, правил и теста ---
  cardIndex: 0,
  cardFlipped: false,
  showCardTr: false,
  silentMode: false,
  subtitlesRevealed: false,
  selectedSubWord: null,
  clozeSolved: {},
  grammarQuizAnswered: null,
  quizStarted: false,
  quizQuestionIndex: 0,
  quizScore: 0,
  profileShowBase: false, // Показать/скрыть управление группами слов внутри Профиля

  // Формирование колоды из пробелов пользователя
  getDeck() {
    let gaps = GaplessDB.getUserGapWords(AppState.data.selectedLevel);
    if (gaps.length === 0) gaps = GaplessDB.getUserGapWords();
    if (this.cardMixMode === "old") return gaps.slice(0, 6);
    if (this.cardMixMode === "new") return gaps.slice().reverse().slice(0, 8);
    return gaps.slice(0, 10);
  },

  // Запуск цельного Ежедневного задания
  startDailyFlow() {
    this.dailyState = "running";
    this.dailyStep = 1;
    this.dailyCardsDone = 0;
    this.cardIndex = 0;
    this.cardFlipped = false;
    this.grammarQuizAnswered = null;
    this.quizStarted = false;
    this.quizQuestionIndex = 0;
    this.quizScore = 0;
    this.render();
  },

  exitDailyFlow() {
    this.dailyState = "idle";
    this.render();
  },

  completeDailyFlow() {
    this.dailyState = "completed";
    this.render();
  },

  // Действия с карточкой
  flipCard() {
    this.cardFlipped = !this.cardFlipped;
    this.render();
  },

  // В ежедневном потоке: переход к следующей карточке, а после 5-й — автопереход к Шагу 2 (Слух)
  advanceDailyCard(remembered) {
    const deck = this.getDeck();
    this.cardFlipped = false;

    if (remembered) {
      this.dailyCardsDone++;
    }
    const target = Math.min(this.dailyCardsTarget, deck.length || 1);

    if (this.dailyCardsDone >= target) {
      // Автоматический бесшовный переход ко 2-му этапу (Слух)
      this.dailyStep = 2;
      this.render();
      return;
    }

    if (deck.length > 0) {
      this.cardIndex = (this.cardIndex + 1) % deck.length;
    }
    this.render();
  },

  // В режиме свободных упражнений: просто листаем карточки по кругу
  nextFreeCard() {
    const deck = this.getDeck();
    if (deck.length === 0) return;
    this.cardFlipped = false;
    this.cardIndex = (this.cardIndex + 1) % deck.length;
    this.render();
  },

  markCurrentCardKnown(event, isDailyFlow = false) {
    if (event) event.stopPropagation();
    const deck = this.getDeck();
    const currentWord = deck[this.cardIndex];
    if (!currentWord) return;

    GaplessDB.setWordStatus(currentWord.en, "known");
    showToast(`✓ «${currentWord.en}» перенесено в известные`);
    this.cardFlipped = false;
    this.cardIndex = 0;

    if (isDailyFlow) {
      this.dailyCardsDone++;
      if (this.dailyCardsDone >= this.dailyCardsTarget || this.getDeck().length === 0) {
        this.dailyStep = 2;
      }
    }
    this.render();
  },

  // Озвучка реплики для этапа «На слух»
  playSceneAudio(rate = 0.95) {
    const text = "Although our flight was delayed because of the luggage, visiting our relatives was inevitable.";
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US";
      u.rate = rate;
      window.speechSynthesis.speak(u);
    }
  },

  inspectSubtitleWord(rawWord) {
    const wordModel = GaplessDB.findOrCreateWord(rawWord, "слово из контекста");
    if (!wordModel) return;
    this.selectedSubWord = wordModel;
    wordModel.speak();
    this.render();
  },

  addSubtitleWordToGaps(wordEn) {
    GaplessDB.setWordStatus(wordEn, "gap");
    showToast(`+ «${wordEn}» добавлено в твои пробелы`);
    this.render();
  },

  solveCloze(slotId, isCorrect) {
    this.clozeSolved[slotId] = isCorrect ? "correct" : "wrong";
    this.render();
  },

  answerGrammarQuiz(optionIndex) {
    this.grammarQuizAnswered = optionIndex;
    this.render();
  },

  answerBlitzQuestion(isCorrect, isDailyFlow = false) {
    if (isCorrect) this.quizScore++;
    this.quizQuestionIndex++;
    if (isDailyFlow && this.quizQuestionIndex >= 3) {
      this.dailyState = "completed";
    }
    this.render();
  },

  // ==========================================================================
  // ГЛАВНЫЙ РОУТЕР ВКЛАДОК
  // ==========================================================================
  render() {
    const tab = AppState.data.activeTab || "today";
    if (tab === "today") this.renderTodayTab();
    else if (tab === "exercises") this.renderExercisesTab();
    else if (tab === "chat") this.renderChatPlaceholder();
    else if (tab === "profile") this.renderProfileTab();
  },

  // ==========================================================================
  // ВКЛАДКА 1: «СЕГОДНЯ» — ЦЕЛЬНОЕ ЕЖЕДНЕВНОЕ ЗАДАНИЕ (БАЗОВЫЙ МИНИМУМ)
  // ==========================================================================
  renderTodayTab() {
    const container = document.getElementById("app-root");
    const lang = AppState.data.nativeLang;
    const isUk = lang === "uk";
    const stats = GaplessDB.getStatistics(AppState.data.selectedLevel);

    // 1. ЭКРАН ДО НАЧАЛА («СТАРТ ЕЖЕДНЕВНОГО ЗАДАНИЯ»)
    if (this.dailyState === "idle") {
      container.innerHTML = `
        <div class="p-4 space-y-4 pb-24 fade-in">
          <!-- Сводка по базе -->
          <div class="grid grid-cols-3 gap-2.5">
            <div class="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div class="text-[10px] font-bold uppercase text-slate-400">${isUk ? 'Рівень' : 'Уровень'}</div>
              <div class="text-lg font-extrabold text-ocean-500">${AppState.data.selectedLevel}</div>
            </div>
            <div class="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div class="text-[10px] font-bold uppercase text-slate-400">${isUk ? 'Знаю слів' : 'Знаю слов'}</div>
              <div class="text-lg font-extrabold text-mint-500">${stats.known}</div>
            </div>
            <div class="p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
              <div class="text-[10px] font-bold uppercase text-slate-400">${isUk ? 'Мої прогалини' : 'Мои пробелы'}</div>
              <div class="text-lg font-extrabold text-gap-500">${stats.gaps}</div>
            </div>
          </div>

          <!-- Главная карточка: Ежедневное задание (Базовый минимум на день) -->
          <div class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-sm space-y-4">
            <div>
              <div class="inline-flex items-center px-2.5 py-0.5 rounded-full bg-ocean-500/10 text-ocean-600 dark:text-ocean-400 text-[11px] font-bold mb-2">
                ${isUk ? 'Базовий мінімум на день • 15 хв' : 'Базовый минимум на день • 15 мин'}
              </div>
              <h2 class="text-xl font-extrabold tracking-tight">
                ${isUk ? 'Щоденне завдання' : 'Ежедневное задание'}
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                ${isUk
                  ? 'Єдиний безперервний потік: ми проведемо тебе по черзі через твої прогалини у словах, сприйняття на слух, коротке правило та закріплення.'
                  : 'Единый непрерывный поток: нажми старт, и мы по очереди проведем тебя через карточки твоих пробелов, разбор на слух, правило и финальное закрепление.'}
              </p>
            </div>

            <!-- Схема потока (не кнопки, а наглядный план того, что сейчас будет) -->
            <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/60 dark:border-slate-800/80 space-y-2.5 text-xs">
              <div class="flex items-center justify-between">
                <span class="font-semibold text-slate-700 dark:text-slate-200">1. ${isUk ? 'Картки твоїх прогалин' : 'Карточки твоих пробелов'}</span>
                <span class="text-slate-400">5 мин</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="font-semibold text-slate-700 dark:text-slate-200">2. ${isUk ? 'Фрагмент на слух (або текст)' : 'Фрагмент на слух (или текст)'}</span>
                <span class="text-slate-400">3 мин</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="font-semibold text-slate-700 dark:text-slate-200">3. ${isUk ? 'Коротке правило граматики' : 'Короткое правило грамматики'}</span>
                <span class="text-slate-400">2 мин</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="font-semibold text-slate-700 dark:text-slate-200">4. ${isUk ? 'Практика в чаті або Бліц-тест' : 'Практика в чате или Блиц-тест'}</span>
                <span class="text-slate-400">5 мин</span>
              </div>
            </div>

            <!-- Настройка подачи карточек перед стартом -->
            <div>
              <label class="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                ${isUk ? 'Які слова включити сьогодні:' : 'Какие слова включить сегодня:'}
              </label>
              <div class="grid grid-cols-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                <button onclick="DashboardModule.cardMixMode = 'old'; DashboardModule.render();" class="py-2 rounded-lg transition ${this.cardMixMode === 'old' ? 'bg-white dark:bg-slate-900 text-ocean-500 shadow-sm' : 'text-slate-500'}">${isUk ? 'Минулі' : 'Прошлые'}</button>
                <button onclick="DashboardModule.cardMixMode = 'mix'; DashboardModule.render();" class="py-2 rounded-lg transition ${this.cardMixMode === 'mix' ? 'bg-white dark:bg-slate-900 text-ocean-500 shadow-sm' : 'text-slate-500'}">${isUk ? 'Мікс 50/50' : 'Микс 50/50'}</button>
                <button onclick="DashboardModule.cardMixMode = 'new'; DashboardModule.render();" class="py-2 rounded-lg transition ${this.cardMixMode === 'new' ? 'bg-white dark:bg-slate-900 text-ocean-500 shadow-sm' : 'text-slate-500'}">${isUk ? 'Нові' : 'Новые'}</button>
              </div>
            </div>

            <!-- Единственная кнопка запуска потока -->
            <button onclick="DashboardModule.startDailyFlow()"
              class="w-full py-4 rounded-2xl bg-gradient-to-r from-ocean-600 to-mint-600 hover:from-ocean-500 hover:to-mint-500 text-white font-extrabold text-sm shadow-lg shadow-ocean-500/20 transition">
              ${isUk ? 'Почати щоденне завдання →' : 'Начать ежедневное задание →'}
            </button>
          </div>
        </div>
      `;
      return;
    }

    // 2. ЭКРАН ВЫПОЛНЕННОГО МИНИМУМА НА СЕГОДНЯ
    if (this.dailyState === "completed") {
      container.innerHTML = `
        <div class="p-6 my-auto text-center space-y-4 fade-in pb-24">
          <div class="w-16 h-16 rounded-3xl bg-mint-500/15 text-mint-500 flex items-center justify-center text-3xl font-extrabold mx-auto">
            ✓
          </div>
          <h2 class="text-2xl font-extrabold tracking-tight">
            ${isUk ? 'Базовий мінімум виконано!' : 'Базовый минимум выполнен!'}
          </h2>
          <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-xs mx-auto">
            ${isUk
              ? 'Ти закрив сьогоднішню 15-хвилинку. Хочеш позайматися ще — переходь у вкладку «Вправи» або «Чат».'
              : 'Ты отлично прошел сегодняшнюю 15-минутку. Если хочешь позаниматься еще — переходи во вкладку «Упражнения» или «Чат».'}
          </p>
          <div class="pt-2 space-y-2">
            <button onclick="switchAppTab('exercises')" class="w-full py-3.5 rounded-2xl bg-ocean-600 text-white font-bold text-xs">
              ${isUk ? 'Перейти до вільних вправ →' : 'Перейти к свободным упражнениям →'}
            </button>
            <button onclick="DashboardModule.startDailyFlow()" class="w-full py-2.5 text-xs font-bold text-slate-400 hover:text-slate-600">
              ${isUk ? 'Пройти ще одне коло 15-хвилинки' : 'Пройти еще один круг 15-минутки'}
            </button>
          </div>
        </div>
      `;
      return;
    }

    // 3. АКТИВНЫЙ ПОТОК 15-МИНУТКИ (Идем строго по очереди 1 -> 2 -> 3 -> 4)
    const stepTitles = {
      1: isUk ? "Етап 1 з 4 • Картки прогалин" : "Этап 1 из 4 • Карточки пробелов",
      2: isUk ? "Етап 2 з 4 • Сприйняття на слух" : "Этап 2 из 4 • Разбор на слух",
      3: isUk ? "Етап 3 з 4 • Правило граматики" : "Этап 3 из 4 • Правило грамматики",
      4: isUk ? "Етап 4 з 4 • Фінальне закріплення" : "Этап 4 из 4 • Финальное закрепление"
    };
    const progressPercent = (this.dailyStep / 4) * 100;

    container.innerHTML = `
      <div class="p-4 space-y-4 pb-24 fade-in">
        <!-- Верхняя полоса единого потока (без кнопок переключения) -->
        <div class="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-extrabold text-ocean-600 dark:text-ocean-400">${stepTitles[this.dailyStep]}</span>
            <button onclick="DashboardModule.exitDailyFlow()" class="text-[11px] font-bold text-slate-400 hover:text-slate-600">
              ${isUk ? 'Перервати' : 'Прервать'}
            </button>
          </div>
          <div class="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div class="h-full bg-gradient-to-r from-ocean-500 to-mint-500 transition-all duration-300" style="width: ${progressPercent}%"></div>
          </div>
        </div>

        <!-- Тело текущего этапа потока -->
        <div class="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          ${this._renderStepBody(this.dailyStep, true)}
        </div>
      </div>
    `;
  },

  // ==========================================================================
  // ВКЛАДКА 2: «УПРАЖНЕНИЯ» — ХАБ СВОБОДНОГО ВЫБОРА ТРЕНИРОВОК
  // ==========================================================================
  renderExercisesTab() {
    const container = document.getElementById("app-root");
    const isUk = AppState.data.nativeLang === "uk";

    // Если пользователь выбрал конкретное упражнение — открываем его
    if (this.activeExercise) {
      const titles = {
        cards: isUk ? "Картки прогалин" : "Карточки пробелов",
        listening: isUk ? "Розбір на слух та контекст" : "Разбор на слух и контекст",
        grammar: isUk ? "Правила граматики" : "Правила грамматики",
        quiz: isUk ? "Контрольний бліц-тест" : "Контрольный блиц-тест"
      };
      const stepMap = { cards: 1, listening: 2, grammar: 3, quiz: 4 };

      container.innerHTML = `
        <div class="p-4 space-y-4 pb-24 fade-in">
          <div class="flex items-center justify-between">
            <button onclick="DashboardModule.activeExercise = null; DashboardModule.render();"
              class="text-xs font-bold text-ocean-500 hover:underline">
              ← ${isUk ? 'Усі вправи' : 'Все упражнения'}
            </button>
            <span class="text-xs font-extrabold text-slate-500">${titles[this.activeExercise]}</span>
          </div>

          <div class="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
            ${this._renderStepBody(stepMap[this.activeExercise], false)}
          </div>
        </div>
      `;
      return;
    }

    // Меню выбора упражнений
    const gapCount = GaplessDB.getUserGapWords(AppState.data.selectedLevel).length;

    container.innerHTML = `
      <div class="p-4 space-y-3.5 pb-24 fade-in">
        <div>
          <h2 class="text-lg font-extrabold tracking-tight">${isUk ? 'Усі вправи' : 'Все упражнения'}</h2>
          <p class="text-xs text-slate-500">${isUk ? 'Обирай будь-який інструмент і тренуйся скільки хочеш' : 'Выбирай любой инструмент и тренируйся в своем темпе'}</p>
        </div>

        <div class="grid grid-cols-1 gap-3">
          <!-- 1. Карточки -->
          <div onclick="DashboardModule.activeExercise = 'cards'; DashboardModule.render();"
            class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-ocean-500 transition flex items-center justify-between">
            <div>
              <div class="text-sm font-extrabold mb-0.5">${isUk ? 'Картки моїх прогалин' : 'Карточки моих пробелов'}</div>
              <div class="text-xs text-slate-500">${isUk ? `Повторення слів, відібраних під твій рівень (${gapCount} сл.)` : `Тренировка слов, отобранных в твои пробелы (${gapCount} сл.)`}</div>
            </div>
            <span class="text-ocean-500 font-bold text-sm">→</span>
          </div>

          <!-- 2. Фрагменты на слух -->
          <div onclick="DashboardModule.activeExercise = 'listening'; DashboardModule.render();"
            class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-ocean-500 transition flex items-center justify-between">
            <div>
              <div class="text-sm font-extrabold mb-0.5">${isUk ? 'Розбір фрагментів на слух' : 'Разбор фрагментов на слух'}</div>
              <div class="text-xs text-slate-500">${isUk ? 'Інтерактивні субтитри та текстовий режим без звуку' : 'Интерактивные субтитры + текстовый режим без звука'}</div>
            </div>
            <span class="text-ocean-500 font-bold text-sm">→</span>
          </div>

          <!-- 3. Грамматика -->
          <div onclick="DashboardModule.activeExercise = 'grammar'; DashboardModule.render();"
            class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-ocean-500 transition flex items-center justify-between">
            <div>
              <div class="text-sm font-extrabold mb-0.5">${isUk ? 'Правила граматики' : 'Правила грамматики'}</div>
              <div class="text-xs text-slate-500">${isUk ? 'Короткі шпаргалки без води з перевіркою' : 'Короткие шпаргалки без воды с быстрой проверкой'}</div>
            </div>
            <span class="text-ocean-500 font-bold text-sm">→</span>
          </div>

          <!-- 4. Контрольный тест -->
          <div onclick="DashboardModule.activeExercise = 'quiz'; DashboardModule.quizStarted = true; DashboardModule.quizQuestionIndex = 0; DashboardModule.quizScore = 0; DashboardModule.render();"
            class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 cursor-pointer hover:border-ocean-500 transition flex items-center justify-between">
            <div>
              <div class="text-sm font-extrabold mb-0.5">${isUk ? 'Контрольний тест' : 'Контрольный тест'}</div>
              <div class="text-xs text-slate-500">${isUk ? 'Перевірка засвоєних слів та конструкцій' : 'Проверка усвоенных слов и грамматических конструкций'}</div>
            </div>
            <span class="text-ocean-500 font-bold text-sm">→</span>
          </div>
        </div>
      </div>
    `;
  },

  // ==========================================================================
  // УНИВЕРСАЛЬНЫЙ РЕНДЕР УПРАЖНЕНИЯ (Работает и внутри потока 15-минутки, и отдельно)
  // ==========================================================================
  _renderStepBody(stepNumber, isDailyFlow) {
    const lang = AppState.data.nativeLang;
    const isUk = lang === "uk";
    const deck = this.getDeck();
    if (this.cardIndex >= deck.length) this.cardIndex = 0;
    const currentCard = deck[this.cardIndex];

    // --- 1. КАРТОЧКИ СЛОВ ---
    if (stepNumber === 1) {
      if (!currentCard) {
        return `
          <div class="p-6 text-center space-y-3">
            <div class="text-sm font-bold">${isUk ? 'Усі слова цього рівня вивчені!' : 'Все слова этого уровня изучены!'}</div>
            ${isDailyFlow ? `
              <button onclick="DashboardModule.dailyStep = 2; DashboardModule.render();" class="px-4 py-2.5 rounded-xl bg-ocean-600 text-white text-xs font-bold">
                ${isUk ? 'Далі: Розбір на слух →' : 'Дальше: Разбор на слух →'}
              </button>
            ` : ''}
          </div>
        `;
      }

      const targetCount = Math.min(this.dailyCardsTarget, deck.length);
      return `
        <div class="flex items-center justify-between mb-3">
          <span class="text-xs font-bold text-slate-400">
            ${isDailyFlow
              ? (isUk ? `Пройдено слів: ${this.dailyCardsDone} з ${targetCount}` : `Пройдено слов: ${this.dailyCardsDone} из ${targetCount}`)
              : (isUk ? `Картка ${this.cardIndex + 1} з ${deck.length}` : `Карточка ${this.cardIndex + 1} из ${deck.length}`)
            }
          </span>
          <button onclick="DashboardModule.showCardTr = !DashboardModule.showCardTr; DashboardModule.render();"
            class="px-2.5 py-1 rounded-lg text-[11px] font-bold border ${this.showCardTr ? 'border-ocean-500 text-ocean-500 bg-ocean-500/10' : 'border-slate-200 dark:border-slate-800 text-slate-400'}">
            ${isUk ? 'Транскрипція' : 'Транскрипция'}
          </button>
        </div>

        <div class="perspective mb-3">
          <div onclick="DashboardModule.flipCard()" class="flip-card ${this.cardFlipped ? 'flipped' : ''} relative w-full h-52 cursor-pointer">
            <!-- Лицевая сторона -->
            <div class="flip-face absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-100 to-white dark:from-slate-800 dark:to-slate-900 border border-slate-200 dark:border-slate-700 p-5 flex flex-col justify-between shadow-sm">
              <div class="flex items-center justify-between text-xs">
                <span class="font-bold px-2.5 py-0.5 rounded-md bg-gap-500/15 text-gap-500">${currentCard.level} • ${currentCard.getCategoryTitle(lang)}</span>
              </div>

              <div class="text-center my-auto">
                <div class="text-3xl font-extrabold tracking-tight mb-1">${currentCard.en}</div>
                ${this.showCardTr ? `<div class="text-xs text-slate-400">${currentCard.tr}</div>` : ''}
                <div class="text-[11px] text-ocean-500 font-semibold mt-2">${isUk ? 'Натисни, щоб перевернути' : 'Нажми, чтобы перевернуть'}</div>
              </div>

              <div class="flex items-center justify-between">
                <button onclick="event.stopPropagation(); GaplessDB.wordsMap.get('${currentCard.en.toLowerCase()}').speak();"
                  class="px-3 py-1.5 rounded-xl bg-slate-200/70 dark:bg-slate-800 text-xs font-bold hover:bg-ocean-500 hover:text-white transition">
                  ${isUk ? 'Озвучити' : 'Озвучить'}
                </button>
                <button onclick="DashboardModule.markCurrentCardKnown(event, ${isDailyFlow})"
                  class="px-3 py-1.5 rounded-xl bg-mint-500/15 text-mint-600 dark:text-mint-400 text-xs font-bold hover:bg-mint-500 hover:text-white transition">
                  ✓ ${isUk ? 'Вже знаю на 100%' : 'Уже знаю на 100%'}
                </button>
              </div>
            </div>

            <!-- Обратная сторона -->
            <div class="flip-face flip-back absolute inset-0 rounded-2xl bg-gradient-to-br from-ocean-600 to-mint-600 text-white p-5 flex flex-col justify-between shadow-lg">
              <div class="flex items-center justify-between text-xs opacity-80">
                <span>${currentCard.en}</span>
                <span>${isUk ? 'Переклад та приклад' : 'Перевод и пример'}</span>
              </div>
              <div class="text-center my-auto">
                <div class="text-2xl font-extrabold mb-2">${currentCard.getTranslation(lang)}</div>
                <p class="text-xs opacity-90 italic bg-black/15 px-3 py-2 rounded-xl">"${currentCard.example}"</p>
              </div>
              <div class="text-center text-[11px] opacity-80 font-semibold">${isUk ? 'Натисни для повернення' : 'Нажми, чтобы вернуть'}</div>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <button onclick="${isDailyFlow ? 'DashboardModule.advanceDailyCard(false)' : 'DashboardModule.nextFreeCard()'}"
            class="py-3 rounded-xl bg-slate-100 dark:bg-slate-800 font-bold text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition">
            ${isUk ? 'Ще плаваю (Повторити)' : 'Еще плаваю (Повторить)'}
          </button>
          <button onclick="${isDailyFlow ? 'DashboardModule.advanceDailyCard(true)' : 'DashboardModule.nextFreeCard()'}"
            class="py-3 rounded-xl bg-ocean-600 text-white font-bold text-xs shadow-sm hover:bg-ocean-500 transition">
            ${isUk ? 'Запам\'ятав → Далі' : 'Запомнил → Дальше'}
          </button>
        </div>
      `;
    }

    // --- 2. РАЗБОР НА СЛУХ И КОНТЕКСТ ---
    if (stepNumber === 2) {
      const sentenceWords = ["Although", "our", "flight", "was", "delayed", "because", "of", "the", "luggage,", "visiting", "our", "relatives", "was", "inevitable."];

      if (!this.silentMode) {
        const interactiveSubs = sentenceWords.map(raw => {
          const clean = raw.replace(/[^a-zA-Z]/g, "").toLowerCase();
          const inDb = GaplessDB.wordsMap.get(clean);
          const isGap = inDb && GaplessDB.getWordStatus(clean) === "gap";
          return `
            <button onclick="DashboardModule.inspectSubtitleWord('${raw}')"
              class="px-2 py-1 rounded-lg text-xs font-semibold transition ${
                isGap
                  ? 'bg-gap-500/20 text-gap-600 dark:text-gap-300 border border-gap-500/40'
                  : 'bg-slate-100 dark:bg-slate-800 hover:bg-ocean-500/20'
              }">
              ${raw}
            </button>
          `;
        }).join("");

        return `
          <div class="space-y-3">
            <div class="p-4 rounded-2xl bg-slate-900 text-white border border-slate-800">
              <div class="flex items-center justify-between text-[11px] text-slate-400 mb-3">
                <span class="font-bold text-ocean-400">Аудио-фрагмент • 0:16</span>
                <button onclick="DashboardModule.silentMode = true; DashboardModule.render();" class="underline hover:text-white">
                  ${isUk ? 'Не можу слухати (Текст)' : 'Не могу слушать (Текст)'}
                </button>
              </div>

              <div class="py-4 text-center">
                <div class="text-xs text-slate-400 mb-3">${isUk ? 'Прослухай фразу та спробуй вловити зміст:' : 'Прослушай фразу и попробуй уловить смысл:'}</div>
                <div class="flex justify-center gap-2">
                  <button onclick="DashboardModule.playSceneAudio(0.95)" class="px-4 py-2.5 rounded-xl bg-ocean-600 hover:bg-ocean-500 text-xs font-bold shadow-md transition">
                    ▶ ${isUk ? 'Слухати оригінал' : 'Слушать оригинал'}
                  </button>
                  <button onclick="DashboardModule.playSceneAudio(0.72)" class="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold transition">
                    0.75x Медленно
                  </button>
                </div>
              </div>

              <div class="mt-3 pt-3 border-t border-slate-800">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-[11px] text-slate-400">${isUk ? 'Натисни на слово для перекладу:' : 'Нажми на любое слово для перевода:'}</span>
                  <button onclick="DashboardModule.subtitlesRevealed = !DashboardModule.subtitlesRevealed; DashboardModule.render();"
                    class="text-[11px] font-bold text-ocean-400">
                    ${this.subtitlesRevealed ? (isUk ? 'Сховати текст' : 'Скрыть текст') : (isUk ? 'Показати субтитри' : 'Показать субтитры')}
                  </button>
                </div>
                <div class="flex flex-wrap gap-1.5 transition ${this.subtitlesRevealed ? '' : 'blur-sm select-none'}">
                  ${interactiveSubs}
                </div>
              </div>
            </div>

            ${this.selectedSubWord ? `
              <div class="p-3.5 rounded-2xl bg-ocean-500/10 border border-ocean-500/30 flex items-center justify-between fade-in">
                <div>
                  <div class="text-sm font-extrabold text-ocean-600 dark:text-ocean-400">${this.selectedSubWord.en}</div>
                  <div class="text-xs text-slate-600 dark:text-slate-300">${this.selectedSubWord.getTranslation(lang)}</div>
                </div>
                <button onclick="DashboardModule.addSubtitleWordToGaps('${this.selectedSubWord.en}')"
                  class="px-3 py-1.5 rounded-xl bg-gap-500 text-white text-xs font-bold">
                  + ${isUk ? 'У прогалини' : 'В пробелы'}
                </button>
              </div>
            ` : ''}

            ${isDailyFlow ? `
              <button onclick="DashboardModule.dailyStep = 3; DashboardModule.render();" class="w-full py-3.5 rounded-xl bg-ocean-600 text-white text-xs font-bold">
                ${isUk ? 'Далі → Правило граматики' : 'Дальше → Правило грамматики'}
              </button>
            ` : ''}
          </div>
        `;
      } else {
        return `
          <div class="space-y-3">
            <div class="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-800">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold text-ocean-500">${isUk ? 'Режим без звуку' : 'Режим без звука'}</span>
                <button onclick="DashboardModule.silentMode = false; DashboardModule.render();" class="text-[11px] underline text-slate-400">
                  ${isUk ? 'Повернути аудіо' : 'Вернуть аудио'}
                </button>
              </div>
              <p class="text-xs text-slate-500 mb-3">${isUk ? 'Встав слово зі своїх прогалин за змістом:' : 'Вставь слово из своих пробелов по смыслу:'}</p>
              <div class="p-3.5 rounded-xl bg-white dark:bg-slate-900 text-sm leading-relaxed font-medium">
                "Our flight was <b>delayed</b>, so missing the train was <span class="px-2 py-0.5 rounded bg-ocean-500/20 text-ocean-500 font-bold">${this.clozeSolved[1] === 'correct' ? 'inevitable' : '______'}</span>."
              </div>
              <div class="grid grid-cols-3 gap-2 mt-3">
                <button onclick="DashboardModule.solveCloze(1, true)" class="py-2 rounded-xl border text-xs font-bold ${this.clozeSolved[1] === 'correct' ? 'bg-mint-500 text-white border-mint-500' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'}">inevitable</button>
                <button onclick="DashboardModule.solveCloze(1, false)" class="py-2 rounded-xl border text-xs font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">savory</button>
                <button onclick="DashboardModule.solveCloze(1, false)" class="py-2 rounded-xl border text-xs font-bold bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">relatives</button>
              </div>
            </div>
            ${isDailyFlow ? `
              <button onclick="DashboardModule.dailyStep = 3; DashboardModule.render();" class="w-full py-3.5 rounded-xl bg-ocean-600 text-white text-xs font-bold">
                ${isUk ? 'Далі → Правило граматики' : 'Дальше → Правило грамматики'}
              </button>
            ` : ''}
          </div>
        `;
      }
    }

    // --- 3. ПРАВИЛО ГРАММАТИКИ ---
    if (stepNumber === 3) {
      return `
        <div class="space-y-3">
          <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
            <div class="text-[11px] font-bold text-ocean-500 uppercase mb-1">${isUk ? 'Коротке правило' : 'Короткое правило'}</div>
            <h4 class="text-sm font-extrabold mb-2">Although vs. Despite</h4>
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
              • После <b>Although</b> идет действие (<i>Кто + Что сделал</i>): <br/>
              <span class="text-ocean-500 font-semibold">Although it rained</span>, we went out.<br/>
              • После <b>Despite</b> идет только предмет или глагол с <i>-ing</i>:<br/>
              <span class="text-mint-500 font-semibold">Despite the rain</span>, we went out.
            </p>

            <div class="pt-3 border-t border-slate-200 dark:border-slate-800">
              <div class="text-xs font-bold mb-2">${isUk ? 'Перевірка: що підійде сюди?' : 'Проверка: что подойдет сюда?'}</div>
              <div class="text-xs italic mb-2.5 p-2.5 rounded-xl bg-white dark:bg-slate-900">"______ the heavy traffic, we arrived on time."</div>
              <div class="grid grid-cols-2 gap-2">
                <button onclick="DashboardModule.answerGrammarQuiz(0)" class="py-2.5 rounded-xl text-xs font-bold border ${this.grammarQuizAnswered === 0 ? 'border-red-500 bg-red-500/10 text-red-500' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}">
                  Although
                </button>
                <button onclick="DashboardModule.answerGrammarQuiz(1)" class="py-2.5 rounded-xl text-xs font-bold border ${this.grammarQuizAnswered === 1 ? 'border-mint-500 bg-mint-500 text-white' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}">
                  Despite ✓
                </button>
              </div>
            </div>
          </div>

          ${isDailyFlow ? `
            <button onclick="DashboardModule.dailyStep = 4; DashboardModule.render();" class="w-full py-3.5 rounded-xl bg-ocean-600 text-white text-xs font-bold">
              ${isUk ? 'Далі → Фінальне закріплення' : 'Дальше → Финальное закрепление'}
            </button>
          ` : ''}
        </div>
      `;
    }

    // --- 4. ФИНАЛ (РАЗВИЛКА ИЛИ КОНТРОЛЬНЫЙ ТЕСТ) ---
    if (stepNumber === 4) {
      if (isDailyFlow && !this.quizStarted) {
        return `
          <div class="space-y-3">
            <h4 class="text-sm font-extrabold">${isUk ? 'Останній крок на вибір:' : 'Финальный шаг на выбор:'}</h4>
            <p class="text-xs text-slate-500 leading-relaxed">
              ${isUk
                ? 'Використай нові слова в живому чаті або пройди експрес-тест на 1 хвилину, якщо зараз немає часу спілкуватися.'
                : 'Примени новые слова в чате с заданием или пройди быстрый тест на 1 минуту, если сейчас нет времени переписываться.'}
            </p>

            <div class="grid grid-cols-1 gap-2.5 pt-1">
              <button onclick="DashboardModule.completeDailyFlow(); switchAppTab('chat');"
                class="p-4 rounded-2xl bg-gradient-to-r from-ocean-600 to-mint-600 text-white text-left shadow-md transition">
                <div class="text-sm font-extrabold mb-0.5">${isUk ? 'Практика в чаті (з місією)' : 'Практика в чате (с заданием)'} →</div>
                <div class="text-[11px] opacity-85">${isUk ? 'Діалог з інтерактивним перекладачем' : 'Диалог со встроенным переводчиком слов'}</div>
              </button>

              <button onclick="DashboardModule.quizStarted = true; DashboardModule.quizQuestionIndex = 0; DashboardModule.quizScore = 0; DashboardModule.render();"
                class="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left hover:border-ocean-500 transition">
                <div class="text-sm font-extrabold mb-0.5">${isUk ? 'Пройти бліц-тест (3 питання)' : 'Пройти блиц-тест (3 вопроса)'} →</div>
                <div class="text-[11px] text-slate-500">${isUk ? 'Швидке завершення денного мінімуму' : 'Быстрое завершение дневного минимума'}</div>
              </button>
            </div>
          </div>
        `;
      }

      const questions = [
        { q: "Перевод слова «inevitable»:", options: [{ t: "неизбежный", ok: true }, { t: "сомнительный", ok: false }, { t: "временный", ok: false }] },
        { q: "Выбери правильную связку: «___ the rain, we walked»", options: [{ t: "Despite", ok: true }, { t: "Although", ok: false }, { t: "Meanwhile", ok: false }] },
        { q: "Что означает слово «siblings»?", options: [{ t: "родные братья и сестры", ok: true }, { t: "дальние предки", ok: false }, { t: "соседи по дому", ok: false }] }
      ];
      const currentQ = questions[this.quizQuestionIndex];

      if (currentQ) {
        return `
          <div class="space-y-3">
            <div class="flex justify-between text-xs text-slate-400 font-bold">
              <span>${isUk ? 'Контрольний тест' : 'Контрольный тест'}</span>
              <span>${this.quizQuestionIndex + 1} / ${questions.length}</span>
            </div>
            <div class="text-sm font-extrabold">${currentQ.q}</div>
            <div class="space-y-2">
              ${currentQ.options.map(opt => `
                <button onclick="DashboardModule.answerBlitzQuestion(${opt.ok},${isDailyFlow})"
                  class="w-full p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-left text-xs font-bold hover:border-ocean-500 transition">
                  ${opt.t}
                </button>
              `).join("")}
            </div>
          </div>
        `;
      } else {
        return `
          <div class="p-5 text-center space-y-3">
            <div class="text-lg font-extrabold text-mint-500">${isUk ? 'Тест завершено!' : 'Тест завершен!'} (${this.quizScore}/3)</div>
            <button onclick="DashboardModule.quizQuestionIndex = 0; DashboardModule.quizScore = 0; DashboardModule.render();"
              class="px-4 py-2.5 rounded-xl bg-ocean-600 text-white text-xs font-bold">
              ${isUk ? 'Пройти ще раз' : 'Пройти еще раз'}
            </button>
          </div>
        `;
      }
    }
  },

  // Временная заглушка для вкладки Чат (переходим к сборке chat.js следующим шагом)
  renderChatPlaceholder() {
    const container = document.getElementById("app-root");
    container.innerHTML = `
      <div class="p-6 text-center my-auto space-y-3 fade-in">
        <h3 class="text-lg font-extrabold">Модуль 3: Живой чат с заданием</h3>
        <p class="text-xs text-slate-500">Следующим файлом подключаем <code>js/chat.js</code> (Случайный собеседник, Друзья, ИИ-напарник и кликабельный переводчик каждого слова).</p>
      </div>
    `;
  },

  // ==========================================================================
  // ВКЛАДКА 4: «ПРОФИЛЬ» (Прогресс + Управление Базой слов без XP)
  // ==========================================================================
  renderProfileTab() {
    const container = document.getElementById("app-root");
    const lang = AppState.data.nativeLang;
    const isUk = lang === "uk";
    const stats = GaplessDB.getStatistics();

    container.innerHTML = `
      <div class="p-4 space-y-4 pb-24 fade-in">
        <!-- Карточка пользователя (без опыта XP) -->
        <div class="p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div class="text-lg font-extrabold">${AppState.data.userName || (isUk ? 'Мій профіль' : 'Мой профиль')}</div>
          <div class="text-xs text-slate-400 mb-4">${AppState.data.userEmail || (isUk ? 'Локальне збереження активне' : 'Локальное сохранение активно')}</div>

          <div class="grid grid-cols-3 gap-2 text-center">
            <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
              <div class="text-lg font-extrabold text-ocean-500">${AppState.data.selectedLevel}</div>
              <div class="text-[10px] text-slate-400 font-bold uppercase">${isUk ? 'Рівень' : 'Уровень'}</div>
            </div>
            <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
              <div class="text-lg font-extrabold text-mint-500">${stats.known}</div>
              <div class="text-[10px] text-slate-400 font-bold uppercase">${isUk ? 'Знаю слів' : 'Знаю слов'}</div>
            </div>
            <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60">
              <div class="text-lg font-extrabold text-gap-500">${stats.gaps}</div>
              <div class="text-[10px] text-slate-400 font-bold uppercase">${isUk ? 'Прогалини' : 'Пробелы'}</div>
            </div>
          </div>
        </div>

        <!-- Управление базой слов прямо в Профиле -->
        <div class="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
          <div class="flex items-center justify-between">
            <div>
              <h3 class="text-sm font-extrabold">${isUk ? 'Моя база слів та груп' : 'Моя база слов и групп'}</h3>
              <p class="text-[11px] text-slate-500">${isUk ? 'Відмічай вивчені групи або додавай нові прогалини' : 'Отмечай известные группы или добавляй слова на изучение'}</p>
            </div>
            <button onclick="AppState.data.onboardingCompleted = false; AppState.data.onboardingStep = 3; AppState.save(); renderCurrentModule();"
              class="px-3 py-2 rounded-xl bg-ocean-600 text-white text-xs font-bold shrink-0">
              ${isUk ? 'Фільтр слів' : 'Фильтр слов'}
            </button>
          </div>

          <button onclick="DashboardModule.profileShowBase = !DashboardModule.profileShowBase; DashboardModule.render();"
            class="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-600 dark:text-slate-300">
            ${this.profileShowBase ? (isUk ? 'Сховати список груп ▲' : 'Скрыть список групп ▲') : (isUk ? 'Показати всі групи бази ▼' : 'Показать все группы базы ▼')}
          </button>

          ${this.profileShowBase ? `
            <div class="space-y-2 pt-2">
              ${GaplessDB.clusters.map(cluster => {
                const knownCount = cluster.words.filter(w => GaplessDB.getWordStatus(w.en) === "known").length;
                return `
                  <div class="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                    <div>
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-xs">${cluster.getTitle(lang)}</span>
                        <span class="text-[10px] font-extrabold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-ocean-500">${cluster.level}</span>
                      </div>
                      <div class="text-[11px] text-slate-400 mt-0.5">${isUk ? 'Знаю' : 'Знаю'}: ${knownCount} / ${cluster.words.length}</div>
                    </div>
                    <button onclick="GaplessDB.toggleClusterStatus('${cluster.clusterId}'); DashboardModule.render();"
                      class="px-3 py-1.5 rounded-xl text-xs font-bold ${knownCount === cluster.words.length ? 'bg-mint-500 text-white' : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700'}">
                      ${knownCount === cluster.words.length ? '✓ Знаю' : 'Знаю всё'}
                    </button>
                  </div>
                `;
              }).join("")}
            </div>
          ` : ''}
        </div>

        <button onclick="AppState.data.onboardingCompleted = false; AppState.data.onboardingStep = 1; AppState.save(); renderCurrentModule();"
          class="w-full py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-500 hover:border-ocean-500 transition">
          ${isUk ? 'Змінити мову або пройти калібрування заново' : 'Изменить язык или пройти калибровку заново'}
        </button>
      </div>
    `;
  }
};