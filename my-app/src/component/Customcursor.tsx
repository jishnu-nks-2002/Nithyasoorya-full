import { useState, useEffect, useRef, useCallback } from "react";

// ─── Scoped styles ────────────────────────────────────────────────────────────

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
    will-change: left, top;
    transition: opacity 0.2s ease, transform 0.22s ease, background 0.4s ease;
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
    pointer-events: none;
    z-index: 999998;
    transform: translate(-50%, -50%);
    will-change: left, top;
    transition: opacity 0.3s ease, transform 0.3s ease, border-color 0.4s ease;
  }

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
`;

// ─── Color utilities ──────────────────────────────────────────────────────────

/** Parse any CSS color string → { r, g, b } using canvas, or null if transparent */
function parseColor(color: string): { r: number; g: number; b: number } | null {
  if (!color || color === "transparent" || color === "rgba(0, 0, 0, 0)") return null;

  // Use a tiny offscreen canvas to resolve any CSS color format
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
function luminance({ r, g, b }: { r: number; g: number; b: number }): number {
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
function getEffectiveBgColor(el: Element | null): { r: number; g: number; b: number } {
  let node: Element | null = el;

  while (node && node !== document.documentElement) {
    const bg = window.getComputedStyle(node as HTMLElement).backgroundColor;
    const parsed = parseColor(bg);
    if (parsed) return parsed;
    node = node.parentElement;
  }

  // Final fallback: html / body background
  for (const root of [document.documentElement, document.body]) {
    const bg = window.getComputedStyle(root).backgroundColor;
    const parsed = parseColor(bg);
    if (parsed) return parsed;
  }

  return { r: 250, g: 247, b: 244 }; // site ivory fallback
}

/**
 * Given a background luminance, return cursor colors that will
 * contrast well AND match the crystal/spiritual site theme.
 *
 * Bands:
 *   Very dark  (lum < 0.08)  → bright lavender  #d4aaff
 *   Dark-mid   (lum < 0.22)  → soft violet       #c49dff
 *   Mid-purple (lum < 0.40)  → white             #ffffff
 *   Light      (lum >= 0.40) → deep violet       #7b2fbf  (original brand colour)
 */
function getCursorColors(bg: { r: number; g: number; b: number }): {
  dot: string;
  ring: string;
} {
  const lum = luminance(bg);

  if (lum < 0.08) return { dot: "#d4aaff", ring: "rgba(212,170,255,0.65)" };
  if (lum < 0.22) return { dot: "#c49dff", ring: "rgba(196,157,255,0.60)" };
  if (lum < 0.40) return { dot: "#ffffff", ring: "rgba(255,255,255,0.70)" };
  return               { dot: "#7b2fbf", ring: "rgba(123,47,191,0.55)"  };
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

  const [hidden,    setHidden]    = useState(false);
  const [inZone,    setInZone]    = useState(false);
  const [dotColor,  setDotColor]  = useState("#7b2fbf");
  const [ringColor, setRingColor] = useState("rgba(123,47,191,0.55)");

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
        const bg     = getEffectiveBgColor(el);
        const colors = getCursorColors(bg);
        setDotColor(colors.dot);
        setRingColor(colors.ring);
      }
    }

    detectRaf.current = requestAnimationFrame(detectBg);
  }, []);

  useEffect(() => {
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

    const INTERACTIVE =
      "button, a, [role='button'], input, textarea, select, label, [tabindex]";

    // ── Event handlers ──────────────────────────────────────────────────────
    const onMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      // Dot follows mouse instantly
      if (dotRef.current) {
        dotRef.current.style.left = `${e.clientX}px`;
        dotRef.current.style.top  = `${e.clientY}px`;
      }
    };

    const onZoneEnter = () => setInZone(true);
    const onZoneLeave = () => setInZone(false);

    const onOver = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest(INTERACTIVE)) setHidden(true);
    };
    const onOut = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest(INTERACTIVE)) setHidden(false);
    };

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
    zone.addEventListener("mouseenter", onZoneEnter);
    zone.addEventListener("mouseleave", onZoneLeave);
    zone.addEventListener("mouseover",  onOver);
    zone.addEventListener("mouseout",   onOut);

    rafRef.current    = requestAnimationFrame(animateRing);
    detectRaf.current = requestAnimationFrame(detectBg);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      zone.removeEventListener("mouseenter", onZoneEnter);
      zone.removeEventListener("mouseleave", onZoneLeave);
      zone.removeEventListener("mouseover",  onOver);
      zone.removeEventListener("mouseout",   onOut);
      cancelAnimationFrame(rafRef.current);
      cancelAnimationFrame(detectRaf.current);
      zone.classList.remove("cc-zone");
    };
  }, [containerSelector, detectBg]);

  const show = inZone && !hidden;

  return (
    <>
      <div
        ref={dotRef}
        className={`cc-dot${show ? "" : " cc-hidden"}`}
        style={{ background: dotColor }}
      />
      <div
        ref={ringRef}
        className={`cc-ring${show ? "" : " cc-hidden"}`}
        style={{ borderColor: show ? ringColor : "transparent" }}
      />
    </>
  );
}