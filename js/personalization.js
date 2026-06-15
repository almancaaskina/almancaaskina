/* ==========================================================
   BIG UPDATE 9
   1) Custom daily goals
   2) Word of the day
   3) Advanced word explorer
   4) Grammar mini quizzes
   5) Exact reading-position memory
   6) Focus timer
   7) PWA update notification
   ========================================================== */

const DAILY_GOALS_KEY_V9 = "almancaAskinaDailyGoalsV1";
const FOCUS_TIMER_KEY_V9 = "almancaAskinaFocusTimerV1";
const GRAMMAR_QUIZ_KEY_V9 = "almancaAskinaGrammarQuizV1";
const READING_POSITIONS_KEY_V9 = "almancaAskinaReadingPositionsV1";

const DEFAULT_DAILY_GOALS_V9 = {
  searches: 5,
  stories: 1,
  games: 1,
  grammar: 1,
  focus: 1,
  reviews: true
};

let explorerLevelV9 = "ALL";
let explorerPosV9 = "ALL";
let explorerSeedV9 = 0;
let activeGrammarQuizV9 = null;
let activeReadingStoryV9 = null;
let readingRestoreLockV9 = false;
let readingSaveTimerV9 = null;
let focusIntervalV9 = null;
let originalDocumentTitleV9 = document.title;

/* Include V9 data in the existing export/import system. */
[
  DAILY_GOALS_KEY_V9,
  FOCUS_TIMER_KEY_V9,
  GRAMMAR_QUIZ_KEY_V9,
  READING_POSITIONS_KEY_V9
].forEach(key => {
  if (Array.isArray(LOCAL_DATA_KEYS_V7) && !LOCAL_DATA_KEYS_V7.includes(key)) {
    LOCAL_DATA_KEYS_V7.push(key);
  }
});

/* ---------- Custom daily goals ---------- */

function getDailyGoalsV9() {
  const stored = safeReadStorage(DAILY_GOALS_KEY_V9, {});
  return {
    searches: [3, 5, 10].includes(Number(stored.searches)) ? Number(stored.searches) : DEFAULT_DAILY_GOALS_V9.searches,
    stories: [1, 2, 3].includes(Number(stored.stories)) ? Number(stored.stories) : DEFAULT_DAILY_GOALS_V9.stories,
    games: [1, 2, 3].includes(Number(stored.games)) ? Number(stored.games) : DEFAULT_DAILY_GOALS_V9.games,
    grammar: [0, 1, 2].includes(Number(stored.grammar)) ? Number(stored.grammar) : DEFAULT_DAILY_GOALS_V9.grammar,
    focus: [0, 1, 2].includes(Number(stored.focus)) ? Number(stored.focus) : DEFAULT_DAILY_GOALS_V9.focus,
    reviews: stored.reviews !== false
  };
}

function openDailyGoalsV9() {
  const goals = getDailyGoalsV9();
  document.getElementById("goalSearches").value = String(goals.searches);
  document.getElementById("goalStories").value = String(goals.stories);
  document.getElementById("goalGames").value = String(goals.games);
  document.getElementById("goalGrammar").value = String(goals.grammar);
  document.getElementById("goalFocus").value = String(goals.focus);
  document.getElementById("goalReviews").checked = goals.reviews;

  const dialog = document.getElementById("dailyGoalsDialog");
  if (dialog?.showModal) {
    if (!dialog.open) dialog.showModal();
  } else {
    dialog?.setAttribute("open", "");
  }
}

function closeDailyGoalsV9() {
  const dialog = document.getElementById("dailyGoalsDialog");
  if (dialog?.close) dialog.close();
  else dialog?.removeAttribute("open");
}

function saveDailyGoalsV9() {
  safeWriteStorage(DAILY_GOALS_KEY_V9, {
    searches: Number(document.getElementById("goalSearches").value),
    stories: Number(document.getElementById("goalStories").value),
    games: Number(document.getElementById("goalGames").value),
    grammar: Number(document.getElementById("goalGrammar").value),
    focus: Number(document.getElementById("goalFocus").value),
    reviews: document.getElementById("goalReviews").checked
  });
  renderDailyStudyV7();
  closeDailyGoalsV9();
}

function getTodayActivityV9() {
  const log = getActivityLogV8();
  return log[dateKeyV8()] || {};
}

