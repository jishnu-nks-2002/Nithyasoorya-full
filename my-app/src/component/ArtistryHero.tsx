'use client';

import { useEffect, useRef, useState } from "react";
import { Bebas_Neue, Lato, Cormorant_Garamond } from "next/font/google";

const bebasNeue = Bebas_Neue({ weight: "400", subsets: ["latin"], display: "swap" });
const lato = Lato({ weight: ["300", "400"], subsets: ["latin"], display: "swap" });
const cormorant = Cormorant_Garamond({
  weight: ["300", "400"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

interface ArtistryHeroProps {
  videoSrc?: string;
}

const CAROUSEL_WORDS = [
  { word: "ARTISTRY",      sub: "THE INTERSECTION OF FLUID RESIN AND ANCIENT TERRESTRIAL STRUCTURE" },
  { word: "ALCHEMY",       sub: "WHERE RAW STONE TRANSFORMS INTO LIQUID LIGHT AND LIVING FORM" },
  { word: "GENESIS",       sub: "BORN FROM THE EARTH'S CORE — SHAPED BY FIRE, TIME AND INTENTION" },
  { word: "STILLNESS",     sub: "A MOMENT FROZEN IN CRYSTAL — SILENCE GIVEN WEIGHT AND PRESENCE" },
  { word: "METAMORPHOSIS", sub: "THE SLOW UNFOLDING OF MATTER INTO MEANING AND SACRED BEAUTY" },
  { word: "SACRED",        sub: "ANCIENT MINERAL WISDOM DISTILLED INTO OBJECTS OF DEVOTION" },
];

const MARQUEE_ITEMS = [
  "METAMORPHOSIS","✦","FROZEN LIGHT","✦","ANCIENT FORMATION","✦",
  "ALCHEMY OF STONE","✦","EMPAVAI STUDIO","✦","GEOLOGICAL ART","✦",
  "SACRED SPACES","✦","CRYSTAL WISDOM","✦",
];
const MARQUEE_TRACK = [...MARQUEE_ITEMS, ...MARQUEE_ITEMS, ...MARQUEE_ITEMS];

export default function ArtistryHero({ videoSrc = "/your-video.mp4" }: ArtistryHeroProps) {
  const [loaded, setLoaded] = useState(false);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"visible" | "exit" | "enter">("visible");
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 120);
    return () => clearTimeout(t);
  }, []);

  // visible (5s) → exit (0.9s) → swap → enter (0.9s) → visible
  useEffect(() => {
    if (!loaded || phase !== "visible") return;
    const t = setTimeout(() => setPhase("exit"), 5000);
    return () => clearTimeout(t);
  }, [loaded, phase, index]);

  useEffect(() => {
    if (phase === "exit") {
      const t = setTimeout(() => {
        setIndex(i => (i + 1) % CAROUSEL_WORDS.length);
        setPhase("enter");
      }, 900);
      return () => clearTimeout(t);
    }
    if (phase === "enter") {
      const t = setTimeout(() => setPhase("visible"), 900);
      return () => clearTimeout(t);
    }
  }, [phase]);

  const titleStyle = (): React.CSSProperties => {
    const T = "opacity 0.85s cubic-bezier(0.4,0,0.2,1), transform 0.85s cubic-bezier(0.4,0,0.2,1), filter 0.85s ease, letter-spacing 0.85s ease";
    if (phase === "exit") return { opacity: 0, transform: "translateY(-28px)", filter: "blur(10px)", letterSpacing: "0.35em", transition: T };
    if (phase === "enter") return { opacity: 0, transform: "translateY(32px)", filter: "blur(12px)", letterSpacing: "0.08em", transition: "none" };
    return { opacity: 1, transform: "translateY(0)", filter: "blur(0px)", letterSpacing: "0.22em", transition: T };
  };

  const subStyle = (): React.CSSProperties => {
    const T = "opacity 0.7s ease 0.15s, transform 0.7s ease 0.15s";
    if (phase === "exit") return { opacity: 0, transform: "translateY(-10px)", transition: T };
    if (phase === "enter") return { opacity: 0, transform: "translateY(10px)", transition: "none" };
    return { opacity: 1, transform: "translateY(0)", transition: T };
  };

  return (
    <>
      <style>{`
        .ah-root {
          position: relative; width: 100%; min-height: 100vh;
          background: #0d0516;
          overflow: hidden; display: flex; flex-direction: column;
        }

        .ah-video-wrap { position: absolute; inset: 0; z-index: 0; }
        .ah-video-wrap video {
          width: 100%; height: 100%; object-fit: cover;
          opacity: 0.5; filter: saturate(0.65) brightness(0.55);
        }

        .ah-ov1 {
          position: absolute; inset: 0; z-index: 1;
          background: linear-gradient(to bottom,
            rgba(10,3,22,0.3) 0%, rgba(10,3,22,0.0) 25%,
            rgba(10,3,22,0.15) 60%, rgba(10,3,22,0.92) 100%
          );
        }
        .ah-ov2 {
          position: absolute; inset: 0; z-index: 2;
          background: radial-gradient(ellipse 80% 80% at 50% 40%, transparent 20%, rgba(6,1,16,0.55) 100%);
        }
        .ah-ov3 { position: absolute; inset: 0; z-index: 2; background: rgba(60,10,100,0.18); }

        .ah-grain {
          position: absolute; inset: -50%; width: 200%; height: 200%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E");
          opacity: 0.04; pointer-events: none; z-index: 3;
          animation: grain 8s steps(10) infinite;
        }
        @keyframes grain {
          0%,100%{transform:translate(0,0)} 10%{transform:translate(-2%,-3%)}
          20%{transform:translate(3%,2%)} 30%{transform:translate(-1%,4%)}
          40%{transform:translate(4%,-1%)} 50%{transform:translate(-3%,3%)}
          60%{transform:translate(2%,-4%)} 70%{transform:translate(-4%,1%)}
          80%{transform:translate(1%,-2%)} 90%{transform:translate(3%,4%)}
        }

        .ah-content {
          position: relative; z-index: 10;
          flex: 1; display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          text-align: center; padding: 0 32px; min-height: 100vh;
        }

        .ah-title-wrap { overflow: hidden; padding: 8px 0; }
        .ah-title {
          font-size: clamp(64px, 14vw, 160px);
          line-height: 0.88;
          color: rgba(238,230,255,0.92);
          text-shadow: 0 0 120px rgba(160,80,255,0.18), 0 2px 60px rgba(0,0,0,0.6);
          display: block;
          will-change: opacity, transform, filter, letter-spacing;
          opacity: 0; transform: translateY(36px);
          transition: opacity 1.2s cubic-bezier(0.16,1,0.3,1) 0.3s, transform 1.2s cubic-bezier(0.16,1,0.3,1) 0.3s;
        }
        .loaded .ah-title { opacity: 1; transform: translateY(0); }

        .ah-sub-wrap { margin-top: 28px; min-height: 40px; }
        .ah-sub {
          font-size: clamp(9px, 1.1vw, 12px); font-weight: 300;
          letter-spacing: 0.22em; color: rgba(200,180,240,0.6);
          text-transform: uppercase; line-height: 1.9;
          max-width: 420px; margin: 0 auto;
          will-change: opacity, transform;
          opacity: 0; transform: translateY(10px);
          transition: opacity 1s ease 0.8s, transform 1s ease 0.8s;
        }
        .loaded .ah-sub { opacity: 1; transform: translateY(0); }

        .ah-scroll {
          position: absolute; bottom: 90px; left: 50%; transform: translateX(-50%);
          display: flex; flex-direction: column; align-items: center; gap: 10px;
          opacity: 0; transition: opacity 1s ease 1.4s; z-index: 10;
        }
        .loaded .ah-scroll { opacity: 1; }
        .ah-scroll-label {
          font-size: 8px; letter-spacing: 0.3em; text-transform: uppercase;
          color: rgba(180,150,230,0.45); font-weight: 300;
        }
        .ah-scroll-line {
          width: 1px; height: 36px;
          background: linear-gradient(to bottom, rgba(180,130,255,0.5), transparent);
          animation: scroll-pulse 2s ease-in-out infinite;
        }
        @keyframes scroll-pulse {
          0%,100% { opacity: 0.4; transform: scaleY(1); }
          50% { opacity: 1; transform: scaleY(1.15); }
        }

        .ah-marquee-outer {
          position: absolute; bottom: 0; left: 0; right: 0;
          z-index: 10; padding: 16px 0 20px;
          border-top: 1px solid rgba(180,130,255,0.1);
          overflow: hidden;
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
          mask-image: linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%);
          background: rgba(10,3,22,0.3);
        }
        .ah-marquee-track {
          display: flex; align-items: center; white-space: nowrap;
          animation: marquee 30s linear infinite;
          will-change: transform;
        }
        .ah-marquee-outer:hover .ah-marquee-track { animation-play-state: paused; }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.333%); }
        }
        .ah-mitem {
          font-size: clamp(18px, 2.8vw, 32px); letter-spacing: 0.18em;
          color: rgba(180,130,255,0.13); padding: 0 22px; display: inline-block;
          transition: color 0.3s ease; user-select: none;
        }
        .ah-mitem.accent {
          font-size: clamp(10px, 1.4vw, 16px); color: rgba(192,132,252,0.25);
          padding: 0 14px; vertical-align: middle;
        }
        .ah-mitem:hover { color: rgba(192,132,252,0.45); }

        @media (max-width: 600px) {
          .ah-sub { font-size: 8px; letter-spacing: 0.18em; }
          .ah-scroll { bottom: 76px; }
        }
      `}</style>

      <div className={`ah-root ${loaded ? "loaded" : ""} ${lato.className}`}>

        {/* Video */}
        <div className="ah-video-wrap">
          <video
            ref={videoRef}
            src={videoSrc}
            autoPlay
            muted
            loop
            playsInline
            poster="/images/hero-poster.jpg"
          />
        </div>

        {/* Overlays */}
        <div className="ah-ov1" />
        <div className="ah-ov2" />
        <div className="ah-ov3" />
        <div className="ah-grain" />

        {/* Centred content */}
        <div className="ah-content">
          <div className="ah-title-wrap">
            <h1
              className={`ah-title ${bebasNeue.className}`}
              style={loaded ? titleStyle() : undefined}
            >
              {CAROUSEL_WORDS[index].word}
            </h1>
          </div>

          <div className="ah-sub-wrap">
            <p
              className="ah-sub"
              style={loaded ? subStyle() : undefined}
            >
              {CAROUSEL_WORDS[index].sub}
            </p>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="ah-scroll">
          <span className="ah-scroll-label">Scroll to Explore</span>
          <div className="ah-scroll-line" />
        </div>

        {/* Marquee */}
        <div className="ah-marquee-outer" aria-hidden="true">
          <div className={`ah-marquee-track ${bebasNeue.className}`}>
            {MARQUEE_TRACK.map((item, i) => (
              <span key={i} className={`ah-mitem${item === "✦" ? " accent" : ""}`}>
                {item}
              </span>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}