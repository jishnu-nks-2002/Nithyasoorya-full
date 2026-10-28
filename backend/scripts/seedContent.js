/**
 * Empavai — one-shot content seed
 *
 * Usage (from the backend folder):
 *   npm run seed:content              # upsert everything (safe to re-run)
 *   npm run seed:content -- --dry-run # validate all data, no DB connection
 *   npm run seed:content -- --reset   # wipe seeded collections first, then seed
 *
 * Seeds: Categories (4 collections), Stones (crystal guide), About page,
 *        Gallery hero, Gallery items, and SiteContent (chakras, zodiac, etc.)
 *
 * Images are NOT uploaded anywhere — the script points to files that already
 * exist in public/uploads/ and warns if one can't be found.
 */
require('dotenv').config();
const fs       = require('fs');
const path     = require('path');
const mongoose = require('mongoose');

const { Category } = require('../models/Models');
const Stone        = require('../models/Stone');
const AboutPage    = require('../models/About');
const GalleryItem  = require('../models/GalleryItem');
const SiteContent  = require('../models/SiteContent');

// The file is named "Galleryhero.js" in the repo but required as "GalleryHero"
// elsewhere — works on Windows/macOS, fails on Linux. Support both.
let GalleryHero;
try { GalleryHero = require('../models/GalleryHero'); }
catch { GalleryHero = require('../models/Galleryhero'); }

const DRY_RUN = process.argv.includes('--dry-run');
const RESET   = process.argv.includes('--reset');

// ═════════════════════════════════════════════════════════════════════════════
//  IMAGE HELPERS
//  Files are matched by their unique timestamp suffix (e.g. "1779632217514.webp")
//  so odd characters/emoji in the start of a filename don't matter.
// ═════════════════════════════════════════════════════════════════════════════
const UPLOADS  = path.join(__dirname, '..', 'public', 'uploads');
const BASE_URL = (process.env.ASSET_BASE_URL || '').replace(/\/$/, ''); // optional, e.g. http://localhost:5000
const missing  = [];

const img = (folder, suffix) => {
  const dir   = path.join(UPLOADS, folder);
  const files = fs.existsSync(dir) ? fs.readdirSync(dir) : [];
  const found = files.find((f) => f.endsWith(suffix));
  if (!found) {
    missing.push(`${folder}/…${suffix}`);
    return '';
  }
  return `${BASE_URL}/uploads/${folder}/${encodeURIComponent(found)}`;
};

const slugify = (s) =>
  s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

// ═════════════════════════════════════════════════════════════════════════════
//  1. CATEGORIES — the four collections
// ═════════════════════════════════════════════════════════════════════════════
const categories = [
  {
    name: 'Aranyaa',
    brand: 'Aranyaa',
    brandColor: '#4f8a5b',
    subtitle: 'The Tree of Life Collection',
    description:
      'Rooted in wisdom. Reaching toward light. A timeless symbol of life, growth, connection and abundance—reimagined in crystal. Each sculptural piece bridges earth and artistry, carrying nature’s energy into your living space.',
    image: { url: img('about', '1779632217514.webp'), alt: 'Aranyaa — crystal tree of life with yoga figures on a lotus pond' },
    order: 1,
  },
  {
    name: 'Nithyasoori',
    brand: 'Nithyasoori',
    brandColor: '#9b6fe0',
    subtitle: 'The Eternal Aura Collection',
    description:
      'Sacred forms. Timeless presence. Crystal art décor featuring spiritual figures and symbols to bring beauty, meaning and serenity into your space.',
    image: { url: img('gallery', '1779804973792.jpg'), alt: 'Nithyasoori — seated Buddha beneath an amethyst crystal tree' },
    order: 2,
  },
  {
    name: 'enjem',
    brand: 'enjem',
    brandColor: '#c9a36b',
    subtitle: 'Crystal Accessories',
    description:
      'Adorn your crystal energy. A refined collection of handcrafted crystal bracelets and accessories. Designed with minimal forms and carefully selected stones, each piece becomes a personal expression of style, energy and intention.',
    image: { url: '', alt: 'enjem — handcrafted crystal bracelets' }, // no bracelet photo available yet
    order: 3,
  },
  {
    name: 'Terralume',
    brand: 'Terralume',
    brandColor: '#8fb7c9',
    subtitle: 'Crystal Art Trays',
    description:
      'Rest · Cleanse · Recharge. Handcrafted art accessory trays crafted with selenite and natural elements—a beautiful resting place to cleanse and recharge your crystal bracelets & accessories.',
    image: { url: img('gallery', '1779804973737.webp'), alt: 'Terralume — tiered crystal art trays' },
    order: 4,
  },
].map((c) => ({ ...c, slug: slugify(c.name), isActive: true }));

