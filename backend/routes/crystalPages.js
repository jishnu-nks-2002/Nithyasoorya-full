const express = require('express');
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const router  = express.Router();
const c       = require('../controllers/crystalPageController');
const { protect } = require('../middleware/auth');

// ── Upload directory ──────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'crystal-pages');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext).replace(/[^a-z0-9]/gi, '-').toLowerCase().slice(0, 40);
    cb(null, `${base}-${Date.now()}-${Math.round(Math.random() * 1e4)}${ext}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (_req, file, cb) =>
    /image\/(jpeg|jpg|png|webp|gif|avif)/.test(file.mimetype)
      ? cb(null, true)
      : cb(new Error('Only image files are allowed'), false),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// "heroImage"  → page hero background (1)
// "itemImages" → one image per card/row, keyed by itemImageKeys
const uploadFields = upload.fields([
  { name: 'heroImage',  maxCount: 1  },
  { name: 'itemImages', maxCount: 60 },
]);

// ── Public ────────────────────────────────────────────────────────────────────
router.get('/', c.getPages);

// ── Admin (declared before /:slug) ────────────────────────────────────────────
router.get   ('/admin/all',   protect, c.getPagesAdmin);
router.get   ('/id/:id',      protect, c.getPageById);
router.post  ('/',            protect, uploadFields, c.createPage);
router.put   ('/:id',         protect, uploadFields, c.updatePage);
router.patch ('/:id/toggle',  protect, c.togglePage);
router.delete('/:id',         protect, c.deletePage);

// ── Public by slug (last) ─────────────────────────────────────────────────────
router.get('/:slug', c.getPageBySlug);

module.exports = router;
