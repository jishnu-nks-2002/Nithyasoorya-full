'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Review {
  _id?: string;
  id?: number;
  name: string;
  title: string;
  location: string;
  rating: number;
  review: string;
  initials: string;
  productImage: string;
  productLabel?: string;
  order?: number;
}

// ─── Fallback data (only shown if the backend cannot be reached) ──────────────
const defaultReviews: Review[] = [
  {
    id: 1,
    name: 'Ananya Krishnamurthy',
    title: 'Art Curator',
    location: 'Chennai, India',
    rating: 5,
    review: 'An absolutely transcendent experience. The curation speaks to a deep reverence for both ancient craft and the contemporary gaze. Each piece felt like a quiet revelation — the kind that lingers long after you have left the gallery.',
    initials: 'AK',
    productImage: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80',
    productLabel: 'Form in Space',
  },
  {
    id: 2,
    name: 'Miriam Fontaine',
    title: 'Interior Architect',
    location: 'Paris, France',
    rating: 5,
    review: 'The collection is extraordinary in its restraint. Nothing is overdone, yet everything is felt. The sculptures in the eastern wing especially — there is a silence to them that only the truly masterful can achieve.',
    initials: 'MF',
    productImage: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=800&q=80',
    productLabel: 'Quiet Geometry',
  },
  {
    id: 3,
    name: 'Rahul Menon',
    title: 'Cultural Journalist',
    location: 'Mumbai, India',
    rating: 5,
    review: 'I have visited galleries across three continents, and what sets this apart is intention. Every corner tells a coherent story. The photography collection alone is worth the journey twice over.',
    initials: 'RM',
    productImage: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=800&q=80',
    productLabel: 'After the Rain',
  },
  {
    id: 4,
    name: 'Sophia Elentari',
    title: 'Collector & Patron',
    location: 'Athens, Greece',
    rating: 5,
    review: 'A sanctuary for those who believe beauty still has something urgent to say. The mixed media installation moved me to tears — not from sentiment, but from recognition. This is art as it should be.',
    initials: 'SE',
    productImage: 'https://images.unsplash.com/photo-1596548438137-d51ea5c83ca5?w=800&q=80',
    productLabel: 'Tender Light',
  },
  {
    id: 5,
    name: 'James Okafor',
    title: 'Professor of Fine Arts',
    location: 'Lagos, Nigeria',
    rating: 5,
    review: 'My students leave transformed. The atmosphere cultivates something rarer: wonder. An institution that understands the difference between displaying art and experiencing it.',
    initials: 'JO',
    productImage: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=800&q=80',
    productLabel: 'Vessel No. 7',
  },
];

// ─── API config ───────────────────────────────────────────────────────────────
const API_URL          = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const REVIEWS_ENDPOINT = '/api/reviews';   // ⬅ change if your router is mounted somewhere else
const PAGE_LIMIT       = 100;              // items requested per page
const MAX_PAGES        = 50;               // safety cap

const PLACEHOLDER_IMG = 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=800&q=80';

const resolveImage = (src?: string): string => {
  if (!src) return PLACEHOLDER_IMG;
  if (/^(https?:|data:|blob:)/.test(src)) return src;
  return `${API_URL}${src.startsWith('/') ? '' : '/'}${src}`;
};

const makeInitials = (name = '') =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(w => w[0].toUpperCase())
    .join('') || '?';

// Makes sure every review has all the fields the UI needs
const normalizeReview = (r: any): Review => ({
  _id:          r._id,
  id:           r.id,
  name:         r.name || 'Anonymous',
  title:        r.title || '',
  location:     r.location || '',
  rating:       Math.max(0, Math.min(5, Number(r.rating) || 5)),
  review:       r.review || r.text || r.comment || '',
  initials:     r.initials || makeInitials(r.name),
  productImage: r.productImage || r.image || '',
  productLabel: r.productLabel || '',
  order:        typeof r.order === 'number' ? r.order : undefined,
});

// Pulls the array out of common response shapes
const extractList = (json: any): any[] => {
  if (Array.isArray(json)) return json;
  if (Array.isArray(json?.data)) return json.data;
  if (Array.isArray(json?.data?.reviews)) return json.data.reviews;
  if (Array.isArray(json?.reviews)) return json.reviews;
  return [];
};

