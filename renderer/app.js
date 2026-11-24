'use strict';
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const api = window.clipdesk;

const state = { videoPath: null, duration: 0, settings: {}, logoData: null, thumbImg: null, chat: [], words: [], subs: [] };
const VIDEO_RE = /\.(mp4|mov|m4v|mkv|webm|avi)$/i;

// ---------- helpers ----------
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toast.t);
  toast.t = setTimeout(() => t.classList.remove('show'), 3800);
}
function fmt(sec) {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  const p = n => String(n).padStart(2, '0');
  return h ? `${h}:${p(m)}:${p(s)}` : `${m}:${p(s)}`;
}
function parseTime(str) {
  str = String(str || '').trim();
  if (!str) return null;
  const parts = str.split(':').map(Number);
  if (parts.some(n => !Number.isFinite(n) || n < 0) || parts.length > 3) return null;
  return parts.reduce((acc, n) => acc * 60 + n, 0);
}
function loadImg(src) {
  return new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = () => rej(new Error('Could not load image.'));
    i.src = src;
  });
}
function copy(text) {
  navigator.clipboard.writeText(text).then(() => toast('Copied.')).catch(() => toast('Could not copy.'));
}
function fileName(p) { return String(p || '').split('/').pop(); }

// ---------- tabs ----------
function showTab(name) {
  $$('#nav button').forEach(b => b.classList.toggle('on', b.dataset.tab === name));
  $$('.tab').forEach(s => { s.hidden = s.id !== 'tab-' + name; });
  if (name === 'thumbs') drawThumb();
}
$$('#nav button').forEach(b => b.addEventListener('click', () => showTab(b.dataset.tab)));

// ---------- settings ----------
async function refreshSettings() {
  state.settings = await api.getSettings();
  const s = state.settings;
  $('#logoName').textContent = s.logoPath ? fileName(s.logoPath) : 'none yet';
  $('#logoPos').value = s.logoPos;
  $('#logoScale').value = s.logoScale;
  $('#logoScaleV').textContent = s.logoScale + '%';
  $('#outDir').textContent = s.outputDir;
  $('#modelIn').value = s.model;
  $('#keyState').textContent = s.hasKey ? 'A key is saved.' : 'No key saved yet.';
  state.logoData = null;
  if (s.logoPath) {
    try { state.logoData = await loadImg(await api.readImage(s.logoPath)); } catch { state.logoData = null; }
  }
  drawThumb();
}

$('#keySave').addEventListener('click', async () => {
  const v = $('#keyIn').value.trim();
  if (!v) return toast('Paste your key first.');
  await api.setKey(v);
  $('#keyIn').value = '';
  await refreshSettings();
  toast('Key saved.');
});
$('#keyDel').addEventListener('click', async () => { await api.setKey(''); await refreshSettings(); toast('Key removed.'); });
$('#keyTest').addEventListener('click', async () => {
  try {
    const r = await api.ask({ system: 'Reply with the single word OK.', messages: [{ role: 'user', content: 'Test' }], maxTokens: 20 });
    toast('Works: ' + r.slice(0, 40));
  } catch (e) { toast(e.message); }
});
$('#modelSave').addEventListener('click', async () => {
  const v = $('#modelIn').value.trim();
  if (!v) return;
  await api.setSettings({ model: v });
  toast('Model saved.');
});

// ---------- WATCH ----------
const web = $('#web');
let streamers = [];
try { streamers = JSON.parse(localStorage.getItem('streamers') || '[]'); } catch { streamers = []; }
if (!streamers.length) streamers = ['kaicenat', 'xqc', 'ibai'];

