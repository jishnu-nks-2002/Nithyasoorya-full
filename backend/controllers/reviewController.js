const Review = require('../models/Review');
const path   = require('path');
const fs     = require('fs');

// ── helper: derive initials from name ────────────────────────────────────────
const toInitials = (name = '') =>
  name.trim().split(/\s+/).map(w => w[0].toUpperCase()).slice(0, 2).join('');

// ── GET /api/reviews  (public) ───────────────────────────────────────────────
const getReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── GET /api/reviews/admin  (protected) ──────────────────────────────────────
const getReviewsAdmin = async (req, res) => {
  try {
    const reviews = await Review.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data: reviews });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── POST /api/reviews  (protected) ───────────────────────────────────────────
const createReview = async (req, res) => {
  try {
    const { name, title, location, rating, review, productLabel, isActive, order } = req.body;

    if (!name || !review) {
      return res.status(400).json({ success: false, message: 'name and review are required' });
    }

    let productImage = '';
    if (req.file) {
      productImage = `/uploads/reviews/${req.file.filename}`;
    }

    const initials = toInitials(name);
    const count    = await Review.countDocuments();

    const doc = await Review.create({
      name, title, location,
      rating:       Number(rating) || 5,
      review,
      initials,
      productImage,
      productLabel: productLabel || '',
      isActive:     isActive !== 'false' && isActive !== false,
      order:        order !== undefined ? Number(order) : count,
    });

    res.status(201).json({ success: true, data: doc, message: 'Review created' });
  } catch (err) {
    console.error('createReview:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

// ── PUT /api/reviews/:id  (protected) ────────────────────────────────────────
const updateReview = async (req, res) => {
  try {
    const { name, title, location, rating, review, productLabel, isActive, order } = req.body;

    const doc = await Review.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });

    if (name        !== undefined) { doc.name        = name;  doc.initials = toInitials(name); }
    if (title       !== undefined)   doc.title       = title;
    if (location    !== undefined)   doc.location    = location;
    if (rating      !== undefined)   doc.rating      = Number(rating);
    if (review      !== undefined)   doc.review      = review;
    if (productLabel !== undefined)  doc.productLabel = productLabel;
    if (order       !== undefined)   doc.order       = Number(order);
    if (isActive    !== undefined)   doc.isActive    = isActive === 'true' || isActive === true;

    if (req.file) {
      // Delete old file if local
      if (doc.productImage && doc.productImage.startsWith('/uploads/')) {
        const old = path.join(__dirname, '../public', doc.productImage);
        if (fs.existsSync(old)) fs.unlinkSync(old);
      }
      doc.productImage = `/uploads/reviews/${req.file.filename}`;
    }

    await doc.save();
    res.json({ success: true, data: doc, message: 'Review updated' });
  } catch (err) {
    console.error('updateReview:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── DELETE /api/reviews/:id  (protected) ─────────────────────────────────────
const deleteReview = async (req, res) => {
  try {
    const doc = await Review.findByIdAndDelete(req.params.id);
    if (!doc) return res.status(404).json({ success: false, message: 'Not found' });

    if (doc.productImage && doc.productImage.startsWith('/uploads/')) {
      const file = path.join(__dirname, '../public', doc.productImage);
      if (fs.existsSync(file)) fs.unlinkSync(file);
    }

    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── PUT /api/reviews/reorder  (protected) ────────────────────────────────────
const reorderReviews = async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: 'orderedIds array required' });
    }
    await Promise.all(orderedIds.map((id, index) => Review.findByIdAndUpdate(id, { order: index })));
    res.json({ success: true, message: 'Reordered' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = { getReviews, getReviewsAdmin, createReview, updateReview, deleteReview, reorderReviews };