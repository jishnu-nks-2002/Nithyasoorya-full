const path = require('path');
const fs   = require('fs');
const CrystalPage = require('../models/CrystalPage');

// ── Helpers ───────────────────────────────────────────────────────────────────
const autoSlug = (t) =>
  t.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

// Stored as a RELATIVE path so it works behind nginx / https; clients prefix the API host.
const fileUrl = (filename) => `/uploads/crystal-pages/${filename}`;

const deleteLocalFile = (filename) => {
  if (!filename) return;
  const p = path.join(__dirname, '..', 'public', 'uploads', 'crystal-pages', filename);
  fs.unlink(p, (err) => { if (err && err.code !== 'ENOENT') console.error('File delete error:', err); });
};

const parseJSON = (val, fallback = []) => {
  if (val === undefined || val === null || val === '') return fallback;
  if (typeof val === 'object') return val;
  try { return JSON.parse(val); } catch { return fallback; }
};

const toBool = (v, d) => (v === undefined ? d : v === true || v === 'true');

// Keep only the fields we store, drop blank rows
function cleanSections(raw) {
  return parseJSON(raw, []).map((s) => ({
    type:    ['text', 'cards', 'list', 'quote', 'notice'].includes(s.type) ? s.type : 'text',
    eyebrow: s.eyebrow || '',
    heading: s.heading || '',
    body:    s.body    || '',
    lines:   (s.lines || []).map((l) => String(l).trim()).filter(Boolean),
    items:   (s.items || [])
      .map((it) => ({
        title:       it.title       || '',
        subtitle:    it.subtitle    || '',
        tagline:     it.tagline     || '',
        description: it.description || '',
        chipsLabel:  it.chipsLabel  || '',
        chips:       (it.chips || []).map((c) => String(c).trim()).filter(Boolean),
        details:     (it.details || []).filter((d) => d.label?.trim() || d.value?.trim())
                       .map((d) => ({ label: d.label.trim(), value: d.value.trim() })),
        note:        it.note  || '',
        icon:        it.icon  || '',
        color:       it.color || '',
        imageUrl:    it.imageUrl || '',
        publicId:    it.publicId || '',
      })),
  }));
}

// Drop completely empty rows — done AFTER images are attached so item indexes stay aligned
const pruneSections = (sections) =>
  sections.map((s) => ({
    ...s,
    items: s.items.filter((it) => it.title || it.subtitle || it.description || it.chips.length || it.details.length || it.imageUrl),
  }));

// Attach uploaded item images. Client sends itemImageKeys = ["<sectionIdx>.<itemIdx>", …]
// in the same order as the uploaded `itemImages` files.
function attachItemImages(req, sections) {
  const files = req.files?.itemImages || [];
  const keys  = parseJSON(req.body.itemImageKeys, []);
  files.forEach((file, i) => {
    const [si, ii] = String(keys[i] ?? '').split('.').map(Number);
    const item = sections[si]?.items?.[ii];
    if (!item) { deleteLocalFile(file.filename); return; }
    if (item.publicId) deleteLocalFile(item.publicId);
    item.imageUrl = fileUrl(file.filename);
    item.publicId = file.filename;
  });
  return sections;
}

const collectIds = (sections) =>
  new Set((sections || []).flatMap((s) => (s.items || []).map((i) => i.publicId).filter(Boolean)));

// ── GET /api/crystal-pages  (public: active pages only, no heavy content) ─────
exports.getPages = async (req, res) => {
  try {
    const { menu } = req.query;
    const filter = { isActive: true };
    if (menu === 'true') filter.showInMenu = true;
    const pages = await CrystalPage.find(filter)
      .select('-sections')
      .sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data: pages });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ── GET /api/crystal-pages/admin/all  (admin: everything) ─────────────────────
