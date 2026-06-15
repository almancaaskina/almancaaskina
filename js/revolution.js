
/* Almanca Aşkına — Tasarım Devrimi v11 */
(() => {
  const doc = document;
  const header = doc.getElementById('siteHeader');
  const progress = doc.getElementById('scrollProgressBar');
  const nav = doc.getElementById('primaryNav');
  const toggle = doc.getElementById('menuToggle');
  const backdrop = doc.getElementById('navBackdrop');
  const backToTop = doc.getElementById('backToTop');
  const heroVisual = doc.getElementById('heroVisual');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // v11 hotfix: this redesign uses one continuous page, not closed accordion panels.
  doc.querySelectorAll('main > .section-panel').forEach(panel => panel.classList.add('is-open'));

  function closeMenu() {
    nav?.classList.remove('is-open');
    toggle?.classList.remove('is-open');
    backdrop?.classList.remove('is-open');
    toggle?.setAttribute('aria-expanded','false');
  }

  toggle?.addEventListener('click', () => {
    const open = !nav?.classList.contains('is-open');
    nav?.classList.toggle('is-open', open);
    toggle.classList.toggle('is-open', open);
    backdrop?.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });
  backdrop?.addEventListener('click', closeMenu);
  nav?.querySelectorAll('[data-section-target]').forEach(btn => btn.addEventListener('click', closeMenu));

  function updateScrollUI() {
    const y = scrollY;
    const max = Math.max(1, doc.documentElement.scrollHeight - innerHeight);
    if (progress) progress.style.width = `${Math.min(100, y / max * 100)}%`;
    header?.classList.toggle('is-scrolled', y > 18);
    backToTop?.classList.toggle('is-visible', y > 760);
  }
  addEventListener('scroll', updateScrollUI, { passive:true });
  updateScrollUI();
  backToTop?.addEventListener('click', () => scrollTo({top:0, behavior:reduceMotion?'auto':'smooth'}));

  const revealTargets = [
    ...doc.querySelectorAll('main > section'),
    ...doc.querySelectorAll('.launcher-card,.daily-task-card,.level-card,.story-card,.trust-card,.grammar-accordion-item,.progress-stat-grid article')
  ];
  revealTargets.forEach(el => el.classList.add('reveal-ready'));
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); io.unobserve(entry.target); }
    }), { threshold:.09, rootMargin:'0px 0px -5% 0px' });
    revealTargets.forEach(el => io.observe(el));
  } else revealTargets.forEach(el => el.classList.add('is-visible'));

  const sections = ['dictionary','reading','listening','sentence','game','grammar','progress','about']
    .map(id => doc.getElementById(id)).filter(Boolean);
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver(entries => {
      const visible = entries.filter(e => e.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];
      if (!visible) return;
      const id = visible.target.id;
      let navTarget = id;
      if (['listening','sentence','grammar'].includes(id)) navTarget = 'reading';
      if (id === 'progress') navTarget = 'game';
      doc.querySelectorAll('.primary-nav .nav-link').forEach(btn => btn.classList.toggle('is-active', btn.dataset.sectionTarget === navTarget));
    }, { threshold:[.16,.35], rootMargin:'-20% 0px -55% 0px' });
    sections.forEach(section => spy.observe(section));
  }

  if (heroVisual && !reduceMotion && matchMedia('(pointer:fine)').matches) {
    heroVisual.addEventListener('pointermove', event => {
      const r = heroVisual.getBoundingClientRect();
      const x = (event.clientX-r.left)/r.width-.5;
      const y = (event.clientY-r.top)/r.height-.5;
      const card = heroVisual.querySelector('.hero-book-card');
      if (card) card.style.transform = `rotateY(${x*8-8}deg) rotateX(${-y*7+4}deg) translate3d(${x*8}px,${y*8}px,0)`;
    });
    heroVisual.addEventListener('pointerleave', () => {
      const card = heroVisual.querySelector('.hero-book-card');
      if (card) card.style.transform = 'rotateY(-8deg) rotateX(4deg)';
    });
  }

  doc.querySelectorAll('.category-card[data-section-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.sectionTarget;
      history.replaceState(null,'',`#${id}`);
    });
  });
})();
