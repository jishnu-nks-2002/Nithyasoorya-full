'use client';

import { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

const STONES = [
  'Obsidian','Black Tourmaline','Labradorite','Amethyst','Rose Quartz',
  'Smoky Quartz','Citrine','Lapis Lazuli','Malachite','Moonstone',
  "Tiger's Eye",'Onyx','Jasper','Selenite','Pyrite',
];

interface ProductImage { url: string; alt: string; isPrimary: boolean; }
interface Product {
  _id: string; name: string; slug: string; category: string;
  series: string; material: string; description: string;
  price: number; priceDisplay: string; availability: string; edition: string;
  isNew: boolean; isFeatured: boolean;
  dimensions: string; weight: string;
  stoneTypes: string[]; beadSize: string; wristSize: string;
  careInstructions: string; shippingInfo: string;
  images: ProductImage[];
}

interface RelatedProduct {
  _id: string; name: string; slug: string; series: string;
  priceDisplay: string; price: number;
  images: ProductImage[];
}

// ── Inquire Modal ──────────────────────────────────────────────────────────────
function InquireModal({ productName, stoneTypes, onClose }: { productName: string; stoneTypes: string[]; onClose: () => void }) {
  const [form, setForm]   = useState({ name:'', email:'', phone:'', stones:[] as string[], description:'' });
  const [stoneSearch, setStoneSearch] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState<string|null>(null);

  const allStones = stoneTypes.length > 0 ? stoneTypes : STONES;
  const filtered  = allStones.filter(s => s.toLowerCase().includes(stoneSearch.toLowerCase()));

  const toggleStone = (s: string) =>
    setForm(f => ({ ...f, stones: f.stones.includes(s) ? f.stones.filter(x => x !== s) : [...f.stones, s] }));

  return (
    <div style={{ position:'fixed', inset:0, zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(10,6,24,0.72)', backdropFilter:'blur(6px)' }} />
      <div style={{ position:'relative', zIndex:1, background:'#faf8f5', borderRadius:10, width:'100%', maxWidth:540, maxHeight:'90vh', overflowY:'auto', border:'1px solid rgba(107,63,160,0.15)', boxShadow:'0 32px 80px rgba(107,63,160,0.18)' }}>
        {submitted ? (
          <div style={{ padding:'64px 48px', textAlign:'center' }}>
            <div style={{ width:52, height:52, borderRadius:'50%', border:'1.5px solid rgba(107,63,160,0.3)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', background:'rgba(107,63,160,0.05)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b3fa0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h3 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:32, fontWeight:400, color:'#1a1030', marginBottom:12 }}>Enquiry Received</h3>
            <p style={{ fontFamily:"'Jost',sans-serif", fontSize:12.5, fontWeight:300, color:'#7a6a96', lineHeight:1.8, marginBottom:32 }}>
              Thank you, {form.name.split(' ')[0]}. We'll be in touch within 48 hours regarding <em>{productName}</em>.
            </p>
            <button onClick={onClose} style={{ fontFamily:"'Jost',sans-serif", fontSize:9, fontWeight:500, letterSpacing:'0.24em', textTransform:'uppercase', color:'#6b3fa0', background:'none', border:'1.5px solid rgba(107,63,160,0.3)', borderRadius:2, padding:'11px 28px', cursor:'pointer' }}>Close</button>
          </div>
        ) : (
          <>
            <div style={{ padding:'32px 40px 24px', borderBottom:'1px solid rgba(107,63,160,0.08)', display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <p style={{ fontFamily:"'Jost',sans-serif", fontSize:8.5, letterSpacing:'0.3em', textTransform:'uppercase', color:'#9b6fe0', marginBottom:6 }}>Acquisition Enquiry</p>
                <h2 style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:26, fontWeight:400, color:'#1a1030', lineHeight:1.1 }}>{productName}</h2>
              </div>
              <button onClick={onClose} style={{ width:30, height:30, borderRadius:'50%', border:'1px solid rgba(107,63,160,0.2)', background:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#b0a0cc' }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ padding:'28px 40px 36px', display:'flex', flexDirection:'column', gap:18 }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
                {(['name','email'] as const).map(key => (
                  <div key={key} style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    <label style={{ fontFamily:"'Jost',sans-serif", fontSize:8.5, letterSpacing:'0.26em', textTransform:'uppercase', color: focused===key ? '#6b3fa0' : '#b0a0cc' }}>{key === 'name' ? 'Full Name' : 'Email Address'}</label>
                    <input type={key==='email'?'email':'text'} value={form[key]} onFocus={()=>setFocused(key)} onBlur={()=>setFocused(null)} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} style={{ fontFamily:"'Jost',sans-serif", fontSize:12.5, fontWeight:300, color:'#1a1030', background:'#fff', border:`1px solid ${focused===key?'rgba(107,63,160,0.45)':'rgba(107,63,160,0.15)'}`, borderRadius:4, padding:'10px 14px', outline:'none' }} />
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                <label style={{ fontFamily:"'Jost',sans-serif", fontSize:8.5, letterSpacing:'0.26em', textTransform:'uppercase', color:'#b0a0cc' }}>Phone</label>
                <input type="tel" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} placeholder="+91 00000 00000" style={{ fontFamily:"'Jost',sans-serif", fontSize:12.5, fontWeight:300, color:'#1a1030', background:'#fff', border:'1px solid rgba(107,63,160,0.15)', borderRadius:4, padding:'10px 14px', outline:'none' }} />
              </div>
              {filtered.length > 0 && (
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  <label style={{ fontFamily:"'Jost',sans-serif", fontSize:8.5, letterSpacing:'0.26em', textTransform:'uppercase', color:'#b0a0cc' }}>Stones of Interest</label>
                  <input placeholder="Search stones…" value={stoneSearch} onChange={e=>setStoneSearch(e.target.value)} style={{ fontFamily:"'Jost',sans-serif", fontSize:11.5, fontWeight:300, color:'#1a1030', background:'#fff', border:'1px solid rgba(107,63,160,0.15)', borderRadius:4, padding:'8px 14px', outline:'none' }} />
                  <div style={{ display:'flex', flexWrap:'wrap', gap:7, maxHeight:100, overflowY:'auto' }}>
                    {filtered.map(s => {
                      const active = form.stones.includes(s);
                      return (
                        <button key={s} onClick={()=>toggleStone(s)} style={{ fontFamily:"'Jost',sans-serif", fontSize:9.5, fontWeight: active?500:300, letterSpacing:'0.1em', padding:'5px 13px', borderRadius:20, border:`1px solid ${active?'rgba(107,63,160,0.5)':'rgba(107,63,160,0.18)'}`, background: active?'rgba(107,63,160,0.1)':'#fff', color: active?'#6b3fa0':'#9a8cb5', cursor:'pointer' }}>
                          {active && <span style={{ marginRight:4, fontSize:8 }}>✦</span>}{s}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
              <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                <label style={{ fontFamily:"'Jost',sans-serif", fontSize:8.5, letterSpacing:'0.26em', textTransform:'uppercase', color:'#b0a0cc' }}>Message</label>
                <textarea rows={3} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Tell us about your interest or space…" style={{ fontFamily:"'Jost',sans-serif", fontSize:12.5, fontWeight:300, color:'#1a1030', background:'#fff', resize:'vertical', border:'1px solid rgba(107,63,160,0.15)', borderRadius:4, padding:'10px 14px', outline:'none', lineHeight:1.7 }} />
              </div>
              <div style={{ display:'flex', gap:10, justifyContent:'flex-end', paddingTop:4 }}>
                <button disabled={!form.name||!form.email} onClick={()=>{ if(form.name&&form.email) setSubmitted(true); }} style={{ fontFamily:"'Jost',sans-serif", fontSize:9, fontWeight:500, letterSpacing:'0.22em', textTransform:'uppercase', color:(!form.name||!form.email)?'#c0b0d8':'#6b3fa0', padding:'11px 28px', background:'none', border:`1.5px solid ${(!form.name||!form.email)?'rgba(107,63,160,0.12)':'rgba(107,63,160,0.35)'}`, borderRadius:2, cursor:(!form.name||!form.email)?'not-allowed':'pointer' }}>
                  Send Enquiry
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Dynamic Product Detail Page ──────────────────────────────────────────
export default function DynamicProductDetailPage({ slug }: { slug: string }) {
  const [product,  setProduct]  = useState<Product|null>(null);
  const [related,  setRelated]  = useState<RelatedProduct[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [tab,      setTab]      = useState('details');
  const [imgHov,   setImgHov]   = useState(false);
  const [showInquire, setShowInquire] = useState(false);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      try {
        const res  = await fetch(`${API_BASE}/api/products/slug/${slug}`);
        const data = await res.json();
        if (data.success) {
          setProduct(data.data);
          // fetch related (same category, exclude self)
          const rRes  = await fetch(`${API_BASE}/api/products?category=${data.data.category}`);
          const rData = await rRes.json();
          setRelated((rData.data || []).filter((p: RelatedProduct) => p._id !== data.data._id).slice(0, 3));
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [slug]);

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', fontFamily:"'Cormorant Garamond',serif", fontSize:22, fontStyle:'italic', color:'#9b82c4' }}>Loading…</div>
  );

  if (!product) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', fontFamily:"'Jost',sans-serif", color:'#9b82c4' }}>Product not found</div>
  );

  const imgs       = product.images || [];
  const activeImgUrl = imgs[activeImg]?.url || '/images/placeholder.jpeg';
  const display    = product.priceDisplay || `$${product.price}`;

  const specRows = [
    { label:'Material',   val: product.material },
    { label:'Dimensions', val: product.dimensions },
    { label:'Weight',     val: product.weight },
    { label:'Edition',    val: product.edition },
    ...(product.beadSize  ? [{ label:'Bead Size',   val: product.beadSize  }] : []),
    ...(product.wristSize ? [{ label:'Wrist Size',   val: product.wristSize }] : []),
  ].filter(r => r.val);

  return (
    <>
      {showInquire && <InquireModal productName={product.name} stoneTypes={product.stoneTypes} onClose={() => setShowInquire(false)} />}

      {/* Reuse the existing pd-root CSS classes from ProductDetailPage — they're injected globally in your layout */}
      <div className="pd-root">
        <div className="pd-product">

          {/* Gallery */}
          <div className="pd-gallery">
            <div className="pd-main-img" onMouseEnter={() => setImgHov(true)} onMouseLeave={() => setImgHov(false)}>
              <img src={activeImgUrl} alt={product.name} style={{ filter:`saturate(0.88) brightness(${imgHov?0.95:0.85})`, transform: imgHov?'scale(1.03)':'scale(1)' }} />
            </div>
            {imgs.length > 1 && (
              <div className="pd-thumbs">
                {imgs.map((img, i) => (
                  <div key={i} className={`pd-thumb${activeImg===i?' active':''}`} onClick={() => setActiveImg(i)}>
                    <img src={img.url} alt={img.alt} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="pd-info">
            <div className="pd-eyebrow">
              {product.isNew && <span className="pd-new-tag">New</span>}
              <span className="pd-series-tag">{product.series} · {product.category}</span>
              <div className="pd-eyebrow-line" />
            </div>

            <h1 className="pd-name">{product.name}<em>{product.series}</em></h1>

            <div className="pd-price-block">
              <span className="pd-price-label">Value</span>
              <div className="pd-price-row">
                <span className="pd-price">{display}</span>
                {product.edition && <span className="pd-edition">{product.edition}</span>}
                <span className="pd-avail">{product.availability}</span>
              </div>
            </div>

            {/* Tabs */}
            <div>
              <div className="pd-tabs">
                {['details','care','shipping'].map(t => (
                  <button key={t} className={`pd-tab${tab===t?' active':''}`} onClick={() => setTab(t)}>
                    {t.charAt(0).toUpperCase()+t.slice(1)}
                  </button>
                ))}
              </div>
              <div style={{ paddingTop:18 }}>
                <p className="pd-tab-content">
                  {tab==='details'  && (product.description || 'No description provided.')}
                  {tab==='care'     && (product.careInstructions || 'Care instructions not specified.')}
                  {tab==='shipping' && (product.shippingInfo || 'Shipping information not specified.')}
                </p>
              </div>
            </div>

            {/* Specs */}
            {specRows.length > 0 && (
              <div className="pd-specs">
                {specRows.map(sp => (
                  <div key={sp.label} className="pd-spec-row">
                    <span className="pd-spec-label">{sp.label}</span>
                    <span className="pd-spec-val">{sp.val}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Stone types (for stones/bracelets) */}
            {product.stoneTypes?.length > 0 && (
              <div style={{ display:'flex', flexWrap:'wrap', gap:7 }}>
                {product.stoneTypes.map(s => (
                  <span key={s} style={{ fontFamily:"'Jost',sans-serif", fontSize:9.5, padding:'4px 12px', borderRadius:20, border:'1px solid rgba(107,63,160,0.22)', color:'#6b3fa0', background:'rgba(107,63,160,0.06)' }}>{s}</span>
                ))}
              </div>
            )}

            {/* CTA */}
            <div className="pd-contact-cta">
              <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
                <button className="pd-contact-link" onClick={() => setShowInquire(true)} style={{ background:'none', cursor:'pointer' }}>
                  Get in Touch
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
                <a href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hello, I'm interested in "${product.name}".`)}`} target="_blank" rel="noopener noreferrer" className="pd-whatsapp-link">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.107 1.51 5.84L.057 23.454a.75.75 0 0 0 .918.943l5.78-1.516A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.696 9.696 0 0 1-4.953-1.357l-.355-.212-3.674.963.981-3.584-.232-.368A9.699 9.699 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/></svg>
                  WhatsApp
                </a>
              </div>
              <span className="pd-contact-sub">For acquisition enquiries, commissions, or viewing appointments.</span>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="pd-related">
            <div className="pd-rel-header">
              <h3 className="pd-rel-title">You May Also Like</h3>
              <a href={`/collections/${product.category}`} className="pd-rel-link">View All</a>
            </div>
            <div className="pd-rel-grid">
              {related.map(p => (
                <a key={p._id} href={`/product/${p.slug}`} className="pd-rel-card" style={{ textDecoration:'none' }}>
                  <div className="pd-rel-card-img">
                    <img src={p.images?.[0]?.url || '/images/placeholder.jpeg'} alt={p.name} />
                  </div>
                  <div className="pd-rel-card-info">
                    <div className="pd-rel-card-series">{p.series}</div>
                    <div className="pd-rel-card-name">{p.name}</div>
                    <div className="pd-rel-card-price">{p.priceDisplay || `$${p.price}`}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );

}