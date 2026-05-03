import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  createProduct,
  updateProduct,
  fetchProductById,
  deleteProductImage,
  setPrimaryImage,
} from '../api/products';
import styles from './ProductForm.module.css';

// ── Constants ────────────────────────────────────────────────────────────────
const CATEGORIES     = ['products', 'stones', 'bracelets'];
const AVAILABILITIES = ['Available', 'Inquire', 'Sold Out'];
const STONE_OPTIONS  = [
  'Obsidian', 'Black Tourmaline', 'Labradorite', 'Amethyst', 'Rose Quartz',
  'Smoky Quartz', 'Citrine', 'Lapis Lazuli', 'Malachite', 'Moonstone',
  "Tiger's Eye", 'Onyx', 'Jasper', 'Selenite', 'Pyrite', 'Clear Quartz', 'Carnelian',
];

const EMPTY = {
  name: '', slug: '', category: 'products', series: '', material: '',
  description: '', price: '', priceDisplay: '', availability: 'Available',
  edition: '', isNew: false, isFeatured: false, dimensions: '', weight: '',
  stoneTypes: [], beadSize: '', wristSize: '', tags: '',
  careInstructions: '', shippingInfo: '', order: '0', isActive: true,
};

// ── Helper ───────────────────────────────────────────────────────────────────
const autoSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

