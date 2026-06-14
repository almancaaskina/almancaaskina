let dictionaryData = [];
let storyWordLookup = new Map();
let currentStoryLevel = null;
let currentGameWord = null;
let currentGameLevel = "A1";
let currentGameMode = "meaning";
let activeArticleChoice = null;
let streak = 0;
let activeVerbData = null;

const PRONOUNS = [
  ["ich", "ich"],
  ["du", "du"],
  ["er_sie_es", "er/sie/es"],
  ["wir", "wir"],
  ["ihr", "ihr"],
  ["sie_Sie", "sie/Sie"]
];

const AUXILIARY_FORMS = {
  haben: { ich: "habe", du: "hast", er_sie_es: "hat", wir: "haben", ihr: "habt", sie_Sie: "haben" },
  sein: { ich: "bin", du: "bist", er_sie_es: "ist", wir: "sind", ihr: "seid", sie_Sie: "sind" }
};

const WERDEN_FORMS = {
  ich: "werde",
  du: "wirst",
  er_sie_es: "wird",
  wir: "werden",
  ihr: "werdet",
  sie_Sie: "werden"
};

const REFLEXIVE_FORMS = {
  ich: "mich",
  du: "dich",
  er_sie_es: "sich",
  wir: "uns",
  ihr: "euch",
  sie_Sie: "sich"
};

const PRESENT_OVERRIDES = {
  sein: { ich: "bin", du: "bist", er_sie_es: "ist", wir: "sind", ihr: "seid", sie_Sie: "sind" },
  haben: { ich: "habe", du: "hast", er_sie_es: "hat", wir: "haben", ihr: "habt", sie_Sie: "haben" },
  werden: { ich: "werde", du: "wirst", er_sie_es: "wird", wir: "werden", ihr: "werdet", sie_Sie: "werden" },
  geben: { ich: "gebe", du: "gibst", er_sie_es: "gibt", wir: "geben", ihr: "gebt", sie_Sie: "geben" },
  nehmen: { ich: "nehme", du: "nimmst", er_sie_es: "nimmt", wir: "nehmen", ihr: "nehmt", sie_Sie: "nehmen" },
  sprechen: { ich: "spreche", du: "sprichst", er_sie_es: "spricht", wir: "sprechen", ihr: "sprecht", sie_Sie: "sprechen" },
  sehen: { ich: "sehe", du: "siehst", er_sie_es: "sieht", wir: "sehen", ihr: "seht", sie_Sie: "sehen" },
  lesen: { ich: "lese", du: "liest", er_sie_es: "liest", wir: "lesen", ihr: "lest", sie_Sie: "lesen" },
  essen: { ich: "esse", du: "isst", er_sie_es: "isst", wir: "essen", ihr: "esst", sie_Sie: "essen" },
  fahren: { ich: "fahre", du: "fährst", er_sie_es: "fährt", wir: "fahren", ihr: "fahrt", sie_Sie: "fahren" },
  laufen: { ich: "laufe", du: "läufst", er_sie_es: "läuft", wir: "laufen", ihr: "lauft", sie_Sie: "laufen" },
  schlafen: { ich: "schlafe", du: "schläfst", er_sie_es: "schläft", wir: "schlafen", ihr: "schlaft", sie_Sie: "schlafen" },
  waschen: { ich: "wasche", du: "wäschst", er_sie_es: "wäscht", wir: "waschen", ihr: "wascht", sie_Sie: "waschen" },
  tragen: { ich: "trage", du: "trägst", er_sie_es: "trägt", wir: "tragen", ihr: "tragt", sie_Sie: "tragen" },
  fallen: { ich: "falle", du: "fällst", er_sie_es: "fällt", wir: "fallen", ihr: "fallt", sie_Sie: "fallen" },
  fangen: { ich: "fange", du: "fängst", er_sie_es: "fängt", wir: "fangen", ihr: "fangt", sie_Sie: "fangen" },
  halten: { ich: "halte", du: "hältst", er_sie_es: "hält", wir: "halten", ihr: "haltet", sie_Sie: "halten" },
  helfen: { ich: "helfe", du: "hilfst", er_sie_es: "hilft", wir: "helfen", ihr: "helft", sie_Sie: "helfen" },
  treffen: { ich: "treffe", du: "triffst", er_sie_es: "trifft", wir: "treffen", ihr: "trefft", sie_Sie: "treffen" },
  wissen: { ich: "weiß", du: "weißt", er_sie_es: "weiß", wir: "wissen", ihr: "wisst", sie_Sie: "wissen" },
  können: { ich: "kann", du: "kannst", er_sie_es: "kann", wir: "können", ihr: "könnt", sie_Sie: "können" },
  müssen: { ich: "muss", du: "musst", er_sie_es: "muss", wir: "müssen", ihr: "müsst", sie_Sie: "müssen" },
  dürfen: { ich: "darf", du: "darfst", er_sie_es: "darf", wir: "dürfen", ihr: "dürft", sie_Sie: "dürfen" },
  sollen: { ich: "soll", du: "sollst", er_sie_es: "soll", wir: "sollen", ihr: "sollt", sie_Sie: "sollen" },
  wollen: { ich: "will", du: "willst", er_sie_es: "will", wir: "wollen", ihr: "wollt", sie_Sie: "wollen" },
  mögen: { ich: "mag", du: "magst", er_sie_es: "mag", wir: "mögen", ihr: "mögt", sie_Sie: "mögen" },
  möchten: { ich: "möchte", du: "möchtest", er_sie_es: "möchte", wir: "möchten", ihr: "möchtet", sie_Sie: "möchten" }
};

const PRAETERITUM_OVERRIDES = {
  sein: { ich: "war", du: "warst", er_sie_es: "war", wir: "waren", ihr: "wart", sie_Sie: "waren" },
  haben: { ich: "hatte", du: "hattest", er_sie_es: "hatte", wir: "hatten", ihr: "hattet", sie_Sie: "hatten" },
  werden: { ich: "wurde", du: "wurdest", er_sie_es: "wurde", wir: "wurden", ihr: "wurdet", sie_Sie: "wurden" },
  geben: { ich: "gab", du: "gabst", er_sie_es: "gab", wir: "gaben", ihr: "gabt", sie_Sie: "gaben" },
  gehen: { ich: "ging", du: "gingst", er_sie_es: "ging", wir: "gingen", ihr: "gingt", sie_Sie: "gingen" },
  kommen: { ich: "kam", du: "kamst", er_sie_es: "kam", wir: "kamen", ihr: "kamt", sie_Sie: "kamen" },
  nehmen: { ich: "nahm", du: "nahmst", er_sie_es: "nahm", wir: "nahmen", ihr: "nahmt", sie_Sie: "nahmen" },
  sehen: { ich: "sah", du: "sahst", er_sie_es: "sah", wir: "sahen", ihr: "saht", sie_Sie: "sahen" },
  sprechen: { ich: "sprach", du: "sprachst", er_sie_es: "sprach", wir: "sprachen", ihr: "spracht", sie_Sie: "sprachen" },
  essen: { ich: "aß", du: "aßest", er_sie_es: "aß", wir: "aßen", ihr: "aßt", sie_Sie: "aßen" },
  fahren: { ich: "fuhr", du: "fuhrst", er_sie_es: "fuhr", wir: "fuhren", ihr: "fuhrt", sie_Sie: "fuhren" },
  lesen: { ich: "las", du: "last", er_sie_es: "las", wir: "lasen", ihr: "last", sie_Sie: "lasen" },
  wissen: { ich: "wusste", du: "wusstest", er_sie_es: "wusste", wir: "wussten", ihr: "wusstet", sie_Sie: "wussten" },
  können: { ich: "konnte", du: "konntest", er_sie_es: "konnte", wir: "konnten", ihr: "konntet", sie_Sie: "konnten" },
  müssen: { ich: "musste", du: "musstest", er_sie_es: "musste", wir: "mussten", ihr: "musstet", sie_Sie: "mussten" },
  dürfen: { ich: "durfte", du: "durftest", er_sie_es: "durfte", wir: "durften", ihr: "durftet", sie_Sie: "durften" },
  sollen: { ich: "sollte", du: "solltest", er_sie_es: "sollte", wir: "sollten", ihr: "solltet", sie_Sie: "sollten" },
  wollen: { ich: "wollte", du: "wolltest", er_sie_es: "wollte", wir: "wollten", ihr: "wolltet", sie_Sie: "wollten" },
  mögen: { ich: "mochte", du: "mochtest", er_sie_es: "mochte", wir: "mochten", ihr: "mochtet", sie_Sie: "mochten" }
};

const PARTIZIP_OVERRIDES = {
  sein: { auxiliary: "sein", partizip2: "gewesen" },
  haben: { auxiliary: "haben", partizip2: "gehabt" },
  werden: { auxiliary: "sein", partizip2: "geworden" },
  geben: { auxiliary: "haben", partizip2: "gegeben" },
  gehen: { auxiliary: "sein", partizip2: "gegangen" },
  kommen: { auxiliary: "sein", partizip2: "gekommen" },
  fahren: { auxiliary: "sein", partizip2: "gefahren" },
  laufen: { auxiliary: "sein", partizip2: "gelaufen" },
  bleiben: { auxiliary: "sein", partizip2: "geblieben" },
  fallen: { auxiliary: "sein", partizip2: "gefallen" },
  fliegen: { auxiliary: "sein", partizip2: "geflogen" },
  nehmen: { auxiliary: "haben", partizip2: "genommen" },
  sprechen: { auxiliary: "haben", partizip2: "gesprochen" },
  sehen: { auxiliary: "haben", partizip2: "gesehen" },
  lesen: { auxiliary: "haben", partizip2: "gelesen" },
  essen: { auxiliary: "haben", partizip2: "gegessen" },
  schlafen: { auxiliary: "haben", partizip2: "geschlafen" },
  tragen: { auxiliary: "haben", partizip2: "getragen" },
  treffen: { auxiliary: "haben", partizip2: "getroffen" },
  helfen: { auxiliary: "haben", partizip2: "geholfen" },
  finden: { auxiliary: "haben", partizip2: "gefunden" },
  trinken: { auxiliary: "haben", partizip2: "getrunken" },
  bringen: { auxiliary: "haben", partizip2: "gebracht" },
  denken: { auxiliary: "haben", partizip2: "gedacht" },
  wissen: { auxiliary: "haben", partizip2: "gewusst" }
};

const INSEPARABLE_PREFIXES = ["be", "emp", "ent", "er", "ge", "miss", "ver", "zer"];
const COMMON_SEPARABLE_PREFIXES = ["zurück", "herunter", "heraus", "hinein", "raus", "rein", "ab", "an", "auf", "aus", "ein", "mit", "nach", "vor", "weg", "zu"];

const STORIES = [];

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initSectionNavigation();
  initSearch();
  initReading();
  initGame();
  initCopyButtons();
  renderGrammarHaps();
  loadDictionary();
});

async function loadDictionary() {
  const [a1Data, a2Data] = await Promise.all([
    fetchFirstAvailable(["data/a1-words.json?v=20260614-1"]),
fetchFirstAvailable(["data/a2-words.json?v=20260614-1"])
  ]);

  const a1 = Array.isArray(a1Data) ? a1Data.map(item => ({ ...item, level: item.level || "A1" })) : [];
  const a2 = Array.isArray(a2Data) ? a2Data.map(item => ({ ...item, level: item.level || "A2" })) : [];

  dictionaryData = mergeDictionaryData(a1, a2);
  buildStoryWordLookup();
  prepareFirstGameWord();
  console.log("Sözlük yüklendi:", dictionaryData.length);
}

async function fetchFirstAvailable(paths) {
  for (const path of paths) {
    try {
      const response = await fetch(path);
      if (response.ok) return await response.json();
    } catch (error) {
      console.warn("Yüklenemedi:", path, error);
    }
  }
  return [];
}

function mergeDictionaryData(a1, a2) {
  const map = new Map();

  [...a1, ...a2].forEach(item => {
    const key = `${normalizeGerman(item.word || item.raw)}-${item.pos || "other"}`;
    const old = map.get(key);

    if (!old) {
      map.set(key, item);
      return;
    }

    map.set(key, {
      ...old,
      ...item,
      level: old.level === item.level ? old.level : "A1/A2",
      examples: [...new Set([...(old.examples || []), ...(item.examples || [])])]
    });
  });

  return [...map.values()];
}

