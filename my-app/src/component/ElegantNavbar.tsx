'use client';

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Jost, Cormorant_Garamond } from "next/font/google";

const jost      = Jost({ weight: ["300","400","500","600"], subsets: ["latin"], display: "swap" });
const cormorant = Cormorant_Garamond({ weight: ["300","400","500","600"], subsets: ["latin"], display: "swap" });

const API_BASE    = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const PLACEHOLDER = "/images/placeholder.jpeg";

// ── Helpers ───────────────────────────────────────────────────────────────────
// Sanitise image URLs (strips smart-quotes, prepends API_BASE for relative paths)
function cleanUrl(raw: any): string {
  const val = typeof raw === "string" ? raw : raw?.url ?? raw?.path ?? "";
  if (!val || typeof val !== "string") return "";
  const cleaned = val
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'")
    .replace(/[\u201C\u201D\u201E\u201F]/g, '"')
    .replace(/[\u00A0]/g, " ")
    .trim();
  if (!cleaned) return "";
  if (/^(https?:|data:)/.test(cleaned)) return cleaned;
  return `${API_BASE}/${cleaned.replace(/^\/+/, "")}`;
}

// Handles [..] or { data: [..] } / { categories: [..] } / { products: [..] } / { stones: [..] }
const toArray = (res: any): any[] =>
  Array.isArray(res) ? res : res?.data ?? res?.categories ?? res?.products ?? res?.stones ?? [];

type CategoryField = string | { _id: string; name: string; slug?: string };

