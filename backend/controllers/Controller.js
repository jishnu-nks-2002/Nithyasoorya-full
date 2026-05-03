const { Product, Category } = require('../models/Models');
const cloudinary = require('../config/cloudinary');
const { uploadToCloudinary } = require('../middleware/upload');

// ── Helpers ───────────────────────────────────────────────────────────────────
const parseJSON = (val, fallback = []) => {
  if (!val) return fallback;
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return fallback; }
};

const buildProductFilter = (query) => {
  const filter = {};
  if (query.category)     filter.category     = query.category;
  if (query.series)       filter.series       = query.series;
  if (query.availability) filter.availability = query.availability;
  if (query.isNew)        filter.isNew        = query.isNew === 'true';
  if (query.isFeatured)   filter.isFeatured   = query.isFeatured === 'true';
  if (query.search) {
    filter.$or = [
      { name:     { $regex: query.search, $options: 'i' } },
      { material: { $regex: query.search, $options: 'i' } },
      { series:   { $regex: query.search, $options: 'i' } },
    ];
  }
  return filter;
};

// ════════════════════════════════════════════════════════════════════════════
//  PRODUCT CONTROLLERS
// ════════════════════════════════════════════════════════════════════════════

// GET /api/products  (public)
exports.getProducts = async (req, res) => {
  try {
    const filter   = { isActive: true, ...buildProductFilter(req.query) };
    const sort     = req.query.sort || 'order';
    const products = await Product.find(filter).sort(sort).lean();
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    console.error('getProducts:', err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/products/admin  (admin — all)
exports.getProductsAdmin = async (req, res) => {
  try {
    const filter   = buildProductFilter(req.query);
    const sort     = req.query.sort || 'category order';
    const products = await Product.find(filter).sort(sort).lean();
    res.json({ success: true, count: products.length, data: products });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/products/slug/:slug  (public, single)
exports.getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true }).lean();
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/products/id/:id  (admin)
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, data: product });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/products  (admin)
exports.createProduct = async (req, res) => {
  try {
    const {
      name, slug, category, series, material, description,
      price, priceDisplay, availability, edition, isNew, isFeatured,
      dimensions, weight, stoneTypes, beadSize, wristSize, tags,
      careInstructions, shippingInfo, order,
    } = req.body;

    const images = [];
    if (req.files && req.files.length > 0) {
      for (let i = 0; i < req.files.length; i++) {
        const result = await uploadToCloudinary(req.files[i].buffer, {
          folder:        `products/${category || 'products'}`,
          resource_type: 'image',
        });
        images.push({
          url:       result.secure_url,
          publicId:  result.public_id,
          alt:       name || '',
          isPrimary: i === 0,
        });
      }
    }

    const product = await Product.create({
      name, slug, category, series, material, description,
      price:        Number(price) || 0,
      priceDisplay: priceDisplay || `$${price}`,
      availability: availability || 'Available',
      edition,
      isNew:        isNew === 'true' || isNew === true,
      isFeatured:   isFeatured === 'true' || isFeatured === true,
      dimensions, weight,
      stoneTypes:   parseJSON(stoneTypes),
      beadSize, wristSize,
      tags:         parseJSON(tags),
      careInstructions, shippingInfo,
      order:        Number(order) || 0,
      images,
    });

    res.status(201).json({ success: true, data: product, message: 'Product created' });
  } catch (err) {
    console.error('createProduct:', err);
    if (err.code === 11000)
      return res.status(400).json({ success: false, message: 'Slug already exists' });
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

// PUT /api/products/:id  (admin)
exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const fields = [
      'name','slug','category','series','material','description',
      'priceDisplay','availability','edition','dimensions','weight',
      'beadSize','wristSize','careInstructions','shippingInfo',
    ];
    fields.forEach((f) => { if (req.body[f] !== undefined) product[f] = req.body[f]; });

    if (req.body.price      !== undefined) product.price      = Number(req.body.price);
    if (req.body.order      !== undefined) product.order      = Number(req.body.order);
    if (req.body.isNew      !== undefined) product.isNew      = req.body.isNew === 'true' || req.body.isNew === true;
    if (req.body.isFeatured !== undefined) product.isFeatured = req.body.isFeatured === 'true' || req.body.isFeatured === true;
    if (req.body.isActive   !== undefined) product.isActive   = req.body.isActive === 'true' || req.body.isActive === true;
    if (req.body.stoneTypes !== undefined) product.stoneTypes = parseJSON(req.body.stoneTypes);
    if (req.body.tags       !== undefined) product.tags       = parseJSON(req.body.tags);

    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const result = await uploadToCloudinary(file.buffer, {
          folder:        `products/${product.category}`,
          resource_type: 'image',
        });
        product.images.push({
          url:       result.secure_url,
          publicId:  result.public_id,
          alt:       product.name,
          isPrimary: product.images.length === 0,
        });
      }
    }

    await product.save();
    res.json({ success: true, data: product, message: 'Product updated' });
  } catch (err) {
    console.error('updateProduct:', err);
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

// DELETE /api/products/:id/images/:imageId  (admin)
exports.deleteProductImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    const img = product.images.id(req.params.imageId);
    if (!img) return res.status(404).json({ success: false, message: 'Image not found' });

    if (img.publicId) await cloudinary.uploader.destroy(img.publicId).catch(console.error);
    product.images.pull(req.params.imageId);

    if (!product.images.some((i) => i.isPrimary) && product.images.length > 0)
      product.images[0].isPrimary = true;

    await product.save();
    res.json({ success: true, data: product, message: 'Image deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/products/:id/images/:imageId/primary  (admin)
exports.setPrimaryImage = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    product.images.forEach((img) => {
      img.isPrimary = img._id.toString() === req.params.imageId;
    });
    await product.save();
    res.json({ success: true, data: product, message: 'Primary image updated' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/products/:id  (admin)
exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });

    for (const img of product.images) {
      if (img.publicId) await cloudinary.uploader.destroy(img.publicId).catch(console.error);
    }
    await product.deleteOne();
    res.json({ success: true, message: 'Product deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/products/reorder  (admin)
exports.reorderProducts = async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds))
      return res.status(400).json({ success: false, message: 'orderedIds required' });

    await Promise.all(
      orderedIds.map((id, index) => Product.findByIdAndUpdate(id, { order: index }))
    );
    res.json({ success: true, message: 'Reordered' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/products/meta  (public)
exports.getMeta = async (req, res) => {
  try {
    const categoryFilter = req.query.category;
    const match = { isActive: true, ...(categoryFilter ? { category: categoryFilter } : {}) };

    const [series, materials, stoneTypes, categories] = await Promise.all([
      Product.distinct('series',     match),
      Product.distinct('material',   match),
      Product.distinct('stoneTypes', match),
      Category.find({ isActive: true }).sort('order name').lean(),
    ]);

    res.json({
      success: true,
      data: {
        series:     series.filter(Boolean),
        materials:  materials.filter(Boolean),
        stoneTypes: stoneTypes.filter(Boolean),
        categories,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ════════════════════════════════════════════════════════════════════════════
//  CATEGORY CONTROLLERS
// ════════════════════════════════════════════════════════════════════════════

// GET /api/categories  (public)
exports.getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('order name').lean();
    res.json({ success: true, count: categories.length, data: categories });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/categories/all  (admin — includes inactive)
exports.getCategoriesAdmin = async (req, res) => {
  try {
    const categories = await Category.find().sort('order name').lean();

    const withCounts = await Promise.all(
      categories.map(async (cat) => ({
        ...cat,
        productCount: await Product.countDocuments({ category: cat.name, isActive: true }),
      }))
    );

    res.json({ success: true, count: withCounts.length, data: withCounts });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/categories/:id  (admin)
exports.getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id).lean();
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, data: category });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/categories  (admin)
exports.createCategory = async (req, res) => {
  try {
    const { name, slug, brand, brandColor, subtitle, description, order } = req.body;

    if (!name) return res.status(400).json({ success: false, message: 'Name is required' });

    const category = await Category.create({
      name,
      slug:        slug        || '',
      brand:       brand       || '',
      brandColor:  brandColor  || '#9b6fe0',
      subtitle:    subtitle    || '',
      description: description || '',
      order:       Number(order) || 0,
    });

    res.status(201).json({ success: true, data: category, message: 'Category created' });
  } catch (err) {
    console.error('createCategory:', err);
    if (err.code === 11000)
      return res.status(400).json({ success: false, message: 'Category name or slug already exists' });
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

// PUT /api/categories/:id  (admin)
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const oldName = category.name;

    const fields = ['name', 'slug', 'brand', 'brandColor', 'subtitle', 'description'];
    fields.forEach((f) => { if (req.body[f] !== undefined) category[f] = req.body[f]; });
    if (req.body.order    !== undefined) category.order    = Number(req.body.order);
    if (req.body.isActive !== undefined)
      category.isActive = req.body.isActive === 'true' || req.body.isActive === true;

    await category.save();

    // Cascade-rename on all products if name changed
    if (req.body.name && req.body.name !== oldName) {
      await Product.updateMany({ category: oldName }, { $set: { category: req.body.name } });
    }

    res.json({ success: true, data: category, message: 'Category updated' });
  } catch (err) {
    console.error('updateCategory:', err);
    if (err.code === 11000)
      return res.status(400).json({ success: false, message: 'Category name or slug already exists' });
    res.status(500).json({ success: false, message: err.message || 'Server error' });
  }
};

// DELETE /api/categories/:id  (admin)
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });

    const productCount = await Product.countDocuments({ category: category.name });
    if (productCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete — ${productCount} product(s) still use this category. Reassign them first.`,
      });
    }

    await category.deleteOne();
    res.json({ success: true, message: 'Category deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/categories/reorder  (admin)
exports.reorderCategories = async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds))
      return res.status(400).json({ success: false, message: 'orderedIds array required' });

    await Promise.all(
      orderedIds.map((id, index) => Category.findByIdAndUpdate(id, { order: index }))
    );
    res.json({ success: true, message: 'Categories reordered' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};