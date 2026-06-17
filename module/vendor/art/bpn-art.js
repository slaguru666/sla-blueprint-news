/* Blueprint News — procedural SVG artwork.
 *
 * Flat, graphic, stencil/propaganda-poster styling: hard angles, heavy blacks,
 * a single colour-band accent, halftone and scanline textures. Deliberately
 * NOT photorealistic. All shapes derive from the BPN seed, so a given briefing
 * always renders the same art while every briefing differs.
 *
 * Each colour band gets its own SCENE — a foreground motif (sewer arch, transit
 * concourse, perimeter wall, vault corridor, …) plus tuned atmosphere and
 * lighting — so a Blue street job and a Black covert op never look alike.
 *
 * No DOM and no engine APIs — each function returns an SVG markup string.
 */

/* --- seeded rng (local copy so art is usable standalone) ----------------- */

function hashSeed(str) {
  let h = 2166136261 >>> 0;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function rngFor(seed, salt) {
  return mulberry32(hashSeed(`${seed}::${salt}`));
}

const rint = (rng, lo, hi) => Math.floor(rng() * (hi - lo + 1)) + lo;
const rfloat = (rng, lo, hi) => rng() * (hi - lo) + lo;
const r2 = (n) => Math.round(n * 100) / 100;

/* --- colour helpers ------------------------------------------------------ */

function hexToRgb(hex) {
  const h = String(hex || "#dce8f9").replace("#", "");
  const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  return { r: parseInt(n.slice(0, 2), 16), g: parseInt(n.slice(2, 4), 16), b: parseInt(n.slice(4, 6), 16) };
}

function mix(hex, withHex, t) {
  const a = hexToRgb(hex);
  const b = hexToRgb(withHex);
  const c = (k) => Math.round(a[k] + (b[k] - a[k]) * t);
  return `rgb(${c("r")},${c("g")},${c("b")})`;
}

function rgba(hex, alpha) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${alpha})`;
}

/* --- per-band scene definitions ----------------------------------------- */
/* motif: which foreground silhouette to draw.
   rain/smog/crowd: atmospheric layer. floodlights/beacons: lighting.
   density: building/back-skyline busyness (0 sparse … 1 dense). */
const SCENES = {
  blue:     { motif: "tunnel",   rain: 0.8, smog: 0,   crowd: 0,   floodlights: false, beacons: false, density: 0.5 },
  yellow:   { motif: "transit",  rain: 0,   smog: 0.2, crowd: 0.9, floodlights: false, beacons: false, density: 0.7 },
  green:    { motif: "wall",     rain: 0.5, smog: 0.1, crowd: 0,   floodlights: true,  beacons: false, density: 0.5 },
  white:    { motif: "cordon",   rain: 0.2, smog: 0.1, crowd: 0,   floodlights: false, beacons: false, density: 0.6 },
  grey:     { motif: "gantry",   rain: 0,   smog: 0.6, crowd: 0,   floodlights: false, beacons: false, density: 0.8 },
  silver:   { motif: "stage",    rain: 0,   smog: 0,   crowd: 0.7, floodlights: true,  beacons: false, density: 0.6 },
  jade:     { motif: "canal",    rain: 0.3, smog: 0.8, crowd: 0,   floodlights: false, beacons: false, density: 0.5 },
  red:      { motif: "tower",    rain: 0.6, smog: 0.3, crowd: 0,   floodlights: true,  beacons: true,  density: 0.7 },
  black:    { motif: "vault",    rain: 0,   smog: 0,   crowd: 0,   floodlights: false, beacons: false, density: 0.2 },
  platinum: { motif: "exec",     rain: 0,   smog: 0.1, crowd: 0,   floodlights: false, beacons: false, density: 0.3 }
};

/* Mission-focus glyph drawn inside the crest pupil. */
function focusGlyph(focus = "", accent = "#fff") {
  const f = String(focus).toLowerCase();
  const stroke = `stroke="${accent}" stroke-width="3.5" fill="none" stroke-linecap="round" stroke-linejoin="round"`;
  if (f.includes("eliminate") || f.includes("hunt") || f.includes("kill")) return `<path d="M-9 -9 L9 9 M9 -9 L-9 9" ${stroke}/>`;
  if (f.includes("escort") || f.includes("protect")) return `<path d="M0 -11 L10 -5 V4 C10 10 5 12 0 12 C-5 12 -10 10 -10 4 V-5 Z" ${stroke}/>`;
  if (f.includes("retrieve")) return `<path d="M-9 -6 H9 V8 H-9 Z M-9 -6 L0 -11 L9 -6" ${stroke}/>`;
  if (f.includes("investigate") || f.includes("profile")) return `<circle r="6" cx="-2" cy="-2" ${stroke}/><path d="M3 3 L10 10" ${stroke}/>`;
  if (f.includes("contain") || f.includes("quarantine")) return `<circle r="3" ${stroke}/><path d="M0 -11 A11 11 0 0 1 9.5 5 M0 11 A11 11 0 0 1 -9.5 5 M0 11 A11 11 0 0 0 9.5 -5" ${stroke}/>`;
  if (f.includes("riot") || f.includes("crowd")) return `<path d="M-10 8 V-2 M-3 8 V-6 M4 8 V-2 M11 8 V-8" ${stroke}/>`;
  return `<path d="M0 -10 V10 M-7 0 H7 M-5 -6 H5 M-5 6 H5" ${stroke}/>`;
}

/* ------------------------------------------------------------------------ */
/* CREST — the BPN sigil.                                                    */
/* ------------------------------------------------------------------------ */

export function crestSVG(bpn, { size = 128 } = {}) {
  const accent = bpn?.colour?.accent ?? "#dce8f9";
  const seed = bpn?.seed ?? "BPN";
  const uid = String(seed).replace(/[^A-Za-z0-9]/g, "");
  const rng = rngFor(seed, "crest");
  const dark = "#101722";
  const rim = mix(accent, "#ffffff", 0.12);
  const glyph = focusGlyph(bpn?.missionFocus ?? "", mix(accent, "#ffffff", 0.25));
  const rivet = (x, y) => `<circle cx="${x}" cy="${y}" r="2.4" fill="${rgba(accent, 0.55)}"/>`;
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i / 12) * Math.PI * 2;
    const x1 = 64 + Math.cos(a) * 50, y1 = 64 + Math.sin(a) * 50;
    const x2 = 64 + Math.cos(a) * (i % 3 === 0 ? 44 : 47), y2 = 64 + Math.sin(a) * (i % 3 === 0 ? 44 : 47);
    return `<line x1="${r2(x1)}" y1="${r2(y1)}" x2="${r2(x2)}" y2="${r2(y2)}" stroke="${rgba(accent, 0.4)}" stroke-width="${i % 3 === 0 ? 3 : 1.5}"/>`;
  }).join("");
  const jitter = r2(rfloat(rng, -2, 2));

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" width="${size}" height="${size}" role="img" aria-label="${bpn?.colour?.label ?? ""} BPN crest">
  <defs>
    <linearGradient id="cg-${uid}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${mix(dark, accent, 0.18)}"/>
      <stop offset="1" stop-color="${dark}"/>
    </linearGradient>
  </defs>
  <rect x="4" y="4" width="120" height="120" rx="22" fill="url(#cg-${uid})"/>
  <rect x="9" y="9" width="110" height="110" rx="18" fill="none" stroke="${rim}" stroke-width="3.5"/>
  ${ticks}
  ${rivet(20, 20)}${rivet(108, 20)}${rivet(20, 108)}${rivet(108, 108)}
  <g transform="translate(${64 + jitter} 64)">
    <path d="M0 -34 C26 -34 40 -10 40 0 C40 10 26 34 0 34 C-26 34 -40 10 -40 0 C-40 -10 -26 -34 0 -34 Z" fill="none" stroke="${accent}" stroke-width="4"/>
    <path d="M0 -22 C18 -22 28 -7 28 0 C28 7 18 22 0 22 C-18 22 -28 7 -28 0 C-28 -7 -18 -22 0 -22 Z" fill="${rgba(accent, 0.10)}"/>
    <circle r="14" fill="${rgba(dark, 0.9)}" stroke="${rgba(accent, 0.5)}" stroke-width="1.5"/>
    ${glyph}
  </g>
</svg>`;
}