function go(url) {
  url = url.trim();
  if (!url) return;
  if (!/^https?:\/\//i.test(url)) url = 'https://' + url;
  try { url = new URL(url).toString(); } catch { return toast('That link does not look right.'); }
  if (!url.startsWith('https://')) return toast('Only https links are allowed.');
  web.src = url;
  $('#wUrl').value = url;
}
function renderChips() {
  const box = $('#wChips');
  box.textContent = '';
  streamers.forEach(n => {
    const b = document.createElement('button');
    b.className = 'chip';
    b.textContent = n;
    b.title = 'Open (right-click to remove)';
    b.addEventListener('click', () => go('https://www.twitch.tv/' + n));
    b.addEventListener('contextmenu', e => {
      e.preventDefault();
      streamers = streamers.filter(x => x !== n);
      try { localStorage.setItem('streamers', JSON.stringify(streamers)); } catch {}
      renderChips();
    });
    box.appendChild(b);
  });
}
$('#wGo').addEventListener('click', () => go($('#wUrl').value));
$('#wUrl').addEventListener('keydown', e => { if (e.key === 'Enter') go(e.target.value); });
$('#wBack').addEventListener('click', () => { try { web.goBack(); } catch {} });
$('#wFwd').addEventListener('click', () => { try { web.goForward(); } catch {} });
$('#wReload').addEventListener('click', () => { try { web.reload(); } catch {} });
$('#wAddBtn').addEventListener('click', () => {
  const n = $('#wAdd').value.trim().toLowerCase().replace(/^@/, '');
  if (!/^[a-z0-9_]{1,25}$/.test(n)) return toast('That does not look like a Twitch name.');
  if (!streamers.includes(n)) streamers.push(n);
  try { localStorage.setItem('streamers', JSON.stringify(streamers)); } catch {}
  $('#wAdd').value = '';
  renderChips();
});
web.addEventListener('did-navigate', e => { $('#wUrl').value = e.url; });
web.addEventListener('did-navigate-in-page', e => { if (e.isMainFrame) $('#wUrl').value = e.url; });
renderChips();

// ---------- STUDIO ----------
function loadVideo(p) {
  if (!VIDEO_RE.test(p)) return toast('Please choose a video file (mp4, mov, mkv, webm).');
  state.videoPath = p;
  state.duration = 0;
  const v = $('#vid');
  v.onloadedmetadata = () => {
    state.duration = v.duration || 0;
    $('#startT').value = '0:00';
    $('#endT').value = state.duration ? fmt(state.duration) : '';
  };
  v.onerror = () => toast('Preview is not supported for this file, but exporting still works. Type the times by hand.');
  v.src = api.fileUrl(p);
  $('#vidName').textContent = fileName(p);
  $('#thName').textContent = 'Using video: ' + fileName(p);
}
$('#pickVideo').addEventListener('click', async () => { const p = await api.openFile('video'); if (p) loadVideo(p); });
const drop = $('#drop');
['dragenter', 'dragover'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.add('over'); }));
['dragleave', 'drop'].forEach(ev => drop.addEventListener(ev, e => { e.preventDefault(); drop.classList.remove('over'); }));
drop.addEventListener('drop', e => {
  const f = e.dataTransfer.files[0];
  if (f) loadVideo(api.pathForFile(f));
});
window.addEventListener('dragover', e => e.preventDefault());
window.addEventListener('drop', e => e.preventDefault());

$('#setStart').addEventListener('click', () => { $('#startT').value = fmt($('#vid').currentTime); });
$('#setEnd').addEventListener('click', () => { $('#endT').value = fmt($('#vid').currentTime); });

$('#pickLogo').addEventListener('click', async () => {
  const p = await api.openFile('image');
  if (!p) return;
  await api.setSettings({ logoPath: p });
  $('#addLogo').checked = true;
  await refreshSettings();
});
$('#logoPos').addEventListener('change', async e => { await api.setSettings({ logoPos: e.target.value }); state.settings.logoPos = e.target.value; drawThumb(); });
$('#logoScale').addEventListener('input', e => { $('#logoScaleV').textContent = e.target.value + '%'; state.settings.logoScale = +e.target.value; drawThumb(); });
$('#logoScale').addEventListener('change', e => api.setSettings({ logoScale: +e.target.value }));
$('#pickOut').addEventListener('click', async () => {
  const p = await api.openFile('folder');
  if (!p) return;
  await api.setSettings({ outputDir: p });
  await refreshSettings();
});

