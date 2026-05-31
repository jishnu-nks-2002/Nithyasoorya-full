const express  = require('express');
const path     = require('path');
const fs       = require('fs');
const multer   = require('multer');
const { protect } = require('../middleware/auth');
const ctrl     = require('../controllers/reviewController');

const router = express.Router();

// ── Multer setup ──────────────────────────────────────────────────────────────
const uploadDir = path.join(__dirname, '../public/uploads/reviews');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename:    (_, file, cb) => {
    const ext  = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, '-');
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: (_, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  },
});

// ── Routes ────────────────────────────────────────────────────────────────────
router.get('/',          ctrl.getReviews);
router.get('/admin',     protect, ctrl.getReviewsAdmin);
router.post('/',         protect, upload.single('productImage'), ctrl.createReview);
router.put('/reorder',   protect, ctrl.reorderReviews);
router.put('/:id',       protect, upload.single('productImage'), ctrl.updateReview);
router.delete('/:id',    protect, ctrl.deleteReview);

module.exports = router;