const GalleryHero = require('../models/GalleryHero');
const cloudinary = require('../config/cloudinary');
const { uploadToCloudinary } = require('../middleware/upload');

const getGalleryHero = async (req, res) => {
  try {
    let config = await GalleryHero.findOne({ name: 'Default', isActive: true });
    if (!config) config = await GalleryHero.create({ name: 'Default' });
    const data = config.toObject();
    data.slides = data.slides.filter(s => s.isActive).sort((a, b) => a.order - b.order);
    res.json({ success: true, data });
  } catch (error) {
    console.error('getGalleryHero error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

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

const addSlide = async (req, res) => {
  try {
    const { title, description, alt, type } = req.body;
    if (!req.file) return res.status(400).json({ success: false, message: 'Media file is required' });

    const resourceType = type === 'video' ? 'video' : 'image';
    const folder = type === 'video' ? 'gallery-hero/videos' : 'gallery-hero/images';
    const uploadResult = await uploadToCloudinary(req.file.buffer, { folder, resource_type: resourceType });

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
    config.slides.push(newSlide);
    await config.save();
    res.status(201).json({ success: true, slide: config.slides[config.slides.length - 1], message: 'Slide added successfully' });
  } catch (error) {
    console.error('addSlide error:', error);
    res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

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
    if (isActive !== undefined) slide.isActive = isActive === 'true' || isActive === true;

    if (req.file) {
      if (slide.publicId) {
        await cloudinary.uploader.destroy(slide.publicId, { resource_type: slide.type === 'video' ? 'video' : 'image' });
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

const updateSlidePoster = async (req, res) => {
  try {
    const { slideId } = req.params;
    if (!req.file) return res.status(400).json({ success: false, message: 'Poster image required' });
    const config = await GalleryHero.findOne({ name: 'Default' });
    if (!config) return res.status(404).json({ success: false, message: 'Config not found' });
    const slide = config.slides.id(slideId);
    if (!slide) return res.status(404).json({ success: false, message: 'Slide not found' });
    if (slide.posterPublicId) {
      await cloudinary.uploader.destroy(slide.posterPublicId, { resource_type: 'image' });
    }
    const uploadResult = await uploadToCloudinary(req.file.buffer, { folder: 'gallery-hero/posters', resource_type: 'image' });
    slide.poster = uploadResult.secure_url;
    slide.posterPublicId = uploadResult.public_id;
    await config.save();
    res.json({ success: true, slide, message: 'Poster updated' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

const deleteSlide = async (req, res) => {
  try {
    const { slideId } = req.params;
    const config = await GalleryHero.findOne({ name: 'Default' });
    if (!config) return res.status(404).json({ success: false, message: 'Config not found' });
    const slide = config.slides.id(slideId);
    if (!slide) return res.status(404).json({ success: false, message: 'Slide not found' });
    if (slide.publicId) {
      await cloudinary.uploader.destroy(slide.publicId, { resource_type: slide.type === 'video' ? 'video' : 'image' }).catch(console.error);
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

const reorderSlides = async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) return res.status(400).json({ success: false, message: 'orderedIds array required' });
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

module.exports = { getGalleryHero, getGalleryHeroAdmin, updateSettings, addSlide, updateSlide, updateSlidePoster, deleteSlide, reorderSlides };
