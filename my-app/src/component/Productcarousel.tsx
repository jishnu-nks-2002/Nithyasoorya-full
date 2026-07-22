"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import type { CSSProperties, JSX } from "react";

/* ─── TYPES ──────────────────────────────────────────────────── */
interface Product {
  id: number;
  title: string;
  category: string;
  description: string;
  image: string;
  tag?: string;
}

/* ─── DATA ──────────────────────────────────────────────────── */
const BASE_PRODUCTS: Product[] = [
  {
    id: 1,
    title: "Essence Collection",
    category: "EXHIBITION",
    description: "Capturing the spirit of timeless artistic expression through vivid imagery.",
    image: "https://images.unsplash.com/photo-1544967082-d9d25d867d66?w=900&q=85",
    tag: "Bestseller",
  },
  {
    id: 2,
    title: "Heritage Series",
    category: "COLLECTION",
    description: "A journey through cultural and artistic heritage across generations.",
    image: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=900&q=85",
    tag: "New",
  },
  {
    id: 3,
    title: "Creative Workshop",
    category: "WORKSHOP",
    description: "Interactive sessions to unleash your fullest artistic potential.",
    image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=900&q=85",
    tag: "Limited",
  },
  {
    id: 4,
    title: "Modern Perspectives",
    category: "EXHIBITION",
    description: "Contemporary art reimagined for today's discerning audience.",
    image: "https://images.unsplash.com/photo-1551913902-c92207136625?w=900&q=85",
    tag: "Featured",
  },
  {
    id: 5,
    title: "Artisan Crafted",
    category: "COLLECTION",
    description: "Hand-picked artisanal pieces from skilled creators worldwide.",
    image: "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?w=900&q=85",
  },
];

/* ─── HELPERS ────────────────────────────────────────────────── */
const PRODUCTS = [...BASE_PRODUCTS, ...BASE_PRODUCTS, ...BASE_PRODUCTS];
const TOTAL = PRODUCTS.length;
const BASE_LEN = BASE_PRODUCTS.length;

const CARD_W = 360;
const CARD_GAP = 28;
const CARD_STEP = CARD_W + CARD_GAP;
const AUTO_INTERVAL = 2800;

/* ─── EXPLORE BUTTON (left-to-right fill on hover) ───────────── */
function ExploreButton({ label = "EXPLORE THE COLLECTION", accent = "#7B4BA0" }: { label?: string; accent?: string }): JSX.Element {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        border: `1.5px solid ${accent}`,
        borderRadius: 2,
        overflow: "hidden",
        cursor: "pointer",
        position: "relative",
        padding: "13px 28px",
        minWidth: 220,
      }}
    >
      {/* sliding fill — left to right */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: accent,
          transformOrigin: "left center",
          transform: hovered ? "scaleX(1)" : "scaleX(0)",
          transition: "transform 0.45s cubic-bezier(0.77,0,0.175,1)",
          zIndex: 0,
        }}
      />
      <span
        style={{
          position: "relative",
          zIndex: 1,
          fontFamily: "'Inter', sans-serif",
          fontWeight: 700,
          fontSize: 11,
          letterSpacing: "3px",
          textTransform: "uppercase",
          color: hovered ? "#fff" : accent,
          transition: "color 0.3s ease",
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
    </div>
  );
}

/* ─── ARROW BUTTON ───────────────────────────────────────────── */
function ArrowBtn({ dir, onClick }: { dir: "prev" | "next"; onClick: () => void }): JSX.Element {
  const [hovered, setHovered] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={dir === "prev" ? "Previous" : "Next"}
      style={{
        width: 48, height: 48,
        borderRadius: "50%",
        background: hovered ? "#7B4BA0" : "transparent",
        border: "1.5px solid #7B4BA0",
        color: hovered ? "#fff" : "#7B4BA0",
        display: "flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer",
        fontSize: 20,
        fontWeight: 300,
        transition: "all 0.3s ease",
        boxShadow: hovered ? "0 6px 20px rgba(123,75,160,0.35)" : "none",
        transform: hovered ? "scale(1.08)" : "scale(1)",
        lineHeight: 1,
      }}
    >
      {dir === "prev" ? "←" : "→"}
    </button>
  );
}

/* ─── SINGLE CARD ────────────────────────────────────────────── */
interface CardProps {
  product: Product;
  offsetFromActive: number;
  onClick: () => void;
}

