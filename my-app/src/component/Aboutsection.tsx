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
  card1Label = 'CURRENT EXHIBITION',
  card1Title = 'EPHEMERAL SILHOUETTES',
  card1Description = 'A curation of meditative landscapes captured in brush and resin. Experience the intersection of ancient traditions and contemporary artistic expression through our carefully selected collection.',
  card1ImageSrc = '/images/p-3.jpeg',
  card1ImageAlt = 'Sacred Krishna Landscape',

  card2Label = 'FEATURED PIECE',
  card2Title = 'THE MEDITATING BUDDHA',
  card2Description = 'In the depth of the sculpture, we find the silence we often seek in the world outside. This masterpiece represents the perfect harmony between form and spirit.',
  card2ButtonText = 'EXPLORE THE COLLECTION',
  card2ButtonLink = '#collection',
  card2ImageSrc = '/images/p-4.jpeg',
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
    <section className="about-cards-section">

      {/* Card 1: Image Left, Content Right */}
      <div className="about-card about-card-left">
        <div className="about-card-image-wrapper about-card-image-left">
          <Image
            src={card1ImageSrc}
            alt={card1ImageAlt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="about-card-image"
            style={{ objectFit: 'cover' }}
          />
        </div>

        <div className="about-card-content about-card-content-right">
          <div className="about-card-label">{card1Label}</div>

          <ScrollReveal
            enableBlur={true}
            baseOpacity={0.2}
            baseRotation={1.5}
            blurStrength={2}
            containerClassName="about-card-title-wrapper"
            textClassName="about-card-title-text"
          >
            {card1Title}
          </ScrollReveal>

          <ScrollReveal
            enableBlur={true}
            baseOpacity={0.3}
            baseRotation={1}
            blurStrength={1.5}
            containerClassName="about-card-description-wrapper"
            textClassName="about-card-description-text"
          >
            {card1Description}
          </ScrollReveal>
        </div>
      </div>

      {/* Card 2: Content Left, Image Right */}
      <div className="about-card about-card-right">
        <div className="about-card-content about-card-content-left">
          <div className="about-card-label">{card2Label}</div>

          <ScrollReveal
            enableBlur={true}
            baseOpacity={0.2}
            baseRotation={1.5}
            blurStrength={2}
            containerClassName="about-card-title-wrapper"
            textClassName="about-card-title-text"
          >
            {card2Title}
          </ScrollReveal>

          <ScrollReveal
            enableBlur={true}
            baseOpacity={0.3}
            baseRotation={1}
            blurStrength={1.5}
            containerClassName="about-card-description-wrapper"
            textClassName="about-card-description-text"
          >
            {card2Description}
          </ScrollReveal>

          <button className="about-card-button" onClick={handleButtonClick}>
            {card2ButtonText}
          </button>
        </div>

        <div className="about-card-image-wrapper about-card-image-right">
          <Image
            src={card2ImageSrc}
            alt={card2ImageAlt}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="about-card-image"
            style={{ objectFit: 'cover' }}
          />
        </div>
      </div>

    </section>
  );
};

export default AboutSection;