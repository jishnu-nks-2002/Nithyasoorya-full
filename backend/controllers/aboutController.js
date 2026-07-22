// aboutController.js
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

// GET /api/about
exports.getAboutPage = async (req, res) => {
  try {
    const doc = await getOrCreate();
    res.json({ success: true, data: doc });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// PUT /api/about/hero  — now accepts FormData (supports video file upload)
exports.updateHero = async (req, res) => {
  try {
    const doc = await getOrCreate();
    const { videoSrc, carouselWords, marqueeItems } = req.body;

    // Video file uploaded via form-data
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
    ["name","title","specialty","bio","quote","tag","studioInfo"].forEach((f) => {
      if (req.body[f] !== undefined) doc.artist[f] = req.body[f];
    });
    ["worksCount","yearsActive","collectors"].forEach((f) => {
      if (req.body[f] !== undefined) doc.artist[f] = Number(req.body[f]);
    });
    if (req.files) {
      ["portraitImg","featured1","featured2","featured3"].forEach((field) => {
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