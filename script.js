let dictionaryData = [];
let currentStoryLevel = null;
let currentGameWord = null;
let currentGameLevel = "A1";
let currentGameMode = "meaning";
let activeArticleChoice = null;
let streak = 0;

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
const COMMON_SEPARABLE_PREFIXES = ["ab", "an", "auf", "aus", "ein", "mit", "nach", "vor", "weg", "zu", "zurück", "herunter", "raus", "rein", "heraus", "hinein"];

const STORIES = [
  {
    level: "A1",
    title: "Ein Tag in Berlin",
    topic: "Günlük yaşam",
    minutes: 3,
    words: 120,
    tokens: [
      { de: "Ich", tr: "ben" }, " gehe heute zum ", { de: "Bahnhof", tr: "tren istasyonu" }, ". ",
      "Dort treffe ich meine ", { de: "Freundin", tr: "kız arkadaş" }, ". ",
      "Wir kaufen zwei ", { de: "Fahrkarten", tr: "biletler" }, " und fahren ins Zentrum. ",
      "Am Nachmittag trinken wir ", { de: "Kaffee", tr: "kahve" }, " in einem kleinen Café."
    ]
  },
  {
    level: "A1",
    title: "Meine kleine Wohnung",
    topic: "Ev ve eşyalar",
    minutes: 4,
    words: 140,
    tokens: [
      "Meine ", { de: "Wohnung", tr: "daire" }, " ist klein, aber hell. ",
      "Im Wohnzimmer stehen ein ", { de: "Sofa", tr: "kanepe" }, " und ein Tisch. ",
      "Die ", { de: "Küche", tr: "mutfak" }, " ist neu. ",
      "Ich bin mit meiner Wohnung sehr ", { de: "zufrieden", tr: "memnun" }, "."
    ]
  },
  {
    level: "A2",
    title: "Eine Bewerbung",
    topic: "İş ve başvuru",
    minutes: 5,
    words: 210,
    tokens: [
      "Mara möchte sich um eine neue ", { de: "Stelle", tr: "iş pozisyonu" }, " bewerben. ",
      "Sie schreibt eine ", { de: "Bewerbung", tr: "başvuru" }, " und schickt ihren Lebenslauf per E-Mail. ",
      "Am nächsten Tag bekommt sie eine ", { de: "Einladung", tr: "davet" }, " zum Gespräch. ",
      "Sie freut sich sehr, aber sie ist auch ein bisschen ", { de: "aufgeregt", tr: "heyecanlı" }, "."
    ]
  },
  {
    level: "A2",
    title: "Im Einkaufszentrum",
    topic: "Alışveriş",
    minutes: 4,
    words: 190,
    tokens: [
      "Am Samstag geht Emre ins ", { de: "Einkaufszentrum", tr: "alışveriş merkezi" }, ". ",
      "Er sucht eine bequeme ", { de: "Jacke", tr: "ceket" }, " und neue Schuhe. ",
      "In einem Geschäft gibt es ein gutes ", { de: "Angebot", tr: "kampanya/teklif" }, ". ",
      "Die Verkäuferin ist sehr ", { de: "freundlich", tr: "nazik" }, " und hilft ihm."
    ]
  }
];

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  initSectionNavigation();
  initSearch();
  initReading();
  initGame();
  initCopyButtons();
  loadDictionary();
});

async function loadDictionary() {
  const [a1Data, a2Data] = await Promise.all([
    fetchFirstAvailable(["a1-words.json", "a1-words(1).json"]),
    fetchFirstAvailable(["a2-words.json", "a2-words(1).json"])
  ]);

  const a1 = Array.isArray(a1Data) ? a1Data.map(item => ({ ...item, level: item.level || "A1" })) : [];
  const a2 = Array.isArray(a2Data) ? a2Data.map(item => ({ ...item, level: item.level || "A2" })) : [];

  dictionaryData = mergeDictionaryData(a1, a2);
  prepareFirstGameWord();
  console.log("Sözlük yüklendi:", dictionaryData.length);
}

