"use client";
import { useState } from "react";

const STONES = [
  "Obsidian", "Black Tourmaline", "Labradorite", "Amethyst", "Rose Quartz",
  "Smoky Quartz", "Citrine", "Lapis Lazuli", "Malachite", "Moonstone",
  "Tiger's Eye", "Onyx", "Jasper", "Selenite", "Pyrite",
];

type FormState = {
  name: string;
  email: string;
  phone: string;
  stones: string[];
  description: string;
};

type FocusedField = "name" | "email" | "phone" | "stones" | "description" | null;

function InquireModal({ productName, onClose }: { productName: string; onClose: () => void }) {
  const [form, setForm] = useState<FormState>({ name: "", email: "", phone: "", stones: [], description: "" });
  const [stoneSearch, setStoneSearch] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [focused, setFocused] = useState<FocusedField>(null);

  const filteredStones = STONES.filter(s =>
    s.toLowerCase().includes(stoneSearch.toLowerCase())
  );

  const toggleStone = (stone: string) => {
    setForm(f => ({
      ...f,
      stones: f.stones.includes(stone)
        ? f.stones.filter(s => s !== stone)
        : [...f.stones, stone],
    }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.email) return;
    setSubmitted(true);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px",
    }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: "absolute", inset: 0,
        background: "rgba(10,6,24,0.72)",
        backdropFilter: "blur(6px)",
        animation: "backdropIn 0.35s ease both",
      }} />

      {/* Panel */}
      <div style={{
        position: "relative", zIndex: 1,
        background: "#faf8f5",
        borderRadius: 10,
        width: "100%", maxWidth: 580,
        maxHeight: "90vh", overflowY: "auto",
        border: "1px solid rgba(107,63,160,0.15)",
        boxShadow: "0 32px 80px rgba(107,63,160,0.18), 0 2px 8px rgba(107,63,160,0.08)",
        animation: "modalIn 0.45s cubic-bezier(0.16,1,0.3,1) both",
      }}>
        {submitted ? (
          /* ── Success State ── */
          <div style={{
            padding: "64px 52px", textAlign: "center",
            animation: "fadeIn 0.5s ease both",
          }}>
            <div style={{
              width: 52, height: 52, borderRadius: "50%",
              border: "1.5px solid rgba(107,63,160,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 24px",
              background: "rgba(107,63,160,0.05)",
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b3fa0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 32, fontWeight: 400, color: "#1a1030", marginBottom: 12, letterSpacing: "0.02em" }}>
              Enquiry Received
            </h3>
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 12.5, fontWeight: 300, color: "#7a6a96", lineHeight: 1.8, marginBottom: 32 }}>
              Thank you, {form.name.split(" ")[0]}. We'll be in touch within 48 hours regarding <em style={{ fontStyle: "italic" }}>{productName}</em>.
            </p>
            <button onClick={onClose} style={{
              fontFamily: "'Jost', sans-serif", fontSize: 9, fontWeight: 500,
              letterSpacing: "0.24em", textTransform: "uppercase",
              color: "#6b3fa0", background: "none",
              border: "1.5px solid rgba(107,63,160,0.3)", borderRadius: 2,
              padding: "11px 28px", cursor: "pointer",
              transition: "background 0.25s, color 0.25s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "#6b3fa0"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#6b3fa0"; }}
            >
              Close
            </button>
          </div>
        ) : (
          /* ── Form ── */
          <>
            {/* Header */}
            <div style={{
              padding: "36px 44px 28px",
              borderBottom: "1px solid rgba(107,63,160,0.08)",
            }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16 }}>
                <div>
                  <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 8.5, letterSpacing: "0.32em", textTransform: "uppercase", color: "#9b6fe0", marginBottom: 8 }}>
                    Acquisition Enquiry
                  </p>
                  <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 400, color: "#1a1030", letterSpacing: "0.02em", lineHeight: 1.1 }}>
                    {productName}
                  </h2>
                </div>
                <button onClick={onClose} style={{
                  width: 32, height: 32, borderRadius: "50%", border: "1px solid rgba(107,63,160,0.2)",
                  background: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#b0a0cc", flexShrink: 0, marginTop: 2,
                  transition: "background 0.2s, color 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.background = "rgba(107,63,160,0.07)"; e.currentTarget.style.color = "#6b3fa0"; }}
                onMouseLeave={e => { e.currentTarget.style.background = "none"; e.currentTarget.style.color = "#b0a0cc"; }}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div style={{ padding: "32px 44px 40px", display: "flex", flexDirection: "column", gap: 22 }}>

              {/* Name + Email row */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {(["name", "email"] as const).map((key) => {
                  const meta = {
                    name:  { label: "Full Name",      placeholder: "Your name",        type: "text"  },
                    email: { label: "Email Address",  placeholder: "you@example.com",  type: "email" },
                  }[key];
                  return (
                    <div key={key} style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      <label style={{ fontFamily: "'Jost', sans-serif", fontSize: 8.5, letterSpacing: "0.26em", textTransform: "uppercase", color: focused === key ? "#6b3fa0" : "#b0a0cc", transition: "color 0.2s" }}>{meta.label}</label>
                      <input
                        type={meta.type}
                        placeholder={meta.placeholder}
                        value={form[key]}
                        onFocus={() => setFocused(key)}
                        onBlur={() => setFocused(null)}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        style={{
                          fontFamily: "'Jost', sans-serif", fontSize: 12.5, fontWeight: 300,
                          color: "#1a1030", background: "#fff",
                          border: `1px solid ${focused === key ? "rgba(107,63,160,0.45)" : "rgba(107,63,160,0.15)"}`,
                          borderRadius: 4, padding: "10px 14px", outline: "none",
                          transition: "border-color 0.25s, box-shadow 0.25s",
                          boxShadow: focused === key ? "0 0 0 3px rgba(107,63,160,0.07)" : "none",
                        }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Phone */}
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <label style={{ fontFamily: "'Jost', sans-serif", fontSize: 8.5, letterSpacing: "0.26em", textTransform: "uppercase", color: focused === "phone" ? "#6b3fa0" : "#b0a0cc", transition: "color 0.2s" }}>Phone Number</label>
                <input
                  type="tel"
                  placeholder="+91 00000 00000"
                  value={form.phone}
                  onFocus={() => setFocused("phone")}
                  onBlur={() => setFocused(null)}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  style={{
                    fontFamily: "'Jost', sans-serif", fontSize: 12.5, fontWeight: 300,
                    color: "#1a1030", background: "#fff",
                    border: `1px solid ${focused === "phone" ? "rgba(107,63,160,0.45)" : "rgba(107,63,160,0.15)"}`,
                    borderRadius: 4, padding: "10px 14px", outline: "none",
                    transition: "border-color 0.25s, box-shadow 0.25s",
                    boxShadow: focused === "phone" ? "0 0 0 3px rgba(107,63,160,0.07)" : "none",
                  }}
                />
              </div>

              {/* Stone selector */}
              <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                <label style={{ fontFamily: "'Jost', sans-serif", fontSize: 8.5, letterSpacing: "0.26em", textTransform: "uppercase", color: focused === "stones" ? "#6b3fa0" : "#b0a0cc", transition: "color 0.2s" }}>
                  Stones of Interest
                  {form.stones.length > 0 && (
                    <span style={{ marginLeft: 8, color: "#9b6fe0", fontSize: 8, letterSpacing: "0.16em" }}>
                      {form.stones.length} selected
                    </span>
                  )}
                </label>

                {/* Search */}
                <input
                  placeholder="Search stones…"
                  value={stoneSearch}
                  onFocus={() => setFocused("stones")}
                  onBlur={() => setFocused(null)}
                  onChange={e => setStoneSearch(e.target.value)}
                  style={{
                    fontFamily: "'Jost', sans-serif", fontSize: 11.5, fontWeight: 300,
                    color: "#1a1030", background: "#fff",
                    border: `1px solid ${focused === "stones" ? "rgba(107,63,160,0.45)" : "rgba(107,63,160,0.15)"}`,
                    borderRadius: 4, padding: "8px 14px", outline: "none",
                    transition: "border-color 0.25s, box-shadow 0.25s",
                    boxShadow: focused === "stones" ? "0 0 0 3px rgba(107,63,160,0.07)" : "none",
                  }}
                />

                {/* Stone chips */}
                <div style={{
                  display: "flex", flexWrap: "wrap", gap: 7,
                  maxHeight: 120, overflowY: "auto",
                  padding: "2px 0",
                }}>
                  {filteredStones.map(stone => {
                    const active = form.stones.includes(stone);
                    return (
                      <button
                        key={stone}
                        onClick={() => toggleStone(stone)}
                        style={{
                          fontFamily: "'Jost', sans-serif", fontSize: 9.5, fontWeight: active ? 500 : 300,
                          letterSpacing: "0.1em",
                          padding: "5px 13px",
                          borderRadius: 20,
                          border: `1px solid ${active ? "rgba(107,63,160,0.5)" : "rgba(107,63,160,0.18)"}`,
                          background: active ? "rgba(107,63,160,0.1)" : "#fff",
                          color: active ? "#6b3fa0" : "#9a8cb5",
                          cursor: "pointer",
                          transition: "all 0.2s ease",
                        }}
                      >
                        {active && <span style={{ marginRight: 4, fontSize: 8 }}>✦</span>}
                        {stone}
                      </button>
                    );
                  })}
                  {filteredStones.length === 0 && (
                    <span style={{ fontSize: 11, color: "#c0b0d8", fontStyle: "italic" }}>No stones match</span>
                  )}
                </div>
              </div>

              {/* Description */}
              <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                <label style={{ fontFamily: "'Jost', sans-serif", fontSize: 8.5, letterSpacing: "0.26em", textTransform: "uppercase", color: focused === "description" ? "#6b3fa0" : "#b0a0cc", transition: "color 0.2s" }}>Message / Description</label>
                <textarea
                  rows={4}
                  placeholder="Tell us about your space, vision, or any specific requirements…"
                  value={form.description}
                  onFocus={() => setFocused("description")}
                  onBlur={() => setFocused(null)}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  style={{
                    fontFamily: "'Jost', sans-serif", fontSize: 12.5, fontWeight: 300,
                    color: "#1a1030", background: "#fff", resize: "vertical",
                    border: `1px solid ${focused === "description" ? "rgba(107,63,160,0.45)" : "rgba(107,63,160,0.15)"}`,
                    borderRadius: 4, padding: "10px 14px", outline: "none",
                    lineHeight: 1.7,
                    transition: "border-color 0.25s, box-shadow 0.25s",
                    boxShadow: focused === "description" ? "0 0 0 3px rgba(107,63,160,0.07)" : "none",
                  }}
                />
              </div>

              {/* Submit */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16, paddingTop: 4 }}>
                <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 10, color: "#c0b0d8", fontWeight: 300 }}>
                  We respond within 48 hours.
                </span>
                <button
                  onClick={handleSubmit}
                  disabled={!form.name || !form.email}
                  style={{
                    fontFamily: "'Jost', sans-serif", fontSize: 9, fontWeight: 500,
                    letterSpacing: "0.26em", textTransform: "uppercase",
                    color: (!form.name || !form.email) ? "#c0b0d8" : "#6b3fa0",
                    background: "none",
                    border: `1.5px solid ${(!form.name || !form.email) ? "rgba(107,63,160,0.12)" : "rgba(107,63,160,0.35)"}`,
                    borderRadius: 2, padding: "12px 32px", cursor: (!form.name || !form.email) ? "not-allowed" : "pointer",
                    display: "inline-flex", alignItems: "center", gap: 10,
                    backgroundImage: (!form.name || !form.email) ? "none" : "linear-gradient(to right, #6b3fa0 50%, transparent 50%)",
                    backgroundSize: "200% 100%", backgroundPosition: "right center",
                    transition: "background-position 0.45s cubic-bezier(0.4,0,0.2,1), color 0.4s ease, border-color 0.4s ease",
                  }}
                  onMouseEnter={e => { if (form.name && form.email) { e.currentTarget.style.backgroundPosition = "left center"; e.currentTarget.style.color = "#fff"; }}}
                  onMouseLeave={e => { e.currentTarget.style.backgroundPosition = "right center"; e.currentTarget.style.color = (!form.name || !form.email) ? "#c0b0d8" : "#6b3fa0"; }}
                >
                  Submit Enquiry
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
              </div>

            </div>
          </>
        )}
      </div>
    </div>
  );
}

