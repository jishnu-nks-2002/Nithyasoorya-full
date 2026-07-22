import { useState } from "react";

const artist = {
  id: 1,
  role: "LEAD SCULPTOR",
  name: "Julian Thorne",
  medium: "Bronze, Marble, and Light",
  philosophy: '"My work explores the intersection of organic decay and industrial permanence. I believe that every block of stone holds a latent rhythm that only the removal of silence can reveal. I don\'t create shapes; I liberate the resonance already dwelling within the material."',
  bio: "With over two decades of experience across European and Asian workshops, Julian Thorne has redefined contemporary sculpture. His works are featured in permanent collections from Tokyo to London, known for their haunting balance between weight and weightlessness.",
  image: "/images/person/img-1.jpeg",
};

const faqs = [
  { q: "How do I commission an original artwork?", a: "You can reach out directly through the Contact Artist button on each artist's profile. Our team will connect you within 48 hours to discuss scope, timeline, and pricing." },
  { q: "Are the artworks available for international shipping?", a: "Yes. We work with specialist art handlers to ensure safe delivery worldwide. Shipping costs and transit times vary by destination and artwork dimensions." },
  { q: "Can I visit the studios in person?", a: "Studio visits are available by appointment. Use the contact form to request a visit, and we'll arrange a time that works for both you and the artist." },
  { q: "What materials are used in the sculptures?", a: "Each artist works with their signature mediums — bronze, marble, and reclaimed industrial materials are among the most common. Full material details are listed in each work's description." },
  { q: "Do you offer payment plans for high-value works?", a: "Yes. For works above a certain threshold, we offer structured payment plans. Please contact us to discuss options tailored to your acquisition." },
];

const galleryItems = [
  { type: "image", src: "/images/p-1.jpeg", label: "Emergence I", year: "2022" },
  { type: "video", src: "/images/videos/video-1.mp4", poster: "/images/gallery/vid-poster-1.jpeg", label: "Process Film", year: "2023" },
  { type: "image", src: "/images/p-2.jpeg", label: "Silent Weight", year: "2021" },
  { type: "image", src: "/images/p-3.jpeg", label: "Resonance", year: "2023" },
  { type: "video", src: "/images/videos/video-2.mp4", poster: "/images/gallery/vid-poster-2.jpeg", label: "Studio Session", year: "2022" },
  { type: "image", src: "/images/p-4.jpeg", label: "Threshold", year: "2020" },
];

