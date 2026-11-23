(() => {
'use strict';

/* =========================================================
   Jejak Petualang — pelacak kebiasaan harian bertema petualangan
   Semua data tersimpan di HP (localStorage). Tidak ada server.
   ========================================================= */

const KEY = 'jejak-petualang-v1';

/* ---------- Data game ---------- */
const CLASSES = {
  ksatria:    { name: 'Ksatria',    emoji: '🛡️', color: '#b5412b', weapon: { kind: 'sword', color: '#d8dee6', accent: '#e0a526' },
                perk: 'Tameng Disiplin', perkText: 'Bonus Hari Sempurna +30% (XP & emas)', hair: '#4a2c17' },
  penyihir:   { name: 'Penyihir',   emoji: '🔮', color: '#5b3fa8', weapon: { kind: 'staff', color: '#9ad0ff', accent: '#e0a526' },
                perk: 'Kebijaksanaan', perkText: '+10% XP dari semua misi', hair: '#d8d8e8' },
  pemanah:    { name: 'Pemanah',    emoji: '🏹', color: '#2f7d4f', weapon: { kind: 'bow', color: '#7a4a24', accent: '#eeeeee' },
                perk: 'Bidikan Tepat', perkText: '+10% emas dari semua misi', hair: '#a8561f' },
  penjelajah: { name: 'Penjelajah', emoji: '🧭', color: '#1f6f8b', weapon: { kind: 'axe', color: '#9aa7b5', accent: '#6b4423' },
                perk: 'Mata Elang', perkText: 'Diskon 10% di toko', hair: '#2b2118' }
};

const DIFF = {
  easy: { label: 'Mudah',  xp: 10, gold: 5 },
  med:  { label: 'Sedang', xp: 20, gold: 10 },
  hard: { label: 'Sulit',  xp: 40, gold: 20 }
};

const TITLES = [
  [1, 'Murid Petualang'], [3, 'Pengembara'], [6, 'Penjelajah Hutan'], [10, 'Pemburu Harta'],
  [15, 'Penakluk Gua'], [20, 'Pahlawan Negeri'], [30, 'Legenda Hidup']
];

const TIERS = [
  { lv: 1,  name: 'Pakaian Kain' },
  { lv: 5,  name: 'Zirah Kulit' },
  { lv: 10, name: 'Zirah Baja' },
  { lv: 20, name: 'Zirah Emas' }
];

const ZONES = [
  { id: 'desa',   lv: 1,  icon: '🏘️', name: 'Desa Awal',       sky: ['#8ecae6', '#f6e7b4'], ground: '#7bb661',
    desc: 'Tempat semua petualang memulai. Asap dapur mengepul, dan papan misi sudah menunggumu.' },
  { lv: 3,  id: 'hutan',  icon: '🌲', name: 'Hutan Bisikan',   sky: ['#5e9c7a', '#cfe8b8'], ground: '#3f8f5b',
    desc: 'Pepohonan tinggi berbisik tentang kebiasaan yang kamu jaga. Jalan setapak mulai menanjak.' },
  { lv: 6,  id: 'sungai', icon: '🌊', name: 'Sungai Cahaya',   sky: ['#7ec8e3', '#e2f3f8'], ground: '#3d9ba0',
    desc: 'Air jernih berkilau. Arusnya menguji konsistensimu, tapi jembatan batu sudah menanti.' },
  { lv: 10, id: 'gua',    icon: '💎', name: 'Gua Kristal',     sky: ['#2b2d52', '#6a4c93'], ground: '#3a3560',
    desc: 'Kristal bercahaya di dinding gua. Harta sejati di sini adalah disiplin yang sudah mengakar.' },
  { lv: 15, id: 'gunung', icon: '🏔️', name: 'Gunung Awan',     sky: ['#9bb8d3', '#eef3f8'], ground: '#8d99a6',
    desc: 'Udara tipis, pemandangan luas. Hanya yang rutin melangkah yang sampai setinggi ini.' },
  { lv: 20, id: 'langit', icon: '🏰', name: 'Kota Langit',     sky: ['#ffb88c', '#ffe9c7'], ground: '#e0c58a',
    desc: 'Kota di atas awan, tempat para pahlawan negeri berkumpul dan berbagi kisah.' },
  { lv: 30, id: 'puncak', icon: '🐉', name: 'Puncak Legenda',  sky: ['#240046', '#ff7b54'], ground: '#3c1642',
    desc: 'Puncak tertinggi. Naga tua mengangguk hormat: kamu kini bagian dari legenda.' }
].map((z, i) => Object.assign({ id: z.id || 'desa' }, z));

const ITEMS = [
  // Senjata
  { id: 'w_iron',   slot: 'weapon', name: 'Pedang Besi',      icon: '🗡️', price: 60,  lv: 2,  desc: 'Pedang sederhana yang andal.',        kind: 'sword', color: '#cfd6de', accent: '#8a6a2b' },
  { id: 'w_oak',    slot: 'weapon', name: 'Tongkat Ek',       icon: '🪄', price: 60,  lv: 2,  desc: 'Tongkat kayu dengan batu hijau.',     kind: 'staff', color: '#7be0a0', accent: '#8a6a2b' },
  { id: 'w_hunt',   slot: 'weapon', name: 'Busur Pemburu',    icon: '🏹', price: 70,  lv: 2,  desc: 'Ringan dan akurat.',                  kind: 'bow',   color: '#5a3b22', accent: '#f3f3f3' },
  { id: 'w_axe',    slot: 'weapon', name: 'Kapak Perang',     icon: '🪓', price: 120, lv: 5,  desc: 'Berat, tapi memuaskan diayun.',       kind: 'axe',   color: '#aab4c0', accent: '#5a3b22' },
  { id: 'w_flame',  slot: 'weapon', name: 'Pedang Api',       icon: '🔥', price: 250, lv: 8,  desc: 'Bilahnya menyala jingga.',            kind: 'sword', color: '#ff8a3d', accent: '#c0392b' },
  { id: 'w_crystal',slot: 'weapon', name: 'Tongkat Kristal',  icon: '🔮', price: 260, lv: 8,  desc: 'Bola kristal berpendar biru.',        kind: 'staff', color: '#6fd3ff', accent: '#e0a526' },
  { id: 'w_legend', slot: 'weapon', name: 'Pedang Legenda',   icon: '⚔️', price: 900, lv: 20, desc: 'Ditempa dari bintang jatuh.',         kind: 'sword', color: '#ffe27a', accent: '#4aa3ff' },
  // Kepala
  { id: 'h_cap',    slot: 'head',   name: 'Topi Petualang',   icon: '🧢', price: 40,  lv: 1,  desc: 'Topi hijau berbulu emas.',            kind: 'cap' },
  { id: 'h_helm',   slot: 'head',   name: 'Helm Besi',        icon: '⛑️', price: 120, lv: 4,  desc: 'Melindungi kepala dari ranting.',     kind: 'helm' },
  { id: 'h_wiz',    slot: 'head',   name: 'Topi Penyihir',    icon: '🎩', price: 150, lv: 5,  desc: 'Runcing, berbintang, misterius.',     kind: 'wiz' },
  { id: 'h_crown',  slot: 'head',   name: 'Mahkota Emas',     icon: '👑', price: 800, lv: 18, desc: 'Untuk yang konsisten berhari-hari.',  kind: 'crown' },
  // Jubah
  { id: 'c_red',    slot: 'cape',   name: 'Jubah Merah',      icon: '🧣', price: 50,  lv: 2,  desc: 'Berkibar gagah tertiup angin.',       color: '#b5412b' },
  { id: 'c_blue',   slot: 'cape',   name: 'Jubah Langit',     icon: '🌌', price: 150, lv: 6,  desc: 'Biru tua seperti malam di gunung.',   color: '#2f5fa8' },
  { id: 'c_royal',  slot: 'cape',   name: 'Jubah Kerajaan',   icon: '🎽', price: 500, lv: 14, desc: 'Ungu megah bersulam emas.',           color: '#6a2c91' },
  // Pendamping
  { id: 'p_cat',    slot: 'pet',    name: 'Kucing Hutan',     icon: '🐱', price: 80,  lv: 3,  desc: 'Menemanimu menyusuri jalan setapak.', emoji: '🐱' },
  { id: 'p_fox',    slot: 'pet',    name: 'Rubah Api',        icon: '🦊', price: 160, lv: 7,  desc: 'Cerdik dan setia.',                   emoji: '🦊' },
  { id: 'p_owl',    slot: 'pet',    name: 'Burung Hantu Bijak', icon: '🦉', price: 220, lv: 9, desc: 'Mengingatkanmu soal misi.',          emoji: '🦉' },
  { id: 'p_dragon', slot: 'pet',    name: 'Naga Mungil',      icon: '🐲', price: 700, lv: 16, desc: 'Kecil, tapi bernyali besar.',         emoji: '🐲' }
];
const SLOT_NAMES = { weapon: 'Senjata', head: 'Kepala', cape: 'Jubah', pet: 'Pendamping' };

const EMOJIS = ['⚔️','💧','💪','📚','🧘','🏃','🥗','😴','🎯','💻','✍️','🧹','🙏','🎨','🎸','💊','📞','🚿','🌱','💰','🍎','🧠','☀️','📝'];

const SAMPLE_QUESTS = [
  { name: 'Minum air 8 gelas', emoji: '💧', diff: 'easy' },
  { name: 'Olahraga 20 menit', emoji: '💪', diff: 'med' },
  { name: 'Kerjakan prioritas utama', emoji: '🎯', diff: 'hard' }
];

/* ---------- Utilitas ---------- */
const app = document.getElementById('app');
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
const pad = (n) => String(n).padStart(2, '0');
const keyOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const todayKey = () => keyOf(new Date());
const fmtDate = () => new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
const vibrate = (ms) => { try { navigator.vibrate && navigator.vibrate(ms); } catch (e) { /* abaikan */ } };

/* ---------- State ---------- */
function defaultState() {
  return {
    v: 1, name: '', cls: '', xp: 0, gold: 0, created: Date.now(),
    quests: [], log: {}, owned: [], equipped: {},
    stats: { quests: 0, perfect: 0, earned: 0 }
  };
}
function migrate(s) {
  const d = defaultState();
  const out = Object.assign(d, s);
  out.stats = Object.assign(d.stats, s.stats || {});
  out.equipped = s.equipped || {};
  out.owned = Array.isArray(s.owned) ? s.owned : [];
  out.quests = Array.isArray(s.quests) ? s.quests : [];
  out.log = s.log && typeof s.log === 'object' ? s.log : {};
  return out;
}
function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return migrate(JSON.parse(raw));
  } catch (e) { /* data rusak / tidak tersedia */ }
  return defaultState();
}
let state = load();
let tab = 'quests';
let editMode = false;
let lastDay = todayKey();
let deferredInstall = null;

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch (e) { toast('⚠️ Data tidak bisa disimpan di perangkat ini'); }
}