// ═════════════════════════════════════════════════════════════════════════════
//  2. CHAKRAS + ZODIAC (also used to tag each stone below)
// ═════════════════════════════════════════════════════════════════════════════
const chakras = [
  { name: 'Root',         sanskrit: 'Muladhara',    keywords: ['Ground', 'Protect', 'Belong'],       meaning: 'Symbolically connected with stability, security and our relationship with the Earth.',            crystals: ['Black Tourmaline', 'Red Jasper', 'Smoky Quartz', 'Hematite'] },
  { name: 'Sacral',       sanskrit: 'Svadhisthana', keywords: ['Flow', 'Create', 'Feel'],            meaning: 'Symbolically connected with creativity, enjoyment and emotional expression.',                      crystals: ['Carnelian', 'Orange Calcite', 'Sunstone', 'Moonstone'] },
  { name: 'Solar Plexus', sanskrit: 'Manipura',     keywords: ['Shine', 'Empower', 'Act'],           meaning: 'Symbolically connected with confidence, determination and personal purpose.',                      crystals: ['Citrine', "Tiger's Eye", 'Pyrite', 'Yellow Jasper'] },
  { name: 'Heart',        sanskrit: 'Anahata',      keywords: ['Love', 'Accept', 'Open'],            meaning: 'Symbolically connected with compassion, emotional openness and meaningful relationships.',        crystals: ['Rose Quartz', 'Green Aventurine', 'Rhodonite', 'Jade'] },
  { name: 'Throat',       sanskrit: 'Vishuddha',    keywords: ['Speak', 'Express', 'Reveal'],        meaning: 'Symbolically connected with communication, honesty and self-expression.',                          crystals: ['Aquamarine', 'Lapis Lazuli', 'Sodalite', 'Blue Lace Agate'] },
  { name: 'Third Eye',    sanskrit: 'Ajna',         keywords: ['See', 'Reflect', 'Awaken'],          meaning: 'Symbolically connected with intuition, imagination and inner awareness.',                          crystals: ['Amethyst', 'Labradorite', 'Fluorite', 'Iolite'] },
  { name: 'Crown',        sanskrit: 'Sahasrara',    keywords: ['Connect', 'Expand', 'Transcend'],    meaning: 'Symbolically connected with contemplation, higher awareness and spiritual connection.',            crystals: ['Clear Quartz', 'Selenite', 'Amethyst', 'Howlite'] },
];

