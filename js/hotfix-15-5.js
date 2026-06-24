/* Almanca Aşkına — Hotfix 15.5
   15.7 notu: Önceki sürüm okuma kelimelerini düz metne çeviriyordu.
   Bu davranış kapatıldı; hover/touch Türkçe anlam kartları korunuyor. */
(function(){
  function removeUpdateBanner(){
    const banner = document.getElementById("appUpdateBanner");
    if (banner) {
      banner.classList.add("hidden");
      banner.style.display = "none";
      banner.setAttribute("aria-hidden", "true");
    }
  }

  function repairReaderSpacing(){
    const reader = document.getElementById("readerText");
    if (!reader) return;

    // Tooltipli kelime yapısını asla kaldırma. Sadece saat biçimi gibi güvenli metin düzeltmeleri yap.
    reader.querySelectorAll(".reader-word").forEach(word => {
      if (!word.querySelector(".reader-tooltip")) return;
      word.setAttribute("tabindex", word.getAttribute("tabindex") || "0");
    });
  }

  function fixAdvancedTools(){
    document.querySelectorAll(".lim-advanced-tools summary").forEach(summary => {
      const strong = summary.querySelector("strong");
      const span = summary.querySelector("span");
      if (strong && span && !summary.querySelector(".advanced-copy-wrap")) {
        const wrap = document.createElement("div");
        wrap.className = "advanced-copy-wrap";
        summary.insertBefore(wrap, strong);
        wrap.appendChild(strong);
        wrap.appendChild(span);
      }
    });
  }

  function run(){
    removeUpdateBanner();
    repairReaderSpacing();
    fixAdvancedTools();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
  window.addEventListener("load", run);
})();