$('#exportBtn').addEventListener('click', async () => {
  if (!state.videoPath) return toast('Choose a video first.');
  const start = parseTime($('#startT').value) ?? 0;
  const endRaw = $('#endT').value.trim();
  const end = endRaw ? parseTime(endRaw) : null;
  if (endRaw && end === null) return toast('End time looks wrong. Use 1:30 or 90.');
  if (end !== null && end <= start) return toast('End must be after start.');
  const addLogo = $('#addLogo').checked;
  if (addLogo && !state.settings.logoPath) return toast('Choose your logo first.');
  const btn = $('#exportBtn'), prog = $('#prog'), result = $('#result');
  btn.disabled = true; btn.textContent = 'Exporting...';
  prog.hidden = false; prog.value = 0; result.textContent = '';
  api.onProgress(v => { prog.value = v; });
  try {
    const orientation = $('input[name=orient]:checked').value;
    let captions = [], captionH = 400;
    if ($('#burnSubs').checked) {
      if (!state.subs.length) throw new Error('No subtitles yet. Make them in the Subtitles tab first, or untick the box.');
      const rendered = renderCaptionPngs(orientation === 'vertical' ? 1080 : 1920, start, end);
      captions = rendered.caps; captionH = rendered.h;
      if (!captions.length) throw new Error('None of your subtitles fall inside the Start/End range.');
    }
    const r = await api.convert({
      captions, captionH, captionPos: $('#sbPos').value,
      input: state.videoPath, start, end, duration: state.duration,
      orientation,
      fit: $('#fit').value,
      addLogo, logoPath: state.settings.logoPath,
      logoPos: $('#logoPos').value, logoScale: +$('#logoScale').value,
      outputDir: state.settings.outputDir,
    });
    prog.value = 1;
    result.textContent = '';
    const a = document.createElement('button');
    a.className = 'ghost'; a.textContent = 'Show in Finder';
    a.addEventListener('click', () => api.showInFolder(r.output));
    result.append('Saved: ' + fileName(r.output) + ' ', a);
  } catch (e) {
    result.textContent = e.message;
  } finally {
    btn.disabled = false; btn.textContent = 'Export clip';
  }
});

// ---------- THUMBNAILS ----------
const cv = $('#cv'), ctx = cv.getContext('2d');
let thumbSource = null; // {type:'video'|'image', path}

