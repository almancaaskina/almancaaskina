/* ==========================================================
   BIG UPDATE 7
   - Story layout repair
   - Daily study goals
   - German pronunciation
   - Reader appearance controls
   - Local data export/import/reset
   - Favorite-word practice session
   ========================================================== */

const DAILY_ACTIVITY_KEY_V7 = "almancaAskinaDailyActivityV1";
const READER_PREFS_KEY_V7 = "almancaAskinaReaderPrefsV1";

function getTodayKeyV7() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getDailyActivityV7() {
  const fallback = { date: getTodayKeyV7(), searches: [], stories: [], gameSessions: 0 };
  const stored = safeReadStorage(DAILY_ACTIVITY_KEY_V7, fallback);
  if (!stored || stored.date !== getTodayKeyV7()) return fallback;
  return {
    date: stored.date,
    searches: Array.isArray(stored.searches) ? stored.searches : [],
    stories: Array.isArray(stored.stories) ? stored.stories : [],
    gameSessions: Number(stored.gameSessions) || 0
  };
}

function saveDailyActivityV7(activity) {
  safeWriteStorage(DAILY_ACTIVITY_KEY_V7, activity);
  renderDailyStudyV7();
}

function recordDailySearchV7(query) {
  const activity = getDailyActivityV7();
  const clean = normalizeAnswer(query);
  if (clean && !activity.searches.includes(clean)) activity.searches.push(clean);
  saveDailyActivityV7(activity);
}

function recordDailyStoryV7(storyId) {
  const activity = getDailyActivityV7();
  if (storyId && !activity.stories.includes(storyId)) activity.stories.push(storyId);
  saveDailyActivityV7(activity);
}

function recordDailyGameV7() {
  const activity = getDailyActivityV7();
  activity.gameSessions += 1;
  saveDailyActivityV7(activity);
}

