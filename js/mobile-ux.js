/* Almanca Aşkına — v14.1 Mobile UX helpers */
(function(){
  const mq = window.matchMedia("(max-width: 760px)");
  const root = document.body;

  if ("scrollRestoration" in history) {
    history.scrollRestoration = "manual";
  }

  function isMobile(){ return mq.matches; }

  function updateMobileClass(){
    root.classList.toggle("aa-mobile-ux", isMobile());
  }

  function setActiveNav(id){
    document.querySelectorAll("#primaryNav [data-section-target]").forEach(btn => {
      btn.classList.toggle("is-active", btn.dataset.sectionTarget === id);
    });
  }

  function cleanInitialScroll(){
    if (location.hash && location.hash !== "#home") return;
    window.scrollTo(0, 0);
    setTimeout(() => window.scrollTo(0, 0), 90);
    setTimeout(() => window.scrollTo(0, 0), 260);
  }

  function smoothScrollTo(id){
    const el = document.getElementById(id);
    if (!el) return;
    const header = document.getElementById("siteHeader");
    const topGap = isMobile() ? 76 : ((header && header.offsetHeight) || 78) + 10;
    const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - topGap);
    window.scrollTo({ top, behavior: "smooth" });
    setActiveNav(id);
  }

  function bindNav(){
    document.querySelectorAll("[data-section-target]").forEach(btn => {
      if (btn.dataset.mobileUxBound === "1") return;
      btn.dataset.mobileUxBound = "1";
      btn.addEventListener("click", ev => {
        const target = btn.dataset.sectionTarget;
        if (!target) return;
        ev.preventDefault();
        smoothScrollTo(target);
      }, { capture: true });
    });
  }

  function preventBackgroundFocusScroll(){
    // Oyun veya test inputları ilk yüklemede sayfayı aşağı çekmesin.
    const originalFocus = HTMLElement.prototype.focus;
    if (window.__aaSafeFocusPatched) return;
    window.__aaSafeFocusPatched = true;
    HTMLElement.prototype.focus = function(options){
      const tag = (this.tagName || "").toLowerCase();
      const interactive = tag === "input" || tag === "textarea" || this.isContentEditable;
      const userInitiated = document.body.classList.contains("aa-user-interacted");
      if (interactive && !userInitiated) {
        try { return originalFocus.call(this, { preventScroll: true }); }
        catch(e) { return originalFocus.call(this); }
      }
      return originalFocus.call(this, options);
    };
    ["pointerdown","keydown","touchstart"].forEach(type => {
      window.addEventListener(type, () => document.body.classList.add("aa-user-interacted"), { once:true, passive:true });
    });
  }

  function collapseLongAreasOnMobile(){
    // İlk bakışta kalabalık hissini azaltmak için yalnızca mobilde sözlük hızlı araçlarını ikincil hale getir.
    const tools = document.querySelector(".dictionary-quick-tools");
    if (!tools || tools.dataset.mobileLabelReady === "1") return;
    tools.dataset.mobileLabelReady = "1";
    tools.setAttribute("aria-label", "Sözlük hızlı araçları, yatay kaydırılabilir");
  }

  function observeSections(){
    const navIds = ["home","dictionary","reading","game"];
    const els = navIds.map(id => document.getElementById(id)).filter(Boolean);
    if (!("IntersectionObserver" in window) || !els.length) return;
    const io = new IntersectionObserver(entries => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible && visible.target && visible.target.id) setActiveNav(visible.target.id);
    }, { rootMargin: "-20% 0px -62% 0px", threshold: [0.15, 0.35, 0.55] });
    els.forEach(el => io.observe(el));
  }

  document.addEventListener("DOMContentLoaded", () => {
    updateMobileClass();
    preventBackgroundFocusScroll();
    bindNav();
    collapseLongAreasOnMobile();
    observeSections();
    cleanInitialScroll();

    const mo = new MutationObserver(() => {
      bindNav();
      collapseLongAreasOnMobile();
    });
    mo.observe(document.body, { childList:true, subtree:true });
  });

  mq.addEventListener ? mq.addEventListener("change", updateMobileClass) : mq.addListener(updateMobileClass);
  window.addEventListener("load", cleanInitialScroll, { once:true });
})();
