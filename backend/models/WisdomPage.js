const mongoose = require('mongoose');

const ItemSchema = new mongoose.Schema({
  title:     { type: String, required: true, trim: true },   // e.g. Root / Aries / Entrance
  subtitle:  { type: String, default: '' },                  // e.g. Muladhara / March 21–April 19
  keywords:  [{ type: String }],                             // e.g. Ground, Protect, Belong
  body:      { type: String, default: '' },
  crystals:  [{ type: String }],
  intention: { type: String, default: '' },                  // "Symbolic intention"
  accent:    { type: String, default: '' },                  // optional hex colour
});

const WisdomPageSchema = new mongoose.Schema(
  {
    slug:      { type: String, required: true, unique: true, trim: true, lowercase: true },
    layout:    { type: String, enum: ['hub', 'chakra', 'zodiac', 'spaces', 'care'], default: 'spaces' },
    menuLabel: { type: String, default: '' },
    eyebrow:   { type: String, default: '' },
    title:     { type: String, required: true, trim: true },
    tagline:   { type: String, default: '' },
    intro:     { type: String, default: '' },                  // paragraphs separated by a blank line
    heroImage: {
      url:      { type: String, default: '' },
      publicId: { type: String, default: '' },
      alt:      { type: String, default: '' },
    },
    items:         [ItemSchema],
    footnoteTitle: { type: String, default: '' },
    footnote:      { type: String, default: '' },
    closingText:   { type: String, default: '' },
    metaTitle:       { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    order:    { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WisdomPage', WisdomPageSchema);