export default function App() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [lightbox, setLightbox] = useState<typeof galleryItems[0] | null>(null);
  const [filter, setFilter] = useState("all");

  const filtered = filter === "all" ? galleryItems : galleryItems.filter(i => i.type === filter);

  return (
    <div style={{
      fontFamily: "'Cormorant Garamond', 'Garamond', 'Times New Roman', serif",
      background: "#f7f5f0",
      color: "#1a1614",
      minHeight: "100vh",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Jost:wght@300;400;500&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { background: #f7f5f0; }
        .artist-img { filter: grayscale(60%) contrast(1.05) brightness(0.95); transition: filter 0.4s ease; }
        .artist-img:hover { filter: grayscale(20%) contrast(1.05) brightness(1); }
        .faq-item { border-bottom: 1px solid #ddd8ce; }
        .faq-btn { width: 100%; text-align: left; background: none; border: none; cursor: pointer; padding: 22px 0; display: flex; justify-content: space-between; align-items: center; }
        .faq-answer { overflow: hidden; transition: max-height 0.35s ease, opacity 0.3s ease; }
        .btn-primary { background: #1a1614; color: #f7f5f0; border: none; padding: 13px 30px; font-family: 'Jost', sans-serif; font-size: 0.78rem; letter-spacing: 0.12em; font-weight: 500; cursor: pointer; transition: all 0.25s ease; }
        .btn-primary:hover { background: #6b3fa0; }
        .btn-outline { background: transparent; color: #1a1614; border: 1px solid #c5bfb4; padding: 13px 30px; font-family: 'Jost', sans-serif; font-size: 0.78rem; letter-spacing: 0.12em; font-weight: 500; cursor: pointer; transition: all 0.25s ease; }
        .btn-outline:hover { border-color: #1a1614; background: rgba(26,22,20,0.04); }
        .gallery-item { position: relative; overflow: hidden; cursor: pointer; background: #e8e3da; }
        .gallery-item img, .gallery-item video { width: 100%; height: 100%; object-fit: cover; display: block; transition: transform 0.5s ease; }
        .gallery-item:hover img, .gallery-item:hover video { transform: scale(1.04); }
        .gallery-overlay { position: absolute; inset: 0; background: linear-gradient(to top, rgba(26,22,20,0.7) 0%, transparent 55%); opacity: 0; transition: opacity 0.3s ease; display: flex; flex-direction: column; justify-content: flex-end; padding: 18px; }
        .gallery-item:hover .gallery-overlay { opacity: 1; }
        .filter-btn { background: none; border: none; cursor: pointer; font-family: 'Jost', sans-serif; font-size: 0.72rem; letter-spacing: 0.14em; padding: 7px 20px; transition: all 0.2s; text-transform: uppercase; }
        .lightbox-backdrop { position: fixed; inset: 0; background: rgba(15,12,10,0.92); z-index: 1000; display: flex; align-items: center; justify-content: center; padding: 24px; }
        .lightbox-close { position: absolute; top: 24px; right: 28px; background: none; border: none; color: #e8e3da; font-size: 1.8rem; cursor: pointer; font-family: sans-serif; line-height: 1; opacity: 0.7; transition: opacity 0.2s; }
        .lightbox-close:hover { opacity: 1; }
        .play-badge { position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 48px; height: 48px; border: 1.5px solid rgba(247,245,240,0.7); border-radius: 50%; display: flex; align-items: center; justify-content: center; background: rgba(26,22,20,0.3); pointer-events: none; }
      `}</style>

      {/* ── VISIONARIES SECTION ── */}
      <section style={{ padding: "80px 40px 100px", maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "72px" }}>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.7rem", letterSpacing: "0.22em", color: "#7c5cbf", fontWeight: 500, marginBottom: "18px", textTransform: "uppercase" }}>
            Meet the Artist
          </p>
          <h1 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(3rem, 7vw, 5.5rem)", fontWeight: 300, color: "#1a1614", lineHeight: 1.05, letterSpacing: "-0.01em", marginBottom: "20px" }}>
            The Visionary<br />
            <em style={{ fontStyle: "italic", color: "#7c5cbf" }}>Behind the Form</em>
          </h1>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.15rem", color: "#8c857a", fontWeight: 300, fontStyle: "italic", lineHeight: 1.7, maxWidth: "340px", margin: "0 auto" }}>
            Discover the masterful mind shaping modern aesthetics through raw material and refined soul.
          </p>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "56px", alignItems: "flex-start" }}>
          <div style={{ flex: "0 0 auto", position: "relative" }}>
            <div style={{ width: "260px", height: "330px", overflow: "hidden", boxShadow: "12px 16px 40px rgba(26,22,20,0.12)", position: "relative" }}>
              <img src={artist.image} alt={artist.name} className="artist-img" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
            </div>
            <div style={{ position: "absolute", top: -8, left: -8, width: 36, height: 36, borderTop: "1.5px solid #7c5cbf", borderLeft: "1.5px solid #7c5cbf" }} />
            <div style={{ position: "absolute", bottom: -8, right: -8, width: 36, height: 36, borderBottom: "1.5px solid #7c5cbf", borderRight: "1.5px solid #7c5cbf" }} />
          </div>

          <div style={{ flex: 1, minWidth: "280px" }}>
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.68rem", letterSpacing: "0.2em", color: "#7c5cbf", fontWeight: 600, marginBottom: "10px", textTransform: "uppercase" }}>{artist.role}</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.2rem, 4vw, 3rem)", fontWeight: 400, color: "#1a1614", lineHeight: 1.1, marginBottom: "8px" }}>{artist.name}</h2>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1rem", fontStyle: "italic", color: "#7c5cbf", marginBottom: "36px" }}>{artist.medium}</p>

            <div style={{ marginBottom: "28px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <div style={{ width: "3px", height: "16px", background: "#7c5cbf", flexShrink: 0 }} />
                <h3 style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", letterSpacing: "0.12em", fontWeight: 600, color: "#1a1614", textTransform: "uppercase" }}>Artistic Philosophy</h3>
              </div>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", color: "#5a534e", lineHeight: 1.85, paddingLeft: "13px", borderLeft: "1px solid #ddd8ce", fontStyle: "italic" }}>{artist.philosophy}</p>
            </div>

            <div style={{ marginBottom: "40px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
                <div style={{ width: "3px", height: "16px", background: "#7c5cbf", flexShrink: 0 }} />
                <h3 style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.72rem", letterSpacing: "0.12em", fontWeight: 600, color: "#1a1614", textTransform: "uppercase" }}>Biography</h3>
              </div>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", color: "#5a534e", lineHeight: 1.85, paddingLeft: "13px", borderLeft: "1px solid #ddd8ce" }}>{artist.bio}</p>
            </div>

            <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
              <button className="btn-primary">Contact Artist +</button>
              <button className="btn-outline">Get in Touch</button>
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: "1000px", margin: "0 auto", height: "1px", background: "linear-gradient(to right, transparent, #c5bfb4, transparent)" }} />

      {/* ── WORKS GALLERY SECTION ── */}
      <section style={{ padding: "100px 40px 110px", maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "flex-end", justifyContent: "space-between", gap: "24px", marginBottom: "52px" }}>
          <div>
            <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.7rem", letterSpacing: "0.22em", color: "#7c5cbf", fontWeight: 500, textTransform: "uppercase", marginBottom: "14px" }}>Portfolio</p>
            <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(2.8rem, 6vw, 5rem)", fontWeight: 300, color: "#1a1614", lineHeight: 1.0, letterSpacing: "-0.02em", marginBottom: "14px" }}>
              Works &amp; <em style={{ fontStyle: "italic", color: "#7c5cbf" }}>Process</em>
            </h2>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", color: "#8c857a", fontStyle: "italic", lineHeight: 1.6, maxWidth: "320px" }}>
              Images and films from the studio — raw process and finished form.
            </p>
          </div>

          {/* Filter pills */}
          <div style={{ display: "flex", gap: "6px", border: "1px solid #ddd8ce", borderRadius: "30px", padding: "4px" }}>
            {["all", "image", "video"].map(f => (
              <button key={f} className="filter-btn" onClick={() => setFilter(f)} style={{
                color: filter === f ? "#f7f5f0" : "#8c857a",
                background: filter === f ? "#1a1614" : "transparent",
                borderRadius: "24px",
              }}>{f === "all" ? "All Works" : f === "image" ? "Images" : "Videos"}</button>
            ))}
          </div>
        </div>

        {/* Masonry-style grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridAutoRows: "220px",
          gap: "12px",
        }}>
          {filtered.map((item, i) => {
            const tall = i % 5 === 0 || i % 5 === 4;
            return (
              <div
                key={i}
                className="gallery-item"
                onClick={() => setLightbox(item)}
                style={{
                  gridRow: tall ? "span 2" : "span 1",
                  borderRadius: "2px",
                }}
              >
                {item.type === "image" ? (
                  <img src={item.src} alt={item.label} />
                ) : (
                  <>
                    <video src={item.src} poster={item.poster} muted loop playsInline autoPlay />
                    <div className="play-badge">
                      <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                        <path d="M1 1l12 7-12 7V1z" fill="#f7f5f0" />
                      </svg>
                    </div>
                  </>
                )}
                <div className="gallery-overlay">
                  <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", color: "#f7f5f0", fontWeight: 500, marginBottom: "2px" }}>{item.label}</p>
                  <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.65rem", color: "rgba(247,245,240,0.6)", letterSpacing: "0.1em" }}>{item.year} · {item.type === "video" ? "Film" : "Photograph"}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: "1000px", margin: "0 auto", height: "1px", background: "linear-gradient(to right, transparent, #c5bfb4, transparent)" }} />

      {/* ── FAQ SECTION ── */}
      <section style={{ padding: "100px 40px 120px", maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ marginBottom: "64px" }}>
          <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.7rem", letterSpacing: "0.22em", color: "#7c5cbf", fontWeight: 500, textTransform: "uppercase", marginBottom: "16px" }}>Have Questions</p>
          <h2 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "clamp(3.2rem, 8vw, 6rem)", fontWeight: 300, color: "#1a1614", lineHeight: 1.0, letterSpacing: "-0.02em", marginBottom: "20px" }}>
            Frequently Asked
          </h2>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.2rem", color: "#8c857a", fontStyle: "italic", fontWeight: 300, lineHeight: 1.7, maxWidth: "360px" }}>
            Everything you need to know about our artworks, process, and collections.
          </p>
        </div>

        <div>
          {faqs.map((faq, i) => (
            <div key={i} className="faq-item">
              <button className="faq-btn" onClick={() => setOpenFaq(openFaq === i ? null : i)}>
                <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.25rem", fontWeight: 500, color: openFaq === i ? "#7c5cbf" : "#1a1614", transition: "color 0.2s", paddingRight: "24px", lineHeight: 1.3 }}>{faq.q}</span>
                <span style={{ flexShrink: 0, width: "28px", height: "28px", border: "1px solid", borderColor: openFaq === i ? "#7c5cbf" : "#c5bfb4", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: openFaq === i ? "#7c5cbf" : "#8c857a", fontSize: "1.1rem", fontFamily: "sans-serif", transition: "all 0.25s", transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)" }}>+</span>
              </button>
              <div className="faq-answer" style={{ maxHeight: openFaq === i ? "200px" : "0px", opacity: openFaq === i ? 1 : 0 }}>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.05rem", color: "#5a534e", lineHeight: 1.85, paddingBottom: "24px", fontStyle: "italic" }}>{faq.a}</p>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: "56px", textAlign: "center" }}>
          <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", color: "#8c857a", fontStyle: "italic", marginBottom: "20px" }}>Still have questions? We'd love to hear from you.</p>
          <button className="btn-primary">Contact Us</button>
        </div>
      </section>

      {/* ── LIGHTBOX ── */}
      {lightbox && (
        <div className="lightbox-backdrop" onClick={() => setLightbox(null)}>
          <button className="lightbox-close" onClick={() => setLightbox(null)}>×</button>
          <div onClick={e => e.stopPropagation()} style={{ maxWidth: "860px", width: "100%", position: "relative" }}>
            {lightbox.type === "image" ? (
              <img src={lightbox.src} alt={lightbox.label} style={{ width: "100%", maxHeight: "80vh", objectFit: "contain", display: "block" }} />
            ) : (
              <video src={lightbox.src} poster={lightbox.poster} controls autoPlay style={{ width: "100%", maxHeight: "80vh", display: "block", background: "#000" }} />
            )}
            <div style={{ paddingTop: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: "1.1rem", color: "#e8e3da", fontWeight: 400 }}>{lightbox.label}</p>
              <p style={{ fontFamily: "'Jost', sans-serif", fontSize: "0.65rem", color: "rgba(232,227,218,0.5)", letterSpacing: "0.1em" }}>{lightbox.year} · {lightbox.type === "video" ? "Film" : "Photograph"}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}