'use client';

import { useEffect, useRef } from "react";
import { Cormorant_Garamond } from "next/font/google";

const cormorant = Cormorant_Garamond({ weight: ["500", "600"], subsets: ["latin"], display: "swap" });

// Same subjects as the hero's default slides
const DEFAULT_ITEMS = [
  "Buddha Statue",
  "Zen Garden",
  "Temple Architecture",
  "Modern Sculpture",
  "Handcrafted with intention",
];

interface GalleryMarqueeProps {
  /** phrases to scroll, e.g. the alt text of the hero slides */
  items?: string[];
  /** scroll speed in px per second */
  speed?: number;
  /** band height in px at the edges */
  height?: number;
  /** true = bow-tie bend like the reference; false = flat straight band */
  bend?: boolean;
}

const Diamond = () => (
  <svg width="20" height="20" viewBox="0 0 28 28" fill="none" aria-hidden="true">
    <polygon points="14,1 27,14 14,27 1,14" fill="none" stroke="#fff" strokeWidth="1.8" />
    <polygon points="14,7 21,14 14,21 7,14" fill="#fff" opacity="0.85" />
  </svg>
);

const CLIP = "polygon(0 0, 30% 14%, 70% 14%, 100% 0, 100% 100%, 70% 86%, 30% 86%, 0 100%)";

export default function GalleryMarquee({
  items = DEFAULT_ITEMS,
  speed = 55,
  height = 110,
  bend = true,
}: GalleryMarqueeProps) {
  const rootRef  = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root  = rootRef.current;
    const track = trackRef.current;
    if (!root || !track) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const els    = Array.from(track.querySelectorAll<HTMLElement>("[data-item]"));

    let offset = 0, setW = 0, rootW = 0, paused = false;
    let last = performance.now();
    let raf = 0;

    const measure = () => {
      rootW = root.clientWidth;
      const first = track.querySelector<HTMLElement>('[data-set="0"]');
      setW = first ? first.offsetWidth : 0;
    };

    const frame = (now: number) => {
      const dt = Math.min(now - last, 50) / 1000;
      last = now;
      if (setW > 0) {
        if (!paused && !reduce) offset = (offset + speed * dt) % setW;
        track.style.transform = `translate3d(${-offset}px,0,0)`;

        if (bend) {
          const cx = rootW / 2;
          for (const el of els) {
            const x = el.offsetLeft + el.offsetWidth / 2 - offset;
            const d = Math.abs(x - cx) / cx;
            const t = Math.min(1, Math.max(0, (d - 0.3) / 0.7));
            el.style.transform = `scale(${0.92 + t * 0.5})`;
          }
        }
      }
      raf = requestAnimationFrame(frame);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(root);
    const onEnter = () => { paused = true; };
    const onLeave = () => { paused = false; };
    root.addEventListener("mouseenter", onEnter);
    root.addEventListener("mouseleave", onLeave);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      root.removeEventListener("mouseenter", onEnter);
      root.removeEventListener("mouseleave", onLeave);
    };
  }, [speed, items, bend]);

  const sets = [0, 1, 2];

  return (
    <section
      ref={rootRef}
      aria-label={items.join(", ")}
      className={cormorant.className}
      style={{
        position: "relative", width: "100%", height, overflow: "hidden", display: "block",
        background: "linear-gradient(100deg, #6344a8 0%, #7c5cbf 45%, #9b6fe0 100%)",
        clipPath: bend ? CLIP : "none",
        WebkitClipPath: bend ? CLIP : "none",
        userSelect: "none",
      }}
    >
      <div
        ref={trackRef}
        style={{
          position: "relative", display: "flex", alignItems: "center",
          width: "max-content", height: "100%", willChange: "transform",
        }}
      >
        {sets.map(s => (
          <div
            key={s}
            data-set={s}
            aria-hidden={s !== 0}
            style={{ display: "flex", alignItems: "center", flexShrink: 0 }}
          >
            {items.map((text, i) => (
              <div key={`${s}-${i}`} style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>
                <span
                  data-item
                  style={{
                    display: "inline-block", padding: "0 34px", whiteSpace: "nowrap",
                    fontSize: 30, fontWeight: 600, letterSpacing: "0.05em", color: "#fff",
                    textTransform: "uppercase", transformOrigin: "center", willChange: "transform",
                  }}
                >
                  {text}
                </span>
                <span data-item style={{ display: "inline-block", padding: "0 10px", lineHeight: 0, transformOrigin: "center" }}>
                  <Diamond />
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}