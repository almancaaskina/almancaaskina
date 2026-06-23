/* Almanca Aşkına v10 — Dinleme Laboratuvarı */

const LISTENING_STATS_KEY_V10 = "almancaAskinaListeningStatsV1";
let listeningLevelV10 = "A1";
let listeningModeV10 = "word";
let listeningRateV10 = 0.92;
let listeningSessionV10 = null;

function getListeningStatsV10() {
  const value = safeReadStorage(LISTENING_STATS_KEY_V10, {});
  return {
    attempts: Number(value.attempts) || 0,
    best: Number(value.best) || 0,
    completed: Number(value.completed) || 0
  };
}

function saveListeningStatsV10(score) {
  const old = getListeningStatsV10();
  safeWriteStorage(LISTENING_STATS_KEY_V10, {
    attempts: old.attempts + 1,
    best: Math.max(old.best, score),
    completed: old.completed + 1,
    updatedAt: Date.now()
  });
}

function getListeningPoolV10(mode = listeningModeV10) {
  if (mode === "sentence") {
    return getPhrasesDataV10().filter(item =>
      item.exampleDe && item.exampleTr &&
      (listeningLevelV10 === "ALL" || item.level === listeningLevelV10)
    );
  }

  return dictionaryData.filter(item => {
    const word = String(item.word || "").trim();
    return word.length >= 2 && word.length <= 28 && !/[\/()]/.test(word) && !word.includes(" ") && item.tr &&
      (listeningLevelV10 === "ALL" || item.level === listeningLevelV10 || item.level === "A1/A2");
  });
}

function shuffleListeningV10(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const target = Math.floor(Math.random() * (index + 1));
    [result[index], result[target]] = [result[target], result[index]];
  }
  return result;
}

function renderListeningIdleV10() {
  const mount = document.getElementById("listeningMount");
  if (!mount) return;
  const stats = getListeningStatsV10();
  mount.innerHTML = `
    <div class="practice-idle">
      <span>${listeningModeV10 === "word" ? "Kelime Dikte" : "Cümle Anlama"}</span>
      <h3>${listeningModeV10 === "word" ? "Almanca kelimeyi dinle ve doğru yaz." : "Cümleyi dinle ve Türkçe anlamını seç."}</h3>
      <p>Her oturum 10 sorudan oluşur. Sesi istediğin kadar yeniden dinleyebilirsin.</p>
      <div class="practice-stat-row">
        <span>En iyi <strong>${stats.best}/10</strong></span>
        <span>Oturum <strong>${stats.completed}</strong></span>
      </div>
      <button type="button" class="practice-primary-btn" id="startListeningBtn">10 soruluk oturumu başlat</button>
    </div>
  `;
  document.getElementById("startListeningBtn")?.addEventListener("click", startListeningSessionV10);
}

function startListeningSessionV10(review = null) {
  const pool = review?.length ? review : shuffleListeningV10(getListeningPoolV10()).slice(0, 10);
  if (pool.length < 4) {
    alert("Bu seviye ve mod için yeterli kayıt bulunamadı.");
    return;
  }
  listeningSessionV10 = { pool, index: 0, correct: 0, wrong: [], locked: false };
  renderListeningQuestionV10();
}

function getCurrentListeningV10() {
  return listeningSessionV10?.pool[listeningSessionV10.index] || null;
}

function playCurrentListeningV10() {
  const item = getCurrentListeningV10();
  if (!item) return;
  const text = listeningModeV10 === "sentence" ? item.exampleDe : item.word;
  speakTextV10(text, listeningRateV10);
}

function renderListeningQuestionV10() {
  const mount = document.getElementById("listeningMount");
  const item = getCurrentListeningV10();
  if (!mount || !item || !listeningSessionV10) return;

  const number = listeningSessionV10.index + 1;
  let answerArea = "";

  if (listeningModeV10 === "word") {
    answerArea = `
      <div class="listening-input-row">
        <input type="text" id="listeningAnswerInput" autocomplete="off" placeholder="Duyduğun Almanca kelimeyi yaz...">
        <button type="button" id="checkListeningAnswerBtn">Kontrol et</button>
      </div>
      <button type="button" class="practice-text-btn" id="listeningHintBtn">İlk harfi göster</button>
    `;
  } else {
    const correct = item.exampleTr;
    const distractors = shuffleListeningV10(getListeningPoolV10("sentence"))
      .map(entry => entry.exampleTr)
      .filter(value => normalizeAnswer(value) !== normalizeAnswer(correct))
      .filter((value, index, array) => array.findIndex(other => normalizeAnswer(other) === normalizeAnswer(value)) === index)
      .slice(0, 3);
    const options = shuffleListeningV10([correct, ...distractors]);
    answerArea = `<div class="practice-option-grid">${options.map(option => `
      <button type="button" data-listening-option="${escapeHtml(option)}">${escapeHtml(option)}</button>
    `).join("")}</div>`;
  }

  mount.innerHTML = `
    <div class="practice-progress-row">
      <span>Soru ${number}/${listeningSessionV10.pool.length}</span>
      <strong>${listeningSessionV10.correct} doğru</strong>
    </div>
    <div class="listening-question-card">
      <span>${listeningModeV10 === "word" ? "Kelimeyi dinle" : "Cümleyi dinle"}</span>
      <button type="button" class="listen-main-btn" id="playListeningBtn" aria-label="Sesi oynat">🔊</button>
      <strong id="listeningPrompt">${listeningModeV10 === "word" ? `${item.level || "A1/A2"} · ${getPosLabel(item.pos)}` : `${item.level} · Günlük kullanım`}</strong>
      <small>Sesi tekrar dinlemek için hoparlöre bas.</small>
    </div>
    ${answerArea}
    <p class="practice-feedback" id="listeningFeedback" aria-live="polite"></p>
  `;

  document.getElementById("playListeningBtn")?.addEventListener("click", playCurrentListeningV10);
  setTimeout(playCurrentListeningV10, 180);

  if (listeningModeV10 === "word") {
    const input = document.getElementById("listeningAnswerInput");
    input?.focus({ preventScroll: true });
    input?.addEventListener("keydown", event => {
      if (event.key === "Enter") checkListeningWordV10();
    });
    document.getElementById("checkListeningAnswerBtn")?.addEventListener("click", checkListeningWordV10);
    document.getElementById("listeningHintBtn")?.addEventListener("click", () => {
      const prompt = document.getElementById("listeningPrompt");
      if (prompt) prompt.textContent = `İlk harf: ${String(item.word).charAt(0).toLocaleUpperCase("de-DE")}`;
    });
  } else {
    mount.querySelectorAll("[data-listening-option]").forEach(button => {
      button.addEventListener("click", () => checkListeningSentenceV10(button));
    });
  }
}

