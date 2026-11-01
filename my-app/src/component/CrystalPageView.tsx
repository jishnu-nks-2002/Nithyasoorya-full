'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import CustomCursor from '@/component/Customcursor';
import ElegantNavbar from '@/component/ElegantNavbar';
import Footer from '@/component/Footer';
import ProductBreadcrumb from '@/component/ProductBreadcrumb';
import '@/app/crystal-wisdom/crystal-wisdom.css';

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const MAIN_SLUG = 'crystal-wisdom';

// Uploaded images are stored as relative paths (/uploads/…) — prefix the API host
const img = (u?: string) => (u && u.startsWith('/') ? `${API_BASE}${u}` : u || '');
const pageHref = (slug: string) => (slug === MAIN_SLUG ? '/crystal-wisdom' : `/crystal-wisdom/${slug}`);

// ── Types ─────────────────────────────────────────────────────────────────────
interface Detail { label: string; value: string }
interface Item {
  title?: string; subtitle?: string; tagline?: string; description?: string;
  chipsLabel?: string; chips?: string[]; details?: Detail[];
  note?: string; icon?: string; color?: string; imageUrl?: string;
}
interface Section {
  _id?: string;
  type: 'text' | 'cards' | 'list' | 'quote' | 'notice';
  eyebrow?: string; heading?: string; body?: string; lines?: string[]; items?: Item[];
}
interface CrystalPage {
  _id: string; slug: string; title: string; eyebrow?: string; intro?: string;
  menuLabel?: string; menuSubtitle?: string; heroImageUrl?: string; color?: string;
  sections: Section[]; metaTitle?: string; metaDescription?: string;
}
interface PageSummary { _id: string; slug: string; title: string; menuLabel?: string; menuSubtitle?: string }

// ── Blocks ────────────────────────────────────────────────────────────────────
function SectionHead({ s }: { s: Section }) {
  if (!s.eyebrow && !s.heading) return null;
  return (
    <header className="cw-sec-head">
      {s.eyebrow && <span className="cw-eyebrow">{s.eyebrow}</span>}
      {s.heading && <h2 className="cw-heading">{s.heading}</h2>}
    </header>
  );
}

function Chips({ item }: { item: Item }) {
  if (!item.chips?.length) return null;
  return (
    <div className="cw-chipblock">
      {item.chipsLabel && <p className="cw-chips-label">{item.chipsLabel}</p>}
      <ul className="cw-chips">{item.chips.map((c) => <li key={c}>{c}</li>)}</ul>
    </div>
  );
}

function ItemBody({ item, accent }: { item: Item; accent: string }) {
  return (
    <>
      {item.imageUrl && <img className="cw-item-img" src={img(item.imageUrl)} alt={item.title || ''} />}
      {item.icon && <div className="cw-icon" aria-hidden>{item.icon}</div>}
      {item.title && <h3 className="cw-item-title">{item.title}</h3>}
      {item.subtitle && <p className="cw-item-sub">{item.subtitle}</p>}
      {item.tagline && <p className="cw-item-tagline" style={{ color: accent }}>{item.tagline}</p>}
      {item.description && <p className="cw-item-desc">{item.description}</p>}
      <Chips item={item} />
      {item.details?.map((d, i) => (
        <p key={i} className="cw-detail">
          {d.label && <strong>{d.label}: </strong>}{d.value}
        </p>
      ))}
      {item.note && <p className="cw-note">{item.note}</p>}
    </>
  );
}