/* ---------- Mekanik ---------- */
const needFor = (L) => 60 + 25 * (L - 1);
function levelInfo(xp) {
  let L = 1, rest = Math.max(0, xp);
  while (rest >= needFor(L)) { rest -= needFor(L); L++; }
  return { level: L, cur: rest, need: needFor(L), pct: Math.round((rest / needFor(L)) * 100) };
}
const titleFor = (lv) => TITLES.filter((t) => lv >= t[0]).pop()[1];
const tierIndex = (lv) => { let i = 0; TIERS.forEach((t, k) => { if (lv >= t.lv) i = k; }); return i; };
const zoneIndex = (lv) => { let i = 0; ZONES.forEach((z, k) => { if (lv >= z.lv) i = k; }); return i; };

function reward(q) {
  const d = DIFF[q.diff] || DIFF.med;
  let xp = d.xp, gold = d.gold;
  if (state.cls === 'penyihir') xp = Math.round(xp * 1.1);
  if (state.cls === 'pemanah') gold = Math.round(gold * 1.1);
  return { xp, gold };
}
function bonusReward() {
  let xp = 25, gold = 15;
  if (state.cls === 'ksatria') { xp = Math.round(xp * 1.3); gold = Math.round(gold * 1.3); }
  return { xp, gold };
}
const price = (it) => Math.round(it.price * (state.cls === 'penjelajah' ? 0.9 : 1));

function give(xp, gold) { state.xp += xp; state.gold += gold; state.stats.earned += gold; }
function take(xp, gold) {
  state.xp = Math.max(0, state.xp - xp);
  state.gold = Math.max(0, state.gold - gold);
  state.stats.earned = Math.max(0, state.stats.earned - gold);
}

