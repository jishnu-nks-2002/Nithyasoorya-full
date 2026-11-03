const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const mongoose   = require('mongoose');
const WisdomPage = require('../models/WisdomPage');

const L = (s) => s.split(',').map((x) => x.trim());

const chakras = [
  ['Root',         'Muladhara',    'Ground, Protect, Belong',   'Symbolically connected with stability, security and our relationship with the Earth.',           'Black Tourmaline, Red Jasper, Smoky Quartz, Hematite',         '#c0392b'],
  ['Sacral',       'Svadhisthana', 'Flow, Create, Feel',        'Symbolically connected with creativity, enjoyment and emotional expression.',                    'Carnelian, Orange Calcite, Sunstone, Moonstone',               '#e67e22'],
  ['Solar Plexus', 'Manipura',     'Shine, Empower, Act',       'Symbolically connected with confidence, determination and personal purpose.',                    'Citrine, Tiger’s Eye, Pyrite, Yellow Jasper',                  '#d4a017'],
  ['Heart',        'Anahata',      'Love, Accept, Open',        'Symbolically connected with compassion, emotional openness and meaningful relationships.',       'Rose Quartz, Green Aventurine, Rhodonite, Jade',               '#2e8b57'],
  ['Throat',       'Vishuddha',    'Speak, Express, Reveal',    'Symbolically connected with communication, honesty and self-expression.',                        'Aquamarine, Lapis Lazuli, Sodalite, Blue Lace Agate',          '#3a8fd6'],
  ['Third Eye',    'Ajna',         'See, Reflect, Awaken',      'Symbolically connected with intuition, imagination and inner awareness.',                        'Amethyst, Labradorite, Fluorite, Iolite',                      '#5b3fa0'],
  ['Crown',        'Sahasrara',    'Connect, Expand, Transcend','Symbolically connected with contemplation, higher awareness and spiritual connection.',          'Clear Quartz, Selenite, Amethyst, Howlite',                    '#9b6fe0'],
].map(([title, subtitle, kw, body, cr, accent]) => ({ title, subtitle, keywords: L(kw), body, crystals: L(cr), accent }));

const zodiac = [
  ['Aries',       'March 21–April 19',      'Carnelian, Red Jasper, Clear Quartz',      'Courage, momentum and confident beginnings.'],
  ['Taurus',      'April 20–May 20',        'Rose Quartz, Emerald, Rhodonite',          'Love, stability and emotional grounding.'],
  ['Gemini',      'May 21–June 20',         'Citrine, Tiger’s Eye, Blue Lace Agate',    'Communication, adaptability and clear thinking.'],
  ['Cancer',      'June 21–July 22',        'Moonstone, Selenite, Aquamarine',          'Intuition, sensitivity and gentle reflection.'],
  ['Leo',         'July 23–August 22',      'Sunstone, Tiger’s Eye, Pyrite',            'Confidence, creativity and radiant expression.'],
  ['Virgo',       'August 23–September 22', 'Amazonite, Moss Agate, Peridot',           'Focus, balance and connection with nature.'],
  ['Libra',       'September 23–October 22','Lapis Lazuli, Rose Quartz, Lepidolite',    'Harmony, thoughtful expression and inner balance.'],
  ['Scorpio',     'October 23–November 21', 'Obsidian, Malachite, Labradorite',         'Transformation, reflection and personal strength.'],
  ['Sagittarius', 'November 22–December 21','Amethyst, Sodalite, Turquoise',            'Wisdom, exploration and truth.'],
  ['Capricorn',   'December 22–January 19', 'Garnet, Smoky Quartz, Black Tourmaline',   'Determination, grounding and purposeful ambition.'],
  ['Aquarius',    'January 20–February 18', 'Amethyst, Fluorite, Hematite',             'Originality, insight and clear ideas.'],
  ['Pisces',      'February 19–March 20',   'Aquamarine, Amethyst, Lepidolite',         'Imagination, intuition and emotional calm.'],
].map(([title, subtitle, cr, intention]) => ({ title, subtitle, crystals: L(cr), intention }));

const spaces = [
  ['Entrance',        'For grounding and a welcoming sense of protection.'],
  ['Living Space',    'For harmony, warmth and balanced surroundings.'],
  ['Bedroom',         'For rest, emotional comfort and gentle energy.'],
  ['Workspace',       'For focus, creativity and purposeful action.'],
  ['Meditation Space','For stillness, awareness and spiritual connection.'],
  ['Terralume Tray',  'A beautiful resting place for bracelets, jewellery and personal crystals.'],
].map(([title, body]) => ({ title, body }));