/* ------------------------------------------------------------------------ */
/* FOREGROUND MOTIFS — one per scene. Each returns markup positioned within  */
/* a 1200x360 banner space (W,H passed in).                                  */
/* ------------------------------------------------------------------------ */

function litWindowGrid(rng, x, y, w, h, accent, alpha, step = 14) {
  const out = [];
  for (let wx = x + 6; wx < x + w - 6; wx += step) {
    for (let wy = y + 8; wy < y + h - 6; wy += 18) {
      if (rng() < 0.32) out.push(`<rect x="${r2(wx)}" y="${r2(wy)}" width="4" height="6" fill="${rgba(accent, alpha * rfloat(rng, 0.5, 1))}"/>`);
    }
  }
  return out.join("");
}

const MOTIFS = {
  // generic angular skyline used by most street-level scenes
  skyline(rng, W, H, accent, density) {
    let x = -20; const out = [];
    const gap = density > 0.6 ? [2, 8] : [6, 16];
    while (x < W + 20) {
      const w = rint(rng, 34, 96), h = rint(rng, H * 0.4, H * 0.82), top = H + 4 - h;
      out.push(`<rect x="${x}" y="${r2(top)}" width="${w}" height="${r2(H - top)}" fill="#060a11"/>`);
      if (rng() < 0.4) { const mx = x + rint(rng, 6, w - 6); out.push(`<line x1="${mx}" y1="${r2(top)}" x2="${mx}" y2="${r2(top - rint(rng, 10, 34))}" stroke="#060a11" stroke-width="2"/>`); }
      out.push(litWindowGrid(rng, x, top, w, H - top, accent, 0.85));
      x += w + rint(rng, gap[0], gap[1]);
    }
    return out.join("");
  },
  tunnel(rng, W, H, accent) {
    const cx = W * rfloat(rng, 0.4, 0.6), out = [];
    for (let i = 0; i < 5; i++) { const ry = H * (0.34 + i * 0.11), rx = ry * 1.5; out.push(`<ellipse cx="${r2(cx)}" cy="${r2(H * 0.62)}" rx="${r2(rx)}" ry="${r2(ry)}" fill="none" stroke="${rgba(accent, 0.10 + i * 0.03)}" stroke-width="${6 - i}"/>`); }
    out.push(`<rect x="0" y="${r2(H * 0.7)}" width="${W}" height="${r2(H * 0.3)}" fill="#04070c"/>`);
    for (let i = 0; i < 26; i++) { const x = rfloat(rng, 0, W); out.push(`<line x1="${r2(x)}" y1="${r2(H * 0.72)}" x2="${r2(x)}" y2="${r2(H * 0.74 + rfloat(rng, 0, 8))}" stroke="${rgba(accent, 0.2)}" stroke-width="1"/>`); } // water glints
    out.push(`<rect x="40" y="${r2(H * 0.3)}" width="14" height="${r2(H * 0.5)}" fill="#060a11"/><rect x="${W - 54}" y="${r2(H * 0.3)}" width="14" height="${r2(H * 0.5)}" fill="#060a11"/>`); // side pipes
    return out.join("");
  },
  transit(rng, W, H, accent) {
    const out = [MOTIFS.skyline(rng, W, H, accent, 0.7)];
    for (let i = 0; i < 6; i++) { const x = (i + 0.5) * (W / 6); out.push(`<rect x="${r2(x - 7)}" y="${r2(H * 0.32)}" width="14" height="${r2(H * 0.68)}" fill="#04070c"/>`); if (rng() < 0.8) out.push(`<rect x="${r2(x - 26)}" y="${r2(H * 0.28)}" width="52" height="14" rx="2" fill="${rgba(accent, 0.5)}"/>`); } // pillars + route boards
    return out.join("");
  },
  wall(rng, W, H, accent) {
    const out = [], top = H * 0.34;
    out.push(`<rect x="0" y="${r2(top)}" width="${W}" height="${r2(H - top)}" fill="#070b12"/>`);
    for (let x = 0; x < W; x += 64) out.push(`<rect x="${x + 4}" y="${r2(top)}" width="56" height="${r2(H - top)}" fill="none" stroke="${rgba(accent, 0.12)}" stroke-width="1.5"/>`); // plating
    for (let x = 0; x < W; x += 64) out.push(`<rect x="${x + 18}" y="${r2(top - 16)}" width="28" height="16" fill="#070b12"/>`); // battlements
    return out.join("");
  },
  cordon(rng, W, H, accent) {
    const out = [MOTIFS.skyline(rng, W, H, accent, 0.6)];
    // diagonal cordon tape across the lower third
    for (let k = -1; k <= 1; k += 2) { const y = H * (0.72 + k * 0.06); out.push(`<g transform="rotate(${k * 4} ${W / 2} ${y})"><rect x="-40" y="${r2(y)}" width="${W + 80}" height="13" fill="${rgba(accent, 0.5)}"/></g>`); }
    return out.join("");
  },
  gantry(rng, W, H, accent) {
    const out = [MOTIFS.skyline(rng, W, H, accent, 0.8)];
    for (let i = 0; i < 10; i++) { const x = rfloat(rng, 0, W - 70), y = H - rint(rng, 24, 70); out.push(`<rect x="${r2(x)}" y="${r2(y)}" width="64" height="22" fill="#04070c" stroke="${rgba(accent, 0.18)}" stroke-width="1"/>`); } // containers
    out.push(`<path d="M${r2(W * 0.6)} ${r2(H * 0.3)} h120 v10 h-120 z M${r2(W * 0.62)} ${r2(H * 0.31)} v${r2(H * 0.5)}" fill="#04070c" stroke="${rgba(accent, 0.2)}" stroke-width="2"/>`); // gantry crane
    return out.join("");
  },
  stage(rng, W, H, accent) {
    const out = [MOTIFS.skyline(rng, W, H, accent, 0.5)];
    out.push(`<path d="M${r2(W * 0.2)} ${r2(H * 0.26)} H${r2(W * 0.8)} V${r2(H * 0.3)} H${r2(W * 0.2)} Z" fill="#04070c" stroke="${rgba(accent, 0.3)}" stroke-width="2"/>`); // truss
    for (let i = 0; i < 5; i++) { const x = W * (0.28 + i * 0.11); out.push(`<polygon points="${r2(x)},${r2(H * 0.3)} ${r2(x - 40)},${H} ${r2(x + 40)},${H}" fill="${rgba(accent, 0.06)}"/>`); } // spotlight cones
    return out.join("");
  },
  canal(rng, W, H, accent) {
    const out = [MOTIFS.skyline(rng, W, H, accent, 0.5)];
    out.push(`<rect x="0" y="${r2(H * 0.78)}" width="${W}" height="${r2(H * 0.22)}" fill="${rgba(accent, 0.07)}"/>`); // canal
    for (let i = 0; i < 7; i++) { const x = rfloat(rng, 30, W - 30); out.push(`<rect x="${r2(x)}" y="${r2(H * 0.72)}" width="18" height="26" rx="3" fill="#04070c" stroke="${rgba(accent, 0.4)}" stroke-width="1.5"/>`); } // hazard barrels
    return out.join("");
  },
  tower(rng, W, H, accent) {
    const out = [MOTIFS.skyline(rng, W, H, accent, 0.7)];
    const tx = W * rfloat(rng, 0.4, 0.6);
    out.push(`<rect x="${r2(tx - 16)}" y="${r2(H * 0.12)}" width="32" height="${r2(H * 0.88)}" fill="#04070c" stroke="${rgba(accent, 0.25)}" stroke-width="1.5"/>`); // broadcast tower
    out.push(`<line x1="${r2(tx)}" y1="${r2(H * 0.12)}" x2="${r2(tx)}" y2="${r2(H * 0.02)}" stroke="${rgba(accent, 0.5)}" stroke-width="2"/>`);
    out.push(`<line x1="0" y1="${r2(H * 0.5)}" x2="${W}" y2="${r2(H * 0.46)}" stroke="#04070c" stroke-width="8"/>`); // monorail line
    return out.join("");
  },
  vault(rng, W, H, accent) {
    const cx = W * 0.5, out = [];
    for (let i = 0; i < 6; i++) { const s = 1 - i * 0.15, w = W * 0.5 * s, h = H * 0.9 * s; out.push(`<rect x="${r2(cx - w / 2)}" y="${r2(H * 0.5 - h / 2)}" width="${r2(w)}" height="${r2(h)}" fill="none" stroke="${rgba(accent, 0.06 + i * 0.02)}" stroke-width="1.5"/>`); } // receding corridor
    out.push(`<rect x="${r2(cx - 20)}" y="${r2(H * 0.36)}" width="40" height="${r2(H * 0.28)}" fill="#04070c" stroke="${rgba(accent, 0.3)}" stroke-width="1.5"/>`); // far door
    for (let i = 0; i < 5; i++) out.push(`<rect x="${r2(cx + 26)}" y="${r2(H * 0.4 + i * 12)}" width="4" height="4" fill="${rgba(accent, 0.5)}"/>`); // biometric panel
    return out.join("");
  },
  exec(rng, W, H, accent) {
    const out = []; let x = 40;
    while (x < W - 40) { const w = rint(rng, 70, 120), h = rint(rng, H * 0.55, H * 0.95), top = H + 4 - h; out.push(`<rect x="${x}" y="${r2(top)}" width="${w}" height="${r2(H - top)}" fill="#05080e" stroke="${rgba(accent, 0.10)}" stroke-width="1"/>`); out.push(litWindowGrid(rng, x, top, w, H - top, accent, 0.4, 18)); x += w + rint(rng, 40, 90); }
    out.push(`<line x1="0" y1="${r2(H * 0.7)}" x2="${W}" y2="${r2(H * 0.68)}" stroke="#04070c" stroke-width="6"/>`);
    return out.join("");
  }
};

