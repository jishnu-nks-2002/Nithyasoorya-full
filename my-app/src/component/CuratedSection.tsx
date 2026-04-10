'use client';

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Jost, Cormorant_Garamond } from "next/font/google";

const jost = Jost({ weight: ["300", "400", "500"], subsets: ["latin"], display: "swap" });
const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const products = [
  { id: 1, name: "Celestial Lotus Garden",  material: "Golden Resin & Amethyst",       price: "$1,250", badge: null,         image: "/images/p-1.jpeg" },
  { id: 2, name: "Amethyst Wisdom Tree",    material: "Raw Crystal & Copper Wire",      price: "$890",   badge: null,         image: "/images/p-2.jpeg" },
  { id: 3, name: "Eternal Koi Reflection",  material: "Hand-painted Resin & Slate",    price: "$1,580", badge: "New Arrival", image: "/images/p-3.jpeg" },
  { id: 4, name: "Moonstone River",         material: "Moonstone & Silver Leaf",       price: "$2,100", badge: null,         image: "/images/p-4.jpeg" },
  { id: 5, name: "Sacred Geometry Shrine",  material: "Obsidian & Gold Plating",       price: "$3,400", badge: "Limited",    image: "/images/p-5.jpeg" },
  { id: 6, name: "Terracotta Spirit Bloom", material: "Fired Clay & Copper Oxide",     price: "$740",   badge: null,         image: "/images/p-6.jpeg" },
];

interface Product {
  id: number;
  name: string;
  material: string;
  price: string;
  badge: string | null;
  image: string;
}

const VISIBLE  = 3;
const INTERVAL = 3000;
const GAP      = 16;