const zodiac = [
  { sign: 'Aries',       dates: 'March 21–April 19',      crystals: ['Carnelian', 'Red Jasper', 'Clear Quartz'],        intention: 'Courage, momentum and confident beginnings.' },
  { sign: 'Taurus',      dates: 'April 20–May 20',        crystals: ['Rose Quartz', 'Emerald', 'Rhodonite'],            intention: 'Love, stability and emotional grounding.' },
  { sign: 'Gemini',      dates: 'May 21–June 20',         crystals: ['Citrine', "Tiger's Eye", 'Blue Lace Agate'],      intention: 'Communication, adaptability and clear thinking.' },
  { sign: 'Cancer',      dates: 'June 21–July 22',        crystals: ['Moonstone', 'Selenite', 'Aquamarine'],            intention: 'Intuition, sensitivity and gentle reflection.' },
  { sign: 'Leo',         dates: 'July 23–August 22',      crystals: ['Sunstone', "Tiger's Eye", 'Pyrite'],              intention: 'Confidence, creativity and radiant expression.' },
  { sign: 'Virgo',       dates: 'August 23–September 22', crystals: ['Amazonite', 'Moss Agate', 'Peridot'],             intention: 'Focus, balance and connection with nature.' },
  { sign: 'Libra',       dates: 'September 23–October 22',crystals: ['Lapis Lazuli', 'Rose Quartz', 'Lepidolite'],      intention: 'Harmony, thoughtful expression and inner balance.' },
  { sign: 'Scorpio',     dates: 'October 23–November 21', crystals: ['Obsidian', 'Malachite', 'Labradorite'],           intention: 'Transformation, reflection and personal strength.' },
  { sign: 'Sagittarius', dates: 'November 22–December 21',crystals: ['Amethyst', 'Sodalite', 'Turquoise'],              intention: 'Wisdom, exploration and truth.' },
  { sign: 'Capricorn',   dates: 'December 22–January 19',crystals: ['Garnet', 'Smoky Quartz', 'Black Tourmaline'],     intention: 'Determination, grounding and purposeful ambition.' },
  { sign: 'Aquarius',    dates: 'January 20–February 18', crystals: ['Amethyst', 'Fluorite', 'Hematite'],               intention: 'Originality, insight and clear ideas.' },
  { sign: 'Pisces',      dates: 'February 19–March 20',   crystals: ['Aquamarine', 'Amethyst', 'Lepidolite'],           intention: 'Imagination, intuition and emotional calm.' },
];

const chakrasFor = (stone) => chakras.filter((c) => c.crystals.includes(stone)).map((c) => c.name);
const signsFor   = (stone) => zodiac.filter((z) => z.crystals.includes(stone)).map((z) => z.sign);

