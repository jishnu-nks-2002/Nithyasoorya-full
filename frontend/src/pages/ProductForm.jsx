import { useEffect, useRef, useState, useCallback } from 'react';
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
const AVAILABILITIES = ['Available', 'Inquire', 'Sold Out'];
const STONE_OPTIONS  = [
  'Obsidian', 'Black Tourmaline', 'Labradorite', 'Amethyst', 'Rose Quartz',
  'Smoky Quartz', 'Citrine', 'Lapis Lazuli', 'Malachite', 'Moonstone',
  "Tiger's Eye", 'Onyx', 'Jasper', 'Selenite', 'Pyrite', 'Clear Quartz', 'Carnelian',
];

const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'http://localhost:5000';

const EMPTY = {
  name: '', slug: '', category: '', series: '', material: '',
  description: '', price: '', priceDisplay: '', availability: 'Available',
  edition: '', isNew: false, isFeatured: false, dimensions: '', weight: '',
  stoneTypes: [], beadSize: '', wristSize: '', tags: '',
  careInstructions: '', shippingInfo: '', order: '0', isActive: true,
};

const autoSlug = (name) =>
  name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

// ── Spinner ───────────────────────────────────────────────────────────────────
function Spinner({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2"
      style={{ animation: 'pf-spin .7s linear infinite' }}>
      <circle cx="12" cy="12" r="10" strokeOpacity=".25" />
      <path d="M12 2a10 10 0 0 1 10 10" />
      <style>{`@keyframes pf-spin{to{transform:rotate(360deg)}}`}</style>
    </svg>
  );
}

