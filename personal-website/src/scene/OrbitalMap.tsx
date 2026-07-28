import { useEffect, useRef } from 'react';
import {
  HOME_SPRITE,
  OWNER_NAME,
  OWNER_TITLE,
  STATION_RINGS,
  orbitBodies,
  publications,
  type SiteMode,
} from '../data/siteContent';
import {
  makePlanetFrames,
  makeSpaceBackdrop,
  makeStarfield,
  makeStationFrames,
  type Sprite,
} from '../pixel/pixelArt';

/** Vertical squash of the orbit ellipses: the 2.5D orbital-map tilt. */
const TILT_MIN = 0.34;
const TILT_MAX = 0.7;
/** Close orbit is viewed from higher above the plane, so its rings are rounder. */
const INNER_TILT = 0.66;

/** Social orbit radii as fractions of the outermost orbit. */
const ORBIT_SLOTS = [0.44, 0.58, 0.72, 0.86, 1];
/** Home world radius as a fraction of the outermost orbit radius. */
const HOME_SCALE = 0.15;
/** How much the home world grows once the camera has dived into close orbit. */
const HOME_MUL_INNER = 1.8;

const HOME_SPIN_FRAMES = 14;
const BODY_SPIN_FRAMES = 8;
const HOME_SPIN_PERIOD = 26;
const BEACON_PERIOD = 1.1;

const ZOOM_MIN = 0.8;
const ZOOM_MAX = 1.8;

const STAR_COLORS = ['#232932', '#4c5663', '#96a1ac'];
const ORBIT_COLOR = '#2c333c';
const ORBIT_COLOR_ACTIVE = '#6f6a45';
const BRACKET_COLOR = '#e0b355';

const FIT_EVENT = 'orbital-fit';

/** Snaps the camera back to the framing that shows every orbit. */
export function requestOrbitalFit() {
  window.dispatchEvent(new Event(FIT_EVENT));
}

interface OrbitalMapProps {
  mode: SiteMode;
  reducedMotion: boolean;
  mobile: boolean;
  /** Height in CSS px taken by the dock at the bottom of the screen. */
  bottomReserve: number;
  /** Orbital time multiplier; 0 pauses. */
  timeSpeed: number;
  activeId: string | null;
  onActiveChange: (id: string | null) => void;
}

interface Box {
  w: number;
  h: number;
}

