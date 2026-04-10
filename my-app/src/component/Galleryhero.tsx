import React, { useState, useEffect, useRef, useCallback } from 'react';
import './Galleryhero.css';

interface SlideItem {
  type: 'image' | 'video';
  src: string;
  alt?: string;
  poster?: string;
  title?: string;
  description?: string;
}

interface GalleryHeroProps {
  verticalText?: string;
  leftLabel?: string;
  ctaText?: string;
  ctaLink?: string;
  slides?: SlideItem[];
  autoPlayInterval?: number;
  onMenuToggle?: () => void;
}

const GalleryHero: React.FC<GalleryHeroProps> = ({
  verticalText = 'Museum Exhibition 2024',
  leftLabel = 'FEATURED EXHIBITION',
  ctaText = 'EXPLORE THE COLLECTION',
  ctaLink = '#collection',
  slides = [
    {
      type: 'image',
      src: '/images/p-2.jpeg',
      alt: 'Buddha Statue',
      title: 'EMPAVA',
      description: 'The intersection of ancient traditions and avant-garde sculpture forms',
    },
    {
      type: 'image',
      src: '/images/p-4.jpeg',
      alt: 'Zen Garden',
      title: 'SERENITY',
      description: 'A journey through peaceful landscapes and mindful spaces',
    },
    {
      type: 'video',
      src: '/images/videos/video-2.mp4',
      poster: '/images/p-6.jpeg',
      alt: 'Temple Architecture',
      title: 'HARMONY',
      description: 'Where classical design meets contemporary vision',
    },
    {
      type: 'image',
      src: '/images/p-3.jpeg',
      alt: 'Modern Sculpture',
      title: 'ESSENCE',
      description: 'Capturing the spirit of timeless artistic expression',
    },
  ],
  autoPlayInterval = 5000,
  onMenuToggle,
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [dotProgress, setDotProgress] = useState(0);

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const imageTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number | null>(null);
  const progressStartRef = useRef<number>(0);

  const clearTimers = useCallback(() => {
    if (imageTimerRef.current) { clearInterval(imageTimerRef.current); imageTimerRef.current = null; }
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }, []);

  const advanceSlide = useCallback(() => {
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(prev => (prev + 1) % slides.length);
      setDotProgress(0);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 500);
  }, [slides.length]);

  const startImageProgress = useCallback((duration: number) => {
    setDotProgress(0);
    progressStartRef.current = performance.now();
    const tick = (now: number) => {
      const pct = Math.min(((now - progressStartRef.current) / duration) * 100, 100);
      setDotProgress(pct);
      if (pct < 100) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const startVideoProgress = useCallback((video: HTMLVideoElement) => {
    setDotProgress(0);
    const tick = () => {
      if (video.duration && !isNaN(video.duration)) {
        const pct = (video.currentTime / video.duration) * 100;
        setDotProgress(Math.min(pct, 100));
        if (pct < 100) rafRef.current = requestAnimationFrame(tick);
      } else {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    clearTimers();
    setDotProgress(0);
    const slide = slides[currentSlide];

    // Pause all other videos
    videoRefs.current.forEach((v, i) => {
      if (v && i !== currentSlide) { v.pause(); v.currentTime = 0; }
    });

    if (slide.type === 'image') {
      startImageProgress(autoPlayInterval);
      imageTimerRef.current = setInterval(advanceSlide, autoPlayInterval);
    } else {
      // Video slide: play from start and track progress
      const video = videoRefs.current[currentSlide];
      if (video) {
        video.currentTime = 0;
        video.play().catch(() => {});
        startVideoProgress(video);
      }
    }

    return clearTimers;
  }, [currentSlide]); // eslint-disable-line react-hooks/exhaustive-deps

  const goToSlide = (index: number) => {
    if (index === currentSlide) return;
    clearTimers();
    const activeVideo = videoRefs.current[currentSlide];
    if (activeVideo) activeVideo.pause();
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setDotProgress(0);
      setTimeout(() => setIsTransitioning(false), 50);
    }, 500);
  };

  const handleCtaClick = () => {
    if (ctaLink.startsWith('#')) {
      document.querySelector(ctaLink)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.href = ctaLink;
    }
  };

  const currentSlideData = slides[currentSlide];

  return (
    <section className="gallery-hero">

      {/* ── Full-bleed media layer (sits behind everything) ── */}
      <div className="gallery-media-layer">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`gallery-slide ${index === currentSlide ? 'active' : ''}`}
          >
            {slide.type === 'image' ? (
              <img
                src={slide.src}
                alt={slide.alt || `Slide ${index + 1}`}
                className="gallery-hero-image"
              />
            ) : (
              <video
                ref={el => { videoRefs.current[index] = el; }}
                src={slide.src}
                poster={slide.poster}
                className="gallery-hero-video"
                muted
                playsInline
                autoPlay={index === currentSlide}
                onPlay={e => {
                  if (index === currentSlide) {
                    clearTimers();
                    startVideoProgress(e.currentTarget);
                  }
                }}
                onEnded={() => {
                  if (index === currentSlide) {
                    clearTimers();
                    advanceSlide();
                  }
                }}
              />
            )}
          </div>
        ))}
      </div>

      {/* ── White gradient overlay — covers left ~55%, fades to transparent ── */}
      <div className="gallery-white-fade" />

      {/* ── Left content — floats over the gradient ── */}
      <div className="gallery-hero-left">
        <div className="gallery-vertical-text">{verticalText}</div>

        <div className={`gallery-left-content-wrapper ${isTransitioning ? 'transitioning' : ''}`}>
          <div className="gallery-left-label">{leftLabel}</div>

          <div className="gallery-hero-left-heading-wrapper">
            <h1 className="gallery-hero-title">
              {currentSlideData.title || 'EMPAVA'}
            </h1>
          </div>

          <p className="gallery-left-description" key={`desc-${currentSlide}`}>
            {currentSlideData.description ||
              'The intersection of ancient traditions and avant-garde sculpture forms'}
          </p>

          <button className="gallery-left-button" onClick={handleCtaClick}>
            {ctaText}
          </button>
        </div>
      </div>

      {/* ── Nav dots (right edge) ── */}
      {slides.length > 1 && (
        <div className="gallery-slider-dots">
          {slides.map((_, index) => (
            <button
              key={index}
              className={`gallery-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => goToSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            >
              <span
                className="gallery-dot-fill"
                style={{ height: index === currentSlide ? `${dotProgress}%` : '0%' }}
              />
            </button>
          ))}
        </div>
      )}

    </section>
  );
};

export default GalleryHero;