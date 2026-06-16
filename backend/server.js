
const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const path    = require('path');
const connectDB = require('./config/db');

// ── Existing routes ───────────────────────────────────────────────────────────
const authRoutes        = require('./routes/auth');
const galleryHeroRoutes = require('./routes/galleryHero');
const shopRoutes        = require('./routes/routes');
const contactRoutes     = require('./routes/contact');
const aboutRoutes       = require('./routes/about');
const reviewRoutes      = require('./routes/reviews');
const galleryRoutes = require('./routes/gallery_route');

// ── Stones route (NEW) ────────────────────────────────────────────────────────
const stoneRoutes = require('./routes/stones');

const app = express();

connectDB();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000',
  ],
  credentials: true,
}));

app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Serve all uploaded files (images, stones, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth',         authRoutes);
app.use('/api/gallery-hero', galleryHeroRoutes);
app.use('/api',              shopRoutes);
app.use('/api/contact',      contactRoutes);
app.use('/api/about',        aboutRoutes);
app.use('/api/reviews',      reviewRoutes);
app.use('/api/stones',       stoneRoutes);   // ✅ Stones CRUD

app.use('/api/gallery', galleryRoutes);
// ── Health check ──────────────────────────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'API running', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 API running at http://localhost:${PORT}`);
});