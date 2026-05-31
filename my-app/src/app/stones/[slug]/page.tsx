'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import './stone-detail.css';
import CustomCursor from '@/component/Customcursor';
import ElegantNavbar from '@/component/ElegantNavbar';
import FlowingMenu from '@/component/Flowingmenu';
import ReviewSection from '@/component/Reviewsection';
import Footer from '@/component/Footer';
import ProductBreadcrumb from '@/component/ProductBreadcrumb';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ── Types ─────────────────────────────────────────────────────────────────────
interface StoneProp   { label: string; value: string; }
interface HowToUse    { title: string; desc: string; }
interface GalleryItem { bg: string; label: string; imageUrl?: string; }
interface FAQ         { q: string; a: string; }
interface StoneImage  { _id: string; url: string; alt: string; isPrimary: boolean; }

interface StoneDetail {
  _id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: string;
  tagline: string;
  description: string;
  properties: StoneProp[];
  intentions: string[];
  howToUse: HowToUse[];
  gallery: GalleryItem[];
  images: StoneImage[];
  color: string;
  accentColor: string;
  weight: string;
  dimensions: string;
  origin: string;
  faqs: FAQ[];
}

// ── Loading skeleton ──────────────────────────────────────────────────────────
function PageSkeleton() {
  return (
    <div style={{ padding: '80px', maxWidth: 900, margin: '0 auto' }}>
      <style>{`@keyframes sk-pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>
      {[240, 120, 320, 80, 200].map((h, i) => (
        <div key={i} style={{
          height: h, background: '#e8e0f0', borderRadius: 8,
          marginBottom: 24, animation: `sk-pulse 1.4s ease ${i * 0.1}s infinite`,
        }} />
      ))}
    </div>
  );
}

// ── 404 / error state ─────────────────────────────────────────────────────────
function NotFound({ slug }: { slug: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '120px 40px' }}>
      <p style={{ fontFamily: 'var(--font-display)', fontSize: 28, color: '#7B4BA0', marginBottom: 12 }}>
        Stone not found
      </p>
      <p style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', color: '#9b82c4', marginBottom: 32 }}>
        We couldn't find a stone with the slug "{slug}".
      </p>
      <Link href="/stones" className="stones-btn">← Back to Collection</Link>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function StoneDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  // Next.js 15: params is a Promise
  const { slug } = use(params);

  const [stone,         setStone]         = useState<StoneDetail | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [notFound,      setNotFound]      = useState(false);
  const [activeGallery, setActiveGallery] = useState(0);
  const [openFaq,       setOpenFaq]       = useState<number | null>(null);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);

    (async () => {
      try {
        const res  = await fetch(`${API_BASE}/api/stones/${slug}`);
        const json = await res.json();
        if (!json.success || !json.data) { setNotFound(true); return; }
        setStone(json.data);
        setActiveGallery(0);
      } catch {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  // ── Hero section image: the primary image (or first as fallback) ────────────
  const heroImage = stone?.images?.find(i => i.isPrimary) ?? stone?.images?.[0];

  // ── Breadcrumb background: the SECOND image if it exists, else primary ───────
  // This keeps the breadcrumb visually distinct from the hero section below it.
  const breadcrumbImage = stone?.images?.[1] ?? stone?.images?.[0];

  // ── Origin from properties array (backend stores it in properties) ──────────
  const originProp = stone?.properties?.find(p =>
    p.label.toLowerCase() === 'origin'
  )?.value ?? stone?.origin ?? '—';

  return (
    <main className="detail-main">
      <style>{`@keyframes sk-pulse{0%,100%{opacity:1}50%{opacity:.4}}`}</style>

      <CustomCursor />
      <ElegantNavbar />
      <FlowingMenu />

      {/* ── BREADCRUMB HERO ─────────────────────────────────────────────────
          Uses the SECOND uploaded image as the background so it differs
          from the hero section directly below. Falls back to the first
          image, then to a solid-colour SVG if no images exist at all.
      ──────────────────────────────────────────────────────────────────── */}
      <ProductBreadcrumb
        items={[
          { label: 'Home',   href: '/' },
          { label: 'Stones', href: '/stones' },
        ]}
        productName={stone?.name ?? slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
        productSeries="Sacred Stones"
        productCategory={stone?.category ?? ''}
        backgroundImage={
          breadcrumbImage?.url ||
          `data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='1' height='1'><rect width='1' height='1' fill='${encodeURIComponent(stone?.color ?? '#7B4BA0')}'/></svg>`
        }
      />

      {/* ── LOADING ── */}
      {loading && <PageSkeleton />}

      {/* ── NOT FOUND ── */}
      {!loading && notFound && <NotFound slug={slug} />}

      {/* ── CONTENT ── */}
      {!loading && !notFound && stone && (
        <>
          {/* ── HERO ── */}
          <section className="detail-hero">
            <div className="detail-hero-visual">
              {heroImage ? (
                <img
                  src={heroImage.url}
                  alt={heroImage.alt || stone.name}
                  style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
              ) : (
                <div className="detail-hero-bg" style={{ background: stone.color }} />
              )}
              <div className="detail-hero-overlay" />
              <span className="detail-hero-category">{stone.category}</span>
              <div className="detail-hero-glow" style={{ background: stone.accentColor }} />
            </div>

            <div className="detail-hero-content">
              <p className="detail-subtitle">{stone.subtitle}</p>
              <h1 className="detail-name">{stone.name}</h1>
              <p className="detail-tagline">{stone.tagline}</p>

              {stone.intentions?.length > 0 && (
                <div className="detail-intentions">
                  {stone.intentions.map((intent) => (
                    <span key={intent} className="intent-tag">{intent}</span>
                  ))}
                </div>
              )}

              <div className="detail-meta-row">
                <div className="detail-meta-item">
                  <span className="meta-label">Weight</span>
                  <span className="meta-value">{stone.weight || '—'}</span>
                </div>
                <div className="detail-meta-divider" />
                <div className="detail-meta-item">
                  <span className="meta-label">Dimensions</span>
                  <span className="meta-value">{stone.dimensions || '—'}</span>
                </div>
                <div className="detail-meta-divider" />
                <div className="detail-meta-item">
                  <span className="meta-label">Origin</span>
                  <span className="meta-value">{originProp}</span>
                </div>
              </div>
            </div>
          </section>

          {/* ── DESCRIPTION ── */}
          {stone.description && (
            <section className="detail-description">
              <div className="desc-inner">
                <span className="section-eyebrow">THE STORY</span>
                <div className="desc-body">
                  {stone.description.split('\n\n').map((para, i) => (
                    <p key={i} className="desc-para">{para.trim()}</p>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── GALLERY ── */}
          {stone.gallery?.length > 0 && (
            <section className="detail-gallery">
              <div className="gallery-inner">
                <div className="gallery-header">
                  <span className="section-eyebrow">GALLERY</span>
                  <h2 className="section-heading">Forms &amp; Expressions</h2>
                  <p className="section-subtext">
                    Each form carries the same ancient energy expressed through a different shape and texture.
                  </p>
                </div>

                <div className="gallery-viewer">
                  {/* Main viewer — uses imageUrl if available, else CSS bg */}
                  <div
                    className="gallery-main-image"
                    style={{
                      background: stone.gallery[activeGallery]?.imageUrl
                        ? undefined
                        : stone.gallery[activeGallery]?.bg,
                    }}
                  >
                    {stone.gallery[activeGallery]?.imageUrl && (
                      <img
                        src={stone.gallery[activeGallery].imageUrl}
                        alt={stone.gallery[activeGallery].label}
                        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                      />
                    )}
                    <div className="gallery-main-overlay" />
                    <span className="gallery-main-label">{stone.gallery[activeGallery]?.label}</span>

                    {stone.gallery.length > 1 && (
                      <>
                        <button className="gallery-arrow gallery-arrow--prev" aria-label="Previous"
                          onClick={() => setActiveGallery((activeGallery - 1 + stone.gallery.length) % stone.gallery.length)}>
                          ‹
                        </button>
                        <button className="gallery-arrow gallery-arrow--next" aria-label="Next"
                          onClick={() => setActiveGallery((activeGallery + 1) % stone.gallery.length)}>
                          ›
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnail strip */}
                  <div className="gallery-thumbs">
                    {stone.gallery.map((item, i) => (
                      <button
                        key={i}
                        className={`gallery-thumb ${activeGallery === i ? 'gallery-thumb--active' : ''}`}
                        onClick={() => setActiveGallery(i)}
                        aria-label={item.label}
                      >
                        <div className="gallery-thumb-bg" style={{
                          background: item.imageUrl ? undefined : item.bg,
                          backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : undefined,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }} />
                        <span className="gallery-thumb-label">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          )}

          {/* ── PROPERTIES ── */}
          {stone.properties?.length > 0 && (
            <section className="detail-properties">
              <div className="props-inner">
                <span className="section-eyebrow">STONE PROPERTIES</span>
                <h2 className="section-heading">The Essentials</h2>
                <div className="props-grid">
                  {stone.properties.map((prop) => (
                    <div key={prop.label} className="prop-card">
                      <span className="prop-label">{prop.label}</span>
                      <span className="prop-value">{prop.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── HOW TO USE ── */}
          {stone.howToUse?.length > 0 && (
            <section className="detail-how-to-use">
              <div className="htu-inner">
                <div className="htu-header">
                  <span className="section-eyebrow">RITUAL &amp; PRACTICE</span>
                  <h2 className="section-heading">How to Work with This Stone</h2>
                  <p className="section-subtext">
                    Intentional practice amplifies the stone's energy tenfold. Here are {stone.howToUse.length} ways to begin your relationship.
                  </p>
                </div>
                <div className="htu-grid">
                  {stone.howToUse.map((item, i) => (
                    <div key={i} className="htu-card">
                      <span className="htu-number">0{i + 1}</span>
                      <h3 className="htu-title">{item.title}</h3>
                      <p className="htu-desc">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* ── FAQ ── */}
          {stone.faqs?.length > 0 && (
            <section className="detail-faq">
              <div className="faq-inner">
                <div className="faq-header">
                  <span className="section-eyebrow">QUESTIONS &amp; ANSWERS</span>
                  <h2 className="section-heading">About {stone.name}</h2>
                </div>
                <div className="faq-list">
                  {stone.faqs.map((faq, i) => (
                    <div key={i} className={`faq-item ${openFaq === i ? 'faq-item--open' : ''}`}>
                      <button className="faq-question"
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                        <span>{faq.q}</span>
                        <span className="faq-icon">{openFaq === i ? '−' : '+'}</span>
                      </button>
                      <div className="faq-answer-wrapper">
                        <p className="faq-answer">{faq.a}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          )}
        </>
      )}

      <ReviewSection />
      <Footer />
    </main>
  );
}