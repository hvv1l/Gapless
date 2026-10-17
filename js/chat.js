// ============================================================================
// ФАЙЛ: js/chat.js
// Модуль 3: Онлайн-чат (Supabase Realtime + резервный режим), друзья и переводчик
// ============================================================================

// 🔑 ВСТАВЬ СВОИ ДАННЫЕ ИЗ SUPABASE PROJECT SETTINGS ЗДЕСЬ (если уже создал проект):
const SUPABASE_URL = "https://ТВОЙ_ПРОЕКТ.supabase.co";
const SUPABASE_ANON_KEY = "ТВОЙ_ANON_PUBLIC_KEY";

// Инициализируем клиент только если вставлены реальные ключи
window.supabaseClient = (
  window.supabase &&
  SUPABASE_URL.startsWith("https://") &&
  !SUPABASE_URL.includes("ТВОЙ_ПРОЕКТ")
) ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

const ChatModule = {
  activeSubTab: "ai",      // По умолчанию открываем AI-напарника
  roomId: "global_random",
  messages: [
    { sender_name: "Liam (AI)", text: "Hi! How is your English practice going today?" }
  ],
  subscription: null,
  isConnected: false,

  ensureConnected() {
    if (!this.isConnected && this.activeSubTab === "random") {
      this.initRealtimeChat();
    }
  },

  setSubTab(tab) {
    this.activeSubTab = tab;
    if (this.subscription) {
      this.subscription.unsubscribe();
      this.subscription = null;
    }

    if (tab === "ai") {
      this.roomId = "ai_tutor_room";
      this.messages = [
        { sender_name: "Liam (AI)", text: "Hi! I'm your AI partner. Ready to practice some new words?" }
      ];
      this.render();
    } else if (tab === "random") {
      this.roomId = "global_random";
      this.initRealtimeChat();
    } else if (tab === "friends") {
      this.roomId = "friends_room";
      this.render();
    }
  },

  async initRealtimeChat() {
    this.isConnected = true;
    const isUk = AppState.data.nativeLang === "uk";

    if (!window.supabaseClient) {
      // Если ключи Supabase еще не вставлены — работаем в демо-режиме без ошибок
      this.messages = [
        { sender_name: "System", text: "Provide Supabase keys in js/chat.js to enable live global chat. Meanwhile, practice here!" }
      ];
      if (AppState.data.activeTab === "chat") this.render();
      return;
    }

    showToast(isUk ? "Підключення до онлайн-чату..." : "Подключение к онлайн-чату...");

    const { data, error } = await window.supabaseClient
      .from("messages")
      .select("*")
      .eq("room_id", this.roomId)
      .order("created_at", { ascending: true })
      .limit(30);

    if (!error && data) {
      this.messages = data;
    }
    if (AppState.data.activeTab === "chat") this.render();

    this.subscription = window.supabaseClient
      .channel(`room_${this.roomId}`)
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages", filter: `room_id=eq.${this.roomId}` }, (payload) => {
        this.messages.push(payload.new);
        if (AppState.data.activeTab === "chat") {
          this.render();
          const box = document.getElementById("chat-messages-box");
          if (box) box.scrollTop = box.scrollHeight;
        }
      })
      .subscribe();
  },

  async sendMessage() {
    const textInput = document.getElementById("chat-input-field");
    if (!textInput || !textInput.value.trim()) return;

    const text = textInput.value.trim();
    textInput.value = "";

    const myName = AppState.data.userName || (AppState.data.nativeLang === "uk" ? "Користувач" : "Пользователь");

    if (this.activeSubTab === "ai" || !window.supabaseClient) {
      this.messages.push({ sender_name: myName, text });
      this.render();
      setTimeout(() => {
        this.messages.push({ sender_name: "Liam (AI)", text: "That's a great point! Could you tell me a bit more about it?" });
        if (AppState.data.activeTab === "chat") this.render();
      }, 700);
      return;
    }

    const { error } = await window.supabaseClient.from("messages").insert([
      { room_id: this.roomId, sender_name: myName, text }
    ]);
    if (error) {
      showToast("Ошибка отправки: " + error.message);
    }
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
    if (!container) return;
    const lang = AppState.data.nativeLang;
    const isUk = lang === "uk";
    const myName = AppState.data.userName || (isUk ? "Користувач" : "Пользователь");

    if (this.activeSubTab === "friends") {
      const friends = AppState.data.friendsList || [];
      container.innerHTML = `
        <div class="p-4 space-y-4 pb-24 fade-in">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-extrabold">${isUk ? 'Мої друзі' : 'Мои друзья'}</h2>
            <button onclick="ChatModule.setSubTab('ai')" class="text-xs font-bold text-ocean-500">${isUk ? '← До чату' : '← К чату'}</button>
          </div>

          <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5">
            <label class="block text-xs font-bold">${isUk ? 'Додати друга за нікнеймом:' : 'Добавить друга по никнейму:'}</label>
            <div class="flex gap-2">
              <input id="friend-nick-input" type="text" placeholder="Например: Alex" class="flex-1 px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs outline-none" />
              <button onclick="const v=document.getElementById('friend-nick-input').value.trim(); if(v){ AppState.data.friendsList = AppState.data.friendsList || []; AppState.data.friendsList.push(v); AppState.save(); ChatModule.render(); showToast('✓ Друг добавлен'); }"
                class="px-4 py-2 rounded-xl bg-ocean-600 text-white text-xs font-bold">
                + ${isUk ? 'Додати' : 'Добавить'}
              </button>
            </div>
          </div>

          ${friends.length === 0 ? `
            <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
              <div class="text-sm font-bold">${isUk ? 'Список друзів порожній' : 'Список друзей пока пуст'}</div>
              <p class="text-xs text-slate-400">${isUk ? 'Введи нікнейм вище, щоб додати співрозмовника.' : 'Введи никнейм выше, чтобы добавить собеседника.'}</p>
            </div>
          ` : `
            <div class="space-y-2">
              ${friends.map(f => `
                <div class="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                  <span class="text-sm font-bold">${f}</span>
                  <button onclick="ChatModule.setSubTab('random')" class="px-3 py-1.5 rounded-xl bg-ocean-500/15 text-ocean-500 text-xs font-bold">Написать</button>
                </div>
              `).join("")}
            </div>
          `}
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
            <button onclick="ChatModule.setSubTab('friends')" class="py-1.5 rounded-lg transition ${this.activeSubTab === 'friends' ? 'bg-white dark:bg-
