const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/wisdomController');
const { protect } = require('../middleware/auth');
const { upload }  = require('../middleware/upload');

// Admin (must be declared before /:slug)
router.get('/admin/all',  protect, ctrl.listAdmin);
router.get('/admin/:id',  protect, ctrl.getById);
router.post('/',          protect, upload.single('heroImage'), ctrl.create);
router.put('/:id',        protect, upload.single('heroImage'), ctrl.update);
router.delete('/:id',     protect, ctrl.remove);

// Public
router.get('/',      ctrl.listPublic);
router.get('/:slug', ctrl.getBySlug);

module.exports = router;