// product.category can be a name, an id, or a populated object
const productCategoryKeys = (c: CategoryField | undefined | null): string[] => {
  if (!c) return [];
  if (typeof c === "string") return [c.toLowerCase()];
  return [c._id, c.name, c.slug].filter(Boolean).map(s => String(s).toLowerCase());
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface Category {
  _id: string; name: string; slug: string;
  brand: string; brandColor: string; subtitle: string; order: number;
  image?: any;
}
interface ProductImage { url: string; alt: string; isPrimary: boolean; }
interface Product {
  _id: string; name: string; slug: string; category: CategoryField;
  series: string; priceDisplay: string; price: number;
  isNew: boolean; availability: string;
  images: ProductImage[];
}
interface Stone {
  _id: string; name: string; slug: string;
  subtitle?: string; tagline?: string; isActive?: boolean;
}
interface StoneLink { label: string; sub: string; href: string; }
interface CategoryColumn {
  name: string; slug: string; subtitle: string; color: string; image: string;
  products: { name: string; slug: string; isNew: boolean }[];
}
interface DropData {
  featured: { title: string; subtitle: string; accent: string; tag: string };
  columns: CategoryColumn[];
}

const productImage = (p: Product): string => {
  const imgs = p.images ?? [];
  return cleanUrl((imgs.find(i => i.isPrimary) ?? imgs[0])?.url);
};

// ── Build dropdown data ────────────────────────────────────────────────────────
function buildDropData(categories: Category[], products: Product[]): DropData {
  let columns: CategoryColumn[] = [];

  if (categories.length > 0) {
    columns = [...categories]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((cat) => {
        const keys = [cat._id, cat.name, cat.slug].filter(Boolean).map(s => String(s).toLowerCase());
        const catProducts = products.filter(p =>
          productCategoryKeys(p.category).some(k => keys.includes(k))
        );
        return {
          name: cat.name, slug: cat.slug || cat.name,
          subtitle: cat.subtitle || `Browse ${cat.name}`,
          color: cat.brandColor || "#7c5cbf",
          image: cleanUrl(cat.image) || catProducts.map(productImage).find(Boolean) || PLACEHOLDER,
          products: catProducts.slice(0, 6).map((p) => ({
            name: p.name, slug: p.slug, isNew: p.isNew,
          })),
        };
      });
  } else {
    // no categories endpoint data: derive columns from the products themselves
    products.forEach((p) => {
      const name = typeof p.category === "string" ? p.category : p.category?.name;
      if (!name) return;
      let col = columns.find((c) => c.name === name);
      if (!col) {
        col = { name, slug: name, subtitle: `Browse ${name}`, color: "#7c5cbf", image: productImage(p) || PLACEHOLDER, products: [] };
        columns.push(col);
      }
      if (col.products.length < 6) col.products.push({ name: p.name, slug: p.slug, isNew: p.isNew });
    });
  }

  return {
    featured: { title: "New Arrivals", subtitle: "Handcrafted with intention", accent: "#7c5cbf", tag: "Just In" },
    columns,
  };
}

// ── Build stone links ─────────────────────────────────────────────────────────
function buildStoneLinks(stones: Stone[]): StoneLink[] {
  const fallback: StoneLink[] = [
    { label: "All Stones",       sub: "Browse the full collection",  href: "/stones"                  },
    { label: "Black Tourmaline", sub: "Protection & Grounding",      href: "/stones/black-tourmaline" },
    { label: "Amethyst",         sub: "Spirituality & Clarity",      href: "/stones/amethyst"         },
    { label: "Rose Quartz",      sub: "Love & Emotional Healing",    href: "/stones/rose-quartz"      },
    { label: "Selenite",         sub: "Cleansing & Light",           href: "/stones/selenite"         },
    { label: "Citrine",          sub: "Abundance & Manifestation",   href: "/stones/citrine"          },
  ];
  if (!stones || stones.length === 0) return fallback;
  return [
    { label: "All Stones", sub: "Browse the full collection", href: "/stones" },
    ...stones
      .filter(s => s.isActive !== false)
      .slice(0, 8)
      .map(s => ({
        label: s.name,
        sub:   s.subtitle || s.tagline || `Explore ${s.name}`,
        href:  `/stones/${s.slug}`,
      })),
  ];
}

// ── Sacred Spaces links ───────────────────────────────────────────────────────
const SACRED_LINKS = [
  { label: "About",   sub: "Who we are",               href: "/about-us" },
  { label: "Artists", sub: "Stories from our Artists", href: "/artists"  },
  { label: "Contact", sub: "Reach out",                href: "/contact"  },
];

// ── Logo ──────────────────────────────────────────────────────────────────────
const Logo = () => {
  const [imgError, setImgError] = useState(false);
  if (imgError) {
    return (
      <svg width="36" height="36" viewBox="0 0 28 28" fill="none">
        <polygon points="14,2 26,14 14,26 2,14" fill="none" stroke="#7c5cbf" strokeWidth="1.8" />
        <polygon points="14,6 22,14 14,22 6,14" fill="none" stroke="#7c5cbf" strokeWidth="1" opacity="0.4" />
        <circle cx="14" cy="14" r="2" fill="#7c5cbf" opacity="0.7" />
      </svg>
    );
  }
  return (
    <Image src="/images/logo.jpeg" alt="Empavai logo" width={40} height={40}
      onError={() => setImgError(true)}
      style={{ objectFit: "contain", height: 40, width: "auto" }} />
  );
};

// ── Product link ──────────────────────────────────────────────────────────────
const ProductLink = ({ prod, color }: {
  prod: { name: string; slug: string; isNew: boolean };
  color: string;
}) => {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={`/product/${prod.slug}`}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", alignItems: "center", gap: 6,
        padding: "7px 10px", borderRadius: 6, textDecoration: "none",
        background: hov ? `${color}0d` : "transparent",
        borderLeft: `2px solid ${hov ? color : "transparent"}`,
        transform: hov ? "translateX(2px)" : "translateX(0)",
        transition: "all 0.18s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      <span style={{
        fontSize: 13, fontWeight: hov ? 500 : 400,
        color: hov ? color : "#4a3a6a", lineHeight: 1.3,
        transition: "color 0.18s ease",
      }}>{prod.name}</span>
      {prod.isNew && (
        <span style={{
          flexShrink: 0, fontSize: 7.5, fontWeight: 700, letterSpacing: "0.14em",
          textTransform: "uppercase", color: "#fff", background: color,
          padding: "2px 6px", borderRadius: 8,
        }}>NEW</span>
      )}
    </a>
  );
};

// ── Sacred link row ───────────────────────────────────────────────────────────
const SacredLinkRow = ({ link }: { link: StoneLink }) => {
  const [hov, setHov] = useState(false);
  return (
    <a href={link.href}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", flexDirection: "column", gap: 1,
        padding: "6px 10px", borderRadius: 7, textDecoration: "none",
        borderLeft: `2px solid ${hov ? "#9b4dca" : "transparent"}`,
        background: hov ? "#9b4dca0d" : "transparent",
        transform: hov ? "translateX(3px)" : "translateX(0)",
        transition: "all 0.2s ease",
      }}>
      <span style={{ fontSize: 12.5, fontWeight: hov ? 500 : 400, color: hov ? "#9b4dca" : "#2e1f4a", transition: "color 0.2s" }}>
        {link.label}
      </span>
      <span style={{ fontSize: 10, fontWeight: 300, color: "#a090bb" }}>{link.sub}</span>
    </a>
  );
};

