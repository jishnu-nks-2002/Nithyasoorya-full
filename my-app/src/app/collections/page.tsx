'use client';

import { useState, useEffect, useRef } from 'react';
import { Cormorant_Garamond, Jost } from 'next/font/google';

import CustomCursor from '@/component/Customcursor';
import ElegantNavbar from '@/component/ElegantNavbar';
import FlowingMenu from '@/component/Flowingmenu';
import ProductBreadcrumb from '@/component/ProductBreadcrumb';
import ReviewSection from '@/component/Reviewsection';
import Footer from '@/component/Footer';

const cormorant = Cormorant_Garamond({ weight: ['300', '400', '500', '600'], subsets: ['latin'], display: 'swap' });
const jost      = Jost({ weight: ['300', '400', '500', '600'], subsets: ['latin'], display: 'swap' });

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');

interface ProductImage { url: string; alt: string; isPrimary: boolean; }
interface Product {
  _id: string; name: string; slug: string; category: string;
  series: string; priceDisplay: string; price: number;
  isNew: boolean; isFeatured: boolean; availability: string;
  images: ProductImage[];
}
interface CategoryImage { url: string; alt: string; publicId: string; }
interface Category {
  _id: string; name: string; slug: string; brand: string;
  brandColor: string; subtitle: string; description: string;
  image: CategoryImage; order: number; isActive: boolean;
}

function groupByCategory(products: Product[], categoryOrder: Category[]): Record<string, Product[]> {
  const grouped = products.reduce((acc, p) => {
    const key = p.category || 'Uncategorized';
    if (!acc[key]) acc[key] = [];
    acc[key].push(p);
    return acc;
  }, {} as Record<string, Product[]>);

  if (categoryOrder.length === 0) return grouped;
  const ordered: Record<string, Product[]> = {};
  categoryOrder.forEach((c) => { if (grouped[c.name]) ordered[c.name] = grouped[c.name]; });
  Object.keys(grouped).forEach((k) => { if (!ordered[k]) ordered[k] = grouped[k]; });
  return ordered;
}

const PALETTE = ['#7c5cbf', '#c084fc', '#9b4dca', '#6344a8', '#a78bda', '#7b2fbf'];

