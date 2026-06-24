
/* Almanca Aşkına v12 — Kelimeler Coşuyor */
const PRACTICAL_WORDS_PATH_V12 = "data/practical-words.json?v=12";
let smartSearchIndexV12 = [];
let activeTopicPackV12 = null;


function ensureTopicPackDialogV12() {
  let dialog = document.getElementById("topicPackDialog");
  if (!dialog) {
    document.body.insertAdjacentHTML("beforeend", `
      <dialog class="topic-pack-dialog" id="topicPackDialog" aria-labelledby="topicPackDialogTitle">
        <div class="topic-pack-dialog-inner" id="topicPackDialogInner"></div>
      </dialog>
    `);
    dialog = document.getElementById("topicPackDialog");
  }

  if (dialog && !dialog.dataset.boundV12) {
    dialog.dataset.boundV12 = "true";
    dialog.addEventListener("click", event => {
      if (event.target === dialog) dialog.close?.();
    });
  }

  return dialog;
}

function getTopicPacksV12() { return Array.isArray(window.TOPIC_PACKS_DATA) ? window.TOPIC_PACKS_DATA : []; }
function getWordFamiliesV12() { return Array.isArray(window.WORD_FAMILIES_DATA) ? window.WORD_FAMILIES_DATA : []; }
function getPhrasesV12() { return Array.isArray(window.PHRASES_DATA) ? window.PHRASES_DATA : []; }

function normalizeLooseGermanV12(value) {
  return String(value || "").toLocaleLowerCase("de-DE")
    .replace(/ä/g,"a").replace(/ö/g,"o").replace(/ü/g,"u").replace(/ß/g,"ss")
    .normalize("NFD").replace(/[\u0300-\u036f]/g,"")
    .replace(/[^a-z0-9]+/g,"").trim();
}

function levenshteinV12(a,b) {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const row = Array.from({length:b.length+1},(_,i)=>i);
  for (let i=1;i<=a.length;i++) {
    let prev=row[0]; row[0]=i;
    for (let j=1;j<=b.length;j++) {
      const old=row[j];
      row[j]=Math.min(row[j]+1,row[j-1]+1,prev+(a[i-1]===b[j-1]?0:1));
      prev=old;
    }
  }
  return row[b.length];
}

function rebuildSmartSearchV12() {
  smartSearchIndexV12 = dictionaryData.map(item => {
    const forms = [item.word,item.raw,item.key,item.id,...(item.aliases||[])].filter(Boolean);
    return {item, forms:[...new Set(forms.map(normalizeLooseGermanV12).filter(Boolean))]};
  });
}

const baseLoadDictionaryV12 = loadDictionary;
loadDictionary = async function() {
  await baseLoadDictionaryV12();
  try {
    const response = await fetch(PRACTICAL_WORDS_PATH_V12);
    const practical = response.ok ? await response.json() : [];
    dictionaryData = mergeDictionaryData(dictionaryData, Array.isArray(practical) ? practical : []);
    buildStoryWordLookup();
    rebuildSmartSearchV12();
    prepareFirstGameWord();
    updateContentStatsV12();
    renderTopicPacksV12();
    if (typeof renderWordOfDayV9 === "function") renderWordOfDayV9();
  } catch (error) {
    console.warn("Pratik kelime verisi yüklenemedi:", error);
  }
};

const baseFindDictionaryItemV12 = findDictionaryItem;
findDictionaryItem = function(cleanQuery) {
  const normal = normalizeLooseGermanV12(String(cleanQuery||"").replace(/_/g," "));
  if (!normal) return null;
  const exact = smartSearchIndexV12.find(entry => entry.forms.includes(normal));
  if (exact) return exact.item;
  const prefix = smartSearchIndexV12.find(entry => entry.forms.some(form => form.startsWith(normal) || normal.startsWith(form)));
  if (prefix) return prefix.item;
  let best=null, bestDistance=99;
  const limit = normal.length <= 5 ? 1 : 2;
  for (const entry of smartSearchIndexV12) {
    for (const form of entry.forms) {
      if (Math.abs(form.length-normal.length)>limit) continue;
      const distance=levenshteinV12(normal,form);
      if (distance<bestDistance) { best=entry.item; bestDistance=distance; }
      if (distance===0) return entry.item;
    }
  }
  return bestDistance<=limit ? best : baseFindDictionaryItemV12(cleanQuery);
};

