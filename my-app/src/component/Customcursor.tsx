"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import type { CSSProperties } from "react";

// ─── Scoped styles ────────────────────────────────────────────────────────────
//
// States
//   default  → soft dot + trailing ring
//   cc-link  → over links / buttons : dot becomes a tiny crystal, ring becomes a
//              larger glowing diamond (rotated rounded square)
//   cc-text  → over inputs / textareas : dot becomes a thin text bar, ring fades
//   cc-pressed → while the mouse button is held down
//   cc-hidden  → only when the pointer leaves the page / zone

const CURSOR_STYLES = `
  .cc-dot {
    position: fixed;
    top: 0;
    left: 0;
    width: 10px;
    height: 10px;
    border-radius: 50%;
    pointer-events: none;
    z-index: 999999;
    transform: translate(-50%, -50%);
    will-change: left, top, transform;
    transition:
      opacity 0.2s ease,
      transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1),
      width 0.25s ease,
      height 0.25s ease,
      border-radius 0.25s ease,
      background 0.4s ease;
  }

  .cc-ring {
    position: fixed;
    top: 0;
    left: 0;
    width: 38px;
    height: 38px;
    border-radius: 50%;
    border-width: 1.5px;
    border-style: solid;
    background: transparent;
    pointer-events: none;
    z-index: 999998;
    transform: translate(-50%, -50%);
    will-change: left, top, transform;
    transition:
      opacity 0.3s ease,
      transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1),
      border-radius 0.3s ease,
      background 0.3s ease,
      box-shadow 0.3s ease,
      border-color 0.4s ease;
  }

  /* ── Link / button: crystal diamond ───────────────────────────────────── */
  .cc-dot.cc-link {
    border-radius: 2px;
    transform: translate(-50%, -50%) rotate(45deg) scale(0.75);
  }
  .cc-ring.cc-link {
    border-radius: 9px;
    border-width: 1px;
    background: var(--cc-fill);
    box-shadow: 0 0 22px var(--cc-glow);
    transform: translate(-50%, -50%) rotate(45deg) scale(1.4);
  }

  /* ── Text field: thin bar ─────────────────────────────────────────────── */
  .cc-dot.cc-text {
    width: 2px;
    height: 22px;
    border-radius: 2px;
  }
  .cc-ring.cc-text {
    opacity: 0.25;
    transform: translate(-50%, -50%) scale(0.55);
  }

  /* ── Pressed ──────────────────────────────────────────────────────────── */
  .cc-dot.cc-pressed {
    transform: translate(-50%, -50%) scale(1.5);
  }
  .cc-dot.cc-link.cc-pressed {
    transform: translate(-50%, -50%) rotate(45deg) scale(1.1);
  }
  .cc-ring.cc-pressed {
    transform: translate(-50%, -50%) scale(0.8);
  }
  .cc-ring.cc-link.cc-pressed {
    transform: translate(-50%, -50%) rotate(45deg) scale(1.1);
  }

  /* ── Hidden (pointer outside the zone) ────────────────────────────────── */
  .cc-dot.cc-hidden {
    opacity: 0 !important;
    transform: translate(-50%, -50%) scale(0.2) !important;
  }
  .cc-ring.cc-hidden {
    opacity: 0 !important;
    transform: translate(-50%, -50%) scale(2.5) !important;
    border-color: transparent !important;
  }

  .cc-zone,
  .cc-zone * {
    cursor: none !important;
  }

  @media (prefers-reduced-motion: reduce) {
    .cc-dot, .cc-ring { transition-duration: 0.01s !important; }
  }
`;

// ─── Color utilities ──────────────────────────────────────────────────────────

type RGB = { r: number; g: number; b: number };

/** Parse any CSS color string → { r, g, b } using canvas, or null if transparent */
function parseColor(color: string): RGB | null {
  if (!color || color === "transparent" || color === "rgba(0, 0, 0, 0)") return null;

  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 1;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.fillStyle = color;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  if (a < 10) return null; // nearly transparent — ignore
  return { r, g, b };
}