exports.getPagesAdmin = async (req, res) => {
  try {
    const pages = await CrystalPage.find().select('-sections').sort({ order: 1, createdAt: 1 });
    res.json({ success: true, data: pages });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ── GET /api/crystal-pages/:slug  (public) ────────────────────────────────────
exports.getPageBySlug = async (req, res) => {
  try {
    const page = await CrystalPage.findOne({ slug: req.params.slug, isActive: true });
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    res.json({ success: true, data: page });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ── GET /api/crystal-pages/id/:id  (admin) ────────────────────────────────────
exports.getPageById = async (req, res) => {
  try {
    const page = await CrystalPage.findById(req.params.id);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    res.json({ success: true, data: page });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ── POST /api/crystal-pages ───────────────────────────────────────────────────
exports.createPage = async (req, res) => {
  try {
    const b = req.body;
    if (!b.title) return res.status(400).json({ success: false, message: 'Title is required' });

    const sections = pruneSections(attachItemImages(req, cleanSections(b.sections)));
    const hero = req.files?.heroImage?.[0];

    const page = new CrystalPage({
      title: b.title,
      slug: b.slug || autoSlug(b.title),
      eyebrow: b.eyebrow || '',
      intro: b.intro || '',
      menuLabel: b.menuLabel || '',
      menuSubtitle: b.menuSubtitle || '',
      showInMenu: toBool(b.showInMenu, true),
      color: b.color || '#7B4BA0',
      isActive: toBool(b.isActive, true),
      order: Number(b.order) || 0,
      metaTitle: b.metaTitle || '',
      metaDescription: b.metaDescription || '',
      heroImageUrl: hero ? fileUrl(hero.filename) : '',
      heroPublicId: hero ? hero.filename : '',
      sections,
    });

    await page.save();
    res.status(201).json({ success: true, message: 'Page created', data: page });
  } catch (err) {
    console.error('[createPage]', err);
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Slug already exists' });
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ── PUT /api/crystal-pages/:id ────────────────────────────────────────────────
exports.updatePage = async (req, res) => {
  try {
    const page = await CrystalPage.findById(req.params.id);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });

    const b = req.body;
    ['title','slug','eyebrow','intro','menuLabel','menuSubtitle','color','metaTitle','metaDescription']
      .forEach((k) => { if (b[k] !== undefined) page[k] = b[k]; });
    if (b.isActive   !== undefined) page.isActive   = toBool(b.isActive);
    if (b.showInMenu !== undefined) page.showInMenu = toBool(b.showInMenu);
    if (b.order      !== undefined) page.order      = Number(b.order) || 0;

    // Sections (+ images). Remove files no longer referenced.
    if (b.sections !== undefined) {
      const before   = collectIds(page.sections);
      const sections = pruneSections(attachItemImages(req, cleanSections(b.sections)));
      const after    = collectIds(sections);
      before.forEach((id) => { if (!after.has(id)) deleteLocalFile(id); });
      page.sections = sections;
    }

    // Hero image: replace or remove
    const hero = req.files?.heroImage?.[0];
    if (hero) {
      deleteLocalFile(page.heroPublicId);
      page.heroImageUrl = fileUrl(hero.filename);
      page.heroPublicId = hero.filename;
    } else if (toBool(b.removeHero, false)) {
      deleteLocalFile(page.heroPublicId);
      page.heroImageUrl = '';
      page.heroPublicId = '';
    }

    await page.save();
    res.json({ success: true, message: 'Page updated', data: page });
  } catch (err) {
    console.error('[updatePage]', err);
    if (err.code === 11000) return res.status(400).json({ success: false, message: 'Slug already taken' });
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ── DELETE /api/crystal-pages/:id ─────────────────────────────────────────────
exports.deletePage = async (req, res) => {
  try {
    const page = await CrystalPage.findById(req.params.id);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    deleteLocalFile(page.heroPublicId);
    collectIds(page.sections).forEach(deleteLocalFile);
    await page.deleteOne();
    res.json({ success: true, message: 'Page deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};

// ── PATCH /api/crystal-pages/:id/toggle ───────────────────────────────────────
exports.togglePage = async (req, res) => {
  try {
    const page = await CrystalPage.findById(req.params.id);
    if (!page) return res.status(404).json({ success: false, message: 'Page not found' });
    page.isActive = !page.isActive;
    await page.save();
    res.json({ success: true, message: `Page ${page.isActive ? 'published' : 'set to draft'}`, data: page });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error', error: err.message });
  }
};
