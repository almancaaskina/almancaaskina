/* Almanca Aşkına — V15.1 Sade Vitrin Düzeltmesi */
(function(){
  const SECONDARY_IDS = ["topicPacks", "listening", "sentence", "grammar", "progress"];
  const MORE_BUTTONS = [
    ["Konu Paketleri", "topicPacks"],
    ["Dinleme", "listening"],
    ["Cümle Kurma", "sentence"],
    ["Gramer", "grammar"],
    ["İlerleme", "progress"],
    ["Hakkında", "about"]
  ];

  const qs = (sel, root=document) => root.querySelector(sel);
  const qsa = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  function scrollToSection(id){
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function bindTargets(root=document){
    qsa("[data-section-target]", root).forEach(btn => {
      if (btn.dataset.vitrineBound === "1") return;
      btn.dataset.vitrineBound = "1";
      btn.addEventListener("click", () => scrollToSection(btn.dataset.sectionTarget));
    });
  }

  function applyBase(){
    document.body.classList.remove("lim15");
    document.body.classList.add("vitrine151");
    document.body.classList.remove("show-vitrine-more");

    const brandSmall = qs(".brand-lockup small");
    if (brandSmall) brandSmall.textContent = "Sade Almanca çalışma alanı.";

    const nav = qs("#primaryNav");
    if (nav) {
      nav.innerHTML = `
        <button class="category-card nav-link is-active" data-section-target="home" type="button">Bugün</button>
        <button class="category-card nav-link" data-section-target="dictionary" type="button">Sözlük</button>
        <button class="category-card nav-link" data-section-target="reading" type="button">Hikâyeler</button>
        <button class="category-card nav-link" data-section-target="game" type="button">Pratik</button>`;
    }
  }

  function applyHero(){
    const copy = qs(".hero-copy");
    if (!copy) return;
    copy.innerHTML = `
      <span class="hero-eyebrow"><i></i> Ücretsiz A1–A2 çalışma alanı</span>
      <h1>Bugün 5 dakika <em>Almanca</em> çalış.</h1>
      <p>Bir kelime ara, kısa bir hikâye oku ve küçük bir pratikle öğrendiğini pekiştir.</p>
      <div class="hero-actions">
        <button class="category-card hero-primary" data-section-target="vitrineStart" type="button">Başlamak istiyorum</button>
        <button class="category-card hero-secondary" data-section-target="dictionary" type="button">Kelime ara</button>
      </div>`;
  }

  function removeOldInternalPanels(){
    qsa("#simpleStartV14, #classicQuickStart, #secondaryExpander").forEach(el => el.remove());
  }

  function createStartPanel(){
    if (qs("#vitrineStart")) return;
    const hero = qs("#home");
    if (!hero) return;

    hero.insertAdjacentHTML("afterend", `
      <section class="vitrine-start-panel container" id="vitrineStart" aria-labelledby="vitrineStartTitle">
        <div class="vitrine-start-head">
          <div>
            <span>Başlangıç</span>
            <h2 id="vitrineStartTitle">Nereden başlayacağını seç.</h2>
          </div>
          <p>Siteyi tanıman gerekmez. Bugün yalnızca bir çalışma yolu seçmen yeterli.</p>
        </div>

        <div class="vitrine-path-grid">
          <button class="vitrine-path-card primary" data-section-target="dictionary" type="button">
            <i>Aa</i>
            <strong>Kelime öğren</strong>
            <span>Anlamı, artikeli, örnek cümleyi ve telaffuzu birlikte gör.</span>
          </button>
          <button class="vitrine-path-card" data-section-target="reading" type="button">
            <i>▤</i>
            <strong>Hikâye oku</strong>
            <span>Kelimeleri kısa A1–A2 metinlerin içinde öğren.</span>
          </button>
          <button class="vitrine-path-card" data-section-target="game" type="button">
            <i>✓</i>
            <strong>Pratik yap</strong>
            <span>Mini testlerle öğrendiğini hızlıca pekiştir.</span>
          </button>
        </div>
      </section>

      <section class="vitrine-more-panel container" id="vitrineMorePanel">
        <div class="vitrine-more-top">
          <div>
            <strong>Daha fazla çalışma alanı</strong>
            <p>Dinleme, gramer, konu paketleri ve ilerleme ekranlarını ihtiyaç duyduğunda aç.</p>
          </div>
          <button class="vitrine-more-toggle" id="vitrineMoreToggle" type="button">Alanları göster</button>
        </div>
        <div class="vitrine-more-grid" id="vitrineMoreGrid"></div>
      </section>
    `);

    const grid = qs("#vitrineMoreGrid");
    if (grid) {
      grid.innerHTML = MORE_BUTTONS.map(([label, target]) => 
        `<button type="button" data-section-target="${target}">${label}</button>`
      ).join("");
    }

    const toggle = qs("#vitrineMoreToggle");
    if (toggle) {
      toggle.addEventListener("click", () => {
        const open = document.body.classList.toggle("show-vitrine-more");
        toggle.textContent = open ? "Alanları gizle" : "Alanları göster";
      });
    }
  }

  function markSecondary(){
    SECONDARY_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add("vitrine-secondary-section");
    });
    const localData = qs(".local-data-tools");
    if (localData) localData.classList.add("vitrine-secondary-local");
  }

  function updateTexts(){
    const textMap = {
      "#dailyStudyPanel .panel-head h2": "Bugünkü küçük planın.",
      "#dailyStudyPanel .panel-head p": "Kısa bir çalışma seç ve düzenli ilerle.",
      "#topicPacks .panel-head h2": "Günlük durumlarla çalış.",
      "#topicPacks .panel-head p": "İhtiyacın olduğunda doktor, ulaşım, restoran veya iş gibi konulara geç.",
      "#dictionary .section-kicker": "Sözlük",
      "#dictionary .empty-state strong": "Bir kelime ara.",
      "#dictionary .empty-state span": "Almanca veya Türkçe yaz; anlamı, artikeli ve örnek cümleyi birlikte gör.",
      "#reading .section-kicker": "Hikâyeler",
      "#reading .panel-head h2": "Kısa metinlerle öğren.",
      "#reading .panel-head p": "Okurken kelimelerin üstüne gelerek anlamı hemen gör.",
      "#listening .panel-head h2": "Dinle ve tahmin et.",
      "#listening .panel-head p": "Kelimeleri ve cümleleri duyarak tekrar et.",
      "#sentence .panel-head h2": "Cümle kur.",
      "#sentence .panel-head p": "Kelimeyi tek başına değil, cümlede kullan.",
      "#game .panel-head h2": "Kısa pratik yap.",
      "#grammar .panel-head h2": "Grameri sade çalış.",
      "#progress .panel-head h2": "İlerlemeni gör.",
      "#about .panel-head h2": "Almanca Aşkına nedir?",
      "#about .panel-head p": "A1–A2 için ücretsiz, sade ve düzenli bir Almanca çalışma alanı."
    };

    Object.entries(textMap).forEach(([sel, text]) => {
      const el = qs(sel);
      if (el) el.textContent = text;
    });

    const searchInput = qs("#searchInput");
    if (searchInput) searchInput.placeholder = "Örn: Haus, gehen, Arzt ya da pencere...";

    const recent = qs("#recentSearchesBtn");
    if (recent) recent.firstChild.textContent = "Son baktıklarım";

    const notebook = qs("#wordNotebookBtn");
    if (notebook) notebook.firstChild.textContent = "Kaydettiklerim ";

    const explore = qs("#wordExploreBtn");
    if (explore) explore.textContent = "Kelime seç";

    const phrase = qs("#phraseLibraryBtn");
    if (phrase) phrase.firstChild.textContent = "Hazır cümleler ";

    const footer = qs(".site-footer p");
    if (footer) {
      footer.innerHTML = `Almanca Aşkına — ücretsiz, sade ve dikkat dağıtmayan Almanca çalışma alanı. · <a href="mailto:akkayanbusiness@gmail.com">İletişim</a> · Sürüm 15.1`;
    }
  }

  function preventInitialJump(){
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    if (!location.hash || location.hash === "#home") {
      setTimeout(() => window.scrollTo(0,0), 0);
      setTimeout(() => window.scrollTo(0,0), 120);
      setTimeout(() => window.scrollTo(0,0), 300);
    }
  }

  function init(){
    applyBase();
    applyHero();
    removeOldInternalPanels();
    createStartPanel();
    markSecondary();
    updateTexts();
    bindTargets();
    preventInitialJump();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  window.addEventListener("load", () => {
    updateTexts();
    bindTargets();
    preventInitialJump();
  });
})();
