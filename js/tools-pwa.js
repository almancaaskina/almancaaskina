/* ==========================================================
   BIG UPDATE 6
   1) Live dictionary suggestions + recent searches
   2) Local word notebook / favorites
   3) 10-question game sessions + wrong-answer review
   4) Story search, status filter and continue reading
   5) PWA installation and offline support
   6) Network/offline status feedback
   ========================================================== */

const FAVORITES_KEY = "almancaAskinaFavoritesV1";
const SEARCH_HISTORY_KEY = "almancaAskinaSearchHistoryV1";
const LAST_STORY_KEY = "almancaAskinaLastStoryV1";
const GAME_BEST_KEY = "almancaAskinaGameBestV1";

let storySearchQueryV6 = "";
let storyStatusFilterV6 = "all";
let deferredInstallPrompt = null;
let gameSessionV6 = null;
let gameAnswerLockedV6 = false;

function safeReadStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch (error) {
    return fallback;
  }
}

function safeWriteStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Tarayıcı verisi kaydedilemedi:", error);
  }
}

function getEntryStorageId(item) {
  return String(item?.id || item?.key || `${item?.word || ""}-${item?.pos || "other"}`);
}

/* ---------- SEARCH SUGGESTIONS + HISTORY ---------- */

function initSearch() {
  const form = document.getElementById("searchForm");
  const input = document.getElementById("searchInput");
  const suggestions = document.getElementById("searchSuggestions");
  if (!form || !input) return;

  form.addEventListener("submit", event => {
    event.preventDefault();
    const query = input.value.trim();
    if (query) addSearchHistory(query);
    hideSearchSuggestions();
    handleSearch(query);
  });

  input.addEventListener("input", () => {
    renderSearchSuggestions(input.value);
  });

  input.addEventListener("focus", () => {
    renderSearchSuggestions(input.value);
  });

  input.addEventListener("keydown", event => {
    const items = [...document.querySelectorAll("[data-suggestion-value]")];
    if (!items.length) return;

    const active = document.querySelector(".search-suggestion.is-active");
    let index = active ? items.indexOf(active) : -1;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      index = (index + 1) % items.length;
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      index = (index - 1 + items.length) % items.length;
    } else if (event.key === "Enter" && active) {
      event.preventDefault();
      chooseSearchSuggestion(active.dataset.suggestionValue);
      return;
    } else if (event.key === "Escape") {
      hideSearchSuggestions();
      return;
    } else {
      return;
    }

    items.forEach(item => item.classList.remove("is-active"));
    items[index]?.classList.add("is-active");
    items[index]?.scrollIntoView({ block: "nearest" });
  });

  document.addEventListener("click", event => {
    if (!event.target.closest(".search-card")) hideSearchSuggestions();
  });

  document.getElementById("recentSearchesBtn")?.addEventListener("click", renderRecentSearchesDrawer);
  document.getElementById("wordNotebookBtn")?.addEventListener("click", renderWordNotebook);
  suggestions?.addEventListener("mousedown", event => event.preventDefault());

  updateFavoriteCount();
}

