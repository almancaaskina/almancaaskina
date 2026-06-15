/* ==========================================================
   BIG UPDATE 8 — LEARNING SYSTEM
   1) Spaced repetition deck
   2) Story vocabulary quizzes
   3) Save words directly from stories
   4) Due-review daily workflow
   5) Progress dashboard + 7-day activity
   6) Smart notebook filters and weak-word practice
   ========================================================== */

const REVIEW_DECK_KEY_V8 = "almancaAskinaReviewDeckV1";
const STORY_QUIZ_KEY_V8 = "almancaAskinaStoryQuizV1";
const ACTIVITY_LOG_KEY_V8 = "almancaAskinaActivityLogV1";
const REVIEW_INTERVALS_V8 = [1, 3, 7, 14, 30, 60, 120];

let notebookFilterV8 = "all";
let activeStoryQuizV8 = null;

LOCAL_DATA_KEYS_V7.push(REVIEW_DECK_KEY_V8, STORY_QUIZ_KEY_V8, ACTIVITY_LOG_KEY_V8);

function dateKeyV8(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function addDaysV8(days) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return dateKeyV8(date);
}

function getReviewDeckV8() {
  const value = safeReadStorage(REVIEW_DECK_KEY_V8, {});
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function saveReviewDeckV8(deck) {
  safeWriteStorage(REVIEW_DECK_KEY_V8, deck);
  renderDailyStudyV7();
  renderProgressDashboardV8();
}

function getItemByStorageIdV8(id) {
  return dictionaryData.find(item => getEntryStorageId(item) === id) || null;
}

function ensureReviewRecordV8(item) {
  if (!item) return null;
  const id = getEntryStorageId(item);
  const deck = getReviewDeckV8();
  if (!deck[id]) {
    deck[id] = {
      id,
      stage: 0,
      status: "new",
      due: dateKeyV8(),
      addedAt: Date.now(),
      lastReviewedAt: null,
      correct: 0,
      wrong: 0
    };
    saveReviewDeckV8(deck);
  }
  return deck[id];
}

function removeReviewRecordV8(item) {
  if (!item) return;
  const deck = getReviewDeckV8();
  delete deck[getEntryStorageId(item)];
  saveReviewDeckV8(deck);
}

function isDueReviewV8(record) {
  return record && String(record.due || dateKeyV8()) <= dateKeyV8();
}

function getDueReviewItemsV8() {
  const deck = getReviewDeckV8();
  return Object.values(deck)
    .filter(isDueReviewV8)
    .map(record => ({ record, item: getItemByStorageIdV8(record.id) }))
    .filter(row => row.item)
    .sort((a, b) => {
      const hardDiff = (b.record.wrong || 0) - (a.record.wrong || 0);
      return hardDiff || String(a.record.due).localeCompare(String(b.record.due));
    });
}

function getReviewStatusLabelV8(record) {
  if (!record) return "Yeni";
  if (record.status === "learned") return "Öğrenildi";
  if (record.status === "hard") return "Zorlanılıyor";
  if (record.status === "learning") return "Öğreniliyor";
  return "Yeni";
}

function rateReviewV8(item, rating, options = {}) {
  if (!item) return;
  const id = getEntryStorageId(item);
  const deck = getReviewDeckV8();
  const record = deck[id] || ensureReviewRecordV8(item) || {};
  const now = Date.now();

  if (rating === "hard") {
    record.stage = 0;
    record.status = "hard";
    record.due = dateKeyV8();
    record.wrong = (record.wrong || 0) + (options.fromGame ? 1 : 0);
  } else if (rating === "repeat") {
    record.stage = Math.max(1, Math.min(Number(record.stage) || 0, 2));
    record.status = "learning";
    record.due = addDaysV8(1);
  } else {
    const nextStage = options.fromGame
      ? Math.min((Number(record.stage) || 0) + 1, REVIEW_INTERVALS_V8.length - 1)
      : Math.max(4, Number(record.stage) || 0);
    record.stage = nextStage;
    record.status = nextStage >= 4 ? "learned" : "learning";
    record.due = addDaysV8(REVIEW_INTERVALS_V8[Math.min(nextStage, REVIEW_INTERVALS_V8.length - 1)]);
    record.correct = (record.correct || 0) + (options.fromGame ? 1 : 0);
  }

  record.lastReviewedAt = now;
  deck[id] = record;
  saveReviewDeckV8(deck);
  recordActivityV8("review", 1);
  updateStoryFavoriteButtonsV8(id);
}

function migrateFavoritesToReviewV8() {
  const favorites = getFavoriteIds();
  const deck = getReviewDeckV8();
  let changed = false;
  favorites.forEach(id => {
    if (!deck[id]) {
      deck[id] = {
        id,
        stage: 0,
        status: "new",
        due: dateKeyV8(),
        addedAt: Date.now(),
        lastReviewedAt: null,
        correct: 0,
        wrong: 0
      };
      changed = true;
    }
  });
  Object.keys(deck).forEach(id => {
    if (!favorites.has(id)) {
      delete deck[id];
      changed = true;
    }
  });
  if (changed) safeWriteStorage(REVIEW_DECK_KEY_V8, deck);
}

const baseToggleFavoriteV8 = toggleFavorite;
toggleFavorite = function(item) {
  const wasFavorite = isFavorite(item);
  baseToggleFavoriteV8(item);
  if (!wasFavorite && isFavorite(item)) ensureReviewRecordV8(item);
  if (wasFavorite && !isFavorite(item)) removeReviewRecordV8(item);
  injectDictionaryReviewControlsV8(item);
  renderProgressDashboardV8();
  updateStoryFavoriteButtonsV8(getEntryStorageId(item));
};

/* ---------- Activity history ---------- */

function getActivityLogV8() {
  const value = safeReadStorage(ACTIVITY_LOG_KEY_V8, {});
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function recordActivityV8(type, amount = 1) {
  const log = getActivityLogV8();
  const key = dateKeyV8();
  const day = log[key] || { search: 0, story: 0, game: 0, review: 0, quiz: 0 };
  day[type] = (Number(day[type]) || 0) + amount;
  log[key] = day;

  const keepAfter = new Date();
  keepAfter.setDate(keepAfter.getDate() - 120);
  const keepKey = dateKeyV8(keepAfter);
  Object.keys(log).forEach(date => { if (date < keepKey) delete log[date]; });

  safeWriteStorage(ACTIVITY_LOG_KEY_V8, log);
  renderProgressDashboardV8();
}

const baseRecordDailySearchV8 = recordDailySearchV7;
recordDailySearchV7 = function(query) {
  baseRecordDailySearchV8(query);
  recordActivityV8("search", 1);
};

const baseRecordDailyStoryV8 = recordDailyStoryV7;
recordDailyStoryV7 = function(storyId) {
  baseRecordDailyStoryV8(storyId);
  recordActivityV8("story", 1);
};

const baseRecordDailyGameV8 = recordDailyGameV7;
recordDailyGameV7 = function() {
  baseRecordDailyGameV8();
  recordActivityV8("game", 1);
};

function getStudyPointsV8(day) {
  return (day.search || 0) + (day.story || 0) * 5 + (day.game || 0) * 3 + (day.review || 0) + (day.quiz || 0) * 3;
}

function getLastSevenDaysV8() {
  const log = getActivityLogV8();
  const days = [];
  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    const key = dateKeyV8(date);
    const day = log[key] || { search: 0, story: 0, game: 0, review: 0, quiz: 0 };
    days.push({
      key,
      label: date.toLocaleDateString("tr-TR", { weekday: "short" }).replace(".", ""),
      points: getStudyPointsV8(day),
      day
    });
  }
  return days;
}

function getStudyStreakV8() {
  const log = getActivityLogV8();
  let streakValue = 0;
  let offset = 0;
  if (getStudyPointsV8(log[dateKeyV8()] || {}) === 0) offset = 1;
  for (; offset < 365; offset += 1) {
    const date = new Date();
    date.setDate(date.getDate() - offset);
    const points = getStudyPointsV8(log[dateKeyV8(date)] || {});
    if (points <= 0) break;
    streakValue += 1;
  }
  return streakValue;
}

/* ---------- Daily due-review workflow ---------- */

function startDueReviewV8() {
  const rows = getDueReviewItemsV8();
  if (!rows.length) {
    alert("Bugün bekleyen kelimen yok. Kelime defterine yeni sözcükler ekleyebilirsin.");
    return;
  }

  currentGameMode = "meaning";
  document.querySelectorAll("[data-game-mode]").forEach(button => {
    button.classList.toggle("is-active", button.dataset.gameMode === "meaning");
  });

  const queue = rows.slice(0, 10).map(({ item }) => ({ ...item, gameMode: "meaning", reviewModeV8: true }));
  startGameSessionV6(queue);
  document.getElementById("game")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderDailyStudyV7() {
  const grid = document.getElementById("dailyTaskGrid");
  const percent = document.getElementById("dailyStudyPercent");
  const bar = document.getElementById("dailyStudyProgressBar");
  if (!grid || !percent || !bar) return;

  const activity = getDailyActivityV7();
  const dueCount = getDueReviewItemsV8().length;
  const tasks = [
    { label: "5 farklı kelime ara", detail: `${Math.min(activity.searches.length, 5)} / 5`, ratio: Math.min(activity.searches.length / 5, 1), target: "dictionary" },
    { label: "1 hikâye tamamla", detail: `${Math.min(activity.stories.length, 1)} / 1`, ratio: Math.min(activity.stories.length, 1), target: "reading" },
    { label: "1 oyun oturumu bitir", detail: `${Math.min(activity.gameSessions, 1)} / 1`, ratio: Math.min(activity.gameSessions, 1), target: "game" },
    { label: "Bugünkü tekrarları bitir", detail: dueCount ? `${dueCount} kelime bekliyor` : "Tamamlandı", ratio: dueCount ? 0 : 1, action: "review" }
  ];

  const overall = Math.round(tasks.reduce((sum, task) => sum + task.ratio, 0) / tasks.length * 100);
  percent.textContent = `${overall}%`;
  bar.style.width = `${overall}%`;

  grid.innerHTML = tasks.map(task => `
    <button type="button" class="daily-task-card ${task.ratio >= 1 ? "is-done" : ""}" ${task.action ? `data-daily-action="${task.action}"` : `data-daily-target="${task.target}"`}>
      <span>${task.ratio >= 1 ? "✓" : "○"}</span>
      <div><strong>${escapeHtml(task.label)}</strong><small>${escapeHtml(task.detail)}</small></div>
    </button>
  `).join("");

  grid.querySelectorAll("[data-daily-target]").forEach(button => {
    button.addEventListener("click", () => document.getElementById(button.dataset.dailyTarget)?.scrollIntoView({ behavior: "smooth", block: "start" }));
  });
  grid.querySelector('[data-daily-action="review"]')?.addEventListener("click", startDueReviewV8);
}

/* ---------- Smart notebook ---------- */

function renderWordNotebook() {
  const drawer = document.getElementById("dictionaryDrawer");
  if (!drawer) return;

  if (!drawer.classList.contains("hidden") && drawer.dataset.view === "favorites") {
    drawer.classList.add("hidden");
    return;
  }

  migrateFavoritesToReviewV8();
  const favoriteIds = getFavoriteIds();
  const deck = getReviewDeckV8();
  const allWords = dictionaryData
    .filter(item => favoriteIds.has(getEntryStorageId(item)))
    .sort((a, b) => {
      const ra = deck[getEntryStorageId(a)] || {};
      const rb = deck[getEntryStorageId(b)] || {};
      return String(ra.due || "").localeCompare(String(rb.due || "")) || a.word.localeCompare(b.word, "de");
    });

  const words = allWords.filter(item => {
    const record = deck[getEntryStorageId(item)] || {};
    if (notebookFilterV8 === "due") return isDueReviewV8(record);
    if (notebookFilterV8 === "hard") return record.status === "hard" || (record.wrong || 0) >= 2;
    if (notebookFilterV8 === "learned") return record.status === "learned";
    return true;
  });

  drawer.dataset.view = "favorites";
  drawer.innerHTML = `
    <div class="drawer-head">
      <div><strong>Kelime Defteri</strong><span>${allWords.length} kayıt · ${getDueReviewItemsV8().length} tekrar bekliyor</span></div>
      ${allWords.length ? '<button type="button" class="text-btn" id="clearFavorites">Tümünü kaldır</button>' : ""}
    </div>
    ${allWords.length ? `
      <div class="notebook-action-row">
        <button type="button" class="practice-favorites-btn" id="startDueReviewBtn">Bugünkü tekrar (${getDueReviewItemsV8().length})</button>
        <button type="button" class="practice-favorites-btn secondary" id="practiceFavoritesBtn">Karışık test (${allWords.length})</button>
      </div>
      <div class="notebook-filter-row">
        ${[["all","Tümü"],["due","Bugün"],["hard","Zor"],["learned","Öğrenildi"]].map(([value,label]) => `
          <button type="button" class="${notebookFilterV8 === value ? "is-active" : ""}" data-notebook-filter="${value}">${label}</button>
        `).join("")}
      </div>
      <div class="notebook-list">
        ${words.length ? words.map(item => {
          const id = getEntryStorageId(item);
          const record = deck[id] || {};
          return `
            <article class="notebook-study-item ${isDueReviewV8(record) ? "is-due" : ""}">
              <button type="button" class="notebook-open" data-notebook-word="${escapeHtml(item.word)}">
                <strong>${escapeHtml(getGermanDisplay(item))}</strong>
                <span>${escapeHtml(item.tr)}</span>
                <small>${escapeHtml(getReviewStatusLabelV8(record))} · ${isDueReviewV8(record) ? "Bugün" : `Tekrar: ${escapeHtml(record.due || "-")}`}</small>
              </button>
              <div class="review-rating-row">
                <button type="button" data-rate-review="hard" data-review-id="${escapeHtml(id)}">Zorlandım</button>
                <button type="button" data-rate-review="repeat" data-review-id="${escapeHtml(id)}">Tekrar et</button>
                <button type="button" data-rate-review="learned" data-review-id="${escapeHtml(id)}">Öğrendim</button>
                <button type="button" class="notebook-remove" data-remove-favorite="${escapeHtml(id)}" aria-label="Kelimeyi defterden kaldır">×</button>
              </div>
            </article>`;
        }).join("") : '<div class="drawer-empty">Bu filtrede kelime bulunmuyor.</div>'}
      </div>
    ` : '<div class="drawer-empty">Sözlükten veya hikâyeden kelime ekleyebilirsin.</div>'}
  `;
  drawer.classList.remove("hidden");

  drawer.querySelectorAll("[data-notebook-filter]").forEach(button => button.addEventListener("click", () => {
    notebookFilterV8 = button.dataset.notebookFilter;
    drawer.classList.add("hidden");
    renderWordNotebook();
  }));
  drawer.querySelectorAll("[data-notebook-word]").forEach(button => button.addEventListener("click", () => chooseSearchSuggestion(button.dataset.notebookWord)));
  drawer.querySelectorAll("[data-rate-review]").forEach(button => button.addEventListener("click", () => {
    const item = getItemByStorageIdV8(button.dataset.reviewId);
    rateReviewV8(item, button.dataset.rateReview);
    drawer.classList.add("hidden");
    renderWordNotebook();
  }));
  drawer.querySelectorAll("[data-remove-favorite]").forEach(button => button.addEventListener("click", () => {
    const item = getItemByStorageIdV8(button.dataset.removeFavorite);
    if (item) toggleFavorite(item);
    drawer.classList.add("hidden");
    renderWordNotebook();
  }));
  document.getElementById("startDueReviewBtn")?.addEventListener("click", startDueReviewV8);
  document.getElementById("practiceFavoritesBtn")?.addEventListener("click", () => {
    const queue = [...allWords].sort(() => Math.random() - 0.5).slice(0, 10).map(item => ({ ...item, gameMode: "meaning" }));
    startGameSessionV6(queue);
    document.getElementById("game")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  document.getElementById("clearFavorites")?.addEventListener("click", () => {
    safeWriteStorage(FAVORITES_KEY, []);
    safeWriteStorage(REVIEW_DECK_KEY_V8, {});
    updateFavoriteCount();
    drawer.classList.add("hidden");
    renderWordNotebook();
    renderProgressDashboardV8();
  });
}

/* Grade favorite words automatically when they appear in a game. */
const baseShowGameResultV8 = showGameResult;
showGameResult = function(correct, message) {
  const reviewedItem = currentGameWord ? { ...currentGameWord } : null;
  baseShowGameResultV8(correct, message);
  if (reviewedItem && getReviewDeckV8()[getEntryStorageId(reviewedItem)]) {
    rateReviewV8(reviewedItem, correct ? "learned" : "hard", { fromGame: true });
  }
};

/* ---------- Dictionary review controls ---------- */

function injectDictionaryReviewControlsV8(item) {
  const preview = document.getElementById("resultPreview");
  if (!preview || !item) return;
  document.getElementById("dictionaryReviewV8")?.remove();
  if (!isFavorite(item)) return;

  const record = getReviewDeckV8()[getEntryStorageId(item)] || ensureReviewRecordV8(item);
  preview.insertAdjacentHTML("beforeend", `
    <div class="dictionary-review-panel" id="dictionaryReviewV8">
      <div><strong>Tekrar durumu</strong><span>${escapeHtml(getReviewStatusLabelV8(record))} · ${isDueReviewV8(record) ? "Bugün tekrar edilmeli" : `Sonraki: ${escapeHtml(record.due)}`}</span></div>
      <div class="review-rating-row">
        <button type="button" data-dictionary-rating="hard">Zorlandım</button>
        <button type="button" data-dictionary-rating="repeat">Tekrar et</button>
        <button type="button" data-dictionary-rating="learned">Öğrendim</button>
      </div>
    </div>
  `);
  preview.querySelectorAll("[data-dictionary-rating]").forEach(button => button.addEventListener("click", () => {
    rateReviewV8(item, button.dataset.dictionaryRating);
    injectDictionaryReviewControlsV8(item);
  }));
}

const baseRenderFoundResultV8 = renderFoundResult;
renderFoundResult = function(item) {
  baseRenderFoundResultV8(item);
  injectDictionaryReviewControlsV8(item);
};

/* ---------- Save directly from story tooltips ---------- */

function updateStoryFavoriteButtonsV8(id) {
  document.querySelectorAll("[data-story-favorite]").forEach(button => {
    if (button.dataset.storyFavorite !== id) return;
    const item = getItemByStorageIdV8(id);
    const saved = item && isFavorite(item);
    button.classList.toggle("is-saved", Boolean(saved));
    button.textContent = saved ? "★ Defterde" : "☆ Deftere ekle";
  });
}

createReaderWordMarkup = function(surface, lines, missing = false) {
  const safeLines = (lines || []).filter(Boolean).map((line, index) => {
    const tag = index === 0 ? "strong" : "span";
    return `<${tag}>${escapeHtml(String(line))}</${tag}>`;
  }).join("");
  const entry = findStoryWord(surface);
  const id = entry ? getEntryStorageId(entry) : "";
  const saved = entry ? isFavorite(entry) : false;

  return `<span class="reader-word${missing ? " is-missing" : ""}" tabindex="0">${escapeHtml(surface)}
    <span class="reader-tooltip" role="tooltip">
      ${safeLines}
      <span class="reader-tooltip-actions">
        <button type="button" class="reader-speak-btn" data-reader-speak="${escapeHtml(surface)}">🔊 Dinle</button>
        ${entry ? `<button type="button" class="reader-favorite-btn ${saved ? "is-saved" : ""}" data-story-favorite="${escapeHtml(id)}">${saved ? "★ Defterde" : "☆ Deftere ekle"}</button>` : ""}
      </span>
    </span>
  </span>`;
};

document.addEventListener("click", event => {
  const favoriteButton = event.target.closest("[data-story-favorite]");
  if (!favoriteButton) return;
  event.preventDefault();
  event.stopPropagation();
  const item = getItemByStorageIdV8(favoriteButton.dataset.storyFavorite);
  if (item) toggleFavorite(item);
});

/* ---------- Story mini quizzes ---------- */

function getStoryQuizDataV8() {
  const value = safeReadStorage(STORY_QUIZ_KEY_V8, {});
  return value && typeof value === "object" && !Array.isArray(value) ? value : {};
}

function seededRandomV8(seed) {
  let value = 0;
  for (const char of String(seed)) value = (value * 31 + char.charCodeAt(0)) >>> 0;
  return () => {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function shuffleV8(values, random = Math.random) {
  const copy = [...values];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function getStoryEntriesV8(story) {
  const words = String(story.text || "").match(/[A-Za-zÄÖÜäöüß]+(?:-[A-Za-zÄÖÜäöüß]+)?/g) || [];
  const map = new Map();
  words.forEach(surface => {
    const item = findStoryWord(surface);
    if (!item || !item.tr || item.tr.length > 90) return;
    map.set(getEntryStorageId(item), item);
  });
  return [...map.values()].filter(item => !["pronoun", "conjunction", "preposition"].includes(item.pos));
}

function createStoryQuizV8(story) {
  const random = seededRandomV8(story.id);
  const entries = shuffleV8(getStoryEntriesV8(story), random).slice(0, 5);
  if (entries.length < 4) return [];

  return entries.map((answer, index) => {
    const reverse = index >= 3;
    const pool = dictionaryData.filter(item => item.tr && getEntryStorageId(item) !== getEntryStorageId(answer) && (item.pos === answer.pos || !answer.pos));
    const distractors = shuffleV8(pool, random).filter(item => {
      const answerText = reverse ? getGermanDisplay(item) : item.tr;
      const correctText = reverse ? getGermanDisplay(answer) : answer.tr;
      return normalizeAnswer(answerText) !== normalizeAnswer(correctText);
    }).slice(0, 3);
    const options = shuffleV8([answer, ...distractors], random).map(item => ({
      id: getEntryStorageId(item),
      text: reverse ? getGermanDisplay(item) : item.tr
    }));
    return {
      prompt: reverse ? `“${answer.tr}” hangisi?` : `“${getGermanDisplay(answer)}” ne demek?`,
      correctId: getEntryStorageId(answer),
      options
    };
  });
}

function renderStoryQuizV8(story) {
  const mount = document.getElementById("storyQuizMount");
  if (!mount) return;
  const questions = createStoryQuizV8(story);
  if (!questions.length) {
    mount.innerHTML = "";
    return;
  }

  const saved = getStoryQuizDataV8()[story.id];
  activeStoryQuizV8 = { story, questions, index: 0, correct: 0, locked: false };
  mount.innerHTML = `
    <section class="story-quiz-card">
      <div class="story-quiz-intro">
        <div><span>Hikâye Sonu Mini Test</span><strong>Bu metindeki 5 kelimeyi kontrol et.</strong><small>${saved ? `En iyi sonucun: ${saved.best}/5` : "Sonuç cihazında saklanır."}</small></div>
        <button type="button" id="startStoryQuizBtn">Teste başla</button>
      </div>
      <div class="story-quiz-body hidden" id="storyQuizBody"></div>
    </section>`;
  document.getElementById("startStoryQuizBtn")?.addEventListener("click", () => {
    document.querySelector(".story-quiz-intro")?.classList.add("hidden");
    document.getElementById("storyQuizBody")?.classList.remove("hidden");
    renderStoryQuizQuestionV8();
  });
}

function renderStoryQuizQuestionV8() {
  const body = document.getElementById("storyQuizBody");
  if (!body || !activeStoryQuizV8) return;
  const question = activeStoryQuizV8.questions[activeStoryQuizV8.index];
  body.innerHTML = `
    <div class="story-quiz-progress"><span>Soru ${activeStoryQuizV8.index + 1}/5</span><strong>${activeStoryQuizV8.correct} doğru</strong></div>
    <h4>${escapeHtml(question.prompt)}</h4>
    <div class="story-quiz-options">
      ${question.options.map(option => `<button type="button" data-quiz-option="${escapeHtml(option.id)}">${escapeHtml(option.text)}</button>`).join("")}
    </div>
    <p class="story-quiz-feedback" id="storyQuizFeedback" aria-live="polite"></p>`;

  body.querySelectorAll("[data-quiz-option]").forEach(button => button.addEventListener("click", () => answerStoryQuizV8(button)));
}

function answerStoryQuizV8(button) {
  if (!activeStoryQuizV8 || activeStoryQuizV8.locked) return;
  activeStoryQuizV8.locked = true;
  const question = activeStoryQuizV8.questions[activeStoryQuizV8.index];
  const correct = button.dataset.quizOption === question.correctId;
  if (correct) activeStoryQuizV8.correct += 1;

  document.querySelectorAll("[data-quiz-option]").forEach(option => {
    option.disabled = true;
    if (option.dataset.quizOption === question.correctId) option.classList.add("is-correct");
    else if (option === button) option.classList.add("is-wrong");
  });
  const feedback = document.getElementById("storyQuizFeedback");
  if (feedback) feedback.textContent = correct ? "Doğru." : "Doğru cevap işaretlendi.";

  setTimeout(() => {
    activeStoryQuizV8.index += 1;
    activeStoryQuizV8.locked = false;
    if (activeStoryQuizV8.index >= activeStoryQuizV8.questions.length) finishStoryQuizV8();
    else renderStoryQuizQuestionV8();
  }, 750);
}

function finishStoryQuizV8() {
  const body = document.getElementById("storyQuizBody");
  if (!body || !activeStoryQuizV8) return;
  const { story, correct } = activeStoryQuizV8;
  const data = getStoryQuizDataV8();
  const old = data[story.id] || { best: 0, attempts: 0 };
  data[story.id] = { best: Math.max(old.best || 0, correct), attempts: (old.attempts || 0) + 1, last: correct, updatedAt: Date.now() };
  safeWriteStorage(STORY_QUIZ_KEY_V8, data);
  recordActivityV8("quiz", 1);

  body.innerHTML = `
    <div class="story-quiz-result">
      <span>Test tamamlandı</span><strong>${correct} / 5</strong>
      <p>${correct >= 4 ? "Çok iyi. Hikâyenin kelimelerine hakimsin." : correct >= 3 ? "İyi gidiyor. Kaçırdığın kelimeleri tekrar edebilirsin." : "Bu hikâyeyi ve kelimeleri bir kez daha gözden geçir."}</p>
      <div>
        <button type="button" id="retryStoryQuizBtn">Tekrar çöz</button>
        ${!isStoryCompleted(story.id) ? '<button type="button" id="completeAfterQuizBtn">Hikâyeyi tamamla</button>' : ""}
      </div>
    </div>`;
  document.getElementById("retryStoryQuizBtn")?.addEventListener("click", () => renderStoryQuizV8(story));
  document.getElementById("completeAfterQuizBtn")?.addEventListener("click", () => {
    toggleStoryCompleted(story.id);
    document.getElementById("completeAfterQuizBtn")?.remove();
  });
  renderProgressDashboardV8();
}

const baseOpenStoryV8 = openStory;
openStory = function(storyId) {
  baseOpenStoryV8(storyId);
  const story = getStoriesData().find(item => item.id === storyId);
  if (story) renderStoryQuizV8(story);
};

const baseRenderStoryListV8 = renderStoryList;
renderStoryList = function(level) {
  baseRenderStoryListV8(level);
  const quizData = getStoryQuizDataV8();
  document.querySelectorAll("[data-story-id]").forEach(card => {
    const saved = quizData[card.dataset.storyId];
    if (!saved) return;
    const meta = card.querySelector(".story-meta");
    if (meta && !meta.querySelector(".quiz-score-chip")) meta.insertAdjacentHTML("beforeend", `<em class="quiz-score-chip">Test ${saved.best}/5</em>`);
  });
};

/* ---------- Progress dashboard ---------- */

function renderProgressDashboardV8() {
  const root = document.getElementById("progressDashboard");
  if (!root) return;

  const favorites = getFavoriteIds();
  const deck = getReviewDeckV8();
  const due = Object.values(deck).filter(isDueReviewV8).length;
  const learned = Object.values(deck).filter(record => record.status === "learned").length;
  const completed = getReadingProgress().size;
  const quizData = getStoryQuizDataV8();
  const quizCount = Object.keys(quizData).length;
  const best = getGameBestScoreV6();
  const streakDays = getStudyStreakV8();
  const days = getLastSevenDaysV8();
  const maxPoints = Math.max(1, ...days.map(day => day.points));
  const hardWords = Object.values(deck)
    .sort((a, b) => (b.wrong || 0) - (a.wrong || 0))
    .filter(record => (record.wrong || 0) > 0 || record.status === "hard")
    .slice(0, 5)
    .map(record => ({ record, item: getItemByStorageIdV8(record.id) }))
    .filter(row => row.item);

  root.innerHTML = `
    <div class="progress-stat-grid">
      ${[
        [favorites.size, "Defterdeki kelime"],
        [due, "Bugünkü tekrar"],
        [learned, "Öğrenilen kelime"],
        [completed, "Tamamlanan hikâye"],
        [quizCount, "Çözülen hikâye testi"],
        [`${best}/10`, "En iyi oyun skoru"]
      ].map(([value,label]) => `<article><strong>${value}</strong><span>${label}</span></article>`).join("")}
    </div>

    <div class="progress-main-grid">
      <article class="weekly-activity-card">
        <div class="progress-card-head"><div><span>Son 7 gün</span><strong>${streakDays} günlük seri</strong></div><small>Arama, okuma, oyun, test ve tekrarlar</small></div>
        <div class="weekly-bars">
          ${days.map(day => `<div class="weekly-bar"><span title="${day.points} puan" style="height:${Math.max(day.points ? 12 : 3, Math.round(day.points / maxPoints * 100))}%"></span><small>${escapeHtml(day.label)}</small></div>`).join("")}
        </div>
      </article>

      <article class="next-action-card">
        <span>Sıradaki adım</span>
        <strong>${due ? `${due} kelime seni bekliyor` : favorites.size ? "Bugünkü tekrarların tamam" : "Kelime defterini oluşturmaya başla"}</strong>
        <p>${due ? "Kısa bir tekrar oturumuyla bilgiyi kalıcı hâle getir." : favorites.size ? "Yeni bir hikâye oku veya birkaç kelime daha ekle." : "Sözlükten ya da hikâyelerden kelime kaydet."}</p>
        <button type="button" id="progressPrimaryAction">${due ? "Tekrarı başlat" : favorites.size ? "Hikâyelere git" : "Sözlüğe git"}</button>
      </article>
    </div>

    <article class="weak-words-card">
      <div class="progress-card-head"><div><span>Odak listesi</span><strong>Zorlanılan kelimeler</strong></div><small>${hardWords.length ? "En çok hata yapılanlar" : "Henüz zor kelime oluşmadı"}</small></div>
      ${hardWords.length ? `<div class="weak-word-list">${hardWords.map(({ item, record }) => `<button type="button" data-weak-word="${escapeHtml(item.word)}"><strong>${escapeHtml(getGermanDisplay(item))}</strong><span>${escapeHtml(item.tr)}</span><em>${record.wrong || 0} hata</em></button>`).join("")}</div>` : '<p class="progress-empty">Tekrar yaptıkça burada kişisel odak listen oluşacak.</p>'}
    </article>`;

  document.getElementById("progressPrimaryAction")?.addEventListener("click", () => {
    if (due) startDueReviewV8();
    else document.getElementById(favorites.size ? "reading" : "dictionary")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
  root.querySelectorAll("[data-weak-word]").forEach(button => button.addEventListener("click", () => {
    chooseSearchSuggestion(button.dataset.weakWord);
    document.getElementById("dictionary")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }));
}

/* Ensure new data is available after dictionary loading. */
const baseLoadDictionaryV8 = loadDictionary;
loadDictionary = async function() {
  await baseLoadDictionaryV8();
  migrateFavoritesToReviewV8();
  renderDailyStudyV7();
  renderProgressDashboardV8();
};

document.addEventListener("DOMContentLoaded", () => {
  renderDailyStudyV7();
  renderProgressDashboardV8();
});
