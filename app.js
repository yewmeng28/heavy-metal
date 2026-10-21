'use strict';

/* ---------- constants & helpers ---------- */
const KEY = 'heavy-metal-v1';
const KG = 0.45359237, MI = 1.609344;
const $ = s => document.querySelector(s);
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pad = n => String(n).padStart(2, '0');
const today = () => { const d = new Date(); return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; };

const defaults = () => ({
  settings: { unit: 'kg', dist: 'km', rest: 90, autoRest: true, sound: true, vibrate: true, mascot: 'random' },
  exercises: [], templates: [], workouts: [], runs: [], active: null, lastExport: 0,
});

function seed() {
  const d = defaults();
  const names = [['bench', 'Bench Press'], ['row', 'Barbell Row'], ['ohp', 'Shoulder Press'], ['tri', 'Tricep Extension'],
    ['squat', 'Squat'], ['dead', 'Deadlift'], ['curl', 'Bicep Curl']];
  d.exercises = names.map(([id, name]) => ({ id, name }));
  d.templates = [{ id: 'push', name: 'Push Day', ids: ['bench', 'ohp', 'tri'] }, { id: 'pull', name: 'Pull Day', ids: ['row', 'dead', 'curl'] }];
  return d;
}

function load() {
  try {
    const r = JSON.parse(localStorage.getItem(KEY));
    if (r) return { ...defaults(), ...r, settings: { ...defaults().settings, ...r.settings } };
  } catch (e) { /* fall through */ }
  return seed();
}

let S = load();
function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { toast('Could not save (storage full or blocked)'); } }
try { navigator.storage?.persist?.(); } catch (e) { /* ignore */ }

const ui = { tab: 'train', progEx: null, progMetric: 'top', runMetric: 'dist', sw: { start: 0, acc: 0, on: false } };

/* units */
const toDisp = kg => S.settings.unit === 'kg' ? kg : kg / KG;
const fromDisp = v => S.settings.unit === 'kg' ? v : v * KG;
const num = x => String(+x.toFixed(1));
const fmtW = kg => kg == null ? '' : num(toDisp(kg));
const toDist = km => S.settings.dist === 'km' ? km : km / MI;
const fromDist = v => S.settings.dist === 'km' ? v : v * MI;
const fmtDur = s => { s = Math.round(s); const h = Math.floor(s / 3600), m = Math.floor(s % 3600 / 60); return h ? `${h}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`; };
const fmtDate = ts => { const d = new Date(ts); return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', ...(d.getFullYear() !== new Date().getFullYear() && { year: '2-digit' }) }); };
const exName = (id, fb) => S.exercises.find(e => e.id === id)?.name ?? fb ?? '?';

function toast(msg, avatar) {
  const t = $('#toast'); t.innerHTML = (avatar ? `<span class="av mini">${avatar}</span>` : '') + `<span>${esc(msg)}</span>`; t.hidden = false;
  clearTimeout(toast.t); toast.t = setTimeout(() => t.hidden = true, avatar ? 3200 : 2200);
}

/* ---------- mascots ---------- */
function say(kind, quiet) {
  const m = MASCOTS.find(x => x.id === S.settings.mascot) || MASCOTS[Math.random() * MASCOTS.length | 0];
  const pool = m.lines[kind] || m.lines.idle;
  ui.coach = { m, line: pool[Math.random() * pool.length | 0] };
  if (!quiet) toast(ui.coach.line, m.svg);
}
const coachHtml = () => ui.coach ? `<section class="card coach"><span class="av">${ui.coach.m.svg}</span>
  <div><b>${esc(ui.coach.m.name)}</b><div class="muted sm">${esc(ui.coach.line)}</div></div>
  <button class="btn ghost" data-act="coachNext" aria-label="New line">↻</button></section>` : '';

/* ---------- set types: warm-ups always first, drop sets always last ---------- */
const RANK = { warm: 0, work: 1, drop: 2 };
const sortSets = e => e.sets.sort((a, b) => RANK[a.t || 'work'] - RANK[b.t || 'work']);
const roundW = kg => fromDisp(Math.round(toDisp(kg) * 2) / 2);
const workSets = s => { const w = s.filter(x => x.t !== 'warm'); return w.length ? w : s; };

/* ---------- exercise history ---------- */
function history(exId) {
  return S.workouts
    .map(w => ({ date: w.date, e: w.entries.find(e => e.exerciseId === exId) }))
    .filter(x => x.e && x.e.sets.length)
    .map(x => ({ date: x.date, sets: x.e.sets }))
    .sort((a, b) => a.date - b.date);
}
const lastSets = exId => history(exId).at(-1)?.sets;
const setTxt = s => `${s.t === 'warm' ? 'W ' : s.t === 'drop' ? 'D ' : ''}${fmtW(s.w) || 0}×${s.r}`;

/* ---------- rendering ---------- */
function render() {
  $('#view').innerHTML = ({ train: viewTrain, lib: viewLib, stats: viewStats, run: viewRun, data: viewData })[ui.tab]();
  document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === ui.tab));
}