function getSearchSuggestions(query) {
  const germanQuery = normalizeGerman(query);
  const turkishQuery = normalizeAnswer(query);
  if (!germanQuery && !turkishQuery) {
    return getSearchHistory().map(value => ({
      type: "history",
      label: value,
      sublabel: "Son arama",
      value
    }));
  }

  return dictionaryData
    .filter(item => item?.word && item?.tr)
    .map(item => {
      const german = normalizeGerman(item.word);
      const raw = normalizeGerman(item.raw);
      const translation = normalizeAnswer(item.tr);
      let score = 0;

      if (german === germanQuery) score = 120;
      else if (german.startsWith(germanQuery)) score = 100;
      else if (raw.startsWith(germanQuery)) score = 85;
      else if (german.includes(germanQuery)) score = 70;

      if (translation === turkishQuery) score = Math.max(score, 115);
      else if (turkishQuery && translation.startsWith(turkishQuery)) score = Math.max(score, 90);
      else if (turkishQuery && translation.includes(turkishQuery)) score = Math.max(score, 65);

      return { item, score };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score || a.item.word.localeCompare(b.item.word, "de"))
    .slice(0, 8)
    .map(result => ({
      type: "word",
      label: getGermanDisplay(result.item),
      sublabel: result.item.tr,
      meta: `${result.item.level || "A1/A2"} · ${getPosLabel(result.item.pos)}`,
      value: result.item.word
    }));
}

function renderSearchSuggestions(query) {
  const box = document.getElementById("searchSuggestions");
  if (!box || !dictionaryData.length) return;

  const suggestions = getSearchSuggestions(query);
  if (!suggestions.length) {
    hideSearchSuggestions();
    return;
  }

  box.innerHTML = suggestions.map((suggestion, index) => `
    <button type="button" class="search-suggestion${index === 0 ? " is-active" : ""}" role="option"
      data-suggestion-value="${escapeHtml(suggestion.value)}">
      <span>
        <strong>${escapeHtml(suggestion.label)}</strong>
        <small>${escapeHtml(suggestion.sublabel || "")}</small>
      </span>
      ${suggestion.meta ? `<em>${escapeHtml(suggestion.meta)}</em>` : ""}
    </button>
  `).join("");

  box.classList.remove("hidden");
  box.querySelectorAll("[data-suggestion-value]").forEach(button => {
    button.addEventListener("click", () => chooseSearchSuggestion(button.dataset.suggestionValue));
  });
}

function chooseSearchSuggestion(value) {
  const input = document.getElementById("searchInput");
  if (input) input.value = value;
  addSearchHistory(value);
  hideSearchSuggestions();
  handleSearch(value);
}

function hideSearchSuggestions() {
  document.getElementById("searchSuggestions")?.classList.add("hidden");
}

function getSearchHistory() {
  const history = safeReadStorage(SEARCH_HISTORY_KEY, []);
  return Array.isArray(history) ? history.slice(0, 8) : [];
}

function addSearchHistory(query) {
  const clean = String(query || "").trim();
  if (!clean) return;
  const history = getSearchHistory().filter(item => normalizeAnswer(item) !== normalizeAnswer(clean));
  history.unshift(clean);
  safeWriteStorage(SEARCH_HISTORY_KEY, history.slice(0, 8));
}

function renderRecentSearchesDrawer() {
  const drawer = document.getElementById("dictionaryDrawer");
  if (!drawer) return;

  if (!drawer.classList.contains("hidden") && drawer.dataset.view === "history") {
    drawer.classList.add("hidden");
    return;
  }

  const history = getSearchHistory();
  drawer.dataset.view = "history";
  drawer.innerHTML = `
    <div class="drawer-head">
      <div>
        <strong>Son aramalar</strong>
        <span>Bu cihazda saklanır.</span>
      </div>
      ${history.length ? '<button type="button" class="text-btn" id="clearSearchHistory">Temizle</button>' : ""}
    </div>
    ${history.length ? `
      <div class="history-chip-list">
        ${history.map(value => `<button type="button" data-history-query="${escapeHtml(value)}">${escapeHtml(value)}</button>`).join("")}
      </div>
    ` : '<div class="drawer-empty">Henüz bir arama yapmadın.</div>'}
  `;
  drawer.classList.remove("hidden");

  drawer.querySelectorAll("[data-history-query]").forEach(button => {
    button.addEventListener("click", () => chooseSearchSuggestion(button.dataset.historyQuery));
  });

  document.getElementById("clearSearchHistory")?.addEventListener("click", () => {
    safeWriteStorage(SEARCH_HISTORY_KEY, []);
    renderRecentSearchesDrawer();
  });
}

/* ---------- FAVORITES / WORD NOTEBOOK ---------- */

function getFavoriteIds() {
  const values = safeReadStorage(FAVORITES_KEY, []);
  return new Set(Array.isArray(values) ? values : []);
}

function isFavorite(item) {
  return getFavoriteIds().has(getEntryStorageId(item));
}

function toggleFavorite(item) {
  const favorites = getFavoriteIds();
  const id = getEntryStorageId(item);
  if (favorites.has(id)) favorites.delete(id);
  else favorites.add(id);
  safeWriteStorage(FAVORITES_KEY, [...favorites]);
  updateFavoriteCount();
  updateFavoriteButton(item);
}

function updateFavoriteCount() {
  const count = getFavoriteIds().size;
  const element = document.getElementById("favoriteCount");
  if (element) element.textContent = String(count);
}

function updateFavoriteButton(item) {
  const button = document.getElementById("favoriteWordBtn");
  if (!button) return;
  const saved = isFavorite(item);
  button.classList.toggle("is-saved", saved);
  button.setAttribute("aria-pressed", String(saved));
  button.textContent = saved ? "★ Defterde" : "☆ Deftere ekle";
}

function renderResultHeader(item, displayWord) {
  const article = item.article ? `<span class="article">${escapeHtml(item.article)}</span>` : "";
  const saved = isFavorite(item);
  return `
    <div class="result-top">
      <div>
        <div class="result-title">${article}<span class="word">${escapeHtml(displayWord || item.word)}</span></div>
        <p class="translation">${escapeHtml(item.tr || "Türkçe anlam kontrol edilecek")}</p>
      </div>
      <div class="result-actions">
        <div class="badge-row">
          <span class="level-badge">${escapeHtml(item.level || "A1/A2")}</span>
          <span class="pos-badge">${escapeHtml(getPosLabel(item.pos))}</span>
        </div>
        <button type="button" class="favorite-word-btn${saved ? " is-saved" : ""}" id="favoriteWordBtn"
          aria-pressed="${saved}">${saved ? "★ Defterde" : "☆ Deftere ekle"}</button>
      </div>
    </div>`;
}

function renderFoundResult(item) {
  const resultPreview = document.getElementById("resultPreview");

  if (item.pos === "verb") {
    resultPreview.innerHTML = renderVerbResult(item);
    bindVerbTabs();
  } else if (item.pos === "noun") {
    resultPreview.innerHTML = renderNounResult(item);
  } else {
    resultPreview.innerHTML = renderSimpleResult(item);
  }

  document.getElementById("favoriteWordBtn")?.addEventListener("click", () => toggleFavorite(item));
}

function renderWordNotebook() {
  const drawer = document.getElementById("dictionaryDrawer");
  if (!drawer) return;

  if (!drawer.classList.contains("hidden") && drawer.dataset.view === "favorites") {
    drawer.classList.add("hidden");
    return;
  }

  const favoriteIds = getFavoriteIds();
  const words = dictionaryData
    .filter(item => favoriteIds.has(getEntryStorageId(item)))
    .sort((a, b) => (a.level || "").localeCompare(b.level || "") || a.word.localeCompare(b.word, "de"));

  drawer.dataset.view = "favorites";
  drawer.innerHTML = `
    <div class="drawer-head">
      <div>
        <strong>Kelime Defteri</strong>
        <span>${words.length} kayıt · yalnızca bu cihazda saklanır</span>
      </div>
      ${words.length ? '<button type="button" class="text-btn" id="clearFavorites">Tümünü kaldır</button>' : ""}
    </div>
    ${words.length ? `
      <div class="notebook-list">
        ${words.map(item => `
          <div class="notebook-item">
            <button type="button" class="notebook-open" data-notebook-word="${escapeHtml(item.word)}">
              <strong>${escapeHtml(getGermanDisplay(item))}</strong>
              <span>${escapeHtml(item.tr)}</span>
              <small>${escapeHtml(item.level || "A1/A2")} · ${escapeHtml(getPosLabel(item.pos))}</small>
            </button>
            <button type="button" class="notebook-remove" aria-label="Kelimeyi defterden kaldır"
              data-remove-favorite="${escapeHtml(getEntryStorageId(item))}">×</button>
          </div>
        `).join("")}
      </div>
    ` : '<div class="drawer-empty">Sözlük sonucundaki “Deftere ekle” düğmesiyle kelime biriktirebilirsin.</div>'}
  `;
  drawer.classList.remove("hidden");

  drawer.querySelectorAll("[data-notebook-word]").forEach(button => {
    button.addEventListener("click", () => chooseSearchSuggestion(button.dataset.notebookWord));
  });

  drawer.querySelectorAll("[data-remove-favorite]").forEach(button => {
    button.addEventListener("click", () => {
      const favorites = getFavoriteIds();
      favorites.delete(button.dataset.removeFavorite);
      safeWriteStorage(FAVORITES_KEY, [...favorites]);
      updateFavoriteCount();
      renderWordNotebook();
    });
  });

  document.getElementById("clearFavorites")?.addEventListener("click", () => {
    safeWriteStorage(FAVORITES_KEY, []);
    updateFavoriteCount();
    renderWordNotebook();
  });
}

/* ---------- GAME SESSION V6 ---------- */

function initGame() {
  ensureGameSessionUI();

  document.querySelectorAll("[data-game-level]").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-game-level]").forEach(btn => btn.classList.remove("is-active"));
      button.classList.add("is-active");
      currentGameLevel = button.dataset.gameLevel;
      startGameSessionV6();
    });
  });

  document.querySelectorAll("[data-game-mode]").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-game-mode]").forEach(btn => btn.classList.remove("is-active"));
      button.classList.add("is-active");
      currentGameMode = button.dataset.gameMode;
      startGameSessionV6();
    });
  });

  document.getElementById("randomWordBtn")?.addEventListener("click", () => {
    if (!gameSessionV6 || gameSessionV6.finished) startGameSessionV6();
    else setNewGameWord();
  });

  document.getElementById("guessInput")?.addEventListener("keydown", event => {
    if (event.key === "Enter") checkGameAnswer();
  });
}

