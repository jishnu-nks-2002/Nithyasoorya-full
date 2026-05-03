'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Cormorant_Garamond, Jost } from 'next/font/google';

const cormorant = Cormorant_Garamond({ weight: ['300','400','500','600'], subsets: ['latin'], display: 'swap' });
const jost      = Jost({ weight: ['300','400','500','600'], subsets: ['latin'], display: 'swap' });

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

interface ProductImage { url: string; alt: string; isPrimary: boolean; }
interface Product {
  _id: string; name: string; slug: string; category: string;
  series: string; priceDisplay: string; price: number;
  isNew: boolean; isFeatured: boolean; availability: string;
  images: ProductImage[];
}

const ACCENTS = ['#7c5cbf','#c084fc','#9b4dca','#6344a8','#a78bda','#7b2fbf'];

export default function CategoryPage() {
  const params   = useParams();
  const category = decodeURIComponent((params?.category as string) || '');

  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [sort,     setSort]     = useState<'default'|'price-asc'|'price-desc'|'new'>('default');
  const [hovCard,  setHovCard]  = useState<string|null>(null);

  useEffect(() => {
    if (!category) return;
    (async () => {
      setLoading(true);
      try {
        const res  = await fetch(`${API_BASE}/api/products?category=${encodeURIComponent(category)}`);
        const data = await res.json();
        if (data.success) setProducts(data.data || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [category]);

  const sorted = [...products].sort((a, b) => {
    if (sort === 'price-asc')  return a.price - b.price;
    if (sort === 'price-desc') return b.price - a.price;
    if (sort === 'new')        return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    return 0;
  });

  const accent = ACCENTS[0];

  return (
    <div style={{ minHeight: '100vh', background: '#faf8f5', paddingTop: 90 }}>
      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '52px 24px 36px', borderBottom: '1px solid rgba(107,63,160,0.08)' }}>
        <a href="/collections" className={jost.className} style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 18,
          fontSize: 9, letterSpacing: '0.26em', textTransform: 'uppercase',
          color: '#9b6fe0', textDecoration: 'none', opacity: 0.75,
          transition: 'opacity 0.2s',
        }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '0.75'; }}
        >
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
          </svg>
          All Collections
        </a>
        <h1 className={cormorant.className} style={{ fontSize: 'clamp(32px, 5vw, 56px)', fontWeight: 400, color: '#1a1030', margin: '0 0 12px', lineHeight: 1.1 }}>
          {category}
        </h1>
        {!loading && (
          <p className={jost.className} style={{ fontSize: 12, fontWeight: 300, color: '#9a8cb5', letterSpacing: '0.12em' }}>
            {products.length} {products.length === 1 ? 'piece' : 'pieces'}
          </p>
        )}
      </div>

      {/* Sort bar */}
      {!loading && products.length > 1 && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '20px 40px 0', maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className={jost.className} style={{ fontSize: 9, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#b0a0cc' }}>Sort</span>
            {(['default','price-asc','price-desc','new'] as const).map(opt => {
              const labels = { default: 'Featured', 'price-asc': 'Price ↑', 'price-desc': 'Price ↓', new: 'New First' };
              const active = sort === opt;
              return (
                <button key={opt} onClick={() => setSort(opt)} className={jost.className} style={{
                  fontSize: 9, fontWeight: active ? 500 : 300, letterSpacing: '0.16em',
                  padding: '5px 14px', borderRadius: 20, cursor: 'pointer',
                  border: `1px solid ${active ? accent : 'rgba(107,63,160,0.18)'}`,
                  background: active ? `${accent}14` : 'transparent',
                  color: active ? accent : '#9a8cb5', transition: 'all 0.18s ease',
                }}>
                  {labels[opt]}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 320 }}>
          <p className={cormorant.className} style={{ fontSize: 22, fontStyle: 'italic', color: '#9b82c4' }}>Loading…</p>
        </div>
      )}

      {/* Grid */}
      {!loading && (
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '36px 24px 80px' }}>
          {sorted.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '80px 24px' }}>
              <p className={cormorant.className} style={{ fontSize: 24, fontStyle: 'italic', color: '#9b82c4' }}>No products in this collection yet.</p>
              <a href="/collections" className={jost.className} style={{ fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: accent, textDecoration: 'none', marginTop: 16, display: 'inline-block' }}>
                ← Back to Collections
              </a>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 24 }}>
              {sorted.map(product => {
                const imgUrl = product.images?.find(i => i.isPrimary)?.url || product.images?.[0]?.url || '/images/placeholder.jpeg';
                const isHov  = hovCard === product._id;
                return (
                  <a key={product._id} href={`/product/${product.slug}`} style={{ textDecoration: 'none' }}
                    onMouseEnter={() => setHovCard(product._id)}
                    onMouseLeave={() => setHovCard(null)}
                  >
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
                          <span className={jost.className} style={{
                            position: 'absolute', top: 12, left: 12,
                            fontSize: 8, fontWeight: 600, letterSpacing: '0.2em', textTransform: 'uppercase',
                            background: accent, color: '#fff', padding: '3px 10px', borderRadius: 20,
                          }}>New</span>
                        )}
                        {product.availability === 'Sold Out' && (
                          <div style={{
                            position: 'absolute', inset: 0, background: 'rgba(10,6,24,0.45)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}>
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
          )}
        </div>
      )}
    </div>
  );
}