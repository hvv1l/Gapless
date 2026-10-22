// ============================================================================
// ФАЙЛ: data/rules.js
// База грамматических правил и видео-фрагментов (YouTube таймкоды) по уровням
// ============================================================================

const GAPLESS_RULES_RAW = [
  // УРОВЕНЬ A0 - A1
  {
    id: "rule_a0_1",
    level: "A0",
    titleRu: "Глагол to be (am / is / are)",
    titleUk: "Дієслово to be (am / is / are)",
    formula: "I am | He/She/It is | We/You/They are",
    descRu: "В английском предложении всегда должен быть глагол. Когда мы говорим, кем кто-то является или где находится, используем am, is или are.",
    descUk: "В англійському реченні завжди має бути дієслово. Коли ми кажемо, ким хтось є або де знаходиться, використовуємо am, is або are.",
    examples: [
      { en: "I am a student.", ru: "Я студент.", uk: "Я студент." },
      { en: "She is very kind.", ru: "Она очень добрая.", uk: "Вона дуже добра." },
      { en: "They are at home.", ru: "Они дома.", uk: "Вони вдома." }
    ],
    quiz: {
      question: "My brother ___ in the office right now.",
      options: ["am", "is", "are"],
      correct: 1
    }
  },
  {
    id: "rule_a1_1",
    level: "A1",
    titleRu: "Present Simple: регулярные действия",
    titleUk: "Present Simple: регулярні дії",
    formula: "I/You/We/They + V1 | He/She/It + V-s (es)",
    descRu: "Используется для привычек, фактов и расписаний. Для местоимений he, she, it к глаголу добавляется окончание -s, а в вопросах и отрицаниях помогает does.",
    descUk: "Використовується для звичок, фактів і розкладів. Для займенників he, she, it до дієслова додається закінчення -s, а в питаннях та запереченнях допомагає does.",
    examples: [
      { en: "She works in an office.", ru: "Она работает в офисе.", uk: "Вона працює в офісі." },
      { en: "Do you drink coffee in the morning?", ru: "Ты пьешь кофе утром?", uk: "Ти п'єш каву вранці?" }
    ],
    quiz: {
      question: "She ___ fresh vegetables every day.",
      options: ["eat", "eats", "eating"],
      correct: 1
    }
  },
  {
    id: "rule_a1_2",
    level: "A1",
    titleRu: "There is / There are (наличие чего-то)",
    titleUk: "There is / There are (наявність чогось)",
    formula: "There is + ед. число | There are + мн. число",
    descRu: "Используй эту конструкцию, когда хочешь сказать, что где-то что-то есть. Переводить такие предложения лучше с конца (с места).",
    descUk: "Використовуй цю конструкцію, коли хочеш сказати, що десь щось є. Перекладати такі речення краще з кінця (з місця).",
    examples: [
      { en: "There is a hotel near the beach.", ru: "Рядом с пляжем есть отель.", uk: "Поруч із пляжем є готель." },
      { en: "There are two tickets on the table.", ru: "На столе два билета.", uk: "На столі два квитки." }
    ],
    quiz: {
      question: "___ many passengers at the airport today.",
      options: ["There is", "There are", "It is"],
      correct: 1
    }
  },

  // УРОВЕНЬ A2
  {
    id: "rule_a2_1",
    level: "A2",
    titleRu: "Past Simple vs Present Perfect",
    titleUk: "Past Simple проти Present Perfect",
    formula: "V2 / -ed (когда именно) vs have/has + V3 (результат/опыт)",
    descRu: "Если указано точное время в прошлом (yesterday, in 2020, two hours ago) — всегда ставь Past Simple. Если важен сам опыт или результат сейчас — Present Perfect.",
    descUk: "Якщо вказано точний час у минулому (yesterday, in 2020, two hours ago) — завжди став Past Simple. Якщо важливий сам досвід або результат зараз — Present Perfect.",
    examples: [
      { en: "Have you ever traveled abroad?", ru: "Ты когда-нибудь путешествовал за границу? (опыт)", uk: "Ти коли-небудь подорожував за кордон? (досвід)" },
      { en: "Our flight was delayed yesterday.", ru: "Наш рейс задержали вчера. (точный факт)", uk: "Наш рейс затримали вчора. (точний факт)" }
    ],
    quiz: {
      question: "I ___ a train ticket two hours ago.",
      options: ["have bought", "bought", "buy"],
      correct: 1
    }
  },
  {
    id: "rule_a2_2",
    level: "A2",
    titleRu: "Планы на будущее: be going to vs will",
    titleUk: "Плани на майбутнє: be going to проти will",
    formula: "am/is/are going to + V1 (план) | will + V1 (спонтанно)",
    descRu: "Используй 'going to', когда решение принято заранее (собираюсь что-то сделать). Используй 'will', когда решил прямо в момент разговора или делаешь прогноз.",
    descUk: "Використовуй 'going to', коли рішення прийнято заздалегідь (збираюся щось зробити). Використовуй 'will', коли вирішив прямо в момент розмови або робиш прогноз.",
    examples: [
      { en: "I am going to cook pasta tonight.", ru: "Я собираюсь приготовить пасту сегодня вечером.", uk: "Я збираюся приготувати пасту сьогодні ввечері." },
      { en: "Wait, I will help you with your luggage!", ru: "Подожди, я помогу тебе с багажом!", uk: "Зачекай, я допоможу тобі з багажем!" }
    ],
    quiz: {
      question: "Look at those dark clouds! It ___ rain soon.",
      options: ["is going to", "will be", "goes to"],
      correct: 0
    }
  },

  // УРОВЕНЬ B1
  {
    id: "rule_b1_1",
    level: "B1",
    titleRu: "Разница между Although и Despite",
    titleUk: "Різниця між Although та Despite",
    formula: "Although + Подлежащее + Глагол | Despite + Существительное / V-ing",
    descRu: "Оба слова значат «несмотря на», но после Although идет полноценное предложение (кто + что сделал), а после Despite — только существительное или глагол с -ing.",
    descUk: "Обидва слова означають «незважаючи на», але після Although йде повноцінне речення (хто + що зробив), а після Despite — лише іменник або дієслово з -ing.",
    examples: [
      { en: "Although it was late, we kept talking.", ru: "Хотя было поздно, мы продолжали говорить.", uk: "Хоча було пізно, ми продовжували говорити." },
      { en: "We went for a walk despite the rain.", ru: "Мы пошли гулять вопреки дождю.", uk: "Ми пішли гуляти попри дощ." }
    ],
    quiz: {
      question: "___ having a strict upbringing, she is very creative.",
      options: ["Although", "Despite", "However"],
      correct: 1
    }
  },
  {
    id: "rule_b1_2",
    level: "B1",
    titleRu: "Second Conditional (Нереальное настоящее)",
    titleUk: "Second Conditional (Нереальне теперішнє)",
    formula: "If + Past Simple (V2), ... would + V1",
    descRu: "Используется, когда мы воображаем ситуацию, которая сейчас нереальна или маловероятна («Если бы у меня было..., я бы сделал...»).",
    descUk: "Використовується, коли ми уявляємо ситуацію, яка зараз нереальна або малоймовірна («Якби у мене було..., я б зробив...»).",
    examples: [
      { en: "If I had more free time, I would travel around the world.", ru: "Если бы у меня было больше времени, я бы путешествовал по миру.", uk: "Якби у мене було більше часу, я б подорожував світом." }
    ],
    quiz: {
      question: "If I ___ the answer, I would tell you immediately.",
      options: ["know", "knew", "would know"],
      correct: 1
    }
  },

  // УРОВЕНЬ B2
  {
    id: "rule_b2_1",
    level: "B2",
    titleRu: "Модальные глаголы вероятности в прошлом",
    titleUk: "Модальні дієслова ймовірності в минулому",
    formula: "must have + V3 (100% да) | might have + V3 (возможно) | can't have + V3 (не может быть)",
    descRu: "Когда мы строим догадки о том, что уже произошло в прошлом, используем модальный глагол + have + третью форму глагола.",
    descUk: "Коли ми будуємо здогадки про те, що вже сталося в минулому, використовуємо модальне дієслово + have + третю форму дієслова.",
    examples: [
      { en: "He must have forgotten about our meeting.", ru: "Он, должно быть, забыл о нашей встрече.", uk: "Він, мабуть, забув про нашу зустріч." },
      { en: "She can't have said that!", ru: "Не может быть, чтобы она такое сказала!", uk: "Не може бути, щоб вона таке сказала!" }
    ],
    quiz: {
      question: "The streets are wet. It ___ rained last night.",
      options: ["must have", "should", "can't"],
      correct: 0
    }
  },
  {
    id: "rule_b2_2",
    level: "B2",
    titleRu: "Used to vs Be used to vs Get used to",
    titleUk: "Used to проти Be used to та Get used to",
    formula: "used to + V1 (бывало раньше) | be/get used to + V-ing (привык к чему-то)",
    descRu: "Не путай: 'used to do' — это старая привычка в прошлом. А 'be used to doing' или 'get used to doing' — это быть привыкшим / привыкать к чему-либо (после to идет -ing!).",
    descUk: "Не плутай: 'used to do' — це стара звичка в минулому. А 'be used to doing' або 'get used to doing' — це бути звиклим / звикати до чогось (після to йде -ing!).",
    examples: [
      { en: "I used to commute by train.", ru: "Раньше я ездил на работу на поезде.", uk: "Раніше я їздив на роботу поїздом." },
      { en: "I am still getting used to waking up early.", ru: "Я всё ещё привыкаю вставать рано.", uk: "Я все ще звикаю прокидатися рано." }
    ],
    quiz: {
      question: "She quickly got used to ___ in a big city.",
      options: ["live", "living", "lived"],
      correct: 1
    }
  },

  // УРОВЕНЬ C1
  {
    id: "rule_c1_1",
    level: "C1",
    titleRu: "Инверсия с отрицательными наречиями",
    titleUk: "Інверсія з заперечними прислівниками",
    formula: "Never / Seldom / Not only + Вспом. глагол + Подлежащее + Глагол",
    descRu: "Для придания речи выразительности на уровне C1 при вынесении слов Never, Rarely, Little, Not only в начало предложения используется обратный порядок слов (как в вопросе).",
    descUk: "Для надання мовленню виразності на рівні C1 при винесенні слів Never, Rarely, Little, Not only на початок речення використовується зворотний порядок слів (як у питанні).",
    examples: [
      { en: "Never have I seen such a picturesque village.", ru: "Никогда я не видел такой живописной деревни.", uk: "Ніколи я не бачив такого мальовничого села." },
      { en: "Little did he know what was waiting for him.", ru: "Мало же он подозревал, что его ждет.", uk: "Мало ж він підозрював, що на нього чекає." }
    ],
    quiz: {
      question: "Rarely ___ such a pragmatic approach to a problem.",
      options: ["we see", "do we see", "saw we"],
      correct: 1
    }
  }
];