const relatedProducts = [
  {
    id: 1,
    name: "Aetherial Flux I",
    series: "Violet Series",
    price: "$1,250",
    img: "/images/p-2.jpeg",
  },
  {
    id: 2,
    name: "Geode Resonance",
    series: "Origin Series",
    price: "$2,100",
    img: "/images/p-3.jpeg",
  },
  {
    id: 3,
    name: "Selenic Fragment",
    series: "Lunar Vol",
    price: "$1,890",
    img: "/images/p-4.jpeg",
  },
];

const product = {
  id: 1,
  name: "Nocturnal Core",
  series: "Obsidian Dream",
  category: "Crystal Art Decor",
  material: "Obsidian & Gold Plating",
  dimensions: "32 × 18 × 14 cm",
  weight: "2.4 kg",
  edition: "Limited — 3 of 5",
  availability: "Inquire",
  price: "$3,400",
  isNew: true,
  description: `Nocturnal Core is a study in arrested energy — a form caught mid-dissolution, the obsidian surface refracting light in ways that feel geological and futuristic at once. The gold inlay doesn't decorate; it reveals, tracing fault lines through the stone as if illuminating something that was always there, waiting.

Each piece in the Obsidian Dream series is carved from a single block of volcanic glass sourced from the highlands of Iceland, then finished by hand over six weeks in our studio in Kerala. No two pieces are identical.`,
  imgs: [
    "/images/p-1.jpeg",
    "/images/p-2.jpeg",
    "/images/p-3.jpeg",
    "/images/p-4.jpeg",
  ],
};