/** WCAG relative luminance */
function luminance({ r, g, b }: RGB): number {
  return [r, g, b]
    .map((c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    })
    .reduce((acc, c, i) => acc + c * [0.2126, 0.7152, 0.0722][i], 0);
}

/**
 * Walk up the DOM tree from `el` to find the first ancestor
 * with a non-transparent computed background color.
 */
function getEffectiveBgColor(el: Element | null): RGB {
  let node: Element | null = el;

  while (node && node !== document.documentElement) {
    const bg = window.getComputedStyle(node as HTMLElement).backgroundColor;
    const parsed = parseColor(bg);
    if (parsed) return parsed;
    node = node.parentElement;
  }

  for (const root of [document.documentElement, document.body]) {
    const bg = window.getComputedStyle(root).backgroundColor;
    const parsed = parseColor(bg);
    if (parsed) return parsed;
  }

  return { r: 250, g: 247, b: 244 }; // site ivory fallback
}

interface CursorColors {
  dot: string;   // dot colour
  ring: string;  // ring border colour
  fill: string;  // soft fill used inside the ring on hover
  glow: string;  // glow used around the ring on hover
}

/**
 * Given a background luminance, return cursor colours that contrast well
 * AND match the crystal / spiritual theme.
 *
 *   Very dark  (lum < 0.08)  → bright lavender  #d4aaff
 *   Dark-mid   (lum < 0.22)  → soft violet       #c49dff
 *   Mid-purple (lum < 0.40)  → white             #ffffff
 *   Light      (lum >= 0.40) → deep violet       #7b2fbf  (brand colour)
 */
function getCursorColors(bg: RGB): CursorColors {
  const lum = luminance(bg);

  if (lum < 0.08)
    return { dot: "#d4aaff", ring: "rgba(212,170,255,0.75)", fill: "rgba(212,170,255,0.14)", glow: "rgba(212,170,255,0.35)" };
  if (lum < 0.22)
    return { dot: "#c49dff", ring: "rgba(196,157,255,0.70)", fill: "rgba(196,157,255,0.14)", glow: "rgba(196,157,255,0.35)" };
  if (lum < 0.40)
    return { dot: "#ffffff", ring: "rgba(255,255,255,0.80)", fill: "rgba(255,255,255,0.16)", glow: "rgba(255,255,255,0.35)" };
  return   { dot: "#7b2fbf", ring: "rgba(123,47,191,0.65)",  fill: "rgba(123,47,191,0.10)",  glow: "rgba(155,111,224,0.40)" };
}

const DEFAULT_COLORS: CursorColors = {
  dot: "#7b2fbf",
  ring: "rgba(123,47,191,0.65)",
  fill: "rgba(123,47,191,0.10)",
  glow: "rgba(155,111,224,0.40)",
};

// ─── Interactive element detection ────────────────────────────────────────────

const INTERACTIVE =
  "button, a, [role='button'], select, label, summary, [tabindex]:not([tabindex='-1'])";
const TEXT_FIELD =
  "textarea, input:not([type='button']):not([type='submit']):not([type='reset']):not([type='checkbox']):not([type='radio']):not([type='range']):not([type='file']), [contenteditable='true']";

type Mode = "default" | "link" | "text";

