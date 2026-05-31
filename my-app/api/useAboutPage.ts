// api/useAboutPage.js
"use client";
import { useEffect, useState, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const DEFAULTS = {
  hero: {
    videoSrc: "/your-video.mp4",
    carouselWords: [
      { word: "ARTISTRY",      sub: "THE INTERSECTION OF FLUID RESIN AND ANCIENT TERRESTRIAL STRUCTURE" },
      { word: "ALCHEMY",       sub: "WHERE RAW STONE TRANSFORMS INTO LIQUID LIGHT AND LIVING FORM" },
      { word: "GENESIS",       sub: "BORN FROM THE EARTH'S CORE — SHAPED BY FIRE, TIME AND INTENTION" },
      { word: "STILLNESS",     sub: "A MOMENT FROZEN IN CRYSTAL — SILENCE GIVEN WEIGHT AND PRESENCE" },
      { word: "METAMORPHOSIS", sub: "THE SLOW UNFOLDING OF MATTER INTO MEANING AND SACRED BEAUTY" },
      { word: "SACRED",        sub: "ANCIENT MINERAL WISDOM DISTILLED INTO OBJECTS OF DEVOTION" },
    ],
    marqueeItems: [
      "METAMORPHOSIS","✦","FROZEN LIGHT","✦","ANCIENT FORMATION","✦",
      "ALCHEMY OF STONE","✦","EMPAVAI STUDIO","✦","GEOLOGICAL ART","✦",
      "SACRED SPACES","✦","CRYSTAL WISDOM","✦",
    ],
  },
  about: {
    eyebrow:    "The Original Source",
    headline:   "Where Artistry Meets the Soul",
    headlineEm: "the Soul",
    bodyLeft:   "Every piece at Empavai is more than an ornament — it is a labour of silence and contemplation. Our works speak without words, performing small ceremonies for the beholder, showing every shape and colour at rest.",
    bodyRight:  "We blend traditional and modern materials, making durable yet delicate art for a contemporary collection. Our focus on pure, organic textures reveals the inner depth of the individual and enriches the spaces we inhabit together.",
    imageTop:    "/images/p-6.jpeg",
    imageBottom: "/images/p-4.jpeg",
  },
  artist: {
    name:        "Kavya Nair",
    title:       "Crystal & Resin Sculptor",
    specialty:   "Amethyst · Fluid Resin · Sacred Geometry",
    bio:         "Kavya channels the ancient language of stone into contemporary form. Her work bridges geological time with present stillness — each piece a meditation on matter and memory.",
    worksCount:  34,
    yearsActive: 8,
    collectors:  412,
    quote:       "Every material carries a memory. My work is simply to listen.",
    tag:         "Lead Artist",
    portraitImg: "/images/person/img-1.jpeg",
    featured1:   "/images/p-1.jpeg",
    featured2:   "/images/p-2.jpeg",
    featured3:   "/images/p-3.jpeg",
    studioInfo:  "Empavai Studio · Kerala, India · Est. 2016",
  },
};

/**
 * Prefix /uploads/... paths with the backend origin so Next.js <Image> can load them.
 * Paths starting with /images/ are static Next.js public assets — no prefix needed.
 * Appends ?t=timestamp to bust the browser cache after an admin upload.
 */
function prefixUrl(url) {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("/images/")) return url;
  // /uploads/about/filename.webp  →  http://localhost:5000/uploads/about/filename.webp?t=...
  return `${API_BASE}${url}?t=${Date.now()}`;
}

function prefixAllImages(data) {
  return {
    ...data,
    hero: {
      ...data.hero,
      videoSrc: prefixUrl(data.hero.videoSrc),
    },
    about: {
      ...data.about,
      imageTop:    prefixUrl(data.about.imageTop),
      imageBottom: prefixUrl(data.about.imageBottom),
    },
    artist: {
      ...data.artist,
      portraitImg: prefixUrl(data.artist.portraitImg),
      featured1:   prefixUrl(data.artist.featured1),
      featured2:   prefixUrl(data.artist.featured2),
      featured3:   prefixUrl(data.artist.featured3),
    },
  };
}

function normaliseHero(hero) {
  return {
    ...hero,
    carouselWords: Array.isArray(hero.carouselWords)
      ? hero.carouselWords
      : (() => { try { return JSON.parse(hero.carouselWords); } catch { return DEFAULTS.hero.carouselWords; } })(),
    marqueeItems: Array.isArray(hero.marqueeItems)
      ? hero.marqueeItems
      : (() => { try { return JSON.parse(hero.marqueeItems); } catch { return DEFAULTS.hero.marqueeItems; } })(),
  };
}

/**
 * Merge DB data with DEFAULTS — but only use the default for a field
 * if the DB value is null / undefined. Empty string "" from the DB is valid.
 * This prevents DEFAULTS from overwriting fields the admin intentionally cleared.
 *
 * Exception: bodyLeft / bodyRight — if DB returns "" we fall back to DEFAULTS
 * so the frontend never shows a blank paragraph.
 */
function mergeWithDefaults(dbData) {
  const about = {
    ...DEFAULTS.about,
    ...dbData.about,
    // Only use default body text if the DB field is truly empty
    bodyLeft:  dbData.about?.bodyLeft  || DEFAULTS.about.bodyLeft,
    bodyRight: dbData.about?.bodyRight || DEFAULTS.about.bodyRight,
  };

  const artist = { ...DEFAULTS.artist, ...dbData.artist };

  return {
    hero:   normaliseHero({ ...DEFAULTS.hero,   ...dbData.hero   }),
    about,
    artist,
  };
}

export function useAboutPage() {
  const [data,    setData]    = useState(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/about`, {
        // no-store bypasses Next.js fetch cache — admin changes show immediately
        cache:   "no-store",
        headers: { Accept: "application/json" },
      });
      if (!res.ok) throw new Error(`Server returned ${res.status}`);
      const json = await res.json();

      if (json.success && json.data) {
        const merged = mergeWithDefaults(json.data);
        setData(prefixAllImages(merged));
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}