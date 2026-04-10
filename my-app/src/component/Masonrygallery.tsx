import { useState, useRef, useEffect } from "react";

const faqs = [
  {
    id: 1,
    question: "What materials do you use in your artworks?",
    answer: "Each piece is handcrafted using ethically sourced natural materials — raw crystals, amethyst, golden resin, copper wire, fired clay, and hand-painted slate. We source minerals directly from artisan suppliers across India, Brazil, and Morocco.",
    img: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?w=600&q=80",
    category: "Materials",
  },
  {
    id: 2,
    question: "How long does it take to receive my order?",
    answer: "Every piece is made to order and requires 7–14 business days for creation, followed by 3–7 days for secure packaging and shipping. We ship worldwide with full tracking and insurance included.",
    img: "https://images.unsplash.com/photo-1549887534-1541e9326642?w=600&q=80",
    category: "Shipping",
  },
  {
    id: 3,
    question: "Are the artworks one-of-a-kind originals?",
    answer: "Yes — every piece in our collection is a unique original. We never mass produce. Some series are created in limited editions of 3–5, always clearly marked, and each edition is individually signed and numbered by the artist.",
    img: "https://images.unsplash.com/photo-1561214115-f2f134cc4912?w=600&q=80",
    category: "Originals",
  },
  {
    id: 4,
    question: "Can I commission a custom piece?",
    answer: "Absolutely. We welcome custom commissions — from size and material requests to entirely bespoke concepts. Reach out via our contact form with your vision and we'll schedule a consultation within 48 hours.",
    img: "https://images.unsplash.com/photo-1582555172866-f73bb12a2ab3?w=600&q=80",
    category: "Commission",
  },
  {
    id: 5,
    question: "What is your return and care policy?",
    answer: "We offer a 14-day return window for undamaged pieces in original packaging. Each artwork comes with a care guide tailored to its materials. Crystals should be kept away from direct sunlight; resin pieces cleaned with a dry soft cloth.",
    img: "https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?w=600&q=80",
    category: "Returns",
  },
  {
    id: 6,
    question: "Do you offer certificates of authenticity?",
    answer: "Every artwork ships with a hand-signed Certificate of Authenticity, including the artist's name, creation date, materials used, and edition number if applicable. Digital NFT certificates are also available on request.",
    img: "https://images.unsplash.com/photo-1596548438137-d51ea5c83ca5?w=600&q=80",
    category: "Authenticity",
  },
];

function AnimatedImage({ src, alt }: { src: string; alt: string }) {
const ref = useRef<HTMLImageElement | null>(null);
  const prevSrc = useRef<string | null>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prevSrc.current === src) return;
    prevSrc.current = src;
    el.style.transition = "none";
    el.style.opacity = "0";
    el.style.transform = "scale(1.06) translateY(10px)";
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.style.transition = "opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1)";
        el.style.opacity = "1";
        el.style.transform = "scale(1) translateY(0)";
      });
    });
  }, [src]);

  return (
    <div style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", borderRadius: "8px" }}>
      <img
        ref={ref}
        src={src}
        alt={alt}
        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", opacity: 0 }}
      />
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(135deg, rgba(107,63,160,0.15) 0%, transparent 60%)",
        borderRadius: "8px", pointerEvents: "none",
      }} />
    </div>
  );
}

