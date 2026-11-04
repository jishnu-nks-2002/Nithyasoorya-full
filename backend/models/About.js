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
  headlineEm:   { type: String, default: "the Soul" },
  bodyLeft:     { type: String, default: "" },
  bodyRight:    { type: String, default: "" },
  imageTop:     { type: String, default: "/images/p-6.jpeg" },
  imageBottom:  { type: String, default: "/images/p-4.jpeg" },
}, { _id: false });

// ── Artist Section (redesigned: "About the Artist") ───────────────────────────
const artistSchema = new mongoose.Schema({
  heading:     { type: String, default: "About the Artist" },
  name:        { type: String, default: "Nithya" },
  roles:       { type: [String], default: ["Founder", "Jewellery Designer", "Gemmologist"] },
  intro:       { type: String, default: "I'm the artist and creator behind Empavai." },
  paragraphs:  {
    type: [String],
    default: [
      "For over twenty years, jewellery design has been my creative language—a journey recognized by honours including the World Gold Council Jewellery Awards in the MENA region.",
      "Empavai marks a new chapter in that journey, allowing my imagination to take shape as crystal art decor that brings beauty and meaning to every space.",
      "As a creator, I let my materials themselves guide the design. Inspired by forests, flowing water, ancient symbolism and the quiet energy of natural materials, every piece is handcrafted with close attention to texture, form and intention.",
    ],
  },
  quote:       { type: String, default: "Inspired by nature.\nCrafted with meaning.\nTimeless by design." },
  quoteAuthor: { type: String, default: "Nithya" },
  portraitImg: { type: String, default: "/images/person/img-1.jpeg" },
  awardImg:    { type: String, default: "/images/p-1.jpeg" },
  studioInfo:  { type: String, default: "" },
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