const exOptions = () => S.exercises.map(e => `<option value="${e.id}">${esc(e.name)}</option>`).join('');

/* --- Train --- */
function viewTrain() {
  return coachHtml() + (S.active ? activeHtml() : startHtml()) + historyHtml();
}

function startHtml() {
  const tpls = S.templates.map(t => `
    <div class="row"><div><b>${esc(t.name)}</b>
      <div class="muted sm">${esc(t.ids.map(id => exName(id)).join(' · ')) || 'No exercises yet'}</div></div>
      <button class="btn" data-act="startTpl" data-id="${t.id}">Start</button></div>`).join('');
  return `<section class="card"><h2>New session</h2>
    <button class="btn primary big" data-act="startEmpty">Empty workout</button>
    ${tpls ? `<h3>Setlists</h3>${tpls}` : ''}</section>`;
}

function activeHtml() {
  const a = S.active;
  return `<section class="card"><input class="title" data-chg="wname" value="${esc(a.name)}" aria-label="Workout name">
    ${a.entries.map(entryHtml).join('')}
    <div class="row" style="margin-top:14px"><select id="addEx">${exOptions()}</select><button class="btn" data-act="addEx">Add</button></div>
    <div class="row"><button class="btn primary grow" data-act="finish">Finish</button><button class="btn ghost danger" data-act="discard">Discard</button></div>
  </section>`;
}

function entryHtml(e, ei) {
  const last = lastSets(e.exerciseId);
  let n = 0;
  const rows = e.sets.map((s, si) => {
    const d = `data-ei="${ei}" data-si="${si}"`, t = s.t || 'work';
    return `<div class="set ${t} ${s.done ? 'done' : ''}">
      <span class="n">${t === 'warm' ? 'W' : t === 'drop' ? 'D' : ++n}</span>
      <input inputmode="decimal" placeholder="${S.settings.unit}" value="${fmtW(s.w)}" data-chg="w" ${d} aria-label="Weight">
      <input inputmode="numeric" placeholder="reps" value="${s.r ?? ''}" data-chg="r" ${d} aria-label="Reps">
      <button class="chk" data-act="toggleSet" ${d} aria-label="Done">✓</button>
      <button class="x" data-act="delSet" ${d} aria-label="Remove set">×</button></div>`;
  }).join('');
  return `<div class="entry"><div class="hd"><b>${esc(exName(e.exerciseId, e.name))}</b>
      <button class="btn sm ghost danger" data-act="delEntry" data-ei="${ei}">Remove</button></div>
    <div class="muted sm">${last ? 'Last: ' + last.map(setTxt).join(', ') : 'No previous sessions'}</div>
    <div class="setlbl"><span>#</span><span>${S.settings.unit}</span><span>reps</span><span></span><span></span></div>
    ${rows}<div class="addrow"><button class="btn sm" data-act="addSet" data-t="warm" data-ei="${ei}">+ Warm-up</button>
      <button class="btn sm" data-act="addSet" data-t="work" data-ei="${ei}">+ Set</button>
      <button class="btn sm" data-act="addSet" data-t="drop" data-ei="${ei}">+ Drop set</button></div></div>`;
}

function historyHtml() {
  const list = [...S.workouts].sort((a, b) => b.date - a.date).slice(0, 30).map(w => `
    <div class="hist"><div class="t"><b>${esc(w.name)}</b><span class="muted sm">${fmtDate(w.date)}</span>
      <button class="btn sm ghost danger" data-act="delWorkout" data-id="${w.id}">×</button></div>
      ${w.entries.map(e => `<div class="l"><span style="color:var(--text)">${esc(exName(e.exerciseId, e.name))}</span> — ${e.sets.map(setTxt).join(', ')} ${S.settings.unit}</div>`).join('')}</div>`).join('');
  return `<section class="card"><h2>History</h2>${list || '<p class="muted">Nothing logged yet. Go lift something heavy.</p>'}</section>`;
}

