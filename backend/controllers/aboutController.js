// controllers/aboutController.js
const AboutPage = require("../models/About");
const path      = require("path");
const fs        = require("fs");

const getOrCreate = async () => {
  let doc = await AboutPage.findOne();
  if (!doc) doc = await AboutPage.create({});
  return doc;
};

const publicUrl = (filename, folder = "about") =>
  filename ? `/uploads/${folder}/${filename}` : null;

const deleteOldFile = (oldUrl) => {
  if (!oldUrl || oldUrl.startsWith("/images/")) return;
  const filePath = path.join(__dirname, "../public", oldUrl);
  fs.unlink(filePath, (err) => {
    if (err && err.code !== "ENOENT") console.warn("Could not delete old upload:", err.message);
  });
};

// Accepts a real array or a JSON string (FormData) and always returns a clean string array
const toStringArray = (val) => {
  let arr = val;
  if (typeof val === "string") {
    try { arr = JSON.parse(val); } catch { arr = []; }
  }
  return Array.isArray(arr)
    ? arr.map((s) => String(s).trim()).filter(Boolean)
    : [];
};

// GET /api/about
exports.getAboutPage = async (req, res) => {
  try {
    const doc = await getOrCreate();
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/about/hero  — FormData (supports video file upload)
exports.updateHero = async (req, res) => {
  try {
    const doc = await getOrCreate();
    const { videoSrc, carouselWords, marqueeItems } = req.body;

    if (req.files?.video?.[0]) {
      deleteOldFile(doc.hero.videoSrc);
      doc.hero.videoSrc = publicUrl(req.files.video[0].filename, "about");
    } else if (videoSrc !== undefined) {
      doc.hero.videoSrc = videoSrc;
    }

    if (carouselWords !== undefined) {
      doc.hero.carouselWords =
        typeof carouselWords === "string" ? JSON.parse(carouselWords) : carouselWords;
    }
    if (marqueeItems !== undefined) {
      doc.hero.marqueeItems =
        typeof marqueeItems === "string" ? JSON.parse(marqueeItems) : marqueeItems;
    }

    doc.markModified("hero");
    await doc.save();
    res.json({ success: true, data: doc.hero });
  } catch (err) {
    console.error("updateHero error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/about/about-section
exports.updateAboutSection = async (req, res) => {
  try {
    const doc = await getOrCreate();
    ["eyebrow","headline","headlineEm","bodyLeft","bodyRight"].forEach((f) => {
      if (req.body[f] !== undefined) doc.about[f] = req.body[f];
    });
    if (req.files?.imageTop?.[0]) {
      deleteOldFile(doc.about.imageTop);
      doc.about.imageTop = publicUrl(req.files.imageTop[0].filename);
    }
    if (req.files?.imageBottom?.[0]) {
      deleteOldFile(doc.about.imageBottom);
      doc.about.imageBottom = publicUrl(req.files.imageBottom[0].filename);
    }
    doc.markModified("about");
    await doc.save();
    res.json({ success: true, data: doc.about });
  } catch (err) {
    console.error("updateAboutSection error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/about/artist
exports.updateArtist = async (req, res) => {
  try {
    const doc = await getOrCreate();

    ["heading","name","intro","quote","quoteAuthor","studioInfo"].forEach((f) => {
      if (req.body[f] !== undefined) doc.artist[f] = req.body[f];
    });

    if (req.body.roles !== undefined)      doc.artist.roles      = toStringArray(req.body.roles);
    if (req.body.paragraphs !== undefined) doc.artist.paragraphs = toStringArray(req.body.paragraphs);

    if (req.files) {
      ["portraitImg","awardImg"].forEach((field) => {
        if (req.files[field]?.[0]) {
          deleteOldFile(doc.artist[field]);
          doc.artist[field] = publicUrl(req.files[field][0].filename);
        }
      });
    }

    doc.markModified("artist");
    await doc.save();
    res.json({ success: true, data: doc.artist });
  } catch (err) {
    console.error("updateArtist error:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};