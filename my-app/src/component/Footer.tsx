"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────
interface FooterLink {
  label: string;
  href: string;
  children?: FooterLink[];   // products listed under a category
  moreCount?: number;        // how many more products that category has
}

interface LinkGroup {
  brand: string;
  color: string;
  links: FooterLink[];
}

interface FooterProps {
  brandName?: string;
  tagline?: string;
  description?: string;
  logoSrc?: string;           // path to your logo image
  // Fallback links — only used if the backend cannot be reached
  nithyasoooriLinks?: FooterLink[];
  enjomLinks?: FooterLink[];
  crystalWisdomLinks?: FooterLink[];
  sacredSpacesLinks?: FooterLink[];
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    pinterest?: string;
    youtube?: string;
    twitter?: string;
  };
  email?: string;
  phone?: string;
  address?: string;
  copyright?: string;
}

// ─── API / routing config ─────────────────────────────────────────────────────
const API_URL             = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const CATEGORIES_ENDPOINT = '/api/categories';
const PRODUCTS_ENDPOINT   = '/api/products';
const STONES_ENDPOINT     = '/api/stones';          // ⬅ change if your stone router is mounted elsewhere

const COLLECTIONS_PATH    = '/collections';         // category page  → /collections/<slug>
const PRODUCT_PATH        = '/product';             // product page   → /product/<slug>
const STONE_PATH          = '/crystal-wisdom';      // ⬅ stone page   → /crystal-wisdom/<slug>  (change to match your route)

const MAX_PRODUCTS_PER_CATEGORY = 4;                // products shown under each category
const MAX_STONES                = 8;                // stones listed in the footer
const PAGE_LIMIT                = 100;
const MAX_PAGES                 = 50;

const PALETTE   = ['#9b6fe0', '#c084fc', '#7b2fbf', '#7c5cbf', '#a78bda'];
const UNBRANDED = 'Other Collections';   // label for categories that have no brand set

// ─── Legal links (bottom bar) ─────────────────────────────────────────────────
const LEGAL_LINKS: { label: string; href: string }[] = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Use',   href: '/terms-of-use' },
            // no page yet — update when you add one
];

// ─── Data helpers ─────────────────────────────────────────────────────────────
// Handles [..] or { data: [..] } or { data: { stones: [..] } } or { stones: [..] } etc.
const toArray = (res: any): any[] => {
  if (Array.isArray(res)) return res;
  const candidates = [
    res?.data, res?.data?.categories, res?.data?.products, res?.data?.stones,
    res?.categories, res?.products, res?.stones,
  ];
  for (const c of candidates) if (Array.isArray(c)) return c;
  return [];
};