// ── Toggle ────────────────────────────────────────────────────────────────────
function Toggle({ checked, onChange }) {
  return (
    <button type="button" role="switch" aria-checked={checked}
      onClick={() => onChange(!checked)}
      style={{
        width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer',
        background: checked ? 'var(--color-accent, #185fa5)' : 'var(--color-border)',
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

// ── Category Modal (Create + Edit) ────────────────────────────────────────────
// Props:
//   mode        : 'create' | 'edit'
//   initialName : pre-fill name when creating from typed text
//   editData    : { _id, name, slug, description, image } when editing
//   onClose     : () => void
//   onCreated   : (cat) => void   — called after create
//   onUpdated   : (cat) => void   — called after edit
function CategoryQuickModal({ mode = 'create', initialName = '', editData = null, onClose, onCreated, onUpdated }) {
  const imgRef  = useRef(null);
  const isEdit  = mode === 'edit';

  const [saving,  setSaving]  = useState(false);
  const [preview, setPreview] = useState(editData?.image?.url || null);
  const [imgFile, setImgFile] = useState(null);
  const [removeImg, setRemoveImg] = useState(false);
  const [form, setForm] = useState({
    name:        isEdit ? (editData?.name || '')        : initialName,
    slug:        isEdit ? (editData?.slug || '')        : (initialName ? autoSlug(initialName) : ''),
    description: isEdit ? (editData?.description || '') : '',
  });

  const inputStyle = {
    width: '100%', fontSize: 13, padding: '8px 10px',
    border: '1px solid var(--border-color, #d1d5db)', borderRadius: 6,
    background: '#fff', color: 'var(--text-primary, #111)',
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
  };
  const labelStyle = { fontSize: 12, fontWeight: 500, color: 'var(--text-secondary, #6b7280)', display: 'block', marginBottom: 5 };

  const set = (key) => (e) =>
    setForm((f) => {
      const next = { ...f, [key]: e.target.value };
      if (key === 'name' && !isEdit) next.slug = autoSlug(e.target.value);
      return next;
    });

  const onFile = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImgFile(f);
    setPreview(URL.createObjectURL(f));
    setRemoveImg(false);
    e.target.value = '';
  };

  const handleRemoveImg = () => {
    setPreview(null);
    setImgFile(null);
    setRemoveImg(true); // tells backend to delete existing image
  };

  const getToken = () => {
    const token = localStorage.getItem('gh_token');
    if (!token) { toast.error('Not authenticated — please log in again'); return null; }
    return token;
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Category name is required'); return; }
    const token = getToken();
    if (!token) return;

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name',        form.name.trim());
      fd.append('slug',        form.slug.trim());
      fd.append('description', form.description.trim());
      if (imgFile) fd.append('image', imgFile);
      if (isEdit && removeImg && !imgFile) fd.append('removeImage', 'true');

      const url    = isEdit ? `${API_BASE}/api/categories/${editData._id}` : `${API_BASE}/api/categories`;
      const method = isEdit ? 'PUT' : 'POST';

      const res  = await fetch(url, { method, headers: { Authorization: `Bearer ${token}` }, body: fd });
      const data = await res.json();
      if (res.status === 401) throw new Error('Session expired — please log in again');
      if (!data.success)      throw new Error(data.message || 'Failed');

      toast.success(isEdit ? 'Category updated' : 'Category created');
      if (isEdit) onUpdated?.(data.data);
      else        onCreated?.(data.data);
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div style={{ background: '#fff', borderRadius: 14, padding: 28, width: '100%', maxWidth: 480, boxShadow: '0 20px 60px rgba(0,0,0,0.18)', maxHeight: '90vh', overflowY: 'auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
          <h2 style={{ margin: 0, fontSize: 17, fontWeight: 600, color: 'var(--text-primary, #111)' }}>
            {isEdit ? 'Edit Category' : 'Create Category'}
          </h2>
          <button type="button" onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20, color: '#888', lineHeight: 1 }}>×</button>
        </div>

        {/* Image */}
        <div style={{ marginBottom: 18 }}>
          <label style={labelStyle}>Category image</label>
          {preview ? (
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/7', borderRadius: 10, overflow: 'hidden', marginBottom: 6, background: '#f5f3f8' }}>
              <img src={preview} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 6 }}>
                <button type="button" onClick={() => imgRef.current?.click()}
                  style={{ background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', fontSize: 11, padding: '3px 9px', fontWeight: 500 }}>
                  Change
                </button>
                <button type="button" onClick={handleRemoveImg}
                  style={{ background: 'rgba(220,50,50,0.9)', border: 'none', borderRadius: 4, color: '#fff', cursor: 'pointer', fontSize: 11, padding: '3px 9px', fontWeight: 500 }}>
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div onClick={() => imgRef.current?.click()}
              style={{ border: '1.5px dashed var(--border-color, #d1d5db)', borderRadius: 10, padding: '20px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, cursor: 'pointer', color: 'var(--text-muted, #9ca3af)', transition: 'border-color .15s, color .15s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#185fa5'; e.currentTarget.style.color = '#185fa5'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color, #d1d5db)'; e.currentTarget.style.color = 'var(--text-muted, #9ca3af)'; }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              <span style={{ fontSize: 13, fontWeight: 500 }}>Click to upload category image</span>
              <span style={{ fontSize: 11 }}>JPG / PNG / WebP — recommended 16:7 ratio</span>
            </div>
          )}
          <input ref={imgRef} type="file" accept="image/*" onChange={onFile} style={{ display: 'none' }} />
        </div>

        {/* Name */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Name *</label>
          <input value={form.name} onChange={set('name')} placeholder="Bracelets" style={inputStyle} />
        </div>

        {/* Slug */}
        <div style={{ marginBottom: 14 }}>
          <label style={labelStyle}>Slug</label>
          <input value={form.slug} onChange={set('slug')} placeholder="bracelets" style={inputStyle} />
          <span style={{ fontSize: 11, color: 'var(--text-hint, #9ca3af)' }}>Auto-generated from name</span>
        </div>

        {/* Description */}
        <div style={{ marginBottom: 24 }}>
          <label style={labelStyle}>Description</label>
          <textarea value={form.description} onChange={set('description')} placeholder="Describe this category…" rows={3}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button type="button" onClick={onClose}
            style={{ fontSize: 13, fontWeight: 500, padding: '8px 16px', borderRadius: 7, border: '1px solid var(--border-color, #d1d5db)', background: 'transparent', cursor: 'pointer', fontFamily: 'inherit' }}>
            Cancel
          </button>
          <button type="button" onClick={handleSave} disabled={saving}
            style={{ fontSize: 13, fontWeight: 500, padding: '8px 18px', borderRadius: 7, border: 'none', background: 'var(--text-primary, #111)', color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.65 : 1, display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'inherit' }}>
            {saving && <Spinner size={14} />}
            {isEdit ? 'Save changes' : 'Create category'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Typable Category Input with autocomplete + inline edit ───────────────────
function CategoryInput({ value, onChange }) {
  const [suggestions,   setSuggestions]   = useState([]);
  const [allCategories, setAllCategories] = useState([]); // [{name, _id, slug, description, image}]
  const [showDrop,      setShowDrop]      = useState(false);
  const [modalMode,     setModalMode]     = useState(null);   // null | 'create' | 'edit'
  const [pendingNew,    setPendingNew]    = useState('');
  const [editTarget,    setEditTarget]    = useState(null);   // full category doc
  const wrapRef = useRef(null);

  const loadCategories = useCallback(async () => {
    try {
      const res  = await fetch(`${API_BASE}/api/categories`);
      const data = await res.json();
      if (data.success) setAllCategories(data.data || []);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  useEffect(() => {
    const names = allCategories.map((c) => c.name);
    if (!value.trim()) setSuggestions(names);
    else setSuggestions(names.filter((n) => n.toLowerCase().includes(value.toLowerCase())));
  }, [value, allCategories]);

  useEffect(() => {
    const handleClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowDrop(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSelect = (name) => { onChange(name); setShowDrop(false); };

  const openCreate = (typed) => { setPendingNew(typed); setShowDrop(false); setModalMode('create'); };
  const openEdit   = (e, cat) => {
    e.stopPropagation();
    setEditTarget(cat);
    setShowDrop(false);
    setModalMode('edit');
  };

  const handleModalCreated = (newCat) => {
    setAllCategories((prev) => [...prev, newCat]);
    onChange(newCat.name);
    setModalMode(null);
  };

  const handleModalUpdated = (updatedCat) => {
    setAllCategories((prev) => prev.map((c) => c._id === updatedCat._id ? updatedCat : c));
    if (value === editTarget?.name) onChange(updatedCat.name);
    setModalMode(null);
  };

  const isExact = allCategories.some((c) => c.name.toLowerCase() === value.toLowerCase());

  return (
    <>
      <div ref={wrapRef} style={{ position: 'relative' }}>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setShowDrop(true)}
          placeholder="Type or select a category (e.g. Bracelets)"
          autoComplete="off"
        />
        {showDrop && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 200,
            background: '#fff', border: '1px solid var(--color-border, #e2e8f0)',
            borderRadius: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            maxHeight: 240, overflowY: 'auto', marginTop: 2,
          }}>
            {/* Create new */}
            {value.trim() && !isExact && (
              <div onClick={() => openCreate(value.trim())}
                style={{ padding: '9px 14px', cursor: 'pointer', fontSize: 13, borderBottom: '1px solid var(--color-border, #e2e8f0)', color: 'var(--color-accent, #185fa5)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: 6 }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f7ff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}>
                <span style={{ fontSize: 11, background: 'var(--color-accent, #185fa5)', color: '#fff', padding: '1px 7px', borderRadius: 10 }}>NEW</span>
                Create "{value.trim()}"
              </div>
            )}

            {/* Existing categories with edit pencil */}
            {suggestions.length > 0 ? (
              suggestions.map((name) => {
                const catDoc = allCategories.find((c) => c.name === name);
                const active = value === name;
                return (
                  <div key={name}
                    style={{ padding: '9px 14px', cursor: 'pointer', fontSize: 13, color: 'var(--color-text, #1a202c)', background: active ? 'var(--color-bg-subtle, #f7fafc)' : 'transparent', fontWeight: active ? 500 : 400, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--color-bg-subtle, #f7fafc)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = active ? 'var(--color-bg-subtle, #f7fafc)' : 'transparent'; }}
                    onClick={() => handleSelect(name)}>
                    <span>{name}</span>
                    {/* Edit pencil */}
                    <button type="button"
                      onClick={(e) => openEdit(e, catDoc)}
                      title="Edit this category"
                      style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: 5, cursor: 'pointer', padding: '2px 7px', fontSize: 11, color: '#888', display: 'flex', alignItems: 'center', gap: 3, flexShrink: 0 }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#185fa5'; e.currentTarget.style.color = '#185fa5'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.color = '#888'; }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                      Edit
                    </button>
                  </div>
                );
              })
            ) : (
              !value.trim() && (
                <div style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-muted, #6b7280)' }}>
                  No categories yet. Start typing to create one.
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalMode === 'create' && (
        <CategoryQuickModal
          mode="create"
          initialName={pendingNew}
          onClose={() => setModalMode(null)}
          onCreated={handleModalCreated}
        />
      )}
      {modalMode === 'edit' && editTarget && (
        <CategoryQuickModal
          mode="edit"
          editData={editTarget}
          onClose={() => setModalMode(null)}
          onUpdated={handleModalUpdated}
        />
      )}
    </>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ProductForm() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const isEdit   = Boolean(id);
  const filesRef = useRef(null);

  const [form,        setForm]        = useState(EMPTY);
  const [images,      setImages]      = useState([]);
  const [files,       setFiles]       = useState([]);
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
          category:         p.category          ?? '',
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
    if (!form.name.trim())             { toast.error('Product name is required'); return; }
    if (!form.price)                   { toast.error('Price is required');        return; }
    if (!form.category.trim())         { toast.error('Category is required');     return; }
    if (!isEdit && files.length === 0) { toast.error('Add at least one image');   return; }

    setSaving(true);
    try {
      const fd = new FormData();

      const TEXT_FIELDS = [
        'name', 'slug', 'category', 'series', 'material', 'description',
        'price', 'priceDisplay', 'availability', 'edition', 'dimensions',
        'weight', 'beadSize', 'wristSize', 'careInstructions', 'shippingInfo', 'order',
      ];
      TEXT_FIELDS.forEach((k) => fd.append(k, form[k]));

      fd.append('isNew',      String(form.isNew));
      fd.append('isFeatured', String(form.isFeatured));
      fd.append('isActive',   String(form.isActive));
      fd.append('stoneTypes', JSON.stringify(form.stoneTypes));
      fd.append('tags', JSON.stringify(
        form.tags.split(',').map((t) => t.trim()).filter(Boolean)
      ));

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

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12, color: 'var(--text-muted)' }}>
        <Spinner size={28} /><span>Loading product…</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      {/* ── Page header ── */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{isEdit ? 'Edit product' : 'Add product'}</h1>
          <p className={styles.pageSubtitle}>{isEdit ? `Editing: ${form.name}` : 'Fill in the details below'}</p>
        </div>
        <div className={styles.pageActions}>
          <button type="button" className={styles.btn} onClick={() => navigate('/products')}>Cancel</button>
          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={saving}>
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
                <input value={form.name} onChange={set('name')} placeholder="Eternal Koi Reflection" required />
              </div>

              <div className={styles.formGroup}>
                <label>Slug (URL)</label>
                <input value={form.slug} onChange={set('slug')} placeholder="eternal-koi-reflection" />
                <span className={styles.hint}>Auto-generated from name</span>
              </div>

              <div className={styles.formGroup}>
                <label>Category *</label>
                <CategoryInput
                  value={form.category}
                  onChange={(val) => setVal('category', val)}
                />
                <span className={styles.hint}>Type to search or click "Create" to add a new category with image & description</span>
              </div>

              <div className={styles.formGroup}>
                <label>Series</label>
                <input value={form.series} onChange={set('series')} placeholder="Violet Series" />
              </div>

              <div className={styles.formGroup}>
                <label>Material</label>
                <input value={form.material} onChange={set('material')} placeholder="Crystal & Resin" />
              </div>

              <div className={styles.formGroup}>
                <label>Edition</label>
                <input value={form.edition} onChange={set('edition')} placeholder="Limited — 3 of 5" />
              </div>

              <div className={`${styles.formGroup} ${styles.fullCol}`}>
                <label>Description</label>
                <textarea value={form.description} onChange={set('description')} placeholder="Rich description of the piece…" rows={5} />
              </div>

            </div>
          </div>

          {/* Specifications */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>Specifications</div>
            <div className={styles.grid3}>

              <div className={styles.formGroup}>
                <label>Dimensions</label>
                <input value={form.dimensions} onChange={set('dimensions')} placeholder="32 × 18 × 14 cm" />
              </div>

              <div className={styles.formGroup}>
                <label>Weight</label>
                <input value={form.weight} onChange={set('weight')} placeholder="2.4 kg" />
              </div>

              <div className={styles.formGroup}>
                <label>Bead size</label>
                <input value={form.beadSize} onChange={set('beadSize')} placeholder="8mm" />
              </div>

              <div className={styles.formGroup}>
                <label>Wrist size</label>
                <input value={form.wristSize} onChange={set('wristSize')} placeholder="16–20 cm" />
              </div>

              <div className={`${styles.formGroup} ${styles.fullCol}`}>
                <label>Tags (comma-separated)</label>
                <input value={form.tags} onChange={set('tags')} placeholder="healing, meditation, wall art" />
              </div>

            </div>

            <div className={styles.stoneSection}>
              <div className={styles.stoneLabel}>Stones / crystals featured</div>
              <div className={styles.stoneChips}>
                {STONE_OPTIONS.map((stone) => (
                  <button key={stone} type="button"
                    className={`${styles.chip} ${form.stoneTypes.includes(stone) ? styles.chipActive : ''}`}
                    onClick={() => toggleStone(stone)}>
                    {form.stoneTypes.includes(stone) && <span style={{ marginRight: 4, fontSize: 9 }}>✦</span>}
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
                <textarea value={form.careInstructions} onChange={set('careInstructions')} rows={3} placeholder="Keep away from direct sunlight…" />
              </div>
              <div className={styles.formGroup}>
                <label>Shipping information</label>
                <textarea value={form.shippingInfo} onChange={set('shippingInfo')} rows={3} placeholder="Each piece is shipped in a custom crate…" />
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
                <input type="number" min="0" step="1" value={form.price} onChange={set('price')} placeholder="1580" required />
              </div>
              <div className={styles.formGroup}>
                <label>Price display</label>
                <input value={form.priceDisplay} onChange={set('priceDisplay')} placeholder="₹1,580" />
                <span className={styles.hint}>Leave blank to auto-format</span>
              </div>
              <div className={styles.formGroup}>
                <label>Availability</label>
                <select value={form.availability} onChange={set('availability')}>
                  {AVAILABILITIES.map((a) => <option key={a} value={a}>{a}</option>)}
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
                  <Toggle checked={form[key]} onChange={(val) => setVal(key, val)} />
                </div>
              ))}
            </div>
            <div className={styles.formGroup} style={{ marginTop: 12 }}>
              <label>Display order</label>
              <input type="number" min="0" value={form.order} onChange={set('order')} />
            </div>
          </div>

          {/* Images */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>Images</div>

            {images.length > 0 && (
              <div className={styles.imgGrid}>
                {images.map((img) => (
                  <div key={img._id} className={`${styles.imgItem} ${img.isPrimary ? styles.imgPrimary : ''}`}>
                    <img src={img.url} alt={img.alt || img._id} />
                    <div className={styles.imgOverlay}>
                      {!img.isPrimary && (
                        <button type="button" className={styles.imgBtn} onClick={() => handleSetPrimary(img._id)} title="Set as primary">★</button>
                      )}
                      <button type="button" className={`${styles.imgBtn} ${styles.imgBtnDanger}`}
                        onClick={() => handleDeleteImage(img._id)} disabled={deletingImg === img._id} title="Delete image">
                        {deletingImg === img._id ? <Spinner size={12} /> : '✕'}
                      </button>
                    </div>
                    {img.isPrimary && <span className={styles.primaryTag}>Primary</span>}
                  </div>
                ))}
              </div>
            )}

            {files.length > 0 && (
              <div className={styles.imgGrid} style={{ marginTop: images.length ? 10 : 0 }}>
                {files.map((f, idx) => (
                  <div key={idx} className={styles.imgItem}>
                    <img src={URL.createObjectURL(f)} alt={f.name} />
                    <div className={styles.imgOverlay}>
                      <button type="button" className={`${styles.imgBtn} ${styles.imgBtnDanger}`} onClick={() => removeLocalFile(idx)} title="Remove">✕</button>
                    </div>
                    <span className={`${styles.primaryTag} ${styles.newTag}`}>New</span>
                  </div>
                ))}
              </div>
            )}

            <div className={styles.uploadZone}
              onClick={() => filesRef.current?.click()}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const dropped = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
                setFiles((prev) => [...prev, ...dropped]);
              }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
              </svg>
              <span>Click or drag to upload images</span>
              <span className={styles.uploadHint}>Up to 10 images · JPG / PNG / WebP</span>
            </div>

            <input ref={filesRef} type="file" accept="image/*" multiple onChange={onFilesChange} style={{ display: 'none' }} />
          </div>
        </div>
      </div>
    </form>
  );
}