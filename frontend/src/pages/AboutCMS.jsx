import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "../api/axios";
import "./AboutCMS.css";

const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";
const BASE = "/api/about";

// ─── API helpers ──────────────────────────────────────────────────────────────
const getAboutPage = () =>
  axios.get(BASE).then((r) => r.data.data);

// Hero now sends FormData (to support video file upload)
const updateHero = (formData) =>
  axios.put(`${BASE}/hero`, formData).then((r) => r.data.data);

const updateAboutSection = (formData) =>
  axios.put(`${BASE}/about-section`, formData).then((r) => r.data.data);

const updateArtist = (formData) =>
  axios.put(`${BASE}/artist`, formData).then((r) => r.data.data);

// ─── Toast ────────────────────────────────────────────────────────────────────
const toast = (msg, type = "success") => {
  const el = document.createElement("div");
  el.className = `cms-toast cms-toast--${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add("show"), 10);
  setTimeout(() => { el.classList.remove("show"); setTimeout(() => el.remove(), 300); }, 3000);
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * FIX 1 — HERO LISTS EMPTY:
 * MongoDB sometimes returns carouselWords / marqueeItems as a JSON string
 * if they were saved via JSON.stringify. Always normalise to a real array.
 */
const parseArray = (val, fallback = []) => {
  if (!val) return fallback;
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return fallback; }
};

const resolveUrl = (src) => {
  if (!src) return null;
  if (src.startsWith("blob:") || src.startsWith("http") || src.startsWith("/images/")) return src;
  return `${API_BASE}${src}`;
};

// ─── ImagePreview ─────────────────────────────────────────────────────────────
const ImagePreview = ({ currentSrc, label, name, onChange }) => {
  const [preview, setPreview] = useState(null);
  const inputRef = useRef(null);

  useEffect(() => { setPreview(null); }, [currentSrc]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onChange(name, file);
    e.target.value = "";
  };

  const src = resolveUrl(preview || currentSrc);

  return (
    <div className="img-preview-box" onClick={() => inputRef.current?.click()}>
      <input ref={inputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleFile} />
      {src
        ? <img src={src} alt={label} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        : <div className="img-placeholder"><span className="img-icon">🖼</span><span>{label}</span></div>
      }
      <div className="img-overlay"><span>Change</span></div>
    </div>
  );
};

// ─── VideoPreview — FIX 2: New video upload component ────────────────────────
const VideoPreview = ({ currentSrc, onFileChange, onPathChange }) => {
  const [preview, setPreview] = useState(null);
  const [tab, setTab]         = useState("url");
  const inputRef = useRef(null);

  useEffect(() => { setPreview(null); }, [currentSrc]);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPreview(URL.createObjectURL(file));
    onFileChange(file);
    e.target.value = "";
  };

  const displaySrc = preview || resolveUrl(currentSrc);

  return (
    <div className="video-preview-wrap">
      <div className="video-tab-row">
        <button className={`video-tab${tab === "url" ? " active" : ""}`} onClick={() => setTab("url")} type="button">
          URL / Path
        </button>
        <button className={`video-tab${tab === "upload" ? " active" : ""}`} onClick={() => setTab("upload")} type="button">
          Upload File
        </button>
      </div>

      {tab === "url" && (
        <>
          <input
            className="field-input"
            defaultValue={currentSrc || ""}
            onChange={(e) => onPathChange(e.target.value)}
            placeholder="/videos/hero.mp4 or https://..."
          />
          {displaySrc && (
            <video src={displaySrc} controls style={{ marginTop: 10, width: "100%", maxHeight: 160, borderRadius: 6 }} />
          )}
        </>
      )}

      {tab === "upload" && (
        <div className="video-drop-zone" onClick={() => inputRef.current?.click()}>
          <input ref={inputRef} type="file" accept="video/mp4,video/webm,video/*" style={{ display: "none" }} onChange={handleFile} />
          {preview
            ? <video src={preview} controls style={{ width: "100%", maxHeight: 180, borderRadius: 6 }} />
            : (
              <div className="video-drop-inner">
                <span className="video-icon">🎬</span>
                <span>Click to upload MP4 / WebM</span>
                <span className="video-hint">Max 100 MB recommended</span>
              </div>
            )
          }
        </div>
      )}
    </div>
  );
};

// ─── Hero Editor ──────────────────────────────────────────────────────────────
const HeroEditor = ({ data, onSaved }) => {
  const normalise = (d) => ({
    ...d,
    carouselWords: parseArray(d.carouselWords),
    marqueeItems:  parseArray(d.marqueeItems),
  });

  const [form, setForm]         = useState(() => normalise(data));
  const [videoFile, setVideoFile] = useState(null);
  const [saving, setSaving]       = useState(false);

  useEffect(() => { setForm(normalise(data)); setVideoFile(null); }, [data]);

  const setWord    = (i, key, val) => { const w = [...form.carouselWords]; w[i] = { ...w[i], [key]: val }; setForm({ ...form, carouselWords: w }); };
  const addWord    = () => setForm({ ...form, carouselWords: [...form.carouselWords, { word: "", sub: "" }] });
  const removeWord = (i) => setForm({ ...form, carouselWords: form.carouselWords.filter((_, idx) => idx !== i) });

  const setMarquee    = (i, val) => { const m = [...form.marqueeItems]; m[i] = val; setForm({ ...form, marqueeItems: m }); };
  const addMarquee    = () => setForm({ ...form, marqueeItems: [...form.marqueeItems, ""] });
  const removeMarquee = (i) => setForm({ ...form, marqueeItems: form.marqueeItems.filter((_, idx) => idx !== i) });

  const save = async () => {
    setSaving(true);
    try {
      // Use FormData so we can optionally attach a video file
      const fd = new FormData();
      fd.append("carouselWords", JSON.stringify(form.carouselWords));
      fd.append("marqueeItems",  JSON.stringify(form.marqueeItems));

      if (videoFile) {
        fd.append("video", videoFile);          // backend will save & derive videoSrc
      } else {
        fd.append("videoSrc", form.videoSrc || "");
      }

      await updateHero(fd);
      toast("Hero section saved!");
      setVideoFile(null);
      onSaved();
    } catch (err) {
      console.error(err);
      toast("Save failed — check console", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="section-card">
      <div className="section-header">
        <div>
          <h2 className="section-title">Hero Section</h2>
          <p className="section-desc">Background video, carousel words and marquee text</p>
        </div>
        <button className="btn-save" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Hero"}</button>
      </div>

      <label className="field-label">Background Video</label>
      <VideoPreview
        currentSrc={form.videoSrc}
        onFileChange={(file) => setVideoFile(file)}
        onPathChange={(val) => setForm({ ...form, videoSrc: val })}
      />

      <div className="sub-header" style={{ marginTop: 28 }}>
        <span>Carousel Words</span>
        <button className="btn-add" onClick={addWord}>+ Add Slide</button>
      </div>

      {form.carouselWords.length === 0 && (
        <p style={{ fontSize: 12, color: "rgba(192,132,252,0.45)", margin: "8px 0 16px", fontStyle: "italic" }}>
          No slides yet — click "+ Add Slide" to add the first one.
        </p>
      )}

      <div className="carousel-list">
        {form.carouselWords.map((item, i) => (
          <div key={i} className="carousel-row">
            <div className="carousel-index">{i + 1}</div>
            <div className="carousel-fields">
              <input className="field-input" placeholder="Word (e.g. ARTISTRY)" value={item.word || ""} onChange={(e) => setWord(i, "word", e.target.value)} />
              <input className="field-input" placeholder="Subtitle line" value={item.sub || ""} onChange={(e) => setWord(i, "sub", e.target.value)} />
            </div>
            <button className="btn-remove" onClick={() => removeWord(i)}>✕</button>
          </div>
        ))}
      </div>

      <div className="sub-header">
        <span>Marquee Items</span>
        <button className="btn-add" onClick={addMarquee}>+ Add Item</button>
      </div>

      {form.marqueeItems.length === 0 && (
        <p style={{ fontSize: 12, color: "rgba(192,132,252,0.45)", margin: "8px 0 16px", fontStyle: "italic" }}>
          No marquee items yet — click "+ Add Item" to add one.
        </p>
      )}

      <div className="marquee-grid">
        {form.marqueeItems.map((item, i) => (
          <div key={i} className="marquee-row">
            <input className="field-input" value={item || ""} onChange={(e) => setMarquee(i, e.target.value)} placeholder="e.g. ALCHEMY OF STONE or ✦" />
            <button className="btn-remove" onClick={() => removeMarquee(i)}>✕</button>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── About Editor ─────────────────────────────────────────────────────────────
const AboutEditor = ({ data, onSaved }) => {
  const [form, setForm]     = useState(data);
  const [files, setFiles]   = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(data); setFiles({}); }, [data]);

  const set     = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setFile = (name, file) => setFiles((f) => ({ ...f, [name]: file }));

  const save = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      ["eyebrow","headline","headlineEm","bodyLeft","bodyRight"].forEach((k) => fd.append(k, form[k] || ""));
      if (files.imageTop)    fd.append("imageTop",    files.imageTop);
      if (files.imageBottom) fd.append("imageBottom", files.imageBottom);
      await updateAboutSection(fd);
      toast("About section saved!");
      setFiles({});
      onSaved();
    } catch (err) {
      console.error(err);
      toast("Save failed — check console", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="section-card">
      <div className="section-header">
        <div><h2 className="section-title">About Section</h2><p className="section-desc">Headline, body text and images</p></div>
        <button className="btn-save" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save About"}</button>
      </div>

      <div className="two-col">
        <div>
          <label className="field-label">Eyebrow Label</label>
          <input className="field-input" value={form.eyebrow || ""} onChange={(e) => set("eyebrow", e.target.value)} />
          <label className="field-label">Headline</label>
          <input className="field-input" value={form.headline || ""} onChange={(e) => set("headline", e.target.value)} placeholder="Where Artistry Meets the Soul" />
          <label className="field-label">Italic Portion of Headline</label>
          <input className="field-input" value={form.headlineEm || ""} onChange={(e) => set("headlineEm", e.target.value)} placeholder="the Soul" />
        </div>
        <div className="img-pair">
          <div>
            <label className="field-label">Top Circle Image</label>
            <ImagePreview currentSrc={form.imageTop} label="Top Image" name="imageTop" onChange={setFile} />
          </div>
          <div>
            <label className="field-label">Bottom Portrait Image</label>
            <ImagePreview currentSrc={form.imageBottom} label="Bottom Image" name="imageBottom" onChange={setFile} />
          </div>
        </div>
      </div>

      <label className="field-label">Left Body Column</label>
      <textarea className="field-textarea" rows={5} value={form.bodyLeft || ""} onChange={(e) => set("bodyLeft", e.target.value)} />
      <label className="field-label">Right Body Column</label>
      <textarea className="field-textarea" rows={5} value={form.bodyRight || ""} onChange={(e) => set("bodyRight", e.target.value)} />
    </div>
  );
};

// ─── Artist Editor ────────────────────────────────────────────────────────────
const ArtistEditor = ({ data, onSaved }) => {
  const [form, setForm]     = useState(data);
  const [files, setFiles]   = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { setForm(data); setFiles({}); }, [data]);

  const set     = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const setFile = (name, file) => setFiles((f) => ({ ...f, [name]: file }));

  const save = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      ["name","title","specialty","bio","quote","tag","studioInfo"].forEach((k) => fd.append(k, form[k] || ""));
      ["worksCount","yearsActive","collectors"].forEach((k) => fd.append(k, String(form[k] ?? 0)));
      ["portraitImg","featured1","featured2","featured3"].forEach((k) => { if (files[k]) fd.append(k, files[k]); });
      await updateArtist(fd);
      toast("Artist section saved!");
      setFiles({});
      onSaved();
    } catch (err) {
      console.error(err);
      toast("Save failed — check console", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="section-card">
      <div className="section-header">
        <div><h2 className="section-title">Artist Section</h2><p className="section-desc">Artist bio, stats, quote and portfolio images</p></div>
        <button className="btn-save" onClick={save} disabled={saving}>{saving ? "Saving…" : "Save Artist"}</button>
      </div>

      <div className="three-col">
        <div>
          <label className="field-label">Name</label>
          <input className="field-input" value={form.name || ""} onChange={(e) => set("name", e.target.value)} />
          <label className="field-label">Title / Role</label>
          <input className="field-input" value={form.title || ""} onChange={(e) => set("title", e.target.value)} />
          <label className="field-label">Specialty Line</label>
          <input className="field-input" value={form.specialty || ""} onChange={(e) => set("specialty", e.target.value)} />
          <label className="field-label">Tag Pill</label>
          <input className="field-input" value={form.tag || ""} onChange={(e) => set("tag", e.target.value)} />
          <label className="field-label">Studio Info (footer line)</label>
          <input className="field-input" value={form.studioInfo || ""} onChange={(e) => set("studioInfo", e.target.value)} />
        </div>

        <div>
          <label className="field-label">Stats</label>
          <div className="stat-row">
            <div><label className="field-label small">Works</label><input className="field-input" type="number" value={form.worksCount ?? 0} onChange={(e) => set("worksCount", e.target.value)} /></div>
            <div><label className="field-label small">Years</label><input className="field-input" type="number" value={form.yearsActive ?? 0} onChange={(e) => set("yearsActive", e.target.value)} /></div>
            <div><label className="field-label small">Collectors</label><input className="field-input" type="number" value={form.collectors ?? 0} onChange={(e) => set("collectors", e.target.value)} /></div>
          </div>
          <label className="field-label">Bio</label>
          <textarea className="field-textarea" rows={6} value={form.bio || ""} onChange={(e) => set("bio", e.target.value)} />
          <label className="field-label">Quote</label>
          <input className="field-input" value={form.quote || ""} onChange={(e) => set("quote", e.target.value)} />
        </div>

        <div>
          <label className="field-label">Portrait Image</label>
          <ImagePreview currentSrc={form.portraitImg} label="Portrait" name="portraitImg" onChange={setFile} />
          <label className="field-label" style={{ marginTop: 16 }}>Featured Works (3)</label>
          <div className="featured-grid">
            {["featured1","featured2","featured3"].map((key) => (
              <ImagePreview key={key} currentSrc={form[key]} label={key} name={key} onChange={setFile} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Root ─────────────────────────────────────────────────────────────────────
export default function AboutCMS() {
  const [pageData, setPageData] = useState(null);
  const [loading,  setLoading]  = useState(true);
  const [tab,      setTab]      = useState("hero");

  const load = useCallback(async () => {
    setLoading(true);
    try { const d = await getAboutPage(); setPageData(d); }
    catch { toast("Failed to load data", "error"); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="cms-loading"><div className="spinner" /><span>Loading About CMS…</span></div>;
  if (!pageData) return <div className="cms-loading">Could not load data.</div>;

  const tabs = [
    { id: "hero",   label: "🎬 Hero",   desc: "Carousel & Marquee" },
    { id: "about",  label: "📖 About",  desc: "Text & Images" },
    { id: "artist", label: "🎨 Artist", desc: "Bio & Portfolio" },
  ];

  return (
    <div className="cms-root">
      <header className="cms-topbar">
        <div className="cms-topbar-inner">
          <div className="cms-brand">
            <span className="cms-brand-dot" />
            <span className="cms-brand-name">Empavai CMS</span>
            <span className="cms-brand-page">/ About Page</span>
          </div>
          <a href="/" target="_blank" rel="noreferrer" className="cms-preview-btn">Preview Site ↗</a>
        </div>
      </header>

      <div className="cms-layout">
        <nav className="cms-sidebar">
          <p className="sidebar-heading">Sections</p>
          {tabs.map((t) => (
            <button key={t.id} className={`sidebar-tab${tab === t.id ? " active" : ""}`} onClick={() => setTab(t.id)}>
              <span className="tab-label">{t.label}</span>
              <span className="tab-desc">{t.desc}</span>
            </button>
          ))}
          <div className="sidebar-info"><p>Changes are saved per section and go live immediately.</p></div>
        </nav>

        <main className="cms-main">
          {tab === "hero"   && <HeroEditor   data={pageData.hero}   onSaved={load} />}
          {tab === "about"  && <AboutEditor  data={pageData.about}  onSaved={load} />}
          {tab === "artist" && <ArtistEditor data={pageData.artist} onSaved={load} />}
        </main>
      </div>
    </div>
  );
}