const express = require('express');
const router  = express.Router();

const {
  // ── Product handlers ──────────────────────────────────────────────
  getProducts,
  getProductsAdmin,
  getProductBySlug,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  deleteProductImage,
  deleteProductVideo,
  setPrimaryImage,
  reorderProducts,
  getMeta,

  // ── Category handlers ─────────────────────────────────────────────
  getCategories,
  getCategoriesAdmin,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,

  // ── Enquiry handlers ──────────────────────────────────────────────
  createEnquiry,
  getEnquiries,
  updateEnquiryStatus,
  deleteEnquiry,
} = require('../controllers/Controller');

const { protect } = require('../middleware/auth');
const { upload }  = require('../middleware/upload');

// Product form sends up to 10 images + up to 3 videos
const productUpload = upload.fields([
  { name: 'images', maxCount: 10 },
  { name: 'videos', maxCount: 3  },
]);

// ════════════════════════════════════════════════════════════════════════════
//  PRODUCT ROUTES  →  /api/products
// ════════════════════════════════════════════════════════════════════════════

// Public
router.get('/products',            getProducts);
router.get('/products/meta',       getMeta);
router.get('/products/slug/:slug', getProductBySlug);

// Admin
router.get('/products/admin',                       protect, getProductsAdmin);
router.get('/products/id/:id',                      protect, getProductById);
router.post('/products',                            protect, productUpload, createProduct);
router.put('/products/reorder',                     protect, reorderProducts);
router.put('/products/:id',                         protect, productUpload, updateProduct);
router.delete('/products/:id',                      protect, deleteProduct);
router.delete('/products/:id/images/:imageId',      protect, deleteProductImage);
router.delete('/products/:id/videos/:videoId',      protect, deleteProductVideo);
router.put('/products/:id/images/:imageId/primary', protect, setPrimaryImage);

// ════════════════════════════════════════════════════════════════════════════
//  CATEGORY ROUTES  →  /api/categories
// ════════════════════════════════════════════════════════════════════════════

// Public
router.get('/categories', getCategories);

// Admin
router.get('/categories/all',     protect, getCategoriesAdmin);
router.put('/categories/reorder', protect, reorderCategories);
router.get('/categories/:id',     protect, getCategoryById);
router.post('/categories',        protect, upload.single('image'), createCategory);
router.put('/categories/:id',     protect, upload.single('image'), updateCategory);
router.delete('/categories/:id',  protect, deleteCategory);

// ════════════════════════════════════════════════════════════════════════════
//  ENQUIRY ROUTES  →  /api/enquiries
// ════════════════════════════════════════════════════════════════════════════

// Public — customer submits enquiry form
router.post('/enquiries', createEnquiry);

// Admin — view, update status, delete
router.get('/enquiries',            protect, getEnquiries);
router.put('/enquiries/:id/status', protect, updateEnquiryStatus);
router.delete('/enquiries/:id',     protect, deleteEnquiry);

module.exports = router;