require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('./models/Admin');
const GalleryHero = require('./models/GalleryHero');
const connectDB = require('./config/db');

const seed = async () => {
  await connectDB();

  try {
    // Create default admin
    const existingAdmin = await Admin.findOne({ email: process.env.ADMIN_EMAIL });
    if (!existingAdmin) {
      await Admin.create({
        name: 'Gallery Admin',
        email: process.env.ADMIN_EMAIL || 'admin@gallery.com',
        password: process.env.ADMIN_PASSWORD || 'Admin@123456',
        role: 'superadmin',
      });
      console.log('✅ Admin user created:', process.env.ADMIN_EMAIL);
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    // Create default GalleryHero config
    const existing = await GalleryHero.findOne({ name: 'Default' });
    if (!existing) {
      await GalleryHero.create({
        name: 'Default',
        verticalText: 'Museum Exhibition 2024',
        leftLabel: 'FEATURED EXHIBITION',
        ctaText: 'EXPLORE THE COLLECTION',
        ctaLink: '#collection',
        autoPlayInterval: 5000,
        slides: [],
      });
      console.log('✅ Default GalleryHero config created');
    } else {
      console.log('ℹ️  GalleryHero config already exists');
    }

    console.log('\n🎉 Seed complete!\n');
  } catch (err) {
    console.error('Seed error:', err);
  } finally {
    await mongoose.disconnect();
  }
};

seed();