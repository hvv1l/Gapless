// ============================================================================
// ФАЙЛ: data/rules.js
// База: 50 грамматических правил + 50 видео-фрагментов YouTube по таймкодам (A0 - C1)
// ============================================================================

const GAPLESS_RULES_RAW = [
  // ======================== УРОВЕНЬ A0 (1 - 8) ========================
  {
    id: "r_1", level: "A0",
    titleRu: "Глагол to be в утверждениях (am / is / are)",
    titleUk: "Дієслово to be у ствердженнях (am / is / are)",
    formula: "I am | He/She/It is | We/You/They are",
    descRu: "В английском предложении всегда должен быть глагол. Когда мы говорим, кто мы, какие мы или где находимся, используем am, is или are.",
    descUk: "В англійському реченні завжди має бути дієслово. Коли ми кажемо, хто ми, які ми або де знаходимося, використовуємо am, is або are.",
    examples: [
      { en: "I am happy today.", ru: "Я счастлив сегодня.", uk: "Я щасливий сьогодні." },
      { en: "She is a doctor.", ru: "Она врач.", uk: "Вона лікар." }
    ],
    quiz: { question: "My father ___ in the office.", options: ["am", "is", "are"], correct: 1 }
  },
  {
    id: "r_2", level: "A0",
    titleRu: "Отрицание с глаголом to be",
    titleUk: "Заперечення з дієсловом to be",
    formula: "I am not | is not (isn't) | are not (aren't)",
    descRu: "Чтобы сделать предложение отрицательным с глаголом to be, просто поставь частицу not сразу после am, is или are.",
    descUk: "Щоб зробити речення заперечним із дієсловом to be, просто постав частку not одразу після am, is або are.",
    examples: [
      { en: "I am not tired.", ru: "Я не устал.", uk: "Я не втомився." },
      { en: "They aren't at home.", ru: "Их нет дома.", uk: "Їх немає вдома." }
    ],
    quiz: { question: "This soup ___ spicy.", options: ["am not", "isn't", "aren't"], correct: 1 }
  },
  {
    id: "r_3", level: "A0",
    titleRu: "Вопросы с глаголом to be",
    titleUk: "Питання з дієсловом to be",
    formula: "Am I...? | Is he/she/it...? | Are we/you/they...?",
    descRu: "Для вопроса вынеси глагол Am, Is или Are на первое место перед подлежащим.",
    descUk: "Для питання винеси дієслово Am, Is або Are на перше місце перед підметом.",
    examples: [
      { en: "Are you ready?", ru: "Ты готов?", uk: "Ти готовий?" },
      { en: "Is your hotel near the beach?", ru: "Твой отель рядом с пляжем?", uk: "Твій готель поруч із пляжем?" }
    ],
    quiz: { question: "___ your parents in another city?", options: ["Am", "Is", "Are"], correct: 2 }
  },
  {
    id: "r_4", level: "A0",
    titleRu: "Притяжательные местоимения (Чей?)",
    titleUk: "Присвійні займенники (Чий?)",
    formula: "I → my | you → your | he → his | she → her | we → our | they → their",
    descRu: "Эти слова всегда ставятся перед существительным и показывают, кому принадлежит предмет.",
    descUk: "Ці слова завжди ставляться перед іменником і показують, кому належить предмет.",
    examples: [
      { en: "This is my brother.", ru: "Это мой брат.", uk: "Це мій брат." },
      { en: "Her husband is a doctor.", ru: "Её муж — врач.", uk: "Її чоловік — лікар." }
    ],
    quiz: { question: "We love ___ big family.", options: ["we", "our", "their"], correct: 1 }
  },
  {
    id: "r_5", level: "A0",
    titleRu: "Неопределенный артикль a / an",
    titleUk: "Неозначений артикль a / an",
    formula: "a + согласный звук | an + гласный звук (a, e, i, o, u)",
    descRu: "Ставится перед исчисляемыми существительными в единственном числе. Если слово начинается с гласного звука, используем an.",
    descUk: "Ставиться перед злічуваними іменниками в однині. Якщо слово починається з голосного звука, використовуємо an.",
    examples: [
      { en: "I bought a ticket.", ru: "Я купил билет.", uk: "Я купив квиток." },
      { en: "She ate an apple.", ru: "Она съела яблоко.", uk: "Вона з'їла яблуко." }
    ],
    quiz: { question: "He works in ___ office.", options: ["a", "an", "—"], correct: 1 }
  },
  {
    id: "r_6", level: "A0",
    titleRu: "Множественное число существительных",
    titleUk: "Множина іменників",
    formula: "Noun + -s | после -s, -sh, -ch, -x, -o → + -es",
    descRu: "К большинству слов просто добавляется -s. Если слово заканчивается на шипящий звук или -x, добавляется -es.",
    descUk: "До більшості слів просто додається -s. Якщо слово закінчується на шиплячий звук або -x, додається -es.",
    examples: [
      { en: "Two sisters and three brothers.", ru: "Две сестры и три брата.", uk: "Дві сестри і три брати." },
      { en: "Two boxes of apples.", ru: "Две коробки яблок.", uk: "Дві коробки яблук." }
    ],
    quiz: { question: "Eat more fresh ___.", options: ["vegetable", "vegetables", "vegetablies"], correct: 1 }
  },
  {
    id: "r_7", level: "A0",
    titleRu: "Исключения множественного числа",
    titleUk: "Винятки множини іменників",
    formula: "child → children | man → men | woman → women | person → people",
    descRu: "Некоторые базовые слова образуют множественное число без окончания -s. Их нужно запомнить.",
    descUk: "Деякі базові слова утворюють множину без закінчення -s. Їх потрібно запам'ятати.",
    examples: [
      { en: "Every child likes sweets.", ru: "Каждый ребенок любит сладости.", uk: "Кожна дитина любить солодощі." },
      { en: "Three children are playing.", ru: "Трое детей играют.", uk: "Троє дітей граються." }
    ],
    quiz: { question: "There are many ___ in the street.", options: ["mans", "people", "childs"], correct: 1 }
  },
  {
    id: "r_8", level: "A0",
    titleRu: "Указательные местоимения: this, that, these, those",
    titleUk: "Вказівні займенники: this, that, these, those",
    formula: "Рядом: this (1) / these (много) | Далеко: that (1) / those (много)",
    descRu: "Используй this и these для предметов, которые находятся близко, а that и those — для тех, что далеко.",
    descUk: "Використовуй this і these для предметів, що знаходяться близько, а that і those — для тих, що далеко.",
    examples: [
      { en: "This red apple is sweet.", ru: "Это красное яблоко сладкое.", uk: "Це червоне яблуко солодке." },
      { en: "Those mountains are far away.", ru: "Те горы далеко.", uk: "Ті гори далеко." }
    ],
    quiz: { question: "___ bananas on my plate are delicious.", options: ["This", "These", "That"], correct: 1 }
  },

  // ======================== УРОВЕНЬ A1 (9 - 17) ========================
  {
    id: "r_9", level: "A1",
    titleRu: "Present Simple: утверждения",
    titleUk: "Present Simple: ствердження",
    formula: "I/You/We/They + V1 | He/She/It + V-s (es)",
    descRu: "Используется для регулярных действий, привычек и фактов. Для he, she, it к глаголу всегда добавляется окончание -s.",
    descUk: "Використовується для регулярних дій, звичок і фактів. Для he, she, it до дієслова завжди додається закінчення -s.",
    examples: [
      { en: "I drink coffee with milk.", ru: "Я пью кофе с молоком.", uk: "Я п'ю каву з молоком." },
      { en: "My brother likes football.", ru: "Мой брат любит футбол.", uk: "Мій брат любить футбол." }
    ],
    quiz: { question: "He ___ his wife very much.", options: ["love", "loves", "loving"], correct: 1 }
  },
  {
    id: "r_10", level: "A1",
    titleRu: "Present Simple: отрицания (don't / doesn't)",
    titleUk: "Present Simple: заперечення (don't / doesn't)",
    formula: "I/You/We/They don't + V1 | He/She/It doesn't + V1",
    descRu: "В отрицании для he/she/it используется doesn't, при этом у самого глагола окончание -s исчезает!",
    descUk: "У запереченні для he/she/it використовується doesn't, при цьому у самого дієслова закінчення -s зникає!",
    examples: [
      { en: "I don't like bitter chocolate.", ru: "Я не люблю горький шоколад.", uk: "Я не люблю гіркий шоколад." },
      { en: "She doesn't work on Sundays.", ru: "Она не работает по воскресеньям.", uk: "Вона не працює щонеділі." }
    ],
    quiz: { question: "He ___ drink milk in the evening.", options: ["don't", "doesn't", "isn't"], correct: 1 }
  },
  {
    id: "r_11", level: "A1",
    titleRu: "Present Simple: вопросы (Do / Does)",
    titleUk: "Present Simple: питання (Do / Does)",
    formula: "Do + I/you/we/they + V1? | Does + he/she/it + V1?",
    descRu: "В вопросах на первое место выходит вспомогательный глагол Do или Does, а основной глагол остается в первой форме.",
    descUk: "У питаннях на перше місце виходить допоміжне дієслово Do або Does, а основне дієслово залишається в першій формі.",
    examples: [
      { en: "Do you have any siblings?", ru: "У тебя есть братья или сестры?", uk: "У тебе є брати чи сестри?" },
      { en: "Does she live near here?", ru: "Она живет поблизости?", uk: "Вона живе поблизу?" }
    ],
    quiz: { question: "___ your father work in an office?", options: ["Do", "Does", "Is"], correct: 1 }
  },
  {
    id: "r_12", level: "A1",
    titleRu: "Конструкция There is / There are",
    titleUk: "Конструкція There is / There are",
    formula: "There is + ед. число | There are + мн. число",
    descRu: "Описывает наличие чего-то в определенном месте («Где-то есть что-то»).",
    descUk: "Описує наявність чогось у певному місці («Десь є щось»).",
    examples: [
      { en: "There is a waiter near our table.", ru: "Рядом с нашим столиком есть официант.", uk: "Поруч із нашим столиком є офіціант." },
      { en: "There are many hotels in this street.", ru: "На этой улице много отелей.", uk: "На цій вулиці багато готелів." }
    ],
    quiz: { question: "___ fresh bread on the table.", options: ["There is", "There are", "They are"], correct: 0 }
  },
  {
    id: "r_13", level: "A1",
    titleRu: "Модальный глагол Can (умение и возможность)",
    titleUk: "Модальне дієслово Can (вміння та можливість)",
    formula: "Subject + can / can't + V1 (без частицы to)",
    descRu: "Глагол can не меняется по лицам (нет окончания -s), а следующий за ним глагол всегда идет без частицы to.",
    descUk: "Дієслово can не змінюється за особами (немає закінчення -s), а наступне за ним дієслово завжди йде без частки to.",
    examples: [
      { en: "Can I have a glass of water?", ru: "Могу я попросить стакан воды?", uk: "Чи можу я попросити склянку води?" },
      { en: "She can speak English well.", ru: "Она умеет хорошо говорить по-английски.", uk: "Вона вміє добре розмовляти англійською." }
    ],
    quiz: { question: "Can you ___ this pasta recipe?", options: ["to share", "share", "shares"], correct: 1 }
  },
  {
    id: "r_14", level: "A1",
    titleRu: "Present Continuous: прямо сейчас",
    titleUk: "Present Continuous: просто зараз",
    formula: "am / is / are + V-ing",
    descRu: "Используй эту форму, когда действие происходит прямо в момент речи (now, right now, at the moment).",
    descUk: "Використовуй цю форму, коли дія відбувається просто в момент мовлення (now, right now, at the moment).",
    examples: [
      { en: "We are having dinner right now.", ru: "Мы сейчас ужинаем.", uk: "Ми зараз вечеряємо." },
      { en: "She is waiting for a bus.", ru: "Она ждет автобус.", uk: "Вона чекає на автобус." }
    ],
    quiz: { question: "Listen! Someone ___ the piano.", options: ["plays", "is playing", "playing"], correct: 1 }
  },
  {
    id: "r_15", level: "A1",
    titleRu: "Предлоги времени: at, on, in",
    titleUk: "Прийменники часу: at, on, in",
    formula: "at + часы/ночь | on + дни недели/даты | in + месяцы/годы/части дня",
    descRu: "Точное время по часам — at (at 7 PM), конкретный день или дата — on (on Monday), длинный период — in (in October, in the morning).",
    descUk: "Точний час за годинником — at (at 7 PM), конкретний день або дата — on (on Monday), довгий період — in (in October, in the morning).",
    examples: [
      { en: "The train leaves at 8 o'clock.", ru: "Поезд отправляется в 8 часов.", uk: "Поїзд вирушає о 8 годині." },
      { en: "I don't work on Saturdays.", ru: "Я не работаю по субботам.", uk: "Я не працюю щосуботи." }
    ],
    quiz: { question: "Our flight is ___ Friday morning.", options: ["at", "on", "in"], correct: 1 }
  },
  {
    id: "r_16", level: "A1",
    titleRu: "Предлоги места: in, on, at",
    titleUk: "Прийменники місця: in, on, at",
    formula: "in (внутри) | on (на поверхности) | at (в точке / локации)",
    descRu: "In — внутри комнаты/города/страны; on — на поверхности стола/стены/этажа; at — в конкретной точке или учреждении (at the airport, at home, at work).",
    descUk: "In — всередині кімнати/міста/країни; on — на поверхні столу/стіни/поверху; at — у конкретній точці або закладі (at the airport, at home, at work).",
    examples: [
      { en: "We arrived at the airport early.", ru: "Мы прибыли в аэропорт рано.", uk: "Ми прибули в аеропорт рано." },
      { en: "Put the cutlery on the table.", ru: "Положи приборы на стол.", uk: "Поклади прибори на стіл." }
    ],
    quiz: { question: "My parents live ___ another city.", options: ["at", "on", "in"], correct: 2 }
  },
  {
    id: "r_17", level: "A1",
    titleRu: "Some и Any",
    titleUk: "Some та Any",
    formula: "some → в утверждениях и вежливых просьбах | any → в отрицаниях и вопросах",
    descRu: "Оба слова означают «несколько / немного». Some ставится в плюсе, а any — в минусе и обычных вопросах.",
    descUk: "Обидва слова означають «кілька / трохи». Some ставиться у плюсі, а any — у мінусі та звичайних питаннях.",
    examples: [
      { en: "I bought some fresh apples.", ru: "Я купил немного свежих яблок.", uk: "Я купив трохи свіжих яблук." },
      { en: "Do you have any siblings?", ru: "У тебя есть братья или сестры?", uk: "У тебе є брати чи сестри?" }
    ],
    quiz: { question: "There isn't ___ milk left in the fridge.", options: ["some", "any", "a"], correct: 1 }
  },

  // ======================== УРОВЕНЬ A2 (18 - 26) ========================
  {
    id: "r_18", level: "A2",
    titleRu: "Much, Many и A lot of (Много)",
    titleUk: "Much, Many та A lot of (Багато)",
    formula: "many + исчисляемые (мн.ч.) | much + неисчисляемые | a lot of + любые",
    descRu: "Many используется с тем, что можно посчитать поштучно (many friends), much — с жидкостями, временем, деньгами (much water, much time).",
    descUk: "Many використовується з тим, що можна порахувати поштучно (many friends), much — з рідинами, часом, грошима (much water, much time).",
    examples: [
      { en: "We don't have much time before departure.", ru: "У нас мало времени до вылета.", uk: "У нас мало часу до вильоту." },
      { en: "She has many distant relatives.", ru: "У неё много дальних родственников.", uk: "У неї багато далеких родичів." }
    ],
    quiz: { question: "How ___ luggage do you have?", options: ["many", "much", "few"], correct: 1 }
  },
  {
    id: "r_19", level: "A2",
    titleRu: "A few против A little (Немного)",
    titleUk: "A few проти A little (Трохи / Кілька)",
    formula: "a few + исчисляемые (мн.ч.) | a little + неисчисляемые (ед.ч.)",
    descRu: "A few означает «несколько штук» (a few minutes), а a little — «немного» для неисчисляемых понятий (a little water, a little salt).",
    descUk: "A few означає «кілька штук» (a few minutes), а a little — «трохи» для незлічуваних понять (a little water, a little salt).",
    examples: [
      { en: "I need a few ingredients for this salad.", ru: "Мне нужно несколько ингредиентов для салата.", uk: "Мені потрібно кілька інгредієнтів для салату." },
      { en: "Add a little salt to the soup.", ru: "Добавь немного соли в суп.", uk: "Додай трохи солі в суп." }
    ],
    quiz: { question: "I only invited ___ close friends.", options: ["a little", "a few", "much"], correct: 1 }
  },
  {
    id: "r_20", level: "A2",
    titleRu: "Past Simple: завершенные действия в прошлом",
    titleUk: "Past Simple: завершені дії в минулому",
    formula: "Правильные глаголы: V + -ed | Неправильные: 2-я форма (V2)",
    descRu: "Используется, когда действие произошло в прошлом и время уже закончилось (yesterday, last week, in 2022, two days ago).",
    descUk: "Використовується, коли дія відбулася в минулому і час уже закінчився (yesterday, last week, in 2022, two days ago).",
    examples: [
      { en: "I spent my childhood by the sea.", ru: "Я провел детство у моря.", uk: "Я провів дитинство біля моря." },
      { en: "We booked cheap accommodation online.", ru: "Мы забронировали жилье онлайн.", uk: "Ми забронювали житло онлайн." }
    ],
    quiz: { question: "Suddenly, the lights ___ out.", options: ["go", "went", "gone"], correct: 1 }
  },
  {
    id: "r_21", level: "A2",
    titleRu: "Отрицания и вопросы в Past Simple (did / didn't)",
    titleUk: "Заперечення та питання в Past Simple (did / didn't)",
    formula: "didn't + V1 | Did + подлежащее + V1?",
    descRu: "Как только в предложении появляется did или didn't, основной глагол возвращается в первую базовую форму (V1)!",
    descUk: "Як тільки в реченні з'являється did або didn't, основне дієслово повертається у першу базову форму (V1)!",
    examples: [
      { en: "We didn't miss the bus.", ru: "Мы не опоздали на автобус.", uk: "Ми не запізнилися на автобус." },
      { en: "Did you buy a gift for your nephew?", ru: "Ты купил подарок племяннику?", uk: "Ти купив подарунок племіннику?" }
    ],
    quiz: { question: "Why ___ you call me yesterday?", options: ["weren't", "didn't", "don't"], correct: 1 }
  },
  {
    id: "r_22", level: "A2",
    titleRu: "Сравнительная степень прилагательных",
    titleUk: "Вищий ступінь порівняння прикметників",
    formula: "Короткие: adj + -er than | Длинные: more + adj + than",
    descRu: "Короткие слова получают окончание -er (faster, cheaper), а длинные — слово more перед собой (more delicious, more confident). Исключения: good → better, bad → worse.",
    descUk: "Короткі слова отримують закінчення -er (faster, cheaper), а довгі — слово more перед собою (more delicious, more confident). Винятки: good → better, bad → worse.",
    examples: [
      { en: "The younger generation learns faster.", ru: "Младшее поколение учится быстрее.", uk: "Молодше покоління навчається швидше." },
      { en: "This dish is more delicious than that one.", ru: "Это блюдо вкуснее того.", uk: "Ця страва смачніша за ту." }
    ],
    quiz: { question: "Travelling by train is ___ than flying.", options: ["cheaper", "more cheap", "cheapest"], correct: 0 }
  },
  {
    id: "r_23", level: "A2",
    titleRu: "Превосходная степень (Самый лучший)",
    titleUk: "Найвищий ступінь порівняння (Найкращий)",
    formula: "the + adj-est | the most + длинное прилагательное",
    descRu: "Всегда ставь артикль the! Исключения: good → the best, bad → the worst, far → the farthest.",
    descUk: "Завжди став артикль the! Винятки: good → the best, bad → the worst, far → the farthest.",
    examples: [
      { en: "He is my best friend.", ru: "Он мой лучший друг.", uk: "Він мій найкращий друг." },
      { en: "This is the most picturesque village in the region.", ru: "Это самая живописная деревня в регионе.", uk: "Це наймальовничіше село в регіоні." }
    ],
    quiz: { question: "What is ___ airport in the world?", options: ["bigger", "the biggest", "the most big"], correct: 1 }
  },
  {
    id: "r_24", level: "A2",
    titleRu: "Будущее время: be going to против will",
    titleUk: "Майбутній час: be going to проти will",
    formula: "am/is/are going to + V1 (план) | will + V1 (спонтанное решение / прогноз)",
    descRu: "Going to используется для заранее продуманных планов, а will — для решений, принятых в секунду разговора, обещаний и предположений со словом probably.",
    descUk: "Going to використовується для заздалегідь продуманих планів, а will — для рішень, прийнятих у секунду розмови, обіцянок і припущень зі словом probably.",
    examples: [
      { en: "It will probably rain tomorrow.", ru: "Завтра, вероятно, пойдет дождь.", uk: "Завтра, ймовірно, піде дощ." },
      { en: "We are going to visit our in-laws tonight.", ru: "Мы собираемся навестить родственников сегодня вечером.", uk: "Ми збираємося провідати родичів сьогодні ввечері." }
    ],
    quiz: { question: "Hurry up, otherwise we ___ miss the bus!", options: ["will", "going to", "are"], correct: 0 }
  },
  {
    id: "r_25", level: "A2",
    titleRu: "Past Continuous: длительный процесс в прошлом",
    titleUk: "Past Continuous: тривалий процес у минулому",
    formula: "was / were + V-ing",
    descRu: "Показывает действие, которое длилось в определенный момент в прошлом или было прервано другим коротким действием в Past Simple.",
    descUk: "Показує дію, яка тривала в певний момент у минулому або була перервана іншою короткою дією в Past Simple.",
    examples: [
      { en: "We were talking when the lights went out.", ru: "Мы разговаривали, когда погас свет.", uk: "Ми розмовляли, коли згасло світло." }
    ],
    quiz: { question: "What ___ you doing at 9 PM yesterday?", options: ["was", "were", "did"], correct: 1 }
  },
  {
    id: "r_26", level: "A2",
    titleRu: "Present Perfect для жизненного опыта (ever / never)",
    titleUk: "Present Perfect для життєвого досвіду (ever / never)",
    formula: "have / has + V3 (ed)",
    descRu: "Когда мы спрашиваем или рассказываем о жизненном опыте без указания точной даты («Когда-либо делал...», «Никогда не пробовал...»), используем Present Perfect.",
    descUk: "Коли ми запитуємо або розповідаємо про життєвий досвід без зазначення точної дати («Коли-небудь робив...», «Ніколи не пробував...»), використовуємо Present Perfect.",
    examples: [
      { en: "Have you ever traveled abroad?", ru: "Ты когда-нибудь путешествовал за границу?", uk: "Ти коли-небудь подорожував за кордон?" },
      { en: "I have never tried Mexican cuisine.", ru: "Я никогда не пробовал мексиканскую кухню.", uk: "Я ніколи не куштував мексиканську кухню." }
    ],
    quiz: { question: "She ___ never been to Scotland.", options: ["have", "has", "was"], correct: 1 }
  },

  // ======================== УРОВЕНЬ B1 (27 - 35) ========================
  {
    id: "r_27", level: "B1",
    titleRu: "Present Perfect против Past Simple",
    titleUk: "Present Perfect проти Past Simple",
    formula: "have/has + V3 (связь с настоящим) vs V2 (точное время в прошлом)",
    descRu: "Если есть маркер завершенного времени (yesterday, last year, 2 hours ago, when I was a child) — строго Past Simple. Если важен результат сейчас (already, just, yet) — Present Perfect.",
    descUk: "Якщо є маркер завершеного часу (yesterday, last year, 2 hours ago, when I was a child) — суворо Past Simple. Якщо важливий результат зараз (already, just, yet) — Present Perfect.",
    examples: [
      { en: "This bread has gone stale.", ru: "Этот хлеб зачерствел (результат сейчас).", uk: "Цей хліб зачерствів (результат зараз)." },
      { en: "Our flight was delayed by two hours yesterday.", ru: "Вчера наш рейс задержали на два часа.", uk: "Учора наш рейс затримали на дві години." }
    ],
    quiz: { question: "I ___ a detailed itinerary for Rome last night.", options: ["have planned", "planned", "plan"], correct: 1 }
  },
  {
    id: "r_28", level: "B1",
    titleRu: "For и Since в Present Perfect",
    titleUk: "For та Since у Present Perfect",
    formula: "for + период (for 3 hours / 5 years) | since + точка старта (since Monday / 2020)",
    descRu: "For отвечает на вопрос «как долго длится?», а since — «с какого момента началось?».",
    descUk: "For відповідає на питання «як довго триває?», а since — «з якого моменту почалося?».",
    examples: [
      { en: "We have lived here for ten years.", ru: "Мы живем здесь уже десять лет.", uk: "Ми живемо тут уже десять років." },
      { en: "I haven't seen him since childhood.", ru: "Я не видел его с детства.", uk: "Я не бачив його з дитинства." }
    ],
    quiz: { question: "She has worked here ___ 2022.", options: ["for", "since", "from"], correct: 1 }
  },
  {
    id: "r_29", level: "B1",
    titleRu: "First Conditional (Реальное условие в будущем)",
    titleUk: "First Conditional (Реальна умова в майбутньому)",
    formula: "If + Present Simple, ... will + V1",
    descRu: "Главное правило английского: в части предложения после слова If (или when, as soon as, unless) никогда не ставится will! Используем Present Simple.",
    descUk: "Головне правило англійської: у частині речення після слова If (або when, as soon as, unless) ніколи не ставиться will! Використовуємо Present Simple.",
    examples: [
      { en: "If we hurry up, we won't miss the train.", ru: "Если мы поторопимся, мы не опоздаем на поезд.", uk: "Якщо ми поквапимося, ми не запізнимося на поїзд." }
    ],
    quiz: { question: "If it ___ tomorrow, we will stay at the hotel.", options: ["will rain", "rains", "rained"], correct: 1 }
  },
  {
    id: "r_30", level: "B1",
    titleRu: "Second Conditional (Воображаемая ситуация сейчас)",
    titleUk: "Second Conditional (Уявна ситуація зараз)",
    formula: "If + Past Simple (V2 / were), ... would + V1",
    descRu: "Используется для гипотетических ситуаций в настоящем или будущем («Если бы сейчас было так, я бы сделал...»). С глаголом to be принято использовать форму were для всех лиц (If I were you).",
    descUk: "Використовується для гіпотетичних ситуацій у теперішньому чи майбутньому («Якби зараз було так, я б зробив...»). Із дієсловом to be заведено використовувати форму were для всіх осіб (If I were you).",
    examples: [
      { en: "If I were you, I would book accommodation in advance.", ru: "На твоем месте я бы забронировал жилье заранее.", uk: "На твоєму місці я б забронював житло заздалегідь." }
    ],
    quiz: { question: "If I ___ more time, I would learn Italian cuisine.", options: ["have", "had", "would have"], correct: 1 }
  },
  {
    id: "r_31", level: "B1",
    titleRu: "Модальные глаголы долга: must, have to, should",
    titleUk: "Модальні дієслова обов'язку: must, have to, should",
    formula: "must (строгий закон/внутренний долг) | don't have to (нет необходимости) | should (совет)",
    descRu: "Внимание на отрицания: mustn't — это строгий запрет («нельзя!»), а don't have to — «не обязательно, нет нужды».",
    descUk: "Увага на заперечення: mustn't — це сувора заборона («не можна!»), а don't have to — «не обов'язково, немає потреби».",
    examples: [
      { en: "Every passenger must wear a seatbelt.", ru: "Каждый пассажир обязан пристегнуть ремень.", uk: "Кожен пасажир зобов'язаний пристебнути ремінь." },
      { en: "You don't have to hurry, we have plenty of time.", ru: "Тебе не обязательно спешить, у нас много времени.", uk: "Тобі не обов'язково поспішати, у нас багато часу." }
    ],
    quiz: { question: "It's Sunday tomorrow, so I ___ wake up early.", options: ["mustn't", "don't have to", "shouldn't to"], correct: 1 }
  },
  {
    id: "r_32", level: "B1",
    titleRu: "Passive Voice (Страдательный залог)",
    titleUk: "Passive Voice (Пасивний стан)",
    formula: "be (am/is/are / was/were) + V3 (ed)",
    descRu: "Используется, когда важнее сам объект и действие над ним, чем тот, кто его совершил.",
    descUk: "Використовується, коли важливіший сам об'єкт і дія над ним, ніж той, хто її виконав.",
    examples: [
      { en: "Hot beverages are served here.", ru: "Горячие напитки подаются здесь.", uk: "Гарячі напої подаються тут." },
      { en: "Our flight was delayed by two hours.", ru: "Наш рейс был задержан на два часа.", uk: "Наш рейс було затримано на дві години." }
    ],
    quiz: { question: "All the ingredients ___ mixed in a bowl.", options: ["are", "have", "do"], correct: 0 }
  },
  {
    id: "r_33", level: "B1",
    titleRu: "Конструкция used to для прошлых привычек",
    titleUk: "Конструкція used to для минулих звичок",
    formula: "used to + V1 | didn't use to + V1",
    descRu: "Описывает регулярные действия или состояния, которые были в прошлом, но больше не актуальны сейчас.",
    descUk: "Описує регулярні дії або стани, які були в минулому, але більше не актуальні зараз.",
    examples: [
      { en: "I used to drink a lot of coffee, but now I prefer tea.", ru: "Раньше я пил много кофе, но теперь предпочитаю чай.", uk: "Раніше я пив багато кави, але тепер віддаю перевагу чаю." }
    ],
    quiz: { question: "He ___ live in Scotland, but he moved to London.", options: ["use to", "used to", "is used to"], correct: 1 }
  },
  {
    id: "r_34", level: "B1",
    titleRu: "Связки уступки: Although против Despite",
    titleUk: "Сполучники поступки: Although проти Despite",
    formula: "Although + Подлежащее + Глагол | Despite + Существительное / V-ing",
    descRu: "После Although всегда идет грамматическая основа (кто + что сделал), а после Despite — существительное, местоимение или герундий (-ing).",
    descUk: "Після Although завжди йде граматична основа (хто + що зробив), а після Despite — іменник, займенник або герундій (-ing).",
    examples: [
      { en: "Although it was late, we kept talking.", ru: "Хотя было поздно, мы продолжали разговаривать.", uk: "Хоча було пізно, ми продовжували розмовляти." },
      { en: "We went for a walk despite the rain.", ru: "Мы пошли на прогулку вопреки дождю.", uk: "Ми пішли на прогулянку попри дощ." }
    ],
    quiz: { question: "___ the heavy traffic, my commute took only 30 minutes.", options: ["Although", "Despite", "However"], correct: 1 }
  },
  {
    id: "r_35", level: "B1",
    titleRu: "Герундий (V-ing) против Инфинитива (to + V1)",
    titleUk: "Герундій (V-ing) проти Інфінітива (to + V1)",
    formula: "enjoy / avoid / mind / suggest + V-ing | want / decide / promise / refuse + to V1",
    descRu: "После одних глаголов и предлогов всегда ставится форма с -ing, а после глаголов желания, планов и решений — инфинитив с частицей to.",
    descUk: "Після одних дієслів і прийменників завжди ставиться форма з -ing, а після дієслів бажання, планів і рішень — інфінітив із часткою to.",
    examples: [
      { en: "She feels confident speaking English now.", ru: "Теперь она чувствует себя уверенно, говоря по-английски.", uk: "Тепер вона почувається впевнено, розмовляючи англійською." },
      { en: "He was reluctant to admit his mistake.", ru: "Он неохотно признавал свою ошибку.", uk: "Він неохоче визнавав свою помилку." }
    ],
    quiz: { question: "Do you mind ___ the window?", options: ["to open", "opening", "open"], correct: 1 }
  },

  // ======================== УРОВЕНЬ B2 (36 - 44) ========================
  {
    id: "r_36", level: "B2",
    titleRu: "Third Conditional (Сожаления о прошлом)",
    titleUk: "Third Conditional (Жаль про минуле)",
    formula: "If + Past Perfect (had + V3), ... would have + V3",
    descRu: "Используется, когда мы представляем альтернативный исход события, которое уже произошло в прошлом и его нельзя изменить.",
    descUk: "Використовується, коли ми уявляємо альтернативний результат події, яка вже відбулася в минулому і її не можна змінити.",
    examples: [
      { en: "If we had left earlier, we wouldn't have missed the flight.", ru: "Если бы мы выехали раньше, мы бы не опоздали на рейс.", uk: "Якби ми виїхали раніше, ми б не запізнилися на рейс." }
    ],
    quiz: { question: "If I had known about your arrival, I ___ met you at the airport.", options: ["would", "would have", "had"], correct: 1 }
  },
  {
    id: "r_37", level: "B2",
    titleRu: "Mixed Conditionals (Условие в прошлом → результат сейчас)",
    titleUk: "Mixed Conditionals (Умова в минулому → результат зараз)",
    formula: "If + had V3 (прошлое), ... would + V1 (сейчас)",
    descRu: "Показывает, как старое решение или событие в прошлом влияет на нашу текущую ситуацию прямо сейчас.",
    descUk: "Показує, як старе рішення або подія в минулому впливає на нашу поточну ситуацію просто зараз.",
    examples: [
      { en: "If I had slept on the plane, I wouldn't have severe jetlag now.", ru: "Если бы я поспал в самолете, у меня бы сейчас не было сильного джетлага.", uk: "Якби я поспав у літаку, у мене б зараз не було сильного джетлагу." }
    ],
    quiz: { question: "If she had taken that job, she ___ living in Paris right now.", options: ["would be", "would have been", "will be"], correct: 0 }
  },
  {
    id: "r_38", level: "B2",
    titleRu: "Be used to / Get used to + V-ing",
    titleUk: "Be used to / Get used to + V-ing",
    formula: "be used to + Noun / V-ing (привык) | get used to + Noun / V-ing (привыкать)",
    descRu: "В этих конструкциях слово to является предлогом, поэтому после него ставится существительное или глагол с окончанием -ing!",
    descUk: "У цих конструкціях слово to є прийменником, тому після нього ставиться іменник або дієслово із закінченням -ing!",
    examples: [
      { en: "I am used to a 40-minute morning commute.", ru: "Я привык к 40-минутной утренней дороге на работу.", uk: "Я звик до 40-хвилинної ранкової дороги на роботу." }
    ],
    quiz: { question: "It took me a month to get used to ___ spicy food.", options: ["eat", "eating", "ate"], correct: 1 }
  },
  {
    id: "r_39", level: "B2",
    titleRu: "Модальные глаголы догадки о прошлом",
    titleUk: "Модальні дієслова здогадки про минуле",
    formula: "must have + V3 (100% было) | might have + V3 (возможно) | can't have + V3 (не могло быть)",
    descRu: "Позволяет делать логические выводы о том, что случилось в прошлом, опираясь на улики или факты.",
    descUk: "Дозволяє робити логічні висновки про те, що сталося в минулому, спираючись на докази чи факти.",
    examples: [
      { en: "He must have felt overwhelmed by all the new information.", ru: "Он, должно быть, почувствовал себя перегруженным всей новой информацией.", uk: "Він, мабуть, відчув себе перевантаженим усією новою інформацією." }
    ],
    quiz: { question: "The soup is completely bland. The chef ___ forgotten to add salt.", options: ["must have", "should", "can't"], correct: 0 }
  },
  {
    id: "r_40", level: "B2",
    titleRu: "Past Perfect: предпрошедшее время",
    titleUk: "Past Perfect: передминулий час",
    formula: "had + V3 (ed)",
    descRu: "Показывает действие, которое завершилось ДО другого действия или момента в прошлом.",
    descUk: "Показує дію, яка завершилася ДО іншої дії або моменту в минулому.",
    examples: [
      { en: "By the time we got through customs, our luggage had already arrived.", ru: "К тому времени как мы прошли таможню, наш багаж уже прибыл.", uk: "На той час як ми пройшли митницю, наш багаж уже прибув." }
    ],
    quiz: { question: "When we arrived at the station, the train ___ already left.", options: ["has", "had", "was"], correct: 1 }
  },
  {
    id: "r_41", level: "B2",
    titleRu: "Future Continuous против Future Perfect",
    titleUk: "Future Continuous проти Future Perfect",
    formula: "will be + V-ing (в процессе) | will have + V3 (уже завершится к моменту)",
    descRu: "Future Continuous описывает процесс в точный момент будущего, а Future Perfect (часто с предлогом by) — действие, которое уже будет выполнено к определенному сроку.",
    descUk: "Future Continuous описує процес у точний момент майбутнього, а Future Perfect (часто з прийменником by) — дію, яка вже буде виконана до певного терміну.",
    examples: [
      { en: "By next month, I will have learned 500 new words.", ru: "К следующему месяцу я уже выучу 500 новых слов.", uk: "До наступного місяця я вже вивчу 500 нових слів." }
    ],
    quiz: { question: "By 8 PM tonight, we ___ finished our dinner.", options: ["will be", "will have", "have"], correct: 1 }
  },
  {
    id: "r_42", level: "B2",
    titleRu: "Каузатив: have / get something done",
    titleUk: "Каузатив: have / get something done",
    formula: "have / get + Объект + V3 (ed)",
    descRu: "Используется, когда мы не делаем услугу сами, а заказываем или поручаем её специалисту (постричься, починить машину, доставить еду).",
    descUk: "Використовується, коли ми не робимо послугу самі, а замовляємо або доручаємо її фахівцю (підстригтися, полагодити авто, доставити їжу).",
    examples: [
      { en: "I need to have my suit cleaned before the wedding.", ru: "Мне нужно отдать костюм в химчистку перед свадьбой.", uk: "Мені потрібно віддати костюм у хімчистку перед весіллям." }
    ],
    quiz: { question: "She had her luggage ___ directly to the hotel.", options: ["deliver", "delivered", "delivering"], correct: 1 }
  },
  {
    id: "r_43", level: "B2",
    titleRu: "Конструкция I wish / If only",
    titleUk: "Конструкція I wish / If only",
    formula: "I wish + Past Simple (сейчас) | I wish + had V3 (сожаление о прошлом)",
    descRu: "Чтобы выразить желание изменить настоящее, сдвигаем время на шаг назад в Past Simple. Для сожалений о прошлом — в Past Perfect (had + V3).",
    descUk: "Щоб висловити бажання змінити теперішнє, зсуваємо час на крок назад у Past Simple. Для жалю про минуле — у Past Perfect (had + V3).",
    examples: [
      { en: "I wish I knew the answer.", ru: "Жаль, что я не знаю ответа сейчас.", uk: "Шкода, що я не знаю відповіді зараз." },
      { en: "I wish I hadn't eaten so much spicy food yesterday.", ru: "Жаль, что я вчера съел так много острой еды.", uk: "Шкода, що я вчора з'їв так багато гострої їжі." }
    ],
    quiz: { question: "I'm stuck in traffic. I wish I ___ taken the metro this morning.", options: ["have", "had", "would"], correct: 1 }
  },
  {
    id: "r_44", level: "B2",
    titleRu: "Определительные придаточные: who, which, whose",
    titleUk: "Означальні підрядні речення: who, which, whose",
    formula: "who (люди) | which (вещи/ситуации) | whose (чей)",
    descRu: "В невыделительных придаточных предложениях (выделенных запятыми) нельзя использовать слово that — только who или which.",
    descUk: "У невидільних підрядних реченнях (виділених комами) не можна використовувати слово that — тільки who або which.",
    examples: [
      { en: "His brother, who lives in Rome, is a coffee connoisseur.", ru: "Его брат, который живет в Риме, — знаток кофе.", uk: "Його брат, який живе в Римі, — знавець кави." }
    ],
    quiz: { question: "The passenger ___ luggage was lost complained to the airline.", options: ["who", "whose", "which"], correct: 1 }
  },

  // ======================== УРОВЕНЬ C1 (45 - 50) ========================
  {
    id: "r_45", level: "C1",
    titleRu: "Отрицательная инверсия: Never, Rarely, Seldom, Little",
    titleUk: "Заперечна інверсія: Never, Rarely, Seldom, Little",
    formula: "Never / Seldom / Little + Вспом. глагол + Подлежащее + Глагол",
    descRu: "Когда отрицательное или ограничительное наречие выносится в самое начало предложения для эмоционального акцента, порядок слов становится вопросительным.",
    descUk: "Коли заперечний або обмежувальний прислівник виноситься на самий початок речення для емоційного акценту, порядок слів стає питальним.",
    examples: [
      { en: "Never have I tasted such a palatable dish.", ru: "Никогда я не пробовал столь приятного на вкус блюда.", uk: "Ніколи я не куштував такої приємної на смак страви." },
      { en: "Little did they know that the decision was controversial.", ru: "Мало же они знали, что решение было спорным.", uk: "Мало ж вони знали, що рішення було суперечливим." }
    ],
    quiz: { question: "Seldom ___ such dedication in a young specialist.", options: ["we see", "do we see", "we do see"], correct: 1 }
  },
  {
    id: "r_46", level: "C1",
    titleRu: "Инверсия с Not only ... but also",
    titleUk: "Інверсія з Not only ... but also",
    formula: "Not only + Вспом. глагол + Подлежащее + Глагол, but ... also ...",
    descRu: "Если предложение начинается с Not only, в первой части используется инверсия (как в вопросе).",
    descUk: "Якщо речення починається з Not only, у першій частині використовується інверсія (як у питанні).",
    examples: [
      { en: "Not only did they scrutinize the report, but they also found errors.", ru: "Они не только тщательно изучили отчет, но и нашли ошибки.", uk: "Вони не тільки ретельно вивчили звіт, але й знайшли помилки." }
    ],
    quiz: { question: "Not only ___ late, but he also forgot the tickets.", options: ["he was", "was he", "did he"], correct: 1 }
  },
  {
    id: "r_47", level: "C1",
    titleRu: "Cleft Sentences: расщепленные предложения для акцента",
    titleUk: "Cleft Sentences: розщеплені речення для акценту",
    formula: "What + Подлежащее + Глагол + is/was ... | It is/was ... that/who ...",
    descRu: "Позволяет сфокусировать внимание собеседника на конкретной детали («То, что нам действительно нужно — это...»).",
    descUk: "Дозволяє сфокусувати увагу співрозмовника на конкретній деталі («Те, що нам дійсно потрібно — це...»).",
    examples: [
      { en: "What we need is a pragmatic approach to this problem.", ru: "То, что нам нужно — это прагматичный подход к проблеме.", uk: "Те, що нам потрібно — це прагматичний підхід до проблеми." }
    ],
    quiz: { question: "___ we really need right now is clear communication.", options: ["That", "What", "Which"], correct: 1 }
  },
  {
    id: "r_48", level: "C1",
    titleRu: "Subjunctive Mood (Сослагательное наклонение в формальной речи)",
    titleUk: "Subjunctive Mood (Умовний спосіб у формальному мовленні)",
    formula: "insist / suggest / demand / vital + that + Subject + V1 (be)",
    descRu: "После глаголов требования и рекомендации (insist, demand, suggest, recommend) в формальном английском глагол идет в чистой начальной форме без -s (даже для he/she/it).",
    descUk: "Після дієслів вимоги та рекомендації (insist, demand, suggest, recommend) у формальній англійській дієслово йде в чистій початковій формі без -s (навіть для he/she/it).",
    examples: [
      { en: "The lawyer insisted that the ambiguous wording be changed.", ru: "Юрист настоял на том, чтобы двусмысленная формулировка была изменена.", uk: "Юрист наполіг на тому, щоб двозначне формулювання було змінено." }
    ],
    quiz: { question: "It is essential that every passenger ___ through customs.", options: ["goes", "go", "went"], correct: 1 }
  },
  {
    id: "r_49", level: "C1",
    titleRu: "Participle Clauses (Причастные обороты)",
    titleUk: "Participle Clauses (Дієприкметникові звороти)",
    formula: "Having + V3 (сделав что-то ранее) | V-ing (делая одновременно)",
    descRu: "Используй Having + V3 в начале предложения, чтобы элегантно показать, что одно действие завершилось перед началом второго.",
    descUk: "Використовуй Having + V3 на початку речення, щоб елегантно показати, що одна дія завершилася перед початком другої.",
    examples: [
      { en: "Having scrutinized every detail of the contract, she signed it.", ru: "Тщательно изучив каждую деталь контракта, она подписала его.", uk: "Ретельно вивчивши кожну деталь контракту, вона підписала його." }
    ],
    quiz: { question: "___ reconciled with his estranged brother, he felt relieved.", options: ["Have", "Having", "Had"], correct: 1 }
  },
  {
    id: "r_50", level: "C1",
    titleRu: "Продвинутая уступка: Adjective + as / though",
    titleUk: "Просунута поступка: Adjective + as / though",
    formula: "Прилагательное / Наречие + as / though + Подлежащее + Глагол",
    descRu: "На уровне C1 вместо 'Although it was difficult' можно вынести прилагательное вперед: 'Difficult though it was...'.",
    descUk: "На рівні C1 замість 'Although it was difficult' можна винести прикметник уперед: 'Difficult though it was...'.",
    examples: [
      { en: "Controversial though the decision was, it saved the company.", ru: "Каким бы спорным ни было решение, оно спасло компанию.", uk: "Яким би суперечливим не було рішення, воно врятувало компанію." }
    ],
    quiz: { question: "Exhausted ___ she was, she finished the presentation.", options: ["despite", "though", "however"], correct: 1 }
  }
];

