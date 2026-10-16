// ============================================================================
// ФАЙЛ: js/onboarding.js
// Модуль 1: Приветствие, выбор уровня и калибровка знаний
// ============================================================================

const ONBOARDING_I18N = {
  ru: {
    stepOf: (s) => `Шаг ${s} из 4`,
    heroTitle1: "Закрой свои пробелы с",
    heroDesc: "Не топчись на том, что знаешь со школы. Отметь знакомую базу группами за минуту — и мы соберем программу только из твоих пробелов.",
    langLabel: "Язык интерфейса и перевода",
    themeLabel: "Тема оформления",
    lightTheme: "Светлая",
    darkTheme: "Темная",
    toStep2Btn: "Выбрать ориентир уровня →",
    step2Title: "Выбери примерный уровень",
    step2Desc: (lvl, neighbors) => `Не бойся ошибиться: для уровня <b>${lvl}</b> мы автоматически добавим проверочные группы из <b>${neighbors}</b>.`,
    neighborBadge: "+ Захват",
    selectedBadge: "Основной",
    toStep3Btn: (neighbors) => `Перейти к отсеву слов (${neighbors}) →`,
    step3Title: "Отметь то, что уже знаешь",
    step3Desc: "Нажми «Знаю всё» на знакомой группе. Если внутри есть 1–2 забытых слова — просто нажми на них, чтобы отправить их в свои пробелы на изучение.",
    allTopics: "Все темы",
    modeGroups: "Группы",
    modeSingle: "По одному",
    translationBtn: "Перевод",
    knowAll: "Знаю всё",
    knowAllActive: "✓ Знаю всё",
    knowWord: "✓ Знаю",
    learnWord: "+ На изучение",
    knownCounter: (n) => `Знаю (скрыто): ${n}`,
    gapCounter: (n) => `Мои пробелы: ${n}`,
    toStep4Btn: (n) => `Собрать программу (${n} на изучение) →`,
    toastClusterKnown: "Группа отмечена как известная",
    toastClusterGap: "Группа возвращена на изучение",
    step4Badge: "Калибровка завершена",
    step4Title: "Твой план готов!",
    statLevel: "Ориентир",
    statKnown: "Отсеяно",
    statGaps: "Пробелы",
    firstDeckLabel: "Слова, отправленные в твои пробелы:",
    wordsCount: (n) => `${n} сл.`,
    saveProfileTitle: "Сохрани свой профиль",
    namePlaceholder: "Твое имя или никнейм",
    emailPlaceholder: "Email (необязательно)",
    finishBtn: "Сохранить и продолжить →",
    levels: {
      "A0": { title: "A0 — Полный ноль", desc: "Знаю только базовый алфавит, хочу начать с самого старта" },
      "A1": { title: "A1 — Начальный", desc: "Знаю простые слова, могу представиться и построить легкие фразы" },
      "A2": { title: "A2 — Базовый", desc: "Общаюсь на бытовые темы, говорю о прошлом и планах, но не хватает слов" },
      "B1": { title: "B1 — Средний", desc: "Понимаю общий смысл видео и разговоров, но путаюсь в конструкциях" },
      "B2": { title: "B2 — Выше среднего", desc: "Говорю свободно, хочу закрыть пробелы в сложной лексике и нюансах" },
      "C1": { title: "C1 — Продвинутый", desc: "Хочу отточить редкие выражения, идиомы и продвинутую лексику" }
    }
  },
  uk: {
    stepOf: (s) => `Крок ${s} з 4`,
    heroTitle1: "Закрий свої прогалини з",
    heroDesc: "Не тупцюй на тому, що знаєш зі школи. Відміть знайому базу групами за хвилину — і ми зберемо програму тільки з твоїх прогалин.",
    langLabel: "Мова інтерфейсу та перекладу",
    themeLabel: "Тема оформлення",
    lightTheme: "Світла",
    darkTheme: "Темна",
    toStep2Btn: "Обрати орієнтир рівня →",
    step2Title: "Обери приблизний рівень",
    step2Desc: (lvl, neighbors) => `Не бійся помилитися: для рівня <b>${lvl}</b> ми автоматично додамо перевірочні групи з <b>${neighbors}</b>.`,
    neighborBadge: "+ Захоплення",
    selectedBadge: "Основний",
    toStep3Btn: (neighbors) => `Перейти до відсіву слів (${neighbors}) →`,
    step3Title: "Відміть те, що вже знаєш",
    step3Desc: "Натисни «Знаю все» на знайомій групі. Якщо всередині є 1–2 забутих слова — просто натисни на них, щоб відправити їх у свої прогалини на вивчення.",
    allTopics: "Усі теми",
    modeGroups: "Групи",
    modeSingle: "По одному",
    translationBtn: "Переклад",
    knowAll: "Знаю все",
    knowAllActive: "✓ Знаю все",
    knowWord: "✓ Знаю",
    learnWord: "+ На вивчення",
    knownCounter: (n) => `Знаю (приховано): ${n}`,
    gapCounter: (n) => `Мої прогалини: ${n}`,
    toStep4Btn: (n) => `Зібрати програму (${n} на вивчення) →`,
    toastClusterKnown: "Групу відмічено як відому",
    toastClusterGap: "Групу повернуто на вивчення",
    step4Badge: "Калібрування завершено",
    step4Title: "Твій план готовий!",
    statLevel: "Орієнтир",
    statKnown: "Відсіяно",
    statGaps: "Прогалини",
    firstDeckLabel: "Слова, відправлені у твої прогалини:",
    wordsCount: (n) => `${n} сл.`,
    saveProfileTitle: "Збережи свій профіль",
    namePlaceholder: "Твоє ім'я або нікнейм",
    emailPlaceholder: "Email (необов'язково)",
    finishBtn: "Зберегти та продовжити →",
    levels: {
      "A0": { title: "A0 — Повний нуль", desc: "Знаю лише базовий алфавіт, хочу почати з самого старту" },
      "A1": { title: "A1 — Початковий", desc: "Знаю прості слова, можу представитися і побудувати легкі фрази" },
      "A2": { title: "A2 — Базовий", desc: "Спілкуюся на побутові теми, говорю про минуле і плани, але бракує слів" },
      "B1": { title: "B1 — Середній", desc: "Розумію загальний зміст відео та розмов, але плутаюся в конструкціях" },
      "B2": { title: "B2 — Вище середнього", desc: "Говорю вільно, хочу закрити прогалини у складній лексиці та нюансах" },
      "C1": { title: "C1 — Просунутий", desc: "Хочу відточити рідкісні вирази, ідіоми та просунуту лексику" }
    }
  }
};

