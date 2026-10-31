import { Jost, Cormorant_Garamond } from "next/font/google";
import Link from "next/link";
import type { ReactNode } from "react";

const jost = Jost({ weight: ["300", "400", "500", "600"], subsets: ["latin"], display: "swap" });
const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

/* ─────────────────────────────────────────────
   EDIT THESE ONCE — used on both legal pages
   ───────────────────────────────────────────── */
export const LEGAL = {
  lastUpdated: "[Date]",                        // e.g. "1 November 2026"
  email: "[Customer-care email]",               // e.g. "care@empavai.com"
  whatsapp: "[Number]",                         // e.g. "+971 50 000 0000"
  refundDays: "[5–10]",                         // refund processing time
};

export interface LegalSection {
  id: string;
  title: string;
  body: ReactNode;
}

interface Props {
  eyebrow: string;
  titleLead: string;
  titleEm: string;
  intro: string;
  sections: LegalSection[];
  otherHref: string;
  otherLabel: string;
}

export default function LegalLayout({
  eyebrow, titleLead, titleEm, intro, sections, otherHref, otherLabel,
}: Props) {
  return (
    <>
      <style>{`
        @keyframes lg-fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes lg-lineGrow {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }

        .lg-root { background: #faf8f5; color: #1a1030; min-height: 100vh; }

        .lg-hero {
          max-width: 1240px; margin: 0 auto;
          padding: 80px 56px 56px;
          border-bottom: 1px solid rgba(107,63,160,0.1);
          animation: lg-fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.1s both;
        }
        .lg-eyebrow { display: flex; align-items: center; gap: 10px; margin-bottom: 24px; }
        .lg-eyebrow-line {
          width: 28px; height: 1px; background: #9b6fe0; transform-origin: left;
          animation: lg-lineGrow 0.8s cubic-bezier(0.16,1,0.3,1) 0.4s both;
        }
        .lg-eyebrow-text { font-size: 8.5px; font-weight: 500; letter-spacing: 0.36em; text-transform: uppercase; color: #9b6fe0; }
        .lg-heading { font-size: clamp(40px,5vw,60px); font-weight: 400; line-height: 1.07; color: #1a1030; letter-spacing: 0.01em; margin-bottom: 22px; }
        .lg-heading em { font-style: italic; font-weight: 300; color: #6b3fa0; }
        .lg-intro { font-size: 13px; font-weight: 300; line-height: 1.85; color: #7a6a96; letter-spacing: 0.02em; max-width: 560px; margin-bottom: 20px; }
        .lg-updated { font-size: 9px; font-weight: 500; letter-spacing: 0.24em; text-transform: uppercase; color: #b0a0cc; }

        .lg-body {
          max-width: 1240px; margin: 0 auto;
          padding: 64px 56px 96px;
          display: grid; grid-template-columns: 240px 1fr; gap: 80px; align-items: start;
        }

        .lg-toc {
          position: sticky; top: 100px;
          animation: lg-fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.2s both;
        }
        .lg-toc-label { font-size: 8px; font-weight: 600; letter-spacing: 0.32em; text-transform: uppercase; color: #9b6fe0; margin-bottom: 16px; }
        .lg-toc-list { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 2px; border-left: 1px solid rgba(107,63,160,0.12); }
        .lg-toc-link {
          display: block; padding: 7px 0 7px 16px; margin-left: -1px;
          font-size: 11.5px; font-weight: 300; letter-spacing: 0.03em; color: #7a6a96;
          text-decoration: none; border-left: 1px solid transparent;
          transition: color 0.2s ease, border-color 0.2s ease;
        }
        .lg-toc-link:hover { color: #6b3fa0; border-left-color: #6b3fa0; }
        .lg-toc-other {
          display: inline-flex; align-items: center; gap: 6px; margin-top: 28px;
          font-size: 8.5px; font-weight: 500; letter-spacing: 0.22em; text-transform: uppercase;
          color: #9b6fe0; text-decoration: none; padding-bottom: 2px;
          border-bottom: 1px solid rgba(107,63,160,0.2);
          transition: color 0.2s ease, border-color 0.2s ease, gap 0.2s ease;
        }
        .lg-toc-other:hover { color: #6b3fa0; border-color: rgba(107,63,160,0.5); gap: 9px; }

        .lg-content { animation: lg-fadeUp 0.7s cubic-bezier(0.16,1,0.3,1) 0.25s both; max-width: 720px; }
        .lg-section { scroll-margin-top: 100px; padding-bottom: 44px; margin-bottom: 44px; border-bottom: 1px solid rgba(107,63,160,0.08); }
        .lg-section:last-child { border-bottom: none; margin-bottom: 0; }
        .lg-section-num { font-size: 9px; font-weight: 500; letter-spacing: 0.3em; color: #9b6fe0; margin-bottom: 10px; }
        .lg-section-title { font-size: clamp(26px,3vw,34px); font-weight: 400; color: #1a1030; letter-spacing: 0.02em; margin-bottom: 18px; }

        .lg-p { font-size: 13px; font-weight: 300; line-height: 1.95; color: #4a3a6a; letter-spacing: 0.02em; margin-bottom: 14px; }
        .lg-p strong { font-weight: 500; color: #1a1030; }
        .lg-h3 { font-size: 21px; font-weight: 500; color: #3a2a5a; letter-spacing: 0.02em; margin: 28px 0 10px; }
        .lg-ul { list-style: none; padding: 0; margin: 0 0 16px; display: flex; flex-direction: column; gap: 8px; }
        .lg-ul li {
          position: relative; padding-left: 20px;
          font-size: 13px; font-weight: 300; line-height: 1.8; color: #4a3a6a; letter-spacing: 0.02em;
        }
        .lg-ul li::before {
          content: ''; position: absolute; left: 0; top: 11px;
          width: 6px; height: 1px; background: #9b6fe0;
        }
        .lg-callout {
          background: #fff; border: 1px solid rgba(107,63,160,0.12); border-left: 2px solid #6b3fa0;
          border-radius: 4px; padding: 16px 20px; margin: 18px 0;
          font-size: 12.5px; font-weight: 300; line-height: 1.85; color: #4a3a6a; letter-spacing: 0.02em;
        }
        .lg-callout strong { font-weight: 500; color: #1a1030; }
        .lg-link { color: #6b3fa0; text-decoration: none; border-bottom: 1px solid rgba(107,63,160,0.25); transition: border-color 0.2s; }
        .lg-link:hover { border-color: #6b3fa0; }

        @media (max-width: 1024px) {
          .lg-body { grid-template-columns: 1fr; gap: 40px; }
          .lg-toc { position: static; }
        }
        @media (max-width: 640px) {
          .lg-hero { padding: 56px 24px 40px; }
          .lg-body { padding: 40px 24px 72px; }
        }
      `}</style>

      <div className={`lg-root ${jost.className}`}>
        {/* HERO */}
        <header className="lg-hero">
          <div className="lg-eyebrow">
            <div className="lg-eyebrow-line" />
            <span className="lg-eyebrow-text">{eyebrow}</span>
          </div>
          <h1 className={`lg-heading ${cormorant.className}`}>
            {titleLead} <em>{titleEm}</em>
          </h1>
          <p className="lg-intro">{intro}</p>
          <div className="lg-updated">Last updated: {LEGAL.lastUpdated}</div>
        </header>

        {/* BODY */}
        <div className="lg-body">
          <nav className="lg-toc" aria-label="Table of contents">
            <div className="lg-toc-label">Contents</div>
            <ul className="lg-toc-list">
              {sections.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="lg-toc-link">{s.title}</a>
                </li>
              ))}
            </ul>
            <Link href={otherHref} className="lg-toc-other">
              {otherLabel}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          </nav>

          <article className="lg-content">
            {sections.map((s, i) => (
              <section key={s.id} id={s.id} className="lg-section">
                <div className="lg-section-num">{String(i + 1).padStart(2, "0")}</div>
                <h2 className={`lg-section-title ${cormorant.className}`}>{s.title}</h2>
                {s.body}
              </section>
            ))}
          </article>
        </div>
      </div>
    </>
  );
}