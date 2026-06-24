/* Almanca Aşkına — Hotfix 15.4 */
(function(){
  function removeUpdateBanner(){
    const banner = document.getElementById("appUpdateBanner");
    if (banner) {
      banner.classList.add("hidden");
      banner.style.display = "none";
      banner.setAttribute("aria-hidden", "true");
    }
    const applyBtn = document.getElementById("applyAppUpdateBtn");
    if (applyBtn) {
      applyBtn.onclick = null;
      applyBtn.addEventListener("click", function(event){
        event.preventDefault();
        removeUpdateBanner();
      });
    }
  }

  function fixNavContrast(){
    const active = document.querySelector(".primary-nav .nav-link.is-active");
    if (active) active.setAttribute("aria-current", "page");
  }

  function fixAdvancedSummary(){
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

  function cleanReaderText(){
    const reader = document.getElementById("readerText");
    if (!reader) return;
    // Saat gibi değerlerde yanlışlıkla oluşturulmuş boşlukları temizle: 7: 00 -> 7:00
    reader.innerHTML = reader.innerHTML.replace(/(\d):\s+(\d{2})/g, "$1:$2");
  }

  function run(){
    removeUpdateBanner();
    fixNavContrast();
    fixAdvancedSummary();
    cleanReaderText();
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
