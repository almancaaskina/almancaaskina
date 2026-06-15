/* Almanca Aşkına v10 — Cümle Kurma Atölyesi */

const SENTENCE_STATS_KEY_V10 = "almancaAskinaSentenceStatsV1";
let sentenceLevelV10 = "A1";
let sentenceModeV10 = "order";
let sentenceSessionV10 = null;
let sentenceBuiltTokensV10 = [];
let sentenceAvailableTokensV10 = [];

function getSentenceStatsV10() {
  const value = safeReadStorage(SENTENCE_STATS_KEY_V10, {});
  return { attempts: Number(value.attempts) || 0, best: Number(value.best) || 0, completed: Number(value.completed) || 0 };
}

function saveSentenceStatsV10(score) {
  const old = getSentenceStatsV10();
  safeWriteStorage(SENTENCE_STATS_KEY_V10, {
    attempts: old.attempts + 1,
    best: Math.max(old.best, score),
    completed: old.completed + 1,
    updatedAt: Date.now()
  });
}

function sentenceShuffleV10(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[target]] = [copy[target], copy[index]];
  }
  return copy;
}

function getSentencePoolV10() {
  const levelFilter = item => sentenceLevelV10 === "ALL" || item.level === sentenceLevelV10;
  if (sentenceModeV10 === "order") {
    return getPhrasesDataV10().filter(item => {
      const tokens = tokenizeSentenceV10(item.exampleDe || item.expression);
      return levelFilter(item) && tokens.length >= 3 && tokens.length <= 11;
    });
  }
  return getPhrasesDataV10().filter(item => item.type === "verb-preposition" && item.preposition && item.case && levelFilter(item));
}

function tokenizeSentenceV10(text) {
  return String(text || "").trim().replace(/[.!?]$/g, "").split(/\s+/).filter(Boolean);
}

function renderSentenceIdleV10() {
  const mount = document.getElementById("sentenceMount");
  if (!mount) return;
  const stats = getSentenceStatsV10();
  const descriptions = {
    order: ["Kelimeleri Sırala", "Karışık kelimeleri doğru Almanca cümle hâline getir."],
    blank: ["Edatı Tamamla", "Fiille birlikte kullanılan doğru edatı seç."],
    case: ["Hâli Seç", "Kalıbın Akkusativ mi Dativ mi istediğini bul."]
  };
  const [title, description] = descriptions[sentenceModeV10];
  mount.innerHTML = `
    <div class="practice-idle">
      <span>${title}</span>
      <h3>${description}</h3>
      <p>Her oturum 10 sorudan oluşur ve sonuç cihazında saklanır.</p>
      <div class="practice-stat-row"><span>En iyi <strong>${stats.best}/10</strong></span><span>Oturum <strong>${stats.completed}</strong></span></div>
      <button type="button" class="practice-primary-btn" id="startSentenceBtn">10 soruluk oturumu başlat</button>
    </div>
  `;
  document.getElementById("startSentenceBtn")?.addEventListener("click", startSentenceSessionV10);
}

function startSentenceSessionV10(review = null) {
  const pool = review?.length ? review : sentenceShuffleV10(getSentencePoolV10()).slice(0, 10);
  if (pool.length < 4) {
    alert("Bu seviye ve mod için yeterli kayıt bulunamadı.");
    return;
  }
  sentenceSessionV10 = { pool, index: 0, correct: 0, wrong: [], locked: false };
  renderSentenceQuestionV10();
}

function getCurrentSentenceV10() { return sentenceSessionV10?.pool[sentenceSessionV10.index] || null; }