function ensureGameSessionUI() {
  const toolbar = document.querySelector(".game-toolbar");
  if (toolbar && !document.getElementById("gameSessionStats")) {
    toolbar.insertAdjacentHTML("afterend", `
      <div class="game-session-stats" id="gameSessionStats">
        <span>Soru <strong id="gameQuestionCount">0/10</strong></span>
        <span>Doğru <strong id="gameCorrectCount">0</strong></span>
        <span>Yanlış <strong id="gameWrongCount">0</strong></span>
        <span>En iyi <strong id="gameBestCount">${getGameBestScoreV6()}/10</strong></span>
      </div>
    `);
  }
}

function getGameBestScoreV6() {
  const value = Number(safeReadStorage(GAME_BEST_KEY, 0));
  return Number.isFinite(value) ? value : 0;
}

function startGameSessionV6(reviewWords = null) {
  gameSessionV6 = {
    target: reviewWords?.length || 10,
    answered: 0,
    correct: 0,
    wrong: [],
    reviewQueue: Array.isArray(reviewWords) ? [...reviewWords] : null,
    finished: false,
    seen: new Set()
  };
  gameAnswerLockedV6 = false;
  resetStreak();
  updateGameSessionStatsV6();
  setNewGameWord();
}

function prepareFirstGameWord() {
  if (dictionaryData.length && !gameSessionV6) startGameSessionV6();
}