const pages = [
  {
    slug: 'crystal-wisdom', layout: 'hub', menuLabel: 'Crystal Wisdom', order: 0,
    eyebrow: 'CRYSTAL WISDOM', title: 'Formed by nature. Shaped by time.',
    intro: [
      'Crystals are naturally occurring solids whose atoms are arranged in an ordered structure, and their distinctive colours, patterns and inclusions develop through the minerals, heat, pressure and other geological conditions present during their formation. As they grow slowly within the earth over time, natural variations in colour, shape, texture and inclusions emerge, making each crystal unique.',
      'Beyond their natural beauty, crystals have carried cultural and symbolic meaning for centuries. Across different traditions, they have been associated with protection, clarity, love, courage and spiritual reflection.',
      'At Empavai, we celebrate both dimensions—the natural wonder of the mineral and the personal meaning it may hold.',
      'Whether placed in your space or worn as an adornment, crystals can serve as gentle reminders—to pause, reconnect and live with intention.',
    ].join('\n\n'),
    closingText: 'Created by the Earth.\nChosen by you.\nMade meaningful through intention.',
    items: [],
  },
  {
    slug: 'chakra-connection', layout: 'chakra', menuLabel: 'Chakra Connection', order: 1,
    eyebrow: 'CRYSTAL WISDOM', title: 'Chakra Connection',
    tagline: 'Seven energy centres. Seven paths to balance',
    intro: 'The familiar seven-chakra system represents a symbolic pathway from grounding and self-awareness to expression, insight and spiritual connection.',
    items: chakras,
  },
  {
    slug: 'zodiac-alignment', layout: 'zodiac', menuLabel: 'Zodiac Alignment', order: 2,
    eyebrow: 'CRYSTAL WISDOM', title: 'Zodiac & Crystal Alignment',
    tagline: 'Inspired by the stars. Grounded in personal intention.',
    intro: 'Astrology has long connected zodiac signs with symbolic qualities, elements and planetary influences. Modern crystal traditions extend these associations to gemstones.\n\nThe following is Empavai’s curated guide, based on widely recognised symbolic correspondences.',
    closingText: 'Choose by your sign—or simply choose the crystal that speaks to you.',
    items: zodiac,
  },
  {
    slug: 'sacred-spaces', layout: 'spaces', menuLabel: 'Sacred Spaces', order: 3,
    eyebrow: 'CRYSTAL WISDOM', title: 'Placement with Purpose',
    tagline: 'Where a crystal rests can become part of its meaning.',
    intro: 'Choose by intention, connection, zodiac or chakra.\n\nChoose the crystal that catches your eye, reflects your intention or feels personally meaningful.',
    closingText: 'There is no perfect choice—let your connection guide you.',
    items: spaces,
  },
  {
    slug: 'care-cleanse', layout: 'care', menuLabel: 'Care & Cleanse', order: 4,
    eyebrow: 'CRYSTAL WISDOM', title: 'Care, Cleanse & Reconnect',
    tagline: 'Physical care and symbolic cleansing are different practices.',
    items: [
      { title: 'Physical care', body: 'Use a soft, dry cloth or soft brush to remove dust. Some gemstones tolerate gentle washing, while others—including selenite—should be kept dry. Avoid harsh chemicals, intense sunlight, excessive heat and sudden temperature changes. Store jewellery separately to prevent scratching and damage.' },
      { title: 'Symbolic cleansing', body: 'For symbolic cleansing, crystals may be refreshed through moonlight, smoke cleansing, sound or placement near selenite.' },
      { title: 'Terralume trays', body: 'Use Terralume trays as a beautiful, intentional resting place for bracelets and accessories.' },
    ],
    footnoteTitle: 'A Gentle Reminder',
    footnote: 'Crystals are objects of natural beauty, cultural meaning and personal intention. They are not medical treatments and should never replace professional healthcare. Their beauty lies in what they represent—an intention held, a moment remembered and a connection with the natural world.',
    closingText: 'Nature creates the crystal.\nArt gives it form.\nYou give it meaning.',
  },
];

(async () => {
  const dbMod   = require('../config/db');
  const connect = typeof dbMod === 'function' ? dbMod : (dbMod.connectDB || dbMod.default);
  if (typeof connect === 'function') await connect();
  else if (mongoose.connection.readyState === 0) await mongoose.connect(process.env.MONGO_URI);

  const force = process.argv.includes('--force');
  for (const p of pages) {
    const exists = await WisdomPage.findOne({ slug: p.slug });
    if (exists && !force) { console.log('skipped (exists):', p.slug); continue; }
    if (exists) await exists.deleteOne();
    await WisdomPage.create(p);
    console.log('created:', p.slug);
  }
  await mongoose.disconnect();
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