function clamp(n: number, min: number, max: number) {
  return n < min ? min : n > max ? max : n;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function smoothstep(t: number) {
  const c = clamp(t, 0, 1);
  return c * c * (3 - 2 * c);
}

function overlaps(ax: number, ay: number, a: Box, bx: number, by: number, b: Box, pad: number) {
  return (
    Math.abs(ax - bx) * 2 < a.w + b.w + pad * 2 &&
    Math.abs(ay - by) * 2 < a.h + b.h + pad * 2
  );
}

interface Actor {
  id: string;
  px: number;
  py: number;
  scale: number;
  radius: number;
  front: boolean;
  occluded: boolean;
  alpha: number;
  angle: number;
  orbitR: number;
  sprite: Sprite;
}

export function OrbitalMap({
  mode,
  reducedMotion,
  mobile,
  bottomReserve,
  timeSpeed,
  activeId,
  onActiveChange,
}: OrbitalMapProps) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const plateRef = useRef<HTMLSpanElement>(null);
  const nodeRefs = useRef(new Map<string, HTMLElement | null>());
  const labelRefs = useRef(new Map<string, HTMLElement | null>());

  const activeRef = useRef(activeId);
  const speedRef = useRef(timeSpeed);
  const reserveRef = useRef(bottomReserve);
  const reducedRef = useRef(reducedMotion);
  const mobileRef = useRef(mobile);
  const diveTarget = useRef(mode === 'publications' ? 1 : 0);
  const zoomTarget = useRef(1);
  const pointer = useRef({ x: 0.5, y: 0.5 });

  activeRef.current = activeId;
  speedRef.current = timeSpeed;
  reserveRef.current = bottomReserve;
  reducedRef.current = reducedMotion;
  mobileRef.current = mobile;
  diveTarget.current = mode === 'publications' ? 1 : 0;

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const homeFrames = makePlanetFrames(HOME_SPRITE, HOME_SPIN_FRAMES);
    const bodyFrames = new Map<string, Sprite[]>();
    orbitBodies.forEach((body) => {
      bodyFrames.set(body.id, makePlanetFrames(body.sprite, BODY_SPIN_FRAMES));
    });
    const stationFrames = new Map<string, Sprite[]>();
    publications.forEach((pub) => {
      stationFrames.set(pub.id, makeStationFrames(pub.sprite));
    });
    const stars = makeStarfield(mobile ? 110 : 170);

    // Widest sprite expressed as a fraction of the outermost orbit radius, so framing can
    // leave room for it instead of clipping it at the edge of the frame.
    const widestSprite = Math.max(
      ...[...bodyFrames.values(), ...stationFrames.values()].map(
        (frames) => frames[0].canvas.width / 2,
      ),
    );
    const spriteMargin = (widestSprite / (HOME_SPRITE.size / 2)) * HOME_SCALE;

    let w = 1;
    let h = 1;
    let backdrop: HTMLCanvasElement | null = null;
    let backdropKey = '';
    let zoom = 1;
    let dive = diveTarget.current;
    let elapsed = 0;
    let wall = performance.now();
    let parallaxX = 0;
    let parallaxY = 0;
    let frameId = 0;

    /** Last hit-box size written per node, so the DOM is only touched on change. */
    const hitSizes = new Map<string, number>();
    /** Measured label sizes in CSS px, used for nameplate collision avoidance. */
    const labelBoxes = new Map<string, Box>();
    const flipped = new Map<string, boolean>();
    const away = new Map<string, boolean>();
    let plateBox: Box = { w: 200, h: 60 };

    const measureText = () => {
      labelRefs.current.forEach((el, id) => {
        if (el) labelBoxes.set(id, { w: el.offsetWidth, h: el.offsetHeight });
      });
      const plate = plateRef.current;
      if (plate) plateBox = { w: plate.offsetWidth, h: plate.offsetHeight };
    };

    measureText();
    // Web fonts land after first paint and change every label's width.
    void document.fonts.ready.then(measureText);

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      w = Math.max(1, Math.round(rect.width * dpr));
      h = Math.max(1, Math.round(rect.height * dpr));
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      measureText();
    };

    resize();

    const observer = new ResizeObserver(resize);
    observer.observe(wrap);

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();
      const step = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY;
      zoomTarget.current = clamp(
        zoomTarget.current * Math.exp(-step * 0.0011),
        ZOOM_MIN,
        ZOOM_MAX,
      );
    };
    wrap.addEventListener('wheel', onWheel, { passive: false });

    const onPointerMove = (event: PointerEvent) => {
      pointer.current.x = event.clientX / Math.max(1, window.innerWidth);
      pointer.current.y = event.clientY / Math.max(1, window.innerHeight);
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });

    const onFit = () => {
      zoomTarget.current = 1;
    };
    window.addEventListener(FIT_EVENT, onFit);

    const draw = (now: number) => {
      frameId = requestAnimationFrame(draw);
      const dt = Math.min(0.05, (now - wall) / 1000);
      wall = now;

      const speed = speedRef.current;
      const still = reducedRef.current;
      elapsed += dt * speed;
      zoom += (zoomTarget.current - zoom) * Math.min(1, dt * 6);
      dive += (diveTarget.current - dive) * Math.min(1, dt * (still ? 8 : 2.1));
      if (Math.abs(diveTarget.current - dive) < 0.002) dive = diveTarget.current;

      const ease = smoothstep(dive);
      /** Peaks halfway through the flight; used for the overshoot and star streaming. */
      const flight = Math.sin(Math.PI * clamp(dive, 0, 1));

      // Frame the system in whatever the status bar and dock leave free.
      const topReserve = (mobileRef.current ? 46 : 42) * dpr;
      const bottom = Math.max(topReserve + 80, h - reserveRef.current * dpr);
      const halfH = (bottom - topReserve) / 2;
      // Flatten the orbit plane on wide windows and open it up on tall ones so the system
      // fills the free space instead of hugging one axis.
      const rWidth = (w / 2 - 14 * dpr) / (1 + spriteMargin);
      const tiltOuter = clamp(halfH / rWidth - spriteMargin, TILT_MIN, TILT_MAX);
      const tilt = lerp(tiltOuter, INNER_TILT, ease);
      const rOuter = Math.min(rWidth, halfH / (tiltOuter + spriteMargin));
      const rBase = Math.min(rWidth, halfH / (tilt + spriteMargin)) * zoom;

      // Pixel scale is pinned to the outer framing so sprites keep a steady size while the
      // camera dives; only the home world is allowed to grow.
      const unit = clamp(Math.round((rOuter * HOME_SCALE) / (HOME_SPRITE.size / 2)), 2, 14);
      const unitZ = Math.max(2, Math.round(unit * zoom));
      const homeUnit = Math.max(
        2,
        Math.round(unitZ * (lerp(1, HOME_MUL_INNER, ease) + flight * 0.35)),
      );
      const homeRadius = HOME_SPRITE.size * 0.5 * homeUnit;

      // The low-res backdrop is only regenerated when the pixel grid changes size.
      const cols = Math.ceil(w / unitZ) + 1;
      const rows = Math.ceil(h / unitZ) + 1;
      const key = `${cols}x${rows}`;
      if (key !== backdropKey) {
        backdrop = makeSpaceBackdrop(cols, rows);
        backdropKey = key;
      }

      const targetPX = still ? 0 : (pointer.current.x - 0.5) * 14 * dpr;
      const targetPY = still ? 0 : (pointer.current.y - 0.5) * 9 * dpr;
      parallaxX += (targetPX - parallaxX) * Math.min(1, dt * 3);
      parallaxY += (targetPY - parallaxY) * Math.min(1, dt * 3);

      const cx = w / 2 + parallaxX;
      const cy = (topReserve + bottom) / 2 + parallaxY;

      ctx.imageSmoothingEnabled = false;
      ctx.globalAlpha = 1;
      ctx.clearRect(0, 0, w, h);
      if (backdrop) ctx.drawImage(backdrop, 0, 0, cols * unitZ, rows * unitZ);

      // Starfield, snapped to the pixel grid so it shares the sprite resolution. It streams
      // outward from the centre during the dive to sell the forward motion.
      const starPx = Math.max(1, Math.round(unitZ * 0.5));
      const starSpread = 1 + flight * 0.5;
      stars.forEach((star) => {
        const twinkle =
          star.tier === 0 || still ? 1 : 0.55 + 0.45 * Math.sin(now / 700 + star.phase);
        const tier = star.tier === 2 && twinkle < 0.75 ? 1 : star.tier;
        ctx.fillStyle = STAR_COLORS[tier];
        const sx =
          Math.round((cx + (star.x * w - w / 2) * starSpread) / starPx) * starPx;
        const sy =
          Math.round((cy + (star.y * h - h / 2) * starSpread) / starPx) * starPx;
        if (sx < -starPx || sy < -starPx || sx > w || sy > h) return;
        ctx.fillRect(sx, sy, starPx, starPx);
        if (tier === 2) {
          ctx.fillRect(sx - starPx, sy, starPx, starPx);
          ctx.fillRect(sx + starPx, sy, starPx, starPx);
          ctx.fillRect(sx, sy - starPx, starPx, starPx);
          ctx.fillRect(sx, sy + starPx, starPx, starPx);
        }
      });

      const active = activeRef.current;
      const socialAlpha = clamp(1 - ease * 2.4, 0, 1);
      const stationAlpha = clamp((ease - 0.42) / 0.34, 0, 1);
      /** Social orbits rush outward past the camera as it dives toward the home world. */
      const socialSpread = 1 + ease * ease * 7;
      const stationSpread = lerp(0.12, 1, ease);

      const drawOrbitRing = (r: number, alpha: number, isActive: boolean) => {
        if (alpha <= 0.02 || r <= 1) return;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = isActive ? ORBIT_COLOR_ACTIVE : ORBIT_COLOR;
        const dot = Math.max(1, Math.round(unitZ * 0.42));
        const steps = Math.max(64, Math.round((Math.PI * 2 * r) / (dot * 2.6)));
        for (let s = 0; s < steps; s += 1) {
          if (s % 4 >= 2) continue;
          const ang = (s / steps) * Math.PI * 2;
          const rx = Math.round((cx + Math.cos(ang) * r) / dot) * dot;
          const ry = Math.round((cy + Math.sin(ang) * r * tilt) / dot) * dot;
          if (rx < -dot || ry < -dot || rx > w || ry > h) continue;
          ctx.fillRect(rx, ry, dot, dot);
        }
        ctx.globalAlpha = 1;
      };

      ORBIT_SLOTS.forEach((slot, index) => {
        const body = orbitBodies.find((candidate) => candidate.orbit === index);
        drawOrbitRing(rBase * slot * socialSpread, socialAlpha * 0.9, active === body?.id);
      });
      STATION_RINGS.forEach((slot, index) => {
        const onRing = publications.some(
          (pub) => pub.ring === index && pub.id === active,
        );
        drawOrbitRing(rBase * slot * stationSpread, stationAlpha * 0.9, onRing);
      });

      const homeSprite =
        homeFrames[
          Math.floor((elapsed / HOME_SPIN_PERIOD) * HOME_SPIN_FRAMES) % HOME_SPIN_FRAMES
        ] ?? homeFrames[0];

      const drawSprite = (sprite: Sprite, px: number, py: number, scale: number) => {
        ctx.drawImage(
          sprite.canvas,
          Math.round(px - sprite.center.x * scale),
          Math.round(py - sprite.center.y * scale),
          sprite.canvas.width * scale,
          sprite.canvas.height * scale,
        );
      };

      const drawBrackets = (px: number, py: number, radius: number) => {
        const t = Math.max(1, Math.round(unitZ * 0.4));
        const arm = Math.max(t * 3, Math.round(radius * 0.5));
        const gap = Math.round(radius + t * 2.5);
        ctx.fillStyle = BRACKET_COLOR;
        ([[-1, -1], [1, -1], [-1, 1], [1, 1]] as [number, number][]).forEach(([sx, sy]) => {
          const ox = Math.round(px + sx * gap);
          const oy = Math.round(py + sy * gap);
          ctx.fillRect(sx < 0 ? ox : ox - arm, sy < 0 ? oy : oy - t, arm, t);
          ctx.fillRect(sx < 0 ? ox : ox - t, sy < 0 ? oy : oy - arm, t, arm);
        });
      };

      const place = (
        id: string,
        orbitR: number,
        angle: number,
        sprite: Sprite,
        spriteRadius: number,
        alpha: number,
        bob: number,
      ): Actor => {
        const depth = Math.sin(angle);
        const scale = Math.max(2, Math.round(unitZ * (1 + 0.12 * depth)));
        const px = cx + Math.cos(angle) * orbitR;
        const py = cy + depth * orbitR * tilt + bob;
        const radius = spriteRadius * scale;
        return {
          id,
          px,
          py,
          scale,
          radius,
          front: depth > 0,
          occluded: depth <= 0 && Math.hypot(px - cx, py - cy) < homeRadius * 0.96,
          alpha,
          angle,
          orbitR,
          sprite,
        };
      };

      const actors: Actor[] = [];

      if (socialAlpha > 0.02) {
        orbitBodies.forEach((body) => {
          const frames = bodyFrames.get(body.id);
          if (!frames) return;
          const spin =
            Math.floor((elapsed / (body.period * 0.34)) * BODY_SPIN_FRAMES) %
            BODY_SPIN_FRAMES;
          actors.push(
            place(
              body.id,
              rBase * (ORBIT_SLOTS[body.orbit] ?? 1) * socialSpread,
              (body.phase + elapsed / body.period) * Math.PI * 2,
              frames[spin] ?? frames[0],
              body.sprite.size * 0.5,
              socialAlpha,
              0,
            ),
          );
        });
      }

      if (stationAlpha > 0.02) {
        publications.forEach((pub, index) => {
          const frames = stationFrames.get(pub.id);
          if (!frames) return;
          const blink = Math.floor(elapsed / BEACON_PERIOD + index * 0.5) % 2;
          const bob = still ? 0 : Math.sin(now / 900 + index * 1.7) * unitZ * 0.8;
          actors.push(
            place(
              pub.id,
              rBase * (STATION_RINGS[pub.ring] ?? 1) * stationSpread,
              (pub.phase + elapsed / pub.period) * Math.PI * 2,
              frames[blink] ?? frames[0],
              frames[0].radius,
              stationAlpha,
              bob,
            ),
          );
        });
      }

      const drawTrail = (item: Actor) => {
        const trailPx = Math.max(1, Math.round(unitZ * 0.38));
        for (let k = 1; k <= 5; k += 1) {
          const ang = item.angle - k * 0.055;
          const tx = Math.round((cx + Math.cos(ang) * item.orbitR) / trailPx) * trailPx;
          const ty =
            Math.round((cy + Math.sin(ang) * item.orbitR * tilt) / trailPx) * trailPx;
          ctx.fillStyle = `rgba(150, 160, 140, ${(0.2 - k * 0.032) * item.alpha})`;
          ctx.fillRect(tx, ty, trailPx, trailPx);
        }
      };

      const paint = (item: Actor) => {
        ctx.globalAlpha = item.alpha;
        if (speed > 0) drawTrail(item);
        drawSprite(item.sprite, item.px, item.py, item.scale);
        if (item.id === active) drawBrackets(item.px, item.py, item.radius);
        ctx.globalAlpha = 1;
      };

      // Far half of every orbit, then the home world, then the near half.
      actors.filter((item) => !item.front && !item.occluded).forEach(paint);
      drawSprite(homeSprite, cx, cy, homeUnit);
      actors.filter((item) => item.front).forEach(paint);

      // Park the HTML hit targets over their sprites.
      const plateCX = cx / dpr;
      const plateCY = cy / dpr + homeRadius / dpr + 8 + plateBox.h / 2;

      actors.forEach((item) => {
        const el = nodeRefs.current.get(item.id);
        if (!el) return;
        const cssX = item.px / dpr;
        const cssY = item.py / dpr;
        el.style.transform = `translate3d(${cssX.toFixed(1)}px, ${cssY.toFixed(1)}px, 0)`;
        el.style.zIndex = item.front ? '4' : '2';

        const hit = Math.round((item.radius * 2 + 14 * dpr) / dpr);
        if (hitSizes.get(item.id) !== hit) {
          el.style.setProperty('--hit', `${hit}px`);
          hitSizes.set(item.id, hit);
        }

        // Labels hang below their body, but flip above when that would collide with the
        // home world's nameplate. The test always uses the unflipped position, otherwise
        // flipping would clear the collision and the label would strobe.
        const label = labelBoxes.get(item.id) ?? { w: 60, h: 16 };
        const wasFlipped = flipped.get(item.id) ?? false;
        const belowY = cssY + hit / 2 + 6 + label.h / 2;
        const hits = overlaps(
          cssX,
          belowY,
          label,
          plateCX,
          plateCY,
          plateBox,
          wasFlipped ? 16 : 4,
        );
        if (hits !== wasFlipped) {
          flipped.set(item.id, hits);
          el.classList.toggle('is-flipped', hits);
        }

        // Sprites behind the home world are hidden by draw order; their labels stay
        // clickable so no link is ever unreachable, just dimmed.
        el.classList.toggle('is-occluded', item.occluded);
      });

      // Anything that belongs to the scene the camera has left is parked out of reach.
      const hideSocial = socialAlpha < 0.35;
      const hideStations = stationAlpha < 0.35;
      nodeRefs.current.forEach((el, id) => {
        if (!el || id === 'home') return;
        const isStation = publications.some((pub) => pub.id === id);
        const hidden = isStation ? hideStations : hideSocial;
        if (away.get(id) !== hidden) {
          away.set(id, hidden);
          el.classList.toggle('is-away', hidden);
        }
      });

      const homeEl = nodeRefs.current.get('home');
      if (homeEl) {
        homeEl.style.transform = `translate3d(${(cx / dpr).toFixed(1)}px, ${(
          cy / dpr
        ).toFixed(1)}px, 0)`;
        const hit = Math.round((homeRadius * 2) / dpr);
        if (hitSizes.get('home') !== hit) {
          homeEl.style.setProperty('--hit', `${hit}px`);
          hitSizes.set('home', hit);
        }
      }
    };

    frameId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frameId);
      observer.disconnect();
      wrap.removeEventListener('wheel', onWheel);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener(FIT_EVENT, onFit);
    };
    // Only the starfield density depends on `mobile`; every other input is read through a
    // ref so the animation loop never has to be torn down mid-flight.
  }, [mobile]);

  return (
    <div className="orbital-map" ref={wrapRef}>
      <canvas className="orbital-canvas" ref={canvasRef} aria-hidden="true" />

      <div className="orbital-nodes">
        <div
          className="orbital-node orbital-home"
          ref={(el) => {
            nodeRefs.current.set('home', el);
          }}
        >
          <span
            className={`home-plate ${mode === 'publications' ? 'is-compact' : ''}`}
            ref={plateRef}
          >
            <h1 className="home-plate-name">{OWNER_NAME}</h1>
            <span className="home-plate-title">
              {mode === 'publications' ? 'LOW ORBIT' : OWNER_TITLE}
            </span>
          </span>
        </div>

        {orbitBodies.map((body) => (
          <a
            key={body.id}
            className="orbital-node orbital-body"
            ref={(el) => {
              nodeRefs.current.set(body.id, el);
            }}
            href={body.url}
            target="_blank"
            rel="noopener noreferrer"
            title={`${body.label} \u2014 ${body.url}`}
            onPointerEnter={() => onActiveChange(body.id)}
            onPointerLeave={() => onActiveChange(null)}
            onFocus={() => onActiveChange(body.id)}
            onBlur={() => onActiveChange(null)}
          >
            <span
              className="orbital-label"
              ref={(el) => {
                labelRefs.current.set(body.id, el);
              }}
            >
              {body.label}
            </span>
          </a>
        ))}

        {publications.map((pub) => (
          <a
            key={pub.id}
            className="orbital-node orbital-body is-station is-away"
            ref={(el) => {
              nodeRefs.current.set(pub.id, el);
            }}
            href={pub.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={pub.title}
            title={pub.title}
            onPointerEnter={() => onActiveChange(pub.id)}
            onPointerLeave={() => onActiveChange(null)}
            onFocus={() => onActiveChange(pub.id)}
            onBlur={() => onActiveChange(null)}
          >
            <span
              className="orbital-label"
              ref={(el) => {
                labelRefs.current.set(pub.id, el);
              }}
            >
              {pub.code}
            </span>
          </a>
        ))}
      </div>
    </div>
  );
}
