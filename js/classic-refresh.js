/* Almanca Aşkına v15 — Klasik sadeleşme ve daha net akış */
(function(){
  const BODY_CLASS = 'lim15';
  const SECONDARY_IDS = ['topicPacks', 'listening', 'sentence', 'grammar', 'progress'];
  const SECONDARY_BUTTONS = [
    ['Konu Paketleri', 'topicPacks'],
    ['Dinleme', 'listening'],
    ['Cümle', 'sentence'],
    ['Gramer', 'grammar'],
    ['İlerleme', 'progress'],
    ['Hakkında', 'about']
  ];

  const qs = (sel, root=document) => root.querySelector(sel);
  const qsa = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const ready = (fn) => document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', fn) : fn();
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const bindTargets = (root=document) => {
    qsa('[data-section-target]', root).forEach(btn => {
      if (btn.dataset.bound15 === '1') return;
      btn.dataset.bound15 = '1';
      btn.addEventListener('click', () => scrollToSection(btn.dataset.sectionTarget));
    });
  };

  function applyHeader(){
    document.body.classList.add(BODY_CLASS);
    const nav = qs('#primaryNav');
    if (nav) {
      nav.innerHTML = `
        <button class="category-card nav-link is-active" data-section-target="home" type="button">Ana Sayfa</button>
        <button class="category-card nav-link" data-section-target="dictionary" type="button">Sözlük</button>
        <button class="category-card nav-link" data-section-target="reading" type="button">Hikâyeler</button>
        <button class="category-card nav-link" data-section-target="game" type="button">Pratik</button>`;
      bindTargets(nav);
    }
    const brandSmall = qs('.brand-lockup small');
    if (brandSmall) brandSmall.textContent = 'Klasik, sade ve ücretsiz çalışma alanı.';
  }

  function applyHero(){
    const copy = qs('.hero-copy');
    if (!copy || copy.dataset.lim15 === 'ready') return;
    copy.dataset.lim15 = 'ready';
    copy.innerHTML = `
      <span class="hero-eyebrow"><i></i> A1–A2 için dijital ders kitabı hissi</span>
      <h1>Kelime öğren, <em>hikâye oku</em>, kısa pratiklerle ilerle.</h1>
      <p>Almanca Aşkına artık daha sade bir vitrine sahip: önce kelimeyi gör, sonra onu bağlam içinde oku, en sonda küçük bir pratikle pekiştir.</p>
      <div class="hero-actions">
        <button class="category-card hero-primary" data-section-target="classicQuickStart" type="button">Bugünkü yolu gör</button>
        <button class="category-card hero-secondary" data-section-target="dictionary" type="button">Kelime ara</button>
      </div>
      <div aria-label="Platform özeti" class="hero-stats">
        <div><strong>3 adım</strong><span>önerilen çalışma akışı</span></div>
        <div><strong>A1–A2</strong><span>odak seviyesi</span></div>
        <div><strong>Ücretsiz</strong><span>üyelik zorunluluğu yok</span></div>
        <div><strong>Sade</strong><span>dikkat dağıtmayan yapı</span></div>
      </div>`;
    bindTargets(copy);
  }

  function createQuickStart(){
    if (qs('#classicQuickStart')) return;
    const hero = qs('#home');
    if (!hero) return;
    hero.insertAdjacentHTML('afterend', `
      <section class="classic-quickstart container" id="classicQuickStart" aria-labelledby="classicQuickStartTitle">
        <div class="classic-quickstart-head">
          <div>
            <span>Net başlangıç</span>
            <h2 id="classicQuickStartTitle">Dolu değil, yönlendiren bir ana akış.</h2>
          </div>
          <p>Site büyük kalabilir; ama ilk karşılaşma sade olmalı. Bu yüzden başlangıcı üç temel adıma indirdik.</p>
        </div>
        <div class="classic-path-grid">
          <button class="classic-path" data-section-target="dictionary" type="button">
            <span class="classic-path-badge">01</span>
            <strong>Kelime ara</strong>
            <p>Artikel, anlam, çekim ve örnek cümleyi tek ekranda gör.</p>
            <span class="classic-path-meta">Önce bir kelime seç →</span>
          </button>
          <button class="classic-path" data-section-target="reading" type="button">
            <span class="classic-path-badge">02</span>
            <strong>Hikâye oku</strong>
            <p>Kelimeleri kısa A1–A2 metinlerde bağlam içinde öğren.</p>
            <span class="classic-path-meta">Sonra bağlam kur →</span>
          </button>
          <button class="classic-path" data-section-target="game" type="button">
            <span class="classic-path-badge">03</span>
            <strong>Kısa pratik yap</strong>
            <p>Kelime anlamı, artikel veya hızlı tekrar ile pekiştir.</p>
            <span class="classic-path-meta">En sonda pekiştir →</span>
          </button>
        </div>
        <div class="classic-guidance-row">
          <article class="compact-guidance-card">
            <h3>İlk kez gelen biri için yeterli rota</h3>
            <p>Bugün bir kelime ara, bir hikâye aç ve kısa bir tekrar çöz. Daha fazlasını istersen ek bölümler aşağıda seni bekliyor.</p>
            <div class="compact-guidance-actions">
              <button class="primary" data-section-target="dictionary" type="button">Sözlükten başla</button>
              <button data-section-target="reading" type="button">Hikâyelere geç</button>
              <button data-section-target="game" type="button">Pratiğe git</button>
            </div>
          </article>
          <article class="compact-guidance-card">
            <h3>Yeni düzen ne sağlıyor?</h3>
            <ul class="compact-guidance-list">
              <li>Daha az kart ve daha net bir sayfa akışı</li>
              <li>Klasik tipografi ile daha güçlü okuma hissi</li>
              <li>İleri araçları isteyen için ayrı bir alan</li>
            </ul>
          </article>
        </div>
      </section>`);
    bindTargets(qs('#classicQuickStart'));
  }

  function simplifyHeadings(){
    const map = {
      '#dailyStudyPanel .panel-head h2': 'Bugün için hazır küçük plan.',
      '#dailyStudyPanel .panel-head p': 'Kelime, okuma ve pratik arasında sade bir günlük yönlendirme al.',
      '#dictionary .panel-head h2': 'Kelimeyi tek ekranda gör.',
      '#dictionary .panel-head p': 'Türkçe veya Almanca ara; anlamı, artikeli ve örneği birlikte incele.',
      '#reading .panel-head h2': 'Kısa metinlerle öğren.',
      '#reading .panel-head p': 'Okurken kelimelerin üstüne gelerek anlamı hemen gör ve bağlam kur.',
      '#game .panel-head h2': 'Kısa pratikle pekiştir.',
      '#about .panel-head h2': 'Bu proje ne vaat ediyor?',
      '#about .panel-head p': 'Gösterişsiz, ücretsiz ve gerçekten işe yarayan bir çalışma alanı.'
    };
    Object.entries(map).forEach(([sel, text]) => {
      const el = qs(sel);
      if (el) el.textContent = text;
    });
    const searchInput = qs('#searchInput');
    if (searchInput) searchInput.placeholder = 'Örn: Haus, Arzt, gehen ya da pencere...';
  }

  function buildSecondaryToggle(){
    if (qs('#secondaryExpander')) return;
    const insertAfter = qs('#dailyStudyPanel') || qs('#classicQuickStart');
    if (!insertAfter) return;
    insertAfter.insertAdjacentHTML('afterend', `
      <section class="study-expander-bar container" id="secondaryExpander">
        <div class="expander-copy">
          <strong>İleri araçlar ayrı dursun.</strong>
          <p>Dinleme, cümle kurma, gramer ve konu paketleri ana sayfayı kalabalıklaştırmasın. İstersen tek tuşla aç.</p>
          <div class="secondary-section-chips"></div>
        </div>
        <button class="expander-toggle" id="toggleSecondarySections" type="button">İleri bölümleri göster</button>
      </section>`);
    const chipWrap = qs('#secondaryExpander .secondary-section-chips');
    if (chipWrap) {
      chipWrap.innerHTML = SECONDARY_BUTTONS.map(([label, target]) => `<button type="button" data-section-target="${target}">${label}</button>`).join('');
      bindTargets(chipWrap);
    }
    const toggleBtn = qs('#toggleSecondarySections');
    if (toggleBtn) {
      toggleBtn.addEventListener('click', () => {
        const isOpen = document.body.classList.toggle('show-secondary');
        toggleBtn.textContent = isOpen ? 'İleri bölümleri gizle' : 'İleri bölümleri göster';
      });
    }
  }

  function markSecondarySections(){
    SECONDARY_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.add('is-secondary-section');
    });
    const localData = qs('.local-data-tools');
    if (localData) localData.classList.add('secondary-local-data');
  }

  function enhanceAbout(){
    const footer = qs('.site-footer p');
    if (footer) {
      footer.innerHTML = 'Almanca Aşkına — sade, ücretsiz ve klasik bir çalışma masası hissi veren Almanca kütüphanesi. · <a href="mailto:akkayanbusiness@gmail.com">İletişim</a> · Sürüm 15.0';
    }
  }

  function init(){
    applyHeader();
    applyHero();
    createQuickStart();
    simplifyHeadings();
    markSecondarySections();
    buildSecondaryToggle();
    enhanceAbout();
    bindTargets();
  }

  ready(init);
})();