function updateContentStatsV12() {
  const wordCount=document.getElementById("heroWordCount");
  const storyCount=document.getElementById("heroStoryCount");
  const phraseCount=document.getElementById("heroPhraseCount");
  if(wordCount) wordCount.textContent=`${dictionaryData.length.toLocaleString("tr-TR")}+`;
  if(storyCount) storyCount.textContent=String(getStoriesData().length);
  if(phraseCount) phraseCount.textContent=String(getPhrasesV12().length);
  const quick=document.getElementById("phraseCount");
  if(quick) quick.textContent=String(getPhrasesV12().length);
}

function getTopicWordItemsV12(topic) {
  return dictionaryData.filter(item => item.topic === topic);
}
function getTopicPhraseItemsV12(topic) {
  return getPhrasesV12().filter(item => item.topic === topic || (item.tags||[]).includes(topic));
}

function renderTopicPacksV12() {
  ensureTopicPackDialogV12();
  const grid=document.getElementById("topicPackGrid");
  if(!grid) return;
  const packs=getTopicPacksV12();
  grid.innerHTML=packs.map((pack,index)=>{
    const wordCount=getTopicWordItemsV12(pack.topic).length;
    const phraseCount=getTopicPhraseItemsV12(pack.topic).length;
    return `<button type="button" class="topic-pack-card" data-topic-pack="${escapeHtml(pack.id)}">
      <span class="topic-pack-icon">${escapeHtml(pack.icon||"Aa")}</span>
      <div><small>${escapeHtml(pack.germanTitle||"")}</small><strong>${escapeHtml(pack.title)}</strong><p>${escapeHtml(pack.description)}</p></div>
      <footer><em>${wordCount} kelime</em><em>${phraseCount} kalıp</em><b>${String(index+1).padStart(2,"0")}</b></footer>
    </button>`;
  }).join("");
  grid.querySelectorAll("[data-topic-pack]").forEach(button=>button.addEventListener("click",()=>openTopicPackV12(button.dataset.topicPack)));
}

function openTopicPackV12(packId) {
  const pack=getTopicPacksV12().find(item=>item.id===packId);
  const dialog=ensureTopicPackDialogV12();
  const mount=dialog?.querySelector("#topicPackDialogInner");
  if(!pack||!dialog||!mount) return;
  activeTopicPackV12=pack;
  const words=getTopicWordItemsV12(pack.topic).slice(0,36);
  const phrases=getTopicPhraseItemsV12(pack.topic).slice(0,16);
  const story=getStoriesData().find(item=>item.id===pack.storyId);
  mount.innerHTML=`
    <button type="button" class="topic-pack-close" id="closeTopicPackV12" aria-label="Kapat">×</button>
    <header><span class="topic-pack-dialog-icon">${escapeHtml(pack.icon||"Aa")}</span><div><small>${escapeHtml(pack.germanTitle)}</small><h2>${escapeHtml(pack.title)}</h2><p>${escapeHtml(pack.description)}</p></div></header>
    <div class="topic-pack-summary"><span><strong>${words.length}</strong> kelime</span><span><strong>${phrases.length}</strong> kalıp</span><span><strong>${story?1:0}</strong> hikâye</span></div>
    <div class="topic-pack-actions">
      <button type="button" id="startTopicPracticeV12">10 soruluk tekrar</button>
      <button type="button" id="saveTopicWordsV12">Kelimeleri deftere ekle</button>
      ${story?'<button type="button" id="openTopicStoryV12">Hikâyeyi oku</button>':''}
    </div>
    <section><h3>Öne çıkan kelimeler</h3><div class="topic-word-chips">${words.map(item=>`<button type="button" data-topic-word="${escapeHtml(item.word)}"><strong>${escapeHtml(getGermanDisplay(item))}</strong><small>${escapeHtml(item.tr)}</small></button>`).join("")}</div></section>
    <section><h3>Günlük kalıplar</h3><div class="topic-phrase-list">${phrases.map(item=>`<article><strong>${escapeHtml(item.expression)}</strong><span>${escapeHtml(item.tr)}</span><small>${escapeHtml(item.exampleDe)}</small></article>`).join("")}</div></section>`;
  if (dialog.showModal) { if (!dialog.open) dialog.showModal(); } else { dialog.setAttribute("open", ""); }
  document.getElementById("closeTopicPackV12")?.addEventListener("click",()=>dialog.close?.());
  document.getElementById("startTopicPracticeV12")?.addEventListener("click",()=>startTopicPracticeV12(pack.topic));
  document.getElementById("saveTopicWordsV12")?.addEventListener("click",()=>saveTopicWordsV12(pack.topic));
  document.getElementById("openTopicStoryV12")?.addEventListener("click",()=>{ dialog.close?.(); openStory(pack.storyId); document.getElementById("reading")?.scrollIntoView({behavior:"smooth"}); });
  mount.querySelectorAll("[data-topic-word]").forEach(button=>button.addEventListener("click",()=>{ dialog.close?.(); chooseSearchSuggestion(button.dataset.topicWord); document.getElementById("dictionary")?.scrollIntoView({behavior:"smooth"}); }));
}