function setNewGameWord() {
  if (!dictionaryData.length) return;
  if (!gameSessionV6 || gameSessionV6.finished) {
    startGameSessionV6();
    return;
  }

  let candidate = null;
  if (gameSessionV6.reviewQueue?.length) {
    candidate = gameSessionV6.reviewQueue.shift();
  } else {
    const effectiveMode = currentGameMode === "mixed"
      ? (Math.random() > 0.5 ? "meaning" : "article")
      : currentGameMode;
    const pool = getGamePool(effectiveMode);
    const unseen = pool.filter(item => !gameSessionV6.seen.has(getEntryStorageId(item)));
    const source = unseen.length ? unseen : pool;
    if (!source.length) return;
    const item = source[Math.floor(Math.random() * source.length)];
    candidate = { ...item, gameMode: effectiveMode };
  }

  currentGameWord = { ...candidate };
  if (!currentGameWord.gameMode) {
    currentGameWord.gameMode = currentGameMode === "mixed" ? "meaning" : currentGameMode;
  }

  gameSessionV6.seen.add(getEntryStorageId(currentGameWord));
  activeArticleChoice = null;
  gameAnswerLockedV6 = false;
  renderGameQuestion();
  updateGameSessionStatsV6();
  focusGameInput();
}

function checkGameAnswer() {
  if (!currentGameWord || gameAnswerLockedV6 || !gameSessionV6 || gameSessionV6.finished) return;

  let correct = false;
  let message = "";

  if (currentGameWord.gameMode === "article") {
    if (!activeArticleChoice) return;
    correct = activeArticleChoice === currentGameWord.article;
    const correctText = `${currentGameWord.article} ${currentGameWord.word}`;
    const meaningText = currentGameWord.tr ? ` — ${currentGameWord.tr}` : "";
    message = correct ? `Doğru: ${correctText}${meaningText}` : `Yanlış. Doğrusu: ${correctText}${meaningText}`;
  } else {
    const input = document.getElementById("guessInput");
    const guess = normalizeAnswer(input?.value || "");
    if (!guess) return;
    const answers = getAcceptedAnswers(currentGameWord.tr);
    correct = answers.some(answer => {
      const cleanAnswer = normalizeAnswer(answer);
      return guess === cleanAnswer || (guess.length >= 3 && cleanAnswer.includes(guess));
    });
    message = correct ? `Doğru: ${currentGameWord.tr}` : `Yanlış. Doğrusu: ${currentGameWord.tr}`;
  }

  gameAnswerLockedV6 = true;
  showGameResult(correct, message);
}

