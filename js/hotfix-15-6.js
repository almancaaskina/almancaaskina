/* Almanca Aşkına — Hotfix 15.6
   Okuma bilgi kartlarını geri getirir, metin akışını korur. */
(function(){
  function escapeHtmlV156(value){
    return String(value ?? "")
      .replaceAll("&","&amp;")
      .replaceAll("<","&lt;")
      .replaceAll(">","&gt;")
      .replaceAll('"',"&quot;")
      .replaceAll("'","&#039;");
  }

  function linesForWordV156(match){
    let info = null;
    try {
      if (typeof getStoryWordInfo === "function") info = getStoryWordInfo(match);
    } catch (_) {}

    const raw = String(info?.tooltip || "")
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/\r\n?/g, "\n");

    const lines = raw.split("\n").map(line => line.trim()).filter(Boolean);
    if (!lines.length) return { lines: [match], missing: true };
    return { lines, missing: !!info?.missing };
  }

  function createMarkupV156(surface, lines, missing){
    const safeLines = (lines || []).filter(Boolean).map((line, index) => {
      const tag = index === 0 ? "strong" : "span";
      return `<${tag}>${escapeHtmlV156(line)}</${tag}>`;
    }).join("");

    return `<span class="reader-word${missing ? " is-missing" : ""}" tabindex="0">${escapeHtmlV156(surface)}<span class="reader-tooltip" role="tooltip">${safeLines}</span></span>`;
  }

  window.createReaderWordMarkup = function(surface, lines, missing){
    return createMarkupV156(surface, lines, missing);
  };

  window.annotateStoryText = function(text){
    return escapeHtmlV156(String(text || ""))
      .replace(/([A-Za-zÄÖÜäöüß]+(?:-[A-Za-zÄÖÜäöüß]+)?)/g, function(match){
        const info = linesForWordV156(match);
        return createMarkupV156(match, info.lines, info.missing);
      })
      .replace(/(\d):\s+(\d{2})/g, "$1:$2")
      .replace(/\n/g, "<br>");
  };

  // Eski açık sayfada metin düzleştirilmişse, kullanıcı hikâyeye yeniden basmadan da geri yüklemeye çalış.
  function rerenderOpenStoryIfPossible(){
    const readerCard = document.getElementById("readerCard");
    const readerText = document.getElementById("readerText");
    const titleEl = document.getElementById("readerTitle");
    if (!readerCard || !readerText || !titleEl) return;
    if (readerCard.classList.contains("hidden")) return;

    const title = titleEl.textContent?.trim();
    if (!title) return;

    try {
      const stories = typeof getStoriesData === "function" ? getStoriesData() : [];
      const story = stories.find(item => item.title === title);
      if (story?.text) readerText.innerHTML = window.annotateStoryText(story.text);
    } catch (_) {}
  }

  function bindReaderClickV156(){
    if (window.__aaReaderClickV156) return;
    window.__aaReaderClickV156 = true;
    document.addEventListener("click", function(event){
      const clickedWord = event.target.closest(".reader-word");
      document.querySelectorAll(".reader-word.is-visible").forEach(word => {
        if (word !== clickedWord) word.classList.remove("is-visible");
      });
      if (clickedWord) clickedWord.classList.toggle("is-visible");
    });
  }

  function run(){
    bindReaderClickV156();
    rerenderOpenStoryIfPossible();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
  window.addEventListener("load", run);
})();