function normalizeGerman(str) {
  return String(str || "")
    .trim()
    .toLowerCase()
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "_");
}

function normalizeAnswer(str) {
  return String(str || "")
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/â/g, "a")
    .replace(/î/g, "i")
    .replace(/û/g, "u")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ");
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;"
  }[char]));
}

function initSectionNavigation() {
  document.querySelectorAll("[data-section-target]").forEach(button => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.sectionTarget;
      const target = document.getElementById(targetId);

      document.querySelectorAll(".category-card").forEach(card => card.classList.remove("is-active"));
      button.classList.add("is-active");

      if (target && target.classList.contains("section-panel")) target.classList.add("is-open");
      if (target) setTimeout(() => target.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    });
  });
}

function initSearch() {
  const form = document.getElementById("searchForm");
  const input = document.getElementById("searchInput");
  if (!form || !input) return;

  form.addEventListener("submit", event => {
    event.preventDefault();
    handleSearch(input.value);
  });
}

function handleSearch(query) {
  const resultPreview = document.getElementById("resultPreview");
  const cleanGerman = normalizeGerman(query);
  const cleanTurkish = normalizeAnswer(query);

  if (!cleanTurkish) {
    resultPreview.innerHTML = renderEmptyState("Bir kelime yazman gerekiyor.", "Örn: geben, Haus, Tasse veya Türkçe olarak: vermek, ev, fincan");
    return;
  }

  const germanResult = findDictionaryItem(cleanGerman);

  if (germanResult) {
    renderFoundResult(germanResult);
    return;
  }

  const turkishMatches = findDictionaryItemsByTurkish(query);
  if (turkishMatches.length) {
    resultPreview.innerHTML = renderTurkishMatches(query, turkishMatches);
    bindReverseResultButtons();
    return;
  }

  resultPreview.innerHTML = renderEmptyState("Bu kelime henüz veri içinde yok.", "Almanca veya Türkçe karşılığını A1/A2 dosyalarına ekledikten sonra otomatik görünebilir.");
}

function renderFoundResult(item) {
  const resultPreview = document.getElementById("resultPreview");

  if (item.pos === "verb") {
    resultPreview.innerHTML = renderVerbResult(item);
    bindVerbTabs();
    return;
  }

  if (item.pos === "noun") {
    resultPreview.innerHTML = renderNounResult(item);
    return;
  }

  resultPreview.innerHTML = renderSimpleResult(item);
}

function findDictionaryItem(cleanQuery) {
  const exact = dictionaryData.find(item => {
    const wordKey = normalizeGerman(item.word);
    const rawKey = normalizeGerman(item.raw);
    const keyKey = normalizeGerman(item.key);
    return wordKey === cleanQuery || rawKey === cleanQuery || keyKey === cleanQuery;
  });

  if (exact) return exact;
  return dictionaryData.find(item => normalizeGerman(item.word).startsWith(cleanQuery));
}

function findDictionaryItemsByTurkish(query) {
  const cleanQuery = normalizeAnswer(query);
  if (!cleanQuery || cleanQuery.length < 2) return [];

  return dictionaryData
    .filter(item => item.tr && item.word)
    .map(item => {
      const fullTranslation = normalizeAnswer(item.tr);
      const acceptedAnswers = getAcceptedAnswers(item.tr).map(answer => normalizeAnswer(answer));
      let score = 0;

      if (fullTranslation === cleanQuery) score = 100;
      else if (acceptedAnswers.includes(cleanQuery)) score = 95;
      else if (acceptedAnswers.some(answer => answer.startsWith(cleanQuery))) score = 75;
      else if (acceptedAnswers.some(answer => answer.includes(cleanQuery))) score = 60;
      else if (fullTranslation.includes(cleanQuery)) score = 45;

      return { item, score };
    })
    .filter(match => match.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 18)
    .map(match => match.item);
}

function renderTurkishMatches(query, matches) {
  return `
    <div class="reverse-result-head">
      <div>
        <div class="section-kicker">Türkçe Arama</div>
        <h3>“${escapeHtml(query)}” için Almanca karşılıklar</h3>
        <p>Sonucu açmak için Almanca kelimeye tıkla.</p>
      </div>
      <span>${matches.length} sonuç</span>
    </div>

    <div class="reverse-list">
      ${matches.map(item => `
        <button type="button" class="reverse-item" data-reverse-word="${escapeHtml(item.word)}">
          <div>
            <strong>${escapeHtml(getGermanDisplay(item))}</strong>
            <small>${escapeHtml(item.tr || "")}</small>
          </div>
          <div class="reverse-meta">
            <em>${escapeHtml(item.level || "A1/A2")}</em>
            <em>${escapeHtml(getPosLabel(item.pos))}</em>
          </div>
        </button>
      `).join("")}
    </div>
  `;
}

function bindReverseResultButtons() {
  document.querySelectorAll("[data-reverse-word]").forEach(button => {
    button.addEventListener("click", () => {
      const word = button.dataset.reverseWord;
      const input = document.getElementById("searchInput");
      if (input) input.value = word;
      handleSearch(word);
    });
  });
}

function renderEmptyState(title, desc) {
  return `<div class="empty-state"><strong>${escapeHtml(title)}</strong><span>${escapeHtml(desc)}</span></div>`;
}

function renderResultHeader(item, displayWord) {
  const article = item.article ? `<span class="article">${escapeHtml(item.article)}</span>` : "";
  return `
    <div class="result-top">
      <div>
        <div class="result-title">${article}<span class="word">${escapeHtml(displayWord || item.word)}</span></div>
        <p class="translation">${escapeHtml(item.tr || "Türkçe anlam kontrol edilecek")}</p>
      </div>
      <div class="badge-row">
        <span class="level-badge">${escapeHtml(item.level || "A1/A2")}</span>
        <span class="pos-badge">${escapeHtml(getPosLabel(item.pos))}</span>
      </div>
    </div>`;
}

function renderNounResult(item) {
  const cases = getNounCases(item);
  return `
    ${renderResultHeader(item)}
    <div class="result-grid">
      <div class="info-box"><span>Plural</span><strong>${escapeHtml(getPluralText(item))}</strong></div>
      <div class="info-box"><span>Akkusativ</span><strong>${escapeHtml(cases.akkusativ)}</strong></div>
      <div class="info-box"><span>Dativ</span><strong>${escapeHtml(cases.dativ)}</strong></div>
    </div>
    ${renderExample(item)}`;
}

function renderSimpleResult(item) {
  return `
    ${renderResultHeader(item)}
    <div class="result-grid">
      <div class="info-box"><span>Kelime türü</span><strong>${escapeHtml(getPosLabel(item.pos))}</strong></div>
      <div class="info-box"><span>Seviye</span><strong>${escapeHtml(item.level || "A1/A2")}</strong></div>
      <div class="info-box"><span>Kaynak</span><strong>Goethe kelime listesi</strong></div>
    </div>
    ${renderExample(item)}`;
}

function renderExample(item) {
  const example = item.examples && item.examples.length ? item.examples[0] : "";
  if (!example) return "";
  const translation = item.exampleTranslations && item.exampleTranslations.length
    ? item.exampleTranslations[0]
    : "";
  return `
    <div class="example-box">
      <strong>Örnek cümle</strong>
      <span>${escapeHtml(example)}</span>
      ${translation ? `<small>${escapeHtml(translation)}</small>` : ""}
    </div>`;
}

function getPosLabel(pos) {
  const labels = {
    noun: "İsim",
    verb: "Fiil",
    adjective: "Sıfat",
    adverb: "Zarf",
    preposition: "Edat",
    conjunction: "Bağlaç",
    pronoun: "Zamir",
    number: "Sayı",
    abbreviation: "Kısaltma",
    other: "Kelime / ifade"
  };
  return labels[pos] || "Kelime";
}

function getNounCases(item) {
  const word = item.word || "";
  const article = item.article || "";
  if (article === "der") return { akkusativ: `den ${word}`, dativ: `dem ${word}` };
  if (article === "die") return { akkusativ: `die ${word}`, dativ: `der ${word}` };
  if (article === "das") return { akkusativ: `das ${word}`, dativ: `dem ${word}` };
  return { akkusativ: word, dativ: word };
}

function getPluralText(item) {
  if (item.pluralOnly) return "Sadece çoğul";
  if (!item.pluralHint) return "-";
  return item.pluralHint;
}

function renderVerbResult(item) {
  activeVerbData = getVerbConjugation(item);
  return `
    ${renderResultHeader(item, activeVerbData.infinitive)}
    <div class="verb-tabs" role="tablist">
      <button class="verb-tab is-active" type="button" data-tense="praesens">Präsens</button>
      <button class="verb-tab" type="button" data-tense="perfekt">Perfekt</button>
      <button class="verb-tab" type="button" data-tense="praeteritum">Präteritum</button>
      <button class="verb-tab" type="button" data-tense="futur1">Futur I</button>
    </div>
    <div id="conjugationOutput">${renderConjugationTable(activeVerbData.tenses.praesens)}</div>
    ${renderExample(item)}
    <p class="verb-note">Not: Bu motor A1/A2 pratik kullanım için kural + istisna mantığıyla çalışır.</p>`;
}

function bindVerbTabs() {
  const output = document.getElementById("conjugationOutput");
  if (!output || !activeVerbData) return;

  document.querySelectorAll(".verb-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".verb-tab").forEach(item => item.classList.remove("is-active"));
      tab.classList.add("is-active");
      output.innerHTML = renderConjugationTable(activeVerbData.tenses[tab.dataset.tense]);
    });
  });
}

function renderConjugationTable(forms) {
  if (!forms) return `<div class="empty-state"><strong>Bu zaman için veri yok.</strong><span>Bu fiile manuel istisna eklenebilir.</span></div>`;
  return `<div class="conjugation-table">${PRONOUNS.map(([key, label]) => `<div class="conj-row"><span>${label}</span><strong>${escapeHtml(forms[key] || "-")}</strong></div>`).join("")}</div>`;
}

function getVerbConjugation(item) {
  const infinitive = cleanInfinitive(item.word);
  const meta = getVerbMeta(item, infinitive);
  return {
    infinitive,
    meaning: item.tr,
    meta,
    tenses: {
      praesens: applyVerbDecorations(conjugatePraesens(meta.base), meta),
      perfekt: conjugatePerfekt(meta),
      praeteritum: applyVerbDecorations(conjugatePraeteritum(meta.base), meta),
      futur1: conjugateFutur1(meta)
    }
  };
}

function cleanInfinitive(word) {
  return String(word || "").replace(/\(sich\)/gi, "").replace(/^sich\s+/i, "").trim();
}

function getVerbMeta(item, infinitive) {
  const raw = String(item.raw || "");
  const parts = raw.split(",").map(p => p.trim());
  const thirdPart = parts[1] || "";
  const perfektPart = parts.find(part => /\b(hat|ist)\b/i.test(part)) || "";
  const thirdWords = thirdPart.split(/\s+/);
  const possiblePrefix = thirdWords.length > 1 ? thirdWords[thirdWords.length - 1] : null;
  const inferredPrefix = possiblePrefix && COMMON_SEPARABLE_PREFIXES.includes(possiblePrefix) ? possiblePrefix : null;
  const prefix = inferredPrefix || detectSeparablePrefix(infinitive);
  const base = prefix ? infinitive.slice(prefix.length) : infinitive;
  const auxFromRaw = /\bist\b/i.test(perfektPart) ? "sein" : /\bhat\b/i.test(perfektPart) ? "haben" : null;
  const partizipFromRaw = perfektPart.replace(/\b(hat|ist)\b/i, "").trim() || null;
  const partizipOverride = PARTIZIP_OVERRIDES[base] || PARTIZIP_OVERRIDES[normalizeGerman(base)];

  return {
    infinitive,
    base,
    prefix,
    reflexive: Boolean(item.reflexive) || /\bsich\b/i.test(String(item.word || item.raw || "")),
    auxiliary: auxFromRaw || partizipOverride?.auxiliary || guessAuxiliary(infinitive),
    partizip2: partizipFromRaw || buildPartizip2(base, prefix),
    item
  };
}

function detectSeparablePrefix(infinitive) {
  const found = COMMON_SEPARABLE_PREFIXES
    .filter(prefix => infinitive.startsWith(prefix) && infinitive.length > prefix.length + 3)
    .sort((a, b) => b.length - a.length)[0];
  if (!found) return null;
  const base = infinitive.slice(found.length);
  if (!base.endsWith("en") && !base.endsWith("n")) return null;
  return found;
}

