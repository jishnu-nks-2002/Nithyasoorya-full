const express = require('express');
const router = express.Router();
const {
  getGalleryHero, getGalleryHeroAdmin, updateSettings,
  addSlide, updateSlide, updateSlidePoster, deleteSlide, reorderSlides,
} = require('../controllers/galleryHeroController');
const { protect } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.get('/', getGalleryHero);
router.get('/admin', protect, getGalleryHeroAdmin);
router.put('/settings', protect, updateSettings);
router.post('/slides', protect, upload.single('media'), addSlide);
router.put('/slides/reorder', protect, reorderSlides);
router.put('/slides/:slideId', protect, upload.single('media'), updateSlide);
router.put('/slides/:slideId/poster', protect, upload.single('poster'), updateSlidePoster);
router.delete('/slides/:slideId', protect, deleteSlide);

module.exports = router;
