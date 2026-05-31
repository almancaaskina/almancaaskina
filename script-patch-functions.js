
/* =========================
   READING V2 + GRAMMAR V2 PATCH
   ========================= */

const STORY_FALLBACK_TR = {
  ich:'ben', du:'sen', er:'o', sie:'o/onlar', es:'o', wir:'biz', ihr:'siz', ihnen:'onlara/sizlere', ihnen:'onlara', mich:'beni', mir:'bana', dich:'seni', dir:'sana', ihn:'onu', ihm:'ona', uns:'bizi/bize', euch:'sizi/size',
  der:'artikeli: der', die:'artikeli: die', das:'artikeli: das', den:'artikeli: den', dem:'artikeli: dem', des:'artikeli: des', ein:'bir', eine:'bir', einen:'bir', einem:'bir', einer:'bir', eines:'bir',
  und:'ve', oder:'veya', aber:'ama', denn:'çünkü', weil:'çünkü', wenn:'eğer/ne zaman', dass:'ki', als:'-ken / olarak', auch:'de/da', nicht:'değil', kein:'hiçbir', keine:'hiçbir',
  in:'içinde/-de', im:'içinde/-de', ins:'içine/-e', an:'-de/-da/yanında', am:'-de/-da', auf:'üstünde/üzerine', mit:'ile', ohne:'olmadan', für:'için', von:'-den/-dan', zu:'-e/-a', zum:'-e/-a', zur:'-e/-a', nach:'-e doğru/sonra', aus:'-den/-dan', bei:'yanında/-de', seit:'-den beri', vor:'önce/önünde', über:'üzerinde/hakkında', unter:'altında', zwischen:'arasında', durch:'içinden', gegen:'karşı', um:'saatte/etrafında',
  heute:'bugün', morgen:'yarın/sabah', gestern:'dün', jetzt:'şimdi', immer:'her zaman', oft:'sık sık', manchmal:'bazen', dann:'sonra/o zaman', danach:'ondan sonra', früher:'eskiden', später:'sonra', zuerst:'ilk önce', zuletzt:'son olarak',
  sehr:'çok', viel:'çok', viele:'birçok', mehr:'daha fazla', wenig:'az', gut:'iyi', besser:'daha iyi', gern:'severek', gerne:'severek', schön:'güzel', klein:'küçük', groß:'büyük', alt:'eski/yaşlı', neu:'yeni', warm:'sıcak', kalt:'soğuk', langsam:'yavaş', schnell:'hızlı', zusammen:'birlikte', allein:'yalnız',
  bin:'-im / olmak', bist:'-sin / olmak', ist:'-dir / olmak', sind:'-iz/-ler / olmak', seid:'-siniz / olmak', war:'idi', waren:'idiler', habe:'sahibim / yaptım', hast:'sahipsin / yaptın', hat:'sahip / yaptı', haben:'sahip olmak', hatte:'sahipti', hatten:'sahiptiler',
  gehe:'gidiyorum', gehst:'gidiyorsun', geht:'gidiyor', gehen:'gitmek', ging:'gitti', gegangen:'gitmiş/gitti', komme:'geliyorum', kommt:'geliyor', kommen:'gelmek', gekommen:'gelmiş/geldi', mache:'yapıyorum', macht:'yapıyor', machen:'yapmak', gemacht:'yapmış/yaptı',
  möchte:'istiyorum', möchten:'istemek', muss:'zorunda', müssen:'zorunda olmak', kann:'yapabilir', können:'yapabilmek', soll:'-meli', sollen:'-meli/-malı', will:'istiyor', wollen:'istemek'
};

function getStoriesData() {
  return Array.isArray(window.STORIES_DATA) ? window.STORIES_DATA : STORIES;
}

function getGrammarData() {
  return Array.isArray(window.GRAMMAR_HAPS) ? window.GRAMMAR_HAPS : [];
}

function createDictionaryLookup() {
  const lookup = new Map();
  dictionaryData.forEach(item => {
    if (!item || !item.word || !item.tr) return;
    const forms = [item.word, item.key, item.raw].filter(Boolean);
    forms.forEach(form => lookup.set(normalizeGerman(form), item.tr));
  });
  return lookup;
}

