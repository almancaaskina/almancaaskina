/* Almanca Aşkına v10 — Güven, kaynak ve iletişim */

const CONTACT_EMAIL_V10 = "akkayanbusiness@gmail.com";

function openFeedbackV10(context = "", type = "Kelime veya çeviri hatası") {
  const section = document.getElementById("about");
  const typeSelect = document.getElementById("feedbackType");
  const contextInput = document.getElementById("feedbackContext");
  if (typeSelect) typeSelect.value = type;
  if (contextInput) contextInput.value = context;
  section?.classList.add("is-open");
  section?.scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => contextInput?.focus(), 450);
}

function buildFeedbackMailtoV10() {
  const type = document.getElementById("feedbackType")?.value || "Geri bildirim";
  const context = document.getElementById("feedbackContext")?.value.trim() || "Belirtilmedi";
  const message = document.getElementById("feedbackMessage")?.value.trim() || "Açıklama eklenmedi";
  const subject = `[Almanca Aşkına] ${type}: ${context}`;
  const body = [
    "Merhaba,",
    "",
    `Geri bildirim türü: ${type}`,
    `İlgili kelime / bölüm: ${context}`,
    "",
    "Açıklama:",
    message,
    "",
    `Sayfa: ${location.href}`,
    "Sürüm: 10.0",
    `Tarayıcı: ${navigator.userAgent}`
  ].join("\n");
  return `mailto:${CONTACT_EMAIL_V10}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function addDictionaryTrustRowV10(item) {
  const preview = document.getElementById("resultPreview");
  if (!preview || preview.querySelector(".result-trust-row")) return;
  preview.insertAdjacentHTML("beforeend", `
    <div class="result-trust-row">
      <span>Kaynak kapsamı: ${escapeHtml(item.level || "A1/A2")} · Editör düzenlemesi</span>
      <button type="button" id="reportDictionaryItemV10">Bu kayıtta hata bildir</button>
    </div>
  `);
  document.getElementById("reportDictionaryItemV10")?.addEventListener("click", () => {
    openFeedbackV10(`${getGermanDisplay(item)} — ${item.tr || ""}`, "Kelime veya çeviri hatası");
  });
}

const baseRenderFoundResultTrustV10 = renderFoundResult;
renderFoundResult = function(item) {
  baseRenderFoundResultTrustV10(item);
  addDictionaryTrustRowV10(item);
};

const baseOpenStoryTrustV10 = openStory;
openStory = function(storyId) {
  baseOpenStoryTrustV10(storyId);
  const story = getStoriesData().find(item => item.id === storyId);
  const meta = document.getElementById("readerMeta");
  if (story && meta && !document.getElementById("reportStoryV10")) {
    meta.insertAdjacentHTML("beforeend", '<button type="button" class="report-inline-btn" id="reportStoryV10">Hata bildir</button>');
    document.getElementById("reportStoryV10")?.addEventListener("click", () => {
      openFeedbackV10(`${story.level} hikâyesi: ${story.title}`, "Hikâye veya gramer hatası");
    });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("feedbackFab")?.addEventListener("click", () => openFeedbackV10("", "Teknik sorun"));

  document.getElementById("copyContactEmailBtn")?.addEventListener("click", async event => {
    const button = event.currentTarget;
    try {
      await navigator.clipboard.writeText(CONTACT_EMAIL_V10);
      button.textContent = "Kopyalandı";
    } catch (error) {
      button.textContent = CONTACT_EMAIL_V10;
    }
    setTimeout(() => { button.textContent = "E-posta adresini kopyala"; }, 1800);
  });

  document.getElementById("feedbackForm")?.addEventListener("submit", event => {
    event.preventDefault();
    window.location.href = buildFeedbackMailtoV10();
  });
});
