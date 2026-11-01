"use client"
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useGalleryHero } from '../../api/useGalleryHero';
import "./Galleryhero.css"

interface SlideItem {
  type: 'image' | 'video';
  src: string;
  alt?: string;
  poster?: string;
}

const DEFAULT_SLIDES: SlideItem[] = [
  { type: 'image', src: '/images/p-2.jpeg', alt: 'Buddha Statue' },
  { type: 'image', src: '/images/p-4.jpeg', alt: 'Zen Garden' },
  { type: 'video', src: '/images/videos/video-2.mp4', poster: '/images/p-6.jpeg', alt: 'Temple Architecture' },
  { type: 'image', src: '/images/p-3.jpeg', alt: 'Modern Sculpture' },
];

const GalleryHero: React.FC = () => {
  const { data, loading, error } = useGalleryHero();

  const slides: SlideItem[] = data?.slides?.length ? (data.slides as SlideItem[]) : DEFAULT_SLIDES;
  const autoPlayInterval = data?.autoPlayInterval ?? 5000;

  const [currentSlide, setCurrentSlide] = useState(0);
  const [dotProgress, setDotProgress] = useState(0);

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const imageTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rafRef = useRef<number | null>(null);
  const progressStartRef = useRef<number>(0);

  useEffect(() => { setCurrentSlide(0); }, [data]);

  const clearTimers = useCallback(() => {
    if (imageTimerRef.current) { clearInterval(imageTimerRef.current); imageTimerRef.current = null; }
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
  }, []);

  // Crossfade happens in CSS, so we just change the index
  const advanceSlide = useCallback(() => {
    setCurrentSlide(prev => (prev + 1) % slides.length);
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
    if (!slides.length) return;
    clearTimers();
    setDotProgress(0);
    const slide = slides[currentSlide];

    // Pause other videos only after the fade-out finishes
    const pauseTimeout = setTimeout(() => {
      videoRefs.current.forEach((v, i) => {
        if (v && i !== currentSlide) { v.pause(); v.currentTime = 0; }
      });
    }, 1300);

    if (slide.type === 'image') {
      startImageProgress(autoPlayInterval);
      imageTimerRef.current = setInterval(advanceSlide, autoPlayInterval);
    } else {
      const video = videoRefs.current[currentSlide];
      if (video) {
        video.currentTime = 0;
        video.play().catch(() => {});
        startVideoProgress(video);
      }
    }

    return () => { clearTimers(); clearTimeout(pauseTimeout); };
  }, [currentSlide, slides]); // eslint-disable-line react-hooks/exhaustive-deps

  const goToSlide = (index: number) => {
    if (index === currentSlide) return;
    setCurrentSlide(index);
  };

  if (loading) {
    return (
      <section className="gallery-hero">
        <div className="gallery-hero-loading" />
      </section>
    );
  }

  if (error && !data) {
    console.warn('GalleryHero: using default slides due to API error:', error);
  }

  return (
    <section className="gallery-hero">
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