'use client';

import { useEffect, useRef, useState, FC } from "react";
import Image from "next/image";
import { Jost, Cormorant_Garamond } from "next/font/google";

const jost = Jost({ weight: ["200", "300", "400", "500", "600"], subsets: ["latin"], display: "swap" });
const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const EmpavaiAbout: FC = () => {
  const [visible, setVisible] = useState(false);
  const rootRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); io.disconnect(); } },
      { threshold: 0.12 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <style>{`
        .ea-root *, .ea-root *::before, .ea-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes ea-fadeUp    { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes ea-fadeIn    { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ea-scaleX    { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        @keyframes ea-slideRight { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes ea-floatY    { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }

        .ea-root {
          width: 100%; min-height: 100vh;
          background: #fff; position: relative; overflow: hidden; display: flex; align-items: stretch;
        }
        .ea-root::before {
          content: ''; position: absolute; inset: 0;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.018'/%3E%3C/svg%3E");
          background-size: 200px 200px; pointer-events: none; z-index: 0;
        }

        .ea-arc   { position: absolute; top: -90px;  left: -90px;  width: 300px; height: 300px; border-radius: 50%; border: 1px solid rgba(150,130,90,0.15); pointer-events: none; z-index: 0; }
        .ea-arc-2 { position: absolute; top: -130px; left: -130px; width: 400px; height: 400px; border-radius: 50%; border: 1px solid rgba(150,130,90,0.08); pointer-events: none; z-index: 0; }

        .ea-grid { position: relative; z-index: 1; width: 100%; display: grid; grid-template-columns: 1.05fr 0.95fr; min-height: 100vh; }

        .ea-left {
          display: flex; flex-direction: column; justify-content: center;
          padding: 96px 72px 80px 80px;
          border-right: 1px solid rgba(180,160,120,0.15);
        }

        .ea-eyebrow {
          font-size: 9px; font-weight: 500; letter-spacing: 0.32em;
          text-transform: uppercase; color: #8b5cf6; margin-bottom: 28px;
          opacity: 0;
        }
        .ea-eyebrow.visible { animation: ea-fadeIn 0.8s ease 0.1s forwards; }

        .ea-headline {
          font-size: clamp(48px,5.8vw,86px); font-weight: 400;
          line-height: 1.03; letter-spacing: -0.02em; color: #1e1810; margin-bottom: 48px; opacity: 0;
        }
        .ea-headline.visible { animation: ea-fadeUp 1s cubic-bezier(0.22,1,0.36,1) 0.22s forwards; }
        .ea-headline em { font-style: italic; color: #3b1a6e; }

        .ea-body-grid {
          display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-bottom: 60px; opacity: 0;
        }
        .ea-body-grid.visible { animation: ea-fadeUp 1s ease 0.44s forwards; }
        .ea-body-col p { font-size: clamp(12.5px,1.1vw,14.5px); font-weight: 300; line-height: 1.88; color: black; letter-spacing: 0.01em; }

        .ea-rule {
          width: 44px; height: 1px;
          background: linear-gradient(90deg, #8a7a5a, transparent);
          margin-bottom: 44px; transform-origin: left; opacity: 0; transform: scaleX(0);
        }
        .ea-rule.visible { animation: ea-scaleX 0.7s ease 0.38s forwards; }

        .ea-right {
          position: relative; display: flex; align-items: center; justify-content: center;
          padding: 80px 64px 80px 72px; background: #f3e7ff; opacity: 0;
        }
        .ea-right.visible { animation: ea-slideRight 1.1s cubic-bezier(0.22,1,0.36,1) 0.3s forwards; }
        .ea-right::before {
          content: ''; position: absolute; inset: 0;
          background-image: repeating-linear-gradient(90deg, transparent, transparent 48px, rgba(180,160,120,0.06) 48px, rgba(180,160,120,0.06) 49px);
          pointer-events: none;
        }

        .ea-img-stack {
          position: relative; width: 100%; max-width: 400px;
          display: flex; flex-direction: column; align-items: center; gap: 0;
          animation: ea-floatY 9s ease-in-out 1.4s infinite;
        }

        .ea-img-top {
          position: relative; width: 220px; height: 220px; border-radius: 50%; overflow: hidden;
          box-shadow: 0 20px 60px rgba(90,70,30,0.18), 0 4px 16px rgba(90,70,30,0.1), inset 0 1px 0 rgba(255,255,255,0.4);
          z-index: 2; margin-bottom: -28px; border: 6px solid #f3ede2; flex-shrink: 0;
        }

        .ea-img-bottom {
          position: relative; width: 100%; max-width: 540px; aspect-ratio: 3/4;
          border-radius: 18px; overflow: hidden;
          box-shadow: 0 32px 80px rgba(90,70,30,0.16), 0 8px 24px rgba(90,70,30,0.09); z-index: 1;
        }
        .ea-img-bottom::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(to bottom, rgba(220,200,160,0.12) 0%, transparent 40%, rgba(180,150,100,0.18) 100%);
          pointer-events: none;
        }

        .ea-dots { position: absolute; top: 24px; right: 24px; display: grid; grid-template-columns: repeat(4,4px); gap: 6px; z-index: 5; }
        .ea-dot  { width: 3px; height: 3px; border-radius: 50%; background: rgba(140,120,80,0.3); }

        @media (max-width: 960px) {
          .ea-grid { grid-template-columns: 1fr; min-height: auto; }
          .ea-left { padding: 72px 36px 56px; border-right: none; border-bottom: 1px solid rgba(180,160,120,0.15); }
          .ea-headline { font-size: clamp(44px,9vw,72px); }
          .ea-right { padding: 64px 36px 72px; }
          .ea-body-grid { grid-template-columns: 1fr; gap: 20px; }
        }
        @media (max-width: 560px) {
          .ea-left { padding: 60px 24px 48px; }
          .ea-right { padding: 48px 24px 60px; }
          .ea-img-top { width: 160px; height: 160px; }
        }
      `}</style>

      <section ref={rootRef} className={`ea-root ${jost.className}`} aria-label="About Empavai">
        <div className="ea-arc"   aria-hidden="true" />
        <div className="ea-arc-2" aria-hidden="true" />

        <div className="ea-grid">

          {/* LEFT */}
          <div className="ea-left">
            <p className={`ea-eyebrow${visible ? " visible" : ""}`}>The Original Source</p>

            <h2 className={`ea-headline ${cormorant.className}${visible ? " visible" : ""}`}>
              Where Artistry<br />Meets <em>the Soul</em>
            </h2>

            <div className={`ea-rule${visible ? " visible" : ""}`} />

            <div className={`ea-body-grid${visible ? " visible" : ""}`}>
              <div className="ea-body-col">
                <p>
                  Every piece at Empavai is more than an ornament — it is a labour of
                  silence and contemplation. Our works speak without words, performing
                  small ceremonies for the beholder, showing every shape and colour at rest.
                </p>
              </div>
              <div className="ea-body-col">
                <p>
                  We blend traditional and modern materials, making durable yet delicate art
                  for a contemporary collection. Our focus on pure, organic textures reveals
                  the inner depth of the individual and enriches the spaces we inhabit together.
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT */}
          <div className={`ea-right${visible ? " visible" : ""}`}>
            <div className="ea-dots" aria-hidden="true">
              {Array.from({ length: 16 }).map((_, i) => <div key={i} className="ea-dot" />)}
            </div>

            <div className="ea-img-stack">
              <div className="ea-img-top">
                <Image src="/images/p-6.jpeg" alt="Handcrafted ceramic piece" fill sizes="220px" style={{ objectFit: "cover" }} />
              </div>
              <div className="ea-img-bottom">
                <Image src="/images/p-4.jpeg" alt="Natural linen textures and materials" fill sizes="540px" style={{ objectFit: "cover", objectPosition: "center" }} />
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
};

export default EmpavaiAbout;