/* --- Library --- */
function viewLib() {
  const ex = S.exercises.slice().sort((a, b) => a.name.localeCompare(b.name)).map(e => `
    <div class="row"><div>${esc(e.name)}</div>
      <button class="btn sm ghost" data-act="renameEx" data-id="${e.id}">Rename</button>
      <button class="btn sm ghost danger" data-act="delEx" data-id="${e.id}">×</button></div>`).join('');
  const tpl = S.templates.map(t => `
    <div class="entry"><div class="hd"><b>${esc(t.name)}</b>
      <button class="btn sm ghost danger" data-act="delTpl" data-id="${t.id}">Delete</button></div>
      ${t.ids.map((id, i) => `<div class="row"><div>${esc(exName(id))}</div>
        <button class="btn sm ghost" data-act="tplUp" data-id="${t.id}" data-i="${i}">↑</button>
        <button class="btn sm ghost danger" data-act="tplRem" data-id="${t.id}" data-i="${i}">×</button></div>`).join('')}
      <div class="row"><select id="tsel-${t.id}">${exOptions()}</select><button class="btn" data-act="tplAdd" data-id="${t.id}">Add</button></div>
    </div>`).join('');
  return `<section class="card"><h2>Exercises</h2>
      <div class="row"><input id="newEx" placeholder="e.g. Incline Dumbbell Press" autocapitalize="words"><button class="btn primary" data-act="addExercise">Add</button></div>
      ${ex || '<p class="muted">No exercises yet.</p>'}</section>
    <section class="card"><h2>Setlists (templates)</h2>
      <div class="row"><input id="newTpl" placeholder="e.g. Leg Day" autocapitalize="words"><button class="btn primary" data-act="addTpl">Create</button></div>
      ${tpl}</section>`;
}

/* --- Stats --- */
// Warm-up sets are excluded from every metric.
const metrics = {
  top: { label: 'Top weight', f: s => Math.max(...workSets(s).map(x => x.w || 0)), fmt: v => num(toDisp(v)) },
  e1rm: { label: 'Est. 1RM', f: s => Math.max(...workSets(s).map(x => (x.w || 0) * (1 + x.r / 30))), fmt: v => num(toDisp(v)) },
  vol: { label: 'Volume', f: s => workSets(s).reduce((t, x) => t + (x.w || 0) * x.r, 0), fmt: v => Math.round(toDisp(v)).toLocaleString() },
};

function viewStats() {
  const withData = S.exercises.filter(e => history(e.id).length);
  if (!withData.length) return `<section class="card"><h2>Progress</h2><p class="muted">Finish a workout and your lifts will be charted here.</p></section>`;
  if (!withData.some(e => e.id === ui.progEx)) ui.progEx = withData[0].id;
  const h = history(ui.progEx), m = metrics[ui.progMetric];
  const pts = h.map(x => ({ x: x.date, y: m.f(x.sets), txt: `${fmtDate(x.date)}: ${m.fmt(m.f(x.sets))} ${ui.progMetric === 'vol' ? '' : S.settings.unit} — ${x.sets.map(setTxt).join(', ')}` }));
  const best = metrics.top.f(h.flatMap(x => x.sets)), best1 = Math.max(...h.map(x => metrics.e1rm.f(x.sets)));
  return `<section class="card"><h2>Progress</h2>
    <select data-chg="progEx">${withData.map(e => `<option value="${e.id}" ${e.id === ui.progEx ? 'selected' : ''}>${esc(e.name)}</option>`).join('')}</select>
    <div class="seg">${Object.entries(metrics).map(([k, v]) => `<button class="${k === ui.progMetric ? 'on' : ''}" data-act="progMetric" data-k="${k}">${v.label}</button>`).join('')}</div>
    <div class="stats"><div class="stat"><b>${num(toDisp(best))}</b><span>Best ${S.settings.unit}</span></div>
      <div class="stat"><b>${num(toDisp(best1))}</b><span>Est. 1RM</span></div>
      <div class="stat"><b>${h.length}</b><span>Sessions</span></div></div>
    ${chart(pts, v => m.fmt(v))}<div id="readout">Tap a point for details</div></section>`;
}

