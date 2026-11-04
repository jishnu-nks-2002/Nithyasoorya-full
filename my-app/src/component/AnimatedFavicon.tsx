"use client";

import { useEffect } from "react";

const SIZE = 64;
const FRAME_MS = 33; // ~30 fps
const PERIOD = 2800; // one full shine cycle
const SWEEP_PORTION = 0.6; // share of the cycle spent sweeping
const TWINKLE_PERIOD = 1400;

const easeInOutSine = (x: number) => -(Math.cos(Math.PI * x) - 1) / 2;

export default function AnimatedFavicon() {
  useEffect(() => {
    const canvas = document.createElement("canvas");
    canvas.width = SIZE;
    canvas.height = SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    // Replace Next's static icon links with one we control
    document
      .querySelectorAll("link[rel~='icon'], link[rel='shortcut icon']")
      .forEach((el) => el.remove());
    const link = document.createElement("link");
    link.rel = "icon";
    link.type = "image/png";
    document.head.appendChild(link);

    const img = new Image();
    img.src = "/favicon-base.png";

    let stop: (() => void) | null = null;
    let cancelled = false;

    const drawStar = (cx: number, cy: number, s: number, alpha: number) => {
      const k = s * 0.12; // pinch toward the center for a sharp 4-point star
      ctx.save();
      ctx.globalCompositeOperation = "source-over";
      ctx.shadowColor = `rgba(220,150,255,${alpha})`;
      ctx.shadowBlur = 6;
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath();
      ctx.moveTo(cx, cy - s);
      ctx.quadraticCurveTo(cx + k, cy - k, cx + s, cy);
      ctx.quadraticCurveTo(cx + k, cy + k, cx, cy + s);
      ctx.quadraticCurveTo(cx - k, cy + k, cx - s, cy);
      ctx.quadraticCurveTo(cx - k, cy - k, cx, cy - s);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    };

    const start = performance.now();

    const draw = () => {
      const t = performance.now() - start;
      const p = (t % PERIOD) / PERIOD;

      ctx.clearRect(0, 0, SIZE, SIZE);
      ctx.globalCompositeOperation = "source-over";
      ctx.drawImage(img, 0, 0, SIZE, SIZE);

      // Diagonal light sweep, eased, fading in and out at the edges
      if (p < SWEEP_PORTION) {
        const q = p / SWEEP_PORTION;
        const pos = -24 + easeInOutSine(q) * (SIZE + 48);
        const envelope = Math.sin(Math.PI * q); // 0 -> 1 -> 0
        const g = ctx.createLinearGradient(pos - 16, pos - 16, pos + 16, pos + 16);
        g.addColorStop(0, "rgba(255,255,255,0)");
        g.addColorStop(0.5, `rgba(255,240,255,${0.95 * envelope})`);
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.globalCompositeOperation = "source-atop";
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, SIZE, SIZE);
      }

      // Soft twinkle on the top tip
      const w = Math.sin((t / TWINKLE_PERIOD) * Math.PI * 2) * 0.5 + 0.5; // 0..1
      const eased = w * w * (3 - 2 * w); // smoothstep
      drawStar(32, 10, 3 + 8 * eased, 0.45 + 0.5 * eased);

      link.href = canvas.toDataURL("image/png");
    };

    img.onload = () => {
      if (cancelled) return;
      draw();

      // Worker timers are throttled far less than page timers in background tabs
      try {
        const blob = new Blob([`setInterval(() => postMessage(0), ${FRAME_MS});`], {
          type: "text/javascript",
        });
        const url = URL.createObjectURL(blob);
        const worker = new Worker(url);
        worker.onmessage = draw;
        stop = () => {
          worker.terminate();
          URL.revokeObjectURL(url);
        };
      } catch {
        const id = setInterval(draw, FRAME_MS);
        stop = () => clearInterval(id);
      }
    };

    return () => {
      cancelled = true;
      stop?.();
    };
  }, []);

  return null;
}