/* ------------------------------------------------------------------------ */
/* BANNER — the wide hero backdrop, composed from the band's scene.          */
/* ------------------------------------------------------------------------ */

export function bannerSVG(bpn, { width = 1200, height = 360 } = {}) {
  const accent = bpn?.colour?.accent ?? "#dce8f9";
  const key = bpn?.colourKey ?? "white";
  const seed = bpn?.seed ?? "BPN";
  const uid = String(seed).replace(/[^A-Za-z0-9]/g, "");
  const scene = SCENES[key] ?? SCENES.white;
  const rng = rngFor(seed, "banner");
  const dark = "#0b1018";
  const W = width, H = height;

  // hazy back skyline for depth (skip for vault/exec which set their own mood)
  let back = "";
  if (!["vault", "exec"].includes(scene.motif)) {
    let x = -20; const out = [];
    while (x < W + 20) { const w = rint(rng, 40, 96), h = rint(rng, H * 0.28, H * 0.6), top = H * 0.92 - h; out.push(`<rect x="${x}" y="${r2(top)}" width="${w}" height="${r2(H - top)}" fill="${mix(dark, accent, 0.06)}"/>`); x += w + rint(rng, 4, 14); }
    back = out.join("");
  }

  const fg = (MOTIFS[scene.motif] ?? MOTIFS.skyline)(rng, W, H, accent, scene.density);

  // searchlight beams
  const beams = Array.from({ length: rint(rng, 2, 4) }, () => { const ox = rfloat(rng, 0, W), s = rfloat(rng, 40, 120); return `<polygon points="${r2(ox)},-10 ${r2(ox - s)},${H} ${r2(ox + s)},${H}" fill="${rgba(accent, 0.05)}"/>`; }).join("");

  // atmosphere layers
  let rain = "", smog = "", crowd = "";
  if (scene.rain > 0) rain = Array.from({ length: Math.round(scene.rain * 110) }, () => { const x = rfloat(rng, 0, W), y = rfloat(rng, 0, H), len = rfloat(rng, 3, 11); return `<line x1="${r2(x)}" y1="${r2(y)}" x2="${r2(x + 1.5)}" y2="${r2(y + len)}" stroke="${rgba(accent, rfloat(rng, 0.05, 0.18))}" stroke-width="1"/>`; }).join("");
  if (scene.smog > 0) smog = Array.from({ length: Math.round(scene.smog * 5) }, (_, i) => `<ellipse cx="${r2(rfloat(rng, 0, W))}" cy="${r2(rfloat(rng, H * 0.4, H))}" rx="${r2(rfloat(rng, 120, 320))}" ry="${r2(rfloat(rng, 30, 80))}" fill="${rgba(accent, 0.04)}"/>`).join("");
  if (scene.crowd > 0) crowd = Array.from({ length: Math.round(scene.crowd * 90) }, () => { const x = rfloat(rng, 0, W), y = rfloat(rng, H * 0.82, H - 4); return `<circle cx="${r2(x)}" cy="${r2(y)}" r="${r2(rfloat(rng, 1.5, 3))}" fill="${rgba(accent, rfloat(rng, 0.1, 0.3))}"/>`; }).join("");

  // lighting
  let floods = "", beaconGlow = "";
  if (scene.floodlights) floods = Array.from({ length: rint(rng, 2, 3) }, () => { const x = rfloat(rng, W * 0.2, W * 0.8); return `<circle cx="${r2(x)}" cy="${r2(H * 0.12)}" r="${r2(rfloat(rng, 8, 14))}" fill="${rgba(accent, 0.6)}"/><polygon points="${r2(x)},${r2(H * 0.12)} ${r2(x - 90)},${H} ${r2(x + 90)},${H}" fill="${rgba(accent, 0.06)}"/>`; }).join("");
  if (scene.beacons) beaconGlow = Array.from({ length: rint(rng, 2, 4) }, () => `<circle cx="${r2(rfloat(rng, 0, W))}" cy="${r2(rfloat(rng, H * 0.2, H * 0.5))}" r="${r2(rfloat(rng, 16, 34))}" fill="${rgba(accent, 0.10)}"/>`).join("");

  // hazard chevrons for high-alert bands
  let hazard = "";
  if (["red", "black", "jade", "green"].includes(key)) { const bandY = H - 16, chev = []; for (let x = -20; x < W + 20; x += 28) chev.push(`<path d="M${x} ${bandY} l14 8 l14 -8 l0 8 l-14 8 l-14 -8 Z" fill="${rgba(accent, 0.5)}"/>`); hazard = `<g>${chev.join("")}</g>`; }

  // giant faint Third Eye
  const eyeX = rng() < 0.5 ? W * 0.78 : W * 0.22, eyeScale = rfloat(rng, 1.6, 2.2);
  const eye = `<g transform="translate(${r2(eyeX)} ${r2(H * 0.46)}) scale(${r2(eyeScale)})" opacity="0.12"><path d="M0 -34 C26 -34 40 -10 40 0 C40 10 26 34 0 34 C-26 34 -40 10 -40 0 C-40 -10 -26 -34 0 -34 Z" fill="none" stroke="${accent}" stroke-width="3"/><circle r="13" fill="none" stroke="${accent}" stroke-width="3"/></g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${bpn?.colour?.label ?? ""} sector backdrop">
  <defs>
    <linearGradient id="sky-${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(dark, accent, 0.16)}"/><stop offset="0.55" stop-color="${dark}"/><stop offset="1" stop-color="#04070c"/></linearGradient>
    <radialGradient id="glow-${uid}" cx="50%" cy="0%" r="80%"><stop offset="0" stop-color="${rgba(accent, 0.18)}"/><stop offset="1" stop-color="rgba(0,0,0,0)"/></radialGradient>
    <pattern id="scan-${uid}" width="3" height="3" patternUnits="userSpaceOnUse"><rect width="3" height="1" fill="rgba(0,0,0,0.22)"/></pattern>
    <radialGradient id="vig-${uid}" cx="50%" cy="50%" r="75%"><stop offset="0.55" stop-color="rgba(0,0,0,0)"/><stop offset="1" stop-color="rgba(0,0,0,0.55)"/></radialGradient>
    <filter id="grain-${uid}"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/></filter>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#sky-${uid})"/>
  <rect width="${W}" height="${H}" fill="url(#glow-${uid})"/>
  ${beams}${beaconGlow}${smog}
  ${eye}
  ${back}
  ${fg}
  ${floods}${crowd}${rain}
  ${hazard}
  <rect width="${W}" height="${H}" fill="url(#scan-${uid})"/>
  <rect width="${W}" height="${H}" filter="url(#grain-${uid})" opacity="0.05"/>
  <rect width="${W}" height="${H}" fill="url(#vig-${uid})"/>
</svg>`;
}

