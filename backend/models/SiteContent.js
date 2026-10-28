const mongoose = require('mongoose');

// Generic key → content store for website sections that don't need their own
// collection (chakras, zodiac guide, placement, care, etc.).
// One document per `key`; the shape of `data` depends on the section.
const siteContentSchema = new mongoose.Schema(
  {
    key:      { type: String, required: true, unique: true, trim: true },
    data:     { type: mongoose.Schema.Types.Mixed, default: {} },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, minimize: false }
);

module.exports = mongoose.model('SiteContent', siteContentSchema);