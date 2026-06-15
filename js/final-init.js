/* Almanca Aşkına v10 — Son entegrasyon */

const V10_STORAGE_KEYS = [
  LISTENING_STATS_KEY_V10,
  SENTENCE_STATS_KEY_V10
];

if (Array.isArray(LOCAL_DATA_KEYS_V7)) {
  V10_STORAGE_KEYS.forEach(key => {
    if (!LOCAL_DATA_KEYS_V7.includes(key)) LOCAL_DATA_KEYS_V7.push(key);
  });
}

const baseStudyPointsFinalV10 = getStudyPointsV8;
getStudyPointsV8 = function(day) {
  return baseStudyPointsFinalV10(day)
    + (Number(day.listening) || 0) * 3
    + (Number(day.sentence) || 0) * 3;
};

const baseProgressFinalV10 = renderProgressDashboardV8;
renderProgressDashboardV8 = function() {
  baseProgressFinalV10();
  const grid = document.querySelector("#progressDashboard .progress-stat-grid");
  if (!grid || grid.querySelector("[data-v10-stat]")) return;

  const listening = getListeningStatsV10();
  const sentence = getSentenceStatsV10();
  grid.insertAdjacentHTML("beforeend", `
    <article data-v10-stat="listening"><strong>${listening.best}/10</strong><span>En iyi dinleme</span></article>
    <article data-v10-stat="sentence"><strong>${sentence.best}/10</strong><span>En iyi cümle kurma</span></article>
    <article data-v10-stat="phrases"><strong>${getPhrasesDataV10().length}</strong><span>Kalıp ve ifade</span></article>
  `);
};

function addV10DailyShortcuts() {
  const grid = document.getElementById("dailyTaskGrid");
  if (!grid || grid.querySelector("[data-v10-daily]")) return;
  grid.insertAdjacentHTML("beforeend", `
    <button type="button" class="daily-task-card" data-v10-daily="listening">
      <span>♪</span><div><strong>Dinleme pratiği yap</strong><small>10 soruluk laboratuvar</small></div>
    </button>
    <button type="button" class="daily-task-card" data-v10-daily="sentence">
      <span>≡</span><div><strong>Cümle kurma çalış</strong><small>Sırala, tamamla, hâli seç</small></div>
    </button>
  `);
  grid.querySelector('[data-v10-daily="listening"]')?.addEventListener("click", () => document.getElementById("listening")?.scrollIntoView({ behavior: "smooth", block: "start" }));
  grid.querySelector('[data-v10-daily="sentence"]')?.addEventListener("click", () => document.getElementById("sentence")?.scrollIntoView({ behavior: "smooth", block: "start" }));
}

const baseDailyFinalV10 = renderDailyStudyV7;
renderDailyStudyV7 = function() {
  baseDailyFinalV10();
  addV10DailyShortcuts();
};

document.addEventListener("DOMContentLoaded", () => {
  renderProgressDashboardV8();
  renderDailyStudyV7();

  document.querySelectorAll(".category-card").forEach(card => {
    card.addEventListener("click", () => {
      history.replaceState(null, "", `#${card.dataset.sectionTarget}`);
    });
  });

  const initial = location.hash.slice(1);
  if (initial) {
    setTimeout(() => {
      const card = document.querySelector(`[data-section-target="${CSS.escape(initial)}"]`);
      card?.click();
    }, 200);
  }
});
