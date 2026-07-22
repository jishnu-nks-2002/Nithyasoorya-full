// backend/models/GalleryItem.js
const mongoose = require('mongoose');

const GalleryItemSchema = new mongoose.Schema(
  {
    // 'image' or 'video'
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true,
    },

    // URL path served by express static, e.g. /uploads/gallery/foo.jpg
    src: {
      type: String,
      required: [true, 'src is required'],
    },

    // For videos: optional thumbnail image path
    poster: {
      type: String,
      default: '',
    },

    // Alt text / caption
    alt: {
      type: String,
      trim: true,
      default: '',
    },

    // Whether it appears in the public dome
    isActive: {
      type: Boolean,
      default: true,
    },

    // Display order (lower = earlier in dome)
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('GalleryItem', GalleryItemSchema);