// БАЗА ВИДЕО-ФРАГМЕНТОВ YOUTUBE С ТАЙМКОДАМИ
const GAPLESS_VIDEOS_RAW = [
  {
    id: "vid_a1_1",
    level: "A1",
    videoId: "M7lc1UVf-VE",
    start: 1,
    end: 5,
    titleRu: "Знакомство с платформой",
    titleUk: "Знайомство з платформою",
    transcript: "Hello everyone",
    hintRu: "Приветствие аудитории (2 слова)",
    hintUk: "Привітання аудиторії (2 слова)"
  },
  {
    id: "vid_a2_1",
    level: "A2",
    videoId: "arj7oStGLkU",
    start: 14,
    end: 19,
    titleRu: "Тим Урбан: Как работает прокрастинация (TED)",
    titleUk: "Тім Урбан: Як працює прокрастинація (TED)",
    transcript: "So in college I was a government major",
    hintRu: "О специальности в колледже (8 слов)",
    hintUk: "Про спеціальність у коледжі (8 слів)"
  },
  {
    id: "vid_b1_1",
    level: "B1",
    videoId: "arj7oStGLkU",
    start: 19,
    end: 24,
    titleRu: "Тим Урбан: Написание дипломных работ (TED)",
    titleUk: "Тім Урбан: Написання дипломних робіт (TED)",
    transcript: "which means I had to write a lot of papers",
    hintRu: "Что означает, что мне приходилось писать много работ (10 слов)",
    hintUk: "Що означає, що мені доводилося писати багато робіт (10 слів)"
  },
  {
    id: "vid_b2_1",
    level: "B2",
    videoId: "8S0FDjFBj8o",
    start: 13,
    end: 18,
    titleRu: "Искусство публичной речи (TED)",
    titleUk: "Мистецтво публічного мовлення (TED)",
    transcript: "The human voice is the instrument we all play",
    hintRu: "Человеческий голос — это инструмент, на котором мы все играем (9 слов)",
    hintUk: "Людський голос — це інструмент, на якому ми всі граємо (9 слів)"
  },
  {
    id: "vid_c1_1",
    level: "C1",
    videoId: "8S0FDjFBj8o",
    start: 18,
    end: 23,
    titleRu: "Сила звучания голоса (TED)",
    titleUk: "Сила звучання голосу (TED)",
    transcript: "It is the most powerful sound in the world",
    hintRu: "Это самый мощный звук в мире (9 слов)",
    hintUk: "Це найпотужніший звук у світі (9 слів)"
  }
];