function renderSentenceQuestionV10() {
  const mount = document.getElementById("sentenceMount");
  const item = getCurrentSentenceV10();
  if (!mount || !item || !sentenceSessionV10) return;

  const header = `
    <div class="practice-progress-row">
      <span>Soru ${sentenceSessionV10.index + 1}/${sentenceSessionV10.pool.length}</span>
      <strong>${sentenceSessionV10.correct} doğru</strong>
    </div>`;

  if (sentenceModeV10 === "order") {
    const answer = tokenizeSentenceV10(item.exampleDe || item.expression);
    sentenceBuiltTokensV10 = [];
    sentenceAvailableTokensV10 = sentenceShuffleV10(answer.map((token, index) => ({ id: `${index}-${token}`, token })));
    if (sentenceAvailableTokensV10.map(x => x.token).join(" ") === answer.join(" ")) sentenceAvailableTokensV10.reverse();

    mount.innerHTML = `${header}
      <div class="sentence-question-copy"><span>Türkçesi</span><strong>${escapeHtml(item.exampleTr || item.tr)}</strong></div>
      <div class="sentence-build-area" id="sentenceBuildArea"><span>Kelimelere sırayla dokun.</span></div>
      <div class="sentence-token-bank" id="sentenceTokenBank"></div>
      <div class="sentence-action-row">
        <button type="button" id="clearSentenceOrderBtn">Temizle</button>
        <button type="button" class="practice-primary-btn" id="checkSentenceOrderBtn">Kontrol et</button>
      </div>
      <p class="practice-feedback" id="sentenceFeedback" aria-live="polite"></p>`;
    drawSentenceTokensV10();
    document.getElementById("clearSentenceOrderBtn")?.addEventListener("click", () => {
      sentenceAvailableTokensV10.push(...sentenceBuiltTokensV10);
      sentenceBuiltTokensV10 = [];
      drawSentenceTokensV10();
    });
    document.getElementById("checkSentenceOrderBtn")?.addEventListener("click", checkSentenceOrderV10);
    return;
  }

  if (sentenceModeV10 === "blank") {
    const sentence = String(item.exampleDe).replace(new RegExp(`\\b${item.preposition}\\b`, "i"), "____");
    const prepOptions = sentenceShuffleV10([item.preposition, ...["an","auf","aus","bei","für","gegen","mit","nach","über","um","von","vor","zu"]
      .filter(prep => prep !== item.preposition)]).slice(0, 4);
    if (!prepOptions.includes(item.preposition)) prepOptions[0] = item.preposition;
    mount.innerHTML = `${header}
      <div class="sentence-question-copy"><span>Doğru edatı seç</span><strong>${escapeHtml(sentence)}</strong><small>${escapeHtml(item.exampleTr)}</small></div>
      <div class="practice-option-grid">${sentenceShuffleV10(prepOptions).map(option => `<button type="button" data-sentence-option="${escapeHtml(option)}">${escapeHtml(option)}</button>`).join("")}</div>
      <p class="practice-feedback" id="sentenceFeedback" aria-live="polite"></p>`;
  } else {
    mount.innerHTML = `${header}
      <div class="sentence-question-copy"><span>Bu kalıp hangi hâli ister?</span><strong>${escapeHtml(item.expression)}</strong><small>${escapeHtml(item.tr)}</small></div>
      <div class="practice-option-grid">
        <button type="button" data-sentence-option="Akkusativ">Akkusativ</button>
        <button type="button" data-sentence-option="Dativ">Dativ</button>
      </div>
      <p class="practice-feedback" id="sentenceFeedback" aria-live="polite"></p>`;
  }

  mount.querySelectorAll("[data-sentence-option]").forEach(button => button.addEventListener("click", () => {
    const correctValue = sentenceModeV10 === "blank" ? item.preposition : item.case;
    const correct = normalizeAnswer(button.dataset.sentenceOption) === normalizeAnswer(correctValue);
    mount.querySelectorAll("[data-sentence-option]").forEach(option => {
      option.disabled = true;
      if (normalizeAnswer(option.dataset.sentenceOption) === normalizeAnswer(correctValue)) option.classList.add("is-correct");
      else if (option === button) option.classList.add("is-wrong");
    });
    resolveSentenceV10(correct, sentenceModeV10 === "blank" ? `Doğru edat: ${item.preposition}` : `Doğru hâl: ${item.case}`);
  }));
}

