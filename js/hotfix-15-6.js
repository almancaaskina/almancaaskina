/* Almanca Aşkına — Hotfix 15.6 / 15.7
   Okuma bilgi kartlarını geri getirir, metin akışını korur. */
(function(){
  const WORD_RE = /([A-Za-zÄÖÜäöüß]+(?:-[A-Za-zÄÖÜäöüß]+)?)/g;

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
    if (!lines.length) return { lines: [match, "Sözlükte henüz bulunmuyor"], missing: true };
    return { lines, missing: !!info?.missing };
  }

  function createMarkupV156(surface, lines, missing){
    const safeLines = (lines || []).filter(Boolean).map((line, index) => {
      const tag = index === 0 ? "strong" : "span";
      return `<${tag}>${escapeHtmlV156(line)}</${tag}>`;
    }).join("");

    return `<span class="reader-word${missing ? " is-missing" : ""}" tabindex="0" data-reader-word="${escapeHtmlV156(surface)}">${escapeHtmlV156(surface)}<span class="reader-tooltip" role="tooltip">${safeLines}</span></span>`;
  }

  function annotateTextV156(text){
    return escapeHtmlV156(String(text || ""))
      .replace(WORD_RE, function(match){
        const info = linesForWordV156(match);
        return createMarkupV156(match, info.lines, info.missing);
      })
      .replace(/(\d):\s+(\d{2})/g, "$1:$2")
      .replace(/\n/g, "<br>");
  }

  window.createReaderWordMarkup = function(surface, lines, missing){
    return createMarkupV156(surface, lines, missing);
  };

  window.annotateStoryText = function(text){
    return annotateTextV156(text);
  };

  function getStoryByIdV156(storyId){
    try {
      const stories = typeof getStoriesData === "function" ? getStoriesData() : [];
      return stories.find(item => item.id === storyId) || null;
    } catch (_) {
      return null;
    }
  }

  function getOpenStoryV156(){
    const readerCard = document.getElementById("readerCard");
    const titleEl = document.getElementById("readerTitle");
    if (!readerCard || !titleEl || readerCard.classList.contains("hidden")) return null;

    const activeId = readerCard.dataset.activeStoryId || window.__aaActiveStoryIdV156;
    if (activeId) {
      const byId = getStoryByIdV156(activeId);
      if (byId) return byId;
    }

    const title = titleEl.textContent?.trim();
    if (!title) return null;

    try {
      const stories = typeof getStoriesData === "function" ? getStoriesData() : [];
      return stories.find(item => item.title === title) || null;
    } catch (_) {
      return null;
    }
  }

  function renderStoryWithTooltipsV156(story){
    const readerText = document.getElementById("readerText");
    const readerCard = document.getElementById("readerCard");
    if (!readerText || !story) return;

    if (readerCard) {
      readerCard.dataset.activeStoryId = story.id || "";
      window.__aaActiveStoryIdV156 = story.id || "";
    }

    if (story.text) {
      readerText.innerHTML = annotateTextV156(story.text);
      return;
    }

    readerText.innerHTML = (story.tokens || []).map(token => {
      if (typeof token === "string") return escapeHtmlV156(token);
      return createMarkupV156(token.de, [token.de, token.tr], false);
    }).join("");
  }

  function rerenderOpenStoryIfPossible(){
    const story = getOpenStoryV156();
    const readerText = document.getElementById("readerText");
    if (!story || !readerText) return;

    // Eğer kelimeler düz metne çevrilmişse veya tooltip sayısı yoksa güvenli biçimde tekrar kur.
    if (!readerText.querySelector(".reader-word") || !readerText.querySelector(".reader-tooltip")) {
      renderStoryWithTooltipsV156(story);
    }
  }

  function bindReaderInteractionV156(){
    if (window.__aaReaderInteractionV156) return;
    window.__aaReaderInteractionV156 = true;

    document.addEventListener("click", function(event){
      const clickedWord = event.target.closest(".reader-word");
      document.querySelectorAll(".reader-word.is-visible").forEach(word => {
        if (word !== clickedWord) word.classList.remove("is-visible");
      });
      if (clickedWord) clickedWord.classList.toggle("is-visible");
    });

    document.addEventListener("keydown", function(event){
      const word = event.target.closest?.(".reader-word");
      if (!word) return;
      if (event.key !== "Enter" && event.key !== " ") return;
      event.preventDefault();
      word.classList.toggle("is-visible");
    });
  }

  function wrapOpenStoryV156(){
    if (window.__aaOpenStoryWrappedV156 || typeof openStory !== "function") return;
    window.__aaOpenStoryWrappedV156 = true;
    const previousOpenStory = openStory;

    openStory = function(storyId){
      previousOpenStory.apply(this, arguments);
      const story = getStoryByIdV156(storyId);
      if (story) {
        renderStoryWithTooltipsV156(story);
        setTimeout(() => renderStoryWithTooltipsV156(story), 30);
      }
    };
  }

  function observeReaderV156(){
    if (window.__aaReaderObserverV156) return;
    const readerText = document.getElementById("readerText");
    if (!readerText) return;
    window.__aaReaderObserverV156 = true;

    const observer = new MutationObserver(() => {
      window.clearTimeout(window.__aaReaderRepairTimerV156);
      window.__aaReaderRepairTimerV156 = window.setTimeout(rerenderOpenStoryIfPossible, 80);
    });
    observer.observe(readerText, { childList: true, subtree: true });
  }

  function run(){
    bindReaderInteractionV156();
    wrapOpenStoryV156();
    observeReaderV156();
    rerenderOpenStoryIfPossible();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
  window.addEventListener("load", run);
})();