function conjugatePraesens(base) {
  return PRESENT_OVERRIDES[base] || PRESENT_OVERRIDES[normalizeGerman(base)] || conjugateRegularPraesens(base);
}

function conjugateRegularPraesens(infinitive) {
  const stem = getVerbStem(infinitive);
  const needsE = /(?:t|d|chn|ffn|gn|tm|dm)$/.test(stem);
  const sSound = /(?:s|z|x|ß|ss)$/.test(stem);

  if (infinitive.endsWith("eln")) {
    const ichStem = stem.slice(0, -1);
    return { ich: `${ichStem}le`, du: `${stem}st`, er_sie_es: `${stem}t`, wir: infinitive, ihr: `${stem}t`, sie_Sie: infinitive };
  }

  return {
    ich: `${stem}e`,
    du: `${stem}${sSound ? "t" : needsE ? "est" : "st"}`,
    er_sie_es: `${stem}${needsE ? "et" : "t"}`,
    wir: infinitive,
    ihr: `${stem}${needsE ? "et" : "t"}`,
    sie_Sie: infinitive
  };
}

function conjugatePraeteritum(base) {
  const override = PRAETERITUM_OVERRIDES[base] || PRAETERITUM_OVERRIDES[normalizeGerman(base)];
  if (override) return override;
  const stem = getVerbStem(base);
  const needsE = /(?:t|d)$/.test(stem);
  return {
    ich: `${stem}${needsE ? "ete" : "te"}`,
    du: `${stem}${needsE ? "etest" : "test"}`,
    er_sie_es: `${stem}${needsE ? "ete" : "te"}`,
    wir: `${stem}${needsE ? "eten" : "ten"}`,
    ihr: `${stem}${needsE ? "etet" : "tet"}`,
    sie_Sie: `${stem}${needsE ? "eten" : "ten"}`
  };
}

function conjugatePerfekt(meta) {
  const aux = AUXILIARY_FORMS[meta.auxiliary] || AUXILIARY_FORMS.haben;
  return Object.fromEntries(PRONOUNS.map(([key]) => {
    const reflexive = meta.reflexive ? `${REFLEXIVE_FORMS[key]} ` : "";
    return [key, `${aux[key]} ${reflexive}${meta.partizip2}`];
  }));
}

function conjugateFutur1(meta) {
  return Object.fromEntries(PRONOUNS.map(([key]) => {
    const reflexive = meta.reflexive ? `${REFLEXIVE_FORMS[key]} ` : "";
    return [key, `${WERDEN_FORMS[key]} ${reflexive}${meta.infinitive}`];
  }));
}

function applyVerbDecorations(forms, meta) {
  return Object.fromEntries(PRONOUNS.map(([key]) => {
    let value = forms[key];
    if (meta.reflexive) {
      const parts = value.split(" ");
      value = `${parts[0]} ${REFLEXIVE_FORMS[key]}${parts.length > 1 ? " " + parts.slice(1).join(" ") : ""}`;
    }
    if (meta.prefix) value = `${value} ${meta.prefix}`;
    return [key, value];
  }));
}

function getVerbStem(infinitive) {
  if (infinitive.endsWith("ieren")) return infinitive.slice(0, -2);
  if (infinitive.endsWith("eln") || infinitive.endsWith("ern")) return infinitive.slice(0, -1);
  if (infinitive.endsWith("en")) return infinitive.slice(0, -2);
  if (infinitive.endsWith("n")) return infinitive.slice(0, -1);
  return infinitive;
}

function buildPartizip2(base, prefix) {
  const override = PARTIZIP_OVERRIDES[base] || PARTIZIP_OVERRIDES[normalizeGerman(base)];
  if (override) return prefix ? `${prefix}${override.partizip2}` : override.partizip2;
  const stem = getVerbStem(base);
  if (base.endsWith("ieren")) return `${stem}t`;
  const hasInseparable = INSEPARABLE_PREFIXES.some(p => base.startsWith(p));
  const regularPartizip = `${hasInseparable ? "" : "ge"}${stem}t`;
  return prefix ? `${prefix}${regularPartizip}` : regularPartizip;
}

function guessAuxiliary(infinitive) {
  const movement = ["gehen", "kommen", "fahren", "laufen", "fliegen", "reisen", "bleiben", "fallen", "aufstehen", "ankommen", "aussteigen", "einsteigen"];
  return movement.includes(infinitive) ? "sein" : "haben";
}


function initReading() {
  document.querySelectorAll("[data-reading-level]").forEach(button => {
    button.addEventListener("click", () => {
      currentStoryLevel = button.dataset.readingLevel;
      renderStoryList(currentStoryLevel);
    });
  });

  const backButton = document.getElementById("backToStories");
  if (backButton) {
    backButton.addEventListener("click", () => {
      document.getElementById("readerCard")?.classList.add("hidden");
      document.getElementById("storyList")?.classList.remove("hidden");
    });
  }

  document.addEventListener("click", event => {
    const clickedWord = event.target.closest(".reader-word");

    document.querySelectorAll(".reader-word.is-visible").forEach(word => {
      if (word !== clickedWord) word.classList.remove("is-visible");
    });

    if (clickedWord) clickedWord.classList.toggle("is-visible");
  });
}

function renderStoryList(level) {
  const storyList = document.getElementById("storyList");
  const readerCard = document.getElementById("readerCard");
  if (!storyList || !readerCard) return;

  const allStories = getStoriesData();
  const stories = allStories.filter(story => story.level === level);
  readerCard.classList.add("hidden");
  storyList.classList.remove("hidden");

  storyList.innerHTML = stories.map(story => `
    <button type="button" class="story-card" data-story-id="${escapeHtml(story.id)}">
      <span>${escapeHtml(story.title)}</span>
      <small>${escapeHtml(story.topic || `${story.level} okuma`)}</small>
      <div class="story-meta"><em>${story.level}</em><em>${story.minutes} dk</em><em>${story.words} kelime</em></div>
    </button>
  `).join("");

  storyList.querySelectorAll("[data-story-id]").forEach(button => {
    button.addEventListener("click", () => openStory(button.dataset.storyId));
  });
}

function openStory(storyId) {
  const story = getStoriesData().find(item => item.id === storyId);
  if (!story) return;

  document.getElementById("storyList")?.classList.add("hidden");
  document.getElementById("readerCard")?.classList.remove("hidden");
  document.getElementById("readerMeta").innerHTML = `<em>${story.level}</em><em>${escapeHtml(story.topic || `${story.level} okuma`)}</em><em>${story.minutes} dk</em><em>${story.words} kelime</em>`;
  document.getElementById("readerTitle").textContent = story.title;

  if (story.text) {
    document.getElementById("readerText").innerHTML = annotateStoryText(story.text);
    return;
  }

  document.getElementById("readerText").innerHTML = (story.tokens || []).map(token => {
    if (typeof token === "string") return escapeHtml(token);
    const tooltipLines = [token.de, token.tr];
    return createReaderWordMarkup(token.de, tooltipLines, false);
  }).join("");
}

function initGame() {
  document.querySelectorAll("[data-game-level]").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-game-level]").forEach(btn => btn.classList.remove("is-active"));
      button.classList.add("is-active");
      currentGameLevel = button.dataset.gameLevel;
      resetStreak();
      setNewGameWord();
    });
  });

  document.querySelectorAll("[data-game-mode]").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-game-mode]").forEach(btn => btn.classList.remove("is-active"));
      button.classList.add("is-active");
      currentGameMode = button.dataset.gameMode;
      resetStreak();
      setNewGameWord();
    });
  });

  document.getElementById("randomWordBtn")?.addEventListener("click", setNewGameWord);
  document.getElementById("guessBtn")?.addEventListener("click", checkGameAnswer);
  document.getElementById("guessInput")?.addEventListener("keydown", event => {
    if (event.key === "Enter") checkGameAnswer();
  });
}

function prepareFirstGameWord() {
  if (!currentGameWord && dictionaryData.length) setNewGameWord();
}

function getGamePool(mode = currentGameMode) {
  let pool = dictionaryData.filter(item => item.tr && item.word);
  if (currentGameLevel !== "ALL") pool = pool.filter(item => item.level === currentGameLevel || item.level === "A1/A2");
  if (mode === "article") pool = pool.filter(item => item.pos === "noun" && ["der", "die", "das"].includes(item.article));
  else pool = pool.filter(item => item.tr && item.tr.length > 1);
  return pool;
}

function setNewGameWord() {
  const effectiveMode = currentGameMode === "mixed" ? (Math.random() > 0.5 ? "meaning" : "article") : currentGameMode;
  const pool = getGamePool(effectiveMode);
  if (!pool.length) return;

  currentGameWord = { ...pool[Math.floor(Math.random() * pool.length)], gameMode: effectiveMode };
  activeArticleChoice = null;
  renderGameQuestion();
  focusGameInput();
}

function focusGameInput() {
  setTimeout(() => {
    const input = document.getElementById("guessInput");
    if (input) {
      input.focus();
      input.select();
    }
  }, 50);
}

function renderGameQuestion() {
  const wordEl = document.getElementById("gameWord");
  const hintEl = document.getElementById("gameHint");
  const directionEl = document.getElementById("gameDirection");
  const answerArea = document.getElementById("answerArea");
  const resultEl = document.getElementById("gameResult");
  if (!wordEl || !hintEl || !directionEl || !answerArea || !resultEl) return;

  resultEl.textContent = "";
  resultEl.className = "game-feedback";

  if (currentGameWord.gameMode === "article") {
    directionEl.textContent = "Artikel Tahmini";
    wordEl.textContent = currentGameWord.word;
    hintEl.textContent = currentGameWord.tr ? `Anlam: ${currentGameWord.tr}` : "Bu kelimenin artikelini seç.";
    answerArea.innerHTML = `<div class="article-options"><button type="button" class="article-option" data-article-choice="der">der</button><button type="button" class="article-option" data-article-choice="die">die</button><button type="button" class="article-option" data-article-choice="das">das</button></div>`;
    answerArea.querySelectorAll("[data-article-choice]").forEach(button => {
      button.addEventListener("click", () => {
        activeArticleChoice = button.dataset.articleChoice;
        answerArea.querySelectorAll(".article-option").forEach(btn => btn.classList.remove("is-selected"));
        button.classList.add("is-selected");
        checkGameAnswer();
      });
    });
    return;
  }

  directionEl.textContent = "Almanca → Türkçe";
  wordEl.textContent = getGermanDisplay(currentGameWord);
  hintEl.textContent = `${currentGameWord.level || "A1/A2"} kelime`;
  answerArea.innerHTML = `<input type="text" id="guessInput" placeholder="Türkçesini yaz ve Enter’a bas..." autocomplete="off" />`;
  document.getElementById("guessInput").addEventListener("keydown", event => {
    if (event.key === "Enter") checkGameAnswer();
  });
}

function checkGameAnswer() {
  if (!currentGameWord) return;

  if (currentGameWord.gameMode === "article") {
    if (!activeArticleChoice) return;
    const correct = activeArticleChoice === currentGameWord.article;
    const correctText = `${currentGameWord.article} ${currentGameWord.word}`;
    const meaningText = currentGameWord.tr ? ` — ${currentGameWord.tr}` : "";
    showGameResult(correct, correct ? `Doğru: ${correctText}${meaningText}` : `Yanlış. Doğrusu: ${correctText}${meaningText}`);
    return;
  }

  const input = document.getElementById("guessInput");
  const guess = normalizeAnswer(input?.value || "");
  const answers = getAcceptedAnswers(currentGameWord.tr);
  const correct = answers.some(answer => {
    const cleanAnswer = normalizeAnswer(answer);
    return guess === cleanAnswer || cleanAnswer.includes(guess) || guess.includes(cleanAnswer);
  });

  showGameResult(correct, correct ? `Doğru: ${currentGameWord.tr}` : `Yanlış. Doğrusu: ${currentGameWord.tr}`);
}

function showGameResult(correct, message) {
  const result = document.getElementById("gameResult");
  if (!result) return;

  if (correct) {
    streak++;
    result.textContent = message || "Doğru.";
    result.className = "game-feedback success";
  } else {
    streak = 0;
    result.textContent = message;
    result.className = "game-feedback error";
  }

  const streakEl = document.getElementById("streakCount");
  if (streakEl) streakEl.textContent = String(streak);
}

