'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Jost } from 'next/font/google';

const cormorant = Cormorant_Garamond({
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  subsets: ['latin'],
  display: 'swap',
});
const jost = Jost({
  weight: ['300', '400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
});

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ACCENT   = '#7c5cbf';
const GAP      = 20;

// ── Sanitise image URLs (strips smart-quotes, prepends API_BASE for relative paths) ──
function cleanUrl(raw: string | undefined | null): string {
  if (!raw || typeof raw !== 'string') return '';
  const cleaned = raw
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u00A0]/g, ' ')
    .trim();
  if (!cleaned) return '';
  if (/^(https?:|data:)/.test(cleaned)) return cleaned;
  return `${API_BASE}/${cleaned.replace(/^\/+/, '')}`;
}

type CategoryField = string | { _id: string; name: string; slug?: string };

// category can be a plain string or a populated object
const getCategoryName = (c: CategoryField | undefined | null): string =>
  !c ? '' : typeof c === 'string' ? c : c.name;

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
  category: CategoryField;
  series?: string;
  priceDisplay?: string;
  price: number;
  description?: string;
  isNew?: boolean;
  isFeatured?: boolean;
  availability?: string;
  images: ProductImage[];
}

interface RelatedProductsProps {
  /** The slug of the currently viewed product — it will be excluded from the list */
  currentSlug?: string;
  /** Optional: filter by same category */
  currentCategory?: string;
}

// How many cards visible at once (desktop). Responsive logic reduces this.
const VISIBLE_DESKTOP = 4;
const VISIBLE_TABLET  = 2;
const VISIBLE_MOBILE  = 1;

