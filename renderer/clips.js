'use strict';
// Clips: long video -> short clips (best moments or equal parts), with format, logo, title, subtitles and music.
(function () {
  addI18n({
    'nav.clips': 'Clips', 'cl.title': 'Clips', 'cl.sub': 'Long video → short clips for Shorts, Reels and TikTok', 'cl.openDir': 'Open folder',
    'cl.how': 'How it works',
    'cl.h1': 'Choose a long video – a stream, gameplay, a podcast.',
    'cl.h2': 'ClipDesk listens for loud reactions and watches for fast action, then suggests the best moments.',
    'cl.h3': 'Keep the ones you like, fix the start and end, add your logo and a title.',
    'cl.h4': 'Export: ready-to-post clips in the Clips folder.',
    'cl.legal': 'Only use your own gameplay or streams, or footage you have permission to use.',
    'cl.change': 'Change video', 'cl.best': 'Best moments', 'cl.split': 'Split into parts', 'cl.add': '+ Add as clip',
    'cl.find': 'Find the best moments', 'cl.many': 'How many', 'cl.len': 'Length', 'cl.look': 'Look for',
    'cl.lookBoth': 'Reactions and action', 'cl.lookLoud': 'Loud reactions', 'cl.lookAction': 'Fast action', 'cl.findBtn': 'Find moments',
    'cl.empty': 'No clips yet. Press "Find moments", or set a start and end above and add it yourself.',
    'cl.each': 'Each part', 'cl.exact': 'or exactly', 'cl.min': '{n} min', 'cl.which': 'Which part', 'cl.whole': 'Whole video', 'cl.from': 'or from', 'cl.to': 'to',
    'cl.lastPart': 'Last part', 'cl.lastShort': 'Keep it shorter', 'cl.lastJoin': 'Add it to the part before', 'cl.lastDrop': 'Leave it out',
    'cl.overlap': 'Overlap', 'cl.overlapHint': 'each part starts with the last seconds of the one before',
    'cl.parts': '{n} parts', 'cl.noParts': 'No parts. Check the times.',
    'cl.dragHint': 'Drag the title in the preview to move it', 'cl.fitColor': 'Background colour', 'cl.colour': 'Colour', 'cl.opacity': 'Opacity',
    'cl.text': 'Text', 'cl.title1': 'Title', 'cl.number': 'Number the parts', 'cl.next': 'Show the next part number at the end (e.g. "Part 4 →")',
    'cl.font': 'Font', 'cl.colours': 'Colours', 'cl.tText': 'Text', 'cl.tOutline': 'Outline', 'cl.outline': 'Outline around the letters', 'cl.box': 'Box behind the text',
    'cl.sideways': 'Sideways', 'cl.height': 'Height', 'cl.top': 'Top', 'cl.mid': 'Middle', 'cl.bottom': 'Bottom',
    'cl.srt': 'Burn in subtitles from an .srt file', 'cl.srtPick': 'Choose .srt', 'cl.small': 'Small', 'cl.medium': 'Medium', 'cl.big': 'Big', 'cl.letters': 'Letters',
    'cl.music': 'Music', 'cl.addMusic': 'Add music', 'cl.pickMusic': 'Choose music', 'cl.vidSound': 'Video sound', 'cl.duck': 'Lower the music when someone talks',
    'cl.songFrom': 'Song from', 'cl.repeats': 'repeats if the clip is longer',
    'cl.finish': 'Finish', 'cl.fade': 'Fade in and out', 'cl.norm': 'Louder, even sound for phones', 'cl.quality': 'Quality', 'cl.fps': 'Frame rate', 'cl.fpsSame': 'Same as the video',
    'cl.output': 'Output', 'cl.chooseFolder': 'Choose folder', 'cl.default': 'Default', 'cl.chooseFirst': 'Choose a video first', 'cl.noClips': 'Add at least one clip first',
    'cl.exportN': 'Export {n} clips', 'cl.exportOne': 'Export 1 clip', 'cl.cancel': 'Stop after this clip', 'cl.exporting': 'Exporting {i} of {n}...',
    'cl.finding': 'Listening and watching... {p}%', 'cl.found': 'Found {n} moments.', 'cl.done': 'Done: {n} clips saved.', 'cl.stopped': 'Stopped after {n} clips.',
    'cl.badTime': 'Enter a start and an end (like 1:30), end after start.', 'cl.noSrt': 'Choose an .srt file first.', 'cl.noMusic': 'Choose a music file first.',
    'cl.clip': 'Clip', 'cl.partWord': 'Part', 'cl.score': 'score {n}', 'cl.play': 'Play', 'cl.remove': 'Remove', 'cl.logoNone': 'none yet', 'cl.srtNone': 'none yet',
    'cl.srtBad': 'No subtitles found in that file.', 'cl.noVideoSplit': 'Choose a video first.',
  }, {
    'nav.clips': 'Klipe', 'cl.title': 'Klipe', 'cl.sub': 'Video e gjatë → klipe të shkurtra për Shorts, Reels dhe TikTok', 'cl.openDir': 'Hap folderin',
    'cl.how': 'Si funksionon',
    'cl.h1': 'Zgjidh një video të gjatë – transmetim live, gameplay, podcast.',
    'cl.h2': 'ClipDesk dëgjon reagimet e forta dhe vëzhgon veprimin e shpejtë, pastaj sugjeron momentet më të mira.',
    'cl.h3': 'Mbaji ato që të pëlqejnë, rregullo fillimin dhe fundin, shto logon dhe titullin.',
    'cl.h4': 'Eksporto: klipe gati për postim në folderin e Klipeve.',
    'cl.legal': 'Përdor vetëm gameplay ose transmetime të tuat, ose material që ke leje ta përdorësh.',
    'cl.change': 'Ndrysho videon', 'cl.best': 'Momentet më të mira', 'cl.split': 'Ndaje në pjesë', 'cl.add': '+ Shto si klip',
    'cl.find': 'Gjej momentet më të mira', 'cl.many': 'Sa', 'cl.len': 'Gjatësia', 'cl.look': 'Kërko',
    'cl.lookBoth': 'Reagime dhe veprim', 'cl.lookLoud': 'Reagime të forta', 'cl.lookAction': 'Veprim i shpejtë', 'cl.findBtn': 'Gjej momente',
    'cl.empty': 'Ende pa klipe. Shtyp "Gjej momente", ose vendos fillimin dhe fundin më sipër dhe shtoje vetë.',
    'cl.each': 'Çdo pjesë', 'cl.exact': 'ose saktësisht', 'cl.min': '{n} min', 'cl.which': 'Cila pjesë', 'cl.whole': 'Krejt videoja', 'cl.from': 'ose nga', 'cl.to': 'deri',
    'cl.lastPart': 'Pjesa e fundit', 'cl.lastShort': 'Lëre më të shkurtër', 'cl.lastJoin': 'Shtoje te pjesa para saj', 'cl.lastDrop': 'Lëre jashtë',
    'cl.overlap': 'Mbivendosje', 'cl.overlapHint': 'çdo pjesë fillon me sekondat e fundit të pjesës para saj',
    'cl.parts': '{n} pjesë', 'cl.noParts': 'Asnjë pjesë. Kontrollo kohët.',
    'cl.dragHint': 'Tërhiq titullin në pamjen paraprake për ta lëvizur', 'cl.fitColor': 'Ngjyrë sfondi', 'cl.colour': 'Ngjyra', 'cl.opacity': 'Tejdukshmëria',
    'cl.text': 'Teksti', 'cl.title1': 'Titulli', 'cl.number': 'Numëro pjesët', 'cl.next': 'Trego numrin e pjesës tjetër në fund (p.sh. "Pjesa 4 →")',
    'cl.font': 'Fonti', 'cl.colours': 'Ngjyrat', 'cl.tText': 'Teksti', 'cl.tOutline': 'Kontura', 'cl.outline': 'Kontur rreth shkronjave', 'cl.box': 'Kuti pas tekstit',
    'cl.sideways': 'Anash', 'cl.height': 'Lartësia', 'cl.top': 'Lart', 'cl.mid': 'Mes', 'cl.bottom': 'Poshtë',
    'cl.srt': 'Ngjit titrat nga një skedar .srt', 'cl.srtPick': 'Zgjidh .srt', 'cl.small': 'I vogël', 'cl.medium': 'Mesatar', 'cl.big': 'I madh', 'cl.letters': 'Shkronjat',
    'cl.music': 'Muzika', 'cl.addMusic': 'Shto muzikë', 'cl.pickMusic': 'Zgjidh muzikën', 'cl.vidSound': 'Zëri i videos', 'cl.duck': 'Ule muzikën kur dikush flet',
    'cl.songFrom': 'Kënga nga', 'cl.repeats': 'përsëritet nëse klipi është më i gjatë',
    'cl.finish': 'Përfundimi', 'cl.fade': 'Zbehje në fillim dhe në fund', 'cl.norm': 'Zë më i fortë dhe i barabartë për telefona', 'cl.quality': 'Cilësia', 'cl.fps': 'Kuadro për sekondë', 'cl.fpsSame': 'Si videoja',
    'cl.output': 'Dalja', 'cl.chooseFolder': 'Zgjidh folderin', 'cl.default': 'Parazgjedhja', 'cl.chooseFirst': 'Zgjidh një video më parë', 'cl.noClips': 'Shto të paktën një klip më parë',
    'cl.exportN': 'Eksporto {n} klipe', 'cl.exportOne': 'Eksporto 1 klip', 'cl.cancel': 'Ndalo pas këtij klipi', 'cl.exporting': 'Duke eksportuar {i} nga {n}...',
    'cl.finding': 'Duke dëgjuar dhe vëzhguar... {p}%', 'cl.found': 'U gjetën {n} momente.', 'cl.done': 'U krye: {n} klipe u ruajtën.', 'cl.stopped': 'U ndal pas {n} klipeve.',
    'cl.badTime': 'Shkruaj një fillim dhe një fund (si 1:30), fundi pas fillimit.', 'cl.noSrt': 'Zgjidh një skedar .srt më parë.', 'cl.noMusic': 'Zgjidh një skedar muzike më parë.',
    'cl.clip': 'Klip', 'cl.partWord': 'Pjesa', 'cl.score': 'pikë {n}', 'cl.play': 'Luaj', 'cl.remove': 'Hiqe', 'cl.logoNone': 'ende asnjë', 'cl.srtNone': 'ende asnjë',
    'cl.srtBad': 'Nuk u gjetën titra në atë skedar.', 'cl.noVideoSplit': 'Zgjidh një video më parë.',
  });
  applyI18n();
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const api = window.clipdesk;
  const S = { path: null, dur: 0, mode: 'best', clips: [], logo: null, logoImg: null, srt: null, srtName: '', music: '', outDir: '', busy: false, stop: false, finding: false };
  const COLORS = ['#000000', '#ffffff', '#7c3aed', '#2563eb', '#dc2626', '#f59e0b', '#16a34a', '#161826'];
  const DIMS = { vertical: { 1080: [1080, 1920], 720: [720, 1280] }, square: { 1080: [1080, 1080], 720: [720, 720] }, horizontal: { 1080: [1920, 1080], 720: [1280, 720] } };
  const v = $('#clVideo'), prev = $('#clPrev'), pctx = prev.getContext('2d');
  const get = id => $('#' + id);
  const fmtOf = () => ($('input[name=clFmt]:checked') || {}).value || 'vertical';
  const qOf = () => (get('clQ').value === '720' ? 720 : 1080);
  const dimsNow = () => DIMS[fmtOf()][qOf()];
  const pad = (n, w) => String(n).padStart(w, '0');
  const store = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, x) { try { localStorage.setItem(k, x); } catch {} } };

  // ---------- saved settings ----------
  const FIELDS = ['clFit', 'clBg', 'clLogoOn', 'clLogoPos', 'clLogoSz', 'clLogoOp', 'clTitleOn', 'clTitle', 'clNumOn', 'clLabel', 'clNextOn', 'clFont', 'clTSz', 'clTCol', 'clTOut', 'clOutline', 'clBox', 'clTX', 'clTY', 'clSubSz', 'clSubY', 'clSubCol', 'clMusVol', 'clVidVol', 'clDuck', 'clFade', 'clNorm', 'clQ', 'clFps', 'clCount', 'clLen', 'clLook'];
  function saveCfg() {
    const o = { fmt: fmtOf() };
    FIELDS.forEach(id => { const el = get(id); o[id] = el.type === 'checkbox' ? el.checked : el.value; });
    store.set('clipsCfg', JSON.stringify(o));
  }
  function loadCfg() {
    let o = null;
    try { o = JSON.parse(store.get('clipsCfg') || 'null'); } catch {}
    if (!o) return;
    FIELDS.forEach(id => { const el = get(id); if (o[id] == null) return; if (el.type === 'checkbox') el.checked = !!o[id]; else el.value = o[id]; });
    const r = $(`input[name=clFmt][value=${o.fmt}]`); if (r) r.checked = true;
  }

  // ---------- drawing the title / subtitles (same code for the preview and the export) ----------
  function wrapLines(ctx, text, maxW) {
    const out = [];
    String(text).split('\n').forEach(par => {
      let line = '';
      par.split(/\s+/).filter(Boolean).forEach(w => {
        const t = line ? line + ' ' + w : w;
        if (ctx.measureText(t).width > maxW && line) { out.push(line); line = w; } else line = t;
      });
      out.push(line);
    });
    return out;
  }
  function drawText(ctx, W, H, text, o) {
    // o: font, size (px at this canvas), color, outlineColor, outline, box, cx, cy (fractions), maxW (fraction)
    ctx.save();
    ctx.font = `900 ${o.size}px "${o.font}", Arial, sans-serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    const lines = wrapLines(ctx, text, W * (o.maxW || 0.9));
    const lh = o.size * 1.18, total = lh * lines.length;
    let y0 = o.cy * H - total / 2 + lh / 2;
    const x = o.cx * W;
    if (o.box) {
      const w = Math.max(...lines.map(l => ctx.measureText(l).width)) + o.size * 0.7;
      ctx.fillStyle = 'rgba(0,0,0,.6)';
      ctx.fillRect(x - w / 2, o.cy * H - total / 2 - o.size * 0.25, w, total + o.size * 0.5);
    }
    ctx.lineJoin = 'round'; ctx.lineWidth = Math.max(2, o.size * 0.14);
    lines.forEach((l, i) => {
      const y = y0 + i * lh;
      if (o.outline) { ctx.strokeStyle = o.outlineColor; ctx.strokeText(l, x, y); }
      ctx.fillStyle = o.color; ctx.fillText(l, x, y);
    });
    ctx.restore();
    return { h: total };
  }
  const titleOpts = W => ({
    font: get('clFont').value, size: Math.round(W * 0.07 * (Number(get('clTSz').value) / 100)), color: get('clTCol').value, outlineColor: get('clTOut').value,
    outline: get('clOutline').checked, box: get('clBox').checked, cx: Number(get('clTX').value) / 100, cy: Number(get('clTY').value) / 100,
  });
  const partLabel = n => `${get('clLabel').value.trim() || tr('cl.partWord')} ${n}`;
  function titleText(i) {
    const parts = [];
    if (get('clTitleOn').checked && get('clTitle').value.trim()) parts.push(get('clTitle').value.trim());
    if (get('clNumOn').checked) parts.push(partLabel(Number(get('clNumStart').value) + i));
    return parts.join('\n');
  }

  // ---------- preview ----------
  function sizePreview() {
    const [W, H] = dimsNow();
    const maxH = 480, maxW = 290;
    const k = Math.min(maxW / W, maxH / H);
    prev.width = Math.round(W * k); prev.height = Math.round(H * k);
    prev.style.height = prev.height + 'px'; prev.style.width = prev.width + 'px';
  }
  function drawPreview() {
    const cw = prev.width, ch = prev.height, [W] = dimsNow(), k = cw / W;
    const fit = get('clFit').value;
    pctx.clearRect(0, 0, cw, ch);
    pctx.fillStyle = fit === 'color' ? get('clBg').value : '#000'; pctx.fillRect(0, 0, cw, ch);
    const ok = S.path && v.videoWidth > 0 && v.readyState >= 2;
    if (ok) {
      const vw = v.videoWidth, vh = v.videoHeight;
      if (fit === 'crop') { const s = Math.max(cw / vw, ch / vh); pctx.drawImage(v, (cw - vw * s) / 2, (ch - vh * s) / 2, vw * s, vh * s); }
      else {
        if (fit === 'blur') { const s = Math.max(cw / vw, ch / vh); pctx.save(); pctx.filter = 'blur(10px)'; pctx.drawImage(v, (cw - vw * s) / 2, (ch - vh * s) / 2, vw * s, vh * s); pctx.restore(); }
        const s = Math.min(cw / vw, ch / vh); pctx.drawImage(v, (cw - vw * s) / 2, (ch - vh * s) / 2, vw * s, vh * s);
      }
    }
    if (get('clLogoOn').checked && S.logoImg) {
      const lw = cw * Number(get('clLogoSz').value) / 100, lh = lw * S.logoImg.height / S.logoImg.width, m = cw * 0.037, p = get('clLogoPos').value;
      pctx.globalAlpha = Number(get('clLogoOp').value) / 100;
      pctx.drawImage(S.logoImg, p[1] === 'l' ? m : cw - lw - m, p[0] === 't' ? m : ch - lh - m, lw, lh);
      pctx.globalAlpha = 1;
    }
    const t = titleText(0);
    if (t) drawText(pctx, cw, ch, t, { ...titleOpts(W), size: Math.round(titleOpts(W).size * k) });
    if (get('clSubOn').checked) {
      drawText(pctx, cw, ch, 'Subtitles look like this', { font: 'Arial Black', size: Math.round(W * Number(get('clSubSz').value) * k), color: get('clSubCol').value, outlineColor: '#000000', outline: true, box: false, cx: 0.5, cy: Number(get('clSubY').value) / 100, maxW: 0.88 });
    }
  }
  let dragging = false;
  prev.addEventListener('pointerdown', e => { dragging = true; prev.setPointerCapture(e.pointerId); moveTitle(e); });
  prev.addEventListener('pointermove', e => { if (dragging) moveTitle(e); });
  prev.addEventListener('pointerup', () => { dragging = false; saveCfg(); });
  function moveTitle(e) {
    const r = prev.getBoundingClientRect();
    const x = Math.min(95, Math.max(5, Math.round(((e.clientX - r.left) / r.width) * 100)));
    const y = Math.min(95, Math.max(5, Math.round(((e.clientY - r.top) / r.height) * 100)));
    get('clTX').value = x; get('clTY').value = y; syncLabels(); drawPreview();
  }
  window.__clipsDraw = drawPreview;

  // ---------- small UI helpers ----------
  const PCT = [['clLogoSz', 'clLogoSzV'], ['clLogoOp', 'clLogoOpV'], ['clTSz', 'clTSzV'], ['clTX', 'clTXV'], ['clTY', 'clTYV'], ['clSubY', 'clSubYV'], ['clMusVol', 'clMusVolV'], ['clVidVol', 'clVidVolV']];
  function syncLabels() {
    PCT.forEach(([a, b]) => { get(b).textContent = get(a).value + '%'; });
    get('clOvV').textContent = get('clOv').value + ' s';
    get('clSwRow').hidden = get('clFit').value !== 'color';
    $$('#clSw i').forEach(i => i.classList.toggle('on', i.dataset.c === get('clBg').value.toLowerCase()));
  }
  function buildSwatches() {
    get('clSw').innerHTML = COLORS.map(c => `<i data-c="${c}" style="background:${c}"></i>`).join('');
  }
  function buildNumSelect() {
    const sel = get('clNumStart'), cur = sel.value || '1';
    sel.innerHTML = '';
    for (let i = 1; i <= 60; i++) sel.add(new Option(partLabel(i), String(i)));
    sel.value = cur;
  }
  function buildPresets() {
    get('clPresets').innerHTML = [1, 2, 3, 5, 10].map(n => `<button class="ghost preset" data-m="${n}">${tr('cl.min', { n })}</button>`).join(' ');
  }
  function names() {
    const n = currentClips().length;
    const w = Math.max(2, String(n).length), word = S.mode === 'split' ? tr('cl.partWord') : tr('cl.clip');
    get('clNames').textContent = `${word} ${pad(1, w)}.mp4, ${word} ${pad(2, w)}.mp4 ...`;
    get('clOut').textContent = S.outDir;
  }

  // ---------- splitting ----------
  function splitParts(from, to, each, last, overlap) {
    const out = [];
    if (!(each > 0) || !(to > from)) return out;
    const step = Math.max(1, each - overlap);
    for (let s = from; s < to; s += step) {
      const e = s + each;
      if (e <= to + 1e-6) { out.push([s, e]); continue; }
      if (to - s <= overlap + 1) break; // only the overlap is left
      if (last === 'short' && to - s >= 3) out.push([s, to]);
      else if (last === 'join' && out.length) out[out.length - 1][1] = to;
      break;
    }
    return out;
  }
  function splitNow() {
    const each = parseTime(get('clEach').value);
    let from = parseTime(get('clFrom').value), to = parseTime(get('clTo').value);
    if (get('clWhole').checked || from == null) from = 0;
    if (get('clWhole').checked || to == null) to = S.dur;
    to = Math.min(to, S.dur || to);
    const last = ($('input[name=clLast]:checked') || {}).value || 'drop';
    return splitParts(from, to, each, last, Number(get('clOv').value));
  }
  function currentClips() {
    if (S.mode === 'split') return splitNow().map(([start, end]) => ({ start, end }));
    return S.clips.filter(c => c.on).map(c => ({ start: c.start, end: c.end }));
  }
  function drawStrip() {
    const c = get('clStrip'), w = (c.width = c.clientWidth || 600), h = c.height, x = c.getContext('2d');
    x.clearRect(0, 0, w, h);
    if (!S.dur) return;
    const clips = currentClips();
    x.fillStyle = 'rgba(124,58,237,.75)';
    clips.forEach(p => { x.fillRect((p[0] / S.dur) * w, 4, Math.max(1, ((p[1] - p[0]) / S.dur) * w - 1), h - 8); });
  }
  function refreshAll() {
    const parts = currentClips();
    if (S.mode === 'split') {
      const each = parseTime(get('clEach').value);
      get('clSum').textContent = parts.length ? tr('cl.parts', { n: parts.length }) + '  × ' + fmt(each) : tr('cl.noParts');
      $$('#clPresets .preset').forEach(b => b.classList.toggle('on', Number(b.dataset.m) * 60 === each));
      drawStrip();
    }
    const b = get('clExport');
    if (!S.path) { b.disabled = true; b.textContent = tr('cl.chooseFirst'); }
    else if (S.busy) { b.disabled = false; b.textContent = tr('cl.cancel'); }
    else if (!parts.length) { b.disabled = true; b.textContent = tr('cl.noClips'); }
    else { b.disabled = false; b.textContent = parts.length === 1 ? tr('cl.exportOne') : tr('cl.exportN', { n: parts.length }); }
    names(); drawPreview();
  }

  // ---------- clip list (best moments) ----------
  function renderList() {
    const box = get('clList');
    if (!S.clips.length) { box.innerHTML = `<p class="muted">${tr('cl.empty')}</p>`; refreshAll(); return; }
    box.innerHTML = '';
    S.clips.forEach((c, i) => {
      const d = document.createElement('div');
      d.className = 'cl-item' + (c.on ? '' : ' off');
      d.innerHTML = `<input type="checkbox" ${c.on ? 'checked' : ''}> <b>${i + 1}</b>
        <input type="text" class="s" value="${fmt(c.start)}"> – <input type="text" class="e" value="${fmt(c.end)}"> <span class="small muted">${Math.round(c.end - c.start)} s</span>
        <button class="ghost p">${tr('cl.play')}</button> <button class="ghost x">${tr('cl.remove')}</button>
        ${c.score != null ? `<span class="sc">${tr('cl.score', { n: c.score.toFixed(1) })}</span>` : ''}`;
      d.querySelector('input[type=checkbox]').onchange = e => { c.on = e.target.checked; renderList(); };
      d.querySelector('.s').onchange = e => { const t = parseTime(e.target.value); if (t != null && t < c.end) c.start = t; renderList(); };
      d.querySelector('.e').onchange = e => { const t = parseTime(e.target.value); if (t != null && t > c.start) c.end = Math.min(t, S.dur || t); renderList(); };
      d.querySelector('.p').onclick = () => { v.currentTime = c.start; v.play(); };
      d.querySelector('.x').onclick = () => { S.clips.splice(i, 1); renderList(); };
      box.appendChild(d);
    });
    refreshAll();
  }

  // ---------- load a video ----------
  function openVideo(p) {
    S.path = p; S.clips = [];
    get('clName').textContent = fileName(p);
    v.src = api.fileUrl(p);
    get('clDrop').hidden = true; get('clHow').hidden = true; get('clWork').hidden = false;
    get('clFindSt').textContent = '';
    renderList();
  }
  v.addEventListener('loadedmetadata', () => {
    S.dur = v.duration || 0;
    if (!get('clWhole').checked) get('clTo').value = fmt(Math.min(S.dur, 3600));
    refreshAll();
  });
  ['seeked', 'loadeddata', 'timeupdate'].forEach(ev => v.addEventListener(ev, drawPreview));
  async function pickVideo() { const p = await api.openFile('video'); if (p) openVideo(p); }
  get('clPick').onclick = pickVideo;
  get('clChange').onclick = pickVideo;
  const dz = get('clDrop');
  ['dragenter', 'dragover'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.add('over'); }));
  ['dragleave', 'drop'].forEach(ev => dz.addEventListener(ev, e => { e.preventDefault(); dz.classList.remove('over'); }));
  dz.addEventListener('drop', e => {
    const f = e.dataTransfer.files[0];
    if (f && VIDEO_RE.test(f.name)) openVideo(api.pathForFile(f)); else toast(tr('t.pickVideoFile'));
  });

  // ---------- best moments ----------
  get('clSNow').onclick = () => { get('clS').value = fmt(v.currentTime); };
  get('clENow').onclick = () => { get('clE').value = fmt(v.currentTime); };
  get('clAdd').onclick = () => {
    const s = parseTime(get('clS').value), e = parseTime(get('clE').value);
    if (s == null || e == null || e <= s) return toast(tr('cl.badTime'));
    S.clips.push({ start: s, end: Math.min(e, S.dur || e), on: true, score: null });
    S.clips.sort((a, b) => a.start - b.start); renderList();
  };
  api.onClipsProgress(p => { if (S.finding) get('clFindSt').textContent = tr('cl.finding', { p: Math.round(p * 100) }); });
  get('clFind').onclick = async () => {
    if (!S.path || S.finding) return;
    S.finding = true; get('clFind').disabled = true; get('clFindSt').textContent = tr('cl.finding', { p: 0 });
    try {
      const r = await api.clipsAnalyze({ input: S.path, duration: S.dur, count: Number(get('clCount').value), length: Number(get('clLen').value), look: get('clLook').value });
      S.clips = r.map(c => ({ start: c.start, end: c.end, on: true, score: c.score }));
      get('clFindSt').textContent = tr('cl.found', { n: r.length });
      renderList();
    } catch (err) { get('clFindSt').textContent = ''; toast(errMsg(err)); }
    S.finding = false; get('clFind').disabled = false;
  };

  // ---------- modes ----------
  function setMode(m) {
    S.mode = m;
    get('clModeBest').classList.toggle('on', m === 'best'); get('clModeSplit').classList.toggle('on', m === 'split');
    get('clBest').hidden = m !== 'best'; get('clSplit').hidden = m !== 'split';
    refreshAll();
  }
  get('clModeBest').onclick = () => setMode('best');
  get('clModeSplit').onclick = () => setMode('split');
  get('clPresets').addEventListener('click', e => { const b = e.target.closest('.preset'); if (b) { get('clEach').value = fmt(Number(b.dataset.m) * 60); refreshAll(); } });
  ['clEach', 'clFrom', 'clTo', 'clWhole', 'clOv'].forEach(id => get(id).addEventListener('input', () => { syncLabels(); refreshAll(); }));
  $$('input[name=clLast]').forEach(r => r.addEventListener('change', refreshAll));

  // ---------- logo, srt, music, output ----------
  async function setLogo(p) {
    S.logo = p || null; S.logoImg = null;
    get('clLogoName').textContent = p ? fileName(p) : tr('cl.logoNone');
    if (p) { try { S.logoImg = await loadImg(await api.readImage(p)); } catch (err) { toast(errMsg(err)); } }
    drawPreview();
  }
  get('clLogoPick').onclick = async () => {
    const p = await api.openFile('image'); if (!p) return;
    await api.setSettings({ logoPath: p }); await setLogo(p); get('clLogoOn').checked = true; saveCfg(); drawPreview();
  };
  function parseSrt(text) {
    const cues = [], T = s => { const m = /(\d+):(\d+):(\d+)[,.](\d+)/.exec(s); return m ? (+m[1]) * 3600 + (+m[2]) * 60 + (+m[3]) + (+m[4].padEnd(3, '0').slice(0, 3)) / 1000 : null; };
    text.replace(/\r/g, '').split(/\n\s*\n/).forEach(b => {
      const lines = b.trim().split('\n'); const i = lines.findIndex(l => l.includes('-->'));
      if (i < 0) return;
      const [a, z] = lines[i].split('-->'); const s = T(a), e = T(z);
      const t = lines.slice(i + 1).join('\n').replace(/<[^>]+>/g, '').trim();
      if (s != null && e != null && e > s && t) cues.push({ start: s, end: e, text: t });
    });
    return cues;
  }
  get('clSrtPick').onclick = async () => {
    const p = await api.openFile('srt'); if (!p) return;
    try {
      const txt = await api.readText(p); const cues = parseSrt(txt);
      if (!cues.length) return toast(tr('cl.srtBad'));
      S.srt = cues; S.srtName = fileName(p); get('clSrtName').textContent = `${S.srtName} (${cues.length})`; get('clSubOn').checked = true; saveCfg(); drawPreview();
    } catch (err) { toast(errMsg(err)); }
  };
  get('clMusPick').onclick = async () => {
    const p = await api.openFile('audio'); if (!p) return;
    S.music = p; get('clMusName').textContent = fileName(p); get('clMusOn').checked = true;
  };
  get('clOutPick').onclick = async () => { const p = await api.openFile('folder'); if (p) { S.outDir = p; store.set('clipsOut', p); names(); } };
  get('clOutDef').onclick = async () => { S.outDir = await api.clipsDir(); store.set('clipsOut', ''); names(); };
  get('clOpen').onclick = () => api.openDir(S.outDir);
  $$('[data-ty]').forEach(b => b.onclick = () => { get('clTY').value = b.dataset.ty; syncLabels(); drawPreview(); saveCfg(); });
  get('clSw').addEventListener('click', e => { const i = e.target.closest('i'); if (i) { get('clBg').value = i.dataset.c; syncLabels(); drawPreview(); saveCfg(); } });

  // ---------- export ----------
  function png(canvas) { return canvas.toDataURL('image/png'); }
  function overlaysFor(i, n, s, e, W, H) {
    const len = e - s, list = [], o = titleOpts(W);
    const showNext = get('clNumOn').checked && get('clNextOn').checked && i < n - 1;
    const tailStart = showNext ? Math.max(0, len - Math.min(3, len / 2)) : len;
    const t = titleText(i);
    if (t && tailStart > 0) {
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      drawText(c.getContext('2d'), W, H, t, o);
      list.push({ png: png(c), start: 0, end: tailStart, y: 0 });
    }
    if (showNext) {
      const c = document.createElement('canvas'); c.width = W; c.height = H;
      drawText(c.getContext('2d'), W, H, partLabel(Number(get('clNumStart').value) + i + 1) + ' →', o);
      list.push({ png: png(c), start: tailStart, end: len, y: 0 });
    }
    if (get('clSubOn').checked && S.srt) {
      const size = Math.round(W * Number(get('clSubSz').value));
      const bandH = Math.round(size * 1.18 * 3 + size * 0.6);
      const y = Math.min(H - bandH, Math.max(0, Math.round((Number(get('clSubY').value) / 100) * H - bandH / 2)));
      S.srt.filter(c => c.end > s && c.start < e).slice(0, 200).forEach(c => {
        const cv = document.createElement('canvas'); cv.width = W; cv.height = bandH;
        drawText(cv.getContext('2d'), W, bandH, c.text, { font: 'Arial Black', size, color: get('clSubCol').value, outlineColor: '#000000', outline: true, box: false, cx: 0.5, cy: 0.5, maxW: 0.88 });
        list.push({ png: png(cv), start: Math.max(0, c.start - s), end: Math.min(len, c.end - s), y });
      });
    }
    return list;
  }
  async function exportAll() {
    if (S.busy) { S.stop = true; get('clProg').textContent = ''; return; }
    const clips = currentClips(); if (!S.path || !clips.length) return;
    if (get('clSubOn').checked && !S.srt) return toast(tr('cl.noSrt'));
    if (get('clMusOn').checked && !S.music) return toast(tr('cl.noMusic'));
    const [W, H] = dimsNow(), n = clips.length, w = Math.max(2, String(n).length), word = S.mode === 'split' ? tr('cl.partWord') : tr('cl.clip');
    S.busy = true; S.stop = false; refreshAll();
    let done = 0, lastOut = null, cur = 0;
    api.onClipsRender(p => { get('clProg').textContent = tr('cl.exporting', { i: cur + 1, n }) + ' ' + Math.round(p * 100) + '%'; });
    try {
      for (let i = 0; i < n && !S.stop; i++) {
        cur = i;
        get('clProg').textContent = tr('cl.exporting', { i: i + 1, n });
        await new Promise(r => setTimeout(r, 0));
        const [s, e] = [clips[i].start, clips[i].end];
        const r = await api.clipsRender({
          input: S.path, start: s, end: e, name: `${word} ${pad(i + 1, w)}`, outputDir: S.outDir,
          format: fmtOf(), fit: get('clFit').value, bg: get('clBg').value, quality: qOf(), fps: Number(get('clFps').value),
          logo: get('clLogoOn').checked && S.logo ? { path: S.logo, pos: get('clLogoPos').value, scale: Number(get('clLogoSz').value), opacity: Number(get('clLogoOp').value) } : null,
          overlays: overlaysFor(i, n, s, e, W, H),
          music: get('clMusOn').checked && S.music ? { path: S.music, vol: Number(get('clMusVol').value), duck: get('clDuck').checked, from: parseTime(get('clSongFrom').value) || 0 } : null,
          videoVol: Number(get('clVidVol').value), fade: get('clFade').checked, loudnorm: get('clNorm').checked,
        });
        lastOut = r.output; done++;
      }
      get('clProg').textContent = S.stop ? tr('cl.stopped', { n: done }) : tr('cl.done', { n: done });
      if (lastOut) api.showInFolder(lastOut);
    } catch (err) {
      get('clProg').textContent = ''; toast(errMsg(err));
    }
    S.busy = false; S.stop = false; refreshAll();
  }
  get('clExport').onclick = exportAll;

  // ---------- wiring ----------
  const watched = FIELDS.filter(id => !['clMusVol', 'clVidVol'].includes(id)).concat(['clMusVol', 'clVidVol']);
  watched.forEach(id => { const el = get(id); ['input', 'change'].forEach(ev => el.addEventListener(ev, () => { syncLabels(); if (id === 'clLabel') buildNumSelect(); if (id === 'clQ') sizePreview(); refreshAll(); saveCfg(); })); });
  get('clNumStart').addEventListener('change', refreshAll);
  $$('input[name=clFmt]').forEach(r => r.addEventListener('change', () => { sizePreview(); refreshAll(); saveCfg(); }));
  document.addEventListener('langchange', () => { buildNumSelect(); buildPresets(); get('clLogoName').textContent = S.logo ? fileName(S.logo) : tr('cl.logoNone'); get('clSrtName').textContent = S.srt ? `${S.srtName} (${S.srt.length})` : tr('cl.srtNone'); renderList(); });
  document.addEventListener('themechange', drawPreview);

  (async function init() {
    buildSwatches(); buildPresets(); loadCfg(); buildNumSelect();
    get('clSrtName').textContent = tr('cl.srtNone');
    const saved = store.get('clipsOut');
    S.outDir = saved || await api.clipsDir();
    try { const st = await api.getSettings(); if (st.logoPath) await setLogo(st.logoPath); else get('clLogoName').textContent = tr('cl.logoNone'); } catch {}
    sizePreview(); syncLabels(); renderList();
  })();
})();
