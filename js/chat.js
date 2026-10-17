// ============================================================================
// ФАЙЛ: js/chat.js
// Модуль 3: Реальный онлайн-чат на базе Supabase Realtime WebSocket
// ============================================================================

// 🔑 ВСТАВЬ СВОИ ДАННЫЕ ИЗ SUPABASE PROJECT SETTINGS ЗДЕСЬ:
const SUPABASE_URL = "https://nmlaqvrfxsksuwbjusjh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5tbGFxdnJmeHNrc3V3Ymp1c2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxODYzNzUsImV4cCI6MjEwNzc2MjM3NX0._26CSKgxQ7R3rvF6eTiesNtOumPQC5bCVa9RW6VLZEk";

// Подключаем официальный клиент Supabase из CDN
const supabaseClient = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const ChatModule = {
  activeSubTab: "random",  // По умолчанию сразу переводим в живой поиск
  roomId: "global_random", // Общая комната для случайных пользователей
  messages: [],
  subscription: null,

  setSubTab(tab) {
    this.activeSubTab = tab;
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    if (tab === "ai") {
      this.roomId = "ai_tutor_room";
      this.messages = [
        { sender_name: "Liam (AI)", text: "Hi! I'm your AI tutor. How is your English practice going today?" }
      ];
    } else if (tab === "random") {
      this.roomId = "global_random";
      this.initRealtimeChat();
    } else if (tab === "friends") {
      this.roomId = "friends_room";
      this.messages = [];
    }
    this.render();
  },

  async initRealtimeChat() {
    if (!supabaseClient) {
      showToast("Ошибка: Supabase не подключен. Проверь ключи.");
      return;
    }

    const isUk = AppState.data.nativeLang === "uk";
    showToast(isUk ? "Підключення до онлайн-чату..." : "Подключение к онлайн-чату...");

    // 1. Загружаем последние 30 сообщений из облачной базы
    const { data, error } = await supabaseClient
      .from("messages")
      .select("*")
      .eq("room_id", this.roomId)
      .order("created_at", { ascending: true })
      .limit(30);

    if (!error && data) {
      this.messages = data;
    }
    this.render();

    // 2. Подписываемся на новые сообщения в реальном времени (WebSockets)
    this.subscription = supabaseClient
      .channel(`room_${this.roomId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${this.roomId}` }, (payload) => {
        this.messages.push(payload.new);
        this.render();
        const box = document.getElementById("chat-messages-box");
        if (box) box.scrollTop = box.scrollHeight;
      })
      .subscribe();
  },

  async sendMessage() {
    const textInput = document.getElementById("chat-input-field");
    if (!textInput || !textInput.value.trim()) return;

    const text = textInput.value.trim();
    textInput.value = "";

    const myName = AppState.data.userName || (AppState.data.nativeLang === "uk" ? "Гість" : "Гость");

    if (this.activeSubTab === "ai") {
      // Локальный ответ ИИ
      this.messages.push({ sender_name: myName, text });
      this.messages.push({ sender_name: "Liam (AI)", text: "That's awesome! Keep practicing every day." });
      this.render();
      return;
    }

    // Отправка реального сообщения в облачную базу Supabase
    if (supabaseClient) {
      const { error } = await supabaseClient.from("messages").insert([
        { room_id: this.roomId, sender_name: myName, text }
      ]);
      if (error) {
        showToast("Ошибка отправки: " + error.message);
      }
    }
  },

  inspectWordInChat(rawWord) {
    const wordModel = GaplessDB.findOrCreateWord(rawWord, "слово з діалогу");
    if (!wordModel) return;

    const lang = AppState.data.nativeLang;
    const isUk = lang === "uk";
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
    const isUk = AppState.data.nativeLang === "uk";
    showToast(isUk ? `+ «${wordEn}» додано у твої прогалини` : `+ «${wordEn}» отправлено в твои пробелы`);
    document.getElementById("word-inspect-modal").innerHTML = "";
  },

  render() {
    const container = document.getElementById("app-root");
    const lang = AppState.data.nativeLang;
    const isUk = lang === "uk";
    const myName = AppState.data.userName || (isUk ? "Гість" : "Гость");

    if (this.activeSubTab === "friends") {
      container.innerHTML = `
        <div class="p-4 space-y-4 pb-24 fade-in">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-extrabold">${isUk ? 'Мої друзі' : 'Мои друзья'}</h2>
            <button onclick="ChatModule.setSubTab('random')" class="text-xs font-bold text-ocean-500">${isUk ? '← До онлайн-чату' : '← К онлайн-чату'}</button>
          </div>
          <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-2">
            <div class="text-2xl">👥</div>
            <div class="text-sm font-bold">${isUk ? 'Поки що немає друзів' : 'Пока нет друзей'}</div>
          </div>
        </div>
      `;
      return;
    }

    const renderMessageText = (text) => {
      const words = text.split(" ");
      return words.map(w => {
        const clean = w.replace(/[^a-zA-Z]/g, "");
        if (clean.length < 2) return w;
        return `<span onclick="ChatModule.inspectWordInChat('${clean}')" class="cursor-pointer hover:bg-sky-500/20 rounded px-0.5 transition underline decoration-dotted underline-offset-4">${w}</span>`;
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
      <div class="flex flex-col h-[calc(100vh-135px)] fade-in relative">
        <div class="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between shrink-0">
          <div class="grid grid-cols-3 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-[11px] font-bold w-full max-w-xs mx-auto">
            <button onclick="ChatModule.setSubTab('ai')" class="py-1.5 rounded-lg transition ${this.activeSubTab === 'ai' ? 'bg-white dark:bg-slate-900 text-ocean-500 shadow-sm' : 'text-slate-500'}">AI Напарник</button>
            <button onclick="ChatModule.setSubTab('random')" class="py-1.5 rounded-lg transition ${this.activeSubTab === 'random' ? 'bg-white dark:bg-slate-900 text-ocean-500 shadow-sm' : 'text-slate-500'}">${isUk ? 'Онлайн чат' : 'Онлайн чат'}</button>
            <button onclick="ChatModule.setSubTab('friends')" class="py-1.5 rounded-lg transition ${this.activeSubTab === 'friends' ? 'bg-white dark:bg-slate-900 text-ocean-500 shadow-sm' : 'text-slate-500'}">${isUk ? 'Друзі' : 'Друзья'}</button>
          </div>
        </div>

        <div class="px-4 py-2 bg-white/50 dark:bg-slate-900/50 border-b border-slate-200/50 dark:border-slate-800/50 flex items-center justify-between shrink-0">
          <div class="flex items-center gap-2.5">
            <div class="w-8 h-8 rounded-full bg-ocean-500/20 flex items-center justify-center text-sm">🌐</div>
            <div>
              <div class="text-xs font-bold">${isUk ? 'Глобальний чат практики' : 'Глобальный чат практики'}</div>
              <div class="text-[10px] text-emerald-500 font-bold">● Live WebSocket Connected</div>
            </div>
          </div>
        </div>

        <div id="chat-messages-box" class="flex-1 overflow-y-auto p-4 space-y-2">
          ${messagesHtml}
        </div>

        <div id="word-inspect-modal" class="px-3 absolute bottom-16 left-0 right-0 z-20"></div>

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

// При старте модуля сразу инициализируем чат
ChatModule.initRealtimeChat();
