function lerpHex(a: number[], b: number[], t: number) {
  return `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(
    a[2] + (b[2] - a[2]) * t
  )})`;
}

// Hardcoded to the prototype's default theme/atmosphere (Ocean / Balanced) — no live switcher.
// WHITE was #faf7ed (cream) — changed to pure white to match the light-mode
// background (`--color-paper: #ffffff`) already used on every other page
// (/work, /blog, /faq); the homepage's "Our Work" section settles to this
// color, so it now matches instead of reading slightly yellowish next to it.
const WHITE = [255, 255, 255];
const FOREST = { g1: [6, 16, 46], g2: [11, 61, 145], g3: [30, 144, 255], g4: [169, 214, 229] };
const ATM_TOP = [4, 6, 14];
const ATM_BOOST = 1.0;

/** Hero background, settling to white (#fff) as the hero scrolls out of view. */
export function heroBgGradient(p: number) {
  const settle = Math.max(0, Math.min(1, (p - 0.7) / 0.3));
  const S = (s: number[], boost: number) => lerpHex(s, WHITE, Math.max(settle, Math.min(1, p * boost)));
  const nearBlack = FOREST.g1.map((c) => Math.round(c * 0.45));
  const b = ATM_BOOST;
  return `linear-gradient(180deg, ${S(ATM_TOP, 1.0 * b)} 0%, ${S(nearBlack, 1.1 * b)} 24%, ${S(
    FOREST.g1,
    1.3 * b
  )} 40%, ${S(FOREST.g2, 1.45 * b)} 53%, ${S(FOREST.g3, 1.7 * b)} 68%, ${S(FOREST.g4, 2.0 * b)} 85%, ${S(
    WHITE,
    2.5 * b
  )} 100%)`;
}

/** White (settled Our Work bg) to dark navy, eased — used behind the "Why Paistudio" CTA section. */
export function ctaBgGradient(q: number) {
  const base = WHITE;
  const e = q * q * (3 - 2 * q);
  const top = lerpHex(base, [8, 14, 26], e);
  const mid = lerpHex(base, [7, 16, 34], e);
  const bot = lerpHex(base, [5, 11, 20], e);
  return `linear-gradient(180deg, ${top} 0%, ${mid} 46%, ${bot} 100%)`;
}