function startTopicPracticeV12(topic) {
  const words=getTopicWordItemsV12(topic).filter(item=>item.tr).sort(()=>Math.random()-.5).slice(0,10).map(item=>({...item,gameMode:"meaning"}));
  if(!words.length) return;
  document.getElementById("topicPackDialog")?.close?.();
  if(typeof startGameSessionV6 === "function") startGameSessionV6(words);
  document.getElementById("game")?.scrollIntoView({behavior:"smooth",block:"start"});
}

function saveTopicWordsV12(topic) {
  let added=0;
  getTopicWordItemsV12(topic).forEach(item=>{
    if(!isFavorite(item)){ toggleFavorite(item); added++; }
  });
  const button=document.getElementById("saveTopicWordsV12");
  if(button){ button.textContent=added?`${added} kelime eklendi`:"Kelimeler zaten defterde"; button.disabled=true; }
}

function findFamilyForItemV12(item) {
  const target=normalizeLooseGermanV12(item.word);
  return getWordFamiliesV12().find(family=>family.members.some(member=>normalizeLooseGermanV12(member.word)===target));
}

const baseRenderFoundResultV12 = renderFoundResult;
renderFoundResult = function(item) {
  baseRenderFoundResultV12(item);
  injectContentExtrasV12(item);
};

function injectContentExtrasV12(item) {
  const preview=document.getElementById("resultPreview");
  if(!preview) return;
  const family=findFamilyForItemV12(item);
  const topicLabel=item.topicLabel || getTopicPacksV12().find(pack=>pack.topic===item.topic)?.title;
  const sourceLabel=item.source?.includes("pratik") ? "Almanca Aşkına günlük pratik verisi" : "A1/A2 çekirdek sözlük";
  preview.insertAdjacentHTML("beforeend",`
    <div class="content-extra-actions">
      <button type="button" id="downloadWordCardV12">PNG kelime kartı oluştur</button>
      ${item.topic?`<button type="button" id="openWordTopicV12">${escapeHtml(topicLabel||"Konu paketini aç")}</button>`:""}
    </div>
    <div class="content-source-note"><span>${escapeHtml(sourceLabel)}</span>${item.officialLevel===false?'<em>CEFR+ günlük kullanım</em>':''}</div>
    ${family?`<section class="word-family-panel"><div><span>Kelime ailesi</span><strong>${escapeHtml(family.title)}</strong></div><div>${family.members.map(member=>`<button type="button" data-family-word="${escapeHtml(member.word)}"><b>${escapeHtml(member.word)}</b>${member.tr?`<small>${escapeHtml(member.tr)}</small>`:""}</button>`).join("")}</div></section>`:""}
  `);
  document.getElementById("downloadWordCardV12")?.addEventListener("click",()=>downloadWordCardV12(item));
  document.getElementById("openWordTopicV12")?.addEventListener("click",()=>openTopicPackV12(`pack-${item.topic}`));
  preview.querySelectorAll("[data-family-word]").forEach(button=>button.addEventListener("click",()=>chooseSearchSuggestion(button.dataset.familyWord)));
}

function wrapCanvasTextV12(ctx,text,maxWidth) {
  const words=String(text||"").split(/\s+/); const lines=[]; let line="";
  for(const word of words){ const test=line?`${line} ${word}`:word; if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word;}else line=test; }
  if(line) lines.push(line); return lines;
}