type ServiceItem = {
  id: number;
  num: string;
  category: string;
  title: string;
  body: string;
  cta: string;
  href: string;
  img: string;
  imgRight: boolean;
};

const services: ServiceItem[] = [
  {
    id: 1,
    num: "01",
    category: "Commission",
    title: "Bespoke Commissions",
    body: "Every commission is a collaborative journey between the artist and the patron. We specialise in creating one-of-a-kind sculptural pieces designed to resonate with your unique space and spirit. Our process involves deep consultation to ensure the final piece becomes the heartbeat of the environment.",
    cta: "Request Information",
    href: "/contact",
    img: "/images/p-3.jpeg",
    imgRight: true,
  },
  {
    id: 2,
    num: "02",
    category: "Consulting",
    title: "Artistic Consulting",
    body: "Collecting art today has more than just furniture. Our consulting services help collectors, developers, and homeowners curate environments that evoke a refined wholeness and vision. From site-specific installations to full-home artistic direction, we align physical form with spiritual intent.",
    cta: "Explore Information",
    href: "/our-craft",
    img: "/images/p-3.jpeg",
    imgRight: false,
  },
  {
    id: 3,
    num: "03",
    category: "Curation",
    title: "Exhibition Curation",
    body: "We design narrative-driven experiences for galleries, private estates, and corporate foundations. Curation at Empavai is about storytelling — the dialogue between individual works, the negative space between them, and the ultimate message conveyed to the observer.",
    cta: "Request Information",
    href: "/contact",
    img: "/images/p-3.jpeg",
    imgRight: true,
  },
];