// ═════════════════════════════════════════════════════════════════════════════
//  3. STONES — "The Empavai Crystal Guide"
// ═════════════════════════════════════════════════════════════════════════════
const crystalGuide = [
  { name: 'Amethyst',         family: 'Quartz',      identity: 'A purple variety of quartz.',                                                              symbolism: 'Calm, reflection and intuition.',                       intentions: ['Calm', 'Reflection', 'Intuition'],                   beautifulFor: 'Meditation spaces, bedrooms and meaningful adornments.',                   color: '#7B4BA0', accent: '#a06bc8' },
  { name: 'Aquamarine',       family: 'Beryl',       identity: 'A blue-to-green variety of the mineral beryl.',                                            symbolism: 'Serenity, courage and communication.',                  intentions: ['Serenity', 'Courage', 'Communication'],              beautifulFor: 'Everyday jewellery and quiet, calming spaces.',                            color: '#5fb3c7', accent: '#8fd3e0' },
  { name: 'Black Tourmaline', family: 'Tourmaline',  identity: 'A dark variety from the tourmaline mineral group.',                                        symbolism: 'Grounding, boundaries and protection.',                 intentions: ['Grounding', 'Boundaries', 'Protection'],             beautifulFor: 'Entrances, workspaces and everyday bracelets.',                            color: '#2b2b2f', accent: '#55555c' },
  { name: 'Carnelian',        family: 'Chalcedony',  identity: 'An orange-to-red variety of chalcedony.',                                                  symbolism: 'Creativity, confidence and motivation.',                intentions: ['Creativity', 'Confidence', 'Motivation'],            beautifulFor: 'Studios, creative spaces and new beginnings.',                             color: '#c8502e', accent: '#e8794f' },
  { name: 'Citrine',          family: 'Quartz',      identity: 'A yellow-to-orange variety of quartz.',                                                    symbolism: 'Optimism, prosperity and personal power.',              intentions: ['Optimism', 'Prosperity', 'Personal power'],          beautifulFor: 'Workspaces, business areas and uplifting décor.',                          color: '#d9a21b', accent: '#f0c94d' },
  { name: 'Clear Quartz',     family: 'Quartz',      identity: 'A colourless variety of crystalline quartz.',                                              symbolism: 'Clarity, focus and intention.',                         intentions: ['Clarity', 'Focus', 'Intention'],                     beautifulFor: 'Crystal trees, meditation areas and display arrangements.',                color: '#9fb4c4', accent: '#d6e4ee' },
  { name: 'Fluorite',         family: 'Fluorite',    identity: 'A colourful mineral valued for its range of hues and fluorescence.',                       symbolism: 'Organisation, concentration and clear thinking.',       intentions: ['Organisation', 'Concentration', 'Clear thinking'],   beautifulFor: 'Desks, study areas and creative workspaces.',                              color: '#5aa89a', accent: '#9b7fd0' },
  { name: 'Green Aventurine', family: 'Quartz',      identity: 'Quartz containing mineral inclusions that create a subtle shimmering appearance.',         symbolism: 'Opportunity, optimism and renewal.',                    intentions: ['Opportunity', 'Optimism', 'Renewal'],                beautifulFor: 'Living spaces, work areas and meaningful gifts.',                          color: '#3f8f5f', accent: '#7cc79a' },
  { name: 'Labradorite',      family: 'Feldspar',    identity: 'A feldspar known for flashes of blue, green and gold called labradorescence.',             symbolism: 'Transformation, intuition and self-discovery.',         intentions: ['Transformation', 'Intuition', 'Self-discovery'],     beautifulFor: 'Personal adornments and reflective spaces.',                               color: '#3f5f7a', accent: '#6fa3b8' },
  { name: 'Lapis Lazuli',     family: 'Rock',        identity: 'A blue rock composed mainly of lazurite, often with calcite and pyrite.',                  symbolism: 'Wisdom, truth and expression.',                         intentions: ['Wisdom', 'Truth', 'Expression'],                     beautifulFor: 'Jewellery, artistic objects and communication spaces.',                    color: '#1f3f8f', accent: '#4f6fc4' },
  { name: 'Moonstone',        family: 'Feldspar',    identity: 'A feldspar admired for its floating, moonlike sheen.',                                     symbolism: 'New beginnings, intuition and emotional awareness.',    intentions: ['New beginnings', 'Intuition', 'Emotional awareness'],beautifulFor: 'Jewellery, bedrooms and personal spaces.',                                 color: '#a9b4d0', accent: '#dfe4f2' },
  { name: 'Pyrite',           family: 'Sulphide',    identity: 'An iron sulphide mineral recognised by its metallic, golden appearance.',                  symbolism: 'Confidence, determination and abundance.',              intentions: ['Confidence', 'Determination', 'Abundance'],          beautifulFor: 'Offices, display areas and bold decorative details.',                      care: 'Keep pyrite dry and away from prolonged humidity.', color: '#b8963e', accent: '#e0c777' },
  { name: 'Rose Quartz',      family: 'Quartz',      identity: 'A pale-pink variety of quartz.',                                                           symbolism: 'Love, compassion and emotional warmth.',                intentions: ['Love', 'Compassion', 'Emotional warmth'],            beautifulFor: 'Bedrooms, living spaces and heartfelt gifts.',                             color: '#d98fa3', accent: '#f0bccb' },
  { name: 'Selenite',         family: 'Gypsum',      identity: 'A transparent or translucent crystalline variety of gypsum.',                              symbolism: 'Clarity, stillness and purification.',                  intentions: ['Clarity', 'Stillness', 'Purification'],              beautifulFor: 'Meditation spaces, displays and Terralume trays.',                         care: 'Selenite is soft and moisture-sensitive. Keep it dry and handle it carefully.', color: '#cfcfd6', accent: '#f2f2f6' },
  { name: 'Smoky Quartz',     family: 'Quartz',      identity: 'A naturally brown-to-grey variety of quartz.',                                             symbolism: 'Grounding, resilience and release.',                    intentions: ['Grounding', 'Resilience', 'Release'],                beautifulFor: 'Entrances, workspaces and contemplative areas.',                           color: '#6b5a4e', accent: '#9a8878' },
  { name: "Tiger's Eye",      family: 'Quartz',      identity: 'A quartz gemstone known for its silky bands of reflected light.',                          symbolism: 'Courage, confidence and discernment.',                  intentions: ['Courage', 'Confidence', 'Discernment'],              beautifulFor: 'Bracelets, workspaces and statement pieces.',                              color: '#8a5a1e', accent: '#c28a3a' },
  { name: 'Multi-Crystal',    family: 'Multi-Crystal', identity: '',
    summary: 'Each crystal contributes its own symbolic meaning. Together, they represent the many dimensions of life—grounding, love, clarity, confidence, creativity and spiritual reflection.',
    symbolism: 'Balance, unity, abundance and the harmonious connection of different intentions.',
    intentions: ['Balance', 'Unity', 'Abundance', 'Harmony'],
    beautifulFor: 'Living spaces, entrances, workspaces, meditation corners and meaningful gifts.',
    color: '#7B4BA0', accent: '#d9a21b' },
];

