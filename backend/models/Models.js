const mongoose = require('mongoose');

// ══════════════════════════════════════════════════════════════════
//  CATEGORY MODEL
// ══════════════════════════════════════════════════════════════════
const categorySchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, unique: true, trim: true },
    slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    brand:       { type: String, default: '' },
    brandColor:  { type: String, default: '#9b6fe0' },
    subtitle:    { type: String, default: '' },
    description: { type: String, default: '' },
    image: {
      url:      { type: String, default: '' },
      publicId: { type: String, default: '' },
      alt:      { type: String, default: '' },
    },
    order:    { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

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
    name:        { type: String, required: true, trim: true },
    slug:        { type: String, required: true, unique: true, lowercase: true, trim: true },
    category:    { type: String, required: true, trim: true },
    series:      { type: String, default: '' },
    material:    { type: String, default: '' },
    description: { type: String, default: '' },

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

    images: [
      {
        url:       { type: String, required: true },
        publicId:  { type: String },
        alt:       { type: String, default: '' },
        isPrimary: { type: Boolean, default: false },
      },
    ],

    dimensions:       { type: String, default: '' },
    weight:           { type: String, default: '' },
    stoneTypes:       [{ type: String }],
    beadSize:         { type: String, default: '' },
    wristSize:        { type: String, default: '' },
    tags:             [{ type: String }],
    careInstructions: { type: String, default: '' },
    shippingInfo:     { type: String, default: '' },

    order:    { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

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
//  ENQUIRY MODEL
// ══════════════════════════════════════════════════════════════════
const enquirySchema = new mongoose.Schema(
  {
    // Product snapshot at time of enquiry
    productId:       { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    productName:     { type: String, required: true },
    productSlug:     { type: String, required: true },
    productCategory: { type: String, default: '' },
    productPrice:    { type: String, default: '' },

    // Customer info
    name:    { type: String, required: true, trim: true },
    email:   { type: String, required: true, trim: true, lowercase: true },
    phone:   { type: String, default: '', trim: true },
    message: { type: String, default: '', trim: true },

    // Status
    status: {
      type:    String,
      enum:    ['New', 'Contacted', 'Closed'],
      default: 'New',
    },

    source: { type: String, default: 'website' }, // 'website' | 'whatsapp'
  },
  { timestamps: true }
);

const Enquiry = mongoose.model('Enquiry', enquirySchema);

// ══════════════════════════════════════════════════════════════════
module.exports = { Category, Product, Enquiry };