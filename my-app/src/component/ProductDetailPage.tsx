'use client';

import { useState, useEffect } from 'react';
import { Cormorant_Garamond, Jost } from 'next/font/google';

const cormorant = Cormorant_Garamond({ weight: ['300','400','500','600'], subsets: ['latin'], display: 'swap' });
const jost      = Jost({ weight: ['300','400','500','600'], subsets: ['latin'], display: 'swap' });

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ACCENT   = '#7c5cbf';

// ── Types ────────────────────────────────────────────────────────────────────
interface ProductImage {
  _id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

interface Product {
  _id: string;
  name: string;
  slug: string;
  category: string;
  series: string;
  material: string;
  description: string;
  price: number;
  priceDisplay: string;
  availability: 'Available' | 'Inquire' | 'Sold Out';
  edition: string;
  isNew: boolean;
  isFeatured: boolean;
  dimensions: string;
  weight: string;
  stoneTypes: string[];
  beadSize: string;
  wristSize: string;
  tags: string[];
  careInstructions: string;
  shippingInfo: string;
  images: ProductImage[];
}

// ── Props ─────────────────────────────────────────────────────────────────────
interface Props { slug: string; }

// ── Availability badge config ─────────────────────────────────────────────────
const AVAIL: Record<string, { bg: string; color: string; label: string }> = {
  Available: { bg: '#e6f4ec', color: '#2e7d52', label: 'Available' },
  Inquire:   { bg: '#fef3e2', color: '#b45309', label: 'Inquire to Purchase' },
  'Sold Out':{ bg: '#fde8e8', color: '#b91c1c', label: 'Sold Out' },
};

// ── Spec row helper ───────────────────────────────────────────────────────────
function SpecRow({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div style={{ display: 'flex', gap: 16, padding: '10px 0', borderBottom: '1px solid rgba(107,63,160,0.07)' }}>
      <span className={jost.className} style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#b0a0cc', width: 120, flexShrink: 0 }}>
        {label}
      </span>
      <span className={jost.className} style={{ fontSize: 13, fontWeight: 300, color: '#3d2e5a', lineHeight: 1.5 }}>
        {value}
      </span>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function DynamicProductDetailPage({ slug }: Props) {
  const [product,    setProduct]    = useState<Product | null>(null);
  const [loading,    setLoading]    = useState(true);
  const [notFound,   setNotFound]   = useState(false);
  const [activeImg,  setActiveImg]  = useState(0);
  const [imgZoomed,  setImgZoomed]  = useState(false);
  const [activeTab,  setActiveTab]  = useState<'description'|'details'|'care'|'shipping'>('description');

  // ── Fetch product by slug (GET /api/products/slug/:slug) ──────────────────
  useEffect(() => {
    if (!slug) return;
    (async () => {
      setLoading(true);
      try {
        const res  = await fetch(`${API_BASE}/api/products/slug/${encodeURIComponent(slug)}`);
        const data = await res.json();
        if (data.success && data.data) {
          setProduct(data.data);
          // Put primary image first
          const imgs: ProductImage[] = data.data.images || [];
          const primaryIdx = imgs.findIndex((i: ProductImage) => i.isPrimary);
          if (primaryIdx > 0) setActiveImg(primaryIdx);
        } else {
          setNotFound(true);
        }
      } catch { setNotFound(true); }
      finally  { setLoading(false); }
    })();
  }, [slug]);

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div style={{ minHeight: '100vh', background: '#faf8f5', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 90 }}>
      <p className={cormorant.className} style={{ fontSize: 24, fontStyle: 'italic', color: '#9b82c4' }}>Loading…</p>
    </div>
  );

  // ── Not found ─────────────────────────────────────────────────────────────
  if (notFound || !product) return (
    <div style={{ minHeight: '100vh', background: '#faf8f5', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', paddingTop: 90, gap: 16 }}>
      <p className={cormorant.className} style={{ fontSize: 28, fontStyle: 'italic', color: '#9b82c4' }}>This piece could not be found.</p>
      <a href="/collections" className={jost.className} style={{ fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase', color: ACCENT, textDecoration: 'none' }}>
        ← Return to Collections
      </a>
    </div>
  );

  const images  = product.images?.length ? product.images : [];
  const avail   = AVAIL[product.availability] || AVAIL['Available'];
  const tabs    = [
    { key: 'description', label: 'Description',  show: !!product.description },
    { key: 'details',     label: 'Details',       show: !!(product.dimensions || product.weight || product.material || product.stoneTypes?.length || product.beadSize || product.wristSize || product.edition) },
    { key: 'care',        label: 'Care',          show: !!product.careInstructions },
    { key: 'shipping',    label: 'Shipping',      show: !!product.shippingInfo },
  ].filter(t => t.show) as { key: typeof activeTab; label: string; show: boolean }[];

  return (
    <div style={{ minHeight: '100vh', background: '#faf8f5', paddingTop: 90 }}>

      {/* ── Breadcrumb ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '20px 24px 0' }}>
        <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {[
            { label: 'Home',        href: '/' },
            { label: 'Collections', href: '/collections' },
            { label: product.category.charAt(0).toUpperCase() + product.category.slice(1), href: `/collections/${encodeURIComponent(product.category)}` },
            { label: product.name,  href: '#' },
          ].map((crumb, i, arr) => (
            <span key={crumb.label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {i < arr.length - 1 ? (
                <a href={crumb.href} className={jost.className} style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#b0a0cc', textDecoration: 'none' }}>
                  {crumb.label}
                </a>
              ) : (
                <span className={jost.className} style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: ACCENT }}>
                  {crumb.label}
                </span>
              )}
              {i < arr.length - 1 && <span style={{ color: '#d0c4e8', fontSize: 9 }}>›</span>}
            </span>
          ))}
        </nav>
      </div>

      {/* ── Main layout ── */}
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '36px 24px 80px', display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 56, alignItems: 'start' }}>

        {/* ── LEFT: Image gallery ── */}
        <div>
          {/* Main image */}
          <div
            onClick={() => setImgZoomed(!imgZoomed)}
            style={{
              position: 'relative', borderRadius: 16, overflow: 'hidden',
              background: '#f5f3f8', aspectRatio: '1 / 1', cursor: 'zoom-in',
              border: '1px solid rgba(107,63,160,0.10)',
              boxShadow: '0 8px 40px rgba(107,63,160,0.10)',
            }}
          >
            {images.length > 0 ? (
              <img
                src={images[activeImg]?.url}
                alt={images[activeImg]?.alt || product.name}
                style={{
                  width: '100%', height: '100%', objectFit: 'cover',
                  transform: imgZoomed ? 'scale(1.5)' : 'scale(1)',
                  transition: 'transform 0.5s cubic-bezier(0.4,0,0.2,1)',
                  filter: 'saturate(0.9) brightness(0.92)',
                }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ fontSize: 48, opacity: 0.3 }}>🪨</span>
              </div>
            )}

            {/* Badges */}
            <div style={{ position: 'absolute', top: 14, left: 14, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {product.isNew && (
                <span className={jost.className} style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.22em', textTransform: 'uppercase', background: ACCENT, color: '#fff', padding: '3px 11px', borderRadius: 20 }}>
                  New
                </span>
              )}
              {product.isFeatured && (
                <span className={jost.className} style={{ fontSize: 8, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', background: 'rgba(255,255,255,0.88)', color: ACCENT, padding: '3px 11px', borderRadius: 20, border: `1px solid ${ACCENT}44` }}>
                  Featured
                </span>
              )}
            </div>

            {/* Sold out overlay */}
            {product.availability === 'Sold Out' && (
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,6,24,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className={jost.className} style={{ fontSize: 11, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#fff' }}>Sold Out</span>
              </div>
            )}

            {/* Zoom hint */}
            <div style={{ position: 'absolute', bottom: 12, right: 12, background: 'rgba(255,255,255,0.72)', borderRadius: 8, padding: '5px 10px', backdropFilter: 'blur(6px)' }}>
              <span className={jost.className} style={{ fontSize: 8, letterSpacing: '0.18em', color: '#7a6a96' }}>
                {imgZoomed ? 'Click to zoom out' : 'Click to zoom'}
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div style={{ display: 'flex', gap: 10, marginTop: 14, flexWrap: 'wrap' }}>
              {images.map((img, idx) => (
                <button
                  key={img._id || idx}
                  onClick={() => { setActiveImg(idx); setImgZoomed(false); }}
                  style={{
                    width: 72, height: 72, borderRadius: 10, overflow: 'hidden', cursor: 'pointer', padding: 0,
                    border: `2px solid ${activeImg === idx ? ACCENT : 'rgba(107,63,160,0.12)'}`,
                    boxShadow: activeImg === idx ? `0 0 0 2px ${ACCENT}44` : 'none',
                    transition: 'all 0.18s ease', background: '#f5f3f8', flexShrink: 0,
                  }}
                >
                  <img src={img.url} alt={img.alt || `Image ${idx + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'saturate(0.88)' }} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── RIGHT: Product info ── */}
        <div style={{ paddingTop: 4 }}>

          {/* Series + category */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            {product.series && (
              <span className={jost.className} style={{ fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase', color: ACCENT }}>
                {product.series}
              </span>
            )}
            {product.series && (
              <span style={{ width: 1, height: 12, background: 'rgba(124,92,191,0.3)', display: 'inline-block' }} />
            )}
            <span className={jost.className} style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b0a0cc' }}>
              {product.category}
            </span>
          </div>

          {/* Product name */}
          <h1 className={cormorant.className} style={{ fontSize: 'clamp(28px, 4vw, 44px)', fontWeight: 400, color: '#1a1030', margin: '0 0 6px', lineHeight: 1.15 }}>
            {product.name}
          </h1>

          {/* Edition */}
          {product.edition && (
            <p className={jost.className} style={{ fontSize: 10, fontWeight: 300, letterSpacing: '0.16em', color: '#9a8cb5', margin: '0 0 20px', fontStyle: 'italic' }}>
              {product.edition}
            </p>
          )}

          {/* Price */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, margin: '22px 0' }}>
            <span className={cormorant.className} style={{ fontSize: 32, fontWeight: 500, color: '#1a1030' }}>
              {product.priceDisplay || `₹${product.price.toLocaleString()}`}
            </span>
          </div>

          {/* Availability badge */}
          <div style={{ marginBottom: 28 }}>
            <span className={jost.className} style={{
              display: 'inline-block', fontSize: 9, fontWeight: 500, letterSpacing: '0.2em',
              textTransform: 'uppercase', padding: '5px 16px', borderRadius: 20,
              background: avail.bg, color: avail.color,
            }}>
              {avail.label}
            </span>
          </div>

          {/* Stone types */}
          {product.stoneTypes?.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <p className={jost.className} style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b0a0cc', marginBottom: 10 }}>
                Stones &amp; Crystals
              </p>
              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                {product.stoneTypes.map((s) => (
                  <span key={s} className={jost.className} style={{
                    fontSize: 9.5, fontWeight: 300, letterSpacing: '0.12em',
                    padding: '4px 13px', borderRadius: 20,
                    border: `1px solid ${ACCENT}33`, color: ACCENT,
                    background: `${ACCENT}0a`,
                  }}>
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {product.tags?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 28 }}>
              {product.tags.map((tag) => (
                <span key={tag} className={jost.className} style={{
                  fontSize: 8.5, fontWeight: 300, letterSpacing: '0.14em',
                  padding: '3px 11px', borderRadius: 20,
                  border: '1px solid rgba(107,63,160,0.14)', color: '#9a8cb5',
                }}>
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* CTA button */}
          <div style={{ marginBottom: 32 }}>
            {product.availability === 'Available' && (
              <button className={jost.className} style={{
                width: '100%', padding: '15px 28px', borderRadius: 10, cursor: 'pointer',
                background: ACCENT, color: '#fff', border: 'none',
                fontSize: 10, fontWeight: 500, letterSpacing: '0.24em', textTransform: 'uppercase',
                boxShadow: `0 6px 24px ${ACCENT}44`,
                transition: 'all 0.22s ease',
              }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#6344a8'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = ACCENT; }}
              >
                Inquire to Purchase
              </button>
            )}
            {product.availability === 'Inquire' && (
              <button className={jost.className} style={{
                width: '100%', padding: '15px 28px', borderRadius: 10, cursor: 'pointer',
                background: 'transparent', color: ACCENT,
                border: `1.5px solid ${ACCENT}`,
                fontSize: 10, fontWeight: 500, letterSpacing: '0.24em', textTransform: 'uppercase',
                transition: 'all 0.22s ease',
              }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = `${ACCENT}12`; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = 'transparent'; }}
              >
                Send an Inquiry
              </button>
            )}
            {product.availability === 'Sold Out' && (
              <button disabled className={jost.className} style={{
                width: '100%', padding: '15px 28px', borderRadius: 10, cursor: 'not-allowed',
                background: 'rgba(107,63,160,0.08)', color: '#b0a0cc', border: '1px solid rgba(107,63,160,0.15)',
                fontSize: 10, fontWeight: 400, letterSpacing: '0.24em', textTransform: 'uppercase',
              }}>
                Sold Out
              </button>
            )}
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(107,63,160,0.08)', margin: '0 0 28px' }} />

          {/* Tab bar */}
          {tabs.length > 0 && (
            <div>
              <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(107,63,160,0.10)', marginBottom: 22 }}>
                {tabs.map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={jost.className}
                    style={{
                      fontSize: 9, fontWeight: activeTab === tab.key ? 500 : 300,
                      letterSpacing: '0.2em', textTransform: 'uppercase',
                      padding: '10px 18px', border: 'none', background: 'none', cursor: 'pointer',
                      color: activeTab === tab.key ? ACCENT : '#b0a0cc',
                      borderBottom: `2px solid ${activeTab === tab.key ? ACCENT : 'transparent'}`,
                      marginBottom: -1, transition: 'all 0.18s ease',
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div style={{ minHeight: 80 }}>
                {activeTab === 'description' && product.description && (
                  <p className={cormorant.className} style={{ fontSize: 18, fontWeight: 300, color: '#3d2e5a', lineHeight: 1.85, margin: 0, whiteSpace: 'pre-wrap' }}>
                    {product.description}
                  </p>
                )}

                {activeTab === 'details' && (
                  <div>
                    <SpecRow label="Material"    value={product.material} />
                    <SpecRow label="Dimensions"  value={product.dimensions} />
                    <SpecRow label="Weight"      value={product.weight} />
                    <SpecRow label="Bead Size"   value={product.beadSize} />
                    <SpecRow label="Wrist Size"  value={product.wristSize} />
                    <SpecRow label="Edition"     value={product.edition} />
                    {product.stoneTypes?.length > 0 && (
                      <SpecRow label="Stones" value={product.stoneTypes.join(', ')} />
                    )}
                  </div>
                )}

                {activeTab === 'care' && product.careInstructions && (
                  <p className={jost.className} style={{ fontSize: 13, fontWeight: 300, color: '#5a4878', lineHeight: 1.9, margin: 0, whiteSpace: 'pre-wrap' }}>
                    {product.careInstructions}
                  </p>
                )}

                {activeTab === 'shipping' && product.shippingInfo && (
                  <p className={jost.className} style={{ fontSize: 13, fontWeight: 300, color: '#5a4878', lineHeight: 1.9, margin: 0, whiteSpace: 'pre-wrap' }}>
                    {product.shippingInfo}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Responsive styles ── */}
      <style>{`
        @media (max-width: 768px) {
          .product-detail-grid {
            grid-template-columns: 1fr !important;
            gap: 32px !important;
          }
        }
      `}</style>
    </div>
  );
}