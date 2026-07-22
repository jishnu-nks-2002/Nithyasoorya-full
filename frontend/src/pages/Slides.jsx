import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  fetchAdminConfig,
  addSlide,
  updateSlide,
  updateSlidePoster,
  deleteSlide,
  reorderSlides,
} from '../api/galleryHero';
import { Card, Button, Badge, PageHeader, EmptyState, Spinner } from '../components/ui';
import SlideModal from '../components/SlideModal';
import styles from './Slides.module.css';

export default function Slides() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState({ open: false, slide: null });
  const [deleting, setDeleting] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [dragging, setDragging] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const loadSlides = useCallback(async () => {
    try {
      const res = await fetchAdminConfig();
      const sorted = [...(res.data.data.slides || [])].sort((a, b) => a.order - b.order);
      setSlides(sorted);
    } catch {
      toast.error('Failed to load slides');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadSlides(); }, [loadSlides]);

  const handleSave = async (fd, posterFile) => {
    try {
      if (modal.slide) {
        const res = await updateSlide(modal.slide._id, fd);
        if (posterFile) {
          const pfd = new FormData();
          pfd.append('poster', posterFile);
          await updateSlidePoster(modal.slide._id, pfd);
        }
        setSlides((prev) =>
          prev.map((s) => (s._id === modal.slide._id ? { ...s, ...res.data.slide } : s))
        );
        toast.success('Slide updated');
      } else {
        const res = await addSlide(fd);
        if (posterFile && res.data.slide) {
          const pfd = new FormData();
          pfd.append('poster', posterFile);
          await updateSlidePoster(res.data.slide._id, pfd);
        }
        setSlides((prev) => [...prev, res.data.slide]);
        toast.success('Slide added');
      }
      setModal({ open: false, slide: null });
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to save slide');
    }
  };

  const handleToggle = async (slide) => {
    setToggling(slide._id);
    try {
      const fd = new FormData();
      fd.append('isActive', !slide.isActive);
      const res = await updateSlide(slide._id, fd);
      setSlides((prev) => prev.map((s) => (s._id === slide._id ? { ...s, ...res.data.slide } : s)));
      toast.success(slide.isActive ? 'Slide hidden' : 'Slide activated');
    } catch {
      toast.error('Failed to update slide');
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (slideId) => {
    if (!window.confirm('Delete this slide? This cannot be undone.')) return;
    setDeleting(slideId);
    try {
      await deleteSlide(slideId);
      setSlides((prev) => prev.filter((s) => s._id !== slideId));
      toast.success('Slide deleted');
    } catch {
      toast.error('Failed to delete slide');
    } finally {
      setDeleting(null);
    }
  };

  // ─── Drag-to-reorder ───
  const handleDragStart = (e, idx) => {
    setDragging(idx);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, idx) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOver(idx);
  };

  const handleDrop = async (e, targetIdx) => {
    e.preventDefault();
    if (dragging === null || dragging === targetIdx) { setDragging(null); setDragOver(null); return; }
    const reordered = [...slides];
    const [moved] = reordered.splice(dragging, 1);
    reordered.splice(targetIdx, 0, moved);
    const updated = reordered.map((s, i) => ({ ...s, order: i }));
    setSlides(updated);
    setDragging(null);
    setDragOver(null);
    try {
      await reorderSlides(updated.map((s) => s._id));
      toast.success('Order saved');
    } catch {
      toast.error('Failed to save order');
      loadSlides();
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <Spinner size={28} />
        <span>Loading slides...</span>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Manage Slides"
        subtitle={`${slides.length} slide${slides.length !== 1 ? 's' : ''} — drag to reorder`}
      >
        <Button variant="primary" onClick={() => setModal({ open: true, slide: null })}>
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3v10M3 8h10" />
          </svg>
          Add slide
        </Button>
      </PageHeader>

      {slides.length === 0 ? (
        <Card>
          <EmptyState
            icon="🖼"
            title="No slides yet"
            subtitle="Add your first slide to get started."
            action={
              <Button variant="primary" onClick={() => setModal({ open: true, slide: null })}>
                Add first slide
              </Button>
            }
          />
        </Card>
      ) : (
        <div className={styles.grid}>
          {slides.map((slide, idx) => (
            <div
              key={slide._id}
              className={`${styles.slideCard} ${dragOver === idx ? styles.dragOver : ''} ${dragging === idx ? styles.dragging : ''}`}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDrop={(e) => handleDrop(e, idx)}
              onDragEnd={() => { setDragging(null); setDragOver(null); }}
            >
              {/* Thumb */}
              <div className={styles.thumb}>
                {slide.src ? (
                  slide.type === 'video' ? (
                    <video src={slide.src} poster={slide.poster} muted className={styles.thumbMedia} />
                  ) : (
                    <img src={slide.src} alt={slide.alt} className={styles.thumbMedia} />
                  )
                ) : (
                  <div className={styles.thumbPlaceholder}>
                    {slide.type === 'video' ? '🎬' : '🖼'}
                  </div>
                )}
                <span className={styles.typeBadge}>{slide.type}</span>
                {!slide.isActive && <span className={styles.hiddenBadge}>Hidden</span>}
                <div className={styles.dragHandle} title="Drag to reorder">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                    <circle cx="3.5" cy="2.5" r="1" /><circle cx="8.5" cy="2.5" r="1" />
                    <circle cx="3.5" cy="6" r="1" /><circle cx="8.5" cy="6" r="1" />
                    <circle cx="3.5" cy="9.5" r="1" /><circle cx="8.5" cy="9.5" r="1" />
                  </svg>
                </div>
                <div className={styles.orderNum}>{slide.order + 1}</div>
              </div>

              {/* Info */}
              <div className={styles.info}>
                <div className={styles.infoTitle}>{slide.title || <em className={styles.untitled}>Untitled</em>}</div>
                <div className={styles.infoDesc}>{slide.description || 'No description'}</div>
              </div>

              {/* Actions */}
              <div className={styles.actions}>
                <Button size="sm" onClick={() => setModal({ open: true, slide })}>
                  Edit
                </Button>
                <Button
                  size="sm"
                  onClick={() => handleToggle(slide)}
                  loading={toggling === slide._id}
                >
                  {slide.isActive ? 'Hide' : 'Show'}
                </Button>
                <Button
                  size="sm"
                  variant="danger"
                  onClick={() => handleDelete(slide._id)}
                  loading={deleting === slide._id}
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}

          {/* Add card */}
          <button className={styles.addCard} onClick={() => setModal({ open: true, slide: null })}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v8M8 12h8" />
            </svg>
            <span>Add new slide</span>
          </button>
        </div>
      )}

      <SlideModal
        open={modal.open}
        slide={modal.slide}
        onClose={() => setModal({ open: false, slide: null })}
        onSave={handleSave}
      />
    </div>
  );
}
