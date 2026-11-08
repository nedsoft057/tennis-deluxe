// Tennis Deluxe match engine: 2.5D projection, arena painting, ball physics, rules, AI, input.
(function (root) {
  'use strict';
  const TW = 0.7625, TL = 1.37, TY = 0.76, NET_H = 0.1525, G = 9.8, R = 0.02;
  const HIT_P = -1.85, HIT_A = 1.85, K_TOP = 5.5, K_SIDE = 1.6, TIME = 0.95;
  const CAM = { x: 0, y: 2.0, z: -3.55, pitch: -0.46 };
  const cl = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rnd = (a = 0, b = 1) => a + Math.random() * (b - a);

  // ---------------- view ----------------
  const V = { W: 0, H: 0, dpr: 1, F: 800, CX: 0, CY: 0, s: 1 };
  function setView(wCss, hCss, dpr) {
    V.dpr = dpr; V.W = Math.round(wCss * dpr); V.H = Math.round(hCss * dpr); V.wCss = wCss; V.hCss = hCss;
    V.s = Math.min(V.W / 1080, V.H / 1500);
    V.F = 1400 * V.s; V.CX = V.W / 2; V.CY = V.H * (V.H > V.W ? 0.47 : 0.5);
  }
  function P(x, y, z) {
    const X = x - CAM.x, Y = y - CAM.y, Z = z - CAM.z, cp = Math.cos(CAM.pitch), sp = Math.sin(CAM.pitch);
    const y2 = Y * cp - Z * sp, z2 = Y * sp + Z * cp;
    return [V.CX + X * V.F / z2, V.CY - y2 * V.F / z2, z2];
  }
  function depthAt(y, z) { return P(0, y, z)[2]; }
  const TD_clampY = y => cl(y, TY + 0.06, TY + 0.75);
  const TD_wx = (sx, d) => (sx - V.CX) * d / V.F;
  function worldXAt(sx, y, z) { return (sx - V.CX) * depthAt(y, z) / V.F; }

  // ---------------- arenas ----------------
  const THEMES = {
    club: { kind: 'indoor', name: 'Club Hall', bg: ['#1a110b', '#2b1c12'], wall: ['#3a2618', '#5a3a22'], side: '#24170e', floor: ['#7a5232', '#3a2416'], planks: true,
      strips: [{ y: 2.95, c: '#ffd9a0' }, { y: 1.9, c: '#ffcf8a' }], sign: 'CLUB LEAGUE', signCol: '#ffcf6a', cone: '255,236,200', crowd: 0.35, crowdCol: ['#1b120c', '#22170f'], table: ['#1c4fb8', '#2a63e0', '#153c8f'], pool: '255,200,140' },
    neon: { kind: 'indoor', name: 'Neon Club', bg: ['#07051a', '#05040f'], wall: ['#120a35', '#2a1260'], side: '#0d0828', floor: ['#1a0f3a', '#050410'],
      strips: [{ y: 3.0, c: '#ff3dc8' }, { y: 1.9, c: '#2de2ff' }], sideNeon: ['#2de2ff', '#ff3dc8'], sign: 'LAGOS CITY OPEN', signCol: '#ffd23f', cone: '255,240,220', crowd: 1, crowdCol: ['#0f0a2a', '#130c33'], table: ['#1b4fd8', '#2a63f0', '#163fae'], pool: '140,120,255' },
    beach: { kind: 'outdoor', name: 'Beach Courts', sky: ['#4fb6f0', '#cdeeff'], horizonCol: '#e9f7ff', scene: 'sea', ground: ['#f0d9a6', '#c9a76b'], sun: { x: 0.72, y: 0.12, r: 70, c: '255,250,220' },
      bunting: true, sign: 'ACCRA COASTAL CUP', signCol: '#ffffff', board: '#e8412c', table: ['#14805a', '#1f9a6c', '#0f6447'], pool: '255,255,255', crowd: 0 },
    rooftop: { kind: 'outdoor', name: 'Sunset Rooftop', sky: ['#3a1d5c', '#ff8a4a'], horizonCol: '#ffb36b', scene: 'pyramids', ground: ['#b8643c', '#5e2c18'], sun: { x: 0.3, y: 0.3, r: 90, c: '255,190,110' },
      lights: true, sign: 'CAIRO DESERT CLASSIC', signCol: '#ffd27a', board: '#2b1238', table: ['#1d4fc4', '#2b62e6', '#173d96'], pool: '255,170,110', crowd: 0 },
    stadium: { kind: 'indoor', name: 'Grand Stadium', bg: ['#050a1c', '#030612'], wall: ['#0a1430', '#13224d'], side: '#081028', floor: ['#0b1d42', '#050d22'], court: true,
      strips: [{ y: 1.25, c: '#ff3d5a' }], led: 'LONDON MASTERS', sign: '', signCol: '#ffffff', cone: '235,245,255', crowd: 1.6, crowdCol: ['#0c1430', '#101a3c'], flood: true, table: ['#1b4fd8', '#2a63f0', '#163fae'], pool: '200,220,255' },
    city: { kind: 'outdoor', name: 'Neon City', sky: ['#05061a', '#1b0f3d'], horizonCol: '#3a1d6e', scene: 'city', ground: ['#151033', '#07051a'], gloss: true,
      sign: 'TOKYO WORLD FINALS', signCol: '#2de2ff', board: '#14072e', table: ['#1b4fd8', '#2a63f0', '#163fae'], pool: '255,61,200', crowd: 0 },
  };
  function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  function paintArena(theme) {
    const room = mkCanvas(V.W, V.H), table = mkCanvas(V.W, V.H);
    const raw = mkCanvas(V.W, V.H), c = raw.getContext('2d');
    const T = THEMES[theme] || THEMES.neon;
    paintRoom(c, T);
    const rc = room.getContext('2d');
    rc.drawImage(raw, 0, 0);
    rc.save(); rc.globalCompositeOperation = 'lighter';
    rc.filter = `blur(${Math.round(22 * V.s)}px)`; rc.globalAlpha = 0.3; rc.drawImage(raw, 0, 0);
    rc.filter = `blur(${Math.round(64 * V.s)}px)`; rc.globalAlpha = 0.2; rc.drawImage(raw, 0, 0); rc.restore();
    paintTable(table.getContext('2d'), T);
    return { room, table, T };
  }
  function poly(c, pts, fill) { c.beginPath(); pts.forEach((p, i) => { const q = P(p[0], p[1], p[2]); i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1]); }); c.closePath(); c.fillStyle = fill; c.fill(); }
  function grad(c, y0, y1, stops) { const g = c.createLinearGradient(0, y0, 0, y1); stops.forEach(s => g.addColorStop(s[0], s[1])); return g; }
  function line3(c, a, b, col, w, glow) { const p = P(a[0], a[1], a[2]), q = P(b[0], b[1], b[2]); c.save(); c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; if (glow) { c.shadowColor = col; c.shadowBlur = glow; } c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); c.stroke(); c.restore(); }
  function neon(c, a, b, col, w) { const s = V.s; c.globalAlpha = 0.25; line3(c, a, b, col, w * 3.2 * s, 0); c.globalAlpha = 1; line3(c, a, b, col, w * s, 36 * s); line3(c, a, b, '#fff', w * 0.35 * s, 8 * s); }
  function seeded(n) { let x = Math.sin(n * 91.7) * 43758.5453; return x - Math.floor(x); }
  function crowd(c, T, BZ, SX) {
    if (!T.crowd) return;
    for (let row = 0; row < 3; row++) {
      const z = BZ - 0.4 - row * 0.55, yb = 0.9 + row * 0.5;
      poly(c, [[-SX, yb - 0.5, z + 0.3], [SX, yb - 0.5, z + 0.3], [SX, yb, z], [-SX, yb, z]], T.crowdCol[row % 2]);
      const step = 0.36 / T.crowd;
      for (let x = -SX + 0.2; x < SX; x += step) {
        if (seeded(x * 13 + row) > 0.55 + 0.3 * T.crowd) continue;
        const j = (seeded(x * 7 + row * 3) - 0.5) * 0.12, h = P(x + j, yb + 0.42 + j, z - 0.05), r = 0.13 * V.F / h[2];
        c.fillStyle = '#0a0720'; c.beginPath(); c.arc(h[0], h[1], r, 0, 7); c.fill();
        c.beginPath(); c.ellipse(h[0], h[1] + r * 2.1, r * 1.6, r * 1.3, 0, Math.PI, 0); c.fill();
        const rim = T.strips ? T.strips[(Math.floor(x * 3) % T.strips.length + T.strips.length) % T.strips.length].c : '#fff';
        c.globalAlpha = 0.4; c.strokeStyle = rim; c.lineWidth = 2 * V.s; c.beginPath(); c.arc(h[0], h[1], r, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); c.globalAlpha = 1;
        if (seeded(x * 17 + row) > 0.94) { c.fillStyle = 'rgba(255,255,255,.9)'; c.shadowColor = '#fff'; c.shadowBlur = 16 * V.s; c.fillRect(h[0] + r * 1.2, h[1] - r * 1.5, r * 0.5, r * 0.8); c.shadowBlur = 0; }
      }
    }
  }
  function signText(c, text, x, y, z, size, col, glow) {
    const p = P(x, y, z); c.save(); c.font = `${size * V.F / p[2]}px TDD`; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillStyle = col; if (glow) { c.shadowColor = col; c.shadowBlur = 50 * V.s; c.fillText(text, p[0], p[1]); c.shadowBlur = 16 * V.s; }
    c.fillText(text, p[0], p[1]); c.restore();
  }
  function cone(c, x, z, col, alpha, top) {
    const t = P(x, top, z), b1 = P(x - 1.5, TY, z - 0.4), b2 = P(x + 1.5, TY, z - 0.4);
    const g = c.createLinearGradient(0, t[1], 0, b1[1]); g.addColorStop(0, `rgba(${col},${alpha})`); g.addColorStop(1, `rgba(${col},0)`);
    c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = g; c.beginPath(); c.moveTo(t[0] - 8 * V.s, t[1]); c.lineTo(t[0] + 8 * V.s, t[1]); c.lineTo(b2[0], b2[1]); c.lineTo(b1[0], b1[1]); c.closePath(); c.fill();
    c.fillStyle = `rgb(${col})`; c.shadowColor = `rgb(${col})`; c.shadowBlur = 50 * V.s; c.beginPath(); c.ellipse(t[0], t[1], 22 * V.s, 8 * V.s, 0, 0, 7); c.fill(); c.restore();
  }
  function paintRoom(c, T) {
    const W = V.W, H = V.H, s = V.s;
    if (T.kind === 'indoor') {
      const BZ = 7.5, SX = 5.4, CY = 4.4;
      c.fillStyle = grad(c, 0, H, [[0, T.bg[0]], [1, T.bg[1]]]); c.fillRect(0, 0, W, H);
      poly(c, [[-SX, 0, BZ], [SX, 0, BZ], [SX, CY, BZ], [-SX, CY, BZ]], grad(c, P(0, CY, BZ)[1], P(0, 0, BZ)[1], [[0, T.wall[0]], [1, T.wall[1]]]));
      poly(c, [[-SX, 0, -4], [-SX, 0, BZ], [-SX, CY, BZ], [-SX, CY, -4]], T.side); poly(c, [[SX, 0, -4], [SX, 0, BZ], [SX, CY, BZ], [SX, CY, -4]], T.side);
      poly(c, [[-SX, CY, -4], [SX, CY, -4], [SX, CY, BZ], [-SX, CY, BZ]], T.bg[0]);
      poly(c, [[-SX, 0, -4], [SX, 0, -4], [SX, 0, BZ], [-SX, 0, BZ]], grad(c, P(0, 0, BZ)[1], H, [[0, T.floor[0]], [1, T.floor[1]]]));
      if (T.planks) for (let x = -SX; x < SX; x += 0.35) line3(c, [x, 0.001, -4], [x, 0.001, BZ], 'rgba(0,0,0,.22)', 1.5 * s);
      if (T.court) { poly(c, [[-2.6, 0.002, -3.4], [2.6, 0.002, -3.4], [2.6, 0.002, 4.2], [-2.6, 0.002, 4.2]], '#3a1430'); [[-2.6, -3.4, 2.6, -3.4], [2.6, -3.4, 2.6, 4.2], [2.6, 4.2, -2.6, 4.2], [-2.6, 4.2, -2.6, -3.4]].forEach(l => line3(c, [l[0], 0.003, l[1]], [l[2], 0.003, l[3]], 'rgba(255,255,255,.55)', 3 * s)); }
      else for (let z = -3; z < BZ; z += 1.2) line3(c, [-SX, 0.001, z], [SX, 0.001, z], 'rgba(150,120,255,.08)', 2 * s);
      crowd(c, T, BZ, SX);
      if (T.flood) { for (const x of [-3.6, -1.2, 1.2, 3.6]) { const p = P(x, 4.1, BZ - 0.3); c.save(); c.fillStyle = '#fff'; c.shadowColor = '#dfe9ff'; c.shadowBlur = 60 * s; c.beginPath(); c.roundRect(p[0] - 40 * s, p[1] - 12 * s, 80 * s, 24 * s, 6 * s); c.fill(); c.restore(); } }
      (T.strips || []).forEach(st => neon(c, [-SX + 0.3, st.y, BZ - 0.01], [SX - 0.3, st.y, BZ - 0.01], st.c, 6));
      if (T.sideNeon) T.sideNeon.forEach((col, k) => { const x = k ? SX - 0.01 : -SX + 0.01; neon(c, [x, 3.2, BZ], [x, 3.2, -1.6], col, 6); neon(c, [x, 0.05, BZ], [x, 0.05, -1.6], col, 4); });
      if (T.led) { poly(c, [[-SX + 0.2, 0.5, BZ - 0.6], [SX - 0.2, 0.5, BZ - 0.6], [SX - 0.2, 1.1, BZ - 0.6], [-SX + 0.2, 1.1, BZ - 0.6]], '#05081a'); for (let k = -2; k <= 2; k++) signText(c, T.led, k * 2.2, 0.8, BZ - 0.62, 0.3, k % 2 ? '#ff3d5a' : '#ffffff', true); }
      if (T.sign) signText(c, T.sign, 0, 2.42, BZ - 0.02, 0.5, T.signCol, true);
      cone(c, -1.1, 1.8, T.cone, 0.2, CY); cone(c, 1.1, 1.8, T.cone, 0.2, CY); cone(c, 0, -0.7, T.cone, 0.12, CY);
    } else {
      const hz = P(0, 0, 60)[1];
      c.fillStyle = grad(c, 0, hz, [[0, T.sky[0]], [1, T.sky[1]]]); c.fillRect(0, 0, W, hz + 2);
      if (T.sun) { const sx = W * T.sun.x, sy = hz * T.sun.y + hz * 0.25, r = T.sun.r * s; const g = c.createRadialGradient(sx, sy, 0, sx, sy, r * 4); g.addColorStop(0, `rgba(${T.sun.c},1)`); g.addColorStop(0.25, `rgba(${T.sun.c},.6)`); g.addColorStop(1, `rgba(${T.sun.c},0)`); c.fillStyle = g; c.fillRect(0, 0, W, hz); c.fillStyle = `rgb(${T.sun.c})`; c.beginPath(); c.arc(sx, sy, r, 0, 7); c.fill(); }
      if (T.scene === 'city') { for (let i = 0; i < 160; i++) { c.fillStyle = `rgba(255,255,255,${seeded(i) * 0.7})`; c.fillRect(seeded(i + 3) * W, seeded(i + 7) * hz * 0.6, 2 * s, 2 * s); } }
      if (T.scene === 'sea') {
        const shore = P(0, 0, 14)[1]; c.fillStyle = grad(c, hz, shore, [[0, '#2a9fd0'], [1, '#1677a8']]); c.fillRect(0, hz, W, shore - hz);
        for (let i = 0; i < 90; i++) { const y = hz + (shore - hz) * seeded(i + 11); c.fillStyle = 'rgba(255,255,255,.55)'; c.fillRect(seeded(i) * W, y, (10 + 30 * seeded(i + 2)) * s, 2 * s); }
      }
      if (T.scene === 'pyramids') { c.fillStyle = '#6b3a3a'; [[-14, 7], [-6, 5], [10, 9], [20, 6]].forEach(([x, h]) => { const z = 45, a = P(x - h, 0, z), b = P(x, h, z), d = P(x + h, 0, z); c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(d[0], d[1]); c.fill(); }); c.fillStyle = '#4a2430'; for (let x = -30; x < 30; x += 1.6) { const h = 1.5 + seeded(x) * 4, p1 = P(x, 0, 25), p2 = P(x + 1.4, h, 25); c.fillRect(p1[0], p2[1], p2[0] - p1[0], p1[1] - p2[1]); } }
      if (T.scene === 'city') {
        for (let layer = 0; layer < 2; layer++) { const z = layer ? 22 : 34; for (let x = -40; x < 40; x += 2.2) { const h = 6 + seeded(x + layer * 9) * (layer ? 14 : 22), a = P(x, 0, z), b = P(x + 2, h, z); c.fillStyle = layer ? '#0c0a26' : '#130f35'; c.fillRect(a[0], b[1], b[0] - a[0], a[1] - b[1]);
          for (let wy = 1; wy < h - 0.5; wy += 1.1) for (let wx = 0.3; wx < 1.8; wx += 0.55) { if (seeded(x * 3 + wy * 7 + wx + layer) > 0.62) { const q = P(x + wx, wy, z); c.fillStyle = seeded(wy + x) > 0.8 ? 'rgba(255,61,200,.85)' : 'rgba(255,220,150,.75)'; c.fillRect(q[0], q[1], 3 * s, 4 * s); } } } }
        [['#ff3dc8', -8, 9], ['#2de2ff', 7, 11], ['#ffd23f', 16, 7]].forEach(([col, x, y]) => neon(c, [x - 1.5, y, 21.8], [x + 1.5, y, 21.8], col, 5));
      }
      const near = H;
      c.fillStyle = grad(c, hz, near, [[0, T.horizonCol], [0.05, T.ground[0]], [1, T.ground[1]]]); poly(c, [[-40, 0, -4], [40, 0, -4], [40, 0, 60], [-40, 0, 60]], c.fillStyle);
      if (T.scene === 'sea') { for (let i = 0; i < 260; i++) { const x = (seeded(i) - 0.5) * 12, z = -3 + seeded(i + 5) * 14, p = P(x, 0, z); c.fillStyle = 'rgba(120,80,30,.12)'; c.fillRect(p[0], p[1], 3 * s, 2 * s); } }
      if (T.gloss) { for (let z = -3; z < 20; z += 1) line3(c, [-12, 0.001, z], [12, 0.001, z], 'rgba(255,61,200,.07)', 2 * s); }
      // board behind the table
      // low courtside boards (no text) and a big title banner up high, clear of the opponent's bat
      poly(c, [[-4, 0, 5.2], [4, 0, 5.2], [4, 0.45, 5.2], [-4, 0.45, 5.2]], T.board || '#222');
      { const y0 = 2.45, y1 = 3.15, z = 11; poly(c, [[-4.2, y0, z], [4.2, y0, z], [4.2, y1, z], [-4.2, y1, z]], T.board || '#222'); line3(c, [-4.2, y0, z], [4.2, y0, z], T.signCol, 3 * s, 12 * s); line3(c, [-4.2, y1, z], [4.2, y1, z], T.signCol, 3 * s, 12 * s);
        [-3.6, 3.6].forEach(x => line3(c, [x, 0, z + 0.05], [x, y0, z + 0.05], 'rgba(20,20,30,.85)', 6 * s));
        signText(c, T.sign, 0, (y0 + y1) / 2, z - 0.02, 0.48, T.signCol, T.scene !== 'sea'); }
      if (T.bunting) { for (let k = -1; k <= 1; k += 2) { line3(c, [k * 3.6, 0, 5], [k * 3.6, 2.05, 5], '#ddd', 5 * s); } let prev = null; for (let i = 0; i <= 24; i++) { const t = i / 24, x = -3.6 + 7.2 * t, y = 2.0 - Math.sin(t * Math.PI) * 0.4, p = P(x, y, 5); if (prev) { c.strokeStyle = '#fff'; c.lineWidth = 2 * s; c.beginPath(); c.moveTo(prev[0], prev[1]); c.lineTo(p[0], p[1]); c.stroke(); } if (i % 1 === 0 && i < 24) { const q = P(x + 0.15, y - 0.28, 5); c.fillStyle = ['#e8412c', '#ffd23f', '#14805a', '#2a63f0'][i % 4]; c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(P(x + 0.3, y - Math.sin((t + 0.04) * Math.PI) * 0.0, 5)[0], p[1]); c.lineTo(q[0], q[1]); c.fill(); } prev = p; } }
      if (T.lights) { let prev = null; for (let i = 0; i <= 40; i++) { const t = i / 40, x = -4 + 8 * t, y = 2.15 - Math.sin(t * Math.PI) * 0.45, p = P(x, y, 4.5); if (prev) { c.strokeStyle = 'rgba(30,10,20,.8)'; c.lineWidth = 2 * s; c.beginPath(); c.moveTo(prev[0], prev[1]); c.lineTo(p[0], p[1]); c.stroke(); } c.save(); c.fillStyle = '#ffe3a0'; c.shadowColor = '#ffb347'; c.shadowBlur = 18 * s; c.beginPath(); c.arc(p[0], p[1] + 4 * s, 5 * s, 0, 7); c.fill(); c.restore(); prev = p; } }
    }
    // light pool under the table
    const p = P(0, 0, 0.3), g = c.createRadialGradient(p[0], p[1], 10, p[0], p[1], 620 * s);
    g.addColorStop(0, `rgba(${T.pool},.28)`); g.addColorStop(1, `rgba(${T.pool},0)`);
    c.save(); c.globalCompositeOperation = 'lighter'; c.fillStyle = g; c.beginPath(); c.ellipse(p[0], p[1], 620 * s, 240 * s, 0, 0, 7); c.fill(); c.restore();
    const vg = c.createRadialGradient(V.W / 2, V.H * 0.45, V.H * 0.25, V.W / 2, V.H * 0.5, V.H * 0.8); vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,.6)'); c.fillStyle = vg; c.fillRect(0, 0, V.W, V.H);
  }
  function paintTable(c, T) {
    const s = V.s;
    c.save(); c.globalAlpha = 0.25; c.filter = `blur(${Math.round(6 * s)}px)`; poly(c, [[-TW, 0, -TL], [TW, 0, -TL], [TW, 0, TL], [-TW, 0, TL]], 'rgba(0,0,0,.9)'); c.restore();
    [[-TW + 0.15, -TL + 0.25], [TW - 0.15, -TL + 0.25], [-TW + 0.15, TL - 0.25], [TW - 0.15, TL - 0.25]].forEach(([x, z]) => poly(c, [[x - 0.03, 0, z], [x + 0.03, 0, z], [x + 0.03, TY, z], [x - 0.03, TY, z]], '#0a0a14'));
    poly(c, [[-TW, TY - 0.05, -TL], [TW, TY - 0.05, -TL], [TW, TY, -TL], [-TW, TY, -TL]], T.table[2]);
    poly(c, [[TW, TY - 0.05, -TL], [TW, TY - 0.05, TL], [TW, TY, TL], [TW, TY, -TL]], T.table[2]); poly(c, [[-TW, TY - 0.05, -TL], [-TW, TY - 0.05, TL], [-TW, TY, TL], [-TW, TY, -TL]], T.table[2]);
    poly(c, [[-TW, TY, -TL], [TW, TY, -TL], [TW, TY, TL], [-TW, TY, TL]], grad(c, P(0, TY, TL)[1], P(0, TY, -TL)[1], [[0, T.table[0]], [0.55, T.table[1]], [1, T.table[2]]]));
    c.save(); c.globalCompositeOperation = 'lighter';
    [-0.35, 0.35].forEach(x => poly(c, [[x - 0.12, TY, -TL], [x + 0.12, TY, -TL], [x + 0.05, TY, TL], [x - 0.05, TY, TL]], 'rgba(255,255,255,.08)'));
    const q = P(0, TY, 0.6), g = c.createRadialGradient(q[0], q[1], 5, q[0], q[1], 300 * s); g.addColorStop(0, 'rgba(255,255,255,.2)'); g.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = g; c.beginPath(); c.ellipse(q[0], q[1], 300 * s, 90 * s, 0, 0, 7); c.fill();
    c.restore();
    const L = (a, b, w) => { const p = P(a[0], a[1], a[2]), q2 = P(b[0], b[1], b[2]); c.strokeStyle = '#f4f6ff'; c.lineWidth = w * s; c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q2[0], q2[1]); c.stroke(); };
    const e = 0.012; L([-TW + e, TY, -TL + e], [TW - e, TY, -TL + e], 7); L([-TW + e, TY, TL - e], [TW - e, TY, TL - e], 3.5); L([-TW + e, TY, -TL], [-TW + e, TY, TL], 5); L([TW - e, TY, -TL], [TW - e, TY, TL], 5); L([0, TY, -TL], [0, TY, TL], 2.5);
    const nx = TW + 0.15, a = P(-nx, TY, 0), b = P(nx, TY, 0), ta = P(-nx, TY + NET_H, 0), tb = P(nx, TY + NET_H, 0);
    c.fillStyle = 'rgba(15,15,35,.5)'; c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.lineTo(tb[0], tb[1]); c.lineTo(ta[0], ta[1]); c.closePath(); c.fill();
    c.strokeStyle = 'rgba(255,255,255,.18)'; c.lineWidth = 1; for (let i = 0; i <= 60; i++) { const x = -nx + 2 * nx * i / 60, p = P(x, TY, 0), q2 = P(x, TY + NET_H, 0); c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q2[0], q2[1]); c.stroke(); }
    for (let j = 1; j < 6; j++) { const y = TY + NET_H * j / 6, p = P(-nx, y, 0), q2 = P(nx, y, 0); c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q2[0], q2[1]); c.stroke(); }
    c.strokeStyle = '#f4f6ff'; c.lineWidth = 6 * s; c.beginPath(); c.moveTo(ta[0], ta[1]); c.lineTo(tb[0], tb[1]); c.stroke();
    [-nx, nx].forEach(x => { const p = P(x, TY - 0.03, 0), q2 = P(x, TY + NET_H + 0.01, 0); c.strokeStyle = '#c9ced9'; c.lineWidth = 8 * s; c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q2[0], q2[1]); c.stroke(); });
  }

  // ---------------- drawing dynamic things ----------------
  function drawPaddle(c, x, y, r, rot, rubber, glow, alpha) {
    c.save(); c.globalAlpha = alpha ?? 1; c.translate(x, y); c.rotate(rot);
    c.fillStyle = '#2b1b10'; c.beginPath(); c.roundRect(-r * 0.19, r * 0.72, r * 0.38, r * 1.2, r * 0.1); c.fill();
    c.fillStyle = '#e3bd85'; c.beginPath(); c.roundRect(-r * 0.13, r * 0.76, r * 0.26, r * 1.1, r * 0.08); c.fill();
    c.fillStyle = 'rgba(120,70,30,.5)'; c.fillRect(-r * 0.02, r * 0.8, r * 0.04, r * 1.0);
    c.shadowColor = glow; c.shadowBlur = r * 0.55; c.fillStyle = '#16161c'; c.beginPath(); c.ellipse(0, 0, r * 1.04, r * 0.99, 0, 0, 7); c.fill(); c.shadowBlur = 0;
    const g = c.createRadialGradient(-r * 0.3, -r * 0.35, r * 0.1, 0, 0, r); g.addColorStop(0, rubber[0]); g.addColorStop(1, rubber[1]);
    c.fillStyle = g; c.beginPath(); c.ellipse(0, 0, r * 0.97, r * 0.92, 0, 0, 7); c.fill();
    c.globalAlpha = (alpha ?? 1) * 0.1; c.fillStyle = '#fff'; for (let i = 0; i < 50; i++) { const a = i * 2.4, rr = r * 0.85 * Math.sqrt(i / 50); c.beginPath(); c.arc(Math.cos(a) * rr, Math.sin(a) * rr, r * 0.025, 0, 7); c.fill(); }
    c.restore();
  }

  // ---------------- physics & match ----------------
  function solveShot(p0, tx, tz, speedH, sT, sS, clearNet) {
    const ay = -(G + K_TOP * sT), ax = K_SIDE * sS;
    const dist = Math.hypot(tx - p0.x, tz - p0.z);
    let T = dist / speedH, v = null;
    for (let k = 0; k < 16; k++) {
      const vx = (tx - p0.x - 0.5 * ax * T * T) / T, vz = (tz - p0.z) / T, vy = (TY + R - p0.y - 0.5 * ay * T * T) / T;
      v = { vx, vy, vz };
      if (!clearNet) break;
      const tn = (0 - p0.z) / vz; if (tn <= 0 || tn >= T) break;
      const yn = p0.y + vy * tn + 0.5 * ay * tn * tn;
      if (yn > TY + NET_H + 0.035) break;
      T *= 1.08;
    }
    return v;
  }

  class Match {
    constructor(opts) {
      this.o = opts; // {theme, bat:{speed,spin,control,rubber}, ai:{...}, bestOf, names, on: callbacks}
      this.score = [0, 0]; this.games = [0, 0]; this.server = Math.random() < 0.5 ? 0 : 1; this.gameStartServer = this.server;
      this.ball = { x: 0, y: 1, z: 0, vx: 0, vy: 0, vz: 0, sT: 0, sS: 0 };
      this.state = 'intro'; this.t = 0; this.stateT = 0; this.trail = []; this.fx = [];
      this.pad = { sx: 0, sy: 0, x: 0, y: 1.0, vx: 0, vy: 0, rot: 0, hist: [], down: false };
      this.ai = { x: 0, y: 1.0, tx: 0, ty: 1.0, swing: 0 };
      this.stats = { rally: 0, longest: 0, winners: 0, errors: 0, perfects: 0, smashes: 0, aces: 0, pointsWon: 0, pointsLost: 0, maxDeficit: 0 };
      this.cool = {}; this.comebackSaid = false; this.paused = false; this.shake = 0;
    }
    get on() { return this.o.on || {}; }
    emit(name, a, b) { const f = this.on[name]; if (f) f(a, b); }
    setPointer(sx, sy, down) {
      const p = this.pad, now = performance.now();
      if (!down && p.down) { p.upAt = now; p.tapLen = now - (p.downAt || now); p.tapMove = Math.hypot(sx - (p.dx || sx), sy - (p.dy || sy)) / V.dpr; }
      if (down && !p.down) { p.downAt = now; p.dx = sx; p.dy = sy; }
      p.sx = sx; p.sy = sy; p.down = down;
      p.hist.push({ t: now, x: sx, y: sy }); while (p.hist.length && now - p.hist[0].t > 220) p.hist.shift();
    }
    swipe() {
      const h = this.pad.hist, now = performance.now(); if (h.length < 2) return { vx: 0, vy: 0, speed: 0, curve: 0 };
      const recent = h.filter(e => now - e.t < 110); const a = recent.length >= 2 ? recent[0] : h[Math.max(0, h.length - 3)], b = h[h.length - 1];
      const dt = Math.max(16, b.t - a.t) / 1000; const vx = (b.x - a.x) / dt / V.dpr, vy = (b.y - a.y) / dt / V.dpr;
      let curve = 0; if (h.length >= 5) { const m = h[Math.floor(h.length / 2)], f = h[0]; const d1x = m.x - f.x, d1y = m.y - f.y, d2x = b.x - m.x, d2y = b.y - m.y; const n = Math.hypot(d1x, d1y) * Math.hypot(d2x, d2y); if (n > 1) curve = (d1x * d2y - d1y * d2x) / n; }
      if (now - b.t > 140) return { vx: 0, vy: 0, speed: 0, curve: 0 };
      return { vx, vy, speed: Math.hypot(vx, vy), curve };
    }
    playerPaddleScreen() { const p = this.pad, q = P(0, p.y, HIT_P); return { x: p.sx, y: q[1], depth: q[2] }; }
    // ---- serving ----
    startPoint() {
      this.state = 'serve'; this.stateT = 0; this.stats.rally = 0; this.trail = []; this.lastHitter = null; this.bounceSide = null; this.bounces = 0; this.decided = false;
      const b = this.ball; b.sT = 0; b.sS = 0; b.vx = b.vy = b.vz = 0;
      const sp = this.isGamePoint(); if (sp) this.emit('call', sp);
      if (this.server === 0) { b.x = 0; b.y = TY + 0.32; b.z = HIT_P + 0.05; this.emit('hint', 'SWIPE UP TO SERVE'); }
      else { b.x = this.ai.x; b.y = TY + 0.3; b.z = HIT_A - 0.05; }
    }
    isGamePoint() {
      const [a, c] = this.score, need = Math.ceil(this.o.bestOf / 2);
      const pGame = a >= 10 && a > c, aGame = c >= 10 && c > a;
      if (pGame) return this.games[0] === need - 1 ? 'matchpoint' : 'setpoint';
      if (aGame) return this.games[1] === need - 1 ? 'matchpoint' : 'setpoint';
      return null;
    }
    hit(side, shot) {
      const b = this.ball; b.vx = shot.vx; b.vy = shot.vy; b.vz = shot.vz; b.sT = shot.sT || 0; b.sS = shot.sS || 0;
      this.lastHitter = side; this.sinceHit = 0; this.bounces = 0; this.bounceSide = null; this.stats.rally++;
      this.stats.longest = Math.max(this.stats.longest, this.stats.rally);
      this.emit('sfx', 'paddle', shot.power || 0.5);
      if (side === 1) { this.ai.swing = 1; this.predictForAI = null; }
      else this.planAI();
    }
    serve(side, sw) {
      const b = this.ball; const ai = this.o.ai, bat = this.o.bat;
      let tx, tz, speed, sT, sS, power;
      if (side === 0) {
        power = cl((sw.speed - 150) / 1500, 0.15, 1);
        tx = cl(sw.vx / 1500, -1, 1) * 0.55; tz = 0.75 + power * 0.45; speed = lerp(4.0, 7.2, power) * (0.85 + bat.speed / 300);
        sT = cl(-sw.vy / 1800, -0.6, 1) * (0.5 + bat.spin / 150); sS = cl(sw.curve, -1, 1) * bat.spin / 120;
        const err = (1 - bat.control / 100) * 0.22 * power; tz += rnd(-err, err); tx += rnd(-err, err);
      } else {
        power = rnd(0.3, 0.6) + ai.power * 0.3; tx = rnd(-0.55, 0.55); tz = -(0.8 + rnd(0, 0.45)); speed = lerp(4.0, 6.8, power);
        sT = ai.spin * rnd(-0.5, 0.9); sS = ai.spin * rnd(-0.6, 0.6);
      }
      const v = solveShot(b, tx, tz, speed, sT, sS, true);
      this.state = 'rally'; this.serveBy = side;
      this.hit(side, Object.assign(v, { sT, sS, power }));
      this.emit('hint', '');
    }
    planAI() {
      // simulate the ball forward to find where it crosses the AI hitting plane after a valid bounce
      const s = Object.assign({}, this.ball); let bounced = false, t = 0;
      const dt = 1 / 240;
      while (t < 3) {
        const ay = -(G + K_TOP * s.sT), ax = K_SIDE * s.sS;
        s.vx += ax * dt; s.vy += ay * dt; s.x += s.vx * dt; s.y += s.vy * dt; s.z += s.vz * dt; t += dt;
        if (s.y <= TY + R && s.vy < 0 && Math.abs(s.x) <= TW && Math.abs(s.z) <= TL) { s.y = TY + R; s.vy = -s.vy * 0.86; s.vz += s.sT * 0.6 * Math.sign(s.vz); s.vx += s.sS * 0.3; s.sT *= 0.6; s.sS *= 0.6; if (s.z > 0) bounced = true; }
        if (s.z >= HIT_A && bounced) break;
        if (s.y < 0) break;
      }
      const ai = this.o.ai;
      const errX = (1 - ai.skill) * rnd(-0.12, 0.12);
      this.ai.tx = cl(s.x + errX, -1.3, 1.3); this.ai.ty = cl(s.y, TY + 0.05, 1.6);
      this.ai.react = 0.05 + (1 - ai.skill) * 0.16;
    }
    aiShot() {
      const ai = this.o.ai, b = this.ball, pressure = cl((Math.abs(b.vz) - 5) / 6, 0, 1) + Math.abs(b.sT) * 0.3;
      const errP = ai.error * (0.6 + pressure);
      const playerX = worldXAt(this.playerPaddleScreen().x, 0.95, HIT_P);
      let tx = playerX > 0 ? rnd(-0.65, -0.1) : rnd(0.1, 0.65); if (Math.random() > ai.aim) tx = rnd(-0.6, 0.6);
      let tz = -rnd(0.55, 1.2), power = cl(ai.power * rnd(0.6, 1.1) + (b.y > TY + 0.35 ? 0.3 : 0), 0.2, 1);
      let speed = lerp(4.2, 9.2, power), sT = ai.spin * rnd(-0.4, 1), sS = ai.spin * rnd(-0.7, 0.7), clear = true;
      if (Math.random() < errP) {
        const k = Math.random();
        if (k < 0.4) { clear = false; tz = -rnd(0.1, 0.3); speed *= 1.25; } else if (k < 0.75) tz = -(TL + rnd(0.15, 0.5)); else tx = Math.sign(tx || 1) * (TW + rnd(0.1, 0.35));
      }
      const v = solveShot(b, tx, tz, speed, sT, sS, clear);
      this.hit(1, Object.assign(v, { sT, sS, power }));
    }
    playerShot() {
      const b = this.ball, bat = this.o.bat, sw = this.swipe();
      const power = cl((sw.speed - 120) / 1500, 0, 1);
      const padX = worldXAt(this.playerPaddleScreen().x, b.y, HIT_P);
      let tx, tz, speed, sT, sS, kind = '';
      if (power < 0.08) { tx = cl(-padX * 0.2 + rnd(-0.15, 0.15), -0.6, 0.6); tz = 0.65; speed = 3.6; sT = -0.25; sS = 0; }
      else {
        tx = cl(sw.vx / 1400, -1, 1) * 0.62; tz = 0.4 + 0.85 * power * rnd(0.75, 1);
        speed = lerp(4.4, 9.6, power) * (0.82 + bat.speed / 280);
        sT = cl(-sw.vy / 1500, -0.6, 1.1) * (0.55 + bat.spin / 140); sS = cl(sw.curve * 1.4, -1, 1) * (bat.spin / 110);
        const err = (1 - bat.control / 100) * 0.3 * power * power; tz += rnd(-err, err * 1.3); tx += rnd(-err, err);
        if (b.y > TY + 0.3 && power > 0.7) { speed *= 1.22; sT = Math.max(sT, 0.2); kind = 'smash'; }
      }
      const off = Math.abs(b.x - padX);
      if (!kind && off < 0.07 && power > 0.5) kind = 'perfect';
      if (!kind && sT > 0.85) kind = 'topspin';
      const v = solveShot(b, tx, tz, speed, sT, sS, true);
      if (kind === 'smash') { this.stats.smashes++; this.shake = 0.35; this.fx.push({ k: 'spark', x: b.x, y: b.y, z: b.z, t: 0, big: true }); }
      if (kind === 'perfect') this.stats.perfects++;
      if (kind) this.callout(kind);
      this.fx.push({ k: 'spark', x: b.x, y: b.y, z: b.z, t: 0 });
      this.hit(0, Object.assign(v, { sT, sS, power }));
    }
    callout(k) { const now = this.t; if (this.cool[k] && now - this.cool[k] < 6) return; this.cool[k] = now; this.emit('call', k); }
    pointTo(side, reason) {
      if (this.decided) return; this.decided = true; this.state = 'dead'; this.stateT = 0;
      const rally = this.stats.rally;
      this.score[side]++;
      if (side === 0) { this.stats.pointsWon++; if (reason === 'winner') this.stats.winners++; }
      else { this.stats.pointsLost++; if (this.lastHitter === 0 && (reason === 'net' || reason === 'out' || reason === 'own')) this.stats.errors++; }
      const deficit = this.score[1] - this.score[0]; this.stats.maxDeficit = Math.max(this.stats.maxDeficit, deficit);
      let call = null;
      if (reason === 'net') call = 'net'; else if (reason === 'out') call = 'out';
      if (side === 0 && rally === 1 && this.serveBy === 0 && reason === 'winner') { call = 'ace'; this.stats.aces++; }
      else if (side === 0 && reason === 'winner' && rally >= 7) call = 'greatshot';
      if (side === 0 && !this.comebackSaid && this.stats.maxDeficit >= 3 && this.score[0] >= this.score[1] && this.score[0] >= 5) { call = 'comeback'; this.comebackSaid = true; }
      this.emit('point', side, { reason, rally, call, by: this.lastHitter });
      if (call) this.emit('call', call);
      // game over?
      const [a, c] = this.score;
      if ((a >= 11 || c >= 11) && Math.abs(a - c) >= 2) {
        const gw = a > c ? 0 : 1; this.games[gw]++;
        const need = Math.ceil(this.o.bestOf / 2);
        if (this.games[gw] >= need) { this.state = 'over'; this.winner = gw; setTimeout(() => this.emit('over', gw), 1600); return; }
        this.pendingGame = gw;
      }
      const total = a + c; const deuce = a >= 10 && c >= 10;
      if (!this.pendingGame && this.pendingGame !== 0) this.server = deuce ? 1 - this.server : (Math.floor(total / 2) % 2 === 0 ? this.gameStartServer : 1 - this.gameStartServer);
    }
    update(dtReal) {
      if (this.paused) return;
      const dt = Math.min(dtReal, 0.05) * TIME; this.t += dtReal; this.stateT += dtReal;
      // paddle follows finger
      const p = this.pad, ps = this.playerPaddleScreen();
      const tgtX = worldXAt(ps.x, 0.95, HIT_P);
      p.vx = (tgtX - p.x) / Math.max(dtReal, 0.001); p.x = tgtX;
      // height assist: the bat rises to meet the incoming ball
      const b0 = this.ball, incoming = this.state === 'rally' && this.lastHitter === 1 && b0.z < 0.4;
      const wantY = incoming ? TD_clampY(b0.y + (b0.vy || 0) * Math.max(0, (b0.z - HIT_P) / Math.max(2, -b0.vz || 2)) ) : (this.state === 'serve' && this.server === 0 ? b0.y : 0.98);
      p.y = lerp(p.y, wantY, Math.min(1, dtReal * 9));
      const sw = this.swipe(); p.rot = lerp(p.rot, cl(sw.vx / 3000, -0.6, 0.6) - 0.15, 0.25);
      // AI paddle
      const ai = this.ai, A = this.o.ai;
      this.sinceHit = (this.sinceHit || 0) + dtReal;
      if (this.state === 'rally' && this.lastHitter === 0 && this.sinceHit > (ai.react || 0.15)) {
        const maxV = A.speed * dtReal; ai.x += cl(ai.tx - ai.x, -maxV, maxV); ai.y += cl(ai.ty - ai.y, -maxV, maxV);
      } else if (this.state !== 'rally' || this.lastHitter === 1) { ai.x = lerp(ai.x, this.state === 'serve' && this.server === 1 ? 0 : 0, 0.02); ai.y = lerp(ai.y, 1.0, 0.03); }
      ai.swing = Math.max(0, ai.swing - dtReal * 3);
      this.shake = Math.max(0, this.shake - dtReal);
      if (this.state === 'intro') { if (this.stateT > 1.4) this.startPoint(); return; }
      if (this.state === 'serve') {
        const b = this.ball;
        if (this.server === 0) { b.x = cl(worldXAt(ps.x, TY + 0.3, HIT_P) * 0.6, -0.6, 0.6); b.y = TY + 0.3 + Math.abs(Math.sin(this.stateT * 3.2)) * 0.18; b.z = HIT_P + 0.05; if (this.stateT > 0.5 && sw.speed > 450 && sw.vy < -200) this.serve(0, sw);
          else if (this.stateT > 0.6 && this.pad.upAt && performance.now() - this.pad.upAt < 120 && this.pad.tapLen < 350 && this.pad.tapMove < 14) { this.pad.upAt = 0; this.serve(0, { speed: 700, vx: 0, vy: -650, curve: 0 }); } }
        else { b.x = ai.x; b.y = TY + 0.3 + Math.abs(Math.sin(this.stateT * 3.2)) * 0.18; b.z = HIT_A - 0.05; if (this.stateT > 1.3) this.serve(1); }
        return;
      }
      if (this.state === 'dead') {
        this.physics(dt, true);
        if (this.stateT > 1.6) {
          if (this.pendingGame !== undefined && this.pendingGame !== null) { const gw = this.pendingGame; this.pendingGame = null; this.score = [0, 0]; this.gameStartServer = 1 - this.gameStartServer; this.server = this.gameStartServer; this.comebackSaid = false; this.stats.maxDeficit = 0; this.emit('game', gw); this.state = 'intro'; this.stateT = -0.6; return; }
          this.startPoint();
        }
        return;
      }
      if (this.state === 'over') { this.physics(dt, true); return; }
      if (this.state === 'rally') { const steps = 4; for (let i = 0; i < steps && this.state === 'rally'; i++) this.physics(dt / steps, false); }
    }
    physics(dt, dead) {
      const b = this.ball, pz = b.z, py = b.y;
      const ay = -(G + K_TOP * b.sT), ax = K_SIDE * b.sS;
      b.vx += ax * dt; b.vy += ay * dt; b.x += b.vx * dt; b.y += b.vy * dt; b.z += b.vz * dt;
      if (!dead || this.trail.length) { this.trail.push([b.x, b.y, b.z]); if (this.trail.length > 12) this.trail.shift(); }
      // net
      if ((pz < 0) !== (b.z < 0) && Math.abs(b.x) < TW + 0.15) {
        const f = pz / (pz - b.z), yn = py + (b.y - py) * f;
        if (yn < TY + NET_H && yn > TY - 0.02) { b.z = pz > 0 ? 0.02 : -0.02; b.vz *= -0.15; b.vy *= 0.3; b.vx *= 0.5; this.emit('sfx', 'net', 0.6); if (!dead) this.pointTo(1 - this.lastHitter, 'net'); return; }
      }
      // table bounce
      if (b.y <= TY + R && py > TY + R - 0.001 && b.vy < 0 && Math.abs(b.x) <= TW && Math.abs(b.z) <= TL) {
        b.y = TY + R; const sp = Math.abs(b.vy); b.vy = -b.vy * 0.86; b.vz += b.sT * 0.6 * Math.sign(b.vz || 1); b.vx += b.sS * 0.3; b.sT *= 0.6; b.sS *= 0.6;
        this.emit('sfx', 'table', cl(sp / 5, 0.15, 1)); this.fx.push({ k: 'ring', x: b.x, z: b.z, t: 0 });
        if (!dead) {
          const side = b.z > 0 ? 1 : 0;
          if (side === this.lastHitter) { this.pointTo(1 - this.lastHitter, 'own'); return; }
          this.bounces++; this.bounceSide = side;
          if (this.bounces >= 2) { this.pointTo(this.lastHitter, 'winner'); return; }
        }
      }
      // floor
      if (b.y <= R && b.vy < 0) {
        const sp = Math.abs(b.vy); b.y = R; b.vy = -b.vy * 0.55; b.vz *= 0.7; b.vx *= 0.7;
        if (sp > 0.6) this.emit('sfx', 'floor', cl(sp / 5, 0.1, 1));
        if (!dead) { if (this.bounces >= 1) this.pointTo(this.lastHitter, 'winner'); else this.pointTo(1 - this.lastHitter, 'out'); return; }
      }
      if (dead) { if (Math.abs(b.vy) < 0.3 && b.y <= R + 0.001) { b.vx *= 0.96; b.vz *= 0.96; } return; }
      // player hitting plane
      if (this.lastHitter === 1 && pz > HIT_P && b.z <= HIT_P) {
        if (this.bounces === 1) {
          const padX = worldXAt(this.playerPaddleScreen().x, b.y, HIT_P);
          const reach = 0.24 + this.o.bat.control * 0.0012;
          if (Math.abs(b.x - padX) < reach && Math.abs(b.y - this.pad.y) < 0.32) { this.playerShot(); return; }
          this.emit('miss', 0);
        }
      }
      // AI hitting plane
      if (this.lastHitter === 0 && pz < HIT_A && b.z >= HIT_A && this.bounces === 1) {
        const A = this.o.ai, reach = A.reach;
        if (Math.abs(b.x - this.ai.x) < reach && b.y < TY + 1.0) { this.ai.x = lerp(this.ai.x, b.x, 0.6); this.ai.y = b.y; this.aiShot(); return; }
      }
      // ball flew way past without bounce/floor
      if (b.z < -6 || b.z > 7) this.pointTo(this.bounces >= 1 ? this.lastHitter : 1 - this.lastHitter, this.bounces >= 1 ? 'winner' : 'out');
    }
    // ---- render ----
    render(ctx, layers) {
      const s = V.s, b = this.ball;
      ctx.save();
      if (this.shake > 0) ctx.translate(rnd(-1, 1) * 10 * s * this.shake, rnd(-1, 1) * 10 * s * this.shake);
      ctx.drawImage(layers.room, 0, 0);
      const hidden = b.y < TY && b.z > -TL;
      this.drawAI(ctx);
      if (hidden) this.drawBall(ctx);
      ctx.drawImage(layers.table, 0, 0);
      // fx on table
      this.fx = this.fx.filter(f => (f.t += 1 / 60) < 0.5);
      for (const f of this.fx) {
        if (f.k === 'ring') { const p = P(f.x, TY + 0.001, f.z), k = f.t / 0.5; if (p[2] < 0.35) continue; ctx.save(); ctx.strokeStyle = `rgba(255,255,255,${0.7 * (1 - k)})`; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.ellipse(p[0], p[1], (10 + 70 * k) * s * 1.6 / p[2] * 3, (4 + 26 * k) * s * 1.6 / p[2] * 3, 0, 0, 7); ctx.stroke(); ctx.restore(); }
      }
      if (!hidden) this.drawBall(ctx);
      for (const f of this.fx) if (f.k === 'spark') { const p = P(f.x, f.y, f.z), k = f.t / 0.5; if (p[2] < 0.35) continue; const n = f.big ? 14 : 8, L = (f.big ? 90 : 50) * s; ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.strokeStyle = `rgba(255,220,140,${1 - k})`; ctx.lineWidth = 3 * s; for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2; ctx.beginPath(); ctx.moveTo(p[0] + Math.cos(a) * L * k * 0.4, p[1] + Math.sin(a) * L * k * 0.4); ctx.lineTo(p[0] + Math.cos(a) * L * (0.3 + k), p[1] + Math.sin(a) * L * (0.3 + k)); ctx.stroke(); } ctx.restore(); }
      // player paddle
      const ps = this.playerPaddleScreen(), bat = this.o.bat;
      const pr = Math.max(46 * s, 0.085 * V.F / ps.depth * 1.55);
      const sh = P(TD_wx(ps.x, ps.depth), 0.002, HIT_P); ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.28)'; ctx.beginPath(); ctx.ellipse(sh[0], sh[1], pr * 0.9, pr * 0.22, 0, 0, 7); ctx.fill(); ctx.restore();
      drawPaddle(ctx, ps.x, ps.y, pr, this.pad.rot, bat.rubber, bat.glow || 'rgba(255,60,90,.6)', 0.94);
      ctx.restore();
    }
    drawAI(ctx) {
      const a = this.ai, A = this.o.ai, p = P(a.x, a.y, HIT_A + 0.05), r = 0.085 * V.F / p[2] * 1.7;
      const sh = P(a.x, 0.001, HIT_A + 0.05);
      ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.beginPath(); ctx.ellipse(sh[0], sh[1], r * 1.2, r * 0.35, 0, 0, 7); ctx.fill(); ctx.restore();
      drawPaddle(ctx, p[0], p[1], r, -0.25 + a.swing * 0.8 * (a.x > 0 ? -1 : 1), A.rubber, A.glow, 1);
    }
    drawBall(ctx) {
      const b = this.ball, s = V.s;
      if (P(b.x, b.y, b.z)[2] < 0.35) return;
      // shadow
      const over = Math.abs(b.x) <= TW && Math.abs(b.z) <= TL && b.y >= TY;
      const sy = over ? TY + 0.002 : 0.002, sp = P(b.x, sy, b.z), hgt = b.y - sy;
      ctx.save(); ctx.fillStyle = `rgba(0,0,25,${cl(0.5 - hgt * 0.5, 0.1, 0.5)})`; ctx.beginPath(); ctx.ellipse(sp[0], sp[1], 0.03 * V.F / sp[2] * 1.8, 0.012 * V.F / sp[2] * 1.8, 0, 0, 7); ctx.fill(); ctx.restore();
      // trail
      if (this.trail.length > 1) { ctx.save(); const tr = this.trail.filter(t => P(t[0], t[1], t[2])[2] > 0.35); if (tr.length < this.trail.length) this.trail = tr; ctx.globalCompositeOperation = 'lighter'; ctx.lineCap = 'round'; for (let i = 1; i < this.trail.length; i++) { const a = P(...this.trail[i - 1]), c = P(...this.trail[i]), k = i / this.trail.length; ctx.strokeStyle = `rgba(255,190,90,${k * 0.5})`; ctx.lineWidth = (2 + k * 0.03 * V.F / c[2]) * 1.0; ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(c[0], c[1]); ctx.stroke(); } ctx.restore(); }
      const p = P(b.x, b.y, b.z), r = Math.max(7 * s, R * V.F / p[2] * 2.3);
      ctx.save(); ctx.shadowColor = '#ffb347'; ctx.shadowBlur = 24 * s;
      const g = ctx.createRadialGradient(p[0] - r * 0.35, p[1] - r * 0.4, r * 0.1, p[0], p[1], r); g.addColorStop(0, '#fff'); g.addColorStop(0.5, '#ffe2b0'); g.addColorStop(1, '#ff9a2e');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 7); ctx.fill(); ctx.restore();
    }
  }

  root.TD = { V, setView, P, paintArena, THEMES, Match, drawPaddle, worldXAt, HIT_P, TY, cl, lerp, rnd };
})(window);