function drawSentenceTokensV10() {
  const build = document.getElementById("sentenceBuildArea");
  const bank = document.getElementById("sentenceTokenBank");
  if (!build || !bank) return;
  build.innerHTML = sentenceBuiltTokensV10.length ? sentenceBuiltTokensV10.map(item => `<button type="button" data-built-token="${escapeHtml(item.id)}">${escapeHtml(item.token)}</button>`).join("") : "<span>Kelimelere sırayla dokun.</span>";
  bank.innerHTML = sentenceAvailableTokensV10.map(item => `<button type="button" data-bank-token="${escapeHtml(item.id)}">${escapeHtml(item.token)}</button>`).join("");
  bank.querySelectorAll("[data-bank-token]").forEach(button => button.addEventListener("click", () => {
    const index = sentenceAvailableTokensV10.findIndex(item => item.id === button.dataset.bankToken);
    if (index >= 0) sentenceBuiltTokensV10.push(...sentenceAvailableTokensV10.splice(index, 1));
    drawSentenceTokensV10();
  }));
  build.querySelectorAll("[data-built-token]").forEach(button => button.addEventListener("click", () => {
    const index = sentenceBuiltTokensV10.findIndex(item => item.id === button.dataset.builtToken);
    if (index >= 0) sentenceAvailableTokensV10.push(...sentenceBuiltTokensV10.splice(index, 1));
    drawSentenceTokensV10();
  }));
}

function checkSentenceOrderV10() {
  if (!sentenceSessionV10 || sentenceSessionV10.locked) return;
  const item = getCurrentSentenceV10();
  const guess = sentenceBuiltTokensV10.map(x => x.token).join(" ");
  const answer = tokenizeSentenceV10(item.exampleDe || item.expression).join(" ");
  if (!guess) return;
  resolveSentenceV10(normalizeGerman(guess) === normalizeGerman(answer), `Doğru cümle: ${item.exampleDe || item.expression}`);
}

function resolveSentenceV10(correct, answerText) {
  if (!sentenceSessionV10 || sentenceSessionV10.locked) return;
  sentenceSessionV10.locked = true;
  if (correct) sentenceSessionV10.correct += 1;
  else sentenceSessionV10.wrong.push(getCurrentSentenceV10());
  const feedback = document.getElementById("sentenceFeedback");
  if (feedback) {
    feedback.className = `practice-feedback ${correct ? "success" : "error"}`;
    feedback.textContent = correct ? "Doğru!" : answerText;
  }
  setTimeout(() => {
    sentenceSessionV10.index += 1;
    sentenceSessionV10.locked = false;
    if (sentenceSessionV10.index >= sentenceSessionV10.pool.length) finishSentenceSessionV10();
    else renderSentenceQuestionV10();
  }, 950);
}

function finishSentenceSessionV10() {
  const mount = document.getElementById("sentenceMount");
  const total = sentenceSessionV10.pool.length;
  const score = sentenceSessionV10.correct;
  saveSentenceStatsV10(score);
  if (typeof recordActivityV8 === "function") recordActivityV8("sentence", 1);
  mount.innerHTML = `<div class="practice-result"><span>Cümle oturumu tamamlandı</span><strong>${score}/${total}</strong><p>${score >= 8 ? "Cümle yapılarını çok iyi kullanıyorsun." : score >= 5 ? "İyi gidiyor. Yanlış kalıpları yeniden deneyebilirsin." : "Kalıp Kütüphanesi’ndeki örnekleri incelemek faydalı olur."}</p><div>${sentenceSessionV10.wrong.length ? '<button type="button" id="reviewSentenceWrongBtn">Yanlışları tekrar et</button>' : ""}<button type="button" id="restartSentenceBtn">Yeni oturum</button></div></div>`;
  document.getElementById("reviewSentenceWrongBtn")?.addEventListener("click", () => startSentenceSessionV10(sentenceShuffleV10(sentenceSessionV10.wrong)));
  document.getElementById("restartSentenceBtn")?.addEventListener("click", startSentenceSessionV10);
  if (typeof renderProgressDashboardV8 === "function") renderProgressDashboardV8();
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-sentence-level]").forEach(button => button.addEventListener("click", () => {
    sentenceLevelV10 = button.dataset.sentenceLevel;
    document.querySelectorAll("[data-sentence-level]").forEach(item => item.classList.toggle("is-active", item === button));
    sentenceSessionV10 = null;
    renderSentenceIdleV10();
  }));
  document.querySelectorAll("[data-sentence-mode]").forEach(button => button.addEventListener("click", () => {
    sentenceModeV10 = button.dataset.sentenceMode;
    document.querySelectorAll("[data-sentence-mode]").forEach(item => item.classList.toggle("is-active", item === button));
    sentenceSessionV10 = null;
    renderSentenceIdleV10();
  }));
  renderSentenceIdleV10();
});
