'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Cormorant_Garamond, Jost } from 'next/font/google';

import CustomCursor from '@/component/Customcursor';
import ElegantNavbar from '@/component/ElegantNavbar';
import FlowingMenu from '@/component/Flowingmenu';
import ProductBreadcrumb from '@/component/ProductBreadcrumb';
import ReviewSection from '@/component/Reviewsection';
import Footer from '@/component/Footer';
import MasonryGallery  from '@/component/Masonrygallery'
import RelatedProducts from '@/component/Relatedproducts';

const cormorant = Cormorant_Garamond({ weight: ['300', '400', '500', '600'], subsets: ['latin'], display: 'swap' });
const jost      = Jost({ weight: ['300', '400', '500', '600'], subsets: ['latin'], display: 'swap' });

const API_BASE        = process.env.NEXT_PUBLIC_API_URL        || 'http://localhost:5000';
const WHATSAPP_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '919876543210'; // ← change this

const ACCENT = '#7c5cbf';

interface ProductImage { url: string; alt: string; isPrimary: boolean; _id: string; }
interface Product {
  _id: string; name: string; slug: string; category: string;
  series: string; priceDisplay: string; price: number;
  description: string; material: string; edition: string;
  dimensions: string; weight: string; beadSize: string; wristSize: string;
  stoneTypes: string[]; tags: string[];
  careInstructions: string; shippingInfo: string;
  isNew: boolean; isFeatured: boolean; availability: string;
  images: ProductImage[];
}

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '10px 14px', borderRadius: 10,
  border: '1px solid rgba(107,63,160,0.2)', background: '#fff',
  fontSize: 13, color: '#1a1030', outline: 'none',
  fontFamily: 'inherit', boxSizing: 'border-box',
};