function getMode(target: EventTarget | null): Mode {
  const el = target as HTMLElement | null;
  if (!el || !el.closest) return "default";
  if (el.closest(TEXT_FIELD)) return "text";
  if (el.closest(INTERACTIVE) || el.closest("input")) return "link";
  return "default";
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface CustomCursorProps {
  /**
   * CSS selector for the zone where the custom cursor is active.
   * Defaults to full `body`.
   * Example: "#app", ".page-wrapper"
   */
  containerSelector?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function CustomCursor({ containerSelector }: CustomCursorProps) {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  const ringPos  = useRef({ x: -200, y: -200 });
  const mousePos = useRef({ x: -200, y: -200 });
  const rafRef    = useRef<number>(0);
  const detectRaf = useRef<number>(0);
  const frameCount = useRef(0);

  const [inZone,  setInZone]  = useState(false);
  const [mode,    setMode]    = useState<Mode>("default");
  const [pressed, setPressed] = useState(false);
  const [colors,  setColors]  = useState<CursorColors>(DEFAULT_COLORS);

  // ── BG detection — runs every 6 animation frames (~100ms) ─────────────────
  const detectBg = useCallback(() => {
    frameCount.current++;

    if (frameCount.current % 6 === 0) {
      const { x, y } = mousePos.current;

      // Hide cursor elements so elementFromPoint doesn't hit them
      const dot  = dotRef.current;
      const ring = ringRef.current;
      if (dot)  dot.style.visibility  = "hidden";
      if (ring) ring.style.visibility = "hidden";

      const el = document.elementFromPoint(x, y);

      if (dot)  dot.style.visibility  = "";
      if (ring) ring.style.visibility = "";

      if (el) {
        const next = getCursorColors(getEffectiveBgColor(el));
        // only update state when something actually changed
        setColors((prev) => (prev.dot === next.dot ? prev : next));
      }
    }

    detectRaf.current = requestAnimationFrame(detectBg);
  }, []);

  useEffect(() => {
    // Don't take over the cursor on touch-only devices
    if (window.matchMedia("(hover: none)").matches) return;

    // Inject scoped styles once
    const styleId = "cc-styles";
    if (!document.getElementById(styleId)) {
      const tag = document.createElement("style");
      tag.id = styleId;
      tag.textContent = CURSOR_STYLES;
      document.head.appendChild(tag);
    }

    const zone = containerSelector
      ? (document.querySelector(containerSelector) as HTMLElement | null)
      : document.body;

    if (!zone) return;

    zone.classList.add("cc-zone");

    // ── Event handlers ──────────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      // Dot follows mouse instantly
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top  = `${e.clientY}px`;
      }
      // Show as soon as the mouse moves inside the page (covers first load)
      setInZone(true);
    };

    const onZoneEnter = () => setInZone(true);
    const onZoneLeave = () => { setInZone(false); setPressed(false); };

    // The cursor now stays visible over links / buttons — it just changes shape
    const onOver = (e: MouseEvent) => setMode(getMode(e.target));

    const onDown = () => setPressed(true);
    const onUp   = () => setPressed(false);

    // ── Ring animation loop (smooth lag) ────────────────────────────────────
    const animateRing = () => {
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.12;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.left = `${ringPos.current.x}px`;
        ringRef.current.style.top  = `${ringPos.current.y}px`;
      }
      rafRef.current = requestAnimationFrame(animateRing);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup",   onUp);
    zone.addEventListener("mouseenter", onZoneEnter);
    zone.addEventListener("mouseleave", onZoneLeave);
    zone.addEventListener("mouseover",  onOver);

    rafRef.current    = requestAnimationFrame(animateRing);
    detectRaf.current = requestAnimationFrame(detectBg);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup",   onUp);
      zone.removeEventListener("mouseenter", onZoneEnter);
      zone.removeEventListener("mouseleave", onZoneLeave);
      zone.removeEventListener("mouseover",  onOver);
      cancelAnimationFrame(rafRef.current);
      cancelAnimationFrame(detectRaf.current);
      zone.classList.remove("cc-zone");
    };
  }, [containerSelector, detectBg]);

  const stateClasses =
    (inZone ? "" : " cc-hidden") +
    (mode === "link" ? " cc-link" : mode === "text" ? " cc-text" : "") +
    (pressed ? " cc-pressed" : "");

  const ringStyle = {
    borderColor: inZone ? colors.ring : "transparent",
    "--cc-fill": colors.fill,
    "--cc-glow": colors.glow,
  } as CSSProperties;

  return (
    <>
      <div
        ref={dotRef}
        className={`cc-dot${stateClasses}`}
        style={{ background: colors.dot }}
      />
      <div
        ref={ringRef}
        className={`cc-ring${stateClasses}`}
        style={ringStyle}
      />
    </>
  );
}