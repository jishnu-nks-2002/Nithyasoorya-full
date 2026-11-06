'use client';

import React from 'react';
import './Aboutsection.css';
import ScrollReveal from '../component/Scrollreveal';
import Image from 'next/image';

interface AboutSectionProps {
  card1Label?: string;
  card1Title?: string;
  card1Description?: string;
  card1ImageSrc?: string;
  card1ImageAlt?: string;

  card2Label?: string;
  card2Title?: string;
  card2Description?: string;
  card2ButtonText?: string;
  card2ButtonLink?: string;
  card2ImageSrc?: string;
  card2ImageAlt?: string;
}

const AboutSection: React.FC<AboutSectionProps> = ({
  card1Label = 'WELCOME TO EMPAVAI',
  card1Title = 'Where Nature Meets Artistry',
  card1Description = 'Our curated collection blends artistic expression with the quiet power of crystals—creations designed to elevate your space, your style and your spirit.',
  card1ImageSrc = '/images/home-about-1.jpeg',
  card1ImageAlt = 'Sacred Krishna Landscape',

  card2Label = 'INSPIRED BY NATURE · CRAFTED WITH MEANING',
  card2Title = 'Art that holds an energy.',
  card2Description = 'One-of-a-kind crystal art décor and adornments, thoughtfully handcrafted to bring beauty, balance and intention into everyday life',
  card2ButtonText = 'EXPLORE THE COLLECTION',
  card2ButtonLink = '/collections',
  card2ImageSrc = '/images/home-about-2.jpeg',
  card2ImageAlt = 'Buddha in meditation pose',
}) => {

  const handleButtonClick = () => {
    if (card2ButtonLink.startsWith('#')) {
      const element = document.querySelector(card2ButtonLink);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = card2ButtonLink;
    }
  };

  return (
    <section className="ab-section">
      {/* soft background glows */}
      <span className="ab-glow ab-glow-1" aria-hidden="true" />
      <span className="ab-glow ab-glow-2" aria-hidden="true" />

      {/* ─── Row 1: image left (arch), floating card right ─────────────── */}
      <div className="ab-row ab-row-1">
        <div className="ab-media ab-media-arch">
          <div className="ab-img">
            <Image
              src={card1ImageSrc}
              alt={card1ImageAlt}
              fill
              sizes="(max-width: 968px) 100vw, 55vw"
              className="ab-img-el"
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>

        <div className="ab-card">
          <span className="ab-number" aria-hidden="true">01</span>
          <div className="ab-label"><i />{card1Label}</div>

          <ScrollReveal
            enableBlur={true}
            baseOpacity={0.2}
            baseRotation={1.5}
            blurStrength={2}
            containerClassName="ab-title-wrapper"
            textClassName="ab-title-text"
          >
            {card1Title}
          </ScrollReveal>

          <ScrollReveal
            enableBlur={true}
            baseOpacity={0.3}
            baseRotation={1}
            blurStrength={1.5}
            containerClassName="ab-desc-wrapper"
            textClassName="ab-desc-text"
          >
            {card1Description}
          </ScrollReveal>
        </div>
      </div>

      {/* ─── Row 2: floating card left, image right (rounded) ──────────── */}
      <div className="ab-row ab-row-2">
        <div className="ab-card">
          <span className="ab-number" aria-hidden="true">02</span>
          <div className="ab-label"><i />{card2Label}</div>

          <ScrollReveal
            enableBlur={true}
            baseOpacity={0.2}
            baseRotation={1.5}
            blurStrength={2}
            containerClassName="ab-title-wrapper"
            textClassName="ab-title-text"
          >
            {card2Title}
          </ScrollReveal>

          <ScrollReveal
            enableBlur={true}
            baseOpacity={0.3}
            baseRotation={1}
            blurStrength={1.5}
            containerClassName="ab-desc-wrapper"
            textClassName="ab-desc-text"
          >
            {card2Description}
          </ScrollReveal>

          <button className="ab-button" onClick={handleButtonClick}>
            <span>{card2ButtonText}</span>
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <div className="ab-media ab-media-soft">
          <div className="ab-img">
            <Image
              src={card2ImageSrc}
              alt={card2ImageAlt}
              fill
              sizes="(max-width: 968px) 100vw, 55vw"
              className="ab-img-el"
              style={{ objectFit: 'cover' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;