export default function CuratedSection() {
  const [offset, setOffset]             = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [paused, setPaused]             = useState(false);
  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackRef    = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);

  const dragStartX = useRef<number | null>(null);
  const dragDelta  = useRef(0);
  const isDragging = useRef(false);

  const cloned = [...products, ...products.slice(0, VISIBLE)];

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIsTransitioning(true);
      setOffset(prev => prev + 1);
    }, INTERVAL);
  };

  useEffect(() => {
    if (!paused) startTimer();
    else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused]);

  useEffect(() => {
    if (offset >= products.length) {
      const t = setTimeout(() => { setIsTransitioning(false); setOffset(0); }, 600);
      return () => clearTimeout(t);
    }
  }, [offset]);

  const goTo = (i: number) => { setIsTransitioning(true); setOffset(i); startTimer(); };

  const onDragStart = (clientX: number) => {
    isDragging.current = true;
    dragStartX.current = clientX;
    dragDelta.current  = 0;
    setPaused(true);
  };
  const onDragMove = (clientX: number) => {
    if (!isDragging.current) return;
    dragDelta.current = clientX - (dragStartX.current ?? clientX);
  };
  const onDragEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    if (dragDelta.current < -60) { setIsTransitioning(true); setOffset(prev => Math.min(prev + 1, cloned.length - VISIBLE)); }
    else if (dragDelta.current > 60) { setIsTransitioning(true); setOffset(prev => Math.max(prev - 1, 0)); }
    dragDelta.current = 0;
    setPaused(false);
  };

  const cardWidth = `calc((100vw - 72px - ${(VISIBLE - 1) * GAP}px) / ${VISIBLE})`;
  const translateX = `calc(-${offset} * (calc((100vw - 72px - ${(VISIBLE - 1) * GAP}px) / ${VISIBLE}) + ${GAP}px))`;

  return (
    <>
      <style>{`
        .cs2-root {
          background: #f2efea; padding: 52px 36px 56px;
          color: #1a1a1a; overflow: hidden; user-select: none;
        }
        .cs2-hero { text-align: center; margin-bottom: 44px; }
        .cs2-eyebrow { font-size: 9px; letter-spacing: 0.36em; text-transform: uppercase; color: #6b3fa0; margin-bottom: 14px; font-weight: 400; }
        .cs2-title { font-size: clamp(42px,7vw,80px); font-weight: 400; line-height: 1.0; color: #1a1a1a; letter-spacing: -0.01em; margin-bottom: 18px; }
        .cs2-subtitle { font-size: clamp(13px,1.5vw,16px); font-weight: 300; color: #999; line-height: 1.75; max-width: 420px; margin: 0 auto; letter-spacing: 0.01em; }
        .cs2-divider { width: 100%; height: 1px; background: rgba(0,0,0,0.07); margin-bottom: 28px; }

        .cs2-viewport { overflow: hidden; width: 100%; cursor: grab; }
        .cs2-viewport:active { cursor: grabbing; }
        .cs2-track { display: flex; gap: ${GAP}px; will-change: transform; }

        .cs2-card { flex-shrink: 0; display: flex; flex-direction: column; }
        .cs2-card-img-wrap { position: relative; overflow: hidden; border-radius: 5px; aspect-ratio: 3/4; background: #1c1c1c; }
        .cs2-card-img-wrap img { transition: transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94), filter 0.5s ease; filter: brightness(0.94); }
        .cs2-card:hover .cs2-card-img-wrap img { transform: scale(1.05); filter: brightness(1.0); }

        .cs2-card-overlay {
          position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 52%);
          opacity: 0; transition: opacity 0.4s ease;
          display: flex; flex-direction: column;
          align-items: stretch; justify-content: flex-end;
          padding: 12px; gap: 7px; border-radius: 5px;
        }
        .cs2-card:hover .cs2-card-overlay { opacity: 1; }

        .cs2-btn-contact {
          width: 100%; padding: 8px 0;
          background: rgba(255,255,255,0.88); border: none; border-radius: 3px;
          font-size: 8px; font-weight: 500; letter-spacing: 0.22em; text-transform: uppercase;
          color: #1a1a1a; cursor: pointer; transition: background 0.2s, color 0.2s;
        }
        .cs2-btn-contact:hover { background: #fff; color: #6b3fa0; }

        .cs2-badge {
          position: absolute; top: 10px; left: 10px; z-index: 3;
          background: #6b3fa0; color: #fff; font-size: 7px; font-weight: 500;
          letter-spacing: 0.18em; text-transform: uppercase; padding: 4px 8px; border-radius: 2px;
        }

        .cs2-card-info { padding: 10px 2px 0; }
        .cs2-card-name { font-size: 13.5px; font-weight: 600; letter-spacing: 0.03em; color: #1a1a1a; line-height: 1.3; margin-bottom: 2px; }
        .cs2-card-material { font-style: italic; font-size: 11px; font-weight: 300; color: #999; margin-bottom: 6px; }
        .cs2-card-price { font-size: 12px; font-weight: 400; color: #6b3fa0; letter-spacing: 0.04em; }

        .cs2-dots { display: flex; justify-content: center; gap: 7px; margin-top: 24px; }
        .cs2-dot {
          width: 5px; height: 5px; border-radius: 50%;
          border: none; padding: 0; cursor: pointer;
          background: rgba(107,63,160,0.2);
          transition: background 0.3s, transform 0.3s;
        }
        .cs2-dot.active { background: #6b3fa0; transform: scale(1.4); }

        @media (max-width: 640px) { .cs2-root { padding: 36px 16px 44px; } }
      `}</style>

      <section
        className={`cs2-root ${jost.className}`}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => { setPaused(false); onDragEnd(); }}
      >
        <div className="cs2-hero">
          <p className="cs2-eyebrow">Current Collection</p>
          <h2 className={`cs2-title ${cormorant.className}`}>Works on View</h2>
          <p className={`cs2-subtitle ${cormorant.className}`}>
            A curated selection of contemporary works across mediums,<br />
            exploring the boundaries of form, light, and material.
          </p>
        </div>

        <div className="cs2-divider" />

        <div
          className="cs2-viewport"
          ref={viewportRef}
          onMouseDown={e => onDragStart(e.clientX)}
          onMouseMove={e => onDragMove(e.clientX)}
          onMouseUp={onDragEnd}
          onMouseLeave={onDragEnd}
          onTouchStart={e => onDragStart(e.touches[0].clientX)}
          onTouchMove={e => onDragMove(e.touches[0].clientX)}
          onTouchEnd={onDragEnd}
        >
          <div
            className="cs2-track"
            ref={trackRef}
            style={{
              transform: `translateX(${translateX})`,
              transition: isTransitioning ? "transform 0.6s cubic-bezier(0.4,0,0.2,1)" : "none",
            }}
          >
            {cloned.map((p: Product, i: number) => (
              <div key={`${p.id}-${i}`} className="cs2-card" style={{ width: cardWidth }}>
                <div className="cs2-card-img-wrap">
                  {p.badge && <span className={`cs2-badge ${jost.className}`}>{p.badge}</span>}
                  <Image
                    src={p.image}
                    alt={p.name}
                    fill
                    sizes="33vw"
                    style={{ objectFit: "cover" }}
                    draggable={false}
                  />
                  <div className="cs2-card-overlay">
                    <button className={`cs2-btn-contact ${jost.className}`}>Contact</button>
                  </div>
                </div>
                <div className="cs2-card-info">
                  <div className={`cs2-card-name ${cormorant.className}`}>{p.name}</div>
                  <div className={`cs2-card-material ${cormorant.className}`}>{p.material}</div>
                  <div className={`cs2-card-price ${jost.className}`}>{p.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="cs2-dots">
          {products.map((_, i) => (
            <button
              key={i}
              className={`cs2-dot${offset % products.length === i ? " active" : ""}`}
              onClick={() => goTo(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </section>
    </>
  );
}