// ============================================================================
// ФАЙЛ: js/db-service.js
// ООП-Классы для работы с базой слов, фильтрацией и памятью пользователя
// ============================================================================

/**
 * 1. КЛАСС ОТДЕЛЬНОГО СЛОВА
 */
class WordModel {
  constructor(rawWord, categoryId, categoryTitleRu, categoryTitleUk, icon, level) {
    this.id = rawWord.id;
    this.en = rawWord.en;
    this.ru = rawWord.ru;
    this.uk = rawWord.uk || rawWord.ru;
    this.tr = rawWord.tr || "";
    this.example = rawWord.ex || "";
    this.categoryId = categoryId;
    this.categoryTitleRu = categoryTitleRu;
    this.categoryTitleUk = categoryTitleUk;
    this.icon = icon;
    this.level = level;
  }

  // Получить перевод на языке пользователя ('ru' или 'uk')
  getTranslation(lang = "ru") {
    return lang === "uk" ? this.uk : this.ru;
  }

  // Получить название категории на языке пользователя
  getCategoryTitle(lang = "ru") {
    return lang === "uk" ? this.categoryTitleUk : this.categoryTitleRu;
  }

  // Встроенная озвучка слова
  speak() {
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(this.en);
      utterance.lang = "en-US";
      utterance.rate = 0.92;
      window.speechSynthesis.speak(utterance);
    }
  }
}

/**
 * 2. КЛАСС СМЫСЛОВОГО КЛАСТЕРА (Пачка: Категория + Конкретный уровень)
 */
class ClusterModel {
  constructor(category, level, wordModels) {
    this.clusterId = `${category.id}_${level}`;
    this.categoryId = category.id;
    this.titleRu = category.titleRu;
    this.titleUk = category.titleUk;
    this.icon = category.icon;
    this.level = level;
    this.words = wordModels; // Массив объектов WordModel
  }

  getTitle(lang = "ru") {
    return lang === "uk" ? this.titleUk : this.titleRu;
  }
}

/**
 * 3. ГЛАВНЫЙ КЛАСС БАЗЫ ДАННЫХ И ПАМЯТИ (Ядро Gapless)
 */
class GaplessDatabaseService {
  constructor(rawDb) {
    this.raw = rawDb;
    this.wordsMap = new Map(); // Быстрый поиск любого слова по его английскому написанию
    this.wordsById = new Map();
    this.clusters = [];
    this.userWordStatus = {}; // { 'mother': 'known' | 'gap' }
    this.storageKey = "gapless_user_vocab_v1";

    this._initModels();
    this._loadUserProgress();
  }

  // Превращаем сырые данные из файла vocabulary.js в умные классы
  _initModels() {
    this.raw.categories.forEach(cat => {
      Object.entries(cat.levels).forEach(([lvl, wordsArr]) => {
        const wordModels = wordsArr.map(w => {
          const model = new WordModel(w, cat.id, cat.titleRu, cat.titleUk, cat.icon, lvl);
          this.wordsMap.set(w.en.toLowerCase(), model);
          this.wordsById.set(w.id, model);
          return model;
        });

        const cluster = new ClusterModel(cat, lvl, wordModels);
        this.clusters.push(cluster);
      });
    });
  }

  // Загружаем сохраненный прогресс из памяти браузера/телефона (LocalStorage)
  _loadUserProgress() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) {
        this.userWordStatus = JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Не удалось прочитать память, создаем новую базу.");
    }
  }

  // Сохраняем каждое действие пользователя в память устройства
  _saveUserProgress() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.userWordStatus));
    } catch (e) {}
  }

  // Узнать статус слова ('known' - знаю, 'gap' - пробел/учить)
  getWordStatus(wordEn) {
    const key = wordEn.toLowerCase();
    return this.userWordStatus[key] || "gap";
  }

  // Переключить статус одного слова (Исключение 1-2 слов из пачки)
  toggleWordStatus(wordEn) {
    const key = wordEn.toLowerCase();
    const current = this.getWordStatus(key);
    this.userWordStatus[key] = current === "known" ? "gap" : "known";
    this._saveUserProgress();
    return this.userWordStatus[key];
  }

  // Установить конкретный статус слову (например, кнопка "⚡ Уже знаю на 100%" в карточках)
  setWordStatus(wordEn, status) {
    const key = wordEn.toLowerCase();
    this.userWordStatus[key] = status;
    this._saveUserProgress();
  }

  // Отметить всю пачку как "Знаю всё" (или вернуть на изучение)
  toggleClusterStatus(clusterId) {
    const cluster = this.clusters.find(c => c.clusterId === clusterId);
    if (!cluster) return false;

    const allKnown = cluster.words.every(w => this.getWordStatus(w.en) === "known");
    const newStatus = allKnown ? "gap" : "known";

    cluster.words.forEach(w => {
      this.userWordStatus[w.en.toLowerCase()] = newStatus;
    });
    this._saveUserProgress();
    return newStatus === "known";
  }

  // Получить соседние уровни (например, для B1 вернет ['A2', 'B1', 'B2'])
  getTargetAndNeighborLevels(selectedLevel) {
    return this.raw.neighborsMap[selectedLevel] || ["A2", "B1", "B2"];
  }

  // Запрос для ОНБОРДИНГА: выдать пачки по смысловым темам для выбранного уровня + соседних
  getClustersForCalibration(selectedLevel, categoryFilter = "all") {
    const allowedLevels = this.getTargetAndNeighborLevels(selectedLevel);
    return this.clusters.filter(c => {
      const levelMatch = allowedLevels.includes(c.level);
      const catMatch = categoryFilter === "all" || c.categoryId === categoryFilter;
      return levelMatch && catMatch;
    });
  }

  // Запрос для 15-МИНУТКИ и КАРТОЧЕК: выдать список всех слов-пробелов (Gaps)
  getUserGapWords(selectedLevel = null) {
    const clustersToScan = selectedLevel
      ? this.getClustersForCalibration(selectedLevel)
      : this.clusters;

    const gaps = [];
    clustersToScan.forEach(c => {
      c.words.forEach(w => {
        if (this.getWordStatus(w.en) === "gap") {
          gaps.push(w);
        }
      });
    });
    return gaps;
  }

  // Запрос для ЧАТА И СУБТИТРОВ ВИДЕО: найти слово в базе или создать новое на лету
  findOrCreateWord(rawWordString, fallbackTranslation = "новое слово из контекста") {
    const clean = rawWordString.replace(/[^a-zA-Z'-]/g, "").toLowerCase();
    if (!clean) return null;

    if (this.wordsMap.has(clean)) {
      return this.wordsMap.get(clean);
    }

    // Если слова еще не было в стартовой базе — создаем объект WordModel на лету
    const customWord = new WordModel(
      { id: `custom_${clean}`, en: clean, ru: fallbackTranslation, uk: fallbackTranslation, tr: "", ex: "" },
      "custom", "Из видео и чата", "З відео та чату", "💬", "B1"
    );
    this.wordsMap.set(clean, customWord);
    return customWord;
  }

  // Подсчет полной статистики для экранов прогресса
  getStatistics(selectedLevel = null) {
    const list = selectedLevel ? this.getClustersForCalibration(selectedLevel) : this.clusters;
    let known = 0;
    let gaps = 0;

    list.forEach(c => {
      c.words.forEach(w => {
        if (this.getWordStatus(w.en) === "known") known++;
        else gaps++;
      });
    });

    return { known, gaps, total: known + gaps };
  }
}

// Создаем глобальный экземпляр базы данных, готовый к работе во всех модулях
const GaplessDB = new GaplessDatabaseService(GAPLESS_RAW_DB);