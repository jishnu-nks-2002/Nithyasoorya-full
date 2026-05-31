"use client";
import React from "react";
import ElegantNavbar from "../../component/ElegantNavbar";


import CustomCursor from "@/component/Customcursor";
import FlowingMenu from "@/component/Flowingmenu";
import ArtistryHero from "@/component/ArtistryHero";
import EmpavaiAbout from "@/component/Empavaiabout";
import ArtistSection from "@/component/ArtistSection";
import CuratedSection from "@/component/CuratedSection";
import MasonryGallery from "@/component/Masonrygallery";
import ReviewSection from "@/component/Reviewsection";
import Footer from "@/component/Footer";
import { useAboutPage } from "../../../api/useAboutPage";

const App = () => {
  const { data, loading, error, refetch } = useAboutPage();

  if (loading) {
    return (
      <>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{
          minHeight: "100vh",
          background: "#0d0516",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 16,
        }}>
          <div style={{
            width: 36,
            height: 36,
            border: "2px solid rgba(168,85,247,0.2)",
            borderTopColor: "#a855f7",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
          }} />
          <p style={{
            fontSize: 10,
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            color: "rgba(168,85,247,0.4)",
            fontFamily: "sans-serif",
            margin: 0,
          }}>
            Loading…
          </p>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0d0516",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 20,
      }}>
        <p style={{
          color: "rgba(252,132,132,0.7)",
          fontFamily: "sans-serif",
          fontSize: 13,
          letterSpacing: "0.05em",
          margin: 0,
        }}>
          Failed to load — {error}
        </p>
        <button
          onClick={refetch}
          style={{
            padding: "10px 24px",
            fontSize: 10,
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#c084fc",
            background: "none",
            border: "1px solid rgba(192,132,252,0.3)",
            borderRadius: 2,
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <CustomCursor />
      <ElegantNavbar />
      <FlowingMenu />
      <ArtistryHero data={data.hero} />
      <EmpavaiAbout data={data.about} />
      <ArtistSection data={data.artist} />
      
      <CuratedSection />
      <MasonryGallery />
      <ReviewSection />
      <Footer />
    </>
  );
};

export default App;