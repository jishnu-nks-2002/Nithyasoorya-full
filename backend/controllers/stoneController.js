const path  = require('path');
const fs    = require('fs');
const Stone = require('../models/Stone');

// ── Helpers ───────────────────────────────────────────────────────────────────
const autoSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

const buildImageUrl = (req, filename) =>
  `${req.protocol}://${req.get('host')}/uploads/stones/${filename}`;

const deleteLocalFile = (filename) => {
  if (!filename) return;
  const p = path.join(__dirname, '..', 'public', 'uploads', 'stones', filename);
  fs.unlink(p, (err) => {
    if (err && err.code !== 'ENOENT') console.error('File delete error:', err);
  });
};

const parseJSON = (val, fallback = []) => {
  if (!val) return fallback;
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return fallback; }
};

// ── GET /api/stones ───────────────────────────────────────────────────────────
exports.getAllStones = async (req, res) => {
  try {
    const { active, featured, category, limit = 50, page = 1 } = req.query;
    const filter = {};
    if (active   !== undefined) filter.isActive   = active   === 'true';
    if (featured !== undefined) filter.isFeatured = featured === 'true';
    if (category)               filter.category   = category;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await Stone.countDocuments(filter);
    const stones = await Stone.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, data: stones, pagination: { total, page: Number(page), limit: Number(limit), pages: Math.ceil(total / Number(limit)) } });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ── GET /api/stones/:slug ─────────────────────────────────────────────────────