function FAQItem({ faq, isOpen, onToggle, index }: {
  faq: typeof faqs[0];
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
 const contentRef = useRef<HTMLDivElement | null>(null);
  const [height, setHeight] = useState(0);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(isOpen ? contentRef.current.scrollHeight : 0);
    }
  }, [isOpen]);

  const iconActive = isOpen || hovered;

  return (
    <div
      style={{
        borderBottom: "1px solid rgba(0,0,0,0.07)",
        opacity: 0,
        transform: "translateY(20px)",
        animation: `faqReveal 0.6s cubic-bezier(0.16,1,0.3,1) ${index * 0.08}s forwards`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={onToggle}
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "20px",
          padding: "22px 0",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: 1 }}>
          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "11px",
            fontWeight: 400,
            color: iconActive ? "#6b3fa0" : "#bbb",
            letterSpacing: "0.12em",
            minWidth: "28px",
            transition: "color 0.3s ease",
          }}>
            {String(faq.id).padStart(2, "0")}
          </span>
          <span style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: "clamp(16px, 2vw, 21px)",
            fontWeight: isOpen ? 600 : 400,
            color: iconActive ? "#1a1a1a" : "#3a3a3a",
            lineHeight: 1.3,
            letterSpacing: "0.01em",
            transition: "color 0.3s ease",
          }}>
            {faq.question}
          </span>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexShrink: 0 }}>
          <span style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: "8px",
            fontWeight: 500,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "#6b3fa0",
            opacity: isOpen ? 1 : 0,
            transition: "opacity 0.3s ease",
          }}>
            {faq.category}
          </span>

          {/* Icon — color shifts on hover OR open */}
          <div style={{
            width: "28px", height: "28px",
            borderRadius: "50%",
            border: `1px solid ${iconActive ? "#6b3fa0" : "rgba(0,0,0,0.12)"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
            transition: "border-color 0.3s ease, background 0.3s ease",
            background: iconActive ? "#6b3fa0" : "transparent",
          }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <line
                x1="5" y1="0" x2="5" y2="10"
                stroke={iconActive ? "#fff" : "#555"}
                strokeWidth="1.2"
                style={{ transition: "opacity 0.3s ease", opacity: isOpen ? 0 : 1 }}
              />
              <line
                x1="0" y1="5" x2="10" y2="5"
                stroke={iconActive ? "#fff" : "#555"}
                strokeWidth="1.2"
                style={{ transition: "stroke 0.3s ease" }}
              />
            </svg>
          </div>
        </div>
      </button>

      <div style={{
        overflow: "hidden",
        height: `${height}px`,
        transition: "height 0.45s cubic-bezier(0.16,1,0.3,1)",
      }}>
        <div ref={contentRef} style={{ paddingBottom: "22px", paddingLeft: "42px" }}>
          <p style={{
            fontFamily: "'Jost', sans-serif",
            fontSize: "13.5px",
            fontWeight: 300,
            lineHeight: 1.85,
            color: "#666",
            letterSpacing: "0.02em",
            maxWidth: "520px",
          }}>
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FAQSection() {
const [openId, setOpenId] = useState<number | null>(1);
  const activeItem = faqs.find(f => f.id === openId) || faqs[0];
  const accentItem = faqs[(faqs.findIndex(f => f.id === activeItem.id) + 2) % faqs.length];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Jost:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes faqReveal {
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { opacity: 0.4; } 50% { opacity: 0.85; } 100% { opacity: 0.4; }
        }

        .faq-root {
          background: #f2efea;
          font-family: 'Jost', sans-serif;
          padding: 72px 48px 80px;
          min-height: 100vh;
          color: #1a1a1a;
        }

        .faq-hero {
          text-align: center;
          margin-bottom: 60px;
        }
        .faq-eyebrow {
          font-size: 9px; letter-spacing: 0.36em;
          text-transform: uppercase; color: #6b3fa0;
          margin-bottom: 14px; font-weight: 400;
        }
        .faq-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(40px, 6vw, 72px);
          font-weight: 400; line-height: 1.0;
          color: #1a1a1a; letter-spacing: -0.01em;
          margin-bottom: 16px;
        }
        .faq-subtitle {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(13px, 1.4vw, 16px);
          font-weight: 300; color: #999;
          line-height: 1.75; max-width: 400px;
          margin: 0 auto;
        }

        .faq-body {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 64px;
          align-items: start;
          max-width: 1100px;
          margin: 0 auto;
        }

        .faq-image-panel {
          position: sticky;
          top: 40px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .faq-img-main {
          width: 100%; aspect-ratio: 3/4;
          border-radius: 8px; overflow: hidden;
          box-shadow: 0 24px 56px rgba(0,0,0,0.11), 0 6px 18px rgba(107,63,160,0.07);
        }
        .faq-img-accent {
          width: 62%; aspect-ratio: 4/3;
          border-radius: 6px; overflow: hidden;
          margin-left: auto;
          box-shadow: 0 12px 32px rgba(0,0,0,0.09);
          margin-top: -52px;
        }
        .faq-img-badge {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 9px 15px; background: #fff;
          border-radius: 40px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.07);
          font-family: 'Jost', sans-serif;
          font-size: 9px; font-weight: 500;
          letter-spacing: 0.18em; text-transform: uppercase;
          color: #6b3fa0; align-self: flex-start;
          animation: shimmer 3s ease-in-out infinite;
        }
        .faq-img-badge::before {
          content: ''; width: 6px; height: 6px;
          border-radius: 50%; background: #6b3fa0; display: block;
        }

        .faq-footer {
          text-align: center; margin-top: 64px;
          padding-top: 40px;
          border-top: 1px solid rgba(0,0,0,0.07);
        }
        .faq-footer p {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px; font-weight: 300;
          color: #888; margin-bottom: 20px; font-style: italic;
        }
        .faq-cta {
  display: inline-flex; align-items: center; gap: 10px;
  padding: 13px 28px;
  color: #6b3fa0;
  font-family: 'Jost', sans-serif; font-size: 9px;
  font-weight: 500; letter-spacing: 0.26em;
  text-transform: uppercase; border: 1.5px solid #6b3fa0;
  border-radius: 3px; cursor: pointer;
  text-decoration: none;
  background: linear-gradient(to right, #6b3fa0 50%, transparent 50%);
  background-size: 200% 100%;
  background-position: right center;
  transition: background-position 0.4s cubic-bezier(0.4,0,0.2,1), color 0.4s ease;
}
.faq-cta:hover {
  background-position: left center;
  color: #fff;
}

        @media (max-width: 820px) {
          .faq-root { padding: 48px 24px 60px; }
          .faq-body { grid-template-columns: 1fr; }
          .faq-image-panel { position: relative; top: 0; flex-direction: row; align-items: flex-end; }
          .faq-img-main { width: 55%; }
          .faq-img-accent { width: 42%; margin-top: 0; margin-left: 0; }
          .faq-img-badge { display: none; }
        }
        @media (max-width: 520px) {
          .faq-image-panel { display: none; }
        }
      `}</style>

      <section className="faq-root">

        <div className="faq-hero">
          <p className="faq-eyebrow">Have Questions</p>
          <h2 className="faq-title">Frequently Asked</h2>
          <p className="faq-subtitle">
            Everything you need to know about our<br />
            artworks, process, and collections.
          </p>
        </div>

        <div className="faq-body">
          <div>
            {faqs.map((faq, i) => (
              <FAQItem
                key={faq.id}
                faq={faq}
                index={i}
                isOpen={openId === faq.id}
                onToggle={() => setOpenId(openId === faq.id ? null : faq.id)}
              />
            ))}
          </div>

          <div className="faq-image-panel">
            <div className="faq-img-main">
              <AnimatedImage src={activeItem.img} alt={activeItem.question} />
            </div>
            <div className="faq-img-accent">
              <AnimatedImage src={accentItem.img} alt="accent" />
            </div>
            <div className="faq-img-badge">{activeItem.category}</div>
          </div>
        </div>

        <div className="faq-footer">
          <p>Still have questions? We'd love to hear from you.</p>
          <a href="#contact" className="faq-cta">
            Contact Us
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>

      </section>
    </>
  );
}