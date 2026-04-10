'use client';

import { useState } from "react";
import { Jost, Cormorant_Garamond } from "next/font/google";
import Image from "next/image";

const jost = Jost({ weight: ["300", "400", "500", "600"], subsets: ["latin"], display: "swap" });
const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

const studios = [
  { city: "KERALA STUDIO",  address: "Thrissur, Kerala", postal: "India — 680 001",  mapHref: "#" },
  { city: "ONLINE ATELIER", address: "Worldwide Shipping", postal: "empavai.com",    mapHref: "#" },
];

const processSteps = [
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
      </svg>
    ),
    title: "Curation Phase",
    desc: "Initial site analysis and conceptual sketches tailored to your environment.",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    title: "Artisanal Craft",
    desc: "Hand-finished sculpting using premium sustainable materials and unique pigments.",
  },
  {
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    title: "White-Glove Delivery",
    desc: "Insured, crated delivery with optional installation and placement guidance.",
  },
];

const inquiryTypes = [
  "Art Acquisition",
  "Bespoke Commission",
  "Exhibition Inquiry",
  "General Question",
  "Press & Media",
];

interface FormState {
  name: string;
  email: string;
  type: string;
  message: string;
}

export default function ConnectSection() {
  const [form, setForm] = useState<FormState>({ name: "", email: "", type: "Art Acquisition", message: "" });
  const [focused, setFocused] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [selectOpen, setSelectOpen] = useState(false);

  const handleSubmit = () => {
    if (form.name && form.email) setSubmitted(true);
  };

  const borderFor = (key: string) =>
    `1px solid ${focused === key ? "rgba(107,63,160,0.45)" : "rgba(107,63,160,0.15)"}`;
  const shadowFor = (key: string) =>
    focused === key ? "0 0 0 3px rgba(107,63,160,0.07)" : "none";

  return (
    <>
      <style>{`
        @keyframes cs-fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cs-lineGrow {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes cs-imgReveal {
          from { opacity: 0; transform: scale(1.04); }
          to   { opacity: 1; transform: scale(1); }
        }

        .cs-root { background: #faf8f5; color: #1a1030; }

        .cs-hero {
          max-width: 1240px; margin: 0 auto;
          padding: 80px 56px 72px;
          display: grid; grid-template-columns: 1fr 420px; gap: 64px;
          align-items: center; border-bottom: 1px solid rgba(107,63,160,0.1);
        }
        .cs-hero-left { animation: cs-fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both; }

        .cs-eyebrow { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
        .cs-eyebrow-line {
          width: 28px; height: 1px; background: #9b6fe0;
          transform-origin: left;
          animation: cs-lineGrow 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s both;
        }
        .cs-eyebrow-text { font-size: 8.5px; font-weight: 500; letter-spacing: 0.36em; text-transform: uppercase; color: #9b6fe0; }

        .cs-heading { font-size: clamp(40px,5vw,60px); font-weight: 400; line-height: 1.07; color: #1a1030; letter-spacing: 0.01em; margin-bottom: 22px; }
        .cs-heading em { font-style: italic; font-weight: 300; color: #6b3fa0; }

        .cs-subtext { font-size: 13px; font-weight: 300; line-height: 1.85; color: #7a6a96; letter-spacing: 0.02em; max-width: 360px; margin-bottom: 48px; }

        .cs-studios { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
        .cs-studio-label { font-size: 8px; font-weight: 600; letter-spacing: 0.32em; text-transform: uppercase; color: #9b6fe0; margin-bottom: 8px; }
        .cs-studio-addr { font-size: 14.5px; font-weight: 400; line-height: 1.6; color: #3a2a5a; margin-bottom: 10px; }
        .cs-map-link {
          display: inline-flex; align-items: center; gap: 5px;
          font-size: 8.5px; font-weight: 500; letter-spacing: 0.22em; text-transform: uppercase;
          color: #9b6fe0; text-decoration: none; padding-bottom: 2px;
          border-bottom: 1px solid rgba(107,63,160,0.2);
          transition: color 0.2s ease, border-color 0.2s ease, gap 0.2s ease;
        }
        .cs-map-link:hover { color: #6b3fa0; border-color: rgba(107,63,160,0.5); gap: 8px; }

        .cs-hero-img {
          position: relative; border-radius: 10px; overflow: hidden;
          aspect-ratio: 3/4; border: 1px solid rgba(107,63,160,0.1);
          box-shadow: 0 8px 48px rgba(107,63,160,0.1), 0 2px 12px rgba(0,0,0,0.05);
          animation: cs-imgReveal 1s cubic-bezier(0.16,1,0.3,1) 0.2s both;
        }
        .cs-hero-img::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(to top, rgba(20,8,45,0.45) 0%, transparent 50%);
          pointer-events: none; z-index: 1;
        }
        .cs-hero-img-caption {
          position: absolute; bottom: 16px; left: 16px; right: 16px; z-index: 2;
          font-size: 10px; font-style: italic; font-weight: 300;
          color: rgba(255,255,255,0.6); letter-spacing: 0.14em; text-transform: uppercase;
        }

        .cs-lower {
          max-width: 1240px; margin: 0 auto;
          padding: 72px 56px 88px;
          display: grid; grid-template-columns: 1fr 480px; gap: 80px; align-items: start;
        }
        .cs-commission { animation: cs-fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.15s both; }

        .cs-section-title { font-size: clamp(28px,3.5vw,40px); font-weight: 400; color: #1a1030; letter-spacing: 0.02em; margin-bottom: 14px; }
        .cs-section-body { font-size: 12.5px; font-weight: 300; line-height: 1.9; color: #7a6a96; letter-spacing: 0.02em; margin-bottom: 40px; max-width: 380px; }

        .cs-steps { display: flex; flex-direction: column; gap: 0; }
        .cs-step {
          display: flex; gap: 16px; align-items: flex-start;
          padding: 18px 20px; background: #fff;
          border: 1px solid rgba(107,63,160,0.08); border-radius: 6px; margin-bottom: 6px;
          transition: border-color 0.25s ease, box-shadow 0.25s ease;
        }
        .cs-step:hover { border-color: rgba(107,63,160,0.22); box-shadow: 0 4px 20px rgba(107,63,160,0.07); }
        .cs-step-icon {
          width: 32px; height: 32px; border-radius: 6px; flex-shrink: 0;
          background: rgba(107,63,160,0.07); border: 1px solid rgba(107,63,160,0.15);
          display: flex; align-items: center; justify-content: center;
          color: #6b3fa0; margin-top: 1px;
        }
        .cs-step-title { font-size: 12px; font-weight: 500; color: #1a1030; letter-spacing: 0.04em; margin-bottom: 4px; }
        .cs-step-desc { font-size: 11.5px; font-weight: 300; color: #9a8cb5; line-height: 1.65; letter-spacing: 0.02em; }

        .cs-form-wrap { animation: cs-fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.25s both; }
        .cs-form-title { font-size: 26px; font-weight: 400; color: #1a1030; letter-spacing: 0.02em; margin-bottom: 28px; }
        .cs-form { display: flex; flex-direction: column; gap: 18px; }
        .cs-field { display: flex; flex-direction: column; gap: 7px; }
        .cs-field-label { font-size: 8.5px; font-weight: 500; letter-spacing: 0.28em; text-transform: uppercase; transition: color 0.2s; }
        .cs-input {
          font-size: 12.5px; font-weight: 300; color: #1a1030;
          background: #fff; outline: none; border-radius: 4px; padding: 11px 15px;
          transition: border-color 0.25s, box-shadow 0.25s;
        }
        .cs-input::placeholder { color: #c0b0d8; }

        .cs-select-wrap { position: relative; }
        .cs-select-btn {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
          font-size: 12.5px; font-weight: 300; color: #1a1030;
          background: #fff; outline: none; border-radius: 4px; padding: 11px 15px;
          cursor: pointer; text-align: left; transition: border-color 0.25s, box-shadow 0.25s;
        }
        .cs-select-dropdown {
          position: absolute; top: calc(100% + 4px); left: 0; right: 0; z-index: 20;
          background: #fff; border-radius: 6px; overflow: hidden;
          box-shadow: 0 12px 40px rgba(107,63,160,0.14);
        }
        .cs-select-opt {
          width: 100%; padding: 10px 15px; text-align: left;
          font-size: 12px; font-weight: 300; color: #3a2a5a;
          background: none; border: none; cursor: pointer; transition: background 0.15s ease;
        }
        .cs-select-opt:hover { background: rgba(107,63,160,0.06); }
        .cs-select-opt.active { background: rgba(107,63,160,0.08); color: #6b3fa0; font-weight: 500; }

        .cs-textarea {
          font-size: 12.5px; font-weight: 300; color: #1a1030;
          background: #fff; outline: none; resize: vertical;
          border-radius: 4px; padding: 11px 15px; line-height: 1.7;
          transition: border-color 0.25s, box-shadow 0.25s; min-height: 100px;
        }
        .cs-textarea::placeholder { color: #c0b0d8; }

        .cs-submit {
          display: inline-flex; align-items: center; justify-content: center; gap: 10px;
          align-self: flex-end; font-size: 9px; font-weight: 500;
          letter-spacing: 0.26em; text-transform: uppercase;
          color: #fff; padding: 14px 32px;
          background: #6b3fa0; border: none; border-radius: 3px; cursor: pointer;
          box-shadow: 0 4px 20px rgba(107,63,160,0.3);
          transition: background 0.25s ease, box-shadow 0.25s ease, transform 0.2s ease;
        }
        .cs-submit:hover { background: #5a3188; box-shadow: 0 8px 28px rgba(107,63,160,0.4); transform: translateY(-1px); }
        .cs-submit:disabled { background: #c0b0d8; box-shadow: none; cursor: not-allowed; transform: none; }

        .cs-success {
          display: flex; flex-direction: column; align-items: center;
          text-align: center; padding: 40px 24px; gap: 14px;
          animation: cs-fadeUp 0.5s ease both;
        }
        .cs-success-icon {
          width: 48px; height: 48px; border-radius: 50%;
          border: 1.5px solid rgba(107,63,160,0.3);
          display: flex; align-items: center; justify-content: center;
          background: rgba(107,63,160,0.05); color: #6b3fa0;
        }

        @media (max-width: 1024px) {
          .cs-hero { grid-template-columns: 1fr; }
          .cs-lower { grid-template-columns: 1fr; gap: 48px; }
          .cs-hero-img { aspect-ratio: 16/9; max-height: 400px; }
        }
        @media (max-width: 640px) {
          .cs-hero, .cs-lower { padding-left: 24px; padding-right: 24px; }
          .cs-studios { grid-template-columns: 1fr; gap: 24px; }
        }
      `}</style>

      <div className={`cs-root ${jost.className}`}>

        {/* ── HERO ── */}
        <div className="cs-hero">
          <div className="cs-hero-left">
            <div className="cs-eyebrow">
              <div className="cs-eyebrow-line" />
              <span className="cs-eyebrow-text">Inquiries &amp; Access</span>
            </div>

            <h1 className={`cs-heading ${cormorant.className}`}>
              Connect with<br />the <em>Studio.</em>
            </h1>

            <p className="cs-subtext">
              For collectors, collaborators, and the curious. Our studio welcomes dialogues on sculptural artistry and bespoke commissions.
            </p>

            <div className="cs-studios">
              {studios.map(s => (
                <div key={s.city}>
                  <div className="cs-studio-label">{s.city}</div>
                  <div className={`cs-studio-addr ${cormorant.className}`}>
                    {s.address}<br />{s.postal}
                  </div>
                  <a href={s.mapHref} className="cs-map-link">
                    View Map
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </a>
                </div>
              ))}
            </div>
          </div>

          <div className="cs-hero-img">
            <Image
              src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=900&q=85"
              alt="Studio artwork"
              fill
              sizes="420px"
              style={{ objectFit: "cover", filter: "saturate(0.88) brightness(0.95)" }}
            />
            <div className={`cs-hero-img-caption ${cormorant.className}`}>Series: Ethereal Forms, 2024</div>
          </div>
        </div>

        {/* ── LOWER ── */}
        <div className="cs-lower">

          <div className="cs-commission">
            <h2 className={`cs-section-title ${cormorant.className}`}>Bespoke Commissions</h2>
            <p className="cs-section-body">
              Empavai offers a limited number of commission slots annually for private residences and corporate spaces. Every piece is an intimate collaboration between the collector and the studio.
            </p>
            <div className="cs-steps">
              {processSteps.map(step => (
                <div key={step.title} className="cs-step">
                  <div className="cs-step-icon">{step.icon}</div>
                  <div>
                    <div className="cs-step-title">{step.title}</div>
                    <div className="cs-step-desc">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cs-form-wrap">
            <h3 className={`cs-form-title ${cormorant.className}`}>Inquiry Form</h3>

            {submitted ? (
              <div className="cs-success">
                <div className="cs-success-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                </div>
                <p className={cormorant.className} style={{ fontSize: 22, fontWeight: 400, color: "#1a1030" }}>Enquiry Received</p>
                <p style={{ fontSize: 12.5, fontWeight: 300, color: "#7a6a96", lineHeight: 1.8, maxWidth: 300 }}>
                  Thank you, {form.name.split(" ")[0]}. We'll be in touch within 48 hours.
                </p>
              </div>
            ) : (
              <div className="cs-form">

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                  {(["name", "email"] as const).map(key => (
                    <div key={key} className="cs-field">
                      <label className="cs-field-label" style={{ color: focused === key ? "#6b3fa0" : "#b0a0cc" }}>
                        {key === "name" ? "Full Name" : "Email Address"}
                      </label>
                      <input
                        className={`cs-input ${jost.className}`}
                        type={key === "email" ? "email" : "text"}
                        placeholder={key === "name" ? "E.g. Julian Vayne" : "julian@vayne.com"}
                        value={form[key]}
                        onFocus={() => setFocused(key)}
                        onBlur={() => setFocused(null)}
                        onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                        style={{ border: borderFor(key), boxShadow: shadowFor(key) }}
                      />
                    </div>
                  ))}
                </div>

                <div className="cs-field">
                  <label className="cs-field-label" style={{ color: focused === "type" ? "#6b3fa0" : "#b0a0cc" }}>Inquiry Type</label>
                  <div className="cs-select-wrap">
                    <button
                      className={`cs-select-btn ${jost.className}`}
                      onClick={() => setSelectOpen(v => !v)}
                      onFocus={() => setFocused("type")}
                      onBlur={() => { setFocused(null); setTimeout(() => setSelectOpen(false), 180); }}
                      style={{ border: borderFor("type"), boxShadow: shadowFor("type") }}
                    >
                      {form.type}
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9b6fe0" strokeWidth="1.8" strokeLinecap="round"
                        style={{ transition: "transform 0.2s", transform: selectOpen ? "rotate(180deg)" : "none", opacity: 0.6 }}>
                        <polyline points="6 9 12 15 18 9"/>
                      </svg>
                    </button>
                    {selectOpen && (
                      <div className="cs-select-dropdown" style={{ border: "1px solid rgba(107,63,160,0.15)" }}>
                        {inquiryTypes.map(opt => (
                          <button
                            key={opt}
                            className={`cs-select-opt ${jost.className}${form.type === opt ? " active" : ""}`}
                            onMouseDown={() => { setForm(f => ({ ...f, type: opt })); setSelectOpen(false); }}
                          >
                            {opt}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="cs-field">
                  <label className="cs-field-label" style={{ color: focused === "message" ? "#6b3fa0" : "#b0a0cc" }}>Message</label>
                  <textarea
                    className={`cs-textarea ${jost.className}`}
                    placeholder="How can our studio assist you?"
                    value={form.message}
                    onFocus={() => setFocused("message")}
                    onBlur={() => setFocused(null)}
                    onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                    style={{ border: borderFor("message"), boxShadow: shadowFor("message") }}
                  />
                </div>

                <button
                  className={`cs-submit ${jost.className}`}
                  onClick={handleSubmit}
                  disabled={!form.name || !form.email}
                >
                  Submit Inquiry
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}