const lowerFirst = (s) => s.charAt(0).toLowerCase() + s.slice(1);

const stones = crystalGuide.map((c, i) => {
  const chakraList = chakrasFor(c.name);
  const signList   = signsFor(c.name);

  const description = c.summary
    ? c.summary
    : `${c.identity.replace(/\.$/, '')}, traditionally associated with ${lowerFirst(c.symbolism)}`;

  const properties = [];
  if (c.identity)          properties.push({ label: 'Natural identity',      value: c.identity });
  properties.push(                         { label: 'Traditional symbolism', value: c.symbolism });
  if (chakraList.length)   properties.push({ label: 'Chakra',                value: chakraList.join(', ') });
  if (signList.length)     properties.push({ label: 'Zodiac',                value: signList.join(', ') });

  const howToUse = [{ title: 'Beautiful for', desc: c.beautifulFor }];
  if (c.care) howToUse.push({ title: 'Care', desc: c.care });

  return {
    name: c.name,
    slug: slugify(c.name),
    subtitle: c.identity,
    category: c.family,
    tagline: c.symbolism,
    description,
    intentions: c.intentions,
    properties,
    howToUse,
    gallery: [],
    images: [],            // add photos later from the admin panel
    color: c.color,
    accentColor: c.accent,
    faqs: [],
    isActive: true,
    isFeatured: false,
    order: i + 1,
    metaTitle: `${c.name} — Empavai Crystal Guide`,
    metaDescription: `${c.name}: ${c.symbolism}`,
    tags: [...new Set([...chakraList, ...signList, ...c.intentions].map((t) => t.toLowerCase()))],
  };
});

// ═════════════════════════════════════════════════════════════════════════════
//  4. ABOUT PAGE (hero + about + artist)
// ═════════════════════════════════════════════════════════════════════════════
const aboutPage = {
  hero: {
    videoSrc: img('about', '1777788578095.mp4') || '/your-video.mp4',
    carouselWords: [
      { word: 'Aranyaa',     sub: 'The Tree of Life Collection' },
      { word: 'Nithyasoori', sub: 'The Eternal Aura Collection' },
      { word: 'enjem',       sub: 'Crystal Accessories' },
      { word: 'Terralume',   sub: 'Crystal Art Trays' },
    ],
    marqueeItems: [
      'Inspired by Nature',
      'Crafted with Meaning',
      'Art that holds an energy',
      'Crystal Art Décor',
      'Handcrafted Adornments',
      'Timeless by Design',
    ],
  },
  about: {
    eyebrow: 'Welcome to Empavai',
    headline: 'Where creativity meets elegance',
    headlineEm: 'meets elegance',
    bodyLeft:
      'Our curated collection blends artistic expression with the quiet power of crystals—creations designed to elevate your space, your style and your spirit.',
    bodyRight:
      'One-of-a-kind crystal art décor and adornments, thoughtfully handcrafted to bring beauty, balance and intention into everyday life.',
    imageTop:    img('about', '1779632217514.webp'),
    imageBottom: img('about', '1779632217487.webp'),
  },
  artist: {
    name: 'Nithya',
    title: 'Founder · Jewellery Designer · Gemmologist',
    specialty: 'Crystal Art Décor · Handcrafted Adornments',
    bio: [
      'I’m Nithya, the artist and creator behind Empavai.',
      'For over twenty years, jewellery design has been my creative language—a journey recognized by honours including the World Gold Council Jewellery Awards in the MENA region.',
      'Empavai marks a new chapter in that journey, allowing my imagination to take shape as crystal art decor that brings beauty and meaning to every space.',
      'As a creator, I let my materials themselves guide the design. Inspired by forests, flowing water, ancient symbolism and the quiet energy of natural materials, every piece is handcrafted with close attention to texture, form and intention.',
    ].join('\n\n'),
    worksCount: 0,   // not in the content doc — set from admin
    yearsActive: 20, // "over twenty years"
    collectors: 0,   // not in the content doc — set from admin
    quote: 'Inspired by nature. Crafted with meaning. Timeless by design.',
    tag: 'Founder & Artist',
    portraitImg: img('about', '1779632217482.jpeg'),
    featured1:   img('about', '1777785277490.jpeg'),
    featured2:   img('about', '1777785277501.jpeg'),
    featured3:   img('about', '1779632217503.webp'),
    studioInfo: 'Empavai — Art & Adornments',
  },
};