function chart(pts, fmt) {
  if (!pts.length) return '<p class="muted">No data yet.</p>';
  const W = 340, H = 200, p = { l: 44, r: 12, t: 12, b: 24 };
  let x0 = pts[0].x, x1 = pts.at(-1).x; if (x0 === x1) { x0 -= 864e5; x1 += 864e5; }
  const ys = pts.map(q => q.y); let y0 = Math.min(...ys), y1 = Math.max(...ys);
  if (y0 === y1) { y0 -= 1; y1 += 1; }
  const padY = (y1 - y0) * .12; y0 = Math.max(0, y0 - padY); y1 += padY;
  const sx = x => p.l + (x - x0) / (x1 - x0) * (W - p.l - p.r), sy = y => p.t + (1 - (y - y0) / (y1 - y0)) * (H - p.t - p.b);
  const grid = [0, 1, 2, 3].map(i => { const v = y0 + (y1 - y0) * i / 3; return `<line class="grid" x1="${p.l}" x2="${W - p.r}" y1="${sy(v)}" y2="${sy(v)}"/><text x="${p.l - 6}" y="${sy(v) + 3}" text-anchor="end">${esc(fmt(v))}</text>`; }).join('');
  const line = pts.map(q => `${sx(q.x).toFixed(1)},${sy(q.y).toFixed(1)}`).join(' ');
  const area = `${sx(pts[0].x)},${H - p.b} ${line} ${sx(pts.at(-1).x)},${H - p.b}`;
  const dots = pts.map(q => `<circle class="p" cx="${sx(q.x)}" cy="${sy(q.y)}" r="4"/><circle class="hit" cx="${sx(q.x)}" cy="${sy(q.y)}" r="14" data-act="pt" data-txt="${esc(q.txt)}"/>`).join('');
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img">
    <defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d7263d" stop-opacity=".35"/><stop offset="1" stop-color="#d7263d" stop-opacity="0"/></linearGradient></defs>
    ${grid}<polygon class="area" points="${area}"/><polyline class="ln" points="${line}"/>${dots}
    <text x="${p.l}" y="${H - 6}">${fmtDate(pts[0].x)}</text><text x="${W - p.r}" y="${H - 6}" text-anchor="end">${fmtDate(pts.at(-1).x)}</text></svg>`;
}

/* --- Run --- */
const pace = r => r.sec / toDist(r.km);
function viewRun() {
  const runs = [...S.runs].sort((a, b) => a.date.localeCompare(b.date));
  const u = S.settings.dist, wkAgo = Date.now() - 7 * 864e5;
  const total = runs.reduce((t, r) => t + r.km, 0);
  const week = runs.filter(r => new Date(r.date).getTime() >= wkAgo).reduce((t, r) => t + r.km, 0);
  const bestPace = runs.length ? Math.min(...runs.map(pace)) : 0;
  const pts = runs.map(r => ({ x: new Date(r.date).getTime(), y: ui.runMetric === 'dist' ? toDist(r.km) : pace(r),
    txt: `${r.date}: ${num(toDist(r.km))} ${u} in ${fmtDur(r.sec)} (${fmtDur(pace(r))}/${u})` }));
  const fmtY = ui.runMetric === 'dist' ? v => num(v) : v => fmtDur(v);
  const list = [...runs].reverse().slice(0, 30).map(r => `
    <div class="hist"><div class="t"><b>${num(toDist(r.km))} ${u}</b><span class="muted sm">${r.date}</span>
      <button class="btn sm ghost danger" data-act="delRun" data-id="${r.id}">×</button></div>
      <div class="l">${fmtDur(r.sec)} · ${fmtDur(pace(r))}/${u}${r.note ? ' · ' + esc(r.note) : ''}</div></div>`).join('');
  const sw = ui.sw;
  return `<section class="card"><h2>Log a run</h2>
      <div class="sw" id="swTime">${fmtDur(swElapsed())}</div>
      <div class="row"><button class="btn primary grow" data-act="swToggle">${sw.on ? 'Pause' : 'Start stopwatch'}</button>
        <button class="btn" data-act="swUse">Use time</button><button class="btn ghost" data-act="swReset">Reset</button></div>
      <label class="f">Date</label><input type="date" id="rDate" value="${today()}">
      <label class="f">Distance (${u})</label><input id="rDist" inputmode="decimal" placeholder="5.0">
      <label class="f">Time (h / m / s)</label>
      <div class="tri"><input id="rH" inputmode="numeric" placeholder="0"><input id="rM" inputmode="numeric" placeholder="25"><input id="rS" inputmode="numeric" placeholder="30"></div>
      <label class="f">Note</label><input id="rNote" placeholder="Optional">
      <div class="row"><button class="btn primary big" data-act="addRun">Save run</button></div></section>
    <section class="card"><h2>Run stats</h2>
      <div class="stats"><div class="stat"><b>${num(toDist(week))}</b><span>${u} / 7 days</span></div>
        <div class="stat"><b>${num(toDist(total))}</b><span>${u} total</span></div>
        <div class="stat"><b>${bestPace ? fmtDur(bestPace) : '–'}</b><span>Best /${u}</span></div></div>
      <div class="seg"><button class="${ui.runMetric === 'dist' ? 'on' : ''}" data-act="runMetric" data-k="dist">Distance</button>
        <button class="${ui.runMetric === 'pace' ? 'on' : ''}" data-act="runMetric" data-k="pace">Pace</button></div>
      ${chart(pts, fmtY)}<div id="readout">Tap a point for details</div></section>
    <section class="card"><h2>Runs</h2>${list || '<p class="muted">No runs yet.</p>'}</section>`;
}
const swElapsed = () => (ui.sw.acc + (ui.sw.on ? Date.now() - ui.sw.start : 0)) / 1000;

/* --- Data / settings --- */
function viewData() {
  const crew = `<section class="card"><h2>Your crew</h2>
    <p class="muted sm">Pick who hypes you up, or let fate decide. Stylised cartoon icons; the lines are original, not real quotes.</p>
    <div class="crew"><button class="crewb ${S.settings.mascot === 'random' ? 'on' : ''}" data-act="setMascot" data-id="random"><span class="av q">?</span><span>Random</span><small>surprise me</small></button>
    ${MASCOTS.map(m => `<button class="crewb ${S.settings.mascot === m.id ? 'on' : ''}" data-act="setMascot" data-id="${m.id}"><span class="av">${m.svg}</span><span>${esc(m.name)}</span><small>${esc(m.band)}</small></button>`).join('')}</div></section>`;
  const s = S.settings, days = S.lastExport ? Math.floor((Date.now() - S.lastExport) / 864e5) : null;
  const stale = S.workouts.length + S.runs.length > 0 && (days === null || days > 14);
  const chk = k => `<label class="row"><div>${{ autoRest: 'Auto-start rest timer when a set is ticked', sound: 'Beep when rest is over', vibrate: 'Vibrate when rest is over (Android only)' }[k]}</div>
    <input type="checkbox" style="width:auto" data-chg="set" data-k="${k}" ${s[k] ? 'checked' : ''}></label>`;
  return `${stale ? `<section class="card warn">${days === null ? 'You have never exported a backup.' : `Last backup was ${days} days ago.`} Safari can wipe site data — export now.</section>` : ''}
    ${crew}
    <section class="card"><h2>Settings</h2>
      <label class="f">Weight unit</label>
      <div class="seg"><button class="${s.unit === 'kg' ? 'on' : ''}" data-act="setUnit" data-k="unit" data-v="kg">kg</button><button class="${s.unit === 'lbs' ? 'on' : ''}" data-act="setUnit" data-k="unit" data-v="lbs">lbs</button></div>
      <label class="f">Distance unit</label>
      <div class="seg"><button class="${s.dist === 'km' ? 'on' : ''}" data-act="setUnit" data-k="dist" data-v="km">km</button><button class="${s.dist === 'mi' ? 'on' : ''}" data-act="setUnit" data-k="dist" data-v="mi">miles</button></div>
      <label class="f">Default rest (seconds)</label><input type="number" inputmode="numeric" min="10" step="5" value="${s.rest}" data-chg="set" data-k="rest">
      ${chk('autoRest')}${chk('sound')}${chk('vibrate')}</section>
    <section class="card"><h2>Backup &amp; sync</h2>
      <p class="muted sm">Data lives only on this device. Export to move it elsewhere (AirDrop, iCloud Drive, Notes…), then import on the other device.${S.lastExport ? ` Last export: ${fmtDate(S.lastExport)}.` : ''}</p>
      <div class="row wrap"><button class="btn primary grow" data-act="exportJson">Export JSON</button><button class="btn grow" data-act="exportCsv">Export CSV</button></div>
      <div class="row wrap"><button class="btn grow" data-act="importFile" data-mode="merge">Import (merge)</button><button class="btn grow danger" data-act="importFile" data-mode="replace">Import (replace)</button></div>
      <label class="f">Or copy / paste</label>
      <textarea id="paste" placeholder="Paste backup JSON here"></textarea>
      <div class="row wrap"><button class="btn grow" data-act="copyJson">Copy backup</button><button class="btn grow" data-act="pasteImport">Import pasted (merge)</button></div></section>
    <section class="card"><h2>Danger zone</h2><button class="btn danger" data-act="wipe">Erase everything on this device</button></section>`;
}

/* ---------- actions ---------- */
const A = {};
const entryOf = t => S.active.entries[+t.dataset.ei];

A.coachNext = () => { say('idle', true); render(); };
A.setMascot = t => { S.settings.mascot = t.dataset.id; save(); say('start'); render(); };
A.startEmpty = () => { S.active = { id: uid(), name: 'Workout', start: Date.now(), entries: [] }; save(); render(); };
A.startTpl = t => {
  const tpl = S.templates.find(x => x.id === t.dataset.id);
  S.active = { id: uid(), name: tpl.name, start: Date.now(), entries: tpl.ids.filter(id => S.exercises.some(e => e.id === id)).map(newEntry) };
  save(); render();
};
function newEntry(exerciseId) {
  const prev = lastSets(exerciseId);
  const sets = prev ? prev.map(s => ({ w: s.w, r: s.r, t: s.t || 'work', done: false })) : [{ w: null, r: null, t: 'work', done: false }];
  return { exerciseId, name: exName(exerciseId), sets };
}
A.addEx = () => { const id = $('#addEx').value; if (!id) return toast('Add an exercise in Library first'); S.active.entries.push(newEntry(id)); save(); render(); };
A.addSet = t => {
  const e = entryOf(t), type = t.dataset.t || 'work', work = e.sets.filter(s => (s.t || 'work') === 'work');
  let s;
  if (type === 'warm') { const f = work[0]; s = { w: f?.w != null ? roundW(f.w * .5) : null, r: 8 }; }            // ~50% of first working set
  else if (type === 'drop') { const p = [...e.sets].reverse().find(x => x.t !== 'warm'); s = { w: p?.w != null ? roundW(p.w * .8) : null, r: p?.r ?? null }; }  // ~80% of last set
  else { const p = work.at(-1) || e.sets.at(-1); s = { w: p?.w ?? null, r: p?.r ?? null }; }
  e.sets.push({ ...s, t: type, done: false }); sortSets(e); save(); render();
};
A.delSet = t => { entryOf(t).sets.splice(+t.dataset.si, 1); save(); render(); };
A.delEntry = t => { S.active.entries.splice(+t.dataset.ei, 1); save(); render(); };
A.toggleSet = t => {
  const s = entryOf(t).sets[+t.dataset.si], row = t.closest('.set');
  row.querySelectorAll('input').forEach(i => CH[i.dataset.chg](i));
  if (!s.done && !(s.r > 0)) return toast('Enter the reps first');
  s.done = !s.done; save();
  if (s.done && S.settings.autoRest) startTimer();
  if (s.done) say('set');
  render();
};
A.finish = () => {
  const a = S.active;
  const entries = a.entries.map(e => ({ exerciseId: e.exerciseId, name: e.name, sets: e.sets.filter(s => s.done).map(s => ({ w: s.w || 0, r: s.r, t: s.t || 'work' })) })).filter(e => e.sets.length);
  if (!entries.length) { if (!confirm('No completed sets. Discard this workout?')) return; S.active = null; }
  else { S.workouts.push({ id: a.id, name: a.name, date: a.start, end: Date.now(), entries }); S.active = null; say('done'); }
  stopTimer(); save(); render();
};
A.discard = () => { if (confirm('Discard this workout?')) { S.active = null; save(); render(); } };
A.delWorkout = t => { if (confirm('Delete this workout?')) { S.workouts = S.workouts.filter(w => w.id !== t.dataset.id); save(); render(); } };

A.addExercise = () => {
  const n = $('#newEx').value.trim(); if (!n) return;
  if (S.exercises.some(e => e.name.toLowerCase() === n.toLowerCase())) return toast('Already exists');
  S.exercises.push({ id: uid(), name: n }); save(); render();
};
A.renameEx = t => { const e = S.exercises.find(x => x.id === t.dataset.id), n = prompt('Rename exercise', e.name); if (n && n.trim()) { e.name = n.trim(); save(); render(); } };
A.delEx = t => {
  if (!confirm('Remove from library? Past workouts keep their history.')) return;
  S.exercises = S.exercises.filter(e => e.id !== t.dataset.id);
  S.templates.forEach(x => x.ids = x.ids.filter(id => id !== t.dataset.id)); save(); render();
};
A.addTpl = () => { const n = $('#newTpl').value.trim(); if (!n) return; S.templates.push({ id: uid(), name: n, ids: [] }); save(); render(); };
A.delTpl = t => { if (confirm('Delete this setlist?')) { S.templates = S.templates.filter(x => x.id !== t.dataset.id); save(); render(); } };
A.tplAdd = t => { const v = $('#tsel-' + t.dataset.id).value; if (!v) return toast('Add exercises first'); S.templates.find(x => x.id === t.dataset.id).ids.push(v); save(); render(); };
A.tplRem = t => { S.templates.find(x => x.id === t.dataset.id).ids.splice(+t.dataset.i, 1); save(); render(); };
A.tplUp = t => { const a = S.templates.find(x => x.id === t.dataset.id).ids, i = +t.dataset.i; if (i > 0) { [a[i - 1], a[i]] = [a[i], a[i - 1]]; save(); render(); } };

A.progMetric = t => { ui.progMetric = t.dataset.k; render(); };
A.runMetric = t => { ui.runMetric = t.dataset.k; render(); };
A.pt = t => { const r = $('#readout'); if (r) r.textContent = t.dataset.txt; };

A.swToggle = () => { const s = ui.sw; if (s.on) { s.acc += Date.now() - s.start; s.on = false; } else { s.start = Date.now(); s.on = true; } render(); };
A.swReset = () => { ui.sw = { start: 0, acc: 0, on: false }; render(); };
A.swUse = () => {
  const s = Math.round(swElapsed());
  $('#rH').value = Math.floor(s / 3600) || ''; $('#rM').value = Math.floor(s % 3600 / 60); $('#rS').value = s % 60;
};
A.addRun = () => {
  const d = parseFloat($('#rDist').value.replace(',', '.')), sec = (+$('#rH').value || 0) * 3600 + (+$('#rM').value || 0) * 60 + (+$('#rS').value || 0);
  if (!(d > 0) || !(sec > 0)) return toast('Enter distance and time');
  S.runs.push({ id: uid(), date: $('#rDate').value || today(), km: fromDist(d), sec, note: $('#rNote').value.trim() });
  A.swReset(); save(); render(); say('done');
};
A.delRun = t => { if (confirm('Delete this run?')) { S.runs = S.runs.filter(r => r.id !== t.dataset.id); save(); render(); } };

A.setUnit = t => { S.settings[t.dataset.k] = t.dataset.v; save(); render(); };

/* export / import */
const stamp = () => today();
const backupJson = () => JSON.stringify({ app: 'heavy-metal', exported: Date.now(), ...S, active: null }, null, 1);
async function shareFile(name, text, type) {
  const f = new File([text], name, { type });
  if (navigator.canShare?.({ files: [f] })) {
    try { await navigator.share({ files: [f], title: name }); return true; } catch (e) { if (e.name === 'AbortError') return false; }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type })); a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  return true;
}
A.exportJson = async () => { if (await shareFile(`heavy-metal-${stamp()}.json`, backupJson(), 'application/json')) { S.lastExport = Date.now(); save(); render(); } };
A.exportCsv = () => {
  const q = v => `"${String(v).replace(/"/g, '""')}"`, rows = [['date', 'workout', 'exercise', 'set', 'type', `weight_${S.settings.unit}`, 'reps']];
  S.workouts.slice().sort((a, b) => a.date - b.date).forEach(w => w.entries.forEach(e => e.sets.forEach((s, i) =>
    rows.push([new Date(w.date).toISOString().slice(0, 10), w.name, exName(e.exerciseId, e.name), i + 1, s.t || 'work', fmtW(s.w) || 0, s.r]))));
  const runs = [['date', 'distance_' + S.settings.dist, 'seconds', 'note'], ...S.runs.map(r => [r.date, num(toDist(r.km)), r.sec, r.note])];
  shareFile(`heavy-metal-lifts-${stamp()}.csv`, rows.map(r => r.map(q).join(',')).join('\n'), 'text/csv')
    .then(() => S.runs.length && shareFile(`heavy-metal-runs-${stamp()}.csv`, runs.map(r => r.map(q).join(',')).join('\n'), 'text/csv'));
};
A.copyJson = async () => { try { await navigator.clipboard.writeText(backupJson()); S.lastExport = Date.now(); save(); toast('Backup copied'); } catch (e) { toast('Copy blocked — use Export'); } };
A.importFile = t => { $('#file').dataset.mode = t.dataset.mode; $('#file').click(); };
A.pasteImport = () => importData($('#paste').value, 'merge');
A.wipe = () => { if (confirm('Erase ALL data on this device? Export first!') && confirm('Really erase everything?')) { S = seed(); save(); render(); } };

