// frontend/src/pages/GalleryCMS.jsx
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  fetchGalleryItems,
  uploadGalleryFiles,
  updateGalleryItem,
  deleteGalleryItem,
  bulkDeleteGalleryItems,
  toggleGalleryItem,
} from '../api/gallery_api';
import styles from './GalleryCMS.module.css';

const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'http://localhost:5000';

const VIDEO_RE = /\.(mp4|webm|ogg|mov)(\?.*)?$/i;
const isVideo  = (src = '') => VIDEO_RE.test(src);

function MediaThumb({ item, size = 64 }) {
  const url = `${API_BASE}${item.src}`;
  if (item.type === 'video' || isVideo(item.src)) {
    return (
      <div className={styles.thumbWrap} style={{ width: size, height: size }}>
        {item.poster
          ? <img src={`${API_BASE}${item.poster}`} alt="" className={styles.thumbImg} />
          : <video src={url} className={styles.thumbImg} muted playsInline preload="metadata" />
        }
        <span className={styles.playBadge}>▶</span>
      </div>
    );
  }
  return (
    <div className={styles.thumbWrap} style={{ width: size, height: size }}>
      <img src={url} alt={item.alt || ''} className={styles.thumbImg} />
    </div>
  );
}

// ── Edit modal ────────────────────────────────────────────────────────────
function EditModal({ item, onClose, onSaved }) {
  const [alt,      setAlt]      = useState(item.alt      || '');
  const [isActive, setIsActive] = useState(item.isActive ?? true);
  const [order,    setOrder]    = useState(item.order    ?? 0);
  const [mediaFile,  setMediaFile]  = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [mediaPreview,  setMediaPreview]  = useState('');
  const [posterPreview, setPosterPreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [err,    setErr]    = useState('');
  const mediaRef  = useRef();
  const posterRef = useRef();

  const handleMedia = e => {
    const f = e.target.files[0];
    if (!f) return;
    setMediaFile(f);
    setMediaPreview(URL.createObjectURL(f));
  };
  const handlePoster = e => {
    const f = e.target.files[0];
    if (!f) return;
    setPosterFile(f);
    setPosterPreview(URL.createObjectURL(f));
  };

  const save = async () => {
    setSaving(true); setErr('');
    try {
      const fd = new FormData();
      fd.append('alt',      alt);
      fd.append('isActive', String(isActive));
      fd.append('order',    String(order));
      if (mediaFile)  fd.append('media',  mediaFile);
      if (posterFile) fd.append('poster', posterFile);
      const res = await updateGalleryItem(item._id, fd);
      if (res.success) { onSaved(res.data); onClose(); }
      else setErr(res.message || 'Save failed');
    } catch (_) { setErr('Network error'); }
    finally { setSaving(false); }
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHead}>
          <span className={styles.modalTitle}>Edit Item</span>
          <button className={styles.modalX} onClick={onClose}>✕</button>
        </div>

        <div className={styles.modalBody}>
          {/* Current preview */}
          <div className={styles.editPreviewRow}>
            <div className={styles.editPreviewCurrent}>
              <MediaThumb item={item} size={110} />
              <span className={styles.editPreviewLabel}>current</span>
            </div>
            {(mediaPreview) && (
              <div className={styles.editPreviewCurrent}>
                {mediaFile && VIDEO_RE.test(mediaFile.name)
                  ? <video src={mediaPreview} className={styles.editPreviewVid} muted playsInline />
                  : <img   src={mediaPreview} className={styles.editPreviewVid} alt="" />
                }
                <span className={styles.editPreviewLabel}>new</span>
              </div>
            )}
          </div>

          {/* Replace file */}
          <div className={styles.fieldRow}>
            <label className={styles.fieldLabel}>Replace file</label>
            <button className={styles.btnGhost} onClick={() => mediaRef.current.click()}>
              Choose image / video
            </button>
            <input ref={mediaRef} type="file" accept="image/*,video/*" style={{ display:'none' }} onChange={handleMedia} />
          </div>

          {/* Poster (for video) */}
          {(item.type === 'video' || isVideo(item.src) || (mediaFile && VIDEO_RE.test(mediaFile.name))) && (
            <div className={styles.fieldRow}>
              <label className={styles.fieldLabel}>Video poster (thumbnail)</label>
              <div className={styles.posterRow}>
                {(posterPreview || item.poster) && (
                  <img src={posterPreview || `${API_BASE}${item.poster}`} alt="" className={styles.posterThumb} />
                )}
                <button className={styles.btnGhost} onClick={() => posterRef.current.click()}>
                  {item.poster ? 'Replace poster' : 'Upload poster'}
                </button>
              </div>
              <input ref={posterRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handlePoster} />
            </div>
          )}

          {/* Alt */}
          <div className={styles.fieldRow}>
            <label className={styles.fieldLabel}>Alt / caption</label>
            <input className={styles.fieldInput} value={alt} onChange={e => setAlt(e.target.value)} placeholder="Describe this item…" />
          </div>

          {/* Order */}
          <div className={styles.fieldRow}>
            <label className={styles.fieldLabel}>Display order</label>
            <input className={styles.fieldInput} style={{ width: 90 }} type="number" value={order} onChange={e => setOrder(Number(e.target.value))} />
          </div>

          {/* isActive */}
          <label className={styles.checkRow}>
            <input type="checkbox" checked={isActive} onChange={e => setIsActive(e.target.checked)} />
            Visible in dome gallery
          </label>

          {err && <p className={styles.errMsg}>{err}</p>}
        </div>

        <div className={styles.modalFoot}>
          <button className={styles.btnSecondary} onClick={onClose}>Cancel</button>
          <button className={styles.btnPrimary} onClick={save} disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────
export default function GalleryCMS() {
  const [items,    setItems]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [uploading,setUploading]= useState(false);
  const [selected, setSelected] = useState(new Set());
  const [editing,  setEditing]  = useState(null);
  const [toast,    setToast]    = useState({ msg: '', type: '' });
  const [dragging, setDragging] = useState(false);
  const [filter,   setFilter]   = useState('all'); // all | image | video
  const [confirmDel, setConfirmDel] = useState(null); // item or 'bulk'
  const fileInputRef = useRef();
  const dropRef      = useRef();

  // ── Load ────────────────────────────────────────────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchGalleryItems({ limit: 300 });
      if (res.success) setItems(res.data);
    } catch (_) { showToast('Failed to load', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  // ── Toast ────────────────────────────────────────────────────────────────
  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast({ msg: '', type: '' }), 3200);
  };

  // ── Upload ───────────────────────────────────────────────────────────────
  const handleFiles = async (files) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const res = await uploadGalleryFiles(files, { isActive: true, order: items.length });
      if (res.success) {
        showToast(`Uploaded ${res.count} item${res.count > 1 ? 's' : ''}`);
        load();
      } else {
        showToast(res.message || 'Upload failed', 'error');
      }
    } catch (_) { showToast('Upload error', 'error'); }
    finally { setUploading(false); }
  };

  // ── Drag-drop ────────────────────────────────────────────────────────────
  const onDrop = e => {
    e.preventDefault(); setDragging(false);
    handleFiles(e.dataTransfer.files);
  };
  const onDragOver = e => { e.preventDefault(); setDragging(true); };
  const onDragLeave = () => setDragging(false);

  // ── Toggle active ────────────────────────────────────────────────────────
  const handleToggle = async (item) => {
    const res = await toggleGalleryItem(item._id);
    if (res.success) setItems(prev => prev.map(i => i._id === item._id ? res.data : i));
  };

  // ── Delete single ────────────────────────────────────────────────────────
  const doDelete = async (item) => {
    const res = await deleteGalleryItem(item._id);
    if (res.success) {
      setItems(prev => prev.filter(i => i._id !== item._id));
      showToast('Deleted');
    } else showToast(res.message || 'Delete failed', 'error');
    setConfirmDel(null);
  };

  // ── Bulk delete ──────────────────────────────────────────────────────────
  const doBulkDelete = async () => {
    const ids = [...selected];
    const res = await bulkDeleteGalleryItems(ids);
    if (res.success) {
      setItems(prev => prev.filter(i => !selected.has(i._id)));
      setSelected(new Set());
      showToast(`Deleted ${res.deleted}`);
    } else showToast(res.message || 'Bulk delete failed', 'error');
    setConfirmDel(null);
  };

  // ── Select ───────────────────────────────────────────────────────────────
  const toggleSelect = id => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };
  const selectAll = () => {
    const visible = filtered.map(i => i._id);
    setSelected(new Set(visible));
  };
  const clearSel = () => setSelected(new Set());

  // ── Filter ───────────────────────────────────────────────────────────────
  const filtered = items.filter(i => {
    if (filter === 'image') return i.type === 'image' || !isVideo(i.src);
    if (filter === 'video') return i.type === 'video' || isVideo(i.src);
    return true;
  });

  const imgCount = items.filter(i => i.type === 'image' || !isVideo(i.src)).length;
  const vidCount = items.filter(i => i.type === 'video' || isVideo(i.src)).length;

  return (
    <div className={styles.page}>

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Gallery</h1>
          <p className={styles.sub}>
            {items.length} items &nbsp;·&nbsp; {imgCount} images &nbsp;·&nbsp; {vidCount} videos
          </p>
        </div>
        <div className={styles.headerActions}>
          {selected.size > 0 && (
            <button
              className={styles.btnDanger}
              onClick={() => setConfirmDel('bulk')}
            >
              Delete {selected.size} selected
            </button>
          )}
          <button
            className={styles.btnPrimary}
            onClick={() => fileInputRef.current.click()}
            disabled={uploading}
          >
            {uploading ? 'Uploading…' : '+ Upload'}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            style={{ display: 'none' }}
            onChange={e => handleFiles(e.target.files)}
          />
        </div>
      </div>

      {/* ── Toast ────────────────────────────────────────────────────────── */}
      {toast.msg && (
        <div className={toast.type === 'error' ? styles.toastErr : styles.toastOk}>
          {toast.msg}
        </div>
      )}

      {/* ── Filter tabs ──────────────────────────────────────────────────── */}
      <div className={styles.tabs}>
        {['all','image','video'].map(t => (
          <button
            key={t}
            className={`${styles.tab} ${filter === t ? styles.tabActive : ''}`}
            onClick={() => setFilter(t)}
          >
            {t === 'all' ? `All (${items.length})` : t === 'image' ? `Images (${imgCount})` : `Videos (${vidCount})`}
          </button>
        ))}
        {filtered.length > 0 && (
          <div className={styles.selActions}>
            <button className={styles.btnLink} onClick={selectAll}>Select all</button>
            {selected.size > 0 && <button className={styles.btnLink} onClick={clearSel}>Clear</button>}
          </div>
        )}
      </div>

      {/* ── Drop zone ────────────────────────────────────────────────────── */}
      <div
        ref={dropRef}
        className={`${styles.dropZone} ${dragging ? styles.dropZoneActive : ''}`}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => fileInputRef.current.click()}
      >
        <div className={styles.dropIcon}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
        </div>
        <span className={styles.dropText}>
          {uploading ? 'Uploading…' : 'Drop images & videos here, or click to browse'}
        </span>
        <span className={styles.dropHint}>JPEG · PNG · GIF · WebP · MP4 · WebM · MOV — up to 100 MB each</span>
      </div>

      {/* ── Grid ─────────────────────────────────────────────────────────── */}
      {loading ? (
        <div className={styles.loading}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div className={styles.empty}>No items yet — upload something above.</div>
      ) : (
        <div className={styles.grid}>
          {filtered.map(item => {
            const sel = selected.has(item._id);
            return (
              <div
                key={item._id}
                className={`${styles.card} ${sel ? styles.cardSelected : ''} ${!item.isActive ? styles.cardDraft : ''}`}
              >
                {/* Checkbox */}
                <div
                  className={`${styles.checkbox} ${sel ? styles.checkboxOn : ''}`}
                  onClick={() => toggleSelect(item._id)}
                >
                  {sel && <span>✓</span>}
                </div>

                {/* Thumb */}
                <div className={styles.cardThumb}>
                  <MediaThumb item={item} size={150} />
                  {!item.isActive && <div className={styles.draftBanner}>Draft</div>}
                </div>

                {/* Meta */}
                <div className={styles.cardMeta}>
                  <span className={`${styles.typePill} ${item.type === 'video' || isVideo(item.src) ? styles.typePillVideo : styles.typePillImage}`}>
                    {item.type === 'video' || isVideo(item.src) ? '▶ Video' : '🖼 Image'}
                  </span>
                  {item.alt && <p className={styles.cardAlt}>{item.alt}</p>}
                </div>

                {/* Actions */}
                <div className={styles.cardActions}>
                  <button
                    className={item.isActive ? styles.btnToggleOn : styles.btnToggleOff}
                    onClick={() => handleToggle(item)}
                    title={item.isActive ? 'Deactivate' : 'Activate'}
                  >
                    {item.isActive ? 'Active' : 'Draft'}
                  </button>
                  <button className={styles.btnEdit} onClick={() => setEditing(item)}>Edit</button>
                  <button className={styles.btnDel}  onClick={() => setConfirmDel(item)}>✕</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Edit modal ───────────────────────────────────────────────────── */}
      {editing && (
        <EditModal
          item={editing}
          onClose={() => setEditing(null)}
          onSaved={updated => {
            setItems(prev => prev.map(i => i._id === updated._id ? updated : i));
            showToast('Saved!');
          }}
        />
      )}

      {/* ── Delete confirm ───────────────────────────────────────────────── */}
      {confirmDel && (
        <div className={styles.overlay} onClick={() => setConfirmDel(null)}>
          <div className={styles.confirmBox} onClick={e => e.stopPropagation()}>
            <h3 className={styles.confirmTitle}>
              {confirmDel === 'bulk'
                ? `Delete ${selected.size} item${selected.size > 1 ? 's' : ''}?`
                : `Delete this item?`}
            </h3>
            <p className={styles.confirmSub}>This cannot be undone. Files will be permanently removed.</p>
            <div className={styles.confirmBtns}>
              <button className={styles.btnSecondary} onClick={() => setConfirmDel(null)}>Cancel</button>
              <button
                className={styles.btnDanger}
                onClick={() => confirmDel === 'bulk' ? doBulkDelete() : doDelete(confirmDel)}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}