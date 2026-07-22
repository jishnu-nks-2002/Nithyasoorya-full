import React, { useState, useEffect, useRef } from 'react';
import styles from './ReviewsCMS.module.css';

// ── API base — matches Express mount: app.use('/api/reviews', reviewRoutes) ───
const BASE_URL = 'http://localhost:5000';
const API      = `${BASE_URL}/api/reviews`;

const getToken    = () => localStorage.getItem('gh_token') || '';
const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

// ── API helpers ───────────────────────────────────────────────────────────────
const reviewsApi = {
  // GET /api/reviews/admin  — all reviews (protected)
  getAllAdmin: () =>
    fetch(`${API}/admin`, { headers: authHeaders() })
      .then(r => { if (!r.ok) throw r; return r.json(); }),

  // GET /api/reviews  — active-only public fallback
  getAll: () =>
    fetch(API).then(r => { if (!r.ok) throw r; return r.json(); }),

  // POST /api/reviews  (multipart/form-data)
  create: (fd) =>
    fetch(API, { method: 'POST', headers: authHeaders(), body: fd })
      .then(r => { if (!r.ok) throw r; return r.json(); }),

  // PUT /api/reviews/:id  (multipart/form-data)
  update: (id, fd) =>
    fetch(`${API}/${id}`, { method: 'PUT', headers: authHeaders(), body: fd })
      .then(r => { if (!r.ok) throw r; return r.json(); }),

  // DELETE /api/reviews/:id
  remove: (id) =>
    fetch(`${API}/${id}`, { method: 'DELETE', headers: authHeaders() })
      .then(r => { if (!r.ok) throw r; return r.json(); }),

  // PUT /api/reviews/reorder  — body: { orderedIds: [...] }
  reorder: (orderedIds) =>
    fetch(`${API}/reorder`, {
      method:  'PUT',
      headers: { ...authHeaders(), 'Content-Type': 'application/json' },
      body:    JSON.stringify({ orderedIds }),
    }).then(r => { if (!r.ok) throw r; return r.json(); }),
};

// ── Stars ─────────────────────────────────────────────────────────────────────
const Stars = ({ rating, onChange }) => (
  <div className={styles.stars}>
    {[1, 2, 3, 4, 5].map(i => (
      <button
        key={i}
        type="button"
        className={`${styles.star} ${i <= rating ? styles.starFilled : ''} ${onChange ? styles.starBtn : ''}`}
        onClick={() => onChange?.(i)}
        aria-label={onChange ? `Rate ${i} star${i > 1 ? 's' : ''}` : undefined}
      >★</button>
    ))}
  </div>
);

// ── Empty form ────────────────────────────────────────────────────────────────
const EMPTY = {
  name: '', title: '', location: '',
  rating: 5, review: '', productLabel: '', isActive: true,
};