function getDay(key) {
  if (!state.log[key]) state.log[key] = { done: {}, bonus: null, total: state.quests.length };
  return state.log[key];
}
const peekDay = (key) => state.log[key] || { done: {}, bonus: null, total: 0 };
function doneCount(day) { return state.quests.filter((q) => day.done[q.id]).length; }
function allDone(day) { return state.quests.length > 0 && doneCount(day) === state.quests.length; }

function toggleQuest(id) {
  const q = state.quests.find((x) => x.id === id);
  if (!q) return;
  const day = getDay(todayKey());
  const lvBefore = levelInfo(state.xp).level;
  let perfect = false;

  if (day.done[id]) {
    const a = day.done[id];
    delete day.done[id];
    take(a.xp, a.gold);
    state.stats.quests = Math.max(0, state.stats.quests - 1);
    if (day.bonus) {
      take(day.bonus.xp, day.bonus.gold);
      day.bonus = null;
      state.stats.perfect = Math.max(0, state.stats.perfect - 1);
    }
    toast('Misi dibatalkan');
  } else {
    const r = reward(q);
    day.done[id] = r;
    give(r.xp, r.gold);
    state.stats.quests++;
    toast(`+${r.xp} XP   +${r.gold} 🪙`, 'gold');
    vibrate(25);
    if (allDone(day) && !day.bonus) {
      const b = bonusReward();
      day.bonus = b;
      give(b.xp, b.gold);
      state.stats.perfect++;
      perfect = true;
    }
  }
  day.total = state.quests.length;
  save();
  render();

  if (perfect) {
    const b = day.bonus;
    setTimeout(() => { toast(`🏆 Hari Sempurna! +${b.xp} XP +${b.gold} 🪙`, 'gold'); burst(); vibrate([40, 40, 80]); }, 350);
  }
  const lvAfter = levelInfo(state.xp).level;
  if (lvAfter > lvBefore) setTimeout(() => showLevelUp(lvBefore, lvAfter), perfect ? 1200 : 450);
}

function buyItem(id) {
  const it = ITEMS.find((x) => x.id === id);
  if (!it || state.owned.includes(id)) return;
  const lv = levelInfo(state.xp).level;
  if (lv < it.lv) return toast(`Butuh Level ${it.lv}`);
  const p = price(it);
  if (state.gold < p) return toast('Emas belum cukup 🪙');
  state.gold -= p;
  state.owned.push(id);
  state.equipped[it.slot] = id;
  save(); render();
  toast(`${it.icon} ${it.name} dibeli & dipakai!`, 'gold');
  vibrate(30);
}
function equipItem(id) {
  const it = ITEMS.find((x) => x.id === id);
  if (!it || !state.owned.includes(id)) return;
  if (state.equipped[it.slot] === id) delete state.equipped[it.slot];
  else state.equipped[it.slot] = id;
  save(); render();
}

/* ---------- Karakter (SVG) ---------- */
function itemById(id) { return ITEMS.find((i) => i.id === id); }

function weaponSvg(w) {
  const g = (inner) => `<g transform="translate(146 152) rotate(16)">${inner}</g>`;
  switch (w.kind) {
    case 'sword':
      return g(`<rect x="-4" y="-80" width="8" height="66" rx="2" fill="${w.color}" stroke="rgba(0,0,0,.25)"/>
        <path d="M-4 -80 L0 -94 L4 -80 Z" fill="${w.color}" stroke="rgba(0,0,0,.25)"/>
        <rect x="-15" y="-17" width="30" height="7" rx="3.5" fill="${w.accent}"/>
        <rect x="-3.5" y="-11" width="7" height="24" rx="3" fill="#5a3b22"/>
        <circle cx="0" cy="15" r="4.5" fill="${w.accent}"/>`);
    case 'staff':
      return g(`<line x1="0" y1="-78" x2="0" y2="38" stroke="#6b4423" stroke-width="6" stroke-linecap="round"/>
        <circle cx="0" cy="-88" r="18" fill="${w.color}" opacity=".28"/>
        <circle cx="0" cy="-88" r="10" fill="${w.color}" stroke="${w.accent}" stroke-width="3"/>`);
    case 'bow':
      return g(`<path d="M-4 -66 Q-40 -10 -4 50" stroke="${w.color}" stroke-width="6" fill="none" stroke-linecap="round"/>
        <line x1="-4" y1="-66" x2="-4" y2="50" stroke="${w.accent}" stroke-width="1.6"/>`);
    case 'axe':
      return g(`<line x1="0" y1="-74" x2="0" y2="36" stroke="${w.accent}" stroke-width="6" stroke-linecap="round"/>
        <path d="M0 -76 Q30 -82 30 -52 Q30 -34 0 -40 Z" fill="${w.color}" stroke="#6b7785" stroke-width="2"/>`);
    default: return '';
  }
}

function headSvg(kind) {
  switch (kind) {
    case 'cap':
      return `<path d="M72 72 Q76 42 100 42 Q124 42 128 72 Z" fill="#2f7d4f"/>
        <path d="M68 72 L134 72 L142 79 L68 79 Z" fill="#245f3c"/>
        <path d="M122 52 Q144 34 150 48 Q136 52 126 62 Z" fill="#e0a526"/>`;
    case 'helm':
      return `<path d="M70 84 Q68 42 100 40 Q132 42 130 84 L121 84 L121 70 L79 70 L79 84 Z" fill="#9aa7b5" stroke="#6b7785" stroke-width="2"/>
        <rect x="96" y="30" width="8" height="16" rx="3" fill="#c0392b"/>`;
    case 'wiz':
      return `<path d="M100 4 L130 68 L70 68 Z" fill="#5b3fa8"/>
        <ellipse cx="100" cy="69" rx="42" ry="9" fill="#4a3290"/>
        <rect x="80" y="56" width="40" height="7" fill="#e0a526"/>
        <circle cx="100" cy="36" r="3.5" fill="#ffe27a"/>`;
    case 'crown':
      return `<path d="M73 60 L80 34 L91 50 L100 28 L109 50 L120 34 L127 60 Z" fill="#e0a526" stroke="#b07d10" stroke-width="2"/>
        <circle cx="100" cy="52" r="3.5" fill="#c0392b"/><circle cx="84" cy="54" r="2.5" fill="#4aa3ff"/><circle cx="116" cy="54" r="2.5" fill="#4aa3ff"/>`;
    default: return '';
  }
}