// ── Enquiry Modal ─────────────────────────────────────────────────────────────
function EnquiryModal({ product, onClose }: { product: Product; onClose: () => void }) {
  const [form,    setForm]    = useState({ name: '', email: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent,    setSent]    = useState(false);
  const [error,   setError]   = useState('');

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim())  { setError('Please enter your name.');  return; }
    if (!form.email.trim()) { setError('Please enter your email.'); return; }
    setError('');
    setSending(true);
    try {
      const res  = await fetch(`${API_BASE}/api/enquiries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId:       product._id,
          productName:     product.name,
          productSlug:     product.slug,
          productCategory: product.category,
          productPrice:    product.priceDisplay || `₹${product.price}`,
          ...form,
        }),
      });
      const data = await res.json();
      if (data.success) setSent(true);
      else setError(data.message || 'Something went wrong. Please try again.');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: 'fixed', inset: 0, zIndex: 9000,
        background: 'rgba(10,6,24,0.6)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div style={{
        background: '#faf8f5', borderRadius: 20, width: '100%', maxWidth: 480,
        padding: '36px 32px', position: 'relative',
        boxShadow: '0 32px 80px rgba(50,15,100,0.25)',
        maxHeight: '90vh', overflowY: 'auto',
      }}>
        {/* Close button */}
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16,
          background: 'none', border: 'none', cursor: 'pointer',
          width: 32, height: 32, borderRadius: '50%', fontSize: 18, color: '#9a8cb5',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = '#f0edf6'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
        >✕</button>

        {sent ? (
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%', background: '#e8f5e9',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 20px', fontSize: 26,
            }}>✓</div>
            <h2 className={cormorant.className} style={{ fontSize: 26, fontWeight: 400, color: '#1a1030', marginBottom: 10 }}>
              Enquiry Sent!
            </h2>
            <p className={jost.className} style={{ fontSize: 12, fontWeight: 300, color: '#7a6a96', lineHeight: 1.7, marginBottom: 24 }}>
              Thank you for your interest in <strong>{product.name}</strong>. We'll get back to you within 24 hours.
            </p>
            <button onClick={onClose} className={jost.className} style={{
              background: ACCENT, color: '#fff', border: 'none', borderRadius: 50,
              padding: '10px 28px', fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase',
              cursor: 'pointer', fontWeight: 500,
            }}>Close</button>
          </div>
        ) : (
          <>
            <p className={jost.className} style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: ACCENT, marginBottom: 6 }}>
              {product.category}
            </p>
            <h2 className={cormorant.className} style={{ fontSize: 'clamp(20px,3vw,28px)', fontWeight: 400, color: '#1a1030', marginBottom: 4 }}>
              Enquire About This Piece
            </h2>
            <p className={jost.className} style={{ fontSize: 11, fontWeight: 300, color: '#7a6a96', marginBottom: 24, lineHeight: 1.6 }}>
              {product.name} — {product.priceDisplay || `₹${product.price}`}
            </p>

            {error && (
              <div style={{
                background: '#fce4e4', border: '1px solid #f5c6c6', borderRadius: 8,
                padding: '10px 14px', marginBottom: 18, fontSize: 12, color: '#c62828',
              }} className={jost.className}>{error}</div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label className={jost.className} style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9a8cb5', display: 'block', marginBottom: 5 }}>Your Name *</label>
                <input value={form.name} onChange={set('name')} required placeholder="Priya Sharma" style={inputStyle} />
              </div>
              <div>
                <label className={jost.className} style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9a8cb5', display: 'block', marginBottom: 5 }}>Email Address *</label>
                <input type="email" value={form.email} onChange={set('email')} required placeholder="priya@example.com" style={inputStyle} />
              </div>
              <div>
                <label className={jost.className} style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9a8cb5', display: 'block', marginBottom: 5 }}>Phone (optional)</label>
                <input type="tel" value={form.phone} onChange={set('phone')} placeholder="+91 98765 43210" style={inputStyle} />
              </div>
              <div>
                <label className={jost.className} style={{ fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#9a8cb5', display: 'block', marginBottom: 5 }}>Message (optional)</label>
                <textarea value={form.message} onChange={set('message')} rows={3} placeholder="I'd love to know more about this piece…" style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }} />
              </div>
              <button type="submit" disabled={sending} className={jost.className} style={{
                background: sending ? '#b0a0cc' : ACCENT, color: '#fff', border: 'none', borderRadius: 50,
                padding: '13px 0', fontSize: 10, letterSpacing: '0.22em', textTransform: 'uppercase',
                fontWeight: 500, cursor: sending ? 'not-allowed' : 'pointer', width: '100%',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              }}>
                {sending && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 0.7s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" strokeOpacity=".25" /><path d="M12 2a10 10 0 0 1 10 10" />
                    <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
                  </svg>
                )}
                {sending ? 'Sending…' : 'Send Enquiry'}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function ProductPage() {
  const params = useParams();
  const slug   = params?.slug as string;

  const [product,     setProduct]     = useState<Product | null>(null);
  const [loading,     setLoading]     = useState(true);
  const [activeImg,   setActiveImg]   = useState(0);
  const [notFound,    setNotFound]    = useState(false);
  const [showEnquiry, setShowEnquiry] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const res  = await fetch(`${API_BASE}/api/products/slug/${slug}`);
        const data = await res.json();
        if (data.success) setProduct(data.data);
        else setNotFound(true);
      } catch { setNotFound(true); }
      finally { setLoading(false); }
    })();
  }, [slug]);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: 'Collections', href: '/collections' },
    ...(product ? [{ label: product.category, href: `/collections/${encodeURIComponent(product.category)}` }] : []),
  ];

  const buildWhatsAppUrl = (p: Product) => {
    const msg = encodeURIComponent(
      `Hi! I'm interested in *${p.name}* (${p.priceDisplay || `₹${p.price}`}) from your collection.\n\nLink: ${typeof window !== 'undefined' ? window.location.href : ''}`
    );
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
  };

  return (
    <>
      <CustomCursor />
      <ElegantNavbar />
      <FlowingMenu />

      {!loading && product && <ProductBreadcrumb items={breadcrumbItems} productName={product.name} />}
      {showEnquiry && product && <EnquiryModal product={product} onClose={() => setShowEnquiry(false)} />}

      <div style={{ minHeight: '100vh', background: '#faf8f5', paddingTop: 90 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px 80px' }}>

          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh' }}>
              <p className={cormorant.className} style={{ fontSize: 22, fontStyle: 'italic', color: '#9b82c4' }}>Loading…</p>
            </div>
          )}

          {!loading && (notFound || !product) && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 16 }}>
              <p className={cormorant.className} style={{ fontSize: 28, fontStyle: 'italic', color: '#9b82c4' }}>Product not found.</p>
              <a href="/collections" className={jost.className} style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: ACCENT, textDecoration: 'none' }}>
                ← Back to Collections
              </a>
            </div>
          )}

          {!loading && product && (() => {
            const images  = product.images || [];
            const mainImg = images[activeImg]?.url || '/images/placeholder.jpeg';
            return (
              <>
                <a href={`/collections/${encodeURIComponent(product.category)}`} className={jost.className}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 32, fontSize: 9, letterSpacing: '0.24em', textTransform: 'uppercase', color: ACCENT, textDecoration: 'none', opacity: 0.75 }}>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
                  </svg>
                  {product.category}
                </a>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 56, alignItems: 'start' }}>

                  {/* Images */}
                  <div>
                    <div style={{ borderRadius: 16, overflow: 'hidden', background: '#f0edf6', aspectRatio: '1/1', marginBottom: 12 }}>
                      <img src={mainImg} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    {images.length > 1 && (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {images.map((img, i) => (
                          <div key={img._id} onClick={() => setActiveImg(i)} style={{
                            width: 64, height: 64, borderRadius: 8, overflow: 'hidden', cursor: 'pointer',
                            border: `2px solid ${activeImg === i ? ACCENT : 'transparent'}`,
                            opacity: activeImg === i ? 1 : 0.6, transition: 'all 0.2s',
                          }}>
                            <img src={img.url} alt={img.alt} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div>
                    {product.series && (
                      <p className={jost.className} style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: ACCENT, marginBottom: 8 }}>{product.series}</p>
                    )}
                    <h1 className={cormorant.className} style={{ fontSize: 'clamp(28px,4vw,44px)', fontWeight: 400, color: '#1a1030', margin: '0 0 8px', lineHeight: 1.1 }}>
                      {product.name}
                    </h1>
                    {product.edition && (
                      <p className={jost.className} style={{ fontSize: 10, color: '#9a8cb5', marginBottom: 12, letterSpacing: '0.1em' }}>{product.edition}</p>
                    )}

                    {/* Price + availability */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '20px 0 24px' }}>
                      <span className={jost.className} style={{ fontSize: 26, fontWeight: 500, color: '#1a1030' }}>
                        {product.priceDisplay || `₹${product.price}`}
                      </span>
                      <span className={jost.className} style={{
                        fontSize: 9, letterSpacing: '0.18em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 20,
                        background: product.availability === 'Available' ? '#e8f5e9' : product.availability === 'Sold Out' ? '#fce4e4' : '#fff8e1',
                        color:      product.availability === 'Available' ? '#2e7d32' : product.availability === 'Sold Out' ? '#c62828' : '#f57f17',
                      }}>{product.availability}</span>
                    </div>

                    {product.description && (
                      <p className={jost.className} style={{ fontSize: 13, fontWeight: 300, color: '#5a4a72', lineHeight: 1.8, marginBottom: 24 }}>
                        {product.description}
                      </p>
                    )}

                    {/* ── ACTION BUTTONS ── */}
                    <div style={{ display: 'flex', gap: 12, marginBottom: 28 }}>
                      {/* Enquiry */}
                      <button onClick={() => setShowEnquiry(true)} className={jost.className} style={{
                        flex: 1, padding: '13px 16px', borderRadius: 50,
                        background: ACCENT, color: '#fff', border: 'none', cursor: 'pointer',
                        fontSize: 10, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase',
                        boxShadow: `0 4px 18px ${ACCENT}44`, transition: 'all 0.22s ease',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                      }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#6344a8'; el.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = ACCENT; el.style.transform = 'translateY(0)'; }}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
                        </svg>
                        Enquire Now
                      </button>

                      {/* WhatsApp */}
                      <a href={buildWhatsAppUrl(product)} target="_blank" rel="noopener noreferrer" className={jost.className} style={{
                        flex: 1, padding: '13px 16px', borderRadius: 50,
                        background: '#25D366', color: '#fff', border: 'none', cursor: 'pointer',
                        fontSize: 10, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase',
                        boxShadow: '0 4px 18px rgba(37,211,102,0.35)', transition: 'all 0.22s ease',
                        textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7,
                      }}
                        onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#1da851'; el.style.transform = 'translateY(-1px)'; }}
                        onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = '#25D366'; el.style.transform = 'translateY(0)'; }}
                      >
                        <svg width="15" height="15" viewBox="0 0 32 32" fill="currentColor">
                          <path d="M16 0C7.164 0 0 7.163 0 16c0 2.822.737 5.469 2.027 7.773L0 32l8.469-2.004A15.943 15.943 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm0 29.333a13.27 13.27 0 01-6.771-1.854l-.485-.289-5.029 1.189 1.213-4.893-.317-.502A13.259 13.259 0 012.667 16C2.667 8.636 8.636 2.667 16 2.667S29.333 8.636 29.333 16 23.364 29.333 16 29.333zm7.27-9.956c-.398-.199-2.355-1.162-2.72-1.295-.365-.133-.631-.199-.897.199-.266.398-1.03 1.295-1.263 1.561-.233.266-.465.299-.863.1-.398-.2-1.68-.619-3.2-1.976-1.183-1.056-1.981-2.36-2.214-2.758-.233-.398-.025-.613.175-.811.18-.179.398-.465.597-.698.199-.233.266-.398.398-.664.133-.266.066-.498-.033-.697-.1-.2-.897-2.162-1.229-2.96-.324-.777-.652-.672-.897-.684l-.764-.013c-.266 0-.697.1-.1063.498-.365.398-1.396 1.362-1.396 3.322 0 1.961 1.429 3.854 1.628 4.12.2.265 2.812 4.295 6.814 6.025.953.411 1.696.657 2.275.841.956.304 1.826.261 2.514.158.767-.114 2.355-.963 2.687-1.894.333-.931.333-1.729.233-1.895-.099-.165-.365-.265-.763-.464z"/>
                        </svg>
                        WhatsApp
                      </a>
                    </div>

                    {/* Specs */}
                    {(product.material || product.dimensions || product.weight || product.beadSize || product.wristSize) && (
                      <div style={{ borderTop: '1px solid rgba(107,63,160,0.1)', paddingTop: 20, marginBottom: 20 }}>
                        <p className={jost.className} style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#b0a0cc', marginBottom: 12 }}>Details</p>
                        {[
                          ['Material', product.material], ['Dimensions', product.dimensions],
                          ['Weight', product.weight], ['Bead size', product.beadSize], ['Wrist size', product.wristSize],
                        ].filter(([, v]) => v).map(([label, value]) => (
                          <div key={label} style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
                            <span className={jost.className} style={{ fontSize: 11, color: '#9a8cb5', minWidth: 90 }}>{label}</span>
                            <span className={jost.className} style={{ fontSize: 11, color: '#1a1030' }}>{value}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Stones */}
                    {product.stoneTypes?.length > 0 && (
                      <div style={{ marginBottom: 20 }}>
                        <p className={jost.className} style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#b0a0cc', marginBottom: 10 }}>Stones & Crystals</p>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          {product.stoneTypes.map(s => (
                            <span key={s} className={jost.className} style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', padding: '4px 12px', borderRadius: 20, border: `1px solid ${ACCENT}44`, color: ACCENT, background: `${ACCENT}0a` }}>{s}</span>
                          ))}
                        </div>
                      </div>
                    )}

                    {product.careInstructions && (
                      <div style={{ borderTop: '1px solid rgba(107,63,160,0.1)', paddingTop: 20, marginBottom: 16 }}>
                        <p className={jost.className} style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#b0a0cc', marginBottom: 8 }}>Care</p>
                        <p className={jost.className} style={{ fontSize: 12, fontWeight: 300, color: '#5a4a72', lineHeight: 1.7 }}>{product.careInstructions}</p>
                      </div>
                    )}

                    {product.shippingInfo && (
                      <div style={{ borderTop: '1px solid rgba(107,63,160,0.1)', paddingTop: 16 }}>
                        <p className={jost.className} style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#b0a0cc', marginBottom: 8 }}>Shipping</p>
                        <p className={jost.className} style={{ fontSize: 12, fontWeight: 300, color: '#5a4a72', lineHeight: 1.7 }}>{product.shippingInfo}</p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            );
          })()}
        </div>
      </div>
      <RelatedProducts/>
      <MasonryGallery />

      <ReviewSection />
      <Footer />
    </>
  );
}