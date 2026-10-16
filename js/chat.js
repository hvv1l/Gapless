// ============================================================================
// ФАЙЛ: js/chat.js
// Модуль 3: Мессенджер, поиск собеседников, ИИ-напарник и кликабельный переводчик
// ============================================================================

const ChatModule = {
  activeSubTab: "ai",     // 'random' | 'friends' | 'ai'
  chats: {
    ai: {
      name: "Liam (AI Tutor)",
      status: "Online • B1 Level",
      avatar: "🤖",
      missionWord: "inevitable",
      missionDone: false,
      messages: [
        { sender: "ai", text: "Hi! How was your weekend? Did you do anything interesting?" }
      ]
    },
    random: {
      name: "Searching...",
      status: "Connecting...",
      avatar: "🔍",
      missionWord: "despite",
      missionDone: false,
      messages: []
    },
    friends: []
  },
  currentChatId: "ai",
  inputText: "",
  matchingTimer: null,

  setSubTab(tab) {
    this.activeSubTab = tab;
    if (tab === "ai") this.currentChatId = "ai";
    if (tab === "friends") this.currentChatId = "friends_list";
    if (tab === "random") {
      this.startRandomMatchmaking();
    }
    this.render();
  },

  // Имитация поиска случайного собеседника с авто-подключением ИИ через 4 секунды (защита от пустого экрана)
  startRandomMatchmaking() {
    this.currentChatId = "random";
    this.chats.random = {
      name: "Поиск собеседника...",
      status: "Ищем человека твоего уровня (B1)...",
      avatar: "⏳",
      missionWord: "although",
      missionDone: false,
      messages: []
    };
    this.render();

    clearTimeout(this.matchingTimer);
    this.matchingTimer = setTimeout(() => {
      // Если живой человек не нашелся за 4 сек, подключаем ИИ-собеседника
      this.chats.random = {
        name: "Sarah, 22 (London)",
        status: "Online • Случайный собеседник (B1)",
        avatar: "👩‍🦰",
        missionWord: "although",
        missionDone: false,
        messages: [
          { sender: "ai", text: "Hey! I'm also practicing English today. What's your favorite movie?" }
        ]
      };
      this.render();
      showToast("✓ Собеседник найден!");
    }, 4000);
  },

  // Отправка сообщения в чат + проверка миссии
  sendMessage() {
    const textInput = document.getElementById("chat-input-field");
    if (!textInput || !textInput.value.trim()) return;

    const text = textInput.value.trim();
    textInput.value = "";

    const chat = this.chats[this.currentChatId] || this.chats.ai;
    chat.messages.push({ sender: "me", text });

    // Проверяем, использовал ли пользователь слово-миссию
    if (chat.missionWord && text.toLowerCase().includes(chat.missionWord)) {
      chat.missionDone = true;
      showToast(`🎯 Миссия выполнена! Слово «${chat.missionWord}» зачтено`);
    }

    this.render();

    // Имитация ответа собеседника через 1 секунду
    setTimeout(() => {
      let reply = "That's super interesting! Tell me more about it.";
      const lower = text.toLowerCase();
      if (lower.includes("movie") || lower.includes("film")) {
        reply = "Oh I love movies! Have you seen any good ones recently?";
      } else if (lower.includes("weekend")) {
        reply = "Sounds like a great time! I mostly stayed at home and relaxed.";
      } else {
        reply = `I see! By the way, speaking of that, it's quite fascinating.`;
      }

      chat.messages.push({ sender: "ai", text: reply });
      this.render();
      
      // Автопрокрутка чата вниз
      const box = document.getElementById("chat-messages-box");
      if (box) box.scrollTop = box.scrollHeight;
    }, 1000);
  },

  // Клик по любому слову в сообщении собеседника (Кликабельный переводчик)
  inspectWordInChat(rawWord) {
    const wordModel = GaplessDB.findOrCreateWord(rawWord, "слово из диалога");
    if (!wordModel) return;

    const lang = AppState.data.nativeLang;
    const isUk = lang === "uk";

    // Показываем мини-модалку прямо над чатом
    const modal = document.getElementById("word-inspect-modal");
    if (!modal) return;

    modal.innerHTML = `
      <div class="p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-xl flex items-center justify-between fade-in">
        <div class="flex items-center gap-3">
          <button onclick="GaplessDB.wordsMap.get('${wordModel.en.toLowerCase()}').speak()" class="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-sm">🔊</button>
          <div>
            <div class="text-sm font-extrabold text-sky-400">${wordModel.en} <span class="text-xs font-normal text-slate-400">${wordModel.tr}</span></div>
            <div class="text-xs text-slate-300">${wordModel.getTranslation(lang)}</div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="ChatModule.addWordFromChatToGaps('${wordModel.en}')" class="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition">
            + ${isUk ? 'У прогалини' : 'В пробелы'}
          </button>
          <button onclick="document.getElementById('word-inspect-modal').innerHTML = ''" class="text-slate-400 hover:text-white px-1.5 text-sm font-bold">✕</button>
        </div>
      </div>
    `;
  },

  addWordFromChatToGaps(wordEn) {
    GaplessDB.setWordStatus(wordEn, "gap");
    showToast(`+ «${wordEn}» отправлено в твои пробелы`);
    document.getElementById("word-inspect-modal").innerHTML = "";
  },

  // Главный рендер вкладки «Чат»
  render() {
    const container = document.getElementById("app-root");
    const lang = AppState.data.nativeLang;
    const isUk = lang === "uk";

    // Если открыт список друзей
    if (this.activeSubTab === "friends") {
      container.innerHTML = `
        <div class="p-4 space-y-4 pb-24 fade-in">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-extrabold">${isUk ? 'Мої друзі' : 'Мои друзья'}</h2>
            <button onclick="ChatModule.setSubTab('ai')" class="text-xs font-bold text-ocean-500">${isUk ? '← До чатів' : '← К чатам'}</button>
          </div>
          <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <div class="text-2xl">👥</div>
            <div class="text-sm font-bold">${isUk ? 'Поки що немає друзів' : 'Пока нет друзей'}</div>
            <p class="text-xs text-slate-400">${isUk ? 'Додавай випадкових співрозмовників після цікавих діалогів.' : 'Добавляй случайных собеседников после диалогов в один клик.'}</p>
          </div>
        </div>
      `;
      return;
    }

    const chat = this.chats[this.currentChatId] || this.chats.ai;

    // Превращаем текст сообщения собеседника в кликабельные слова-кнопки
    const renderMessageText = (text) => {
      const words = text.split(" ");
      return words.map(w => {
        const clean = w.replace(/[^a-zA-Z]/g, "");
        if (clean.length < 2) return w;
        return `<span onclick="ChatModule.inspectWordInChat('${clean}')" class="cursor-pointer hover:bg-sky-500/20 rounded px-0.5 transition underline decoration-dotted underline-offset-4">${w}</span>`;
      }).join(" ");
    };

    const messagesHtml = chat.messages.map(m => {
      if (m.sender === "me") {
        return `
          <div class="flex justify-end mb-2.5">
            <div class="max-w-[80%] p-3 rounded-2xl rounded-tr-sm bg-ocean-600 text-white text-xs leading-relaxed shadow-sm">
              ${m.text}
            </div>
          </div>
        `;
      } else {
        return `
          <div class="flex items-start gap-2 mb-2.5">
            <div class="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs shrink-0">${chat.avatar}</div>
            <div class="max-w-[80%] p-3 rounded-2xl rounded-tl-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs leading-relaxed shadow-sm text-slate-800 dark:text-slate-200">
              ${renderMessageText(m.text)}
            </div>
          </div>
        `;
      }
    }).join("");

    container.innerHTML = `
      <div class="flex flex-col h-[calc(100vh-135px)] fade-in relative">
        <!-- Верхний переключатель режимов чата -->
        <div class="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div class="grid grid-cols-3 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-[11px] font-bold w-full max-w-xs mx-auto">
            <button onclick="ChatModule.setSubTab('ai')" class="py-1.5 rounded-lg transition ${this.activeSubTab === 'ai' ? 'bg-white dark:bg-slate-900 text-ocean-500 shadow-sm' : 'text-slate-500'}">AI Напарник</button>
            <button onclick="ChatModule.setSubTab('random')" class="py-1.5 rounded-lg transition ${this.activeSubTab === 'random' ? 'bg-white dark:bg-slate-900 text-ocean-500 shadow-sm' : 'text-slate-500'}">${isUk ? 'Випадковий' : 'Случайный'}</button>
            <button onclick="ChatModule.setSubTab('friends')" class="py-1.5 rounded-lg transition ${this.activeSubTab === 'friends' ? 'bg-white dark:bg-slate-900 text-ocean-500 shadow-sm' : 'text-slate-500'}">${isUk ? 'Друзі' : 'Друзья'}</button>
          </div>
        </div>

        <!-- Плашка миссии (Квест на использование слова из пробелов) -->
        <div class="px-4 py-2 bg-gradient-to-r from-ocean-500/10 to-mint-500/10 border-b border-ocean-500/20 flex items-center justify-between text-xs shrink-0">
          <div class="flex items-center gap-2">
            <span>🎯</span>
            <div>
              <span class="font-bold text-slate-700 dark:text-slate-300">${isUk ? 'Місія у чаті:' : 'Миссия в чате:'}</span>
              <span class="font-extrabold text-ocean-600 dark:text-ocean-400">use "${chat.missionWord}"</span>
            </div>
          </div>
          <span class="font-bold px-2 py-0.5 rounded-full ${chat.missionDone ? 'bg-mint-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}">
            ${chat.missionDone ? (isUk ? '✓ Виконано' : '✓ Выполнено') : (isUk ? 'В процесі' : 'В процессе')}
          </span>
        </div>

        <!-- Информация о собеседнике в шапке чата -->
        <div class="px-4 py-2 bg-white/50 dark:bg-slate-900/50 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center gap-2.5 shrink-0">
          <div class="w-8 h-8 rounded-full bg-ocean-500/20 flex items-center justify-center text-sm">${chat.avatar}</div>
          <div>
            <div class="text-xs font-bold">${chat.name}</div>
            <div class="text-[10px] text-slate-400">${chat.status}</div>
          </div>
        </div>

        <!-- Окно сообщений -->
        <div id="chat-messages-box" class="flex-1 overflow-y-auto p-4 space-y-2">
          ${messagesHtml}
        </div>

        <!-- Всплывающее окно кликабельного перевода слова -->
        <div id="word-inspect-modal" class="px-3 absolute bottom-16 left-0 right-0 z-20"></div>

        <!-- Поле ввода сообщения -->
        <div class="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2 shrink-0">
          <input id="chat-input-field" type="text" placeholder="${isUk ? 'Напиши повідомлення англійською...' : 'Напиши сообщение на английском...'}" 
            onkeydown="if(event.key==='Enter') ChatModule.sendMessage()"
            class="flex-1 px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-ocean-500" />
          <button onclick="ChatModule.sendMessage()" class="px-4 py-2.5 rounded-xl bg-ocean-600 hover:bg-ocean-500 text-white text-xs font-bold transition shadow-sm">
            ${isUk ? 'Надіслати' : 'Отправить'}
          </button>
        </div>
      </div>
    `;
  }
};