const { app, BrowserWindow, ipcMain, dialog, shell, safeStorage } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { spawn } = require('child_process');

let ffmpegPath = require('ffmpeg-static');
if (ffmpegPath) ffmpegPath = ffmpegPath.replace('app.asar', 'app.asar.unpacked');

const DEFAULT_MODEL = 'claude-sonnet-5-5';
const VIDEO_EXT = ['mp4', 'mov', 'm4v', 'mkv', 'webm', 'avi'];
const IMAGE_EXT = ['png', 'jpg', 'jpeg', 'webp'];

let win = null;
let sessionKey = null; // used only if the OS cannot encrypt the key

// ---------- settings ----------
const settingsFile = () => path.join(app.getPath('userData'), 'settings.json');
function loadSettings() {
  try { return JSON.parse(fs.readFileSync(settingsFile(), 'utf8')); } catch { return {}; }
}
function saveSettings(s) {
  fs.mkdirSync(path.dirname(settingsFile()), { recursive: true });
  fs.writeFileSync(settingsFile(), JSON.stringify(s, null, 2));
}
function getApiKey() {
  if (sessionKey) return sessionKey;
  const s = loadSettings();
  if (s.apiKeyEnc && safeStorage.isEncryptionAvailable()) {
    try { return safeStorage.decryptString(Buffer.from(s.apiKeyEnc, 'base64')); } catch { return null; }
  }
  return null;
}
function publicSettings() {
  const s = loadSettings();
  return {
    hasKey: !!getApiKey(),
    model: s.model || DEFAULT_MODEL,
    logoPath: s.logoPath || '',
    logoPos: s.logoPos || 'br',
    logoScale: s.logoScale || 14,
    outputDir: s.outputDir || path.join(app.getPath('movies'), 'ClipDesk'),
  };
}

ipcMain.handle('settings:get', () => publicSettings());
ipcMain.handle('settings:set', (_e, patch) => {
  const allowed = ['model', 'logoPath', 'logoPos', 'logoScale', 'outputDir'];
  const s = loadSettings();
  for (const k of allowed) {
    if (patch && Object.prototype.hasOwnProperty.call(patch, k)) s[k] = patch[k];
  }
  saveSettings(s);
  return publicSettings();
});
ipcMain.handle('key:set', (_e, key) => {
  const s = loadSettings();
  sessionKey = null;
  delete s.apiKeyEnc;
  if (typeof key === 'string' && key.trim()) {
    if (safeStorage.isEncryptionAvailable()) {
      s.apiKeyEnc = safeStorage.encryptString(key.trim()).toString('base64');
    } else {
      sessionKey = key.trim();
    }
  }
  saveSettings(s);
  return publicSettings();
});

// ---------- dialogs and files ----------
ipcMain.handle('dialog:open', async (_e, kind) => {
  const opts = { properties: ['openFile'] };
  if (kind === 'video') opts.filters = [{ name: 'Video', extensions: VIDEO_EXT }];
  else if (kind === 'image') opts.filters = [{ name: 'Image', extensions: IMAGE_EXT }];
  else if (kind === 'media') opts.filters = [{ name: 'Video or image', extensions: [...VIDEO_EXT, ...IMAGE_EXT] }];
  else if (kind === 'srt') opts.filters = [{ name: 'Subtitles', extensions: ['srt'] }];
  else if (kind === 'audio') opts.filters = [{ name: 'Audio', extensions: ['mp3', 'm4a', 'wav', 'aac', 'ogg', 'flac'] }];
  else if (kind === 'folder') opts.properties = ['openDirectory', 'createDirectory'];
  const r = await dialog.showOpenDialog(win, opts);
  return r.canceled ? null : r.filePaths[0];
});

ipcMain.handle('fs:readImage', (_e, p) => {
  if (typeof p !== 'string') throw new Error('Bad path.');
  const ext = path.extname(p).slice(1).toLowerCase();
  if (!IMAGE_EXT.includes(ext)) throw new Error('Not an image file.');
  const stat = fs.statSync(p);
  if (stat.size > 25 * 1024 * 1024) throw new Error('Image is too large (25 MB max).');
  const mime = ext === 'jpg' ? 'image/jpeg' : 'image/' + ext;
  return `data:${mime};base64,${fs.readFileSync(p).toString('base64')}`;
});

