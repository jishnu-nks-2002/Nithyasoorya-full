'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Cormorant_Garamond, Jost } from 'next/font/google';
import './CrystalWisdomSection.css';

const cormorant = Cormorant_Garamond({ weight: ['300', '400', '500', '600'], style: ['normal', 'italic'], subsets: ['latin'], display: 'swap' });
const jost      = Jost({ weight: ['300', '400', '500'], subsets: ['latin'], display: 'swap' });

const API_BASE   = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const GUIDE_SLUG = 'crystal-guide';          // Admin → Crystal Wisdom → "The Empavai Crystal Guide"

interface Detail  { label: string; value: string }
interface Crystal { title: string; details: Detail[] }

// ── Data source: "The Empavai Crystal Guide" (from the shared PDF page) ──────
// Used instantly and as a fallback. When the Crystal Guide page exists in the
// admin panel (Crystal Wisdom → crystal-guide) its content replaces this list,
// so everything stays editable from the admin.
const GUIDE_INTRO = [
  'Every crystal has a natural identity and a symbolic story.',
  'The descriptions below refer to traditional and contemporary associations. They are intended to help you select a crystal by meaning, colour and personal connection.',
];

const row = (n: string, t: string, b: string): Detail[] => [
  { label: 'Natural identity',      value: n },
  { label: 'Traditional symbolism', value: t },
  { label: 'Beautiful for',         value: b },
];

const FALLBACK: Crystal[] = [
  { title: 'Amethyst',         details: row('A purple variety of quartz.', 'Calm, reflection and intuition.', 'Meditation spaces, bedrooms and meaningful adornments.') },
  { title: 'Aquamarine',       details: row('A blue-to-green variety of the mineral beryl.', 'Serenity, courage and communication.', 'Everyday jewellery and quiet, calming spaces.') },
  { title: 'Black Tourmaline', details: row('A dark variety from the tourmaline mineral group.', 'Grounding, boundaries and protection.', 'Entrances, workspaces and everyday bracelets.') },
  { title: 'Carnelian',        details: row('An orange-to-red variety of chalcedony.', 'Creativity, confidence and motivation.', 'Studios, creative spaces and new beginnings.') },
  { title: 'Citrine',          details: row('A yellow-to-orange variety of quartz.', 'Optimism, prosperity and personal power.', 'Workspaces, business areas and uplifting décor.') },
  { title: 'Clear Quartz',     details: row('A colourless variety of crystalline quartz.', 'Clarity, focus and intention.', 'Crystal trees, meditation areas and display arrangements.') },
];

// Soft accent per crystal so the panel feels alive (falls back to brand purple)
const TINTS: Record<string, string> = {
  'amethyst': '#8e5bc4', 'aquamarine': '#3fa7b5', 'black tourmaline': '#3b3447', 'carnelian': '#d2602f',
  'citrine': '#d19a1c', 'clear quartz': '#8a9bb5', 'fluorite': '#4aa88a', 'green aventurine': '#3f9a62',
  'labradorite': '#4a6fa5', 'lapis lazuli': '#2f4aa0', 'moonstone': '#8c96b8', 'pyrite': '#b58a2a',
  'rose quartz': '#d17a95', 'selenite': '#9aa3b2', 'smoky quartz': '#7a6a5e', 'tiger’s eye': '#a8691c',
};
const tint = (name: string) => TINTS[name.trim().toLowerCase()] || '#7c5cbf';

export default function CrystalWisdomSection() {
  const [crystals, setCrystals] = useState<Crystal[]>(FALLBACK);
  const [active,   setActive]   = useState(0);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const res  = await fetch(`${API_BASE}/api/crystal-pages/${GUIDE_SLUG}`, { signal: ctrl.signal });
        if (!res.ok) return;
        const json = await res.json();
        const items: Crystal[] = (json?.data?.sections || [])
          .flatMap((s: { items?: Crystal[] }) => s.items || [])
          .filter((it: Crystal) => it.title && it.details?.length)
          .map((it: Crystal) => ({ title: it.title, details: it.details }));
        if (items.length) { setCrystals(items); setActive(0); }
      } catch { /* keep fallback */ }
    })();
    return () => ctrl.abort();
  }, []);

  const current = crystals[active] || crystals[0];
  const accent  = tint(current.title);

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); setActive((i) => (i + 1) % crystals.length); }
    if (e.key === 'ArrowUp'   || e.key === 'ArrowLeft')  { e.preventDefault(); setActive((i) => (i - 1 + crystals.length) % crystals.length); }
  };

  return (
    <section className="cwx" id="crystal-wisdom" aria-labelledby="cwx-title">
      <div className="cwx-inner">
        <header className="cwx-head">
          <p className={`cwx-eyebrow ${jost.className}`}>Crystal Wisdom</p>
          <h2 id="cwx-title" className={`cwx-title ${cormorant.className}`}>The Empavai Crystal Guide</h2>
          <span className="cwx-rule" aria-hidden />
          <p className={`cwx-lead ${cormorant.className}`}>{GUIDE_INTRO[0]}</p>
          <p className={`cwx-sub ${jost.className}`}>{GUIDE_INTRO[1]}</p>
        </header>

        <div className="cwx-body" style={{ ['--cwx-accent' as string]: accent } as React.CSSProperties}>
          {/* Crystal list — vertical on desktop, swipeable pills on mobile */}
          <div className="cwx-tabs" role="tablist" aria-label="Crystals" aria-orientation="vertical" onKeyDown={onKey}>
            {crystals.map((c, i) => (
              <button
                key={`${c.title}-${i}`}
                role="tab"
                id={`cwx-tab-${i}`}
                aria-selected={i === active}
                aria-controls="cwx-panel"
                tabIndex={i === active ? 0 : -1}
                className={`cwx-tab ${jost.className}${i === active ? ' active' : ''}`}
                onClick={() => setActive(i)}
              >
                <span className="cwx-dot" style={{ background: tint(c.title) }} aria-hidden />
                {c.title}
              </button>
            ))}
          </div>

          {/* Detail panel */}
          <article className="cwx-panel" id="cwx-panel" role="tabpanel" aria-labelledby={`cwx-tab-${active}`} key={current.title}>
            <p className={`cwx-count ${jost.className}`}>
              {String(active + 1).padStart(2, '0')} / {String(crystals.length).padStart(2, '0')}
            </p>
            <h3 className={`cwx-name ${cormorant.className}`}>{current.title}</h3>
            <dl className="cwx-facts">
              {current.details.map((d, i) => (
                <div className="cwx-fact" key={i}>
                  <dt className={jost.className}>{d.label}</dt>
                  <dd className={cormorant.className}>{d.value}</dd>
                </div>
              ))}
            </dl>
          </article>
        </div>

        <div className="cwx-cta">
          <Link href={`/crystal-wisdom/${GUIDE_SLUG}`} className={`cwx-btn ${jost.className}`}>Explore the full guide</Link>
          <Link href="/crystal-wisdom" className={`cwx-link ${jost.className}`}>More Crystal Wisdom →</Link>
        </div>
      </div>
    </section>
  );
}