/* ------------------------------------------------------------------------ */
/* PORTRAIT — a stylised halftone contact silhouette for the brief.          */
/* Flat shoulders + head bust, halftone dot shading, accent rim. Not a face: */
/* an anonymous corporate ID-photo abstraction, deliberately non-realistic.  */
/* ------------------------------------------------------------------------ */

export function portraitSVG(bpn, { size = 120 } = {}) {
  const accent = bpn?.colour?.accent ?? "#dce8f9";
  const seed = bpn?.seed ?? "BPN";
  const uid = String(seed).replace(/[^A-Za-z0-9]/g, "") + "p";
  const rng = rngFor(seed, "portrait");
  const dark = "#0c1119";
  // halftone dots over the bust area
  const dots = [];
  for (let y = 18; y < 120; y += 8) {
    for (let x = 12; x < 108; x += 8) {
      const d = Math.hypot(x - 60, y - 70);
      const p = Math.max(0, 1 - d / 70);
      if (rng() < p * 0.7) dots.push(`<circle cx="${x}" cy="${y}" r="${r2(0.8 + p * 1.6)}" fill="${rgba(accent, 0.18 + p * 0.22)}"/>`);
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${size}" height="${size}" role="img" aria-label="contact ident">
  <defs><clipPath id="clip-${uid}"><path d="M60 24 a18 18 0 0 1 18 18 a18 18 0 0 1 -36 0 a18 18 0 0 1 18 -18 Z M24 120 v-14 c0 -20 16 -32 36 -32 c20 0 36 12 36 32 v14 Z"/></clipPath></defs>
  <rect x="2" y="2" width="116" height="116" rx="12" fill="${dark}" stroke="${rgba(accent, 0.4)}" stroke-width="2"/>
  <g clip-path="url(#clip-${uid})">
    <rect x="0" y="0" width="120" height="120" fill="${rgba(accent, 0.08)}"/>
    ${dots.join("")}
  </g>
  <path d="M60 24 a18 18 0 0 1 18 18 a18 18 0 0 1 -36 0 a18 18 0 0 1 18 -18 Z" fill="none" stroke="${rgba(accent, 0.55)}" stroke-width="2"/>
  <path d="M24 120 v-14 c0 -20 16 -32 36 -32 c20 0 36 12 36 32 v14" fill="none" stroke="${rgba(accent, 0.55)}" stroke-width="2"/>
  <line x1="10" y1="104" x2="110" y2="104" stroke="${rgba(accent, 0.3)}" stroke-width="1"/>
</svg>`;
}

/* ------------------------------------------------------------------------ */
/* SITE MAP — a schematic, non-photorealistic sector diagram for the Field   */
/* Dossier. Numbered nodes (one per location) wired along a route over a     */
/* faint grid, with an entry marker. Labels live in the dossier list.        */
/* ------------------------------------------------------------------------ */

export function siteMapSVG(bpn, { width = 640, height = 320 } = {}) {
  const accent = bpn?.colour?.accent ?? "#dce8f9";
  const seed = bpn?.seed ?? "BPN";
  const uid = String(seed).replace(/[^A-Za-z0-9]/g, "") + "m";
  const rng = rngFor(seed, "map");
  const dark = "#0b1018";
  const sites = Array.isArray(bpn?.sites) && bpn.sites.length ? bpn.sites : [{}, {}, {}];
  const n = sites.length;
  const W = width, H = height;
  const mx = 70, my = 64;

  // node positions: spread along x, seeded y within the band
  const nodes = sites.map((_, i) => ({
    x: mx + (n === 1 ? (W - 2 * mx) / 2 : (i * (W - 2 * mx)) / (n - 1)),
    y: my + rfloat(rng, 0, H - 2 * my)
  }));

  // route polyline through the nodes
  const route = nodes.map((p, i) => `${i ? "L" : "M"}${r2(p.x)} ${r2(p.y)}`).join(" ");

  const nodeMarks = nodes.map((p, i) => `
    <g transform="translate(${r2(p.x)} ${r2(p.y)})">
      <circle r="16" fill="${dark}" stroke="${accent}" stroke-width="2.5"/>
      <circle r="22" fill="none" stroke="${rgba(accent, 0.25)}" stroke-width="1"/>
      <text x="0" y="5" text-anchor="middle" font-family="Roboto Mono, monospace" font-size="15" font-weight="700" fill="${mix(accent, "#ffffff", 0.3)}">${i + 1}</text>
    </g>`).join("");

  // entry chevron at the first node
  const e = nodes[0];
  const entry = `<g transform="translate(${r2(e.x - 30)} ${r2(e.y)})"><path d="M-10 -8 L2 0 L-10 8" fill="none" stroke="${accent}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><text x="-12" y="-12" text-anchor="end" font-family="Roboto Mono, monospace" font-size="10" letter-spacing="1.5" fill="${rgba(accent, 0.7)}">ENTRY</text></g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}" role="img" aria-label="sector schematic">
  <defs>
    <linearGradient id="mg-${uid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${mix(dark, accent, 0.10)}"/><stop offset="1" stop-color="#05080d"/></linearGradient>
    <pattern id="grid-${uid}" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0 H0 V28" fill="none" stroke="${rgba(accent, 0.10)}" stroke-width="1"/></pattern>
  </defs>
  <rect width="${W}" height="${H}" rx="10" fill="url(#mg-${uid})"/>
  <rect width="${W}" height="${H}" rx="10" fill="url(#grid-${uid})"/>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="10" fill="none" stroke="${rgba(accent, 0.4)}" stroke-width="1.5"/>
  <text x="18" y="28" font-family="Roboto Mono, monospace" font-size="11" letter-spacing="2" fill="${rgba(accent, 0.75)}">SECTOR SCHEMATIC // ${String(bpn?.bpnId ?? "")}</text>
  <path d="${route}" fill="none" stroke="${rgba(accent, 0.55)}" stroke-width="2" stroke-dasharray="2 6" stroke-linecap="round"/>
  ${entry}
  ${nodeMarks}
</svg>`;
}

/* Convenience: data URIs (handy as <img> srcs or journal icons, and required
   in hosts that sanitise inline <svg> such as Foundry journal pages). */
export function crestDataURI(bpn, opts) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(crestSVG(bpn, opts))}`;
}
export function bannerDataURI(bpn, opts) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(bannerSVG(bpn, opts))}`;
}
export function portraitDataURI(bpn, opts) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(portraitSVG(bpn, opts))}`;
}
export function siteMapDataURI(bpn, opts) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(siteMapSVG(bpn, opts))}`;
}