function resetStreak() {
  streak = 0;
  const streakEl = document.getElementById("streakCount");
  if (streakEl) streakEl.textContent = "0";
}

function getAcceptedAnswers(text) {
  return String(text || "").split(/[,;/]| veya | ya da /gi).map(item => item.trim()).filter(Boolean);
}

function getGermanDisplay(item) {
  if (item.pos === "noun" && item.article) return `${item.article} ${item.word}`;
  return item.word;
}


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
  möchte:'istiyorum', möchten:'istemek', muss:'zorunda', müssen:'zorunda olmak', kann:'yapabilir', können:'yapabilmek', soll:'-meli', sollen:'-meli/-malı', will:'istiyor', wollen:'istemek',

  mein:'benim', meine:'benim', meinen:'benim', meinem:'benim', meiner:'benim', meines:'benim',
  dein:'senin', deine:'senin', deinen:'senin', deinem:'senin', deiner:'senin', deines:'senin',
  sein:'onun', seine:'onun', seinen:'onun', seinem:'onun', seiner:'onun', seines:'onun',
  unser:'bizim', unsere:'bizim', unseren:'bizim', unserem:'bizim', unserer:'bizim', unseres:'bizim',
  dieser:'bu', diese:'bu', dieses:'bu', diesen:'bu', diesem:'bu',
  jeder:'her', jede:'her', jedes:'her', jeden:'her', jedem:'her',
  alle:'tümü/hepsi', alles:'her şey', andere:'diğer', anderen:'diğer',
  darf:'izinli/yapabilir', dürfen:'izinli olmak', mag:'sever', mögen:'sevmek', wird:'olacak/edilir', werden:'olmak',
  gibt:'verir/var', dazu:'buna ek olarak', darauf:'bunun üzerine', dorthin:'oraya', hause:'ev(e)', vom:'-den/-dan', beim:'-de/-da',
  ungefähr:'yaklaşık', etwa:'yaklaşık', minuten:'dakika', jahre:'yıl', monaten:'ay',

};

function getStoriesData() {
  return Array.isArray(window.STORIES_DATA) ? window.STORIES_DATA : STORIES;
}

function getGrammarData() {
  return Array.isArray(window.GRAMMAR_HAPS) ? window.GRAMMAR_HAPS : [];
}

function buildStoryWordLookup() {
  storyWordLookup = new Map();

  dictionaryData.forEach(item => {
    if (!item || !item.word || !item.tr) return;

    const forms = [
      item.word,
      item.key,
      item.id,
      ...(Array.isArray(item.aliases) ? item.aliases : [])
    ].filter(Boolean);

    forms.forEach(form => {
      const normalized = normalizeGerman(String(form));
      if (normalized && !storyWordLookup.has(normalized)) {
        storyWordLookup.set(normalized, item);
      }
    });
  });
}

