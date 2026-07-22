const mongoose = require('mongoose');

const slideSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['image', 'video'], required: true },
    src: { type: String, required: true },
    publicId: { type: String },
    alt: { type: String, default: '' },
    poster: { type: String, default: '' },
    posterPublicId: { type: String, default: '' },
    title: { type: String, default: '' },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const galleryHeroSchema = new mongoose.Schema(
  {
    name: { type: String, default: 'Default', unique: true },
    verticalText: { type: String, default: 'Museum Exhibition 2024' },
    leftLabel: { type: String, default: 'FEATURED EXHIBITION' },
    ctaText: { type: String, default: 'EXPLORE THE COLLECTION' },
    ctaLink: { type: String, default: '#collection' },
    autoPlayInterval: { type: Number, default: 5000 },
    slides: [slideSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GalleryHero', galleryHeroSchema);
