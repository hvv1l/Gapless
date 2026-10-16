// ============================================================================
// ФАЙЛ: data/vocabulary.js
// Чистая База Данных Gapless: Смысловые группы -> Уровни (A0 - C1) -> Слова
// ============================================================================

const GAPLESS_RAW_DB = {
  version: "1.0.0",
  levelsOrder: ["A0", "A1", "A2", "B1", "B2", "C1"],

  // Правила захвата соседних уровней при калибровке
  neighborsMap: {
    "A0": ["A0", "A1"],
    "A1": ["A0", "A1", "A2"],
    "A2": ["A1", "A2", "B1"],
    "B1": ["A2", "B1", "B2"],
    "B2": ["B1", "B2", "C1"],
    "C1": ["B2", "C1"]
  },

  // 1. СМЫСЛОВЫЕ КАТЕГОРИИ И ПАЧКИ СЛОВ ПО УРОВНЯМ
  categories: [
    {
      id: "family",
      titleRu: "Семья и окружение",
      titleUk: "Сім'я та оточення",
      icon: "👨‍👩‍👧",
      levels: {
        "A0": [
          { id: "w_fam_1", en: "mother", ru: "мама", uk: "мама", tr: "/ˈmʌðər/", ex: "My mother is very kind." },
          { id: "w_fam_2", en: "father", ru: "папа", uk: "тато", tr: "/ˈfɑːðər/", ex: "My father works in an office." },
          { id: "w_fam_3", en: "sister", ru: "сестра", uk: "сестра", tr: "/ˈsɪstər/", ex: "I have one younger sister." },
          { id: "w_fam_4", en: "brother", ru: "брат", uk: "брат", tr: "/ˈbrʌðər/", ex: "My brother likes football." },
          { id: "w_fam_5", en: "family", ru: "семья", uk: "сім'я", tr: "/ˈfæməli/", ex: "We have a big family." }
        ],
        "A1": [
          { id: "w_fam_6", en: "parents", ru: "родители", uk: "батьки", tr: "/ˈpeərənts/", ex: "My parents live in another city." },
          { id: "w_fam_7", en: "husband", ru: "муж", uk: "чоловік", tr: "/ˈhʌzbənd/", ex: "Her husband is a doctor." },
          { id: "w_fam_8", en: "wife", ru: "жена", uk: "дружина", tr: "/waɪf/", ex: "He loves his wife very much." },
          { id: "w_fam_9", en: "child", ru: "ребенок", uk: "дитина", tr: "/tʃaɪld/", ex: "Every child likes sweets." },
          { id: "w_fam_10", en: "friend", ru: "друг", uk: "друг", tr: "/frend/", ex: "He is my best friend." }
        ],
        "A2": [
          { id: "w_fam_11", en: "son", ru: "сын", uk: "син", tr: "/sʌn/", ex: "Their son goes to school." },
          { id: "w_fam_12", en: "daughter", ru: "дочка", uk: "донька", tr: "/ˈdɔːtər/", ex: "She has a teenage daughter." },
          { id: "w_fam_13", en: "grandson", ru: "внук", uk: "онук", tr: "/ˈɡrænsʌn/", ex: "He is proud of his grandson." },
          { id: "w_fam_14", en: "nephew", ru: "племянник", uk: "племінник", tr: "/ˈnefjuː/", ex: "I bought a gift for my nephew." },
          { id: "w_fam_15", en: "niece", ru: "племянница", uk: "племінниця", tr: "/niːs/", ex: "My niece isfive years old." }
        ],
        "B1": [
          { id: "w_fam_16", en: "relatives", ru: "родственники", uk: "родичі", tr: "/ˈrelətɪvz/", ex: "We invited all our distant relatives." },
          { id: "w_fam_17", en: "generation", ru: "поколение", uk: "покоління", tr: "/ˌdʒenəˈreɪʃn/", ex: "The younger generation learns fast." },
          { id: "w_fam_18", en: "upbringing", ru: "воспитание", uk: "виховання", tr: "/ˈʌpbrɪŋɪŋ/", ex: "She had a strict upbringing." },
          { id: "w_fam_19", en: "fiancé", ru: "жених (помолвленный)", uk: "наречений", tr: "/fiˈɒnseɪ/", ex: "She introduced me to her fiancé." },
          { id: "w_fam_20", en: "childhood", ru: "детство", uk: "дитинство", tr: "/ˈtʃaɪldhʊd/", ex: "I spent my childhood by the sea." }
        ],
        "B2": [
          { id: "w_fam_21", en: "siblings", ru: "родные братья и сестры", uk: "рідні брати і сестри", tr: "/ˈsɪblɪŋz/", ex: "Do you have any siblings?" },
          { id: "w_fam_22", en: "in-laws", ru: "родственники супруга", uk: "родичі чоловіка/дружини", tr: "/ˈɪn lɔːz/", ex: "We are having dinner with my in-laws." },
          { id: "w_fam_23", en: "ancestors", ru: "предки", uk: "предки", tr: "/ˈænsestərz/", ex: "His ancestors came from Scotland." },
          { id: "w_fam_24", en: "offspring", ru: "потомство / дети", uk: "потомство / діти", tr: "/ˈɒfsprɪŋ/", ex: "Parents try to protect their offspring." },
          { id: "w_fam_25", en: "household", ru: "домочадцы / быт", uk: "домогосподарство", tr: "/ˈhaʊshəʊld/", ex: "Everyone in the household helps with chores." }
        ],
        "C1": [
          { id: "w_fam_26", en: "kinship", ru: "родство / близость", uk: "спорідненість", tr: "/ˈkɪnʃɪp/", ex: "She felt a strong kinship with him." },
          { id: "w_fam_27", en: "breadwinner", ru: "кормилец семьи", uk: "годувальник сім'ї", tr: "/ˈbredwɪnər/", ex: "He became the main breadwinner." },
          { id: "w_fam_28", en: "estranged", ru: "отдалившийся (о родных)", uk: "відчужений", tr: "/ɪˈstreɪndʒd/", ex: "He reconciled with his estranged brother." },
          { id: "w_fam_29", en: "lineage", ru: "родословная", uk: "родовід", tr: "/ˈlɪniɪdʒ/", ex: "They can trace their lineage back centuries." }
        ]
      }
    },

    {
      id: "food",
      titleRu: "Еда и рестораны",
      titleUk: "Їжа та ресторани",
      icon: "🍎",
      levels: {
        "A0": [
          { id: "w_fd_1", en: "apple", ru: "яблоко", uk: "яблуко", tr: "/ˈæpl/", ex: "This red apple is sweet." },
          { id: "w_fd_2", en: "banana", ru: "банан", uk: "банан", tr: "/bəˈnænə/", ex: "Monkeys love bananas." },
          { id: "w_fd_3", en: "water", ru: "вода", uk: "вода", tr: "/ˈwɔːtər/", ex: "Can I have a glass of water?" },
          { id: "w_fd_4", en: "bread", ru: "хлеб", uk: "хліб", tr: "/bred/", ex: "Fresh bread smells great." },
          { id: "w_fd_5", en: "milk", ru: "молоко", uk: "молоко", tr: "/mɪlk/", ex: "I drink coffee with milk." }
        ],
        "A1": [
          { id: "w_fd_6", en: "breakfast", ru: "завтрак", uk: "сніданок", tr: "/ˈbrekfəst/", ex: "I usually have eggs for breakfast." },
          { id: "w_fd_7", en: "dinner", ru: "ужин", uk: "вечеря", tr: "/ˈdɪnər/", ex: "What time is dinner tonight?" },
          { id: "w_fd_8", en: "vegetables", ru: "овощи", uk: "овочі", tr: "/ˈvedʒtəblz/", ex: "Eat more fresh vegetables." },
          { id: "w_fd_9", en: "delicious", ru: "очень вкусный", uk: "дуже смачний", tr: "/dɪˈlɪʃəs/", ex: "The cake was absolutely delicious." },
          { id: "w_fd_10", en: "waiter", ru: "официант", uk: "офіціант", tr: "/ˈweɪtər/", ex: "Ask the waiter for the bill." }
        ],
        "A2": [
          { id: "w_fd_11", en: "ingredients", ru: "ингредиенты", uk: "інгредієнти", tr: "/ɪnˈɡriːdiənts/", ex: "Mix all the ingredients in a bowl." },
          { id: "w_fd_12", en: "spicy", ru: "острый (о еде)", uk: "гострий (про їжу)", tr: "/ˈspaɪsi/", ex: "Mexican food is often very spicy." },
          { id: "w_fd_13", en: "bitter", ru: "горький", uk: "гіркий", tr: "/ˈbɪtər/", ex: "Dark chocolate tastes slightly bitter." },
          { id: "w_fd_14", en: "sour", ru: "кислый", uk: "кислий", tr: "/ˈsaʊər/", ex: "Lemons are too sour for me." },
          { id: "w_fd_15", en: "recipe", ru: "рецепт (кулинарный)", uk: "рецепт", tr: "/ˈresəpi/", ex: "Can you share this pasta recipe?" }
        ],
        "B1": [
          { id: "w_fd_16", en: "nutrition", ru: "питание / рацион", uk: "харчування", tr: "/njuˈtrɪʃn/", ex: "Good nutrition is key to health." },
          { id: "w_fd_17", en: "appetite", ru: "аппетит", uk: "апетит", tr: "/ˈæpɪtaɪt/", ex: "A walk in the park gives you an appetite." },
          { id: "w_fd_18", en: "leftovers", ru: "остатки еды", uk: "залишки їжі", tr: "/ˈleftəʊvərz/", ex: "We ate leftovers from yesterday's party." },
          { id: "w_fd_19", en: "beverage", ru: "напиток", uk: "напій", tr: "/ˈbevərɪdʒ/", ex: "Hot beverages are served here." },
          { id: "w_fd_20", en: "cutlery", ru: "столовые приборы", uk: "столові прибори", tr: "/ˈkʌtləri/", ex: "Put the cutlery on the table." }
        ],
        "B2": [
          { id: "w_fd_21", en: "cuisine", ru: "кухня (национальная)", uk: "кухня (національна)", tr: "/kwɪˈziːn/", ex: "I am a huge fan of Italian cuisine." },
          { id: "w_fd_22", en: "savory", ru: "несладкий / пикантный", uk: "несолодкий / пікантний", tr: "/ˈseɪvəri/", ex: "Do you prefer sweet or savory snacks?" },
          { id: "w_fd_23", en: "craving", ru: "сильная тяга к еде", uk: "сильне бажання з'їсти щось", tr: "/ˈkreɪvɪŋ/", ex: "I have a sudden craving for sushi." },
          { id: "w_fd_24", en: "bland", ru: "пресный / безвкусный", uk: "прісний / позбавлений смаку", tr: "/blænd/", ex: "The soup was a bit bland without salt." },
          { id: "w_fd_25", en: "stale", ru: "черствый / несвежий", uk: "черствий / несвіжий", tr: "/steɪl/", ex: "This bread has gone stale." }
        ],
        "C1": [
          { id: "w_fd_26", en: "connoisseur", ru: "знаток / гурман", uk: "знавець / гурман", tr: "/ˌkɒnəˈsɜːr/", ex: "He is a true coffee connoisseur." },
          { id: "w_fd_27", en: "palatable", ru: "приятный на вкус", uk: "приємний на смак", tr: "/ˈpælətəbl/", ex: "The dish was barely palatable." },
          { id: "w_fd_28", en: "gluttony", ru: "чревоугодие / обжорство", uk: "ненажерливість", tr: "/ˈɡlʌtəni/", ex: "Holiday dinners often lead to gluttony." }
        ]
      }
    },

    {
      id: "travel",
      titleRu: "Путешествия и город",
      titleUk: "Подорожі та місто",
      icon: "✈️",
      levels: {
        "A1": [
          { id: "w_tr_1", en: "ticket", ru: "билет", uk: "квиток", tr: "/ˈtɪkɪt/", ex: "I bought a train ticket." },
          { id: "w_tr_2", en: "airport", ru: "аэропорт", uk: "аеропорт", tr: "/ˈeəpɔːt/", ex: "We arrived at the airport early." },
          { id: "w_tr_3", en: "hotel", ru: "отель", uk: "готель", tr: "/həʊˈtel/", ex: "Our hotel is near the beach." },
          { id: "w_tr_4", en: "street", ru: "улица", uk: "вулиця", tr: "/striːt/", ex: "Cross the street carefully." }
        ],
        "A2": [
          { id: "w_tr_5", en: "luggage", ru: "багаж", uk: "багаж", tr: "/ˈlʌɡɪdʒ/", ex: "Don't leave your luggage unattended." },
          { id: "w_tr_6", en: "passenger", ru: "пассажир", uk: "пасажир", tr: "/ˈpæsɪndʒər/", ex: "Every passenger must wear a seatbelt." },
          { id: "w_tr_7", en: "delayed", ru: "задержан (рейс)", uk: "затриманий (рейс)", tr: "/dɪˈleɪd/", ex: "Our flight was delayed by two hours." },
          { id: "w_tr_8", en: "abroad", ru: "за границей / за границу", uk: "за кордоном", tr: "/əˈbrɔːd/", ex: "Have you ever traveled abroad?" }
        ],
        "B1": [
          { id: "w_tr_9", en: "destination", ru: "пункт назначения", uk: "пункт призначення", tr: "/ˌdestɪˈneɪʃn/", ex: "Paris is a popular tourist destination." },
          { id: "w_tr_10", en: "departure", ru: "отправление / вылет", uk: "відправлення / виліт", tr: "/dɪˈpɑːtʃər/", ex: "Check the departure board for your gate." },
          { id: "w_tr_11", en: "customs", ru: "таможня", uk: "митниця", tr: "/ˈkʌstəmz/", ex: "It took an hour to get through customs." },
          { id: "w_tr_12", en: "accommodation", ru: "жилье (в поездке)", uk: "житло (у поїздці)", tr: "/əˌkɒməˈdeɪʃn/", ex: "We booked cheap accommodation online." }
        ],
        "B2": [
          { id: "w_tr_13", en: "itinerary", ru: "маршрут поездки", uk: "маршрут поїздки", tr: "/aɪˈtɪnərəri/", ex: "I planned a detailed itinerary for Rome." },
          { id: "w_tr_14", en: "commute", ru: "дорога на работу/учебу", uk: "дорога на роботу/навчання", tr: "/kəˈmjuːt/", ex: "My morning commute takes 40 minutes." },
          { id: "w_tr_15", en: "picturesque", ru: "живописный", uk: "мальовничий", tr: "/ˌpɪktʃəˈresk/", ex: "We stayed in a picturesque mountain village." },
          { id: "w_tr_16", en: "jetlag", ru: "сбой биоритмов после перелета", uk: "джетлаг", tr: "/ˈdʒetlæɡ/", ex: "I'm still recovering from severe jetlag." }
        ]
      }
    },

    {
      id: "mindset",
      titleRu: "Мышление, речь и связки",
      titleUk: "Мислення, мовлення та зв'язки",
      icon: "🧠",
      levels: {
        "A2": [
          { id: "w_mn_1", en: "actually", ru: "на самом деле", uk: "насправді", tr: "/ˈæktʃuəli/", ex: "Actually, I already know the answer." },
          { id: "w_mn_2", en: "probably", ru: "вероятно / наверное", uk: "ймовірно / мабуть", tr: "/ˈprɒbəbli/", ex: "It will probably rain tomorrow." },
          { id: "w_mn_3", en: "suddenly", ru: "внезапно", uk: "раптово", tr: "/ˈsʌdənli/", ex: "Suddenly, the lights went out." },
          { id: "w_mn_4", en: "curious", ru: "любопытный", uk: "допитливий", tr: "/ˈkjʊəriəs/", ex: "I'm curious about how this works." }
        ],
        "B1": [
          { id: "w_mn_5", en: "although", ru: "хотя / несмотря на", uk: "хоча / незважаючи на", tr: "/ɔːlˈðəʊ/", ex: "Although it was late, we kept talking." },
          { id: "w_mn_6", en: "despite", ru: "вопреки / несмотря на", uk: "попри / всупереч", tr: "/dɪˈspaɪt/", ex: "We went for a walk despite the rain." },
          { id: "w_mn_7", en: "meanwhile", ru: "тем временем", uk: "тим часом", tr: "/ˈmiːnwaɪl/", ex: "Cook the pasta; meanwhile, prepare the sauce." },
          { id: "w_mn_8", en: "otherwise", ru: "иначе / в противном случае", uk: "інакше", tr: "/ˈʌðəwaɪz/", ex: "Hurry up, otherwise we'll miss the bus." },
          { id: "w_mn_9", en: "confident", ru: "уверенный", uk: "впевнений", tr: "/ˈkɒnfɪdənt/", ex: "She feels confident speaking English now." }
        ],
        "B2": [
          { id: "w_mn_10", en: "inevitable", ru: "неизбежный", uk: "неминучий", tr: "/ɪnˈevɪtəbl/", ex: "Mistakes are an inevitable part of learning." },
          { id: "w_mn_11", en: "overwhelmed", ru: "перегруженный (делами/эмоциями)", uk: "перевантажений", tr: "/ˌəʊvəˈwelmd/", ex: "I felt overwhelmed by all the new information." },
          { id: "w_mn_12", en: "controversial", ru: "спорный / неоднозначный", uk: "суперечливий", tr: "/ˌkɒntrəˈvɜːʃl/", ex: "That was a very controversial decision." },
          { id: "w_mn_13", en: "reluctant", ru: "неохотный / сомневающийся", uk: "неохочий", tr: "/rɪˈlʌktənt/", ex: "He was reluctant to admit his mistake." },
          { id: "w_mn_14", en: "vague", ru: "расплывчатый / неясный", uk: "розмитий / нечіткий", tr: "/veɪɡ/", ex: "She gave only a vague description." }
        ],
        "C1": [
          { id: "w_mn_15", en: "ubiquitous", ru: "вездесущий / повсеместный", uk: "всюдисущий / повсюдний", tr: "/juːˈbɪkwɪtəs/", ex: "Smartphones have become ubiquitous in daily life." },
          { id: "w_mn_16", en: "ambiguous", ru: "двусмысленный", uk: "двозначний", tr: "/æmˈbɪɡjuəs/", ex: "The wording of the contract is ambiguous." },
          { id: "w_mn_17", en: "scrutinize", ru: "тщательно изучать", uk: "ретельно вивчати", tr: "/ˈskruːtənaɪz/", ex: "Experts scrutinized every detail of the report." },
          { id: "w_mn_18", en: "pragmatic", ru: "прагматичный", uk: "прагматичний", tr: "/præɡˈmætɪk/", ex: "We need a pragmatic approach to this problem." }
        ]
      }
    }
  ]
};