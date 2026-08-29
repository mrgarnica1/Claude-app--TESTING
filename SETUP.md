# Europe 2026 — PWA + Trip Alerts setup

What's in this folder:
- `index.html` — your app (same as before, now with PWA + alert hooks added)
- `manifest.json`, `sw.js` — makes it installable + caches itself so the
  installed icon opens instantly with zero signal
- `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` — app icons

---

## 1. Host it (needs HTTPS — required for both installability and push)

Easiest for a dev: **GitHub Pages**, free, and you already have git.

```bash
cd pwakit
git init
git add .
git commit -m "Europe 2026 trip app"
gh repo create europe-trip-2026 --public --source=. --push
# then in the repo: Settings > Pages > Deploy from branch > main /(root)
```

Your live URL will be something like
`https://<your-username>.github.io/europe-trip-2026/`

(Netlify/Vercel drag-and-drop work too if you'd rather skip git — just
drop the whole `pwakit` folder onto their upload page.)

## 2. Install it on your phone

Open the live URL in **Safari** (not Chrome — iOS push only works through
Safari's Add to Home Screen) → Share → **Add to Home Screen**. Open the
app from the new **home screen icon** at least once — that's what
registers the service worker and makes push eligible on iOS.

## 3. Set up OneSignal (free, no server needed)

1. Create an account at **onesignal.com** → New App → **Web Push**.
2. Choose **Custom Code Setup** (not the Wordpress/Shopify flow).
3. It'll ask for your site URL (the GitHub Pages link) and give you:
   - A `<head>` snippet with your App ID + Safari Web ID → paste it into
     `index.html` in place of `<!-- ONESIGNAL_HEAD_SNIPPET_GOES_HERE -->`
   - Two files, `OneSignalSDKWorker.js` + `OneSignalSDKUpdaterWorker.js`
     → drop them **unchanged, unrenamed** into the same folder as `sw.js`
4. In `sw.js`, follow the TODO block at the bottom to merge OneSignal's
   push listener into the existing cache logic (their docs page — search
   "OneSignal custom service worker push handler" — shows the current
   `importScripts(...)` line; copy it fresh since the exact URL can shift
   between SDK versions).
5. Push the updated files back to GitHub (`git add . && git commit -m
   "onesignal" && git push`) — Pages redeploys automatically in ~1 min.
6. Open the app (from the home screen icon), tap **Enable Trip Alerts**
   in the Bookings tab, accept the permission prompt. Done.

## 4. Scheduling notifications (no server — just their dashboard)

OneSignal → Messages → New Push → pick "Send to Particular Segment" (or
just "All" since it's just your family) → set a future **Send Date/Time**
in the scheduler. Suggested ones, all times local to the destination:

| Send date/time | Message |
|---|---|
| Sep 13, 6:00 PM | Flight LH5F3 to Barcelona tomorrow 8:55 PM — check in opens 24h before |
| Sep 16, 8:00 AM | Sagrada Família today 9:00 AM — Julia Travel, ref #23WFRP08 |
| Sep 18, 8:00 AM | Colosseum/Forum tour today 9:00 AM — The Tour Guy, ref #BR-1422698207 |
| Sep 20, 7:00 AM | Board Odyssey of the Seas today — Civitavecchia |
| Sep 19, 6:00 PM | Sep 20 private transfer to Civitavecchia — confirm pickup time tonight |
| Sep 25, 6:00 PM | Naples tomorrow — Sep 26 Italy strike affects trains, not the ship. Skip local trains if unsure |
| Sep 29, 6:00 PM | French Bee flight to Newark tomorrow 6:50 PM — separate airline from Alaska, re-check bags in Newark |
| Sep 30, 6:00 PM | Alaska 287 to LAX tomorrow 6:27 PM |

Add/edit freely — this is just a starting list pulled from your current
itinerary data.
