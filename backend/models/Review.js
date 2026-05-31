const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true, trim: true },
    title:        { type: String, default: '' },
    location:     { type: String, default: '' },
    rating:       { type: Number, default: 5, min: 1, max: 5 },
    review:       { type: String, required: true },
    initials:     { type: String, default: '' },
    productImage: { type: String, default: '' },
    productLabel: { type: String, default: '' },
    isActive:     { type: Boolean, default: true },
    order:        { type: Number, default: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Review', reviewSchema);