function importData(txt, mode) {
  let d; try { d = JSON.parse(txt); } catch (e) { return toast('Not valid JSON'); }
  if (!d || !Array.isArray(d.workouts) || !Array.isArray(d.exercises)) return toast('Not a Heavy Metal backup');
  if (mode === 'replace') {
    if (!confirm('Replace everything on this device with the backup?')) return;
    S = { ...defaults(), ...d, settings: { ...defaults().settings, ...d.settings }, active: null };
  } else {
    const map = {}, byName = new Map(S.exercises.map(e => [e.name.toLowerCase(), e.id]));
    d.exercises.forEach(e => {
      if (S.exercises.some(x => x.id === e.id)) return;
      const hit = byName.get(e.name.toLowerCase());
      if (hit) map[e.id] = hit; else { S.exercises.push(e); byName.set(e.name.toLowerCase(), e.id); }
    });
    const m = id => map[id] || id;
    const addAll = (k, fix = x => x) => { const have = new Set(S[k].map(x => x.id)); let n = 0; (d[k] || []).forEach(x => { if (!have.has(x.id)) { S[k].push(fix(x)); n++; } }); return n; };
    addAll('templates', t => ({ ...t, ids: t.ids.map(m) }));
    const nw = addAll('workouts', w => ({ ...w, entries: w.entries.map(e => ({ ...e, exerciseId: m(e.exerciseId) })) }));
    const nr = addAll('runs');
    toast(`Merged ${nw} workouts, ${nr} runs`);
  }
  save(); render();
}

