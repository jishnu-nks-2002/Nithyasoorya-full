const WisdomPage = require('../models/WisdomPage');
const cloudinary = require('../config/cloudinary');
const { uploadToCloudinary } = require('../middleware/upload');

const autoSlug = (s) => s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');
const toBool   = (v) => v === true || v === 'true';

const parseJSON = (val, fallback = []) => {
  if (val === undefined || val === null || val === '') return fallback;
  if (typeof val !== 'string') return val;
  try { return JSON.parse(val); } catch { return fallback; }
};

const toList = (v) =>
  (Array.isArray(v) ? v : String(v || '').split(/[,•]/))
    .map((s) => String(s).trim())
    .filter(Boolean);

const cleanItems = (raw) =>
  parseJSON(raw, [])
    .map((i) => ({
      title:     String(i.title     || '').trim(),
      subtitle:  String(i.subtitle  || '').trim(),
      keywords:  toList(i.keywords),
      body:      String(i.body      || '').trim(),
      crystals:  toList(i.crystals),
      intention: String(i.intention || '').trim(),
      accent:    String(i.accent    || '').trim(),
    }))
    .filter((i) => i.title);

const TEXT_FIELDS = [
  'menuLabel', 'eyebrow', 'title', 'tagline', 'intro', 'layout',
  'footnoteTitle', 'footnote', 'closingText', 'metaTitle', 'metaDescription',
];

const applyFields = (page, body) => {
  TEXT_FIELDS.forEach((f) => { if (body[f] !== undefined) page[f] = body[f]; });
  if (body.order    !== undefined) page.order    = Number(body.order) || 0;
  if (body.isActive !== undefined) page.isActive = toBool(body.isActive);
  if (body.items    !== undefined) page.items    = cleanItems(body.items);
};

async function applyHero(page, req) {
  if (req.file && !req.file.mimetype.startsWith('image/')) throw new Error('Hero must be an image');
  const oldId = page.heroImage?.publicId;
  if ((req.body.removeHeroImage === 'true' || req.file) && oldId) {
    await cloudinary.uploader.destroy(oldId).catch(console.error);
    page.heroImage = { url: '', publicId: '', alt: '' };
  }
  if (req.file) {
    const r = await uploadToCloudinary(req.file.buffer, { folder: 'wisdom', resource_type: 'image' });
    page.heroImage = { url: r.secure_url, publicId: r.public_id, alt: page.title };
  }
}

// GET /api/wisdom  (public: list of active pages, for menus and the hub)
exports.listPublic = async (req, res) => {
  try {
    const pages = await WisdomPage.find({ isActive: true })
      .select('slug layout menuLabel eyebrow title tagline heroImage order')
      .sort({ order: 1 }).lean();
    res.json({ success: true, data: pages });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

// GET /api/wisdom/:slug  (public)
exports.getBySlug = async (req, res) => {
  try {
    const page = await WisdomPage.findOne({ slug: req.params.slug, isActive: true }).lean();
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    res.json({ success: true, data: page });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

// GET /api/wisdom/admin/all  (admin)
exports.listAdmin = async (req, res) => {
  try {
    const pages = await WisdomPage.find().sort({ order: 1 }).lean();
    res.json({ success: true, data: pages });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

// GET /api/wisdom/admin/:id  (admin)
exports.getById = async (req, res) => {
  try {
    const page = await WisdomPage.findById(req.params.id).lean();
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    res.json({ success: true, data: page });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};

// POST /api/wisdom  (admin)
exports.create = async (req, res) => {
  try {
    if (!req.body.title?.trim()) return res.status(400).json({ success: false, message: 'Title is required' });
    const page = new WisdomPage({ slug: (req.body.slug || autoSlug(req.body.title)).trim(), title: req.body.title.trim() });
    applyFields(page, req.body);
    await applyHero(page, req);
    await page.save();
    res.status(201).json({ success: true, data: page, message: 'Page created' });
  } catch (err) {
    console.error('wisdom create:', err);
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Slug already exists' });
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

// PUT /api/wisdom/:id  (admin). The slug is deliberately not editable, because menu links depend on it.
exports.update = async (req, res) => {
  try {
    const page = await WisdomPage.findById(req.params.id);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    applyFields(page, req.body);
    await applyHero(page, req);
    await page.save();
    res.json({ success: true, data: page, message: 'Page updated' });
  } catch (err) {
    console.error('wisdom update:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

// DELETE /api/wisdom/:id  (admin)
exports.remove = async (req, res) => {
  try {
    const page = await WisdomPage.findById(req.params.id);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    if (page.heroImage?.publicId) await cloudinary.uploader.destroy(page.heroImage.publicId).catch(console.error);
    await page.deleteOne();
    res.json({ success: true, message: 'Page deleted' });
  } catch (err) { res.status(500).json({ success: false, message: 'Server error' }); }
};
