/**
 * Procedural pixel-art sprite generation for the orbital map.
 *
 * Everything is authored at 1 sprite-pixel per canvas pixel and drawn to screen at an
 * integer scale with image smoothing disabled, so edges stay hard. Shading is quantised
 * into short colour ramps with 4x4 ordered dithering instead of smooth gradients.
 */

const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

/** Light comes from upper-left and slightly toward the viewer. */
const LIGHT: readonly [number, number, number] = (() => {
  const v: [number, number, number] = [-0.52, -0.6, 0.61];
  const len = Math.hypot(v[0], v[1], v[2]);
  return [v[0] / len, v[1] / len, v[2] / len];
})();

export type Rgb = [number, number, number];

export function hexToRgb(hex: string): Rgb {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function clamp01(n: number) {
  return n < 0 ? 0 : n > 1 ? 1 : n;
}

function hash2(ix: number, iy: number, seed: number): number {
  let h = Math.imul(ix | 0, 0x27d4eb2d) ^ Math.imul(iy | 0, 0x165667b1) ^ Math.imul(seed | 0, 0x9e3779b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

function smoothstep(t: number) {
  return t * t * (3 - 2 * t);
}

function valueNoise(x: number, y: number, seed: number): number {
  const x0 = Math.floor(x);
  const y0 = Math.floor(y);
  const fx = smoothstep(x - x0);
  const fy = smoothstep(y - y0);
  const a = hash2(x0, y0, seed);
  const b = hash2(x0 + 1, y0, seed);
  const c = hash2(x0, y0 + 1, seed);
  const d = hash2(x0 + 1, y0 + 1, seed);
  return (a + (b - a) * fx) * (1 - fy) + (c + (d - c) * fx) * fy;
}

export function fbm(x: number, y: number, seed: number, octaves = 4): number {
  let value = 0;
  let amp = 0.5;
  let freq = 1;
  let norm = 0;
  for (let i = 0; i < octaves; i += 1) {
    value += valueNoise(x * freq, y * freq, seed + i * 131) * amp;
    norm += amp;
    amp *= 0.5;
    freq *= 2.03;
  }
  return value / norm;
}

/** Dithered quantisation of `v` into a colour ramp index. */
function rampIndex(v: number, levels: number, x: number, y: number): number {
  const s = clamp01(v) * (levels - 1);
  const i0 = Math.floor(s);
  const frac = s - i0;
  const threshold = (BAYER4[y & 3][x & 3] + 0.5) / 16;
  const idx = frac > threshold ? i0 + 1 : i0;
  return idx < 0 ? 0 : idx > levels - 1 ? levels - 1 : idx;
}

function ditherMask(alpha: number, x: number, y: number): boolean {
  return alpha > (BAYER4[y & 3][x & 3] + 0.5) / 16;
}

export type PlanetKind = 'terran' | 'rock' | 'ice' | 'gas' | 'volcanic';

export interface PlanetSpec {
  /** Diameter of the planet disc in sprite pixels. */
  size: number;
  /** Surface ramp, darkest first. Needs at least 4 stops. */
  palette: string[];
  kind: PlanetKind;
  seed: number;
  /** Rotates surface features around the polar axis, in radians. */
  lonOffset?: number;
  /** Secondary ramp used for oceans on terran worlds. */
  sea?: string[];
  /** Fraction of the surface below sea level (terran only). */
  seaLevel?: number;
  /** Unlit hot colour for lava veins / city lights. */
  accent?: string;
  /** Draw polar ice caps. */
  caps?: boolean;
  /** Dithered atmospheric halo colour. */
  atmosphere?: string;
  ring?: {
    palette: string[];
    /** Radii as multiples of the planet radius. */
    inner: number;
    outer: number;
  };
}

function createCanvas(w: number, h: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  return canvas;
}

/**
 * Renders one planet sprite. The returned canvas may be wider than the planet disc when
 * it carries a ring or atmosphere; `center` reports where the disc sits inside it.
 */
export function makePlanetSprite(spec: PlanetSpec): Sprite {
  const R = spec.size / 2;
  const ringPad = spec.ring ? Math.ceil(R * (spec.ring.outer - 1) + 2) : 0;
  const atmoPad = spec.atmosphere ? Math.ceil(R * 0.16 + 2) : 0;
  const pad = Math.max(2, ringPad, atmoPad);
  const W = Math.ceil(spec.size + pad * 2);
  const H = W;
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext('2d');
  if (!ctx) return { canvas, center: { x: W / 2, y: H / 2 }, radius: R };

  const image = ctx.createImageData(W, H);
  const data = image.data;
  const cx = W / 2;
  const cy = H / 2;

  const ramp = spec.palette.map(hexToRgb);
  const seaRamp = (spec.sea ?? spec.palette).map(hexToRgb);
  const accent = spec.accent ? hexToRgb(spec.accent) : null;
  const atmo = spec.atmosphere ? hexToRgb(spec.atmosphere) : null;
  const outline = ramp[0];

  const put = (x: number, y: number, rgb: Rgb, alpha = 255) => {
    if (x < 0 || y < 0 || x >= W || y >= H) return;
    const i = (y * W + x) * 4;
    data[i] = rgb[0];
    data[i + 1] = rgb[1];
    data[i + 2] = rgb[2];
    data[i + 3] = alpha;
  };

  for (let y = 0; y < H; y += 1) {
    for (let x = 0; x < W; x += 1) {
      const nx = (x + 0.5 - cx) / R;
      const ny = (y + 0.5 - cy) / R;
      const d2 = nx * nx + ny * ny;

      if (d2 > 1) {
        // Dithered atmosphere shell just outside the disc.
        if (atmo && atmoPad > 0) {
          const d = Math.sqrt(d2);
          const reach = (d - 1) / (atmoPad / R);
          if (reach <= 1) {
            const lam = Math.max(0, nx * LIGHT[0] + ny * LIGHT[1]);
            const falloff = Math.pow(1 - reach, 3);
            if (ditherMask(falloff * (0.2 + 0.8 * lam), x, y)) put(x, y, atmo, 255);
          }
        }
        continue;
      }

      const nz = Math.sqrt(1 - d2);
      const lambert = nx * LIGHT[0] + ny * LIGHT[1] + nz * LIGHT[2];
      const lit = Math.max(0, lambert);

      // Spherical coordinates keep surface features from smearing across the limb.
      const lon = Math.atan2(nx, nz) + (spec.lonOffset ?? 0);
      const lat = Math.asin(ny < -1 ? -1 : ny > 1 ? 1 : ny);

      let detail = 0.5;
      let useSea = false;
      let hot = 0;

      switch (spec.kind) {
        case 'terran': {
          const elev = fbm(lon * 1.55 + 4, lat * 2.1, spec.seed, 5);
          useSea = elev < (spec.seaLevel ?? 0.5);
          detail = useSea ? 0.42 + elev * 0.5 : 0.4 + (elev - 0.5) * 1.5;
          break;
        }
        case 'rock': {
          const base = fbm(lon * 2.1, lat * 2.6, spec.seed, 4);
          const craters = fbm(lon * 5.5, lat * 6.2, spec.seed + 41, 3);
          detail = base * 0.72 + (craters > 0.62 ? -0.24 : 0.12);
          break;
        }
        case 'ice': {
          const base = fbm(lon * 2.4, lat * 2.8, spec.seed, 4);
          const cracks = fbm(lon * 6.5, lat * 3.2, spec.seed + 17, 3);
          detail = 0.62 + base * 0.3 - (cracks > 0.68 ? 0.34 : 0);
          break;
        }
        case 'gas': {
          const warp = fbm(lon * 1.1, lat * 2.4, spec.seed + 5, 3);
          const bands = Math.sin(lat * 7.4 + warp * 2.6);
          detail = 0.5 + bands * 0.34 + (warp - 0.5) * 0.22;
          break;
        }
        case 'volcanic': {
          const base = fbm(lon * 2.3, lat * 2.9, spec.seed, 4);
          const veins = fbm(lon * 3.4, lat * 4.1, spec.seed + 63, 4);
          detail = base * 0.7;
          hot = veins > 0.63 ? (veins - 0.63) / 0.37 : 0;
          break;
        }
      }

      let value = 0.09 + 0.91 * Math.pow(lit, 0.82);
      value *= 0.8 + 0.2 * nz;
      value += (detail - 0.5) * 0.42;

      if (spec.caps && Math.abs(lat) > 1.02) {
        value += 0.3 * ((Math.abs(lat) - 1.02) / 0.55);
        useSea = false;
      }

      const activeRamp = useSea ? seaRamp : ramp;
      const idx = rampIndex(value, activeRamp.length, x, y);
      let rgb = activeRamp[idx];

      if (accent && hot > 0) {
        // Lava keeps glowing on the night side, just dimmer.
        const glow = hot * (0.55 + 0.45 * lit);
        if (ditherMask(glow, x, y)) rgb = accent;
      }

      // Hard dark rim on the last pixel ring for a chunky silhouette.
      if (d2 > 0.955) rgb = outline;

      put(x, y, rgb, 255);
    }
  }

  if (spec.ring) {
    const ringRamp = spec.ring.palette.map(hexToRgb);
    const squish = 0.26;
    for (let y = 0; y < H; y += 1) {
      for (let x = 0; x < W; x += 1) {
        const dx = (x + 0.5 - cx) / R;
        const dy = (y + 0.5 - cy) / R;
        const rr = Math.hypot(dx, dy / squish);
        if (rr < spec.ring.inner || rr > spec.ring.outer) continue;

        const insideDisc = dx * dx + dy * dy <= 1;
        // The far half of the ring passes behind the planet.
        if (insideDisc && dy <= 0) continue;

        const band = fbm(rr * 9.5, 0.5, spec.seed + 211, 3);
        if (band < 0.3) continue;
        const shade = 0.28 + band * 0.72 - (dy < 0 ? 0.18 : 0);
        put(x, y, ringRamp[rampIndex(shade, ringRamp.length, x, y)], 255);
      }
    }
  }

  ctx.putImageData(image, 0, 0);
  return { canvas, center: { x: cx, y: cy }, radius: R };
}

export interface Sprite {
  canvas: HTMLCanvasElement;
  center: { x: number; y: number };
  radius: number;
}

/**
 * Pre-renders one rotation cycle of a world so it can spin on screen by cycling frames.
 */
export function makePlanetFrames(spec: PlanetSpec, frameCount: number): Sprite[] {
  const frames: Sprite[] = [];
  for (let i = 0; i < frameCount; i += 1) {
    frames.push(
      makePlanetSprite({ ...spec, lonOffset: (i / frameCount) * Math.PI * 2 }),
    );
  }
  return frames;
}

export interface StationSpec {
  seed: number;
  /** Hull ramp, darkest first; index 0 is used for the outline. */
  hull: string[];
  /** Solar panel ramp, darkest first. */
  panel: string[];
  beacon: string;
  window: string;
}

const STATION_W = 36;
const STATION_H = 22;

/**
 * Chunky orbital station: pressurised hull, solar wings, antenna mast. Layout varies
 * deterministically with the seed so no two publications look alike.
 */
export function makeStationSprite(spec: StationSpec, beaconOn: boolean): Sprite {
  const canvas = createCanvas(STATION_W, STATION_H);
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return { canvas, center: { x: STATION_W / 2, y: STATION_H / 2 }, radius: STATION_W / 2 };
  }

  const image = ctx.createImageData(STATION_W, STATION_H);
  const data = image.data;
  const hull = spec.hull.map(hexToRgb);
  const panel = spec.panel.map(hexToRgb);
  const beacon = hexToRgb(spec.beacon);
  const windowRgb = hexToRgb(spec.window);

  const px = (x: number, y: number, rgb: Rgb) => {
    if (x < 0 || y < 0 || x >= STATION_W || y >= STATION_H) return;
    const i = (y * STATION_W + x) * 4;
    data[i] = rgb[0];
    data[i + 1] = rgb[1];
    data[i + 2] = rgb[2];
    data[i + 3] = 255;
  };
  const rect = (x: number, y: number, w: number, h: number, rgb: Rgb) => {
    for (let yy = y; yy < y + h; yy += 1) for (let xx = x; xx < x + w; xx += 1) px(xx, yy, rgb);
  };
  const outline = (x: number, y: number, w: number, h: number) => {
    rect(x - 1, y - 1, w + 2, 1, hull[0]);
    rect(x - 1, y + h, w + 2, 1, hull[0]);
    rect(x - 1, y, 1, h, hull[0]);
    rect(x + w, y, 1, h, hull[0]);
  };

  const roll = (n: number) => hash2(n, spec.seed, 811);
  const panelLen = 7 + Math.floor(roll(1) * 3);
  const hullH = 8 + Math.floor(roll(2) * 3);
  const hullW = 7 + Math.floor(roll(3) * 3);
  const hasPod = roll(4) > 0.45;
  const mastH = 2 + Math.floor(roll(5) * 3);

  const cx = Math.floor(STATION_W / 2);
  const hullX = cx - Math.floor(hullW / 2);
  const hullY = Math.floor((STATION_H - hullH) / 2);
  const midY = hullY + Math.floor(hullH / 2);

  // Solar wings, with a lit frame and dithered cell grid.
  const wing = (x0: number) => {
    rect(x0, midY - 3, panelLen, 6, panel[1]);
    for (let yy = midY - 3; yy < midY + 3; yy += 1) {
      for (let xx = x0; xx < x0 + panelLen; xx += 1) {
        if ((xx + yy) % 2 === 0) px(xx, yy, panel[2]);
        if ((xx - x0) % 3 === 2) px(xx, yy, panel[0]);
      }
    }
    rect(x0, midY - 4, panelLen, 1, panel[3]);
    rect(x0, midY + 3, panelLen, 1, panel[0]);
  };
  wing(hullX - panelLen - 2);
  wing(hullX + hullW + 2);
  // Booms out to each wing.
  rect(hullX - 2, midY - 1, 2, 2, hull[2]);
  rect(hullX + hullW, midY - 1, 2, 2, hull[2]);

  // Hull, lit from above with a highlight down the left edge.
  for (let yy = 0; yy < hullH; yy += 1) {
    const t = 1 - yy / Math.max(1, hullH - 1);
    const idx = 1 + Math.round(t * (hull.length - 2));
    rect(hullX, hullY + yy, hullW, 1, hull[Math.min(hull.length - 1, idx)]);
  }
  rect(hullX, hullY, 1, hullH, hull[hull.length - 1]);
  outline(hullX, hullY, hullW, hullH);

  px(hullX + 2, hullY + 2, windowRgb);
  px(hullX + 3, hullY + 2, windowRgb);
  px(hullX + hullW - 3, hullY + Math.floor(hullH / 2), windowRgb);

  // Antenna mast and blinking beacon.
  rect(cx, hullY - mastH, 1, mastH, hull[2]);
  px(cx, hullY - mastH - 1, beaconOn ? beacon : hull[1]);
  if (beaconOn) {
    px(cx - 1, hullY - mastH - 1, hull[3]);
    px(cx + 1, hullY - mastH - 1, hull[3]);
  }

  if (hasPod) {
    rect(cx - 2, hullY + hullH + 1, 4, 3, hull[2]);
    outline(cx - 2, hullY + hullH + 1, 4, 3);
  }

  ctx.putImageData(image, 0, 0);
  return {
    canvas,
    center: { x: cx, y: midY },
    // Between the station's half-height and half-width, so selection brackets and label
    // offsets hug the silhouette instead of floating far off the solar wings.
    radius: Math.round(((hullW + panelLen * 2 + 4) / 2) * 0.72),
  };
}

export function makeStationFrames(spec: StationSpec): Sprite[] {
  return [makeStationSprite(spec, true), makeStationSprite(spec, false)];
}

const SPACE_RAMP = ['#06070a', '#090b10', '#0d1016', '#12161e', '#181d27'].map(hexToRgb);
const NEBULA_RAMP = ['#08080b', '#0f0e13', '#15131a', '#1c1922', '#23202b'].map(hexToRgb);

/**
 * Low-resolution space backdrop, later blown up with smoothing off so its bands and
 * dithering read as intentional pixel art rather than a soft gradient.
 */
export function makeSpaceBackdrop(cols: number, rows: number, seed = 7): HTMLCanvasElement {
  const canvas = createCanvas(Math.max(1, cols), Math.max(1, rows));
  const ctx = canvas.getContext('2d');
  if (!ctx) return canvas;
  const image = ctx.createImageData(canvas.width, canvas.height);
  const data = image.data;
  const w = canvas.width;
  const h = canvas.height;

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const u = x / w;
      const v = y / h;
      const nebula = fbm(u * 3.1, v * 3.1, seed, 4);
      // Brighten toward the centre of the system, fall off at the frame edges.
      const dx = (u - 0.5) * 2;
      const dy = (v - 0.44) * 2;
      const vignette = 1 - clamp01(Math.hypot(dx, dy) * 0.72);
      const value = clamp01(0.14 + vignette * 0.46 + (nebula - 0.5) * 0.4);
      const ramp = nebula > 0.62 ? NEBULA_RAMP : SPACE_RAMP;
      const rgb = ramp[rampIndex(value, ramp.length, x, y)];
      const i = (y * w + x) * 4;
      data[i] = rgb[0];
      data[i + 1] = rgb[1];
      data[i + 2] = rgb[2];
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  return canvas;
}

export interface Star {
  /** Normalised position in [0, 1). */
  x: number;
  y: number;
  /** 0 = faint, 2 = bright. */
  tier: number;
  /** Twinkle phase offset. */
  phase: number;
}

export function makeStarfield(count: number, seed = 23): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i += 1) {
    const r = hash2(i, 1, seed);
    stars.push({
      x: hash2(i, 7, seed),
      y: hash2(i, 13, seed + 3),
      tier: r > 0.94 ? 2 : r > 0.7 ? 1 : 0,
      phase: hash2(i, 29, seed + 9) * Math.PI * 2,
    });
  }
  return stars;
}