renderDailyStudyV7 = function() {
  const grid = document.getElementById("dailyTaskGrid");
  const percent = document.getElementById("dailyStudyPercent");
  const bar = document.getElementById("dailyStudyProgressBar");
  if (!grid || !percent || !bar) return;

  const activity = getDailyActivityV7();
  const activityLog = getTodayActivityV9();
  const goals = getDailyGoalsV9();
  const dueCount = getDueReviewItemsV8().length;

  const tasks = [
    {
      label: `${goals.searches} farklı kelime ara`,
      detail: `${Math.min(activity.searches.length, goals.searches)} / ${goals.searches}`,
      ratio: Math.min(activity.searches.length / goals.searches, 1),
      target: "dictionary"
    },
    {
      label: `${goals.stories} hikâye tamamla`,
      detail: `${Math.min(activity.stories.length, goals.stories)} / ${goals.stories}`,
      ratio: Math.min(activity.stories.length / goals.stories, 1),
      target: "reading"
    },
    {
      label: `${goals.games} oyun oturumu bitir`,
      detail: `${Math.min(activity.gameSessions, goals.games)} / ${goals.games}`,
      ratio: Math.min(activity.gameSessions / goals.games, 1),
      target: "game"
    }
  ];

  if (goals.grammar > 0) {
    tasks.push({
      label: `${goals.grammar} gramer mini testi çöz`,
      detail: `${Math.min(Number(activityLog.grammar) || 0, goals.grammar)} / ${goals.grammar}`,
      ratio: Math.min((Number(activityLog.grammar) || 0) / goals.grammar, 1),
      target: "grammar"
    });
  }

  if (goals.focus > 0) {
    tasks.push({
      label: `${goals.focus} odak oturumu tamamla`,
      detail: `${Math.min(Number(activityLog.focus) || 0, goals.focus)} / ${goals.focus}`,
      ratio: Math.min((Number(activityLog.focus) || 0) / goals.focus, 1),
      action: "focus"
    });
  }

  if (goals.reviews) {
    tasks.push({
      label: "Bugünkü tekrarları bitir",
      detail: dueCount ? `${dueCount} kelime bekliyor` : "Tamamlandı",
      ratio: dueCount ? 0 : 1,
      action: "review"
    });
  }

  const overall = tasks.length
    ? Math.round(tasks.reduce((sum, task) => sum + task.ratio, 0) / tasks.length * 100)
    : 100;

  percent.textContent = `${overall}%`;
  bar.style.width = `${overall}%`;

  grid.innerHTML = tasks.map(task => `
    <button type="button" class="daily-task-card ${task.ratio >= 1 ? "is-done" : ""}"
      ${task.action ? `data-daily-action="${task.action}"` : `data-daily-target="${task.target}"`}>
      <span>${task.ratio >= 1 ? "✓" : "○"}</span>
      <div>
        <strong>${escapeHtml(task.label)}</strong>
        <small>${escapeHtml(task.detail)}</small>
      </div>
    </button>
  `).join("");

  grid.querySelectorAll("[data-daily-target]").forEach(button => {
    button.addEventListener("click", () => {
      document.getElementById(button.dataset.dailyTarget)?.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    });
  });

  grid.querySelector('[data-daily-action="review"]')?.addEventListener("click", startDueReviewV8);
  grid.querySelector('[data-daily-action="focus"]')?.addEventListener("click", () => {
    document.getElementById("focusTimerCard")?.scrollIntoView({ behavior: "smooth", block: "center" });
  });
};

/* ---------- Word of the day ---------- */

function hashTextV9(value) {
  let hash = 2166136261;
  for (const char of String(value)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash >>> 0);
}

function getWordOfDayV9() {
  const pool = dictionaryData.filter(item =>
    item?.word &&
    item?.tr &&
    ["A1", "A2"].includes(item.level) &&
    !String(item.word).includes("/")
  );

  if (!pool.length) return null;
  const index = hashTextV9(`${dateKeyV8()}-almanca-askina`) % pool.length;
  return pool[index];
}

