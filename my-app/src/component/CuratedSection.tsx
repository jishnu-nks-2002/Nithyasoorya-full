'use client';

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Jost, Cormorant_Garamond } from "next/font/google";

const jost = Jost({ weight: ["300", "400", "500"], subsets: ["latin"], display: "swap" });
const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ── Sanitise image URLs (strips smart-quotes, prepends API_BASE for relative paths) ──
function cleanUrl(raw: string | undefined | null): string {
  if (!raw || typeof raw !== "string") return "";
  const cleaned = raw
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u00A0]/g, " ")
    .trim();
  if (!cleaned) return "";
  if (/^(https?:|data:)/.test(cleaned)) return cleaned;
  return `${API_BASE}/${cleaned.replace(/^\/+/, "")}`;
}

interface ProductImage {
  url: string;
  alt: string;
  isPrimary: boolean;
  _id: string;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  category: string | { _id: string; name: string; slug?: string };
  series?: string;
  priceDisplay?: string;
  price: number;
  material?: string;
  isNew?: boolean;
  isFeatured?: boolean;
  availability?: string;
  images: ProductImage[];
}

const VISIBLE  = 3;
const INTERVAL = 3000;
const GAP      = 16;

export default function CuratedSection() {
  const [products, setProducts]               = useState<Product[]>([]);
  const [loading,  setLoading]                = useState(true);
  const [offset,   setOffset]                 = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(true);
  const [paused,   setPaused]                 = useState(false);

  const timerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackRef    = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragStartX  = useRef<number | null>(null);
  const dragDelta   = useRef(0);
  const isDragging  = useRef(false);
  const wasDragged  = useRef(false); // true when the last pointer gesture was a drag, not a click

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products`, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const list: Product[] = Array.isArray(data)
          ? data
          : data.data ?? data.products ?? [];
        setProducts(list);
      } catch (err: any) {
        if (err.name !== "AbortError") console.error("CuratedSection fetch error:", err);
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  // ── Image URL helper (sanitise + fallback) ────────────────────────────────
  const primaryImage = (p: Product): string => {
    const img = p.images?.find(i => i.isPrimary) ?? p.images?.[0];
    return cleanUrl(img?.url) || "/images/placeholder.jpeg";
  };

  const badge = (p: Product): string | null => {
    if (p.isNew)      return "New Arrival";
    if (p.isFeatured) return "Featured";
    return null;
  };

  // ── Carousel ──────────────────────────────────────────────────────────────
  const cloned = products.length > 0
    ? [...products, ...products.slice(0, VISIBLE)]
    : [];

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setIsTransitioning(true);
      setOffset(prev => prev + 1);
    }, INTERVAL);
  };

  useEffect(() => {
    if (products.length === 0) return;
    if (!paused) startTimer();
    else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, products.length]);

  useEffect(() => {
    if (products.length === 0) return;
    if (offset >= products.length) {
      const t = setTimeout(() => { setIsTransitioning(false); setOffset(0); }, 600);
      return () => clearTimeout(t);
    }
  }, [offset, products.length]);

  const goTo = (i: number) => { setIsTransitioning(true); setOffset(i); startTimer(); };

  const onDragStart = (clientX: number) => {
    isDragging.current = true;
    dragStartX.current = clientX;
    dragDelta.current  = 0;
    wasDragged.current = false;
    setPaused(true);
  };
  const onDragMove = (clientX: number) => {
    if (!isDragging.current) return;
    dragDelta.current = clientX - (dragStartX.current ?? clientX);
  };
  const onDragEnd = () => {
    if (!isDragging.current) return;
    isDragging.current = false;
    wasDragged.current = Math.abs(dragDelta.current) > 5;
    if (dragDelta.current < -60)     { setIsTransitioning(true); setOffset(prev => Math.min(prev + 1, cloned.length - VISIBLE)); }
    else if (dragDelta.current > 60) { setIsTransitioning(true); setOffset(prev => Math.max(prev - 1, 0)); }
    dragDelta.current = 0;
    setPaused(false);
  };

  const cardWidth  = `calc((100vw - 72px - ${(VISIBLE - 1) * GAP}px) / ${VISIBLE})`;
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

        .cs2-card { flex-shrink: 0; display: flex; flex-direction: column; text-decoration: none; }
        .cs2-card-img-wrap {
          position: relative; overflow: hidden; border-radius: 5px;
          aspect-ratio: 3/4; background: #1c1c1c;
        }
        /* ── use plain <img> to avoid next/image host restrictions ── */
        .cs2-card-img-wrap img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94), filter 0.5s ease;
          filter: brightness(0.94);
        }
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
          text-decoration: none; display: flex; align-items: center; justify-content: center;
        }
        .cs2-btn-contact:hover { background: #fff; color: #6b3fa0; }

        .cs2-badge {
          position: absolute; top: 10px; left: 10px; z-index: 3;
          background: #6b3fa0; color: #fff; font-size: 7px; font-weight: 500;
          letter-spacing: 0.18em; text-transform: uppercase; padding: 4px 8px; border-radius: 2px;
        }

        .cs2-card-info { padding: 10px 2px 0; }
        .cs2-card-category { font-size: 8px; letter-spacing: 0.18em; text-transform: uppercase; color: #6b3fa0; margin-bottom: 3px; font-weight: 400; opacity: 0.75; }
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

        /* Skeleton */
        .cs2-skeleton { display: flex; gap: ${GAP}px; }
        .cs2-skel-card { flex-shrink: 0; display: flex; flex-direction: column; gap: 8px; }
        .cs2-skel-img {
          border-radius: 5px; aspect-ratio: 3/4;
          background: linear-gradient(90deg,#e4dfda 25%,#edeae6 50%,#e4dfda 75%);
          background-size: 200% 100%; animation: cs2-shimmer 1.4s infinite;
        }
        .cs2-skel-line {
          border-radius: 3px; height: 10px;
          background: linear-gradient(90deg,#e4dfda 25%,#edeae6 50%,#e4dfda 75%);
          background-size: 200% 100%; animation: cs2-shimmer 1.4s infinite;
        }
        @keyframes cs2-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Image error placeholder */
        .cs2-img-placeholder {
          width: 100%; height: 100%;
          background: linear-gradient(135deg, #2a1f3d 0%, #1a1030 100%);
          display: flex; align-items: center; justify-content: center;
        }

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

        {/* ── Skeleton ── */}
        {loading && (
          <div className="cs2-skeleton">
            {Array.from({ length: VISIBLE }).map((_, i) => (
              <div key={i} className="cs2-skel-card" style={{ width: cardWidth }}>
                <div className="cs2-skel-img" />
                <div className="cs2-skel-line" style={{ width: "60%" }} />
                <div className="cs2-skel-line" style={{ width: "80%", height: 13 }} />
                <div className="cs2-skel-line" style={{ width: "40%" }} />
              </div>
            ))}
          </div>
        )}

        {/* ── Carousel ── */}
        {!loading && products.length > 0 && (
          <>
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
                {cloned.map((p: Product, i: number) => {
                  const b    = badge(p);
                  const imgSrc = primaryImage(p);
                  return (
                    <Link
                      key={`${p._id}-${i}`}
                      href={`/product/${p.slug}`}
                      className="cs2-card"
                      style={{ width: cardWidth }}
                      draggable={false}
                      onClick={(e) => {
                        // a drag/swipe must not trigger navigation
                        if (wasDragged.current) {
                          e.preventDefault();
                          wasDragged.current = false;
                        }
                      }}
                    >
                      <div className="cs2-card-img-wrap">
                        {b && <span className={`cs2-badge ${jost.className}`}>{b}</span>}

                        {/* Plain <img> — no Next.js host restrictions */}
                        <CardImage src={imgSrc} alt={p.name} />

                        <div className="cs2-card-overlay">
                          <span className={`cs2-btn-contact ${jost.className}`}>View Piece</span>
                        </div>
                      </div>

                      <div className="cs2-card-info">
                        {p.category && (
                          <div className={`cs2-card-category ${jost.className}`}>
                            {typeof p.category === "string" ? p.category : p.category.name}
                          </div>
                        )}
                        <div className={`cs2-card-name ${cormorant.className}`}>{p.name}</div>
                        {p.material && (
                          <div className={`cs2-card-material ${cormorant.className}`}>{p.material}</div>
                        )}
                        <div className={`cs2-card-price ${jost.className}`}>
                          {p.priceDisplay || `₹${p.price}`}
                        </div>
                      </div>
                    </Link>
                  );
                })}
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
          </>
        )}

        {/* ── Empty state ── */}
        {!loading && products.length === 0 && (
          <div style={{ textAlign: "center", padding: "40px 0", color: "#999" }}>
            <p className={cormorant.className} style={{ fontSize: 20, fontStyle: "italic" }}>
              No pieces available at this time.
            </p>
          </div>
        )}
      </section>
    </>
  );
}

// ── Plain img tag with graceful error fallback ────────────────────────────────
function CardImage({ src, alt }: { src: string; alt: string }) {
  const [errored, setErrored] = useState(false);

  if (errored || !src) {
    return (
      <div className="cs2-img-placeholder">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(192,132,252,0.2)" strokeWidth="1.2">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <polyline points="21 15 16 10 5 21"/>
        </svg>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      draggable={false}
      onError={() => setErrored(true)}
    />
  );
}