// ============================================================================
// БАЗА: 50 ВИДЕО-ФРАГМЕНТОВ YOUTUBE ПО ТАЙМКОДАМ (A0 - C1)
// Использованы проверенные встраиваемые видео TED Talks и Стэнфорда:
// 1) arj7oStGLkU — Tim Urban (TED: Inside the mind of a master procrastinator)
// 2) 8S0FDjFBj8o — Julian Treasure (TED: How to speak so that people want to listen)
// 3) UF8uR6Z6KLc — Steve Jobs (Stanford Commencement Speech)
// 4) UNP03fDSj1U — Matt Cutts (TED: Try something new for 30 days)
// 5) qp0HIF3SfI4 — Simon Sinek (TED: How great leaders inspire action)
// ============================================================================

const GAPLESS_VIDEOS_RAW = [
  // ======================== УРОВЕНЬ A0 - A1 (1 - 12) ========================
  {
    id: "v_1", level: "A0", videoId: "UF8uR6Z6KLc", start: 22, end: 26,
    titleRu: "Стив Джобс: Вступительное слово", titleUk: "Стів Джобс: Вступне слово",
    transcript: "I am honored to be with you today",
    hintRu: "Для меня честь быть с вами сегодня (8 слов)", hintUk: "Для мене честь бути з вами сьогодні (8 слів)"
  },
  {
    id: "v_2", level: "A0", videoId: "UF8uR6Z6KLc", start: 42, end: 46,
    titleRu: "Стив Джобс: Три истории", titleUk: "Стів Джобс: Три історії",
    transcript: "Today I want to tell you three stories",
    hintRu: "Сегодня я хочу рассказать вам три истории (8 слов)", hintUk: "Сьогодні я хочу розповісти вам три історії (8 слів)"
  },
  {
    id: "v_3", level: "A0", videoId: "UF8uR6Z6KLc", start: 47, end: 50,
    titleRu: "Стив Джобс: Ничего грандиозного", titleUk: "Стів Джобс: Нічого грандіозного",
    transcript: "Just three stories",
    hintRu: "Просто три истории (3 слова)", hintUk: "Просто три історії (3 слова)"
  },
  {
    id: "v_4", level: "A1", videoId: "UF8uR6Z6KLc", start: 51, end: 55,
    titleRu: "Стив Джобс: Первая история", titleUk: "Стів Джобс: Перша історія",
    transcript: "The first story is about connecting the dots",
    hintRu: "Первая история — о соединении точек (8 слов)", hintUk: "Перша історія — про з'єднання точок (8 слів)"
  },
  {
    id: "v_5", level: "A1", videoId: "arj7oStGLkU", start: 14, end: 18,
    titleRu: "Тим Урбан: Учеба в колледже", titleUk: "Тім Урбан: Навчання в коледжі",
    transcript: "So in college I was a government major",
    hintRu: "Итак, в колледже я изучал госуправление (8 слов)", hintUk: "Отже, у коледжі я вивчав держуправління (8 слів)"
  },
  {
    id: "v_6", level: "A1", videoId: "arj7oStGLkU", start: 18, end: 22,
    titleRu: "Тим Урбан: Много письменных работ", titleUk: "Тім Урбан: Багато письмових робіт",
    transcript: "which means I had to write a lot of papers",
    hintRu: "что означает, что мне приходилось писать много работ (10 слов)", hintUk: "що означає, що мені доводилося писати багато робіт (10 слів)"
  },
  {
    id: "v_7", level: "A1", videoId: "arj7oStGLkU", start: 78, end: 81,
    titleRu: "Тим Урбан: Начало работы", titleUk: "Тім Урбан: Початок роботи",
    transcript: "So I would start off light",
    hintRu: "Я бы начал понемногу / налегке (6 слов)", hintUk: "Я б почав потроху / легко (6 слів)"
  },
  {
    id: "v_8", level: "A1", videoId: "8S0FDjFBj8o", start: 13, end: 18,
    titleRu: "Джулиан Трежер: Человеческий голос", titleUk: "Джуліан Трежер: Людський голос",
    transcript: "The human voice is the instrument we all play",
    hintRu: "Человеческий голос — это инструмент, на котором мы все играем (9 слов)", hintUk: "Людський голос — це інструмент, на якому ми всі граємо (9 слів)"
  },
  {
    id: "v_9", level: "A1", videoId: "8S0FDjFBj8o", start: 18, end: 23,
    titleRu: "Джулиан Трежер: Самый мощный звук", titleUk: "Джуліан Трежер: Найпотужніший звук",
    transcript: "It is the most powerful sound in the world",
    hintRu: "Это самый мощный звук в мире (9 слов)", hintUk: "Це найпотужніший звук у світі (9 слів)"
  },
  {
    id: "v_10", level: "A1", videoId: "8S0FDjFBj8o", start: 24, end: 29,
    titleRu: "Джулиан Трежер: Сила слов", titleUk: "Джуліан Трежер: Сила слів",
    transcript: "It is the only one that can start a war",
    hintRu: "Это единственный звук, который может начать войну (10 слов)", hintUk: "Це єдиний звук, який може почати війну (10 слів)"
  },
  {
    id: "v_11", level: "A1", videoId: "8S0FDjFBj8o", start: 29, end: 32,
    titleRu: "Джулиан Трежер: Признание", titleUk: "Джуліан Трежер: Зізнання",
    transcript: "or say I love you",
    hintRu: "или сказать «Я люблю тебя» (5 слов)", hintUk: "або сказати «Я люблю тебе» (5 слів)"
  },
  {
    id: "v_12", level: "A1", videoId: "UNP03fDSj1U", start: 34, end: 38,
    titleRu: "Мэтт Каттс: Идея на 30 дней", titleUk: "Метт Каттс: Ідея на 30 днів",
    transcript: "Think about something you have always wanted to add to your life",
    hintRu: "Подумайте о чем-то, что вы всегда хотели добавить в свою жизнь (12 слов)", hintUk: "Подумайте про щось, що ви завжди хотіли додати у своє життя (12 слів)"
  },

  // ======================== УРОВЕНЬ A2 (13 - 24) ========================
  {
    id: "v_13", level: "A2", videoId: "UNP03fDSj1U", start: 38, end: 43,
    titleRu: "Мэтт Каттс: Попробуй 30 дней", titleUk: "Метт Каттс: Спробуй 30 днів",
    transcript: "and try it for the next 30 days",
    hintRu: "и попробуйте делать это следующие 30 дней (8 слов)", hintUk: "і спробуйте робити це наступні 30 днів (8 слів)"
  },
  {
    id: "v_14", level: "A2", videoId: "UNP03fDSj1U", start: 43, end: 48,
    titleRu: "Мэтт Каттс: Новая привычка", titleUk: "Метт Каттс: Нова звичка",
    transcript: "It turns out 30 days is just about the right amount of time",
    hintRu: "Оказывается, 30 дней — это как раз подходящее количество времени (13 слов)", hintUk: "Виявляється, 30 днів — це якраз слушна кількість часу (13 слів)"
  },
  {
    id: "v_15", level: "A2", videoId: "UNP03fDSj1U", start: 54, end: 59,
    titleRu: "Мэтт Каттс: Чему я научился", titleUk: "Метт Каттс: Чого я навчився",
    transcript: "There are a few things I learned while doing these 30 day challenges",
    hintRu: "Есть несколько вещей, которым я научился во время этих 30-дневных челленджей (13 слов)", hintUk: "Є кілька речей, яких я навчився під час цих 30-денних челенджів (13 слів)"
  },
  {
    id: "v_16", level: "A2", videoId: "UNP03fDSj1U", start: 75, end: 80,
    titleRu: "Мэтт Каттс: Фотография каждый день", titleUk: "Метт Каттс: Фотографія щодня",
    transcript: "For example I took a picture every day for a month",
    hintRu: "Например, я делал фотографию каждый день в течение месяца (11 слов)", hintUk: "Наприклад, я робив фотографію щодня протягом місяця (11 слів)"
  },
  {
    id: "v_17", level: "A2", videoId: "UNP03fDSj1U", start: 80, end: 86,
    titleRu: "Мэтт Каттс: Память о каждом дне", titleUk: "Метт Каттс: Пам'ять про кожен день",
    transcript: "and I remember exactly where I was and what I was doing that day",
    hintRu: "и я точно помню, где я был и что делал в тот день (14 слов)", hintUk: "і я точно пам'ятаю, де я був і що робив того дня (14 слів)"
  },
  {
    id: "v_18", level: "A2", videoId: "UNP03fDSj1U", start: 93, end: 98,
    titleRu: "Мэтт Каттс: Рост уверенности", titleUk: "Метт Каттс: Зростання впевненості",
    transcript: "I also noticed that as I started to do more and harder 30 day challenges",
    hintRu: "Я также заметил, что по мере того, как я брался за более сложные челленджи (15 слов)", hintUk: "Я також помітив, що в міру того, як я брався за складніші челенджі (15 слів)"
  },
  {
    id: "v_19", level: "A2", videoId: "UNP03fDSj1U", start: 98, end: 101,
    titleRu: "Мэтт Каттс: Уверенность в себе", titleUk: "Метт Каттс: Впевненість у собі",
    transcript: "my self confidence grew",
    hintRu: "моя уверенность в себе выросла (4 слова)", hintUk: "моя впевненість у собі зросла (4 слова)"
  },
  {
    id: "v_20", level: "A2", videoId: "arj7oStGLkU", start: 98, end: 103,
    titleRu: "Тим Урбан: 90 страниц дипломной работы", titleUk: "Тім Урбан: 90 сторінок дипломної роботи",
    transcript: "And then one day I woke up with three days left",
    hintRu: "А потом однажды я проснулся, когда оставалось всего три дня (11 слов)", hintUk: "А потім одного разу я прокинувся, коли залишалося всього три дні (11 слів)"
  },
  {
    id: "v_21", level: "A2", videoId: "arj7oStGLkU", start: 103, end: 107,
    titleRu: "Тим Урбан: Ни одного слова", titleUk: "Тім Урбан: Жодного слова",
    transcript: "and I had not written a word",
    hintRu: "а я еще не написал ни слова (7 слов)", hintUk: "а я ще не написав жодного слова (7 слів)"
  },
  {
    id: "v_22", level: "A2", videoId: "UF8uR6Z6KLc", start: 325, end: 330,
    titleRu: "Стив Джобс: Вторая история о любви и потере", titleUk: "Стів Джобс: Друга історія про любов і втрату",
    transcript: "My second story is about love and loss",
    hintRu: "Моя вторая история — о любви и потере (8 слов)", hintUk: "Моя друга історія — про любов і втрату (8 слів)"
  },
  {
    id: "v_23", level: "A2", videoId: "UF8uR6Z6KLc", start: 330, end: 335,
    titleRu: "Стив Джобс: Найти любимое дело", titleUk: "Стів Джобс: Знайти улюблену справу",
    transcript: "I was lucky I found what I loved to do early in life",
    hintRu: "Мне повезло — я рано нашел то, что любил делать (13 слов)", hintUk: "Мені пощастило — я рано знайшов те, що любив робити (13 слів)"
  },
  {
    id: "v_24", level: "A2", videoId: "UF8uR6Z6KLc", start: 335, end: 341,
    titleRu: "Стив Джобс: Старт Apple в гараже", titleUk: "Стів Джобс: Старт Apple у гаражі",
    transcript: "Woz and I started Apple in my parents garage when I was 20",
    hintRu: "Воз и я основали Apple в гараже моих родителей, когда мне было 20 (13 слов)", hintUk: "Воз і я заснували Apple у гаражі моїх батьків, коли мені було 20 (13 слів)"
  },

  // ======================== УРОВЕНЬ B1 (25 - 36) ========================
  {
    id: "v_25", level: "B1", videoId: "UF8uR6Z6KLc", start: 341, end: 347,
    titleRu: "Стив Джобс: Рост компании за 10 лет", titleUk: "Стів Джобс: Зростання компанії за 10 років",
    transcript: "We worked hard and in 10 years Apple had grown from just the two of us",
    hintRu: "Мы усердно трудились, и за 10 лет Apple выросла из нас двоих (16 слов)", hintUk: "Ми старанно працювали, і за 10 років Apple виросла з нас двох (16 слів)"
  },
  {
    id: "v_26", level: "B1", videoId: "UF8uR6Z6KLc", start: 486, end: 492,
    titleRu: "Стив Джобс: Единственный способ делать великую работу", titleUk: "Стів Джобс: Єдиний спосіб робити велику роботу",
    transcript: "The only way to do great work is to love what you do",
    hintRu: "Единственный способ делать великую работу — любить то, что ты делаешь (13 слов)", hintUk: "Єдиний спосіб робити велику роботу — любити те, що ти робиш (13 слів)"
  },
  {
    id: "v_27", level: "B1", videoId: "UF8uR6Z6KLc", start: 492, end: 497,
    titleRu: "Стив Джобс: Продолжай искать", titleUk: "Стів Джобс: Продовжуй шукати",
    transcript: "If you have not found it yet keep looking do not settle",
    hintRu: "Если вы еще не нашли это, продолжайте искать, не останавливайтесь (12 слов)", hintUk: "Якщо ви ще не знайшли це, продовжуйте шукати, не зупиняйтеся (12 слів)"
  },
  {
    id: "v_28", level: "B1", videoId: "arj7oStGLkU", start: 162, end: 168,
    titleRu: "Тим Урбан: Гипотеза о мозге прокрастинатора", titleUk: "Тім Урбан: Гіпотеза про мозок прокрастинатора",
    transcript: "I had a hypothesis that the brains of procrastinators were actually different",
    hintRu: "У меня была гипотеза, что мозг прокрастинаторов на самом деле отличается (12 слов)", hintUk: "У мене була гіпотеза, що мозок прокрастинаторів насправді відрізняється (12 слів)"
  },
  {
    id: "v_29", level: "B1", videoId: "arj7oStGLkU", start: 196, end: 201,
    titleRu: "Тим Урбан: Рациональный Приниматель Решений", titleUk: "Тім Урбан: Раціональний Приймач Рішень",
    transcript: "Both brains have a Rational Decision Maker in them",
    hintRu: "В обоих типах мозга есть Рациональный Приниматель Решений (9 слов)", hintUk: "В обох типах мозку є Раціональний Приймач Рішень (9 слів)"
  },
  {
    id: "v_30", level: "B1", videoId: "arj7oStGLkU", start: 205, end: 211,
    titleRu: "Тим Урбан: Обезьянка сиюминутного удовольствия", titleUk: "Тім Урбан: Мавпочка миттєвого задоволення",
    transcript: "the procrastinator's brain also has an Instant Gratification Monkey",
    hintRu: "в мозге прокрастинатора также живет Обезьянка мгновенного удовольствия (9 слов)", hintUk: "у мозку прокрастинатора також живе Мавпочка миттєвого задоволення (9 слів)"
  },
  {
    id: "v_31", level: "B1", videoId: "arj7oStGLkU", start: 221, end: 227,
    titleRu: "Тим Урбан: Жизнь в настоящем моменте", titleUk: "Тім Урбан: Життя в теперішньому моменті",
    transcript: "The Instant Gratification Monkey does not seem like a guy you want driving",
    hintRu: "Эта обезьянка не похожа на того, кому вы хотите доверить руль (13 слов)", hintUk: "Ця мавпочка не схожа на того, кому ви хочете довірити кермо (13 слів)"
  },
  {
    id: "v_32", level: "B1", videoId: "arj7oStGLkU", start: 227, end: 232,
    titleRu: "Тим Урбан: Только легко и весело", titleUk: "Тім Урбан: Тільки легко і весело",
    transcript: "He lives entirely in the present moment",
    hintRu: "Он живет исключительно настоящим моментом (7 слов)", hintUk: "Він живе виключно теперішнім моментом (7 слів)"
  },
  {
    id: "v_33", level: "B1", videoId: "arj7oStGLkU", start: 232, end: 238,
    titleRu: "Тим Урбан: Две вещи, которые заботят обезьянку", titleUk: "Тім Урбан: Дві речі, які хвилюють мавпочку",
    transcript: "He only cares about two things easy and fun",
    hintRu: "Его волнуют только две вещи: легко и весело (9 слов)", hintUk: "Його хвилюють лише дві речі: легко і весело (9 слів)"
  },
  {
    id: "v_34", level: "B1", videoId: "qp0HIF3SfI4", start: 18, end: 24,
    titleRu: "Саймон Синек: Вопрос о успехе", titleUk: "Саймон Сінек: Питання про успіх",
    transcript: "How do you explain when things don't go as we assume",
    hintRu: "Как вы объясните ситуации, когда дела идут не так, как мы предполагаем (11 слов)", hintUk: "Як ви поясните ситуації, коли справи йдуть не так, як ми припускаємо (11 слів)"
  },
  {
    id: "v_35", level: "B1", videoId: "qp0HIF3SfI4", start: 40, end: 45,
    titleRu: "Саймон Синек: Инновации Apple", titleUk: "Саймон Сінек: Інновації Apple",
    transcript: "Why is Apple so innovative year after year after year",
    hintRu: "Почему Apple настолько инновационна год за годом (10 слов)", hintUk: "Чому Apple настільки інноваційна рік за роком (10 слів)"
  },
  {
    id: "v_36", level: "B1", videoId: "qp0HIF3SfI4", start: 147, end: 152,
    titleRu: "Саймон Синек: Золотой круг", titleUk: "Саймон Сінек: Золоте коло",
    transcript: "Every single person every single organization on the planet knows what they do",
    hintRu: "Каждый человек и каждая организация на планете знают, ЧТО они делают (13 слов)", hintUk: "Кожна людина і кожна організація на планеті знають, ЩО вони роблять (13 слів)"
  },

  // ======================== УРОВЕНЬ B2 (37 - 44) ========================
  {
    id: "v_37", level: "B2", videoId: "qp0HIF3SfI4", start: 162, end: 168,
    titleRu: "Саймон Синек: Очень немногие знают «Почему»", titleUk: "Саймон Сінек: Дуже мало хто знає «Чому»",
    transcript: "Very few people or organizations know why they do what they do",
    hintRu: "Очень немногие люди или организации знают, ПОЧЕМУ они делают то, что делают (12 слов)", hintUk: "Дуже небагато людей чи організацій знають, ЧОМУ вони роблять те, що роблять (12 слів)"
  },
  {
    id: "v_38", level: "B2", videoId: "qp0HIF3SfI4", start: 251, end: 256,
    titleRu: "Саймон Синек: Главный секрет маркетинга", titleUk: "Саймон Сінек: Головний секрет маркетингу",
    transcript: "People don't buy what you do they buy why you do it",
    hintRu: "Люди покупают не то, что вы делаете, а то, почему вы это делаете (12 слов)", hintUk: "Люди купують не те, що ви робите, а те, чому ви це робите (12 слів)"
  },
  {
    id: "v_39", level: "B2", videoId: "qp0HIF3SfI4", start: 294, end: 300,
    titleRu: "Саймон Синек: Цель бизнеса", titleUk: "Саймон Сінек: Мета бізнесу",
    transcript: "The goal is to do business with people who believe what you believe",
    hintRu: "Цель — вести бизнес с людьми, которые верят в то же, во что верите вы (13 слов)", hintUk: "Мета — вести бізнес із людьми, які вірять у те саме, у що вірите ви (13 слів)"
  },
  {
    id: "v_40", level: "B2", videoId: "8S0FDjFBj8o", start: 33, end: 39,
    titleRu: "Джулиан Трежер: Проблема невнимания", titleUk: "Джуліан Трежер: Проблема неуважності",
    transcript: "And yet many of us have the experience that when we speak people don't listen to us",
    hintRu: "И всё же многие из нас сталкиваются с тем, что когда мы говорим, люди нас не слушают (17 слов)", hintUk: "І все ж багато хто з нас стикається з тим, що коли ми говоримо, люди нас не слухають (17 слів)"
  },
  {
    id: "v_41", level: "B2", videoId: "8S0FDjFBj8o", start: 63, end: 69,
    titleRu: "Джулиан Трежер: Семь смертных грехов речи", titleUk: "Джуліан Трежер: Сім смертних гріхів мовлення",
    transcript: "Seven deadly sins of speaking that I think we need to avoid",
    hintRu: "Семь смертных грехов речи, которых, я думаю, нам следует избегать (12 слов)", hintUk: "Сім смертних гріхів мовлення, яких, я гадаю, нам слід уникати (12 слів)"
  },
  {
    id: "v_42", level: "B2", videoId: "8S0FDjFBj8o", start: 70, end: 76,
    titleRu: "Джулиан Трежер: Привычка сплетничать", titleUk: "Джуліан Трежер: Звичка пліткувати",
    transcript: "First gossip speaking ill of somebody who is not present",
    hintRu: "Первое — сплетни: плохо отзываться о том, кто не присутствует (10 слов)", hintUk: "Перше — плітки: погано відгукуватися про того, хто не присутній (10 слів)"
  },
  {
    id: "v_43", level: "B2", videoId: "8S0FDjFBj8o", start: 86, end: 92,
    titleRu: "Джулиан Трежер: Осуждение собеседника", titleUk: "Джуліан Трежер: Засудження співрозмовника",
    transcript: "It is very hard to listen to somebody if you know that you are being judged",
    hintRu: "Очень трудно слушать кого-то, если вы знаете, что вас осуждают (16 слов)", hintUk: "Дуже важко слухати когось, якщо ви знаєте, що вас засуджують (16 слів)"
  },
  {
    id: "v_44", level: "B2", videoId: "UNP03fDSj1U", start: 60, end: 66,
    titleRu: "Мэтт Каттс: Как перестать забывать месяцы жизни", titleUk: "Метт Каттс: Як перестати забувати місяці життя",
    transcript: "The first was instead of the months flying by forgotten the time was much more memorable",
    hintRu: "Во-первых, вместо того чтобы месяцы пролетали забытыми, время стало гораздо более запоминающимся (16 слов)", hintUk: "По-перше, замість того щоб місяці пролітали забутими, час став набагато більш пам'ятним (16 слів)"
  },

  // ======================== УРОВЕНЬ C1 (45 - 50) ========================
  {
    id: "v_45", level: "C1", videoId: "arj7oStGLkU", start: 530, end: 536,
    titleRu: "Тим Урбан: Монстр Паники", titleUk: "Тім Урбан: Монстр Паніки",
    transcript: "The Panic Monster is dormant most of the time but he suddenly wakes up",
    hintRu: "Монстр Паники спит большую часть времени, но внезапно просыпается (14 слов)", hintUk: "Монстр Паніки спить більшу частину часу, але раптово прокидається (14 слів)"
  },
  {
    id: "v_46", level: "C1", videoId: "UF8uR6Z6KLc", start: 730, end: 736,
    titleRu: "Стив Джобс: Ваше время ограничено", titleUk: "Стів Джобс: Ваш час обмежений",
    transcript: "Your time is limited so don't waste it living someone else's life",
    hintRu: "Ваше время ограничено, поэтому не тратьте его, живя чужой жизнью (12 слов)", hintUk: "Ваш час обмежений, тому не витрачайте його, живучи чужим життям (12 слів)"
  },
  {
    id: "v_47", level: "C1", videoId: "UF8uR6Z6KLc", start: 745, end: 752,
    titleRu: "Стив Джобс: Шум чужих мнений", titleUk: "Стів Джобс: Шум чужих думок",
    transcript: "Don't let the noise of others' opinions drown out your own inner voice",
    hintRu: "Не позволяйте шуму чужих мнений заглушить ваш собственный внутренний голос (13 слов)", hintUk: "Не дозволяйте шуму чужих думок заглушити ваш власний внутрішній голос (13 слів)"
  },
  {
    id: "v_48", level: "C1", videoId: "UF8uR6Z6KLc", start: 753, end: 759,
    titleRu: "Стив Джобс: Смелость следовать сердцу и интуиции", titleUk: "Стів Джобс: Сміливість слідувати серцю та інтуїції",
    transcript: "Have the courage to follow your heart and intuition",
    hintRu: "Имейте смелость следовать своему сердцу и интуиции (9 слов)", hintUk: "Майте сміливість слідувати своєму серцю та інтуїції (9 слів)"
  },
  {
    id: "v_49", level: "C1", videoId: "qp0HIF3SfI4", start: 685, end: 692,
    titleRu: "Саймон Синек: Лидеры, которые вдохновляют", titleUk: "Саймон Сінек: Лідери, які надихають",
    transcript: "There are leaders and there are those who lead Leaders hold a position of power or authority",
    hintRu: "Есть руководители, а есть те, кто ведет за собой. Руководители занимают позицию власти (17 слов)", hintUk: "Є керівники, а є ті, хто веде за собою. Керівники обіймають позицію влади (17 слів)"
  },
  {
    id: "v_50", level: "C1", videoId: "8S0FDjFBj8o", start: 235, end: 242,
    titleRu: "Джулиан Трежер: Четыре фундамента сильной речи (HAIL)", titleUk: "Джуліан Трежер: Чотири фундаменти сильного мовлення (HAIL)",
    transcript: "There are four really powerful cornerstones foundations that we can stand on if we want our speech to be powerful",
    hintRu: "Существует четыре мощных краеугольных камня, на которые мы можем опереться, чтобы речь была сильной (20 слов)", hintUk: "Існує чотири потужні наріжні камені, на які ми можемо спертися, щоб мовлення було сильним (20 слів)"
  }
];

const GaplessRulesDB = {
  rules: GAPLESS_RULES_RAW,
  videos: GAPLESS_VIDEOS_RAW,

  // Получить правила для уровня пользователя + соседних уровней (использует neighborsMap из vocabulary.js)
  getRulesForLevel(level = "B1") {
    const allowed = (window.GaplessDB && GaplessDB.getTargetAndNeighborLevels(level)) || [level, "B1"];
    const exact = this.rules.filter(r => r.level === level);
    const neighbors = this.rules.filter(r => allowed.includes(r.level) && r.level !== level);
    const combined = [...exact, ...neighbors];
    return combined.length > 0 ? combined : this.rules;
  },

  // Получить ежедневную подборку случайных правил уровня пользователя (по 3 правила в день)
  getDailyRules(level = "B1", count = 3, offset = 0) {
    const pool = this.getRulesForLevel(level);
    const todaySeed = new Date().toISOString().slice(0, 10).split("-").reduce((a, b) => a + Number(b), 0) + offset * 3;
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