function getTokenTranslation(token) {
  const clean = String(token || '').replace(/[„“”"'’‘()]/g, '').trim();
  if (!clean) return '';
  const lower = clean.toLocaleLowerCase('de-DE');
  const directFallback = STORY_FALLBACK_TR[lower];
  if (directFallback) return directFallback;

  const lookup = createDictionaryLookup();
  const normalized = normalizeGerman(clean);
  if (lookup.has(normalized)) return lookup.get(normalized);

  const guesses = guessGermanBaseForms(lower).map(normalizeGerman);
  for (const guess of guesses) {
    if (lookup.has(guess)) return lookup.get(guess);
  }

  return 'çeviri eklenecek';
}

function guessGermanBaseForms(word) {
  const w = word.replace(/[.,!?;:]/g, '');
  const guesses = new Set([w]);
  if (w.endsWith('e')) guesses.add(w + 'n');
  if (w.endsWith('st')) guesses.add(w.slice(0, -2) + 'en');
  if (w.endsWith('t')) guesses.add(w.slice(0, -1) + 'en');
  if (w.endsWith('en')) guesses.add(w);
  if (w.endsWith('n')) guesses.add(w + 'en');
  if (w.endsWith('te')) guesses.add(w.slice(0, -2) + 'en');
  if (w.endsWith('ten')) guesses.add(w.slice(0, -3) + 'en');
  if (w.endsWith('gegangen')) guesses.add('gehen');
  if (w.endsWith('gekommen')) guesses.add('kommen');
  if (w.endsWith('gemacht')) guesses.add('machen');
  if (w.endsWith('gegessen')) guesses.add('essen');
  if (w.endsWith('getrunken')) guesses.add('trinken');
  if (w.endsWith('gesehen')) guesses.add('sehen');
  if (w.endsWith('gefunden')) guesses.add('finden');
  if (w.endsWith('gekauft')) guesses.add('kaufen');
  if (w.endsWith('gelernt')) guesses.add('lernen');
  if (w.endsWith('gespielt')) guesses.add('spielen');
  return [...guesses];
}

function annotateStoryText(text) {
  return escapeHtml(text).replace(/([A-Za-zÄÖÜäöüß]+(?:-[A-Za-zÄÖÜäöüß]+)?)/g, (match) => {
    const tr = getTokenTranslation(match);
    const missing = tr === 'çeviri eklenecek' ? ' is-missing' : '';
    return `<span class="reader-word${missing}" data-tr="${escapeHtml(tr)}">${match}</span>`;
  }).replace(/
/g, '<br>');
}

function renderGrammarHaps() {
  const grid = document.getElementById('grammarGrid');
  if (!grid) return;
  const data = getGrammarData();
  grid.className = 'grammar-accordion';
  grid.innerHTML = data.map((item, index) => `
    <article class="grammar-accordion-item ${index === 0 ? 'is-open' : ''}">
      <button type="button" class="grammar-accordion-trigger">
        <div>
          <span>${escapeHtml(item.category || 'Gramer')}</span>
          <strong>${escapeHtml(item.title)}</strong>
          <small>${escapeHtml(item.summary || '')}</small>
        </div>
        <b class="chevron">⌄</b>
      </button>
      <div class="grammar-accordion-content">
        ${renderGrammarContent(item)}
      </div>
    </article>
  `).join('');

  grid.querySelectorAll('.grammar-accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      trigger.closest('.grammar-accordion-item').classList.toggle('is-open');
    });
  });
}

function renderGrammarContent(item) {
  let html = '';
  if (item.chips) html += `<div class="grammar-chip-row">${item.chips.map(chip => `<span class="grammar-chip">${escapeHtml(chip)}</span>`).join('')}</div>`;
  if (item.table) html += `<div class="grammar-table-wrap"><table class="grammar-table"><thead><tr>${item.table.headers.map(h => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead><tbody>${item.table.rows.map(row => `<tr>${row.map(cell => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  if (item.examples) html += `<div class="grammar-example-list">${item.examples.map(ex => `<div class="grammar-example"><strong>${escapeHtml(ex[0])}</strong><span>${escapeHtml(ex[1])}</span></div>`).join('')}</div>`;
  if (item.note) html += `<p class="grammar-note">${escapeHtml(item.note)}</p>`;
  return html;
}