function ServiceBlock({ s, index }: { s: ServiceItem; index: number }) {
  const [hov, setHov] = useState(false);
  const [ctaHov, setCtaHov] = useState(false);

  const imgEl = (radius: string) => (
    <div style={{ position: "relative", overflow: "hidden", borderRadius: radius }}>
      <img
        src={s.img}
        alt={s.title}
        style={{
          width: "100%", height: "100%", objectFit: "cover", display: "block",
          filter: `saturate(0.85) brightness(${hov ? 0.9 : 0.78})`,
          transform: hov ? "scale(1.04)" : "scale(1)",
          transition: "transform 0.8s cubic-bezier(0.25,0.46,0.45,0.94), filter 0.6s ease",
        }}
      />
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(135deg, rgba(107,63,160,0.12) 0%, transparent 55%)",
        pointerEvents: "none",
      }} />
    </div>
  );

  return (
    <div style={{
      display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: 440,
      animation: `svcReveal 0.7s cubic-bezier(0.16,1,0.3,1) ${index * 0.12}s both`,
    }}>
      {!s.imgRight && imgEl("6px 0 0 6px")}
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: s.imgRight ? "52px 52px 52px 48px" : "52px 48px 52px 52px",
          background: hov ? "rgba(107,63,160,0.025)" : "#fff",
          borderTop: "1px solid rgba(107,63,160,0.08)",
          borderBottom: "1px solid rgba(107,63,160,0.08)",
          borderLeft: s.imgRight ? "none" : "1px solid rgba(107,63,160,0.08)",
          borderRight: s.imgRight ? "1px solid rgba(107,63,160,0.08)" : "none",
          borderRadius: s.imgRight ? "6px 0 0 6px" : "0 6px 6px 0",
          position: "relative",
          transition: "background 0.4s ease",
        }}
      >
        <div style={{ position: "absolute", width: 300, height: 300, borderRadius: "50%",
          background: "radial-gradient(circle, rgba(107,63,160,0.06) 0%, transparent 70%)",
          top: -60, ...(s.imgRight ? { left: -40 } : { right: -40 }),
          opacity: hov ? 1 : 0, transition: "opacity 0.5s ease", pointerEvents: "none",
        }} />
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 11, color: "rgba(107,63,160,0.4)", letterSpacing: "0.14em" }}>{s.num}</span>
          <span style={{ width: 22, height: 1, background: "rgba(107,63,160,0.2)", display: "block" }} />
          <span style={{ fontFamily: "'Jost', sans-serif", fontSize: 9, fontWeight: 500, letterSpacing: "0.28em", textTransform: "uppercase", color: "#9b6fe0" }}>{s.category}</span>
        </div>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(24px,3vw,36px)", fontWeight: 400, lineHeight: 1.1, color: "#1a1030", letterSpacing: "0.02em", marginBottom: 18 }}>{s.title}</h3>
        <div style={{ width: hov ? 44 : 24, height: 1, background: "linear-gradient(to right, rgba(107,63,160,0.4), transparent)", marginBottom: 18, transition: "width 0.4s ease" }} />
        <p style={{ fontFamily: "'Jost', sans-serif", fontSize: 12.5, fontWeight: 300, lineHeight: 1.9, color: "#7a6a96", letterSpacing: "0.025em", marginBottom: 30, maxWidth: 400 }}>{s.body}</p>
        <a href={s.href}
          onMouseEnter={() => setCtaHov(true)}
          onMouseLeave={() => setCtaHov(false)}
          style={{
            display: "inline-flex", alignItems: "center", gap: ctaHov ? "12px" : "8px",
            fontFamily: "'Jost', sans-serif", fontSize: 9, fontWeight: 500,
            letterSpacing: "0.22em", textTransform: "uppercase",
            color: ctaHov ? "#6b3fa0" : "#9b6fe0",
            textDecoration: "none", alignSelf: "flex-start",
            paddingBottom: 3,
            borderBottom: `1px solid ${ctaHov ? "rgba(107,63,160,0.5)" : "rgba(107,63,160,0.2)"}`,
            transition: "color 0.25s ease, border-color 0.25s ease, gap 0.25s ease",
          }}
        >
          {s.cta}
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
          </svg>
        </a>
      </div>
      {s.imgRight && imgEl("0 6px 6px 0")}
    </div>
  );
}