function showGameResult(correct, message) {
  const result = document.getElementById("gameResult");
  if (!result || !gameSessionV6) return;

  gameSessionV6.answered += 1;
  if (correct) {
    streak += 1;
    gameSessionV6.correct += 1;
    result.className = "game-feedback success";
  } else {
    streak = 0;
    gameSessionV6.wrong.push({ ...currentGameWord });
    result.className = "game-feedback error";
  }

  result.textContent = message;
  document.getElementById("streakCount").textContent = String(streak);
  updateGameSessionStatsV6();

  if (gameSessionV6.answered >= gameSessionV6.target) {
    setTimeout(finishGameSessionV6, 650);
  } else {
    setTimeout(setNewGameWord, 850);
  }
}

function updateGameSessionStatsV6() {
  if (!gameSessionV6) return;
  const values = {
    gameQuestionCount: `${Math.min(gameSessionV6.answered + (gameSessionV6.finished ? 0 : 1), gameSessionV6.target)}/${gameSessionV6.target}`,
    gameCorrectCount: gameSessionV6.correct,
    gameWrongCount: gameSessionV6.wrong.length,
    gameBestCount: `${getGameBestScoreV6()}/10`
  };
  Object.entries(values).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = String(value);
  });
}

function finishGameSessionV6() {
  if (!gameSessionV6) return;
  gameSessionV6.finished = true;

  if (gameSessionV6.target === 10 && gameSessionV6.correct > getGameBestScoreV6()) {
    safeWriteStorage(GAME_BEST_KEY, gameSessionV6.correct);
  }

  const answerArea = document.getElementById("answerArea");
  const result = document.getElementById("gameResult");
  const percentage = Math.round((gameSessionV6.correct / gameSessionV6.target) * 100);

  document.getElementById("gameDirection").textContent = "Oturum tamamlandı";
  document.getElementById("gameWord").textContent = `${gameSessionV6.correct} / ${gameSessionV6.target}`;
  document.getElementById("gameHint").textContent = `%${percentage} başarı`;
  if (result) {
    result.textContent = gameSessionV6.wrong.length
      ? `${gameSessionV6.wrong.length} kelimeyi tekrar edebilirsin.`
      : "Mükemmel, bu oturumda yanlışın yok.";
    result.className = gameSessionV6.wrong.length ? "game-feedback" : "game-feedback success";
  }

  if (answerArea) {
    answerArea.innerHTML = `
      <div class="game-summary-actions">
        ${gameSessionV6.wrong.length ? '<button type="button" class="primary-mini-btn" id="reviewWrongBtn">Yanlışları tekrar et</button>' : ""}
        <button type="button" class="secondary-mini-btn" id="newSessionBtn">Yeni 10 soru</button>
      </div>
    `;
  }

  document.getElementById("reviewWrongBtn")?.addEventListener("click", () => {
    const wrong = gameSessionV6.wrong.map(item => ({ ...item }));
    startGameSessionV6(wrong);
  });
  document.getElementById("newSessionBtn")?.addEventListener("click", () => startGameSessionV6());
  updateGameSessionStatsV6();
}

