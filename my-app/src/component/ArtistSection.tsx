'use client';

import Image from "next/image";
import { Lato, Cormorant_Garamond } from "next/font/google";
import type { AboutPageData } from "../../api/useAboutPage";

const lato = Lato({ weight: ["300", "400"], subsets: ["latin"], display: "swap" });
const cormorant = Cormorant_Garamond({
  weight: ["300", "400", "600"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
});

export default function ArtistSection({ data }: { data?: AboutPageData["artist"] | null }) {
  if (!data) return null;

  const roles = (data.roles ?? []).filter(Boolean);
  const paragraphs = (data.paragraphs ?? []).filter(Boolean);
  const quoteLines = (data.quote ?? "").split("\n").map((l) => l.trim()).filter(Boolean);

  return (
    <>
      <style>{`
        .as-root { --deep:#0d0516; --purple:#6b3fa0; --purple-light:#c084fc;
          --cream:rgba(238,230,255,0.92); --soft:rgba(210,195,240,0.78); --border:rgba(180,130,255,0.14);
          background: var(--deep); color: var(--cream); position: relative; overflow: hidden; }
        .as-root *, .as-root *::before, .as-root *::after { box-sizing: border-box; }
        .as-glow1 { position:absolute; width:700px; height:700px; border-radius:50%; top:-180px; right:-180px;
          background: radial-gradient(circle, rgba(107,63,160,0.18) 0%, transparent 70%); pointer-events:none; }
        .as-glow2 { position:absolute; width:500px; height:500px; border-radius:50%; bottom:-120px; left:-120px;
          background: radial-gradient(circle, rgba(123,47,255,0.10) 0%, transparent 70%); pointer-events:none; }

        .as-inner { position:relative; z-index:2; max-width:1200px; margin:0 auto; padding:88px 60px; }
        .as-grid { display:grid; grid-template-columns: 1fr 1fr; column-gap:56px; row-gap:56px;
          grid-template-areas: "text portrait" "award quote"; align-items:start; }

        /* text block */
        .as-text { grid-area:text; padding-top:8px; }
        .as-heading { font-size:clamp(38px,5vw,64px); font-weight:600; line-height:1.05; color:var(--cream); letter-spacing:0.01em; }
        .as-roles { margin-top:22px; font-size:12px; font-weight:400; letter-spacing:0.18em; text-transform:uppercase; color:rgba(220,205,250,0.8); }
        .as-roles .sep { margin:0 10px; color:rgba(192,132,252,0.45); }
        .as-rule { width:76px; height:2px; margin:22px 0 30px; background:linear-gradient(to right, var(--purple-light), rgba(192,132,252,0.2)); }
        .as-intro { font-size:17px; font-weight:400; line-height:1.7; color:var(--cream); margin-bottom:18px; }
        .as-para { font-size:16px; font-weight:300; line-height:1.75; color:var(--soft); margin-bottom:18px; max-width:520px; }

        /* portrait */
        .as-portrait { grid-area:portrait; position:relative; width:100%; aspect-ratio: 4/5; overflow:hidden;
          border-radius:6px; border:1px solid var(--border); }
        .as-portrait::after { content:''; position:absolute; inset:0; pointer-events:none;
          background: linear-gradient(to bottom, transparent 70%, rgba(13,5,22,0.45) 100%); }

        /* award */
        .as-award-wrap { grid-area:award; display:flex; justify-content:center; }
        .as-award { position:relative; width:100%; max-width:400px; aspect-ratio:1/1; overflow:hidden;
          border-radius:4px; border:1px solid var(--border); box-shadow:0 20px 60px rgba(0,0,0,0.45); }

        /* quote */
        .as-quote-wrap { grid-area:quote; display:flex; align-self:center; gap:34px; align-items:stretch; }
        .as-quote-line { width:2px; flex-shrink:0; background:linear-gradient(to bottom, transparent, var(--purple-light), transparent); opacity:0.7; }
        .as-quote-body { display:flex; flex-direction:column; justify-content:center; }
        .as-quote-text { font-size:clamp(24px,2.8vw,34px); font-style:italic; font-weight:300; line-height:1.5; color:var(--cream); }
        .as-quote-author { font-style:normal; font-weight:400; font-size:0.8em; color:var(--purple-light); margin-left:8px; }
        .as-quote-rule { width:84px; height:2px; margin-top:26px; background:linear-gradient(to right, var(--purple-light), transparent); }

        .as-strip { margin-top:56px; padding-top:24px; border-top:1px solid var(--border);
          font-size:13px; font-style:italic; color:rgba(180,150,230,0.4); letter-spacing:0.04em; }

        @media (max-width: 900px) {
          .as-inner { padding:56px 24px; }
          .as-grid { grid-template-columns:1fr; row-gap:40px;
            grid-template-areas: "text" "portrait" "award" "quote"; }
          .as-portrait { max-width:520px; margin:0 auto; }
          .as-quote-wrap { gap:20px; }
        }
      `}</style>

      <section className={`as-root ${lato.className}`}>
        <div className="as-glow1" />
        <div className="as-glow2" />

        <div className="as-inner">
          <div className="as-grid">
            <div className="as-text">
              <h2 className={`as-heading ${cormorant.className}`}>{data.heading}</h2>

              {roles.length > 0 && (
                <p className="as-roles">
                  {roles.map((r, i) => (
                    <span key={i}>
                      {i > 0 && <span className="sep">|</span>}
                      {r}
                    </span>
                  ))}
                </p>
              )}

              <div className="as-rule" />

              {data.intro && <p className="as-intro">{data.intro}</p>}
              {paragraphs.map((p, i) => (
                <p key={i} className="as-para">{p}</p>
              ))}
            </div>

            {data.portraitImg && (
              <div className="as-portrait">
                <Image
                  src={data.portraitImg}
                  alt={data.name || "Artist portrait"}
                  fill
                  sizes="(max-width: 900px) 520px, 600px"
                  style={{ objectFit: "cover", objectPosition: "top center" }}
                  unoptimized
                />
              </div>
            )}

            {data.awardImg && (
              <div className="as-award-wrap">
                <div className="as-award">
                  <Image
                    src={data.awardImg}
                    alt="Award and reference books"
                    fill
                    sizes="400px"
                    style={{ objectFit: "cover" }}
                    unoptimized
                  />
                </div>
              </div>
            )}

            <div className="as-quote-wrap">
              <div className="as-quote-line" />
              <div className="as-quote-body">
                <p className={`as-quote-text ${cormorant.className}`}>
                  {quoteLines.map((line, i) => (
                    <span key={i}>
                      {line}
                      {i === quoteLines.length - 1 && data.quoteAuthor && (
                        <span className="as-quote-author">– {data.quoteAuthor}</span>
                      )}
                      {i < quoteLines.length - 1 && <br />}
                    </span>
                  ))}
                </p>
                <div className="as-quote-rule" />
              </div>
            </div>
          </div>

          {data.studioInfo && <div className={`as-strip ${cormorant.className}`}>{data.studioInfo}</div>}
        </div>
      </section>
    </>
  );
}