// ═════════════════════════════════════════════════════════════════════════════
//  5. GALLERY HERO + GALLERY ITEMS (existing uploaded images)
// ═════════════════════════════════════════════════════════════════════════════
const galleryHero = {
  name: 'Default',
  verticalText: 'Empavai — Art & Adornments',
  leftLabel: 'INSPIRED BY NATURE · CRAFTED WITH MEANING',
  ctaText: 'EXPLORE THE COLLECTION',
  ctaLink: '#collection',
  autoPlayInterval: 5000,
  isActive: true,
  slides: [
    { type: 'image', src: img('gallery', '1779804973707.webp'), alt: 'Aranyaa crystal tree of life', title: 'Aranyaa',     description: 'The Tree of Life Collection — rooted in wisdom, reaching toward light.', order: 1, isActive: true },
    { type: 'image', src: img('gallery', '1779804973792.jpg'),   alt: 'Nithyasoori spiritual figure with crystal tree', title: 'Nithyasoori', description: 'The Eternal Aura Collection — sacred forms, timeless presence.', order: 2, isActive: true },
    { type: 'image', src: img('gallery', '1779804973737.webp'),  alt: 'Terralume crystal art trays', title: 'Terralume',   description: 'Crystal Art Trays — rest, cleanse, recharge.', order: 3, isActive: true },
  ].filter((s) => s.src),
};

const galleryItems = [
  ['1779804973680.webp', 'Green aventurine crystal tree with yoga figures on a lotus pond tray'],
  ['1779804973681.webp', 'Lotus pond tray with koi, lily pads and natural stones'],
  ['1779804973707.webp', 'Aventurine crystal tree and yoga figures beside a green plant'],
  ['1779804973620.webp', 'Krishna figure beneath a carnelian crystal tree'],
  ['1779804973635.webp', 'Krishna figure with carnelian crystal tree among green plants'],
  ['1779804973657.webp', 'Krishna crystal tree art piece on a resin pond tray'],
  ['1779804973722.webp', 'Citrine crystal tree with a white yoga figure on a blue resin tray'],
  ['1779804973724.webp', 'Citrine crystal tree with a meditating figure on a blue resin tray'],
  ['1779804973737.webp', 'Tiered Terralume trays with crystal trees and white figures'],
  ['1779804973757.webp', 'Amethyst crystal tree with a white yoga figure on a blue resin tray'],
  ['1779804973761.webp', 'Rose quartz crystal tree with a white yoga figure on a blue resin tray'],
  ['1779804973792.jpg',  'Seated Buddha beneath an amethyst crystal tree'],
  ['1779804973783.jpg',  'Buddha figure with amethyst crystal tree and golden accents'],
].map(([suffix, alt], i) => ({
  type: 'image',
  src: img('gallery', suffix),
  poster: '',
  alt,
  isActive: true,
  order: i + 1,
})).filter((g) => g.src);

