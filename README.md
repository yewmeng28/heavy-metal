# Heavy Metal 🤘

A free, offline-capable workout and run tracker. Plain HTML/CSS/JS — no build step, no backend, no accounts.
All data is stored in your browser (`localStorage`); use **Data → Export** to back up or move it between devices.

## How to use

**Train**
1. Tap **Empty workout**, or **Start** next to a setlist (template).
2. Add exercises with the dropdown and **Add**. Each exercise shows what you did last time.
3. Under each exercise, add sets with **+ Warm-up**, **+ Set** or **+ Drop set**. Warm-ups always sit at the top and drop sets at the bottom. Weight and reps are pre-filled and editable.
4. Enter weight and reps, then tap **✓** when the set is done. The rest timer starts automatically.
5. Tap **Finish** to save the session to History. **Discard** throws it away. Tap **×** on a history entry to delete it.

**Library**
- **Exercises:** add, rename or remove exercise types (e.g. Incline Press).
- **Setlists:** create a template, add exercises, reorder with **↑**. Start it from the Train tab.

**Rest timer** (bar above the tabs)
- **−15 / +15** adjust the time; when idle this changes your default rest. **Rest** starts it manually, **Skip** stops it.
- When it ends the screen flashes, it beeps, and it vibrates where supported. Tap the screen to dismiss.

**Stats**
- Pick an exercise and a metric (top weight, estimated 1RM or volume). Tap a point on the chart for that session's sets. Warm-ups are excluded.

**Run**
- Use the stopwatch (then **Use time**) or type the time in, add distance, and **Save run**. Pace, weekly totals and a distance/pace chart follow.

**Data**
- **Your crew:** choose a mascot, or Random, to cheer you on.
- **Settings:** kg/lbs, km/miles, default rest, and sound/vibration/auto-rest toggles. Changing units converts everything, nothing is lost.
- **Backup & sync:** **Export JSON** saves a backup (share sheet: AirDrop, Files, Notes). On another device use **Import (merge)** to add it, or **Import (replace)** to overwrite. **Export CSV** is for spreadsheets. Copy/paste import works too.

**Customising mascot lines:** edit the `lines` arrays in `mascots.js`, bump `CACHE` in `sw.js` (e.g. `hm-v8`), then push.

## Deploy (GitHub Pages)

1. Push this repo to GitHub (`yewmeng28/heavy-metal`).
2. Repo → **Settings → Pages** → Source: *Deploy from a branch* → `main` / `/ (root)`.
3. Open `https://yewmeng28.github.io/heavy-metal/` in **Safari** on your iPhone.
4. Share button → **Add to Home Screen**.

## Local preview

    python3 -m http.server 8000   # then open http://localhost:8000

## Notes

- The home-screen app and the Safari tab have **separate storage**. Pick one (home-screen) and stick with it.
- iOS Safari does not support `navigator.vibrate`; the rest timer flashes the screen and beeps instead
  (the ringer switch mutes the beep). The screen is kept awake while a rest timer runs.
- Export regularly — Safari can clear site data.