function findStoryWord(token) {
  const clean = String(token || "")
    .replace(/[„“”"'’‘()]/g, "")
    .trim();

  if (!clean) return null;

  const normalized = normalizeGerman(clean);
  if (storyWordLookup.has(normalized)) {
    return storyWordLookup.get(normalized);
  }

  const guesses = guessGermanBaseForms(clean.toLocaleLowerCase("de-DE"));
  for (const guess of guesses) {
    const normalizedGuess = normalizeGerman(guess);
    if (storyWordLookup.has(normalizedGuess)) {
      return storyWordLookup.get(normalizedGuess);
    }
  }

  return null;
}

function getStoryWordInfo(token) {
  const clean = String(token || "").trim();
  const entry = findStoryWord(clean);

  if (entry) {
    const lemma = entry.article
      ? `${entry.article} ${entry.word}`
      : entry.word;

    const lines = [clean];

    if (normalizeGerman(lemma) !== normalizeGerman(clean)) {
      lines.push(`→ ${lemma}`);
    }

    lines.push(entry.tr);

    if (entry.plural) {
      lines.push(`Çoğul: die ${entry.plural}`);
    } else if (entry.pluralHint && entry.pos === "noun") {
      lines.push(`Çoğul ipucu: ${entry.pluralHint}`);
    }

    const typeLabel = getStoryPosLabel(entry.pos);
    if (typeLabel || entry.level) {
      lines.push([typeLabel, entry.level].filter(Boolean).join(" · "));
    }

    return {
      tooltip: lines.join("\n"),
      missing: false
    };
  }

  const fallback = STORY_FALLBACK_TR[clean.toLocaleLowerCase("de-DE")];
  if (fallback) {
    return {
      tooltip: `${clean}\n${fallback}`,
      missing: false
    };
  }

  return {
    tooltip: `${clean}\nSözlükte henüz bulunmuyor`,
    missing: true
  };
}

function getStoryPosLabel(pos) {
  const labels = {
    noun: "İsim",
    verb: "Fiil",
    adjective: "Sıfat",
    adverb: "Zarf",
    preposition: "Edat",
    conjunction: "Bağlaç",
    pronoun: "Zamir",
    phrase: "Kalıp ifade",
    other: "Kelime"
  };

  return labels[pos] || "";
}

function guessGermanBaseForms(word) {
  const w = word.replace(/[.,!?;:]/g, "");
  const guesses = new Set([w]);

  // Yaygın fiil çekimleri.
  if (w.endsWith("e")) guesses.add(`${w}n`);
  if (w.endsWith("st")) guesses.add(`${w.slice(0, -2)}en`);
  if (w.endsWith("t")) guesses.add(`${w.slice(0, -1)}en`);
  if (w.endsWith("te")) guesses.add(`${w.slice(0, -2)}en`);
  if (w.endsWith("ten")) guesses.add(`${w.slice(0, -3)}en`);

  // Sıfat çekimleri: klein, kleine, kleinen, kleiner, kleines, kleinem.
  ["en", "em", "er", "es", "e"].forEach(ending => {
    if (w.length > ending.length + 2 && w.endsWith(ending)) {
      guesses.add(w.slice(0, -ending.length));
    }
  });

  // Basit çoğul ve hâl biçimleri. Yalnız sözlükte karşılığı varsa kullanılır.
  ["en", "er", "e", "n", "s"].forEach(ending => {
    if (w.length > ending.length + 2 && w.endsWith(ending)) {
      guesses.add(w.slice(0, -ending.length));
    }
  });

  // Umlautlu çoğullarda olası tekil kökü dene.
  const withoutUmlaut = w.replaceAll("ä", "a").replaceAll("ö", "o").replaceAll("ü", "u");
  guesses.add(withoutUmlaut);
  ["en", "er", "e", "n"].forEach(ending => {
    if (withoutUmlaut.length > ending.length + 2 && withoutUmlaut.endsWith(ending)) {
      guesses.add(withoutUmlaut.slice(0, -ending.length));
    }
  });

  const knownForms = {
    bin: "sein", bist: "sein", ist: "sein", sind: "sein", seid: "sein",
    war: "sein", waren: "sein", gewesen: "sein", wird: "werden",
    habe: "haben", hast: "haben", hat: "haben", hatte: "haben", hatten: "haben", gehabt: "haben",
    gehe: "gehen", gehst: "gehen", geht: "gehen", ging: "gehen", gingen: "gehen", gegangen: "gehen",
    komme: "kommen", kommst: "kommen", kommt: "kommen", kam: "kommen", kamen: "kommen", gekommen: "kommen",
    mache: "machen", machst: "machen", macht: "machen", machte: "machen", gemacht: "machen",
    gibt: "geben", gebe: "geben", gibst: "geben", gab: "geben", gegeben: "geben",
    esse: "essen", isst: "essen", frisst: "fressen", aß: "essen", gegessen: "essen",
    trinke: "trinken", trinkst: "trinken", trinkt: "trinken", trank: "trinken", getrunken: "trinken",
    sehe: "sehen", siehst: "sehen", sieht: "sehen", sah: "sehen", gesehen: "sehen",
    finde: "finden", findest: "finden", findet: "finden", fand: "finden", gefunden: "finden",
    läuft: "laufen", lief: "laufen", gelaufen: "laufen",
    schläft: "schlafen", schlief: "schlafen", geschlafen: "schlafen",
    fährt: "fahren", fuhr: "fahren", gefahren: "fahren",
    spricht: "sprechen", sprach: "sprechen", gesprochen: "sprechen",
    nimmt: "nehmen", nahm: "nehmen", genommen: "nehmen",
    trifft: "treffen", traf: "treffen", getroffen: "treffen",
    lässt: "lassen", ließ: "lassen", gelassen: "lassen",
    hält: "halten", hielt: "halten", gehalten: "halten",
    mag: "mögen", mochte: "mögen", gemocht: "mögen",
    darf: "dürfen", durfte: "dürfen", gedurft: "dürfen",
    muss: "müssen", musste: "müssen", gemusst: "müssen",
    kann: "können", konnte: "können", gekonnt: "können",
    soll: "sollen", sollte: "sollen", gesollt: "sollen",
    will: "wollen", wollte: "wollen", gewollt: "wollen",
    gespielt: "spielen", gelernt: "lernen", gekauft: "kaufen", gelacht: "lachen",
    geübt: "üben", gefrühstückt: "frühstücken", entspannt: "entspannen",
    aufgestanden: "aufstehen", kennengelernt: "kennenlernen", gesprochen: "sprechen",
    geschmolzen: "schmelzen", geschnitten: "schneiden", gebacken: "backen",
    brauche: "brauchen", brauchst: "brauchen", braucht: "brauchen",
    nehme: "nehmen", wohnst: "wohnen", wohnt: "wohnen", wohne: "wohnen",
    erkläre: "erklären", erklärt: "erklären", lege: "legen", legt: "legen",
    schneide: "schneiden", fühlt: "fühlen", fühle: "fühlen",
    frisst: "fressen", fraß: "fressen", stehe: "stehen", treffe: "treffen",
    bedeutet: "bedeuten", mischt: "mischen", berührt: "berühren",
    felder: "feld", figuren: "figur", zutaten: "zutat", punkte: "punkt",
    möglichkeiten: "möglichkeit", ländern: "land", türme: "turm", bauern: "bauer",
    bester: "gut", besten: "gut", besser: "gut", liebsten: "gern", schöner: "schön"
  };

  if (knownForms[w]) guesses.add(knownForms[w]);
  return [...guesses];
}

function createReaderWordMarkup(surface, lines, missing = false) {
  const safeLines = (lines || []).filter(Boolean).map((line, index) => {
    const tag = index === 0 ? "strong" : "span";
    return `<${tag}>${escapeHtml(String(line))}</${tag}>`;
  }).join("");

  return `<span class="reader-word${missing ? " is-missing" : ""}" tabindex="0">${escapeHtml(surface)}<span class="reader-tooltip" role="tooltip">${safeLines}</span></span>`;
}

function annotateStoryText(text) {
  return escapeHtml(text)
    .replace(/([A-Za-zÄÖÜäöüß]+(?:-[A-Za-zÄÖÜäöüß]+)?)/g, match => {
      const info = getStoryWordInfo(match);
      const lines = String(info.tooltip || "")
        .replace(/<br\s*\/?>/gi, "\n")
        .replace(/\r\n?/g, "\n")
        .split("\n")
        .map(line => line.trim())
        .filter(Boolean);

      return createReaderWordMarkup(match, lines, info.missing);
    })
    .replace(/\n/g, "<br>");
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

function initCopyButtons() {
  document.querySelectorAll("[data-copy]").forEach(button => {
    button.addEventListener("click", async () => {
      const original = button.textContent;
      const text = button.dataset.copy;
      try {
        await navigator.clipboard.writeText(text);
        button.textContent = "Kopyalandı";
      } catch (error) {
        button.textContent = "Kopyalanamadı";
      }
      setTimeout(() => { button.textContent = original; }, 1200);
    });
  });
}

function initTheme() {
  const themeToggle = document.getElementById("themeToggle");
  if (!themeToggle) return;

  const savedTheme = localStorage.getItem("theme");
  if (savedTheme) {
    document.documentElement.setAttribute("data-theme", savedTheme);
    themeToggle.textContent = savedTheme === "dark" ? "Gündüz Modu" : "Gece Modu";
  }

  themeToggle.addEventListener("click", () => {
    const isDark = document.documentElement.getAttribute("data-theme") === "dark";
    const next = isDark ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
    themeToggle.textContent = next === "dark" ? "Gündüz Modu" : "Gece Modu";
  });
}


/* ==========================================================
   BIG UPDATE 5
   - Reading progress stored in localStorage
   - Completed story controls
   - Grammar search and category filters
   ========================================================== */

const READING_PROGRESS_KEY = "almancaAskinaReadingProgressV1";

function getReadingProgress() {
  try {
    const value = JSON.parse(localStorage.getItem(READING_PROGRESS_KEY) || "[]");
    return new Set(Array.isArray(value) ? value : []);
  } catch (error) {
    return new Set();
  }
}

function saveReadingProgress(progress) {
  localStorage.setItem(READING_PROGRESS_KEY, JSON.stringify([...progress]));
}

function isStoryCompleted(storyId) {
  return getReadingProgress().has(storyId);
}

function toggleStoryCompleted(storyId) {
  const progress = getReadingProgress();
  if (progress.has(storyId)) progress.delete(storyId);
  else progress.add(storyId);
  saveReadingProgress(progress);
  updateReaderCompleteButton(storyId);
  if (currentStoryLevel) renderStoryList(currentStoryLevel);
}

function updateReaderCompleteButton(storyId) {
  const button = document.getElementById("storyCompleteButton");
  if (!button) return;
  const completed = isStoryCompleted(storyId);
  button.classList.toggle("is-completed", completed);
  button.setAttribute("aria-pressed", String(completed));
  button.textContent = completed ? "✓ Tamamlandı" : "Okudum, tamamla";
}

function getLevelProgress(level) {
  const stories = getStoriesData().filter(story => story.level === level);
  const progress = getReadingProgress();
  const completed = stories.filter(story => progress.has(story.id)).length;
  return { completed, total: stories.length };
}

function renderStoryList(level) {
  const storyList = document.getElementById("storyList");
  const readerCard = document.getElementById("readerCard");
  if (!storyList || !readerCard) return;

  const stories = getStoriesData().filter(story => story.level === level);
  const levelProgress = getLevelProgress(level);

  readerCard.classList.add("hidden");
  storyList.classList.remove("hidden");

  storyList.innerHTML = `
    <div class="reading-progress-card">
      <div>
        <strong>${escapeHtml(level)} okuma ilerlemesi</strong>
        <span>${levelProgress.completed} / ${levelProgress.total} hikâye tamamlandı</span>
      </div>
      <div class="reading-progress-track" aria-hidden="true">
        <span style="width:${levelProgress.total ? Math.round(levelProgress.completed / levelProgress.total * 100) : 0}%"></span>
      </div>
    </div>
    <div class="story-list-grid">
      ${stories.map(story => {
        const completed = isStoryCompleted(story.id);
        return `
          <button type="button" class="story-card ${completed ? "is-completed" : ""}" data-story-id="${escapeHtml(story.id)}">
            <span>${completed ? "✓ " : ""}${escapeHtml(story.title)}</span>
            <small>${escapeHtml(story.topic || `${story.level} okuma`)}</small>
            <div class="story-meta">
              <em>${story.level}</em>
              <em>${story.minutes} dk</em>
              <em>${story.words} kelime</em>
              ${completed ? "<em>Tamamlandı</em>" : ""}
            </div>
          </button>
        `;
      }).join("")}
    </div>
  `;

  storyList.querySelectorAll("[data-story-id]").forEach(button => {
    button.addEventListener("click", () => openStory(button.dataset.storyId));
  });
}

function openStory(storyId) {
  const story = getStoriesData().find(item => item.id === storyId);
  if (!story) return;

  document.getElementById("storyList")?.classList.add("hidden");
  document.getElementById("readerCard")?.classList.remove("hidden");

  const meta = document.getElementById("readerMeta");
  if (meta) {
    meta.innerHTML = `
      <em>${story.level}</em>
      <em>${escapeHtml(story.topic || `${story.level} okuma`)}</em>
      <em>${story.minutes} dk</em>
      <em>${story.words} kelime</em>
      <button type="button" class="story-complete-btn" id="storyCompleteButton" aria-pressed="false"></button>
    `;
  }

  document.getElementById("readerTitle").textContent = story.title;
  updateReaderCompleteButton(story.id);

  document.getElementById("storyCompleteButton")?.addEventListener("click", () => {
    toggleStoryCompleted(story.id);
  });

  if (story.text) {
    document.getElementById("readerText").innerHTML = annotateStoryText(story.text);
    return;
  }

  document.getElementById("readerText").innerHTML = (story.tokens || []).map(token => {
    if (typeof token === "string") return escapeHtml(token);
    return createReaderWordMarkup(token.de, [token.de, token.tr], false);
  }).join("");
}

let activeGrammarCategory = "Tümü";
let grammarSearchQuery = "";

function normalizeGrammarSearch(value) {
  return String(value || "")
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function getFilteredGrammarData() {
  const query = normalizeGrammarSearch(grammarSearchQuery);
  return getGrammarData().filter(item => {
    const categoryMatch = activeGrammarCategory === "Tümü" || item.category === activeGrammarCategory;
    if (!categoryMatch) return false;
    if (!query) return true;
    const searchable = normalizeGrammarSearch(JSON.stringify(item));
    return searchable.includes(query);
  });
}

function renderGrammarHaps() {
  const grid = document.getElementById("grammarGrid");
  if (!grid) return;

  const allData = getGrammarData();
  const data = getFilteredGrammarData();
  const categories = ["Tümü", ...new Set(allData.map(item => item.category).filter(Boolean))];

  grid.className = "grammar-library";
  grid.innerHTML = `
    <div class="grammar-tools">
      <label class="grammar-search-label">
        <span>Gramer konularında ara</span>
        <input type="search" id="grammarSearchInput" placeholder="Örn: Perfekt, Dativ, fiilin yeri..." value="${escapeHtml(grammarSearchQuery)}">
      </label>
      <div class="grammar-category-row">
        ${categories.map(category => `
          <button type="button" class="grammar-category-btn ${category === activeGrammarCategory ? "is-active" : ""}" data-grammar-category="${escapeHtml(category)}">
            ${escapeHtml(category)}
          </button>
        `).join("")}
      </div>
      <p class="grammar-result-count">${data.length} konu gösteriliyor</p>
    </div>

    <div class="grammar-accordion">
      ${data.length ? data.map((item, index) => `
        <article class="grammar-accordion-item ${index === 0 ? "is-open" : ""}">
          <button type="button" class="grammar-accordion-trigger">
            <div>
              <span>${escapeHtml(item.category || "Gramer")}</span>
              <strong>${escapeHtml(item.title)}</strong>
              <small>${escapeHtml(item.summary || "")}</small>
            </div>
            <b class="chevron">⌄</b>
          </button>
          <div class="grammar-accordion-content">
            ${renderGrammarContent(item)}
          </div>
        </article>
      `).join("") : `
        <div class="grammar-empty">
          <strong>Bu aramayla eşleşen konu bulunamadı.</strong>
          <span>Daha kısa bir kelimeyle tekrar deneyebilirsin.</span>
        </div>
      `}
    </div>
  `;

  document.getElementById("grammarSearchInput")?.addEventListener("input", event => {
    grammarSearchQuery = event.target.value;
    renderGrammarHaps();
    requestAnimationFrame(() => {
      const input = document.getElementById("grammarSearchInput");
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    });
  });

  grid.querySelectorAll("[data-grammar-category]").forEach(button => {
    button.addEventListener("click", () => {
      activeGrammarCategory = button.dataset.grammarCategory;
      renderGrammarHaps();
    });
  });

  grid.querySelectorAll(".grammar-accordion-trigger").forEach(trigger => {
    trigger.addEventListener("click", () => {
      trigger.closest(".grammar-accordion-item").classList.toggle("is-open");
    });
  });
}


/* ==========================================================
   BIG UPDATE 6
   1) Live dictionary suggestions + recent searches
   2) Local word notebook / favorites
   3) 10-question game sessions + wrong-answer review
   4) Story search, status filter and continue reading
   5) PWA installation and offline support
   6) Network/offline status feedback
   ========================================================== */

const FAVORITES_KEY = "almancaAskinaFavoritesV1";
const SEARCH_HISTORY_KEY = "almancaAskinaSearchHistoryV1";
const LAST_STORY_KEY = "almancaAskinaLastStoryV1";
const GAME_BEST_KEY = "almancaAskinaGameBestV1";

let storySearchQueryV6 = "";
let storyStatusFilterV6 = "all";
let deferredInstallPrompt = null;
let gameSessionV6 = null;
let gameAnswerLockedV6 = false;

function safeReadStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch (error) {
    return fallback;
  }
}

function safeWriteStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn("Tarayıcı verisi kaydedilemedi:", error);
  }
}

function getEntryStorageId(item) {
  return String(item?.id || item?.key || `${item?.word || ""}-${item?.pos || "other"}`);
}

/* ---------- SEARCH SUGGESTIONS + HISTORY ---------- */

function initSearch() {
  const form = document.getElementById("searchForm");
  const input = document.getElementById("searchInput");
  const suggestions = document.getElementById("searchSuggestions");
  if (!form || !input) return;

  form.addEventListener("submit", event => {
    event.preventDefault();
    const query = input.value.trim();
    if (query) addSearchHistory(query);
    hideSearchSuggestions();
    handleSearch(query);
  });

  input.addEventListener("input", () => {
    renderSearchSuggestions(input.value);
  });

  input.addEventListener("focus", () => {
    renderSearchSuggestions(input.value);
  });

  input.addEventListener("keydown", event => {
    const items = [...document.querySelectorAll("[data-suggestion-value]")];
    if (!items.length) return;

    const active = document.querySelector(".search-suggestion.is-active");
    let index = active ? items.indexOf(active) : -1;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      index = (index + 1) % items.length;
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      index = (index - 1 + items.length) % items.length;
    } else if (event.key === "Enter" && active) {
      event.preventDefault();
      chooseSearchSuggestion(active.dataset.suggestionValue);
      return;
    } else if (event.key === "Escape") {
      hideSearchSuggestions();
      return;
    } else {
      return;
    }

    items.forEach(item => item.classList.remove("is-active"));
    items[index]?.classList.add("is-active");
    items[index]?.scrollIntoView({ block: "nearest" });
  });

  document.addEventListener("click", event => {
    if (!event.target.closest(".search-card")) hideSearchSuggestions();
  });

  document.getElementById("recentSearchesBtn")?.addEventListener("click", renderRecentSearchesDrawer);
  document.getElementById("wordNotebookBtn")?.addEventListener("click", renderWordNotebook);
  suggestions?.addEventListener("mousedown", event => event.preventDefault());

  updateFavoriteCount();
}

function getSearchSuggestions(query) {
  const germanQuery = normalizeGerman(query);
  const turkishQuery = normalizeAnswer(query);
  if (!germanQuery && !turkishQuery) {
    return getSearchHistory().map(value => ({
      type: "history",
      label: value,
      sublabel: "Son arama",
      value
    }));
  }

  return dictionaryData
    .filter(item => item?.word && item?.tr)
    .map(item => {
      const german = normalizeGerman(item.word);
      const raw = normalizeGerman(item.raw);
      const translation = normalizeAnswer(item.tr);
      let score = 0;

      if (german === germanQuery) score = 120;
      else if (german.startsWith(germanQuery)) score = 100;
      else if (raw.startsWith(germanQuery)) score = 85;
      else if (german.includes(germanQuery)) score = 70;

      if (translation === turkishQuery) score = Math.max(score, 115);
      else if (turkishQuery && translation.startsWith(turkishQuery)) score = Math.max(score, 90);
      else if (turkishQuery && translation.includes(turkishQuery)) score = Math.max(score, 65);

      return { item, score };
    })
    .filter(result => result.score > 0)
    .sort((a, b) => b.score - a.score || a.item.word.localeCompare(b.item.word, "de"))
    .slice(0, 8)
    .map(result => ({
      type: "word",
      label: getGermanDisplay(result.item),
      sublabel: result.item.tr,
      meta: `${result.item.level || "A1/A2"} · ${getPosLabel(result.item.pos)}`,
      value: result.item.word
    }));
}

