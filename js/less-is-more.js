/* Almanca Aşkına v14 — Less is More deneyimi */
(function(){
  const VERSION = "14.0";
  const BODY_READY = "lim14";
  const LEVEL_KEY = "aa_lesson_level_v14";

  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  window.addEventListener("load", () => {
    if (!location.hash || location.hash === "#home") {
      setTimeout(() => window.scrollTo({ top: 0, left: 0, behavior: "instant" }), 0);
      setTimeout(() => window.scrollTo(0, 0), 160);
    }
  });

  function qs(sel, root=document){ return root.querySelector(sel); }
  function qsa(sel, root=document){ return Array.from(root.querySelectorAll(sel)); }
  function scrollToSection(id){
    const target = document.getElementById(id);
    if (!target) return;
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function updateHeader(){
    const nav = qs("#primaryNav");
    if (nav) {
      nav.innerHTML = `
        <button class="category-card nav-link is-active" data-section-target="home" type="button">Bugün</button>
        <button class="category-card nav-link" data-section-target="dictionary" type="button">Sözlük</button>
        <button class="category-card nav-link" data-section-target="reading" type="button">Hikâyeler</button>
        <button class="category-card nav-link" data-section-target="game" type="button">Pratik</button>`;
      nav.querySelectorAll("[data-section-target]").forEach(btn => {
        btn.addEventListener("click", () => scrollToSection(btn.dataset.sectionTarget));
      });
    }
    const brandSmall = qs(".brand-lockup small");
    if (brandSmall) brandSmall.textContent = "Her gün küçük bir adım.";
  }

  function updateHero(){
    const copy = qs(".hero-copy");
    if (!copy || copy.dataset.lim14 === "ready") return;
    copy.dataset.lim14 = "ready";
    copy.innerHTML = `
      <span class="hero-eyebrow"><i></i> Az ama düzenli Almanca</span>
      <h1>Bugün sadece <em>5 dakika</em> Almanca çalış.</h1>
      <p>Önce bir kelime öğren. Sonra kısa bir hikâye oku. En sonda küçük bir pratik çöz. Hepsi bu.</p>
      <div class="hero-actions">
        <button class="category-card hero-primary" data-section-target="simpleStartV14" type="button">Bugünkü yolu göster <span>→</span></button>
        <button class="category-card hero-secondary" data-section-target="dictionary" type="button">Kelime ara</button>
      </div>`;
    copy.querySelectorAll("[data-section-target]").forEach(btn => btn.addEventListener("click", () => scrollToSection(btn.dataset.sectionTarget)));
    const card = qs(".hero-book-card small");
    if (card) card.textContent = "Kelime · Hikâye · Pratik";
  }

  function levelLabel(level){
    return level === "start" ? "Yeni başlıyorum" : level === "a2" ? "A2 çalışıyorum" : "A1 çalışıyorum";
  }

  function createSimpleStart(){
    if (qs("#simpleStartV14")) return;
    const hero = qs("#home");
    if (!hero) return;
    hero.insertAdjacentHTML("afterend", `
      <section class="lim-start-panel container" id="simpleStartV14" aria-labelledby="simpleStartTitleV14">
        <div class="lim-start-top">
          <div>
            <span>Net başlangıç</span>
            <h2 id="simpleStartTitleV14">Üç yol. Bir günlük ritim.</h2>
          </div>
          <p>Site dolu olabilir; ama başlaman için yalnızca bu üç adımı bilmen yeterli.</p>
        </div>
        <div class="lim-path-grid">
          <button class="lim-path-card primary" data-step="01" data-section-target="dictionary" type="button">
            <i>Aa</i><strong>Kelime öğren</strong><span>Anlamı, artikeli, örnek cümleyi ve telaffuzu tek yerde gör.</span>
          </button>
          <button class="lim-path-card" data-step="02" data-section-target="reading" type="button">
            <i>▤</i><strong>Hikâye oku</strong><span>Kelimeleri tek tek değil, kısa A1–A2 metinlerin içinde öğren.</span>
          </button>
          <button class="lim-path-card" data-step="03" id="limChallengeBtnV14" type="button">
            <i>✓</i><strong>Pratik yap</strong><span>Günün 8 soruluk mini tekrarını çöz ve nerede zorlandığını gör.</span>
          </button>
        </div>
        <div class="lim-mini-guide">
          <article class="lim-guide-card">
            <strong>Yeni gelen biri için öneri</strong>
            <p>Bugün bir kelime ara, bir hikâye aç ve 8 soruluk pratiği çöz. Daha fazlası sonra.</p>
            <div class="lim-guide-actions">
              <button type="button" data-section-target="dictionary">Sözlükten başla</button>
              <button type="button" data-section-target="reading">Hikâye seç</button>
              <button type="button" id="limOpenChallengeV14">Meydan okuma</button>
            </div>
          </article>
          <article class="lim-level-card">
            <strong>Seviyeni seç</strong>
            <p>İçerikler yerinde kalır; yalnız sana gösterilen öncelikler sadeleşir.</p>
            <div class="lim-level-buttons" id="limLevelButtonsV14">
              <button type="button" data-level="start">Yeni</button>
              <button type="button" data-level="a1">A1</button>
              <button type="button" data-level="a2">A2</button>
            </div>
          </article>
        </div>
      </section>`);

    qs("#simpleStartV14")?.querySelectorAll("[data-section-target]").forEach(btn => btn.addEventListener("click", () => scrollToSection(btn.dataset.sectionTarget)));
    const startChallenge = () => {
      const btn = qs("#startChallengeV13");
      if (btn) return btn.click();
      scrollToSection("game");
    };
    qs("#limChallengeBtnV14")?.addEventListener("click", startChallenge);
    qs("#limOpenChallengeV14")?.addEventListener("click", startChallenge);
    initLevelButtons();
  }

  function initLevelButtons(){
    const current = localStorage.getItem(LEVEL_KEY) || "a1";
    const box = qs("#limLevelButtonsV14");
    if (!box) return;
    box.querySelectorAll("button").forEach(btn => {
      btn.classList.toggle("is-active", btn.dataset.level === current);
      btn.addEventListener("click", () => {
        localStorage.setItem(LEVEL_KEY, btn.dataset.level);
        box.querySelectorAll("button").forEach(item => item.classList.toggle("is-active", item === btn));
        renderLevelNote(btn.dataset.level);
      });
    });
    renderLevelNote(current);
  }

  function renderLevelNote(level){
    let note = qs("#limLevelNoteV14");
    const card = qs(".lim-level-card");
    if (!card) return;
    if (!note) {
      card.insertAdjacentHTML("beforeend", `<small id="limLevelNoteV14" class="lim-simplify-chip"></small>`);
      note = qs("#limLevelNoteV14");
    }
    note.textContent = `Öncelik: ${levelLabel(level)}`;
  }

  function createAdvancedTools(){
    if (qs("#advancedToolsV14")) return;
    const dictionary = qs("#dictionary");
    if (!dictionary) return;
    dictionary.insertAdjacentHTML("beforebegin", `
      <details class="lim-advanced-tools container" id="advancedToolsV14">
        <summary><div><strong>Gelişmiş araçlar</strong><span>İhtiyaç duydukça aç: konu paketleri, gramer, dinleme ve ilerleme burada.</span></div></summary>
        <div class="lim-advanced-grid">
          <button type="button" data-section-target="topicPacks"><strong>Günlük durumlar</strong><span>Doktor, market, iş ve seyahat paketleri</span></button>
          <button type="button" data-section-target="listening"><strong>Dinle ve tahmin et</strong><span>Kelime ve cümle dinleme pratiği</span></button>
          <button type="button" data-section-target="sentence"><strong>Cümle kur</strong><span>Kelimeleri kullanıma geçir</span></button>
          <button type="button" data-section-target="progress"><strong>İlerlemem</strong><span>Seri, yanlışlar ve skorlar</span></button>
        </div>
      </details>`);
    qs("#advancedToolsV14")?.querySelectorAll("[data-section-target]").forEach(btn => btn.addEventListener("click", () => scrollToSection(btn.dataset.sectionTarget)));
  }

  function simplifyTopics(){
    document.body.classList.add("lim-topics-collapsed");
    const section = qs("#topicPacks");
    if (!section || qs("#showAllTopicsV14")) return;
    const headP = qs(".topic-packs-head p", section);
    if (headP) headP.textContent = "Önce en sık lazım olan dört alanı gösteriyoruz. Diğerleri tek tıkla açılır.";
    section.insertAdjacentHTML("beforeend", `<div class="lim-topic-toggle-row"><button type="button" class="lim-more-btn" id="showAllTopicsV14">Tüm konu paketlerini göster</button></div>`);
    qs("#showAllTopicsV14")?.addEventListener("click", () => {
      const collapsed = document.body.classList.toggle("lim-topics-collapsed");
      qs("#showAllTopicsV14").textContent = collapsed ? "Tüm konu paketlerini göster" : "Konu paketlerini sadeleştir";
    });
  }

  function renameMicrocopy(){
    const phraseBtn = qs("#phraseLibraryBtn");
    if (phraseBtn) phraseBtn.childNodes[0].nodeValue = "Hazır cümleler ";
    const notebookBtn = qs("#wordNotebookBtn");
    if (notebookBtn) notebookBtn.childNodes[0].nodeValue = "Kaydettiklerim ";
    const exploreBtn = qs("#wordExploreBtn");
    if (exploreBtn) exploreBtn.textContent = "Kelime öner";
    const recent = qs("#recentSearchesBtn");
    if (recent) recent.textContent = "Son baktıklarım";
    const dictionaryEmpty = qs("#resultPreview .empty-state strong");
    if (dictionaryEmpty) dictionaryEmpty.textContent = "Bir kelime yaz, sade kartı açalım.";
    const dictionarySmall = qs("#resultPreview .empty-state span");
    if (dictionarySmall) dictionarySmall.textContent = "Artikel, anlam, örnek ve telaffuz aynı yerde.";
  }

  function updateVersion(){
    qsa(".version-strip strong").forEach(el => {
      if (/Sürüm/.test(el.textContent)) el.textContent = "Sürüm 14.0";
    });
    qsa("footer p").forEach(p => p.innerHTML = p.innerHTML.replace(/Sürüm 13\.0/g, "Sürüm 14.0"));
    const meta = qs("meta[name='description']");
    if (meta) meta.setAttribute("content", "Almanca Aşkına: Her gün birkaç dakikayla kelime öğren, hikâye oku ve pratik yap.");
  }

  function preventUnwantedHashJump(){
    const allowed = new Set(["home","dictionary","reading","game","simpleStartV14"]);
    const raw = location.hash.replace("#", "");
    if (raw && !allowed.has(raw)) {
      history.replaceState(null, "", location.pathname + location.search);
      setTimeout(() => window.scrollTo(0,0), 40);
    }
  }

  function init(){
    document.body.classList.add(BODY_READY);
    updateHeader();
    updateHero();
    createSimpleStart();
    createAdvancedTools();
    simplifyTopics();
    renameMicrocopy();
    updateVersion();
    preventUnwantedHashJump();
    setTimeout(() => { if (!location.hash) window.scrollTo(0,0); }, 250);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