/* ---------- rest timer ---------- */
let T = { end: 0, fired: false, lock: null }, AC = null;

function unlockAudio() {
  try { AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); } catch (e) { /* ignore */ }
}
function beep() {
  if (!S.settings.sound || !AC) return;
  [0, .35, .7].forEach(t => {
    const o = AC.createOscillator(), g = AC.createGain(), at = AC.currentTime + t;
    o.type = 'square'; o.frequency.value = 880;
    g.gain.setValueAtTime(.0001, at); g.gain.exponentialRampToValueAtTime(.3, at + .02); g.gain.exponentialRampToValueAtTime(.0001, at + .25);
    o.connect(g); g.connect(AC.destination); o.start(at); o.stop(at + .3);
  });
}
function startTimer(sec = S.settings.rest) {
  T.end = Date.now() + sec * 1000; T.fired = false;
  try { navigator.wakeLock?.request('screen').then(l => T.lock = l).catch(() => {}); } catch (e) { /* ignore */ }
  renderTimer();
}
function stopTimer() { T.end = 0; try { T.lock?.release(); } catch (e) { /* ignore */ } T.lock = null; renderTimer(); }
function timerDone() {
  T.fired = true;
  if (S.settings.vibrate) try { navigator.vibrate?.([300, 100, 300, 100, 600]); } catch (e) { /* ignore */ }
  say('rest', true);
  $('#alarm').firstElementChild.innerHTML = `<span class="av huge">${ui.coach.m.svg}</span><div class="big">Rest over</div><p>${esc(ui.coach.line)}</p><small>tap to dismiss</small>`;
  beep(); $('#alarm').hidden = false; stopTimer();
}
function renderTimer() {
  const run = T.end > 0, el = $('#timer');
  el.className = run ? 'run' : '';
  el.innerHTML = `<button class="btn" data-act="tAdj" data-d="-15">−15</button><div class="t" id="tTime"></div><button class="btn" data-act="tAdj" data-d="15">+15</button>
    <button class="btn ${run ? '' : 'primary'}" data-act="tToggle">${run ? 'Skip' : 'Rest'}</button>`;
  tickTimer();
}
function tickTimer() {
  const el = $('#tTime'); if (!el) return;
  if (T.end && !T.fired && Date.now() >= T.end) return timerDone();
  el.textContent = fmtDur(T.end ? Math.max(0, Math.ceil((T.end - Date.now()) / 1000)) : S.settings.rest);
}
A.tAdj = t => {
  const d = +t.dataset.d;
  if (T.end) T.end = Math.max(Date.now() + 1000, T.end + d * 1000);
  else { S.settings.rest = Math.max(15, S.settings.rest + d); save(); }
  tickTimer();
};
A.tToggle = () => T.end ? stopTimer() : startTimer();