async function fetchFirstAvailable(paths) {
  for (const path of paths) {
    try {
      const response = await fetch(path);
      if (response.ok) return await response.json();
    } catch (error) {}
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
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/İ/g, "i")
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

/* Section navigation */
function initSectionNavigation() {
  document.querySelectorAll("[data-section-target]").forEach(button => {
    button.addEventListener("click", () => {
      const targetId = button.dataset.sectionTarget;
      const target = document.getElementById(targetId);

      document.querySelectorAll(".category-card").forEach(card => card.classList.remove("is-active"));
      button.classList.add("is-active");

      if (target && target.classList.contains("section-panel")) {
        target.classList.add("is-open");
      }

      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 80);
      }
    });
  });
}

/* Search */
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
  const cleanQuery = normalizeGerman(query);

  if (!cleanQuery) {
    resultPreview.innerHTML = renderEmptyState("Bir kelime yazman gerekiyor.", "Örn: geben, Haus, Tasse");
    return;
  }

  const result = findDictionaryItem(cleanQuery);

  if (!result) {
    resultPreview.innerHTML = renderEmptyState("Bu kelime henüz veri içinde yok.", "A1/A2 dosyalarına ekledikten sonra otomatik görünebilir.");
    return;
  }

  if (result.pos === "verb") {
    resultPreview.innerHTML = renderVerbResult(result);
    bindVerbTabs();
    return;
  }

  if (result.pos === "noun") {
    resultPreview.innerHTML = renderNounResult(result);
    return;
  }

  resultPreview.innerHTML = renderSimpleResult(result);
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

function renderEmptyState(title, desc) {
  return `
    <div class="empty-state">
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(desc)}</span>
    </div>
  `;
}

function renderResultHeader(item, displayWord) {
  const article = item.article ? `<span class="article">${escapeHtml(item.article)}</span>` : "";
  return `
    <div class="result-top">
      <div>
        <div class="result-title">
          ${article}
          <span class="word">${escapeHtml(displayWord || item.word)}</span>
        </div>
        <p class="translation">${escapeHtml(item.tr || "Türkçe anlam kontrol edilecek")}</p>
      </div>
      <div class="badge-row">
        <span class="level-badge">${escapeHtml(item.level || "A1/A2")}</span>
        <span class="pos-badge">${escapeHtml(getPosLabel(item.pos))}</span>
      </div>
    </div>
  `;
}

function renderNounResult(item) {
  const cases = getNounCases(item);

  return `
    ${renderResultHeader(item)}
    <div class="result-grid">
      <div class="info-box">
        <span>Plural</span>
        <strong>${escapeHtml(getPluralText(item))}</strong>
      </div>
      <div class="info-box">
        <span>Akkusativ</span>
        <strong>${escapeHtml(cases.akkusativ)}</strong>
      </div>
      <div class="info-box">
        <span>Dativ</span>
        <strong>${escapeHtml(cases.dativ)}</strong>
      </div>
    </div>
    ${renderExample(item)}
  `;
}

function renderSimpleResult(item) {
  return `
    ${renderResultHeader(item)}
    <div class="result-grid">
      <div class="info-box">
        <span>Kelime türü</span>
        <strong>${escapeHtml(getPosLabel(item.pos))}</strong>
      </div>
      <div class="info-box">
        <span>Seviye</span>
        <strong>${escapeHtml(item.level || "A1/A2")}</strong>
      </div>
      <div class="info-box">
        <span>Kaynak</span>
        <strong>Goethe kelime listesi</strong>
      </div>
    </div>
    ${renderExample(item)}
  `;
}

function renderExample(item) {
  const example = item.examples && item.examples.length ? item.examples[0] : "";
  if (!example) return "";

  return `
    <div class="example-box">
      <strong>Örnek cümle</strong>
      ${escapeHtml(example)}
    </div>
  `;
}

