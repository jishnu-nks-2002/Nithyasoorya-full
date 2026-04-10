'use client';

import { useState } from "react";

const ALL = "All";

const FILTERS = {
  material:     ["All", "Crystal", "Resin", "Amethyst", "Obsidian", "Copper"],
  series:       ["All", "Violet Series", "Lunar Vol", "Origin Series", "Flow Series", "Sacred"],
  availability: ["All", "Available", "Inquire", "Sold Out"],
};

const products = [
  { id: 1, name: "Eternal Koi Reflection",  series: "Sacred",        material: "Hand-painted Resin & Slate", availability: "Available", price: "$1,580", img: "/images/p-1.jpeg" },
  { id: 2, name: "Moonstone River",          series: "Lunar Vol",     material: "Moonstone & Silver Leaf",    availability: "Inquire",   price: "$2,100", img: "/images/p-2.jpeg" },
  { id: 3, name: "Sacred Geometry Shrine",   series: "Origin Series", material: "Obsidian & Gold Plating",   availability: "Inquire",   price: "$3,400", img: "/images/p-3.jpeg" },
  { id: 4, name: "Aetherial Flux I",         series: "Violet Series", material: "Resin & Amethyst Chips",    availability: "Available", price: "$1,250", img: "/images/p-4.jpeg" },
  { id: 5, name: "Geode Resonance",          series: "Origin Series", material: "Amethyst & Brass",          availability: "Inquire",   price: "$2,800", img: "/images/p-5.jpeg" },
  { id: 6, name: "Selenic Fragment",         series: "Lunar Vol",     material: "Crystal & Silver Wire",     availability: "Available", price: "$1,890", img: "/images/p-6.jpeg" },
  { id: 7, name: "Copper Veil",              series: "Origin Series", material: "Copper & Raw Quartz",       availability: "Sold Out",  price: "$2,800", img: "/images/p-4.jpeg" },
  { id: 8, name: "Amethyst Cathedral",       series: "Violet Series", material: "Amethyst & Gold Leaf",     availability: "Available", price: "$4,200", img: "/images/p-2.jpeg" },
  { id: 9, name: "Prismatic Flow",           series: "Flow Series",   material: "Resin & Citrine",           availability: "Available", price: "$980",   img: "/images/p-1.jpeg" },
];

// ── Types ──────────────────────────────────────────────────────────────────────
interface Product {
  id: number;
  name: string;
  series: string;
  material: string;
  availability: string;
  price: string;
  img: string;
}

type FormState = {
  name: string;
  email: string;
  phone: string;
  message: string;
};

type FilterKey = "material" | "series" | "availability";

