// Tennis Deluxe: screens, career, shop, audio.
(function () {
  'use strict';
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const fmt = n => Math.round(n).toLocaleString('en-US');
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const { cl, rnd } = TD;

  /* ================= data ================= */
  const BATS = [
    { id: 'classic', name: 'Club Classic', type: 'All-round', speed: 42, spin: 40, control: 52, price: 0, base: 500, c: ['#ff7a7a', '#c4161c'], gl: 'rgba(255,60,90,.65)' },
    { id: 'blaze', name: 'Blaze Pro', type: 'Attack', speed: 62, spin: 50, control: 54, price: 1200, base: 900, c: ['#ffb07a', '#e8521b'], gl: 'rgba(255,120,40,.7)' },
    { id: 'frost', name: 'Frost Defender', type: 'Control', speed: 48, spin: 54, control: 74, price: 1500, base: 1000, c: ['#9be7ff', '#1a7fd1'], gl: 'rgba(80,180,255,.7)' },
    { id: 'thunder', name: 'Thunder Carbon', type: 'Power', speed: 78, spin: 56, control: 58, price: 3500, base: 1800, c: ['#d2c2ff', '#5b2bd6'], gl: 'rgba(150,100,255,.7)' },
    { id: 'viper', name: 'Viper Spin', type: 'Spin', speed: 64, spin: 84, control: 62, price: 5200, base: 2400, unlock: 'accra', c: ['#a6ffb8', '#14a04a'], gl: 'rgba(60,220,120,.7)' },
    { id: 'dragon', name: 'Golden Dragon', type: 'Legend', speed: 88, spin: 86, control: 82, price: 12000, base: 4000, unlock: 'tokyo', c: ['#fff0a6', '#d99a00'], gl: 'rgba(255,200,40,.8)' },
  ];
  const STYLE = { attacker: { label: 'Attacker', c: ['#ff9a6b', '#d6401b'], gl: 'rgba(255,90,40,.8)' }, defender: { label: 'Defender', c: ['#9be7ff', '#1a7fd1'], gl: 'rgba(80,180,255,.8)' }, spinner: { label: 'Spin master', c: ['#a6ffb8', '#14a04a'], gl: 'rgba(60,220,120,.8)' }, allround: { label: 'All-rounder', c: ['#e0c9ff', '#6b3bd6'], gl: 'rgba(160,110,255,.8)' } };
  const TOURS = [
    { id: 'lagos', name: 'Lagos City Open', city: 'Lagos', flag: '🇳🇬', theme: 'neon', venue: 'Neon Club', div: 4, prize: 1500, skill: [0.36, 0.44, 0.52], col: '#ff3dc8',
      field: [['Kai Ade', '🇳🇬', 'attacker'], ['Rina Volt', '🇨🇲', 'defender'], ['Big Tunde', '🇳🇬', 'attacker'], ['Zuri Pace', '🇰🇪', 'allround'], ['Kofi Flick', '🇬🇭', 'spinner'], ['Lena Cross', '🇿🇦', 'defender'], ['Moussa Diop', '🇸🇳', 'spinner']] },
    { id: 'accra', name: 'Accra Coastal Cup', city: 'Accra', flag: '🇬🇭', theme: 'beach', venue: 'Beach Courts', div: 3, req: 'lagos', prize: 2500, skill: [0.46, 0.53, 0.6], col: '#2ab3e8',
      field: [['Kwame Asante', '🇬🇭', 'attacker'], ['Efua Mensah', '🇬🇭', 'defender'], ['Yaw Boateng', '🇬🇭', 'spinner'], ['Ama Owusu', '🇬🇭', 'allround'], ['Kojo Badu', '🇬🇭', 'attacker'], ['Aisha Kamara', '🇸🇱', 'spinner'], ['Jean Koffi', '🇨🇮', 'defender']] },
    { id: 'cairo', name: 'Cairo Desert Classic', city: 'Cairo', flag: '🇪🇬', theme: 'rooftop', venue: 'Sunset Rooftop', div: 2, req: 'accra', prize: 4000, skill: [0.55, 0.62, 0.69], col: '#ff8a4a',
      field: [['Omar Hassan', '🇪🇬', 'attacker'], ['Nour Saleh', '🇪🇬', 'spinner'], ['Karim Fathy', '🇪🇬', 'defender'], ['Layla Aziz', '🇲🇦', 'allround'], ['Tarek Mansour', '🇹🇳', 'attacker'], ['Salma Adel', '🇪🇬', 'defender'], ['Youssef Amr', '🇯🇴', 'spinner']] },
    { id: 'london', name: 'London Masters', city: 'London', flag: '🇬🇧', theme: 'stadium', venue: 'Grand Stadium', div: 1, req: 'cairo', prize: 7500, skill: [0.64, 0.71, 0.78], col: '#ff3d5a',
      field: [['Harry Cole', '🇬🇧', 'allround'], ['Mia Patel', '🇬🇧', 'spinner'], ['Leon Brandt', '🇩🇪', 'attacker'], ['Chloe Martin', '🇫🇷', 'defender'], ['Marco Rossi', '🇮🇹', 'attacker'], ['Sofia Lind', '🇸🇪', 'spinner'], ['Jack Byrne', '🇮🇪', 'defender']] },
    { id: 'tokyo', name: 'Tokyo World Finals', city: 'Tokyo', flag: '🇯🇵', theme: 'city', venue: 'Neon City', div: 0, req: 'london', prize: 15000, skill: [0.74, 0.82, 0.9], col: '#2de2ff',
      field: [['Haru Sato', '🇯🇵', 'spinner'], ['Yuki Tanaka', '🇯🇵', 'defender'], ['Wei Zhang', '🇨🇳', 'attacker'], ['Min-jun Park', '🇰🇷', 'allround'], ['Rei Kato', '🇯🇵', 'attacker'], ['Li Na', '🇨🇳', 'spinner'], ['Ken Mori', '🇯🇵', 'defender']] },
  ];
  const LEAGUE_NAMES = [['Chidi Okafor', 'attacker'], ['Bola Adeyemi', 'defender'], ['Emeka Nwosu', 'spinner'], ['Seun Bakare', 'allround'], ['Ife Johnson', 'attacker'], ['Tobi Lawal', 'spinner'], ['Ngozi Eze', 'defender'], ['Musa Bello', 'allround'], ['Amaka Obi', 'attacker'], ['Dayo Cole', 'spinner'], ['Femi Ojo', 'defender'], ['Halima Sani', 'allround']];
  const DIV_SKILL = { 5: 0.2, 4: 0.3, 3: 0.4, 2: 0.5, 1: 0.58, 0: 0.66 };
  const ROUNDS = ['Quarterfinal', 'Semifinal', 'Final'];
  const divName = d => d === 0 ? 'Premier' : 'Division ' + d;
  const TIPS = ['Curve your swipe to add sidespin.', 'Swipe up fast as the ball arrives for topspin power.', 'A gentle touch with no swipe plays a safe block.', 'High balls are smash chances: swipe hard!', 'Upgrade Control to keep powerful shots on the table.', 'Lose in a tournament and you drop back to the league.'];

  /* ================= save ================= */
  const KEY = 'tdx_save_v1';
  const fresh = () => ({ name: '', coins: 300, division: 5, divWins: 0, bats: { classic: { level: 1 } }, equipped: 'classic', trophies: [], tour: null, leagueN: 0,
    stats: { matches: 0, wins: 0, pointsWon: 0, longest: 0, perfects: 0, smashes: 0, aces: 0, best: 0 }, set: { music: true, sfx: true, voice: true }, seenTut: false });
  let S;
  try { S = Object.assign(fresh(), JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = fresh(); }
  const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) { } };
  const batStats = id => { const b = BATS.find(x => x.id === id), lv = (S.bats[id] || { level: 1 }).level, k = (lv - 1) * 5; return { ...b, level: lv, speed: Math.min(99, b.speed + k), spin: Math.min(99, b.spin + k), control: Math.min(99, b.control + k) }; };
  const power = b => Math.round((b.speed + b.spin + b.control) / 3);
  const upCost = id => { const b = BATS.find(x => x.id === id), lv = S.bats[id].level; return lv >= 5 ? 0 : Math.round(b.base * (0.6 + lv * 0.4) / 50) * 50; };

  /* ================= audio ================= */
  const VOICES = ['ace', 'champion', 'comeback', 'game', 'greatshot', 'knockedout', 'letsplay', 'matchpoint', 'net', 'out', 'perfect', 'setpoint', 'smash', 'topspin', 'victory'];
  const Snd = {
    ac: null, buf: {}, music: {}, cur: null, crowd: null,
    init() {
      if (this.ac) return; try { this.ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return; }
      this.master = this.ac.createGain(); this.master.gain.value = 0.9; this.master.connect(this.ac.destination);
      const n = this.ac.createBuffer(1, this.ac.sampleRate * 2, this.ac.sampleRate), d = n.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; this.noise = n;
      ['menu', 'win'].forEach(k => { const a = new Audio('audio/music_' + k + '.mp3'); a.loop = k === 'menu'; a.preload = 'auto'; a.volume = 0; this.music[k] = a;
        // start inside the tap so mobile browsers allow playback later
        a.play().then(() => { if (k !== 'menu' || !S.set.music) a.pause(); }).catch(() => { }); });
    },
    resume() { if (this.ac && this.ac.state === 'suspended') this.ac.resume(); },
    async loadVoices(onp) {
      let done = 0;
      await Promise.all(VOICES.map(async v => { try { const r = await fetch('audio/' + v + '.mp3'); const ab = await r.arrayBuffer(); this.buf[v] = await new Promise((res, rej) => this.ac.decodeAudioData(ab, res, rej)); } catch (e) { } done++; onp && onp(done / VOICES.length); }));
    },
    voice(k) { if (window.__sndlog) window.__sndlog('voice', k, 1); if (!S.set.voice || !this.ac || !this.buf[k]) return; const s = this.ac.createBufferSource(), g = this.ac.createGain(); g.gain.value = 1.0; s.buffer = this.buf[k]; s.connect(g); g.connect(this.master); s.start(); },
    playMusic(k) {
      if (window.__sndlog) window.__sndlog('music', k, 1);
      if (this.cur === k) { if (S.set.music && this.music[k] && this.music[k].paused) this.music[k].play().catch(() => { }); return; }
      Object.entries(this.music).forEach(([n, a]) => { if (n !== k) this.fade(a, 0, true); });
      this.cur = k; const a = this.music[k]; if (!a || !S.set.music) return;
      if (k === 'win') a.currentTime = 0; a.play().catch(() => { }); this.fade(a, k === 'win' ? 0.75 : 0.45);
    },
    stopMusic() { this.cur = null; Object.values(this.music).forEach(a => this.fade(a, 0, true)); },
    fade(a, to, pauseAfter) { clearInterval(a._f); const step = () => { const v = a.volume + (to - a.volume) * 0.18; a.volume = Math.abs(v - to) < 0.01 ? to : Math.max(0, Math.min(1, v)); if (a.volume === to) { clearInterval(a._f); if (pauseAfter && to === 0) a.pause(); } }; a._f = setInterval(step, 40); },
    env(node, t, a, peak, d) { const g = this.ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + d); node.connect(g); g.connect(this.master); return g; },
    tone(f, d, v, type, f2, delay) { const t = this.ac.currentTime + (delay || 0), o = this.ac.createOscillator(); o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d); this.env(o, t, 0.002, v, d); o.start(t); o.stop(t + d + 0.02); },
    burst(d, v, type, f, q, delay) { const t = this.ac.currentTime + (delay || 0), s = this.ac.createBufferSource(); s.buffer = this.noise; const fl = this.ac.createBiquadFilter(); fl.type = type; fl.frequency.value = f; fl.Q.value = q || 1; s.connect(fl); this.env(fl, t, 0.001, v, d); s.start(t, Math.random()); s.stop(t + d + 0.02); },
    sfx(kind, v = 0.5) {
      if (window.__sndlog) window.__sndlog('sfx', kind, v);
      if (!S.set.sfx || !this.ac) return; v = cl(v, 0.05, 1);
      if (kind === 'paddle') { this.burst(0.03, 0.5 * v + 0.12, 'bandpass', 3200, 1.2); this.tone(1050 + 350 * v, 0.055, 0.28 + 0.2 * v, 'sine', 700); if (v > 0.75) this.tone(160, 0.09, 0.4, 'sine', 70); }
      else if (kind === 'table') { this.tone(2100, 0.035, 0.22 + 0.3 * v, 'sine', 1500); this.burst(0.012, 0.25 * v + 0.05, 'highpass', 4500); }
      else if (kind === 'floor') { this.tone(780, 0.07, 0.25 * v + 0.04, 'sine', 520); this.burst(0.02, 0.12 * v, 'lowpass', 1800); }
      else if (kind === 'net') { this.burst(0.16, 0.35, 'lowpass', 420, 0.8); this.tone(130, 0.12, 0.25, 'sine', 80); }
      else if (kind === 'ui') { this.tone(1300, 0.03, 0.12, 'triangle'); }
      else if (kind === 'coin') { this.tone(1568, 0.08, 0.15, 'triangle'); this.tone(2093, 0.14, 0.15, 'triangle', null, 0.07); }
    },
    crowdOn(on) {
      if (window.__sndlog) window.__sndlog('crowd', on ? 'on' : 'off', 1);
      if (!this.ac) return;
      if (on && !this.crowd) { const s = this.ac.createBufferSource(); s.buffer = this.noise; s.loop = true; const f = this.ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 650; f.Q.value = 0.5; const g = this.ac.createGain(); g.gain.value = S.set.sfx ? 0.035 : 0; s.connect(f); f.connect(g); g.connect(this.master); s.start(); this.crowd = { s, g }; }
      if (!on && this.crowd) { try { this.crowd.s.stop(); } catch (e) { } this.crowd = null; }
    },
    cheer(p) { if (window.__sndlog) window.__sndlog('cheer', 'cheer', p); if (!S.set.sfx || !this.ac) return; const t = this.ac.currentTime, s = this.ac.createBufferSource(); s.buffer = this.noise; const f = this.ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1400; f.Q.value = 0.35; const g = this.ac.createGain(); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.06 + 0.12 * p, t + 0.18); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1 + p); s.connect(f); f.connect(g); g.connect(this.master); s.start(t, Math.random()); s.stop(t + 2.4); }
  };

  /* ================= helpers ================= */
  function show(id) { document.querySelectorAll('.scr').forEach(s => s.classList.toggle('on', s.id === id)); }
  function toast(msg) { const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; $('#app').appendChild(t); setTimeout(() => t.remove(), 2200); }
  function modal(html) { $('#mcard').innerHTML = html; $('#modal').classList.add('on'); }
  function closeModal() { $('#modal').classList.remove('on'); }
  function batHTML(b, w) { return `<div class="bat" style="width:${w}px;--c1:${b.c[0]};--c2:${b.c[1]};--gl:${b.gl}"><div class="h"></div><div class="r"></div></div>`; }
  function addCoins(n) { S.coins += n; save(); }
  const BG = {};
  function arenaImage(theme) {
    if (BG[theme]) return BG[theme];
    const keep = Object.assign({}, TD.V);
    TD.setView(360, 640, 1); const L = TD.paintArena(theme); const c = document.createElement('canvas'); c.width = 360; c.height = 640; const x = c.getContext('2d'); x.drawImage(L.room, 0, 0); x.drawImage(L.table, 0, 0);
    BG[theme] = c.toDataURL('image/jpeg', 0.72);
    if (keep.wCss) TD.setView(keep.wCss, keep.hCss, keep.dpr);
    return BG[theme];
  }
  document.addEventListener('click', e => { if (e.target.closest('button')) { Snd.resume(); Snd.sfx('ui'); } }, true);

  /* ================= splash & loading ================= */
  $('#s-splash').addEventListener('pointerup', async () => {
    Snd.init(); Snd.resume(); show('s-loading');
    $('#ldTip').innerHTML = '<b style="color:#ffd23f">TIP:</b> ' + TIPS[Math.floor(Math.random() * TIPS.length)];
    const t0 = Date.now(); let pv = 0, pf = 0;
    const set = (p, txt) => { $('#ldBar').style.width = Math.round(p * 100) + '%'; $('#ldPct').textContent = Math.round(p * 100) + '%'; if (txt) $('#ldTxt').textContent = txt; };
    set(0.05, 'LOADING FONTS…');
    try { await Promise.all([document.fonts.load('40px TDD'), document.fonts.load('40px TDI'), document.fonts.load('16px TDB')]); } catch (e) { }
    set(0.15, 'LOADING ANNOUNCER…');
    await Snd.loadVoices(p => set(0.15 + p * 0.55));
    set(0.75, 'BUILDING ARENAS…'); await sleep(30);
    arenaImage('club'); set(0.88); await sleep(20); arenaImage('neon'); set(1, 'READY');
    const wait = 1700 - (Date.now() - t0); if (wait > 0) await sleep(wait);
    Snd.playMusic('menu');
    const afterName = () => { openMenu('lineup'); if (!S.tourDone) setTimeout(menuTour, 400); };
    if (!S.name) askName(afterName); else afterName();
  }, { once: true });

  function askName(then) {
    modal(`<div class="h1">Your name</div><div style="font-size:14px;color:var(--mut)">This shows on the scoreboard.</div><input id="nmIn" maxlength="14" placeholder="e.g. Favour" value="${esc(S.name)}"><button class="btn" id="nmOk">LET'S GO</button>`);
    const i = $('#nmIn'); setTimeout(() => i.focus(), 60);
    const ok = () => { const v = i.value.trim().slice(0, 14); S.name = v || 'Player'; save(); closeModal(); then && then(); };
    $('#nmOk').onclick = ok; i.onkeydown = e => { if (e.key === 'Enter') ok(); };
  }

  /* ================= menu ================= */
  let tab = 'lineup';
  function openMenu(t) {
    tab = t || tab; show('s-menu'); Snd.playMusic('menu');
    $('#menuBg').style.backgroundImage = `url(${arenaImage(tab === 'tour' ? 'neon' : 'club')})`;
    document.querySelectorAll('#tabs button').forEach(b => b.classList.toggle('on', b.dataset.tab === tab));
    $('#tbAv').textContent = (S.name || 'YOU').slice(0, 2).toUpperCase(); $('#tbTro').textContent = S.trophies.length; $('#tbCoins').textContent = fmt(S.coins);
    ({ lineup: renderLineup, tour: renderTour, shop: renderShop, ranks: renderRanks })[tab]();
    $('#menuBody').scrollTop = 0;
  }
  $('#tabs').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.tab === 'play') return playLeague(); openMenu(b.dataset.tab); });
  $('#btnSet').onclick = () => openSettings();
  document.querySelectorAll('#s-menu .cur')[0].onclick = () => openMenu('ranks');
  document.querySelectorAll('#s-menu .cur')[1].onclick = () => openMenu('shop');

  function renderLineup() {
    const b = batStats(S.equipped), tour = S.tour && TOURS.find(t => t.id === S.tour.id);
    const ST = [['⚡', 'Speed', b.speed], ['🌀', 'Spin', b.spin], ['🎯', 'Control', b.control]];
    const nextT = TOURS.find(t => !S.trophies.includes(t.id));
    $('#menuBody').innerHTML = `
      <div style="display:grid;grid-template-columns:1fr 1.25fr;gap:12px;align-items:start">
        <div style="text-align:center;padding-top:6px">
          <div style="position:relative;display:inline-block;transform:rotate(-14deg);margin:6px 0 4px">${batHTML(b, 112)}</div>
          <div class="sp" style="font-size:22px;line-height:1">${esc(b.name)}</div><div style="font-size:12px;color:var(--mut);margin-top:4px">${b.type} bat · Level ${b.level}</div>
        </div>
        <div class="panel" style="padding-bottom:6px">
          <div style="display:flex;align-items:center;gap:10px;padding:10px 12px;background:rgba(0,0,0,.18);border-radius:10px 10px 0 0"><div class="sp" style="font-size:13px;line-height:1.05;opacity:.9">TOTAL<br>POWER</div><div class="sp" style="margin-left:auto;font-size:36px">${power(b)}</div></div>
          ${ST.map(s => `<div class="srow"><span class="ic">${s[0]}</span><span class="nm">${s[1]}</span><span class="v">${s[2]}</span><span class="ln"><i style="width:${s[2]}%"></i></span></div>`).join('')}
        </div>
      </div>
      <div class="card" style="margin-top:14px;background:linear-gradient(135deg,rgba(255,138,61,.35),rgba(179,58,18,.25));border-color:rgba(255,160,90,.5)">
        <div style="display:flex;justify-content:space-between;align-items:center"><div><div class="kick" style="color:#ffd9a0">CLUB LEAGUE</div><div class="sp" style="font-size:24px;margin-top:4px">${divName(S.division)}</div></div><div style="font-size:32px">🏓</div></div>
        ${S.division > 0 ? `<div class="bar" style="margin:12px 0 6px"><i style="width:${S.divWins / 3 * 100}%;background:linear-gradient(90deg,#ffd23f,#ff8a3d)"></i></div><div style="font-size:12px;color:var(--mut)">${3 - S.divWins} more win${3 - S.divWins === 1 ? '' : 's'} to reach ${divName(S.division - 1)}</div>` : `<div style="font-size:12px;color:var(--mut);margin-top:8px">Top division. Every win pays premium coins.</div>`}
      </div>
      <div style="margin-top:14px"><button class="btn" id="lPlay">▶ PLAY LEAGUE MATCH</button></div>
      ${tour ? `<div class="card" style="margin-top:14px;display:flex;gap:12px;align-items:center" id="lTour"><div style="font-size:30px">${tour.flag}</div><div style="flex:1"><div class="sp" style="font-size:16px">${esc(tour.name)}</div><div style="font-size:12px;color:var(--mut)">In progress · ${ROUNDS[S.tour.round]} next</div></div><div class="chip" style="background:var(--red);border-color:var(--red)">CONTINUE</div></div>`
        : nextT ? `<div class="card" style="margin-top:14px;display:flex;gap:12px;align-items:center" id="lNext"><div style="font-size:30px">${nextT.flag}</div><div style="flex:1"><div class="sp" style="font-size:16px">${esc(nextT.name)}</div><div style="font-size:12px;color:var(--mut)">${tourOpen(nextT) ? 'Entry open! Tap to enter' : reqText(nextT)}</div></div><div class="chip">${tourOpen(nextT) ? 'ENTER' : '🔒'}</div></div>` : ''}`;
    $('#lPlay').onclick = playLeague;
    const lt = $('#lTour') || $('#lNext'); if (lt) lt.onclick = () => { const t = tour || nextT; if (tourOpen(t) || tour) openBracket(t.id); else openMenu('tour'); };
  }
  function tourOpen(t) { return S.division <= t.div && (!t.req || S.trophies.includes(t.req)); }
  function reqText(t) { const need = []; if (t.req && !S.trophies.includes(t.req)) need.push('win the ' + TOURS.find(x => x.id === t.req).city + ' event'); if (S.division > t.div) need.push('reach ' + divName(t.div)); return 'Locked: ' + need.join(' and '); }
  function renderTour() {
    const nodes = TOURS.slice().reverse().map(t => {
      const won = S.trophies.includes(t.id), open = tourOpen(t), live = S.tour && S.tour.id === t.id;
      return `<div class="node" data-t="${t.id}" style="margin-bottom:14px;${!open && !won ? 'opacity:.6' : ''}">
        <div class="dot" style="${live ? 'border-color:var(--red);box-shadow:0 0 22px var(--red)' : won ? 'border-color:var(--gold);box-shadow:0 0 18px rgba(255,210,63,.5)' : open ? `border-color:${t.col};box-shadow:0 0 18px ${t.col}` : ''}">${t.flag}</div>
        <div class="card" style="flex:1;padding:12px 14px;${live ? 'border-color:var(--red)' : ''}">
          <div style="display:flex;justify-content:space-between;gap:8px"><div class="sp" style="font-size:16px">${open || won ? '' : '🔒 '}${esc(t.name)}</div>${won ? '<span>🏆</span>' : ''}</div>
          <div style="font-size:12px;color:var(--mut);margin-top:3px">${t.venue} · Winner <span class="coin" style="width:13px;height:13px;vertical-align:-2px"></span> ${fmt(t.prize)}</div>
          <div style="margin-top:8px">${live ? `<span class="chip" style="background:var(--red);border-color:var(--red)">CONTINUE · ${ROUNDS[S.tour.round].toUpperCase()}</span>` : won ? '<span class="chip" style="color:var(--gold)">CHAMPION · PLAY AGAIN</span>' : open ? `<span class="chip" style="background:${t.col};border-color:${t.col};color:#08121a">ENTER TOURNAMENT</span>` : `<span style="font-size:11.5px;color:#ffcf9a">${reqText(t)}</span>`}</div>
        </div></div>`;
    }).join('');
    $('#menuBody').innerHTML = `<div class="kick">WORLD TOUR</div><div class="h1" style="margin:6px 0 14px">Tour map</div>${nodes}
      <div class="node"><div class="dot" style="border-color:var(--cyan);box-shadow:0 0 18px var(--cyan)">🏠</div><div class="card" style="flex:1;padding:12px 14px"><div class="sp" style="font-size:16px">Club League</div><div style="font-size:12px;color:var(--mut);margin-top:3px">Your home · ${divName(S.division)}</div><div style="margin-top:8px"><span class="chip" style="color:var(--cyan)">● YOU ARE HERE</span></div></div></div>`;
    $('#menuBody').querySelectorAll('.node[data-t]').forEach(n => n.onclick = () => { const t = TOURS.find(x => x.id === n.dataset.t); if (tourOpen(t) || S.trophies.includes(t.id) || (S.tour && S.tour.id === t.id)) openBracket(t.id); else toast(reqText(t)); });
  }
  function renderShop() {
    const e = batStats(S.equipped), cost = upCost(S.equipped);
    $('#menuBody').innerHTML = `<div class="kick">LOCKER & SHOP</div><div class="h1" style="margin:6px 0 12px">Bats</div>
      <div class="panel" style="padding:14px;display:flex;gap:14px;align-items:center">
        <div style="transform:rotate(-12deg);flex:none">${batHTML(e, 74)}</div>
        <div style="flex:1"><div style="display:flex;justify-content:space-between;align-items:center"><div class="sp" style="font-size:20px">${esc(e.name)}</div><span class="chip" style="color:var(--gold)">LV ${e.level}</span></div>
        ${[['Speed', e.speed], ['Spin', e.spin], ['Control', e.control]].map(s => `<div style="display:grid;grid-template-columns:62px 1fr 26px;gap:8px;align-items:center;font-size:12.5px;margin-top:7px"><span>${s[0]}</span><div class="bar" style="height:8px"><i style="width:${s[1]}%"></i></div><b class="sp">${s[1]}</b></div>`).join('')}</div>
      </div>
      <div style="margin-top:12px">${cost ? `<button class="btn" id="shUp" ${S.coins < cost ? 'disabled' : ''}>UPGRADE TO LV ${e.level + 1} <span style="background:rgba(0,0,0,.12);padding:3px 10px;border-radius:10px;font-size:17px"><span class="coin"></span> ${fmt(cost)}</span></button>` : '<div class="card" style="text-align:center" ><span class="sp">MAX LEVEL</span></div>'}</div>
      <div style="display:flex;align-items:baseline;margin:20px 0 10px"><div class="sp" style="font-size:18px">Shop</div><div style="margin-left:auto;font-size:11.5px;color:var(--mut)">Legend bats unlock by winning events</div></div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">${BATS.map(b => {
        const owned = !!S.bats[b.id], eq = S.equipped === b.id, locked = b.unlock && !S.trophies.includes(b.unlock) && !owned;
        return `<div class="card" style="text-align:center;padding:12px;${eq ? 'border-color:var(--gold)' : ''}${locked ? ';opacity:.6' : ''}">
          <div style="height:88px;display:flex;justify-content:center"><div style="transform:rotate(-12deg) scale(.82);transform-origin:50% 10%">${batHTML(b, 60)}</div></div>
          <div class="sp" style="font-size:14px">${locked ? '🔒 ' : ''}${esc(b.name)}</div><div style="font-size:11px;color:var(--mut);margin:3px 0 8px">${b.type} · ${b.speed}/${b.spin}/${b.control}</div>
          ${eq ? '<div class="chip" style="color:var(--gold)">EQUIPPED</div>' : owned ? `<button class="btn blue" style="padding:8px;font-size:14px" data-eq="${b.id}">EQUIP</button>` : locked ? `<div style="font-size:11px;color:#ffcf9a">Win ${TOURS.find(t => t.id === b.unlock).city}</div>` : `<button class="btn" style="padding:8px;font-size:14px" data-buy="${b.id}" ${S.coins < b.price ? 'disabled' : ''}><span class="coin" style="width:15px;height:15px"></span> ${fmt(b.price)}</button>`}
        </div>`; }).join('')}</div>`;
    const up = $('#shUp'); if (up) up.onclick = () => { if (S.coins < cost) return; S.coins -= cost; S.bats[S.equipped].level++; save(); Snd.sfx('coin'); toast('Upgraded to level ' + S.bats[S.equipped].level); openMenu('shop'); };
    $('#menuBody').querySelectorAll('[data-buy]').forEach(x => x.onclick = () => { const b = BATS.find(y => y.id === x.dataset.buy); if (S.coins < b.price) return; S.coins -= b.price; S.bats[b.id] = { level: 1 }; S.equipped = b.id; save(); Snd.sfx('coin'); toast(b.name + ' bought and equipped'); openMenu('shop'); });
    $('#menuBody').querySelectorAll('[data-eq]').forEach(x => x.onclick = () => { S.equipped = x.dataset.eq; save(); openMenu('shop'); });
  }
  function renderRanks() {
    const st = S.stats;
    $('#menuBody').innerHTML = `<div class="kick">CAREER</div><div class="h1" style="margin:6px 0 12px">${esc(S.name || 'Player')}</div>
      <div class="card"><div class="sp" style="font-size:15px;margin-bottom:10px">Trophy cabinet</div><div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px;text-align:center">${TOURS.map(t => `<div style="${S.trophies.includes(t.id) ? '' : 'opacity:.25;filter:grayscale(1)'}"><div style="font-size:30px">🏆</div><div style="font-size:16px">${t.flag}</div><div style="font-size:9.5px;margin-top:2px">${t.city}</div></div>`).join('')}</div></div>
      <div class="card stats4" style="margin-top:12px">
        <div><small>League</small><b>${divName(S.division)}</b></div><div><small>Matches won</small><b>${st.wins} / ${st.matches}</b></div>
        <div><small>Points won</small><b>${fmt(st.pointsWon)}</b></div><div><small>Longest rally</small><b>${st.longest}</b></div>
        <div><small>Perfect hits</small><b>${st.perfects}</b></div><div><small>Smashes</small><b>${st.smashes}</b></div>
        <div><small>Aces</small><b>${st.aces}</b></div><div><small>Best score</small><b>${fmt(st.best)}</b></div>
      </div>`;
  }
  function openSettings() {
    const t = (k, l) => `<div class="tog"><span>${l}</span><button class="sw ${S.set[k] ? 'on' : ''}" data-k="${k}"></button></div>`;
    modal(`<div class="h1">Settings</div>${t('music', 'Music')}${t('sfx', 'Sound effects')}${t('voice', 'Announcer')}
      <div class="tog"><span>Name: <b>${esc(S.name)}</b></span><button class="chip" id="stName">CHANGE</button></div>
      <button class="btn blue" id="stHow" style="font-size:17px">HOW TO PLAY</button><button class="btn ghost" id="stTut">REPLAY TUTORIAL</button><button class="btn" id="stDone">DONE</button>
      <button id="stReset" style="font-size:12px;color:rgba(255,255,255,.5);margin-top:4px">Reset career</button>`);
    $('#mcard').querySelectorAll('.sw').forEach(b => b.onclick = () => { const k = b.dataset.k; S.set[k] = !S.set[k]; b.classList.toggle('on', S.set[k]); save(); if (k === 'music') { if (S.set.music) { const c = Snd.cur || 'menu'; Snd.cur = null; Snd.playMusic(c); } else Snd.stopMusic(); } });
    $('#stName').onclick = () => askName(() => openMenu());
    $('#stHow').onclick = () => howTo(() => closeModal());
    $('#stTut').onclick = () => { S.tourDone = false; S.tutDone = false; save(); closeModal(); openMenu('lineup'); setTimeout(menuTour, 300); };
    $('#stDone').onclick = () => { closeModal(); openMenu(); };
    $('#stReset').onclick = () => { if (confirmReset()) { const set = S.set; S = fresh(); S.set = set; save(); closeModal(); askName(() => openMenu('lineup')); } };
  }
  function confirmReset() { return window.confirm ? window.confirm('Reset your whole career? Coins, bats and trophies will be lost.') : true; }
  function howTo(then) {
    modal(`<div class="h1">How to play</div>
      <div style="display:flex;flex-direction:column;gap:12px;font-size:14.5px;line-height:1.4">
        <div>👆 <b>Drag</b> anywhere to move your bat left and right.</div>
        <div>🏓 Get your bat in the ball's path and it's returned automatically.</div>
        <div>⚡ <b>Swipe up</b> as the ball arrives for power and topspin. No swipe plays a safe block.</div>
        <div>↔️ Swipe left or right to aim. <b>Curve</b> the swipe for sidespin.</div>
        <div>🎾 To serve, <b>swipe up</b> (or just tap). Games go to 11, win by 2.</div>
      </div><button class="btn" id="howOk">GOT IT</button>`);
    $('#howOk').onclick = () => { S.seenTut = true; save(); then && then(); };
  }

  /* ================= opponents & tournaments ================= */
  function makeAI(skill, style, name, flag) {
    const st = STYLE[style] || STYLE.allround;
    const ai = { name, flag, style, styleLabel: st.label, skill, rubber: st.c, glow: st.gl,
      speed: 2.4 + skill * 2.8, reach: 0.17 + skill * 0.14, error: cl(0.26 - skill * 0.22, 0.045, 0.4), power: 0.3 + skill * 0.55, spin: 0.2 + skill * 0.65, aim: 0.4 + skill * 0.5 };
    if (style === 'attacker') { ai.power += 0.15; ai.error += 0.03; }
    if (style === 'defender') { ai.reach += 0.05; ai.power -= 0.15; ai.error -= 0.03; ai.speed += 0.3; }
    if (style === 'spinner') { ai.spin += 0.3; }
    ai.error = cl(ai.error, 0.02, 0.45); ai.power = cl(ai.power, 0.15, 1);
    return ai;
  }
  function leagueOpponent() { const n = LEAGUE_NAMES[(S.leagueN * 5 + 3) % LEAGUE_NAMES.length]; return makeAI(DIV_SKILL[S.division] + rnd(-0.03, 0.04), n[1], n[0], '🇳🇬'); }
  function startTour(id) {
    const t = TOURS.find(x => x.id === id), seeds = t.field.slice().sort(() => Math.random() - 0.5);
    S.tour = { id, round: 0, seeds, alive: [true, true, true, true, true, true, true, true], sfWinner: null, finalist: null }; save();
  }
  function tourOpponent() {
    const T = S.tour, t = TOURS.find(x => x.id === T.id), r = T.round;
    // bracket slots: 0 = you, 1..7 = seeds[0..6]. QF: you v slot1. SF: you v winner(2,3). F: you v winner of (winner(4,5), winner(6,7)).
    const sk = i => t.skill[0] + (['attacker', 'spinner'].includes(t.field.find(f => f[0] === T.seeds[i - 1][0])[2]) ? 0.02 : 0);
    const duel = (a, b) => (Math.random() < 0.5 + (sk(a) - sk(b)) * 2 ? a : b);
    if (r === 0) T.oppSlot = 1;
    if (r === 1) { if (T.sfSlot == null) { T.sfSlot = duel(2, 3); T.qf2 = [duel(4, 5), duel(6, 7)]; } T.oppSlot = T.sfSlot; }
    if (r === 2) { if (T.fSlot == null) T.fSlot = duel(T.qf2[0], T.qf2[1]); T.oppSlot = T.fSlot; }
    save();
    const s = T.seeds[T.oppSlot - 1];
    return makeAI(t.skill[r] + rnd(-0.02, 0.02), s[2], s[0], s[1]);
  }
  function openBracket(id) {
    if (!S.tour || S.tour.id !== id) { if (S.tour && S.tour.id !== id) { if (!window.confirm || window.confirm('Leave your current tournament? You will drop back to the league.')) S.tour = null; else return; } startTour(id); }
    const t = TOURS.find(x => x.id === id), T = S.tour, opp = tourOpponent();
    show('s-bracket'); $('#brBg').style.backgroundImage = `url(${arenaImage(t.theme)})`;
    const name = i => i === 0 ? (S.name || 'You') : T.seeds[i - 1][0], flag = i => i === 0 ? '⭐' : T.seeds[i - 1][1];
    const out = new Set(); if (T.round >= 1) { out.add(1); out.add(T.sfSlot === 2 ? 3 : 2); out.add(T.qf2[0] === 4 ? 5 : 4); out.add(T.qf2[1] === 6 ? 7 : 6); } if (T.round >= 2) { out.add(T.sfSlot); out.add(T.fSlot === T.qf2[0] ? T.qf2[1] : T.qf2[0]); }
    const slot = i => `<div class="slot ${i === 0 ? 'me' : ''} ${out.has(i) ? 'out' : ''} ${i === T.oppSlot ? 'win' : ''}"><span style="font-size:16px">${flag(i)}</span><span style="flex:1">${esc(name(i))}</span>${i === T.oppSlot ? '<span style="font-size:10px;color:var(--gold)">NEXT</span>' : ''}</div>`;
    $('#brBody').innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center"><button class="chip" id="brBack">‹ BACK</button><span class="chip"><span class="coin" style="width:14px;height:14px"></span> Winner ${fmt(t.prize)}</span></div>
      <div style="margin:22px 0 14px"><div class="kick" style="color:${t.col}">${t.venue.toUpperCase()} · ${t.city.toUpperCase()}</div><div class="h1" style="font-size:32px;margin-top:6px">${t.flag} ${esc(t.name)}</div></div>
      <div style="display:flex;gap:8px;margin-bottom:12px">${ROUNDS.map((r, i) => `<span class="chip" style="${i === T.round ? 'background:var(--gold);color:#2a1c00;border-color:var(--gold)' : i < T.round ? 'color:var(--green)' : ''}">${i < T.round ? '✓ ' : ''}${r}</span>`).join('')}</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${[0, 1, 2, 3, 4, 5, 6, 7].map(slot).join('')}</div>
      <div class="panel" style="margin-top:16px;padding:14px;display:flex;gap:12px;align-items:center">
        <div style="flex:none;transform:rotate(-10deg)">${batHTML({ c: opp.rubber, gl: opp.glow }, 46)}</div>
        <div style="flex:1"><div class="kick" style="color:var(--gold)">${ROUNDS[T.round].toUpperCase()} OPPONENT</div><div class="sp" style="font-size:20px;margin-top:3px">${opp.flag} ${esc(opp.name)}</div><div style="font-size:12px;color:var(--mut);margin-top:2px">${opp.styleLabel} · Rating ${Math.round(opp.skill * 100)}</div></div>
      </div>
      <div class="card" style="margin-top:12px;font-size:12.5px;line-height:1.4;display:flex;gap:10px;align-items:center"><span style="font-size:22px">⚠️</span><span>Lose and you're out: you drop back to the Club League. ${T.round === 2 ? 'The final is best of 3 games.' : 'This round is one game to 11.'}</span></div>
      <div style="margin-top:16px"><button class="btn red" id="brPlay">▶ PLAY ${ROUNDS[T.round].toUpperCase()}</button></div>`;
    $('#brBack').onclick = () => openMenu('tour');
    $('#brPlay').onclick = () => startMatch({ mode: 'tour', ai: opp, theme: t.theme, bestOf: T.round === 2 ? 3 : 1, label: `${t.name} · ${ROUNDS[T.round]}`, tour: t, round: T.round });
  }
  function playLeague() { const ai = leagueOpponent(); startMatch({ mode: 'league', ai, theme: 'club', bestOf: 1, label: `Club League · ${divName(S.division)}` }); }

  /* ================= match ================= */
  const cv = $('#cv'), ctx = cv.getContext('2d');
  let M = null, layers = null, raf = 0, last = 0, cfg = null, dpr = 1, perf = { n: 0, sum: 0, dropped: 0 }, momentum = [];
  function sizeCanvas() {
    const r = $('#app').getBoundingClientRect();
    cv.width = Math.round(r.width * dpr); cv.height = Math.round(r.height * dpr);
    TD.setView(r.width, r.height, dpr); layers = TD.paintArena(cfg.theme);
  }
  function startMatch(c) {
    if (!S.tutDone && !c.tutorial) return matchTutorial(c);
    cfg = c; show('s-match'); Snd.stopMusic(); Snd.crowdOn(true);
    dpr = Math.min(window.devicePixelRatio || 1, 2); perf = { n: 0, sum: 0, dropped: 0 }; momentum = [];
    sizeCanvas();
    const bat = batStats(S.equipped);
    M = new TD.Match({ theme: c.theme, bestOf: c.bestOf, ai: c.ai, bat: { speed: bat.speed, spin: bat.spin, control: bat.control, rubber: bat.c, glow: bat.gl }, on: hooks, tutorial: !!c.tutorial });
    M.setPointer(cv.width / 2, cv.height * 0.84, false);
    $('#hNameP').textContent = (S.name || 'You').toUpperCase(); $('#hNameA').textContent = (c.ai.flag + ' ' + c.ai.name).toUpperCase();
    $('#hLabel').textContent = c.label.toUpperCase(); hud(true);
    const vs = $('#hVs'); vs.innerHTML = `<div class="kick" style="color:var(--gold)">${esc(c.label.toUpperCase())}</div><div class="row"><span>${esc(S.name || 'You')}</span><span class="vsx">VS</span><span>${esc(c.ai.name)}</span></div><div style="font-size:13px;color:var(--mut)">${c.ai.styleLabel} · Rating ${Math.round(c.ai.skill * 100)} · ${TD.THEMES[c.theme].name}</div>`;
    vs.style.opacity = 1; setTimeout(() => vs.style.opacity = 0, 1500);
    const go = () => { Snd.voice('letsplay'); last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(frame); };
    go();
  }
  const CALL_TEXT = { topspin: 'TOPSPIN!', smash: 'SMASH!', perfect: 'PERFECT!', ace: 'ACE!', greatshot: 'GREAT SHOT!', net: 'NET', out: 'OUT!', matchpoint: 'MATCH POINT', setpoint: 'GAME POINT', comeback: 'COMEBACK!', game: 'GAME!' };
  const CALL_VOICE = { setpoint: 'setpoint', matchpoint: 'matchpoint' };
  function callout(k) { const el = $('#hCall'); el.textContent = CALL_TEXT[k] || k.toUpperCase(); el.classList.remove('go'); void el.offsetWidth; el.classList.add('go'); Snd.voice(CALL_VOICE[k] || k); }
  const hooks = {
    call: k => callout(k),
    sfx: (k, v) => Snd.sfx(k, v),
    point: (side, info) => { (window.__plog = window.__plog || []).push([side, info.reason, info.rally, info.by]); momentum.push(side); if (momentum.length > 8) momentum.shift(); if (side === 0) Snd.cheer(cl(info.rally / 10, 0.2, 1)); hud(); },
    game: gw => { callout('game'); hud(true); },
    hint: t => { if (t === 'SWIPE UP TO SERVE') t = 'SWIPE UP OR TAP TO SERVE'; $('#hHintT').textContent = t; $('#hHint').style.opacity = t ? 1 : 0; },
    over: w => endMatch(w),
  };
  let lastHud = '';
  function hud(force) {
    if (!M) return;
    const key = M.score.join() + M.games.join() + M.server + M.stats.rally + M.state;
    if (!force && key === lastHud) return; lastHud = key;
    $('#hScoreP').textContent = M.score[0]; $('#hScoreA').textContent = M.score[1];
    const need = Math.ceil(cfg.bestOf / 2), dots = (n) => cfg.bestOf > 1 ? Array.from({ length: need }, (_, i) => `<b class="${i < n ? 'w' : ''}"></b>`).join('') : '';
    $('#hGamesP').innerHTML = dots(M.games[0]); $('#hGamesA').innerHTML = dots(M.games[1]);
    const mp = momentum.length ? momentum.filter(x => x === 0).length / momentum.length : 0.5;
    $('#hMomP').style.width = Math.round(8 + mp * 88) + '%'; $('#hMomA').style.width = Math.round(8 + (1 - mp) * 88) + '%';
    $('#hSrv').textContent = M.state === 'serve' ? (M.server === 0 ? 'YOUR SERVE' : 'THEIR SERVE') : '';
    const r = M.stats.rally; $('#hRally').style.opacity = r >= 3 && M.state === 'rally' ? 1 : 0; $('#hRallyN').textContent = r;
  }
  function frame(now) {
    if (!M) return;
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    try { M.update(dt); M.render(ctx, layers); hud(); } catch (err) { console.warn(err); }
    // adaptive quality: drop resolution if the phone struggles
    perf.n++; perf.sum += dt; if (perf.n >= 90) { const avg = perf.sum / perf.n; perf.n = 0; perf.sum = 0; if (avg > 0.024 && dpr > 1) { dpr = Math.max(1, dpr - 0.5); const sx = M.pad.sx / cv.width, sy = M.pad.sy / cv.height; sizeCanvas(); M.pad.sx = sx * cv.width; M.pad.sy = sy * cv.height; } }
    raf = requestAnimationFrame(frame);
  }
  function ptr(e) { if (!M) return; const r = cv.getBoundingClientRect(); M.setPointer((e.clientX - r.left) * dpr, (e.clientY - r.top) * dpr, e.buttons > 0 || e.type === 'pointerdown'); }
  cv.addEventListener('pointerdown', e => { Snd.resume(); try { cv.setPointerCapture(e.pointerId); } catch (x) { } ptr(e); });
  cv.addEventListener('pointermove', ptr); cv.addEventListener('pointerup', ptr);
  window.addEventListener('resize', () => { if (M && $('#s-match').classList.contains('on')) { const sx = M.pad.sx / cv.width, sy = M.pad.sy / cv.height; sizeCanvas(); M.pad.sx = sx * cv.width; M.pad.sy = sy * cv.height; } });
  document.addEventListener('visibilitychange', () => { if (document.hidden && M && !M.paused && M.state !== 'over') pause(); });
  $('#btnPause').onclick = () => pause();
  function pause() {
    if (!M) return; M.paused = true;
    modal(`<div class="h1">Paused</div><div style="font-size:14px;color:var(--mut)">${esc(cfg.label)} · ${M.score[0]}–${M.score[1]}</div><button class="btn" id="pRes">RESUME</button><button class="btn blue" id="pHow" style="font-size:17px">HOW TO PLAY</button><button class="btn ghost" id="pQuit">QUIT MATCH (COUNTS AS A LOSS)</button>`);
    $('#pRes').onclick = () => { closeModal(); last = performance.now(); M.paused = false; };
    $('#pHow').onclick = () => howTo(() => pause());
    $('#pQuit').onclick = () => { closeModal(); endMatch(1, true); };
  }

  function grade(st, won) {
    const tot = st.pointsWon + st.pointsLost || 1, r = st.pointsWon / tot;
    if (won && r > 0.72 && st.errors <= 3) return 'S'; if (won && r > 0.6) return 'A'; if (won) return 'B'; if (r > 0.4) return 'C'; return 'D';
  }
  function endMatch(winner, forfeit) {
    cancelAnimationFrame(raf); Snd.crowdOn(false);
    const st = M.stats, won = winner === 0, g = forfeit ? 'D' : grade(st, won);
    const scoreLine = M.games.join('–') + (cfg.bestOf > 1 ? ' games' : '') + (cfg.bestOf === 1 ? ` (${M.score[0]}–${M.score[1]})` : '');
    const perfScore = Math.max(0, st.pointsWon * 100 + st.winners * 60 + st.perfects * 80 + st.smashes * 70 + st.longest * 25 - st.errors * 30);
    S.stats.matches++; if (won) S.stats.wins++; S.stats.pointsWon += st.pointsWon; S.stats.longest = Math.max(S.stats.longest, st.longest); S.stats.perfects += st.perfects; S.stats.smashes += st.smashes; S.stats.aces += st.aces; S.stats.best = Math.max(S.stats.best, perfScore);
    const gb = { S: 120, A: 80, B: 40, C: 15, D: 0 }[g];
    const lines = []; let title, sub = '', voice = null, promoted = false, champion = false, next = null;
    if (cfg.mode === 'league') {
      S.leagueN++;
      if (won) { const base = 100 + (5 - S.division) * 30; lines.push(['League win', base]); S.divWins++; if (S.division > 0 && S.divWins >= 3) { S.division--; S.divWins = 0; promoted = true; lines.push(['Promotion bonus', 250]); } title = 'YOU WIN!'; voice = 'victory'; }
      else { lines.push(['Match played', forfeit ? 0 : 25]); title = 'DEFEATED'; }
      next = { label: 'PLAY AGAIN', fn: playLeague };
    } else {
      const t = cfg.tour, tier = TOURS.indexOf(t);
      if (won) {
        lines.push([ROUNDS[cfg.round] + ' win', 150 * (tier + 1)]);
        if (cfg.round === 2) { champion = true; lines.push(['Champion prize', t.prize]); if (!S.trophies.includes(t.id)) S.trophies.push(t.id); S.tour = null; title = 'CHAMPION!'; voice = 'champion'; }
        else { S.tour.round++; S.tour.sfSlot = S.tour.sfSlot; title = 'YOU WIN!'; voice = 'victory'; next = { label: 'NEXT: ' + ROUNDS[S.tour.round].toUpperCase(), fn: () => openBracket(t.id) }; }
      } else { lines.push(['Tournament run', forfeit ? 0 : 50 + 50 * cfg.round]); S.tour = null; title = 'KNOCKED OUT'; sub = 'Back to the Club League'; voice = 'knockedout'; }
    }
    if (gb && !forfeit) lines.push(['Performance (' + g + ')', gb]);
    const total = lines.reduce((a, l) => a + l[1], 0); addCoins(total); save();
    const theme = cfg.theme;
    setTimeout(() => {
      show('s-result'); $('#rsBg').style.backgroundImage = `url(${arenaImage(theme)})`;
      if (voice) Snd.voice(voice);
      if (champion || promoted) Snd.playMusic('win'); else Snd.playMusic('menu');
      const t = cfg.tour;
      $('#rsBody').innerHTML = `
        <div style="text-align:center">
          <div class="kick" style="color:var(--gold)">${esc(cfg.label.toUpperCase())}</div>
          ${champion ? `<div style="font-size:96px;line-height:1.1;margin-top:10px;filter:drop-shadow(0 0 30px rgba(255,210,63,.6))">🏆</div>` : ''}
          <div class="h1" style="font-size:${champion ? 52 : 48}px;margin-top:10px;${won ? 'text-shadow:0 0 30px rgba(255,90,54,.6)' : ''}">${title}</div>
          <div class="sp" style="font-size:18px;color:var(--mut);margin-top:8px">${forfeit ? 'Match forfeited' : (won ? 'vs ' : 'Lost to ') + esc(cfg.ai.name) + ' · ' + scoreLine}</div>
          ${sub ? `<div class="card" style="margin-top:14px;font-size:14px"><b>${sub}.</b> Win league matches and re-enter when you're ready.</div>` : ''}
          ${promoted ? `<div class="card" style="margin-top:14px;border-color:var(--gold);background:rgba(255,210,63,.12)"><div class="sp" style="font-size:20px">⬆ PROMOTED</div><div style="font-size:13px;color:var(--mut);margin-top:4px">Welcome to ${divName(S.division)}</div></div>` : ''}
          ${champion ? `<div class="card" style="margin-top:14px;border-color:var(--gold);background:rgba(255,210,63,.12);font-size:13.5px">${t.flag} ${esc(t.name)} champion!${TOURS[TOURS.indexOf(t) + 1] ? ' ' + TOURS[TOURS.indexOf(t) + 1].name + ' is now in reach.' : ' You conquered the world tour.'}${BATS.find(b => b.unlock === t.id) ? ' New bat unlocked in the shop: ' + BATS.find(b => b.unlock === t.id).name + '.' : ''}</div>` : ''}
        </div>
        <div class="grade" style="margin-top:20px"><b>${g}</b><span style="font-size:11px;color:var(--mut)">PERFORMANCE</span></div>
        <div class="sp" style="text-align:center;font-size:22px;margin-top:10px">${fmt(perfScore)} <span style="font-size:13px;color:var(--mut)">PTS</span></div>
        <div class="card stats4" style="margin-top:14px"><div><small>Longest rally</small><b>${st.longest}</b></div><div><small>Winners</small><b>${st.winners}</b></div><div><small>Perfect hits</small><b>${st.perfects}</b></div><div><small>Smashes</small><b>${st.smashes}</b></div></div>
        <div class="card" style="margin-top:12px">${lines.map(l => `<div style="display:flex;justify-content:space-between;font-size:14px;margin:5px 0"><span>${l[0]}</span><span style="color:var(--gold)">+${fmt(l[1])}</span></div>`).join('')}
          <div style="height:1px;background:rgba(255,255,255,.15);margin:10px 0"></div><div style="display:flex;justify-content:space-between;align-items:center"><span class="sp" style="font-size:18px">Coins earned</span><span class="sp" style="font-size:22px;color:var(--gold)"><span class="coin"></span> +${fmt(total)}</span></div></div>
        <div style="display:flex;flex-direction:column;gap:12px;margin-top:16px">
          ${next ? `<button class="btn red" id="rsNext">${next.label}</button>` : ''}
          <button class="btn ${next ? 'ghost' : ''}" id="rsHome">${cfg.mode === 'tour' && !won ? 'BACK TO LEAGUE' : 'HOME'}</button>
        </div>`;
      Snd.sfx('coin');
      if (next) $('#rsNext').onclick = next.fn;
      $('#rsHome').onclick = () => openMenu('lineup');
      M = null;
    }, forfeit ? 50 : 300);
  }


  /* ================= tutorial ================= */
  const CO = { el: $('#coach'), hole: $('#coach .chole'), hand: $('#coach .chand'), bub: $('#coach .cbub'), skip: $('#coach .cskip') };
  let coachRes = null, coachOpts = null, skipFn = null;
  function rectOf(el) { const a = $('#app').getBoundingClientRect(), r = el.getBoundingClientRect(); return { x: r.left - a.left, y: r.top - a.top, w: r.width, h: r.height }; }
  function coach(o) {
    coachOpts = o; const A = $('#app').getBoundingClientRect();
    CO.el.classList.add('on'); CO.el.classList.toggle('pass', !!o.pass); CO.el.classList.toggle('light', !!o.light);
    CO.bub.querySelector('.ct').textContent = o.title || ''; CO.bub.querySelector('.cx').innerHTML = o.text || '';
    CO.bub.querySelector('.cs').textContent = o.tap ? 'TAP THE HIGHLIGHTED PART TO CONTINUE' : (o.hint || '');
    CO.bub.querySelector('.cstep').textContent = o.step || '';
    const b = CO.bub.querySelector('.cb'); b.style.display = o.btn ? '' : 'none'; b.textContent = o.btn || '';
    const el = typeof o.el === 'string' ? $(o.el) : o.el;
    let r = null;
    if (el) { const q = rectOf(el), p = o.padH ?? 6; r = { x: q.x - p, y: q.y - p, w: q.w + p * 2, h: q.h + p * 2 }; }
    else if (o.rect) r = o.rect;
    if (r) { Object.assign(CO.hole.style, { left: r.x + 'px', top: r.y + 'px', width: r.w + 'px', height: r.h + 'px' }); CO.hole.classList.toggle('ring', true); }
    else { Object.assign(CO.hole.style, { left: A.width / 2 + 'px', top: A.height / 2 + 'px', width: '0px', height: '0px' }); CO.hole.classList.remove('ring'); }
    CO.hole.style.display = o.noMask ? 'none' : '';
    // bubble above or below the highlight
    const bh = CO.bub.offsetHeight || 150;
    let top = r ? (r.y + r.h / 2 > A.height * 0.5 ? r.y - bh - 18 : r.y + r.h + 18) : A.height * 0.32;
    if (o.bubY != null) top = A.height * o.bubY;
    CO.bub.style.top = Math.max(10, Math.min(A.height - bh - 10, top)) + 'px';
    // pointing hand
    CO.hand.className = 'chand' + (o.hand ? ' ' + o.hand : ''); CO.hand.textContent = o.hand ? '👆' : '';
    const hp = o.handAt || (r ? { x: r.x + r.w / 2, y: r.y + r.h / 2 } : { x: A.width / 2, y: A.height * 0.7 });
    Object.assign(CO.hand.style, { left: hp.x + 'px', top: hp.y + 'px' });
    return new Promise(res => { coachRes = res; if (o.auto) setTimeout(() => { if (coachOpts === o) { coachRes = null; res(); } }, o.auto); });
  }
  function coachHide() { CO.el.classList.remove('on'); coachOpts = null; coachRes = null; }
  CO.bub.querySelector('.cb').onclick = e => { e.stopPropagation(); Snd.sfx('ui'); if (coachRes) { const r = coachRes; coachRes = null; r(); } };
  CO.el.addEventListener('pointerup', e => {
    const o = coachOpts; if (!o || !o.tap || !coachRes) return;
    const h = CO.hole.getBoundingClientRect();
    if (e.clientX >= h.left && e.clientX <= h.right && e.clientY >= h.top && e.clientY <= h.bottom) {
      const el = typeof o.el === 'string' ? $(o.el) : o.el; const r = coachRes; coachRes = null; Snd.sfx('ui');
      if (o.click && el) el.click(); setTimeout(r, 30);
    }
  });
  CO.skip.onclick = e => { e.stopPropagation(); if (skipFn) skipFn(); };
  const until = (fn, timeout) => new Promise(res => { const t0 = performance.now(); const tick = () => { if (fn() || (timeout && performance.now() - t0 > timeout)) res(); else requestAnimationFrame(tick); }; tick(); });
  const nextFrame = () => new Promise(r => setTimeout(r, 120));

  async function menuTour() {
    if (S.tourDone) return;
    let skipped = false; CO.skip.style.display = ''; skipFn = () => { skipped = true; coachHide(); };
    const steps = [
      () => coach({ title: 'Welcome to Tennis Deluxe 🏓', text: "Let's take a quick tour so you know where everything is.", btn: "LET'S GO", step: '1/14' }),
      () => coach({ el: document.querySelectorAll('#s-menu .cur')[1], title: 'Coins', text: 'You earn coins every match. Spend them on new bats and upgrades.', tap: true, hand: 'tap', step: '2/14' }),
      () => coach({ el: document.querySelectorAll('#s-menu .cur')[0], title: 'Trophies', text: 'Win a world tournament and its trophy lands here.', tap: true, hand: 'tap', step: '3/14' }),
      () => coach({ el: '#menuBody > div', title: 'Your bat', text: '<b>Speed</b> = harder shots. <b>Spin</b> = more curve. <b>Control</b> = fewer mistakes and a bigger reach.', tap: true, hand: 'tap', step: '4/14' }),
      () => coach({ el: '#menuBody .card', title: 'Club League', text: 'Your home base. Win 3 league matches to move up a division.', tap: true, hand: 'tap', step: '5/14' }),
      () => coach({ el: '#tabs [data-tab="shop"]', title: 'Shop', text: 'Tap <b>SHOP</b>.', tap: true, click: true, hand: 'tap', step: '6/14' }),
      () => coach({ el: $('#shUp') || '#menuBody .panel', title: 'Upgrade', text: 'Upgrade your bat here, or buy a new one below. Legend bats unlock by winning tournaments.', tap: true, hand: 'tap', step: '7/14' }),
      () => coach({ el: '#tabs [data-tab="tour"]', title: 'World tour', text: 'Tap <b>TOUR</b>.', tap: true, click: true, hand: 'tap', step: '8/14' }),
      () => coach({ el: '#menuBody .node[data-t="lagos"]', title: 'Tournaments', text: 'Climb the league to unlock Lagos, then Accra, Cairo, London and Tokyo. Lose in a tournament and you drop back to the league.', tap: true, hand: 'tap', step: '9/14' }),
      () => coach({ el: '#tabs [data-tab="ranks"]', title: 'Ranks', text: 'Tap <b>RANKS</b>.', tap: true, click: true, hand: 'tap', step: '10/14' }),
      () => coach({ el: '#menuBody .card', title: 'Career', text: 'Your trophy cabinet and career stats live here.', tap: true, hand: 'tap', step: '11/14' }),
      () => coach({ el: '#tabs [data-tab="lineup"]', title: 'Back home', text: 'Tap <b>LINEUP</b>.', tap: true, click: true, hand: 'tap', step: '12/14' }),
      () => coach({ el: '#btnSet', title: 'Settings', text: 'Tap the <b>⚙️ settings</b> button.', tap: true, click: true, hand: 'tap', step: '13/14' }),
      () => coach({ el: document.querySelectorAll('#mcard .tog')[0], title: 'Music', text: 'Turn the background music on or off.', tap: true, hand: 'tap', step: 'SETTINGS 1/6' }),
      () => coach({ el: document.querySelectorAll('#mcard .tog')[1], title: 'Sound effects', text: 'Ball hits, bounces and the crowd.', tap: true, hand: 'tap', step: 'SETTINGS 2/6' }),
      () => coach({ el: document.querySelectorAll('#mcard .tog')[2], title: 'Announcer', text: 'The voice that calls "Smash!", "Net", "Match point" and more.', tap: true, hand: 'tap', step: 'SETTINGS 3/6' }),
      () => coach({ el: document.querySelectorAll('#mcard .tog')[3], title: 'Your name', text: 'Change the name on your scoreboard.', tap: true, hand: 'tap', step: 'SETTINGS 4/6' }),
      () => coach({ el: '#stHow', title: 'How to play', text: 'A quick reminder of the controls. You can also replay this tutorial below it.', tap: true, hand: 'tap', step: 'SETTINGS 5/6' }),
      () => coach({ el: '#stDone', title: 'Done', text: 'Tap <b>DONE</b> to close settings.', tap: true, click: true, hand: 'tap', step: 'SETTINGS 6/6' }),
      () => coach({ el: '#lPlay', title: 'Time to play', text: "Tap <b>PLAY LEAGUE MATCH</b>. We'll teach you the controls first.", tap: true, click: true, hand: 'tap', step: '14/14' }),
    ];
    for (const st of steps) { if (skipped) break; await nextFrame(); if (skipped) break; await st(); }
    S.tourDone = true; save(); coachHide(); CO.skip.style.display = 'none'; skipFn = null;
  }

  async function matchTutorial(real) {
    const ai = makeAI(0.1, 'allround', 'Coach', '🏓'); Object.assign(ai, { error: 0.55, power: 0.2, spin: 0.08, speed: 1.4, reach: 0.22 });
    startMatch({ mode: 'tutorial', tutorial: true, ai, theme: 'club', bestOf: 99, label: 'Tutorial' });
    const m = M; m.frozen = true; let done = false, skipped = false;
    const L = []; m.extra = (n, a, b) => L.forEach(f => f(n, a, b));
    const once = (names) => new Promise(res => { const f = (n, a) => { if (names.includes(n)) { L.splice(L.indexOf(f), 1); res({ n, a }); } }; L.push(f); });
    const alive = () => M === m && !skipped;
    CO.skip.style.display = ''; skipFn = () => { skipped = true; coachHide(); finish(); };
    const finish = () => { if (done) return; done = true; S.tutDone = true; S.seenTut = true; save(); coachHide(); CO.skip.style.display = 'none'; skipFn = null; m.extra = null; startMatch(real); };
    const scr = sel => $(sel);
    await new Promise(r => setTimeout(r, 1700));
    const intro = [
      { el: '.scorebox', title: 'Scoreboard', text: 'Your points on the left, your rival’s on the right. First to <b>11</b> wins (by 2 clear points).' },
      { el: '.hud .hb', title: 'You', text: 'Your name and <b>momentum bar</b>. It fills up when you win points.' },
      { el: '.hud .hb:nth-of-type(3)', title: 'Your rival', text: 'Their name and momentum. In longer matches, the dots show games won.' },
      { el: '#hLabel', title: 'Match', text: 'Which match you’re playing: league, tournament round or final.' },
      { el: '#btnPause', title: 'Pause', text: 'Pause any time. Quitting a match counts as a loss.' },
    ];
    for (const [i, st] of intro.entries()) { if (!alive()) return; await coach(Object.assign({ tap: true, hand: 'tap', step: `${i + 1}/5` }, st)); }
    if (!alive()) return;
    // hold
    coach({ title: 'Hold', text: 'Put your finger anywhere on the screen and <b>keep holding</b>.', pass: true, light: true, noMask: true, hand: 'hold', bubY: 0.16, handAt: { x: $('#app').clientWidth / 2, y: $('#app').clientHeight * 0.78 } });
    let heldFrom = 0; await until(() => { if (!alive()) return true; if (m.pad.down) { heldFrom = heldFrom || performance.now(); return performance.now() - heldFrom > 700; } heldFrom = 0; return false; });
    if (!alive()) return;
    coach({ title: 'Drag', text: 'Keep holding and <b>drag left and right</b>. Your bat follows your finger.', pass: true, light: true, noMask: true, hand: 'drag', bubY: 0.16, handAt: { x: $('#app').clientWidth / 2, y: $('#app').clientHeight * 0.78 } });
    let travel = 0, lx = null; await until(() => { if (!alive()) return true; if (m.pad.down) { if (lx != null) travel += Math.abs(m.pad.sx - lx) / dpr; lx = m.pad.sx; } else lx = null; return travel > 260; });
    if (!alive()) return;
    await coach({ title: 'Nice!', text: 'That’s how you move. Now let’s return a serve.', pass: true, light: true, noMask: true, auto: 1400, bubY: 0.16 });
    const drill = async (kind) => {
      for (let attempt = 0; attempt < 3; attempt++) {
        if (!alive()) return;
        coach({ title: 'Coach serves', text: 'Watch the ball…', pass: true, light: true, noMask: true, bubY: 0.16 });
        m.ts = 1; m.frozen = false; m.score = [0, 0]; m.coachServe();
        const ev = await Promise.race([new Promise(res => { const f = (n, a) => { if (n === 'bounce' && a === 0) { L.splice(L.indexOf(f), 1); res('b'); } }; L.push(f); }), once(['pointdone']).then(() => 'pd')]);
        if (!alive()) return; if (ev === 'pd') continue;
        m.frozen = true; const g = m.predictCross(); m.guide = g;
        const ring = TD.P(g.x, g.y, TD.HIT_P);
        coach({ title: 'Freeze!', text: 'Drag your bat into the <b>yellow ring</b>. That’s where the ball will reach you.', pass: true, light: true, noMask: true, hand: 'drag', bubY: 0.16, handAt: { x: ring[0] / dpr, y: ring[1] / dpr + 40 } });
        await until(() => !alive() || (m.pad.down && Math.abs(m.padWorldX() - g.x) < 0.11));
        if (!alive()) return;
        const txt = { basic: ['Swipe up!', 'Now <b>swipe UP</b> to hit it back.', 'swipe'], power: ['Power shot', '<b>Swipe up FAST</b> for a powerful shot.', 'swipe'], curve: ['Add spin', '<b>Swipe up in a curve</b>, like a C, to bend the ball.', 'curve'] }[kind];
        coach({ title: txt[0], text: txt[1], pass: true, light: true, noMask: true, hand: txt[2], bubY: 0.16, handAt: { x: ring[0] / dpr, y: ring[1] / dpr + 60 } });
        m.ts = 0.28; m.frozen = false;
        const r = await once(['playerhit', 'miss', 'pointdone']);
        m.ts = 1; m.guide = null;
        let ok = false, msg = 'So close! Let’s try again.';
        if (r.n === 'playerhit') {
          if (kind === 'basic') { ok = true; msg = 'Great return! 🎉'; }
          if (kind === 'power') { ok = r.a.power > 0.45; msg = ok ? 'Boom! That’s power. 💥' : 'Good hit! Swipe faster for more power.'; }
          if (kind === 'curve') { ok = Math.abs(r.a.curve) > 0.2; msg = ok ? 'Look at that spin! 🌀' : 'Nice! Curve your swipe more to add spin.'; }
        }
        coach({ title: ok ? 'Yes!' : 'Again', text: msg, pass: true, light: true, noMask: true, bubY: 0.16 });
        if (r.n !== 'pointdone') await Promise.race([once(['pointdone']), new Promise(x => setTimeout(x, 6000))]);
        await new Promise(x => setTimeout(x, 500));
        if (ok) return;
      }
    };
    await drill('basic'); await drill('power'); await drill('curve');
    if (!alive()) return;
    coach({ title: 'Your serve', text: '<b>Swipe up</b> to serve, or just tap the screen.', pass: true, light: true, noMask: true, hand: 'swipe', bubY: 0.16, handAt: { x: $('#app').clientWidth / 2, y: $('#app').clientHeight * 0.75 } });
    m.frozen = false; m.score = [0, 0]; m.playerServe();
    await until(() => !alive() || (m.state === 'rally' && m.serveBy === 0));
    if (!alive()) return;
    coachHide(); CO.skip.style.display = '';
    await Promise.race([once(['pointdone']), new Promise(x => setTimeout(x, 9000))]);
    if (!alive()) return;
    m.frozen = true;
    await coach({ title: 'You’re ready! 🏆', text: 'Move with your finger, swipe to hit, curve for spin. Win points to fill your momentum. First to 11 wins!', btn: 'PLAY MY FIRST MATCH' });
    finish();
  }

  window.__TD = { coachState: () => coachOpts && { title: coachOpts.title, tap: !!coachOpts.tap }, S: () => S, M: () => M, startMatch, playLeague, openBracket, openMenu, TOURS, makeAI, save: () => save() };
})();
