// backend/controllers/galleryController.js
const GalleryItem = require('../models/GalleryItem');
const path  = require('path');
const fs    = require('fs');

// ── Helpers ────────────────────────────────────────────────────────────────
const IMAGE_RE = /\.(jpe?g|png|gif|webp|avif|svg)(\?.*)?$/i;
const VIDEO_RE = /\.(mp4|webm|ogg|mov)(\?.*)?$/i;

function detectType(filename) {
  if (VIDEO_RE.test(filename)) return 'video';
  return 'image';
}

/** Convert absolute disk path → URL path  /uploads/gallery/foo.jpg */
function toUrl(absPath) {
  if (!absPath) return '';
  const norm = absPath.replace(/\\/g, '/');
  const idx  = norm.indexOf('/uploads/');
  if (idx !== -1) return norm.slice(idx);
  const parts = norm.split('/');
  return '/' + parts.slice(-3).join('/');
}

/** Delete a file given its URL path */
function removeFile(urlPath) {
  if (!urlPath) return;
  try {
    const rel = urlPath.replace(/^\//, '');
    const abs = path.join(__dirname, '..', 'public', rel);
    if (fs.existsSync(abs)) fs.unlinkSync(abs);
  } catch (_) {}
}

// ── GET /api/gallery ───────────────────────────────────────────────────────
exports.getItems = async (req, res) => {
  try {
    const { isActive, type, limit = 200, page = 1 } = req.query;
    const filter = {};
    if (isActive !== undefined) filter.isActive = isActive === 'true';
    if (type)                   filter.type      = type;

    const skip  = (Number(page) - 1) * Number(limit);
    const total = await GalleryItem.countDocuments(filter);
    const data  = await GalleryItem.find(filter)
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({ success: true, total, count: data.length, data });
  } catch (err) {
    console.error('[gallery:getItems]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── GET /api/gallery/:id ───────────────────────────────────────────────────
exports.getItem = async (req, res) => {
  try {
    const item = await GalleryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── POST /api/gallery  (supports multiple files in one request) ───────────
exports.createItems = async (req, res) => {
  try {
    if (!req.files?.length) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const { alt = '', isActive = 'true', order = 0 } = req.body;

    const created = await Promise.all(
      req.files.map(async (file, i) => {
        const srcUrl    = toUrl(file.path);
        const mediaType = detectType(file.originalname || file.filename);

        // If this file is a video, also grab a matching poster if the client
        // sent one with the same base name (optional enhancement)
        const item = await GalleryItem.create({
          type:     mediaType,
          src:      srcUrl,
          poster:   '',
          alt:      alt || '',
          isActive: isActive === 'true' || isActive === true,
          order:    Number(order) + i,
        });
        return item;
      })
    );

    res.status(201).json({ success: true, count: created.length, data: created });
  } catch (err) {
    console.error('[gallery:createItems]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── PUT /api/gallery/:id  (edit metadata + optionally replace file) ────────
exports.updateItem = async (req, res) => {
  try {
    const item = await GalleryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });

    const body = { ...req.body };

    // Replace media file
    if (req.files?.media?.[0]) {
      removeFile(item.src);
      body.src  = toUrl(req.files.media[0].path);
      body.type = detectType(req.files.media[0].originalname);
    }

    // Replace poster
    if (req.files?.poster?.[0]) {
      removeFile(item.poster);
      body.poster = toUrl(req.files.poster[0].path);
    }

    if (typeof body.isActive === 'string') body.isActive = body.isActive === 'true';

    const updated = await GalleryItem.findByIdAndUpdate(req.params.id, body, {
      new: true, runValidators: true,
    });
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('[gallery:updateItem]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── DELETE /api/gallery/:id ────────────────────────────────────────────────
exports.deleteItem = async (req, res) => {
  try {
    const item = await GalleryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    removeFile(item.src);
    removeFile(item.poster);
    await item.deleteOne();
    res.json({ success: true, message: 'Deleted' });
  } catch (err) {
    console.error('[gallery:deleteItem]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── DELETE /api/gallery  (bulk delete) ────────────────────────────────────
exports.bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length)
      return res.status(400).json({ success: false, message: 'ids[] required' });

    const items = await GalleryItem.find({ _id: { $in: ids } });
    items.forEach(item => { removeFile(item.src); removeFile(item.poster); });
    await GalleryItem.deleteMany({ _id: { $in: ids } });

    res.json({ success: true, deleted: items.length });
  } catch (err) {
    console.error('[gallery:bulkDelete]', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── PATCH /api/gallery/:id/toggle ─────────────────────────────────────────
exports.toggleActive = async (req, res) => {
  try {
    const item = await GalleryItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Not found' });
    item.isActive = !item.isActive;
    await item.save();
    res.json({ success: true, data: item });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ── PATCH /api/gallery/reorder ─────────────────────────────────────────────
// Body: { items: [{ id, order }] }
exports.reorder = async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items))
      return res.status(400).json({ success: false, message: 'items[] required' });
    await Promise.all(
      items.map(({ id, order }) => GalleryItem.findByIdAndUpdate(id, { order }))
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};