'use client';

import { useRef } from "react";
import Image from "next/image";
import { Bebas_Neue, Lato, Cormorant_Garamond } from "next/font/google";

const bebasNeue = Bebas_Neue({ weight: "400", subsets: ["latin"], display: "swap" });
const lato = Lato({ weight: ["300", "400"], subsets: ["latin"], display: "swap" });
const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const artist = {
  name: "Kavya Nair",
  title: "Crystal & Resin Sculptor",
  specialty: "Amethyst · Fluid Resin · Sacred Geometry",
  bio: "Kavya channels the ancient language of stone into contemporary form. Her work bridges geological time with present stillness — each piece a meditation on matter and memory. Born from a lineage of craftspeople in Kerala, she brings both ancestral reverence and radical material experimentation to every creation.",
  works: 34,
  years: 8,
  collectors: 412,
  img: "/images/person/img-1.jpeg",
  featured1: "/images/p-1.jpeg",
  featured2: "/images/p-2.jpeg",
  featured3: "/images/p-3.jpeg",
  tag: "Lead Artist",
  quote: "Every material carries a memory. My work is simply to listen.",
};

export default function ArtistSection() {
  const rootRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
          --deep: #0d0516;
          --purple: #6b3fa0;
          --purple-light: #c084fc;
          --cream: rgba(238,230,255,0.92);
          --muted: rgba(190,165,230,0.5);
          --border: rgba(180,130,255,0.1);
        }

        .as-root {
          background: var(--deep);
          color: var(--cream);
          position: relative;
          overflow: hidden;
        }

        .as-glow1 {
          position: absolute; width: 700px; height: 700px; border-radius: 50%;
          background: radial-gradient(circle, rgba(107,63,160,0.16) 0%, transparent 70%);
          top: -180px; right: -180px; pointer-events: none; z-index: 0;
        }
        .as-glow2 {
          position: absolute; width: 500px; height: 500px; border-radius: 50%;
          background: radial-gradient(circle, rgba(123,47,255,0.09) 0%, transparent 70%);
          bottom: 0; left: -120px; pointer-events: none; z-index: 0;
        }
        .as-grain {
          position: absolute; inset: -50%; width: 200%; height: 200%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
          opacity: 0.03; pointer-events: none; z-index: 0;
        }

        .as-inner {
          position: relative; z-index: 2;
          padding: 88px 60px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .as-header {
          display: flex; align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 48px; gap: 24px;
        }
        .as-eyebrow {
          font-size: 9px; letter-spacing: 0.36em;
          text-transform: uppercase; color: rgba(192,132,252,0.55);
          margin-bottom: 12px; font-weight: 300;
        }
        .as-heading {
          font-size: clamp(34px, 4.5vw, 54px);
          font-weight: 400; line-height: 1.05;
          color: var(--cream); letter-spacing: 0.02em;
        }
        .as-heading em { font-style: italic; color: var(--purple-light); font-weight: 300; }
        .as-header-sub {
          max-width: 280px; text-align: right;
          font-size: 11.5px; font-weight: 300;
          line-height: 1.85; color: var(--muted); letter-spacing: 0.03em;
        }

        .as-divider { width: 100%; height: 1px; background: var(--border); margin-bottom: 56px; }

        .as-grid {
          display: grid;
          grid-template-columns: 320px 1fr;
          gap: 64px; align-items: start;
        }

        .as-left { display: flex; flex-direction: column; gap: 14px; }

        .as-portrait {
          position: relative; overflow: hidden;
          border-radius: 5px; aspect-ratio: 3/4;
          border: 1px solid var(--border);
        }
        .as-portrait img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          filter: saturate(0.72) brightness(0.82);
          transition: filter 0.6s ease, transform 0.6s ease;
        }
        .as-portrait:hover img {
          filter: saturate(0.88) brightness(0.9);
          transform: scale(1.02);
        }
        .as-portrait::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(to bottom, transparent 55%, rgba(10,3,22,0.75) 100%);
        }
        .as-portrait-name { position: absolute; bottom: 18px; left: 18px; z-index: 2; }
        .as-portrait-name strong {
          display: block;
          font-size: 20px; font-weight: 400;
          color: var(--cream); letter-spacing: 0.05em;
        }
        .as-portrait-name span {
          font-size: 9px; letter-spacing: 0.22em;
          text-transform: uppercase; color: rgba(192,132,252,0.6); font-weight: 300;
        }
        .as-tag-pill {
          position: absolute; top: 16px; left: 16px; z-index: 2;
          padding: 5px 12px;
          background: rgba(107,63,160,0.55);
          border: 1px solid rgba(192,132,252,0.25);
          border-radius: 2px; font-size: 8px; letter-spacing: 0.2em;
          text-transform: uppercase; color: var(--purple-light);
          backdrop-filter: blur(6px);
        }

        .as-works-row { display: grid; grid-template-columns: repeat(3,1fr); gap: 8px; }
        .as-work-thumb {
          position: relative; overflow: hidden;
          border-radius: 3px; aspect-ratio: 1/1;
          border: 1px solid var(--border); cursor: pointer;
        }
        .as-work-thumb img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          filter: saturate(0.6) brightness(0.7);
          transition: filter 0.4s ease, transform 0.4s ease;
        }
        .as-work-thumb:hover img {
          filter: saturate(0.85) brightness(0.9);
          transform: scale(1.06);
        }
        .as-work-thumb::after {
          content: ''; position: absolute; inset: 0;
          background: rgba(60,10,100,0.2);
        }
        .as-work-label {
          font-size: 8px; letter-spacing: 0.16em;
          text-transform: uppercase; color: rgba(192,132,252,0.4); font-weight: 300;
        }

        .as-right { display: flex; flex-direction: column; gap: 32px; }

        .as-name {
          font-size: clamp(40px, 5.5vw, 68px);
          font-weight: 400; line-height: 0.95;
          color: var(--cream); letter-spacing: 0.02em;
        }
        .as-name-title {
          font-style: italic; font-weight: 300;
          font-size: clamp(16px, 2vw, 22px);
          color: var(--purple-light); letter-spacing: 0.06em;
          margin-top: 8px; display: block;
        }
        .as-specialty {
          font-size: 9px; letter-spacing: 0.26em; text-transform: uppercase;
          color: rgba(192,132,252,0.4); font-weight: 300; margin-top: 16px;
        }

        .as-rule {
          width: 48px; height: 1px;
          background: linear-gradient(to right, var(--purple-light), transparent);
          opacity: 0.4;
        }

        .as-bio {
          font-size: clamp(15px, 1.5vw, 18px);
          font-weight: 300; font-style: italic;
          line-height: 1.9; color: rgba(210,195,240,0.62);
          letter-spacing: 0.02em;
          padding-left: 22px;
          border-left: 1px solid rgba(192,132,252,0.18);
        }

        .as-stats {
          display: flex; gap: 0;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
        }
        .as-stat {
          flex: 1; padding: 22px 0;
          border-right: 1px solid var(--border);
        }
        .as-stat:last-child { border-right: none; }
        .as-stat-val {
          font-size: 44px; letter-spacing: 0.06em;
          color: var(--cream); line-height: 1;
        }
        .as-stat-val sup { font-size: 18px; color: var(--purple-light); vertical-align: super; }
        .as-stat-label {
          font-size: 8.5px; letter-spacing: 0.22em;
          text-transform: uppercase; color: var(--muted); margin-top: 5px; font-weight: 300;
        }

        .as-quote {
          position: relative; padding: 28px 28px 28px 32px;
          background: rgba(107,63,160,0.08);
          border-radius: 3px; border: 1px solid rgba(192,132,252,0.1);
        }
        .as-quote::before {
          content: '"';
          position: absolute; top: -8px; left: 18px;
          font-size: 80px; line-height: 1;
          color: rgba(192,132,252,0.15); pointer-events: none;
        }
        .as-quote p {
          font-size: clamp(16px, 1.8vw, 20px);
          font-style: italic; font-weight: 300;
          line-height: 1.75; color: rgba(220,205,245,0.6); letter-spacing: 0.03em;
        }
        .as-quote cite {
          display: block; margin-top: 12px;
          font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase;
          color: rgba(192,132,252,0.4); font-style: normal;
        }

        .as-actions { display: flex; gap: 14px; flex-wrap: wrap; align-items: center; }

        .as-btn-fill {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 14px 30px;
          font-size: 9px; font-weight: 400;
          letter-spacing: 0.26em; text-transform: uppercase;
          color: var(--purple-light);
          border: 1px solid rgba(192,132,252,0.3);
          border-radius: 2px; cursor: pointer; text-decoration: none;
          background: linear-gradient(to right, var(--purple) 50%, transparent 50%);
          background-size: 200% 100%; background-position: right center;
          transition: background-position 0.45s cubic-bezier(0.4,0,0.2,1), color 0.4s ease, border-color 0.4s ease;
        }
        .as-btn-fill:hover { background-position: left center; color: #fff; border-color: var(--purple); }

        .as-btn-ghost {
          display: inline-flex; align-items: center; gap: 10px;
          padding: 14px 20px;
          font-size: 9px; font-weight: 400;
          letter-spacing: 0.26em; text-transform: uppercase;
          color: rgba(190,165,230,0.45);
          background: none; border: none;
          border-bottom: 1px solid rgba(190,165,230,0.18);
          cursor: pointer;
          transition: color 0.3s ease, border-color 0.3s ease;
        }
        .as-btn-ghost:hover { color: var(--purple-light); border-color: var(--purple-light); }

        .as-strip {
          margin-top: 56px; padding-top: 28px;
          border-top: 1px solid var(--border);
          display: flex; align-items: center;
          justify-content: space-between; gap: 20px;
        }
        .as-strip-text {
          font-size: 12px; font-style: italic;
          color: rgba(180,150,230,0.3); letter-spacing: 0.04em;
        }
        .as-strip-right { display: flex; align-items: center; gap: 20px; }
        .as-strip-num {
          font-size: 13px; letter-spacing: 0.18em; color: rgba(192,132,252,0.25);
        }

        @media (max-width: 900px) {
          .as-inner { padding: 56px 28px; }
          .as-grid { grid-template-columns: 1fr; gap: 40px; }
          .as-portrait { aspect-ratio: 4/3; }
          .as-header { flex-direction: column; align-items: flex-start; }
          .as-header-sub { text-align: left; max-width: 100%; }
        }
        @media (max-width: 520px) {
          .as-stats { flex-wrap: wrap; }
          .as-stat { flex: 0 0 50%; }
        }
      `}</style>

      <section className={`as-root ${lato.className}`} ref={rootRef}>
        <div className="as-glow1" />
        <div className="as-glow2" />
        <div className="as-grain" />

        <div className="as-inner">

          {/* Header */}
          <div className="as-header">
            <div>
              <p className="as-eyebrow">The Maker</p>
              <h2 className={`as-heading ${cormorant.className}`}>
                Artist in<br /><em>Residence</em>
              </h2>
            </div>
            <p className="as-header-sub">
              A singular voice working at the edge of material possibility — rooted in crystal, resin, and the sacred geometry of ancient stone.
            </p>
          </div>

          <div className="as-divider" />

          {/* Main grid */}
          <div className="as-grid">

            {/* LEFT */}
            <div className="as-left">
              <div className="as-portrait">
                <span className="as-tag-pill">{artist.tag}</span>
                <Image
                  src={artist.img}
                  alt={artist.name}
                  fill
                  sizes="320px"
                  style={{ objectFit: "cover", filter: "saturate(0.72) brightness(0.82)" }}
                />
                <div className="as-portrait-name">
                  <strong className={cormorant.className}>{artist.name}</strong>
                  <span>{artist.title}</span>
                </div>
              </div>

              <p className="as-work-label">Selected Works</p>
              <div className="as-works-row">
                {[artist.featured1, artist.featured2, artist.featured3].map((src, i) => (
                  <div key={i} className="as-work-thumb">
                    <Image
                      src={src}
                      alt={`Work ${i + 1}`}
                      fill
                      sizes="100px"
                      style={{ objectFit: "cover", filter: "saturate(0.6) brightness(0.7)" }}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT */}
            <div className="as-right">

              <div>
                <h3 className={`as-name ${cormorant.className}`}>{artist.name}</h3>
                <span className={`as-name-title ${cormorant.className}`}>{artist.title}</span>
                <p className="as-specialty">{artist.specialty}</p>
              </div>

              <div className="as-rule" />

              <p className={`as-bio ${cormorant.className}`}>{artist.bio}</p>

              {/* Stats */}
              <div className="as-stats">
                <div className="as-stat">
                  <div className={`as-stat-val ${bebasNeue.className}`}>{artist.works}<sup>+</sup></div>
                  <div className="as-stat-label">Works Created</div>
                </div>
                <div className="as-stat">
                  <div className={`as-stat-val ${bebasNeue.className}`}>{artist.years}<sup>yr</sup></div>
                  <div className="as-stat-label">Years Active</div>
                </div>
                <div className="as-stat">
                  <div className={`as-stat-val ${bebasNeue.className}`}>{artist.collectors}<sup>+</sup></div>
                  <div className="as-stat-label">Collectors</div>
                </div>
              </div>

              {/* Quote */}
              <div className="as-quote">
                <p className={cormorant.className}>{artist.quote}</p>
                <cite>— {artist.name}</cite>
              </div>

              {/* Actions */}
              <div className="as-actions">
                <a href="#contact" className={`as-btn-fill ${lato.className}`}>
                  Commission a Work
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </a>
                <button className={`as-btn-ghost ${lato.className}`}>
                  View Full Portfolio
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              </div>

            </div>
          </div>

          {/* Bottom strip */}
          <div className="as-strip">
            <span className={`as-strip-text ${cormorant.className}`}>
              Empavai Studio · Kerala, India · Est. 2016
            </span>
            <div className="as-strip-right">
              <span className={`as-strip-num ${bebasNeue.className}`}>01 / 01</span>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}