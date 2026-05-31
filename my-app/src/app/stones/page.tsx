'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import './stones.css';
import CustomCursor from '@/component/Customcursor';
import ElegantNavbar from '@/component/ElegantNavbar';
import FlowingMenu from '@/component/Flowingmenu';
import ReviewSection from '@/component/Reviewsection';
import Footer from '@/component/Footer';
import ProductBreadcrumb from '@/component/ProductBreadcrumb';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ── Types ─────────────────────────────────────────────────────────────────────
interface StoneImage { url: string; alt: string; isPrimary: boolean; }
interface Stone {
  _id: string;
  slug: string;
  name: string;
  subtitle: string;
  category: string;
  description: string;
  color: string;
  accentColor: string;
  images: StoneImage[];
  isActive: boolean;
  order: number;
}

// ── Static FAQs ───────────────────────────────────────────────────────────────
const FAQS = [
  { q: 'How do I choose the right stone for my space?', a: 'Begin with your intention. If you seek calm, reach for Selenite or Rose Quartz. For protection and grounding, Black Tourmaline or Obsidian. For spiritual clarity, Amethyst. Trust your intuition — you will often be drawn to the stone you need most.' },
  { q: 'Do the stones need to be cleansed before use?', a: 'Yes. All our stones are pre-cleansed with sound and moonlight before shipping. However, we recommend cleansing them upon arrival by placing them in moonlight overnight or using a Selenite plate to reset their energetic field.' },
  { q: 'Can I place multiple stones together in one space?', a: 'Absolutely. Stones work synergistically. A grounding trio of Black Tourmaline, Smoky Quartz, and Obsidian creates a powerful protective field. Our crystal consultants can help you curate a personalised arrangement.' },
  { q: 'Are these authentic, natural stones or synthetically made?', a: 'Every stone in our collection is 100% natural and ethically sourced from trusted mining partners in Brazil, India, Morocco, and Madagascar. Each piece comes with a certificate of authenticity.' },
  { q: 'How do the LED-illuminated fountain bases work with the stones?', a: 'Our fountain bases are designed with a recess that cradles the stone at water level. The LED lighting is tuned to warm amber and soft violet spectrums, which amplify the visual depth of the crystal and create a meditative atmosphere.' },
  { q: 'Do you offer custom curation or interior styling advice?', a: 'Yes. We offer a complimentary 30-minute crystal curation consultation for orders above a certain value. Our consultants blend Feng Shui principles with contemporary interior aesthetics to find the perfect placement for your space.' },
];

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <section className="faq-section">
      <div className="faq-inner">
        <div className="faq-header">
          <span className="faq-eyebrow">QUESTIONS &amp; ANSWERS</span>
          <h2 className="faq-heading">Frequently Asked</h2>
          <p className="faq-subtext">Everything you need to know before welcoming a sacred stone into your home.</p>
        </div>
        <div className="faq-list">
          {FAQS.map((faq, i) => (
            <div key={i} className={`faq-item ${openIndex === i ? 'faq-item--open' : ''}`}>
              <button className="faq-question"
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                aria-expanded={openIndex === i}>
                <span>{faq.q}</span>
                <span className="faq-icon">{openIndex === i ? '−' : '+'}</span>
              </button>
              <div className="faq-answer-wrapper">
                <p className="faq-answer">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Card skeleton while loading ───────────────────────────────────────────────
function StoneSkeleton() {
  return (
    <div className="stone-card" style={{ pointerEvents: 'none', cursor: 'default' }}>
      <div className="stone-card-image-wrapper"
        style={{ background: 'linear-gradient(135deg,#e8e0f0,#d4c8e8)', animation: 'sk-pulse 1.4s ease infinite' }} />
      <div className="stone-card-body">
        {[70, 120, 200, 50].map((w, i) => (
          <div key={i} style={{
            height: [10, 18, 36, 10][i], width: w,
            background: '#e8e0f0', borderRadius: 4,
            animation: `sk-pulse 1.4s ease ${i * 0.12}s infinite`,
          }} />
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function StonesPage() {
  const [stones,      setStones]      = useState<Stone[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [error,       setError]       = useState<string | null>(null);
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API_BASE}/api/stones?active=true&limit=50`);
        const json = await res.json();
        if (!json.success) throw new Error(json.message || 'Failed to load stones');
        setStones(json.data);
      } catch (e: any) {
        setError(e.message || 'Something went wrong');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="stones-main">
      <style>{`@keyframes sk-pulse{0%,100%{opacity:1}50%{opacity:.45}}`}</style>

      <CustomCursor />
      <ElegantNavbar />
      <FlowingMenu />

      {/* ── BREADCRUMB HERO ─────────────────────────────────────────────────── */}
      <ProductBreadcrumb
        items={[
          { label: 'Home',   href: '/' },
          { label: 'Stones', href: '/stones' },
        ]}
        productName="Sacred Stones"
        productSeries="Collections"
        productCategory="Sacred Stones"
        backgroundImage="/images/stones-hero.jpg"
      />

      {/* ── COLLECTION GRID ─────────────────────────────────────────────────── */}
      <section className="stones-collection" id="collection">
        <div className="collection-header">
          <span className="collection-eyebrow">OUR COLLECTION</span>
          <h2 className="collection-heading">Sacred Stones</h2>
          <p className="collection-subtext">
            Each stone is hand-selected for its energetic integrity and aesthetic resonance. Discover the one that speaks to your journey.
          </p>
        </div>

        {error ? (
          <div style={{ textAlign: 'center', padding: '80px 40px' }}>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: 22, color: '#7B4BA0', marginBottom: 8 }}>
              Could not load stones
            </p>
            <p style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', color: '#9b82c4' }}>{error}</p>
            <button onClick={() => window.location.reload()} className="stones-btn" style={{ marginTop: 24 }}>
              Try again
            </button>
          </div>
        ) : (
          <div className="stones-grid">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => <StoneSkeleton key={i} />)
              : stones.length === 0
                ? (
                  <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '80px 0', color: '#9b82c4' }}>
                    <p style={{ fontFamily: 'var(--font-display)', fontSize: 26 }}>No stones yet</p>
                    <p style={{ fontStyle: 'italic', marginTop: 10 }}>Check back soon.</p>
                  </div>
                )
                : stones.map((stone) => {
                    const primaryImg = stone.images?.find(i => i.isPrimary) ?? stone.images?.[0];
                    const shortDesc  = stone.description
                      ? stone.description.split('\n\n')[0].replace(/\s+/g, ' ').trim().slice(0, 140) + '…'
                      : '';
                    return (
                      <Link
                        key={stone.slug}
                        href={`/stones/${stone.slug}`}
                        className={`stone-card ${hoveredSlug === stone.slug ? 'stone-card--hovered' : ''}`}
                        onMouseEnter={() => setHoveredSlug(stone.slug)}
                        onMouseLeave={() => setHoveredSlug(null)}
                      >
                        <div className="stone-card-image-wrapper">
                          {primaryImg ? (
                            <img
                              src={primaryImg.url}
                              alt={primaryImg.alt || stone.name}
                              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                            />
                          ) : (
                            <div className="stone-card-image-bg" style={{ background: stone.color || '#7B4BA0' }} />
                          )}
                          <div className="stone-card-overlay" />
                          <span className="stone-card-category">{stone.category}</span>
                        </div>

                        <div className="stone-card-body">
                          <p className="stone-card-subtitle">{stone.subtitle}</p>
                          <h3 className="stone-card-name">{stone.name}</h3>
                          <p className="stone-card-desc">{shortDesc}</p>
                          <span className="stone-card-link">
                            Discover More
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </span>
                        </div>
                      </Link>
                    );
                  })
            }
          </div>
        )}
      </section>

      <FAQSection />
      <ReviewSection />
      <Footer />
    </main>
  );
}