ipcMain.handle('fs:readText', (_e, p) => {
  if (typeof p !== 'string' || !/\.srt$/i.test(p)) throw new Error('Not a subtitle file.');
  if (fs.statSync(p).size > 5 * 1024 * 1024) throw new Error('Subtitle file is too large.');
  return fs.readFileSync(p, 'utf8').replace(/^\uFEFF/, '');
});

ipcMain.handle('fs:saveImage', async (_e, dataUrl, suggestedName) => {
  const m = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(dataUrl || '');
  if (!m) throw new Error('Bad image data.');
  const r = await dialog.showSaveDialog(win, {
    defaultPath: path.join(app.getPath('pictures'), (suggestedName || 'thumbnail') + '.png'),
    filters: [{ name: 'PNG image', extensions: ['png'] }],
  });
  if (r.canceled || !r.filePath) return null;
  fs.writeFileSync(r.filePath, Buffer.from(m[1], 'base64'));
  return r.filePath;
});

ipcMain.handle('shell:show', (_e, p) => {
  if (typeof p === 'string') shell.showItemInFolder(p);
});

// ---------- ffmpeg ----------
function uniquePath(dir, base, ext) {
  let p = path.join(dir, `${base}.${ext}`);
  let i = 2;
  while (fs.existsSync(p)) p = path.join(dir, `${base}-${i++}.${ext}`);
  return p;
}
const num = (v, d) => (Number.isFinite(Number(v)) ? Number(v) : d);

function buildFilter({ W, H, fit, addLogo, logoPos, logoScale, caps, capY, firstCapInput }) {
  const parts = [];
  if (fit === 'crop') {
    parts.push(`[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}[base]`);
  } else {
    parts.push('[0:v]split=2[a][b]');
    parts.push(`[a]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},boxblur=25:5[bg]`);
    parts.push(`[b]scale=${W}:${H}:force_original_aspect_ratio=decrease[fg]`);
    parts.push('[bg][fg]overlay=(W-w)/2:(H-h)/2[base]');
  }
  if (addLogo) {
    const lw = Math.max(40, Math.round((W * logoScale) / 100));
    const m = 40;
    const xy = {
      tl: `${m}:${m}`,
      tr: `W-w-${m}:${m}`,
      bl: `${m}:H-h-${m}`,
      br: `W-w-${m}:H-h-${m}`,
    }[logoPos] || `W-w-${m}:H-h-${m}`;
    parts.push(`[1:v]scale=${lw}:-1[lg]`);
    parts.push(`[base][lg]overlay=${xy}[c0]`);
  } else {
    parts.push('[base]null[c0]');
  }
  // burned-in captions: one transparent PNG per caption, shown only between its start and end
  (caps || []).forEach((c, i) => {
    const out = i === caps.length - 1 ? 'v' : `c${i + 1}`;
    parts.push(`[c${i}][${firstCapInput + i}:v]overlay=0:${capY}:enable='between(t,${c.start.toFixed(3)},${c.end.toFixed(3)})'[${out}]`);
  });
  if (!caps || !caps.length) parts.push('[c0]null[v]');
  return parts.join(';');
}

// ---------- captions: temp PNGs ----------
function writeCaptionPngs(list) {
  if (!Array.isArray(list) || !list.length) return { dir: null, caps: [] };
  if (list.length > 150) throw new Error('Too many captions (150 max per export). Trim the clip or use fewer, longer captions.');
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'clipdesk-caps-'));
  const caps = list.map((c, i) => {
    const m = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec(c && c.png || '');
    const s = num(c && c.start, NaN), e = num(c && c.end, NaN);
    if (!m || !Number.isFinite(s) || !Number.isFinite(e) || e <= s) throw new Error('Bad caption data.');
    const file = path.join(dir, `cap${String(i).padStart(4, '0')}.png`);
    fs.writeFileSync(file, Buffer.from(m[1], 'base64'));
    return { file, start: s, end: e };
  });
  return { dir, caps };
}