function renderSearchSuggestions(query) {
  const box = document.getElementById("searchSuggestions");
  if (!box || !dictionaryData.length) return;

  const suggestions = getSearchSuggestions(query);
  if (!suggestions.length) {
    hideSearchSuggestions();
    return;
  }

  box.innerHTML = suggestions.map((suggestion, index) => `
    <button type="button" class="search-suggestion${index === 0 ? " is-active" : ""}" role="option"
      data-suggestion-value="${escapeHtml(suggestion.value)}">
      <span>
        <strong>${escapeHtml(suggestion.label)}</strong>
        <small>${escapeHtml(suggestion.sublabel || "")}</small>
      </span>
      ${suggestion.meta ? `<em>${escapeHtml(suggestion.meta)}</em>` : ""}
    </button>
  `).join("");

  box.classList.remove("hidden");
  box.querySelectorAll("[data-suggestion-value]").forEach(button => {
    button.addEventListener("click", () => chooseSearchSuggestion(button.dataset.suggestionValue));
  });
}

function chooseSearchSuggestion(value) {
  const input = document.getElementById("searchInput");
  if (input) input.value = value;
  addSearchHistory(value);
  hideSearchSuggestions();
  handleSearch(value);
}

function hideSearchSuggestions() {
  document.getElementById("searchSuggestions")?.classList.add("hidden");
}

function getSearchHistory() {
  const history = safeReadStorage(SEARCH_HISTORY_KEY, []);
  return Array.isArray(history) ? history.slice(0, 8) : [];
}

function addSearchHistory(query) {
  const clean = String(query || "").trim();
  if (!clean) return;
  const history = getSearchHistory().filter(item => normalizeAnswer(item) !== normalizeAnswer(clean));
  history.unshift(clean);
  safeWriteStorage(SEARCH_HISTORY_KEY, history.slice(0, 8));
}

function renderRecentSearchesDrawer() {
  const drawer = document.getElementById("dictionaryDrawer");
  if (!drawer) return;

  if (!drawer.classList.contains("hidden") && drawer.dataset.view === "history") {
    drawer.classList.add("hidden");
    return;
  }

  const history = getSearchHistory();
  drawer.dataset.view = "history";
  drawer.innerHTML = `
    <div class="drawer-head">
      <div>
        <strong>Son aramalar</strong>
        <span>Bu cihazda saklanır.</span>
      </div>
      ${history.length ? '<button type="button" class="text-btn" id="clearSearchHistory">Temizle</button>' : ""}
    </div>
    ${history.length ? `
      <div class="history-chip-list">
        ${history.map(value => `<button type="button" data-history-query="${escapeHtml(value)}">${escapeHtml(value)}</button>`).join("")}
      </div>
    ` : '<div class="drawer-empty">Henüz bir arama yapmadın.</div>'}
  `;
  drawer.classList.remove("hidden");

  drawer.querySelectorAll("[data-history-query]").forEach(button => {
    button.addEventListener("click", () => chooseSearchSuggestion(button.dataset.historyQuery));
  });

  document.getElementById("clearSearchHistory")?.addEventListener("click", () => {
    safeWriteStorage(SEARCH_HISTORY_KEY, []);
    renderRecentSearchesDrawer();
  });
}

/* ---------- FAVORITES / WORD NOTEBOOK ---------- */

function getFavoriteIds() {
  const values = safeReadStorage(FAVORITES_KEY, []);
  return new Set(Array.isArray(values) ? values : []);
}

function isFavorite(item) {
  return getFavoriteIds().has(getEntryStorageId(item));
}

function toggleFavorite(item) {
  const favorites = getFavoriteIds();
  const id = getEntryStorageId(item);
  if (favorites.has(id)) favorites.delete(id);
  else favorites.add(id);
  safeWriteStorage(FAVORITES_KEY, [...favorites]);
  updateFavoriteCount();
  updateFavoriteButton(item);
}

function updateFavoriteCount() {
  const count = getFavoriteIds().size;
  const element = document.getElementById("favoriteCount");
  if (element) element.textContent = String(count);
}

function updateFavoriteButton(item) {
  const button = document.getElementById("favoriteWordBtn");
  if (!button) return;
  const saved = isFavorite(item);
  button.classList.toggle("is-saved", saved);
  button.setAttribute("aria-pressed", String(saved));
  button.textContent = saved ? "★ Defterde" : "☆ Deftere ekle";
}

function renderResultHeader(item, displayWord) {
  const article = item.article ? `<span class="article">${escapeHtml(item.article)}</span>` : "";
  const saved = isFavorite(item);
  return `
    <div class="result-top">
      <div>
        <div class="result-title">${article}<span class="word">${escapeHtml(displayWord || item.word)}</span></div>
        <p class="translation">${escapeHtml(item.tr || "Türkçe anlam kontrol edilecek")}</p>
      </div>
      <div class="result-actions">
        <div class="badge-row">
          <span class="level-badge">${escapeHtml(item.level || "A1/A2")}</span>
          <span class="pos-badge">${escapeHtml(getPosLabel(item.pos))}</span>
        </div>
        <button type="button" class="favorite-word-btn${saved ? " is-saved" : ""}" id="favoriteWordBtn"
          aria-pressed="${saved}">${saved ? "★ Defterde" : "☆ Deftere ekle"}</button>
      </div>
    </div>`;
}

function renderFoundResult(item) {
  const resultPreview = document.getElementById("resultPreview");

  if (item.pos === "verb") {
    resultPreview.innerHTML = renderVerbResult(item);
    bindVerbTabs();
  } else if (item.pos === "noun") {
    resultPreview.innerHTML = renderNounResult(item);
  } else {
    resultPreview.innerHTML = renderSimpleResult(item);
  }

  document.getElementById("favoriteWordBtn")?.addEventListener("click", () => toggleFavorite(item));
}

function renderWordNotebook() {
  const drawer = document.getElementById("dictionaryDrawer");
  if (!drawer) return;

  if (!drawer.classList.contains("hidden") && drawer.dataset.view === "favorites") {
    drawer.classList.add("hidden");
    return;
  }

  const favoriteIds = getFavoriteIds();
  const words = dictionaryData
    .filter(item => favoriteIds.has(getEntryStorageId(item)))
    .sort((a, b) => (a.level || "").localeCompare(b.level || "") || a.word.localeCompare(b.word, "de"));

  drawer.dataset.view = "favorites";
  drawer.innerHTML = `
    <div class="drawer-head">
      <div>
        <strong>Kelime Defteri</strong>
        <span>${words.length} kayıt · yalnızca bu cihazda saklanır</span>
      </div>
      ${words.length ? '<button type="button" class="text-btn" id="clearFavorites">Tümünü kaldır</button>' : ""}
    </div>
    ${words.length ? `
      <div class="notebook-list">
        ${words.map(item => `
          <div class="notebook-item">
            <button type="button" class="notebook-open" data-notebook-word="${escapeHtml(item.word)}">
              <strong>${escapeHtml(getGermanDisplay(item))}</strong>
              <span>${escapeHtml(item.tr)}</span>
              <small>${escapeHtml(item.level || "A1/A2")} · ${escapeHtml(getPosLabel(item.pos))}</small>
            </button>
            <button type="button" class="notebook-remove" aria-label="Kelimeyi defterden kaldır"
              data-remove-favorite="${escapeHtml(getEntryStorageId(item))}">×</button>
          </div>
        `).join("")}
      </div>
    ` : '<div class="drawer-empty">Sözlük sonucundaki “Deftere ekle” düğmesiyle kelime biriktirebilirsin.</div>'}
  `;
  drawer.classList.remove("hidden");

  drawer.querySelectorAll("[data-notebook-word]").forEach(button => {
    button.addEventListener("click", () => chooseSearchSuggestion(button.dataset.notebookWord));
  });

  drawer.querySelectorAll("[data-remove-favorite]").forEach(button => {
    button.addEventListener("click", () => {
      const favorites = getFavoriteIds();
      favorites.delete(button.dataset.removeFavorite);
      safeWriteStorage(FAVORITES_KEY, [...favorites]);
      updateFavoriteCount();
      renderWordNotebook();
    });
  });

  document.getElementById("clearFavorites")?.addEventListener("click", () => {
    safeWriteStorage(FAVORITES_KEY, []);
    updateFavoriteCount();
    renderWordNotebook();
  });
}

/* ---------- GAME SESSION V6 ---------- */

function initGame() {
  ensureGameSessionUI();

  document.querySelectorAll("[data-game-level]").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-game-level]").forEach(btn => btn.classList.remove("is-active"));
      button.classList.add("is-active");
      currentGameLevel = button.dataset.gameLevel;
      startGameSessionV6();
    });
  });

  document.querySelectorAll("[data-game-mode]").forEach(button => {
    button.addEventListener("click", () => {
      document.querySelectorAll("[data-game-mode]").forEach(btn => btn.classList.remove("is-active"));
      button.classList.add("is-active");
      currentGameMode = button.dataset.gameMode;
      startGameSessionV6();
    });
  });

  document.getElementById("randomWordBtn")?.addEventListener("click", () => {
    if (!gameSessionV6 || gameSessionV6.finished) startGameSessionV6();
    else setNewGameWord();
  });

  document.getElementById("guessInput")?.addEventListener("keydown", event => {
    if (event.key === "Enter") checkGameAnswer();
  });
}

function ensureGameSessionUI() {
  const toolbar = document.querySelector(".game-toolbar");
  if (toolbar && !document.getElementById("gameSessionStats")) {
    toolbar.insertAdjacentHTML("afterend", `
      <div class="game-session-stats" id="gameSessionStats">
        <span>Soru <strong id="gameQuestionCount">0/10</strong></span>
        <span>Doğru <strong id="gameCorrectCount">0</strong></span>
        <span>Yanlış <strong id="gameWrongCount">0</strong></span>
        <span>En iyi <strong id="gameBestCount">${getGameBestScoreV6()}/10</strong></span>
      </div>
    `);
  }
}

function getGameBestScoreV6() {
  const value = Number(safeReadStorage(GAME_BEST_KEY, 0));
  return Number.isFinite(value) ? value : 0;
}

function startGameSessionV6(reviewWords = null) {
  gameSessionV6 = {
    target: reviewWords?.length || 10,
    answered: 0,
    correct: 0,
    wrong: [],
    reviewQueue: Array.isArray(reviewWords) ? [...reviewWords] : null,
    finished: false,
    seen: new Set()
  };
  gameAnswerLockedV6 = false;
  resetStreak();
  updateGameSessionStatsV6();
  setNewGameWord();
}

function prepareFirstGameWord() {
  if (dictionaryData.length && !gameSessionV6) startGameSessionV6();
}

function setNewGameWord() {
  if (!dictionaryData.length) return;
  if (!gameSessionV6 || gameSessionV6.finished) {
    startGameSessionV6();
    return;
  }

  let candidate = null;
  if (gameSessionV6.reviewQueue?.length) {
    candidate = gameSessionV6.reviewQueue.shift();
  } else {
    const effectiveMode = currentGameMode === "mixed"
      ? (Math.random() > 0.5 ? "meaning" : "article")
      : currentGameMode;
    const pool = getGamePool(effectiveMode);
    const unseen = pool.filter(item => !gameSessionV6.seen.has(getEntryStorageId(item)));
    const source = unseen.length ? unseen : pool;
    if (!source.length) return;
    const item = source[Math.floor(Math.random() * source.length)];
    candidate = { ...item, gameMode: effectiveMode };
  }

  currentGameWord = { ...candidate };
  if (!currentGameWord.gameMode) {
    currentGameWord.gameMode = currentGameMode === "mixed" ? "meaning" : currentGameMode;
  }

  gameSessionV6.seen.add(getEntryStorageId(currentGameWord));
  activeArticleChoice = null;
  gameAnswerLockedV6 = false;
  renderGameQuestion();
  updateGameSessionStatsV6();
  focusGameInput();
}