// Fetches EVERY page of reviews (also works when the API has no pagination)
async function fetchAllReviews(): Promise<Review[]> {
  const all: any[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const res = await fetch(`${API_URL}${REVIEWS_ENDPOINT}?page=${page}&limit=${PAGE_LIMIT}`, {
      cache: 'no-store',
    });
    if (!res.ok) throw new Error(`Reviews request failed (${res.status})`);
    const json = await res.json();

    all.push(...extractList(json));

    const meta = json?.pagination || json?.meta || json;
    totalPages = Number(meta?.totalPages ?? meta?.pages ?? 1) || 1;
    page++;
  } while (page <= totalPages && page <= MAX_PAGES);

  // Remove duplicates in case the API ignored the page parameter
  const unique = Array.from(new Map(all.map((r, i) => [r._id ?? `i-${i}`, r])).values());

  // Respect the admin's drag-and-drop order (stable sort keeps API order if no `order`)
  return unique
    .map(normalizeReview)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

// ─── Stars ────────────────────────────────────────────────────────────────────
const Stars: React.FC<{ rating: number; size?: number }> = ({ rating, size = 14 }) => (
  <div style={{ display: 'flex', gap: 4 }}>
    {Array.from({ length: 5 }, (_, i) => (
      <svg key={i} width={size} height={size} viewBox="0 0 24 24"
        fill={i < rating ? '#7B4BA0' : 'none'} stroke="#7B4BA0" strokeWidth="1.5"
        style={{ opacity: i < rating ? 1 : 0.22 }}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
);

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar: React.FC<{ initials: string; size?: number }> = ({ initials, size = 52 }) => (
  <div style={{
    width: size, height: size, borderRadius: '50%', flexShrink: 0,
    background: 'linear-gradient(135deg,#7B4BA0 0%,#4a2870 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    boxShadow: '0 4px 18px rgba(123,75,160,0.35)',
  }}>
    <span style={{
      fontFamily: "'Playfair Display',Georgia,serif",
      fontSize: size * 0.34, fontWeight: 700, color: '#fff', lineHeight: 1,
    }}>
      {initials}
    </span>
  </div>
);

// ─── Loading spinner ──────────────────────────────────────────────────────────
const LoadingState = () => (
  <div style={{ textAlign: 'center', padding: '60px 0' }}>
    <div style={{
      width: 36, height: 36, borderRadius: '50%', margin: '0 auto 14px',
      border: '2.5px solid rgba(123,75,160,0.12)', borderTopColor: '#7B4BA0',
      animation: 'ts-spin 0.8s linear infinite',
    }} />
    <p style={{
      fontFamily: "'Crimson Text',serif", fontSize: 14,
      color: '#bbb', fontStyle: 'italic', letterSpacing: '0.1em',
    }}>Loading reviews…</p>
  </div>
);

// ─── Empty state (backend reachable, but no reviews yet) ──────────────────────
const EmptyState = () => (
  <section style={{ width: '100%', background: '#f8f5fc', padding: 'clamp(72px,9vw,112px) 24px', textAlign: 'center' }}>
    <h2 style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 'clamp(28px,4vw,44px)', fontWeight: 700, color: '#1a0f2e', margin: '0 0 12px' }}>
      What Collectors Say
    </h2>
    <p style={{ fontFamily: "'Crimson Text',Georgia,serif", fontSize: 18, fontStyle: 'italic', color: '#9b82c4', margin: 0 }}>
      Reviews will appear here soon.
    </p>
  </section>
);

// ─── Nav button helpers ───────────────────────────────────────────────────────
const navBtnStyle: React.CSSProperties = {
  width: 44, height: 44, borderRadius: '50%',
  border: '1.5px solid rgba(123,75,160,0.28)',
  background: 'transparent', color: '#7B4BA0',
  cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
  transition: 'all 0.22s ease', flexShrink: 0,
};
const applyHov = (el: HTMLElement, on: boolean) => {
  el.style.background  = on ? '#7B4BA0' : 'transparent';
  el.style.borderColor = on ? '#7B4BA0' : 'rgba(123,75,160,0.28)';
  el.style.color       = on ? '#fff'    : '#7B4BA0';
};

// ─── FEATURED CARD ────────────────────────────────────────────────────────────
const FeaturedCard: React.FC<{ review: Review }> = ({ review }) => {
  const [hov, setHov] = useState(false);

  if (!review) return null;

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'relative',
        borderRadius: 16,
        overflow: 'hidden',
        border: '1.5px solid rgba(123,75,160,0.55)',
        boxShadow: '0 32px 80px rgba(123,75,160,0.2), 0 0 0 4px rgba(123,75,160,0.07)',
        background: '#fff',
        display: 'flex',
        flexDirection: 'row',
        height: '100%',
        minHeight: 480,
      }}
    >
      {/* Image — LEFT SIDE */}
      <div style={{
        position: 'relative',
        flex: '0 0 45%',
        overflow: 'hidden',
      }}>
        <img
          src={resolveImage(review.productImage)}
          alt={review.productLabel || review.name}
          style={{
            width: '100%', height: '100%', objectFit: 'cover', display: 'block',
            transform: hov ? 'scale(1.04)' : 'scale(1)',
            transition: 'transform 0.7s ease',
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, transparent 60%, rgba(10,3,22,0.25) 100%)',
        }} />
        {review.productLabel && (
          <div style={{
            position: 'absolute', bottom: 16, left: 16,
            background: 'rgba(123,75,160,0.85)', backdropFilter: 'blur(10px)',
            borderRadius: 4, padding: '5px 14px',
          }}>
            <span style={{
              fontFamily: "'Crimson Text',Georgia,serif",
              fontSize: 11, letterSpacing: '2.5px', textTransform: 'uppercase',
              color: '#fff', fontStyle: 'italic',
            }}>{review.productLabel}</span>
          </div>
        )}
        <div style={{
          position: 'absolute', top: 14, right: 14,
          width: 10, height: 10, borderRadius: '50%', background: '#7B4BA0',
          animation: 'ts-pulse 2s ease infinite',
        }} />
      </div>

      {/* Content — RIGHT SIDE */}
      <div style={{
        flex: 1,
        padding: '36px 36px 36px 40px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, bottom: 0, width: 3,
          background: 'linear-gradient(180deg,#7B4BA0,rgba(192,132,252,0.35))',
        }} />
        <div style={{
          position: 'absolute', top: 14, right: 22,
          fontFamily: "'Playfair Display',Georgia,serif",
          fontSize: 120, lineHeight: 1, color: '#7B4BA0', opacity: 0.05,
          pointerEvents: 'none', userSelect: 'none', fontWeight: 700,
        }}>"</div>
        <div style={{ marginBottom: 16 }}><Stars rating={review.rating} size={16} /></div>
        <p style={{
          fontFamily: "'Crimson Text',Georgia,serif",
          fontSize: 18, fontStyle: 'italic', color: '#2a1a3e',
          lineHeight: 1.82, margin: '0 0 24px', letterSpacing: '0.01em',
        }}>"{review.review}"</p>
        <div style={{ width: 36, height: 1, background: 'linear-gradient(90deg,#7B4BA0,transparent)', marginBottom: 20, opacity: 0.5 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <Avatar initials={review.initials} size={52} />
          <div>
            <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 15, fontWeight: 600, color: '#1a0f2e', margin: '0 0 3px' }}>{review.name}</p>
            <p style={{ fontFamily: "'Crimson Text',Georgia,serif", fontSize: 13, color: '#7B4BA0', margin: '0 0 2px', opacity: 0.85 }}>{review.title}</p>
            <p style={{ fontFamily: "'Crimson Text',Georgia,serif", fontSize: 12, color: '#aaa', margin: 0 }}>{review.location}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── COMPACT CARD ─────────────────────────────────────────────────────────────