export default function RelatedProducts({ currentSlug, currentCategory }: RelatedProductsProps) {
  const [products,  setProducts]  = useState<Product[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [offset,    setOffset]    = useState(0);
  const [animate,   setAnimate]   = useState(true);
  const [visible,   setVisible]   = useState(VISIBLE_DESKTOP);
  const [paused,    setPaused]    = useState(false);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const timerRef   = useRef<ReturnType<typeof setInterval> | null>(null);
  const dragStartX = useRef<number | null>(null);
  const dragDelta  = useRef(0);
  const dragging   = useRef(false);
  const wasDragged = useRef(false); // true when the last pointer gesture was a drag, not a click

  // ── Fetch products ────────────────────────────────────────────────────────
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/products`, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        let list: Product[] = Array.isArray(data)
          ? data
          : data.data ?? data.products ?? [];
        // exclude current product
        if (currentSlug) list = list.filter(p => p.slug !== currentSlug);
        // prioritise same-category products
        if (currentCategory) {
          const same  = list.filter(p => getCategoryName(p.category) === currentCategory);
          const other = list.filter(p => getCategoryName(p.category) !== currentCategory);
          list = [...same, ...other];
        }
        setProducts(list);
      } catch (err: any) {
        if (err.name !== 'AbortError') console.error('RelatedProducts fetch error:', err);
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [currentSlug, currentCategory]);

  // ── Responsive visible count ──────────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setVisible(w < 640 ? VISIBLE_MOBILE : w < 1024 ? VISIBLE_TABLET : VISIBLE_DESKTOP);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // ── Auto-scroll ───────────────────────────────────────────────────────────
  const maxOffset = Math.max(0, products.length - visible);

  // keep offset in range when the list or visible count changes
  useEffect(() => {
    setOffset(prev => Math.min(prev, maxOffset));
  }, [maxOffset]);

  const startTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setAnimate(true);
      setOffset(prev => (prev >= maxOffset ? 0 : prev + 1));
    }, 3200);
  };

  useEffect(() => {
    if (products.length <= visible) return;
    if (!paused) startTimer();
    else if (timerRef.current) clearInterval(timerRef.current);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, products.length, visible, maxOffset]);

  // ── Drag / swipe ──────────────────────────────────────────────────────────
  const onDragStart = (clientX: number) => {
    dragging.current   = true;
    dragStartX.current = clientX;
    dragDelta.current  = 0;
    wasDragged.current = false;
    setPaused(true);
  };
  const onDragMove = (clientX: number) => {
    if (!dragging.current) return;
    dragDelta.current = clientX - (dragStartX.current ?? clientX);
  };
  const onDragEnd = () => {
    if (!dragging.current) return;
    dragging.current = false;
    wasDragged.current = Math.abs(dragDelta.current) > 5;
    setAnimate(true);
    if (dragDelta.current < -60)       setOffset(prev => Math.min(prev + 1, maxOffset));
    else if (dragDelta.current > 60)   setOffset(prev => Math.max(prev - 1, 0));
    dragDelta.current = 0;
    setPaused(false);
  };

  // ── Helpers ───────────────────────────────────────────────────────────────
  const primaryImage = (p: Product) =>
    cleanUrl((p.images?.find(i => i.isPrimary) ?? p.images?.[0])?.url) || '/images/placeholder.jpeg';

  const availColor = (status?: string) => {
    if (status === 'Available')   return { bg: '#e8f5e9', text: '#2e7d32' };
    if (status === 'Sold Out')    return { bg: '#fce4e4', text: '#c62828' };
    return { bg: '#fff8e1', text: '#f57f17' };
  };

  if (!loading && products.length === 0) return null;

  return (
    <>
      <style>{`
        .rp-root {
          background: #f5f2ee;
          padding: 64px 0 72px;
          overflow: hidden;
          border-top: 1px solid rgba(107,63,160,0.08);
        }

        .rp-header {
          text-align: center;
          padding: 0 36px;
          margin-bottom: 48px;
        }

        .rp-eyebrow {
          font-size: 9px;
          letter-spacing: 0.36em;
          text-transform: uppercase;
          color: ${ACCENT};
          margin-bottom: 12px;
          font-weight: 400;
        }

        .rp-title {
          font-size: clamp(34px, 5vw, 56px);
          font-weight: 400;
          color: #1a1030;
          margin: 0 0 14px;
          line-height: 1.05;
          font-style: italic;
        }

        .rp-subtitle {
          font-size: 12px;
          font-weight: 300;
          color: #9a8cb5;
          letter-spacing: 0.04em;
          line-height: 1.7;
        }

        /* ── Ornament line ── */
        .rp-ornament {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 44px;
          padding: 0 36px;
        }
        .rp-ornament-line {
          flex: 1;
          max-width: 120px;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(124,92,191,0.25));
        }
        .rp-ornament-line.right {
          background: linear-gradient(to left, transparent, rgba(124,92,191,0.25));
        }
        .rp-ornament-diamond {
          width: 6px; height: 6px;
          background: ${ACCENT};
          transform: rotate(45deg);
          opacity: 0.5;
        }

        /* ── Viewport & track ── */
        .rp-viewport {
          overflow: hidden;
          padding: 0 36px;
          cursor: grab;
        }
        .rp-viewport:active { cursor: grabbing; }

        .rp-track {
          display: flex;
          gap: ${GAP}px;
          will-change: transform;
        }

        /* ── Card ── */
        .rp-card {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          cursor: pointer;
          text-decoration: none;
        }

        .rp-card-img-wrap {
          position: relative;
          border-radius: 12px;
          overflow: hidden;
          aspect-ratio: 3/4;
          background: #e8e3f0;
        }

        .rp-card-img-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94), filter 0.5s ease;
          filter: brightness(0.95);
        }
        .rp-card:hover .rp-card-img-wrap img {
          transform: scale(1.06);
          filter: brightness(1.0);
        }

        /* Overlay on hover */
        .rp-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(26,16,48,0.75) 0%, rgba(26,16,48,0.1) 50%, transparent 100%);
          opacity: 0;
          transition: opacity 0.4s ease;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          align-items: flex-start;
          padding: 18px;
          border-radius: 12px;
        }
        .rp-card:hover .rp-card-overlay { opacity: 1; }

        .rp-overlay-cta {
          font-size: 8px;
          letter-spacing: 0.24em;
          text-transform: uppercase;
          font-weight: 500;
          color: #fff;
          border: 1px solid rgba(255,255,255,0.5);
          border-radius: 50px;
          padding: 7px 18px;
          background: transparent;
          cursor: pointer;
          transition: background 0.2s, border-color 0.2s;
          text-decoration: none;
          display: inline-block;
        }
        .rp-overlay-cta:hover {
          background: rgba(255,255,255,0.15);
          border-color: rgba(255,255,255,0.9);
        }

        /* Badge */
        .rp-badge {
          position: absolute;
          top: 10px;
          left: 10px;
          z-index: 3;
          background: ${ACCENT};
          color: #fff;
          font-size: 7px;
          font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 20px;
        }

        /* Card info */
        .rp-card-info {
          padding: 12px 4px 0;
        }
        .rp-card-category {
          font-size: 8px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: ${ACCENT};
          margin-bottom: 4px;
          font-weight: 400;
          opacity: 0.8;
        }
        .rp-card-name {
          font-size: 15px;
          font-weight: 400;
          color: #1a1030;
          line-height: 1.25;
          margin-bottom: 4px;
        }
        .rp-card-price {
          font-size: 13px;
          font-weight: 500;
          color: #1a1030;
          letter-spacing: 0.02em;
        }
        .rp-card-avail {
          display: inline-block;
          font-size: 7px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          font-weight: 400;
          padding: 3px 8px;
          border-radius: 20px;
          margin-left: 8px;
          vertical-align: middle;
        }

        /* ── Navigation dots ── */
        .rp-nav {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-top: 36px;
          padding: 0 36px;
        }

        .rp-arrow {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          border: 1px solid rgba(124,92,191,0.25);
          background: transparent;
          color: ${ACCENT};
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }
        .rp-arrow:hover:not(:disabled) {
          background: ${ACCENT};
          color: #fff;
          border-color: ${ACCENT};
          transform: scale(1.08);
        }
        .rp-arrow:disabled {
          opacity: 0.25;
          cursor: default;
        }

        .rp-dots {
          display: flex;
          gap: 6px;
          align-items: center;
        }
        .rp-dot {
          width: 5px;
          height: 5px;
          border-radius: 50%;
          background: rgba(124,92,191,0.2);
          border: none;
          padding: 0;
          cursor: pointer;
          transition: background 0.3s, transform 0.3s, width 0.3s;
        }
        .rp-dot.active {
          background: ${ACCENT};
          width: 18px;
          border-radius: 3px;
          transform: none;
        }

        /* ── Skeleton loader ── */
        .rp-skeleton {
          display: flex;
          gap: ${GAP}px;
          padding: 0 36px;
        }
        .rp-skeleton-card {
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .rp-skel-img {
          border-radius: 12px;
          aspect-ratio: 3/4;
          background: linear-gradient(90deg, #e8e3f0 25%, #f0ecf8 50%, #e8e3f0 75%);
          background-size: 200% 100%;
          animation: rp-shimmer 1.4s infinite;
        }
        .rp-skel-line {
          border-radius: 4px;
          background: linear-gradient(90deg, #e8e3f0 25%, #f0ecf8 50%, #e8e3f0 75%);
          background-size: 200% 100%;
          animation: rp-shimmer 1.4s infinite;
          height: 10px;
        }
        @keyframes rp-shimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        @media (max-width: 1024px) {
          .rp-root    { padding: 48px 0 56px; }
          .rp-header  { padding: 0 24px; margin-bottom: 36px; }
          .rp-viewport { padding: 0 24px; }
          .rp-skeleton { padding: 0 24px; }
          .rp-nav     { padding: 0 24px; }
        }
        @media (max-width: 640px) {
          .rp-root    { padding: 40px 0 48px; }
          .rp-header  { padding: 0 20px; }
          .rp-viewport { padding: 0 20px; }
          .rp-skeleton { padding: 0 20px; }
          .rp-nav     { padding: 0 20px; }
        }
      `}</style>

      <section
        className={`rp-root ${jost.className}`}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => { setPaused(false); onDragEnd(); }}
      >
        {/* Header */}
        <div className="rp-header">
          <p className={`rp-eyebrow ${jost.className}`}>You May Also Love</p>
          <h2 className={`rp-title ${cormorant.className}`}>
            {currentCategory ? `More from ${currentCategory}` : 'Explore the Collection'}
          </h2>
          <p className={`rp-subtitle ${jost.className}`}>
            Each piece is handcrafted with intention — discover more works that speak to you.
          </p>
        </div>

        {/* Ornament */}
        <div className="rp-ornament">
          <div className="rp-ornament-line" />
          <div className="rp-ornament-diamond" />
          <div className="rp-ornament-line right" />
        </div>

        {/* Skeleton while loading */}
        {loading && (
          <div className="rp-skeleton">
            {Array.from({ length: VISIBLE_DESKTOP }).map((_, i) => (
              <div
                key={i}
                className="rp-skeleton-card"
                style={{ width: `calc((100% - ${(VISIBLE_DESKTOP - 1) * GAP}px) / ${VISIBLE_DESKTOP})` }}
              >
                <div className="rp-skel-img" />
                <div className="rp-skel-line" style={{ width: '55%' }} />
                <div className="rp-skel-line" style={{ width: '75%', height: 13 }} />
                <div className="rp-skel-line" style={{ width: '35%' }} />
              </div>
            ))}
          </div>
        )}

        {/* Cards */}
        {!loading && products.length > 0 && (() => {
          const cardWidth = `calc((100% - ${(visible - 1) * GAP}px) / ${visible})`;
          const translateX = `calc(-${offset} * (calc((100% - ${(visible - 1) * GAP}px) / ${visible}) + ${GAP}px))`;

          return (
            <>
              <div
                className="rp-viewport"
                onMouseDown={e => onDragStart(e.clientX)}
                onMouseMove={e => onDragMove(e.clientX)}
                onMouseUp={onDragEnd}
                onMouseLeave={onDragEnd}
                onTouchStart={e => onDragStart(e.touches[0].clientX)}
                onTouchMove={e => onDragMove(e.touches[0].clientX)}
                onTouchEnd={onDragEnd}
              >
                <div
                  className="rp-track"
                  style={{
                    transform: `translateX(${translateX})`,
                    transition: animate ? 'transform 0.6s cubic-bezier(0.4,0,0.2,1)' : 'none',
                  }}
                >
                  {products.map(p => {
                    const avail = availColor(p.availability);
                    const catName = getCategoryName(p.category);
                    return (
                      <Link
                        key={p._id}
                        href={`/product/${p.slug}`}
                        className="rp-card"
                        style={{ width: cardWidth }}
                        onMouseEnter={() => setHoveredId(p._id)}
                        onMouseLeave={() => setHoveredId(null)}
                        draggable={false}
                        onClick={(e) => {
                          // a drag/swipe must not trigger navigation
                          if (wasDragged.current) {
                            e.preventDefault();
                            wasDragged.current = false;
                          }
                        }}
                      >
                        <div className="rp-card-img-wrap">
                          {p.isNew && (
                            <span className={`rp-badge ${jost.className}`}>New</span>
                          )}
                          <img
                            src={primaryImage(p)}
                            alt={p.name}
                            draggable={false}
                          />
                          <div className="rp-card-overlay">
                            <span className={`rp-overlay-cta ${jost.className}`}>View Piece</span>
                          </div>
                        </div>

                        <div className="rp-card-info">
                          {catName && (
                            <p className={`rp-card-category ${jost.className}`}>{catName}</p>
                          )}
                          <p className={`rp-card-name ${cormorant.className}`}>{p.name}</p>
                          <p className={`rp-card-price ${jost.className}`}>
                            {p.priceDisplay || `₹${p.price}`}
                            {p.availability && (
                              <span
                                className={`rp-card-avail ${jost.className}`}
                                style={{ background: avail.bg, color: avail.text }}
                              >
                                {p.availability}
                              </span>
                            )}
                          </p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Navigation */}
              {products.length > visible && (
                <div className="rp-nav">
                  <button
                    className="rp-arrow"
                    disabled={offset === 0}
                    onClick={() => { setAnimate(true); setOffset(prev => Math.max(prev - 1, 0)); startTimer(); }}
                    aria-label="Previous"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>

                  <div className="rp-dots">
                    {Array.from({ length: maxOffset + 1 }).map((_, i) => (
                      <button
                        key={i}
                        className={`rp-dot${offset === i ? ' active' : ''}`}
                        onClick={() => { setAnimate(true); setOffset(i); startTimer(); }}
                        aria-label={`Go to ${i + 1}`}
                      />
                    ))}
                  </div>

                  <button
                    className="rp-arrow"
                    disabled={offset >= maxOffset}
                    onClick={() => { setAnimate(true); setOffset(prev => Math.min(prev + 1, maxOffset)); startTimer(); }}
                    aria-label="Next"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          );
        })()}
      </section>
    </>
  );
}