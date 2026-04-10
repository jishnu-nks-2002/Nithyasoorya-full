import { useState, useEffect } from "react";

const DiamondIcon = () => (
  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="32,4 56,20 56,44 32,60 8,44 8,20" stroke="rgba(180,150,255,0.6)" strokeWidth="1.5" fill="none"/>
    <polygon points="32,4 56,20 32,28 8,20" fill="rgba(180,150,255,0.15)" stroke="rgba(180,150,255,0.5)" strokeWidth="1"/>
    <polygon points="32,28 56,20 56,44 32,60" fill="rgba(140,100,255,0.12)" stroke="rgba(180,150,255,0.4)" strokeWidth="1"/>
    <polygon points="32,28 8,20 8,44 32,60" fill="rgba(160,120,255,0.12)" stroke="rgba(180,150,255,0.4)" strokeWidth="1"/>
    <line x1="32" y1="4" x2="32" y2="28" stroke="rgba(200,170,255,0.4)" strokeWidth="0.8"/>
    <line x1="8" y1="20" x2="56" y2="20" stroke="rgba(200,170,255,0.3)" strokeWidth="0.8"/>
  </svg>
);

export default function ZenithBanner() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Cinzel:wght@400;500&family=Raleway:wght@300;400&display=swap');

        .zenith-banner * { box-sizing: border-box; margin: 0; padding: 0; }

        .zenith-banner {
          display: flex;
          width: 100%;
          min-height: 100vh;
          font-family: 'Raleway', sans-serif;
          overflow: hidden;
        }

        /* LEFT PANEL */
        .left-panel {
          position: relative;
          flex: 0 0 48%;
          background: #0a0a0f;
          overflow: hidden;
          display: flex;
          align-items: flex-end;
        }

        .left-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(10,10,20,0.1) 0%,
            rgba(10,10,20,0.05) 40%,
            rgba(10,10,20,0.6) 80%,
            rgba(10,10,20,0.92) 100%
          );
          z-index: 2;
        }

        .tree-image-placeholder {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 60% at 50% 55%, rgba(80,200,210,0.08) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 50% 75%, rgba(120,80,40,0.15) 0%, transparent 60%),
            linear-gradient(180deg, #0d1520 0%, #0a0f1a 40%, #0e1008 100%);
          z-index: 1;
        }

        /* Simulated tree effect using CSS */
        .tree-visual {
          position: absolute;
          inset: 0;
          z-index: 1;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .tree-glow {
          position: absolute;
          width: 320px;
          height: 320px;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -55%);
          background: radial-gradient(ellipse, rgba(80,210,220,0.12) 0%, rgba(80,210,220,0.04) 40%, transparent 70%);
          border-radius: 50%;
          animation: pulse 4s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 0.6; transform: translate(-50%, -55%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -55%) scale(1.06); }
        }

        .bottom-caption {
          position: relative;
          z-index: 3;
          padding: 0 40px 40px;
          width: 100%;
        }

        .caption-label {
          font-family: 'Cinzel', serif;
          font-size: 9px;
          letter-spacing: 0.35em;
          color: rgba(150,200,210,0.6);
          text-transform: uppercase;
          margin-bottom: 8px;
          opacity: 0;
          transform: translateY(12px);
          transition: all 0.8s ease 0.3s;
        }

        .caption-title {
          font-family: 'Cinzel', serif;
          font-size: 22px;
          font-weight: 400;
          letter-spacing: 0.15em;
          color: rgba(240,235,255,0.92);
          text-transform: uppercase;
          opacity: 0;
          transform: translateY(12px);
          transition: all 0.8s ease 0.5s;
        }

        .loaded .caption-label,
        .loaded .caption-title {
          opacity: 1;
          transform: translateY(0);
        }

        .caption-line {
          width: 48px;
          height: 1px;
          background: linear-gradient(to right, rgba(120,180,200,0.6), transparent);
          margin-bottom: 10px;
          opacity: 0;
          transition: all 0.8s ease 0.2s;
          transform: scaleX(0);
          transform-origin: left;
        }

        .loaded .caption-line {
          opacity: 1;
          transform: scaleX(1);
        }

        /* RIGHT PANEL */
        .right-panel {
          flex: 1;
          background: #4a1a8a;
          background: linear-gradient(135deg, #3d1575 0%, #5a2298 40%, #4a1a8a 70%, #3a1060 100%);
          position: relative;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 48px;
          overflow: hidden;
        }

        .right-panel::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 30% 20%, rgba(180,120,255,0.12) 0%, transparent 60%),
            radial-gradient(ellipse 60% 80% at 80% 80%, rgba(80,20,160,0.3) 0%, transparent 60%);
          pointer-events: none;
        }

        /* Subtle grid overlay */
        .right-panel::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
          background-size: 40px 40px;
          pointer-events: none;
        }

        .diamond-container {
          position: relative;
          z-index: 2;
          margin-bottom: 32px;
          opacity: 0;
          transform: translateY(-16px) scale(0.9);
          transition: all 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.2s;
        }

        .loaded .diamond-container {
          opacity: 1;
          transform: translateY(0) scale(1);
        }

        .image-placeholder {
          width: 100px;
          height: 100px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          backdrop-filter: blur(4px);
          margin-bottom: 40px;
          position: relative;
          z-index: 2;
          opacity: 0;
          transform: scale(0.95);
          transition: all 0.8s ease 0.35s;
        }

        .loaded .image-placeholder {
          opacity: 1;
          transform: scale(1);
        }

        .right-content {
          position: relative;
          z-index: 2;
          text-align: center;
          max-width: 380px;
        }

        .heading-top {
          font-family: 'Cinzel', serif;
          font-size: clamp(26px, 3vw, 38px);
          font-weight: 400;
          color: rgba(245,240,255,0.96);
          letter-spacing: 0.08em;
          line-height: 1.1;
          text-transform: uppercase;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.5s;
        }

        .heading-italic {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(30px, 3.5vw, 44px);
          font-weight: 300;
          font-style: italic;
          color: rgba(245,240,255,0.96);
          letter-spacing: 0.04em;
          line-height: 1.1;
          display: block;
          margin-top: 2px;
          opacity: 0;
          transform: translateY(20px);
          transition: all 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.65s;
        }

        .loaded .heading-top,
        .loaded .heading-italic {
          opacity: 1;
          transform: translateY(0);
        }

        .divider {
          width: 40px;
          height: 1px;
          background: rgba(200,170,255,0.4);
          margin: 24px auto;
          opacity: 0;
          transition: all 0.8s ease 0.8s;
          transform: scaleX(0);
        }

        .loaded .divider {
          opacity: 1;
          transform: scaleX(1);
        }

        .body-text {
          font-size: 13px;
          font-weight: 300;
          line-height: 1.75;
          color: rgba(210,195,240,0.75);
          letter-spacing: 0.04em;
          margin-bottom: 40px;
          opacity: 0;
          transform: translateY(12px);
          transition: all 0.8s ease 0.9s;
        }

        .loaded .body-text {
          opacity: 1;
          transform: translateY(0);
        }

        .cta-row {
          display: flex;
          gap: 14px;
          justify-content: center;
          opacity: 0;
          transform: translateY(12px);
          transition: all 0.8s ease 1.05s;
        }

        .loaded .cta-row {
          opacity: 1;
          transform: translateY(0);
        }

        .btn {
          font-family: 'Cinzel', serif;
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          padding: 13px 22px;
          cursor: pointer;
          border: none;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .btn::after {
          content: '';
          position: absolute;
          inset: 0;
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .btn-primary {
          background: rgba(255,255,255,0.12);
          color: rgba(240,235,255,0.95);
          border: 1px solid rgba(255,255,255,0.25);
          backdrop-filter: blur(8px);
        }

        .btn-primary:hover {
          background: rgba(255,255,255,0.2);
          border-color: rgba(255,255,255,0.4);
          transform: translateY(-1px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        }

        .btn-secondary {
          background: transparent;
          color: rgba(210,195,240,0.8);
          border: 1px solid rgba(200,170,255,0.3);
        }

        .btn-secondary:hover {
          color: rgba(240,235,255,0.95);
          border-color: rgba(200,170,255,0.6);
          transform: translateY(-1px);
        }

        /* Decorative corner elements */
        .corner-decoration {
          position: absolute;
          width: 60px;
          height: 60px;
          opacity: 0.2;
        }
        .corner-tl { top: 20px; left: 20px; border-top: 1px solid rgba(200,170,255,0.8); border-left: 1px solid rgba(200,170,255,0.8); }
        .corner-br { bottom: 20px; right: 20px; border-bottom: 1px solid rgba(200,170,255,0.8); border-right: 1px solid rgba(200,170,255,0.8); }

        @media (max-width: 768px) {
          .zenith-banner { flex-direction: column; min-height: auto; }
          .left-panel { flex: 0 0 50vh; min-height: 50vh; }
          .right-panel { padding: 48px 32px; }
        }
      `}</style>

      <div className={`zenith-banner ${loaded ? "loaded" : ""}`}>
        {/* LEFT PANEL */}
        <div className="left-panel">
          <div className="tree-image-placeholder" />
          <div className="tree-visual">
            <div className="tree-glow" />
          </div>

          <div className="bottom-caption">
            <div className="caption-line" />
            <div className="caption-label">Handcrafted Excellence</div>
            <div className="caption-title">The Zenith Collection</div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <div className="corner-decoration corner-tl" />
          <div className="corner-decoration corner-br" />

          <div className="diamond-container">
            <DiamondIcon />
          </div>

          <div className="image-placeholder" />

          <div className="right-content">
            <h1 className="heading-top">Art for the</h1>
            <span className="heading-italic">Modern Sanctuary</span>

            <div className="divider" />

            <p className="body-text">
              Discover sculptural masterpieces that blend<br />
              natural elements with ethereal design. Elevate<br />
              your home with the spirit of Empavai.
            </p>

            <div className="cta-row">
              <button className="btn btn-primary">Explore Gallery</button>
              <button className="btn btn-secondary">Our Story</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}