/* ---------- wiring ---------- */
const CH = {
  wname: t => { S.active.name = t.value.trim() || 'Workout'; save(); },
  w: t => { const s = entryOf(t).sets[+t.dataset.si], v = parseFloat(t.value.replace(',', '.')); s.w = isNaN(v) ? null : fromDisp(v); save(); },
  r: t => { const s = entryOf(t).sets[+t.dataset.si], v = parseInt(t.value, 10); s.r = isNaN(v) ? null : v; save(); },
  progEx: t => { ui.progEx = t.value; render(); },
  set: t => {
    const k = t.dataset.k;
    S.settings[k] = t.type === 'checkbox' ? t.checked : t.type === 'number' ? Math.max(10, +t.value || 90) : t.value;
    save(); render(); tickTimer();
  },
};

document.addEventListener('click', e => {
  const t = e.target.closest('[data-act]'); if (t) { unlockAudio(); A[t.dataset.act]?.(t); return; }
  const tab = e.target.closest('[data-tab]'); if (tab) { ui.tab = tab.dataset.tab; render(); scrollTo(0, 0); }
});
document.addEventListener('change', e => { const c = e.target.dataset?.chg; if (c && CH[c]) CH[c](e.target); });
$('#alarm').addEventListener('click', () => $('#alarm').hidden = true);
$('#file').addEventListener('change', e => {
  const f = e.target.files[0]; if (!f) return;
  f.text().then(txt => importData(txt, e.target.dataset.mode || 'merge'));
  e.target.value = '';
});

setInterval(() => {
  tickTimer();
  const sw = $('#swTime'); if (sw) sw.textContent = fmtDur(swElapsed());
}, 250);
document.addEventListener('visibilitychange', tickTimer);

if ('serviceWorker' in navigator) addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));

say('idle', true); save(); render(); renderTimer();