function getPosLabel(pos) {
  const labels = {
    noun: "İsim",
    verb: "Fiil",
    other: "Kelime / ifade"
  };
  return labels[pos] || "Kelime";
}

function getNounCases(item) {
  const word = item.word || "";
  const article = item.article || "";

  if (article === "der") {
    return { akkusativ: `den ${word}`, dativ: `dem ${word}` };
  }

  if (article === "die") {
    return { akkusativ: `die ${word}`, dativ: `der ${word}` };
  }

  if (article === "das") {
    return { akkusativ: `das ${word}`, dativ: `dem ${word}` };
  }

  return { akkusativ: word, dativ: word };
}

function getPluralText(item) {
  if (item.pluralOnly) return "Sadece çoğul";
  if (!item.pluralHint) return "-";
  return item.pluralHint;
}

/* Verb engine */
function renderVerbResult(item) {
  const data = getVerbConjugation(item);

  return `
    ${renderResultHeader(item, data.infinitive)}
    <div class="verb-tabs" role="tablist">
      <button class="verb-tab is-active" type="button" data-tense="praesens">Präsens</button>
      <button class="verb-tab" type="button" data-tense="perfekt">Perfekt</button>
      <button class="verb-tab" type="button" data-tense="praeteritum">Präteritum</button>
      <button class="verb-tab" type="button" data-tense="futur1">Futur I</button>
    </div>
    <div id="conjugationOutput">
      ${renderConjugationTable(data.tenses.praesens)}
    </div>
    ${renderExample(item)}
    <p class="verb-note">Not: Bu motor A1/A2 pratik kullanım için kural + istisna mantığıyla çalışır. Canlıya almadan önce kritik düzensiz fiiller manuel kontrol edilebilir.</p>
    <script type="application/json" id="verbDataJson">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>
  `;
}

function bindVerbTabs() {
  const jsonEl = document.getElementById("verbDataJson");
  const output = document.getElementById("conjugationOutput");
  if (!jsonEl || !output) return;

  const data = JSON.parse(jsonEl.textContent);

  document.querySelectorAll(".verb-tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".verb-tab").forEach(item => item.classList.remove("is-active"));
      tab.classList.add("is-active");
      output.innerHTML = renderConjugationTable(data.tenses[tab.dataset.tense]);
    });
  });
}

function renderConjugationTable(forms) {
  if (!forms) {
    return `<div class="empty-state"><strong>Bu zaman için veri yok.</strong><span>Bu fiile manuel istisna eklenebilir.</span></div>`;
  }

  return `
    <div class="conjugation-table">
      ${PRONOUNS.map(([key, label]) => `
        <div class="conj-row">
          <span>${label}</span>
          <strong>${escapeHtml(forms[key] || "-")}</strong>
        </div>
      `).join("")}
    </div>
  `;
}

function getVerbConjugation(item) {
  const infinitive = cleanInfinitive(item.word);
  const meta = getVerbMeta(item, infinitive);
  const praesens = applyVerbDecorations(conjugatePraesens(meta.base), meta);
  const perfekt = conjugatePerfekt(meta);
  const praeteritum = applyVerbDecorations(conjugatePraeteritum(meta.base), meta);
  const futur1 = conjugateFutur1(meta);

  return {
    infinitive,
    meaning: item.tr,
    meta,
    tenses: { praesens, perfekt, praeteritum, futur1 }
  };
}

function cleanInfinitive(word) {
  return String(word || "")
    .replace(/\(sich\)/gi, "")
    .replace(/^sich\s+/i, "")
    .trim();
}