ipcMain.handle('convert', (e, o) => new Promise((resolve, reject) => {
  if (!ffmpegPath || !fs.existsSync(ffmpegPath)) return reject(new Error('ffmpeg was not found. Run npm install again.'));
  if (!o || typeof o.input !== 'string' || !fs.existsSync(o.input)) return reject(new Error('Choose a video first.'));
  const orientation = o.orientation === 'horizontal' ? 'horizontal' : 'vertical';
  const fit = o.fit === 'crop' ? 'crop' : 'blur';
  const [W, H] = orientation === 'vertical' ? [1080, 1920] : [1920, 1080];
  const start = Math.max(0, num(o.start, 0));
  const end = o.end == null ? null : num(o.end, null);
  const addLogo = !!(o.addLogo && typeof o.logoPath === 'string' && fs.existsSync(o.logoPath));
  const logoPos = ['tl', 'tr', 'bl', 'br'].includes(o.logoPos) ? o.logoPos : 'br';
  const logoScale = Math.min(60, Math.max(3, num(o.logoScale, 14)));
  const outDir = typeof o.outputDir === 'string' && o.outputDir ? o.outputDir : path.join(app.getPath('movies'), 'ClipDesk');
  fs.mkdirSync(outDir, { recursive: true });

  const base = path.basename(o.input, path.extname(o.input)) + '_' + orientation;
  const out = uniquePath(outDir, base, 'mp4');

  let capFiles;
  try { capFiles = writeCaptionPngs(o.captions); } catch (err) { return reject(err); }
  const capH = Math.min(1200, Math.max(100, num(o.captionH, 400)));
  const capPos = ['top', 'mid', 'low'].includes(o.captionPos) ? o.captionPos : 'low';
  const capY = capPos === 'top' ? Math.round(H * 0.1)
    : capPos === 'mid' ? Math.round((H - capH) / 2)
    : orientation === 'vertical' ? Math.round(H * 0.62) : Math.round(H - capH - 40);
  const cleanup = () => { if (capFiles.dir) fs.rm(capFiles.dir, { recursive: true, force: true }, () => {}); };

  const args = ['-y', '-hide_banner', '-nostats', '-progress', 'pipe:1'];
  if (start > 0) args.push('-ss', String(start));
  args.push('-i', o.input);
  if (addLogo) args.push('-i', o.logoPath);
  capFiles.caps.forEach(c => args.push('-i', c.file));
  const length = end != null && end > start ? end - start : null;
  if (length) args.push('-t', String(length));
  args.push(
    '-filter_complex', buildFilter({
      W, H, fit, addLogo, logoPos, logoScale,
      caps: capFiles.caps, capY, firstCapInput: addLogo ? 2 : 1,
    }),
    '-map', '[v]', '-map', '0:a?',
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '20', '-pix_fmt', 'yuv420p',
    '-c:a', 'aac', '-b:a', '192k',
    '-movflags', '+faststart',
    out
  );

  const total = length || (num(o.duration, 0) > start ? num(o.duration, 0) - start : 0);
  const proc = spawn(ffmpegPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
  let errTail = '';
  proc.stderr.on('data', d => { errTail = (errTail + d.toString()).slice(-1500); });
  proc.stdout.on('data', d => {
    const m = /out_time_(?:us|ms)=(\d+)/.exec(d.toString());
    if (m && total > 0) {
      const sec = Number(m[1]) / 1e6;
      e.sender.send('convert:progress', Math.min(1, sec / total));
    }
  });
  proc.on('error', err => { cleanup(); reject(err); });
  proc.on('close', code => {
    cleanup();
    if (code === 0) resolve({ output: out });
    else reject(new Error('ffmpeg failed: ' + errTail.trim().split('\n').slice(-3).join(' ')));
  });
}));

// ---------- transcription (runs on this Mac, no API key needed) ----------
const WHISPER_MODELS = {
  fast: 'Xenova/whisper-tiny.en',
  balanced: 'Xenova/whisper-base.en',
  accurate: 'Xenova/whisper-small.en',
};
const asrCache = {};

function extractAudio(input, start, end) {
  return new Promise((resolve, reject) => {
    const args = ['-hide_banner', '-loglevel', 'error'];
    if (start > 0) args.push('-ss', String(start));
    args.push('-i', input);
    if (end != null && end > start) args.push('-t', String(end - start));
    args.push('-vn', '-ac', '1', '-ar', '16000', '-f', 'f32le', 'pipe:1');
    const proc = spawn(ffmpegPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    const bufs = [];
    let err = '';
    proc.stdout.on('data', d => bufs.push(d));
    proc.stderr.on('data', d => { err = (err + d.toString()).slice(-500); });
    proc.on('error', reject);
    proc.on('close', code => {
      if (code !== 0) return reject(new Error('Could not read the audio. ' + err.trim()));
      const buf = Buffer.concat(bufs);
      if (buf.length < 16000 * 4 * 0.2) return reject(new Error('No audio found in this video.'));
      const copy = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength - (buf.byteLength % 4));
      resolve(new Float32Array(copy));
    });
  });
}

ipcMain.handle('transcribe', async (e, o) => {
  if (!o || typeof o.input !== 'string' || !fs.existsSync(o.input)) throw new Error('Choose a video first.');
  const modelId = WHISPER_MODELS[o.model] || WHISPER_MODELS.balanced;
  const start = Math.max(0, num(o.start, 0));
  const end = o.end == null ? null : num(o.end, null);
  const send = msg => { try { e.sender.send('transcribe:status', msg); } catch {} };

  send('Reading the audio...');
  const audio = await extractAudio(o.input, start, end);

  if (!asrCache[modelId]) {
    send('Loading the speech model. The first time it downloads (about 40 to 250 MB), please wait...');
    let tf;
    try {
      // resolve the file ourselves so this also works when the code is loaded from an update folder
      tf = await import(require('url').pathToFileURL(require.resolve('@huggingface/transformers')).href);
    } catch {
      tf = await import('@huggingface/transformers');
    }
    const { pipeline, env } = tf;
    env.cacheDir = path.join(app.getPath('userData'), 'models');
    let last = 0;
    asrCache[modelId] = await pipeline('automatic-speech-recognition', modelId, {
      progress_callback: p => {
        if (p && p.status === 'progress' && typeof p.progress === 'number' && Date.now() - last > 700) {
          last = Date.now();
          send(`Downloading speech model... ${Math.round(p.progress)}%`);
        }
      },
    });
  }

  send('Listening to the video. Long videos take a while...');
  const opts = { return_timestamps: 'word', chunk_length_s: 30, stride_length_s: 5 };
  const result = await asrCache[modelId](audio, opts);

  const words = [];
  (result.chunks || []).forEach((c, i, arr) => {
    const text = String(c.text || '').trim();
    if (!text || !c.timestamp) return;
    let [s, t] = c.timestamp;
    if (!Number.isFinite(s)) return;
    if (!Number.isFinite(t)) t = s + 0.4;
    words.push({ text, start: s + start, end: Math.max(t, s + 0.05) + start });
  });
  if (!words.length) throw new Error('No speech was found.');
  return words;
});

ipcMain.handle('frame:grab', (_e, input, t) => new Promise((resolve, reject) => {
  if (typeof input !== 'string' || !fs.existsSync(input)) return reject(new Error('Video not found.'));
  const tmp = path.join(os.tmpdir(), `clipdesk-frame-${Date.now()}.jpg`);
  const args = ['-y', '-hide_banner', '-ss', String(Math.max(0, num(t, 0))), '-i', input, '-frames:v', '1', '-q:v', '2', tmp];
  const proc = spawn(ffmpegPath, args, { stdio: ['ignore', 'ignore', 'pipe'] });
  let errTail = '';
  proc.stderr.on('data', d => { errTail = (errTail + d.toString()).slice(-800); });
  proc.on('error', reject);
  proc.on('close', code => {
    if (code !== 0 || !fs.existsSync(tmp)) return reject(new Error('Could not grab a frame. ' + errTail.trim().split('\n').slice(-1)));
    const data = fs.readFileSync(tmp).toString('base64');
    fs.unlink(tmp, () => {});
    resolve(`data:image/jpeg;base64,${data}`);
  });
}));

// ---------- Claude ----------
ipcMain.handle('claude:ask', async (_e, { system, messages, webSearch, maxTokens }) => {
  const key = getApiKey();
  if (!key) throw new Error('Add your Anthropic API key in Settings first.');
  if (!Array.isArray(messages) || !messages.length || messages.length > 40) throw new Error('Bad request.');
  const clean = messages.map(m => {
    if (!m || !['user', 'assistant'].includes(m.role) || typeof m.content !== 'string' || m.content.length > 20000) {
      throw new Error('Bad message.');
    }
    return { role: m.role, content: m.content };
  });
  const body = {
    model: loadSettings().model || DEFAULT_MODEL,
    max_tokens: Math.min(4000, num(maxTokens, 1800)),
    system: typeof system === 'string' ? system : undefined,
    messages: clean,
  };
  if (webSearch) body.tools = [{ type: 'web_search_20250305', name: 'web_search', max_uses: 3 }];

  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 120000);
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'x-api-key': key, 'anthropic-version': '2023-06-01', 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: ctl.signal,
    });
    const j = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((j.error && j.error.message) || `Claude API error ${res.status}`);
    return (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('').trim();
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('Claude took too long. Try again.');
    throw err;
  } finally {
    clearTimeout(timer);
  }
});

