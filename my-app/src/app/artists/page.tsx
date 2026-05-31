"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Bebas_Neue, Lato, Cormorant_Garamond } from "next/font/google";
import ElegantNavbar from "@/component/ElegantNavbar";
import CustomCursor  from "@/component/Customcursor";
import FlowingMenu   from "@/component/Flowingmenu";
import Footer        from "@/component/Footer";

const bebasNeue = Bebas_Neue({ weight: "400", subsets: ["latin"], display: "swap" });
const lato      = Lato({ weight: ["300", "400"], subsets: ["latin"], display: "swap" });
const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "500", "600"],
  style:  ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── Sanitise image URLs from the API ─────────────────────────────────────────
// Strips smart-quotes, zero-width chars, and other Unicode noise that the
// backend sometimes stores.  Prepends API_BASE for relative /uploads/... paths.
function cleanUrl(raw: string | undefined | null, fallback: string): string {
  if (!raw || typeof raw !== "string") return fallback;

  // remove curly quotes, zero-width spaces, BOM, non-breaking spaces, etc.
  const cleaned = raw
    .replace(/[\u200B-\u200D\uFEFF]/g, "")   // zero-width junk
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'") // curly single quotes
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"') // curly double quotes
    .replace(/[\u00A0]/g, " ")                // non-breaking space
    .trim();

  if (!cleaned) return fallback;

  // already absolute
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) return cleaned;

  // relative path from the backend — prepend origin
  if (cleaned.startsWith("/")) return `${API_BASE}${cleaned}`;

  return cleaned;
}

interface ArtistData {
  name:        string;
  title:       string;
  specialty:   string;
  bio:         string;
  quote:       string;
  tag:         string;
  studioInfo:  string;
  worksCount:  number | string;
  yearsActive: number | string;
  collectors:  number | string;
  portraitImg: string;
  featured1:   string;
  featured2:   string;
  featured3:   string;
}

const FALLBACK: ArtistData = {
  name:        "Kavya Nair",
  title:       "Crystal & Resin Sculptor",
  specialty:   "Amethyst · Fluid Resin · Sacred Geometry",
  bio:         "Born at the intersection of ancestral craft and contemporary vision, the works here are meditations made tangible — each piece a quiet ceremony between maker and beholder. Working primarily with crystal, resin, and sacred geometric forms, every creation invites you to carry something ancient.",
  quote:       "Every stone holds a silence older than language. My work is simply the act of listening.",
  tag:         "Lead Artist",
  studioInfo:  "Empavai Studio · Kerala, India",
  worksCount:  4,
  yearsActive: 9,
  collectors:  412,
  portraitImg: "/images/p-1.jpeg",
  featured1:   "/images/p-2.jpeg",
  featured2:   "/images/p-3.jpeg",
  featured3:   "/images/p-4.jpeg",
};

// ── Animated counter (IntersectionObserver on the number itself) ──────────────
function Counter({ end, suffix }: { end: number; suffix: string }) {
  const [val, setVal] = useState(0);
  const spanRef = useRef<HTMLSpanElement>(null);
  const ran     = useRef(false);

  useEffect(() => {
    const el = spanRef.current;
    if (!el || ran.current) return;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting || ran.current) return;
      ran.current = true;
      io.disconnect();
      const frames = 60;
      const step   = Math.max(1, Math.ceil(end / frames));
      let cur = 0;
      const iv = setInterval(() => {
        cur += step;
        if (cur >= end) { setVal(end); clearInterval(iv); }
        else setVal(cur);
      }, 20);
    }, { threshold: 0.5 });
    io.observe(el);
    return () => io.disconnect();
  }, [end]);

  return <span ref={spanRef}>{val}{suffix}</span>;
}

