/* ==========================================================
   BIG UPDATE 5
   - Reading progress stored in localStorage
   - Completed story controls
   - Grammar search and category filters
   ========================================================== */

const READING_PROGRESS_KEY = "almancaAskinaReadingProgressV1";

function getReadingProgress() {
  try {
    const value = JSON.parse(localStorage.getItem(READING_PROGRESS_KEY) || "[]");
    return new Set(Array.isArray(value) ? value : []);
  } catch (error) {
    return new Set();
  }
}

function saveReadingProgress(progress) {
  localStorage.setItem(READING_PROGRESS_KEY, JSON.stringify([...progress]));
}

function isStoryCompleted(storyId) {
  return getReadingProgress().has(storyId);
}

function toggleStoryCompleted(storyId) {
  const progress = getReadingProgress();
  if (progress.has(storyId)) progress.delete(storyId);
  else progress.add(storyId);
  saveReadingProgress(progress);
  updateReaderCompleteButton(storyId);
  if (currentStoryLevel) renderStoryList(currentStoryLevel);
}

function updateReaderCompleteButton(storyId) {
  const button = document.getElementById("storyCompleteButton");
  if (!button) return;
  const completed = isStoryCompleted(storyId);
  button.classList.toggle("is-completed", completed);
  button.setAttribute("aria-pressed", String(completed));
  button.textContent = completed ? "✓ Tamamlandı" : "Okudum, tamamla";
}

function getLevelProgress(level) {
  const stories = getStoriesData().filter(story => story.level === level);
  const progress = getReadingProgress();
  const completed = stories.filter(story => progress.has(story.id)).length;
  return { completed, total: stories.length };
}

function renderStoryList(level) {
  const storyList = document.getElementById("storyList");
  const readerCard = document.getElementById("readerCard");
  if (!storyList || !readerCard) return;

  const stories = getStoriesData().filter(story => story.level === level);
  const levelProgress = getLevelProgress(level);

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
    <div class="story-list-grid">
      ${stories.map(story => {
        const completed = isStoryCompleted(story.id);
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
      }).join("")}
    </div>
  `;

  storyList.querySelectorAll("[data-story-id]").forEach(button => {
    button.addEventListener("click", () => openStory(button.dataset.storyId));
  });
}

function openStory(storyId) {
  const story = getStoriesData().find(item => item.id === storyId);
  if (!story) return;

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

  if (story.text) {
    document.getElementById("readerText").innerHTML = annotateStoryText(story.text);
    return;
  }

  document.getElementById("readerText").innerHTML = (story.tokens || []).map(token => {
    if (typeof token === "string") return escapeHtml(token);
    return createReaderWordMarkup(token.de, [token.de, token.tr], false);
  }).join("");
}

let activeGrammarCategory = "Tümü";
let grammarSearchQuery = "";

function normalizeGrammarSearch(value) {
  return String(value || "")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getFilteredGrammarData() {
  const query = normalizeGrammarSearch(grammarSearchQuery);
  return getGrammarData().filter(item => {
    const categoryMatch = activeGrammarCategory === "Tümü" || item.category === activeGrammarCategory;
    if (!categoryMatch) return false;
    if (!query) return true;
    const searchable = normalizeGrammarSearch(JSON.stringify(item));
    return searchable.includes(query);
  });
}

function renderGrammarHaps() {
  const grid = document.getElementById("grammarGrid");
  if (!grid) return;

  const allData = getGrammarData();
  const data = getFilteredGrammarData();
  const categories = ["Tümü", ...new Set(allData.map(item => item.category).filter(Boolean))];

  grid.className = "grammar-library";
  grid.innerHTML = `
    <div class="grammar-tools">
      <label class="grammar-search-label">
        <span>Gramer konularında ara</span>
        <input type="search" id="grammarSearchInput" placeholder="Örn: Perfekt, Dativ, fiilin yeri..." value="${escapeHtml(grammarSearchQuery)}">
      </label>
      <div class="grammar-category-row">
        ${categories.map(category => `
          <button type="button" class="grammar-category-btn ${category === activeGrammarCategory ? "is-active" : ""}" data-grammar-category="${escapeHtml(category)}">
            ${escapeHtml(category)}
          </button>
        `).join("")}
      </div>
      <p class="grammar-result-count">${data.length} konu gösteriliyor</p>
    </div>

    <div class="grammar-accordion">
      ${data.length ? data.map((item, index) => `
        <article class="grammar-accordion-item ${index === 0 ? "is-open" : ""}">
          <button type="button" class="grammar-accordion-trigger">
            <div>
              <span>${escapeHtml(item.category || "Gramer")}</span>
              <strong>${escapeHtml(item.title)}</strong>
              <small>${escapeHtml(item.summary || "")}</small>
            </div>
            <b class="chevron">⌄</b>
          </button>
          <div class="grammar-accordion-content">
            ${renderGrammarContent(item)}
          </div>
        </article>
      `).join("") : `
        <div class="grammar-empty">
          <strong>Bu aramayla eşleşen konu bulunamadı.</strong>
          <span>Daha kısa bir kelimeyle tekrar deneyebilirsin.</span>
        </div>
      `}
    </div>
  `;

  document.getElementById("grammarSearchInput")?.addEventListener("input", event => {
    grammarSearchQuery = event.target.value;
    renderGrammarHaps();
    requestAnimationFrame(() => {
      const input = document.getElementById("grammarSearchInput");
      if (input) {
        input.focus({ preventScroll: true });
        input.setSelectionRange(input.value.length, input.value.length);
      }
    });
  });

  grid.querySelectorAll("[data-grammar-category]").forEach(button => {
    button.addEventListener("click", () => {
      activeGrammarCategory = button.dataset.grammarCategory;
      renderGrammarHaps();
    });
  });

  grid.querySelectorAll(".grammar-accordion-trigger").forEach(trigger => {
    trigger.addEventListener("click", () => {
      trigger.closest(".grammar-accordion-item").classList.toggle("is-open");
    });
  });
}