// ---------- Clips: long video -> short clips ----------
const CLIP_DIMS = {
  vertical: { 1080: [1080, 1920], 720: [720, 1280] },
  square: { 1080: [1080, 1080], 720: [720, 720] },
  horizontal: { 1080: [1920, 1080], 720: [1280, 720] },
};
const hexColor = (v, d) => (/^#[0-9a-fA-F]{6}$/.test(v || '') ? '0x' + v.slice(1) : d);

// Pure: scores each second, then picks the best non-overlapping windows.
// loud[] and motion[] hold one number per second (already compared with their local average).
function pickMoments(loud, motion, count, length, look) {
  const n = Math.max(loud.length, motion.length);
  const len = Math.max(5, Math.min(Math.round(length), n));
  const wl = look === 'action' ? 0 : 1, wm = look === 'loud' ? 0 : 1;
  const s = new Float64Array(n);
  for (let i = 0; i < n; i++) s[i] = wl * (loud[i] || 0) + wm * (motion[i] || 0);
  const pre = new Float64Array(n + 1);
  for (let i = 0; i < n; i++) pre[i + 1] = pre[i] + s[i];
  const cand = [];
  for (let a = 0; a + len <= n; a += Math.max(1, Math.floor(len / 6))) {
    let peak = 0;
    for (let i = a; i < a + len; i++) if (s[i] > peak) peak = s[i];
    cand.push({ start: a, end: a + len, score: (pre[a + len] - pre[a]) / len + 0.5 * peak });
  }
  cand.sort((x, y) => y.score - x.score);
  const out = [];
  for (const c of cand) {
    if (out.length >= count) break;
    if (out.some(o => c.start < o.end && c.end > o.start)) continue;
    out.push(c);
  }
  out.sort((x, y) => x.start - y.start);
  return out;
}

function movingBaseline(arr, win) {
  // value minus the median-ish local level (mean of the lower half would be costly; use a running mean over 'win' seconds)
  const n = arr.length, pre = new Float64Array(n + 1);
  for (let i = 0; i < n; i++) pre[i + 1] = pre[i] + arr[i];
  const out = new Float64Array(n);
  let sd = 0;
  for (let i = 0; i < n; i++) {
    const a = Math.max(0, i - win), b = Math.min(n, i + win + 1);
    out[i] = arr[i] - (pre[b] - pre[a]) / (b - a);
  }
  for (let i = 0; i < n; i++) sd += out[i] * out[i];
  sd = Math.sqrt(sd / Math.max(1, n)) || 1;
  for (let i = 0; i < n; i++) out[i] = Math.max(0, out[i] / sd);
  return out;
}

ipcMain.handle('clips:analyze', (e, o) => new Promise((resolve, reject) => {
  if (!ffmpegPath || !fs.existsSync(ffmpegPath)) return reject(new Error('ffmpeg was not found. Run npm install again.'));
  if (!o || typeof o.input !== 'string' || !fs.existsSync(o.input)) return reject(new Error('Choose a video first.'));
  const duration = Math.max(1, num(o.duration, 0));
  const count = Math.min(40, Math.max(1, Math.round(num(o.count, 15))));
  const length = Math.min(180, Math.max(10, num(o.length, 60)));
  const look = ['loud', 'action'].includes(o.look) ? o.look : 'both';
  const loud = [], motion = [];
  let doneA = false, doneV = false, failed = false;
  const prog = {};
  const send = () => e.sender.send('clips:progress', Math.min(1, ((prog.a || 0) + (prog.v || 0)) / 2));
  const finish = () => {
    if (failed || !(doneA && doneV)) return;
    const L = movingBaseline(loud, 90), M = movingBaseline(motion, 90);
    if (!L.length && !M.length) return reject(new Error('Could not read this video.'));
    resolve(pickMoments(L, M, count, length, look));
  };
  const run = (args, onData, key, onEnd) => {
    const p = spawn(ffmpegPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
    let err = '';
    p.stderr.on('data', d => { err = (err + d.toString()).slice(-500); });
    p.stdout.on('data', onData);
    p.on('error', x => { if (!failed) { failed = true; reject(x); } });
    p.on('close', code => {
      if (failed) return;
      if (code !== 0 && key === 'v') { failed = true; return reject(new Error('Could not read the video. ' + err.trim())); }
      prog[key] = 1; send(); onEnd(); finish();
    });
    return p;
  };
  // audio: 8 kHz mono 16-bit; loudness = RMS per second
  let aBuf = Buffer.alloc(0), aSec = 0;
  const A = run(['-hide_banner', '-loglevel', 'error', '-i', o.input, '-vn', '-ac', '1', '-ar', '8000', '-f', 's16le', 'pipe:1'], d => {
    aBuf = Buffer.concat([aBuf, d]);
    const step = 16000; // bytes per second
    while (aBuf.length >= step) {
      let sum = 0;
      for (let i = 0; i < step; i += 2) { const v = aBuf.readInt16LE(i) / 32768; sum += v * v; }
      loud.push(20 * Math.log10(Math.sqrt(sum / (step / 2)) + 1e-5));
      aBuf = aBuf.subarray(step); aSec++;
    }
    prog.a = aSec / duration; send();
  }, 'a', () => { doneA = true; });
  // video: 2 small grey frames per second; motion = how much the picture changes
  const FW = 48, FH = 27, FS = FW * FH;
  let vBuf = Buffer.alloc(0), prev = null, acc = 0, accN = 0, frames = 0;
  run(['-hide_banner', '-loglevel', 'error', '-i', o.input, '-an', '-vf', `fps=2,scale=${FW}:${FH},format=gray`, '-f', 'rawvideo', 'pipe:1'], d => {
    vBuf = Buffer.concat([vBuf, d]);
    while (vBuf.length >= FS) {
      const f = vBuf.subarray(0, FS);
      if (prev) { let s = 0; for (let i = 0; i < FS; i++) s += Math.abs(f[i] - prev[i]); acc += s / FS; accN++; }
      prev = Buffer.from(f); vBuf = vBuf.subarray(FS); frames++;
      if (frames % 2 === 0) { motion.push(accN ? acc / accN : 0); acc = 0; accN = 0; }
    }
    prog.v = (frames / 2) / duration; send();
  }, 'v', () => { doneV = true; });
  if (!A) reject(new Error('Could not start ffmpeg.'));
}));

function hasAudioTrack(input) {
  return new Promise(resolve => {
    const p = spawn(ffmpegPath, ['-hide_banner', '-i', input], { stdio: ['ignore', 'ignore', 'pipe'] });
    let t = '';
    p.stderr.on('data', d => { t += d.toString(); });
    p.on('error', () => resolve(true));
    p.on('close', () => resolve(/Stream #\d+:\d+.*Audio:/.test(t)));
  });
}

// Pure: builds the ffmpeg filter graph for one clip. Inputs: 0 video, then logo?, overlay PNGs, music?
function buildClipFilter(o) {
  const { W, H, fit, bg, hasLogo, logo, overlays, hasMusic, hasAudio, music, videoVol, fade, loudnorm, fps, len } = o;
  const f = [];
  if (fit === 'crop') f.push(`[0:v]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H}[base0]`);
  else if (fit === 'color') f.push(`[0:v]scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=${bg}[base0]`);
  else {
    f.push('[0:v]split=2[a][b]');
    f.push(`[a]scale=${W}:${H}:force_original_aspect_ratio=increase,crop=${W}:${H},boxblur=25:5[bgv]`);
    f.push(`[b]scale=${W}:${H}:force_original_aspect_ratio=decrease[fg]`);
    f.push('[bgv][fg]overlay=(W-w)/2:(H-h)/2[base0]');
  }
  f.push(fps ? `[base0]fps=${fps}[c0]` : '[base0]null[c0]');
  let cur = 'c0', idx = 1, n = 1;
  if (hasLogo) {
    const lw = Math.max(40, Math.round((W * logo.scale) / 100)), m = Math.round(W * 0.037);
    const xy = { tl: `${m}:${m}`, tr: `W-w-${m}:${m}`, bl: `${m}:H-h-${m}`, br: `W-w-${m}:H-h-${m}` }[logo.pos] || `W-w-${m}:H-h-${m}`;
    f.push(`[${idx}:v]scale=${lw}:-1,format=rgba,colorchannelmixer=aa=${(logo.opacity / 100).toFixed(2)}[lg]`);
    f.push(`[${cur}][lg]overlay=${xy}[c${n}]`);
    cur = 'c' + n++; idx++;
  }
  for (const ov of overlays) {
    f.push(`[${cur}][${idx}:v]overlay=0:${ov.y}:enable='between(t,${ov.start.toFixed(3)},${ov.end.toFixed(3)})'[c${n}]`);
    cur = 'c' + n++; idx++;
  }
  const fd = Math.min(0.5, len / 4);
  f.push(fade ? `[${cur}]fade=t=in:st=0:d=${fd.toFixed(2)},fade=t=out:st=${Math.max(0, len - fd).toFixed(2)}:d=${fd.toFixed(2)},format=yuv420p[v]` : `[${cur}]format=yuv420p[v]`);
  const musicIdx = hasMusic ? idx : -1;
  let aOut = null;
  if (hasAudio || hasMusic) {
    const post = [];
    if (loudnorm) post.push('loudnorm=I=-14:TP=-1.5:LRA=11', 'aresample=48000');
    if (fade) post.push(`afade=t=in:st=0:d=${fd.toFixed(2)}`, `afade=t=out:st=${Math.max(0, len - fd).toFixed(2)}:d=${fd.toFixed(2)}`);
    const tail = post.length ? ',' + post.join(',') : '';
    if (hasAudio && hasMusic) {
      f.push(`[0:a]volume=${videoVol.toFixed(2)}${music.duck ? ',asplit=2[va1][va2]' : '[va1]'}`);
      f.push(`[${musicIdx}:a]volume=${music.vol.toFixed(2)}[ma]`);
      if (music.duck) {
        f.push('[ma][va2]sidechaincompress=threshold=0.04:ratio=8:attack=20:release=500[md]');
        f.push(`[va1][md]amix=inputs=2:duration=first:dropout_transition=0:normalize=0${tail}[aout]`);
      } else {
        f.push(`[va1][ma]amix=inputs=2:duration=first:dropout_transition=0:normalize=0${tail}[aout]`);
      }
    } else if (hasAudio) {
      f.push(`[0:a]volume=${videoVol.toFixed(2)}${tail}[aout]`);
    } else {
      f.push(`[${musicIdx}:a]volume=${music.vol.toFixed(2)}${tail}[aout]`);
    }
    aOut = '[aout]';
  }
  return { graph: f.join(';'), aOut };
}

ipcMain.handle('clips:render', async (e, o) => {
  if (!ffmpegPath || !fs.existsSync(ffmpegPath)) throw new Error('ffmpeg was not found. Run npm install again.');
  if (!o || typeof o.input !== 'string' || !fs.existsSync(o.input)) throw new Error('Choose a video first.');
  const fmt = CLIP_DIMS[o.format] ? o.format : 'vertical';
  const q = o.quality === 720 ? 720 : 1080;
  const [W, H] = CLIP_DIMS[fmt][q];
  const start = Math.max(0, num(o.start, 0));
  const len = num(o.end, 0) - start;
  if (!(len > 0.2)) throw new Error('The clip is too short.');
  const outDir = typeof o.outputDir === 'string' && o.outputDir ? o.outputDir : path.join(app.getPath('movies'), 'ClipDesk', 'Clips');
  fs.mkdirSync(outDir, { recursive: true });
  const safe = String(o.name || 'Clip').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '').trim().slice(0, 80) || 'Clip';
  const out = uniquePath(outDir, safe, 'mp4');

  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'clipdesk-clip-'));
  const cleanup = () => fs.rm(tmp, { recursive: true, force: true }, () => {});
  try {
    const list = Array.isArray(o.overlays) ? o.overlays : [];
    if (list.length > 200) throw new Error('Too many captions in one clip (200 max).');
    const overlays = list.map((c, i) => {
      const m = /^data:image\/png;base64,([A-Za-z0-9+/=]+)$/.exec((c && c.png) || '');
      const s = num(c && c.start, NaN), en = num(c && c.end, NaN), y = Math.round(num(c && c.y, 0));
      if (!m || !Number.isFinite(s) || !Number.isFinite(en) || en <= s) throw new Error('Bad overlay data.');
      const file = path.join(tmp, `ov${String(i).padStart(4, '0')}.png`);
      fs.writeFileSync(file, Buffer.from(m[1], 'base64'));
      return { file, start: s, end: en, y };
    });
    const hasLogo = !!(o.logo && typeof o.logo.path === 'string' && fs.existsSync(o.logo.path));
    const hasMusic = !!(o.music && typeof o.music.path === 'string' && fs.existsSync(o.music.path));
    const hasAudio = await hasAudioTrack(o.input);
    const logo = { pos: o.logo && o.logo.pos, scale: Math.min(60, Math.max(3, num(o.logo && o.logo.scale, 14))), opacity: Math.min(100, Math.max(5, num(o.logo && o.logo.opacity, 100))), path: o.logo && o.logo.path };
    const music = { vol: Math.min(2, Math.max(0, num(o.music && o.music.vol, 20) / 100)), duck: !!(o.music && o.music.duck), from: Math.max(0, num(o.music && o.music.from, 0)), path: o.music && o.music.path };
    const fps = [24, 30, 60].includes(Number(o.fps)) ? Number(o.fps) : 0;
    const { graph, aOut } = buildClipFilter({
      W, H, fit: ['crop', 'color'].includes(o.fit) ? o.fit : 'blur', bg: hexColor(o.bg, '0x000000'),
      hasLogo, logo, overlays, hasMusic, hasAudio, music,
      videoVol: Math.min(2, Math.max(0, num(o.videoVol, 100) / 100)), fade: !!o.fade, loudnorm: !!o.loudnorm, fps, len,
    });
    const args = ['-y', '-hide_banner', '-nostats', '-progress', 'pipe:1'];
    if (start > 0) args.push('-ss', String(start));
    args.push('-i', o.input);
    if (hasLogo) args.push('-i', logo.path);
    overlays.forEach(c => args.push('-i', c.file));
    if (hasMusic) args.push('-stream_loop', '-1', '-ss', String(music.from), '-i', music.path);
    args.push('-filter_complex', graph, '-map', '[v]');
    if (aOut) args.push('-map', aOut);
    args.push('-t', String(len), '-c:v', 'libx264', '-preset', 'veryfast', '-crf', q === 720 ? '22' : '20', '-pix_fmt', 'yuv420p');
    if (aOut) args.push('-c:a', 'aac', '-b:a', '192k');
    args.push('-movflags', '+faststart', out);

    await new Promise((resolve, reject) => {
      const proc = spawn(ffmpegPath, args, { stdio: ['ignore', 'pipe', 'pipe'] });
      let errTail = '';
      proc.stderr.on('data', d => { errTail = (errTail + d.toString()).slice(-1500); });
      proc.stdout.on('data', d => {
        const m = /out_time_(?:us|ms)=(\d+)/.exec(d.toString());
        if (m) e.sender.send('clips:renderProgress', Math.min(1, Number(m[1]) / 1e6 / len));
      });
      proc.on('error', reject);
      proc.on('close', code => (code === 0 ? resolve() : reject(new Error('ffmpeg failed: ' + errTail.trim().split('\n').slice(-3).join(' ')))));
    });
    return { output: out };
  } finally {
    cleanup();
  }
});

ipcMain.handle('clips:dir', () => path.join(app.getPath('movies'), 'ClipDesk', 'Clips'));
ipcMain.handle('shell:openDir', async (_e, p) => {
  if (typeof p !== 'string') return;
  fs.mkdirSync(p, { recursive: true });
  await shell.openPath(p);
});

if (process.env.CLIPDESK_TEST) module.exports = { pickMoments, movingBaseline, buildClipFilter, CLIP_DIMS };

// ---------- window ----------
function createWindow() {
  win = new BrowserWindow({
    width: 1320,
    height: 860,
    minWidth: 980,
    minHeight: 640,
    backgroundColor: '#0e0e10',
    title: 'ClipDesk',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webviewTag: true,
    },
  });
  win.loadFile(path.join(__dirname, 'renderer', 'index.html'));
  win.webContents.on('will-navigate', ev => ev.preventDefault());
}

app.on('web-contents-created', (_e, contents) => {
  contents.setWindowOpenHandler(({ url }) => {
    if (/^https:\/\//.test(url)) shell.openExternal(url);
    return { action: 'deny' };
  });
  contents.on('will-attach-webview', (ev, prefs, params) => {
    delete prefs.preload;
    prefs.nodeIntegration = false;
    prefs.contextIsolation = true;
    if (!/^https:\/\//.test(params.src || '')) ev.preventDefault();
  });
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => { if (BrowserWindow.getAllWindows().length === 0) createWindow(); });
});
app.on('window-all-closed', () => { if (process.platform !== 'darwin') app.quit(); });