export default function ProductDetailPage() {
  const [activeImg, setActiveImg] = useState(0);
  const [tab, setTab] = useState("details");
  const [imgHov, setImgHov] = useState(false);
  const [showInquire, setShowInquire] = useState(false);

  return (
    <>
      {showInquire && (
        <InquireModal productName={product.name} onClose={() => setShowInquire(false)} />
      )}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes svcReveal {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lineGrow {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes backdropIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes modalIn {
          from { opacity: 0; transform: translateY(24px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .pd-root {
          background: #faf8f5;
          min-height: 100vh;
          font-family: 'Jost', sans-serif;
          color: #1a1030;
        }

        /* ── PRODUCT ── */
        .pd-product {
          max-width: 1240px; margin: 0 auto;
          padding: 56px 56px 88px;
          display: grid;
          grid-template-columns: 1fr 460px;
          gap: 72px;
          align-items: start;
        }

        /* Gallery */
        .pd-gallery { display: flex; flex-direction: column; gap: 14px; }

        .pd-main-img {
          position: relative; border-radius: 10px; overflow: hidden;
          aspect-ratio: 4/3;
          border: 1px solid rgba(107,63,160,0.1);
          box-shadow: 0 4px 32px rgba(107,63,160,0.08);
        }
        .pd-main-img img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          transition: transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94), filter 0.5s ease;
        }
        .pd-main-img::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(180deg, transparent 60%, rgba(245,240,255,0.18) 100%);
          pointer-events: none;
        }

        .pd-thumbs { display: grid; grid-template-columns: repeat(4,1fr); gap: 10px; }
        .pd-thumb {
          aspect-ratio: 1/1; border-radius: 6px; overflow: hidden;
          border: 1.5px solid transparent; cursor: pointer;
          transition: border-color 0.25s ease, opacity 0.25s ease;
          opacity: 0.45;
        }
        .pd-thumb.active { border-color: rgba(107,63,160,0.45); opacity: 1; }
        .pd-thumb:hover { opacity: 0.75; }
        .pd-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; filter: saturate(0.8); }

        /* Info panel */
        .pd-info {
          display: flex; flex-direction: column; gap: 28px;
          animation: fadeIn 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s both;
          position: sticky; top: 32px;
        }

        .pd-eyebrow {
          display: flex; align-items: center; gap: 12px;
        }
        .pd-eyebrow-line {
          flex: 1; height: 1px;
          background: linear-gradient(to right, rgba(107,63,160,0.25), transparent);
          transform-origin: left;
          animation: lineGrow 1s cubic-bezier(0.16,1,0.3,1) 0.4s both;
        }
        .pd-new-tag {
          padding: "4px 10px";
          background: rgba(107,63,160,0.07);
          border: 1px solid rgba(107,63,160,0.22);
          border-radius: 2px;
          font-size: 8px; font-weight: 600;
          letter-spacing: 0.24em; text-transform: uppercase;
          color: #6b3fa0;
          padding: 4px 10px;
        }
        .pd-series-tag {
          font-size: 9px; letter-spacing: 0.28em; text-transform: uppercase;
          color: #9b6fe0; font-weight: 400;
        }

        .pd-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(36px,4.2vw,54px); font-weight: 400;
          line-height: 1.0; color: #1a1030; letter-spacing: 0.02em;
        }
        .pd-name em {
          font-style: italic; font-weight: 300;
          color: #7a5ab8; display: block; font-size: 0.72em;
          margin-top: 4px; letter-spacing: 0.04em;
        }

        /* Price block — now editorial, not transactional */
        .pd-price-block {
          display: flex; flex-direction: column; gap: 6px;
          padding: 22px 0;
          border-top: 1px solid rgba(107,63,160,0.1);
          border-bottom: 1px solid rgba(107,63,160,0.1);
        }
        .pd-price-label {
          font-size: 8.5px; letter-spacing: 0.3em; text-transform: uppercase;
          color: #b0a0cc; font-weight: 300;
        }
        .pd-price-row { display: flex; align-items: baseline; gap: 18px; flex-wrap: wrap; }
        .pd-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 40px; font-weight: 400; color: #1a1030; letter-spacing: 0.04em;
        }
        .pd-edition {
          font-family: 'Cormorant Garamond', serif;
          font-size: 14px; font-style: italic; color: #a891cc;
        }
        .pd-avail {
          font-size: 9px; letter-spacing: 0.2em; text-transform: uppercase;
          padding: 5px 12px;
          background: rgba(107,63,160,0.06);
          border: 1px solid rgba(107,63,160,0.18);
          border-radius: 2px; color: #7a5ab8; font-weight: 500;
        }

        /* Contact CTA — singular, understated */
        .pd-contact-cta {
          display: flex; flex-direction: column; gap: 10px;
        }
        .pd-contact-link {
          display: inline-flex; align-items: center; gap: 10px; align-self: flex-start;
          font-family: 'Jost', sans-serif; font-size: 9px; font-weight: 500;
          letter-spacing: 0.26em; text-transform: uppercase;
          color: #6b3fa0; text-decoration: none;
          padding: 13px 28px;
          border: 1.5px solid rgba(107,63,160,0.3);
          border-radius: 2px;
          background: linear-gradient(to right, #6b3fa0 50%, transparent 50%);
          background-size: 200% 100%; background-position: right center;
          transition: background-position 0.45s cubic-bezier(0.4,0,0.2,1),
                      color 0.4s ease, border-color 0.4s ease;
        }
        .pd-contact-link:hover { background-position: left center; color: #fff; border-color: #6b3fa0; }
        .pd-contact-sub {
          font-size: 10px; color: #b0a0cc; font-weight: 300; letter-spacing: 0.06em;
        }

        .pd-whatsapp-link {
          display: inline-flex; align-items: center; gap: 7px;
          font-family: 'Jost', sans-serif; font-size: 9px; font-weight: 500;
          letter-spacing: 0.22em; text-transform: uppercase;
          color: #25a060; text-decoration: none;
          padding: 13px 22px;
          border: 1.5px solid rgba(37,160,96,0.3);
          border-radius: 2px;
          background: linear-gradient(to right, #25a060 50%, transparent 50%);
          background-size: 200% 100%; background-position: right center;
          transition: background-position 0.45s cubic-bezier(0.4,0,0.2,1),
                      color 0.4s ease, border-color 0.4s ease;
        }
        .pd-whatsapp-link:hover {
          background-position: left center; color: #fff; border-color: #25a060;
        }

        /* Tabs */
        .pd-tabs { display: flex; gap: 0; border-bottom: 1px solid rgba(107,63,160,0.1); }
        .pd-tab {
          padding: 10px 18px 9px;
          font-family: 'Jost', sans-serif; font-size: 9.5px; font-weight: 500;
          letter-spacing: 0.18em; text-transform: uppercase;
          background: none; border: none; cursor: pointer; color: #b0a0cc;
          border-bottom: 2px solid transparent;
          transition: color 0.25s ease, border-color 0.25s ease;
          margin-bottom: -1px;
        }
        .pd-tab.active { color: #6b3fa0; border-bottom-color: #6b3fa0; }
        .pd-tab:hover:not(.active) { color: #9b6fe0; }

        .pd-tab-content {
          font-size: 12.5px; font-weight: 300; line-height: 1.95;
          color: #7a6a96; letter-spacing: 0.025em; white-space: pre-line;
        }

        /* Specs */
        .pd-specs { display: flex; flex-direction: column; }
        .pd-spec-row {
          display: flex; justify-content: space-between; align-items: center;
          padding: 11px 0; border-bottom: 1px solid rgba(107,63,160,0.07);
          font-size: 11.5px;
        }
        .pd-spec-label { color: #b0a0cc; letter-spacing: 0.1em; font-weight: 300; text-transform: uppercase; font-size: 9px; }
        .pd-spec-val { color: #3a2a5a; font-weight: 400; letter-spacing: 0.04em; font-family: 'Cormorant Garamond', serif; font-size: 14px; }

        /* ── SECTION DIVIDER ── */
        .pd-section-divider {
          max-width: 1240px; margin: 0 auto;
          height: 1px; background: rgba(107,63,160,0.08);
        }

        /* ── SERVICES ── */
        .pd-services {
          max-width: 1240px; margin: 0 auto;
          padding: 72px 56px 80px;
        }
        .pd-svc-header { margin-bottom: 48px; }
        .pd-svc-eyebrow {
          font-size: 9px; letter-spacing: 0.36em; text-transform: uppercase;
          color: #9b6fe0; margin-bottom: 10px; font-weight: 300;
        }
        .pd-svc-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(30px,4vw,48px); font-weight: 400;
          color: #1a1030; letter-spacing: 0.02em;
        }
        .pd-svc-title em { font-style: italic; font-weight: 300; color: #6b3fa0; }
        .pd-svc-rows { display: flex; flex-direction: column; gap: 3px; }

        /* ── RELATED ── */
        .pd-related {
          max-width: 1240px; margin: 0 auto;
          padding: 64px 56px 88px;
          border-top: 1px solid rgba(107,63,160,0.08);
        }
        .pd-rel-header {
          display: flex; align-items: baseline; justify-content: space-between;
          margin-bottom: 32px; gap: 20px;
        }
        .pd-rel-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(22px,3vw,34px); font-weight: 400;
          color: #1a1030; letter-spacing: 0.02em;
        }
        .pd-rel-link {
          font-size: 9px; letter-spacing: 0.22em; text-transform: uppercase;
          color: #9b6fe0; text-decoration: none;
          border-bottom: 1px solid rgba(107,63,160,0.2);
          padding-bottom: 2px; transition: color 0.2s ease, border-color 0.2s ease;
        }
        .pd-rel-link:hover { color: #6b3fa0; border-color: rgba(107,63,160,0.5); }

        .pd-rel-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 14px; }
        .pd-rel-card {
          border-radius: 8px; overflow: hidden;
          border: 1px solid rgba(107,63,160,0.08);
          background: #fff; cursor: pointer;
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
          box-shadow: 0 2px 12px rgba(107,63,160,0.04);
        }
        .pd-rel-card:hover {
          border-color: rgba(107,63,160,0.2);
          box-shadow: 0 8px 32px rgba(107,63,160,0.1);
        }
        .pd-rel-card-img { aspect-ratio: 4/3; overflow: hidden; }
        .pd-rel-card-img img {
          width: 100%; height: 100%; object-fit: cover; display: block;
          filter: saturate(0.82) brightness(0.88);
          transition: transform 0.6s ease, filter 0.5s ease;
        }
        .pd-rel-card:hover .pd-rel-card-img img { transform: scale(1.04); filter: saturate(0.95) brightness(0.95); }
        .pd-rel-card-info { padding: 16px 18px 20px; }
        .pd-rel-card-series { font-size: 8.5px; letter-spacing: 0.2em; text-transform: uppercase; color: #9b6fe0; margin-bottom: 5px; }
        .pd-rel-card-name { font-family: 'Cormorant Garamond', serif; font-size: 18px; font-weight: 400; color: #1a1030; letter-spacing: 0.02em; margin-bottom: 6px; }
        .pd-rel-card-price { font-family: 'Cormorant Garamond', serif; font-size: 15px; font-weight: 600; color: #6b3fa0; }

        @media (max-width: 960px) {
          .pd-product { grid-template-columns: 1fr; gap: 40px; padding: 32px 28px 60px; }
          .pd-info { position: static; }
          .pd-services, .pd-related { padding-left: 28px; padding-right: 28px; }
        }
        @media (max-width: 640px) {
          .pd-rel-grid { grid-template-columns: 1fr 1fr; }
        }
      `}</style>

      <div className="pd-root">

        {/* ── PRODUCT SECTION ── */}
        <div className="pd-product">

          {/* Gallery */}
          <div className="pd-gallery">
            <div
              className="pd-main-img"
              onMouseEnter={() => setImgHov(true)}
              onMouseLeave={() => setImgHov(false)}
            >
              <img
                src={product.imgs[activeImg]}
                alt={product.name}
                style={{
                  filter: `saturate(0.88) brightness(${imgHov ? 0.95 : 0.85})`,
                  transform: imgHov ? "scale(1.03)" : "scale(1)",
                }}
              />
            </div>
            <div className="pd-thumbs">
              {product.imgs.map((img, i) => (
                <div
                  key={i}
                  className={`pd-thumb${activeImg === i ? " active" : ""}`}
                  onClick={() => setActiveImg(i)}
                >
                  <img src={img} alt="" />
                </div>
              ))}
            </div>
          </div>

          {/* Info */}
          <div className="pd-info">

            {/* Eyebrow */}
            <div className="pd-eyebrow">
              {product.isNew && <span className="pd-new-tag">New</span>}
              <span className="pd-series-tag">{product.series} · {product.category}</span>
              <div className="pd-eyebrow-line" />
            </div>

            {/* Name */}
            <h1 className="pd-name">
              {product.name}
              <em>{product.series}</em>
            </h1>

            {/* Price block */}
            <div className="pd-price-block">
              <span className="pd-price-label">Value</span>
              <div className="pd-price-row">
                <span className="pd-price">{product.price}</span>
                <span className="pd-edition">{product.edition}</span>
                <span className="pd-avail">{product.availability}</span>
              </div>
            </div>

            {/* Tabs */}
            <div>
              <div className="pd-tabs">
                {["details", "care", "shipping"].map((t) => (
                  <button
                    key={t}
                    className={`pd-tab${tab === t ? " active" : ""}`}
                    onClick={() => setTab(t)}
                  >
                    {t.charAt(0).toUpperCase() + t.slice(1)}
                  </button>
                ))}
              </div>
              <div style={{ paddingTop: 18 }}>
                {tab === "details" && (
                  <p className="pd-tab-content">{product.description}</p>
                )}
                {tab === "care" && (
                  <p className="pd-tab-content">{`Keep away from direct sunlight and moisture. Clean with a soft dry cloth. Do not use chemical cleaners on the obsidian surface.\n\nFor gold-inlaid pieces, a very gentle wipe with a microfibre cloth is sufficient. Avoid contact with oils or perfumes.`}</p>
                )}
                {tab === "shipping" && (
                  <p className="pd-tab-content">{`Each piece is wrapped by hand and shipped in a custom crate with insurance included. Delivery within 7–14 business days globally.\n\nFor fragile or large-scale works, white-glove delivery and installation services are available on request.`}</p>
                )}
              </div>
            </div>

            {/* Specs */}
            <div className="pd-specs">
              {[
                { label: "Material",   val: product.material },
                { label: "Dimensions", val: product.dimensions },
                { label: "Weight",     val: product.weight },
                { label: "Edition",    val: product.edition },
              ].map((sp) => (
                <div key={sp.label} className="pd-spec-row">
                  <span className="pd-spec-label">{sp.label}</span>
                  <span className="pd-spec-val">{sp.val}</span>
                </div>
              ))}
            </div>

            {/* Contact CTA — editorial, not ecommerce */}
            <div className="pd-contact-cta">
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <a href="#" className="pd-contact-link" onClick={e => { e.preventDefault(); setShowInquire(true); }}>
                  Get in Touch
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </a>
                <a
                  href="https://wa.me/919876543210?text=Hello%2C%20I%27m%20interested%20in%20the%20Nocturnal%20Core%20from%20the%20Obsidian%20Dream%20series."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pd-whatsapp-link"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 2.117.549 4.107 1.51 5.84L.057 23.454a.75.75 0 0 0 .918.943l5.78-1.516A11.95 11.95 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.75a9.696 9.696 0 0 1-4.953-1.357l-.355-.212-3.674.963.981-3.584-.232-.368A9.699 9.699 0 0 1 2.25 12C2.25 6.615 6.615 2.25 12 2.25S21.75 6.615 21.75 12 17.385 21.75 12 21.75z"/>
                  </svg>
                  WhatsApp
                </a>
              </div>
              <span className="pd-contact-sub">For acquisition enquiries, commissions, or viewing appointments.</span>
            </div>

          </div>
        </div>

        <div className="pd-section-divider" />

        {/* ── SERVICES ── */}
        <div className="pd-services">
          <div className="pd-svc-header">
            <p className="pd-svc-eyebrow">Beyond the Object</p>
            <h2 className="pd-svc-title">Our <em>Services</em></h2>
          </div>
          <div className="pd-svc-rows">
            {services.map((s, i) => (
              <ServiceBlock key={s.id} s={s} index={i} />
            ))}
          </div>
        </div>

        {/* ── RELATED ── */}
        <div className="pd-related">
          <div className="pd-rel-header">
            <h3 className="pd-rel-title">You May Also Like</h3>
            <a href="/collections/crystal-art-decor" className="pd-rel-link">View All Works</a>
          </div>
          <div className="pd-rel-grid">
            {relatedProducts.map((p) => (
              <div key={p.id} className="pd-rel-card">
                <div className="pd-rel-card-img">
                  <img src={p.img} alt={p.name} />
                </div>
                <div className="pd-rel-card-info">
                  <div className="pd-rel-card-series">{p.series}</div>
                  <div className="pd-rel-card-name">{p.name}</div>
                  <div className="pd-rel-card-price">{p.price}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}