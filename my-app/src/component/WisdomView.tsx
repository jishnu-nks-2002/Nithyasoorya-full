'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import CustomCursor from '@/component/Customcursor';
import ElegantNavbar from '@/component/ElegantNavbar';
import FlowingMenu from '@/component/Flowingmenu';
import ReviewSection from '@/component/Reviewsection';
import Footer from '@/component/Footer';
import ProductBreadcrumb from '@/component/ProductBreadcrumb';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const HUB_SLUG = 'crystal-wisdom';

interface Item {
  title: string; subtitle?: string; keywords?: string[]; body?: string;
  crystals?: string[]; intention?: string; accent?: string;
}
interface WisdomPage {
  slug: string; layout: string; eyebrow?: string; title: string; tagline?: string; intro?: string;
  heroImage?: { url?: string }; items: Item[]; footnoteTitle?: string; footnote?: string; closingText?: string;
}
interface PageLink { slug: string; menuLabel?: string; title: string; tagline?: string; }

const splitParas = (s?: string) => (s || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
const splitLines = (s?: string) => (s || '').split('\n').map((l) => l.trim()).filter(Boolean);
const hrefFor    = (slug: string) => (slug === HUB_SLUG ? '/crystal-wisdom' : `/crystal-wisdom/${slug}`);

export default function WisdomView({ slug }: { slug: string }) {
  const [page,     setPage]     = useState<WisdomPage | null>(null);
  const [others,   setOthers]   = useState<PageLink[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setNotFound(false);
    (async () => {
      try {
        const [r1, r2] = await Promise.all([
          fetch(`${API_BASE}/api/wisdom/${slug}`),
          fetch(`${API_BASE}/api/wisdom`),
        ]);
        const j1 = await r1.json();
        const j2 = await r2.json().catch(() => null);
        if (cancelled) return;
        if (!j1.success || !j1.data) setNotFound(true);
        else setPage(j1.data);
        if (j2?.success) setOthers(j2.data);
      } catch {
        if (!cancelled) setNotFound(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  const isHub = page?.layout === 'hub';
  const links = others.filter((o) => o.slug !== HUB_SLUG && o.slug !== slug);

  const moreSection = links.length > 0 && (
    <section className="cw-section cw-more">
      <span className="cw-eyebrow">{isHub ? 'EXPLORE' : 'CONTINUE EXPLORING'}</span>
      <div className="cw-more-grid">
        {links.map((l) => (
          <Link key={l.slug} href={hrefFor(l.slug)} className="cw-more-card">
            <h4>{l.menuLabel || l.title}</h4>
            {l.tagline && <p>{l.tagline}</p>}
            <span>Explore →</span>
          </Link>
        ))}
      </div>
    </section>
  );

  return (
    <main className="cw-main">
      <CustomCursor />
      <ElegantNavbar />
      <FlowingMenu />

      <ProductBreadcrumb
        items={[{ label: 'Home', href: '/' }, ...(isHub ? [] : [{ label: 'Crystal Wisdom', href: '/crystal-wisdom' }])]}
        productName={page?.title ?? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
        productSeries="Crystal Wisdom"
        productCategory="Empavai"
        backgroundImage={page?.heroImage?.url || '/images/brecamp-collection-3.png'}
      />

      {loading && (
        <div className="cw-section">
          {[150, 90, 260].map((h) => <div key={h} className="cw-skeleton" style={{ height: h }} />)}
        </div>
      )}

      {!loading && notFound && (
        <div className="cw-section cw-center">
          <h2 className="cw-heading">Page not found</h2>
          <p className="cw-card-body">We couldn’t find this page.</p>
          <Link href="/crystal-wisdom" className="cw-btn">← Crystal Wisdom</Link>
        </div>
      )}

      {!loading && page && (
        <>
          <section className="cw-section cw-head">
            <span className="cw-eyebrow">{page.eyebrow || 'CRYSTAL WISDOM'}</span>
            {page.tagline && <h2 className="cw-tagline">{page.tagline}</h2>}
            <div className="cw-intro">
              {splitParas(page.intro).map((p, i) => <p key={i}>{p}</p>)}
            </div>
          </section>

          {isHub && moreSection}

          {page.items?.length > 0 && (
            <section className="cw-section">
              <div className={`cw-grid cw-grid--${page.layout}`}>
                {page.items.map((it, i) => (
                  <article key={i} className="cw-card"
                    style={{ '--cw-accent': it.accent || '#7B4BA0' } as React.CSSProperties}>
                    {page.layout === 'chakra' && <span className="cw-card-num">{String(i + 1).padStart(2, '0')}</span>}
                    <h3 className="cw-card-title">{it.title}</h3>
                    {it.subtitle && <p className="cw-card-sub">{it.subtitle}</p>}
                    {!!it.keywords?.length && <p className="cw-keywords">{it.keywords.join(' • ')}</p>}
                    {it.body && <p className="cw-card-body">{it.body}</p>}
                    {!!it.crystals?.length && (
                      <div className="cw-crystals">
                        <span className="cw-label">
                          {page.layout === 'chakra' ? 'Commonly associated crystals' : 'Crystals'}
                        </span>
                        <div className="cw-chips">
                          {it.crystals.map((c) => <span key={c} className="cw-chip">{c}</span>)}
                        </div>
                      </div>
                    )}
                    {it.intention && (
                      <p className="cw-intention">
                        <span className="cw-label">Symbolic intention</span>
                        {it.intention}
                      </p>
                    )}
                  </article>
                ))}
              </div>
            </section>
          )}

          {(page.closingText || page.footnote) && (
            <section className="cw-section cw-closing">
              {splitLines(page.closingText).map((l, i) => <p key={i} className="cw-closing-line">{l}</p>)}
              {page.footnote && (
                <aside className="cw-note">
                  {page.footnoteTitle && <h4>{page.footnoteTitle}</h4>}
                  <p>{page.footnote}</p>
                </aside>
              )}
            </section>
          )}

          {!isHub && moreSection}
        </>
      )}

      <ReviewSection />
      <Footer />
    </main>
  );
}