function checkListeningWordV10() {
  if (!listeningSessionV10 || listeningSessionV10.locked) return;
  const item = getCurrentListeningV10();
  const input = document.getElementById("listeningAnswerInput");
  const guess = String(input?.value || "").trim();
  if (!guess) return;
  const correct = normalizeGerman(guess) === normalizeGerman(item.word);
  resolveListeningAnswerV10(correct, `Doğru cevap: ${item.word} — ${item.tr}`);
}

function checkListeningSentenceV10(button) {
  if (!listeningSessionV10 || listeningSessionV10.locked) return;
  const item = getCurrentListeningV10();
  const correct = normalizeAnswer(button.dataset.listeningOption) === normalizeAnswer(item.exampleTr);
  document.querySelectorAll("[data-listening-option]").forEach(option => {
    option.disabled = true;
    if (normalizeAnswer(option.dataset.listeningOption) === normalizeAnswer(item.exampleTr)) option.classList.add("is-correct");
    else if (option === button) option.classList.add("is-wrong");
  });
  resolveListeningAnswerV10(correct, `Doğru anlam: ${item.exampleTr}`);
}

function resolveListeningAnswerV10(correct, answerText) {
  listeningSessionV10.locked = true;
  const item = getCurrentListeningV10();
  if (correct) listeningSessionV10.correct += 1;
  else listeningSessionV10.wrong.push(item);

  const feedback = document.getElementById("listeningFeedback");
  if (feedback) {
    feedback.className = `practice-feedback ${correct ? "success" : "error"}`;
    feedback.textContent = correct ? "Doğru!" : answerText;
  }

  setTimeout(() => {
    listeningSessionV10.index += 1;
    listeningSessionV10.locked = false;
    if (listeningSessionV10.index >= listeningSessionV10.pool.length) finishListeningSessionV10();
    else renderListeningQuestionV10();
  }, 900);
}

function finishListeningSessionV10() {
  const mount = document.getElementById("listeningMount");
  const total = listeningSessionV10.pool.length;
  const score = listeningSessionV10.correct;
  saveListeningStatsV10(score);
  if (typeof recordActivityV8 === "function") recordActivityV8("listening", 1);

  mount.innerHTML = `
    <div class="practice-result">
      <span>Dinleme oturumu tamamlandı</span>
      <strong>${score}/${total}</strong>
      <p>${score >= 8 ? "Çok iyi. Sesleri güvenle ayırt ediyorsun." : score >= 5 ? "İyi gidiyor. Yanlışları bir kez daha dinleyebilirsin." : "Yavaş hızla tekrar etmek faydalı olacaktır."}</p>
      <div>
        ${listeningSessionV10.wrong.length ? '<button type="button" id="reviewListeningWrongBtn">Yanlışları tekrar et</button>' : ""}
        <button type="button" id="restartListeningBtn">Yeni oturum</button>
      </div>
    </div>
  `;
  document.getElementById("reviewListeningWrongBtn")?.addEventListener("click", () => startListeningSessionV10(shuffleListeningV10(listeningSessionV10.wrong)));
  document.getElementById("restartListeningBtn")?.addEventListener("click", startListeningSessionV10);
  if (typeof renderProgressDashboardV8 === "function") renderProgressDashboardV8();
}

document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll("[data-listening-level]").forEach(button => button.addEventListener("click", () => {
    listeningLevelV10 = button.dataset.listeningLevel;
    document.querySelectorAll("[data-listening-level]").forEach(item => item.classList.toggle("is-active", item === button));
    listeningSessionV10 = null;
    renderListeningIdleV10();
  }));
  document.querySelectorAll("[data-listening-mode]").forEach(button => button.addEventListener("click", () => {
    listeningModeV10 = button.dataset.listeningMode;
    document.querySelectorAll("[data-listening-mode]").forEach(item => item.classList.toggle("is-active", item === button));
    listeningSessionV10 = null;
    renderListeningIdleV10();
  }));
  document.querySelectorAll("[data-listening-rate]").forEach(button => button.addEventListener("click", () => {
    listeningRateV10 = Number(button.dataset.listeningRate);
    document.querySelectorAll("[data-listening-rate]").forEach(item => item.classList.toggle("is-active", item === button));
  }));
  renderListeningIdleV10();
});