function getVerbMeta(item, infinitive) {
  const raw = String(item.raw || "");
  const thirdPart = raw.split(",")[1] ? raw.split(",")[1].trim() : "";
  const perfektPart = raw.split(",").find(part => /\b(hat|ist)\b/i.test(part)) || "";
  const thirdWords = thirdPart.split(/\s+/);
  const possiblePrefix = thirdWords.length > 1 ? thirdWords[thirdWords.length - 1] : null;
  const inferredPrefix = possiblePrefix && COMMON_SEPARABLE_PREFIXES.includes(possiblePrefix) ? possiblePrefix : null;
  const prefix = inferredPrefix || detectSeparablePrefix(infinitive);
  const base = prefix ? infinitive.slice(prefix.length) : infinitive;

  const auxFromRaw = /\bist\b/i.test(perfektPart) ? "sein" : /\bhat\b/i.test(perfektPart) ? "haben" : null;
  const partizipFromRaw = perfektPart.replace(/\b(hat|ist)\b/i, "").trim() || null;
  const normalizedBase = normalizeGerman(base);
  const partizipOverride = PARTIZIP_OVERRIDES[base] || PARTIZIP_OVERRIDES[normalizedBase];

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
  const override = PRESENT_OVERRIDES[base] || PRESENT_OVERRIDES[normalizeGerman(base)];
  if (override) return override;

  return conjugateRegularPraesens(base);
}

function conjugateRegularPraesens(infinitive) {
  let stem = getVerbStem(infinitive);
  const needsE = /(?:t|d|chn|ffn|gn|tm|dm)$/.test(stem);
  const sSound = /(?:s|z|x|ß|ss)$/.test(stem);

  if (infinitive.endsWith("eln")) {
    const ichStem = stem.slice(0, -1);
    return {
      ich: `${ichStem}le`,
      du: `${stem}st`,
      er_sie_es: `${stem}t`,
      wir: infinitive,
      ihr: `${stem}t`,
      sie_Sie: infinitive
    };
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
  if (override) {
    return prefix ? `${prefix}${override.partizip2}` : override.partizip2;
  }

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

/* Reading */
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
      document.getElementById("readerCard").classList.add("hidden");
      document.getElementById("storyList").classList.remove("hidden");
    });
  }

  document.addEventListener("click", event => {
    if (!event.target.classList.contains("word-tip")) return;
    event.target.classList.toggle("is-visible");
  });
}

function renderStoryList(level) {
  const storyList = document.getElementById("storyList");
  const readerCard = document.getElementById("readerCard");
  const stories = STORIES.filter(story => story.level === level);

  readerCard.classList.add("hidden");
  storyList.classList.remove("hidden");

  storyList.innerHTML = stories.map((story, index) => `
    <button type="button" class="story-card" data-story-index="${STORIES.indexOf(story)}">
      <span>${escapeHtml(story.title)}</span>
      <small>${escapeHtml(story.topic)}</small>
      <div class="story-meta">
        <em>${story.level}</em>
        <em>${story.minutes} dk</em>
        <em>${story.words} kelime</em>
      </div>
    </button>
  `).join("");

  storyList.querySelectorAll("[data-story-index]").forEach(button => {
    button.addEventListener("click", () => openStory(Number(button.dataset.storyIndex)));
  });
}

function openStory(index) {
  const story = STORIES[index];
  if (!story) return;

  document.getElementById("storyList").classList.add("hidden");
  document.getElementById("readerCard").classList.remove("hidden");
  document.getElementById("readerMeta").innerHTML = `
    <em>${story.level}</em>
    <em>${escapeHtml(story.topic)}</em>
    <em>${story.minutes} dk</em>
    <em>${story.words} kelime</em>
  `;
  document.getElementById("readerTitle").textContent = story.title;
  document.getElementById("readerText").innerHTML = story.tokens.map(token => {
    if (typeof token === "string") return escapeHtml(token);
    return `<span class="word-tip" data-tr="${escapeHtml(token.tr)}">${escapeHtml(token.de)}</span>`;
  }).join("");
}

/* Game */
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

  if (currentGameLevel !== "ALL") {
    pool = pool.filter(item => item.level === currentGameLevel || item.level === "A1/A2");
  }

  if (mode === "article") {
    pool = pool.filter(item => item.pos === "noun" && ["der", "die", "das"].includes(item.article));
  } else {
    pool = pool.filter(item => item.tr && item.tr.length > 1);
  }

  return pool;
}