function avatarSvg(uidSuffix = 'a') {
  const c = CLASSES[state.cls] || CLASSES.penjelajah;
  const lv = levelInfo(state.xp).level;
  const t = tierIndex(lv);
  const eq = state.equipped || {};
  const wItem = eq.weapon && itemById(eq.weapon);
  const hItem = eq.head && itemById(eq.head);
  const cItem = eq.cape && itemById(eq.cape);
  const pItem = eq.pet && itemById(eq.pet);
  const weapon = wItem ? { kind: wItem.kind, color: wItem.color, accent: wItem.accent } : c.weapon;
  const skin = '#f1c9a0';
  const armor = ['#cbb994', '#8a5a2b', '#9aa7b5', '#e0a526'][t];
  const aura = `aura-${uidSuffix}`;

  let s = `<svg viewBox="0 0 200 230" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Karakter ${esc(state.name)}, ${c.name} level ${lv}">`;
  s += `<defs><radialGradient id="${aura}"><stop offset="0" stop-color="#ffe27a" stop-opacity=".55"/><stop offset="1" stop-color="#ffe27a" stop-opacity="0"/></radialGradient></defs>`;
  if (t >= 3) s += `<ellipse cx="100" cy="130" rx="86" ry="104" fill="url(#${aura})"/>`;
  s += `<ellipse cx="100" cy="216" rx="52" ry="8" fill="rgba(0,0,0,.25)"/>`;
  if (cItem) s += `<path d="M70 108 Q46 172 56 216 L144 216 Q154 172 130 108 Z" fill="${cItem.color}" stroke="rgba(0,0,0,.3)" stroke-width="2"/>`;
  // kaki & sepatu
  s += `<rect x="79" y="166" width="17" height="38" rx="6" fill="#3a3a4a"/><rect x="104" y="166" width="17" height="38" rx="6" fill="#3a3a4a"/>`;
  s += `<rect x="75" y="198" width="24" height="13" rx="5" fill="#5a3b22"/><rect x="101" y="198" width="24" height="13" rx="5" fill="#5a3b22"/>`;
  // lengan kiri
  s += `<line x1="75" y1="116" x2="58" y2="160" stroke="${c.color}" stroke-width="15" stroke-linecap="round"/><circle cx="57" cy="162" r="8" fill="${skin}"/>`;
  // badan
  s += `<path d="M72 114 Q72 104 83 104 L117 104 Q128 104 128 114 L128 174 L72 174 Z" fill="${c.color}"/>`;
  s += `<rect x="72" y="150" width="56" height="9" fill="#5a3b22"/><rect x="95" y="148" width="10" height="13" rx="2" fill="#e0a526"/>`;
  if (t >= 2) s += `<path d="M81 112 L119 112 L115 146 Q100 155 85 146 Z" fill="${armor}" stroke="rgba(0,0,0,.25)" stroke-width="1.5"/>`;
  if (t >= 3) s += `<path d="M100 114 L100 150" stroke="#b07d10" stroke-width="2"/><circle cx="100" cy="128" r="5" fill="#c0392b" stroke="#b07d10" stroke-width="1.5"/>`;
  if (t >= 1) s += `<ellipse cx="74" cy="112" rx="13" ry="8" fill="${armor}" stroke="rgba(0,0,0,.25)"/><ellipse cx="126" cy="112" rx="13" ry="8" fill="${armor}" stroke="rgba(0,0,0,.25)"/>`;
  // lengan kanan + senjata + tangan
  s += `<line x1="125" y1="116" x2="146" y2="152" stroke="${c.color}" stroke-width="15" stroke-linecap="round"/>`;
  s += weaponSvg(weapon);
  s += `<circle cx="146" cy="153" r="8" fill="${skin}"/>`;
  // kepala
  s += `<circle cx="100" cy="82" r="31" fill="${c.hair}"/>`;
  s += `<circle cx="100" cy="85" r="27" fill="${skin}"/>`;
  if (!hItem) s += `<path d="M71 82 Q72 52 100 52 Q128 52 129 82 Q118 66 100 66 Q82 66 71 82 Z" fill="${c.hair}"/>`;
  s += `<circle cx="90" cy="86" r="3.4" fill="#2b1d12"/><circle cx="110" cy="86" r="3.4" fill="#2b1d12"/>`;
  s += `<circle cx="84" cy="95" r="4" fill="#f1a08a" opacity=".55"/><circle cx="116" cy="95" r="4" fill="#f1a08a" opacity=".55"/>`;
  s += `<path d="M91 96 Q100 104 109 96" stroke="#2b1d12" stroke-width="2.6" fill="none" stroke-linecap="round"/>`;
  if (hItem) s += headSvg(hItem.kind);
  if (pItem) s += `<text x="28" y="212" font-size="38" text-anchor="middle">${pItem.emoji}</text>`;
  s += `</svg>`;
  return s;
}

/* ---------- Toast, confetti, modal ---------- */
function toast(msg, cls = '') {
  const box = document.getElementById('toasts');
  const el = document.createElement('div');
  el.className = 'toast ' + cls;
  el.textContent = msg;
  box.appendChild(el);
  while (box.children.length > 3) box.removeChild(box.firstChild);
  setTimeout(() => el.remove(), 2500);
}
function burst() {
  const colors = ['#e0a526', '#3f8f5b', '#b5412b', '#5b3fa8', '#2a9d8f', '#ffd45e'];
  const wrap = document.createElement('div');
  wrap.className = 'confetti';
  for (let i = 0; i < 44; i++) {
    const p = document.createElement('i');
    p.style.setProperty('--x', Math.random() * 100 + 'vw');
    p.style.setProperty('--dx', Math.random() * 160 - 80 + 'px');
    p.style.setProperty('--r', Math.random() * 720 - 360 + 'deg');
    p.style.setProperty('--d', 1.4 + Math.random() * 1.2 + 's');
    p.style.background = colors[i % colors.length];
    p.style.animationDelay = Math.random() * 0.3 + 's';
    wrap.appendChild(p);
  }
  document.body.appendChild(wrap);
  setTimeout(() => wrap.remove(), 3300);
}
function openModal(html, onReady, cls = '') {
  closeModal();
  const ov = document.createElement('div');
  ov.className = 'overlay';
  ov.innerHTML = `<div class="sheet ${cls}" role="dialog" aria-modal="true">${html}</div>`;
  document.body.appendChild(ov);
  document.body.classList.add('noscroll');
  ov.addEventListener('click', (e) => { if (e.target === ov) closeModal(); });
  if (onReady) onReady(ov.firstElementChild, ov);
  return ov;
}
function closeModal() {
  document.querySelectorAll('.overlay').forEach((o) => o.remove());
  document.body.classList.remove('noscroll');
}

