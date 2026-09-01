# THE ARCHIVE

A cinematic, personalized birthday game. The experience runs:

`opening (India map + distance) → awakening → mission → date puzzle → cake →
movie crossword → Netflix reward → highway race → ending → memory lane →
letter → archive sealed`

Progress is saved to `localStorage`, so an accidental refresh offers
"continue where you left off" on the landing page.

## Frontend development

```bash
npm install
npm run dev
```

Then open the local URL Vite prints (usually http://localhost:5173).

## Production-style local server

The Python server serves the compiled frontend and supports client-side routes.

```bash
pip install -r requirements.txt
npm run build
python server.py
```

Open http://127.0.0.1:5000. The health check is available at
http://127.0.0.1:5000/api/health.

## Controls

- **Level 1** — keypad, enter the date.
- **Level 2** — solve the movie crossword.
- **Level 3 (highway race)** — `←`/`A` and `→`/`D` change lane, `Space` holds
  nitro, `P`/`Esc` pauses. On touch devices an on-screen pad appears, and
  tapping either half of the screen steers.
- The debug panel is available with `F8` during development; individual scenes
  are reachable at `/debug`.

## Content you can edit

| What | Where |
| --- | --- |
| Name, cities, road distance, copy, candle count, mic sensitivity | `src/data/birthdayConfig.js` |
| Mission text, HUD labels | `src/data/gameConfig.js` |
| India outline, city coordinates, projection | `src/data/indiaGeo.js` |
| Memory photos | `src/assets/memories/01.webp` … `11.webp` |
| Memory captions | `src/components/game/MemoryJourney.jsx` |
| Letter text | `src/components/game/MemoryJourney.jsx` |

The great-circle distance and bearing on the landing page are computed from the
coordinates in `indiaGeo.js` — only `roadKm` in `birthdayConfig.js` is a
hand-entered figure.

## Optional audio

Two audio files are loaded from `public/` and are **not** in the repo. The site
works without them (silently); drop them in to enable sound:

```
public/assets/audio/happy-birthday.mp3   # cake scene
public/assets/audio/click.mp3            # gift button
```

The game theme (`src/assets/sounds/got-theme.mp3`) and the memory-lane track
(`saibo.mp3`) are bundled and work out of the box.

## Images

Photos and posters are stored as WebP sized for their actual display size
(memories 1200px, posters 700px tall, player cards 1240px tall). If you replace
one, keep it near those dimensions — full-resolution phone photos were making
the build ~30 MB heavier for no visible gain.
