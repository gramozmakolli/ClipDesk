'use strict';
// Pure helpers for code-only updates. No Electron imports, so they can be tested with plain node.
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const VERSION_RE = /^\d+\.\d+\.\d+$/;
const REQUIRED = [
  'main.js',
  'preload.js',
  'update-manifest.json',
  path.join('renderer', 'index.html'),
  path.join('renderer', 'app.js'),
  path.join('renderer', 'style.css'),
];

function cmpVersion(a, b) {
  const pa = String(a).split('.').map(Number), pb = String(b).split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if (pa[i] !== pb[i]) return pa[i] > pb[i] ? 1 : -1;
  }
  return 0;
}

const pointerFile = root => path.join(root, 'current.json');
function readPointer(root) {
  try { return JSON.parse(fs.readFileSync(pointerFile(root), 'utf8')); } catch { return null; }
}
function writePointer(root, obj) {
  fs.mkdirSync(root, { recursive: true });
  const f = pointerFile(root);
  fs.writeFileSync(f + '.tmp', JSON.stringify(obj));
  fs.renameSync(f + '.tmp', f);
}
function dropPointer(root) {
  try { fs.unlinkSync(pointerFile(root)); } catch {}
}

function readManifest(dir) {
  try { return JSON.parse(fs.readFileSync(path.join(dir, 'update-manifest.json'), 'utf8')); } catch { return null; }
}

// Decide which code folder to run at startup. Returns { dir, version } or null (use the bundled code).
function pickCodeDir(root, bundledVersion, shellVersion) {
  const cur = readPointer(root);
  if (!cur || !VERSION_RE.test(String(cur.version))) return null;
  if (cmpVersion(cur.version, bundledVersion) <= 0) { dropPointer(root); return null; } // a newer DMG was installed
  if ((cur.attempts || 0) >= 2) { dropPointer(root); return null; } // it failed to start twice: roll back
  const dir = path.join(root, cur.version);
  for (const f of REQUIRED) {
    if (!fs.existsSync(path.join(dir, f))) { dropPointer(root); return null; }
  }
  const m = readManifest(dir);
  if (!m || m.version !== cur.version || (m.minShell || 1) > shellVersion) { dropPointer(root); return null; }
  writePointer(root, { version: cur.version, attempts: (cur.attempts || 0) + 1 });
  return { dir, version: cur.version };
}

// Called once the app has stayed up long enough to be trusted.
function markGood(root, version) {
  const cur = readPointer(root);
  if (cur && cur.version === version) writePointer(root, { version, attempts: 0 });
}

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { stdio: ['ignore', 'ignore', 'pipe'] });
    let err = '';
    p.stderr.on('data', d => { err = (err + d.toString()).slice(-400); });
    p.on('error', reject);
    p.on('close', code => (code === 0 ? resolve() : reject(new Error('Could not unpack the update. ' + err.trim()))));
  });
}

// Unpacks a downloaded update into <root>/<version>. Throws code NEEDS_INSTALL if it needs a newer full install.
async function installTarball(tarFile, root, expectedVersion, shellVersion) {
  if (!VERSION_RE.test(expectedVersion)) throw new Error('Bad version.');
  const tmp = path.join(root, expectedVersion + '.tmp');
  const dest = path.join(root, expectedVersion);
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });
  try {
    await run('tar', ['-xzf', tarFile, '-C', tmp]);
    for (const f of REQUIRED) {
      if (!fs.existsSync(path.join(tmp, f))) throw new Error('The update is incomplete (' + f + ' is missing).');
    }
    const m = readManifest(tmp);
    if (!m || m.version !== expectedVersion) throw new Error('The update does not match its version number.');
    if ((m.minShell || 1) > shellVersion) {
      const e = new Error('This update needs a fresh install of the app.');
      e.code = 'NEEDS_INSTALL';
      throw e;
    }
    fs.rmSync(dest, { recursive: true, force: true });
    fs.renameSync(tmp, dest);
    return m;
  } catch (e) {
    fs.rmSync(tmp, { recursive: true, force: true });
    throw e;
  }
}

function cleanOld(root, keep) {
  let entries = [];
  try { entries = fs.readdirSync(root); } catch { return; }
  for (const e of entries) {
    if (e === 'current.json' || keep.includes(e)) continue;
    fs.rmSync(path.join(root, e), { recursive: true, force: true });
  }
}

module.exports = { VERSION_RE, REQUIRED, cmpVersion, readPointer, writePointer, dropPointer, pickCodeDir, markGood, installTarball, cleanOld };