function checkGameAnswer() {
  if (!currentGameWord || gameAnswerLockedV6 || !gameSessionV6 || gameSessionV6.finished) return;

  let correct = false;
  let message = "";

  if (currentGameWord.gameMode === "article") {
    if (!activeArticleChoice) return;
    correct = activeArticleChoice === currentGameWord.article;
    const correctText = `${currentGameWord.article} ${currentGameWord.word}`;
    const meaningText = currentGameWord.tr ? ` — ${currentGameWord.tr}` : "";
    message = correct ? `Doğru: ${correctText}${meaningText}` : `Yanlış. Doğrusu: ${correctText}${meaningText}`;
  } else {
    const input = document.getElementById("guessInput");
    const guess = normalizeAnswer(input?.value || "");
    if (!guess) return;
    const answers = getAcceptedAnswers(currentGameWord.tr);
    correct = answers.some(answer => {
      const cleanAnswer = normalizeAnswer(answer);
      return guess === cleanAnswer || (guess.length >= 3 && cleanAnswer.includes(guess));
    });
    message = correct ? `Doğru: ${currentGameWord.tr}` : `Yanlış. Doğrusu: ${currentGameWord.tr}`;
  }

  gameAnswerLockedV6 = true;
  showGameResult(correct, message);
}

function showGameResult(correct, message) {
  const result = document.getElementById("gameResult");
  if (!result || !gameSessionV6) return;

  gameSessionV6.answered += 1;
  if (correct) {
    streak += 1;
    gameSessionV6.correct += 1;
    result.className = "game-feedback success";
  } else {
    streak = 0;
    gameSessionV6.wrong.push({ ...currentGameWord });
    result.className = "game-feedback error";
  }

  result.textContent = message;
  document.getElementById("streakCount").textContent = String(streak);
  updateGameSessionStatsV6();

  if (gameSessionV6.answered >= gameSessionV6.target) {
    setTimeout(finishGameSessionV6, 650);
  } else {
    setTimeout(setNewGameWord, 850);
  }
}

function updateGameSessionStatsV6() {
  if (!gameSessionV6) return;
  const values = {
    gameQuestionCount: `${Math.min(gameSessionV6.answered + (gameSessionV6.finished ? 0 : 1), gameSessionV6.target)}/${gameSessionV6.target}`,
    gameCorrectCount: gameSessionV6.correct,
    gameWrongCount: gameSessionV6.wrong.length,
    gameBestCount: `${getGameBestScoreV6()}/10`
  };
  Object.entries(values).forEach(([id, value]) => {
    const element = document.getElementById(id);
    if (element) element.textContent = String(value);
  });
}

function finishGameSessionV6() {
  if (!gameSessionV6) return;
  gameSessionV6.finished = true;

  if (gameSessionV6.target === 10 && gameSessionV6.correct > getGameBestScoreV6()) {
    safeWriteStorage(GAME_BEST_KEY, gameSessionV6.correct);
  }

  const answerArea = document.getElementById("answerArea");
  const result = document.getElementById("gameResult");
  const percentage = Math.round((gameSessionV6.correct / gameSessionV6.target) * 100);

  document.getElementById("gameDirection").textContent = "Oturum tamamlandı";
  document.getElementById("gameWord").textContent = `${gameSessionV6.correct} / ${gameSessionV6.target}`;
  document.getElementById("gameHint").textContent = `%${percentage} başarı`;
  if (result) {
    result.textContent = gameSessionV6.wrong.length
      ? `${gameSessionV6.wrong.length} kelimeyi tekrar edebilirsin.`
      : "Mükemmel, bu oturumda yanlışın yok.";
    result.className = gameSessionV6.wrong.length ? "game-feedback" : "game-feedback success";
  }

  if (answerArea) {
    answerArea.innerHTML = `
      <div class="game-summary-actions">
        ${gameSessionV6.wrong.length ? '<button type="button" class="primary-mini-btn" id="reviewWrongBtn">Yanlışları tekrar et</button>' : ""}
        <button type="button" class="secondary-mini-btn" id="newSessionBtn">Yeni 10 soru</button>
      </div>
    `;
  }

  document.getElementById("reviewWrongBtn")?.addEventListener("click", () => {
    const wrong = gameSessionV6.wrong.map(item => ({ ...item }));
    startGameSessionV6(wrong);
  });
  document.getElementById("newSessionBtn")?.addEventListener("click", () => startGameSessionV6());
  updateGameSessionStatsV6();
}

/* ---------- STORY SEARCH + CONTINUE ---------- */

function getLastStoryDataV6() {
  const value = safeReadStorage(LAST_STORY_KEY, null);
  return value && typeof value === "object" ? value : null;
}

function renderStoryList(level) {
  const storyList = document.getElementById("storyList");
  const readerCard = document.getElementById("readerCard");
  if (!storyList || !readerCard) return;

  currentStoryLevel = level;
  const allStories = getStoriesData().filter(story => story.level === level);
  const progress = getReadingProgress();
  const levelProgress = getLevelProgress(level);
  const query = normalizeGrammarSearch(storySearchQueryV6);

  const stories = allStories.filter(story => {
    const searchMatch = !query || normalizeGrammarSearch(`${story.title} ${story.topic || ""} ${story.text || ""}`).includes(query);
    const completed = progress.has(story.id);
    const statusMatch =
      storyStatusFilterV6 === "all" ||
      (storyStatusFilterV6 === "completed" && completed) ||
      (storyStatusFilterV6 === "unread" && !completed);
    return searchMatch && statusMatch;
  });

  const last = getLastStoryDataV6();
  const lastStory = last?.level === level ? allStories.find(story => story.id === last.id) : null;

  readerCard.classList.add("hidden");
  storyList.classList.remove("hidden");

  storyList.innerHTML = `
    <div class="reading-progress-card">
      <div>
        <strong>${escapeHtml(level)} okuma ilerlemesi</strong>
        <span>${levelProgress.completed} / ${levelProgress.total} hikâye tamamlandı</span>
      </div>
      <div class="reading-progress-track" aria-hidden="true">
        <span style="width:${levelProgress.total ? Math.round(levelProgress.completed / levelProgress.total * 100) : 0}%"></span>
      </div>
    </div>

    ${lastStory ? `
      <button type="button" class="continue-story-card" data-continue-story="${escapeHtml(lastStory.id)}">
        <span>Kaldığın yerden devam et</span>
        <strong>${escapeHtml(lastStory.title)}</strong>
        <small>${lastStory.minutes} dk · ${lastStory.words} kelime</small>
      </button>
    ` : ""}

    <div class="story-tools">
      <label>
        <span class="sr-only">Hikâye ara</span>
        <input type="search" id="storySearchInput" placeholder="Başlık veya konu ara..." value="${escapeHtml(storySearchQueryV6)}">
      </label>
      <div class="story-filter-row">
        ${[
          ["all", "Tümü"],
          ["unread", "Okunmadı"],
          ["completed", "Tamamlandı"]
        ].map(([value, label]) => `
          <button type="button" class="${storyStatusFilterV6 === value ? "is-active" : ""}" data-story-filter="${value}">${label}</button>
        `).join("")}
      </div>
    </div>

    <p class="story-result-count">${stories.length} hikâye gösteriliyor</p>

    <div class="story-list-grid">
      ${stories.length ? stories.map(story => {
        const completed = progress.has(story.id);
        return `
          <button type="button" class="story-card ${completed ? "is-completed" : ""}" data-story-id="${escapeHtml(story.id)}">
            <span>${completed ? "✓ " : ""}${escapeHtml(story.title)}</span>
            <small>${escapeHtml(story.topic || `${story.level} okuma`)}</small>
            <div class="story-meta">
              <em>${story.level}</em>
              <em>${story.minutes} dk</em>
              <em>${story.words} kelime</em>
              ${completed ? "<em>Tamamlandı</em>" : ""}
            </div>
          </button>
        `;
      }).join("") : `
        <div class="story-empty-state">
          <strong>Eşleşen hikâye bulunamadı.</strong>
          <span>Aramayı veya filtreyi değiştirebilirsin.</span>
        </div>
      `}
    </div>
  `;

  document.getElementById("storySearchInput")?.addEventListener("input", event => {
    storySearchQueryV6 = event.target.value;
    renderStoryList(level);
    requestAnimationFrame(() => {
      const input = document.getElementById("storySearchInput");
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    });
  });

  storyList.querySelectorAll("[data-story-filter]").forEach(button => {
    button.addEventListener("click", () => {
      storyStatusFilterV6 = button.dataset.storyFilter;
      renderStoryList(level);
    });
  });

  storyList.querySelectorAll("[data-story-id]").forEach(button => {
    button.addEventListener("click", () => openStory(button.dataset.storyId));
  });

  document.querySelector("[data-continue-story]")?.addEventListener("click", event => {
    openStory(event.currentTarget.dataset.continueStory);
  });
}

function openStory(storyId) {
  const story = getStoriesData().find(item => item.id === storyId);
  if (!story) return;

  safeWriteStorage(LAST_STORY_KEY, {
    id: story.id,
    level: story.level,
    title: story.title,
    openedAt: Date.now()
  });

  document.getElementById("storyList")?.classList.add("hidden");
  document.getElementById("readerCard")?.classList.remove("hidden");

  const meta = document.getElementById("readerMeta");
  if (meta) {
    meta.innerHTML = `
      <em>${story.level}</em>
      <em>${escapeHtml(story.topic || `${story.level} okuma`)}</em>
      <em>${story.minutes} dk</em>
      <em>${story.words} kelime</em>
      <button type="button" class="story-complete-btn" id="storyCompleteButton" aria-pressed="false"></button>
    `;
  }

  document.getElementById("readerTitle").textContent = story.title;
  updateReaderCompleteButton(story.id);

  document.getElementById("storyCompleteButton")?.addEventListener("click", () => {
    toggleStoryCompleted(story.id);
  });

  const readerText = document.getElementById("readerText");
  if (story.text) {
    readerText.innerHTML = annotateStoryText(story.text);
  } else {
    readerText.innerHTML = (story.tokens || []).map(token => {
      if (typeof token === "string") return escapeHtml(token);
      return createReaderWordMarkup(token.de, [token.de, token.tr], false);
    }).join("");
  }
}

/* ---------- PWA + NETWORK ---------- */

function initPwaV6() {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js?v=6").catch(error => {
        console.warn("Çevrimdışı destek başlatılamadı:", error);
      });
    });
  }

  const installButton = document.getElementById("installAppBtn");

  window.addEventListener("beforeinstallprompt", event => {
    event.preventDefault();
    deferredInstallPrompt = event;
    installButton?.classList.remove("hidden");
  });

  installButton?.addEventListener("click", async () => {
    if (!deferredInstallPrompt) return;
    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installButton.classList.add("hidden");
  });

  window.addEventListener("appinstalled", () => {
    deferredInstallPrompt = null;
    installButton?.classList.add("hidden");
  });
}

function updateNetworkStatusV6() {
  const status = document.getElementById("networkStatus");
  if (!status) return;

  if (navigator.onLine) {
    status.textContent = "Bağlantı yeniden kuruldu.";
    status.className = "network-status is-online";
    setTimeout(() => status.classList.add("hidden"), 2200);
  } else {
    status.textContent = "Çevrimdışısın. Daha önce açılan içerikler çalışmaya devam eder.";
    status.className = "network-status is-offline";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  initPwaV6();
  updateNetworkStatusV6();
  window.addEventListener("online", updateNetworkStatusV6);
  window.addEventListener("offline", updateNetworkStatusV6);
});


/* ==========================================================
   BIG UPDATE 7
   - Story layout repair
   - Daily study goals
   - German pronunciation
   - Reader appearance controls
   - Local data export/import/reset
   - Favorite-word practice session
   ========================================================== */

const DAILY_ACTIVITY_KEY_V7 = "almancaAskinaDailyActivityV1";
const READER_PREFS_KEY_V7 = "almancaAskinaReaderPrefsV1";

function getTodayKeyV7() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function getDailyActivityV7() {
  const fallback = { date: getTodayKeyV7(), searches: [], stories: [], gameSessions: 0 };
  const stored = safeReadStorage(DAILY_ACTIVITY_KEY_V7, fallback);
  if (!stored || stored.date !== getTodayKeyV7()) return fallback;
  return {
    date: stored.date,
    searches: Array.isArray(stored.searches) ? stored.searches : [],
    stories: Array.isArray(stored.stories) ? stored.stories : [],
    gameSessions: Number(stored.gameSessions) || 0
  };
}

function saveDailyActivityV7(activity) {
  safeWriteStorage(DAILY_ACTIVITY_KEY_V7, activity);
  renderDailyStudyV7();
}

function recordDailySearchV7(query) {
  const activity = getDailyActivityV7();
  const clean = normalizeAnswer(query);
  if (clean && !activity.searches.includes(clean)) activity.searches.push(clean);
  saveDailyActivityV7(activity);
}

