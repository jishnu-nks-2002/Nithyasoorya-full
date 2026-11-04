// api/useAboutPage.js
"use client";
import { useEffect, useState, useCallback } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

// ─── Types (shared with ArtistryHero / ArtistSection) ────────────────────────
export interface AboutPageData {
  hero: {
    videoSrc: string;
    carouselWords: { word: string; sub: string }[];
    marqueeItems: string[];
  };
  about: {
    eyebrow: string;
    headline: string;
    headlineEm: string;
    bodyLeft: string;
    bodyRight: string;
    imageTop: string;
    imageBottom: string;
  };
  artist: {
    heading: string;
    name: string;
    roles: string[];
    intro: string;
    paragraphs: string[];
    quote: string;          // lines separated by \n
    quoteAuthor: string;
    portraitImg: string;
    awardImg: string;
    studioInfo: string;
  };
}

const DEFAULTS: AboutPageData = {
  hero: {
    videoSrc: "/images/videos/video-1.mp4",
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
    heading:     "About the Artist",
    name:        "Nithya",
    roles:       ["Founder", "Jewellery Designer", "Gemmologist"],
    intro:       "I'm the artist and creator behind Empavai.",
    paragraphs: [
      "For over twenty years, jewellery design has been my creative language—a journey recognized by honours including the World Gold Council Jewellery Awards in the MENA region.",
      "Empavai marks a new chapter in that journey, allowing my imagination to take shape as crystal art decor that brings beauty and meaning to every space.",
      "As a creator, I let my materials themselves guide the design. Inspired by forests, flowing water, ancient symbolism and the quiet energy of natural materials, every piece is handcrafted with close attention to texture, form and intention.",
    ],
    quote:       "Inspired by nature.\nCrafted with meaning.\nTimeless by design.",
    quoteAuthor: "Nithya",
    portraitImg: "/images/person/img-1.jpeg",
    awardImg:    "/images/p-1.jpeg",
    studioInfo:  "",
  },
};

/**
 * Prefix /uploads/... paths with the backend origin so Next.js <Image> can load them.
 * Paths starting with /images/ are static Next.js public assets — no prefix needed.
 * Appends ?t=timestamp to bust the browser cache after an admin upload.
 */
function prefixUrl(url: string) {
  if (!url) return "";
  if (url.startsWith("http") || url.startsWith("/images/")) return url;
  // /uploads/about/filename.webp  →  http://localhost:5000/uploads/about/filename.webp?t=...
  return `${API_BASE}${url}?t=${Date.now()}`;
}

function prefixAllImages(data: any) {
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
      awardImg:    prefixUrl(data.artist.awardImg),
    },
  };
}

function normaliseHero(hero: any) {
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
function mergeWithDefaults(dbData: any) {
  const about = {
    ...DEFAULTS.about,
    ...dbData.about,
    // Only use default body text if the DB field is truly empty
    bodyLeft:  dbData.about?.bodyLeft  || DEFAULTS.about.bodyLeft,
    bodyRight: dbData.about?.bodyRight || DEFAULTS.about.bodyRight,
  };

  const dbArtist = dbData.artist || {};
  const toArr = (v: any, fallback: string[]) => {
    let arr = v;
    if (typeof v === "string") { try { arr = JSON.parse(v); } catch { arr = []; } }
    return Array.isArray(arr) && arr.length ? arr : fallback;
  };
  const artist = {
    ...DEFAULTS.artist,
    ...dbArtist,
    roles:      toArr(dbArtist.roles,      DEFAULTS.artist.roles),
    paragraphs: toArr(dbArtist.paragraphs, DEFAULTS.artist.paragraphs),
    // old documents may lack the new image/quote fields
    awardImg:   dbArtist.awardImg   || DEFAULTS.artist.awardImg,
    portraitImg: dbArtist.portraitImg || DEFAULTS.artist.portraitImg,
    quote:      dbArtist.quote      || DEFAULTS.artist.quote,
  };

  return {
    hero:   normaliseHero({ ...DEFAULTS.hero,   ...dbData.hero   }),
    about,
    artist,
  };
}

export function useAboutPage() {
  const [data,    setData]    = useState<any>(DEFAULTS);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState<string | null>(null);

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
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}