/* ---------- STORY SEARCH + CONTINUE ---------- */

function getLastStoryDataV6() {
  const value = safeReadStorage(LAST_STORY_KEY, null);
  return value && typeof value === "object" ? value : null;
}

function renderStoryList(level) {
  const storyList = document.getElementById("storyList");
  const readerCard = document.getElementById("readerCard");
  if (!storyList || !readerCard) return;

  currentStoryLevel = level;
  const allStories = getStoriesData().filter(story => story.level === level);
  const progress = getReadingProgress();
  const levelProgress = getLevelProgress(level);
  const query = normalizeGrammarSearch(storySearchQueryV6);

  const stories = allStories.filter(story => {
    const searchMatch = !query || normalizeGrammarSearch(`${story.title} ${story.topic || ""} ${story.text || ""}`).includes(query);
    const completed = progress.has(story.id);
    const statusMatch =
      storyStatusFilterV6 === "all" ||
      (storyStatusFilterV6 === "completed" && completed) ||
      (storyStatusFilterV6 === "unread" && !completed);
    return searchMatch && statusMatch;
  });

  const last = getLastStoryDataV6();
  const lastStory = last?.level === level ? allStories.find(story => story.id === last.id) : null;

  readerCard.classList.add("hidden");
  storyList.classList.remove("hidden");

  storyList.innerHTML = `
    <div class="reading-progress-card">
      <div>
        <strong>${escapeHtml(level)} okuma ilerlemesi</strong>
        <span>${levelProgress.completed} / ${levelProgress.total} hikâye tamamlandı</span>
      </div>
      <div class="reading-progress-track" aria-hidden="true">
        <span style="width:${levelProgress.total ? Math.round(levelProgress.completed / levelProgress.total * 100) : 0}%"></span>
      </div>
    </div>

    ${lastStory ? `
      <button type="button" class="continue-story-card" data-continue-story="${escapeHtml(lastStory.id)}">
        <span>Kaldığın yerden devam et</span>
        <strong>${escapeHtml(lastStory.title)}</strong>
        <small>${lastStory.minutes} dk · ${lastStory.words} kelime</small>
      </button>
    ` : ""}

    <div class="story-tools">
      <label>
        <span class="sr-only">Hikâye ara</span>
        <input type="search" id="storySearchInput" placeholder="Başlık veya konu ara..." value="${escapeHtml(storySearchQueryV6)}">
      </label>
      <div class="story-filter-row">
        ${[
          ["all", "Tümü"],
          ["unread", "Okunmadı"],
          ["completed", "Tamamlandı"]
        ].map(([value, label]) => `
          <button type="button" class="${storyStatusFilterV6 === value ? "is-active" : ""}" data-story-filter="${value}">${label}</button>
        `).join("")}
      </div>
    </div>

    <p class="story-result-count">${stories.length} hikâye gösteriliyor</p>

    <div class="story-list-grid">
      ${stories.length ? stories.map(story => {
        const completed = progress.has(story.id);
        return `
          <button type="button" class="story-card ${completed ? "is-completed" : ""}" data-story-id="${escapeHtml(story.id)}">
            <span>${completed ? "✓ " : ""}${escapeHtml(story.title)}</span>
            <small>${escapeHtml(story.topic || `${story.level} okuma`)}</small>
            <div class="story-meta">
              <em>${story.level}</em>
              <em>${story.minutes} dk</em>
              <em>${story.words} kelime</em>
              ${completed ? "<em>Tamamlandı</em>" : ""}
            </div>
          </button>
        `;
      }).join("") : `
        <div class="story-empty-state">
          <strong>Eşleşen hikâye bulunamadı.</strong>
          <span>Aramayı veya filtreyi değiştirebilirsin.</span>
        </div>
      `}
    </div>
  `;

  document.getElementById("storySearchInput")?.addEventListener("input", event => {
    storySearchQueryV6 = event.target.value;
    renderStoryList(level);
    requestAnimationFrame(() => {
      const input = document.getElementById("storySearchInput");
      if (input) {
        input.focus({ preventScroll: true });
        input.setSelectionRange(input.value.length, input.value.length);
      }
    });
  });

  storyList.querySelectorAll("[data-story-filter]").forEach(button => {
    button.addEventListener("click", () => {
      storyStatusFilterV6 = button.dataset.storyFilter;
      renderStoryList(level);
    });
  });

  storyList.querySelectorAll("[data-story-id]").forEach(button => {
    button.addEventListener("click", () => openStory(button.dataset.storyId));
  });

  document.querySelector("[data-continue-story]")?.addEventListener("click", event => {
    openStory(event.currentTarget.dataset.continueStory);
  });
}

