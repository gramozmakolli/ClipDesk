'use strict';
// Language (English / Albanian) and theme (dark / light). Loaded in <head> so the theme applies before anything is drawn.
(function () {
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };
  let lang = store.get('lang') === 'sq' ? 'sq' : 'en';
  let theme = store.get('theme') === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = theme;
  document.documentElement.lang = lang;

  const D = {
    en: {
      'nav.watch': 'Watch', 'nav.studio': 'Studio', 'nav.subs': 'Subtitles', 'nav.thumbs': 'Thumbnails',
      'nav.captions': 'Post text', 'nav.ideas': 'Ideas', 'nav.settings': 'Settings',
      'tools.lang': 'Language', 'tools.toLight': 'Switch to light mode', 'tools.toDark': 'Switch to dark mode',
      'c.size': 'Size', 'c.color': 'Color', 'c.pos': 'Position', 'c.save': 'Save', 'c.copy': 'Copy', 'c.use': 'Use', 'c.go': 'Go',

      'w.reload': 'Reload', 'w.urlPh': 'https://www.twitch.tv/streamer or a YouTube link', 'w.go': 'Go',
      'w.streamers': 'Streamers:', 'w.addPh': 'add name', 'w.add': 'Add',
      'w.note': "Clip with the site's own button: on Twitch use the Clip button (or Alt+X), on YouTube use the Clip button under the video when the creator allows it. Get the streamer's or creator's permission before you post their footage on your channel.",
      'w.chipTitle': 'Open (right-click to remove)',

      's.drop': 'Drop a video here (your gameplay, your stream, or footage you have permission to use)',
      's.pick': 'Choose video', 's.start': 'Start', 's.useTime': 'Use current time', 's.end': 'End', 's.endPh': 'end',
      's.format': 'Format', 's.vertical': 'Vertical 9:16 (Shorts, Reels)', 's.horizontal': 'Horizontal 16:9',
      's.fit': 'Fit', 's.fitBlur': 'Blurred background', 's.fitCrop': 'Crop to fill',
      's.logo': 'Logo', 's.addLogo': 'Add my logo', 's.pickLogo': 'Choose logo (PNG)', 's.noLogo': 'none yet',
      's.corner': 'Corner', 's.tl': 'Top left', 's.tr': 'Top right', 's.bl': 'Bottom left', 's.br': 'Bottom right',
      's.subs': 'Subtitles', 's.burn': 'Burn in subtitles (made in the Subtitles tab)',
      's.output': 'Output', 's.pickOut': 'Choose folder', 's.export': 'Export clip', 's.exporting': 'Exporting...',
      's.saved': 'Saved: ', 's.finder': 'Show in Finder',

      'sb.h1': '1. Transcribe',
      'sb.desc': 'Uses the video chosen in Studio and its Start/End times. Runs on this Mac, no API key needed. The first run downloads a speech model.',
      'sb.acc': 'Accuracy', 'sb.fast': 'Fast (small model)', 'sb.balanced': 'Balanced', 'sb.best': 'Best (slow, big download)',
      'sb.go': 'Transcribe', 'sb.working': 'Working...', 'sb.h2': '2. Style', 'sb.words': 'Words per caption', 'sb.regroup': 'Regroup',
      'sb.font': 'Font', 'sb.outline': 'Outline', 'sb.caps': 'ALL CAPS', 'sb.low': 'Lower third', 'sb.mid': 'Middle', 'sb.top': 'Top',
      'sb.hint': 'Then go to Studio, tick "Burn in subtitles" and export.',
      'sb.list': 'Captions (edit anything)', 'sb.add': 'Add line', 'sb.clear': 'Clear all',
      'sb.empty': 'Nothing yet. Transcribe, or add lines by hand.', 'sb.preview': 'This is how it looks',
      'sb.seek': 'Jump to this time in the Studio preview', 'sb.newLine': 'New line',

      'th.bg': 'Background', 'th.pick': 'Choose video or image', 'th.frameAt': 'Frame at (s)', 'th.grab': 'Grab frame',
      'th.text': 'Text', 'th.textPh': 'THUMBNAIL TEXT', 'th.top': 'Top', 'th.mid': 'Middle', 'th.bot': 'Bottom',
      'th.dark': 'Darken for contrast', 'th.logo': 'Show my logo', 'th.save': 'Save PNG',
      'th.hint': "Use a real screenshot or frame from your own gameplay. Don't use Rockstar's official art or logos.",
      'th.empty': 'Choose a video or image', 'th.usingVideo': 'Using video: ', 'th.usingImage': 'Using image: ',

      'cp.h': 'Tell Claude about the clip',
      'cp.descPh': 'What happens in the video? (e.g. first time driving through Vice City at night, police chase ends in the water)',
      'cp.topic': 'Topic', 'cp.plat': 'Platform', 'cp.ys': 'YouTube Short', 'cp.yv': 'YouTube video', 'cp.fr': 'Facebook Reel', 'cp.fp': 'Facebook post',
      'cp.tone': 'Tone', 'cp.hyped': 'Hyped', 'cp.chill': 'Chill', 'cp.funny': 'Funny', 'cp.news': 'Serious news',
      'cp.go': 'Generate', 'cp.writing': 'Writing...', 'cp.results': 'Results will show up here.',
      'cp.titles': 'Titles', 'cp.thumbTexts': 'Thumbnail text (click Use)', 'cp.caption': 'Caption', 'cp.hashtags': 'Hashtags',

      'id.web': 'Search the web for trends', 'id.ph': 'Ask for video ideas...', 'id.send': 'Send', 'id.clear': 'New chat',
      'id.thinking': 'Thinking...', 'id.empty': '(empty reply)',
      'id.q1': '10 video ideas for this week', 'id.q2': '5 Shorts ideas I can make in under an hour',
      'id.q3': 'What are people searching for about GTA 6 right now?', 'id.q4': 'Give me a 7 day posting plan for YouTube and Facebook',

      'set.key': 'Anthropic API key',
      'set.keyDesc': 'Needed for captions and ideas. Get one at console.anthropic.com. It is billed per use and is separate from your Claude chat plan. The key is stored encrypted on this Mac.',
      'set.saveKey': 'Save key', 'set.removeKey': 'Remove key', 'set.test': 'Test', 'set.hasKey': 'A key is saved.', 'set.noKey': 'No key saved yet.',
      'set.upd': 'Updates', 'set.check': 'Check for updates', 'set.restart': 'Restart to update', 'set.openPage': 'Open download page',
      'set.model': 'Model', 'set.modelHint': 'Leave the default unless you know you want another Claude model.',
      'set.version': 'Version {v}',
      'upd.disabled': 'Updates are not set up yet.', 'upd.checking': 'Checking for updates...', 'upd.uptodate': 'You have the latest version.',
      'upd.downloading': 'Downloading version {v}...', 'upd.ready': 'Version {v} is ready. Restart to use it.',
      'upd.needs': 'A bigger update is available. Download and install the new ClipDesk from the releases page.',
      'upd.error': 'Update check failed',
      'upd.bannerReady': 'ClipDesk {v} is ready.', 'upd.bannerNeeds': 'A bigger update needs a new download.',
      'upd.restartBtn': 'Restart', 'upd.pageBtn': 'Open page', 'upd.later': 'Later',

      't.copied': 'Copied.', 't.copyFail': 'Could not copy.', 'err.image': 'Could not load image.',
      't.pasteKey': 'Paste your key first.', 't.keySaved': 'Key saved.', 't.keyRemoved': 'Key removed.', 't.works': 'Works: ', 't.modelSaved': 'Model saved.',
      't.badLink': 'That link does not look right.', 't.httpsOnly': 'Only https links are allowed.', 't.badName': 'That does not look like a Twitch name.',
      't.pickVideoFile': 'Please choose a video file (mp4, mov, mkv, webm).',
      't.noPreview': 'Preview is not supported for this file, but exporting still works. Type the times by hand.',
      't.chooseVideo': 'Choose a video first.', 't.badEnd': 'End time looks wrong. Use 1:30 or 90.', 't.endAfter': 'End must be after start.',
      't.chooseLogo': 'Choose your logo first.', 't.noSubs': 'No subtitles yet. Make them in the Subtitles tab first, or untick the box.',
      't.subsOutside': 'None of your subtitles fall inside the Start/End range.',
      't.chooseMedia': 'Choose a video or image first.', 't.saved': 'Saved ', 't.describe': 'Describe the clip first.',
      't.transcribeFirst': 'Transcribe first. Regrouping works on the transcribed words.', 't.regrouped': 'Regrouped. Your manual edits were replaced.',
      't.chooseVideoStudio': 'Choose a video in Studio first.', 't.endAfterStudio': 'End must be after start (set them in Studio).',
      't.done': 'Done: {n} words. Fix any mistakes on the right.',
    },

    sq: {
      'nav.watch': 'Shiko', 'nav.studio': 'Studio', 'nav.subs': 'Titrat', 'nav.thumbs': 'Miniaturat',
      'nav.captions': 'Teksti i postimit', 'nav.ideas': 'Idetë', 'nav.settings': 'Cilësimet',
      'tools.lang': 'Gjuha', 'tools.toLight': 'Kalo në modalitetin e ndritshëm', 'tools.toDark': 'Kalo në modalitetin e errët',
      'c.size': 'Madhësia', 'c.color': 'Ngjyra', 'c.pos': 'Pozicioni', 'c.save': 'Ruaj', 'c.copy': 'Kopjo', 'c.use': 'Përdor', 'c.go': 'Shko',

      'w.reload': 'Rifresko', 'w.urlPh': 'https://www.twitch.tv/streameri ose një link i YouTube-it', 'w.go': 'Shko',
      'w.streamers': 'Streamerët:', 'w.addPh': 'shto emrin', 'w.add': 'Shto',
      'w.note': 'Krijo klipin me butonin e vetë faqes: në Twitch përdor butonin Clip (ose Alt+X), në YouTube përdor butonin Clip nën video kur krijuesi e lejon. Merr leje nga streameri ose krijuesi para se të postosh materialin e tij në kanalin tënd.',
      'w.chipTitle': 'Hap (kliko me të djathtën për ta hequr)',

      's.drop': 'Hidhe një video këtu (gameplay-in tënd, stream-in tënd, ose material që ke leje ta përdorësh)',
      's.pick': 'Zgjidh videon', 's.start': 'Fillimi', 's.useTime': 'Përdor kohën aktuale', 's.end': 'Fundi', 's.endPh': 'fundi',
      's.format': 'Formati', 's.vertical': 'Vertikal 9:16 (Shorts, Reels)', 's.horizontal': 'Horizontal 16:9',
      's.fit': 'Përshtatja', 's.fitBlur': 'Sfond i turbulluar', 's.fitCrop': 'Preje për ta mbushur kuadrin',
      's.logo': 'Logoja', 's.addLogo': 'Shto logon time', 's.pickLogo': 'Zgjidh logon (PNG)', 's.noLogo': 'ende asnjë',
      's.corner': 'Këndi', 's.tl': 'Lart majtas', 's.tr': 'Lart djathtas', 's.bl': 'Poshtë majtas', 's.br': 'Poshtë djathtas',
      's.subs': 'Titrat', 's.burn': 'Ngjit titrat në video (të bëra te skeda Titrat)',
      's.output': 'Ruajtja', 's.pickOut': 'Zgjidh dosjen', 's.export': 'Eksporto klipin', 's.exporting': 'Duke eksportuar...',
      's.saved': 'U ruajt: ', 's.finder': 'Shfaq në Finder',

      'sb.h1': '1. Transkriptoje',
      'sb.desc': 'Përdor videon e zgjedhur te Studio dhe kohët Fillimi/Fundi. Funksionon në këtë Mac, nuk kërkon çelës API. Herën e parë shkarkon një model të të folurit.',
      'sb.acc': 'Saktësia', 'sb.fast': 'Shpejt (model i vogël)', 'sb.balanced': 'I balancuar', 'sb.best': 'Më e mira (ngadalë, shkarkim i madh)',
      'sb.go': 'Transkripto', 'sb.working': 'Duke punuar...', 'sb.h2': '2. Stili', 'sb.words': 'Fjalë për titër', 'sb.regroup': 'Rigrupo',
      'sb.font': 'Fonti', 'sb.outline': 'Kontura', 'sb.caps': 'TË GJITHA SHKRONJAT E MËDHA', 'sb.low': 'Pjesa e poshtme', 'sb.mid': 'Në mes', 'sb.top': 'Lart',
      'sb.hint': 'Pastaj shko te Studio, shëno "Ngjit titrat në video" dhe eksporto.',
      'sb.list': 'Titrat (ndrysho çfarëdo)', 'sb.add': 'Shto rresht', 'sb.clear': 'Fshi të gjitha',
      'sb.empty': 'Ende asgjë. Transkripto ose shto rreshta me dorë.', 'sb.preview': 'Kështu duket',
      'sb.seek': 'Kërce te ky moment në pamjen e Studios', 'sb.newLine': 'Rresht i ri',

      'th.bg': 'Sfondi', 'th.pick': 'Zgjidh video ose foto', 'th.frameAt': 'Kuadri në (s)', 'th.grab': 'Merr kuadrin',
      'th.text': 'Teksti', 'th.textPh': 'TEKSTI I MINIATURËS', 'th.top': 'Lart', 'th.mid': 'Në mes', 'th.bot': 'Poshtë',
      'th.dark': 'Errëso për kontrast', 'th.logo': 'Shfaq logon time', 'th.save': 'Ruaj PNG',
      'th.hint': 'Përdor një pamje reale nga gameplay-i yt. Mos përdor artin ose logot zyrtare të Rockstar-it.',
      'th.empty': 'Zgjidh një video ose foto', 'th.usingVideo': 'Po përdoret videoja: ', 'th.usingImage': 'Po përdoret fotoja: ',

      'cp.h': 'Tregoji Claude-it për klipin',
      'cp.descPh': 'Çfarë ndodh në video? (p.sh. hera e parë që vozit nëpër Vice City natën, ndjekja nga policia përfundon në ujë)',
      'cp.topic': 'Tema', 'cp.plat': 'Platforma', 'cp.ys': 'YouTube Short', 'cp.yv': 'Video në YouTube', 'cp.fr': 'Facebook Reel', 'cp.fp': 'Postim në Facebook',
      'cp.tone': 'Toni', 'cp.hyped': 'Plot energji', 'cp.chill': 'I qetë', 'cp.funny': 'Qesharak', 'cp.news': 'Lajme serioze',
      'cp.go': 'Gjenero', 'cp.writing': 'Duke shkruar...', 'cp.results': 'Rezultatet shfaqen këtu.',
      'cp.titles': 'Titujt', 'cp.thumbTexts': 'Teksti i miniaturës (kliko Përdor)', 'cp.caption': 'Përshkrimi', 'cp.hashtags': 'Hashtag-ët',

      'id.web': 'Kërko në internet për trende', 'id.ph': 'Kërko ide për video...', 'id.send': 'Dërgo', 'id.clear': 'Bisedë e re',
      'id.thinking': 'Duke menduar...', 'id.empty': '(përgjigje bosh)',
      'id.q1': '10 ide videosh për këtë javë', 'id.q2': '5 ide Shorts që mund t’i bëj brenda një ore',
      'id.q3': 'Çfarë po kërkojnë njerëzit për GTA 6 tani?', 'id.q4': 'Më jep një plan postimesh 7-ditor për YouTube dhe Facebook',

      'set.key': 'Çelësi API i Anthropic',
      'set.keyDesc': 'Nevojitet për Tekstin e postimit dhe Idetë. Merre te console.anthropic.com. Faturohet sipas përdorimit dhe është i ndarë nga plani yt i bisedave me Claude. Çelësi ruhet i enkriptuar në këtë Mac.',
      'set.saveKey': 'Ruaj çelësin', 'set.removeKey': 'Hiq çelësin', 'set.test': 'Testo', 'set.hasKey': 'Një çelës është ruajtur.', 'set.noKey': 'Ende pa çelës të ruajtur.',
      'set.upd': 'Përditësimet', 'set.check': 'Kontrollo për përditësime', 'set.restart': 'Rinis për të përditësuar', 'set.openPage': 'Hap faqen e shkarkimit',
      'set.model': 'Modeli', 'set.modelHint': 'Lëre të paracaktuarin nëse nuk e di që të duhet një model tjetër Claude.',
      'set.version': 'Versioni {v}',
      'upd.disabled': 'Përditësimet nuk janë vendosur ende.', 'upd.checking': 'Duke kontrolluar për përditësime...', 'upd.uptodate': 'Ke versionin e fundit.',
      'upd.downloading': 'Duke shkarkuar versionin {v}...', 'upd.ready': 'Versioni {v} është gati. Rinis për ta përdorur.',
      'upd.needs': 'Ka një përditësim më të madh. Shkarko dhe instalo ClipDesk-un e ri nga faqja e botimeve.',
      'upd.error': 'Kontrolli i përditësimeve dështoi',
      'upd.bannerReady': 'ClipDesk {v} është gati.', 'upd.bannerNeeds': 'Një përditësim më i madh kërkon shkarkim të ri.',
      'upd.restartBtn': 'Rinis', 'upd.pageBtn': 'Hap faqen', 'upd.later': 'Më vonë',

      't.copied': 'U kopjua.', 't.copyFail': 'Nuk u kopjua.', 'err.image': 'Fotoja nuk u ngarkua.',
      't.pasteKey': 'Ngjit çelësin më parë.', 't.keySaved': 'Çelësi u ruajt.', 't.keyRemoved': 'Çelësi u hoq.', 't.works': 'Funksionon: ', 't.modelSaved': 'Modeli u ruajt.',
      't.badLink': 'Ky link nuk duket i saktë.', 't.httpsOnly': 'Lejohen vetëm linke https.', 't.badName': 'Ky nuk duket si emër Twitch.',
      't.pickVideoFile': 'Zgjidh një skedar video (mp4, mov, mkv, webm).',
      't.noPreview': 'Pamja paraprake nuk mbështetet për këtë skedar, por eksportimi funksionon. Shkruaji kohët me dorë.',
      't.chooseVideo': 'Zgjidh një video më parë.', 't.badEnd': 'Koha e fundit duket gabim. Përdor 1:30 ose 90.', 't.endAfter': 'Fundi duhet të jetë pas fillimit.',
      't.chooseLogo': 'Zgjidh logon më parë.', 't.noSubs': 'Ende nuk ka titra. Krijoji te skeda Titrat, ose hiq shenjën.',
      't.subsOutside': 'Asnjë nga titrat nuk bie brenda intervalit Fillimi/Fundi.',
      't.chooseMedia': 'Zgjidh një video ose foto më parë.', 't.saved': 'U ruajt ', 't.describe': 'Përshkruaj klipin më parë.',
      't.transcribeFirst': 'Transkripto më parë. Rigrupimi funksionon mbi fjalët e transkriptuara.', 't.regrouped': 'U rigrupua. Ndryshimet e tua me dorë u zëvendësuan.',
      't.chooseVideoStudio': 'Zgjidh një video te Studio më parë.', 't.endAfterStudio': 'Fundi duhet të jetë pas fillimit (vendosi te Studio).',
      't.done': 'U krye: {n} fjalë. Korrigjo gabimet në të djathtë.',
    },
  };

  // Messages that come from the app's background process in English.
  const ERR_SQ = {
    'Add your Anthropic API key in Settings first.': 'Shto çelësin API të Anthropic te Cilësimet më parë.',
    'No speech was found.': 'Nuk u gjet të folur.',
    'No audio found in this video.': 'Nuk u gjet audio në këtë video.',
    'Choose a video first.': 'Zgjidh një video më parë.',
    'Claude took too long. Try again.': 'Claude u vonua shumë. Provo përsëri.',
  };
  const STATUS_SQ = [
    [/^Reading the audio/, () => 'Duke lexuar audion...'],
    [/^Loading the speech model/, () => 'Duke ngarkuar modelin e të folurit. Herën e parë shkarkohet (rreth 40 deri 250 MB), prit...'],
    [/^Downloading speech model\.\.\. (\d+)%/, m => `Duke shkarkuar modelin e të folurit... ${m[1]}%`],
    [/^Listening to the video/, () => 'Duke dëgjuar videon. Videot e gjata zgjasin...'],
  ];

  function tr(key, vars) {
    let s = (D[lang] && D[lang][key]) || D.en[key] || key;
    if (vars) for (const k of Object.keys(vars)) s = s.split('{' + k + '}').join(String(vars[k]));
    return s;
  }
  function errMsg(e) {
    let m = String((e && e.message) || e || '');
    m = m.replace(/^Error invoking remote method '[^']+': (?:Error: )?/, '');
    return lang === 'sq' && ERR_SQ[m] ? ERR_SQ[m] : m;
  }
  function statusMsg(m) {
    if (lang !== 'sq') return m;
    for (const [re, f] of STATUS_SQ) { const x = re.exec(m); if (x) return f(x); }
    return m;
  }
  function applyI18n() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = tr(el.dataset.i18n); });
    document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = tr(el.dataset.i18nPh); });
    document.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = tr(el.dataset.i18nTitle); });
    document.querySelectorAll('[data-lang]').forEach(b => b.classList.toggle('on', b.dataset.lang === lang));
    const tb = document.getElementById('themeBtn');
    if (tb) tb.title = tr(theme === 'dark' ? 'tools.toLight' : 'tools.toDark');
  }
  function setLang(l) {
    lang = l === 'sq' ? 'sq' : 'en';
    store.set('lang', lang);
    applyI18n();
    document.dispatchEvent(new Event('langchange'));
  }
  function setTheme(th) {
    theme = th === 'light' ? 'light' : 'dark';
    store.set('theme', theme);
    document.documentElement.dataset.theme = theme;
    applyI18n();
    document.dispatchEvent(new Event('themechange'));
  }

  Object.assign(window, {
    tr, errMsg, statusMsg, applyI18n, setLang, setTheme,
    getLang: () => lang, getTheme: () => theme,
  });
})();