/* ---------- Tampilan ---------- */
function headerHtml(li) {
  return `<header class="top">
    <div class="top-row">
      <div><div class="hd-name">${esc(state.name)}</div><div class="hd-sub">Lv ${li.level} · ${titleFor(li.level)}</div></div>
      <div class="gold-pill" aria-label="Emas">🪙 <span>${state.gold}</span></div>
    </div>
    <div class="xpbar" role="progressbar" aria-valuemin="0" aria-valuemax="${li.need}" aria-valuenow="${li.cur}"><i style="width:${li.pct}%"></i></div>
    <div class="xp-txt"><span>${li.cur} / ${li.need} XP</span><span>Level ${li.level + 1} berikutnya</span></div>
  </header>`;
}
function navHtml() {
  const tabs = [['quests', '📜', 'Misi'], ['hero', '🧙', 'Karakter'], ['shop', '🛒', 'Toko'], ['map', '🗺️', 'Peta']];
  return `<nav class="nav" aria-label="Menu utama"><div class="nav-inner">${tabs.map(([k, ic, lb]) =>
    `<button data-act="tab" data-tab="${k}" ${tab === k ? 'aria-current="page"' : ''}><span class="ic">${ic}</span>${lb}</button>`).join('')}</div></nav>`;
}

function flavorLine(done, total) {
  if (!total) return 'Papan misi masih kosong. Tambahkan misi pertamamu!';
  if (done === 0) return `Papan misi menunggumu, ${esc(state.name)}. Perjalanan dimulai dari satu langkah.`;
  if (done < total / 2) return 'Bagus! Terus melangkah, masih banyak yang bisa dijelajahi hari ini.';
  if (done < total) return 'Hampir sampai! Tinggal sedikit lagi menuju kemah malam ini.';
  return 'Semua misi tuntas! Kamu layak beristirahat di dekat api unggun. 🔥';
}

function viewQuests() {
  const day = peekDay(todayKey());
  const total = state.quests.length;
  const done = doneCount(day);
  const pct = total ? Math.round((done / total) * 100) : 0;
  const perfect = total > 0 && done === total;
  const list = state.quests.map((q) => {
    const isDone = !!day.done[q.id];
    const r = reward(q);
    return `<li class="quest ${isDone ? 'done' : ''}">
      <button class="q-main" data-act="toggle" data-id="${q.id}" role="checkbox" aria-checked="${isDone}">
        <span class="q-check" aria-hidden="true">${isDone ? '✓' : ''}</span>
        <span class="q-emoji" aria-hidden="true">${esc(q.emoji)}</span>
        <span class="q-body"><span class="q-name">${esc(q.name)}</span>
          <span class="q-rew">${DIFF[q.diff].label} · +${r.xp} XP · +${r.gold} 🪙</span></span>
      </button>
      ${editMode ? `<button class="q-edit" data-act="edit" data-id="${q.id}" aria-label="Ubah misi ${esc(q.name)}">✎</button>` : ''}
    </li>`;
  }).join('');

  return `<div class="date-line">${fmtDate()}</div>
  <section class="card board" aria-label="Ringkasan misi hari ini">
    <div style="display:flex;justify-content:space-between;align-items:baseline;gap:8px">
      <h2>Papan Misi Hari Ini</h2><span class="count">${done}/${total}</span>
    </div>
    <div class="pbar ${perfect ? 'gold' : ''}" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}"><i style="width:${pct}%"></i></div>
    <div class="flavor">${flavorLine(done, total)}</div>
    ${day.bonus ? `<span class="perfect-badge">🏆 Hari Sempurna · +${day.bonus.xp} XP · +${day.bonus.gold} 🪙</span>` :
      (total ? `<span class="hint" style="display:block;margin-top:8px;color:var(--ink2)">Selesaikan semua misi hari ini untuk bonus Hari Sempurna.</span>` : '')}
  </section>
  ${total ? `<ul class="quest-list">${list}</ul>` : `<div class="card empty" style="margin-top:14px"><div class="big">🗺️</div><p>Belum ada misi. Buat misi dari kebiasaan harian yang ingin kamu pastikan berjalan.</p></div>`}
  <div class="row-actions">
    <button class="btn primary flex1" data-act="add">＋ Misi Baru</button>
    ${total ? `<button class="btn flex1" data-act="toggle-edit">${editMode ? '✔ Selesai Atur' : '✎ Atur Misi'}</button>` : ''}
  </div>`;
}

function weekHtml() {
  const names = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  let out = '';
  for (let i = 6; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const k = keyOf(d);
    const day = peekDay(k);
    const isToday = i === 0;
    const total = isToday ? state.quests.length : (day.total || 0);
    const done = isToday ? doneCount(day) : Math.min(total, Object.keys(day.done).length);
    const pct = total ? Math.round((done / total) * 100) : 0;
    out += `<div class="d ${isToday ? 'today' : ''}" aria-label="${names[d.getDay()]}: ${done} dari ${total} misi">
      <div class="bar ${total && done === total ? 'perfect' : ''}"><i style="height:${pct}%"></i></div>
      <div class="dl">${names[d.getDay()]}</div></div>`;
  }
  return `<div class="week">${out}</div>`;
}

