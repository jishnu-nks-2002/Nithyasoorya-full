import { useEffect, useRef, useState } from "react";

/* ── Cursor Trail Logic (Variant 2 style from ImageTrail) ─────── */
function lerp(a, b, n) { return (1 - n) * a + n * b; }

function getMousePos(e, rect) {
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function dist(p1, p2) {
  return Math.hypot(p1.x - p2.x, p1.y - p2.y);
}

/* Trail images — Buddha / spiritual art from Unsplash (no-bg feel with mix-blend) */
const TRAIL_SRCS = [
  "https://images.unsplash.com/photo-1545579133-99bb5ab189bd?w=400&q=80",
  "https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=400&q=80",
  "https://images.unsplash.com/photo-1602525667197-1b8f724e4e82?w=400&q=80",
  "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=400&q=80",
  "https://images.unsplash.com/photo-1499002238440-d264edd596ec?w=400&q=80",
  "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80",
  "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&q=80",
  "https://images.unsplash.com/photo-1419242902214-272b3f66ee7a?w=400&q=80",
];

/* ── Trail Item class ─────────────────────────────────────────── */
class TrailItem {
  constructor(el) {
    this.el = el;
    this.inner = el.querySelector(".trail-inner");
    this.rect = el.getBoundingClientRect();
    this.reset();
  }
  reset() {
    this.el.style.opacity = "0";
    this.el.style.transform = "scale(0) translate(0px,0px)";
  }
}

/* ── Trail Engine ─────────────────────────────────────────────── */
class TrailEngine {
  constructor(container, items) {
    this.container = container;
    this.items = items;
    this.total = items.length;
    this.pos = 0;
    this.zVal = 1;
    this.threshold = 70;
    this.mousePos = { x: 0, y: 0 };
    this.lastPos = { x: 0, y: 0 };
    this.cachePos = { x: 0, y: 0 };
    this.running = false;

    this.onMove = (e) => {
      const rect = container.getBoundingClientRect();
      this.mousePos = getMousePos(e, rect);
    };

    container.addEventListener("mousemove", this.onMove);

    const init = (e) => {
      const rect = container.getBoundingClientRect();
      this.mousePos = getMousePos(e, rect);
      this.cachePos = { ...this.mousePos };
      this.running = true;
      requestAnimationFrame(() => this.render());
      container.removeEventListener("mousemove", init);
    };
    container.addEventListener("mousemove", init);
  }

  render() {
    if (!this.running) return;
    const d = dist(this.mousePos, this.lastPos);
    this.cachePos.x = lerp(this.cachePos.x, this.mousePos.x, 0.1);
    this.cachePos.y = lerp(this.cachePos.y, this.mousePos.y, 0.1);

    if (d > this.threshold) {
      this.show();
      this.lastPos = { ...this.mousePos };
    }
    requestAnimationFrame(() => this.render());
  }

  show() {
    this.zVal++;
    this.pos = (this.pos + 1) % this.total;
    const item = this.items[this.pos];
    const w = 160, h = 180;

    // Cancel any ongoing animation by resetting inline transitions
    item.el.style.transition = "none";
    item.el.style.opacity = "1";
    item.el.style.zIndex = this.zVal;
    item.el.style.width = w + "px";
    item.el.style.height = h + "px";
    item.el.style.transform = `translate(${this.cachePos.x - w / 2}px, ${this.cachePos.y - h / 2}px) scale(0)`;

    if (item.inner) {
      item.inner.style.transform = "scale(2.6) brightness(200%)";
      item.inner.style.filter = "brightness(200%)";
    }

    // Force repaint
    item.el.getBoundingClientRect();

    // Animate in
    item.el.style.transition = "transform 0.4s cubic-bezier(0.25,0.46,0.45,0.94), opacity 0.4s ease";
    item.el.style.transform = `translate(${this.mousePos.x - w / 2}px, ${this.mousePos.y - h / 2}px) scale(1)`;

    if (item.inner) {
      item.inner.style.transition = "transform 0.4s ease, filter 0.4s ease";
      item.inner.style.transform = "scale(1)";
      item.inner.style.filter = "brightness(100%)";
    }

    // Animate out
    setTimeout(() => {
      item.el.style.transition = "transform 0.4s cubic-bezier(0.55,0,1,0.45), opacity 0.35s ease";
      item.el.style.opacity = "0";
      item.el.style.transform = `translate(${this.mousePos.x - w / 2}px, ${this.mousePos.y - h / 2}px) scale(0.15)`;
    }, 420);
  }

  destroy() {
    this.running = false;
    this.container.removeEventListener("mousemove", this.onMove);
  }
}

/* ── Main Component ───────────────────────────────────────────── */
export default function HeroBanner() {
  const containerRef = useRef(null);
  const engineRef = useRef(null);
  const itemsRef = useRef([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // Small delay for entrance animation
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const nodes = containerRef.current.querySelectorAll(".trail-item");
    itemsRef.current = Array.from(nodes).map((el) => new TrailItem(el));
    engineRef.current = new TrailEngine(containerRef.current, itemsRef.current);
    return () => engineRef.current?.destroy();
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Playfair+Display:wght@400;500;700;900&family=Crimson+Text:ital,wght@0,400;1,400&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .hero-root {
          --purple-deep: #3B1F5E;
          --purple-mid: #5A3A7D;
          --purple-main: #7B4BA0;
          --purple-light: #9B6CC0;
          --purple-pale: #C9A8E0;
          --cream: #FAF7F2;
          --gold: #C9A055;
          --gold-light: #E8C87A;
          font-family: 'Crimson Text', serif;
        }

        .hero-section {
          position: relative;
          width: 100%;
          height: 100vh;
          min-height: 700px;
          background: var(--cream);
          overflow: hidden;
          cursor: none;
          display: flex;
          align-items: stretch;
        }

        /* Custom cursor */
        .hero-cursor {
          position: fixed;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--purple-main);
          pointer-events: none;
          z-index: 9999;
          transform: translate(-50%, -50%);
          transition: transform 0.15s ease, width 0.2s ease, height 0.2s ease;
          mix-blend-mode: multiply;
        }

        /* Noise grain overlay */
        .hero-section::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
          background-size: 200px 200px;
          pointer-events: none;
          z-index: 1;
          opacity: 0.6;
        }

        /* ── Left strip ──────────────────── */
        .hero-left {
          position: relative;
          width: 42%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 80px 0 80px 72px;
          z-index: 5;
        }

        .hero-eyebrow {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 32px;
          opacity: 0;
          transform: translateX(-20px);
          transition: opacity 0.8s ease 0.2s, transform 0.8s ease 0.2s;
        }
        .hero-eyebrow.visible {
          opacity: 1;
          transform: translateX(0);
        }
        .hero-eyebrow-line {
          width: 36px;
          height: 1.5px;
          background: var(--purple-main);
        }
        .hero-eyebrow-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: var(--gold);
        }
        .hero-eyebrow-text {
          font-family: 'Crimson Text', serif;
          font-size: 11px;
          font-weight: 400;
          color: var(--purple-main);
          letter-spacing: 4px;
          text-transform: uppercase;
        }

        .hero-title {
          font-family: 'Playfair Display', serif;
          font-weight: 900;
          font-size: clamp(3.2rem, 5.5vw, 5.8rem);
          line-height: 0.95;
          color: var(--purple-deep);
          letter-spacing: -0.03em;
          margin-bottom: 28px;
          opacity: 0;
          transform: translateY(30px);
          transition: opacity 1s ease 0.4s, transform 1s cubic-bezier(0.16,1,0.3,1) 0.4s;
        }
        .hero-title.visible {
          opacity: 1;
          transform: translateY(0);
        }
        .hero-title em {
          font-style: italic;
          color: var(--purple-main);
          font-weight: 400;
        }
        .hero-title-accent {
          display: block;
          color: var(--gold);
          font-size: 0.55em;
          letter-spacing: 0.1em;
          font-style: italic;
          font-weight: 400;
          margin-bottom: 4px;
        }

        .hero-divider {
          width: 60px;
          height: 1px;
          background: linear-gradient(90deg, var(--gold), transparent);
          margin-bottom: 28px;
          opacity: 0;
          transition: opacity 0.8s ease 0.65s, width 1s ease 0.65s;
        }
        .hero-divider.visible {
          opacity: 1;
          width: 100px;
        }

        .hero-desc {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(1.05rem, 1.4vw, 1.3rem);
          font-style: italic;
          font-weight: 300;
          color: #5a4a6a;
          line-height: 1.85;
          max-width: 380px;
          margin-bottom: 44px;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.9s ease 0.75s, transform 0.9s ease 0.75s;
        }
        .hero-desc.visible {
          opacity: 1;
          transform: translateY(0);
        }

        /* CTA buttons */
        .hero-actions {
          display: flex;
          gap: 18px;
          align-items: center;
          flex-wrap: wrap;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.8s ease 0.95s, transform 0.8s ease 0.95s;
        }
        .hero-actions.visible {
          opacity: 1;
          transform: translateY(0);
        }

        .btn-primary {
          padding: 16px 38px;
          background: var(--purple-main);
          color: #fff;
          font-family: 'Crimson Text', serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          border: none;
          cursor: none;
          position: relative;
          overflow: hidden;
          transition: box-shadow 0.35s ease, transform 0.25s ease;
          box-shadow: 0 8px 32px rgba(123,75,160,0.35);
        }
        .btn-primary::before {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--purple-deep);
          transform: translateX(-101%);
          transition: transform 0.45s cubic-bezier(0.77,0,0.18,1);
        }
        .btn-primary:hover::before { transform: translateX(0); }
        .btn-primary:hover {
          box-shadow: 0 14px 48px rgba(59,31,94,0.45);
          transform: translateY(-2px);
        }
        .btn-primary span { position: relative; z-index: 1; }

        .btn-ghost {
          padding: 14px 0;
          background: transparent;
          color: var(--purple-main);
          font-family: 'Crimson Text', serif;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: 3px;
          text-transform: uppercase;
          border: none;
          cursor: none;
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          transition: color 0.3s ease, gap 0.3s ease;
        }
        .btn-ghost::after {
          content: '';
          position: absolute;
          bottom: 10px;
          left: 0;
          width: 0;
          height: 1px;
          background: var(--gold);
          transition: width 0.4s ease;
        }
        .btn-ghost:hover { color: var(--purple-deep); gap: 16px; }
        .btn-ghost:hover::after { width: 100%; }
        .btn-ghost-arrow { font-size: 1.1em; transition: transform 0.3s ease; }
        .btn-ghost:hover .btn-ghost-arrow { transform: translateX(4px); }

        /* ── Right / Image area ─────────────── */
        .hero-right {
          position: relative;
          flex: 1;
          display: flex;
          align-items: flex-end;
          justify-content: center;
          overflow: visible;
          z-index: 3;
        }

        /* Soft radial glow behind buddha */
        .hero-glow {
          position: absolute;
          bottom: -10%;
          left: 50%;
          transform: translateX(-50%);
          width: 70%;
          height: 85%;
          background: radial-gradient(ellipse at 50% 75%, rgba(123,75,160,0.18) 0%, rgba(201,160,85,0.08) 40%, transparent 70%);
          pointer-events: none;
          filter: blur(40px);
        }

        /* Ornamental arc ring */
        .hero-ring {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 500px;
          height: 500px;
          border-radius: 50%;
          border: 1px solid rgba(123,75,160,0.12);
          pointer-events: none;
          opacity: 0;
          transition: opacity 1.4s ease 0.8s;
        }
        .hero-ring.visible { opacity: 1; }
        .hero-ring-2 {
          width: 380px;
          height: 380px;
          border-color: rgba(201,160,85,0.14);
          border-style: dashed;
        }

        /* Buddha image */
        .hero-buddha-wrap {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: flex-end;
          justify-content: center;
        }
        .hero-buddha {
          position: relative;
          width: auto;
          height: 95%;
          max-height: 90vh;
          object-fit: contain;
          object-position: bottom center;
          filter: drop-shadow(0 30px 80px rgba(59,31,94,0.25));
          opacity: 0;
          transform: translateY(40px) scale(0.96);
          transition: opacity 1.2s ease 0.5s, transform 1.4s cubic-bezier(0.16,1,0.3,1) 0.5s;
          z-index: 4;
          mix-blend-mode: multiply;
          /* mix-blend-mode ensures transparent-ish Buddha blends beautifully with cream bg */
        }
        .hero-buddha.visible {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        /* Floating particles */
        .hero-particle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          animation: float-up linear infinite;
          opacity: 0;
        }
        @keyframes float-up {
          0% { opacity: 0; transform: translateY(0) scale(0); }
          10% { opacity: 1; }
          80% { opacity: 0.5; }
          100% { opacity: 0; transform: translateY(-120px) scale(1.5); }
        }

        /* ── Vertical text ────────────────── */
        .hero-vtext {
          position: absolute;
          right: -4px;
          top: 50%;
          transform: translateY(-50%) rotate(90deg);
          transform-origin: center;
          font-family: 'Crimson Text', serif;
          font-size: 10px;
          font-weight: 400;
          color: var(--purple-pale);
          letter-spacing: 4px;
          text-transform: uppercase;
          white-space: nowrap;
          opacity: 0.7;
        }

        /* ── Decorative left bar ─────────── */
        .hero-left-bar {
          position: absolute;
          left: 0;
          top: 0;
          width: 4px;
          height: 100%;
          background: linear-gradient(to bottom, transparent 0%, var(--purple-main) 30%, var(--gold) 70%, transparent 100%);
          opacity: 0.5;
        }

        /* ── Trail items ─────────────────── */
        .trail-item {
          position: absolute;
          top: 0;
          left: 0;
          width: 160px;
          height: 180px;
          border-radius: 14px;
          overflow: hidden;
          opacity: 0;
          pointer-events: none;
          will-change: transform, opacity;
          box-shadow: 0 12px 40px rgba(59,31,94,0.3);
          border: 1px solid rgba(201,160,85,0.3);
        }
        .trail-inner {
          position: absolute;
          inset: -10px;
          background-size: cover;
          background-position: center;
          will-change: transform, filter;
        }

        /* ── Stats row ───────────────────── */
        .hero-stats {
          display: flex;
          gap: 36px;
          margin-top: 44px;
          padding-top: 36px;
          border-top: 1px solid rgba(123,75,160,0.12);
          opacity: 0;
          transition: opacity 0.8s ease 1.1s;
        }
        .hero-stats.visible { opacity: 1; }
        .stat-num {
          font-family: 'Playfair Display', serif;
          font-size: 1.9rem;
          font-weight: 700;
          color: var(--purple-deep);
          line-height: 1;
        }
        .stat-label {
          font-size: 10px;
          font-family: 'Crimson Text', serif;
          letter-spacing: 2px;
          color: var(--purple-pale);
          text-transform: uppercase;
          margin-top: 4px;
        }
        .stat-gold { color: var(--gold); }

        /* ── Scroll hint ─────────────────── */
        .hero-scroll {
          position: absolute;
          bottom: 36px;
          left: 72px;
          display: flex;
          align-items: center;
          gap: 12px;
          font-size: 10px;
          font-family: 'Crimson Text', serif;
          letter-spacing: 3px;
          text-transform: uppercase;
          color: var(--purple-pale);
          opacity: 0;
          transition: opacity 0.8s ease 1.4s;
        }
        .hero-scroll.visible { opacity: 1; }
        .scroll-line {
          width: 40px;
          height: 1px;
          background: var(--purple-pale);
          position: relative;
          overflow: hidden;
        }
        .scroll-line::after {
          content: '';
          position: absolute;
          inset: 0;
          background: var(--gold);
          animation: slide-right 2s ease-in-out infinite;
        }
        @keyframes slide-right {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(100%); }
          100% { transform: translateX(100%); }
        }

        /* ── Top nav ──────────────────────── */
        .hero-nav {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          padding: 32px 72px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          z-index: 10;
        }
        .nav-logo {
          font-family: 'Playfair Display', serif;
          font-size: 1.4rem;
          font-weight: 700;
          color: var(--purple-deep);
          letter-spacing: -0.02em;
        }
        .nav-logo em {
          font-style: italic;
          color: var(--gold);
        }
        .nav-links {
          display: flex;
          gap: 36px;
          align-items: center;
        }
        .nav-link {
          font-family: 'Crimson Text', serif;
          font-size: 11px;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: var(--purple-mid);
          background: none;
          border: none;
          cursor: none;
          position: relative;
          padding: 4px 0;
          transition: color 0.3s ease;
        }
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0;
          width: 0; height: 1px;
          background: var(--gold);
          transition: width 0.35s ease;
        }
        .nav-link:hover { color: var(--purple-deep); }
        .nav-link:hover::after { width: 100%; }

        .nav-cta {
          padding: 11px 26px;
          border: 1.5px solid var(--purple-main);
          color: var(--purple-main);
          font-family: 'Crimson Text', serif;
          font-size: 11px;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          background: transparent;
          cursor: none;
          transition: background 0.3s ease, color 0.3s ease;
        }
        .nav-cta:hover {
          background: var(--purple-main);
          color: #fff;
        }

        /* ── Ornamental corner ────────────── */
        .corner-ornament {
          position: absolute;
          width: 60px;
          height: 60px;
          pointer-events: none;
          opacity: 0.35;
        }
        .corner-ornament-tl { top: 80px; left: 20px; border-top: 1px solid var(--gold); border-left: 1px solid var(--gold); }
        .corner-ornament-br { bottom: 36px; right: 36px; border-bottom: 1px solid var(--gold); border-right: 1px solid var(--gold); }
      `}</style>

      {/* Custom Cursor */}
      <CursorDot />

      <div className="hero-root">
        <section ref={containerRef} className="hero-section">

          {/* Decorative left bar */}
          <div className="hero-left-bar" />

          {/* Corner ornaments */}
          <div className="corner-ornament corner-ornament-tl" />
          <div className="corner-ornament corner-ornament-br" />

          {/* Top Nav */}
          <nav className="hero-nav">
            <div className="nav-logo">EMPAVA <em>&</em> Co.</div>
            <div className="nav-links">
              {["Collection", "Philosophy", "Exhibitions", "Journal"].map((l) => (
                <button key={l} className="nav-link">{l}</button>
              ))}
              <button className="nav-cta">Book Visit</button>
            </div>
          </nav>

          {/* ── LEFT ─────────────────────────────────── */}
          <div className="hero-left">
            <div className={`hero-eyebrow ${loaded ? "visible" : ""}`}>
              <div className="hero-eyebrow-line" />
              <div className="hero-eyebrow-dot" />
              <span className="hero-eyebrow-text">Featured Exhibition · 2024</span>
            </div>

            <h1 className={`hero-title ${loaded ? "visible" : ""}`}>
              <span className="hero-title-accent">Ancient Soul</span>
              The Path<br />
              to <em>Inner</em><br />
              Serenity
            </h1>

            <div className={`hero-divider ${loaded ? "visible" : ""}`} />

            <p className={`hero-desc ${loaded ? "visible" : ""}`}>
              Where ancient Buddhist traditions converge with avant-garde
              sculpture — an immersive journey into timeless spiritual expression.
            </p>

            <div className={`hero-actions ${loaded ? "visible" : ""}`}>
              <button className="btn-primary">
                <span>Explore Collection</span>
              </button>
              <button className="btn-ghost">
                Our Philosophy
                <span className="btn-ghost-arrow">→</span>
              </button>
            </div>

            <div className={`hero-stats ${loaded ? "visible" : ""}`}>
              {[
                { num: "240+", label: "Artworks", gold: false },
                { num: "18", label: "Artists", gold: false },
                { num: "3", label: "Decades", gold: true },
              ].map(({ num, label, gold }) => (
                <div key={label}>
                  <div className={`stat-num ${gold ? "stat-gold" : ""}`}>{num}</div>
                  <div className="stat-label">{label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT ────────────────────────────────── */}
          <div className="hero-right">
            <div className="hero-glow" />
            <div className={`hero-ring ${loaded ? "visible" : ""}`} />
            <div className={`hero-ring hero-ring-2 ${loaded ? "visible" : ""}`} />

            {/* Floating particles */}
            <Particles />

            <div className="hero-buddha-wrap">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/38/Buddhist_Temple.jpg/800px-Buddhist_Temple.jpg"
                alt="Buddha statue"
                className={`hero-buddha ${loaded ? "visible" : ""}`}
                onError={(e) => {
                  // Fallback Buddha
                  e.target.src = "https://images.unsplash.com/photo-1545579133-99bb5ab189bd?w=600&q=90&auto=format&fit=crop";
                }}
              />
            </div>

            <span className="hero-vtext">Museum Exhibition · Sacred Arts</span>
          </div>

          {/* Scroll hint */}
          <div className={`hero-scroll ${loaded ? "visible" : ""}`}>
            <div className="scroll-line" />
            Scroll to Discover
          </div>

          {/* Trail items */}
          {TRAIL_SRCS.map((src, i) => (
            <div className="trail-item" key={i} style={{ zIndex: 100 }}>
              <div
                className="trail-inner"
                style={{ backgroundImage: `url(${src})` }}
              />
            </div>
          ))}
        </section>
      </div>
    </>
  );
}

/* ── Floating Particles ──────────────────────────────────────── */
function Particles() {
  const particles = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    left: 15 + Math.random() * 70,
    bottom: 5 + Math.random() * 40,
    size: 3 + Math.random() * 5,
    duration: 4 + Math.random() * 6,
    delay: Math.random() * 8,
    color: Math.random() > 0.5 ? "rgba(201,160,85,0.6)" : "rgba(123,75,160,0.4)",
  }));

  return (
    <>
      {particles.map((p) => (
        <div
          key={p.id}
          className="hero-particle"
          style={{
            left: `${p.left}%`,
            bottom: `${p.bottom}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
          }}
        />
      ))}
    </>
  );
}

/* ── Custom Cursor ───────────────────────────────────────────── */
function CursorDot() {
  const dotRef = useRef(null);

  useEffect(() => {
    const move = (e) => {
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + "px";
        dotRef.current.style.top = e.clientY + "px";
      }
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return <div ref={dotRef} className="hero-cursor" />;
}