const GaplessRulesDB = {
  rules: GAPLESS_RULES_RAW,
  videos: GAPLESS_VIDEOS_RAW,

  // Получить правила для уровня пользователя + соседних уровней
  getRulesForLevel(level = "B1") {
    const allowed = (window.GaplessDB && GaplessDB.getTargetAndNeighborLevels(level)) || [level, "B1"];
    const filtered = this.rules.filter(r => allowed.includes(r.level));
    return filtered.length > 0 ? filtered : this.rules;
  },

  // Получить ежедневную подборку правил (детерминированно на текущий день + возможность перемешать)
  getDailyRules(level = "B1", count = 2, offset = 0) {
    const pool = this.getRulesForLevel(level);
    const todaySeed = new Date().toISOString().slice(0, 10).split("-").reduce((a, b) => a + Number(b), 0) + offset;
    const selected = [];
    for (let i = 0; i < Math.min(count, pool.length); i++) {
      const idx = (todaySeed + i) % pool.length;
      selected.push(pool[idx]);
    }
    return selected;
  },

  // Получить видео-фрагменты под уровень пользователя
  getVideosForLevel(level = "B1") {
    const allowed = (window.GaplessDB && GaplessDB.getTargetAndNeighborLevels(level)) || [level, "B1"];
    const exact = this.videos.filter(v => v.level === level);
    const neighbors = this.videos.filter(v => allowed.includes(v.level) && v.level !== level);
    const combined = [...exact, ...neighbors];
    return combined.length > 0 ? combined : this.videos;
  }
};

window.GaplessRulesDB = GaplessRulesDB;