function setNewGameWord() {
  const effectiveMode = currentGameMode === "mixed"
    ? (Math.random() > 0.5 ? "meaning" : "article")
    : currentGameMode;

  const pool = getGamePool(effectiveMode);
  if (!pool.length) return;

  currentGameWord = {
    ...pool[Math.floor(Math.random() * pool.length)],
    gameMode: effectiveMode
  };

  activeArticleChoice = null;
  renderGameQuestion();
}

function renderGameQuestion() {
  const wordEl = document.getElementById("gameWord");
  const hintEl = document.getElementById("gameHint");
  const directionEl = document.getElementById("gameDirection");
  const answerArea = document.getElementById("answerArea");
  const resultEl = document.getElementById("gameResult");

  resultEl.textContent = "";
  resultEl.className = "game-feedback";

  if (currentGameWord.gameMode === "article") {
    directionEl.textContent = "Artikel Tahmini";
    wordEl.textContent = currentGameWord.word;
    hintEl.textContent = "Bu kelimenin artikelini seç.";
    answerArea.innerHTML = `
      <div class="article-options">
        <button type="button" class="article-option" data-article-choice="der">der</button>
        <button type="button" class="article-option" data-article-choice="die">die</button>
        <button type="button" class="article-option" data-article-choice="das">das</button>
      </div>
    `;

    answerArea.querySelectorAll("[data-article-choice]").forEach(button => {
      button.addEventListener("click", () => {
        activeArticleChoice = button.dataset.articleChoice;
        answerArea.querySelectorAll(".article-option").forEach(btn => btn.classList.remove("is-selected"));
        button.classList.add("is-selected");
      });
    });

    return;
  }

  directionEl.textContent = "Almanca → Türkçe";
  wordEl.textContent = getGermanDisplay(currentGameWord);
  hintEl.textContent = `${currentGameWord.level || "A1/A2"} kelime`;
  answerArea.innerHTML = `<input type="text" id="guessInput" placeholder="Türkçesini yaz..." autocomplete="off" />`;
  document.getElementById("guessInput").addEventListener("keydown", event => {
    if (event.key === "Enter") checkGameAnswer();
  });
}

function checkGameAnswer() {
  if (!currentGameWord) return;

  if (currentGameWord.gameMode === "article") {
    const correct = activeArticleChoice === currentGameWord.article;
    showGameResult(correct, `Doğru: ${currentGameWord.article} ${currentGameWord.word}`);
    return;
  }

  const input = document.getElementById("guessInput");
  const guess = normalizeAnswer(input?.value || "");
  const answers = getAcceptedAnswers(currentGameWord.tr);
  const correct = answers.some(answer => {
    const cleanAnswer = normalizeAnswer(answer);
    return guess === cleanAnswer || cleanAnswer.includes(guess) || guess.includes(cleanAnswer);
  });

  showGameResult(correct, `Doğrusu: ${currentGameWord.tr}`);
}

function showGameResult(correct, message) {
  const result = document.getElementById("gameResult");

  if (correct) {
    streak++;
    result.textContent = "Doğru.";
    result.className = "game-feedback success";
  } else {
    streak = 0;
    result.textContent = message;
    result.className = "game-feedback error";
  }

  document.getElementById("streakCount").textContent = String(streak);
}

function resetStreak() {
  streak = 0;
  document.getElementById("streakCount").textContent = "0";
}

function getAcceptedAnswers(text) {
  return String(text || "")
    .split(/[,;/]| veya | ya da /gi)
    .map(item => item.trim())
    .filter(Boolean);
}

function getGermanDisplay(item) {
  if (item.pos === "noun" && item.article) return `${item.article} ${item.word}`;
  return item.word;
}

/* Copy buttons */
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

      setTimeout(() => {
        button.textContent = original;
      }, 1200);
    });
  });
}

/* Theme */
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