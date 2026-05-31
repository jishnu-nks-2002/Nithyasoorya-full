import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from './StoneForm.module.css';

// ── Constants ─────────────────────────────────────────────────────────────────
const CATEGORY_OPTIONS = [
  'Protection', 'Love & Harmony', 'Spirituality', 'Cleansing',
  'Wisdom', 'Abundance', 'Grounding', 'Healing', 'Intuition', 'Manifestation',
];

const INTENTION_OPTIONS = [
  'Protection', 'Grounding', 'Purification', 'Clarity', 'Love', 'Compassion',
  'Peace', 'Emotional Healing', 'Intuition', 'Calm', 'Spiritual Growth',
  'Abundance', 'Manifestation', 'Focus', 'Balance',
];

const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'http://localhost:5000';

const EMPTY = {
  name: '', slug: '', subtitle: '', category: '', tagline: '', description: '',
  color: '#7B4BA0', accentColor: '#a06bc8',
  weight: '', dimensions: '', origin: '', hardness: '',
  isActive: true, isFeatured: false, order: '0',
  metaTitle: '', metaDescription: '', tags: '',
  intentions: [],
  properties: [{ label: '', value: '' }],
  howToUse:   [{ title: '', desc: '' }],
  faqs:       [{ q: '', a: '' }],
  gallery:    [{ label: '', bg: '', imageUrl: '', publicId: '', _file: null, _preview: '' }],
};

const autoSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

