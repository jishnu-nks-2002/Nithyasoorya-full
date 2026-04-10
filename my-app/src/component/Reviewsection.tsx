import React, { useState, useEffect, useRef, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Review {
  id: number;
  name: string;
  title: string;
  location: string;
  rating: number;
  review: string;
  initials: string;
  productImage: string;
  productLabel?: string;
}

interface ReviewSectionProps {
  reviews?: Review[];
  sectionLabel?: string;
  heading?: string;
  subheading?: string;
  autoPlayInterval?: number;
}

// ─── Default Data ─────────────────────────────────────────────────────────────
const defaultReviews: Review[] = [
  {
    id: 1,
    name: 'Ananya Krishnamurthy',
    title: 'Art Curator',
    location: 'Chennai, India',
    rating: 5,
    review:
      'An absolutely transcendent experience. The curation speaks to a deep reverence for both ancient craft and the contemporary gaze. Each piece felt like a quiet revelation — the kind that lingers long after you have left the gallery.',
    initials: 'AK',
    productImage: 'https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&q=80',
    productLabel: 'Form in Space',
  },
  {
    id: 2,
    name: 'Miriam Fontaine',
    title: 'Interior Architect',
    location: 'Paris, France',
    rating: 5,
    review:
      'The collection is extraordinary in its restraint. Nothing is overdone, yet everything is felt. The sculptures in the eastern wing especially — there is a silence to them that only the truly masterful can achieve. I will return without question.',
    initials: 'MF',
    productImage: 'https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=600&q=80',
    productLabel: 'Quiet Geometry',
  },
  {
    id: 3,
    name: 'Rahul Menon',
    title: 'Cultural Journalist',
    location: 'Mumbai, India',
    rating: 5,
    review:
      'I have visited galleries across three continents, and what sets this apart is intention. Every corner, every transition between works, tells a coherent story. The photography collection alone is worth the journey twice over.',
    initials: 'RM',
    productImage: 'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=600&q=80',
    productLabel: 'After the Rain',
  },
  {
    id: 4,
    name: 'Sophia Elentari',
    title: 'Collector & Patron',
    location: 'Athens, Greece',
    rating: 5,
    review:
      'A sanctuary for those who believe beauty still has something urgent to say. The mixed media installation on the second floor moved me to tears — not from sentiment, but from recognition. This is art as it should be: honest and uncompromising.',
    initials: 'SE',
    productImage: 'https://images.unsplash.com/photo-1596548438137-d51ea5c83ca5?w=600&q=80',
    productLabel: 'Tender Light',
  },
  {
    id: 5,
    name: 'James Okafor',
    title: 'Professor of Fine Arts',
    location: 'Lagos, Nigeria',
    rating: 5,
    review:
      'My students leave transformed. The pedagogical value alone is immense — but beyond that, the atmosphere cultivates something rarer: wonder. An institution that understands the difference between displaying art and experiencing it.',
    initials: 'JO',
    productImage: 'https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=600&q=80',
    productLabel: 'Vessel No. 7',
  },
];

// ─── Stars ────────────────────────────────────────────────────────────────────
const Stars: React.FC<{ rating: number }> = ({ rating }) => (
  <div style={{ display: 'flex', gap: '5px' }}>
    {Array.from({ length: 5 }, (_, i) => (
      <svg key={i} width="15" height="15" viewBox="0 0 24 24"
        fill={i < rating ? '#7B4BA0' : 'none'}
        stroke="#7B4BA0" strokeWidth="1.5"
        style={{ opacity: i < rating ? 1 : 0.25 }}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ))}
  </div>
);

// ─── Avatar ───────────────────────────────────────────────────────────────────
const Avatar: React.FC<{ initials: string }> = ({ initials }) => (
  <div style={{
    width: '46px', height: '46px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #7B4BA0 0%, #5A3A7D 100%)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    boxShadow: '0 4px 14px rgba(123,75,160,0.3)',
  }}>
    <span style={{
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: '17px', fontWeight: 700, color: '#fff', lineHeight: 1,
    }}>{initials}</span>
  </div>
);

// ─── Single Card ──────────────────────────────────────────────────────────────
const ReviewCard: React.FC<{
  review: Review;
  position: 'center' | 'prev' | 'next' | 'hidden';
  isMobile: boolean;
}> = ({ review, position, isMobile }) => {
  const transforms: Record<string, string> = {
    center: 'translateY(0) scale(1)',
    prev:   'translateY(-6px) scale(0.97)',
    next:   'translateY(6px) scale(0.97)',
    hidden: 'translateY(0) scale(0.94)',
  };
  const opacities: Record<string, number> = { center: 1, prev: 0, next: 0, hidden: 0 };

  return (
    <div style={{
      position: 'absolute', inset: 0,
      transform: transforms[position],
      opacity: opacities[position],
      zIndex: position === 'center' ? 3 : 0,
      transition: 'all 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)',
      pointerEvents: position === 'center' ? 'auto' : 'none',
    }}>
      <div style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        width: '100%',
        height: '100%',
        borderRadius: '6px',
        overflow: 'hidden',
        background: '#fff',
        boxShadow: '0 20px 70px rgba(123,75,160,0.13), 0 4px 20px rgba(0,0,0,0.07)',
        border: '1px solid rgba(123,75,160,0.1)',
      }}>

        {/* ── Left: Product Image ───────────────────────────────── */}
        <div style={{
          position: 'relative',
          width: isMobile ? '100%' : '42%',
          height: isMobile ? '220px' : '100%',
          flexShrink: 0,
          overflow: 'hidden',
        }}>
          <img
            src={review.productImage}
            alt={review.productLabel || 'Product'}
            style={{
              width: '100%', height: '100%',
              objectFit: 'cover', objectPosition: 'center',
              display: 'block',
              transition: 'transform 0.8s ease',
            }}
          />
          {/* Subtle right-edge fade into card */}
          {!isMobile && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to right, transparent 60%, rgba(255,255,255,0.12) 100%)',
              pointerEvents: 'none',
            }} />
          )}
          {/* Product label badge */}
          {review.productLabel && (
            <div style={{
              position: 'absolute', bottom: '16px', left: '16px',
              background: 'rgba(123,75,160,0.82)',
              backdropFilter: 'blur(8px)',
              borderRadius: '3px',
              padding: '5px 12px',
            }}>
              <span style={{
                fontFamily: "'Crimson Text', Georgia, serif",
                fontSize: '11px', letterSpacing: '2.5px',
                textTransform: 'uppercase', color: '#fff',
                fontStyle: 'italic',
              }}>{review.productLabel}</span>
            </div>
          )}
        </div>

        {/* ── Right: Review Content ─────────────────────────────── */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: isMobile ? '32px 28px 36px' : '48px 52px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative top accent line */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
            background: 'linear-gradient(90deg, #7B4BA0 0%, rgba(123,75,160,0.15) 100%)',
          }} />

          {/* Large decorative quote mark */}
          <div style={{
            position: 'absolute', top: '24px', right: '28px',
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '120px', lineHeight: 1, color: '#7B4BA0',
            opacity: 0.06, userSelect: 'none', pointerEvents: 'none',
            fontWeight: 700,
          }}>"</div>

          {/* Stars */}
          <div style={{ marginBottom: '20px' }}>
            <Stars rating={review.rating} />
          </div>

          {/* Review text */}
          <p style={{
            fontFamily: "'Crimson Text', Georgia, serif",
            fontSize: isMobile ? '17px' : '19px',
            fontWeight: 400,
            fontStyle: 'italic',
            color: '#2a2a2a',
            lineHeight: 1.8,
            margin: '0 0 32px',
            letterSpacing: '0.01em',
          }}>
            "{review.review}"
          </p>

          {/* Divider */}
          <div style={{
            width: '40px', height: '1px',
            background: 'linear-gradient(90deg, #7B4BA0, transparent)',
            marginBottom: '24px', opacity: 0.5,
          }} />

          {/* Reviewer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <Avatar initials={review.initials} />
            <div>
              <p style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '15px', fontWeight: 600,
                color: '#1a0f2e', margin: '0 0 3px', letterSpacing: '0.01em',
              }}>{review.name}</p>
              <p style={{
                fontFamily: "'Crimson Text', Georgia, serif",
                fontSize: '13px', color: '#7B4BA0',
                margin: '0 0 1px', opacity: 0.85,
              }}>{review.title}</p>
              <p style={{
                fontFamily: "'Crimson Text', Georgia, serif",
                fontSize: '12px', color: '#999', margin: 0,
                letterSpacing: '0.3px',
              }}>{review.location}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

// ─── Review Section ───────────────────────────────────────────────────────────
const ReviewSection: React.FC<ReviewSectionProps> = ({
  reviews = defaultReviews,
  sectionLabel = 'VISITOR TESTIMONIALS',
  heading = 'What Collectors Say',
  subheading = 'Words from those who have experienced the collection firsthand.',
  autoPlayInterval = 5500,
}) => {
  const [current, setCurrent] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const autoRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);
  const total = reviews.length;

  // SSR-safe mobile check
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 680);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const clearAll = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
  }, []);

  const startProgress = useCallback(() => {
    setProgress(0);
    startRef.current = performance.now();
    const tick = (now: number) => {
      const pct = Math.min(((now - startRef.current) / autoPlayInterval) * 100, 100);
      setProgress(pct);
      if (pct < 100) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, [autoPlayInterval]);

  const startAutoplay = useCallback(() => {
    clearAll();
    startProgress();
    autoRef.current = setInterval(() => {
      setCurrent(c => (c + 1) % total);
      startProgress();
    }, autoPlayInterval);
  }, [clearAll, startProgress, autoPlayInterval, total]);

  useEffect(() => {
    startAutoplay();
    return clearAll;
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-start progress timer when current changes via autoplay
  useEffect(() => { /* progress restarted in startAutoplay */ }, [current]);

  const goTo = (idx: number) => {
    clearAll();
    setCurrent((idx + total) % total);
    startAutoplay();
  };

  const prev = () => goTo(current - 1);
  const next = () => goTo(current + 1);

  const getPosition = (i: number): 'center' | 'prev' | 'next' | 'hidden' => {
    if (i === current) return 'center';
    if (i === (current - 1 + total) % total) return 'prev';
    if (i === (current + 1) % total) return 'next';
    return 'hidden';
  };

  // Card height: enough for the content on all screen sizes
  const cardH = isMobile ? 'auto' : 'clamp(340px, 40vw, 440px)';

  return (
    <section style={{
      width: '100%',
      background: '#faf9fc',
      padding: 'clamp(64px, 8vw, 100px) 0 clamp(60px, 7vw, 88px)',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Font import */}
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;0,800;1,400&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600&display=swap');`}</style>

      {/* Background orbs */}
      <div style={{ position:'absolute', top:'-140px', right:'-140px', width:'480px', height:'480px', borderRadius:'50%', background:'radial-gradient(circle, rgba(123,75,160,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />
      <div style={{ position:'absolute', bottom:'-80px', left:'-80px', width:'360px', height:'360px', borderRadius:'50%', background:'radial-gradient(circle, rgba(123,75,160,0.05) 0%, transparent 70%)', pointerEvents:'none' }} />

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div style={{ textAlign:'center', padding:'0 24px', marginBottom:'56px' }}>
        <p style={{
          fontFamily:"'Crimson Text', Georgia, serif",
          fontSize:'11px', fontWeight:400,
          letterSpacing:'4px', textTransform:'uppercase',
          color:'#7B4BA0', margin:'0 0 18px', opacity:0.8,
        }}>{sectionLabel}</p>

        <h2 style={{
          fontFamily:"'Playfair Display', Georgia, serif",
          fontSize:'clamp(30px, 4.5vw, 56px)', fontWeight:700,
          color:'#1a0f2e', letterSpacing:'-0.02em',
          lineHeight:1.1, margin:'0 0 18px',
        }}>{heading}</h2>

        {/* Ornamental rule */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'14px', marginBottom:'18px' }}>
          <div style={{ width:'44px', height:'1px', background:'linear-gradient(to left, #7B4BA0, transparent)' }} />
          <div style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#7B4BA0', opacity:0.55 }} />
          <div style={{ width:'44px', height:'1px', background:'linear-gradient(to right, #7B4BA0, transparent)' }} />
        </div>

        <p style={{
          fontFamily:"'Crimson Text', Georgia, serif",
          fontSize:'clamp(15px, 1.8vw, 19px)', fontStyle:'italic',
          color:'#666', margin:0, lineHeight:1.6,
        }}>{subheading}</p>
      </div>

      {/* ── Carousel ─────────────────────────────────────────────────────── */}
      <div style={{
        maxWidth: '920px',
        margin: '0 auto',
        padding: '0 clamp(16px, 4vw, 40px)',
      }}>
        {/* Card stack */}
        <div style={{
          position: 'relative',
          height: isMobile ? 'auto' : cardH,
          minHeight: isMobile ? '0' : '340px',
        }}>
          {isMobile ? (
            // Mobile: just show current card directly (no stacking complexity)
            <div>
              {reviews[current] && (
                <div style={{
                  borderRadius:'6px', overflow:'hidden', background:'#fff',
                  boxShadow:'0 20px 70px rgba(123,75,160,0.13), 0 4px 20px rgba(0,0,0,0.07)',
                  border:'1px solid rgba(123,75,160,0.1)',
                }}>
                  {/* Image */}
                  <div style={{ position:'relative', width:'100%', height:'240px', overflow:'hidden' }}>
                    <img src={reviews[current].productImage} alt={reviews[current].productLabel}
                      style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                    {reviews[current].productLabel && (
                      <div style={{
                        position:'absolute', bottom:'14px', left:'14px',
                        background:'rgba(123,75,160,0.82)', backdropFilter:'blur(8px)',
                        borderRadius:'3px', padding:'5px 12px',
                      }}>
                        <span style={{ fontFamily:"'Crimson Text', serif", fontSize:'11px', letterSpacing:'2px', textTransform:'uppercase', color:'#fff', fontStyle:'italic' }}>
                          {reviews[current].productLabel}
                        </span>
                      </div>
                    )}
                  </div>
                  {/* Content */}
                  <div style={{ padding:'28px 24px 32px', position:'relative' }}>
                    <div style={{ position:'absolute', top:0, left:0, right:0, height:'3px', background:'linear-gradient(90deg,#7B4BA0,rgba(123,75,160,0.15))' }} />
                    <div style={{ marginBottom:'16px' }}><Stars rating={reviews[current].rating} /></div>
                    <p style={{ fontFamily:"'Crimson Text',serif", fontSize:'17px', fontStyle:'italic', color:'#2a2a2a', lineHeight:1.8, margin:'0 0 24px' }}>
                      "{reviews[current].review}"
                    </p>
                    <div style={{ width:'36px', height:'1px', background:'linear-gradient(90deg,#7B4BA0,transparent)', marginBottom:'20px', opacity:0.5 }} />
                    <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                      <Avatar initials={reviews[current].initials} />
                      <div>
                        <p style={{ fontFamily:"'Playfair Display',serif", fontSize:'14px', fontWeight:600, color:'#1a0f2e', margin:'0 0 2px' }}>{reviews[current].name}</p>
                        <p style={{ fontFamily:"'Crimson Text',serif", fontSize:'12px', color:'#7B4BA0', margin:'0 0 1px' }}>{reviews[current].title}</p>
                        <p style={{ fontFamily:"'Crimson Text',serif", fontSize:'11px', color:'#999', margin:0 }}>{reviews[current].location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Desktop: stacked positioned cards
            reviews.map((r, i) => (
              <ReviewCard key={r.id} review={r} position={getPosition(i)} isMobile={false} />
            ))
          )}
        </div>

        {/* ── Navigation ─────────────────────────────────────────────── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          gap: '28px', marginTop: isMobile ? '32px' : '40px',
        }}>
          {/* Prev */}
          <button onClick={prev} aria-label="Previous"
            style={{
              width:'46px', height:'46px', borderRadius:'50%',
              border:'1.5px solid rgba(123,75,160,0.3)',
              background:'transparent', color:'#7B4BA0',
              cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
              transition:'all 0.25s ease', flexShrink:0,
            }}
            onMouseEnter={e => { const b = e.currentTarget; b.style.background='#7B4BA0'; b.style.borderColor='#7B4BA0'; b.style.color='#fff'; }}
            onMouseLeave={e => { const b = e.currentTarget; b.style.background='transparent'; b.style.borderColor='rgba(123,75,160,0.3)'; b.style.color='#7B4BA0'; }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Dot indicators */}
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            {reviews.map((_, i) => (
              <button key={i} onClick={() => goTo(i)} aria-label={`Review ${i + 1}`}
                style={{
                  position:'relative',
                  width: i === current ? '30px' : '8px',
                  height:'8px', borderRadius:'4px',
                  border:'none', padding:0, cursor:'pointer',
                  background:'rgba(123,75,160,0.18)',
                  overflow:'hidden',
                  transition:'width 0.4s cubic-bezier(0.25,0.1,0.25,1)',
                }}>
                <span style={{
                  position:'absolute', top:0, left:0, height:'100%',
                  width: i === current ? `${progress}%` : '0%',
                  background:'#7B4BA0', borderRadius:'4px',
                  transition: i === current ? 'none' : 'width 0.3s ease',
                }} />
              </button>
            ))}
          </div>

          {/* Next */}
          <button onClick={next} aria-label="Next"
            style={{
              width:'46px', height:'46px', borderRadius:'50%',
              border:'1.5px solid rgba(123,75,160,0.3)',
              background:'transparent', color:'#7B4BA0',
              cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center',
              transition:'all 0.25s ease', flexShrink:0,
            }}
            onMouseEnter={e => { const b = e.currentTarget; b.style.background='#7B4BA0'; b.style.borderColor='#7B4BA0'; b.style.color='#fff'; }}
            onMouseLeave={e => { const b = e.currentTarget; b.style.background='transparent'; b.style.borderColor='rgba(123,75,160,0.3)'; b.style.color='#7B4BA0'; }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        {/* Counter */}
        <p style={{
          textAlign:'center', marginTop:'16px',
          fontFamily:"'Crimson Text', Georgia, serif",
          fontSize:'13px', color:'#bbb',
          letterSpacing:'2.5px', fontStyle:'italic',
        }}>
          {String(current + 1).padStart(2, '0')} — {String(total).padStart(2, '0')}
        </p>
      </div>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      
    </section>
  );
};

export default ReviewSection;