/**
 * Empavai — Crystal Wisdom pages seed
 *
 * Usage (from the backend folder):
 *   npm run seed:crystal-pages              # upsert by slug (safe to re-run; overwrites those pages' content)
 *   npm run seed:crystal-pages -- --missing # only create pages that don't exist yet (keeps your admin edits)
 *   npm run seed:crystal-pages -- --dry-run # validate, no DB connection
 *   npm run seed:crystal-pages -- --reset   # delete ALL crystal pages first, then seed
 */
require('dotenv').config();
const mongoose    = require('mongoose');
const CrystalPage = require('../models/CrystalPage');
const pages       = require('./data/crystalPagesData');

const DRY_RUN = process.argv.includes('--dry-run');
const RESET   = process.argv.includes('--reset');
const MISSING = process.argv.includes('--missing');

(async () => {
  // validate every page against the schema (no DB needed)
  for (const p of pages) {
    try { await new CrystalPage(p).validate(); }
    catch (err) { console.error(`❌ ${p.slug}:`, err.message); process.exit(1); }
  }
  console.log(`✅ ${pages.length} pages valid`);
  if (DRY_RUN) return;

  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB connected');

  if (RESET) {
    await CrystalPage.deleteMany({});
    console.log('🧹 cleared crystal pages');
  }

  for (const p of pages) {
    const exists = await CrystalPage.exists({ slug: p.slug });
    if (exists && MISSING) { console.log(`↷ skipped  ${p.slug} (exists)`); continue; }
    if (exists) {
      const doc = await CrystalPage.findOne({ slug: p.slug });
      doc.set(p);
      await doc.save();
      console.log(`✎ updated  ${p.slug}`);
    } else {
      await CrystalPage.create(p);
      console.log(`＋ created  ${p.slug}`);
    }
  }
  console.log('🌱 Crystal Wisdom pages seeded');
})()
  .catch((e) => { console.error(e); process.exitCode = 1; })
  .finally(() => mongoose.disconnect());
