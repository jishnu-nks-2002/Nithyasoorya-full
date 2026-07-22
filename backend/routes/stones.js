const express    = require('express');
const multer     = require('multer');
const path       = require('path');
const fs         = require('fs');
const router     = express.Router();
const controller = require('../controllers/stoneController');

// ── Upload directory ──────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '..', 'public', 'uploads', 'stones');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

// ── Multer storage ────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename:    (_req, file, cb) => {
    const ext  = path.extname(file.originalname).toLowerCase();
    const base = path.basename(file.originalname, ext)
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase()
      .slice(0, 40);
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (/image\/(jpeg|jpg|png|webp|gif|avif)/.test(file.mimetype)) cb(null, true);
  else cb(new Error('Only image files are allowed'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ── Accept two distinct file fields:
//    "images"        → hero / listing images   (max 10)
//    "galleryImages" → one image per slide, keyed by slide index (max 20)
const uploadFields = upload.fields([
  { name: 'images',        maxCount: 10 },
  { name: 'galleryImages', maxCount: 20 },
]);

// ── Routes ────────────────────────────────────────────────────────────────────
// Public
router.get('/',        controller.getAllStones);
router.get('/id/:id',  controller.getStoneById);
router.get('/:slug',   controller.getStoneBySlug);

// Admin CRUD
router.post  ('/',    uploadFields, controller.createStone);
router.put   ('/:id', uploadFields, controller.updateStone);
router.delete('/:id',              controller.deleteStone);

// Hero image management
router.delete('/:id/images/:imageId',          controller.deleteStoneImage);
router.put   ('/:id/images/:imageId/primary',  controller.setPrimaryImage);

// Gallery slide image management
router.delete('/:id/gallery/:slideId/image',   controller.deleteGalleryImage);

// Toggle active
router.patch('/:id/toggle', controller.toggleStoneStatus);

module.exports = router;