'use strict';
// ClipDesk bootstrap. Starts the newest code available: a downloaded update if there is one, otherwise the code inside the app.
// This file is part of the installed app and is not replaced by code-only updates.
const { app, ipcMain, BrowserWindow, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const crypto = require('crypto');
const Module = require('module');
const U = require('./updater');
const pkg = require('./package.json');

const cfg = pkg.clipdeskUpdate || {};
const SHELL = Number(cfg.shell) || 1;
const REPO = String(cfg.repo || '');
const BUNDLED = pkg.version;
const CODE_ROOT = path.join(app.getPath('userData'), 'code');
const repoOk = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(REPO) && !REPO.startsWith('REPLACE');

// Updated code lives outside the app, so let it find the app's installed packages.
process.env.NODE_PATH = [path.join(__dirname, 'node_modules'), process.env.NODE_PATH].filter(Boolean).join(path.delimiter);
Module._initPaths();

const pick = U.pickCodeDir(CODE_ROOT, BUNDLED, SHELL);
let loadedVersion = pick ? pick.version : BUNDLED;
let lastStatus = { state: repoOk ? 'idle' : 'disabled', message: repoOk ? '' : 'Updates are not set up yet.' };
let busy = false;

try {
  if (pick) require(path.join(pick.dir, 'main.js'));
  else require('./main.js');
} catch (err) {
  console.error('ClipDesk failed to start:', err);
  if (pick) {
    U.dropPointer(CODE_ROOT);
    app.relaunch();
    app.exit(0);
  } else {
    throw err;
  }
}

function setStatus(s) {
  lastStatus = { ...s, current: loadedVersion };
  BrowserWindow.getAllWindows().forEach(w => {
    try { w.webContents.send('update:status', lastStatus); } catch {}
  });
}

async function checkForUpdate() {
  if (!repoOk) return setStatus({ state: 'disabled', message: 'Updates are not set up yet.' });
  if (busy) return;
  busy = true;
  try {
    setStatus({ state: 'checking', message: 'Checking for updates...' });
    const res = await fetch(`https://api.github.com/repos/${REPO}/releases/latest`, {
      headers: { accept: 'application/vnd.github+json', 'user-agent': 'ClipDesk' },
    });
    if (res.status === 404) return setStatus({ state: 'uptodate', message: 'No update published yet.' });
    if (!res.ok) throw new Error('GitHub answered ' + res.status + '.');
    const rel = await res.json();
    const version = String(rel.tag_name || '').replace(/^v/, '');
    if (!U.VERSION_RE.test(version)) throw new Error('The latest release has an unexpected version name.');

    const pointer = U.readPointer(CODE_ROOT);
    const have = pointer && U.VERSION_RE.test(String(pointer.version)) && U.cmpVersion(pointer.version, loadedVersion) > 0 ? pointer.version : loadedVersion;
    if (U.cmpVersion(version, have) <= 0) {
      return setStatus({ state: have !== loadedVersion ? 'ready' : 'uptodate', version: have, message: have !== loadedVersion ? `Version ${have} is ready. Restart to use it.` : 'You have the latest version.' });
    }

    const asset = (rel.assets || []).find(a => a.name === 'clipdesk-code.tar.gz');
    if (!asset) throw new Error('The release has no update file.');
    setStatus({ state: 'downloading', version, message: `Downloading version ${version}...` });
    const dl = await fetch(asset.browser_download_url, { headers: { 'user-agent': 'ClipDesk' } });
    if (!dl.ok) throw new Error('Download failed (' + dl.status + ').');
    const buf = Buffer.from(await dl.arrayBuffer());
    if (buf.length > 50 * 1024 * 1024) throw new Error('The update file is unexpectedly large.');
    if (typeof asset.digest === 'string' && asset.digest.startsWith('sha256:')) {
      const sum = crypto.createHash('sha256').update(buf).digest('hex');
      if (sum !== asset.digest.slice(7)) throw new Error('The update file failed its safety check.');
    }
    const tmpFile = path.join(os.tmpdir(), `clipdesk-update-${Date.now()}.tar.gz`);
    fs.writeFileSync(tmpFile, buf);
    try {
      await U.installTarball(tmpFile, CODE_ROOT, version, SHELL);
    } finally {
      fs.rm(tmpFile, () => {});
    }
    U.writePointer(CODE_ROOT, { version, attempts: 0 });
    U.cleanOld(CODE_ROOT, [version, loadedVersion]);
    setStatus({ state: 'ready', version, message: `Version ${version} is ready. Restart to use it.` });
  } catch (e) {
    if (e && e.code === 'NEEDS_INSTALL') {
      setStatus({ state: 'needs-install', message: 'A bigger update is available. Download and install the new ClipDesk.dmg from the releases page.' });
    } else {
      setStatus({ state: 'error', message: 'Update check failed: ' + (e && e.message ? e.message : e) });
    }
  } finally {
    busy = false;
  }
}

ipcMain.handle('update:get', () => ({ ...lastStatus, current: loadedVersion }));
ipcMain.handle('update:check', () => { checkForUpdate(); return true; });
ipcMain.handle('update:restart', () => { app.relaunch(); app.exit(0); });
ipcMain.handle('update:releases', () => {
  if (repoOk) shell.openExternal(`https://github.com/${REPO}/releases/latest`);
});

app.whenReady().then(() => {
  setTimeout(checkForUpdate, 8000);
  setInterval(checkForUpdate, 6 * 60 * 60 * 1000);
  // If the app stays up for 15 seconds with a window open, an update is considered good.
  setTimeout(() => {
    if (pick && BrowserWindow.getAllWindows().length) U.markGood(CODE_ROOT, pick.version);
  }, 15000);
});