const OnboardingModule = {
  t() {
    const lang = AppState.data.nativeLang === "uk" ? "uk" : "ru";
    return ONBOARDING_I18N[lang];
  },

  goToStep(step) {
    AppState.data.onboardingStep = step;
    AppState.save();
    window.scrollTo({ top: 0, behavior: "smooth" });
    this.render();
  },

  setLang(lang) {
    AppState.data.nativeLang = lang;
    AppState.save();
    this.render();
  },

  setLevel(lvl) {
    AppState.data.selectedLevel = lvl;
    AppState.save();
    this.render();
  },

  setFilterMode(mode) {
    AppState.data.filterMode = mode;
    AppState.save();
    this.render();
  },

  setCategoryFilter(catId) {
    AppState.data.categoryFilter = catId;
    AppState.save();
    this.render();
  },

  toggleTranslation() {
    AppState.data.showTranslation = !AppState.data.showTranslation;
    AppState.save();
    this.render();
  },

  handleClusterToggle(clusterId) {
    const markedKnown = GaplessDB.toggleClusterStatus(clusterId);
    const i18n = this.t();
    showToast(markedKnown ? i18n.toastClusterKnown : i18n.toastClusterGap);
    this.render();
  },

  handleWordToggle(wordEn) {
    GaplessDB.toggleWordStatus(wordEn);
    this.render();
  },

  finishOnboarding() {
    const nameInput = document.getElementById("onb-name-input");
    const emailInput = document.getElementById("onb-email-input");
    if (nameInput && nameInput.value.trim()) AppState.data.userName = nameInput.value.trim();
    if (emailInput && emailInput.value.trim()) AppState.data.userEmail = emailInput.value.trim();

    AppState.data.onboardingCompleted = true;
    AppState.data.activeTab = "today";
    AppState.save();
    if (window.renderCurrentModule) window.renderCurrentModule();
  },

  render() {
    const container = document.getElementById("app-root");
    if (!container) return;

    const step = AppState.data.onboardingStep;
    const lang = AppState.data.nativeLang;
    const isDark = AppState.data.theme === "dark";
    const i18n = this.t();

    const stepsHeaderHtml = `
      <div class="px-5 pt-4 pb-2 flex items-center justify-between">
        <div class="flex items-center gap-1.5">
          ${[1, 2, 3, 4].map(n => `
            <button onclick="OnboardingModule.goToStep(${n})"
              class="h-1.5 rounded-full transition-all ${step === n ? 'w-8 bg-ocean-500' : n < step ? 'w-4 bg-mint-500' : 'w-4 bg-slate-300 dark:bg-slate-800'}"
              title="${n}">
            </button>
          `).join("")}
        </div>
        <span class="text-[11px] font-bold text-slate-400">${i18n.stepOf(step)}</span>
      </div>
    `;

    // ШАГ 1
    if (step === 1) {
      container.innerHTML = `
        ${stepsHeaderHtml}
        <div class="p-6 flex-1 flex flex-col justify-between fade-in">
          <div class="mt-2">
            <h1 class="text-3xl font-extrabold tracking-tight leading-tight mb-3">
              ${i18n.heroTitle1} <span class="text-transparent bg-clip-text bg-gradient-to-r from-ocean-500 to-mint-500">Gapless</span>
            </h1>
            <p class="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
              ${i18n.heroDesc}
            </p>

            <div class="space-y-5">
              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">${i18n.langLabel}</label>
                <div class="grid grid-cols-2 gap-2.5">
                  <button onclick="OnboardingModule.setLang('ru')" class="p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${lang === 'ru' ? 'border-ocean-500 bg-ocean-500/10 font-bold text-ocean-600 dark:text-ocean-400' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}">
                    <span class="text-sm">Русский</span>
                    ${lang === 'ru' ? '<span class="text-ocean-500 font-bold">✓</span>' : ''}
                  </button>
                  <button onclick="OnboardingModule.setLang('uk')" class="p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${lang === 'uk' ? 'border-ocean-500 bg-ocean-500/10 font-bold text-ocean-600 dark:text-ocean-400' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}">
                    <span class="text-sm">Українська</span>
                    ${lang === 'uk' ? '<span class="text-ocean-500 font-bold">✓</span>' : ''}
                  </button>
                </div>
              </div>

              <div>
                <label class="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">${i18n.themeLabel}</label>
                <div class="grid grid-cols-2 gap-2.5">
                  <button onclick="if(AppState.data.theme==='dark') AppState.toggleTheme()" class="p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${!isDark ? 'border-ocean-500 bg-ocean-500/10 font-bold text-ocean-600' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}">
                    <span class="text-sm">${i18n.lightTheme}</span>
                    ${!isDark ? '<span class="text-ocean-500 font-bold">✓</span>' : ''}
                  </button>
                  <button onclick="if(AppState.data.theme!=='dark') AppState.toggleTheme()" class="p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${isDark ? 'border-ocean-500 bg-ocean-500/10 font-bold text-ocean-400' : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'}">
                    <span class="text-sm">${i18n.darkTheme}</span>
                    ${isDark ? '<span class="text-ocean-500 font-bold">✓</span>' : ''}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div class="pt-6">
            <button onclick="OnboardingModule.goToStep(2)" class="w-full py-4 rounded-2xl bg-gradient-to-r from-ocean-600 to-mint-600 hover:from-ocean-500 hover:to-mint-500 text-white font-bold text-base shadow-lg shadow-ocean-500/20 transition">
              ${i18n.toStep2Btn}
            </button>
          </div>
        </div>
      `;
      return;
    }

    // ШАГ 2
    if (step === 2) {
      const selectedLvl = AppState.data.selectedLevel;
      const neighbors = GaplessDB.getTargetAndNeighborLevels(selectedLvl);

      const levelsHtml = GAPLESS_RAW_DB.levelsOrder.map(lvlId => {
        const info = i18n.levels[lvlId];
        const isSelected = selectedLvl === lvlId;
        const isNeighbor = neighbors.includes(lvlId) && !isSelected;

        return `
          <div onclick="OnboardingModule.setLevel('${lvlId}')" class="p-3.5 rounded-2xl border cursor-pointer transition-all ${
            isSelected
              ? 'border-ocean-500 bg-ocean-500/10 ring-1 ring-ocean-500'
              : isNeighbor
              ? 'border-mint-500/40 bg-mint-500/5'
              : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-400'
          }">
            <div class="flex items-center justify-between mb-1">
              <span class="font-extrabold text-sm ${isSelected ? 'text-ocean-600 dark:text-ocean-400' : ''}">${info.title}</span>
              <div class="flex items-center gap-1.5">
                ${isNeighbor ? `<span class="text-[10px] px-2 py-0.5 rounded-full bg-mint-500/15 text-mint-600 dark:text-mint-400 font-bold">${i18n.neighborBadge}</span>` : ''}
                ${isSelected ? `<span class="text-[10px] px-2 py-0.5 rounded-full bg-ocean-500 text-white font-bold">${i18n.selectedBadge}</span>` : ''}
              </div>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400">${info.desc}</p>
          </div>
        `;
      }).join("");

      container.innerHTML = `
        ${stepsHeaderHtml}
        <div class="p-5 flex-1 flex flex-col justify-between fade-in">
          <div>
            <h2 class="text-xl font-extrabold tracking-tight mb-1">${i18n.step2Title}</h2>
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-4">
              ${i18n.step2Desc(selectedLvl, neighbors.join(" + "))}
            </p>
            <div class="space-y-2.5">${levelsHtml}</div>
          </div>

          <div class="pt-5 flex gap-2">
            <button onclick="OnboardingModule.goToStep(1)" class="px-4 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-bold">←</button>
            <button onclick="OnboardingModule.goToStep(3)" class="flex-1 py-3.5 rounded-2xl bg-ocean-600 hover:bg-ocean-500 text-white font-bold text-sm shadow-lg shadow-ocean-500/20 transition">
              ${i18n.toStep3Btn(neighbors.join(", "))}
            </button>
          </div>
        </div>
      `;
      return;
    }

    // ШАГ 3: ОТСЕВ СЛОВ + КНОПКА ПЕРЕВОДА ПО ЖЕЛАНИЮ (ПО УМОЛЧАНИЮ ВЫКЛ)
    if (step === 3) {
      const selectedLvl = AppState.data.selectedLevel;
      const catFilter = AppState.data.categoryFilter;
      const clusters = GaplessDB.getClustersForCalibration(selectedLvl, catFilter);
      const stats = GaplessDB.getStatistics(selectedLvl);
      const neighbors = GaplessDB.getTargetAndNeighborLevels(selectedLvl);
      const showTr = !!AppState.data.showTranslation;

      const categoryTabsHtml = `
        <div class="flex flex-wrap gap-1.5 mb-3">
          <button onclick="OnboardingModule.setCategoryFilter('all')"
            class="px-3 py-1.5 rounded-xl text-xs font-bold transition ${catFilter === 'all' ? 'bg-ocean-600 text-white shadow-sm' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-ocean-500/50'}">
            ${i18n.allTopics}
          </button>
          ${GAPLESS_RAW_DB.categories.map(cat => `
            <button onclick="OnboardingModule.setCategoryFilter('${cat.id}')"
              class="px-3 py-1.5 rounded-xl text-xs font-bold transition ${catFilter === cat.id ? 'bg-ocean-600 text-white shadow-sm' : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-ocean-500/50'}">
              ${lang === 'uk' ? cat.titleUk : cat.titleRu}
            </button>
          `).join("")}
        </div>
      `;

      let listHtml = "";
      if (AppState.data.filterMode === "clusters") {
        listHtml = clusters.map(cluster => {
          const knownCount = cluster.words.filter(w => GaplessDB.getWordStatus(w.en) === "known").length;
          const allKnown = knownCount === cluster.words.length;

          const wordsPills = cluster.words.map(word => {
            const isKnown = GaplessDB.getWordStatus(word.en) === "known";
            return `
              <button onclick="OnboardingModule.handleWordToggle('${word.en}')"
                class="px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                  isKnown
                    ? 'bg-mint-500/15 border-mint-500/40 text-mint-700 dark:text-mint-300'
                    : 'bg-gap-500/15 border-gap-500/40 text-gap-600 dark:text-gap-300 shadow-sm'
                }">
                <span>${isKnown ? '✓' : '+'} ${word.en}</span>
                ${showTr ? `<span class="text-[11px] opacity-70 font-normal border-l border-current/20 pl-1.5">${word.getTranslation(lang)}</span>` : ''}
              </button>
            `;
          }).join("");

          return `
            <div class="p-4 rounded-2xl border transition ${
              allKnown
                ? 'border-mint-500/50 bg-mint-500/5 dark:bg-mint-950/20'
                : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
            }">
              <div class="flex items-center justify-between gap-2 mb-2.5">
                <div class="flex items-center gap-2">
                  <span class="font-bold text-sm">${cluster.getTitle(lang)}</span>
                  <span class="text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                    cluster.level === selectedLvl ? 'bg-ocean-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }">${cluster.level}</span>
                </div>
                <button onclick="OnboardingModule.handleClusterToggle('${cluster.clusterId}')"
                  class="px-3 py-1 rounded-xl text-xs font-bold transition ${
                    allKnown
                      ? 'bg-mint-500 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-mint-500/20 hover:text-mint-500'
                  }">
                  ${allKnown ? i18n.knowAllActive : i18n.knowAll}
                </button>
              </div>
              <div class="flex flex-wrap gap-1.5">${wordsPills}</div>
            </div>
          `;
        }).join("");
      } else {
        const flatWords = [];
        clusters.forEach(c => c.words.forEach(w => flatWords.push(w)));
        listHtml = `
          <div class="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 divide-y divide-slate-100 dark:divide-slate-800">
            ${flatWords.map(word => {
              const isKnown = GaplessDB.getWordStatus(word.en) === "known";
              return `
                <div onclick="OnboardingModule.handleWordToggle('${word.en}')" class="p-3.5 flex items-center justify-between cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                  <div>
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-sm">${word.en}</span>
                      <span class="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold">${word.level}</span>
                    </div>
                    ${showTr ? `<div class="text-xs text-slate-500 mt-0.5">${word.getTranslation(lang)}</div>` : ''}
                  </div>
                  <span class="px-3 py-1 rounded-xl text-xs font-bold ${isKnown ? 'bg-mint-500/15 text-mint-600 dark:text-mint-400' : 'bg-gap-500/15 text-gap-600 dark:text-gap-400'}">
                    ${isKnown ? i18n.knowWord : i18n.learnWord}
                  </span>
                </div>
              `;
            }).join("")}
          </div>
        `;
      }

      container.innerHTML = `
        ${stepsHeaderHtml}
        <div class="p-4 flex-1 flex flex-col justify-between fade-in pb-28">
          <div>
            <div class="flex items-center justify-between mb-1">
              <h2 class="text-lg font-extrabold tracking-tight">${i18n.step3Title}</h2>
              <span class="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-ocean-500/10 text-ocean-500">${neighbors.join(" + ")}</span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
              ${i18n.step3Desc}
            </p>

            ${categoryTabsHtml}

            <!-- Панель: Группы / По одному + Кнопка Перевод (по умолчанию выкл) -->
            <div class="flex items-center gap-2 mb-3">
              <div class="flex-1 grid grid-cols-2 bg-slate-200/70 dark:bg-slate-900 p-1 rounded-xl text-xs font-bold border border-slate-200/60 dark:border-slate-800">
                <button onclick="OnboardingModule.setFilterMode('clusters')" class="py-1.5 rounded-lg transition ${AppState.data.filterMode === 'clusters' ? 'bg-white dark:bg-slate-800 text-ocean-600 dark:text-ocean-400 shadow-sm' : 'text-slate-500'}">
                  ${i18n.modeGroups}
                </button>
                <button onclick="OnboardingModule.setFilterMode('single')" class="py-1.5 rounded-lg transition ${AppState.data.filterMode === 'single' ? 'bg-white dark:bg-slate-800 text-ocean-600 dark:text-ocean-400 shadow-sm' : 'text-slate-500'}">
                  ${i18n.modeSingle}
                </button>
              </div>

              <button onclick="OnboardingModule.toggleTranslation()"
                class="px-3.5 py-2 rounded-xl text-xs font-bold border transition ${
                  showTr
                    ? 'bg-ocean-500/15 border-ocean-500 text-ocean-600 dark:text-ocean-400'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500 hover:border-slate-300'
                }">
                ${i18n.translationBtn}
              </button>
            </div>

            <div class="space-y-3">${listHtml}</div>
          </div>

          <div class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md p-3.5 backdrop-blur-lg bg-white/90 dark:bg-slate-900/90 border-t border-slate-200 dark:border-slate-800 z-30">
            <div class="flex items-center justify-between mb-2 text-xs">
              <span class="font-bold text-mint-600 dark:text-mint-400">✓ ${i18n.knownCounter(stats.known)}</span>
              <span class="font-bold text-gap-600 dark:text-gap-400">+ ${i18n.gapCounter(stats.gaps)}</span>
            </div>
            <button onclick="OnboardingModule.goToStep(4)" class="w-full py-3 rounded-xl bg-gradient-to-r from-ocean-600 to-mint-600 text-white font-bold text-sm shadow-lg shadow-ocean-500/20">
              ${i18n.toStep4Btn(stats.gaps)}
            </button>
          </div>
        </div>
      `;
      return;
    }

    // ШАГ 4
    if (step === 4) {
      const selectedLvl = AppState.data.selectedLevel;
      const stats = GaplessDB.getStatistics(selectedLvl);
      const gapWords = GaplessDB.getUserGapWords(selectedLvl);

      container.innerHTML = `
        ${stepsHeaderHtml}
        <div class="p-6 flex-1 flex flex-col justify-between fade-in">
          <div>
            <div class="p-5 rounded-3xl bg-gradient-to-br from-ocean-600 to-mint-600 text-white shadow-xl mb-5">
              <div class="text-xs uppercase tracking-wider opacity-85 font-bold mb-1">${i18n.step4Badge}</div>
              <h2 class="text-2xl font-extrabold mb-3">${i18n.step4Title}</h2>
              <div class="grid grid-cols-3 gap-2 text-center bg-black/15 p-3 rounded-2xl">
                <div>
                  <div class="text-xl font-extrabold">${selectedLvl}</div>
                  <div class="text-[10px] opacity-80">${i18n.statLevel}</div>
                </div>
                <div class="border-x border-white/20">
                  <div class="text-xl font-extrabold text-mint-200">${stats.known}</div>
                  <div class="text-[10px] opacity-80">${i18n.statKnown}</div>
                </div>
                <div>
                  <div class="text-xl font-extrabold text-amber-200">${stats.gaps}</div>
                  <div class="text-[10px] opacity-80">${i18n.statGaps}</div>
                </div>
              </div>
            </div>

            <div class="mb-5">
              <div class="flex items-center justify-between mb-2">
                <span class="text-xs font-bold uppercase tracking-wider text-slate-400">${i18n.firstDeckLabel}</span>
                <span class="text-xs text-ocean-500 font-bold">${i18n.wordsCount(gapWords.length)}</span>
              </div>
              <div class="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-3 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                ${gapWords.slice(0, 18).map(w => `
                  <span class="px-2.5 py-1 rounded-lg bg-gap-500/10 text-gap-600 dark:text-gap-400 text-xs font-semibold">
                    ${w.en} <span class="opacity-60 font-normal">— ${w.getTranslation(lang)}</span>
                  </span>
                `).join("")}
              </div>
            </div>

            <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3">
              <div class="text-sm font-bold">${i18n.saveProfileTitle}</div>
              <input id="onb-name-input" type="text" value="${AppState.data.userName}" placeholder="${i18n.namePlaceholder}" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-ocean-500" />
              <input id="onb-email-input" type="email" value="${AppState.data.userEmail}" placeholder="${i18n.emailPlaceholder}" class="w-full px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-sm outline-none focus:ring-2 focus:ring-ocean-500" />
              <button onclick="OnboardingModule.finishOnboarding()" class="w-full py-3.5 rounded-xl bg-ocean-600 hover:bg-ocean-500 text-white font-bold text-sm shadow-md transition">
                ${i18n.finishBtn}
              </button>
            </div>
          </div>
        </div>
      `;
    }
  }
};