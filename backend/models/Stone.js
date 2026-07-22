const mongoose = require('mongoose');

const StoneImageSchema = new mongoose.Schema({
  url:       { type: String, required: true },
  alt:       { type: String, default: '' },
  isPrimary: { type: Boolean, default: false },
  publicId:  { type: String, default: '' },   // Cloudinary public_id or local filename
});

const StonePropertySchema = new mongoose.Schema({
  label: { type: String, required: true },
  value: { type: String, required: true },
});

const StoneHowToUseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  desc:  { type: String, required: true },
});

const StoneFAQSchema = new mongoose.Schema({
  q: { type: String, required: true },
  a: { type: String, required: true },
});

const StoneGallerySchema = new mongoose.Schema({
  bg:    { type: String, default: '' },   // CSS gradient or image URL
  label: { type: String, default: '' },
  imageUrl: { type: String, default: '' }, // optional actual image
  publicId: { type: String, default: '' },
});

const StoneSchema = new mongoose.Schema(
  {
    // ── Core identity ────────────────────────────────────────────────────
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, required: true, trim: true, unique: true, lowercase: true },
    subtitle:    { type: String, default: '' },
    category:    { type: String, default: '' },
    tagline:     { type: String, default: '' },
    description: { type: String, default: '' },

    // ── Energetics ───────────────────────────────────────────────────────
    intentions: [{ type: String }],
    properties: [StonePropertySchema],

    // ── How to use ───────────────────────────────────────────────────────
    howToUse: [StoneHowToUseSchema],

    // ── Gallery ──────────────────────────────────────────────────────────
    gallery: [StoneGallerySchema],

    // ── Hero / listing images ────────────────────────────────────────────
    images: [StoneImageSchema],

    // ── Appearance ───────────────────────────────────────────────────────
    color:       { type: String, default: '#7B4BA0' },
    accentColor: { type: String, default: '#a06bc8' },

    // ── Physical ─────────────────────────────────────────────────────────
    weight:     { type: String, default: '' },
    dimensions: { type: String, default: '' },
    origin:     { type: String, default: '' },
    hardness:   { type: String, default: '' },

    // ── FAQs ─────────────────────────────────────────────────────────────
    faqs: [StoneFAQSchema],

    // ── Admin control ────────────────────────────────────────────────────
    isActive:   { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    order:      { type: Number,  default: 0 },

    // ── SEO ──────────────────────────────────────────────────────────────
    metaTitle:       { type: String, default: '' },
    metaDescription: { type: String, default: '' },
    tags:            [{ type: String }],
  },
  {
    timestamps: true,
    toJSON:    { virtuals: true },
    toObject:  { virtuals: true },
  }
);

// Auto-generate slug from name if not supplied
StoneSchema.pre('validate', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }
  next();
});

// Ensure only one primary image
StoneSchema.pre('save', function (next) {
  const primaryImages = this.images.filter(img => img.isPrimary);
  if (primaryImages.length === 0 && this.images.length > 0) {
    this.images[0].isPrimary = true;
  } else if (primaryImages.length > 1) {
    this.images.forEach((img, i) => { img.isPrimary = i === 0; });
  }
  next();
});

module.exports = mongoose.model('Stone', StoneSchema);