function ProductCard({ product, offsetFromActive, onClick }: CardProps): JSX.Element {
  const isActive = offsetFromActive === 0;
  const absOff = Math.abs(offsetFromActive);
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [imgShift, setImgShift] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isActive || !cardRef.current) return;
    const r = cardRef.current.getBoundingClientRect();
    const nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
    const ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
    setTilt({ x: nx, y: ny });
    setImgShift({ x: nx * 8, y: ny * 5 });
  };

  const handleLeave = () => {
    setHovered(false);
    setTilt({ x: 0, y: 0 });
    setImgShift({ x: 0, y: 0 });
  };

  const scale = isActive ? (hovered ? 1.02 : 1) : absOff === 1 ? 0.88 : 0.76;
  const opacity = isActive ? 1 : absOff === 1 ? 0.7 : 0.4;
  const rotateY = isActive && hovered ? tilt.x * 7 : offsetFromActive * -3;
  const rotateX = isActive && hovered ? -tilt.y * 4 : 0;

  return (
    <div
      ref={cardRef}
      onClick={onClick}
      onMouseMove={handleMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={handleLeave}
      style={{
        flexShrink: 0,
        width: CARD_W,
        transform: `scale(${scale}) rotateY(${rotateY}deg) rotateX(${rotateX}deg)`,
        opacity,
        transition: hovered && isActive
          ? "transform 0.12s ease, opacity 0.5s ease"
          : "transform 0.55s cubic-bezier(0.34,1.2,0.64,1), opacity 0.5s ease",
        transformStyle: "preserve-3d",
        cursor: isActive ? "default" : "pointer",
      }}
    >
      {/* Clean box — no shadow, no border-radius, no border */}
      <div style={{
        overflow: "hidden",
        background: "#fff",
      }}>

        {/* Image */}
        <div style={{ position: "relative", height: 290, overflow: "hidden" }}>
          <img
            src={product.image}
            alt={product.title}
            style={{
              width: "100%", height: "100%", objectFit: "cover", display: "block",
              transform: isActive && hovered
                ? `scale(1.1) translate(${imgShift.x}px, ${imgShift.y}px)`
                : "scale(1.02)",
              transition: isActive && hovered ? "transform 0.12s ease" : "transform 0.7s ease",
            }}
          />
          {/* Gradient */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, rgba(0,0,0,0.05) 0%, rgba(26,15,46,0.65) 100%)",
            opacity: isActive ? (hovered ? 1 : 0.75) : 0.55,
            transition: "opacity 0.4s ease",
          }} />
          {/* Category */}
          <span style={{
            position: "absolute", bottom: 14, left: 18,
            fontFamily: "'Inter', sans-serif",
            fontSize: 10, fontWeight: 700,
            letterSpacing: "3px", textTransform: "uppercase",
            color: "rgba(255,255,255,0.8)",
          }}>
            {product.category}
          </span>
          {/* Tag */}
          {product.tag && (
            <span style={{
              position: "absolute", top: 14, right: 14,
              background: "#7B4BA0", color: "#fff",
              fontFamily: "'Inter', sans-serif",
              fontSize: 10, fontWeight: 700,
              letterSpacing: "1.5px", textTransform: "uppercase",
              padding: "5px 12px", borderRadius: 20,
              transform: isActive && hovered ? "translateY(-3px)" : "translateY(0)",
              transition: "transform 0.3s ease",
            }}>
              {product.tag}
            </span>
          )}
        </div>

        {/* Body */}
        <div style={{ padding: "26px 28px 30px" }}>
          <h3 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 19, fontWeight: 700,
            color: "#1a1a1a", marginBottom: 10, lineHeight: 1.3,
          }}>
            {product.title}
          </h3>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 13.5, color: "#888",
            lineHeight: 1.65, marginBottom: 22,
          }}>
            {product.description}
          </p>

          {/* Buttons row */}
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <ExploreButton label="CONTACT US" accent="#7B4BA0" />
            <a
              href="#"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 7,
                fontFamily: "'Inter', sans-serif",
                fontSize: 12,
                fontWeight: 600,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                color: "#7B4BA0",
                textDecoration: "none",
                opacity: 0.8,
                transition: "opacity 0.2s ease, gap 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "1";
                e.currentTarget.style.gap = "12px";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "0.8";
                e.currentTarget.style.gap = "7px";
              }}
            >
              More <span style={{ fontSize: 16, lineHeight: 1 }}>→</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── MAIN EXPORT ────────────────────────────────────────────── */