function viewHero(li) {
  const c = CLASSES[state.cls];
  const zi = zoneIndex(li.level);
  const z = ZONES[zi];
  const ti = tierIndex(li.level);
  const eq = state.equipped || {};
  const slot = (k) => { const it = eq[k] && itemById(eq[k]); return `<div class="slot"><div class="k">${SLOT_NAMES[k]}</div><div class="v">${it ? `${it.icon} ${it.name}` : '—'}</div></div>`; };
  const days = Math.max(1, Math.floor((Date.now() - (state.created || Date.now())) / 86400000) + 1);
  const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone;

  return `<div class="scene" style="background:linear-gradient(180deg, ${z.sky[0]}, ${z.sky[1]})">
      <div class="sun"></div>
      <div class="zone-tag">${z.icon} ${z.name}</div>
      <div class="ground" style="background:${z.ground}"></div>
      ${avatarSvg('hero')}
    </div>
    <h2 class="hero-name">${esc(state.name)}</h2>
    <div class="hero-sub">${c.emoji} ${c.name} · Level ${li.level} · ${titleFor(li.level)}</div>
    <div class="card perk"><b>${c.perk}:</b> ${c.perkText}.<br><span class="muted" style="font-size:13px">Peringkat perlengkapan: ${TIERS[ti].name}${TIERS[ti + 1] ? ` · berikutnya Lv ${TIERS[ti + 1].lv}` : ' (maksimal)'}.</span></div>

    <h2 class="section-title">Statistik Petualangan</h2>
    <div class="stats">
      <div class="stat"><div class="n">${state.stats.quests}</div><div class="l">Misi diselesaikan</div></div>
      <div class="stat"><div class="n">${state.stats.perfect}</div><div class="l">Hari Sempurna</div></div>
      <div class="stat"><div class="n">${state.stats.earned}</div><div class="l">Emas dikumpulkan</div></div>
      <div class="stat"><div class="n">${days}</div><div class="l">Hari berpetualang</div></div>
    </div>

    <h2 class="section-title">Perlengkapan</h2>
    <div class="slots">${['weapon', 'head', 'cape', 'pet'].map(slot).join('')}</div>
    <div class="hint" style="margin-top:8px">Beli item baru di tab Toko. Ketuk Pakai/Lepas di sana untuk mengganti.</div>

    <h2 class="section-title">7 Hari Terakhir</h2>
    <div class="card" style="padding-top:10px">${weekHtml()}<div class="hint" style="margin-top:6px;color:var(--ink2)">Batang emas = semua misi hari itu selesai.</div></div>

    <h2 class="section-title">Pengaturan & Cadangan</h2>
    <div class="hint" style="margin-bottom:10px">Data tersimpan hanya di HP ini. Simpan cadangan secara berkala agar progresmu aman jika data browser terhapus atau kamu ganti HP.</div>
    <div class="row-actions" style="margin-top:0">
      <button class="btn flex1" data-act="backup">💾 Cadangkan</button>
      <button class="btn flex1" data-act="restore">📥 Pulihkan</button>
    </div>
    <div class="row-actions">
      <button class="btn flex1" data-act="rename">✏️ Ubah Nama</button>
      <button class="btn danger flex1" data-act="reset">🗑️ Mulai Ulang</button>
    </div>
    ${standalone ? '' : `<div class="install-card"><b>📲 Pasang di layar utama</b>
      <div class="hint" style="margin-top:4px">Android (Chrome): menu ⋮ → Instal aplikasi. iPhone (Safari): tombol Bagikan → Tambah ke Layar Utama.</div>
      ${deferredInstall ? '<div class="row-actions" style="margin-top:10px"><button class="btn primary small" data-act="install">Pasang sekarang</button></div>' : ''}</div>`}`;
}

function viewShop(li) {
  const eq = state.equipped || {};
  let out = `<div class="hint" style="margin-bottom:6px">Kamu punya <b style="color:#ffd877">🪙 ${state.gold}</b>. Item terbuka seiring naik level.${state.cls === 'penjelajah' ? ' Diskon 10% dari Mata Elang sudah dihitung.' : ''}</div>`;
  Object.keys(SLOT_NAMES).forEach((slot) => {
    out += `<h2 class="section-title">${SLOT_NAMES[slot]}</h2><div class="shop-grid">`;
    ITEMS.filter((i) => i.slot === slot).forEach((it) => {
      const owned = state.owned.includes(it.id);
      const on = eq[slot] === it.id;
      const locked = li.level < it.lv;
      const p = price(it);
      let btn;
      if (owned) btn = on ? `<button class="btn on" data-act="equip" data-id="${it.id}">✓ Dipakai</button>` : `<button class="btn alt" data-act="equip" data-id="${it.id}">Pakai</button>`;
      else if (locked) btn = `<button class="btn" disabled>🔒 Lv ${it.lv}</button>`;
      else btn = `<button class="btn" data-act="buy" data-id="${it.id}" ${state.gold < p ? 'style="opacity:.7"' : ''}>🪙 ${p}</button>`;
      out += `<div class="card item ${locked && !owned ? 'locked' : ''}">
        <div class="ic" aria-hidden="true">${it.icon}</div>
        <div class="info"><div class="nm">${esc(it.name)}</div><div class="ds">${esc(it.desc)}${owned ? '' : ` · Butuh Lv ${it.lv}`}</div></div>
        ${btn}</div>`;
    });
    out += `</div>`;
  });
  return out;
}

function viewMap(li) {
  const zi = zoneIndex(li.level);
  const next = ZONES[zi + 1];
  let progress = '';
  if (next) {
    const cur = ZONES[zi];
    const span = next.lv - cur.lv;
    const pct = Math.min(100, Math.round(((li.level - cur.lv) / span) * 100));
    progress = `<div class="card" style="margin-bottom:16px"><b>Menuju ${next.icon} ${next.name}</b>
      <div class="pbar gold"><i style="width:${pct}%"></i></div>
      <div class="flavor">Capai Level ${next.lv} untuk membuka zona berikutnya. Sekarang Level ${li.level}.</div></div>`;
  } else {
    progress = `<div class="card" style="margin-bottom:16px"><b>🐉 Kamu telah mencapai puncak peta!</b><div class="flavor">Teruslah menjaga kebiasaanmu, Legenda.</div></div>`;
  }
  const zones = ZONES.map((z, i) => {
    const st = i < zi ? 'cleared' : i === zi ? 'current' : 'locked';
    return `<div class="zone ${st}"><div class="dot" aria-hidden="true">${st === 'cleared' ? '✓' : st === 'current' ? '📍' : '🔒'}</div>
      <div class="card"><div class="z-head"><span class="z-ic" aria-hidden="true">${z.icon}</span>
        <div><div class="z-nm">${z.name}${st === 'current' ? '<span class="here">Kamu di sini</span>' : ''}</div><div class="z-lv">Terbuka di Level ${z.lv}</div></div></div>
        <div class="z-ds">${st === 'locked' ? 'Zona ini belum terbuka. Terus selesaikan misimu untuk menemukannya.' : z.desc}</div></div></div>`;
  }).join('');
  return `${progress}<div class="path">${zones}</div>`;
}