function renderWordOfDayV9() {
  const card = document.getElementById("wordOfDayCard");
  if (!card) return;

  const item = getWordOfDayV9();
  if (!item) {
    card.innerHTML = `
      <span>Günün Kelimesi</span>
      <strong>Sözlük hazırlanıyor…</strong>
      <small>Birazdan tekrar görünecek.</small>
    `;
    return;
  }

  const id = getEntryStorageId(item);
  card.innerHTML = `
    <div class="word-of-day-head">
      <span>Günün Kelimesi</span>
      <em>${escapeHtml(item.level || "A1/A2")} · ${escapeHtml(getPosLabel(item.pos))}</em>
    </div>
    <strong>${escapeHtml(getGermanDisplay(item))}</strong>
    <p>${escapeHtml(item.tr)}</p>
    ${item.examples?.[0] ? `<small>${escapeHtml(typeof item.examples[0] === "string" ? item.examples[0] : item.examples[0].de || "")}</small>` : ""}
    <div class="word-of-day-actions">
      <button type="button" data-wod-speak="${escapeHtml(item.word)}">🔊 Dinle</button>
      <button type="button" data-wod-open="${escapeHtml(item.word)}">Sözlükte aç</button>
      <button type="button" class="${isFavorite(item) ? "is-saved" : ""}" data-wod-favorite="${escapeHtml(id)}">
        ${isFavorite(item) ? "★ Defterde" : "☆ Deftere ekle"}
      </button>
    </div>
  `;

  card.querySelector("[data-wod-speak]")?.addEventListener("click", buttonEvent => {
    speakGermanV7(buttonEvent.currentTarget.dataset.wodSpeak);
  });

  card.querySelector("[data-wod-open]")?.addEventListener("click", buttonEvent => {
    chooseSearchSuggestion(buttonEvent.currentTarget.dataset.wodOpen);
    document.getElementById("dictionary")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  card.querySelector("[data-wod-favorite]")?.addEventListener("click", buttonEvent => {
    const selected = getItemByStorageIdV8(buttonEvent.currentTarget.dataset.wodFavorite);
    if (selected) {
      toggleFavorite(selected);
      renderWordOfDayV9();
    }
  });
};

/* ---------- Advanced word explorer ---------- */

function shuffleV9(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

function getExplorerWordsV9() {
  const filtered = dictionaryData.filter(item => {
    if (!item?.word || !item?.tr) return false;
    if (explorerLevelV9 !== "ALL" && item.level !== explorerLevelV9) return false;
    if (explorerPosV9 !== "ALL" && item.pos !== explorerPosV9) return false;
    return true;
  });

  const offset = explorerSeedV9 % Math.max(filtered.length, 1);
  return shuffleV9([...filtered.slice(offset), ...filtered.slice(0, offset)]).slice(0, 12);
}

function renderWordExplorerV9() {
  const drawer = document.getElementById("dictionaryDrawer");
  if (!drawer) return;

  if (!drawer.classList.contains("hidden") && drawer.dataset.view === "explorer") {
    drawer.classList.add("hidden");
    return;
  }

  drawer.dataset.view = "explorer";
  drawer.classList.remove("hidden");
  drawWordExplorerContentV9();
}

function drawWordExplorerContentV9() {
  const drawer = document.getElementById("dictionaryDrawer");
  if (!drawer || drawer.dataset.view !== "explorer") return;

  const words = getExplorerWordsV9();

  drawer.innerHTML = `
    <div class="drawer-head">
      <div>
        <strong>Kelime Keşfet</strong>
        <span>Seviyene ve kelime türüne göre yeni sözcükler bul.</span>
      </div>
      <button type="button" class="text-btn" id="refreshExplorerBtn">Yeni 12 kelime</button>
    </div>

    <div class="explorer-filter-row">
      <label>
        <span>Seviye</span>
        <select id="explorerLevelSelect">
          <option value="ALL">A1 + A2</option>
          <option value="A1">Yalnız A1</option>
          <option value="A2">Yalnız A2</option>
        </select>
      </label>
      <label>
        <span>Kelime türü</span>
        <select id="explorerPosSelect">
          <option value="ALL">Tüm türler</option>
          <option value="noun">İsimler</option>
          <option value="verb">Fiiller</option>
          <option value="other">Diğer</option>
        </select>
      </label>
    </div>

    <div class="explorer-word-grid">
      ${words.map(item => {
        const id = getEntryStorageId(item);
        return `
          <article class="explorer-word-card">
            <button type="button" class="explorer-word-open" data-explorer-open="${escapeHtml(item.word)}">
              <span>${escapeHtml(item.level || "A1/A2")} · ${escapeHtml(getPosLabel(item.pos))}</span>
              <strong>${escapeHtml(getGermanDisplay(item))}</strong>
              <small>${escapeHtml(item.tr)}</small>
            </button>
            <div>
              <button type="button" data-explorer-speak="${escapeHtml(item.word)}" aria-label="Kelimeyi dinle">🔊</button>
              <button type="button" class="${isFavorite(item) ? "is-saved" : ""}"
                data-explorer-favorite="${escapeHtml(id)}" aria-label="Kelime defteri">
                ${isFavorite(item) ? "★" : "☆"}
              </button>
            </div>
          </article>
        `;
      }).join("")}
    </div>
  `;

  document.getElementById("explorerLevelSelect").value = explorerLevelV9;
  document.getElementById("explorerPosSelect").value = explorerPosV9;

  document.getElementById("explorerLevelSelect")?.addEventListener("change", event => {
    explorerLevelV9 = event.target.value;
    explorerSeedV9 += 1;
    drawWordExplorerContentV9();
  });

  document.getElementById("explorerPosSelect")?.addEventListener("change", event => {
    explorerPosV9 = event.target.value;
    explorerSeedV9 += 1;
    drawWordExplorerContentV9();
  });

  document.getElementById("refreshExplorerBtn")?.addEventListener("click", () => {
    explorerSeedV9 += 17;
    drawWordExplorerContentV9();
  });

  drawer.querySelectorAll("[data-explorer-open]").forEach(button => {
    button.addEventListener("click", () => chooseSearchSuggestion(button.dataset.explorerOpen));
  });

  drawer.querySelectorAll("[data-explorer-speak]").forEach(button => {
    button.addEventListener("click", () => speakGermanV7(button.dataset.explorerSpeak));
  });

  drawer.querySelectorAll("[data-explorer-favorite]").forEach(button => {
    button.addEventListener("click", () => {
      const item = getItemByStorageIdV8(button.dataset.explorerFavorite);
      if (item) {
        toggleFavorite(item);
        drawWordExplorerContentV9();
      }
    });
  });
}

/* ---------- Grammar mini quiz ---------- */

function getGrammarQuizStatsV9() {
  const stored = safeReadStorage(GRAMMAR_QUIZ_KEY_V9, {});
  return {
    best: Number(stored.best) || 0,
    attempts: Number(stored.attempts) || 0,
    last: Number(stored.last) || 0
  };
}

function getGrammarPairsV9() {
  const source = activeGrammarCategory !== "Tümü"
    ? getGrammarData().filter(item => item.category === activeGrammarCategory)
    : getGrammarData();

  const pairs = [];
  source.forEach(item => {
    (item.examples || []).forEach(example => {
      if (Array.isArray(example) && example.length >= 2 && example[0] && example[1]) {
        pairs.push({
          title: item.title,
          de: String(example[0]),
          tr: String(example[1])
        });
      }
    });
  });

  if (pairs.length < 8 && activeGrammarCategory !== "Tümü") {
    return getGrammarData().flatMap(item =>
      (item.examples || [])
        .filter(example => Array.isArray(example) && example.length >= 2 && example[0] && example[1])
        .map(example => ({ title: item.title, de: String(example[0]), tr: String(example[1]) }))
    );
  }

  return pairs;
}

function createGrammarQuizQuestionsV9() {
  const pairs = shuffleV9(getGrammarPairsV9());
  const allPairs = getGrammarData().flatMap(item =>
    (item.examples || [])
      .filter(example => Array.isArray(example) && example.length >= 2 && example[0] && example[1])
      .map(example => ({ title: item.title, de: String(example[0]), tr: String(example[1]) }))
  );

  return pairs.slice(0, Math.min(10, pairs.length)).map((answer, index) => {
    const reverse = index % 2 === 1;
    const correctText = reverse ? answer.de : answer.tr;

    const distractors = shuffleV9(allPairs)
      .map(pair => reverse ? pair.de : pair.tr)
      .filter(text => normalizeAnswer(text) !== normalizeAnswer(correctText))
      .filter((text, position, array) =>
        array.findIndex(other => normalizeAnswer(other) === normalizeAnswer(text)) === position
      )
      .slice(0, 3);

    return {
      category: answer.title,
      prompt: reverse
        ? `“${answer.tr}” ifadesinin Almancası hangisi?`
        : `“${answer.de}” ifadesinin Türkçesi hangisi?`,
      correct: correctText,
      options: shuffleV9([correctText, ...distractors])
    };
  });
}

function injectGrammarQuizV9() {
  const tools = document.querySelector("#grammarGrid .grammar-tools");
  if (!tools || document.getElementById("grammarPracticeV9")) return;

  const stats = getGrammarQuizStatsV9();
  tools.insertAdjacentHTML("afterend", `
    <section class="grammar-practice-card" id="grammarPracticeV9">
      <div class="grammar-practice-head">
        <div>
          <span>Gramer Mini Testi</span>
          <strong>Örnek cümlelerle 10 soruluk hızlı kontrol</strong>
          <small>${stats.attempts ? `En iyi sonuç: ${stats.best}/10 · ${stats.attempts} deneme` : "İlk sonucunu cihazında sakla."}</small>
        </div>
        <button type="button" id="startGrammarQuizV9">Teste başla</button>
      </div>
      <div class="grammar-quiz-mount hidden" id="grammarQuizMountV9"></div>
    </section>
  `);

  document.getElementById("startGrammarQuizV9")?.addEventListener("click", startGrammarQuizV9);
}

const baseRenderGrammarHapsV9 = renderGrammarHaps;
renderGrammarHaps = function() {
  baseRenderGrammarHapsV9();
  injectGrammarQuizV9();
};

function startGrammarQuizV9() {
  const questions = createGrammarQuizQuestionsV9();
  const mount = document.getElementById("grammarQuizMountV9");
  if (!mount || questions.length < 4) {
    alert("Bu kategori için yeterli örnek bulunamadı. Tümü kategorisini seçebilirsin.");
    return;
  }

  activeGrammarQuizV9 = {
    questions,
    index: 0,
    correct: 0,
    locked: false
  };

  document.querySelector("#grammarPracticeV9 .grammar-practice-head")?.classList.add("hidden");
  mount.classList.remove("hidden");
  renderGrammarQuizQuestionV9();
}

function renderGrammarQuizQuestionV9() {
  const mount = document.getElementById("grammarQuizMountV9");
  if (!mount || !activeGrammarQuizV9) return;

  const question = activeGrammarQuizV9.questions[activeGrammarQuizV9.index];
  mount.innerHTML = `
    <div class="grammar-quiz-progress">
      <span>Soru ${activeGrammarQuizV9.index + 1}/${activeGrammarQuizV9.questions.length}</span>
      <strong>${activeGrammarQuizV9.correct} doğru</strong>
    </div>
    <small>${escapeHtml(question.category)}</small>
    <h3>${escapeHtml(question.prompt)}</h3>
    <div class="grammar-quiz-options">
      ${question.options.map(option => `
        <button type="button" data-grammar-answer="${escapeHtml(option)}">${escapeHtml(option)}</button>
      `).join("")}
    </div>
    <p id="grammarQuizFeedbackV9" aria-live="polite"></p>
  `;

  mount.querySelectorAll("[data-grammar-answer]").forEach(button => {
    button.addEventListener("click", () => answerGrammarQuizV9(button));
  });
}

function answerGrammarQuizV9(button) {
  if (!activeGrammarQuizV9 || activeGrammarQuizV9.locked) return;
  activeGrammarQuizV9.locked = true;

  const question = activeGrammarQuizV9.questions[activeGrammarQuizV9.index];
  const correct = normalizeAnswer(button.dataset.grammarAnswer) === normalizeAnswer(question.correct);
  if (correct) activeGrammarQuizV9.correct += 1;

  document.querySelectorAll("[data-grammar-answer]").forEach(option => {
    option.disabled = true;
    if (normalizeAnswer(option.dataset.grammarAnswer) === normalizeAnswer(question.correct)) {
      option.classList.add("is-correct");
    } else if (option === button) {
      option.classList.add("is-wrong");
    }
  });

  const feedback = document.getElementById("grammarQuizFeedbackV9");
  if (feedback) feedback.textContent = correct ? "Doğru." : "Doğru seçenek işaretlendi.";

  setTimeout(() => {
    activeGrammarQuizV9.index += 1;
    activeGrammarQuizV9.locked = false;
    if (activeGrammarQuizV9.index >= activeGrammarQuizV9.questions.length) finishGrammarQuizV9();
    else renderGrammarQuizQuestionV9();
  }, 700);
}

function finishGrammarQuizV9() {
  const mount = document.getElementById("grammarQuizMountV9");
  if (!mount || !activeGrammarQuizV9) return;

  const total = activeGrammarQuizV9.questions.length;
  const correct = activeGrammarQuizV9.correct;
  const old = getGrammarQuizStatsV9();
  const stats = {
    best: Math.max(old.best, correct),
    attempts: old.attempts + 1,
    last: correct,
    updatedAt: Date.now()
  };

  safeWriteStorage(GRAMMAR_QUIZ_KEY_V9, stats);
  recordActivityV8("grammar", 1);
  renderDailyStudyV7();

  mount.innerHTML = `
    <div class="grammar-quiz-result">
      <span>Gramer testi tamamlandı</span>
      <strong>${correct} / ${total}</strong>
      <p>${correct >= total * 0.8
        ? "Çok iyi. Örnekleri doğru ayırt ediyorsun."
        : correct >= total * 0.5
          ? "İyi gidiyor. Gramer kartlarını bir kez daha gözden geçirebilirsin."
          : "İlgili konuları tekrar açıp örnekleri incelemek faydalı olur."}</p>
      <button type="button" id="retryGrammarQuizV9">Tekrar çöz</button>
    </div>
  `;

  document.getElementById("retryGrammarQuizV9")?.addEventListener("click", () => {
    startGrammarQuizV9();
  });

  renderProgressDashboardV8();
}

/* ---------- Exact reading-position memory ---------- */

function getReadingPositionsV9() {
  const stored = safeReadStorage(READING_POSITIONS_KEY_V9, {});
  return stored && typeof stored === "object" && !Array.isArray(stored) ? stored : {};
}

function getReadingRatioV9() {
  const reader = document.getElementById("readerText");
  if (!reader || !activeReadingStoryV9) return 0;

  const top = reader.getBoundingClientRect().top + window.scrollY;
  const travel = Math.max(1, reader.offsetHeight - window.innerHeight * 0.55);
  return Math.max(0, Math.min(1, (window.scrollY - top + 150) / travel));
}

function saveReadingPositionV9() {
  if (!activeReadingStoryV9 || readingRestoreLockV9) return;
  const positions = getReadingPositionsV9();
  positions[activeReadingStoryV9] = {
    ratio: getReadingRatioV9(),
    updatedAt: Date.now()
  };
  safeWriteStorage(READING_POSITIONS_KEY_V9, positions);
}

function updateReadingPositionUiV9() {
  if (!activeReadingStoryV9) return;
  const ratio = getReadingRatioV9();
  const percentage = Math.round(ratio * 100);

  const bar = document.getElementById("readerPositionBarV9");
  const label = document.getElementById("readerPositionLabelV9");
  if (bar) bar.style.width = `${percentage}%`;
  if (label) label.textContent = `%${percentage}`;
}

function handleReadingScrollV9() {
  if (!activeReadingStoryV9) return;
  updateReadingPositionUiV9();
  clearTimeout(readingSaveTimerV9);
  readingSaveTimerV9 = setTimeout(saveReadingPositionV9, 250);
}

function setupReadingPositionV9(story) {
  activeReadingStoryV9 = story.id;
  document.getElementById("readerPositionPanelV9")?.remove();

  const controls = document.getElementById("readerControlsV7");
  const title = document.getElementById("readerTitle");
  const anchor = controls || title;
  anchor?.insertAdjacentHTML("afterend", `
    <div class="reader-position-panel" id="readerPositionPanelV9">
      <div>
        <span>Okuma konumu</span>
        <strong id="readerPositionLabelV9">%0</strong>
      </div>
      <div class="reader-position-track"><span id="readerPositionBarV9"></span></div>
      <button type="button" id="readerStartOverV9">Başa dön</button>
    </div>
  `);

  document.getElementById("readerStartOverV9")?.addEventListener("click", () => {
    const reader = document.getElementById("readerText");
    const positions = getReadingPositionsV9();
    delete positions[story.id];
    safeWriteStorage(READING_POSITIONS_KEY_V9, positions);
    window.scrollTo({
      top: Math.max(0, reader.getBoundingClientRect().top + window.scrollY - 150),
      behavior: "smooth"
    });
  });

  const saved = getReadingPositionsV9()[story.id];
  if (saved && Number(saved.ratio) > 0.03 && Number(saved.ratio) < 0.98 && !isStoryCompleted(story.id)) {
    readingRestoreLockV9 = true;
    setTimeout(() => {
      const reader = document.getElementById("readerText");
      if (!reader) return;

      const top = reader.getBoundingClientRect().top + window.scrollY;
      const travel = Math.max(1, reader.offsetHeight - window.innerHeight * 0.55);
      window.scrollTo({
        top: Math.max(0, top - 150 + travel * Number(saved.ratio)),
        behavior: "smooth"
      });

      setTimeout(() => {
        readingRestoreLockV9 = false;
        updateReadingPositionUiV9();
      }, 600);
    }, 220);
  } else {
    readingRestoreLockV9 = false;
    updateReadingPositionUiV9();
  }
}

const baseOpenStoryV9 = openStory;
openStory = function(storyId) {
  if (activeReadingStoryV9) saveReadingPositionV9();
  baseOpenStoryV9(storyId);
  const story = getStoriesData().find(item => item.id === storyId);
  if (story) setupReadingPositionV9(story);
};

/* ---------- Focus timer ---------- */

function getFocusStateV9() {
  const stored = safeReadStorage(FOCUS_TIMER_KEY_V9, {});
  const durationSeconds = Number(stored.durationSeconds) || 600;
  let remainingSeconds = Number(stored.remainingSeconds);
  let running = Boolean(stored.running);
  const endAt = Number(stored.endAt) || null;

  if (!Number.isFinite(remainingSeconds) || remainingSeconds < 0) remainingSeconds = durationSeconds;

  if (running && endAt) {
    remainingSeconds = Math.max(0, Math.ceil((endAt - Date.now()) / 1000));
  }

  return { durationSeconds, remainingSeconds, running, endAt };
}

function saveFocusStateV9(state) {
  safeWriteStorage(FOCUS_TIMER_KEY_V9, state);
}

function formatTimerV9(seconds) {
  const safe = Math.max(0, Math.round(seconds));
  return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

function renderFocusTimerV9() {
  const display = document.getElementById("focusTimerDisplay");
  const status = document.getElementById("focusTimerStatus");
  const startButton = document.getElementById("focusStartPauseBtn");
  if (!display || !status || !startButton) return;

  const state = getFocusStateV9();

  if (state.running && state.endAt) {
    state.remainingSeconds = Math.max(0, Math.ceil((state.endAt - Date.now()) / 1000));
    if (state.remainingSeconds <= 0) {
      completeFocusTimerV9(state);
      return;
    }
  }

  display.textContent = formatTimerV9(state.remainingSeconds);
  status.textContent = state.running ? "Odaklanıyorsun" : state.remainingSeconds < state.durationSeconds ? "Duraklatıldı" : "Hazır";
  startButton.textContent = state.running ? "Duraklat" : state.remainingSeconds < state.durationSeconds ? "Devam et" : "Başlat";
  document.title = state.running ? `${formatTimerV9(state.remainingSeconds)} · Almanca Aşkına` : originalDocumentTitleV9;

  document.querySelectorAll("[data-focus-minutes]").forEach(button => {
    button.classList.toggle(
      "is-active",
      Number(button.dataset.focusMinutes) * 60 === state.durationSeconds
    );
    button.disabled = state.running;
  });

  clearInterval(focusIntervalV9);
  if (state.running) {
    focusIntervalV9 = setInterval(renderFocusTimerV9, 1000);
  }
}

function setFocusDurationV9(minutes) {
  const durationSeconds = Number(minutes) * 60;
  saveFocusStateV9({
    durationSeconds,
    remainingSeconds: durationSeconds,
    running: false,
    endAt: null
  });
  renderFocusTimerV9();
}

function toggleFocusTimerV9() {
  const state = getFocusStateV9();

  if (state.running) {
    state.remainingSeconds = Math.max(0, Math.ceil((state.endAt - Date.now()) / 1000));
    state.running = false;
    state.endAt = null;
  } else {
    if (state.remainingSeconds <= 0) state.remainingSeconds = state.durationSeconds;
    state.running = true;
    state.endAt = Date.now() + state.remainingSeconds * 1000;
  }

  saveFocusStateV9(state);
  renderFocusTimerV9();
}

function resetFocusTimerV9() {
  const state = getFocusStateV9();
  saveFocusStateV9({
    durationSeconds: state.durationSeconds,
    remainingSeconds: state.durationSeconds,
    running: false,
    endAt: null
  });
  renderFocusTimerV9();
}

function completeFocusTimerV9(state) {
  clearInterval(focusIntervalV9);
  saveFocusStateV9({
    durationSeconds: state.durationSeconds,
    remainingSeconds: state.durationSeconds,
    running: false,
    endAt: null
  });

  recordActivityV8("focus", 1);
  renderDailyStudyV7();
  renderProgressDashboardV8();
  document.title = originalDocumentTitleV9;

  const status = document.getElementById("focusTimerStatus");
  if (status) status.textContent = "Tamamlandı ✓";

  const banner = document.getElementById("networkStatus");
  if (banner) {
    banner.textContent = "Odak oturumu tamamlandı. Kısa bir mola verebilirsin.";
    banner.className = "network-status is-online";
    setTimeout(() => banner.classList.add("hidden"), 3500);
  }
}

/* Include grammar and focus in weekly points. */
getStudyPointsV8 = function(day) {
  return (day.search || 0)
    + (day.story || 0) * 5
    + (day.game || 0) * 3
    + (day.review || 0)
    + (day.quiz || 0) * 3
    + (day.grammar || 0) * 3
    + (day.focus || 0) * 2;
};

/* Add V9 statistics without replacing the existing dashboard. */
const baseRenderProgressDashboardV9 = renderProgressDashboardV8;
renderProgressDashboardV8 = function() {
  baseRenderProgressDashboardV9();

  const grid = document.querySelector("#progressDashboard .progress-stat-grid");
  if (!grid) return;

  const grammar = getGrammarQuizStatsV9();
  const log = getActivityLogV8();
  const focusTotal = Object.values(log).reduce((sum, day) => sum + (Number(day.focus) || 0), 0);

  grid.insertAdjacentHTML("beforeend", `
    <article><strong>${grammar.best}/10</strong><span>En iyi gramer testi</span></article>
    <article><strong>${focusTotal}</strong><span>Odak oturumu</span></article>
  `);
};

/* ---------- PWA update notification ---------- */

function showAppUpdateV9(worker) {
  const banner = document.getElementById("appUpdateBanner");
  if (!banner) return;

  banner.classList.remove("hidden");
  document.getElementById("applyAppUpdateBtn")?.addEventListener("click", () => {
    if (worker) worker.postMessage({ type: "SKIP_WAITING" });
    else location.reload();
  }, { once: true });
}

async function watchForAppUpdatesV9() {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;

    if (registration.waiting) showAppUpdateV9(registration.waiting);

    registration.addEventListener("updatefound", () => {
      const worker = registration.installing;
      if (!worker) return;

      worker.addEventListener("statechange", () => {
        if (worker.state === "installed" && navigator.serviceWorker.controller) {
          showAppUpdateV9(worker);
        }
      });
    });

    navigator.serviceWorker.addEventListener("controllerchange", () => location.reload());
    registration.update();
  } catch (error) {
    console.warn("Güncelleme kontrolü yapılamadı:", error);
  }
}

/* ---------- V9 initialization ---------- */

const baseLoadDictionaryV9 = loadDictionary;
loadDictionary = async function() {
  await baseLoadDictionaryV9();
  renderWordOfDayV9();

  const drawer = document.getElementById("dictionaryDrawer");
  if (drawer?.dataset.view === "explorer") drawWordExplorerContentV9();
};

document.addEventListener("scroll", handleReadingScrollV9, { passive: true });

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("dailyGoalsBtn")?.addEventListener("click", openDailyGoalsV9);
  document.getElementById("closeDailyGoalsBtn")?.addEventListener("click", closeDailyGoalsV9);

  document.getElementById("dailyGoalsForm")?.addEventListener("submit", event => {
    event.preventDefault();
    saveDailyGoalsV9();
  });

  document.getElementById("resetDailyGoalsBtn")?.addEventListener("click", () => {
    safeWriteStorage(DAILY_GOALS_KEY_V9, DEFAULT_DAILY_GOALS_V9);
    openDailyGoalsV9();
  });

  document.getElementById("dailyGoalsDialog")?.addEventListener("click", event => {
    if (event.target === event.currentTarget) closeDailyGoalsV9();
  });

  document.getElementById("wordExploreBtn")?.addEventListener("click", renderWordExplorerV9);

  document.querySelectorAll("[data-focus-minutes]").forEach(button => {
    button.addEventListener("click", () => setFocusDurationV9(button.dataset.focusMinutes));
  });

  document.getElementById("focusStartPauseBtn")?.addEventListener("click", toggleFocusTimerV9);
  document.getElementById("focusResetBtn")?.addEventListener("click", resetFocusTimerV9);

  document.getElementById("backToStories")?.addEventListener("click", () => {
    saveReadingPositionV9();
    activeReadingStoryV9 = null;
  });

  renderDailyStudyV7();
  renderFocusTimerV9();
  injectGrammarQuizV9();
  watchForAppUpdatesV9();
});
