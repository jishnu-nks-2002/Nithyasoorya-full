const mongoose = require('mongoose');

/**
 * CrystalPage — a dynamic "Crystal Wisdom" page, built in the admin panel
 * the same way a Stone / Product page is (slug, hero image, ordered content).
 *
 * Content structure mirrors the Empavai PDF:
 *   page      → e.g. "Chakra Connection", "Zodiac & Crystal Alignment"
 *   section   → a block on the page (text / cards / list / quote / notice)
 *   item      → one card or row inside a section (e.g. ROOT — MULADHARA,
 *               ARIES, Amethyst, Bedroom …)
 */

const DetailSchema = new mongoose.Schema({
  label: { type: String, default: '' },   // "Natural identity", "Symbolic intention"
  value: { type: String, default: '' },
}, { _id: false });

const ItemSchema = new mongoose.Schema({
  title:       { type: String, default: '' },   // ROOT — MULADHARA | ARIES | Amethyst
  subtitle:    { type: String, default: '' },   // March 21–April 19
  tagline:     { type: String, default: '' },   // Ground • Protect • Belong
  description: { type: String, default: '' },
  chipsLabel:  { type: String, default: '' },   // "Commonly associated crystals"
  chips:       [{ type: String }],              // Black Tourmaline, Red Jasper …
  details:     [DetailSchema],                  // label/value rows
  note:        { type: String, default: '' },   // small caution line
  icon:        { type: String, default: '' },   // emoji / symbol
  color:       { type: String, default: '' },   // accent (chakra colour)
  imageUrl:    { type: String, default: '' },
  publicId:    { type: String, default: '' },   // local filename for cleanup
});

const SectionSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['text', 'cards', 'list', 'quote', 'notice'],
    default: 'text',
  },
  eyebrow: { type: String, default: '' },
  heading: { type: String, default: '' },
  body:    { type: String, default: '' },       // paragraphs separated by a blank line
  lines:   [{ type: String }],                  // quote / notice closing lines
  items:   [ItemSchema],
});

const CrystalPageSchema = new mongoose.Schema(
  {
    // ── Identity ─────────────────────────────────────────────────────────
    title:        { type: String, required: true, trim: true },
    slug:         { type: String, required: true, trim: true, unique: true, lowercase: true },
    eyebrow:      { type: String, default: '' },        // small label above title
    intro:        { type: String, default: '' },        // lead paragraph under the hero title

    // ── Menu (Crystal Wisdom > …) ────────────────────────────────────────
    menuLabel:    { type: String, default: '' },        // falls back to title
    menuSubtitle: { type: String, default: '' },
    showInMenu:   { type: Boolean, default: true },

    // ── Hero ─────────────────────────────────────────────────────────────
    heroImageUrl: { type: String, default: '' },
    heroPublicId: { type: String, default: '' },

    // ── Content ──────────────────────────────────────────────────────────
    sections: [SectionSchema],

    // ── Look ─────────────────────────────────────────────────────────────
    color:        { type: String, default: '#7B4BA0' },

    // ── Admin control ────────────────────────────────────────────────────
    isActive:     { type: Boolean, default: true },
    order:        { type: Number,  default: 0 },

    // ── SEO ──────────────────────────────────────────────────────────────
    metaTitle:       { type: String, default: '' },
    metaDescription: { type: String, default: '' },
  },
  { timestamps: true }
);

CrystalPageSchema.pre('validate', function () {
  if (!this.slug && this.title) {
    this.slug = this.title
      .toLowerCase()
      .replace(/&/g, ' and ')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }
});

module.exports = mongoose.model('CrystalPage', CrystalPageSchema);
