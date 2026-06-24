/* Almanca Aşkına — Hotfix 15.5 */
(function(){
  function removeUpdateBanner(){
    const banner = document.getElementById("appUpdateBanner");
    if (banner) {
      banner.classList.add("hidden");
      banner.style.display = "none";
      banner.setAttribute("aria-hidden", "true");
    }
  }

  function unwrapReaderWords(){
    const reader = document.getElementById("readerText");
    if (!reader) return;

    // Eğer eski tooltipli markup ekranda duruyorsa, metni anında sadeleştir.
    if (reader.querySelector(".reader-word")) {
      reader.querySelectorAll(".reader-word").forEach(node => {
        const textNode = document.createTextNode(node.childNodes[0]?.textContent || node.textContent || "");
        node.replaceWith(textNode);
      });
      reader.innerHTML = reader.innerHTML
        .replace(/(\d):\s+(\d{2})/g, "$1:$2")
        .replace(/\s+([.,!?;:])/g, "$1")
        .replace(/([.,!?;:])([^\s<])/g, "$1 $2");
    }
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
    unwrapReaderWords();
    fixAdvancedTools();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
  window.addEventListener("load", run);

  const observer = new MutationObserver(run);
  if (document.body) observer.observe(document.body, { childList: true, subtree: true });
})();