function renderDailyStudyV7() {
  const grid = document.getElementById("dailyTaskGrid");
  const percent = document.getElementById("dailyStudyPercent");
  const bar = document.getElementById("dailyStudyProgressBar");
  if (!grid || !percent || !bar) return;

  const activity = getDailyActivityV7();
  const tasks = [
    {
      key: "dictionary",
      label: "5 farklı kelime ara",
      detail: `${Math.min(activity.searches.length, 5)} / 5`,
      ratio: Math.min(activity.searches.length / 5, 1),
      target: "dictionary"
    },
    {
      key: "reading",
      label: "1 hikâye tamamla",
      detail: `${Math.min(activity.stories.length, 1)} / 1`,
      ratio: Math.min(activity.stories.length, 1),
      target: "reading"
    },
    {
      key: "game",
      label: "1 oyun oturumu bitir",
      detail: `${Math.min(activity.gameSessions, 1)} / 1`,
      ratio: Math.min(activity.gameSessions, 1),
      target: "game"
    }
  ];

  const overall = Math.round(tasks.reduce((sum, task) => sum + task.ratio, 0) / tasks.length * 100);
  percent.textContent = `${overall}%`;
  bar.style.width = `${overall}%`;

  grid.innerHTML = tasks.map(task => `
    <button type="button" class="daily-task-card ${task.ratio >= 1 ? "is-done" : ""}" data-daily-target="${task.target}">
      <span>${task.ratio >= 1 ? "✓" : "○"}</span>
      <div>
        <strong>${escapeHtml(task.label)}</strong>
        <small>${escapeHtml(task.detail)}</small>
      </div>
    </button>
  `).join("");

  grid.querySelectorAll("[data-daily-target]").forEach(button => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.dailyTarget);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

/* Wrap existing activity functions without changing their original behavior. */
const baseAddSearchHistoryV7 = addSearchHistory;
addSearchHistory = function(query) {
  baseAddSearchHistoryV7(query);
  recordDailySearchV7(query);
};

const baseToggleStoryCompletedV7 = toggleStoryCompleted;
toggleStoryCompleted = function(storyId) {
  const wasCompleted = isStoryCompleted(storyId);
  baseToggleStoryCompletedV7(storyId);
  if (!wasCompleted && isStoryCompleted(storyId)) recordDailyStoryV7(storyId);
};

const baseFinishGameSessionV7 = finishGameSessionV6;
finishGameSessionV6 = function() {
  const shouldRecord = gameSessionV6 && !gameSessionV6.finished;
  baseFinishGameSessionV7();
  if (shouldRecord) recordDailyGameV7();
};

/* ---------- German pronunciation ---------- */

function speakGermanV7(text) {
  const clean = String(text || "").trim();
  if (!clean || !("speechSynthesis" in window)) {
    alert("Bu tarayıcı sesli telaffuzu desteklemiyor.");
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = "de-DE";
  utterance.rate = 0.86;
  utterance.pitch = 1;

  const voices = window.speechSynthesis.getVoices();
  const germanVoice = voices.find(voice => /^de(-|_)/i.test(voice.lang));
  if (germanVoice) utterance.voice = germanVoice;

  window.speechSynthesis.speak(utterance);
}

const baseRenderFoundResultV7 = renderFoundResult;
renderFoundResult = function(item) {
  baseRenderFoundResultV7(item);
  const title = document.querySelector("#resultPreview .result-title");
  if (title && !document.getElementById("dictionarySpeakBtn")) {
    title.insertAdjacentHTML("afterend", `
      <button type="button" class="speak-word-btn" id="dictionarySpeakBtn" aria-label="Almanca kelimeyi seslendir">
        🔊 Dinle
      </button>
    `);
    document.getElementById("dictionarySpeakBtn")?.addEventListener("click", () => {
      speakGermanV7(item.word);
    });
  }
};

const baseCreateReaderWordMarkupV7 = createReaderWordMarkup;
createReaderWordMarkup = function(surface, lines, missing = false) {
  const safeLines = (lines || []).filter(Boolean).map((line, index) => {
    const tag = index === 0 ? "strong" : "span";
    return `<${tag}>${escapeHtml(String(line))}</${tag}>`;
  }).join("");

  return `<span class="reader-word${missing ? " is-missing" : ""}" tabindex="0">${escapeHtml(surface)}
    <span class="reader-tooltip" role="tooltip">
      ${safeLines}
      <button type="button" class="reader-speak-btn" data-reader-speak="${escapeHtml(surface)}" aria-label="${escapeHtml(surface)} kelimesini dinle">🔊 Dinle</button>
    </span>
  </span>`;
};

document.addEventListener("click", event => {
  const button = event.target.closest("[data-reader-speak]");
  if (!button) return;
  event.preventDefault();
  event.stopPropagation();
  speakGermanV7(button.dataset.readerSpeak);
});

/* ---------- Reader controls ---------- */

function getReaderPrefsV7() {
  const stored = safeReadStorage(READER_PREFS_KEY_V7, {});
  return {
    fontSize: Number(stored.fontSize) || 19,
    lineHeight: Number(stored.lineHeight) || 1.9,
    focus: Boolean(stored.focus)
  };
}

function saveReaderPrefsV7(prefs) {
  safeWriteStorage(READER_PREFS_KEY_V7, prefs);
  applyReaderPrefsV7();
}

function applyReaderPrefsV7() {
  const reader = document.getElementById("readerText");
  const card = document.getElementById("readerCard");
  if (!reader || !card) return;

  const prefs = getReaderPrefsV7();
  reader.style.fontSize = `${prefs.fontSize}px`;
  reader.style.lineHeight = String(prefs.lineHeight);
  card.classList.toggle("reader-focus-mode", prefs.focus);

  const sizeLabel = document.getElementById("readerSizeLabel");
  if (sizeLabel) sizeLabel.textContent = `${prefs.fontSize}px`;

  const lineLabel = document.getElementById("readerLineLabel");
  if (lineLabel) lineLabel.textContent = prefs.lineHeight.toFixed(1);

  const focusButton = document.getElementById("readerFocusBtn");
  if (focusButton) {
    focusButton.classList.toggle("is-active", prefs.focus);
    focusButton.textContent = prefs.focus ? "Odak modu açık" : "Odak modu";
  }
}

function injectReaderControlsV7() {
  const card = document.getElementById("readerCard");
  const meta = document.getElementById("readerMeta");
  if (!card || !meta) return;

  document.getElementById("readerControlsV7")?.remove();
  meta.insertAdjacentHTML("afterend", `
    <div class="reader-controls" id="readerControlsV7">
      <div class="reader-control-group">
        <button type="button" data-reader-size="-1" aria-label="Yazıyı küçült">A−</button>
        <span id="readerSizeLabel">19px</span>
        <button type="button" data-reader-size="1" aria-label="Yazıyı büyüt">A+</button>
      </div>
      <div class="reader-control-group">
        <button type="button" data-reader-line="-0.1" aria-label="Satır aralığını azalt">Sık</button>
        <span id="readerLineLabel">1.9</span>
        <button type="button" data-reader-line="0.1" aria-label="Satır aralığını artır">Rahat</button>
      </div>
      <button type="button" class="reader-focus-btn" id="readerFocusBtn">Odak modu</button>
    </div>
  `);

  document.querySelectorAll("[data-reader-size]").forEach(button => {
    button.addEventListener("click", () => {
      const prefs = getReaderPrefsV7();
      prefs.fontSize = Math.max(15, Math.min(27, prefs.fontSize + Number(button.dataset.readerSize)));
      saveReaderPrefsV7(prefs);
    });
  });

  document.querySelectorAll("[data-reader-line]").forEach(button => {
    button.addEventListener("click", () => {
      const prefs = getReaderPrefsV7();
      prefs.lineHeight = Math.max(1.5, Math.min(2.4, Number((prefs.lineHeight + Number(button.dataset.readerLine)).toFixed(1))));
      saveReaderPrefsV7(prefs);
    });
  });

  document.getElementById("readerFocusBtn")?.addEventListener("click", () => {
    const prefs = getReaderPrefsV7();
    prefs.focus = !prefs.focus;
    saveReaderPrefsV7(prefs);
  });

  applyReaderPrefsV7();
}

const baseOpenStoryV7 = openStory;
openStory = function(storyId) {
  baseOpenStoryV7(storyId);
  injectReaderControlsV7();
};

/* ---------- Export / import / reset local data ---------- */

const LOCAL_DATA_KEYS_V7 = [
  FAVORITES_KEY,
  SEARCH_HISTORY_KEY,
  LAST_STORY_KEY,
  GAME_BEST_KEY,
  READING_PROGRESS_KEY,
  DAILY_ACTIVITY_KEY_V7,
  READER_PREFS_KEY_V7
];

function exportLocalDataV7() {
  const data = {
    app: "Almanca Aşkına",
    version: 1,
    exportedAt: new Date().toISOString(),
    values: {}
  };

  LOCAL_DATA_KEYS_V7.forEach(key => {
    const value = localStorage.getItem(key);
    if (value !== null) data.values[key] = value;
  });

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `almanca-askina-yedek-${getTodayKeyV7()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function importLocalDataV7(file) {
  try {
    const data = JSON.parse(await file.text());
    if (!data || data.app !== "Almanca Aşkına" || typeof data.values !== "object") {
      throw new Error("Geçersiz yedek");
    }

    LOCAL_DATA_KEYS_V7.forEach(key => localStorage.removeItem(key));
    Object.entries(data.values).forEach(([key, value]) => {
      if (LOCAL_DATA_KEYS_V7.includes(key) && typeof value === "string") {
        localStorage.setItem(key, value);
      }
    });

    alert("Yedek başarıyla yüklendi. Sayfa yenilenecek.");
    location.reload();
  } catch (error) {
    alert("Bu dosya geçerli bir Almanca Aşkına yedeği değil.");
  }
}

function resetLocalDataV7() {
  if (!confirm("Kelime defteri, okuma ilerlemesi, skorlar ve ayarlar silinsin mi?")) return;
  LOCAL_DATA_KEYS_V7.forEach(key => localStorage.removeItem(key));
  location.reload();
}

/* ---------- Favorite-word practice ---------- */

const baseRenderWordNotebookV7 = renderWordNotebook;
renderWordNotebook = function() {
  baseRenderWordNotebookV7();

  const drawer = document.getElementById("dictionaryDrawer");
  const favoriteIds = getFavoriteIds();
  const words = dictionaryData.filter(item => favoriteIds.has(getEntryStorageId(item)));

  if (drawer && words.length >= 2 && !document.getElementById("practiceFavoritesBtn")) {
    const head = drawer.querySelector(".drawer-head");
    head?.insertAdjacentHTML("afterend", `
      <button type="button" class="practice-favorites-btn" id="practiceFavoritesBtn">
        Bu kelimelerle test başlat (${words.length})
      </button>
    `);

    document.getElementById("practiceFavoritesBtn")?.addEventListener("click", () => {
      currentGameMode = "meaning";
      document.querySelectorAll("[data-game-mode]").forEach(button => {
        button.classList.toggle("is-active", button.dataset.gameMode === "meaning");
      });

      const queue = [...words]
        .sort(() => Math.random() - 0.5)
        .slice(0, 10)
        .map(item => ({ ...item, gameMode: "meaning" }));

      startGameSessionV6(queue);
      document.getElementById("game")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  renderDailyStudyV7();

  document.getElementById("exportLocalDataBtn")?.addEventListener("click", exportLocalDataV7);
  document.getElementById("importLocalDataBtn")?.addEventListener("click", () => {
    document.getElementById("importLocalDataInput")?.click();
  });
  document.getElementById("importLocalDataInput")?.addEventListener("change", event => {
    const file = event.target.files?.[0];
    if (file) importLocalDataV7(file);
    event.target.value = "";
  });
  document.getElementById("resetLocalDataBtn")?.addEventListener("click", resetLocalDataV7);
});