// ═════════════════════════════════════════════════════════════════════════════
//  6. SITE CONTENT — sections with no dedicated model
// ═════════════════════════════════════════════════════════════════════════════
const siteContent = [
  {
    key: 'brand',
    data: {
      name: 'Empavai',
      tagline: 'Art & Adornments',
      welcomeEyebrow: 'Welcome to Empavai',
      welcomeHeading: 'Where creativity meets elegance',
      welcomeText:
        'Our curated collection blends artistic expression with the quiet power of crystals—creations designed to elevate your space, your style and your spirit.',
      heroEyebrow: 'Inspired by nature · Crafted with meaning',
      heroHeading: 'Art that holds an energy.',
      heroText:
        'One-of-a-kind crystal art décor and adornments, thoughtfully handcrafted to bring beauty, balance and intention into everyday life',
      collectionsHeading: 'Our Collections',
    },
  },
  {
    key: 'crystalWisdom',
    data: {
      eyebrow: 'Crystal Wisdom',
      heading: ['Formed by nature.', 'Shaped by time.'],
      paragraphs: [
        'Crystals are naturally occurring solids whose atoms are arranged in an ordered structure, and their distinctive colours, patterns and inclusions develop through the minerals, heat, pressure and other geological conditions present during their formation. As they grow slowly within the earth over time, natural variations in colour, shape, texture and inclusions emerge, making each crystal unique.',
        'Beyond their natural beauty, crystals have carried cultural and symbolic meaning for centuries. Across different traditions, they have been associated with protection, clarity, love, courage and spiritual reflection.',
        'At Empavai, we celebrate both dimensions—the natural wonder of the mineral and the personal meaning it may hold.',
        'Whether placed in your space or worn as an adornment, crystals can serve as gentle reminders—to pause, reconnect and live with intention.',
      ],
      closing: ['Created by the Earth.', 'Chosen by you.', 'Made meaningful through intention.'],
    },
  },
  {
    key: 'chakras',
    data: {
      eyebrow: 'Chakra Connection',
      heading: 'Seven energy centres. Seven paths to balance',
      intro:
        'The familiar seven-chakra system represents a symbolic pathway from grounding and self-awareness to expression, insight and spiritual connection.',
      crystalsLabel: 'Commonly associated crystals:',
      items: chakras,
    },
  },
  {
    key: 'zodiac',
    data: {
      eyebrow: 'Zodiac & Crystal Alignment',
      heading: ['Inspired by the stars.', 'Grounded in personal intention.'],
      paragraphs: [
        'Astrology has long connected zodiac signs with symbolic qualities, elements and planetary influences. Modern crystal traditions extend these associations to gemstones.',
        'The following is Empavai’s curated guide, based on widely recognised symbolic correspondences.',
      ],
      footnote: 'Choose by your sign—or simply choose the crystal that speaks to you.',
      intentionLabel: 'Symbolic intention:',
      items: zodiac,
    },
  },
  {
    key: 'crystalGuide',
    data: {
      eyebrow: 'The Empavai Crystal Guide',
      heading: 'Every crystal has a natural identity and a symbolic story.',
      intro:
        'The descriptions below refer to traditional and contemporary associations. They are intended to help you select a crystal by meaning, colour and personal connection.',
      note: 'Full crystal entries are stored in the Stones collection.',
    },
  },
  {
    key: 'howToChoose',
    data: {
      eyebrow: 'How to choose your crystal',
      heading: 'Choose by intention, connection, zodiac or chakra.',
      text: 'Choose the crystal that catches your eye, reflects your intention or feels personally meaningful.',
      closing: 'There is no perfect choice—let your connection guide you.',
    },
  },
  {
    key: 'placement',
    data: {
      eyebrow: 'Placement with purpose',
      heading: 'Where a crystal rest can become part of its meaning.',
      items: [
        { place: 'Entrance',         text: 'For grounding and a welcoming sense of protection.' },
        { place: 'Living Space',     text: 'For harmony, warmth and balanced surroundings.' },
        { place: 'Bedroom',          text: 'For rest, emotional comfort and gentle energy.' },
        { place: 'Workspace',        text: 'For focus, creativity and purposeful action.' },
        { place: 'Meditation Space', text: 'For stillness, awareness and spiritual connection.' },
        { place: 'Terralume Tray',   text: 'A beautiful resting place for bracelets, jewellery and personal crystals.' },
      ],
    },
  },
  {
    key: 'care',
    data: {
      eyebrow: 'Care, Cleanse & Reconnect',
      heading: 'Physical care and symbolic cleansing are different practices.',
      physicalTitle: 'Physical care',
      physical:
        'For physical care, use a soft, dry cloth or soft brush to remove dust. Some gemstones tolerate gentle washing, while others—including selenite—should be kept dry. Avoid harsh chemicals, intense sunlight, excessive heat and sudden temperature changes. Store jewellery separately to prevent scratching and damage.',
      symbolicTitle: 'Symbolic cleansing',
      symbolic:
        'For symbolic cleansing, crystals may be refreshed through moonlight, smoke cleansing, sound or placement near selenite.',
      terralume: 'Use Terralume trays as a beautiful, intentional resting place for bracelets and accessories.',
    },
  },
  {
    key: 'reminder',
    data: {
      eyebrow: 'A Gentle Reminder',
      heading: 'Crystals are objects of natural beauty, cultural meaning and personal intention.',
      text:
        'They are not medical treatments and should never replace professional healthcare. Their beauty lies in what they represent—an intention held, a moment remembered and a connection with the natural world.',
      closing: ['Nature creates the crystal.', 'Art gives it form.', 'You give it meaning.'],
    },
  },
];