// ── Tiny UI primitives (no external dep needed) ───────────────────────────────
function Spinner({ size = 20 }) {
  return (
    <svg
      width={size} height={size}
      viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      style={{ animation: 'pf-spin .7s linear infinite' }}
    >
      <circle cx="12" cy="12" r="10" strokeOpacity=".25" />
      <path d="M12 2a10 10 0 0 1 10 10" />
      <style>{`@keyframes pf-spin{to{transform:rotate(360deg)}}`}</style>
    </svg>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer',
        background: checked ? 'var(--color-accent, #185fa5)' : 'var(--color-border)',
        position: 'relative', flexShrink: 0, transition: 'background .2s',
        padding: 0,
      }}
    >
      <span style={{
        position: 'absolute', top: 3, left: checked ? 19 : 3,
        width: 14, height: 14, borderRadius: '50%', background: 'white',
        transition: 'left .2s', display: 'block',
      }} />
    </button>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProductForm() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const isEdit   = Boolean(id);
  const filesRef = useRef(null);

  const [form,        setForm]        = useState(EMPTY);
  const [images,      setImages]      = useState([]);   // existing Cloudinary images
  const [files,       setFiles]       = useState([]);   // pending local files
  const [loading,     setLoading]     = useState(isEdit);
  const [saving,      setSaving]      = useState(false);
  const [deletingImg, setDeletingImg] = useState(null);

  // ── Load product (edit mode) ─────────────────────────────────────────────
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const res = await fetchProductById(id);
        const p   = res.data.data;
        setForm({
          name:             p.name              ?? '',
          slug:             p.slug              ?? '',
          category:         p.category          ?? 'products',
          series:           p.series            ?? '',
          material:         p.material          ?? '',
          description:      p.description       ?? '',
          price:            p.price?.toString() ?? '',
          priceDisplay:     p.priceDisplay      ?? '',
          availability:     p.availability      ?? 'Available',
          edition:          p.edition           ?? '',
          isNew:            p.isNew             ?? false,
          isFeatured:       p.isFeatured        ?? false,
          dimensions:       p.dimensions        ?? '',
          weight:           p.weight            ?? '',
          stoneTypes:       p.stoneTypes        ?? [],
          beadSize:         p.beadSize          ?? '',
          wristSize:        p.wristSize         ?? '',
          tags:             (p.tags ?? []).join(', '),
          careInstructions: p.careInstructions  ?? '',
          shippingInfo:     p.shippingInfo      ?? '',
          order:            p.order?.toString() ?? '0',
          isActive:         p.isActive          ?? true,
        });
        setImages(p.images ?? []);
      } catch {
        toast.error('Failed to load product');
        navigate('/products');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, navigate]);

  // ── Field helpers ────────────────────────────────────────────────────────
  const set = (key) => (e) => {
    const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm((f) => {
      const next = { ...f, [key]: val };
      if (key === 'name' && !isEdit) next.slug = autoSlug(val);
      return next;
    });
  };

  const setVal = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const toggleStone = (stone) =>
    setForm((f) => ({
      ...f,
      stoneTypes: f.stoneTypes.includes(stone)
        ? f.stoneTypes.filter((s) => s !== stone)
        : [...f.stoneTypes, stone],
    }));

  // ── File handling ────────────────────────────────────────────────────────
  const onFilesChange = (e) => {
    const picked = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...picked]);
    e.target.value = '';
  };

  const removeLocalFile = (idx) =>
    setFiles((prev) => prev.filter((_, i) => i !== idx));

  // ── Image actions ────────────────────────────────────────────────────────
  const handleDeleteImage = async (imgId) => {
    if (!window.confirm('Delete this image?')) return;
    setDeletingImg(imgId);
    try {
      const res = await deleteProductImage(id, imgId);
      setImages(res.data.data.images);
      toast.success('Image deleted');
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeletingImg(null);
    }
  };

  const handleSetPrimary = async (imgId) => {
    try {
      const res = await setPrimaryImage(id, imgId);
      setImages(res.data.data.images);
      toast.success('Primary image updated');
    } catch {
      toast.error('Failed to set primary');
    }
  };

  // ── Submit ───────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name.trim())              { toast.error('Product name is required'); return; }
    if (!form.price)                    { toast.error('Price is required');        return; }
    if (!isEdit && files.length === 0)  { toast.error('Add at least one image');   return; }

    setSaving(true);
    try {
      const fd = new FormData();

      // Text fields
      const TEXT_FIELDS = [
        'name', 'slug', 'category', 'series', 'material', 'description',
        'price', 'priceDisplay', 'availability', 'edition', 'dimensions',
        'weight', 'beadSize', 'wristSize', 'careInstructions', 'shippingInfo', 'order',
      ];
      TEXT_FIELDS.forEach((k) => fd.append(k, form[k]));

      // Boolean fields — send as strings, parse on server
      fd.append('isNew',      String(form.isNew));
      fd.append('isFeatured', String(form.isFeatured));
      fd.append('isActive',   String(form.isActive));

      // Arrays as JSON
      fd.append('stoneTypes', JSON.stringify(form.stoneTypes));
      fd.append('tags', JSON.stringify(
        form.tags.split(',').map((t) => t.trim()).filter(Boolean)
      ));

      // Image files — key must match upload.array('images', 10)
      files.forEach((f) => fd.append('images', f));

      if (isEdit) {
        await updateProduct(id, fd);
        toast.success('Product updated successfully');
      } else {
        await createProduct(fd);
        toast.success('Product created successfully');
      }

      navigate('/products');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Save failed — check console';
      toast.error(msg);
      console.error('[ProductForm] submit error:', err);
    } finally {
      setSaving(false);
    }
  };

  // ── Loading state ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '60vh', gap: 12, color: 'var(--text-muted)',
      }}>
        <Spinner size={28} />
        <span>Loading product…</span>
      </div>
    );
  }

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>
            {isEdit ? 'Edit product' : 'Add product'}
          </h1>
          <p className={styles.pageSubtitle}>
            {isEdit ? `Editing: ${form.name}` : 'Fill in the details below'}
          </p>
        </div>
        <div className={styles.pageActions}>
          <button
            type="button"
            className={styles.btn}
            onClick={() => navigate('/products')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`${styles.btn} ${styles.btnPrimary}`}
            disabled={saving}
          >
            {saving ? <Spinner size={16} /> : null}
            {isEdit ? 'Save changes' : 'Create product'}
          </button>
        </div>
      </div>

      <div className={styles.layout}>
        {/* ══════════════ LEFT COLUMN ══════════════ */}
        <div className={styles.main}>

          {/* Basic information */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>Basic information</div>
            <div className={styles.grid2}>

              <div className={styles.formGroup}>
                <label>Product name *</label>
                <input
                  value={form.name}
                  onChange={set('name')}
                  placeholder="Eternal Koi Reflection"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Slug (URL)</label>
                <input
                  value={form.slug}
                  onChange={set('slug')}
                  placeholder="eternal-koi-reflection"
                />
                <span className={styles.hint}>Auto-generated from name</span>
              </div>

              <div className={styles.formGroup}>
                <label>Category *</label>
                <select value={form.category} onChange={set('category')}>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c.charAt(0).toUpperCase() + c.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Series</label>
                <input
                  value={form.series}
                  onChange={set('series')}
                  placeholder="Violet Series"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Material</label>
                <input
                  value={form.material}
                  onChange={set('material')}
                  placeholder="Crystal & Resin"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Edition</label>
                <input
                  value={form.edition}
                  onChange={set('edition')}
                  placeholder="Limited — 3 of 5"
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullCol}`}>
                <label>Description</label>
                <textarea
                  value={form.description}
                  onChange={set('description')}
                  placeholder="Rich description of the piece…"
                  rows={5}
                />
              </div>

            </div>
          </div>

          {/* Specifications */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>Specifications</div>
            <div className={styles.grid3}>

              <div className={styles.formGroup}>
                <label>Dimensions</label>
                <input
                  value={form.dimensions}
                  onChange={set('dimensions')}
                  placeholder="32 × 18 × 14 cm"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Weight</label>
                <input
                  value={form.weight}
                  onChange={set('weight')}
                  placeholder="2.4 kg"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Bead size</label>
                <input
                  value={form.beadSize}
                  onChange={set('beadSize')}
                  placeholder="8mm"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Wrist size</label>
                <input
                  value={form.wristSize}
                  onChange={set('wristSize')}
                  placeholder="16–20 cm"
                />
              </div>

              <div className={`${styles.formGroup} ${styles.fullCol}`}>
                <label>Tags (comma-separated)</label>
                <input
                  value={form.tags}
                  onChange={set('tags')}
                  placeholder="healing, meditation, wall art"
                />
              </div>

            </div>

            {/* Stone chips */}
            <div className={styles.stoneSection}>
              <div className={styles.stoneLabel}>Stones / crystals featured</div>
              <div className={styles.stoneChips}>
                {STONE_OPTIONS.map((stone) => (
                  <button
                    key={stone}
                    type="button"
                    className={`${styles.chip} ${form.stoneTypes.includes(stone) ? styles.chipActive : ''}`}
                    onClick={() => toggleStone(stone)}
                  >
                    {form.stoneTypes.includes(stone) && (
                      <span style={{ marginRight: 4, fontSize: 9 }}>✦</span>
                    )}
                    {stone}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Care & shipping */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>Care & shipping</div>
            <div className={styles.stack}>

              <div className={styles.formGroup}>
                <label>Care instructions</label>
                <textarea
                  value={form.careInstructions}
                  onChange={set('careInstructions')}
                  rows={3}
                  placeholder="Keep away from direct sunlight…"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Shipping information</label>
                <textarea
                  value={form.shippingInfo}
                  onChange={set('shippingInfo')}
                  rows={3}
                  placeholder="Each piece is shipped in a custom crate…"
                />
              </div>

            </div>
          </div>
        </div>

        {/* ══════════════ RIGHT COLUMN ══════════════ */}
        <div className={styles.sidebar}>

          {/* Pricing */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>Pricing</div>
            <div className={styles.stack}>

              <div className={styles.formGroup}>
                <label>Price (number) *</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={form.price}
                  onChange={set('price')}
                  placeholder="1580"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Price display</label>
                <input
                  value={form.priceDisplay}
                  onChange={set('priceDisplay')}
                  placeholder="$1,580"
                />
                <span className={styles.hint}>Leave blank to auto-format</span>
              </div>

              <div className={styles.formGroup}>
                <label>Availability</label>
                <select value={form.availability} onChange={set('availability')}>
                  {AVAILABILITIES.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

            </div>
          </div>

          {/* Visibility toggles */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>Visibility</div>
            <div className={styles.toggleList}>
              {[
                { key: 'isActive',   label: 'Published (visible on site)' },
                { key: 'isNew',      label: 'Mark as New' },
                { key: 'isFeatured', label: 'Featured product' },
              ].map(({ key, label }) => (
                <div key={key} className={styles.toggleRow}>
                  <span className={styles.toggleLabel}>{label}</span>
                  <Toggle
                    checked={form[key]}
                    onChange={(val) => setVal(key, val)}
                  />
                </div>
              ))}
            </div>
            <div className={styles.formGroup} style={{ marginTop: 12 }}>
              <label>Display order</label>
              <input
                type="number"
                min="0"
                value={form.order}
                onChange={set('order')}
              />
            </div>
          </div>

          {/* Images */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>Images</div>

            {/* Existing Cloudinary images (edit mode) */}
            {images.length > 0 && (
              <div className={styles.imgGrid}>
                {images.map((img) => (
                  <div
                    key={img._id}
                    className={`${styles.imgItem} ${img.isPrimary ? styles.imgPrimary : ''}`}
                  >
                    <img src={img.url} alt={img.alt || img._id} />
                    <div className={styles.imgOverlay}>
                      {!img.isPrimary && (
                        <button
                          type="button"
                          className={styles.imgBtn}
                          onClick={() => handleSetPrimary(img._id)}
                          title="Set as primary"
                        >
                          ★
                        </button>
                      )}
                      <button
                        type="button"
                        className={`${styles.imgBtn} ${styles.imgBtnDanger}`}
                        onClick={() => handleDeleteImage(img._id)}
                        disabled={deletingImg === img._id}
                        title="Delete image"
                      >
                        {deletingImg === img._id ? <Spinner size={12} /> : '✕'}
                      </button>
                    </div>
                    {img.isPrimary && (
                      <span className={styles.primaryTag}>Primary</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* New local file previews */}
            {files.length > 0 && (
              <div
                className={styles.imgGrid}
                style={{ marginTop: images.length ? 10 : 0 }}
              >
                {files.map((f, idx) => (
                  <div key={idx} className={styles.imgItem}>
                    <img
                      src={URL.createObjectURL(f)}
                      alt={f.name}
                    />
                    <div className={styles.imgOverlay}>
                      <button
                        type="button"
                        className={`${styles.imgBtn} ${styles.imgBtnDanger}`}
                        onClick={() => removeLocalFile(idx)}
                        title="Remove"
                      >
                        ✕
                      </button>
                    </div>
                    <span className={`${styles.primaryTag} ${styles.newTag}`}>
                      New
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Upload zone */}
            <div
              className={styles.uploadZone}
              onClick={() => filesRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const dropped = Array.from(e.dataTransfer.files).filter(
                  (f) => f.type.startsWith('image/')
                );
                setFiles((prev) => [...prev, ...dropped]);
              }}
            >
              <svg
                width="22" height="22" viewBox="0 0 24 24"
                fill="none" stroke="currentColor" strokeWidth="1.5"
              >
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              <span>Click or drag to upload images</span>
              <span className={styles.uploadHint}>
                Up to 10 images · JPG / PNG / WebP
              </span>
            </div>

            <input
              ref={filesRef}
              type="file"
              accept="image/*"
              multiple
              onChange={onFilesChange}
              style={{ display: 'none' }}
            />
          </div>

        </div>
      </div>
    </form>
  );
}