// ── Sub-components ────────────────────────────────────────────────────────────
function Spinner({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      style={{ animation: 'sf-spin .7s linear infinite', display: 'block', flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" strokeOpacity=".25" />
      <path d="M12 2a10 10 0 0 1 10 10" />
      <style>{`@keyframes sf-spin{to{transform:rotate(360deg)}}`}</style>
    </svg>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      style={{
        width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer',
        background: checked ? '#7B4BA0' : '#d1d5db',
        position: 'relative', flexShrink: 0, transition: 'background .2s', padding: 0,
      }}>
      <span style={{
        position: 'absolute', top: 3, left: checked ? 19 : 3,
        width: 14, height: 14, borderRadius: '50%', background: 'white',
        transition: 'left .2s', display: 'block',
      }} />
    </button>
  );
}

// ── Main Form ─────────────────────────────────────────────────────────────────
export default function StoneForm() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const isEdit   = Boolean(id);

  const heroFilesRef = useRef(null);

  const [form,        setForm]        = useState(EMPTY);
  const [heroImages,  setHeroImages]  = useState([]);
  const [heroFiles,   setHeroFiles]   = useState([]);
  const [loading,     setLoading]     = useState(isEdit);
  const [saving,      setSaving]      = useState(false);
  const [deletingImg, setDeletingImg] = useState(null);

  // ── Load stone (edit) ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res  = await fetch(`${API_BASE}/api/stones/id/${id}`);
        const data = await res.json();
        if (!data.success) throw new Error(data.message);
        const s = data.data;
        setForm({
          name:            s.name            ?? '',
          slug:            s.slug            ?? '',
          subtitle:        s.subtitle        ?? '',
          category:        s.category        ?? '',
          tagline:         s.tagline         ?? '',
          description:     s.description     ?? '',
          color:           s.color           ?? '#7B4BA0',
          accentColor:     s.accentColor     ?? '#a06bc8',
          weight:          s.weight          ?? '',
          dimensions:      s.dimensions      ?? '',
          origin:          s.origin          ?? '',
          hardness:        s.hardness        ?? '',
          isActive:        s.isActive        ?? true,
          isFeatured:      s.isFeatured      ?? false,
          order:           String(s.order    ?? 0),
          metaTitle:       s.metaTitle       ?? '',
          metaDescription: s.metaDescription ?? '',
          tags:            (s.tags ?? []).join(', '),
          intentions:      s.intentions      ?? [],
          properties:      s.properties?.length ? s.properties : [{ label: '', value: '' }],
          howToUse:        s.howToUse?.length   ? s.howToUse   : [{ title: '', desc: '' }],
          faqs:            s.faqs?.length       ? s.faqs       : [{ q: '', a: '' }],
          gallery: s.gallery?.length
            ? s.gallery.map(g => ({ ...g, _file: null, _preview: '' }))
            : [{ label: '', bg: '', imageUrl: '', publicId: '', _file: null, _preview: '' }],
        });
        setHeroImages(s.images ?? []);
      } catch (err) {
        toast.error('Failed to load stone');
        navigate('/stones-admin');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, navigate]);

  // ── Field helpers ───────────────────────────────────────────────────────────
  const set = (key) => (e) =>
    setForm(f => {
      const val = e.target.value;
      const next = { ...f, [key]: val };
      if (key === 'name' && !isEdit) next.slug = autoSlug(val);
      return next;
    });

  const setVal = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const updateRow = (key, idx, patch) =>
    setForm(f => {
      const arr = [...f[key]];
      arr[idx] = { ...arr[idx], ...patch };
      return { ...f, [key]: arr };
    });

  const addRow    = (key, blank) => setForm(f => ({ ...f, [key]: [...f[key], blank] }));
  const removeRow = (key, idx)   => setForm(f => ({ ...f, [key]: f[key].filter((_, i) => i !== idx) }));

  const toggleIntention = (intent) =>
    setForm(f => ({
      ...f,
      intentions: f.intentions.includes(intent)
        ? f.intentions.filter(i => i !== intent)
        : [...f.intentions, intent],
    }));

  // ── Hero image handlers ─────────────────────────────────────────────────────
  const onHeroFilesChange = (e) => {
    const picked = Array.from(e.target.files);
    setHeroFiles(prev => [...prev, ...picked]);
    e.target.value = '';
  };

  const removeHeroFile = (idx) => setHeroFiles(prev => prev.filter((_, i) => i !== idx));

  const handleDeleteHeroImage = async (imgId) => {
    if (!window.confirm('Delete this image?')) return;
    setDeletingImg(imgId);
    try {
      const res  = await fetch(`${API_BASE}/api/stones/${id}/images/${imgId}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setHeroImages(data.data.images);
      toast.success('Image deleted');
    } catch { toast.error('Delete failed'); }
    finally   { setDeletingImg(null); }
  };

  const handleSetPrimary = async (imgId) => {
    try {
      const res  = await fetch(`${API_BASE}/api/stones/${id}/images/${imgId}/primary`, { method: 'PUT' });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setHeroImages(data.data.images);
      toast.success('Primary image updated');
    } catch { toast.error('Failed to set primary'); }
  };

  // ── Gallery image handlers ──────────────────────────────────────────────────
  const onGalleryImagePick = (slideIdx, file) => {
    const preview = URL.createObjectURL(file);
    updateRow('gallery', slideIdx, { _file: file, _preview: preview });
  };

  const removeGalleryFilePending = (slideIdx) => {
    updateRow('gallery', slideIdx, { _file: null, _preview: '' });
  };

  const handleDeleteGalleryImage = async (slideIdx) => {
    const slide = form.gallery[slideIdx];
    if (!slide) return;
    if (slide._file) { removeGalleryFilePending(slideIdx); return; }
    if (!slide._id)  { updateRow('gallery', slideIdx, { imageUrl: '', publicId: '', _file: null, _preview: '' }); return; }
    if (!window.confirm('Remove this gallery image?')) return;
    try {
      const res  = await fetch(`${API_BASE}/api/stones/${id}/gallery/${slide._id}/image`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      updateRow('gallery', slideIdx, { imageUrl: '', publicId: '', _file: null, _preview: '' });
      toast.success('Gallery image removed');
    } catch { toast.error('Failed to remove gallery image'); }
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim())                     { toast.error('Stone name is required'); return; }
    if (!isEdit && heroFiles.length === 0)     { toast.error('Add at least one hero image'); return; }

    setSaving(true);
    try {
      const fd = new FormData();

      // ── Scalar fields ──
      ['name','slug','subtitle','category','tagline','description',
       'color','accentColor','weight','dimensions','origin','hardness',
       'order','metaTitle','metaDescription'].forEach(k => fd.append(k, form[k] ?? ''));

      fd.append('isActive',   String(form.isActive));
      fd.append('isFeatured', String(form.isFeatured));

      // ── Intentions ──
      fd.append('intentions', JSON.stringify(form.intentions));

      // ── Properties — only rows where BOTH label AND value are non-empty ──
      fd.append('properties', JSON.stringify(
        form.properties
          .filter(p => p.label?.trim() && p.value?.trim())
          .map(({ label, value }) => ({ label: label.trim(), value: value.trim() }))
      ));

      // ── How to Use — only rows where BOTH title AND desc are non-empty ──
      fd.append('howToUse', JSON.stringify(
        form.howToUse
          .filter(h => h.title?.trim() && h.desc?.trim())
          .map(({ title, desc }) => ({ title: title.trim(), desc: desc.trim() }))
      ));

      // ── FAQs — only rows where BOTH q AND a are non-empty ──
      fd.append('faqs', JSON.stringify(
        form.faqs
          .filter(f => f.q?.trim() && f.a?.trim())
          .map(({ q, a }) => ({ q: q.trim(), a: a.trim() }))
      ));

      // ── Tags ──
      fd.append('tags', JSON.stringify(
        form.tags.split(',').map(t => t.trim()).filter(Boolean)
      ));

      // ── Gallery metadata ──
      // Include slides that have any content (label, bg, existing image, OR a pending file)
      const galleryMeta = form.gallery
        .filter(g => g.label?.trim() || g.bg?.trim() || g.imageUrl || g._file)
        .map(({ label, bg, imageUrl, publicId, _id }) => ({
          label:     label     || '',
          bg:        bg        || '',
          imageUrl:  imageUrl  || '',
          publicId:  publicId  || '',
          ...(isEdit && _id ? { _id } : {}),
        }));
      fd.append('gallery', JSON.stringify(galleryMeta));

      // ── Gallery image files + correct meta indexes ──
      // Build a mapping: original gallery array index → galleryMeta index
      const galleryToMetaIdx = {};
      let metaCounter = 0;
      form.gallery.forEach((slide, idx) => {
        if (slide.label?.trim() || slide.bg?.trim() || slide.imageUrl || slide._file) {
          galleryToMetaIdx[idx] = metaCounter++;
        }
      });

      const galleryImageIndexes = [];
      form.gallery.forEach((slide, idx) => {
        if (slide._file) {
          fd.append('galleryImages', slide._file);
          galleryImageIndexes.push(galleryToMetaIdx[idx] ?? idx);
        }
      });
      fd.append('galleryImageIndexes', JSON.stringify(galleryImageIndexes));

      // ── Hero image files ──
      heroFiles.forEach(f => fd.append('images', f));

      const url    = isEdit ? `/api/stones/${id}` : '/api/stones';
      const method = isEdit ? 'PUT' : 'POST';
      const res    = await fetch(`${API_BASE}${url}`, { method, body: fd });
      const data   = await res.json();

      if (!data.success) throw new Error(data.message || 'Save failed');

      toast.success(isEdit ? 'Stone updated!' : 'Stone created!');
      navigate('/stones-admin');
    } catch (err) {
      console.error(err);
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'60vh', gap:12, color:'#9b82c4' }}>
        <Spinner size={28} /><span>Loading stone…</span>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate className={styles.root}>

      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{isEdit ? 'Edit Stone' : 'Add Stone'}</h1>
          <p className={styles.pageSubtitle}>{isEdit ? `Editing: ${form.name}` : 'Fill in the details below'}</p>
        </div>
        <div className={styles.pageActions}>
          <button type="button" className={styles.btn} onClick={() => navigate('/stones-admin')}>Cancel</button>
          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={saving}>
            {saving && <Spinner size={14} />}
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create stone'}
          </button>
        </div>
      </div>

      <div className={styles.layout}>

        {/* ════ LEFT ════ */}
        <div className={styles.main}>

          {/* ── Basic info ── */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>Basic Information</div>
            <div className={styles.grid2}>
              <div className={styles.formGroup}>
                <label>Stone name *</label>
                <input value={form.name} onChange={set('name')} placeholder="Black Tourmaline" required />
              </div>
              <div className={styles.formGroup}>
                <label>Slug (URL)</label>
                <input value={form.slug} onChange={set('slug')} placeholder="black-tourmaline" />
                <span className={styles.hint}>Auto-generated from name</span>
              </div>
              <div className={styles.formGroup}>
                <label>Subtitle</label>
                <input value={form.subtitle} onChange={set('subtitle')} placeholder="The Guardian Stone" />
              </div>
              <div className={styles.formGroup}>
                <label>Category</label>
                <select value={form.category} onChange={set('category')}>
                  <option value="">Select category…</option>
                  {CATEGORY_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className={`${styles.formGroup} ${styles.fullCol}`}>
                <label>Tagline</label>
                <input value={form.tagline} onChange={set('tagline')} placeholder="Shield yourself from what you cannot see." />
              </div>
              <div className={`${styles.formGroup} ${styles.fullCol}`}>
                <label>Description</label>
                <textarea value={form.description} onChange={set('description')}
                  placeholder="Full description…" rows={6} />
              </div>
            </div>
          </div>

          {/* ── Intentions ── */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>Intentions</div>
            <div className={styles.chipGrid}>
              {INTENTION_OPTIONS.map(intent => (
                <button key={intent} type="button"
                  className={`${styles.chip} ${form.intentions.includes(intent) ? styles.chipActive : ''}`}
                  onClick={() => toggleIntention(intent)}>
                  {form.intentions.includes(intent) && <span style={{ marginRight:4, fontSize:9 }}>✦</span>}
                  {intent}
                </button>
              ))}
            </div>
            <div style={{ marginTop:12, display:'flex', gap:8 }}>
              <input placeholder="Add custom intention… (press Enter)"
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const v = e.currentTarget.value.trim();
                    if (v && !form.intentions.includes(v)) { setVal('intentions', [...form.intentions, v]); e.currentTarget.value = ''; }
                  }
                }} style={{ flex:1 }} />
            </div>
          </div>

          {/* ── Properties ── */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>Stone Properties</div>
            <p className={styles.hint} style={{ marginBottom:12 }}>e.g. Chakra → Root, Element → Earth</p>
            {form.properties.map((row, i) => (
              <div key={i} className={styles.arrayRow}>
                <div className={styles.inlineFields}>
                  <input placeholder="Label (e.g. Chakra)" value={row.label}
                    onChange={e => updateRow('properties', i, { label: e.target.value })}
                    style={{ flex: '0 0 140px' }} />
                  <input placeholder="Value (e.g. Root)" value={row.value}
                    onChange={e => updateRow('properties', i, { value: e.target.value })}
                    style={{ flex: 1 }} />
                </div>
                <button type="button" className={styles.removeBtn}
                  onClick={() => removeRow('properties', i)}>✕</button>
              </div>
            ))}
            <button type="button" className={styles.addRowBtn}
              onClick={() => addRow('properties', { label: '', value: '' })}>+ Add property</button>
          </div>

          {/* ── How to Use ── */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>How to Use</div>
            {form.howToUse.map((row, i) => (
              <div key={i} className={styles.arrayRow}>
                <div className={styles.stackFields}>
                  <input placeholder="Title (e.g. Meditation)" value={row.title}
                    onChange={e => updateRow('howToUse', i, { title: e.target.value })} />
                  <textarea placeholder="Description…" value={row.desc} rows={2}
                    onChange={e => updateRow('howToUse', i, { desc: e.target.value })} />
                </div>
                <button type="button" className={styles.removeBtn}
                  onClick={() => removeRow('howToUse', i)}>✕</button>
              </div>
            ))}
            <button type="button" className={styles.addRowBtn}
              onClick={() => addRow('howToUse', { title: '', desc: '' })}>+ Add usage</button>
          </div>

          {/* ── FAQs ── */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>FAQs</div>
            {form.faqs.map((row, i) => (
              <div key={i} className={styles.arrayRow}>
                <div className={styles.stackFields}>
                  <input placeholder="Question" value={row.q}
                    onChange={e => updateRow('faqs', i, { q: e.target.value })} />
                  <textarea placeholder="Answer…" value={row.a} rows={2}
                    onChange={e => updateRow('faqs', i, { a: e.target.value })} />
                </div>
                <button type="button" className={styles.removeBtn}
                  onClick={() => removeRow('faqs', i)}>✕</button>
              </div>
            ))}
            <button type="button" className={styles.addRowBtn}
              onClick={() => addRow('faqs', { q: '', a: '' })}>+ Add FAQ</button>
          </div>

          {/* ── Gallery Slides ── */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>Gallery Slides</div>
            <p className={styles.hint} style={{ marginBottom: 16 }}>
              Each slide needs a label. Upload a real image <strong>or</strong> enter a CSS gradient — the image takes priority.
            </p>

            <div className={styles.gallerySlides}>
              {form.gallery.map((slide, i) => {
                const displayImg = slide._preview || slide.imageUrl || null;
                return (
                  <div key={i} className={styles.gallerySlide}>
                    <div className={styles.slideNumber}>Slide {i + 1}</div>

                    <GallerySlideUpload
                      displayImg={displayImg}
                      bg={slide.bg}
                      onFile={(file) => onGalleryImagePick(i, file)}
                      onRemoveImage={() => handleDeleteGalleryImage(i)}
                    />

                    <div className={styles.slideFields}>
                      <div className={styles.formGroup}>
                        <label>Label</label>
                        <input placeholder="e.g. Raw Form" value={slide.label}
                          onChange={e => updateRow('gallery', i, { label: e.target.value })} />
                      </div>
                      <div className={styles.formGroup}>
                        <label>CSS Gradient (optional fallback)</label>
                        <input placeholder="linear-gradient(135deg,#1a1a2e,#7B4BA0)" value={slide.bg}
                          onChange={e => updateRow('gallery', i, { bg: e.target.value })} />
                        {slide.bg && !displayImg && (
                          <div style={{ height: 28, borderRadius: 4, background: slide.bg, border: '1px solid #e8e0f0', marginTop: 4 }} />
                        )}
                      </div>
                    </div>

                    <button type="button" className={styles.removeSlideBtn}
                      onClick={() => removeRow('gallery', i)}
                      title="Remove slide">✕</button>
                  </div>
                );
              })}
            </div>

            <button type="button" className={styles.addRowBtn} style={{ marginTop: 12 }}
              onClick={() => addRow('gallery', { label: '', bg: '', imageUrl: '', publicId: '', _file: null, _preview: '' })}>
              + Add slide
            </button>
          </div>

          {/* ── SEO ── */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>SEO</div>
            <div className={styles.stack}>
              <div className={styles.formGroup}>
                <label>Meta title</label>
                <input value={form.metaTitle} onChange={set('metaTitle')} placeholder="Black Tourmaline — Sacred Stones" />
              </div>
              <div className={styles.formGroup}>
                <label>Meta description</label>
                <textarea value={form.metaDescription} onChange={set('metaDescription')} rows={2} placeholder="Powerful protective stone…" />
              </div>
              <div className={styles.formGroup}>
                <label>Tags (comma-separated)</label>
                <input value={form.tags} onChange={set('tags')} placeholder="protection, grounding, EMF" />
              </div>
            </div>
          </div>

        </div>

        {/* ════ RIGHT SIDEBAR ════ */}
        <div className={styles.sidebar}>

          {/* ── Physical ── */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>Physical Details</div>
            <div className={styles.stack}>
              {[
                ['weight',     'Weight',     '80–120g'],
                ['dimensions', 'Dimensions', '5–7 cm'],
                ['origin',     'Origin',     'Brazil, Africa, Pakistan'],
                ['hardness',   'Hardness',   '7–7.5 Mohs'],
              ].map(([key, label, ph]) => (
                <div key={key} className={styles.formGroup}>
                  <label>{label}</label>
                  <input value={form[key]} onChange={set(key)} placeholder={ph} />
                </div>
              ))}
            </div>
          </div>

          {/* ── Colours ── */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>Colours</div>
            <div className={styles.stack}>
              {[
                ['color',       'Hero background colour', '#7B4BA0'],
                ['accentColor', 'Accent / glow colour',   '#a06bc8'],
              ].map(([key, label, ph]) => (
                <div key={key} className={styles.formGroup}>
                  <label>{label}</label>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <input type="color" value={form[key]} onChange={e => setVal(key, e.target.value)}
                      style={{ width:44, height:36, padding:2, border:'1px solid #e8e0f0', borderRadius:4, cursor:'pointer' }} />
                    <input value={form[key]} onChange={set(key)} style={{ flex:1 }} placeholder={ph} />
                  </div>
                </div>
              ))}
              <div style={{ height:40, borderRadius:6, background:`linear-gradient(135deg,${form.color},${form.accentColor})`, border:'1px solid #e8e0f0' }} />
            </div>
          </div>

          {/* ── Visibility ── */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>Visibility</div>
            <div className={styles.toggleList}>
              {[
                ['isActive',   'Published (visible on site)'],
                ['isFeatured', 'Featured stone'],
              ].map(([key, label]) => (
                <div key={key} className={styles.toggleRow}>
                  <span className={styles.toggleLabel}>{label}</span>
                  <Toggle checked={form[key]} onChange={val => setVal(key, val)} />
                </div>
              ))}
            </div>
            <div className={styles.formGroup} style={{ marginTop:12 }}>
              <label>Display order</label>
              <input type="number" min="0" value={form.order} onChange={set('order')} />
            </div>
          </div>

          {/* ── Hero Images ── */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>Hero Images</div>
            <p className={styles.hint} style={{ marginBottom:10 }}>
              These appear on the stone listing and detail page hero.
            </p>

            {heroImages.length > 0 && (
              <div className={styles.imgGrid}>
                {heroImages.map(img => (
                  <div key={img._id} className={`${styles.imgItem} ${img.isPrimary ? styles.imgPrimary : ''}`}>
                    <img src={img.url} alt={img.alt || ''} />
                    <div className={styles.imgOverlay}>
                      {!img.isPrimary && (
                        <button type="button" className={styles.imgBtn}
                          onClick={() => handleSetPrimary(img._id)} title="Set primary">★</button>
                      )}
                      <button type="button" className={`${styles.imgBtn} ${styles.imgBtnDanger}`}
                        onClick={() => handleDeleteHeroImage(img._id)} disabled={deletingImg === img._id} title="Delete">
                        {deletingImg === img._id ? <Spinner size={12} /> : '✕'}
                      </button>
                    </div>
                    {img.isPrimary && <span className={styles.primaryTag}>Primary</span>}
                  </div>
                ))}
              </div>
            )}

            {heroFiles.length > 0 && (
              <div className={styles.imgGrid} style={{ marginTop: heroImages.length ? 10 : 0 }}>
                {heroFiles.map((f, idx) => (
                  <div key={idx} className={styles.imgItem}>
                    <img src={URL.createObjectURL(f)} alt={f.name} />
                    <div className={styles.imgOverlay}>
                      <button type="button" className={`${styles.imgBtn} ${styles.imgBtnDanger}`}
                        onClick={() => removeHeroFile(idx)}>✕</button>
                    </div>
                    <span className={`${styles.primaryTag} ${styles.newTag}`}>New</span>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.uploadZone}
              onClick={() => heroFilesRef.current?.click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault();
                const dropped = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
                setHeroFiles(prev => [...prev, ...dropped]);
              }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              <span>Click or drag to upload hero images</span>
              <span className={styles.uploadHint}>Up to 10 · JPG / PNG / WebP</span>
            </div>
            <input ref={heroFilesRef} type="file" accept="image/*" multiple
              onChange={onHeroFilesChange} style={{ display:'none' }} />
          </div>

        </div>
      </div>
    </form>
  );
}

// ── Gallery Slide Upload sub-component ────────────────────────────────────────
function GallerySlideUpload({ displayImg, bg, onFile, onRemoveImage }) {
  const inputRef = useRef(null);

  return (
    <div className={styles.slideImageArea}
      style={{ background: displayImg ? undefined : (bg || '#f0eaf8') }}
      onClick={() => !displayImg && inputRef.current?.click()}>
      {displayImg ? (
        <>
          <img src={displayImg} alt="Slide" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
          <div className={styles.slideImageOverlay}>
            <button type="button" className={styles.slideImgBtn}
              onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}
              title="Change image">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M11.5 1.5l3 3-9 9H2.5v-3l9-9z" />
              </svg>
            </button>
            <button type="button" className={`${styles.slideImgBtn} ${styles.slideImgBtnDanger}`}
              onClick={e => { e.stopPropagation(); onRemoveImage(); }}
              title="Remove image">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </>
      ) : (
        <div className={styles.slideImagePlaceholder}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="M21 15l-5-5L5 21" />
          </svg>
          <span>Upload image</span>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*"
        style={{ display:'none' }}
        onChange={e => { if (e.target.files[0]) onFile(e.target.files[0]); e.target.value=''; }} />
    </div>
  );
}