export default function CollectionsPage() {
  const [products,   setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [status,     setStatus]     = useState<'loading' | 'ok' | 'error'>('loading');
  const [errorMsg,   setErrorMsg]   = useState('');
  const [filter,     setFilter]     = useState<string>('All');
  const [hovCard,    setHovCard]    = useState<string | null>(null);
  const hasFetched = useRef(false);

  useEffect(() => {
    // Guard against double-invoke in React 18 strict mode
    if (hasFetched.current) return;
    hasFetched.current = true;

    async function load() {
      try {
        const [prodRes, catRes] = await Promise.all([
          fetch(`${API_BASE}/api/products`, { cache: 'no-store' }),
          fetch(`${API_BASE}/api/categories`, { cache: 'no-store' }),
        ]);

        const prodText = await prodRes.text();
        const catText  = await catRes.text();

        let prodData: any = {};
        let catData: any  = {};

        try { prodData = JSON.parse(prodText); } catch { throw new Error('Invalid JSON from /api/products'); }
        try { catData  = JSON.parse(catText);  } catch { throw new Error('Invalid JSON from /api/categories'); }

        setProducts(Array.isArray(prodData.data) ? prodData.data : []);
        setCategories(Array.isArray(catData.data) ? catData.data : []);
        setStatus('ok');
      } catch (e: any) {
        console.error('[Collections] fetch failed:', e);
        setErrorMsg(e.message || 'Unknown error');
        setStatus('error');
      }
    }

    load();
  }, []);

  const grouped     = groupByCategory(products, categories);
  const allCatNames = ['All', ...Object.keys(grouped)];
  const displayed   = filter === 'All' ? grouped : { [filter]: grouped[filter] || [] };
  const catMap      = categories.reduce((acc, c) => { acc[c.name] = c; return acc; }, {} as Record<string, Category>);
  const accentFor   = (name: string, idx: number) => catMap[name]?.brandColor || PALETTE[idx % PALETTE.length];

  return (
    <>
      <CustomCursor />
      <ElegantNavbar />
      <FlowingMenu />
      <ProductBreadcrumb items={[{ label: 'Home', href: '/' }]} productName="Collections" />

      <div style={{ minHeight: '100vh', background: '#faf8f5', paddingTop: 90 }}>

        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '60px 24px 40px', borderBottom: '1px solid rgba(107,63,160,0.08)' }}>
          <p className={jost.className} style={{ fontSize: 9, letterSpacing: '0.35em', textTransform: 'uppercase', color: '#9b6fe0', marginBottom: 14 }}>
            Curated with Intention
          </p>
          <h1 className={cormorant.className} style={{ fontSize: 'clamp(36px, 6vw, 64px)', fontWeight: 400, color: '#1a1030', margin: '0 0 16px', lineHeight: 1.1 }}>
            Our Collections
          </h1>
          <p className={jost.className} style={{ fontSize: 13, fontWeight: 300, color: '#7a6a96', maxWidth: 480, margin: '0 auto', lineHeight: 1.8 }}>
            Each piece is handcrafted with sacred stones, carrying the energy of the earth into your everyday.
          </p>
        </div>

        {/* Loading */}
        {status === 'loading' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320 }}>
            <p className={cormorant.className} style={{ fontSize: 22, fontStyle: 'italic', color: '#9b82c4' }}>Loading collections…</p>
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div style={{ textAlign: 'center', padding: '60px 24px' }}>
            <p className={cormorant.className} style={{ fontSize: 20, fontStyle: 'italic', color: '#c084a0', marginBottom: 8 }}>
              Could not load collections
            </p>
            <p className={jost.className} style={{ fontSize: 11, color: '#b0a0cc', marginBottom: 20 }}>
              {errorMsg} — is the API running at <code>{API_BASE}</code>?
            </p>
            <button onClick={() => { hasFetched.current = false; setStatus('loading'); window.location.reload(); }}
              className={jost.className}
              style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9b6fe0', background: 'none', border: '1px solid #9b6fe0', borderRadius: 20, padding: '6px 20px', cursor: 'pointer' }}>
              Retry
            </button>
          </div>
        )}

        {/* Filter pills */}
        {status === 'ok' && allCatNames.length > 1 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', padding: '28px 24px 0' }}>
            {allCatNames.map((cat, i) => {
              const active = filter === cat;
              const color  = cat === 'All' ? '#7c5cbf' : accentFor(cat, i - 1);
              return (
                <button key={cat} onClick={() => setFilter(cat)} className={jost.className} style={{
                  fontSize: 9.5, fontWeight: active ? 500 : 300, letterSpacing: '0.18em',
                  textTransform: 'uppercase', padding: '7px 18px', borderRadius: 20, cursor: 'pointer',
                  border: `1px solid ${active ? color : 'rgba(107,63,160,0.2)'}`,
                  background: active ? `${color}18` : 'transparent',
                  color: active ? color : '#9a8cb5', transition: 'all 0.2s ease',
                }}>
                  {cat}
                </button>
              );
            })}
          </div>
        )}

        {/* Content */}
        {status === 'ok' && (
          <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 24px 80px' }}>

            {Object.values(displayed).every(arr => arr.length === 0) ? (
              <div style={{ textAlign: 'center', padding: '80px 24px' }}>
                <p className={cormorant.className} style={{ fontSize: 24, fontStyle: 'italic', color: '#9b82c4' }}>No products found.</p>
              </div>
            ) : (
              Object.entries(displayed).map(([category, items], catIdx) => {
                const accent  = accentFor(category, catIdx);
                const catDoc  = catMap[category];
                const catImg  = catDoc?.image?.url  || '';
                const catDesc = catDoc?.description || '';

                return (
                  <div key={category} style={{ marginBottom: 80 }}>

                    {/* Banner image */}
                    {catImg ? (
                      <>
                        <div style={{ position: 'relative', width: '100%', borderRadius: 16, overflow: 'hidden', marginBottom: 20, aspectRatio: '16/5', background: '#f0edf6' }}>
                          <img src={catImg} alt={catDoc?.image?.alt || category}
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(15,8,40,0.65) 0%, rgba(15,8,40,0.15) 60%, transparent 100%)' }} />
                          <div style={{ position: 'absolute', left: 36, bottom: 28, right: '40%' }}>
                            <h2 className={cormorant.className} style={{ fontSize: 'clamp(26px, 3.5vw, 44px)', fontWeight: 400, color: '#fff', margin: '0 0 8px', lineHeight: 1.1, textShadow: '0 2px 12px rgba(0,0,0,0.3)' }}>
                              {category}
                            </h2>
                            {catDesc && (
                              <p className={jost.className} style={{ fontSize: 13, fontWeight: 300, color: 'rgba(255,255,255,0.82)', margin: 0, lineHeight: 1.7, maxWidth: 420 }}>
                                {catDesc}
                              </p>
                            )}
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                          <p className={jost.className} style={{ fontSize: 10, fontWeight: 300, color: '#9a8cb5', margin: 0, letterSpacing: '0.12em' }}>
                            {items.length} {items.length === 1 ? 'piece' : 'pieces'}
                          </p>
                          <a href={`/collections/${encodeURIComponent(category)}`} className={jost.className}
                            style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: accent, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, opacity: 0.85, transition: 'opacity 0.2s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}>
                            View All
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                            </svg>
                          </a>
                        </div>
                      </>
                    ) : (
                      <div style={{ marginBottom: 28 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 16, borderBottom: `1px solid ${accent}22` }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ display: 'block', width: 4, height: 28, borderRadius: 2, background: accent, flexShrink: 0 }} />
                            <div>
                              <h2 className={cormorant.className} style={{ fontSize: 'clamp(22px, 3vw, 32px)', fontWeight: 400, color: '#1a1030', margin: 0, lineHeight: 1 }}>
                                {category}
                              </h2>
                              <p className={jost.className} style={{ fontSize: 10, fontWeight: 300, color: '#9a8cb5', margin: '4px 0 0', letterSpacing: '0.12em' }}>
                                {items.length} {items.length === 1 ? 'piece' : 'pieces'}
                              </p>
                            </div>
                          </div>
                          <a href={`/collections/${encodeURIComponent(category)}`} className={jost.className}
                            style={{ fontSize: 9, fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: accent, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6, opacity: 0.85, transition: 'opacity 0.2s' }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}>
                            View All
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                            </svg>
                          </a>
                        </div>
                        {catDesc && (
                          <p className={jost.className} style={{ fontSize: 13, fontWeight: 300, color: '#7a6a96', margin: '14px 0 0', lineHeight: 1.8, maxWidth: 620 }}>
                            {catDesc}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Product grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
                      {items.map(product => {
                        const imgUrl = product.images?.find(i => i.isPrimary)?.url || product.images?.[0]?.url || '/images/placeholder.jpeg';
                        const isHov  = hovCard === product._id;
                        return (
                          <a key={product._id} href={`/product/${product.slug}`} style={{ textDecoration: 'none' }}
                            onMouseEnter={() => setHovCard(product._id)}
                            onMouseLeave={() => setHovCard(null)}>
                            <div style={{
                              borderRadius: 12, overflow: 'hidden', background: '#fff',
                              border: `1px solid ${isHov ? accent + '44' : 'rgba(107,63,160,0.08)'}`,
                              boxShadow: isHov ? `0 12px 40px ${accent}22` : '0 2px 12px rgba(107,63,160,0.06)',
                              transition: 'all 0.28s cubic-bezier(0.4,0,0.2,1)',
                              transform: isHov ? 'translateY(-4px)' : 'translateY(0)',
                            }}>
                              <div style={{ position: 'relative', paddingTop: '100%', overflow: 'hidden', background: '#f5f3f8' }}>
                                <img src={imgUrl} alt={product.name} style={{
                                  position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                                  filter: `saturate(0.88) brightness(${isHov ? 0.95 : 0.88})`,
                                  transform: isHov ? 'scale(1.04)' : 'scale(1)',
                                  transition: 'transform 0.4s ease, filter 0.3s ease',
                                }} />
                                {product.isNew && (
                                  <span className={jost.className} style={{ position: 'absolute', top: 12, left: 12, fontSize: 8, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase', background: accent, color: '#fff', padding: '3px 10px', borderRadius: 20 }}>New</span>
                                )}
                                {product.availability === 'Sold Out' && (
                                  <div style={{ position: 'absolute', inset: 0, background: 'rgba(10,6,24,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <span className={jost.className} style={{ fontSize: 10, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#fff' }}>Sold Out</span>
                                  </div>
                                )}
                              </div>
                              <div style={{ padding: '16px 18px 18px' }}>
                                <p className={jost.className} style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: accent, marginBottom: 5 }}>
                                  {product.series}
                                </p>
                                <h3 className={cormorant.className} style={{ fontSize: 20, fontWeight: 400, color: '#1a1030', margin: '0 0 10px', lineHeight: 1.2 }}>
                                  {product.name}
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <span className={jost.className} style={{ fontSize: 13, fontWeight: 500, color: '#1a1030' }}>
                                    {product.priceDisplay || `₹${product.price}`}
                                  </span>
                                  <span className={jost.className} style={{ fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#b0a0cc' }}>
                                    {product.availability}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      <ReviewSection />
      <Footer />
    </>
  );
}