function recordDailyStoryV7(storyId) {
  const activity = getDailyActivityV7();
  if (storyId && !activity.stories.includes(storyId)) activity.stories.push(storyId);
  saveDailyActivityV7(activity);
}

function recordDailyGameV7() {
  const activity = getDailyActivityV7();
  activity.gameSessions += 1;
  saveDailyActivityV7(activity);
}

function renderDailyStudyV7() {
  const grid = document.getElementById("dailyTaskGrid");
  const percent = document.getElementById("dailyStudyPercent");
  const bar = document.getElementById("dailyStudyProgressBar");
  if (!grid || !percent || !bar) return;

  const activity = getDailyActivityV7();
  const tasks = [
    {
      key: "dictionary",
      label: "5 farklı kelime ara",
      detail: `${Math.min(activity.searches.length, 5)} / 5`,
      ratio: Math.min(activity.searches.length / 5, 1),
      target: "dictionary"
    },
    {
      key: "reading",
      label: "1 hikâye tamamla",
      detail: `${Math.min(activity.stories.length, 1)} / 1`,
      ratio: Math.min(activity.stories.length, 1),
      target: "reading"
    },
    {
      key: "game",
      label: "1 oyun oturumu bitir",
      detail: `${Math.min(activity.gameSessions, 1)} / 1`,
      ratio: Math.min(activity.gameSessions, 1),
      target: "game"
    }
  ];

  const overall = Math.round(tasks.reduce((sum, task) => sum + task.ratio, 0) / tasks.length * 100);
  percent.textContent = `${overall}%`;
  bar.style.width = `${overall}%`;

  grid.innerHTML = tasks.map(task => `
    <button type="button" class="daily-task-card ${task.ratio >= 1 ? "is-done" : ""}" data-daily-target="${task.target}">
      <span>${task.ratio >= 1 ? "✓" : "○"}</span>
      <div>
        <strong>${escapeHtml(task.label)}</strong>
        <small>${escapeHtml(task.detail)}</small>
      </div>
    </button>
  `).join("");

  grid.querySelectorAll("[data-daily-target]").forEach(button => {
    button.addEventListener("click", () => {
      const target = document.getElementById(button.dataset.dailyTarget);
      target?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  });
}

/* Wrap existing activity functions without changing their original behavior. */
const baseAddSearchHistoryV7 = addSearchHistory;
addSearchHistory = function(query) {
  baseAddSearchHistoryV7(query);
  recordDailySearchV7(query);
};

const baseToggleStoryCompletedV7 = toggleStoryCompleted;
toggleStoryCompleted = function(storyId) {
  const wasCompleted = isStoryCompleted(storyId);
  baseToggleStoryCompletedV7(storyId);
  if (!wasCompleted && isStoryCompleted(storyId)) recordDailyStoryV7(storyId);
};

const baseFinishGameSessionV7 = finishGameSessionV6;
finishGameSessionV6 = function() {
  const shouldRecord = gameSessionV6 && !gameSessionV6.finished;
  baseFinishGameSessionV7();
  if (shouldRecord) recordDailyGameV7();
};

/* ---------- German pronunciation ---------- */

function speakGermanV7(text) {
  const clean = String(text || "").trim();
  if (!clean || !("speechSynthesis" in window)) {
    alert("Bu tarayıcı sesli telaffuzu desteklemiyor.");
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(clean);
  utterance.lang = "de-DE";
  utterance.rate = 0.86;
  utterance.pitch = 1;

  const voices = window.speechSynthesis.getVoices();
  const germanVoice = voices.find(voice => /^de(-|_)/i.test(voice.lang));
  if (germanVoice) utterance.voice = germanVoice;

  window.speechSynthesis.speak(utterance);
}

const baseRenderFoundResultV7 = renderFoundResult;
renderFoundResult = function(item) {
  baseRenderFoundResultV7(item);
  const title = document.querySelector("#resultPreview .result-title");
  if (title && !document.getElementById("dictionarySpeakBtn")) {
    title.insertAdjacentHTML("afterend", `
      <button type="button" class="speak-word-btn" id="dictionarySpeakBtn" aria-label="Almanca kelimeyi seslendir">
        🔊 Dinle
      </button>
    `);
    document.getElementById("dictionarySpeakBtn")?.addEventListener("click", () => {
      speakGermanV7(item.word);
    });
  }
};

const baseCreateReaderWordMarkupV7 = createReaderWordMarkup;
createReaderWordMarkup = function(surface, lines, missing = false) {
  const safeLines = (lines || []).filter(Boolean).map((line, index) => {
    const tag = index === 0 ? "strong" : "span";
    return `<${tag}>${escapeHtml(String(line))}</${tag}>`;
  }).join("");

  return `<span class="reader-word${missing ? " is-missing" : ""}" tabindex="0">${escapeHtml(surface)}
    <span class="reader-tooltip" role="tooltip">
      ${safeLines}
      <button type="button" class="reader-speak-btn" data-reader-speak="${escapeHtml(surface)}" aria-label="${escapeHtml(surface)} kelimesini dinle">🔊 Dinle</button>
    </span>
  </span>`;
};

document.addEventListener("click", event => {
  const button = event.target.closest("[data-reader-speak]");
  if (!button) return;
  event.preventDefault();
  event.stopPropagation();
  speakGermanV7(button.dataset.readerSpeak);
});

/* ---------- Reader controls ---------- */

function getReaderPrefsV7() {
  const stored = safeReadStorage(READER_PREFS_KEY_V7, {});
  return {
    fontSize: Number(stored.fontSize) || 19,
    lineHeight: Number(stored.lineHeight) || 1.9,
    focus: Boolean(stored.focus)
  };
}

function saveReaderPrefsV7(prefs) {
  safeWriteStorage(READER_PREFS_KEY_V7, prefs);
  applyReaderPrefsV7();
}

function applyReaderPrefsV7() {
  const reader = document.getElementById("readerText");
  const card = document.getElementById("readerCard");
  if (!reader || !card) return;

  const prefs = getReaderPrefsV7();
  reader.style.fontSize = `${prefs.fontSize}px`;
  reader.style.lineHeight = String(prefs.lineHeight);
  card.classList.toggle("reader-focus-mode", prefs.focus);

  const sizeLabel = document.getElementById("readerSizeLabel");
  if (sizeLabel) sizeLabel.textContent = `${prefs.fontSize}px`;

  const lineLabel = document.getElementById("readerLineLabel");
  if (lineLabel) lineLabel.textContent = prefs.lineHeight.toFixed(1);

  const focusButton = document.getElementById("readerFocusBtn");
  if (focusButton) {
    focusButton.classList.toggle("is-active", prefs.focus);
    focusButton.textContent = prefs.focus ? "Odak modu açık" : "Odak modu";
  }
}

function injectReaderControlsV7() {
  const card = document.getElementById("readerCard");
  const meta = document.getElementById("readerMeta");
  if (!card || !meta) return;

  document.getElementById("readerControlsV7")?.remove();
  meta.insertAdjacentHTML("afterend", `
    <div class="reader-controls" id="readerControlsV7">
      <div class="reader-control-group">
        <button type="button" data-reader-size="-1" aria-label="Yazıyı küçült">A−</button>
        <span id="readerSizeLabel">19px</span>
        <button type="button" data-reader-size="1" aria-label="Yazıyı büyüt">A+</button>
      </div>
      <div class="reader-control-group">
        <button type="button" data-reader-line="-0.1" aria-label="Satır aralığını azalt">Sık</button>
        <span id="readerLineLabel">1.9</span>
        <button type="button" data-reader-line="0.1" aria-label="Satır aralığını artır">Rahat</button>
      </div>
      <button type="button" class="reader-focus-btn" id="readerFocusBtn">Odak modu</button>
    </div>
  `);

  document.querySelectorAll("[data-reader-size]").forEach(button => {
    button.addEventListener("click", () => {
      const prefs = getReaderPrefsV7();
      prefs.fontSize = Math.max(15, Math.min(27, prefs.fontSize + Number(button.dataset.readerSize)));
      saveReaderPrefsV7(prefs);
    });
  });

  document.querySelectorAll("[data-reader-line]").forEach(button => {
    button.addEventListener("click", () => {
      const prefs = getReaderPrefsV7();
      prefs.lineHeight = Math.max(1.5, Math.min(2.4, Number((prefs.lineHeight + Number(button.dataset.readerLine)).toFixed(1))));
      saveReaderPrefsV7(prefs);
    });
  });

  document.getElementById("readerFocusBtn")?.addEventListener("click", () => {
    const prefs = getReaderPrefsV7();
    prefs.focus = !prefs.focus;
    saveReaderPrefsV7(prefs);
  });

  applyReaderPrefsV7();
}

const baseOpenStoryV7 = openStory;
openStory = function(storyId) {
  baseOpenStoryV7(storyId);
  injectReaderControlsV7();
};

/* ---------- Export / import / reset local data ---------- */

const LOCAL_DATA_KEYS_V7 = [
  FAVORITES_KEY,
  SEARCH_HISTORY_KEY,
  LAST_STORY_KEY,
  GAME_BEST_KEY,
  READING_PROGRESS_KEY,
  DAILY_ACTIVITY_KEY_V7,
  READER_PREFS_KEY_V7
];

function exportLocalDataV7() {
  const data = {
    app: "Almanca Aşkına",
    version: 1,
    exportedAt: new Date().toISOString(),
    values: {}
  };

  LOCAL_DATA_KEYS_V7.forEach(key => {
    const value = localStorage.getItem(key);
    if (value !== null) data.values[key] = value;
  });

  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `almanca-askina-yedek-${getTodayKeyV7()}.json`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

async function importLocalDataV7(file) {
  try {
    const data = JSON.parse(await file.text());
    if (!data || data.app !== "Almanca Aşkına" || typeof data.values !== "object") {
      throw new Error("Geçersiz yedek");
    }

    LOCAL_DATA_KEYS_V7.forEach(key => localStorage.removeItem(key));
    Object.entries(data.values).forEach(([key, value]) => {
      if (LOCAL_DATA_KEYS_V7.includes(key) && typeof value === "string") {
        localStorage.setItem(key, value);
      }
    });

    alert("Yedek başarıyla yüklendi. Sayfa yenilenecek.");
    location.reload();
  } catch (error) {
    alert("Bu dosya geçerli bir Almanca Aşkına yedeği değil.");
  }
}

function resetLocalDataV7() {
  if (!confirm("Kelime defteri, okuma ilerlemesi, skorlar ve ayarlar silinsin mi?")) return;
  LOCAL_DATA_KEYS_V7.forEach(key => localStorage.removeItem(key));
  location.reload();
}

/* ---------- Favorite-word practice ---------- */

const baseRenderWordNotebookV7 = renderWordNotebook;
renderWordNotebook = function() {
  baseRenderWordNotebookV7();

  const drawer = document.getElementById("dictionaryDrawer");
  const favoriteIds = getFavoriteIds();
  const words = dictionaryData.filter(item => favoriteIds.has(getEntryStorageId(item)));

  if (drawer && words.length >= 2 && !document.getElementById("practiceFavoritesBtn")) {
    const head = drawer.querySelector(".drawer-head");
    head?.insertAdjacentHTML("afterend", `
      <button type="button" class="practice-favorites-btn" id="practiceFavoritesBtn">
        Bu kelimelerle test başlat (${words.length})
      </button>
    `);

    document.getElementById("practiceFavoritesBtn")?.addEventListener("click", () => {
      currentGameMode = "meaning";
      document.querySelectorAll("[data-game-mode]").forEach(button => {
        button.classList.toggle("is-active", button.dataset.gameMode === "meaning");
      });

      const queue = [...words]
        .sort(() => Math.random() - 0.5)
        .slice(0, 10)
        .map(item => ({ ...item, gameMode: "meaning" }));

      startGameSessionV6(queue);
      document.getElementById("game")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  renderDailyStudyV7();

  document.getElementById("exportLocalDataBtn")?.addEventListener("click", exportLocalDataV7);
  document.getElementById("importLocalDataBtn")?.addEventListener("click", () => {
    document.getElementById("importLocalDataInput")?.click();
  });
  document.getElementById("importLocalDataInput")?.addEventListener("change", event => {
    const file = event.target.files?.[0];
    if (file) importLocalDataV7(file);
    event.target.value = "";
  });
  document.getElementById("resetLocalDataBtn")?.addEventListener("click", resetLocalDataV7);
});
