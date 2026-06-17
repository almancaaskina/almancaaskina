/* Almanca Aşkına v13 — Geri Dönme Sebebi */
(() => {
  const MISTAKES_KEY_V13 = "almancaAskinaMistakesV1";
  const TOPIC_PROGRESS_KEY_V13 = "almancaAskinaTopicProgressV1";
  const DAILY_CHALLENGE_KEY_V13 = "almancaAskinaDailyChallengeV1";
  const VISIT_COUNT_KEY_V13 = "almancaAskinaVisitCountV1";
  const TOUR_DISMISSED_KEY_V13 = "almancaAskinaQuickStartSeenV1";

  let activeSessionContextV13 = null;
  let lastChallengeResultV13 = null;

  if (typeof LOCAL_DATA_KEYS_V7 !== "undefined" && Array.isArray(LOCAL_DATA_KEYS_V7)) {
    [MISTAKES_KEY_V13, TOPIC_PROGRESS_KEY_V13, DAILY_CHALLENGE_KEY_V13, VISIT_COUNT_KEY_V13, TOUR_DISMISSED_KEY_V13]
      .forEach(key => { if (!LOCAL_DATA_KEYS_V7.includes(key)) LOCAL_DATA_KEYS_V7.push(key); });
  }

  function readV13(key, fallback) {
    return typeof safeReadStorage === "function" ? safeReadStorage(key, fallback) : fallback;
  }

  function writeV13(key, value) {
    if (typeof safeWriteStorage === "function") safeWriteStorage(key, value);
  }

  function todayV13() {
    if (typeof dateKeyV8 === "function") return dateKeyV8();
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,"0")}-${String(date.getDate()).padStart(2,"0")}`;
  }

  function escapeV13(value) {
    return typeof escapeHtml === "function" ? escapeHtml(String(value ?? "")) : String(value ?? "");
  }

  function showToastV13(message) {
    const status = document.getElementById("networkStatus");
    if (!status) return;
    status.textContent = message;
    status.className = "network-status is-online";
    clearTimeout(showToastV13.timer);
    showToastV13.timer = setTimeout(() => status.classList.add("hidden"), 3200);
  }

  function scrollToV13(id) {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function getMistakesV13() {
    const value = readV13(MISTAKES_KEY_V13, {});
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  function saveMistakesV13(value) {
    writeV13(MISTAKES_KEY_V13, value);
    renderMistakeCountV13();
    renderReturnHubV13();
  }

  function getUnresolvedMistakesV13() {
    return Object.values(getMistakesV13())
      .filter(record => !record.resolved)
      .sort((a,b) => (b.count || 0) - (a.count || 0) || (b.lastWrongAt || 0) - (a.lastWrongAt || 0));
  }

  function recordMistakeResultV13(item, correct) {
    if (!item || typeof getEntryStorageId !== "function") return;
    const id = getEntryStorageId(item);
    const mistakes = getMistakesV13();
    const existing = mistakes[id];

    if (!correct) {
      mistakes[id] = {
        id,
        count: (existing?.count || 0) + 1,
        correctStreak: 0,
        resolved: false,
        lastWrongAt: Date.now(),
        word: item.word || "",
        tr: item.tr || "",
        article: item.article || "",
        level: item.level || "A1/A2"
      };
      saveMistakesV13(mistakes);
      return;
    }

    if (existing && !existing.resolved) {
      existing.correctStreak = (existing.correctStreak || 0) + 1;
      existing.lastCorrectAt = Date.now();
      if (existing.correctStreak >= 2) existing.resolved = true;
      mistakes[id] = existing;
      saveMistakesV13(mistakes);
    }
  }

  function getMistakeItemsV13() {
    return getUnresolvedMistakesV13().map(record => {
      const item = typeof getItemByStorageIdV8 === "function" ? getItemByStorageIdV8(record.id) : null;
      return item || {
        id: record.id,
        word: record.word,
        tr: record.tr,
        article: record.article,
        level: record.level,
        pos: record.article ? "noun" : "other"
      };
    }).filter(item => item?.word && item?.tr);
  }

  function ensureMistakesButtonV13() {
    const tools = document.querySelector(".dictionary-quick-tools");
    if (!tools || document.getElementById("mistakesNotebookBtnV13")) return;
    tools.insertAdjacentHTML("beforeend", `
      <button type="button" class="quick-tool-btn mistakes-tool-v13" id="mistakesNotebookBtnV13">
        Yanlışlarım <span id="mistakeCountV13">0</span>
      </button>`);
    document.getElementById("mistakesNotebookBtnV13")?.addEventListener("click", renderMistakesDrawerV13);
    renderMistakeCountV13();
  }

  function renderMistakeCountV13() {
    const count = getUnresolvedMistakesV13().length;
    const badge = document.getElementById("mistakeCountV13");
    if (badge) badge.textContent = String(count);
  }

  function renderMistakesDrawerV13() {
    const drawer = document.getElementById("dictionaryDrawer");
    if (!drawer) return;
    if (!drawer.classList.contains("hidden") && drawer.dataset.view === "mistakes-v13") {
      drawer.classList.add("hidden");
      return;
    }

    const rows = getUnresolvedMistakesV13();
    drawer.dataset.view = "mistakes-v13";
    drawer.innerHTML = `
      <div class="drawer-head">
        <div><strong>Yanlışlarım</strong><span>İki kez doğru cevapladığında listeden otomatik çıkar.</span></div>
        ${rows.length ? '<button type="button" class="text-btn" id="clearResolvedMistakesV13">Çözülenleri temizle</button>' : ""}
      </div>
      ${rows.length ? `
        <div class="mistakes-actions-v13">
          <button type="button" id="practiceMistakesV13">Bu kelimelerle tekrar başlat</button>
          <small>${rows.length} kelime · en çok zorlanılandan başlayarak</small>
        </div>
        <div class="mistakes-list-v13">
          ${rows.map(record => {
            const item = typeof getItemByStorageIdV8 === "function" ? getItemByStorageIdV8(record.id) : null;
            const display = item && typeof getGermanDisplay === "function" ? getGermanDisplay(item) : `${record.article ? record.article + " " : ""}${record.word}`;
            return `<article>
              <button type="button" data-mistake-word-v13="${escapeV13(record.word)}">
                <span><strong>${escapeV13(display)}</strong><small>${escapeV13(item?.tr || record.tr)}</small></span>
                <em>${record.count || 1} hata</em>
              </button>
              <button type="button" class="mistake-resolve-v13" data-resolve-mistake-v13="${escapeV13(record.id)}">Öğrendim</button>
            </article>`;
          }).join("")}
        </div>` : `
        <div class="drawer-empty">
          <strong>Şimdilik yanlış listen boş.</strong><br>
          Oyunlarda kaçırdığın kelimeler burada otomatik toplanacak.
        </div>`}
    `;
    drawer.classList.remove("hidden");

    document.getElementById("practiceMistakesV13")?.addEventListener("click", startMistakesPracticeV13);
    drawer.querySelectorAll("[data-mistake-word-v13]").forEach(button => button.addEventListener("click", () => {
      if (typeof chooseSearchSuggestion === "function") chooseSearchSuggestion(button.dataset.mistakeWordV13);
    }));
    drawer.querySelectorAll("[data-resolve-mistake-v13]").forEach(button => button.addEventListener("click", () => {
      const mistakes = getMistakesV13();
      if (mistakes[button.dataset.resolveMistakeV13]) mistakes[button.dataset.resolveMistakeV13].resolved = true;
      saveMistakesV13(mistakes);
      drawer.classList.add("hidden");
      renderMistakesDrawerV13();
    }));
    document.getElementById("clearResolvedMistakesV13")?.addEventListener("click", () => {
      const unresolved = {};
      Object.entries(getMistakesV13()).forEach(([id, record]) => { if (!record.resolved) unresolved[id] = record; });
      saveMistakesV13(unresolved);
      renderMistakesDrawerV13();
    });
  }

  function startMistakesPracticeV13() {
    const queue = getMistakeItemsV13().slice(0,10).map(item => ({ ...item, gameMode: "meaning" }));
    if (!queue.length) return showToastV13("Tekrar edilecek yanlış kelime bulunmuyor.");
    activeSessionContextV13 = { type: "mistakes" };
    document.getElementById("dictionaryDrawer")?.classList.add("hidden");
    startGameSessionV6(queue);
    scrollToV13("game");
  }

  function hashV13(text) {
    let hash = 2166136261;
    for (const char of String(text)) {
      hash ^= char.charCodeAt(0);
      hash = Math.imul(hash, 16777619);
    }
    return Math.abs(hash >>> 0);
  }

  function seededShuffleV13(items, seedText) {
    const copy = [...items];
    let seed = hashV13(seedText) || 1;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const target = Math.floor(random() * (index + 1));
      [copy[index], copy[target]] = [copy[target], copy[index]];
    }
    return copy;
  }

  function getChallengeStoreV13() {
    const value = readV13(DAILY_CHALLENGE_KEY_V13, {});
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  function getTodayChallengeV13() {
    return getChallengeStoreV13()[todayV13()] || { completed: false, score: 0, total: 8 };
  }

  function getChallengeQueueV13() {
    const usable = (typeof dictionaryData !== "undefined" ? dictionaryData : []).filter(item => item?.word && item?.tr && !String(item.word).includes("/"));
    return seededShuffleV13(usable, `${todayV13()}-almanca-askina-v13`).slice(0,8).map(item => ({ ...item, gameMode: "meaning" }));
  }

  function startDailyChallengeV13() {
    const queue = getChallengeQueueV13();
    if (queue.length < 4) return showToastV13("Sözlük henüz hazırlanıyor. Birkaç saniye sonra tekrar dene.");
    activeSessionContextV13 = { type: "challenge", key: todayV13() };
    startGameSessionV6(queue);
    scrollToV13("game");
  }

  function saveChallengeResultV13(correct, total) {
    const store = getChallengeStoreV13();
    const previous = store[todayV13()] || {};
    store[todayV13()] = {
      completed: true,
      score: Math.max(Number(previous.score) || 0, correct),
      total,
      completedAt: Date.now()
    };
    Object.keys(store).sort().slice(0, -60).forEach(key => delete store[key]);
    writeV13(DAILY_CHALLENGE_KEY_V13, store);
    lastChallengeResultV13 = { correct, total };
    if (typeof recordActivityV8 === "function") recordActivityV8("challenge", 1);
    renderReturnHubV13();
  }

  function downloadChallengeCardV13() {
    const result = lastChallengeResultV13 || getTodayChallengeV13();
    const correct = Number(result.correct ?? result.score) || 0;
    const total = Number(result.total) || 8;
    const canvas = document.createElement("canvas");
    canvas.width = 1080; canvas.height = 1080;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#F4F6FB"; ctx.fillRect(0,0,1080,1080);
    ctx.fillStyle = "#1E40FF"; ctx.fillRect(0,0,1080,30);
    ctx.strokeStyle = "#DCE3FF"; ctx.lineWidth = 2; ctx.strokeRect(64,64,952,952);
    ctx.fillStyle = "#1E40FF"; ctx.font = "800 34px system-ui"; ctx.fillText("ALMANCA AŞKINA",92,142);
    ctx.fillStyle = "#0B0F19"; ctx.font = "900 72px system-ui"; ctx.fillText("Günün meydan okuması",92,300);
    ctx.fillStyle = "#1E40FF"; ctx.font = "900 190px system-ui"; ctx.fillText(`${correct}/${total}`,92,565);
    ctx.fillStyle = "#2A2F36"; ctx.font = "650 38px system-ui"; ctx.fillText("Bugünkü Almanca çalışmam tamamlandı.",92,690);
    ctx.fillStyle = "#667085"; ctx.font = "500 30px system-ui"; ctx.fillText(new Date().toLocaleDateString("tr-TR", { day:"numeric", month:"long", year:"numeric" }),92,770);
    ctx.fillStyle = "#0B0F19"; ctx.font = "750 34px system-ui"; ctx.fillText("Sade öğren. Düzenli ilerle.",92,930);
    const link = document.createElement("a");
    link.download = `almanca-askina-gunluk-${todayV13()}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  function getTopicProgressStoreV13() {
    const value = readV13(TOPIC_PROGRESS_KEY_V13, {});
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  function saveTopicPracticeResultV13(topic, correct, total) {
    const pack = typeof getTopicPacksV12 === "function" ? getTopicPacksV12().find(item => item.topic === topic) : null;
    const key = pack?.id || topic;
    const store = getTopicProgressStoreV13();
    const current = store[key] || { attempts: 0, best: 0 };
    store[key] = {
      attempts: (current.attempts || 0) + 1,
      best: Math.max(current.best || 0, correct),
      total,
      lastPracticedAt: Date.now()
    };
    writeV13(TOPIC_PROGRESS_KEY_V13, store);
    renderTopicPacksV12?.();
    renderReturnHubV13();
  }

  function calculateTopicProgressV13(pack) {
    const words = typeof getTopicWordItemsV12 === "function" ? getTopicWordItemsV12(pack.topic) : [];
    const favorites = typeof getFavoriteIds === "function" ? getFavoriteIds() : new Set();
    const saved = words.filter(item => favorites.has(getEntryStorageId(item))).length;
    const stats = getTopicProgressStoreV13()[pack.id] || {};
    const storyDone = pack.storyId && typeof isStoryCompleted === "function" ? isStoryCompleted(pack.storyId) : false;
    const wordRatio = words.length ? saved / words.length : 0;
    const practiceRatio = stats.total ? Math.min(1, (stats.best || 0) / stats.total) : 0;
    const percent = Math.round(wordRatio * 50 + practiceRatio * 25 + (storyDone ? 25 : 0));
    return { percent, saved, totalWords: words.length, best: stats.best || 0, total: stats.total || 10, attempts: stats.attempts || 0, storyDone };
  }

  function decorateTopicPacksV13() {
    const packs = typeof getTopicPacksV12 === "function" ? getTopicPacksV12() : [];
    document.querySelectorAll("[data-topic-pack]").forEach(card => {
      const pack = packs.find(item => item.id === card.dataset.topicPack);
      if (!pack) return;
      const progress = calculateTopicProgressV13(pack);
      card.querySelector(".topic-progress-v13")?.remove();
      card.insertAdjacentHTML("beforeend", `
        <div class="topic-progress-v13" aria-label="Yüzde ${progress.percent} tamamlandı">
          <div><span style="width:${progress.percent}%"></span></div><small>%${progress.percent}</small>
        </div>`);
    });
  }

  function injectTopicDialogProgressV13(packId) {
    const pack = typeof getTopicPacksV12 === "function" ? getTopicPacksV12().find(item => item.id === packId) : null;
    const mount = document.getElementById("topicPackDialogInner");
    if (!pack || !mount) return;
    const progress = calculateTopicProgressV13(pack);
    mount.querySelector(".topic-dialog-progress-v13")?.remove();
    const summary = mount.querySelector(".topic-pack-summary");
    summary?.insertAdjacentHTML("afterend", `
      <div class="topic-dialog-progress-v13">
        <div class="topic-dialog-progress-head"><strong>Paket ilerlemesi</strong><span>%${progress.percent}</span></div>
        <div class="topic-dialog-track-v13"><span style="width:${progress.percent}%"></span></div>
        <div class="topic-dialog-checks-v13">
          <span class="${progress.saved ? "is-done" : ""}">${progress.saved}/${progress.totalWords} kelime defterde</span>
          <span class="${progress.attempts ? "is-done" : ""}">${progress.attempts ? `En iyi test ${progress.best}/${progress.total}` : "Test bekliyor"}</span>
          <span class="${progress.storyDone ? "is-done" : ""}">${progress.storyDone ? "Hikâye tamamlandı" : "Hikâye bekliyor"}</span>
        </div>
      </div>`);
  }

  function getBestIncompleteTopicV13() {
    const packs = typeof getTopicPacksV12 === "function" ? getTopicPacksV12() : [];
    return packs.map(pack => ({ pack, progress: calculateTopicProgressV13(pack) }))
      .filter(row => row.progress.percent > 0 && row.progress.percent < 100)
      .sort((a,b) => b.progress.percent - a.progress.percent)[0] || null;
  }

  function getResumeStateV13() {
    const due = typeof getDueReviewItemsV8 === "function" ? getDueReviewItemsV8().length : 0;
    const mistakes = getUnresolvedMistakesV13().length;
    const lastStory = typeof getLastStoryDataV6 === "function" ? getLastStoryDataV6() : null;
    const favorites = typeof getFavoriteIds === "function" ? getFavoriteIds().size : 0;
    const activity = typeof getActivityLogV8 === "function" ? getActivityLogV8() : {};
    const hasActivity = Object.keys(activity).length || favorites || lastStory;

    if (!hasActivity) return {
      eyebrow: "Hızlı başlangıç",
      title: "İlk 5 dakikan hazır.",
      text: "Bir kelime ara, defterine ekle ve kısa bir testle bitir.",
      button: "Kelimeyle başla",
      action: "dictionary"
    };
    if (due > 0) return {
      eyebrow: "Bugün seni bekliyor",
      title: `${due} kelimenin tekrar zamanı.`,
      text: "Kısa bir turla hafızanı tazele; sonra kaldığın yere dön.",
      button: "Tekrarı başlat",
      action: "reviews"
    };
    if (mistakes > 0) return {
      eyebrow: "Kişisel odak",
      title: `${mistakes} kelimeyi netleştirelim.`,
      text: "Yanlış yaptığın kelimeler otomatik toplandı.",
      button: "Yanlışları çalış",
      action: "mistakes"
    };
    if (lastStory && !(typeof isStoryCompleted === "function" && isStoryCompleted(lastStory.id))) return {
      eyebrow: "Kaldığın yerden devam",
      title: lastStory.title || "Son hikâyene dön.",
      text: "Okuma konumun bu cihazda saklandı.",
      button: "Hikâyeyi aç",
      action: "story",
      payload: lastStory.id
    };
    const topic = getBestIncompleteTopicV13();
    if (topic) return {
      eyebrow: "Konu paketine devam",
      title: `${topic.pack.title} · %${topic.progress.percent}`,
      text: "Kelimelerini, testini ve hikâyesini tamamla.",
      button: "Paketi aç",
      action: "topic",
      payload: topic.pack.id
    };
    return {
      eyebrow: "Yeni çalışma",
      title: favorites ? "Bugünkü tekrarların tamam." : "Yeni bir kelime keşfet.",
      text: favorites ? "Bir hikâye seçerek kelimeleri bağlam içinde gör." : "Sözlükten başlayıp kendi kelime defterini oluştur.",
      button: favorites ? "Hikâye seç" : "Sözlüğe git",
      action: favorites ? "reading" : "dictionary"
    };
  }

  function handleResumeActionV13(state) {
    if (state.action === "reviews") return startDueReviewV8?.();
    if (state.action === "mistakes") return startMistakesPracticeV13();
    if (state.action === "story") {
      openStory?.(state.payload);
      return scrollToV13("reading");
    }
    if (state.action === "topic") return openTopicPackV12?.(state.payload);
    scrollToV13(state.action);
  }

  function dailyTipV13() {
    const tips = [
      "İsimleri artikeliyle birlikte tekrar et.",
      "Bir kelimeyi tek başına değil, bir cümlede öğren.",
      "Kısa ama her gün yapılan çalışma daha kalıcıdır.",
      "Yanlış cevap, tekrar planının en değerli parçasıdır.",
      "Almanca cümleyi önce sesli oku, sonra anlamına bak.",
      "Fiilleri mümkünse edatıyla birlikte kaydet.",
      "Yeni kelimeyi aynı gün iki farklı cümlede kullan.",
      "Dinlerken her kelimeyi değil, ana fikri yakalamaya çalış.",
      "Çoğul biçimini artikel kadar erken öğren.",
      "Bir hikâyeyi ikinci kez okumak hızını belirgin artırır.",
      "Zor kelimeleri saklama; yanlışlar listene bırak.",
      "Bugün sekiz soru, yarın daha güçlü bir temel demektir."
    ];
    return tips[hashV13(todayV13()) % tips.length];
  }

  function ensureReturnHubV13() {
    if (document.getElementById("returnHubV13")) return;
    const hero = document.getElementById("home");
    hero?.insertAdjacentHTML("afterend", `
      <section class="return-hub-v13 container" id="returnHubV13" aria-labelledby="returnHubTitleV13">
        <div class="return-hub-head-v13">
          <div><span>Bugün için</span><h2 id="returnHubTitleV13">Tek bakışta sıradaki adımın.</h2></div>
          <small id="dailyTipV13"></small>
        </div>
        <div class="return-hub-grid-v13">
          <article class="resume-card-v13" id="resumeCardV13"></article>
          <article class="challenge-card-v13" id="challengeCardV13"></article>
          <article class="mistake-card-v13" id="mistakeCardV13"></article>
        </div>
      </section>`);
  }

  function renderReturnHubV13() {
    ensureReturnHubV13();
    const resume = document.getElementById("resumeCardV13");
    const challenge = document.getElementById("challengeCardV13");
    const mistake = document.getElementById("mistakeCardV13");
    if (!resume || !challenge || !mistake) return;

    const state = getResumeStateV13();
    resume.innerHTML = `
      <span>${escapeV13(state.eyebrow)}</span>
      <strong>${escapeV13(state.title)}</strong>
      <p>${escapeV13(state.text)}</p>
      <button type="button" id="resumeActionV13">${escapeV13(state.button)} <b>→</b></button>`;
    document.getElementById("resumeActionV13")?.addEventListener("click", () => handleResumeActionV13(state));

    const today = getTodayChallengeV13();
    challenge.classList.toggle("is-complete", Boolean(today.completed));
    challenge.innerHTML = `
      <span>Günün meydan okuması</span>
      <strong>${today.completed ? `${today.score}/${today.total} tamamlandı` : "8 soru · tek şans değil"}</strong>
      <p>${today.completed ? "Bugünkü skorun kaydedildi. Dilersen yeniden çözebilirsin." : "Her gün aynı sekiz soru; sonuç yalnızca bu cihazda saklanır."}</p>
      <div>
        <button type="button" id="startChallengeV13">${today.completed ? "Yeniden çöz" : "Meydan okumayı başlat"}</button>
        ${today.completed ? '<button type="button" class="secondary" id="shareChallengeV13">Sonuç kartı</button>' : ""}
      </div>`;
    document.getElementById("startChallengeV13")?.addEventListener("click", startDailyChallengeV13);
    document.getElementById("shareChallengeV13")?.addEventListener("click", downloadChallengeCardV13);

    const mistakeCount = getUnresolvedMistakesV13().length;
    const standalone = matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
    mistake.innerHTML = `
      <span>${mistakeCount ? "Yanlışlar defteri" : "Cebinde uygulama"}</span>
      <strong>${mistakeCount ? `${mistakeCount} kelime odak listende` : standalone ? "Uygulama olarak açık" : "Telefonuna ekleyebilirsin"}</strong>
      <p>${mistakeCount ? "İki doğru cevapla kelime otomatik olarak çözülür." : standalone ? "Çevrimdışı destek ve tam ekran çalışma hazır." : "Mağaza beklemeden, tarayıcıdan uygulama gibi kullan."}</p>
      <button type="button" id="mistakeOrInstallV13">${mistakeCount ? "Yanlışlarımı aç" : standalone ? "Çalışmaya devam et" : "Nasıl eklenir?"}</button>`;
    document.getElementById("mistakeOrInstallV13")?.addEventListener("click", () => {
      if (mistakeCount) return renderMistakesDrawerV13();
      if (standalone) return scrollToV13("dictionary");
      promptInstallV13();
    });

    const tip = document.getElementById("dailyTipV13");
    if (tip) tip.textContent = dailyTipV13();
  }

  async function promptInstallV13() {
    if (typeof deferredInstallPrompt !== "undefined" && deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      await deferredInstallPrompt.userChoice;
      deferredInstallPrompt = null;
      renderReturnHubV13();
      return;
    }
    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    showToastV13(isIos
      ? "Safari’de Paylaş düğmesine, ardından ‘Ana Ekrana Ekle’ye dokun."
      : "Tarayıcı menüsünden ‘Uygulamayı yükle’ veya ‘Ana ekrana ekle’ seçeneğini kullan.");
  }

  function addChallengeResultButtonV13() {
    const actions = document.querySelector("#answerArea .game-summary-actions");
    if (!actions || document.getElementById("downloadChallengeResultV13")) return;
    actions.insertAdjacentHTML("beforeend", '<button type="button" class="secondary-mini-btn" id="downloadChallengeResultV13">Sonuç kartını indir</button>');
    document.getElementById("downloadChallengeResultV13")?.addEventListener("click", downloadChallengeCardV13);
  }

  function updateVisibleVersionV13() {
    document.querySelectorAll(".version-strip > div:first-child strong").forEach(el => el.textContent = "Sürüm 13.0");
    const content = document.querySelector(".version-strip > div:nth-child(2) span");
    if (content) content.textContent = "A1–A2+ sözlük, 46 hikâye, 307 kalıp, 12 konu paketi";
    const footer = document.querySelector(".site-footer p");
    if (footer) footer.innerHTML = 'Almanca Aşkına — ücretsiz, sade ve dikkat dağıtmayan Almanca çalışma kütüphanesi. · <a href="mailto:akkayanbusiness@gmail.com">İletişim</a> · Sürüm 13.0';
  }

  /* Wrap current game result pipeline after all previous learning extensions. */
  if (typeof showGameResult === "function") {
    const baseShowGameResultV13 = showGameResult;
    showGameResult = function(correct, message) {
      const item = typeof currentGameWord !== "undefined" && currentGameWord ? { ...currentGameWord } : null;
      baseShowGameResultV13(correct, message);
      recordMistakeResultV13(item, correct);
    };
  }

  if (typeof finishGameSessionV6 === "function") {
    const baseFinishGameSessionV13 = finishGameSessionV6;
    finishGameSessionV6 = function() {
      const snapshot = typeof gameSessionV6 !== "undefined" && gameSessionV6 ? {
        correct: gameSessionV6.correct,
        target: gameSessionV6.target
      } : { correct: 0, target: 0 };
      const context = activeSessionContextV13 ? { ...activeSessionContextV13 } : null;
      baseFinishGameSessionV13();
      if (context?.type === "challenge") {
        saveChallengeResultV13(snapshot.correct, snapshot.target);
        setTimeout(addChallengeResultButtonV13, 0);
      } else if (context?.type === "topic") {
        saveTopicPracticeResultV13(context.topic, snapshot.correct, snapshot.target);
      }
      activeSessionContextV13 = null;
      renderReturnHubV13();
    };
  }

  if (typeof startTopicPracticeV12 === "function") {
    const baseStartTopicPracticeV13 = startTopicPracticeV12;
    startTopicPracticeV12 = function(topic) {
      activeSessionContextV13 = { type: "topic", topic };
      baseStartTopicPracticeV13(topic);
    };
  }

  if (typeof renderTopicPacksV12 === "function") {
    const baseRenderTopicPacksV13 = renderTopicPacksV12;
    renderTopicPacksV12 = function() {
      baseRenderTopicPacksV13();
      decorateTopicPacksV13();
    };
  }

  if (typeof openTopicPackV12 === "function") {
    const baseOpenTopicPackV13 = openTopicPackV12;
    openTopicPackV12 = function(packId) {
      baseOpenTopicPackV13(packId);
      injectTopicDialogProgressV13(packId);
    };
  }

  if (typeof saveTopicWordsV12 === "function") {
    const baseSaveTopicWordsV13 = saveTopicWordsV12;
    saveTopicWordsV12 = function(topic) {
      baseSaveTopicWordsV13(topic);
      renderTopicPacksV12?.();
      if (typeof activeTopicPackV12 !== "undefined" && activeTopicPackV12?.id) injectTopicDialogProgressV13(activeTopicPackV12.id);
      renderReturnHubV13();
    };
  }

  if (typeof toggleStoryCompleted === "function") {
    const baseToggleStoryCompletedV13 = toggleStoryCompleted;
    toggleStoryCompleted = function(storyId) {
      baseToggleStoryCompletedV13(storyId);
      renderTopicPacksV12?.();
      renderReturnHubV13();
    };
  }

  if (typeof toggleFavorite === "function") {
    const baseToggleFavoriteV13 = toggleFavorite;
    toggleFavorite = function(item) {
      baseToggleFavoriteV13(item);
      renderTopicPacksV12?.();
      renderReturnHubV13();
    };
  }

  if (typeof getStudyPointsV8 === "function") {
    const baseStudyPointsV13 = getStudyPointsV8;
    getStudyPointsV8 = function(day) {
      return baseStudyPointsV13(day) + (Number(day.challenge) || 0) * 4;
    };
  }

  if (typeof renderProgressDashboardV8 === "function") {
    const baseRenderProgressV13 = renderProgressDashboardV8;
    renderProgressDashboardV8 = function() {
      baseRenderProgressV13();
      const grid = document.querySelector("#progressDashboard .progress-stat-grid");
      if (!grid || grid.querySelector("[data-v13-stat]")) return;
      const completedChallenges = Object.values(getChallengeStoreV13()).filter(item => item.completed).length;
      const mistakes = getUnresolvedMistakesV13().length;
      grid.insertAdjacentHTML("beforeend", `
        <article data-v13-stat="challenge"><strong>${completedChallenges}</strong><span>Günlük meydan okuma</span></article>
        <article data-v13-stat="mistakes"><strong>${mistakes}</strong><span>Odak kelimesi</span></article>`);
    };
  }

  if (typeof loadDictionary === "function") {
    const baseLoadDictionaryV13 = loadDictionary;
    loadDictionary = async function() {
      await baseLoadDictionaryV13();
      ensureMistakesButtonV13();
      renderTopicPacksV12?.();
      renderReturnHubV13();
      renderProgressDashboardV8?.();
    };
  }

  document.addEventListener("DOMContentLoaded", () => {
    const visits = Number(readV13(VISIT_COUNT_KEY_V13, 0)) + 1;
    writeV13(VISIT_COUNT_KEY_V13, visits);
    ensureReturnHubV13();
    ensureMistakesButtonV13();
    renderReturnHubV13();
    updateVisibleVersionV13();
    renderTopicPacksV12?.();

    window.addEventListener("beforeinstallprompt", () => setTimeout(renderReturnHubV13, 0));
    window.addEventListener("appinstalled", () => setTimeout(renderReturnHubV13, 0));
  });
})();
