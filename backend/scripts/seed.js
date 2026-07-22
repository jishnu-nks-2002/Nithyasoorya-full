require('dotenv').config();
const mongoose = require('mongoose');
const Admin = require('../models/Admin');
const GalleryHero = require('../models/GalleryHero');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const existing = await Admin.findOne({ email: process.env.SEED_ADMIN_EMAIL });
    if (!existing) {
      await Admin.create({
        name: process.env.SEED_ADMIN_NAME || 'Admin',
        email: process.env.SEED_ADMIN_EMAIL || 'admin@example.com',
        password: process.env.SEED_ADMIN_PASSWORD || 'changeme123',
        role: 'superadmin',
      });
      console.log(`✅ Admin created: ${process.env.SEED_ADMIN_EMAIL}`);
    } else {
      console.log('ℹ️  Admin already exists, skipping.');
    }

    const existingConfig = await GalleryHero.findOne({ name: 'Default' });
    if (!existingConfig) {
      await GalleryHero.create({ name: 'Default' });
      console.log('✅ Default GalleryHero config created');
    } else {
      console.log('ℹ️  GalleryHero config already exists, skipping.');
    }

    console.log('\n🎉 Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err);
    process.exit(1);
  }
};

seed();