// ── Image with graceful error fallback ───────────────────────────────────────
function Img({ src, alt, sizes, style }: { src: string; alt: string; sizes: string; style?: React.CSSProperties }) {
  const [errored, setErrored] = useState(false);
  if (errored) {
    return (
      <div style={{ width: "100%", height: "100%", background: "rgba(107,63,160,0.12)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="rgba(192,132,252,0.25)" strokeWidth="1.2">
          <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
        </svg>
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      style={style}
      unoptimized
      onError={() => setErrored(true)}
    />
  );
}

export default function ArtistsPage() {
  const [artist,  setArtist]  = useState<ArtistData>(FALLBACK);
  const [loading, setLoading] = useState(true);
  const [visible, setVisible] = useState(false);

  // ── Fetch — handles both { artist: {...} } and { data: { artist: {...} } } ──
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API_BASE}/api/about`);
        const json = await res.json();

        // try every likely shape the API might return
        const raw =
          json?.artist           ??   // { artist: {...} }
          json?.data?.artist     ??   // { data: { artist: {...} } }
          json?.about?.artist    ??   // { about: { artist: {...} } }
          null;

        if (raw && typeof raw === "object") {
          // merge with FALLBACK so missing fields don't break rendering
          setArtist({
            ...FALLBACK,
            ...raw,
            portraitImg: cleanUrl(raw.portraitImg, FALLBACK.portraitImg),
            featured1:   cleanUrl(raw.featured1,   FALLBACK.featured1),
            featured2:   cleanUrl(raw.featured2,   FALLBACK.featured2),
            featured3:   cleanUrl(raw.featured3,   FALLBACK.featured3),
          });
        }
      } catch (err) {
        console.warn("ArtistsPage: API fetch failed, using fallback.", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // trigger animations after loading ends (mirrors EmpavaiAbout pattern exactly)
  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setVisible(true), 80);
      return () => clearTimeout(t);
    }
  }, [loading]);

  const a = artist;
  const v = visible;

  const worksEnd     = typeof a.worksCount  === "string" ? parseInt(a.worksCount)  || 0 : a.worksCount;
  const yearsEnd     = typeof a.yearsActive === "string" ? parseInt(a.yearsActive) || 0 : a.yearsActive;
  const collectEnd   = typeof a.collectors  === "string" ? parseInt(a.collectors)  || 0 : a.collectors;

  if (loading) return (
    <>
      <style>{`@keyframes ap-spin{to{transform:rotate(360deg)}}`}</style>
      <ElegantNavbar />
      <div style={{
        minHeight: "100vh", background: "#060210",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 20,
      }}>
        <div style={{ width: 36, height: 36, border: "1.5px solid rgba(168,85,247,0.15)", borderTopColor: "#a855f7", borderRadius: "50%", animation: "ap-spin 0.8s linear infinite" }} />
        <p style={{ fontSize: 9, letterSpacing: "0.3em", textTransform: "uppercase", color: "rgba(168,85,247,0.4)", fontFamily: "sans-serif", margin: 0 }}>Loading</p>
      </div>
    </>
  );

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --ap-deep:   #060210;
          --ap-mid:    #0e0522;
          --ap-purple: #6b3fa0;
          --ap-light:  rgba(238,230,255,0.92);
          --ap-muted:  rgba(190,165,230,0.45);
          --ap-accent: #c084fc;
          --ap-border: rgba(180,130,255,0.1);
        }

        .ap-page {
          background: var(--ap-deep);
          color: var(--ap-light);
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* ── grain overlay (shared) ── */
        .ap-grain {
          position: absolute; inset: -50%; width: 200%; height: 200%;
          z-index: 0; pointer-events: none;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.035; animation: ap-grain 10s steps(10) infinite;
        }
        @keyframes ap-grain {
          0%,100%{transform:translate(0,0)} 10%{transform:translate(-2%,-3%)} 20%{transform:translate(3%,2%)}
          30%{transform:translate(-1%,4%)} 40%{transform:translate(4%,-1%)} 50%{transform:translate(-3%,3%)}
          60%{transform:translate(2%,-4%)} 70%{transform:translate(-4%,1%)} 80%{transform:translate(1%,-2%)} 90%{transform:translate(3%,4%)}
        }

        /* ── animation helpers — same pattern as EmpavaiAbout ── */
        .ap-fadeup {
          opacity: 0; transform: translateY(28px);
          transition: opacity 1s cubic-bezier(0.22,1,0.36,1), transform 1s cubic-bezier(0.22,1,0.36,1);
        }
        .ap-fadeup.in { opacity: 1; transform: translateY(0); }
        .ap-fadein    { opacity: 0; transition: opacity 0.9s ease; }
        .ap-fadein.in { opacity: 1; }
        .ap-scalex    { transform-origin: left; transform: scaleX(0); opacity: 0; transition: transform 0.7s ease, opacity 0.7s ease; }
        .ap-scalex.in { transform: scaleX(1); opacity: 1; }
        .ap-d1  { transition-delay: 0.1s;  }
        .ap-d2  { transition-delay: 0.22s; }
        .ap-d3  { transition-delay: 0.36s; }
        .ap-d4  { transition-delay: 0.5s;  }
        .ap-d5  { transition-delay: 0.64s; }

        /* ══════════════════════════════════════════
           HERO
        ══════════════════════════════════════════ */
        .ap-hero {
          position: relative; min-height: 100vh; padding-top: 64px;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          overflow: hidden; text-align: center;
          padding-left: 40px; padding-right: 40px;
        }
        .ap-hero-bg {
          position: absolute; inset: 0; z-index: 0;
          background:
            radial-gradient(ellipse 65% 60% at 72% 38%, rgba(107,63,160,0.28) 0%, transparent 65%),
            radial-gradient(ellipse 50% 55% at 18% 68%, rgba(59,26,110,0.22) 0%, transparent 60%),
            linear-gradient(180deg, #060210 0%, #0d0520 55%, #060210 100%);
        }
        .ap-hero-grid {
          position: absolute; inset: 0; z-index: 0;
          background-image:
            linear-gradient(rgba(180,130,255,0.045) 1px, transparent 1px),
            linear-gradient(90deg, rgba(180,130,255,0.045) 1px, transparent 1px);
          background-size: 80px 80px;
          -webkit-mask-image: radial-gradient(ellipse 85% 85% at 50% 50%, black 25%, transparent 100%);
          mask-image:         radial-gradient(ellipse 85% 85% at 50% 50%, black 25%, transparent 100%);
        }
        .ap-hero-content { position: relative; z-index: 2; }

        .ap-hero-eyebrow {
          display: block; font-size: 9px; letter-spacing: 0.42em; text-transform: uppercase;
          color: rgba(192,132,252,0.48); font-weight: 300; margin-bottom: 28px;
        }
        .ap-hero-title {
          display: block; font-size: clamp(58px, 12vw, 148px);
          line-height: 0.88; color: var(--ap-light); letter-spacing: 0.04em; margin-bottom: 36px;
        }
        .ap-hero-rule {
          width: 1px; height: 60px; margin: 0 auto 30px;
          background: linear-gradient(to bottom, rgba(192,132,252,0.5), transparent);
        }
        .ap-hero-sub {
          display: block; font-size: clamp(12px, 1.4vw, 16px); font-weight: 300; font-style: italic;
          letter-spacing: 0.05em; color: var(--ap-muted); line-height: 1.9;
          max-width: 480px; margin: 0 auto;
        }

        /* scroll cue */
        .ap-scroll-cue {
          position: absolute; bottom: 40px; left: 50%; transform: translateX(-50%);
          z-index: 10; display: flex; flex-direction: column; align-items: center; gap: 10px;
        }
        .ap-scroll-label { font-size: 8px; letter-spacing: 0.32em; text-transform: uppercase; color: rgba(180,150,230,0.38); font-weight: 300; }
        .ap-scroll-line  { width: 1px; height: 36px; background: linear-gradient(to bottom, rgba(192,132,252,0.45), transparent); animation: ap-scroll-pulse 2.2s ease-in-out infinite; }
        @keyframes ap-scroll-pulse { 0%,100%{opacity:0.35;transform:scaleY(1)} 50%{opacity:1;transform:scaleY(1.18)} }

        /* ══════════════════════════════════════════
           PORTRAIT ROW
        ══════════════════════════════════════════ */
        .ap-portrait-row {
          position: relative; z-index: 2; max-width: 1100px; margin: -70px auto 0;
          display: grid; grid-template-columns: 1fr 340px 1fr;
          align-items: flex-end; padding: 0 60px 80px;
        }
        .ap-portrait-side { display: flex; flex-direction: column; gap: 6px; padding-bottom: 32px; }
        .ap-portrait-side.left  { align-items: flex-end;   padding-right: 52px; }
        .ap-portrait-side.right { align-items: flex-start; padding-left:  52px; }
        .ap-ghost-num { font-size: 88px; line-height: 1; color: rgba(238,230,255,0.05); letter-spacing: 0.04em; }
        .ap-ghost-lbl { font-size: 8.5px; letter-spacing: 0.3em; text-transform: uppercase; color: var(--ap-muted); font-weight: 300; }

        .ap-portrait-card {
          position: relative; width: 340px; height: 468px;
          border-radius: 8px; overflow: hidden;
          border: 1px solid rgba(192,132,252,0.18);
          box-shadow: 0 40px 100px rgba(0,0,0,0.72), 0 0 80px rgba(107,63,160,0.28);
        }
        .ap-portrait-card::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(to bottom, transparent 44%, rgba(6,2,16,0.92) 100%);
        }
        .ap-portrait-badge { position: absolute; bottom: 24px; left: 22px; right: 22px; z-index: 3; }
        .ap-badge-tag {
          display: inline-block; margin-bottom: 8px;
          font-size: 7.5px; letter-spacing: 0.22em; text-transform: uppercase;
          color: var(--ap-accent); background: rgba(107,63,160,0.52);
          border: 1px solid rgba(192,132,252,0.22); border-radius: 2px;
          padding: 4px 11px; backdrop-filter: blur(8px);
        }
        .ap-badge-name  { display: block; font-size: 27px; font-weight: 400; color: var(--ap-light); letter-spacing: 0.06em; line-height: 1.1; }
        .ap-badge-title { display: block; font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(192,132,252,0.52); font-weight: 300; margin-top: 4px; }

        /* ══════════════════════════════════════════
           BIO GRID  (mirrors EmpavaiAbout ea-grid)
        ══════════════════════════════════════════ */
        .ap-bio-grid {
          max-width: 1100px; margin: 0 auto; padding: 80px 60px 48px;
          display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 72px; align-items: start;
          border-top: 1px solid var(--ap-border);
        }
        .ap-bio-left  { display: flex; flex-direction: column; gap: 24px; }
        .ap-bio-right { display: flex; flex-direction: column; gap: 24px; padding-top: 40px; }

        .ap-eyebrow    { font-size: 9px; font-weight: 500; letter-spacing: 0.32em; text-transform: uppercase; color: var(--ap-accent); display: block; }
        .ap-rule-line  { width: 44px; height: 1px; background: linear-gradient(90deg, var(--ap-accent), transparent); }
        .ap-specialty  { font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: rgba(192,132,252,0.32); font-weight: 300; padding-bottom: 18px; border-bottom: 1px solid var(--ap-border); }
        .ap-bio-text   { font-size: clamp(15px,1.55vw,19px); font-weight: 300; font-style: italic; line-height: 1.95; color: rgba(210,195,240,0.56); letter-spacing: 0.025em; padding-left: 20px; border-left: 1px solid rgba(192,132,252,0.2); }

        .ap-name-block { }
        .ap-name-huge  { font-size: clamp(48px,6.5vw,86px); font-weight: 400; line-height: 0.92; color: var(--ap-light); letter-spacing: 0.02em; }
        .ap-name-huge em { font-style: italic; color: var(--ap-accent); font-weight: 300; }
        .ap-title-sub  { display: block; font-size: clamp(13px,1.4vw,17px); font-style: italic; font-weight: 300; color: rgba(192,132,252,0.55); letter-spacing: 0.06em; margin-top: 10px; }

        .ap-studio-pill {
          padding: 18px 22px; border-radius: 4px;
          background: rgba(107,63,160,0.07); border: 1px solid rgba(192,132,252,0.1);
        }
        .ap-studio-pill p { font-size: 11px; letter-spacing: 0.06em; color: rgba(200,180,240,0.4); line-height: 1.85; font-weight: 300; }

        /* ══════════════════════════════════════════
           STATS BAR
        ══════════════════════════════════════════ */
        .ap-stats-bar  { max-width: 1100px; margin: 0 auto; padding: 0 60px 80px; }
        .ap-stats-inner {
          display: flex; border: 1px solid var(--ap-border);
          border-radius: 6px; overflow: hidden; background: rgba(107,63,160,0.05);
        }
        .ap-stat-cell {
          flex: 1; padding: 36px 24px; text-align: center;
          border-right: 1px solid var(--ap-border); position: relative;
        }
        .ap-stat-cell:last-child { border-right: none; }
        .ap-stat-cell::before {
          content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(192,132,252,0.35), transparent);
          opacity: 0; transition: opacity 0.35s ease;
        }
        .ap-stat-cell:hover::before { opacity: 1; }
        .ap-stat-val { font-size: 60px; line-height: 1; color: var(--ap-light); letter-spacing: 0.04em; }
        .ap-stat-lbl { font-size: 8px; letter-spacing: 0.28em; text-transform: uppercase; color: var(--ap-muted); margin-top: 6px; font-weight: 300; }

        /* ══════════════════════════════════════════
           QUOTE
        ══════════════════════════════════════════ */
        .ap-quote-section {
          position: relative; max-width: 1100px; margin: 0 auto;
          padding: 72px 60px; text-align: center;
          border-top: 1px solid var(--ap-border); border-bottom: 1px solid var(--ap-border);
        }
        .ap-quote-glyph { position: absolute; top: 24px; left: 60px; font-size: 168px; line-height: 1; color: rgba(192,132,252,0.055); font-family: serif; pointer-events: none; }
        .ap-quote-text  { font-size: clamp(20px,3vw,36px); font-weight: 300; font-style: italic; line-height: 1.72; color: rgba(224,210,248,0.68); letter-spacing: 0.02em; max-width: 780px; margin: 0 auto; position: relative; z-index: 2; }
        .ap-quote-cite  { display: block; margin-top: 24px; font-size: 9px; letter-spacing: 0.28em; text-transform: uppercase; color: rgba(192,132,252,0.35); font-style: normal; }

        /* ══════════════════════════════════════════
           SELECTED WORKS
        ══════════════════════════════════════════ */
        .ap-works-section { max-width: 1100px; margin: 0 auto; padding: 80px 60px 100px; }
        .ap-works-head    { display: flex; align-items: flex-end; justify-content: space-between; margin-bottom: 36px; }
        .ap-works-heading { font-size: clamp(30px,4vw,52px); font-weight: 400; color: var(--ap-light); }
        .ap-works-heading em { font-style: italic; color: var(--ap-accent); font-weight: 300; }
        .ap-works-count   { font-size: 9px; letter-spacing: 0.26em; text-transform: uppercase; color: var(--ap-muted); }
        .ap-works-grid    { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
        .ap-work-thumb    { position: relative; aspect-ratio: 4/5; border-radius: 5px; overflow: hidden; border: 1px solid var(--ap-border); cursor: pointer; }
        .ap-work-thumb img { filter: saturate(0.55) brightness(0.65); transition: transform 0.6s ease, filter 0.6s ease; }
        .ap-work-thumb:hover img { transform: scale(1.07); filter: saturate(0.88) brightness(0.9); }
        .ap-work-thumb::after { content:''; position:absolute; inset:0; background:rgba(26,4,54,0.22); transition:background 0.4s ease; }
        .ap-work-thumb:hover::after { background:rgba(26,4,54,0.04); }
        .ap-work-index { position: absolute; top: 12px; left: 12px; z-index: 3; font-size: 9px; letter-spacing: 0.18em; color: rgba(192,132,252,0.45); font-family: monospace; }

        /* ══════════════════════════════════════════
           CTA
        ══════════════════════════════════════════ */
        .ap-cta { max-width: 1100px; margin: 0 auto; padding: 0 60px 100px; text-align: center; display: flex; flex-direction: column; align-items: center; gap: 22px; }
        .ap-cta-eyebrow { font-size: 9px; letter-spacing: 0.38em; text-transform: uppercase; color: rgba(192,132,252,0.36); font-weight: 300; }
        .ap-cta-heading { font-size: clamp(28px,4vw,50px); font-weight: 400; color: var(--ap-light); line-height: 1.1; }
        .ap-cta-heading em { font-style: italic; color: var(--ap-accent); }
        .ap-cta-body    { font-size: 13px; font-weight: 300; color: var(--ap-muted); line-height: 1.82; max-width: 430px; }
        .ap-cta-buttons { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; justify-content: center; margin-top: 8px; }

        .ap-btn-fill {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 14px 34px; font-size: 9px; font-weight: 400;
          letter-spacing: 0.26em; text-transform: uppercase;
          color: var(--ap-light); border: 1px solid rgba(192,132,252,0.3);
          border-radius: 2px; text-decoration: none; cursor: pointer;
          background: linear-gradient(to right, var(--ap-purple) 50%, transparent 50%);
          background-size: 200% 100%; background-position: right center;
          transition: background-position 0.5s ease, color 0.4s ease, border-color 0.4s ease;
        }
        .ap-btn-fill:hover { background-position: left center; color: #fff; border-color: var(--ap-purple); }

        .ap-btn-ghost {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 14px 22px; font-size: 9px; font-weight: 400;
          letter-spacing: 0.26em; text-transform: uppercase;
          color: var(--ap-muted); background: none; border: none;
          border-bottom: 1px solid rgba(190,165,230,0.18);
          text-decoration: none; cursor: pointer;
          transition: color 0.3s ease, border-color 0.3s ease;
        }
        .ap-btn-ghost:hover { color: var(--ap-accent); border-color: var(--ap-accent); }

        /* ══════════════════════════════════════════
           STUDIO STRIP
        ══════════════════════════════════════════ */
        .ap-strip { max-width: 1100px; margin: 0 auto; padding: 22px 60px 36px; display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--ap-border); }
        .ap-strip-text { font-size: 11px; font-style: italic; color: rgba(180,150,230,0.24); letter-spacing: 0.04em; }
        .ap-strip-num  { font-size: 13px; letter-spacing: 0.18em; color: rgba(192,132,252,0.18); }

        /* ══════════════════════════════════════════
           RESPONSIVE
        ══════════════════════════════════════════ */
        @media (max-width: 960px) {
          .ap-portrait-row  { grid-template-columns: 1fr; justify-items: center; padding: 0 28px 56px; margin-top: -30px; }
          .ap-portrait-side { display: none; }
          .ap-portrait-card { width: 280px; height: 380px; }
          .ap-bio-grid      { grid-template-columns: 1fr; gap: 48px; padding: 60px 32px 40px; }
          .ap-stats-bar, .ap-quote-section, .ap-works-section, .ap-cta, .ap-strip { padding-left: 32px; padding-right: 32px; }
          .ap-stats-inner   { flex-wrap: wrap; }
          .ap-stat-cell     { flex: 0 0 50%; border-bottom: 1px solid var(--ap-border); }
          .ap-works-grid    { grid-template-columns: repeat(2,1fr); }
        }
        @media (max-width: 560px) {
          .ap-hero          { padding: 80px 24px 40px; }
          .ap-works-grid    { grid-template-columns: 1fr; }
          .ap-stats-bar, .ap-quote-section, .ap-works-section, .ap-cta, .ap-strip { padding-left: 20px; padding-right: 20px; }
        }
      `}</style>

      <div className={`ap-page ${lato.className}`}>
        <CustomCursor />
        <ElegantNavbar />
        <FlowingMenu />

        {/* ══ HERO ══════════════════════════════════════════════════════════ */}
        <div className="ap-hero">
          <div className="ap-hero-bg" />
          <div className="ap-hero-grid" />
          <div className="ap-grain" />

          <div className="ap-hero-content">
            <span className={`ap-hero-eyebrow ap-fadein ${v?"in":""} ap-d1 ${lato.className}`}>
              Empavai Studio · The Maker
            </span>
            <h1 className={`ap-hero-title ap-fadeup ${v?"in":""} ap-d2 ${bebasNeue.className}`}>
              ARTIST IN<br />RESIDENCE
            </h1>
            <div className={`ap-hero-rule ap-fadein ${v?"in":""} ap-d3`} />
            <span className={`ap-hero-sub ap-fadeup ${v?"in":""} ap-d4 ${cormorant.className}`}>
              {a.specialty}
            </span>
          </div>

          <div className={`ap-scroll-cue ap-fadein ${v?"in":""} ap-d5`}>
            <span className={`ap-scroll-label ${lato.className}`}>Scroll to explore</span>
            <div className="ap-scroll-line" />
          </div>
        </div>

        {/* ══ PORTRAIT ROW ══════════════════════════════════════════════════ */}
        <div className={`ap-portrait-row ap-fadeup ${v?"in":""} ap-d3`}>
          <div className="ap-portrait-side left">
            <span className={`ap-ghost-num ${bebasNeue.className}`}>{a.worksCount}</span>
            <span className="ap-ghost-lbl">Works Created</span>
          </div>

          <div className="ap-portrait-card">
            <Img
              src={a.portraitImg}
              alt={a.name}
              sizes="340px"
              style={{ objectFit: "cover", filter: "saturate(0.68) brightness(0.76)" }}
            />
            <div className="ap-portrait-badge">
              <span className="ap-badge-tag">{a.tag}</span>
              <span className={`ap-badge-name ${cormorant.className}`}>{a.name}</span>
              <span className="ap-badge-title">{a.title}</span>
            </div>
          </div>

          <div className="ap-portrait-side right">
            <span className={`ap-ghost-num ${bebasNeue.className}`}>{a.collectors}</span>
            <span className="ap-ghost-lbl">Collectors</span>
          </div>
        </div>

        {/* ══ BIO GRID (mirrors ea-grid from EmpavaiAbout) ══════════════════ */}
        <div className="ap-bio-grid">
          {/* LEFT */}
          <div className="ap-bio-left">
            <span className={`ap-eyebrow ap-fadein ${v?"in":""} ap-d1`}>About the Artist</span>

            <div className={`ap-scalex ap-rule-line ${v?"in":""} ap-d2`} />

            <p className={`ap-specialty ap-fadeup ${v?"in":""} ap-d2`}>{a.specialty}</p>

            <p className={`ap-bio-text ${cormorant.className} ap-fadeup ${v?"in":""} ap-d3`}>{a.bio}</p>
          </div>

          {/* RIGHT */}
          <div className={`ap-bio-right ap-fadeup ${v?"in":""} ap-d2`}>
            <div className="ap-name-block">
              <h2 className={`ap-name-huge ${cormorant.className}`}>
                {a.name.split(" ").map((word, i) => (
                  <span key={i} style={{ display: "block" }}>
                    {i === 0 ? word : <em>{word}</em>}
                  </span>
                ))}
              </h2>
              <span className={`ap-title-sub ${cormorant.className}`}>{a.title}</span>
            </div>

            <div className="ap-studio-pill">
              <p>{a.studioInfo}</p>
            </div>
          </div>
        </div>

        {/* ══ STATS BAR ═════════════════════════════════════════════════════ */}
        <div className="ap-stats-bar">
          <div className={`ap-stats-inner ap-fadeup ${v?"in":""} ap-d3`}>
            {[
              { end: worksEnd,   suf: "+",   lbl: "Works Created" },
              { end: yearsEnd,   suf: " yr",  lbl: "Years Active"  },
              { end: collectEnd, suf: "+",   lbl: "Collectors"    },
            ].map(({ end, suf, lbl }) => (
              <div key={lbl} className="ap-stat-cell">
                <div className={`ap-stat-val ${bebasNeue.className}`}>
                  <Counter end={end} suffix={suf} />
                </div>
                <div className={`ap-stat-lbl ${lato.className}`}>{lbl}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ QUOTE ═════════════════════════════════════════════════════════ */}
        <div className="ap-quote-section">
          <span className="ap-quote-glyph" aria-hidden="true">"</span>
          <p className={`ap-quote-text ${cormorant.className} ap-fadeup ${v?"in":""} ap-d1`}>
            {a.quote}
          </p>
          <cite className={`ap-quote-cite ap-fadein ${v?"in":""} ap-d3`}>— {a.name}</cite>
        </div>

        {/* ══ SELECTED WORKS ════════════════════════════════════════════════ */}
        <div className="ap-works-section">
          <div className="ap-works-head">
            <h3 className={`ap-works-heading ${cormorant.className} ap-fadeup ${v?"in":""} ap-d1`}>
              Selected <em>Works</em>
            </h3>
            <span className={`ap-works-count ap-fadein ${v?"in":""} ap-d2`}>03 Pieces</span>
          </div>
          <div className="ap-works-grid">
            {[a.featured1, a.featured2, a.featured3].map((src, i) => (
              <div key={`${src}-${i}`} className="ap-work-thumb">
                <Img
                  src={src}
                  alt={`Selected work ${i + 1}`}
                  sizes="(max-width:900px) 50vw, 33vw"
                  style={{ objectFit: "cover" }}
                />
                <div className="ap-work-index">{String(i + 1).padStart(2, "0")}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ══ CTA ═══════════════════════════════════════════════════════════ */}
        <div className="ap-cta">
          <span className={`ap-cta-eyebrow ap-fadein ${v?"in":""} ap-d1`}>Work with the Artist</span>
          <h3 className={`ap-cta-heading ${cormorant.className} ap-fadeup ${v?"in":""} ap-d2`}>
            Commission a <em>Bespoke Piece</em>
          </h3>
          <p className={`ap-cta-body ap-fadeup ${v?"in":""} ap-d3`}>
            Each commission is a collaboration — a conversation between intention and material. Reach out to begin yours.
          </p>
          <div className={`ap-cta-buttons ap-fadeup ${v?"in":""} ap-d4`}>
            <a href="/contact" className={`ap-btn-fill ${lato.className}`}>
              Begin a Commission
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>
            <a href="/collections" className={`ap-btn-ghost ${lato.className}`}>
              Browse the Collection
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
              </svg>
            </a>
          </div>
        </div>

        {/* ══ STUDIO STRIP ══════════════════════════════════════════════════ */}
        <div className="ap-strip">
          <span className={`ap-strip-text ${cormorant.className}`}>{a.studioInfo}</span>
          <span className={`ap-strip-num ${bebasNeue.className}`}>01 / 01</span>
        </div>

        <Footer />
      </div>
    </>
  );
}