# ClipDesk

A Mac app for making short videos from footage you are allowed to use.

- **Watch**: Twitch and YouTube in a built-in browser. Use their own Clip buttons.
- **Studio**: trim a video, convert it to vertical (9:16) or horizontal (16:9), add your logo.
- **Subtitles**: transcribes the speech in your video on your Mac (no API key), lets you fix any mistakes, and burns styled captions into the export. Pick the video and Start/End in Studio, press Transcribe in Subtitles, then tick "Burn in subtitles" in Studio and export. Works for vertical and horizontal.
- **Thumbnails**: grab a frame from your video, add text and your logo, save a PNG.
- **Post text**: Claude writes titles, thumbnail text, a caption and hashtags (English).
- **Ideas**: chat with Claude for video ideas, with optional web search for trends.

ClipDesk does not download other people's YouTube or Twitch videos. Use your own gameplay and streams, or files that a creator has given you permission to use.

## Build the DMG (about 10 minutes)

1. Install Node.js (the LTS version) from https://nodejs.org
2. Unzip this folder, open Terminal, and go into it:
   ```
   cd ~/Downloads/clipdesk
   ```
3. Install everything:
   ```
   npm install
   ```
4. Try it first:
   ```
   npm start
   ```
5. Build the DMG:
   ```
   npm run dist
   ```
   The file appears in the `dist` folder. Open it and drag ClipDesk to Applications.

The app is not signed by Apple, so the first time: right-click ClipDesk in Applications, choose **Open**, then **Open** again.

## First-time setup in the app

1. Settings: paste your Anthropic API key (console.anthropic.com). It is billed per use and is separate from your Claude chat plan.
2. Studio: choose your logo once. It is remembered.

## Subtitles notes

- The first Transcribe downloads a speech model (about 40 MB for Fast, 150 MB for Balanced, 250 MB for Best) and then works offline. It needs an internet connection that one time.
- Subtitles and post text are English only. The speech models are the English-specific ones, which are smaller and more accurate. Always read through the captions and fix names and game terms before exporting.
- To save time on long videos, set Start and End in Studio first. Only that part is transcribed.
- Words per caption: 2 to 3 works best for Shorts and Reels.

## If something goes wrong

- Transcribe fails or says a module is missing: run `npm install` again in the project folder. If it still fails, copy the error and send it to Claude. You can always add captions by hand with "Add line".
- `npm install` says a version does not exist: run `npm install electron@latest electron-builder@latest --save-dev` and try again.
- A step fails: copy the full error from Terminal and send it to Claude.
- The build is for your Mac's chip only (Apple Silicon or Intel), because ffmpeg is bundled per chip.