const CompactCard: React.FC<{ review: Review; onClick: () => void; index: number }> = ({
  review, onClick, index,
}) => {
  const [hov, setHov] = useState(false);

  if (!review) return null;

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'relative', borderRadius: 14, overflow: 'hidden', cursor: 'pointer',
        border: '1.5px solid rgba(123,75,160,0.10)', background: '#fff',
        boxShadow: hov ? '0 16px 48px rgba(123,75,160,0.15)' : '0 4px 20px rgba(0,0,0,0.06)',
        transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
        transform: hov ? 'translateY(-3px)' : 'none',
        display: 'flex', flexDirection: 'row',
        flex: 1,
        minHeight: 0,
        opacity: 0,
        animation: `ts-slideIn 0.6s ease ${0.1 + index * 0.12}s forwards`,
      }}
    >
      {/* Image strip */}
      <div style={{ width: 110, flexShrink: 0, position: 'relative', overflow: 'hidden' }}>
        <img
          src={resolveImage(review.productImage)}
          alt={review.name}
          style={{
            width: '100%', height: '100%', objectFit: 'cover', display: 'block',
            transform: hov ? 'scale(1.07)' : 'scale(1)',
            transition: 'transform 0.6s ease',
          }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right,transparent 55%,rgba(255,255,255,0.18))',
          pointerEvents: 'none',
        }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: '20px 22px', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <div style={{
          position: 'absolute', top: 0, left: 0, bottom: 0, width: 3,
          background: hov ? '#7B4BA0' : 'transparent',
          borderRadius: '0 2px 2px 0', transition: 'background 0.3s ease',
        }} />
        <div style={{ marginBottom: 8 }}><Stars rating={review.rating} size={12} /></div>
        <p style={{
          fontFamily: "'Crimson Text',Georgia,serif",
          fontSize: 14, fontStyle: 'italic', color: '#3a2a4e',
          lineHeight: 1.65, margin: '0 0 14px',
          display: '-webkit-box', WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>"{review.review}"</p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Avatar initials={review.initials} size={36} />
          <div>
            <p style={{ fontFamily: "'Playfair Display',Georgia,serif", fontSize: 13, fontWeight: 600, color: '#1a0f2e', margin: '0 0 1px' }}>{review.name}</p>
            <p style={{ fontFamily: "'Crimson Text',Georgia,serif", fontSize: 11.5, color: '#7B4BA0', margin: 0, opacity: 0.8 }}>{review.title} · {review.location}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const TestimonialsSection: React.FC = () => {
  // ── Fetch ALL reviews from the backend ──────────────────────────────────
  const [apiReviews, setApiReviews] = useState<Review[]>([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const list = await fetchAllReviews();
        if (cancelled) return;
        setApiReviews(list);
        setError(null);
        setActive(0);
      } catch (e: any) {
        if (cancelled) return;
        console.error('[TestimonialsSection] fetch failed:', e);
        setError(e?.message || 'Failed to load reviews');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, []);

  // Backend reviews are used as-is; samples only appear if the request failed
  const reviews: Review[] = error ? defaultReviews : apiReviews;

  const [active, setActive]     = useState(0);
  const [progress, setProgress] = useState(0);
  const [isWide, setIsWide]     = useState(true);

  const autoRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef   = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const INTERVAL = 6000;

  useEffect(() => {
    setActive(prev => (reviews.length > 0 ? Math.min(prev, reviews.length - 1) : 0));
  }, [reviews.length]);

  useEffect(() => {
    const check = () => setIsWide(window.innerWidth >= 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const clearAll = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    if (rafRef.current)  cancelAnimationFrame(rafRef.current);
  }, []);

  const startProgress = useCallback(() => {
    setProgress(0);
    startRef.current = performance.now();
    const tick = (now: number) => {
      const pct = Math.min(((now - startRef.current) / INTERVAL) * 100, 100);
      setProgress(pct);
      if (pct < 100) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const startAutoplay = useCallback((total: number) => {
    clearAll();
    if (total < 2) return;
    startProgress();
    autoRef.current = setInterval(() => {
      setActive(c => (c + 1) % total);
      startProgress();
    }, INTERVAL);
  }, [clearAll, startProgress]);

  // Restarts whenever the number of reviews changes (e.g. when API data arrives)
  useEffect(() => {
    if (!loading) startAutoplay(reviews.length);
    return clearAll;
  }, [loading, reviews.length]); // eslint-disable-line

  const goTo = (idx: number) => {
    if (reviews.length === 0) return;
    clearAll();
    setActive(((idx % reviews.length) + reviews.length) % reviews.length);
    startAutoplay(reviews.length);
  };

  // Backend reachable but no reviews yet
  if (!loading && reviews.length === 0) return <EmptyState />;

  if (!isWide) return (
    <NarrowLayout reviews={reviews} loading={loading} error={!!error} />
  );

  const safeActive  = reviews.length > 0 ? Math.min(active, reviews.length - 1) : 0;
  const featured    = reviews[safeActive];
  const rightCards  = reviews.filter((_, i) => i !== safeActive).slice(0, 2);

  return (
    <section style={{
      width: '100%',
      boxSizing: 'border-box',
      background: '#f8f5fc',
      padding: 'clamp(72px,9vw,112px) 0 clamp(64px,8vw,96px)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Crimson+Text:ital,wght@0,400;0,600;1,400;1,600&display=swap');
        @keyframes ts-slideIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes ts-pulse   { 0%,100%{box-shadow:0 0 0 3px rgba(123,75,160,0.25)} 50%{box-shadow:0 0 0 6px rgba(123,75,160,0.1)} }
        @keyframes ts-spin    { to{transform:rotate(360deg)} }
        .ts-section *, .ts-section *::before, .ts-section *::after { box-sizing: border-box; }
      `}</style>

      {/* BG orbs */}
      <div style={{ position:'absolute',top:'-120px',right:'-120px',width:500,height:500,borderRadius:'50%',pointerEvents:'none',background:'radial-gradient(circle,rgba(123,75,160,0.07) 0%,transparent 70%)' }} />
      <div style={{ position:'absolute',bottom:'-80px',left:'-80px',width:380,height:380,borderRadius:'50%',pointerEvents:'none',background:'radial-gradient(circle,rgba(123,75,160,0.05) 0%,transparent 70%)' }} />

      {/* ── Full-width container ── */}
      <div style={{
        width: '100%',
        maxWidth: '100%',
        padding: '0 clamp(24px,4vw,60px)',
        boxSizing: 'border-box',
      }}>

        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <div style={{ display:'flex',alignItems:'center',gap:12,marginBottom:16 }}>
            <div style={{ width:32,height:1.5,background:'#7B4BA0' }} />
            <span style={{ fontFamily:"'Crimson Text',Georgia,serif",fontSize:10.5,fontWeight:600,letterSpacing:'0.3em',textTransform:'uppercase',color:'#7B4BA0' }}>
              Visitor Testimonials
            </span>
          </div>
          <div style={{ display:'flex',alignItems:'flex-end',justifyContent:'space-between',gap:24,flexWrap:'wrap' }}>
            <h2 style={{ fontFamily:"'Playfair Display',Georgia,serif",fontSize:'clamp(32px,4vw,54px)',fontWeight:700,color:'#1a0f2e',margin:0,lineHeight:1.1,letterSpacing:'-0.02em' }}>
              What Collectors Say
            </h2>
            {reviews.length > 0 && (
              <div style={{ display:'flex',alignItems:'center',gap:14 }}>
                <span style={{ fontFamily:"'Crimson Text',serif",fontSize:13,color:'#bbb',letterSpacing:'2.5px',fontStyle:'italic' }}>
                  {String(safeActive + 1).padStart(2,'0')} — {String(reviews.length).padStart(2,'0')}
                </span>
                <div style={{ width:120,height:2,background:'rgba(123,75,160,0.12)',borderRadius:2,overflow:'hidden' }}>
                  <div style={{ height:'100%',background:'#7B4BA0',borderRadius:2,width:`${progress}%`,transition:'none' }} />
                </div>
              </div>
            )}
          </div>
        </div>

        {loading ? <LoadingState /> : (
          <>
            {/* ── Asymmetric grid: featured left (60%), 2 compact cards right (40%) ── */}
            {featured && (
              <div style={{
                display: 'grid',
                gridTemplateColumns: rightCards.length > 0 ? '3fr 2fr' : '1fr',
                gridTemplateRows: '1fr 1fr',
                gap: 20,
                width: '100%',
                // Fixed height so both columns are the same height
                height: 'clamp(440px, 55vh, 600px)',
              }}>
                {/* Featured spans both rows on left */}
                <div style={{ gridRow: '1 / 3', minHeight: 0 }}>
                  <FeaturedCard review={featured} />
                </div>
                {/* Compact cards stacked on the right */}
                {rightCards.map((r, i) => (
                  <CompactCard
                    key={r._id ?? r.id ?? i}
                    review={r}
                    onClick={() => goTo(reviews.indexOf(r))}
                    index={i}
                  />
                ))}
              </div>
            )}

            {/* ── Dot nav ── */}
            {reviews.length > 1 && (
              <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:8,marginTop:36,flexWrap:'wrap' }}>
                {reviews.map((_, i) => (
                  <button key={i} onClick={() => goTo(i)} aria-label={`Review ${i+1}`}
                    style={{
                      position:'relative', width: i===safeActive ? 32 : 8, height:8,
                      borderRadius:4, border:'none', padding:0, cursor:'pointer',
                      background:'rgba(123,75,160,0.18)', overflow:'hidden',
                      transition:'width 0.4s cubic-bezier(0.25,0.1,0.25,1)',
                    }}>
                    <span style={{
                      position:'absolute',top:0,left:0,height:'100%',
                      width: i===safeActive ? `${progress}%` : '0%',
                      background:'#7B4BA0', borderRadius:4,
                      transition: i===safeActive ? 'none' : 'width 0.3s ease',
                    }} />
                  </button>
                ))}
              </div>
            )}

            {error && (
              <p style={{ textAlign:'center',marginTop:16,fontFamily:"'Crimson Text',serif",fontSize:11,color:'#c9a0dc',opacity:0.7,fontStyle:'italic' }}>
                (Showing sample reviews — live data unavailable)
              </p>
            )}
          </>
        )}
      </div>
    </section>
  );
};

// ─── NARROW LAYOUT ────────────────────────────────────────────────────────────
const NarrowLayout: React.FC<{ reviews: Review[]; loading: boolean; error: boolean }> = ({
  reviews, loading, error,
}) => {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const autoRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef   = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const INTERVAL = 5500;
  const total = reviews.length;

  const clearAll = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    if (rafRef.current)  cancelAnimationFrame(rafRef.current);
  }, []);

  const startProgress = useCallback(() => {
    setProgress(0);
    startRef.current = performance.now();
    const tick = (now: number) => {
      const pct = Math.min(((now - startRef.current) / INTERVAL) * 100, 100);
      setProgress(pct);
      if (pct < 100) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const startAuto = useCallback(() => {
    clearAll();
    if (total < 2) return;
    startProgress();
    autoRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % total); startProgress();
    }, INTERVAL);
  }, [clearAll, startProgress, total]);

  useEffect(() => { if (total > 0) { startAuto(); } return clearAll; }, [total]); // eslint-disable-line
  const goTo = (i: number) => {
    if (total === 0) return;
    clearAll(); setCurrent(((i%total)+total)%total); startAuto();
  };

  if (loading) return <LoadingState />;

  const safeIdx = total > 0 ? Math.min(current, total - 1) : 0;
  const r = reviews[safeIdx];
  if (!r) return null;

  return (
    <section style={{ width:'100%',background:'#f8f5fc',padding:'clamp(64px,8vw,100px) 0 clamp(56px,7vw,80px)' }}>
      <style>{`@keyframes ts-spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ maxWidth:720,margin:'0 auto',padding:'0 clamp(16px,4vw,32px)' }}>

        {/* Header */}
        <div style={{ textAlign:'center',marginBottom:40 }}>
          <p style={{ fontFamily:"'Crimson Text',serif",fontSize:11,letterSpacing:'4px',textTransform:'uppercase',color:'#7B4BA0',margin:'0 0 14px',opacity:0.8 }}>Visitor Testimonials</p>
          <h2 style={{ fontFamily:"'Playfair Display',serif",fontSize:'clamp(28px,5vw,44px)',fontWeight:700,color:'#1a0f2e',margin:'0 0 14px',letterSpacing:'-0.02em' }}>What Collectors Say</h2>
          <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:12 }}>
            <div style={{ width:36,height:1,background:'linear-gradient(to left,#7B4BA0,transparent)' }} />
            <div style={{ width:5,height:5,borderRadius:'50%',background:'#7B4BA0',opacity:0.5 }} />
            <div style={{ width:36,height:1,background:'linear-gradient(to right,#7B4BA0,transparent)' }} />
          </div>
        </div>

        {/* Card */}
        <div style={{ borderRadius:12,overflow:'hidden',background:'#fff',boxShadow:'0 16px 56px rgba(123,75,160,0.12)',border:'1px solid rgba(123,75,160,0.1)' }}>
          <div style={{ position:'relative',height:240,overflow:'hidden' }}>
            <img src={resolveImage(r.productImage)} alt={r.name} style={{ width:'100%',height:'100%',objectFit:'cover',display:'block' }} />
            {r.productLabel && (
              <div style={{ position:'absolute',bottom:14,left:14,background:'rgba(123,75,160,0.85)',backdropFilter:'blur(8px)',borderRadius:4,padding:'5px 12px' }}>
                <span style={{ fontFamily:"'Crimson Text',serif",fontSize:11,letterSpacing:'2px',textTransform:'uppercase',color:'#fff',fontStyle:'italic' }}>{r.productLabel}</span>
              </div>
            )}
          </div>
          <div style={{ padding:'28px 24px 32px',position:'relative' }}>
            <div style={{ position:'absolute',top:0,left:0,right:0,height:3,background:'linear-gradient(90deg,#7B4BA0,rgba(123,75,160,0.15))' }} />
            <div style={{ marginBottom:14 }}><Stars rating={r.rating} /></div>
            <p style={{ fontFamily:"'Crimson Text',serif",fontSize:17,fontStyle:'italic',color:'#2a2a2a',lineHeight:1.8,margin:'0 0 22px' }}>"{r.review}"</p>
            <div style={{ display:'flex',alignItems:'center',gap:12 }}>
              <Avatar initials={r.initials} size={44} />
              <div>
                <p style={{ fontFamily:"'Playfair Display',serif",fontSize:14,fontWeight:600,color:'#1a0f2e',margin:'0 0 2px' }}>{r.name}</p>
                <p style={{ fontFamily:"'Crimson Text',serif",fontSize:12,color:'#7B4BA0',margin:'0 0 1px' }}>{r.title}</p>
                <p style={{ fontFamily:"'Crimson Text',serif",fontSize:11,color:'#aaa',margin:0 }}>{r.location}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nav */}
        {total > 1 && (
          <div style={{ display:'flex',alignItems:'center',justifyContent:'center',gap:24,marginTop:28 }}>
            <button onClick={() => goTo(current-1)} aria-label="Previous" style={navBtnStyle} onMouseEnter={e=>applyHov(e.currentTarget,true)} onMouseLeave={e=>applyHov(e.currentTarget,false)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <div style={{ display:'flex',gap:8,flexWrap:'wrap',justifyContent:'center' }}>
              {reviews.map((_,i) => (
                <button key={i} onClick={() => goTo(i)} aria-label={`Review ${i+1}`} style={{ position:'relative',width:i===safeIdx?30:8,height:8,borderRadius:4,border:'none',padding:0,cursor:'pointer',background:'rgba(123,75,160,0.18)',overflow:'hidden',transition:'width 0.4s cubic-bezier(0.25,0.1,0.25,1)' }}>
                  <span style={{ position:'absolute',top:0,left:0,height:'100%',width:i===safeIdx?`${progress}%`:'0%',background:'#7B4BA0',borderRadius:4,transition:i===safeIdx?'none':'width 0.3s ease' }} />
                </button>
              ))}
            </div>
            <button onClick={() => goTo(current+1)} aria-label="Next" style={navBtnStyle} onMouseEnter={e=>applyHov(e.currentTarget,true)} onMouseLeave={e=>applyHov(e.currentTarget,false)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        )}
        {error && <p style={{ textAlign:'center',marginTop:12,fontFamily:"'Crimson Text',serif",fontSize:11,color:'#c9a0dc',opacity:0.7,fontStyle:'italic' }}>(Showing sample reviews)</p>}
      </div>
    </section>
  );
};

export default TestimonialsSection;