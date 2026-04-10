const GalleryHero = require('../models/GalleryHero');
const cloudinary = require('../config/cloudinary');
const { uploadToCloudinary } = require('../middleware/upload');

// GET /api/gallery-hero — public endpoint for frontend
const getGalleryHero = async (req, res) => {
  try {
    let config = await GalleryHero.findOne({ name: 'Default', isActive: true });

    if (!config) {
      config = await GalleryHero.create({ name: 'Default' });
    }

    // Return only active slides sorted by order
    const data = config.toObject();
    data.slides = data.slides
      .filter(s => s.isActive)
      .sort((a, b) => a.order - b.order);

    res.json({ success: true, data });
  } catch (error) {
    console.error('getGalleryHero error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/gallery-hero/admin — admin (all slides)
const getGalleryHeroAdmin = async (req, res) => {
  try {
    let config = await GalleryHero.findOne({ name: 'Default' });
    if (!config) config = await GalleryHero.create({ name: 'Default' });

    const data = config.toObject();
    data.slides = data.slides.sort((a, b) => a.order - b.order);

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/gallery-hero/settings — update text settings
const updateSettings = async (req, res) => {
  try {
    const { verticalText, leftLabel, ctaText, ctaLink, autoPlayInterval } = req.body;

    const config = await GalleryHero.findOneAndUpdate(
      { name: 'Default' },
      { $set: { verticalText, leftLabel, ctaText, ctaLink, autoPlayInterval } },
      { new: true, upsert: true }
    );

    res.json({ success: true, data: config, message: 'Settings updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/gallery-hero/slides — add a new slide with media upload
const addSlide = async (req, res) => {
  try {
    const { title, description, alt, type } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Media file is required' });
    }

    const resourceType = type === 'video' ? 'video' : 'image';
    const folder = type === 'video' ? 'gallery-hero/videos' : 'gallery-hero/images';

    const uploadResult = await uploadToCloudinary(req.file.buffer, {
      folder,
      resource_type: resourceType,
    });

    const config = await GalleryHero.findOne({ name: 'Default' }) || await GalleryHero.create({ name: 'Default' });

    const newSlide = {
      type: type || 'image',
      src: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      alt: alt || '',
      title: title || '',
      description: description || '',
      order: config.slides.length,
      isActive: true,
    };

    // Handle poster for video (if separate poster uploaded, it would be in req.files)
    config.slides.push(newSlide);
    await config.save();

    res.status(201).json({
      success: true,
      slide: config.slides[config.slides.length - 1],
      message: 'Slide added successfully',
    });
  } catch (error) {
    console.error('addSlide error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// PUT /api/gallery-hero/slides/:slideId — update slide text data
const updateSlide = async (req, res) => {
  try {
    const { slideId } = req.params;
    const { title, description, alt, order, isActive } = req.body;

    const config = await GalleryHero.findOne({ name: 'Default' });
    if (!config) return res.status(404).json({ success: false, message: 'Config not found' });

    const slide = config.slides.id(slideId);
    if (!slide) return res.status(404).json({ success: false, message: 'Slide not found' });

    if (title !== undefined) slide.title = title;
    if (description !== undefined) slide.description = description;
    if (alt !== undefined) slide.alt = alt;
    if (order !== undefined) slide.order = order;
    if (isActive !== undefined) slide.isActive = isActive;

    // If new media file uploaded, replace it
    if (req.file) {
      // Delete old from Cloudinary
      if (slide.publicId) {
        await cloudinary.uploader.destroy(slide.publicId, {
          resource_type: slide.type === 'video' ? 'video' : 'image',
        });
      }

      const resourceType = slide.type === 'video' ? 'video' : 'image';
      const folder = slide.type === 'video' ? 'gallery-hero/videos' : 'gallery-hero/images';
      const uploadResult = await uploadToCloudinary(req.file.buffer, { folder, resource_type: resourceType });

      slide.src = uploadResult.secure_url;
      slide.publicId = uploadResult.public_id;
    }

    await config.save();
    res.json({ success: true, slide, message: 'Slide updated successfully' });
  } catch (error) {
    console.error('updateSlide error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/gallery-hero/slides/:slideId/poster — upload video poster separately
const updateSlidePoster = async (req, res) => {
  try {
    const { slideId } = req.params;

    if (!req.file) return res.status(400).json({ success: false, message: 'Poster image required' });

    const config = await GalleryHero.findOne({ name: 'Default' });
    if (!config) return res.status(404).json({ success: false, message: 'Config not found' });

    const slide = config.slides.id(slideId);
    if (!slide) return res.status(404).json({ success: false, message: 'Slide not found' });

    // Delete old poster
    if (slide.posterPublicId) {
      await cloudinary.uploader.destroy(slide.posterPublicId, { resource_type: 'image' });
    }

    const uploadResult = await uploadToCloudinary(req.file.buffer, {
      folder: 'gallery-hero/posters',
      resource_type: 'image',
    });

    slide.poster = uploadResult.secure_url;
    slide.posterPublicId = uploadResult.public_id;

    await config.save();
    res.json({ success: true, slide, message: 'Poster updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// DELETE /api/gallery-hero/slides/:slideId
const deleteSlide = async (req, res) => {
  try {
    const { slideId } = req.params;
    const config = await GalleryHero.findOne({ name: 'Default' });
    if (!config) return res.status(404).json({ success: false, message: 'Config not found' });

    const slide = config.slides.id(slideId);
    if (!slide) return res.status(404).json({ success: false, message: 'Slide not found' });

    // Delete from Cloudinary
    if (slide.publicId) {
      await cloudinary.uploader.destroy(slide.publicId, {
        resource_type: slide.type === 'video' ? 'video' : 'image',
      }).catch(console.error);
    }
    if (slide.posterPublicId) {
      await cloudinary.uploader.destroy(slide.posterPublicId, { resource_type: 'image' }).catch(console.error);
    }

    config.slides.pull(slideId);
    await config.save();

    res.json({ success: true, message: 'Slide deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/gallery-hero/slides/reorder — reorder slides
const reorderSlides = async (req, res) => {
  try {
    const { orderedIds } = req.body; // array of slide _id strings in new order

    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ success: false, message: 'orderedIds array required' });
    }

    const config = await GalleryHero.findOne({ name: 'Default' });
    if (!config) return res.status(404).json({ success: false, message: 'Config not found' });

    orderedIds.forEach((id, index) => {
      const slide = config.slides.id(id);
      if (slide) slide.order = index;
    });

    await config.save();
    res.json({ success: true, message: 'Slides reordered successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getGalleryHero,
  getGalleryHeroAdmin,
  updateSettings,
  addSlide,
  updateSlide,
  updateSlidePoster,
  deleteSlide,
  reorderSlides,
};