// ── Component ─────────────────────────────────────────────────────────────────
const ReviewsCMS = () => {
  const [reviews,      setReviews]      = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [saving,       setSaving]       = useState(false);
  const [deleting,     setDeleting]     = useState(null);
  const [form,         setForm]         = useState(EMPTY);
  const [editId,       setEditId]       = useState(null);
  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [showForm,     setShowForm]     = useState(false);
  const [toast,        setToast]        = useState(null);
  const [dragOver,     setDragOver]     = useState(false);
  const fileRef = useRef();

  // ── Fetch ──────────────────────────────────────────────────────────────────
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await reviewsApi.getAllAdmin();
      setReviews(res.data ?? []);
    } catch {
      // token missing / expired — fall back to public list
      try {
        const res = await reviewsApi.getAll();
        setReviews(res.data ?? []);
      } catch {
        showToast('Failed to load reviews', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReviews(); }, []); // eslint-disable-line

  // ── Toast ──────────────────────────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3200);
  };

  // ── Form helpers ───────────────────────────────────────────────────────────
  const field = (key) => (e) => setForm(f => ({ ...f, [key]: e.target.value }));

  const openCreate = () => {
    setForm(EMPTY); setEditId(null);
    setImageFile(null); setImagePreview('');
    setShowForm(true);
  };

  const openEdit = (r) => {
    setForm({
      name:         r.name         ?? '',
      title:        r.title        ?? '',
      location:     r.location     ?? '',
      rating:       r.rating       ?? 5,
      review:       r.review       ?? '',
      productLabel: r.productLabel ?? '',
      isActive:     r.isActive !== false,
    });
    setEditId(r._id);
    setImageFile(null);
    // productImage is stored as "/uploads/reviews/filename.jpg"
    setImagePreview(r.productImage ? `${BASE_URL}${r.productImage}` : '');
    setShowForm(true);
  };

  const closeForm = () => { setShowForm(false); setEditId(null); };

  // ── Image ──────────────────────────────────────────────────────────────────
  const handleImage = (file) => {
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.review.trim()) {
      showToast('Name and review text are required', 'error'); return;
    }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, String(v)));
      if (imageFile) fd.append('productImage', imageFile);

      if (editId) {
        await reviewsApi.update(editId, fd);
        showToast('Review updated');
      } else {
        await reviewsApi.create(fd);
        showToast('Review created');
      }
      closeForm();
      fetchReviews();
    } catch (err) {
      const msg = await err.json?.().then(d => d?.message).catch(() => null);
      showToast(msg || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this review?')) return;
    setDeleting(id);
    try {
      await reviewsApi.remove(id);
      showToast('Review deleted');
      setReviews(prev => prev.filter(r => r._id !== id));
    } catch {
      showToast('Delete failed', 'error');
    } finally {
      setDeleting(null);
    }
  };

  // ── Toggle active (optimistic) ─────────────────────────────────────────────
  const toggleActive = async (r) => {
    const next = !r.isActive;
    setReviews(prev => prev.map(x => x._id === r._id ? { ...x, isActive: next } : x));
    try {
      const fd = new FormData();
      fd.append('isActive', String(next));
      await reviewsApi.update(r._id, fd);
    } catch {
      setReviews(prev => prev.map(x => x._id === r._id ? { ...x, isActive: r.isActive } : x));
      showToast('Update failed', 'error');
    }
  };

  const initials = (name = '') =>
    name.trim().split(/\s+/).map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?';

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className={styles.root}>

      {/* Toast */}
      {toast && (
        <div className={`${styles.toast} ${styles[`toast_${toast.type}`]}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Reviews</h1>
          <p className={styles.subtitle}>
            {reviews.length} testimonial{reviews.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button className={styles.btnPrimary} onClick={openCreate}>+ Add review</button>
      </div>

      {/* Body */}
      {loading ? (
        <div className={styles.loader}><span className={styles.spin} /> Loading…</div>
      ) : reviews.length === 0 ? (
        <div className={styles.empty}>
          <p>No reviews yet.</p>
          <button className={styles.btnPrimary} onClick={openCreate}>Add your first review</button>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Reviewer</th>
                <th>Rating</th>
                <th>Review</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map(r => (
                <tr key={r._id}>

                  <td>
                    {r.productImage ? (
                      <img
                        src={`${BASE_URL}${r.productImage}`}
                        alt={r.productLabel || r.name}
                        className={styles.thumb}
                      />
                    ) : (
                      <div className={styles.thumbPlaceholder}>
                        {r.initials || initials(r.name)}
                      </div>
                    )}
                  </td>

                  <td>
                    <p className={styles.name}>{r.name}</p>
                    {r.title    && <p className={styles.meta}>{r.title}</p>}
                    {r.location && <p className={styles.meta}>{r.location}</p>}
                  </td>

                  <td><Stars rating={r.rating} /></td>

                  <td>
                    <p className={styles.reviewText}>
                      {r.review.length > 110 ? r.review.slice(0, 110) + '…' : r.review}
                    </p>
                    {r.productLabel && <span className={styles.badge}>{r.productLabel}</span>}
                  </td>

                  <td>
                    <button
                      className={`${styles.toggle} ${r.isActive ? styles.toggleOn : styles.toggleOff}`}
                      onClick={() => toggleActive(r)}
                    >
                      {r.isActive ? 'Active' : 'Hidden'}
                    </button>
                  </td>

                  <td>
                    <div className={styles.actions}>
                      <button className={styles.btnEdit} onClick={() => openEdit(r)}>Edit</button>
                      <button
                        className={styles.btnDelete}
                        onClick={() => handleDelete(r._id)}
                        disabled={deleting === r._id}
                      >
                        {deleting === r._id ? '…' : 'Delete'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showForm && (
        <div
          className={styles.overlay}
          onClick={e => e.target === e.currentTarget && closeForm()}
        >
          <div className={styles.modal}>

            <div className={styles.modalHeader}>
              <h2>{editId ? 'Edit review' : 'Add review'}</h2>
              <button className={styles.close} onClick={closeForm} aria-label="Close">✕</button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>

              {/* Drop zone — fixed height so image stays contained */}
              <div
                className={`${styles.dropzone} ${dragOver ? styles.dropzoneActive : ''}`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => { e.preventDefault(); setDragOver(false); handleImage(e.dataTransfer.files[0]); }}
                onClick={() => fileRef.current?.click()}
                role="button"
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && fileRef.current?.click()}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="preview" className={styles.preview} />
                ) : (
                  <div className={styles.dropzoneHint}>
                    <span className={styles.dropzoneIcon}>🖼</span>
                    <p>Click or drag to upload product image</p>
                    <p className={styles.dropzoneSmall}>JPEG · PNG · WebP · GIF — max 10 MB</p>
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  style={{ display: 'none' }}
                  onChange={e => handleImage(e.target.files[0])}
                />
              </div>

              <div className={styles.row2}>
                <div className={styles.field}>
                  <label>Name *</label>
                  <input value={form.name} onChange={field('name')} placeholder="Reviewer name" required />
                </div>
                <div className={styles.field}>
                  <label>Title</label>
                  <input value={form.title} onChange={field('title')} placeholder="e.g. Art Curator" />
                </div>
              </div>

              <div className={styles.row2}>
                <div className={styles.field}>
                  <label>Location</label>
                  <input value={form.location} onChange={field('location')} placeholder="City, Country" />
                </div>
                <div className={styles.field}>
                  <label>Product label</label>
                  <input value={form.productLabel} onChange={field('productLabel')} placeholder="e.g. Form in Space" />
                </div>
              </div>

              <div className={styles.field}>
                <label>Rating</label>
                <Stars rating={form.rating} onChange={v => setForm(f => ({ ...f, rating: v }))} />
              </div>

              <div className={styles.field}>
                <label>Review text *</label>
                <textarea
                  value={form.review}
                  onChange={field('review')}
                  placeholder="Write the review…"
                  rows={4}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.checkLabel}>
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  />
                  Show on website
                </label>
              </div>

              <div className={styles.formActions}>
                <button type="button" className={styles.btnSecondary} onClick={closeForm}>Cancel</button>
                <button type="submit" className={styles.btnPrimary} disabled={saving}>
                  {saving ? 'Saving…' : editId ? 'Update review' : 'Create review'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewsCMS;