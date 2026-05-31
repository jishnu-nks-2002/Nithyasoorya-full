const mongoose = require("mongoose");

// ── Hero Section ──────────────────────────────────────────────────────────────
const carouselWordSchema = new mongoose.Schema({
  word: { type: String, required: true },
  sub:  { type: String, required: true },
}, { _id: false });

const heroSchema = new mongoose.Schema({
  videoSrc:      { type: String, default: "/your-video.mp4" },
  carouselWords: { type: [carouselWordSchema], default: [] },
  marqueeItems:  { type: [String], default: [] },
}, { _id: false });

// ── About Section ─────────────────────────────────────────────────────────────
const aboutSchema = new mongoose.Schema({
  eyebrow:      { type: String, default: "The Original Source" },
  headline:     { type: String, default: "Where Artistry Meets the Soul" },
  headlineEm:   { type: String, default: "the Soul" },      // italic portion
  bodyLeft:     { type: String, default: "" },
  bodyRight:    { type: String, default: "" },
  imageTop:     { type: String, default: "/images/p-6.jpeg" },
  imageBottom:  { type: String, default: "/images/p-4.jpeg" },
}, { _id: false });

// ── Artist Section ────────────────────────────────────────────────────────────
const artistSchema = new mongoose.Schema({
  name:       { type: String, default: "Kavya Nair" },
  title:      { type: String, default: "Crystal & Resin Sculptor" },
  specialty:  { type: String, default: "Amethyst · Fluid Resin · Sacred Geometry" },
  bio:        { type: String, default: "" },
  worksCount: { type: Number, default: 34 },
  yearsActive:{ type: Number, default: 8 },
  collectors: { type: Number, default: 412 },
  quote:      { type: String, default: "" },
  tag:        { type: String, default: "Lead Artist" },
  portraitImg:{ type: String, default: "/images/person/img-1.jpeg" },
  featured1:  { type: String, default: "/images/p-1.jpeg" },
  featured2:  { type: String, default: "/images/p-2.jpeg" },
  featured3:  { type: String, default: "/images/p-3.jpeg" },
  studioInfo: { type: String, default: "Empavai Studio · Kerala, India · Est. 2016" },
}, { _id: false });

// ── Root Document ─────────────────────────────────────────────────────────────
const aboutPageSchema = new mongoose.Schema(
  {
    hero:   { type: heroSchema,   default: () => ({}) },
    about:  { type: aboutSchema,  default: () => ({}) },
    artist: { type: artistSchema, default: () => ({}) },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AboutPage", aboutPageSchema);