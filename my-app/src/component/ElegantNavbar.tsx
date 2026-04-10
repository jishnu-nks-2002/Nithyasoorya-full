'use client';

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Jost, Cormorant_Garamond } from "next/font/google";

const jost = Jost({ weight: ["300", "400", "500", "600"], subsets: ["latin"], display: "swap" });
const cormorant = Cormorant_Garamond({ weight: ["300", "400", "500", "600"], subsets: ["latin"], display: "swap" });

const DROPDOWN_DATA = {
  COLLECTIONS: {
    featured: { title: "New Arrivals", subtitle: "Handcrafted with intention", accent: "#7c5cbf", tag: "Just In" },
    sections: [
      {
        brand: "Nithyasoori", brandColor: "#9b6fe0",
        links: [
          { label: "Crystal Art Decor",    sub: "Wall & shelf pieces",    href: "/collections/product-1" },
          { label: "Aura Trinket Trays",   sub: "Desk & vanity",          href: "/collections/aura-trinket-trays" },
          { label: "Floating Flora Bowls", sub: "Botanical centerpieces", href: "/collections/floating-flora-bowls" },
        ],
      },
      {
        brand: "Enjem", brandColor: "#c084fc",
        links: [
          { label: "Crystal Bracelets", sub: "Healing & intention", href: "/collections/crystal-bracelets" },
          { label: "Crystal Pendants",  sub: "Wearable energy",     href: "/collections/crystal-pendants" },
        ],
      },
      {
        brand: "Crystal Wisdom", brandColor: "#7b2fbf",
        links: [
          { label: "Chakra Connection", sub: "Alignment guides", href: "/collections/chakra-connection" },
          { label: "Zodiac Alignment",  sub: "Star & stone",     href: "/collections/zodiac-alignment" },
          { label: "Care & Cleanse",    sub: "Crystal rituals",  href: "/collections/care-cleanse" },
        ],
      },
    ],
  },
  "SACRED SPACES": {
    featured: { title: "Our Story", subtitle: "Rooted in crystal energy & artisan craft", accent: "#9b4dca", tag: "Est. 2019" },
    sections: [
      {
        brand: "Connect", brandColor: "#7c5cbf",
        links: [
          { label: "About",   sub: "Who we are",               href: "/about-us" },
          { label: "Artists", sub: "Stories from our Artists", href: "/artists" },
          { label: "Contact", sub: "Reach out",                href: "/contact" },
        ],
      },
    ],
  },
};

const NAV_ITEMS = [
  { label: "HOME",          href: "/",            hasDropdown: false },
  { label: "SACRED SPACES", href: "/about-us",    hasDropdown: true  },
  { label: "COLLECTIONS",   href: "/collections", hasDropdown: true  },
];

// ── Logo ──────────────────────────────────────────────────────────────────────
const Logo = () => {
  const [imgError, setImgError] = useState(false);
  if (imgError) {
    return (
      <svg width="36" height="36" viewBox="0 0 28 28" fill="none" aria-hidden="true">
        <polygon points="14,2 26,14 14,26 2,14" fill="none" stroke="#7c5cbf" strokeWidth="1.8" />
        <polygon points="14,6 22,14 14,22 6,14" fill="none" stroke="#7c5cbf" strokeWidth="1" opacity="0.4" />
        <circle cx="14" cy="14" r="2" fill="#7c5cbf" opacity="0.7" />
      </svg>
    );
  }
  return (
    <Image
      src="/images/logo.jpeg"
      alt="Empavai logo"
      width={40}
      height={40}
      onError={() => setImgError(true)}
      style={{ objectFit: "contain", height: 40, width: "auto" }}
    />
  );
};

// ── DropLink ──────────────────────────────────────────────────────────────────
interface LinkData { label: string; sub?: string; href: string }

const DropLink = ({ link, accentColor }: { link: LinkData; accentColor: string }) => {
  const [hov, setHov] = useState(false);
  return (
    <a
      href={link.href}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: "flex", flexDirection: "column", gap: 1,
        padding: "6px 10px", borderRadius: 7, textDecoration: "none",
        borderLeft: `2px solid ${hov ? accentColor : "transparent"}`,
        background: hov ? `${accentColor}0d` : "transparent",
        transform: hov ? "translateX(3px)" : "translateX(0)",
        transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)", whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontSize: 12.5, fontWeight: hov ? 500 : 400, color: hov ? accentColor : "#2e1f4a", transition: "color 0.2s ease", letterSpacing: "0.01em" }}>
        {link.label}
      </span>
      {link.sub && (
        <span style={{ fontSize: 10, fontWeight: 300, color: hov ? `${accentColor}99` : "#a090bb", transition: "color 0.2s ease" }}>
          {link.sub}
        </span>
      )}
    </a>
  );
};

