"use client";
import { useState, useEffect } from "react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface ProductBreadcrumbProps {
  items: BreadcrumbItem[];
  productName: string;
  productSeries?: string;
  productCategory?: string;
  backgroundImage?: string;
}

export default function ProductBreadcrumb({
  items = [
    { label: "Home", href: "/" },
    { label: "Collections", href: "/collections" },
    { label: "Crystal Art Decor", href: "/collections/crystal-art-decor" },
  ],
  productName = "Nocturnal Core",
  productSeries = "Obsidian Dream",
  productCategory = "Crystal Art Decor",
  backgroundImage = "/images/barcamp.png",
}: ProductBreadcrumbProps) {
  const [scrollY, setScrollY] = useState(0);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes bcReveal {
          from { opacity: 0; transform: translateY(22px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes bcFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes lineGrow {
          from { width: 0; }
          to   { width: 40px; }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        .pbc-root {
          position: relative;
          width: 100%;
          height: 420px;
          overflow: hidden;
          font-family: 'Jost', sans-serif;
        }

        /* ── BG IMAGE with parallax ── */
        .pbc-bg {
          position: absolute;
          inset: -60px 0;
          background-size: cover;
          background-position: center;
          will-change: transform;
          transition: opacity 0.8s ease;
        }

        /* ── Layered overlays ── */
        .pbc-overlay-base {
          position: absolute; inset: 0;
          background: linear-gradient(
            180deg,
            rgba(10, 3, 24, 0.38) 0%,
            rgba(10, 3, 24, 0.18) 35%,
            rgba(245, 240, 255, 0.0) 55%,
            rgba(250, 248, 245, 0.82) 78%,
            rgba(250, 248, 245, 1.0) 100%
          );
          pointer-events: none; z-index: 1;
        }
        .pbc-overlay-side {
          position: absolute; inset: 0;
          background: linear-gradient(
            90deg,
            rgba(250,248,245,0.55) 0%,
            transparent 40%,
            transparent 60%,
            rgba(250,248,245,0.35) 100%
          );
          pointer-events: none; z-index: 1;
        }
        .pbc-overlay-grain {
          position: absolute; inset: -50%; width: 200%; height: 200%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.03; pointer-events: none; z-index: 2;
        }

        /* ── Content ── */
        .pbc-content {
          position: absolute; inset: 0; z-index: 10;
          display: flex; flex-direction: column;
          justify-content: flex-end;
          max-width: 1240px; margin: 0 auto;
          padding: 0 56px 44px;
          left: 50%; transform: translateX(-50%);
          width: 100%;
        }

        /* ── Breadcrumb trail ── */
        .pbc-trail {
          display: flex; align-items: center; gap: 7px;
          margin-bottom: 20px;
          animation: bcFadeIn 0.7s ease 0.3s both;
        }
        .pbc-trail-link {
          font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase;
          font-weight: 400; text-decoration: none;
          color: rgba(107,63,160,0.65);
          transition: color 0.2s ease;
          font-family: 'Jost', sans-serif;
        }
        .pbc-trail-link:hover { color: #6b3fa0; }
        .pbc-trail-sep {
          font-size: 9px; color: rgba(107,63,160,0.3);
          user-select: none; line-height: 1;
        }
        .pbc-trail-cur {
          font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase;
          font-weight: 600; color: #6b3fa0;
          font-family: 'Jost', sans-serif;
        }

        /* ── Bottom row: title + meta ── */
        .pbc-bottom {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 32px;
        }

        /* Left: eyebrow + title */
        .pbc-left {
          display: flex; flex-direction: column; gap: 8px;
        }
        .pbc-eyebrow {
          display: flex; align-items: center; gap: 10px;
          animation: bcReveal 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s both;
        }
        .pbc-eyebrow-line {
          width: 0; height: 1px;
          background: linear-gradient(to right, #6b3fa0, rgba(107,63,160,0.3));
          animation: lineGrow 0.6s cubic-bezier(0.16,1,0.3,1) 0.5s forwards;
        }
        .pbc-eyebrow-text {
          font-size: 9px; letter-spacing: 0.32em; text-transform: uppercase;
          font-weight: 400; color: #9b6fe0;
          font-family: 'Jost', sans-serif;
        }

        .pbc-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px, 5.5vw, 64px);
          font-weight: 400; line-height: 1.0;
          color: #1a1030; letter-spacing: 0.02em;
          animation: bcReveal 0.8s cubic-bezier(0.16,1,0.3,1) 0.22s both;
        }
        .pbc-title em {
          font-style: italic; font-weight: 300; color: #6b3fa0;
        }

        /* Right: series pill + availability */
        .pbc-right {
          display: flex; flex-direction: column; align-items: flex-end; gap: 10px;
          animation: bcReveal 0.7s cubic-bezier(0.16,1,0.3,1) 0.35s both;
          flex-shrink: 0;
          padding-bottom: 4px;
        }
        .pbc-series-pill {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 7px 16px;
          background: rgba(255,255,255,0.72);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(107,63,160,0.18);
          border-radius: 20px;
          box-shadow: 0 2px 16px rgba(107,63,160,0.08);
        }
        .pbc-series-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #9b6fe0; flex-shrink: 0;
        }
        .pbc-series-label {
          font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase;
          font-weight: 500; color: #6b3fa0;
          font-family: 'Jost', sans-serif;
        }

        .pbc-avail-pill {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 6px 14px;
          background: rgba(107,63,160,0.08);
          border: 1px solid rgba(107,63,160,0.2);
          border-radius: 20px;
        }
        .pbc-avail-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #6b3fa0; flex-shrink: 0;
          box-shadow: 0 0 6px rgba(107,63,160,0.6);
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(0.85); }
        }
        .pbc-avail-text {
          font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase;
          font-weight: 500; color: #6b3fa0;
          font-family: 'Jost', sans-serif;
        }

        /* ── Floating gem accent (top right) ── */
        .pbc-gem {
          position: absolute; top: 28px; right: 56px; z-index: 10;
          animation: bcFadeIn 1s ease 0.6s both;
          opacity: 0.45;
        }

        /* ── Scroll hint ── */
        .pbc-scroll-hint {
          position: absolute; bottom: 44px; left: 50%; transform: translateX(-50%);
          z-index: 10;
          display: flex; flex-direction: column; align-items: center; gap: 5px;
          animation: bcFadeIn 1s ease 0.8s both;
          opacity: 0.35;
        }
        .pbc-scroll-line {
          width: 1px; height: 28px;
          background: linear-gradient(to bottom, rgba(107,63,160,0.6), transparent);
          animation: scrollPulse 2s ease-in-out infinite;
        }
        @keyframes scrollPulse {
          0%, 100% { opacity: 0.4; transform: scaleY(1); }
          50% { opacity: 0.8; transform: scaleY(1.15); }
        }

        @media (max-width: 860px) {
          .pbc-root { height: 340px; }
          .pbc-content { padding: 0 28px 36px; }
          .pbc-bottom { flex-direction: column; align-items: flex-start; gap: 14px; }
          .pbc-right { align-items: flex-start; }
          .pbc-gem { right: 28px; }
          .pbc-title { font-size: clamp(30px,8vw,48px); }
        }
        @media (max-width: 560px) {
          .pbc-root { height: 300px; }
          .pbc-scroll-hint { display: none; }
        }
      `}</style>

      <div className="pbc-root">

        {/* Background image with parallax */}
        <div
          className="pbc-bg"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            transform: `translateY(${scrollY * 0.28}px)`,
            opacity: loaded ? 1 : 0,
          }}
        />

        {/* Overlays */}
        <div className="pbc-overlay-base" />
        <div className="pbc-overlay-side" />
        <div className="pbc-overlay-grain" />

        {/* Gem accent */}
        <div className="pbc-gem">
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
            <polygon
              points="24,2 46,16 46,32 24,46 2,32 2,16"
              stroke="rgba(107,63,160,0.5)"
              strokeWidth="0.8"
              fill="none"
            />
            <polygon
              points="24,8 40,18 40,30 24,40 8,30 8,18"
              stroke="rgba(107,63,160,0.3)"
              strokeWidth="0.6"
              fill="none"
            />
            <line x1="24" y1="2"  x2="24" y2="46" stroke="rgba(107,63,160,0.15)" strokeWidth="0.5" />
            <line x1="2"  y1="16" x2="46" y2="32" stroke="rgba(107,63,160,0.15)" strokeWidth="0.5" />
            <line x1="2"  y1="32" x2="46" y2="16" stroke="rgba(107,63,160,0.15)" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Content */}
        <div className="pbc-content">

          

          {/* Bottom row */}
          <div className="pbc-bottom">

            {/* Left */}
            <div className="pbc-left">
              <div className="pbc-eyebrow">
                <div className="pbc-eyebrow-line" />
                <span className="pbc-eyebrow-text">
                  {productSeries} · {productCategory}
                </span>
              </div>
              <h1 className="pbc-title">
                {productName.split(" ").map((word, i, arr) =>
                  i === arr.length - 1
                    ? <em key={i}>{word}</em>
                    : <span key={i}>{word} </span>
                )}
              </h1>
            </div>

            {/* Breadcrumb trail */}
          <div className="pbc-trail">
            {items.map((item, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                <a href={item.href ?? "#"} className="pbc-trail-link">
                  {item.label}
                </a>
                <span className="pbc-trail-sep">›</span>
              </span>
            ))}
            <span className="pbc-trail-cur">{productName}</span>
          </div>

            {/* Right */}
            {/* <div className="pbc-right">
              <div className="pbc-series-pill">
                <div className="pbc-series-dot" />
                <span className="pbc-series-label">{productSeries}</span>
              </div>
              <div className="pbc-avail-pill">
                <div className="pbc-avail-dot" />
                <span className="pbc-avail-text">Available to Inquire</span>
              </div>
            </div> */}

          </div>
        </div>

        {/* Scroll hint */}
        <div className="pbc-scroll-hint">
          <div className="pbc-scroll-line" />
        </div>

      </div>
    </>
  );
}