function drawBrandLogoOnCanvasV154(ctx, x, y, size) {
  const r = size / 2;
  ctx.save();
  ctx.fillStyle = "#1E40FF";
  ctx.beginPath();
  ctx.arc(x + r, y + r, r, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = Math.max(4, size * 0.055);
  ctx.beginPath();
  ctx.arc(x + r, y + r, r - size * 0.12, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = "#FFFFFF";
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = Math.max(4, size * 0.045);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  const cx = x + r;
  const top = y + size * 0.33;
  const bottom = y + size * 0.68;
  const left = x + size * 0.25;
  const right = x + size * 0.75;

  ctx.beginPath();
  ctx.moveTo(cx, bottom);
  ctx.quadraticCurveTo(x + size * 0.38, y + size * 0.58, left, bottom);
  ctx.lineTo(left, top);
  ctx.quadraticCurveTo(x + size * 0.38, y + size * 0.32, cx, y + size * 0.45);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.moveTo(cx, bottom);
  ctx.quadraticCurveTo(x + size * 0.62, y + size * 0.58, right, bottom);
  ctx.lineTo(right, top);
  ctx.quadraticCurveTo(x + size * 0.62, y + size * 0.32, cx, y + size * 0.45);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = "#1E40FF";
  ctx.lineWidth = Math.max(2, size * 0.018);
  ctx.beginPath();
  ctx.moveTo(cx, y + size * 0.43);
  ctx.lineTo(cx, bottom);
  ctx.stroke();
  ctx.restore();
}

function downloadWordCardV12(item) {
  const canvas=document.createElement("canvas"); canvas.width=1080; canvas.height=1080;
  const ctx=canvas.getContext("2d");

  ctx.fillStyle="#F7F8FC"; ctx.fillRect(0,0,1080,1080);
  ctx.fillStyle="#1E40FF"; ctx.fillRect(0,0,1080,28);

  // Card surface
  ctx.fillStyle="#FFFFFF";
  ctx.fillRect(64,64,952,952);
  ctx.strokeStyle="#DCE3FF"; ctx.lineWidth=2; ctx.strokeRect(64,64,952,952);

  // Marka alanı
  ctx.fillStyle="#1E40FF"; ctx.font="800 34px system-ui"; ctx.fillText("ALMANCA AŞKINA",92,132);
  ctx.fillStyle="#667085"; ctx.font="600 22px system-ui"; ctx.fillText("Sade Almanca çalışma kartı",92,166);

  // Sağ üst gerçek marka izi
  drawBrandLogoOnCanvasV154(ctx, 890, 88, 92);
  ctx.fillStyle="#0B0F19"; ctx.font="800 24px system-ui"; ctx.textAlign="right";
  ctx.fillText("Almanca Aşkına",982,210);
  ctx.textAlign="left";

  ctx.fillStyle="#0B0F19"; ctx.font="900 90px system-ui";
  const display=getGermanDisplay(item); wrapCanvasTextV12(ctx,display,820).slice(0,2).forEach((line,i)=>ctx.fillText(line,92,318+i*104));

  ctx.fillStyle="#1E40FF"; ctx.font="750 48px system-ui";
  wrapCanvasTextV12(ctx,item.tr,860).slice(0,3).forEach((line,i)=>ctx.fillText(line,92,560+i*62));

  const example=item.examples?.[0]||"";
  ctx.fillStyle="#2A2F36"; ctx.font="500 34px system-ui";
  wrapCanvasTextV12(ctx,example,860).slice(0,3).forEach((line,i)=>ctx.fillText(line,92,780+i*50));

  ctx.fillStyle="#667085"; ctx.font="650 26px system-ui";
  ctx.fillText(`${item.level||"A1/A2"} · ${getPosLabel(item.pos)}${item.topicLabel?` · ${item.topicLabel}`:""}`,92,948);

  // Alt marka izi
  ctx.fillStyle="#1E40FF"; ctx.font="800 24px system-ui";
  ctx.fillText("almancaaskina.vercel.app",92,990);

  const link=document.createElement("a"); link.download=`almanca-askina-${normalizeGerman(item.word)}.png`; link.href=canvas.toDataURL("image/png"); link.click();
}

document.addEventListener("DOMContentLoaded",()=>{ renderTopicPacksV12(); });