// ── Stone link row ────────────────────────────────────────────────────────────
const StoneLinkRow = ({ link }: { link: StoneLink }) => {
  const [hov, setHov] = useState(false);
  return (
    <a href={link.href}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", flexDirection: "column", gap: 1,
        padding: "6px 10px", borderRadius: 7, textDecoration: "none",
        borderLeft: `2px solid ${hov ? "#7B4BA0" : "transparent"}`,
        background: hov ? "#7B4BA00d" : "transparent",
        transform: hov ? "translateX(3px)" : "translateX(0)",
        transition: "all 0.2s ease",
      }}>
      <span style={{ fontSize: 12.5, fontWeight: hov ? 500 : 400, color: hov ? "#7B4BA0" : "#2e1f4a", transition: "color 0.2s" }}>
        {link.label}
      </span>
      <span style={{ fontSize: 10, fontWeight: 300, color: "#a090bb" }}>{link.sub}</span>
    </a>
  );
};

// ── Collections mega-dropdown ─────────────────────────────────────────────────
// Same card style as before. Every category gets its own column; the columns
// wrap onto extra rows (no sideways scrolling) so none are ever cut off.
const COL_W       = 190;  // width of one category column
const FIXED_W     = 252;  // featured block (204) + card padding (48)
const MAX_PER_ROW = 5;

