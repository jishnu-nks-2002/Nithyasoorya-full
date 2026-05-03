import { useState, useEffect, useRef } from 'react';
import { Button, FormGroup, Toggle } from './ui';
import styles from './SlideModal.module.css';

export default function SlideModal({ open, onClose, onSave, slide = null }) {
  const isEdit = Boolean(slide);
  const fileRef = useRef(null);
  const posterRef = useRef(null);

  const [form, setForm] = useState({ type: 'image', title: '', description: '', alt: '', isActive: true });
  const [mediaFile, setMediaFile] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [posterPreview, setPosterPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      if (slide) {
        setForm({
          type: slide.type || 'image',
          title: slide.title || '',
          description: slide.description || '',
          alt: slide.alt || '',
          isActive: slide.isActive ?? true,
        });
        setMediaPreview(slide.src || null);
        setPosterPreview(slide.poster || null);
      } else {
        setForm({ type: 'image', title: '', description: '', alt: '', isActive: true });
        setMediaPreview(null);
        setPosterPreview(null);
      }
      setMediaFile(null);
      setPosterFile(null);
      setError('');
    }
  }, [open, slide]);

  const handleMediaChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setMediaFile(file);
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (ev) => setMediaPreview(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setMediaPreview(null);
    }
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPosterFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPosterPreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!isEdit && !mediaFile) { setError('Please select a media file.'); return; }
    setError('');
    setSaving(true);

    const fd = new FormData();
    fd.append('type', form.type);
    fd.append('title', form.title);
    fd.append('description', form.description);
    fd.append('alt', form.alt);
    if (isEdit) fd.append('isActive', form.isActive);
    if (mediaFile) fd.append('media', mediaFile);

    await onSave(fd, posterFile);
    setSaving(false);
  };

  if (!open) return null;

  return (
    <div className={styles.backdrop} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>{isEdit ? 'Edit slide' : 'Add new slide'}</h2>
          <button className={styles.closeBtn} onClick={onClose}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className={styles.body}>
          {error && <div className={styles.error}>{error}</div>}

          <FormGroup label="Media type">
            <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })} disabled={isEdit}>
              <option value="image">Image</option>
              <option value="video">Video</option>
            </select>
          </FormGroup>

          {/* Media Upload */}
          <FormGroup label={isEdit ? 'Replace media (optional)' : `Upload ${form.type} *`}>
            <div className={styles.uploadZone} onClick={() => fileRef.current?.click()}>
              {mediaPreview && form.type === 'image' ? (
                <img src={mediaPreview} alt="preview" className={styles.previewImg} />
              ) : mediaFile && form.type === 'video' ? (
                <div className={styles.uploadPlaceholder}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="M10 9l5 3-5 3V9z" fill="currentColor" stroke="none" />
                  </svg>
                  <span>{mediaFile.name}</span>
                </div>
              ) : (
                <div className={styles.uploadPlaceholder}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                  </svg>
                  <span>Click to upload {form.type}</span>
                </div>
              )}
            </div>
            <input
              ref={fileRef}
              type="file"
              accept={form.type === 'video' ? 'video/*' : 'image/*'}
              onChange={handleMediaChange}
              style={{ display: 'none' }}
            />
          </FormGroup>

          {/* Poster for video */}
          {form.type === 'video' && (
            <FormGroup label="Video poster / thumbnail (optional)">
              <div className={styles.uploadZone} onClick={() => posterRef.current?.click()}>
                {posterPreview ? (
                  <img src={posterPreview} alt="poster preview" className={styles.previewImg} />
                ) : (
                  <div className={styles.uploadPlaceholder}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="M21 15l-5-5L5 21" />
                    </svg>
                    <span>Click to upload poster image</span>
                  </div>
                )}
              </div>
              <input ref={posterRef} type="file" accept="image/*" onChange={handlePosterChange} style={{ display: 'none' }} />
            </FormGroup>
          )}

          <FormGroup label="Title">
            <input
              type="text"
              placeholder="Slide title"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </FormGroup>

          <FormGroup label="Description">
            <textarea
              placeholder="Brief description..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </FormGroup>

          <FormGroup label="Alt text">
            <input
              type="text"
              placeholder="Accessible description of the media"
              value={form.alt}
              onChange={(e) => setForm({ ...form, alt: e.target.value })}
            />
          </FormGroup>

          {isEdit && (
            <div className={styles.toggleRow}>
              <span className={styles.toggleLabel}>Active</span>
              <Toggle
                id="slide-active"
                checked={form.isActive}
                onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" loading={saving} onClick={handleSubmit}>
            {isEdit ? 'Save changes' : 'Add slide'}
          </Button>
        </div>
      </div>
    </div>
  );
}