function openStory(storyId) {
  const story = getStoriesData().find(item => item.id === storyId);
  if (!story) return;

  safeWriteStorage(LAST_STORY_KEY, {
    id: story.id,
    level: story.level,
    title: story.title,
    openedAt: Date.now()
  });

  document.getElementById("storyList")?.classList.add("hidden");
  document.getElementById("readerCard")?.classList.remove("hidden");

  const meta = document.getElementById("readerMeta");
  if (meta) {
    meta.innerHTML = `
      <em>${story.level}</em>
      <em>${escapeHtml(story.topic || `${story.level} okuma`)}</em>
      <em>${story.minutes} dk</em>
      <em>${story.words} kelime</em>
      <button type="button" class="story-complete-btn" id="storyCompleteButton" aria-pressed="false"></button>
    `;
  }

  document.getElementById("readerTitle").textContent = story.title;
  updateReaderCompleteButton(story.id);

  document.getElementById("storyCompleteButton")?.addEventListener("click", () => {
    toggleStoryCompleted(story.id);
  });

  const readerText = document.getElementById("readerText");
  if (story.text) {
    readerText.innerHTML = annotateStoryText(story.text);
  } else {
    readerText.innerHTML = (story.tokens || []).map(token => {
      if (typeof token === "string") return escapeHtml(token);
      return createReaderWordMarkup(token.de, [token.de, token.tr], false);
    }).join("");
  }
}

/* ---------- PWA + NETWORK ---------- */

function initPwaV6() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js?v=15.7").catch(error => {
        console.warn("Çevrimdışı destek başlatılamadı:", error);
      });
    });
  }

  const installButton = document.getElementById("installAppBtn");

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    installButton?.classList.remove("hidden");
  });

  installButton?.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installButton.classList.add("hidden");
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    installButton?.classList.add("hidden");
  });
}

function updateNetworkStatusV6() {
  const status = document.getElementById("networkStatus");
  if (!status) return;

  if (navigator.onLine) {
    status.textContent = "Bağlantı yeniden kuruldu.";
    status.className = "network-status is-online";
    setTimeout(() => status.classList.add("hidden"), 2200);
  } else {
    status.textContent = "Çevrimdışısın. Daha önce açılan içerikler çalışmaya devam eder.";
    status.className = "network-status is-offline";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initPwaV6();
  updateNetworkStatusV6();
  window.addEventListener("online", updateNetworkStatusV6);
  window.addEventListener("offline", updateNetworkStatusV6);
});