// ═════════════════════════════════════════════════════════════════════════════
//  RUN
// ═════════════════════════════════════════════════════════════════════════════
const upsert = (Model, filter, doc) =>
  Model.findOneAndUpdate(filter, { $set: doc }, {
    upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true,
  });

const validateAll = () => {
  const jobs = [
    ['Category',    Category,    categories],
    ['Stone',       Stone,       stones],
    ['GalleryItem', GalleryItem, galleryItems],
    ['SiteContent', SiteContent, siteContent],
    ['GalleryHero', GalleryHero, [galleryHero]],
    ['AboutPage',   AboutPage,   [aboutPage]],
  ];
  let ok = true;
  for (const [label, Model, docs] of jobs) {
    docs.forEach((d, i) => {
      const err = new Model(d).validateSync();
      if (err) { ok = false; console.error(`❌ ${label}[${i}] invalid:`, err.message); }
    });
    console.log(`   ${label.padEnd(12)} ${docs.length} document(s) checked`);
  }
  return ok;
};

const run = async () => {
  console.log(DRY_RUN ? '🔎 Dry run — validating only\n' : '🌱 Seeding Empavai content\n');

  if (missing.length) {
    console.warn('⚠️  Image files not found (field left empty / skipped):');
    [...new Set(missing)].forEach((m) => console.warn('   -', m));
    console.warn('');
  }

  if (DRY_RUN) {
    const ok = validateAll();
    console.log(ok ? '\n✅ All seed data is valid.' : '\n❌ Fix the errors above.');
    process.exit(ok ? 0 : 1);
  }

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  if (RESET) {
    console.log('🧹 --reset: clearing Categories, Stones, About, GalleryHero, GalleryItems, SiteContent');
    await Promise.all([
      Category.deleteMany({}), Stone.deleteMany({}), AboutPage.deleteMany({}),
      GalleryHero.deleteMany({}), GalleryItem.deleteMany({}), SiteContent.deleteMany({}),
    ]);
  }

  for (const c of categories)  await upsert(Category,    { slug: c.slug }, c);
  console.log(`✅ Categories    ${categories.length}`);

  for (const s of stones)      await upsert(Stone,       { slug: s.slug }, s);
  console.log(`✅ Stones        ${stones.length}`);

  await upsert(AboutPage, {}, aboutPage);
  console.log('✅ About page    hero + about + artist');

  await upsert(GalleryHero, { name: galleryHero.name }, galleryHero);
  console.log(`✅ Gallery hero  ${galleryHero.slides.length} slides`);

  for (const g of galleryItems) await upsert(GalleryItem, { src: g.src }, g);
  console.log(`✅ Gallery items ${galleryItems.length}`);

  for (const s of siteContent) await upsert(SiteContent, { key: s.key }, s);
  console.log(`✅ Site content  ${siteContent.length} sections`);

  console.log('\n🎉 Content seed complete!');
  await mongoose.disconnect();
  process.exit(0);
};

run().catch((err) => {
  console.error('❌ Seed error:', err);
  process.exit(1);
});