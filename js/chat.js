// ============================================================================
// ФАЙЛ: js/chat.js
// Приватные чаты 1-на-1, Поиск собеседника по уровню, Друзья с проверкой в БД и AI
// Лимит: 30 последних сообщений в чате + автоочистка чатов старше 24 часов
// ============================================================================

const ChatModule = {
  activeSubTab: "partners", // 'partners' | 'room' | 'ai'
  roomId: null,
  partnerName: null,
  partnerLevel: null,
  isSearchingPartner: false,
  waitingRoomRecordId: null,

  missionWord: "inevitable",
  missionDone: false,
  messages: [],
  aiMessages: [
    { sender_name: "Liam (AI)", text: "Hi! How was your day? Try using the word 'inevitable' in our conversation!" }
  ],
  subscription: null,
  matchSubscription: null,

  ensureConnected() {
    this.cleanupExpiredChats24h();
  },

  setSubTab(tab) {
    this.activeSubTab = tab;
    this.render();
  },

  // 1. Очистка сообщений и комнат старше 24 часов (экономия бесплатной БД)
  async cleanupExpiredChats24h() {
    if (!window.supabaseClient) return;
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    try {
      await window.supabaseClient.from("messages").delete().lt("created_at", cutoff);
      await window.supabaseClient.from("chat_rooms").delete().lt("created_at", cutoff);
    } catch (e) {}
  },

  // 2. Контроль лимита в 30 последних сообщений для текущей комнаты
  async enforce30MessagesLimit(targetRoomId) {
    if (!window.supabaseClient || !targetRoomId) return;
    try {
      const { data } = await window.supabaseClient
        .from("messages")
        .select("id")
        .eq("room_id", targetRoomId)
        .order("created_at", { ascending: false });

      if (data && data.length > 30) {
        const idsToDelete = data.slice(30).map(row => row.id);
        await window.supabaseClient.from("messages").delete().in("id", idsToDelete);
      }
    } catch (e) {}
  },

  // 3. Поиск случайного собеседника своего или соседнего уровня
  async findRandomPartner() {
    const isUk = AppState.data.nativeLang === "uk";
    const myName = (AppState.data.userName || "").trim();
    const myLevel = AppState.data.selectedLevel || "B1";

    if (!window.supabaseClient) {
      showToast(isUk ? "Підключи Supabase у js/auth.js" : "Подключи Supabase в js/auth.js");
      return;
    }

    if (this.isSearchingPartner) {
      await this.cancelPartnerSearch();
      return;
    }

    this.isSearchingPartner = true;
    this.render();

    await this.cleanupExpiredChats24h();
    const allowedLevels = GaplessDB.getTargetAndNeighborLevels(myLevel);

    try {
      // Ищем открытую комнату ожидания от пользователя подходящего уровня
      const { data: waitingRooms } = await window.supabaseClient
        .from("chat_rooms")
        .select("*")
        .eq("status", "waiting")
        .in("host_level", allowedLevels)
        .neq("host_name", myName)
        .order("created_at", { ascending: true })
        .limit(1);

      if (waitingRooms && waitingRooms.length > 0) {
        const room = waitingRooms[0];
        const { error } = await window.supabaseClient
          .from("chat_rooms")
          .update({
            guest_name: myName,
            guest_level: myLevel,
            status: "active"
          })
          .eq("id", room.id)
          .eq("status", "waiting");

        if (!error) {
          this.isSearchingPartner = false;
          showToast(isUk ? `🎉 Знайдено співрозмовника: ${room.host_name} (${room.host_level})` : `🎉 Собеседник найден: ${room.host_name} (${room.host_level})`);
          this.openPrivateRoom(room.room_key, room.host_name, room.host_level);
          return;
        }
      }

      // Если никого нет в очереди — создаем свою комнату ожидания
      const newRoomKey = `pair_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const { data: created, error: createErr } = await window.supabaseClient
        .from("chat_rooms")
        .insert([{
          room_key: newRoomKey,
          host_name: myName,
          host_level: myLevel,
          status: "waiting"
        }])
        .select()
        .single();

      if (createErr || !created) {
        this.isSearchingPartner = false;
        showToast(isUk ? "Помилка створення кімнати (виконай SQL скрипт)" : "Ошибка создания комнаты (выполни SQL скрипт)");
        this.render();
        return;
      }

      this.waitingRoomRecordId = created.id;

      // Подписываемся и ждем, пока к нам подключится второй игрок
      if (this.matchSubscription) {
        try { this.matchSubscription.unsubscribe(); } catch (e) {}
      }

      this.matchSubscription = window.supabaseClient
        .channel(`wait_${created.id}`)
        .on("postgres_changes", {
          event: "UPDATE",
          schema: "public",
          table: "chat_rooms",
          filter: `id=eq.${created.id}`
        }, (payload) => {
          const updated = payload.new;
          if (updated && updated.status === "active" && updated.guest_name) {
            this.isSearchingPartner = false;
            this.waitingRoomRecordId = null;
            if (this.matchSubscription) {
              try { this.matchSubscription.unsubscribe(); } catch (e) {}
              this.matchSubscription = null;
            }
            showToast(isUk ? `🎉 Співрозмовник підключився: ${updated.guest_name} (${updated.guest_level})` : `🎉 Собеседник подключился: ${updated.guest_name} (${updated.guest_level})`);
            this.openPrivateRoom(updated.room_key, updated.guest_name, updated.guest_level);
          }
        })
        .subscribe();

    } catch (e) {
      this.isSearchingPartner = false;
      this.render();
    }
  },

  async cancelPartnerSearch() {
    this.isSearchingPartner = false;
    if (this.matchSubscription) {
      try { this.matchSubscription.unsubscribe(); } catch (e) {}
      this.matchSubscription = null;
    }
    if (this.waitingRoomRecordId && window.supabaseClient) {
      try {
        await window.supabaseClient.from("chat_rooms").delete().eq("id", this.waitingRoomRecordId);
      } catch (e) {}
      this.waitingRoomRecordId = null;
    }
    this.render();
  },

  // 4. Открыть личный чат с другом (постоянный ключ комнаты для двух ников)
  openFriendChat(friendName, friendLevel = "") {
    const myName = (AppState.data.userName || "user").trim().toLowerCase();
    const cleanFriend = friendName.trim().toLowerCase();
    const pairKey = [myName, cleanFriend].sort().join("__");
    const deterministicRoomId = `dm_${pairKey}`;
    this.openPrivateRoom(deterministicRoomId, friendName, friendLevel || "Friend");
  },

  // 5. Подключение к приватной комнате 1-на-1 (только последние 30 сообщений)
  async openPrivateRoom(roomKey, partnerName, partnerLevel = "") {
    if (this.subscription) {
      try { this.subscription.unsubscribe(); } catch (e) {}
      this.subscription = null;
    }

    this.roomId = roomKey;
    this.partnerName = partnerName;
    this.partnerLevel = partnerLevel;
    this.activeSubTab = "room";
    this.messages = [];
    this.render();

    if (!window.supabaseClient) return;

    try {
      const { data } = await window.supabaseClient
        .from("messages")
        .select("*")
        .eq("room_id", this.roomId)
        .order("created_at", { ascending: false })
        .limit(30);

      if (data) {
        this.messages = data.reverse();
      }
    } catch (e) {}

    this.render();
    this.scrollToBottom();

    this.subscription = window.supabaseClient
      .channel(`private_${this.roomId}`)
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `room_id=eq.${this.roomId}`
      }, (payload) => {
        this.messages.push(payload.new);
        if (this.messages.length > 30) {
          this.messages = this.messages.slice(-30);
        }
        if (AppState.data.activeTab === "chat" && this.activeSubTab === "room") {
          this.render();
          this.scrollToBottom();
        }
      })
      .subscribe();
  },

  scrollToBottom() {
    setTimeout(() => {
      const box = document.getElementById("chat-messages-box");
      if (box) box.scrollTop = box.scrollHeight;
    }, 50);
  },

  // 6. Отправка сообщения
  async sendMessage() {
    const textInput = document.getElementById("chat-input-field");
    if (!textInput || !textInput.value.trim()) return;

    const text = textInput.value.trim();
    textInput.value = "";

    const isUk = AppState.data.nativeLang === "uk";
    const myName = AppState.data.userName || (isUk ? "Користувач" : "Пользователь");

    if (this.missionWord && text.toLowerCase().includes(this.missionWord.toLowerCase())) {
      this.missionDone = true;
      showToast(isUk ? `✓ Місію виконано: ${this.missionWord}` : `✓ Миссия выполнена: ${this.missionWord}`);
    }

    if (this.activeSubTab === "ai") {
      this.aiMessages.push({ sender_name: myName, text });
      this.render();
      this.scrollToBottom();
      setTimeout(() => {
        this.aiMessages.push({
          sender_name: "Liam (AI)",
          text: `Interesting thought! Could you elaborate a bit more on "${text.split(" ").slice(-2).join(" ")}"?`
        });
        if (AppState.data.activeTab === "chat" && this.activeSubTab === "ai") {
          this.render();
          this.scrollToBottom();
        }
      }, 650);
      return;
    }

    if (!window.supabaseClient || !this.roomId) return;

    try {
      await window.supabaseClient.from("messages").insert([
        { room_id: this.roomId, sender_name: myName, text }
      ]);
      await this.enforce30MessagesLimit(this.roomId);
    } catch (e) {
      showToast(isUk ? "Помилка відправки" : "Ошибка отправки");
    }
  },

  // 7. СТРОГАЯ ПРОВЕРКА СУЩЕСТВОВАНИЯ ПОЛЬЗОВАТЕЛЯ В БД ПРИ ДОБАВЛЕНИИ В ДРУЗЬЯ
  async addFriendByNickname(explicitNick = null) {
    const isUk = AppState.data.nativeLang === "uk";
    const input = document.getElementById("friend-nick-input");
    const rawNick = explicitNick || (input ? input.value.trim() : "");

    if (!rawNick) {
      showToast(isUk ? "Введи логін користувача" : "Введи логин пользователя");
      return;
    }

    const myName = (AppState.data.userName || "").trim();
    if (rawNick.toLowerCase() === myName.toLowerCase()) {
      showToast(isUk ? "Не можна додати самого себе" : "Нельзя добавить самого себя");
      return;
    }

    if (!window.supabaseClient) {
      showToast(isUk ? "База даних не підключена" : "База данных не подключена");
      return;
    }

    try {
      // Проверяем в таблице profiles, существует ли пользователь с таким username
      const { data: foundUsers, error } = await window.supabaseClient
        .from("profiles")
        .select("id, username, level")
        .ilike("username", rawNick)
        .limit(1);

      if (error || !foundUsers || foundUsers.length === 0) {
        showToast(isUk ? "❌ Користувача не знайдено" : "❌ Пользователь не найден");
        return;
      }

      const realUser = foundUsers[0];
      const realUsername = realUser.username;

      if (!Array.isArray(AppState.data.friendsList)) {
        AppState.data.friendsList = [];
      }

      const alreadyExists = AppState.data.friendsList.some(
        f => (typeof f === "string" ? f : f.username).toLowerCase() === realUsername.toLowerCase()
      );

      if (alreadyExists) {
        showToast(isUk ? `${realUsername} вже у твоєму списку друзів` : `${realUsername} уже в списке друзей`);
        return;
      }

      AppState.data.friendsList.push(realUsername);
      AppState.save();

      if (input) input.value = "";
      showToast(isUk ? `✓ ${realUsername} додано в друзі!` : `✓ ${realUsername} добавлен в друзья!`);
      this.render();
    } catch (e) {
      showToast(isUk ? "❌ Користувача не знайдено" : "❌ Пользователь не найден");
    }
  },

  isPartnerInFriends(name) {
    if (!name || !Array.isArray(AppState.data.friendsList)) return false;
    return AppState.data.friendsList.some(f => f.toLowerCase() === name.toLowerCase());
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
          <button onclick="GaplessDB.wordsMap.get('${wordModel.en.toLowerCase()}').speak()" class="w-9 h-9 rounded-xl bg-slate-800 flex items-center justify-center text-xs">🔊</button>
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
    showToast(isUk ? `+ «${wordEn}» додано у твої прогалини` : `+ «${wordEn}» добавлено в пробелы`);
    const modal = document.getElementById("word-inspect-modal");
    if (modal) modal.innerHTML = "";
  },

  render() {
    const container = document.getElementById("app-root");
    if (!container) return;
    const isUk = AppState.data.nativeLang === "uk";
    const myName = AppState.data.userName || (isUk ? "Користувач" : "Пользователь");
    const myLevel = AppState.data.selectedLevel || "B1";
    const allowedLevels = GaplessDB.getTargetAndNeighborLevels(myLevel);

    const topTabsHtml = `
      <div class="p-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <div class="grid grid-cols-3 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
          <button onclick="ChatModule.setSubTab('partners')" class="py-1.5 rounded-lg transition ${this.activeSubTab === 'partners' ? 'bg-white dark:bg-slate-900 text-ocean-500 shadow-sm' : 'text-slate-500'}">
            🔍 ${isUk ? 'Співрозмовники' : 'Собеседники'}
          </button>
          <button onclick="ChatModule.setSubTab('room')" class="py-1.5 rounded-lg transition ${this.activeSubTab === 'room' ? 'bg-white dark:bg-slate-900 text-ocean-500 shadow-sm' : 'text-slate-500'}">
            💬 ${this.partnerName ? this.partnerName : (isUk ? 'Мій діалог' : 'Мой диалог')}
          </button>
          <button onclick="ChatModule.setSubTab('ai')" class="py-1.5 rounded-lg transition ${this.activeSubTab === 'ai' ? 'bg-white dark:bg-slate-900 text-ocean-500 shadow-sm' : 'text-slate-500'}">
            🤖 AI Напарник
          </button>
        </div>
      </div>
    `;

    // ========================================================================
    // ВКЛАДКА 1: ПОИСК СЛУЧАЙНОГО СОБЕСЕДНИКА ПО УРОВНЮ + СПИСОК ДРУЗЕЙ
    // ========================================================================
    if (this.activeSubTab === "partners") {
      const friends = AppState.data.friendsList || [];

      container.innerHTML = `
        <div class="flex flex-col flex-1 pb-24 fade-in">
          ${topTabsHtml}
          <div class="p-4 space-y-4">
            
            <!-- Карточка поиска случайного собеседника по уровню -->
            <div class="p-5 rounded-3xl bg-gradient-to-br from-ocean-600 to-mint-600 text-white shadow-lg space-y-3">
              <div class="flex items-center justify-between">
                <span class="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-extrabold uppercase tracking-wider">
                  Matchmaking • ${allowedLevels.join(" / ")}
                </span>
                <span class="text-xs opacity-85">⏱ 24h Auto-Clean</span>
              </div>
              <div>
                <h3 class="text-base font-extrabold">${isUk ? 'Знайти випадкового співрозмовника' : 'Найти случайного собеседника'}</h3>
                <p class="text-xs opacity-90 mt-0.5">
                  ${isUk
                    ? `Підбір гравця твого або сусіднього рівня (${allowedLevels.join(", ")}). Зберігається до 30 останніх повідомлень.`
                    : `Подбор человека твоего или соседнего уровня (${allowedLevels.join(", ")}). Сохраняется до 30 последних сообщений.`}
                </p>
              </div>
              <button onclick="ChatModule.findRandomPartner()"
                class="w-full py-3 rounded-2xl font-extrabold text-xs shadow-md transition ${
                  this.isSearchingPartner
                    ? 'bg-amber-400 text-slate-950 animate-pulse'
                    : 'bg-white text-ocean-600 hover:bg-slate-100'
                }">
                ${this.isSearchingPartner
                  ? (isUk ? '⏳ Пошук співрозмовника... (Натисни, щоб скасувати)' : '⏳ Поиск собеседника... (Нажми для отмены)')
                  : (isUk ? '🎲 Знайти випадкового співрозмовника' : '🎲 Найти случайного собеседника')}
              </button>
            </div>

            <!-- Поиск и добавление друга по логину с проверкой в БД -->
            <div class="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-2.5 shadow-sm">
              <label class="block text-xs font-extrabold">${isUk ? 'Знайти друга за логіном (перевірка в БД):' : 'Найти друга по логину (проверка в БД):'}</label>
              <div class="flex gap-2">
                <input id="friend-nick-input" type="text" placeholder="${isUk ? 'Введи точний логін...' : 'Введи точный логин...'}"
                  onkeydown="if(event.key==='Enter') ChatModule.addFriendByNickname()"
                  class="flex-1 px-3.5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs outline-none focus:ring-2 focus:ring-ocean-500" />
                <button onclick="ChatModule.addFriendByNickname()" class="px-4 py-2.5 rounded-xl bg-ocean-600 hover:bg-ocean-500 text-white text-xs font-bold transition">
                  + ${isUk ? 'Додати' : 'Добавить'}
                </button>
              </div>
            </div>

            <!-- Список друзей -->
            <div class="space-y-2">
              <div class="flex items-center justify-between px-1">
                <span class="text-xs font-extrabold uppercase tracking-wider text-slate-400">${isUk ? 'Мої друзі' : 'Мои друзья'} (${friends.length})</span>
              </div>

              ${friends.length === 0 ? `
                <div class="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-1">
                  <div class="text-sm font-bold">${isUk ? 'Список друзів порожній' : 'Список друзей пока пуст'}</div>
                  <p class="text-xs text-slate-400">${isUk ? 'Знайди друга за логіном або додай співрозмовника під час випадкового чату.' : 'Найди друга по логину выше или добавь собеседника из случайного чата.'}</p>
                </div>
              ` : `
                <div class="space-y-2">
                  ${friends.map(f => `
                    <div class="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                      <div class="flex items-center gap-2.5">
                        <div class="w-8 h-8 rounded-xl bg-ocean-500/15 text-ocean-500 font-extrabold text-xs flex items-center justify-center">
                          ${f.slice(0, 1).toUpperCase()}
                        </div>
                        <span class="text-sm font-bold">@${f}</span>
                      </div>
                      <button onclick="ChatModule.openFriendChat('${f}')" class="px-3.5 py-1.5 rounded-xl bg-ocean-600 hover:bg-ocean-500 text-white text-xs font-bold transition shadow-sm">
                        💬 ${isUk ? 'Відкрити чат' : 'Открыть чат'}
                      </button>
                    </div>
                  `).join("")}
                </div>
              `}
            </div>

          </div>
        </div>
      `;
      return;
    }

    // Если открыта вкладка 'room', но собеседник еще не выбран
    if (this.activeSubTab === "room" && !this.roomId) {
      container.innerHTML = `
        <div class="flex flex-col flex-1 pb-24 fade-in">
          ${topTabsHtml}
          <div class="p-6 my-auto text-center space-y-3">
            <div class="w-14 h-14 rounded-2xl bg-ocean-500/15 text-ocean-500 flex items-center justify-center text-2xl mx-auto">💬</div>
            <div class="text-base font-extrabold">${isUk ? 'Немає активного діалогу' : 'Нет активного диалога'}</div>
            <p class="text-xs text-slate-400 max-w-xs mx-auto">
              ${isUk ? 'Обери друга зі списку або натисни «Знайти випадкового співрозмовника».' : 'Выбери друга из списка или нажми «Найти случайного собеседника».'}
            </p>
            <button onclick="ChatModule.setSubTab('partners')" class="px-4 py-2.5 rounded-xl bg-ocean-600 text-white text-xs font-bold">
              🔍 ${isUk ? 'Перейти до пошуку' : 'Перейти к поиску'}
            </button>
          </div>
        </div>
      `;
      return;
    }

    // ========================================================================
    // ВКЛАДКА 2 и 3: АКТИВНЫЙ ЧАТ 1-НА-1 ИЛИ AI-НАПАРНИК
    // ========================================================================
    const activeList = this.activeSubTab === "ai" ? this.aiMessages : this.messages;

    const renderMessageText = (text) => {
      return text.split(" ").map(w => {
        const clean = w.replace(/[^a-zA-Z]/g, "");
        if (clean.length < 2) return w;
        return `<span onclick="ChatModule.inspectWordInChat('${clean}')" class="cursor-pointer hover:bg-ocean-500/20 rounded px-0.5 transition underline decoration-dotted underline-offset-4">${w}</span>`;
      }).join(" ");
    };

    const messagesHtml = activeList.length === 0 ? `
      <div class="text-center py-10 text-xs text-slate-400">
        ${isUk ? 'Привітайся першим англійською! Повідомлення понад 30 автоматично видаляються.' : 'Поздоровайся первым на английском! В чате хранятся только последние 30 сообщений.'}
      </div>
    ` : activeList.map(m => {
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

    const canAddPartner = this.activeSubTab === "room" && this.partnerName && !this.isPartnerInFriends(this.partnerName);

    container.innerHTML = `
      <div class="flex flex-col h-[calc(100vh-130px)] fade-in relative">
        ${topTabsHtml}

        <!-- Верхняя плашка собеседника и миссии -->
        <div class="px-4 py-2 bg-ocean-500/10 border-b border-ocean-500/20 flex items-center justify-between text-xs shrink-0">
          <div class="flex items-center gap-2">
            ${this.activeSubTab === "room" ? `
              <span class="font-extrabold text-slate-800 dark:text-slate-100">@${this.partnerName}</span>
              <span class="text-[10px] px-2 py-0.5 rounded-full bg-ocean-500/20 text-ocean-500 font-bold">${this.partnerLevel || ''}</span>
            ` : `
              <span class="text-slate-500 dark:text-slate-400 font-semibold">${isUk ? 'Завдання:' : 'Задание:'}</span>
              <span class="font-extrabold text-ocean-600 dark:text-ocean-400">use "${this.missionWord}"</span>
            `}
          </div>

          <div class="flex items-center gap-2">
            ${canAddPartner ? `
              <button onclick="ChatModule.addFriendByNickname('${this.partnerName}')" class="px-2.5 py-1 rounded-lg bg-mint-600 hover:bg-mint-500 text-white text-[11px] font-bold transition">
                + ${isUk ? 'У друзі' : 'В друзья'}
              </button>
            ` : ''}
            <span class="text-[10px] text-slate-400 font-bold">${activeList.length}/30</span>
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
