// ============================================================================
// ФАЙЛ: js/chat.js
// Модуль 3: Чат (AI-напарник, Онлайн-поиск, Друзья и кликабельный переводчик)
// ============================================================================

const ChatModule = {
  activeSubTab: "ai",      // 'ai' | 'random' | 'friends'
  roomId: "global_random",
  missionWord: "inevitable",
  missionDone: false,
  messages: [
    { sender_name: "Liam (AI)", text: "Hi! How was your day? Try using the word 'inevitable' in our conversation!" }
  ],
  subscription: null,

  setSubTab(tab) {
    this.activeSubTab = tab;
    if (this.subscription) {
      try { this.subscription.unsubscribe(); } catch (e) {}
      this.subscription = null;
    }

    if (tab === "ai") {
      this.messages = [
        { sender_name: "Liam (AI)", text: "Hi! Ready to practice English? Tell me about your plans for this week." }
      ];
      this.render();
    } else if (tab === "random") {
      this.initRealtimeChat();
    } else if (tab === "friends") {
      this.render();
    }
  },

  async initRealtimeChat() {
    const isUk = AppState.data.nativeLang === "uk";

    if (!window.supabaseClient) {
      this.messages = [
        { sender_name: "Sarah (London)", text: "Hey there! I just joined the random practice chat. What's your favorite movie?" }
      ];
      this.render();
      return;
    }

    showToast(isUk ? "Підключення до чату..." : "Подключение к чату...");
    try {
      const { data, error } = await window.supabaseClient
        .from("messages")
        .select("*")
        .eq("room_id", this.roomId)
        .order("created_at", { ascending: true })
        .limit(30);

      if (!error && data && data.length > 0) {
        this.messages = data;
      } else {
        this.messages = [
          { sender_name: "System", text: "Welcome to the live room! Say hello to start practicing." }
        ];
      }
    } catch (e) {}

    this.render();
  },

  async sendMessage() {
    const textInput = document.getElementById("chat-input-field");
    if (!textInput || !textInput.value.trim()) return;

    const text = textInput.value.trim();
    textInput.value = "";

    const isUk = AppState.data.nativeLang === "uk";
    const myName = AppState.data.userName || (isUk ? "Користувач" : "Пользователь");

    // Проверка выполнения миссии
    if (this.missionWord && text.toLowerCase().includes(this.missionWord.toLowerCase())) {
      this.missionDone = true;
      showToast(isUk ? `✓ Місію виконано: ${this.missionWord}` : `✓ Миссия выполнена: ${this.missionWord}`);
    }

    this.messages.push({ sender_name: myName, text: text });
    this.render();

    if (this.activeSubTab === "random" && window.supabaseClient) {
      try {
        await window.supabaseClient.from("messages").insert([
          { room_id: this.roomId, sender_name: myName, text: text }
        ]);
      } catch (e) {}
      return;
    }

    // Ответ собеседника
    setTimeout(() => {
      const partnerName = this.activeSubTab === "ai" ? "Liam (AI)" : "Sarah (London)";
      let reply = "That sounds really interesting! Why do you think so?";
      const lower = text.toLowerCase();
      if (lower.includes("movie") || lower.includes("film")) {
        reply = "I love good comedies and sci-fi movies! Which genre do you prefer?";
      } else if (lower.includes("inevitable")) {
        reply = "Nice use of the word 'inevitable'! Your vocabulary is getting stronger.";
      }
      this.messages.push({ sender_name: partnerName, text: reply });
      if (AppState.data.activeTab === "chat") {
        this.render();
        const box = document.getElementById("chat-messages-box");
        if (box) box.scrollTop = box.scrollHeight;
      }
    }, 800);
  },

  addFriendByNickname() {
    const input = document.getElementById("friend-nick-input");
    if (!input || !input.value.trim()) return;
    const nick = input.value.trim();
    if (!Array.isArray(AppState.data.friendsList)) {
      AppState.data.friendsList = [];
    }
    if (!AppState.data.friendsList.includes(nick)) {
      AppState.data.friendsList.push(nick);
      AppState.save();
    }
    showToast(`✓ ${nick} добавлен в друзья`);
    this.render();
  },

  inspectWordInChat(rawWord) {
    const wordModel = GaplessDB.findOrCreateWord(rawWord, "слово из диалога");
    if (!wordModel) return;

    const lang = AppState.data.nativeLang;
    const isUk = lang === "uk";
    const modal = document.getElementById("word-inspect-modal");
    if (!modal) return;

    modal.innerHTML = `
      <div class="p-3.5 rounded-2xl bg-slate-900 text-white border border-slate-700 shadow-xl flex items-center justify-between fade-in">
        <div class="flex items-center gap-3">
          <button onclick="GaplessDB.wordsMap.get('${wordModel.en.toLowerCase()}').speak()" class="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-bold">🔊</button>
          <div>
            <div class="text-sm font-extrabold text-ocean-400">${wordModel.en}</div>
            <div class="text-xs text-slate-300">${wordModel.getTranslation(lang)}</div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="ChatModule.addWordFromChatToGaps('${wordModel.en}')" class="px-3 py-1.5 rounded-xl bg-gap-600 hover:bg-gap-500 text-white text-xs font-bold transition">
            + ${isUk ? 'У прогалини' : 'В пробелы'}
          </button>
          <button onclick="document.getElementById('word-inspect-modal').innerHTML = ''" class="text-slate-400 hover:text-white px-2 text-sm font-bold">✕</button>
        </div>
      </div>
    `;
  },

  addWordFromChatToGaps(wordEn) {
    GaplessDB.setWordStatus(wordEn, "gap");
    const isUk = AppState.data.nativeLang === "uk";
    showToast(isUk ? `+ «${wordEn}» додано у твої прогалини` : `+ «${wordEn}» добавлено в твои пробелы`);
    const modal = document.getElementById("word-inspect-modal");
    if (modal) modal.innerHTML = "";
  },

  render() {
    const container = document.getElementById("app-root");
    if (!container) return;
    const isUk = AppState.data.nativeLang === "uk";
    const myName = AppState.data.userName || (isUk ? "Користувач" : "Пользователь");

    // Верхние вкладки внутри Чата
    const topTabsHtml = `
      <div class="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div class="grid grid-cols-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
          <button onclick="ChatModule.setSubTab('ai')" class="py-1.5 rounded-lg transition ${this.activeSubTab === 'ai' ? 'bg-white dark:bg-slate-900 text-ocean-500 shadow-sm' : 'text-slate-500'}">AI Напарник</button>
          <button onclick="ChatModule.setSubTab('random')" class="py-1.5 rounded-lg transition ${this.activeSubTab === 'random' ? 'bg-white dark:bg-slate-900 text-ocean-500 shadow-sm' : 'text-slate-500'}">${isUk ? 'Випадковий' : 'Случайный'}</button>
          <button onclick="ChatModule.setSubTab('friends')" class="py-1.5 rounded-lg transition ${this.activeSubTab === 'friends' ? 'bg-white dark:bg-slate-900 text-ocean-500 shadow-sm' : 'text-slate-500'}">${isUk ? 'Друзі' : 'Друзья'}</button>
        </div>
      </div>
    `;

    // Экран списка и добавления друзей
    if (this.activeSubTab === "friends") {
      const friends = AppState.data.friendsList || [];
      container.innerHTML = `
        <div class="flex flex-col flex-1 pb-20 fade-in">
          ${topTabsHtml}
          <div class="p-4 space-y-4">
            <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
              <label class="block text-xs font-bold">${isUk ? 'Додати друга за нікнеймом:' : 'Добавить друга по никнейму:'}</label>
              <div class="flex gap-2">
                <input id="friend-nick-input" type="text" placeholder="Alex" class="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs outline-none" />
                <button onclick="ChatModule.addFriendByNickname()" class="px-4 py-2.5 rounded-xl bg-ocean-600 text-white text-xs font-bold">
                  + ${isUk ? 'Додати' : 'Добавить'}
                </button>
              </div>
            </div>

            ${friends.length === 0 ? `
              <div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
                <div class="text-sm font-bold">${isUk ? 'Поки що немає друзів' : 'Список друзей пока пуст'}</div>
                <p class="text-xs text-slate-400">${isUk ? 'Додай друга за нікнеймом вище, щоб спілкуватися разом.' : 'Введи никнейм друга выше, чтобы тренироваться вместе.'}</p>
              </div>
            ` : `
              <div class="space-y-2">
                ${friends.map(f => `
                  <div class="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <span class="text-sm font-bold">${f}</span>
                    <button onclick="ChatModule.setSubTab('random')" class="px-3 py-1.5 rounded-xl bg-ocean-500/15 text-ocean-500 text-xs font-bold">
                      ${isUk ? 'Написати' : 'Написать'}
                    </button>
                  </div>
                `).join("")}
              </div>
            `}
          </div>
        </div>
      `;
      return;
    }

    const renderMessageText = (text) => {
      return text.split(" ").map(w => {
        const clean = w.replace(/[^a-zA-Z]/g, "");
        if (clean.length < 2) return w;
        return `<span onclick="ChatModule.inspectWordInChat('${clean}')" class="cursor-pointer hover:bg-ocean-500/20 rounded px-0.5 transition underline decoration-dotted underline-offset-4">${w}</span>`;
      }).join(" ");
    };

    const messagesHtml = this.messages.map(m => {
      const isMe = m.sender_name === myName;
      if (isMe) {
        return `
          <div class="flex justify-end mb-2.5">
            <div class="max-w-[80%] p-3 rounded-2xl rounded-tr-sm bg-ocean-600 text-white text-xs leading-relaxed shadow-sm">
              ${m.text}
            </div>
          </div>
        `;
      } else {
        return `
          <div class="flex flex-col mb-2.5">
            <span class="text-[10px] text-slate-400 ml-1 mb-0.5 font-bold">${m.sender_name}</span>
            <div class="max-w-[80%] p-3 rounded-2xl rounded-tl-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs leading-relaxed shadow-sm text-slate-800 dark:text-slate-200">
              ${renderMessageText(m.text)}
            </div>
          </div>
        `;
      }
    }).join("");

    container.innerHTML = `
      <div class="flex flex-col h-[calc(100vh-130px)] fade-in relative">
        ${topTabsHtml}

        <!-- Плашка задания на диалог -->
        <div class="px-4 py-2 bg-ocean-500/10 border-b border-ocean-500/20 flex items-center justify-between text-xs shrink-0">
          <div>
            <span class="text-slate-500 dark:text-slate-400 font-semibold">${isUk ? 'Завдання:' : 'Задание:'}</span>
            <span class="font-extrabold text-ocean-600 dark:text-ocean-400 ml-1">use "${this.missionWord}"</span>
          </div>
          <span class="text-[11px] font-bold px-2 py-0.5 rounded-full ${this.missionDone ? 'bg-mint-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-500'}">
            ${this.missionDone ? (isUk ? '✓ Виконано' : '✓ Выполнено') : (isUk ? 'У процесі' : 'В процессе')}
          </span>
        </div>

        <!-- Список сообщений -->
        <div id="chat-messages-box" class="flex-1 overflow-y-auto p-4 space-y-2">
          ${messagesHtml}
        </div>

        <!-- Всплывающее окно перевода при клике на слово -->
        <div id="word-inspect-modal" class="px-3 absolute bottom-16 left-0 right-0 z-20"></div>

        <!-- Поле ввода -->
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
