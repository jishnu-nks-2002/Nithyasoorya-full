"use client";
import React from "react";
import ElegantNavbar from "../../component/ElegantNavbar";
import CustomCursor from "@/component/Customcursor";
import FlowingMenu from "@/component/Flowingmenu";
import MasonryGallery from "@/component/Masonrygallery";
import ReviewSection from "@/component/Reviewsection";
import Footer from "@/component/Footer";
import TestimonialsSection from "@/component/TestimonialsSection";

const TestimonialsPage = () => {
  return (
    <>
      <CustomCursor />
      <ElegantNavbar />
      <FlowingMenu />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <TestimonialsHero />

      {/* ── Review cards pulled from API ─────────────────────────────────── */}
      {/* <ReviewSection /> */}
      <TestimonialsSection/>

      {/* ── Gallery break ────────────────────────────────────────────────── */}
      <MasonryGallery />

      <Footer />
    </>
  );
};

export default TestimonialsPage;

/* ─────────────────────────────────────────────────────────────────────────────
   Inline hero — self-contained, no extra component file needed.
   Matches the dark-purple palette used across the site.
───────────────────────────────────────────────────────────────────────────── */
function TestimonialsHero() {
  return (
    <section
      style={{
        position: "relative",
        minHeight: "52vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        textAlign: "center",
        padding: "120px 24px 80px",
        background: "linear-gradient(160deg, #0d0516 0%, #160924 55%, #0d0516 100%)",
        overflow: "hidden",
      }}
    >
      {/* Ambient orbs */}
      <div style={{
        position: "absolute", top: "18%", left: "12%",
        width: 340, height: 340, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,92,191,0.13) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", bottom: "10%", right: "10%",
        width: 260, height: 260, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(192,132,252,0.09) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Decorative top rule */}
      <div style={{
        display: "flex", alignItems: "center", gap: 14, marginBottom: 28,
      }}>
        <div style={{ width: 40, height: 1, background: "rgba(192,132,252,0.35)" }} />
        <svg width="14" height="14" viewBox="0 0 28 28" fill="none">
          <polygon points="14,1 27,14 14,27 1,14" fill="none" stroke="rgba(192,132,252,0.55)" strokeWidth="1.4" />
          <polygon points="14,6 22,14 14,22 6,14" fill="rgba(192,132,252,0.18)" />
        </svg>
        <span style={{
          fontSize: 9, fontWeight: 600, letterSpacing: "0.3em",
          textTransform: "uppercase", color: "rgba(192,132,252,0.6)",
          fontFamily: "sans-serif",
        }}>
          Words of Light
        </span>
        <svg width="14" height="14" viewBox="0 0 28 28" fill="none">
          <polygon points="14,1 27,14 14,27 1,14" fill="none" stroke="rgba(192,132,252,0.55)" strokeWidth="1.4" />
          <polygon points="14,6 22,14 14,22 6,14" fill="rgba(192,132,252,0.18)" />
        </svg>
        <div style={{ width: 40, height: 1, background: "rgba(192,132,252,0.35)" }} />
      </div>

      {/* Heading */}
      <h1
        style={{
          fontFamily: "'Cormorant Garamond', Cormorant, Georgia, serif",
          fontSize: "clamp(38px, 6.5vw, 78px)",
          fontWeight: 400,
          lineHeight: 1.08,
          letterSpacing: "-0.01em",
          color: "#f5f0ff",
          margin: "0 0 20px",
          maxWidth: 780,
        }}
      >
        Voices of the{" "}
        <em style={{ fontStyle: "italic", color: "#c084fc" }}>Sacred</em>
      </h1>

      {/* Subheading */}
      <p
        style={{
          fontFamily: "'Jost', 'DM Sans', sans-serif",
          fontSize: 14,
          fontWeight: 300,
          lineHeight: 1.8,
          letterSpacing: "0.06em",
          color: "rgba(192,132,252,0.6)",
          maxWidth: 520,
          margin: "0 0 40px",
        }}
      >
        Every piece carries an intention. Here is what those who have carried
        ours have to say.
      </p>

      {/* Stat row */}
      <div style={{
        display: "flex", alignItems: "center", gap: 40, flexWrap: "wrap",
        justifyContent: "center",
      }}>
        {[
          { num: "500+", label: "Happy Clients" },
          { num: "4.9",  label: "Average Rating" },
          { num: "100%", label: "Handcrafted" },
        ].map(({ num, label }) => (
          <div key={label} style={{ textAlign: "center" }}>
            <div style={{
              fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 500,
              color: "#c084fc",
              lineHeight: 1,
              marginBottom: 6,
            }}>
              {num}
            </div>
            <div style={{
              fontFamily: "'Jost', sans-serif",
              fontSize: 9,
              fontWeight: 600,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(192,132,252,0.45)",
            }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom gradient fade into next section */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 80,
        background: "linear-gradient(to bottom, transparent, #0d0516)",
        pointerEvents: "none",
      }} />
    </section>
  );
}