// ── FilterDropdown ─────────────────────────────────────────────────────────────
function FilterDropdown({ label, options, value, onChange }: {
  label: string;
  options: string[];
  value: string;
  onChange: (val: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const active = value !== ALL;
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "7px 14px",
          fontFamily: "'Jost', sans-serif", fontSize: 10.5, fontWeight: 500,
          letterSpacing: "0.14em", textTransform: "uppercase",
          color: active ? "#6b3fa0" : "#6b5f85",
          background: active ? "rgba(107,63,160,0.07)" : "#fff",
          border: `1px solid ${active ? "rgba(107,63,160,0.35)" : "rgba(107,63,160,0.15)"}`,
          borderRadius: 3, cursor: "pointer", whiteSpace: "nowrap",
          transition: "all 0.22s ease",
        }}
      >
        {label}{active ? `: ${value}` : ""}
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
          style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none", opacity: 0.45 }}>
          <polyline points="2,3.5 5,6.5 8,3.5" />
        </svg>
      </button>
      {open && (
        <>
          <div style={{ position: "fixed", inset: 0, zIndex: 10 }} onClick={() => setOpen(false)} />
          <div style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0, zIndex: 20,
            background: "#fff", border: "1px solid rgba(107,63,160,0.12)",
            borderRadius: 8, padding: "6px", minWidth: 160,
            boxShadow: "0 12px 40px rgba(80,40,140,0.12)",
          }}>
            {options.map(opt => (
              <button key={opt} onClick={() => { onChange(opt); setOpen(false); }}
                style={{
                  display: "block", width: "100%", padding: "8px 12px",
                  background: opt === value ? "rgba(107,63,160,0.07)" : "transparent",
                  border: "none", borderRadius: 5,
                  fontFamily: "'Jost', sans-serif", fontSize: 12,
                  fontWeight: opt === value ? 500 : 300, letterSpacing: "0.06em",
                  color: opt === value ? "#6b3fa0" : "#4a3966",
                  cursor: "pointer", textAlign: "left", transition: "background 0.15s",
                }}
                onMouseEnter={e => { if (opt !== value) e.currentTarget.style.background = "rgba(107,63,160,0.04)"; }}
                onMouseLeave={e => { if (opt !== value) e.currentTarget.style.background = "transparent"; }}
              >{opt}</button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Product Card ───────────────────────────────────────────────────────────────
function ProductCard({ product, index, onInquire }: {
  product: Product;
  index: number;
  onInquire: (p: Product) => void;
}) {
  const [hov, setHov] = useState(false);
  const waText = encodeURIComponent(`Hello, I'm interested in "${product.name}" (${product.series}). Could you share more details?`);
  const waLink = `https://wa.me/919876543210?text=${waText}`;
  const soldOut = product.availability === "Sold Out";

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 10, overflow: "hidden",
        background: "#fff",
        border: `1px solid ${hov ? "rgba(107,63,160,0.18)" : "rgba(107,63,160,0.08)"}`,
        boxShadow: hov ? "0 16px 48px rgba(80,40,140,0.11)" : "0 2px 12px rgba(0,0,0,0.04)",
        transition: "border-color 0.3s ease, box-shadow 0.35s ease, transform 0.35s ease",
        transform: hov ? "translateY(-3px)" : "translateY(0)",
        animation: `cardReveal 0.55s cubic-bezier(0.16,1,0.3,1) ${index * 0.07}s both`,
        display: "flex", flexDirection: "column",
        cursor: "pointer",
      }}
    >
      {/* Photo */}
      <div style={{ position: "relative", overflow: "hidden", aspectRatio: "4/3", flexShrink: 0 }}>
        <img
          src={product.img}
          alt={product.name}
          style={{
            width: "100%", height: "100%", objectFit: "cover", display: "block",
            filter: `brightness(${hov ? 1.0 : 0.97}) saturate(${hov ? 1.05 : 0.95})`,
            transform: hov ? "scale(1.05)" : "scale(1)",
            transition: "transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94), filter 0.5s ease",
          }}
        />
        {/* Badges */}
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", gap: 6, zIndex: 2 }}>
          {product.availability === "Available" && (
            <span style={{
              padding: "4px 9px", borderRadius: 2,
              background: "rgba(255,255,255,0.92)", backdropFilter: "blur(6px)",
              border: "1px solid rgba(107,63,160,0.18)",
              fontFamily: "'Jost', sans-serif", fontSize: 7.5, fontWeight: 600,
              letterSpacing: "0.22em", textTransform: "uppercase", color: "#2d9e6a",
            }}>Available</span>
          )}
          {product.availability === "Inquire" && (
            <span style={{
              padding: "4px 9px", borderRadius: 2,
              background: "rgba(107,63,160,0.88)", backdropFilter: "blur(6px)",
              fontFamily: "'Jost', sans-serif", fontSize: 7.5, fontWeight: 600,
              letterSpacing: "0.22em", textTransform: "uppercase", color: "#fff",
            }}>Inquire</span>
          )}
          {soldOut && (
            <span style={{
              padding: "4px 9px", borderRadius: 2,
              background: "rgba(40,30,60,0.75)", backdropFilter: "blur(6px)",
              fontFamily: "'Jost', sans-serif", fontSize: 7.5, fontWeight: 600,
              letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.6)",
            }}>Sold Out</span>
          )}
        </div>

        {/* Hover overlay */}
        <div style={{
          position: "absolute", inset: 0, zIndex: 3,
          background: "linear-gradient(to top, rgba(20,8,45,0.55) 0%, transparent 50%)",
          opacity: hov ? 1 : 0,
          transition: "opacity 0.35s ease",
          display: "flex", alignItems: "flex-end", justifyContent: "center",
          padding: "0 16px 16px", gap: 8,
        }}>
          <a
            href={`/product/${product.id}`}
            onClick={e => e.stopPropagation()}
            style={{
              flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "9px 0",
              fontFamily: "'Jost', sans-serif", fontSize: 8.5, fontWeight: 500,
              letterSpacing: "0.2em", textTransform: "uppercase",
              color: "#fff", textDecoration: "none",
              background: "rgba(255,255,255,0.15)", backdropFilter: "blur(8px)",
              border: "1px solid rgba(255,255,255,0.3)", borderRadius: 3,
              transition: "background 0.25s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(255,255,255,0.25)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.15)"; }}
          >
            View
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
            </svg>
          </a>

          {!soldOut && (
            <a
              href={waLink} target="_blank" rel="noopener noreferrer"
              onClick={e => e.stopPropagation()} title="Chat on WhatsApp"
              style={{
                width: 36, height: 36,
                display: "inline-flex", alignItems: "center", justifyContent: "center",
                background: "rgba(37,160,96,0.85)", backdropFilter: "blur(8px)",
                border: "1px solid rgba(37,160,96,0.5)", borderRadius: 3,
                color: "#fff", textDecoration: "none",
                transition: "background 0.25s", flexShrink: 0,
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(37,160,96,1)"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(37,160,96,0.85)"; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.107 1.51 5.84L.057 23.454a.75.75 0 0 0 .918.943l5.78-1.516A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.696 9.696 0 0 1-4.953-1.357l-.355-.212-3.674.963.981-3.584-.232-.368A9.699 9.699 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
              </svg>
            </a>
          )}
        </div>
      </div>

      {/* Info block */}
      <div style={{ padding: "18px 20px 20px", display: "flex", flexDirection: "column", gap: 0, flex: 1 }}>
        <div style={{
          fontFamily: "'Jost', sans-serif", fontSize: 15, fontWeight: 500,
          color: "#1a1030", letterSpacing: "0.01em", marginBottom: 4, lineHeight: 1.3,
        }}>
          {product.name}
        </div>
        <div style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 13, fontStyle: "italic", fontWeight: 300,
          color: "#a090b8", letterSpacing: "0.02em", marginBottom: 14,
        }}>
          {product.material}
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginTop: "auto" }}>
          <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 15, fontWeight: 600, color: "#6b3fa0", letterSpacing: "0.02em" }}>
            {product.price}
          </span>

          {!soldOut && (
            <button
              onClick={() => onInquire(product)}
              style={{
                fontFamily: "'Jost', sans-serif", fontSize: 8.5, fontWeight: 500,
                letterSpacing: "0.2em", textTransform: "uppercase",
                color: "#6b3fa0", padding: "7px 16px", background: "transparent",
                border: "1.5px solid rgba(107,63,160,0.3)",
                borderRadius: 2, cursor: "pointer",
                backgroundImage: "linear-gradient(to right, #6b3fa0 50%, transparent 50%)",
                backgroundSize: "200% 100%", backgroundPosition: "right center",
                transition: "background-position 0.4s cubic-bezier(0.4,0,0.2,1), color 0.35s ease, border-color 0.35s ease",
              }}
              onMouseEnter={e => {
                e.currentTarget.style.backgroundPosition = "left center";
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.borderColor = "#6b3fa0";
              }}
              onMouseLeave={e => {
                e.currentTarget.style.backgroundPosition = "right center";
                e.currentTarget.style.color = "#6b3fa0";
                e.currentTarget.style.borderColor = "rgba(107,63,160,0.3)";
              }}
            >
              Inquire
            </button>
          )}
          {soldOut && (
            <span style={{
              fontFamily: "'Jost', sans-serif", fontSize: 8.5, fontWeight: 400,
              letterSpacing: "0.18em", textTransform: "uppercase", color: "#c0b0cc",
            }}>Sold Out</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Inquire Modal ──────────────────────────────────────────────────────────────
function InquireModal({ product, onClose }: {
  product: Product;
  onClose: () => void;
}) {
  const [form, setForm]       = useState<FormState>({ name: "", email: "", phone: "", message: "" });
  const [focused, setFocused] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const field = (key: keyof FormState, label: string, placeholder: string, type = "text") => (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label style={{
        fontFamily: "'Jost', sans-serif", fontSize: 8.5,
        letterSpacing: "0.26em", textTransform: "uppercase",
        color: focused === key ? "#6b3fa0" : "#b0a0cc", transition: "color 0.2s",
      }}>{label}</label>
      <input
        type={type} placeholder={placeholder} value={form[key]}
        onFocus={() => setFocused(key)} onBlur={() => setFocused(null)}
        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
        style={{
          fontFamily: "'Jost', sans-serif", fontSize: 12.5, fontWeight: 300,
          color: "#1a1030", background: "#fff", outline: "none",
          border: `1px solid ${focused === key ? "rgba(107,63,160,0.45)" : "rgba(107,63,160,0.15)"}`,
          borderRadius: 4, padding: "10px 14px",
          boxShadow: focused === key ? "0 0 0 3px rgba(107,63,160,0.07)" : "none",
          transition: "border-color 0.25s, box-shadow 0.25s",
        }}
      />
    </div>
  );

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(10,6,24,0.7)", backdropFilter: "blur(6px)", animation: "backdropIn 0.3s ease both" }} />
      <div style={{
        position: "relative", zIndex: 1, background: "#faf8f5",
        borderRadius: 10, width: "100%", maxWidth: 520,
        maxHeight: "90vh", overflowY: "auto",
        border: "1px solid rgba(107,63,160,0.15)",
        boxShadow: "0 32px 80px rgba(107,63,160,0.18)",
        animation: "modalIn 0.42s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        {submitted ? (
          <div style={{ padding: "60px 48px", textAlign: "center", animation: "fadeUp 0.4s ease both" }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", border: "1.5px solid rgba(107,63,160,0.3)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px", background: "rgba(107,63,160,0.05)" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6b3fa0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            </div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 30, fontWeight: 400, color: "#1a1030", marginBottom: 10 }}>Enquiry Received</h3>
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 12.5, fontWeight: 300, color: "#7a6a96", lineHeight: 1.8, marginBottom: 28 }}>
              Thank you, {form.name.split(" ")[0]}. We'll be in touch regarding <em style={{ fontStyle: "italic" }}>{product.name}</em>.
            </p>
            <button onClick={onClose} style={{ fontFamily: "'Jost', sans-serif", fontSize: 9, fontWeight: 500, letterSpacing: "0.22em", textTransform: "uppercase", color: "#6b3fa0", background: "none", border: "1.5px solid rgba(107,63,160,0.3)", borderRadius: 2, padding: "10px 26px", cursor: "pointer" }}>Close</button>
          </div>
        ) : (
          <>
            {/* Header */}
            <div style={{ padding: "30px 40px 24px", borderBottom: "1px solid rgba(107,63,160,0.08)", display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 8.5, letterSpacing: "0.3em", textTransform: "uppercase", color: "#9b6fe0", marginBottom: 6 }}>Enquiry</p>
                <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 400, color: "#1a1030", letterSpacing: "0.02em", lineHeight: 1.1 }}>{product.name}</h2>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 13, fontStyle: "italic", color: "#a090b8", marginTop: 3 }}>{product.material}</p>
              </div>
              <button onClick={onClose}
                style={{ width: 30, height: 30, borderRadius: "50%", border: "1px solid rgba(107,63,160,0.2)", background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#b0a0cc", flexShrink: 0, marginTop: 2 }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(107,63,160,0.07)"; e.currentTarget.style.color = "#6b3fa0"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#b0a0cc"; }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>

            {/* Form */}
            <div style={{ padding: "28px 40px 36px", display: "flex", flexDirection: "column", gap: 18 }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                {field("name",  "Full Name",     "Your name")}
                {field("email", "Email",         "you@example.com", "email")}
              </div>
              {field("phone", "Phone Number", "+91 00000 00000", "tel")}

              {/* Message */}
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <label style={{ fontFamily: "'Jost', sans-serif", fontSize: 8.5, letterSpacing: "0.26em", textTransform: "uppercase", color: focused === "message" ? "#6b3fa0" : "#b0a0cc", transition: "color 0.2s" }}>Message</label>
                <textarea
                  rows={3} placeholder="Tell us about your interest or space…"
                  value={form.message}
                  onFocus={() => setFocused("message")} onBlur={() => setFocused(null)}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  style={{
                    fontFamily: "'Jost', sans-serif", fontSize: 12.5, fontWeight: 300,
                    color: "#1a1030", background: "#fff", resize: "vertical", outline: "none",
                    border: `1px solid ${focused === "message" ? "rgba(107,63,160,0.45)" : "rgba(107,63,160,0.15)"}`,
                    borderRadius: 4, padding: "10px 14px", lineHeight: 1.7,
                    boxShadow: focused === "message" ? "0 0 0 3px rgba(107,63,160,0.07)" : "none",
                    transition: "border-color 0.25s, box-shadow 0.25s",
                  }}
                />
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: 10, alignItems: "center", justifyContent: "flex-end", paddingTop: 4 }}>
                <a
                  href={`https://wa.me/919876543210?text=${encodeURIComponent(`Hello, I'm interested in "${product.name}". Could you share more details?`)}`}
                  target="_blank" rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 7,
                    fontFamily: "'Jost', sans-serif", fontSize: 8.5, fontWeight: 500,
                    letterSpacing: "0.18em", textTransform: "uppercase",
                    color: "#25a060", padding: "10px 18px", background: "transparent",
                    border: "1.5px solid rgba(37,160,96,0.3)", borderRadius: 2, textDecoration: "none",
                    backgroundImage: "linear-gradient(to right, #25a060 50%, transparent 50%)",
                    backgroundSize: "200% 100%", backgroundPosition: "right center",
                    transition: "background-position 0.4s cubic-bezier(0.4,0,0.2,1), color 0.35s, border-color 0.35s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundPosition = "left center"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#25a060"; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundPosition = "right center"; e.currentTarget.style.color = "#25a060"; e.currentTarget.style.borderColor = "rgba(37,160,96,0.3)"; }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347zM12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.107 1.51 5.84L.057 23.454a.75.75 0 0 0 .918.943l5.78-1.516A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.696 9.696 0 0 1-4.953-1.357l-.355-.212-3.674.963.981-3.584-.232-.368A9.699 9.699 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
                  </svg>
                  WhatsApp
                </a>

                <button
                  onClick={() => { if (form.name && form.email) setSubmitted(true); }}
                  disabled={!form.name || !form.email}
                  style={{
                    fontFamily: "'Jost', sans-serif", fontSize: 8.5, fontWeight: 500,
                    letterSpacing: "0.22em", textTransform: "uppercase",
                    color: (!form.name || !form.email) ? "#c0b0d8" : "#6b3fa0",
                    padding: "10px 24px", background: "transparent",
                    border: `1.5px solid ${(!form.name || !form.email) ? "rgba(107,63,160,0.12)" : "rgba(107,63,160,0.35)"}`,
                    borderRadius: 2, cursor: (!form.name || !form.email) ? "not-allowed" : "pointer",
                    backgroundImage: (!form.name || !form.email) ? "none" : "linear-gradient(to right, #6b3fa0 50%, transparent 50%)",
                    backgroundSize: "200% 100%", backgroundPosition: "right center",
                    transition: "background-position 0.4s cubic-bezier(0.4,0,0.2,1), color 0.35s, border-color 0.35s",
                    display: "inline-flex", alignItems: "center", gap: 8,
                  }}
                  onMouseEnter={e => { if (form.name && form.email) { e.currentTarget.style.backgroundPosition = "left center"; e.currentTarget.style.color = "#fff"; }}}
                  onMouseLeave={e => { e.currentTarget.style.backgroundPosition = "right center"; e.currentTarget.style.color = (!form.name || !form.email) ? "#c0b0d8" : "#6b3fa0"; }}
                >
                  Send Enquiry
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────────────────────────────
export default function CrystalArtDecorPage() {
  const [filters, setFilters]             = useState({ material: ALL, series: ALL, availability: ALL });
  const [inquireProduct, setInquireProduct] = useState<Product | null>(null);

  const setFilter = (key: FilterKey) => (val: string) =>
    setFilters(f => ({ ...f, [key]: val }));

  const filtered = products.filter(p =>
    (filters.material     === ALL || p.material.includes(filters.material)) &&
    (filters.series       === ALL || p.series       === filters.series) &&
    (filters.availability === ALL || p.availability === filters.availability)
  );

  const activeCount = Object.values(filters).filter(v => v !== ALL).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes cardReveal {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes backdropIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(22px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .cad-root { background: #faf8f5; min-height: 100vh; color: #1a1020; font-family: 'Jost', sans-serif; }

        .cad-hero {
          padding: 40px 52px 36px; max-width: 1300px; margin: 0 auto;
          border-bottom: 1px solid rgba(107,63,160,0.08);
          display: flex; align-items: flex-end; justify-content: space-between; gap: 24px;
        }
        .cad-eyebrow { font-size: 9px; letter-spacing: 0.36em; text-transform: uppercase; color: #9b6fe0; margin-bottom: 8px; font-weight: 300; }
        .cad-title { font-family: 'Cormorant Garamond', serif; font-size: clamp(32px, 4.5vw, 52px); font-weight: 400; line-height: 1.05; color: #1a1020; letter-spacing: 0.02em; }
        .cad-title em { font-style: italic; font-weight: 300; color: #6b3fa0; }
        .cad-hero-sub { font-size: 11.5px; font-weight: 300; color: #a090b8; letter-spacing: 0.04em; line-height: 1.7; max-width: 260px; text-align: right; }

        .cad-filterbar {
          padding: 14px 52px; border-bottom: 1px solid rgba(107,63,160,0.07);
          display: flex; align-items: center; justify-content: space-between; gap: 14px; flex-wrap: wrap;
          background: rgba(250,248,245,0.92); backdrop-filter: blur(10px);
          position: sticky; top: 0; z-index: 50; box-shadow: 0 1px 0 rgba(107,63,160,0.06);
        }
        .cad-filterbar-left { display: flex; align-items: center; gap: 9px; flex-wrap: wrap; }
        .cad-clear { font-family: 'Jost', sans-serif; font-size: 10px; font-weight: 400; letter-spacing: 0.14em; text-transform: uppercase; color: rgba(107,63,160,0.45); background: none; border: none; cursor: pointer; padding: 4px 8px; transition: color 0.2s; text-decoration: underline; text-underline-offset: 3px; }
        .cad-clear:hover { color: #6b3fa0; }
        .cad-showing { font-family: 'Jost', sans-serif; font-size: 10.5px; font-weight: 300; font-style: italic; color: rgba(107,63,160,0.4); letter-spacing: 0.04em; white-space: nowrap; }

        .cad-grid-wrap { padding: 36px 52px 88px; max-width: 1300px; margin: 0 auto; }
        .cad-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }

        .cad-footer { border-top: 1px solid rgba(107,63,160,0.08); padding: 36px 52px 52px; display: flex; align-items: center; justify-content: space-between; gap: 24px; max-width: 1300px; margin: 0 auto; }
        .cad-footer-text { font-family: 'Cormorant Garamond', serif; font-size: 16px; font-style: italic; font-weight: 300; color: #b0a0c8; letter-spacing: 0.04em; }
        .cad-footer-btn { display: inline-flex; align-items: center; gap: 10px; padding: 12px 26px; font-family: 'Jost', sans-serif; font-size: 9px; font-weight: 500; letter-spacing: 0.24em; text-transform: uppercase; color: #6b3fa0; border: 1.5px solid rgba(107,63,160,0.35); border-radius: 2px; cursor: pointer; text-decoration: none; background-image: linear-gradient(to right, #6b3fa0 50%, transparent 50%); background-size: 200% 100%; background-position: right center; transition: background-position 0.45s cubic-bezier(0.4,0,0.2,1), color 0.4s, border-color 0.4s; }
        .cad-footer-btn:hover { background-position: left center; color: #fff; border-color: #6b3fa0; }

        @media (max-width: 960px) {
          .cad-hero, .cad-filterbar, .cad-grid-wrap, .cad-footer { padding-left: 24px; padding-right: 24px; }
          .cad-grid { grid-template-columns: repeat(2, 1fr); }
          .cad-hero { flex-direction: column; align-items: flex-start; }
          .cad-hero-sub { text-align: left; max-width: 100%; }
        }
        @media (max-width: 560px) { .cad-grid { grid-template-columns: 1fr; } }
      `}</style>

      {inquireProduct && (
        <InquireModal product={inquireProduct} onClose={() => setInquireProduct(null)} />
      )}

      <div className="cad-root">

        <div className="cad-hero">
          <div>
            <p className="cad-eyebrow">Nithyasoori · Wall &amp; Shelf Pieces</p>
            <h1 className="cad-title">Crystal <em>Art Decor</em></h1>
          </div>
          <p className="cad-hero-sub">
            Each piece is handcrafted in Kerala using ethically sourced crystals and volcanic stone.
          </p>
        </div>

        <div className="cad-filterbar">
          <div className="cad-filterbar-left">
            <FilterDropdown label="Material"     options={FILTERS.material}     value={filters.material}     onChange={setFilter("material")} />
            <FilterDropdown label="Series"       options={FILTERS.series}       value={filters.series}       onChange={setFilter("series")} />
            <FilterDropdown label="Availability" options={FILTERS.availability} value={filters.availability} onChange={setFilter("availability")} />
            {activeCount > 0 && (
              <button className="cad-clear" onClick={() => setFilters({ material: ALL, series: ALL, availability: ALL })}>
                Clear {activeCount > 1 ? `(${activeCount})` : ""}
              </button>
            )}
          </div>
          <span className="cad-showing">Showing {filtered.length} of {products.length} works</span>
        </div>

        <div className="cad-grid-wrap">
          <div className="cad-grid">
            {filtered.length === 0 ? (
              <div style={{ gridColumn: "1/-1", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "80px 0", gap: 14 }}>
                <svg width="36" height="36" viewBox="0 0 40 40" fill="none"><polygon points="20,2 38,20 20,38 2,20" stroke="rgba(107,63,160,0.25)" strokeWidth="1.5" fill="none"/></svg>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontStyle: "italic", fontWeight: 300, color: "#9b82c4" }}>No works found</p>
                <span style={{ fontSize: 10, letterSpacing: "0.22em", textTransform: "uppercase", color: "#c0b0d8" }}>Try adjusting your filters</span>
              </div>
            ) : filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} index={i} onInquire={setInquireProduct} />
            ))}
          </div>
        </div>

        <div className="cad-footer">
          <span className="cad-footer-text">Can't find what you're looking for? We take custom commissions.</span>
          <a href="/contact" className="cad-footer-btn">
            Request a Commission
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
          </a>
        </div>

      </div>
    </>
  );
}