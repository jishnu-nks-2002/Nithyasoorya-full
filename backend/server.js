require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes        = require('./routes/auth');
const galleryHeroRoutes = require('./routes/galleryHero');
const shopRoutes        = require('./routes/routes'); // ← replaces productRoutes + categoryRoutes

const app = express();

connectDB();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth',         authRoutes);
app.use('/api/gallery-hero', galleryHeroRoutes);
app.use('/api',              shopRoutes); // ← single mount; URLs stay identical

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Gallery Hero API running', timestamp: new Date() });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 API running at http://localhost:${PORT}`);
});