function wrapLines(text, maxW) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const w of words) {
    const test = line ? line + ' ' + w : w;
    if (ctx.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}
function drawThumb() {
  const W = cv.width, H = cv.height;
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#111'; ctx.fillRect(0, 0, W, H);
  const img = state.thumbImg;
  if (img) {
    const r = Math.max(W / img.width, H / img.height);
    const w = img.width * r, h = img.height * r;
    ctx.drawImage(img, (W - w) / 2, (H - h) / 2, w, h);
  } else {
    ctx.fillStyle = '#666'; ctx.font = '36px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Choose a video or image', W / 2, H / 2);
  }
  if ($('#thDark').checked && img) {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'rgba(0,0,0,0.35)'); g.addColorStop(0.5, 'rgba(0,0,0,0.05)'); g.addColorStop(1, 'rgba(0,0,0,0.7)');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  const text = $('#thText').value.trim().toUpperCase();
  if (text) {
    const size = +$('#thSize').value;
    ctx.font = `900 ${size}px Impact, "Arial Black", "Helvetica Neue", sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(8, size * 0.14);
    const lines = wrapLines(text, W - 120);
    const lh = size * 1.05, blockH = lines.length * lh;
    const pos = $('#thPos').value;
    let y0 = pos === 'top' ? 50 + size : pos === 'mid' ? (H - blockH) / 2 + size : H - 50 - blockH + size;
    lines.forEach((ln, i) => {
      const y = y0 + i * lh;
      ctx.strokeStyle = '#000'; ctx.strokeText(ln, W / 2, y);
      ctx.fillStyle = $('#thColor').value; ctx.fillText(ln, W / 2, y);
    });
  }
  if ($('#thLogo').checked && state.logoData) {
    const lg = state.logoData;
    const lw = Math.min(W * 0.4, W * (state.settings.logoScale || 14) / 100 * 1.4);
    const lh = lw * lg.height / lg.width;
    const m = 30, pos = state.settings.logoPos || 'br';
    const x = pos.endsWith('l') ? m : W - lw - m;
    const y = pos.startsWith('t') ? m : H - lh - m;
    ctx.drawImage(lg, x, y, lw, lh);
  }
}
['thText', 'thPos', 'thSize', 'thColor', 'thDark', 'thLogo'].forEach(id => {
  $('#' + id).addEventListener('input', drawThumb);
  $('#' + id).addEventListener('change', drawThumb);
});
$('#thPick').addEventListener('click', async () => {
  const p = await api.openFile('media');
  if (!p) return;
  try {
    if (VIDEO_RE.test(p)) {
      thumbSource = { type: 'video', path: p };
      $('#thName').textContent = 'Using video: ' + fileName(p);
      await grabFrame();
    } else {
      thumbSource = { type: 'image', path: p };
      $('#thName').textContent = 'Using image: ' + fileName(p);
      state.thumbImg = await loadImg(await api.readImage(p));
      drawThumb();
    }
  } catch (e) { toast(e.message); }
});
async function grabFrame() {
  const src = thumbSource || (state.videoPath ? { type: 'video', path: state.videoPath } : null);
  if (!src || src.type !== 'video') return toast('Choose a video first.');
  const t = parseTime($('#thTime').value) ?? 0;
  try {
    state.thumbImg = await loadImg(await api.grabFrame(src.path, t));
    drawThumb();
  } catch (e) { toast(e.message); }
}
$('#thGrab').addEventListener('click', grabFrame);
$('#thSave').addEventListener('click', async () => {
  if (!state.thumbImg) return toast('Choose a video or image first.');
  try {
    const p = await api.saveImage(cv.toDataURL('image/png'), 'thumbnail');
    if (p) toast('Saved ' + fileName(p));
  } catch (e) { toast(e.message); }
});

// ---------- CAPTIONS ----------
const CAPTION_SYSTEM = `You write titles, captions and hashtags for gaming videos that a creator posts on YouTube and Facebook.
Rules:
- Write like a real person talking to friends. No corporate or "AI" phrasing. At most 2 emojis in total.
- Only use facts that are in the description the user gives you. Never invent leaks, release details, quotes or numbers.
- No fake claims such as "LEAKED", "OFFICIAL" or "BREAKING" unless the user says so. Don't imply the channel is run by the game's publisher.
- YouTube titles stay under 70 characters.
- Thumbnail texts are 1 to 4 words, in ALL CAPS.
- Write everything in English only.
Reply with ONLY valid JSON, no code fences, in this shape:
{"titles":[5 strings],"thumbnail_texts":[6 strings],"caption":"string","hashtags":[8 strings without #]}`;

function parseJson(text) {
  const clean = text.replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  const a = clean.indexOf('{'), b = clean.lastIndexOf('}');
  return JSON.parse(clean.slice(a, b + 1));
}
function group(title, items, extra) {
  const g = document.createElement('div');
  g.className = 'grp';
  const h = document.createElement('h3'); h.textContent = title; g.appendChild(h);
  items.forEach(t => {
    const row = document.createElement('div'); row.className = 'item';
    const s = document.createElement('span'); s.textContent = t;
    const c = document.createElement('button'); c.className = 'ghost'; c.textContent = 'Copy';
    c.addEventListener('click', () => copy(t));
    row.append(s, c);
    if (extra) row.appendChild(extra(t));
    g.appendChild(row);
  });
  return g;
}
$('#cpGo').addEventListener('click', async () => {
  const desc = $('#cpDesc').value.trim();
  if (!desc) return toast('Describe the clip first.');
  const btn = $('#cpGo'), out = $('#cpOut');
  btn.disabled = true; btn.textContent = 'Writing...';
  out.textContent = '';
  try {
    const prompt = `Topic: ${$('#cpTopic').value}\nPlatform: ${$('#cpPlat').value}\nLanguage: English\nTone: ${$('#cpTone').value}\nWhat happens in the video: ${desc}`;
    const raw = await api.ask({ system: CAPTION_SYSTEM, messages: [{ role: 'user', content: prompt }], maxTokens: 1500 });
    let j;
    try { j = parseJson(raw); } catch { j = null; }
    if (!j) {
      const p = document.createElement('div'); p.className = 'grp'; p.style.whiteSpace = 'pre-wrap'; p.textContent = raw; out.appendChild(p);
      return;
    }
    out.appendChild(group('Titles', j.titles || []));
    out.appendChild(group('Thumbnail text (click Use)', j.thumbnail_texts || [], t => {
      const u = document.createElement('button'); u.textContent = 'Use';
      u.addEventListener('click', () => { $('#thText').value = t; showTab('thumbs'); drawThumb(); });
      return u;
    }));
    out.appendChild(group('Caption', [j.caption || '']));
    const tags = (j.hashtags || []).map(h => '#' + String(h).replace(/^#/, ''));
    out.appendChild(group('Hashtags', [tags.join(' ')]));
  } catch (e) {
    out.textContent = e.message;
  } finally {
    btn.disabled = false; btn.textContent = 'Generate';
  }
});

// ---------- IDEAS ----------
const IDEAS_SYSTEM = () => `You are a content strategist for a creator who makes GTA 6 videos for YouTube and Facebook. Today is ${new Date().toDateString()}.
Suggest only ideas that can be made legally and originally: the creator's own gameplay recordings, their own commentary and voice, tips, guides, comparisons, tier lists, reactions and news explainers in the creator's own words. Short clips of other people's footage only with permission.
For each idea give: a working title, the hook for the first 3 seconds, the format and length, and what footage is needed. Keep it tight and practical. If the web search tool is available, use it for what is trending and say what you found. Never invent facts about the game.`;
const QUICK = [
  '10 video ideas for this week',
  '5 Shorts ideas I can make in under an hour',
  'What are people searching for about GTA 6 right now?',
  'Give me a 7 day posting plan for YouTube and Facebook'
];
function addMsg(role, text) {
  const d = document.createElement('div');
  d.className = 'msg ' + (role === 'user' ? 'user' : 'ai');
  d.textContent = text;
  $('#chat').appendChild(d);
  $('#chat').scrollTop = $('#chat').scrollHeight;
  return d;
}
async function sendIdea(text) {
  text = (text || $('#idIn').value).trim();
  if (!text) return;
  $('#idIn').value = '';
  state.chat.push({ role: 'user', content: text });
  addMsg('user', text);
  const wait = addMsg('ai', 'Thinking...');
  $('#idSend').disabled = true;
  try {
    const r = await api.ask({ system: IDEAS_SYSTEM(), messages: state.chat.slice(-20), webSearch: $('#idWeb').checked, maxTokens: 2500 });
    wait.textContent = r || '(empty reply)';
    state.chat.push({ role: 'assistant', content: r || '(empty reply)' });
  } catch (e) {
    wait.textContent = e.message;
    state.chat.pop();
  } finally {
    $('#idSend').disabled = false;
  }
}
QUICK.forEach(q => {
  const b = document.createElement('button');
  b.className = 'chip'; b.textContent = q;
  b.addEventListener('click', () => sendIdea(q));
  $('#idChips').appendChild(b);
});
$('#idSend').addEventListener('click', () => sendIdea());
$('#idIn').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendIdea(); } });
$('#idClear').addEventListener('click', () => { state.chat = []; $('#chat').textContent = ''; });

// ---------- SUBTITLES (burned into the video) ----------
function groupWords(words, perCaption) {
  const subs = [];
  let cur = [];
  const flush = () => {
    if (!cur.length) return;
    subs.push({ start: cur[0].start, end: cur[cur.length - 1].end, text: cur.map(w => w.text).join(' ').replace(/\s+([,.!?;:])/g, '$1') });
    cur = [];
  };
  words.forEach((w, i) => {
    if (cur.length && w.start - cur[cur.length - 1].end > 0.7) flush();
    cur.push(w);
    const endsSentence = /[.!?]$/.test(w.text);
    if (cur.length >= perCaption || endsSentence || (cur[cur.length - 1].end - cur[0].start) > 2.6) flush();
  });
  flush();
  // keep captions from overlapping and make very short ones readable
  subs.forEach((s, i) => {
    const next = subs[i + 1];
    if (s.end - s.start < 0.45) s.end = s.start + 0.45;
    if (next && s.end > next.start) s.end = Math.max(s.start + 0.1, next.start);
  });
  return subs;
}
const r2 = n => Math.round(n * 100) / 100;

function renderSubList() {
  const box = $('#sbList');
  box.textContent = '';
  if (!state.subs.length) {
    const p = document.createElement('p'); p.className = 'muted'; p.textContent = 'Nothing yet. Transcribe, or add lines by hand.'; box.appendChild(p);
    return;
  }
  state.subs.forEach((s, i) => {
    const row = document.createElement('div'); row.className = 'sbrow';
    const a = document.createElement('input'); a.type = 'text'; a.className = 't'; a.value = fmt(s.start);
    const b = document.createElement('input'); b.type = 'text'; b.className = 't'; b.value = fmt(s.end);
    const x = document.createElement('input'); x.type = 'text'; x.className = 'x'; x.value = s.text;
    a.addEventListener('change', () => { const v = parseTime(a.value); if (v !== null) s.start = v; a.value = fmt(s.start); });
    b.addEventListener('change', () => { const v = parseTime(b.value); if (v !== null && v > s.start) s.end = v; b.value = fmt(s.end); });
    x.addEventListener('input', () => { s.text = x.value; });
    const seek = document.createElement('button'); seek.className = 'ghost'; seek.textContent = 'Go';
    seek.title = 'Jump to this time in the Studio preview';
    seek.addEventListener('click', () => { try { $('#vid').currentTime = s.start; } catch {} });
    const del = document.createElement('button'); del.className = 'ghost'; del.textContent = 'x';
    del.addEventListener('click', () => { state.subs.splice(i, 1); renderSubList(); });
    row.append(a, b, x, seek, del);
    box.appendChild(row);
  });
}

const sbPrev = $('#sbPrev'), sbx = sbPrev.getContext('2d');
function subStyle() {
  return { font: $('#sbFont').value, sizePct: +$('#sbSize').value, color: $('#sbColor').value, outline: $('#sbOutline').value, upper: $('#sbUpper').checked };
}
// draws one caption centered in a W x H transparent canvas context
function drawCaption(c, W, H, text, st, size) {
  c.clearRect(0, 0, W, H);
  c.font = `900 ${size}px "${st.font}", Impact, "Arial Black", sans-serif`;
  c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
  c.lineWidth = Math.max(6, size * 0.16);
  const t = st.upper ? text.toUpperCase() : text;
  const words = t.split(/\s+/).filter(Boolean), lines = [];
  let line = '';
  const maxW = W - 160;
  words.forEach(w => {
    const test = line ? line + ' ' + w : w;
    if (c.measureText(test).width > maxW && line) { lines.push(line); line = w; } else line = test;
  });
  if (line) lines.push(line);
  const lh = size * 1.18, y0 = H / 2 - ((lines.length - 1) * lh) / 2;
  lines.forEach((ln, i) => {
    const y = y0 + i * lh;
    c.strokeStyle = st.outline; c.strokeText(ln, W / 2, y);
    c.fillStyle = st.color; c.fillText(ln, W / 2, y);
  });
}
function drawSubPreview() {
  sbx.fillStyle = '#222'; sbx.fillRect(0, 0, sbPrev.width, sbPrev.height);
  const st = subStyle();
  const scale = sbPrev.width / 1080;
  const c = sbx;
  c.save();
  drawCaption(c, sbPrev.width, sbPrev.height, 'This is how it looks', st, Math.round(st.sizePct / 100 * 1080 * scale));
  c.restore();
}
['sbFont', 'sbSize', 'sbColor', 'sbOutline', 'sbUpper'].forEach(id => {
  $('#' + id).addEventListener('input', drawSubPreview);
  $('#' + id).addEventListener('change', drawSubPreview);
});

// renders one transparent PNG per caption that overlaps [start, end]; times are shifted so the clip starts at 0
function renderCaptionPngs(W, start, end) {
  const st = subStyle();
  const size = Math.round(st.sizePct / 100 * 1080);
  const h = Math.round(size * 1.18 * 3 + 40);
  const cvs = document.createElement('canvas');
  cvs.width = W; cvs.height = h;
  const c = cvs.getContext('2d');
  const caps = [];
  state.subs.forEach(s => {
    if (!s.text.trim()) return;
    const a = Math.max(s.start, start), b = end != null ? Math.min(s.end, end) : s.end;
    if (b - a < 0.05) return;
    drawCaption(c, W, h, s.text, st, size);
    caps.push({ start: r2(a - start), end: r2(b - start), png: cvs.toDataURL('image/png') });
  });
  return { caps, h };
}

$('#sbWords').addEventListener('input', e => { $('#sbWordsV').textContent = e.target.value; });
$('#sbRegroup').addEventListener('click', () => {
  if (!state.words.length) return toast('Transcribe first. Regrouping works on the transcribed words.');
  state.subs = groupWords(state.words, +$('#sbWords').value);
  renderSubList();
  toast('Regrouped. Your manual edits were replaced.');
});
$('#sbAdd').addEventListener('click', () => {
  const t = $('#vid').currentTime || 0;
  state.subs.push({ start: r2(t), end: r2(t + 2), text: 'New line' });
  state.subs.sort((a, b) => a.start - b.start);
  renderSubList();
});
$('#sbClear').addEventListener('click', () => { state.subs = []; state.words = []; renderSubList(); });

$('#sbGo').addEventListener('click', async () => {
  if (!state.videoPath) { toast('Choose a video in Studio first.'); return showTab('studio'); }
  const start = parseTime($('#startT').value) ?? 0;
  const endRaw = $('#endT').value.trim();
  const end = endRaw ? parseTime(endRaw) : null;
  if (end !== null && end <= start) return toast('End must be after start (set them in Studio).');
  const btn = $('#sbGo'), status = $('#sbStatus');
  btn.disabled = true; btn.textContent = 'Working...';
  api.onTranscribeStatus(m => { status.textContent = m; });
  try {
    state.words = await api.transcribe({ input: state.videoPath, start, end, model: $('#sbModel').value });
    state.subs = groupWords(state.words, +$('#sbWords').value);
    renderSubList();
    status.textContent = `Done: ${state.words.length} words. Fix any mistakes on the right.`;
    $('#burnSubs').checked = true;
  } catch (e) {
    status.textContent = e.message;
  } finally {
    btn.disabled = false; btn.textContent = 'Transcribe';
  }
});

// ---------- UPDATES ----------
let updDismissed = false;
function showUpdate(s) {
  if (!s) return;
  $('#verLine').textContent = 'Version ' + (s.current || '?') + (s.message ? '. ' + s.message : '');
  $('#updRestart').hidden = s.state !== 'ready';
  $('#updReleases').hidden = s.state !== 'needs-install';
  const banner = $('#upd');
  if ((s.state === 'ready' || s.state === 'needs-install') && !updDismissed) {
    $('#updText').textContent = s.state === 'ready' ? `ClipDesk ${s.version} is ready.` : 'A bigger update needs a new download.';
    $('#updNow').textContent = s.state === 'ready' ? 'Restart' : 'Open page';
    banner.hidden = false;
  } else {
    banner.hidden = true;
  }
  $('#updCheck').disabled = s.state === 'checking' || s.state === 'downloading';
}
$('#updCheck').addEventListener('click', () => { updDismissed = false; api.checkUpdate(); });
$('#updRestart').addEventListener('click', () => api.restartForUpdate());
$('#updReleases').addEventListener('click', () => api.openReleases());
$('#updNow').addEventListener('click', () => { if ($('#updNow').textContent === 'Restart') api.restartForUpdate(); else api.openReleases(); });
$('#updX').addEventListener('click', () => { updDismissed = true; $('#upd').hidden = true; });
api.onUpdate(showUpdate);
api.getUpdate().then(showUpdate).catch(() => {});

// ---------- init ----------
drawSubPreview();
refreshSettings();
drawThumb();
