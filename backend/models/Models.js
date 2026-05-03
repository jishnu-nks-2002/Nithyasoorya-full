const mongoose = require('mongoose');

// ══════════════════════════════════════════════════════════════════
//  CATEGORY MODEL
// ══════════════════════════════════════════════════════════════════
const categorySchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, unique: true, trim: true },
    slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    brand:       { type: String, default: '' },        // e.g. "Nithyasoori", "Enjem"
    brandColor:  { type: String, default: '#9b6fe0' }, // hex accent shown in navbar
    subtitle:    { type: String, default: '' },         // shown under link e.g. "Wall & shelf pieces"
    description: { type: String, default: '' },
    order:       { type: Number, default: 0 },
    isActive:    { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-generate slug from name
categorySchema.pre('validate', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }
  next();
});

const Category = mongoose.model('Category', categorySchema);

// ══════════════════════════════════════════════════════════════════
//  PRODUCT MODEL
// ══════════════════════════════════════════════════════════════════
const productSchema = new mongoose.Schema(
  {
    // ── Identity ────────────────────────────────────────────────────
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    category:    { type: String, required: true, trim: true }, // free string, no enum
    series:      { type: String, default: '' },
    material:    { type: String, default: '' },
    description: { type: String, default: '' },

    // ── Pricing & availability ───────────────────────────────────────
    price:        { type: Number, required: true, default: 0 },
    priceDisplay: { type: String, default: '' },
    availability: {
      type:    String,
      enum:    ['Available', 'Inquire', 'Sold Out'],
      default: 'Available',
    },
    edition:    { type: String, default: '' },
    isNew:      { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },

    // ── Media ────────────────────────────────────────────────────────
    images: [
      {
        url:       { type: String, required: true },
        publicId:  { type: String },
        alt:       { type: String, default: '' },
        isPrimary: { type: Boolean, default: false },
      },
    ],

    // ── Specs ────────────────────────────────────────────────────────
    dimensions: { type: String, default: '' },
    weight:     { type: String, default: '' },
    stoneTypes: [{ type: String }],
    beadSize:   { type: String, default: '' },
    wristSize:  { type: String, default: '' },
    tags:       [{ type: String }],

    // ── Care & shipping ──────────────────────────────────────────────
    careInstructions: { type: String, default: '' },
    shippingInfo:     { type: String, default: '' },

    // ── Order & visibility ───────────────────────────────────────────
    order:    { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Auto-generate slug from name if not provided
productSchema.pre('validate', function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-');
  }
  next();
});

productSchema.virtual('primaryImage').get(function () {
  return this.images.find((i) => i.isPrimary) || this.images[0] || null;
});

productSchema.set('toJSON',   { virtuals: true });
productSchema.set('toObject', { virtuals: true });

const Product = mongoose.model('Product', productSchema);

// ══════════════════════════════════════════════════════════════════
module.exports = { Category, Product };