// ── DropPanel ─────────────────────────────────────────────────────────────────
type DropData = typeof DROPDOWN_DATA["COLLECTIONS"];

const DropPanel = ({ data, visible, alignRight }: { data: DropData; visible: boolean; alignRight: boolean }) => {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let raf: number;
    if (visible) { raf = requestAnimationFrame(() => setShow(true)); }
    else { setShow(false); }
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  const isMulti = data.sections.length > 1;

  return (
    <div style={{
      position: "absolute", top: "calc(100% + 14px)",
      ...(alignRight ? { right: 0 } : { left: 0 }),
      zIndex: 1100, pointerEvents: visible ? "auto" : "none",
      opacity: show && visible ? 1 : 0,
      transform: show && visible ? "translateY(0) scale(1)" : "translateY(-8px) scale(0.98)",
      transformOrigin: alignRight ? "top right" : "top left",
      transition: "opacity 0.24s ease, transform 0.26s cubic-bezier(0.4,0,0.2,1)",
    }} aria-hidden={!visible}>

      {/* Caret */}
      <div style={{
        position: "absolute", top: -6,
        ...(alignRight ? { right: 18 } : { left: 18 }),
        width: 12, height: 12,
        background: "rgba(250,248,255,0.98)",
        border: "1px solid rgba(124,92,191,0.13)",
        borderBottom: "none", borderRight: "none",
        transform: "rotate(45deg)",
        boxShadow: "-2px -2px 5px rgba(80,30,140,0.04)", zIndex: 1,
      }} />

      {/* Panel */}
      <div style={{
        position: "relative", zIndex: 2,
        background: "rgba(250,248,255,0.98)",
        backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
        border: "1px solid rgba(124,92,191,0.13)", borderRadius: 14,
        boxShadow: "0 16px 48px rgba(50,15,100,0.14), 0 2px 8px rgba(50,15,100,0.06)",
        padding: "20px 18px 18px",
        display: "flex", gap: isMulti ? 20 : 0, alignItems: "flex-start",
      }}>
        {/* Featured strip */}
        <div style={{
          flexShrink: 0, width: 148, paddingRight: 16,
          borderRight: "1px solid rgba(124,92,191,0.11)",
          marginRight: isMulti ? 4 : 8,
          display: "flex", flexDirection: "column", gap: 8, paddingTop: 2,
        }}>
          <span style={{
            display: "inline-block", alignSelf: "flex-start",
            fontSize: 8.5, fontWeight: 600, letterSpacing: "0.18em", textTransform: "uppercase",
            color: data.featured.accent, background: `${data.featured.accent}15`,
            border: `1px solid ${data.featured.accent}2e`, borderRadius: 20, padding: "2.5px 9px",
          }}>{data.featured.tag}</span>
          <p className={cormorant.className} style={{ fontSize: 20, fontWeight: 500, lineHeight: 1.2, color: "#1e1030", margin: 0 }}>{data.featured.title}</p>
          <p style={{ fontSize: 10.5, fontWeight: 300, lineHeight: 1.55, color: "#7a6a99", margin: 0 }}>{data.featured.subtitle}</p>
          <a
            href={data.sections[0]?.brand === "Connect" ? "/about-us" : "/collections"}
            style={{
              display: "inline-flex", alignItems: "center", gap: 5,
              fontSize: 9, fontWeight: 500, letterSpacing: "0.18em", textTransform: "uppercase",
              color: data.featured.accent, textDecoration: "none", marginTop: 4, transition: "opacity 0.2s ease",
            }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.7"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
          >
            View All
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none" style={{ opacity: 0.15, marginTop: 2 }}>
            <polygon points="14,1 27,14 14,27 1,14" fill="#7c5cbf" />
            <polygon points="14,6 22,14 14,22 6,14" fill="#c084fc" />
          </svg>
        </div>

        {/* Link columns */}
        <div style={{ display: "flex", gap: isMulti ? 16 : 0 }}>
          {data.sections.map((section, si) => (
            <div key={section.brand} style={{
              minWidth: 140, opacity: show && visible ? 1 : 0,
              transform: show && visible ? "translateY(0)" : "translateY(8px)",
              transition: `opacity 0.28s ease ${60 + si * 65}ms, transform 0.28s cubic-bezier(0.4,0,0.2,1) ${60 + si * 65}ms`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, paddingLeft: 10 }}>
                <span style={{ display: "block", width: 3, height: 11, borderRadius: 2, background: section.brandColor, flexShrink: 0 }} />
                <span style={{ fontSize: 8.5, fontWeight: 700, letterSpacing: "0.2em", textTransform: "uppercase", color: section.brandColor }}>{section.brand}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {section.links.map(link => <DropLink key={link.label} link={link} accentColor={section.brandColor} />)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ── NavItem ───────────────────────────────────────────────────────────────────
const NavItem = ({ item, navHidden, openMenu, setOpenMenu }: {
  item: typeof NAV_ITEMS[0];
  navHidden: boolean;
  openMenu: string | null;
  setOpenMenu: React.Dispatch<React.SetStateAction<string | null>>;
}) => {
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isOpen  = openMenu === item.label;
  const dropData = DROPDOWN_DATA[item.label as keyof typeof DROPDOWN_DATA];
  const alignRight = item.label === "COLLECTIONS";

  const show = () => { if (timeout.current) clearTimeout(timeout.current); if (!navHidden && item.hasDropdown) setOpenMenu(item.label); };
  const hide = () => { timeout.current = setTimeout(() => setOpenMenu(p => p === item.label ? null : p), 130); };

  useEffect(() => { if (navHidden) setOpenMenu(null); }, [navHidden, setOpenMenu]);

  return (
    <div style={{ position: "relative" }} onMouseEnter={show} onMouseLeave={hide}>
      <a
        href={item.href}
        className="empavai-navlink"
        style={{ display: "flex", alignItems: "center", gap: 4, color: isOpen ? "#7c5cbf" : undefined }}
        aria-haspopup={!!item.hasDropdown}
        aria-expanded={item.hasDropdown ? isOpen : undefined}
      >
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
      {item.hasDropdown && dropData && <DropPanel data={dropData} visible={isOpen} alignRight={alignRight} />}
    </div>
  );
};

// ── Main Navbar ───────────────────────────────────────────────────────────────
export default function ElegantNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden,   setIsHidden]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExp,  setMobileExp]  = useState<string | null>(null);
  const [openMenu,   setOpenMenu]   = useState<string | null>(null);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setIsScrolled(y > 40);
      if (y < 10)                            { setIsHidden(false); }
      else if (y > lastY.current + 6 && y > 100) { setIsHidden(true); setMobileOpen(false); setOpenMenu(null); }
      else if (y < lastY.current - 6)        { setIsHidden(false); }
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        .empavai-navlink {
          font-size: 11px; font-weight: 500; letter-spacing: 0.14em; color: #4a3966;
          text-decoration: none; padding: 6px 2px; position: relative;
          transition: color 0.22s ease; white-space: nowrap; cursor: pointer;
        }
        .empavai-navlink:hover { color: #7c5cbf; }

        .empavai-shopbtn {
          font-size: 11px; font-weight: 600; letter-spacing: 0.14em; color: #fff !important;
          background: #7c5cbf; border: none; border-radius: 50px; padding: 9px 22px;
          cursor: pointer; text-decoration: none; display: inline-block;
          transition: background 0.22s ease, transform 0.18s ease, box-shadow 0.22s ease;
          box-shadow: 0 2px 12px rgba(124,92,191,0.28); white-space: nowrap;
        }
        .empavai-shopbtn:hover { background: #6344a8; transform: translateY(-1px); box-shadow: 0 4px 18px rgba(124,92,191,0.38); }

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
          color: #4a3966; text-decoration: none; text-align: left; transition: color 0.2s ease;
        }
        .en-mob-trigger:hover { color: #7c5cbf; }
        .en-mob-links { padding: 0 20px 16px 28px; display: flex; flex-direction: column; }
        .en-mob-brand { display: flex; align-items: center; gap: 6px; padding: 10px 0 6px; font-size: 9px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase; }
        .en-mob-link  { display: flex; flex-direction: column; gap: 1px; padding: 7px 8px; border-radius: 7px; text-decoration: none; margin-bottom: 2px; transition: background 0.18s ease; }
        .en-mob-link:hover { background: rgba(124,92,191,0.06); }
        .en-mob-link-label { font-size: 12.5px; font-weight: 400; color: #2e1f4a; }
        .en-mob-link-sub   { font-size: 10px;   font-weight: 300; color: #a090bb; }
        .en-mob-viewall {
          display: flex; align-items: center; gap: 6px; padding: 8px 28px 12px;
          font-size: 9px; font-weight: 600; letter-spacing: 0.2em; text-transform: uppercase;
          color: #7c5cbf; text-decoration: none; transition: opacity 0.2s ease;
        }
        .en-mob-viewall:hover { opacity: 0.7; }

        @media (max-width: 768px) {
          .empavai-desknav  { display: none !important; }
          .empavai-deskshop { display: none !important; }
          .en-ham           { display: flex !important; }
          .en-mob-drawer    { display: flex !important; }
          .empavai-sub      { display: none !important; }
        }
      `}</style>

      <nav
        aria-label="Main navigation"
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 1060,
          height: 64, display: "flex", alignItems: "center", padding: "0 40px",
          background: "rgba(248,246,254,0.97)",
          backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
          borderBottom: isScrolled ? "1px solid rgba(124,92,191,0.14)" : "1px solid rgba(124,92,191,0.07)",
          boxShadow: isScrolled ? "0 4px 28px rgba(80,30,140,0.1)" : "none",
          transition: "transform 0.38s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s ease",
          transform: isHidden ? "translateY(-100%)" : "translateY(0)",
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

        <div style={{ flex: 1 }} />

        {/* Desktop nav */}
        <div className={`empavai-desknav ${jost.className}`} style={{
          display: "flex", alignItems: "center", gap: 38,
          position: "absolute", left: "50%", transform: "translateX(-50%)",
        }}>
          {NAV_ITEMS.map(item => (
            <NavItem key={item.label} item={item} navHidden={isHidden} openMenu={openMenu} setOpenMenu={setOpenMenu} />
          ))}
        </div>

        <div style={{ flex: 1 }} />

        <a href="/collections" className={`empavai-shopbtn empavai-deskshop ${jost.className}`}>SHOP NOW</a>

        <button
          className="en-ham"
          onClick={() => setMobileOpen(v => !v)}
          aria-label={mobileOpen ? "Close" : "Menu"}
          aria-expanded={mobileOpen}
        >
          <span style={{ transform: mobileOpen ? "rotate(45deg) translate(5px,5px)"  : "none" }} />
          <span style={{ opacity: mobileOpen ? 0 : 1 }} />
          <span style={{ transform: mobileOpen ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
        </button>
      </nav>

      {/* Mobile drawer */}
      <div className={`en-mob-drawer ${jost.className}${mobileOpen ? " open" : ""}`} aria-hidden={!mobileOpen}>
        {NAV_ITEMS.map(item => {
          const dropData = DROPDOWN_DATA[item.label as keyof typeof DROPDOWN_DATA];
          const expanded = mobileExp === item.label;

          if (!dropData) {
            return (
              <div key={item.label} className="en-mob-row">
                <a href={item.href} className="en-mob-trigger" onClick={() => setMobileOpen(false)}>{item.label}</a>
              </div>
            );
          }

          return (
            <div key={item.label} className="en-mob-row">
              <button className="en-mob-trigger" onClick={() => setMobileExp(expanded ? null : item.label)} aria-expanded={expanded}>
                {item.label}
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                  <polyline points={expanded ? "2,8 6,4 10,8" : "2,4 6,8 10,4"} />
                </svg>
              </button>
              {expanded && (
                <div className="en-mob-links">
                  <a href={item.href} className="en-mob-viewall" onClick={() => setMobileOpen(false)}>
                    View All {item.label === "COLLECTIONS" ? "Collections" : "Sacred Spaces"}
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </a>
                  {dropData.sections.map(section => (
                    <div key={section.brand}>
                      <div className="en-mob-brand" style={{ color: section.brandColor }}>
                        <span style={{ display: "block", width: 3, height: 10, borderRadius: 2, background: section.brandColor, flexShrink: 0 }} />
                        {section.brand}
                      </div>
                      {section.links.map(link => (
                        <a key={link.label} href={link.href} className="en-mob-link" onClick={() => setMobileOpen(false)}>
                          <span className="en-mob-link-label">{link.label}</span>
                          {link.sub && <span className="en-mob-link-sub">{link.sub}</span>}
                        </a>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <div style={{ padding: "16px 28px 8px" }}>
          <a href="/collections" className="empavai-shopbtn" style={{ textAlign: "center", width: "100%", display: "block" }} onClick={() => setMobileOpen(false)}>
            SHOP NOW
          </a>
        </div>
      </div>
    </>
  );
}