/* Almanca Aşkına v10 — Kalıp Kütüphanesi */

let phraseLibraryLevelV10 = "ALL";
let phraseLibraryTypeV10 = "ALL";
let phraseLibraryQueryV10 = "";

function getPhrasesDataV10() {
  return Array.isArray(window.PHRASES_DATA) ? window.PHRASES_DATA : [];
}

function speakTextV10(text, rate = 0.9) {
  const clean = String(text || "").trim();
  if (!clean || !("speechSynthesis" in window)) return false;

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = "de-DE";
  utterance.rate = Number(rate) || 0.9;
  utterance.pitch = 1;

  const voices = window.speechSynthesis.getVoices();
  const german = voices.find(voice => /^de(?:-|_)/i.test(voice.lang));
  if (german) utterance.voice = german;
  window.speechSynthesis.speak(utterance);
  return true;
}

function normalizePhraseSearchV10(value) {
  return String(value || "")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .trim();
}

function getFilteredPhrasesV10() {
  const query = normalizePhraseSearchV10(phraseLibraryQueryV10);
  return getPhrasesDataV10().filter(item => {
    const levelMatch = phraseLibraryLevelV10 === "ALL" || item.level === phraseLibraryLevelV10;
    const typeMatch = phraseLibraryTypeV10 === "ALL" || item.type === phraseLibraryTypeV10;
    const text = normalizePhraseSearchV10([
      item.expression, item.tr, item.exampleDe, item.exampleTr,
      item.preposition, item.case, ...(item.tags || [])
    ].join(" "));
    return levelMatch && typeMatch && (!query || text.includes(query));
  });
}

function renderPhraseLibraryV10() {
  const drawer = document.getElementById("dictionaryDrawer");
  if (!drawer) return;

  if (!drawer.classList.contains("hidden") && drawer.dataset.view === "phrases") {
    drawer.classList.add("hidden");
    return;
  }

  drawer.dataset.view = "phrases";
  drawer.classList.remove("hidden");
  drawPhraseLibraryV10();
}

function drawPhraseLibraryV10() {
  const drawer = document.getElementById("dictionaryDrawer");
  if (!drawer || drawer.dataset.view !== "phrases") return;

  const items = getFilteredPhrasesV10();
  drawer.innerHTML = `
    <div class="drawer-head phrase-library-head">
      <div>
        <strong>Kalıp Kütüphanesi</strong>
        <span>${items.length} / ${getPhrasesDataV10().length} kayıt gösteriliyor</span>
      </div>
    </div>

    <div class="phrase-library-tools">
      <label>
        <span>Kalıplarda ara</span>
        <input type="search" id="phraseLibrarySearch" placeholder="Örn: warten, yardım, Dativ..." value="${escapeHtml(phraseLibraryQueryV10)}">
      </label>
      <label>
        <span>Seviye</span>
        <select id="phraseLibraryLevel">
          <option value="ALL">A1 + A2</option>
          <option value="A1">A1</option>
          <option value="A2">A2</option>
        </select>
      </label>
      <label>
        <span>Tür</span>
        <select id="phraseLibraryType">
          <option value="ALL">Tüm kayıtlar</option>
          <option value="verb-preposition">Fiil + edat</option>
          <option value="daily-expression">Günlük ifade</option>
        </select>
      </label>
    </div>

    <div class="phrase-library-list">
      ${items.length ? items.slice(0, 120).map(item => `
        <article class="phrase-library-card">
          <div class="phrase-library-card-head">
            <div>
              <span>${escapeHtml(item.level)} · ${item.type === "verb-preposition" ? "Fiil + edat" : "Günlük ifade"}</span>
              <strong>${escapeHtml(item.expression)}</strong>
            </div>
            <button type="button" data-phrase-speak="${escapeHtml(item.exampleDe || item.expression)}" aria-label="Almanca ifadeyi dinle">🔊</button>
          </div>
          <p>${escapeHtml(item.tr)}</p>
          ${item.preposition ? `<div class="phrase-case-row"><b>${escapeHtml(item.preposition)}</b><em>${escapeHtml(item.case)}</em></div>` : ""}
          <div class="phrase-example">
            <strong>${escapeHtml(item.exampleDe || item.expression)}</strong>
            <span>${escapeHtml(item.exampleTr || item.tr)}</span>
          </div>
        </article>
      `).join("") : `
        <div class="drawer-empty">Bu filtrelerle eşleşen kalıp bulunamadı.</div>
      `}
    </div>
    ${items.length > 120 ? `<p class="phrase-limit-note">İlk 120 kayıt gösteriliyor. Aramayı daraltarak diğer kayıtlara ulaşabilirsin.</p>` : ""}
  `;

  document.getElementById("phraseLibraryLevel").value = phraseLibraryLevelV10;
  document.getElementById("phraseLibraryType").value = phraseLibraryTypeV10;

  document.getElementById("phraseLibrarySearch")?.addEventListener("input", event => {
    phraseLibraryQueryV10 = event.target.value;
    drawPhraseLibraryV10();
    requestAnimationFrame(() => {
      const input = document.getElementById("phraseLibrarySearch");
      input?.focus({ preventScroll: true });
      input?.setSelectionRange(input.value.length, input.value.length);
    });
  });

  document.getElementById("phraseLibraryLevel")?.addEventListener("change", event => {
    phraseLibraryLevelV10 = event.target.value;
    drawPhraseLibraryV10();
  });

  document.getElementById("phraseLibraryType")?.addEventListener("change", event => {
    phraseLibraryTypeV10 = event.target.value;
    drawPhraseLibraryV10();
  });

  drawer.querySelectorAll("[data-phrase-speak]").forEach(button => {
    button.addEventListener("click", () => speakTextV10(button.dataset.phraseSpeak));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const count = document.getElementById("phraseCount");
  if (count) count.textContent = String(getPhrasesDataV10().length);
  document.getElementById("phraseLibraryBtn")?.addEventListener("click", renderPhraseLibraryV10);
});