let pickedClass = '';
function renderOnboarding() {
  app.innerHTML = `<div class="onb">
    <div class="logo" aria-hidden="true">🧭</div>
    <h1>Jejak Petualang</h1>
    <p class="lead">Ubah rencana harianmu jadi petualangan nyata. Selesaikan misi, kumpulkan emas, dan naikkan level karaktermu.</p>
    <label class="field"><span>Nama petualang</span><input type="text" id="onb-name" maxlength="16" placeholder="Contoh: Rangga" autocomplete="off"></label>
    <div class="field" style="margin-bottom:6px"><span>Pilih kelas</span></div>
    <div class="classes">${Object.entries(CLASSES).map(([k, c]) =>
      `<button type="button" class="cls" data-act="pick" data-cls="${k}" aria-pressed="${pickedClass === k}"><div class="e">${c.emoji}</div><div class="n">${c.name}</div><div class="p">${c.perkText}</div></button>`).join('')}</div>
    <label class="chk"><input type="checkbox" id="onb-sample" checked> Mulai dengan 3 contoh misi (bisa diubah nanti)</label>
    <button class="btn primary big" data-act="start">Mulai Petualangan ⚔️</button>
  </div>`;
}

function render() {
  const y = window.scrollY;
  if (!state.cls || !state.name) { renderOnboarding(); return; }
  const li = levelInfo(state.xp);
  const views = { quests: viewQuests, hero: viewHero, shop: viewShop, map: viewMap };
  app.innerHTML = headerHtml(li) + `<main class="content">${views[tab](li)}</main>` + navHtml();
  window.scrollTo(0, y);
}

/* ---------- Modal: misi ---------- */
function openQuestModal(id) {
  const q = id ? state.quests.find((x) => x.id === id) : null;
  let emoji = q ? q.emoji : '⚔️';
  let diff = q ? q.diff : 'med';
  openModal(`<h2>${q ? 'Ubah Misi' : 'Misi Baru'}</h2>
    <label class="field"><span>Nama misi</span><input type="text" id="q-name" maxlength="40" placeholder="Contoh: Baca buku 15 menit" value="${q ? esc(q.name) : ''}" autocomplete="off"></label>
    <div class="field"><span>Ikon</span><div class="emoji-grid" id="q-emoji">${EMOJIS.map((e) => `<button type="button" data-e="${e}" aria-pressed="${e === emoji}" aria-label="Ikon ${e}">${e}</button>`).join('')}</div></div>
    <div class="field"><span>Tingkat kesulitan</span><div class="seg" id="q-diff">${Object.entries(DIFF).map(([k, d]) =>
      `<button type="button" data-d="${k}" aria-pressed="${k === diff}"><b>${d.label}</b><small>${d.xp} XP · ${d.gold} 🪙</small></button>`).join('')}</div></div>
    <div class="row-actions">
      <button class="btn primary flex1" id="q-save">Simpan</button>
      <button class="btn flex1" id="q-cancel">Batal</button>
    </div>
    ${q ? '<div class="row-actions" style="margin-top:10px"><button class="btn danger flex1" id="q-del">🗑️ Hapus Misi</button></div>' : ''}`,
  (sheet) => {
    const nameEl = sheet.querySelector('#q-name');
    if (!q) setTimeout(() => nameEl.focus(), 150);
    sheet.querySelector('#q-emoji').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      emoji = b.dataset.e;
      sheet.querySelectorAll('#q-emoji button').forEach((x) => x.setAttribute('aria-pressed', x === b));
    });
    sheet.querySelector('#q-diff').addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      diff = b.dataset.d;
      sheet.querySelectorAll('#q-diff button').forEach((x) => x.setAttribute('aria-pressed', x === b));
    });
    sheet.querySelector('#q-cancel').addEventListener('click', closeModal);
    sheet.querySelector('#q-save').addEventListener('click', () => {
      const name = nameEl.value.trim();
      if (!name) { toast('Isi nama misi dulu'); nameEl.focus(); return; }
      if (q) { q.name = name; q.emoji = emoji; q.diff = diff; }
      else {
        state.quests.push({ id: uid(), name, emoji, diff });
        const tk = todayKey();
        if (state.log[tk]) state.log[tk].total = state.quests.length;
      }
      save(); closeModal(); render();
      toast(q ? 'Misi diperbarui' : 'Misi ditambahkan 📜');
    });
    const del = sheet.querySelector('#q-del');
    if (del) del.addEventListener('click', () => {
      if (!confirm(`Hapus misi "${q.name}"? XP yang sudah kamu dapat tetap aman.`)) return;
      state.quests = state.quests.filter((x) => x.id !== q.id);
      save(); closeModal(); render(); toast('Misi dihapus');
    });
  });
}

/* ---------- Modal: naik level ---------- */
function showLevelUp(from, to) {
  const lines = [];
  const tFrom = titleFor(from), tTo = titleFor(to);
  if (tFrom !== tTo) lines.push(`🎖️ Gelar baru: <b>${tTo}</b>`);
  if (zoneIndex(to) > zoneIndex(from)) { const z = ZONES[zoneIndex(to)]; lines.push(`🗺️ Zona terbuka: <b>${z.icon} ${z.name}</b>`); }
  if (tierIndex(to) > tierIndex(from)) lines.push(`🛡️ Perlengkapan naik: <b>${TIERS[tierIndex(to)].name}</b>`);
  const unlocked = ITEMS.filter((i) => i.lv > from && i.lv <= to).length;
  if (unlocked) lines.push(`🛒 ${unlocked} item baru terbuka di Toko`);
  burst(); vibrate([60, 50, 120]);
  openModal(`<div class="ray"></div><div class="levelup">
      <div class="lv-title">NAIK LEVEL!</div>
      <div style="font-size:18px;font-weight:700;margin-bottom:4px">Level ${from} → Level ${to}</div>
      ${avatarSvg('lvl')}
      ${lines.length ? `<ul>${lines.map((l) => `<li>${l}</li>`).join('')}</ul>` : ''}
      <button class="btn primary big" id="lv-ok">Lanjutkan Petualangan</button>
    </div>`,
  (sheet) => sheet.querySelector('#lv-ok').addEventListener('click', closeModal), 'lv');
}