function Block({ s, color }: { s: Section; color: string }) {
  switch (s.type) {
    case 'text':
      return (
        <section className="cw-sec cw-text">
          <SectionHead s={s} />
          {(s.body || '').split(/\n{2,}/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
        </section>
      );

    case 'cards':
      return (
        <section className="cw-sec">
          <SectionHead s={s} />
          <div className="cw-grid">
            {s.items?.map((it, i) => (
              <article key={i} className="cw-card" style={it.color ? { borderTopColor: it.color } : undefined}>
                <ItemBody item={it} accent={it.color || color} />
              </article>
            ))}
          </div>
        </section>
      );

    case 'list':
      return (
        <section className="cw-sec">
          <SectionHead s={s} />
          <div className="cw-stack">
            {s.items?.map((it, i) => (
              <article key={i} className="cw-card cw-row" style={{ borderLeftColor: it.color || color }}>
                <ItemBody item={it} accent={it.color || color} />
              </article>
            ))}
          </div>
        </section>
      );

    case 'quote':
      return (
        <section className="cw-sec cw-quote">
          <SectionHead s={s} />
          {s.lines?.map((l, i) => <span key={i}>{l}</span>)}
        </section>
      );

    case 'notice':
      return (
        <section className="cw-sec">
          <div className="cw-notice" style={{ borderColor: color }}>
            <SectionHead s={s} />
            {(s.body || '').split(/\n{2,}/).filter(Boolean).map((p, i) => <p key={i}>{p}</p>)}
            {!!s.lines?.length && (
              <p className="cw-quote cw-quote--inline">{s.lines.map((l, i) => <span key={i}>{l}</span>)}</p>
            )}
          </div>
        </section>
      );

    default:
      return null;
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function CrystalPageView({ slug }: { slug: string }) {
  const [page, setPage]       = useState<CrystalPage | null>(null);
  const [menu, setMenu]       = useState<PageSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let alive = true;
    setLoading(true); setNotFound(false);
    (async () => {
      try {
        const [pRes, mRes] = await Promise.all([
          fetch(`${API_BASE}/api/crystal-pages/${slug}`),
          fetch(`${API_BASE}/api/crystal-pages?menu=true`),
        ]);
        const pJson = await pRes.json();
        if (!alive) return;
        if (!pRes.ok || !pJson.success) { setNotFound(true); return; }
        setPage(pJson.data);
        document.title = pJson.data.metaTitle || `${pJson.data.title} | Empavai`;
        const meta = document.querySelector('meta[name="description"]');
        if (meta && pJson.data.metaDescription) meta.setAttribute('content', pJson.data.metaDescription);
        const mJson = await mRes.json().catch(() => null);
        if (mJson?.success) setMenu(mJson.data);
      } catch {
        if (alive) setNotFound(true);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [slug]);

  const color = page?.color || '#7B4BA0';
  const isMain = slug === MAIN_SLUG;

  return (
    <main className="cw-main">
      <CustomCursor />
      <ElegantNavbar />

      {loading ? (
        <div className="cw-loading">
          {[220, 90, 260, 80].map((h, i) => <div key={i} style={{ height: h, animationDelay: `${i * 0.1}s` }} />)}
        </div>
      ) : notFound || !page ? (
        <div className="cw-notfound">
          <p className="cw-nf-title">Page not found</p>
          <p className="cw-nf-sub">We couldn’t find a Crystal Wisdom page called “{slug}”.</p>
          <Link href="/crystal-wisdom" className="cw-btn">← Crystal Wisdom</Link>
        </div>
      ) : (
        <>
          <ProductBreadcrumb
            items={[
              { label: 'Home', href: '/' },
              { label: 'Crystal Wisdom', href: '/crystal-wisdom' },
            ]}
            productName={page.title}
            productSeries={page.eyebrow || 'Crystal Wisdom'}
            productCategory="Crystal Wisdom"
            backgroundImage={img(page.heroImageUrl) || '/images/stones-hero.jpg'}
          />

          {/* Section tabs */}
          {menu.length > 0 && (
            <nav className="cw-tabs" aria-label="Crystal Wisdom sections">
              <Link href="/crystal-wisdom" className={isMain ? 'active' : ''}>Crystal Wisdom</Link>
              {menu.filter((m) => m.slug !== MAIN_SLUG).map((m) => (
                <Link key={m._id} href={pageHref(m.slug)} className={m.slug === slug ? 'active' : ''}>
                  {m.menuLabel || m.title}
                </Link>
              ))}
            </nav>
          )}

          <div className="cw-wrap">
            {page.intro && <p className="cw-intro">{page.intro}</p>}

            {page.sections.map((s, i) => <Block key={s._id || i} s={s} color={color} />)}

            {/* Overview page links to every sub-page */}
            {isMain && menu.filter((m) => m.slug !== MAIN_SLUG).length > 0 && (
              <section className="cw-sec">
                <div className="cw-grid">
                  {menu.filter((m) => m.slug !== MAIN_SLUG).map((m) => (
                    <Link key={m._id} href={pageHref(m.slug)} className="cw-card cw-linkcard">
                      <h3 className="cw-item-title">{m.menuLabel || m.title}</h3>
                      {m.menuSubtitle && <p className="cw-item-desc">{m.menuSubtitle}</p>}
                      <span className="cw-more">Explore →</span>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </>
      )}

      <Footer />
    </main>
  );
}