exports.getStoneBySlug = async (req, res) => {
  try {
    const stone = await Stone.findOne({ slug: req.params.slug });
    if (!stone) return res.status(404).json({ success: false, message: 'Stone not found' });
    res.json({ success: true, data: stone });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ── GET /api/stones/id/:id ────────────────────────────────────────────────────
exports.getStoneById = async (req, res) => {
  try {
    const stone = await Stone.findById(req.params.id);
    if (!stone) return res.status(404).json({ success: false, message: 'Stone not found' });
    res.json({ success: true, data: stone });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ── Shared helper: merge galleryImages files into gallery array ───────────────
// The client sends galleryImages[0], galleryImages[1] … matched by slide index.
// It also sends galleryImageIndexes = JSON array of slide indexes for each file.
function mergeGalleryImages(req, gallery, baseUrl) {
  const galleryFiles = req.files?.galleryImages || [];
  if (galleryFiles.length === 0) return gallery;

  // Client sends a parallel array of slide indexes
  const indexes = parseJSON(req.body.galleryImageIndexes, []);

  galleryFiles.forEach((file, fi) => {
    const slideIdx = indexes[fi] !== undefined ? Number(indexes[fi]) : fi;
    const url = `${baseUrl}/uploads/stones/${file.filename}`;
    if (gallery[slideIdx]) {
      // Delete old file if replacing
      if (gallery[slideIdx].publicId) deleteLocalFile(gallery[slideIdx].publicId);
      gallery[slideIdx].imageUrl  = url;
      gallery[slideIdx].publicId  = file.filename;
    }
    // If the slide index is beyond current gallery length, append a new slide
    else {
      gallery.push({ bg: '', label: `Slide ${slideIdx + 1}`, imageUrl: url, publicId: file.filename });
    }
  });

  return gallery;
}

// ── POST /api/stones ──────────────────────────────────────────────────────────
exports.createStone = async (req, res) => {
  try {
    const {
      name, slug, subtitle, category, tagline, description,
      color, accentColor, weight, dimensions, origin, hardness,
      isActive, isFeatured, order, metaTitle, metaDescription,
      intentions, properties, howToUse, faqs, gallery: galleryRaw, tags,
    } = req.body;

    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    // Hero images
    const heroFiles = req.files?.images || [];
    const images = heroFiles.map((file, idx) => ({
      url:       buildImageUrl(req, file.filename),
      alt:       name,
      isPrimary: idx === 0,
      publicId:  file.filename,
    }));

    // Gallery slides — parse JSON first, then merge uploaded images
    let gallery = parseJSON(galleryRaw, []);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    gallery = mergeGalleryImages(req, gallery, baseUrl);

    const stone = new Stone({
      name, subtitle: subtitle || '', category: category || '',
      tagline: tagline || '', description: description || '',
      slug: slug || autoSlug(name),
      color: color || '#7B4BA0', accentColor: accentColor || '#a06bc8',
      weight: weight || '', dimensions: dimensions || '',
      origin: origin || '', hardness: hardness || '',
      isActive:   isActive   !== undefined ? (isActive   === 'true' || isActive   === true) : true,
      isFeatured: isFeatured !== undefined ? (isFeatured === 'true' || isFeatured === true) : false,
      order: Number(order) || 0,
      metaTitle: metaTitle || '', metaDescription: metaDescription || '',
      intentions: parseJSON(intentions, []),
      properties: parseJSON(properties, []),
      howToUse:   parseJSON(howToUse,   []),
      faqs:       parseJSON(faqs,       []),
      tags:       parseJSON(tags,       []),
      gallery, images,
    });

    await stone.save();
    res.status(201).json({ success: true, message: 'Stone created', data: stone });
  } catch (err) {
    console.error('[createStone]', err);
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Slug already exists' });
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ── PUT /api/stones/:id ───────────────────────────────────────────────────────
exports.updateStone = async (req, res) => {
  try {
    const stone = await Stone.findById(req.params.id);
    if (!stone) return res.status(404).json({ success: false, message: 'Stone not found' });

    const {
      name, slug, subtitle, category, tagline, description,
      color, accentColor, weight, dimensions, origin, hardness,
      isActive, isFeatured, order, metaTitle, metaDescription,
      intentions, properties, howToUse, faqs, gallery: galleryRaw, tags,
    } = req.body;

    if (name        !== undefined) stone.name        = name;
    if (slug        !== undefined) stone.slug        = slug;
    if (subtitle    !== undefined) stone.subtitle    = subtitle;
    if (category    !== undefined) stone.category    = category;
    if (tagline     !== undefined) stone.tagline     = tagline;
    if (description !== undefined) stone.description = description;
    if (color       !== undefined) stone.color       = color;
    if (accentColor !== undefined) stone.accentColor = accentColor;
    if (weight      !== undefined) stone.weight      = weight;
    if (dimensions  !== undefined) stone.dimensions  = dimensions;
    if (origin      !== undefined) stone.origin      = origin;
    if (hardness    !== undefined) stone.hardness    = hardness;
    if (metaTitle       !== undefined) stone.metaTitle       = metaTitle;
    if (metaDescription !== undefined) stone.metaDescription = metaDescription;
    if (isActive   !== undefined) stone.isActive   = isActive   === 'true' || isActive   === true;
    if (isFeatured !== undefined) stone.isFeatured = isFeatured === 'true' || isFeatured === true;
    if (order      !== undefined) stone.order      = Number(order);

    if (intentions !== undefined) stone.intentions = parseJSON(intentions, stone.intentions);
    if (properties !== undefined) stone.properties = parseJSON(properties, stone.properties);
    if (howToUse   !== undefined) stone.howToUse   = parseJSON(howToUse,   stone.howToUse);
    if (faqs       !== undefined) stone.faqs       = parseJSON(faqs,       stone.faqs);
    if (tags       !== undefined) stone.tags       = parseJSON(tags,       stone.tags);

    // Gallery: update metadata first, then merge new image files
    if (galleryRaw !== undefined) stone.gallery = parseJSON(galleryRaw, stone.gallery);
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    stone.gallery = mergeGalleryImages(req, stone.gallery.toObject?.() ?? stone.gallery, baseUrl);

    // Append new hero images
    const heroFiles = req.files?.images || [];
    heroFiles.forEach(file => {
      stone.images.push({ url: buildImageUrl(req, file.filename), alt: stone.name, isPrimary: false, publicId: file.filename });
    });

    await stone.save();
    res.json({ success: true, message: 'Stone updated', data: stone });
  } catch (err) {
    console.error('[updateStone]', err);
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Slug already taken' });
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ── DELETE /api/stones/:id ────────────────────────────────────────────────────
exports.deleteStone = async (req, res) => {
  try {
    const stone = await Stone.findById(req.params.id);
    if (!stone) return res.status(404).json({ success: false, message: 'Stone not found' });
    stone.images.forEach(img => deleteLocalFile(img.publicId));
    stone.gallery.forEach(g  => { if (g.publicId) deleteLocalFile(g.publicId); });
    await Stone.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Stone deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ── DELETE /api/stones/:id/images/:imageId ────────────────────────────────────
exports.deleteStoneImage = async (req, res) => {
  try {
    const stone = await Stone.findById(req.params.id);
    if (!stone) return res.status(404).json({ success: false, message: 'Stone not found' });
    const idx = stone.images.findIndex(i => i._id.toString() === req.params.imageId);
    if (idx === -1) return res.status(404).json({ success: false, message: 'Image not found' });
    const [removed] = stone.images.splice(idx, 1);
    deleteLocalFile(removed.publicId);
    if (removed.isPrimary && stone.images.length > 0) stone.images[0].isPrimary = true;
    await stone.save();
    res.json({ success: true, message: 'Image deleted', data: stone });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ── PUT /api/stones/:id/images/:imageId/primary ───────────────────────────────
exports.setPrimaryImage = async (req, res) => {
  try {
    const stone = await Stone.findById(req.params.id);
    if (!stone) return res.status(404).json({ success: false, message: 'Stone not found' });
    stone.images.forEach(img => { img.isPrimary = img._id.toString() === req.params.imageId; });
    await stone.save();
    res.json({ success: true, message: 'Primary image updated', data: stone });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ── DELETE /api/stones/:id/gallery/:slideId/image ─────────────────────────────
exports.deleteGalleryImage = async (req, res) => {
  try {
    const stone = await Stone.findById(req.params.id);
    if (!stone) return res.status(404).json({ success: false, message: 'Stone not found' });
    const slide = stone.gallery.id(req.params.slideId);
    if (!slide) return res.status(404).json({ success: false, message: 'Slide not found' });
    if (slide.publicId) deleteLocalFile(slide.publicId);
    slide.imageUrl = '';
    slide.publicId = '';
    await stone.save();
    res.json({ success: true, message: 'Gallery image removed', data: stone });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ── PATCH /api/stones/:id/toggle ─────────────────────────────────────────────
exports.toggleStoneStatus = async (req, res) => {
  try {
    const stone = await Stone.findById(req.params.id);
    if (!stone) return res.status(404).json({ success: false, message: 'Stone not found' });
    stone.isActive = !stone.isActive;
    await stone.save();
    res.json({ success: true, message: `Stone ${stone.isActive ? 'activated' : 'deactivated'}`, data: stone });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};