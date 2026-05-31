// routes/about.js
const express     = require("express");
const multer      = require("multer");
const path        = require("path");
const fs          = require("fs");
const { protect } = require("../middleware/auth");
const ctrl        = require("../controllers/aboutController");

const router = express.Router();

const uploadDir = path.join(__dirname, "../public/uploads/about");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, uploadDir),
  filename:    (_, file, cb) => {
    const ext  = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/\s+/g, "-");
    cb(null, `${base}-${Date.now()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 200 * 1024 * 1024 }, // 200 MB (for video)
  fileFilter: (_, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif|mp4|webm|mov/;
    cb(null, allowed.test(path.extname(file.originalname).toLowerCase()));
  },
});

// Hero — now accepts an optional "video" field for video file upload
const heroUpload = upload.fields([
  { name: "video", maxCount: 1 },   // ← NEW: video file upload
]);

const artistUpload = upload.fields([
  { name: "portraitImg", maxCount: 1 },
  { name: "featured1",   maxCount: 1 },
  { name: "featured2",   maxCount: 1 },
  { name: "featured3",   maxCount: 1 },
]);

const aboutUpload = upload.fields([
  { name: "imageTop",    maxCount: 1 },
  { name: "imageBottom", maxCount: 1 },
]);

router.get("/",              ctrl.getAboutPage);
router.put("/hero",          protect, heroUpload,   ctrl.updateHero);        // changed from upload.none()
router.put("/about-section", protect, aboutUpload,  ctrl.updateAboutSection);
router.put("/artist",        protect, artistUpload, ctrl.updateArtist);

module.exports = router;