// Fetches EVERY page of an endpoint (also works when the API has no pagination)
async function fetchAll(endpoint: string): Promise<any[]> {
  const all: any[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const res = await fetch(`${API_URL}${endpoint}?page=${page}&limit=${PAGE_LIMIT}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`${endpoint} failed (${res.status})`);
    const json = await res.json();

    all.push(...toArray(json));

    const meta = json?.pagination ?? json?.meta ?? json;
    totalPages = Number(meta?.totalPages ?? meta?.pages ?? 1) || 1;
    page++;
  } while (page <= totalPages && page <= MAX_PAGES);

  // Remove duplicates in case the API ignored the page parameter
  return Array.from(new Map(all.map((x, i) => [x?._id ?? `i-${i}`, x])).values());
}

const byOrder = (a: any, b: any) => (a?.order ?? 0) - (b?.order ?? 0);
const norm    = (s: any) => String(s ?? '').trim().toLowerCase();

// product.category can be an id, a category name, or a populated object
const belongsTo = (p: any, cat: any): boolean => {
  const raw = p?.category;
  const candidates = [raw?._id, raw?.name, raw?.slug, typeof raw === 'string' ? raw : undefined]
    .map(norm)
    .filter(Boolean);
  return candidates.some(c => c === norm(cat._id) || c === norm(cat.name) || c === norm(cat.slug));
};

// Categories → grouped by brand, each category carrying ITS OWN products
function buildCategoryGroups(categories: any[], products: any[] | null): LinkGroup[] {
  const map = new Map<string, LinkGroup>();

  // featured products first
  const sortedProducts = (products ?? [])
    .filter(p => p?.isActive !== false && p?.name && p?.slug)
    .sort((a, b) => Number(!!b.isFeatured) - Number(!!a.isFeatured));

  categories
    .filter(c => c?.isActive !== false && c?.name)
    .sort(byOrder)
    .forEach(c => {
      const brand = String(c.brand ?? '').trim() || UNBRANDED;
      let group = map.get(brand);
      if (!group) {
        group = { brand, color: c.brandColor || PALETTE[map.size % PALETTE.length], links: [] };
        map.set(brand, group);
      }

      const catProducts = sortedProducts.filter(p => belongsTo(p, c));

      group.links.push({
        label: c.name,
        href: `${COLLECTIONS_PATH}/${encodeURIComponent(c.slug || c.name)}`,
        children: catProducts
          .slice(0, MAX_PRODUCTS_PER_CATEGORY)
          .map(p => ({ label: p.name, href: `${PRODUCT_PATH}/${p.slug}` })),
        moreCount: Math.max(0, catProducts.length - MAX_PRODUCTS_PER_CATEGORY),
      });
    });

  return Array.from(map.values());
}

// Stones → active only, capped
function buildStoneLinks(stones: any[]): FooterLink[] {
  return stones
    .filter(s => s?.isActive !== false && s?.name && s?.slug)
    .sort(byOrder)
    .slice(0, MAX_STONES)
    .map(s => ({ label: s.name, href: `${STONE_PATH}/${s.slug}` }));
}

// ─── Fetch all three lists once, independently (one failing doesn't break the rest) ─
// null = request failed, [] = succeeded but empty
interface FooterData {
  loading: boolean;
  categories: any[] | null;
  products: any[] | null;
  stones: any[] | null;
}

function useFooterData(): FooterData {
  const [data, setData] = useState<FooterData>({ loading: true, categories: null, products: null, stones: null });

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const [c, p, s] = await Promise.allSettled([
        fetchAll(CATEGORIES_ENDPOINT),
        fetchAll(PRODUCTS_ENDPOINT),
        fetchAll(STONES_ENDPOINT),
      ]);
      if (cancelled) return;

      [c, p, s].forEach((r, i) => {
        if (r.status === 'rejected') console.warn(`[Footer] ${['categories', 'products', 'stones'][i]} failed:`, r.reason);
      });

      setData({
        loading: false,
        categories: c.status === 'fulfilled' ? c.value : null,
        products:   p.status === 'fulfilled' ? p.value : null,
        stones:     s.status === 'fulfilled' ? s.value : null,
      });
    })();

    return () => { cancelled = true; };
  }, []);

  return data;
}

// ─── Logo ─────────────────────────────────────────────────────────────────────
const FooterLogo: React.FC<{ src: string; brandName: string }> = ({ src, brandName }) => {
  const [imgError, setImgError] = useState(false);

  if (imgError) {
    // Fallback: text wordmark if image path is wrong or missing
    return (
      <h2 style={{
        fontFamily: "'Playfair Display', Georgia, serif",
        fontSize: 'clamp(26px, 3vw, 34px)',
        fontWeight: 800, color: '#f5f0ff',
        letterSpacing: '-0.02em', margin: '0 0 20px',
        lineHeight: 1,
      }}>
        {brandName}
      </h2>
    );
  }

  return (
    <img
      src={src}
      alt={`${brandName} logo`}
      onError={() => setImgError(true)}
      style={{
        height: 56,              // adjust to taste — 48–72px works well in footers
        width: 'auto',
        objectFit: 'contain',
        display: 'block',
        marginBottom: '20px',
        // If your logo is dark and needs to appear light on this dark footer, uncomment:
        // filter: 'brightness(0) invert(1)',
      }}
    />
  );
};

// ─── Social Icon Components ───────────────────────────────────────────────────
const InstagramIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
    <circle cx="12" cy="12" r="4"/>
    <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none"/>
  </svg>
);

const FacebookIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
  </svg>
);

const PinterestIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.236 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.181-.78 1.172-4.97 1.172-4.97s-.299-.598-.299-1.482c0-1.388.806-2.428 1.808-2.428.852 0 1.265.64 1.265 1.408 0 .858-.546 2.140-.828 3.330-.236.995.499 1.806 1.476 1.806 1.772 0 3.138-1.868 3.138-4.566 0-2.386-1.715-4.054-4.163-4.054-2.836 0-4.498 2.127-4.498 4.326 0 .857.330 1.775.741 2.276a.3.3 0 0 1 .069.286c-.076.313-.244.995-.277 1.134-.044.183-.146.222-.337.134C5.927 14.996 5 13.376 5 12c0-3.866 2.819-8 8.515-8 4.47 0 7.946 3.184 7.946 7.439 0 4.441-2.798 8.014-6.68 8.014-1.305 0-2.533-.679-2.954-1.479l-.803 2.998c-.291 1.118-1.076 2.520-1.602 3.374C11.15 21.947 11.575 22 12 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
  </svg>
);

const YoutubeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.96-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/>
    <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="currentColor" stroke="none"/>
  </svg>
);

const TwitterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// ─── Social Button ────────────────────────────────────────────────────────────
const SocialBtn: React.FC<{ href: string; label: string; children: React.ReactNode }> = ({ href, label, children }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '42px', height: '42px',
        borderRadius: '50%',
        border: `1.5px solid ${hovered ? '#7B4BA0' : 'rgba(255,255,255,0.15)'}`,
        background: hovered ? '#7B4BA0' : 'transparent',
        color: hovered ? '#fff' : 'rgba(255,255,255,0.6)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.25s ease',
        textDecoration: 'none',
        flexShrink: 0,
      }}
    >
      {children}
    </a>
  );
};

// ─── Animated Link ────────────────────────────────────────────────────────────
// variant "main" = dash + normal text (categories, stones, pages)
// variant "sub"  = smaller, dimmer text with no dash (products nested under a category)
const FooterNavLink: React.FC<{ href: string; variant?: 'main' | 'sub'; children: React.ReactNode }> = ({
  href, variant = 'main', children,
}) => {
  const [hovered, setHovered] = useState(false);
  const isSub = variant === 'sub';

  const style: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', gap: '8px',
    fontFamily: "'Crimson Text', Georgia, serif",
    fontSize: isSub ? '14px' : '15px',
    fontWeight: 400,
    lineHeight: 1.35,
    color: hovered
      ? '#c4a8dc'
      : isSub ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.62)',
    textDecoration: 'none',
    letterSpacing: '0.3px',
    transition: 'color 0.22s ease',
    cursor: 'pointer',
  };

  const inner = (
    <>
      {!isSub && (
        <span style={{
          display: 'inline-block', width: '14px', height: '1px',
          background: hovered ? '#c4a8dc' : 'rgba(255,255,255,0.2)',
          transition: 'all 0.22s ease',
          transform: hovered ? 'scaleX(1.6)' : 'scaleX(1)',
          transformOrigin: 'left',
          flexShrink: 0,
        }} />
      )}
      {children}
    </>
  );

  const handlers = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };

  // Internal paths use Next.js <Link> (no page reload)
  return href.startsWith('/')
    ? <Link href={href} style={style} {...handlers}>{inner}</Link>
    : <a href={href} style={style} {...handlers}>{inner}</a>;
};

// ─── Legal link (bottom bar) ──────────────────────────────────────────────────
// Same look as before; real routes use Next.js <Link>, "#" stays a plain anchor
const LegalLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => {
  const [hovered, setHovered] = useState(false);

  const style: React.CSSProperties = {
    fontFamily: "'Crimson Text', Georgia, serif",
    fontSize: '12px',
    color: hovered ? 'rgba(196,168,220,0.7)' : 'rgba(255,255,255,0.25)',
    textDecoration: 'none',
    letterSpacing: '0.5px',
    transition: 'color 0.2s ease',
  };

  const handlers = {
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };

  return href.startsWith('/')
    ? <Link href={href} style={style} {...handlers}>{children}</Link>
    : <a href={href} style={style} {...handlers}>{children}</a>;
};

// ─── Section heading inside footer columns ────────────────────────────────────
const BrandHeading: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '18px' }}>
    <span style={{ display: 'block', width: '3px', height: '12px', borderRadius: '2px', background: color, flexShrink: 0 }} />
    <h4 style={{
      fontFamily: "'Playfair Display', Georgia, serif",
      fontSize: '11px', fontWeight: 600,
      color,
      letterSpacing: '3px', textTransform: 'uppercase',
      margin: 0,
    }}>{children}</h4>
  </div>
);

// ─── Column title ─────────────────────────────────────────────────────────────
const ColumnTitle: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 style={{
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '13px', fontWeight: 600, color: '#f5f0ff',
    letterSpacing: '3px', textTransform: 'uppercase',
    margin: '0 0 24px',
    lineHeight: 1.2,
  }}>{children}</h3>
);

// ─── Footer Component ─────────────────────────────────────────────────────────
const Footer: React.FC<FooterProps> = ({
  brandName = 'EMPAVAI',
  tagline = 'Museum Exhibition 2024',
  description = 'A sanctuary for those who believe beauty still has something urgent to say. Curating the finest intersection of ancient traditions and contemporary vision.',
  logoSrc = '/images/logo.jpeg',   // ← swap with your actual logo path e.g. '/logo.svg'

  // ── Fallbacks (used only when the API is unreachable) ──
  nithyasoooriLinks = [
    { label: 'Crystal Art Decor',    href: '/collections/product-1' },
    { label: 'Aura Trinket Trays',   href: '/collections/aura-trinket-trays' },
    { label: 'Floating Flora Bowls', href: '/collections/floating-flora-bowls' },
  ],
  enjomLinks = [
    { label: 'Crystal Bracelets', href: '/collections/crystal-bracelets' },
    { label: 'Crystal Pendants',  href: '/collections/crystal-pendants' },
  ],
  crystalWisdomLinks = [
    { label: 'Chakra Connection', href: '/collections/chakra-connection' },
    { label: 'Zodiac Alignment',  href: '/collections/zodiac-alignment' },
    { label: 'Care & Cleanse',    href: '/collections/care-cleanse' },
  ],
  sacredSpacesLinks = [
    { label: 'About',   href: '/about-us' },
    { label: 'Artists', href: '/artists' },
    { label: 'Contact', href: '/contact' },
  ],
  socialLinks = {
    instagram: '#',
    facebook:  '#',
    pinterest: '#',
    youtube:   '#',
    twitter:   '#',
  },
  email    = 'hello@empavai.com',
  phone    = '+91 98765 43210',
  address  = 'Gallery District, Chennai, India',
  copyright = `© ${new Date().getFullYear()} Empavai. All rights reserved.`,
}) => {
  const [emailHovered, setEmailHovered] = useState(false);
  const [phoneHovered, setPhoneHovered] = useState(false);

  // ── Live data from the backend ──────────────────────────────────────────────
  const data = useFooterData();

  const fallbackGroups: LinkGroup[] = [
    { brand: 'Nithyasoori', color: '#9b6fe0', links: nithyasoooriLinks },
    { brand: 'Enjem',       color: '#c084fc', links: enjomLinks },
  ];

  const categoryGroups: LinkGroup[] =
    data.loading ? [] : data.categories === null ? fallbackGroups : buildCategoryGroups(data.categories, data.products);

  const stoneLinks: FooterLink[] =
    data.loading ? [] : data.stones === null ? crystalWisdomLinks : buildStoneLinks(data.stones);

  // Hide a column only when the backend answered and it's genuinely empty
  const showCollections = data.loading || categoryGroups.length > 0;
  const showStones      = data.loading || stoneLinks.length > 0;

  // Skip the sub-heading when there is a single unbranded group (it would just repeat "Collections")
  const hideGroupHeading = categoryGroups.length === 1 && categoryGroups[0].brand === UNBRANDED;

  return (
    <footer style={{
      width: '100%',
      background: 'linear-gradient(160deg, #1a0f2e 0%, #120a22 60%, #0d0718 100%)',
      position: 'relative',
      overflow: 'hidden',
      fontFamily: "'Playfair Display', Georgia, serif",
    }}>
      {/* Font import + responsive layout */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;0,800;0,900;1,400&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Inter:wght@400;500;600&display=swap');
        @keyframes ft-pulse { 0%,100%{opacity:0.04} 50%{opacity:0.07} }

        /* Desktop: brand | collections (wide) | crystal wisdom | sacred spaces */
        .ft-grid {
          display: grid;
          grid-template-columns: minmax(230px, 1.1fr) minmax(0, 2.3fr) minmax(150px, 0.9fr) minmax(150px, 0.9fr);
          gap: clamp(32px, 4vw, 56px);
          align-items: start;
          margin-bottom: clamp(48px, 6vw, 72px);
        }
        /* Brands (Nithyasoori / Enjem …) sit side by side inside the Collections column */
        .ft-brands {
          column-count: 2;
          column-gap: clamp(32px, 4vw, 56px);
        }
        .ft-brand-group {
          break-inside: avoid;
          -webkit-column-break-inside: avoid;
          margin-bottom: 36px;
        }

        /* Tablet: brand + collections full width, then the two small columns side by side */
        @media (max-width: 1100px) {
          .ft-grid { grid-template-columns: 1fr 1fr; }
          .ft-col-brand, .ft-col-collections { grid-column: 1 / -1; }
        }
        /* Mobile: single column */
        @media (max-width: 640px) {
          .ft-grid { grid-template-columns: 1fr; }
          .ft-brands { column-count: 1; }
        }
      `}</style>

      {/* Decorative background orbs */}
      <div style={{ position:'absolute', top:'-180px', right:'-120px', width:'500px', height:'500px', borderRadius:'50%', background:'radial-gradient(circle, rgba(123,75,160,0.12) 0%, transparent 65%)', pointerEvents:'none', animation:'ft-pulse 6s ease infinite' }} />
      <div style={{ position:'absolute', top:'60px', left:'-100px', width:'350px', height:'350px', borderRadius:'50%', background:'radial-gradient(circle, rgba(90,58,125,0.08) 0%, transparent 70%)', pointerEvents:'none' }} />

      {/* ── Top accent line ───────────────────────────────────────────────── */}
      <div style={{ width:'100%', height:'1px', background:'linear-gradient(90deg, transparent 0%, rgba(123,75,160,0.5) 30%, #7B4BA0 50%, rgba(123,75,160,0.5) 70%, transparent 100%)' }} />

      {/* ── Main footer body ──────────────────────────────────────────────── */}
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: 'clamp(56px, 7vw, 88px) clamp(20px, 5vw, 80px) 0',
      }}>

        {/* ── Top row: Brand + Links ────────────────────────────────────── */}
        <div className="ft-grid">

          {/* ── Brand column ─────────────────────────────────────────────── */}
          <div className="ft-col-brand">

            {/* Tagline above logo */}
            <p style={{
              fontFamily: "'Crimson Text', Georgia, serif",
              fontSize: '10px', letterSpacing: '5px',
              textTransform: 'uppercase', color: '#7B4BA0',
              margin: '0 0 14px', opacity: 0.85,
            }}>{tagline}</p>

            {/* ── Logo image ── */}
            <FooterLogo src={logoSrc} brandName={brandName} />

            {/* Ornamental divider */}
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'20px' }}>
              <div style={{ width:'32px', height:'1px', background:'linear-gradient(to right, #7B4BA0, transparent)' }} />
              <div style={{ width:'4px', height:'4px', borderRadius:'50%', background:'#7B4BA0', opacity:0.6 }} />
            </div>

            <p style={{
              fontFamily: "'Crimson Text', Georgia, serif",
              fontSize: '15px', fontStyle: 'italic',
              color: 'rgba(255,255,255,0.45)', lineHeight: 1.75,
              margin: '0 0 28px', maxWidth: '300px',
            }}>{description}</p>

            {/* Contact details */}
            <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'32px' }}>
              <a href={`mailto:${email}`}
                onMouseEnter={() => setEmailHovered(true)}
                onMouseLeave={() => setEmailHovered(false)}
                style={{
                  fontFamily:"'Crimson Text', Georgia, serif",
                  fontSize:'14px', color: emailHovered ? '#c4a8dc' : 'rgba(255,255,255,0.45)',
                  textDecoration:'none', letterSpacing:'0.3px',
                  transition:'color 0.22s ease', display:'flex', alignItems:'center', gap:'8px',
                }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                {email}
              </a>
              <a href={`tel:${phone}`}
                onMouseEnter={() => setPhoneHovered(true)}
                onMouseLeave={() => setPhoneHovered(false)}
                style={{
                  fontFamily:"'Crimson Text', Georgia, serif",
                  fontSize:'14px', color: phoneHovered ? '#c4a8dc' : 'rgba(255,255,255,0.45)',
                  textDecoration:'none', letterSpacing:'0.3px',
                  transition:'color 0.22s ease', display:'flex', alignItems:'center', gap:'8px',
                }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.27h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.91a16 16 0 0 0 6 6l.9-.9a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                {phone}
              </a>
              <p style={{ fontFamily:"'Crimson Text', serif", fontSize:'14px', color:'rgba(255,255,255,0.35)', margin:0, display:'flex', alignItems:'center', gap:'8px' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {address}
              </p>
            </div>

            {/* Social icons */}
            <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
              {socialLinks.instagram && <SocialBtn href={socialLinks.instagram} label="Instagram"><InstagramIcon /></SocialBtn>}
              {socialLinks.facebook  && <SocialBtn href={socialLinks.facebook}  label="Facebook"><FacebookIcon /></SocialBtn>}
              {socialLinks.pinterest && <SocialBtn href={socialLinks.pinterest} label="Pinterest"><PinterestIcon /></SocialBtn>}
              {socialLinks.youtube   && <SocialBtn href={socialLinks.youtube}   label="YouTube"><YoutubeIcon /></SocialBtn>}
              {socialLinks.twitter   && <SocialBtn href={socialLinks.twitter}   label="X / Twitter"><TwitterIcon /></SocialBtn>}
            </div>
          </div>

          {/* ── Collections column: categories (by brand) with their products underneath ── */}
          {showCollections && (
            <div className="ft-col-collections">
              <ColumnTitle>Collections</ColumnTitle>

              <div className="ft-brands">
                {categoryGroups.map(group => (
                  <div key={group.brand} className="ft-brand-group">
                    {!hideGroupHeading && <BrandHeading color={group.color}>{group.brand}</BrandHeading>}

                    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
                      {group.links.map(cat => (
                        <div key={cat.href}>
                          {/* Category */}
                          <FooterNavLink href={cat.href}>{cat.label}</FooterNavLink>

                          {/* Its products */}
                          {cat.children && cat.children.length > 0 && (
                            <div style={{
                              display:'flex', flexDirection:'column', gap:'8px',
                              margin:'10px 0 0 6px',
                              paddingLeft:'16px',
                              borderLeft:`1px solid ${group.color}55`,
                            }}>
                              {cat.children.map(p => (
                                <FooterNavLink key={p.href} href={p.href} variant="sub">{p.label}</FooterNavLink>
                              ))}
                              {!!cat.moreCount && cat.moreCount > 0 && (
                                <FooterNavLink href={cat.href} variant="sub">+ {cat.moreCount} more</FooterNavLink>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── Crystal Wisdom column: stones ─────────────────────────────── */}
          {showStones && (
            <div>
              <ColumnTitle>Crystal Wisdom</ColumnTitle>

              <BrandHeading color="#7b2fbf">Sacred Stones</BrandHeading>
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {stoneLinks.map(l => <FooterNavLink key={l.href} href={l.href}>{l.label}</FooterNavLink>)}
                {data.stones !== null && stoneLinks.length > 0 && (
                  <FooterNavLink href={STONE_PATH}>View all →</FooterNavLink>
                )}
              </div>
            </div>
          )}

          {/* ── Sacred Spaces column + newsletter ────────────────────────── */}
          <div>
            <ColumnTitle>Sacred Spaces</ColumnTitle>

            <BrandHeading color="#7c5cbf">Connect</BrandHeading>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
              {sacredSpacesLinks.map(l => <FooterNavLink key={l.label} href={l.href}>{l.label}</FooterNavLink>)}
            </div>

            {/* Newsletter mini CTA */}
           
          </div>

        </div>

        {/* ── Thin separator ────────────────────────────────────────────── */}
        <div style={{ width:'100%', height:'1px', background:'rgba(255,255,255,0.07)', marginBottom:'20px' }} />

        {/* ── Bottom bar: copyright + legal ─────────────────────────────── */}
        <div style={{
          display:'flex', flexWrap:'wrap',
          alignItems:'center', justifyContent:'space-between',
          gap:'12px', padding:'0 0 20px',
        }}>
          <p style={{
            fontFamily:"'Crimson Text', Georgia, serif",
            fontSize:'13px', color:'rgba(255,255,255,0.28)',
            margin:0, letterSpacing:'0.5px',
          }}>{copyright}</p>

          <div style={{ display:'flex', gap:'24px', flexWrap:'wrap' }}>
            {LEGAL_LINKS.map(l => (
              <LegalLink key={l.label} href={l.href}>{l.label}</LegalLink>
            ))}
          </div>
        </div>
      </div>

      {/* ── GIANT half-cropped brand watermark at the very bottom ─────────── */}
      <div style={{
        width: '100%',
        overflow: 'hidden',
        lineHeight: 1,
        marginTop: '-8px',
        pointerEvents: 'none',
        userSelect: 'none',
        textAlign: 'center',
      }}>
        <p style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontWeight: 900,
          fontSize: 'clamp(100px, 20vw, 300px)',
          letterSpacing: '-0.03em',
          lineHeight: 0.82,
          color: 'transparent',
          WebkitTextStroke: '1.5px rgba(255, 255, 255, 0.18)',
          background: 'linear-gradient(to bottom, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 55%, transparent 100%)',
          WebkitBackgroundClip: 'text',
          backgroundClip: 'text',
          margin: '0 auto',
          padding: 0,
          transform: 'translateY(42%)',
          whiteSpace: 'nowrap',
          display: 'block',
        }}>
          {brandName}
        </p>
      </div>
    </footer>
  );
};

export default Footer;