export default function ProductCarousel(): JSX.Element {
  const [centerIdx, setCenterIdx] = useState(BASE_LEN + 2);
  const [isAnimating, setIsAnimating] = useState(false);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPaused = useRef(false);

  const advance = useCallback((dir: 1 | -1) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCenterIdx((prev) => prev + dir);
    setTimeout(() => {
      setIsAnimating(false);
      setCenterIdx((prev) => {
        if (prev >= BASE_LEN * 2) return prev - BASE_LEN;
        if (prev < BASE_LEN) return prev + BASE_LEN;
        return prev;
      });
    }, 620);
  }, [isAnimating]);

  useEffect(() => {
    autoRef.current = setInterval(() => {
      if (!isPaused.current) advance(1);
    }, AUTO_INTERVAL);
    return () => { if (autoRef.current !== null) clearInterval(autoRef.current); };
  }, [advance]);

  const pauseAuto = () => { isPaused.current = true; };
  const resumeAuto = () => { isPaused.current = false; };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") { pauseAuto(); advance(-1); setTimeout(resumeAuto, 3000); }
      if (e.key === "ArrowRight") { pauseAuto(); advance(1); setTimeout(resumeAuto, 3000); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [advance]);

  const dragStart = useRef(0);
  const onDragStart = (e: React.MouseEvent | React.TouchEvent) => {
    pauseAuto();
    dragStart.current = "touches" in e ? e.touches[0].clientX : e.clientX;
  };
  const onDragEnd = (e: React.MouseEvent | React.TouchEvent) => {
    const end = "changedTouches" in e ? e.changedTouches[0].clientX : e.clientX;
    const delta = dragStart.current - end;
    if (Math.abs(delta) > 48) delta > 0 ? advance(1) : advance(-1);
    setTimeout(resumeAuto, 3000);
  };

  const visible = [-2, -1, 0, 1, 2].map((offset) => {
    const idx = ((centerIdx + offset) % TOTAL + TOTAL) % TOTAL;
    return { product: PRODUCTS[idx], offset };
  });

  const active = PRODUCTS[((centerIdx) % TOTAL + TOTAL) % TOTAL];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f5f3f8; overflow-x: hidden; }
        @keyframes fadeUp {
          from { opacity:0; transform:translateY(28px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes orbFloat {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(40px,-55px) scale(1.08); }
          66%      { transform: translate(-30px,30px) scale(0.94); }
        }
        @keyframes ticker {
          0%   { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .pc-section { cursor: default !important; }
        .pc-section * { cursor: default !important; }
        .pc-section a, .pc-section button { cursor: pointer !important; }
      `}</style>
      <section
        className="pc-section"
        onMouseEnter={pauseAuto}
        onMouseLeave={resumeAuto}
        style={{
          width: "100vw", minHeight: "100vh",
          background: "linear-gradient(135deg,#f5f3f8 0%,#ffffff 100%)",
          padding: "110px 0 90px",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          position: "relative", overflow: "hidden",
        }}
      >
        {/* Background orbs */}
        {[
          { w:620, h:620, top:-220, right:-220, op:0.07, dur:16 },
          { w:420, h:420, bottom:-130, left:-130, op:0.05, dur:22 },
          { w:280, h:280, top:"45%", left:"25%", op:0.035, dur:18 },
        ].map((o, i) => (
          <div key={i} style={{
            position:"absolute",
            width:o.w, height:o.h, borderRadius:"50%",
            background:"radial-gradient(circle,rgba(123,75,160,1) 0%,transparent 70%)",
            opacity:o.op,
            top:(o as any).top??"auto", bottom:(o as any).bottom??"auto",
            left:(o as any).left??"auto", right:(o as any).right??"auto",
            pointerEvents:"none",
            animation:`orbFloat ${o.dur}s ease-in-out infinite`,
            animationDelay:`${i * -5}s`,
          }} />
        ))}

        {/* Header */}
        <div style={{
          textAlign:"center", marginBottom:64,
          position:"relative", zIndex:2,
          animation:"fadeUp 0.8s ease both",
        }}>
          <div style={{
            display:"flex", alignItems:"center", justifyContent:"center",
            gap:12, marginBottom:22,
          }}>
            <div style={{ width:36, height:1.5, background:"#7B4BA0" }} />
            <span style={{
              fontFamily:"'Inter',sans-serif",
              fontSize:12, fontWeight:700, letterSpacing:"5px",
              textTransform:"uppercase", color:"#7B4BA0", opacity:0.9,
            }}>Featured Collection</span>
            <div style={{ width:36, height:1.5, background:"#7B4BA0" }} />
          </div>
          <h2 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize:"clamp(44px,5.5vw,76px)",
            fontWeight:700, color:"#1a1a1a",
            letterSpacing:"-1px", lineHeight:1.15, marginBottom:16,
          }}>Our Products</h2>
          <p style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize:"clamp(14px,1.7vw,18px)",
            color:"#888", lineHeight:1.65, maxWidth:480, margin:"0 auto",
          }}>
            Curated selection of finest artistic products and exhibitions
          </p>
        </div>

        {/* Active meta strip */}
        <div style={{
          display:"flex", alignItems:"center", gap:24,
          marginBottom:44, position:"relative", zIndex:3,
          animation:"fadeUp 0.9s ease both", animationDelay:"0.1s",
          padding:"12px 28px",
          background:"rgba(255,255,255,0.7)",
          backdropFilter:"blur(12px)",
          border:"1px solid rgba(123,75,160,0.12)",
          borderRadius:50,
          boxShadow:"0 4px 20px rgba(123,75,160,0.08)",
          transition:"all 0.4s ease",
        }}>
          <span style={{
            fontFamily:"'Inter',sans-serif", fontSize:10, fontWeight:700,
            letterSpacing:"3px", textTransform:"uppercase",
            color:"#7B4BA0", opacity:0.85,
          }}>
            {active.category}
          </span>
          <div style={{ width:1, height:14, background:"rgba(123,75,160,0.2)" }} />
          <span style={{
            fontFamily:"'Poppins',sans-serif", fontSize:16,
            fontWeight:600, color:"#1a1a1a",
          }}>
            {active.title}
          </span>
        </div>

        {/* Carousel stage */}
        <div
          onMouseDown={onDragStart}
          onMouseUp={onDragEnd}
          onTouchStart={onDragStart}
          onTouchEnd={onDragEnd}
          style={{
            width:"100%", maxWidth:1340,
            height:520, position:"relative", zIndex:2,
            perspective:"1400px",
            userSelect:"none",
            display:"flex", alignItems:"center", justifyContent:"center",
            gap:CARD_GAP,
          }}
        >
          {visible.map(({ product, offset }) => (
            <ProductCard
              key={`${product.id}-${offset}`}
              product={product}
              offsetFromActive={offset}
              onClick={() => {
                if (offset !== 0) {
                  pauseAuto();
                  advance(offset > 0 ? 1 : -1);
                  setTimeout(resumeAuto, 3000);
                }
              }}
            />
          ))}
        </div>

        {/* Controls */}
        <div style={{
          display:"flex", alignItems:"center", gap:28,
          marginTop:50, position:"relative", zIndex:3,
        }}>
          <ArrowBtn dir="prev" onClick={() => { pauseAuto(); advance(-1); setTimeout(resumeAuto, 3000); }} />
          <div style={{ display:"flex", gap:8, alignItems:"center" }}>
            {BASE_PRODUCTS.map((_, i) => {
              const isA = (((centerIdx % BASE_LEN) + BASE_LEN) % BASE_LEN) === i;
              return (
                <div key={i} style={{
                  width: isA ? 28 : 8,
                  height: 8,
                  borderRadius: 4,
                  background: isA ? "#7B4BA0" : "rgba(123,75,160,0.25)",
                  transition:"all 0.45s cubic-bezier(0.34,1.56,0.64,1)",
                }} />
              );
            })}
          </div>
          <ArrowBtn dir="next" onClick={() => { pauseAuto(); advance(1); setTimeout(resumeAuto, 3000); }} />
        </div>

        {/* Counter */}
        <div style={{
          marginTop:22,
          fontFamily:"'Inter',sans-serif",
          fontSize:11, letterSpacing:"2.5px", color:"#bbb",
          position:"relative", zIndex:2,
        }}>
          <span style={{ color:"#7B4BA0", fontWeight:700 }}>
            {String((((centerIdx % BASE_LEN) + BASE_LEN) % BASE_LEN) + 1).padStart(2,"0")}
          </span>
          {" / "}
          {String(BASE_LEN).padStart(2,"0")}
        </div>

        {/* Marquee ticker */}
        <div style={{
          position:"absolute", bottom:0, left:0, right:0,
          height:44,
          background:"#7B4BA0",
          overflow:"hidden",
          display:"flex", alignItems:"center",
          zIndex:4,
        }}>
          <div style={{
            display:"flex", whiteSpace:"nowrap",
            animation:"ticker 22s linear infinite",
          }}>
            {[...Array(2)].map((_, ri) => (
              <span key={ri} style={{ display:"inline-flex", alignItems:"center" }}>
                {BASE_PRODUCTS.map((p, pi) => (
                  <span key={pi} style={{
                    fontFamily:"'Inter',sans-serif",
                    fontSize:11, fontWeight:700,
                    letterSpacing:"4px", textTransform:"uppercase",
                    color:"rgba(255,255,255,0.85)",
                    marginRight:40,
                  }}>
                    {p.category} — {p.title} ✦
                  </span>
                ))}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}