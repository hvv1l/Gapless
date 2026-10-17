// ============================================================================
// ФАЙЛ: js/db-service.js
// ООП-Классы базы слов с облачной синхронизацией аккаунта Supabase
// ============================================================================

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

  getTranslation(lang = "ru") {
    return lang === "uk" ? this.uk : this.ru;
  }

  getCategoryTitle(lang = "ru") {
    return lang === "uk" ? this.categoryTitleUk : this.categoryTitleRu;
  }

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

class ClusterModel {
  constructor(category, level, wordModels) {
    this.clusterId = `${category.id}_${level}`;
    this.categoryId = category.id;
    this.titleRu = category.titleRu;
    this.titleUk = category.titleUk;
    this.icon = category.icon;
    this.level = level;
    this.words = wordModels;
  }

  getTitle(lang = "ru") {
    return lang === "uk" ? this.titleUk : this.titleRu;
  }
}

class GaplessDatabaseService {
  constructor(rawDb) {
    this.raw = rawDb;
    this.wordsMap = new Map();
    this.wordsById = new Map();
    this.clusters = [];
    this.userWordStatus = {};
    this.storageKey = "gapless_user_vocab_v1";

    this._initModels();
    this._loadLocalBackup();
  }

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

  _loadLocalBackup() {
    try {
      const saved = localStorage.getItem(this.storageKey);
      if (saved) this.userWordStatus = JSON.parse(saved);
    } catch (e) {}
  }

  // Загрузить словарь напрямую из профиля аккаунта
  setCloudWordStatus(cloudStatusObj) {
    if (cloudStatusObj && typeof cloudStatusObj === "object") {
      this.userWordStatus = cloudStatusObj;
      try {
        localStorage.setItem(this.storageKey, JSON.stringify(this.userWordStatus));
      } catch (e) {}
    }
  }

  // Очистить локальный кэш при выходе из аккаунта
  clearLocalStatus() {
    this.userWordStatus = {};
    try {
      localStorage.removeItem(this.storageKey);
    } catch (e) {}
  }

  // Сохраняем и локально, и сразу в облачный аккаунт Supabase
  _saveUserProgress() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.userWordStatus));
    } catch (e) {}

    if (window.AuthModule && window.AuthModule.saveProgressToCloud) {
      window.AuthModule.saveProgressToCloud();
    }
  }

  getWordStatus(wordEn) {
    const key = wordEn.toLowerCase();
    return this.userWordStatus[key] || "gap";
  }

  toggleWordStatus(wordEn) {
    const key = wordEn.toLowerCase();
    const current = this.getWordStatus(key);
    this.userWordStatus[key] = current === "known" ? "gap" : "known";
    this._saveUserProgress();
    return this.userWordStatus[key];
  }

  setWordStatus(wordEn, status) {
    const key = wordEn.toLowerCase();
    this.userWordStatus[key] = status;
    this._saveUserProgress();
  }

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

  getTargetAndNeighborLevels(selectedLevel) {
    return this.raw.neighborsMap[selectedLevel] || ["A2", "B1", "B2"];
  }

  getClustersForCalibration(selectedLevel, categoryFilter = "all") {
    const allowedLevels = this.getTargetAndNeighborLevels(selectedLevel);
    return this.clusters.filter(c => {
      const levelMatch = allowedLevels.includes(c.level);
      const catMatch = categoryFilter === "all" || c.categoryId === categoryFilter;
      return levelMatch && catMatch;
    });
  }

  getUserGapWords(selectedLevel = null) {
    const targetLvl = selectedLevel || (window.AppState && AppState.data.selectedLevel) || "B1";
    const clustersToScan = this.getClustersForCalibration(targetLvl);

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

  findOrCreateWord(rawWordString, fallbackTranslation = "слово из контекста") {
    const clean = rawWordString.replace(/[^a-zA-Z'-]/g, "").toLowerCase();
    if (!clean) return null;

    if (this.wordsMap.has(clean)) {
      return this.wordsMap.get(clean);
    }

    const customWord = new WordModel(
      { id: `custom_${clean}`, en: clean, ru: fallbackTranslation, uk: fallbackTranslation, tr: "", ex: "" },
      "custom", "Из контекста", "З контексту", "", "B1"
    );
    this.wordsMap.set(clean, customWord);
    return customWord;
  }

  // Единый подсчет статистики (чтобы в «Сегодня», «Упражнениях» и «Профиле» всегда были одинаковые цифры)
  getStatistics(selectedLevel = null) {
    const targetLvl = selectedLevel || (window.AppState && AppState.data.selectedLevel) || "B1";
    const list = this.getClustersForCalibration(targetLvl);
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

const GaplessDB = new GaplessDatabaseService(GAPLESS_RAW_DB);
