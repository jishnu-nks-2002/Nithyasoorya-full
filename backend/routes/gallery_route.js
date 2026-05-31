// backend/routes/gallery.js
const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const { protect } = require('../middleware/auth');

const {
  getItems,
  getItem,
  createItems,
  updateItem,
  deleteItem,
  bulkDelete,
  toggleActive,
  reorder,
} = require('../controllers/galleryController');

// ── Upload directory ───────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'gallery');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ── Multer storage ─────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, '-')
      .slice(0, 40);
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  const allowed = /jpe?g|png|gif|webp|avif|mp4|webm|ogg|mov/i;
  const ext  = path.extname(file.originalname).slice(1).toLowerCase();
  const mime = file.mimetype.split('/')[1]?.toLowerCase() || '';
  if (allowed.test(ext) || allowed.test(mime)) {
    cb(null, true);
  } else {
    cb(new Error(`Unsupported file type: ${file.originalname}`));
  }
};

// For batch upload: up to 30 files at once, 100 MB each video
const uploadBatch = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
}).array('files', 30);

// For single-item edit: one media + one poster
const uploadEdit = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 },
}).fields([
  { name: 'media',  maxCount: 1 },
  { name: 'poster', maxCount: 1 },
]);

// ── Routes ─────────────────────────────────────────────────────────────────

// Public
router.get('/',    getItems);
router.get('/:id', getItem);

// Protected
router.post(  '/',              protect, uploadBatch, createItems);
router.put(   '/:id',          protect, uploadEdit,  updateItem);
router.delete('/bulk',          protect, bulkDelete);
router.delete('/:id',          protect, deleteItem);
router.patch( '/:id/toggle',   protect, toggleActive);
router.patch( '/reorder',      protect, reorder);

module.exports = router;