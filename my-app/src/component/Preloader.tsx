'use client';

import { useEffect, useRef, useState } from "react";
import { Jost, Cormorant_Garamond } from "next/font/google";

// Same fonts / sizes as the navbar brand, so the landing is pixel-matched
const jost      = Jost({ weight: ["300","400","500","600"], subsets: ["latin"], display: "swap" });
const cormorant = Cormorant_Garamond({ weight: ["300","400","500","600"], subsets: ["latin"], display: "swap" });

const LOGO_SRC    = "/logo-main.png";  // same file the navbar uses
const MIN_SHOW_MS = 1800;              // shortest time the preloader stays on screen
const MAX_WAIT_MS = 7000;              // safety: never block the site longer than this
const FLIGHT_MS   = 1000;              // logo travel time into the navbar

type Phase = "loading" | "exit" | "done";

/**
 * Preloader
 * 1. Covers the page with the brand (logo + title), a shining logo and a loader bar.
 * 2. When the page has loaded, the brand flies into the navbar's logo position
 *    while the overlay fades away.
 * 3. The navbar brand needs the attribute  data-nav-brand  (see Navbar change).
 */
export default function Preloader() {
  const [phase, setPhase]       = useState<Phase>("loading");
  const [progress, setProgress] = useState(0);
  const [flight, setFlight]     = useState<{ x: number; y: number } | null>(null);
  const brandRef = useRef<HTMLDivElement>(null);

  // Hide the real navbar brand while the preloader is up + lock scrolling
  useEffect(() => {
    document.documentElement.classList.add("pl-active");
    document.body.style.overflow = "hidden";
    return () => {
      document.documentElement.classList.remove("pl-active");
      document.body.style.overflow = "";
    };
  }, []);

  // Fake-but-honest progress: eases toward 88%, jumps to 100% when the page is ready
  useEffect(() => {
    const start = performance.now();
    let loaded  = document.readyState === "complete";
    let fontsOk = false;
    let raf = 0;
    let exitTimer: ReturnType<typeof setTimeout> | undefined;

    const onLoad = () => { loaded = true; };
    window.addEventListener("load", onLoad);
    ((document as any).fonts?.ready ?? Promise.resolve()).then(() => { fontsOk = true; });

    const tick = (now: number) => {
      const elapsed = now - start;
      const ready = (loaded && fontsOk && elapsed >= MIN_SHOW_MS) || elapsed >= MAX_WAIT_MS;
      setProgress(p => (ready ? 100 : p + (88 - p) * 0.035));
      if (ready) {
        exitTimer = setTimeout(() => setPhase("exit"), 450);  // let the bar visibly reach 100%
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      if (exitTimer) clearTimeout(exitTimer);
      window.removeEventListener("load", onLoad);
    };
  }, []);

  // Exit: measure where the navbar brand is and fly the logo there
  useEffect(() => {
    if (phase !== "exit") return;

    const brand  = brandRef.current;
    const target = document.querySelector<HTMLElement>("[data-nav-brand]");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (brand && target && !reduce) {
      const a = brand.getBoundingClientRect();    // current (scaled-up, centred)
      const b = target.getBoundingClientRect();   // final spot in the navbar
      if (b.width > 0 && b.bottom > 0) {
        setFlight({
          x: b.left + b.width  / 2 - (a.left + a.width  / 2),
          y: b.top  + b.height / 2 - (a.top  + a.height / 2),
        });
      }
    }

    const t = setTimeout(() => {
      document.documentElement.classList.remove("pl-active"); // navbar brand appears…
      document.body.style.overflow = "";
      setPhase("done");                                       // …and the preloader is removed
    }, FLIGHT_MS + 80);
    return () => clearTimeout(t);
  }, [phase]);

  if (phase === "done") return null;

  const flying = phase === "exit" && flight;

  return (
    <div
      className={`pl-root${phase === "exit" ? " pl-exit" : ""}${phase === "exit" && !flight ? " pl-fade" : ""}`}
      role="status"
      aria-label="Loading"
      aria-busy={phase === "loading"}
    >
      <style>{`
        /* hide the real navbar brand until the logo lands on it */
        html.pl-active [data-nav-brand] { opacity: 0 !important; }

        .pl-root {
          position: fixed; inset: 0; z-index: 3000;
          display: flex; align-items: center; justify-content: center;
        }
        .pl-root.pl-exit { pointer-events: none; }

        .pl-bg {
          position: absolute; inset: 0;
          background: radial-gradient(circle at 50% 42%, #ffffff 0%, #f6f1fd 55%, #ece3f8 100%);
          transition: opacity 0.9s ease 0.1s;
        }
        .pl-exit .pl-bg { opacity: 0; }
        .pl-fade { transition: opacity 0.6s ease; opacity: 0; }

        .pl-center { position: relative; display: flex; flex-direction: column; align-items: center; }

        /* Brand = identical markup/size to the navbar brand, scaled up while loading */
        .pl-brand {
          --pl-scale: 2.6;
          display: flex; align-items: center; gap: 10px;
          transform-origin: center;
          transform: translate(0px, 0px) scale(var(--pl-scale));
          transition: transform ${FLIGHT_MS}ms cubic-bezier(0.77, 0, 0.18, 1);
          margin-bottom: calc(26px + 20px * (var(--pl-scale) - 1));
          will-change: transform;
        }
        @media (max-width: 900px) { .pl-sub { display: none; } }
        @media (max-width: 576px) { .pl-brand { --pl-scale: 2; } }

        @keyframes pl-in {
          from { opacity: 0; filter: blur(8px); }
          to   { opacity: 1; filter: blur(0); }
        }
        .pl-logo-wrap { position: relative; display: inline-block; line-height: 0; height: 40px; flex-shrink: 0; animation: pl-in 0.9s ease both; }
        .pl-text      { line-height: 1; animation: pl-in 0.9s ease 0.3s both; }

        /* Logo glow + shine (masked to the logo's own shape) */
        @keyframes pl-glow {
          0%, 100% { filter: drop-shadow(0 0 0 rgba(155,111,224,0)); }
          50%      { filter: drop-shadow(0 0 6px rgba(155,111,224,0.6)); }
        }
        @keyframes pl-shine {
          0%   { background-position: 160% 0; }
          55%  { background-position: -60% 0; }
          100% { background-position: -60% 0; }
        }
        .pl-logo-img { display: block; height: 40px; width: auto; object-fit: contain; animation: pl-glow 2.4s ease-in-out infinite; }
        .pl-shine {
          position: absolute; inset: 0; pointer-events: none;
          -webkit-mask-image: url(${LOGO_SRC}); mask-image: url(${LOGO_SRC});
          -webkit-mask-size: contain;           mask-size: contain;
          -webkit-mask-repeat: no-repeat;       mask-repeat: no-repeat;
          -webkit-mask-position: center;        mask-position: center;
          background: linear-gradient(115deg, transparent 30%, rgba(255,255,255,0.55) 44%, #fff 50%, rgba(255,255,255,0.55) 56%, transparent 70%);
          background-size: 250% 100%; background-repeat: no-repeat;
          animation: pl-shine 2.4s ease-in-out infinite;
        }

        /* Loader bar with a shimmer */
        .pl-loader { width: 190px; opacity: 1; transition: opacity 0.35s ease; animation: pl-in 0.9s ease 0.5s both; }
        .pl-exit .pl-loader { opacity: 0; }
        .pl-track { position: relative; height: 3px; border-radius: 3px; background: rgba(124,92,191,0.16); overflow: hidden; }
        .pl-fill {
          position: relative; height: 100%; border-radius: 3px; overflow: hidden;
          background: linear-gradient(90deg, #c084fc, #7c5cbf);
          transition: width 0.12s linear;
        }
        @keyframes pl-sweep { from { transform: translateX(-100%); } to { transform: translateX(260%); } }
        .pl-fill::after {
          content: ""; position: absolute; inset: 0; width: 45%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.85), transparent);
          animation: pl-sweep 1.1s ease-in-out infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .pl-logo-img, .pl-shine, .pl-fill::after { animation: none; }
        }
      `}</style>

      <div className="pl-bg" />

      <div className="pl-center">
        <div
          ref={brandRef}
          className="pl-brand"
          style={flying ? { transform: `translate(${flight!.x}px, ${flight!.y}px) scale(1)` } : undefined}
        >
          <span className="pl-logo-wrap">
            {/* plain <img>: stays crisp when scaled up */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_SRC} alt="Empavai logo" className="pl-logo-img" />
            <span aria-hidden="true" className="pl-shine" />
          </span>

          <div className="pl-text">
            <div
              className={cormorant.className}
              style={{ fontSize: 17, fontWeight: 600, letterSpacing: "0.22em", color: "#2e1f4a", textTransform: "uppercase" }}
            >
              EMPAVAI
            </div>
            <div
              className={`pl-sub ${jost.className}`}
              style={{ fontSize: 8.5, fontWeight: 400, letterSpacing: "0.22em", color: "#9b82c4", textTransform: "uppercase", marginTop: 2 }}
            >
              ART &amp; ADORNMENTS
            </div>
          </div>
        </div>

        <div className="pl-loader" aria-hidden="true">
          <div className="pl-track">
            <div className="pl-fill" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}