const CollectionsPanel = ({ data, visible, anchorRef }: {
  data: DropData;
  visible: boolean;
  anchorRef: React.RefObject<HTMLDivElement>;
}) => {
  const [show,    setShow]    = useState(false);
  const [offsetX, setOffsetX] = useState(0);   // left offset relative to anchor
  const [caretX,  setCaretX]  = useState(0);   // caret position inside panel
  const [panelW,  setPanelW]  = useState(760);

  // Size the panel to fit all categories, keep it inside the viewport,
  // and keep the caret over the trigger
  useEffect(() => {
    if (!visible || !anchorRef.current) return;

    const perRow = Math.min(Math.max(data.columns.length, 1), MAX_PER_ROW);
    const w      = Math.max(760, Math.min(FIXED_W + perRow * COL_W, window.innerWidth - 32));
    setPanelW(w);

    const anchorRect  = anchorRef.current.getBoundingClientRect();
    const anchorCx    = anchorRect.left + anchorRect.width / 2;

    const idealLeft   = anchorCx - w / 2;
    const maxLeft     = window.innerWidth - w - 16;
    const clampedLeft = Math.max(16, Math.min(idealLeft, maxLeft));

    setOffsetX(clampedLeft - anchorRect.left);
    setCaretX(anchorCx - clampedLeft - 6);
  }, [visible, anchorRef, data.columns.length]);

  useEffect(() => {
    let raf: number;
    if (visible) raf = requestAnimationFrame(() => setShow(true));
    else setShow(false);
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  return (
    <div
      style={{
        position: "absolute",
        top: "calc(100% + 14px)",
        left: offsetX,
        width: panelW,
        zIndex: 1100,
        pointerEvents: visible ? "auto" : "none",
        opacity: show && visible ? 1 : 0,
        transform: show && visible ? "translateY(0) scale(1)" : "translateY(-8px) scale(0.98)",
        transformOrigin: "top center",
        transition: "opacity 0.24s ease, transform 0.26s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {/* invisible bridge so the menu doesn't close while the pointer crosses the gap */}
      <div style={{ position: "absolute", top: -20, left: 0, right: 0, height: 20 }} />

      {/* Caret — always points at the trigger */}
      <div style={{
        position: "absolute",
        top: -6,
        left: Math.max(12, Math.min(caretX, panelW - 24)),
        width: 12, height: 12,
        background: "rgba(250,248,255,0.98)",
        border: "1px solid rgba(124,92,191,0.13)",
        borderBottom: "none", borderRight: "none",
        transform: "rotate(45deg)",
        zIndex: 1,
      }} />

      <div style={{
        position: "relative", zIndex: 2,
        background: "rgba(250,248,255,0.98)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(124,92,191,0.13)", borderRadius: 16,
        boxShadow: "0 20px 60px rgba(50,15,100,0.16), 0 2px 8px rgba(50,15,100,0.06)",
        padding: "28px 24px 22px",
        display: "flex", flexDirection: "row", alignItems: "flex-start", gap: 0,
        overflow: "hidden",
      }}>
        {/* Featured panel */}
        <div style={{
          flexShrink: 0, width: 180, paddingRight: 20, marginRight: 4,
          borderRight: "1px solid rgba(124,92,191,0.12)",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          <span style={{
            display: "inline-block", alignSelf: "flex-start",
            fontSize: 9, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase",
            color: data.featured.accent, background: `${data.featured.accent}15`,
            border: `1px solid ${data.featured.accent}2e`, borderRadius: 20, padding: "3px 10px",
          }}>{data.featured.tag}</span>
          <p className={cormorant.className} style={{ fontSize: 24, fontWeight: 500, lineHeight: 1.2, color: "#1e1030", margin: 0 }}>
            {data.featured.title}
          </p>
          <p style={{ fontSize: 12, fontWeight: 300, lineHeight: 1.6, color: "#7a6a99", margin: 0 }}>
            {data.featured.subtitle}
          </p>
          <a href="/collections" style={{
            display: "inline-flex", alignItems: "center", gap: 5, marginTop: 6,
            fontSize: 10, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase",
            color: data.featured.accent, textDecoration: "none",
          }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            View All
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>
          <svg width="32" height="32" viewBox="0 0 28 28" fill="none" style={{ opacity: 0.12, marginTop: 6 }}>
            <polygon points="14,1 27,14 14,27 1,14" fill="#7c5cbf" />
            <polygon points="14,6 22,14 14,22 6,14" fill="#c084fc" />
          </svg>
        </div>

        {/* Category columns — ALL categories, wrapping onto new rows */}
        <div
          style={{
            flex: 1, minWidth: 0,
            display: "grid",
            gridTemplateColumns: `repeat(auto-fill, minmax(${COL_W - 20}px, 1fr))`,
            rowGap: 26,
            alignItems: "start",
          }}
        >
          {data.columns.map((col, ci) => (
            <div key={col.name} className="empavai-col" style={{
              display: "flex", flexDirection: "column",
              paddingLeft: 18, paddingRight: 18,
              opacity: show && visible ? 1 : 0,
              transform: show && visible ? "translateY(0)" : "translateY(8px)",
              transition: `opacity 0.28s ease ${50 + ci * 55}ms, transform 0.28s cubic-bezier(0.4,0,0.2,1) ${50 + ci * 55}ms`,
            }}>
              <a href={`/collections/${encodeURIComponent(col.name)}`} style={{
                display: "flex", alignItems: "flex-start", gap: 8,
                textDecoration: "none", marginBottom: 10, paddingBottom: 10,
                borderBottom: `1px solid ${col.color}22`,
              }}>
                <span style={{ display: "block", width: 3, height: 32, borderRadius: 2, background: col.color, flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: "0.04em", color: "#1e1030" }}>{col.name}</div>
                  <div style={{ fontSize: 11, fontWeight: 300, color: "#a090bb", marginTop: 3 }}>{col.subtitle}</div>
                </div>
              </a>
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                {col.products.map((prod) => (
                  <ProductLink key={prod.slug} prod={prod} color={col.color} />
                ))}
              </div>
              <a href={`/collections/${encodeURIComponent(col.name)}`} style={{
                display: "inline-flex", alignItems: "center", gap: 4, marginTop: 12,
                fontSize: 9.5, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase",
                color: col.color, textDecoration: "none", opacity: 0.65, transition: "opacity 0.2s ease",
              }}
                onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
                onMouseLeave={e => (e.currentTarget.style.opacity = "0.65")}
              >
                See all
                <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                </svg>
              </a>
            </div>
          ))}
          {data.columns.length === 0 && (
            <div style={{ padding: "8px 24px", color: "#9a8cb5", fontSize: 13 }}>No collections yet.</div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Sacred Spaces dropdown ────────────────────────────────────────────────────
const SacredPanel = ({ visible }: { visible: boolean }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let raf: number;
    if (visible) raf = requestAnimationFrame(() => setShow(true));
    else setShow(false);
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  return (
    <div style={{
      position: "absolute", top: "calc(100% + 14px)", left: "50%",
      transform: show && visible ? "translateX(-50%) translateY(0) scale(1)" : "translateX(-50%) translateY(-8px) scale(0.98)",
      zIndex: 1100, pointerEvents: visible ? "auto" : "none",
      opacity: show && visible ? 1 : 0, transformOrigin: "top center",
      transition: "opacity 0.24s ease, transform 0.26s cubic-bezier(0.4,0,0.2,1)",
    }}>
      <div style={{
        position: "absolute", top: -6, left: "50%", marginLeft: -6, width: 12, height: 12,
        background: "rgba(250,248,255,0.98)",
        border: "1px solid rgba(124,92,191,0.13)", borderBottom: "none", borderRight: "none",
        transform: "rotate(45deg)", zIndex: 1,
      }} />
      <div style={{
        position: "relative", zIndex: 2, background: "rgba(250,248,255,0.98)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(124,92,191,0.13)", borderRadius: 14,
        boxShadow: "0 16px 48px rgba(50,15,100,0.14)", padding: "16px 12px", minWidth: 210,
      }}>
        <div style={{ paddingLeft: 10, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "block", width: 3, height: 10, borderRadius: 2, background: "#9b4dca", flexShrink: 0 }} />
          <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9b4dca" }}>Connect</span>
        </div>
        {SACRED_LINKS.map(link => <SacredLinkRow key={link.href} link={link} />)}
      </div>
    </div>
  );
};

// ── Stones dropdown ────────────────────────────────────────────────────────────
const StonesPanel = ({ visible, stoneLinks }: { visible: boolean; stoneLinks: StoneLink[] }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let raf: number;
    if (visible) raf = requestAnimationFrame(() => setShow(true));
    else setShow(false);
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  return (
    <div style={{
      position: "absolute", top: "calc(100% + 14px)", left: "50%",
      transform: show && visible ? "translateX(-50%) translateY(0) scale(1)" : "translateX(-50%) translateY(-8px) scale(0.98)",
      zIndex: 1100, pointerEvents: visible ? "auto" : "none",
      opacity: show && visible ? 1 : 0, transformOrigin: "top center",
      transition: "opacity 0.24s ease, transform 0.26s cubic-bezier(0.4,0,0.2,1)",
    }}>
      <div style={{
        position: "absolute", top: -6, left: "50%", marginLeft: -6, width: 12, height: 12,
        background: "rgba(250,248,255,0.98)",
        border: "1px solid rgba(124,92,191,0.13)", borderBottom: "none", borderRight: "none",
        transform: "rotate(45deg)", zIndex: 1,
      }} />
      <div style={{
        position: "relative", zIndex: 2, background: "rgba(250,248,255,0.98)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(124,92,191,0.13)", borderRadius: 14,
        boxShadow: "0 16px 48px rgba(50,15,100,0.14)", padding: "16px 12px", minWidth: 240,
      }}>
        <div style={{ paddingLeft: 10, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ display: "block", width: 3, height: 10, borderRadius: 2, background: "#7B4BA0", flexShrink: 0 }} />
          <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: "#7B4BA0" }}>Crystal Wisdom</span>
        </div>
        {stoneLinks.map(link => <StoneLinkRow key={link.href} link={link} />)}
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(123,75,160,0.1)", paddingLeft: 10 }}>
          <a href="/stones" style={{
            display: "inline-flex", alignItems: "center", gap: 5,
            fontSize: 9, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase",
            color: "#7B4BA0", textDecoration: "none",
          }}
            onMouseEnter={e => (e.currentTarget.style.opacity = "0.7")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            View Full Collection
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

// ── Nav item ──────────────────────────────────────────────────────────────────
interface NavItemDef { label: string; href: string; hasDropdown: boolean; }

const NavItem = ({
  item, navHidden, openMenu, setOpenMenu, collectionsData, stoneLinks,
}: {
  item: NavItemDef; navHidden: boolean;
  openMenu: string | null; setOpenMenu: React.Dispatch<React.SetStateAction<string | null>>;
  collectionsData: DropData; stoneLinks: StoneLink[];
}) => {
  const timeout    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const anchorRef  = useRef<HTMLDivElement>(null);
  const isOpen     = openMenu === item.label;

  const show = () => { if (timeout.current) clearTimeout(timeout.current); if (!navHidden && item.hasDropdown) setOpenMenu(item.label); };
  const hide = () => { timeout.current = setTimeout(() => setOpenMenu(p => p === item.label ? null : p), 130); };
  useEffect(() => { if (navHidden) setOpenMenu(null); }, [navHidden, setOpenMenu]);

  return (
    <div
      ref={anchorRef}
      style={{ position: "relative" }}
      onMouseEnter={show}
      onMouseLeave={hide}
    >
      <a href={item.href} className="empavai-navlink"
        style={{ display: "flex", alignItems: "center", gap: 4, color: isOpen ? "#7c5cbf" : undefined }}>
        {item.label}
        {item.hasDropdown && (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
            style={{ transition: "transform 0.22s ease", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", opacity: 0.5 }}>
            <polyline points="2,3.5 5,6.5 8,3.5" />
          </svg>
        )}
      </a>
      {item.hasDropdown && (
        <div style={{
          position: "absolute", bottom: -2, left: "50%", transform: "translateX(-50%)",
          width: isOpen ? "100%" : "0%", height: 2, borderRadius: 1,
          background: "linear-gradient(90deg, #c084fc, #7c5cbf)",
          transition: "width 0.26s cubic-bezier(0.4,0,0.2,1)",
        }} />
      )}
      {item.label === "COLLECTIONS"    && <CollectionsPanel data={collectionsData} visible={isOpen} anchorRef={anchorRef} />}
      {item.label === "ABOUT"          && <SacredPanel visible={isOpen} />}
      {item.label === "CRYSTAL WISDOM" && <StonesPanel visible={isOpen} stoneLinks={stoneLinks} />}
    </div>
  );
};

// ── Main Navbar ───────────────────────────────────────────────────────────────
export default function ElegantNavbar() {
  const [isScrolled,      setIsScrolled]      = useState(false);
  const [isHidden,        setIsHidden]         = useState(false);
  const [mobileOpen,      setMobileOpen]       = useState(false);
  const [mobileExp,       setMobileExp]        = useState<string | null>(null);
  const [openMenu,        setOpenMenu]         = useState<string | null>(null);
  const [collectionsData, setCollectionsData]  = useState<DropData>(buildDropData([], []));
  const [stoneLinks,      setStoneLinks]       = useState<StoneLink[]>(buildStoneLinks([]));
  const lastY = useRef(0);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    // one failing endpoint must not break the others
    const load = async (path: string): Promise<any[]> => {
      try {
        const res = await fetch(`${API_BASE}${path}`, { signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return toArray(await res.json());
      } catch (e: any) {
        if (e.name !== "AbortError") console.error(`Navbar fetch error (${path})`, e);
        return [];
      }
    };

    (async () => {
      const [categories, products, stones] = await Promise.all([
        load("/api/categories"),
        load("/api/products"),
        load("/api/stones"),
      ]);
      if (signal.aborted) return;
      setCollectionsData(buildDropData(categories as Category[], products as Product[]));
      setStoneLinks(buildStoneLinks(stones as Stone[]));
    })();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 40);
      if (y < 10)                                { setIsHidden(false); }
      else if (y > lastY.current + 6 && y > 100) { setIsHidden(true); setMobileOpen(false); setOpenMenu(null); }
      else if (y < lastY.current - 6)            { setIsHidden(false); }
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const NAV_ITEMS: NavItemDef[] = [
    { label: "HOME",           href: "/",             hasDropdown: false },
    { label: "COLLECTIONS",    href: "/collections",  hasDropdown: true  },
    { label: "CRYSTAL WISDOM", href: "/stones",       hasDropdown: true  },
    { label: "ABOUT",          href: "/about-us",     hasDropdown: false },
    { label: "TESTIMONIALS",   href: "/testimonials", hasDropdown: false },
    { label: "CONTACT",        href: "/contact",      hasDropdown: false },
  ];

  return (
    <>
      <style>{`
        .empavai-navlink {
          font-size: 11px; font-weight: 500; letter-spacing: 0.14em; color: #4a3966;
          text-decoration: none; padding: 6px 2px; position: relative;
          transition: color 0.22s ease; white-space: nowrap; cursor: pointer;
        }
        .empavai-navlink:hover { color: #7c5cbf; }

        .empavai-contactbtn {
          font-size: 11px; font-weight: 600; letter-spacing: 0.14em; color: #fff !important;
          background: #7c5cbf; border: none; border-radius: 50px; padding: 9px 22px;
          cursor: pointer; text-decoration: none; display: inline-block;
          transition: background 0.22s ease, transform 0.18s ease, box-shadow 0.22s ease;
          box-shadow: 0 2px 12px rgba(124,92,191,0.28); white-space: nowrap;
        }
        .empavai-contactbtn:hover { background: #6344a8; transform: translateY(-1px); box-shadow: 0 4px 18px rgba(124,92,191,0.38); }

        .en-ham { display: none; flex-direction: column; gap: 5px; background: none; border: none; cursor: pointer; padding: 6px; }
        .en-ham span { display: block; width: 22px; height: 1.5px; background: #4a3966; transition: all 0.28s ease; }

        .en-mob-drawer {
          display: none; position: fixed; top: 64px; left: 0; right: 0;
          background: rgba(250,248,255,0.99); backdrop-filter: blur(16px);
          border-bottom: 1px solid rgba(124,92,191,0.1);
          flex-direction: column; z-index: 998;
          max-height: calc(100vh - 64px); overflow-y: auto;
          transform: translateY(-8px); opacity: 0; pointer-events: none;
          transition: transform 0.3s ease, opacity 0.3s ease;
        }
        .en-mob-drawer.open { opacity: 1; transform: translateY(0); pointer-events: auto; }
        .en-mob-row { border-bottom: 1px solid rgba(124,92,191,0.06); }
        .en-mob-trigger {
          display: flex; align-items: center; justify-content: space-between;
          width: 100%; padding: 15px 28px; background: none; border: none; cursor: pointer;
          font-size: 11px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase;
          color: #4a3966; text-align: left; transition: color 0.2s ease; text-decoration: none;
        }
        .en-mob-trigger:hover { color: #7c5cbf; }
        .en-mob-content { padding: 0 20px 20px 28px; }
        .en-mob-viewall {
          display: inline-flex; align-items: center; gap: 6px; margin-bottom: 16px;
          font-size: 9px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase;
          color: #7c5cbf; text-decoration: none;
        }
        .en-mob-prod-link {
          display: flex; align-items: center; justify-content: space-between;
          padding: 8px 8px 8px 16px; border-radius: 6px; text-decoration: none;
          font-size: 13px; color: #4a3a6a; margin-bottom: 2px; transition: background 0.18s ease;
        }
        .en-mob-prod-link:hover { background: rgba(124,92,191,0.07); color: #7c5cbf; }

        /* ── Desktop nav: centred absolutely inside the nav bar ── */
        .empavai-desknav {
          display: flex;
          align-items: center;
          gap: 24px;
          position: absolute;
          left: 50%;
          transform: translateX(-50%);
          /* CRITICAL: overflow visible so dropdowns are not clipped */
          overflow: visible;
        }

        .empavai-col { border-right: 1px solid rgba(124,92,191,0.09); }
        .empavai-col:last-child { border-right: none; }

        @media (max-width: 1100px) { .empavai-desknav { gap: 16px; } }
        @media (max-width: 900px) {
          .empavai-desknav { display: none !important; }
          .empavai-deskbtn { display: none !important; }
          .en-ham          { display: flex !important; }
          .en-mob-drawer   { display: flex !important; }
          .empavai-sub     { display: none !important; }
        }
      `}</style>

      <nav
        aria-label="Main navigation"
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 1060,
          height: 64, display: "flex", alignItems: "center", padding: "0 32px",
          background: "rgba(248,246,254,0.97)",
          backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
          borderBottom: isScrolled ? "1px solid rgba(124,92,191,0.14)" : "1px solid rgba(124,92,191,0.07)",
          boxShadow: isScrolled ? "0 4px 28px rgba(80,30,140,0.1)" : "none",
          transition: "transform 0.38s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s ease",
          transform: isHidden ? "translateY(-100%)" : "translateY(0)",
          // CRITICAL: allow dropdown to overflow the nav bar
          overflow: "visible",
        }}
      >
        {/* Logo */}
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", flexShrink: 0 }}>
          <Logo />
          <div style={{ lineHeight: 1 }}>
            <div className={cormorant.className} style={{ fontSize: 17, fontWeight: 600, letterSpacing: "0.22em", color: "#2e1f4a", textTransform: "uppercase" }}>
              EMPAVAI
            </div>
            <div className={`empavai-sub ${jost.className}`} style={{ fontSize: 8.5, fontWeight: 400, letterSpacing: "0.22em", color: "#9b82c4", textTransform: "uppercase", marginTop: 2 }}>
              ART &amp; ADORNMENTS
            </div>
          </div>
        </a>

        {/* Desktop nav — centred absolutely, overflow visible */}
        <div className={`empavai-desknav ${jost.className}`}>
          {NAV_ITEMS.map(item => (
            <NavItem key={item.label} item={item} navHidden={isHidden}
              openMenu={openMenu} setOpenMenu={setOpenMenu}
              collectionsData={collectionsData} stoneLinks={stoneLinks} />
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <a href="/contact" className={`empavai-contactbtn empavai-deskbtn ${jost.className}`}>
          CONTACT US
        </a>

        {/* Hamburger */}
        <button className="en-ham" onClick={() => setMobileOpen(v => !v)}
          aria-label={mobileOpen ? "Close" : "Menu"} aria-expanded={mobileOpen}>
          <span style={{ transform: mobileOpen ? "rotate(45deg) translate(5px,5px)"   : "none" }} />
          <span style={{ opacity: mobileOpen ? 0 : 1 }} />
          <span style={{ transform: mobileOpen ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
        </button>
      </nav>

      {/* ── Mobile drawer ── */}
      <div className={`en-mob-drawer ${jost.className}${mobileOpen ? " open" : ""}`} aria-hidden={!mobileOpen}>
        {NAV_ITEMS.map(item => {
          const expanded = mobileExp === item.label;

          if (!item.hasDropdown) {
            return (
              <div key={item.label} className="en-mob-row">
                <a href={item.href} className="en-mob-trigger" onClick={() => setMobileOpen(false)}>{item.label}</a>
              </div>
            );
          }

          if (item.label === "ABOUT") {
            return (
              <div key={item.label} className="en-mob-row">
                <button className="en-mob-trigger" onClick={() => setMobileExp(expanded ? null : item.label)} aria-expanded={expanded}>
                  {item.label}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <polyline points={expanded ? "2,8 6,4 10,8" : "2,4 6,8 10,4"} />
                  </svg>
                </button>
                {expanded && (
                  <div className="en-mob-content">
                    {SACRED_LINKS.map(link => (
                      <a key={link.href} href={link.href} className="en-mob-prod-link" onClick={() => setMobileOpen(false)}>
                        <span>{link.label}</span>
                        <span style={{ fontSize: 10, color: "#a090bb" }}>{link.sub}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          if (item.label === "CRYSTAL WISDOM") {
            return (
              <div key={item.label} className="en-mob-row">
                <button className="en-mob-trigger" onClick={() => setMobileExp(expanded ? null : item.label)} aria-expanded={expanded}>
                  {item.label}
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <polyline points={expanded ? "2,8 6,4 10,8" : "2,4 6,8 10,4"} />
                  </svg>
                </button>
                {expanded && (
                  <div className="en-mob-content">
                    <a href="/stones" className="en-mob-viewall" onClick={() => setMobileOpen(false)}>
                      View Full Collection
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                      </svg>
                    </a>
                    {stoneLinks.slice(1).map(link => (
                      <a key={link.href} href={link.href} className="en-mob-prod-link" onClick={() => setMobileOpen(false)}>
                        <span>{link.label}</span>
                        <span style={{ fontSize: 10, color: "#a090bb" }}>{link.sub}</span>
                      </a>
                    ))}
                  </div>
                )}
              </div>
            );
          }

          // COLLECTIONS mobile
          return (
            <div key={item.label} className="en-mob-row">
              <button className="en-mob-trigger" onClick={() => setMobileExp(expanded ? null : item.label)} aria-expanded={expanded}>
                {item.label}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <polyline points={expanded ? "2,8 6,4 10,8" : "2,4 6,8 10,4"} />
                </svg>
              </button>
              {expanded && (
                <div className="en-mob-content">
                  <a href="/collections" className="en-mob-viewall" onClick={() => setMobileOpen(false)}>
                    View All Collections
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </a>
                  {collectionsData.columns.map(col => (
                    <div key={col.name} style={{ marginBottom: 18 }}>
                      <a href={`/collections/${encodeURIComponent(col.name)}`}
                        onClick={() => setMobileOpen(false)}
                        style={{
                          display: "flex", alignItems: "center", gap: 8,
                          textDecoration: "none", paddingBottom: 8, marginBottom: 4,
                          borderBottom: `1px solid ${col.color}22`,
                        }}>
                        <span style={{ display: "block", width: 3, height: 16, borderRadius: 2, background: col.color, flexShrink: 0 }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: "#1e1030" }}>{col.name}</span>
                        <span style={{ fontSize: 10, color: "#a090bb", fontWeight: 300 }}>{col.subtitle}</span>
                      </a>
                      {col.products.map(prod => (
                        <a key={prod.slug} href={`/product/${prod.slug}`}
                          className="en-mob-prod-link" onClick={() => setMobileOpen(false)}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span>{prod.name}</span>
                            {prod.isNew && (
                              <span style={{
                                fontSize: 7, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase",
                                color: "#fff", background: col.color, padding: "1.5px 5px", borderRadius: 8,
                              }}>NEW</span>
                            )}
                          </div>
                        </a>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        <div style={{ padding: "16px 28px 20px" }}>
          <a href="/contact" className="empavai-contactbtn"
            style={{ textAlign: "center", width: "100%", display: "block" }}
            onClick={() => setMobileOpen(false)}>
            CONTACT US
          </a>
        </div>
      </div>
    </>
  );
}