/* ---------- Cadangan ---------- */
function exportJson() { return JSON.stringify(state); }
function openBackup() {
  openModal(`<h2>Cadangkan Data</h2>
    <p class="hint">Simpan file ini di tempat aman (mis. Google Drive atau kirim ke dirimu sendiri). Untuk memulihkan, pakai tombol Pulihkan.</p>
    <div class="row-actions">
      <button class="btn primary flex1" id="bk-file">⬇️ Unduh File</button>
      <button class="btn flex1" id="bk-copy">📋 Salin Teks</button>
    </div>
    <div class="row-actions"><button class="btn flex1" id="bk-close">Tutup</button></div>`,
  (sheet) => {
    sheet.querySelector('#bk-close').addEventListener('click', closeModal);
    sheet.querySelector('#bk-file').addEventListener('click', () => {
      const url = URL.createObjectURL(new Blob([exportJson()], { type: 'application/json' }));
      const a = document.createElement('a');
      a.href = url; a.download = `jejak-petualang-${todayKey()}.json`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 3000);
      toast('Cadangan diunduh 💾');
    });
    sheet.querySelector('#bk-copy').addEventListener('click', async () => {
      try { await navigator.clipboard.writeText(exportJson()); toast('Teks cadangan disalin 📋'); }
      catch (e) {
        sheet.insertAdjacentHTML('beforeend', `<label class="field" style="margin-top:12px"><span>Salin teks ini secara manual</span><textarea readonly id="bk-ta">${esc(exportJson())}</textarea></label>`);
        const ta = sheet.querySelector('#bk-ta'); ta.focus(); ta.select();
      }
    });
  });
}
function openRestore() {
  openModal(`<h2>Pulihkan Data</h2>
    <p class="hint">Ini akan <b>menimpa</b> progres di HP ini dengan isi cadangan.</p>
    <label class="field"><span>Pilih file cadangan (.json)</span><input type="file" id="rs-file" accept=".json,application/json"></label>
    <label class="field"><span>…atau tempel teks cadangan</span><textarea id="rs-text" placeholder="{ ... }"></textarea></label>
    <div class="row-actions">
      <button class="btn primary flex1" id="rs-go">Pulihkan</button>
      <button class="btn flex1" id="rs-cancel">Batal</button>
    </div>`,
  (sheet) => {
    const ta = sheet.querySelector('#rs-text');
    sheet.querySelector('#rs-cancel').addEventListener('click', closeModal);
    sheet.querySelector('#rs-file').addEventListener('change', (e) => {
      const f = e.target.files && e.target.files[0]; if (!f) return;
      const r = new FileReader();
      r.onload = () => { ta.value = String(r.result || ''); };
      r.readAsText(f);
    });
    sheet.querySelector('#rs-go').addEventListener('click', () => {
      try {
        const obj = JSON.parse(ta.value);
        if (!obj || typeof obj !== 'object' || !Array.isArray(obj.quests) || typeof obj.xp !== 'number' || typeof obj.cls !== 'string') throw new Error('format');
        if (!confirm('Timpa progres sekarang dengan cadangan ini?')) return;
        state = migrate(obj); save(); closeModal(); tab = 'quests'; render(); toast('Data berhasil dipulihkan ✅');
      } catch (e) { toast('Cadangan tidak valid ⚠️'); }
    });
  });
}

/* ---------- Event ---------- */
document.addEventListener('click', (e) => {
  const el = e.target.closest('[data-act]');
  if (!el) return;
  const act = el.dataset.act;
  switch (act) {
    case 'tab': tab = el.dataset.tab; editMode = false; render(); window.scrollTo(0, 0); break;
    case 'toggle': toggleQuest(el.dataset.id); break;
    case 'add': openQuestModal(null); break;
    case 'edit': openQuestModal(el.dataset.id); break;
    case 'toggle-edit': editMode = !editMode; render(); break;
    case 'buy': buyItem(el.dataset.id); break;
    case 'equip': equipItem(el.dataset.id); break;
    case 'backup': openBackup(); break;
    case 'restore': openRestore(); break;
    case 'rename': {
      const n = prompt('Nama petualang baru:', state.name);
      if (n && n.trim()) { state.name = n.trim().slice(0, 16); save(); render(); }
      break;
    }
    case 'reset':
      if (confirm('Mulai ulang dari awal? Semua progres, misi, dan item akan dihapus. Pertimbangkan cadangkan dulu.') &&
          confirm('Yakin? Tindakan ini tidak bisa dibatalkan.')) {
        state = defaultState(); pickedClass = ''; tab = 'quests'; save(); render();
      }
      break;
    case 'install':
      if (deferredInstall) { deferredInstall.prompt(); deferredInstall.userChoice.finally(() => { deferredInstall = null; render(); }); }
      break;
    case 'pick':
      pickedClass = el.dataset.cls;
      document.querySelectorAll('.cls').forEach((b) => b.setAttribute('aria-pressed', b.dataset.cls === pickedClass));
      break;
    case 'start': {
      const name = (document.getElementById('onb-name').value || '').trim();
      if (!name) { toast('Isi nama petualangmu dulu'); document.getElementById('onb-name').focus(); return; }
      if (!pickedClass) { toast('Pilih kelas petualangmu'); return; }
      const sample = document.getElementById('onb-sample').checked;
      state = defaultState();
      state.name = name.slice(0, 16); state.cls = pickedClass;
      if (sample) state.quests = SAMPLE_QUESTS.map((q) => Object.assign({ id: uid() }, q));
      save(); tab = 'quests'; render();
      toast(`Selamat datang, ${state.name}! ⚔️`, 'gold');
      break;
    }
    default: break;
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') closeModal();
  if (e.key === 'Enter' && e.target && e.target.id === 'q-name') { const b = document.getElementById('q-save'); if (b) b.click(); }
  if (e.key === 'Enter' && e.target && e.target.id === 'onb-name') { const b = document.querySelector('[data-act="start"]'); if (b) b.click(); }
});

/* Ganti hari otomatis (misi di-reset karena catatan per tanggal) */
function checkDayChange() {
  const k = todayKey();
  if (k !== lastDay) { lastDay = k; if (!document.querySelector('.overlay')) render(); }
}
document.addEventListener('visibilitychange', () => { if (!document.hidden) checkDayChange(); });
window.addEventListener('focus', checkDayChange);
setInterval(checkDayChange, 60000);

window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredInstall = e; if (tab === 'hero') render(); });
window.addEventListener('appinstalled', () => { deferredInstall = null; toast('Aplikasi terpasang 🎉'); });

if ('serviceWorker' in navigator && /^https?:$/.test(location.protocol)) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}

render();
})();
