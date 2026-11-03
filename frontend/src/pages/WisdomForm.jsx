import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import styles from './WisdomForm.module.css';
import { wisdomFetch } from '../api/wisdom';

const LAYOUTS = [
  ['hub',    'Landing page (intro only)'],
  ['chakra', 'Chakra cards'],
  ['zodiac', 'Zodiac grid'],
  ['spaces', 'Space cards'],
  ['care',   'Care blocks'],
];

// [key, label, placeholder, kind]
const ITEM_FIELDS = {
  hub:    [],
  chakra: [
    ['title',    'Chakra',                       'Root'],
    ['subtitle', 'Sanskrit name',                'Muladhara'],
    ['keywords', 'Keywords (comma-separated)',   'Ground, Protect, Belong'],
    ['body',     'Description',                  'Symbolically connected with…', 'area'],
    ['crystals', 'Crystals (comma-separated)',   'Black Tourmaline, Red Jasper'],
    ['accent',   'Accent colour',                '#c0392b', 'color'],
  ],
  zodiac: [
    ['title',     'Sign',                        'Aries'],
    ['subtitle',  'Dates',                       'March 21–April 19'],
    ['crystals',  'Crystals (comma-separated)',  'Carnelian, Red Jasper, Clear Quartz'],
    ['intention', 'Symbolic intention',          'Courage, momentum and confident beginnings.'],
  ],
  spaces: [
    ['title', 'Space',       'Entrance'],
    ['body',  'Description', 'For grounding and a welcoming sense of protection.', 'area'],
  ],
  care: [
    ['title', 'Heading', 'Physical care'],
    ['body',  'Text',    'Use a soft, dry cloth…', 'area'],
  ],
};

const EMPTY_ITEM = { title: '', subtitle: '', keywords: '', body: '', crystals: '', intention: '', accent: '' };
const EMPTY = {
  title: '', slug: '', menuLabel: '', eyebrow: 'CRYSTAL WISDOM', layout: 'spaces', tagline: '', intro: '',
  footnoteTitle: '', footnote: '', closingText: '', metaTitle: '', metaDescription: '', order: '0', isActive: true,
};

const autoSlug = (s) => s.toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

function Spinner({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      style={{ animation: 'wf-spin .7s linear infinite', display: 'block', flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" strokeOpacity=".25" /><path d="M12 2a10 10 0 0 1 10 10" />
      <style>{`@keyframes wf-spin{to{transform:rotate(360deg)}}`}</style>
    </svg>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)}
      style={{ width: 36, height: 20, borderRadius: 10, border: 'none', cursor: 'pointer', padding: 0,
        background: checked ? '#7B4BA0' : '#d1d5db', position: 'relative', flexShrink: 0, transition: 'background .2s' }}>
      <span style={{ position: 'absolute', top: 3, left: checked ? 19 : 3, width: 14, height: 14,
        borderRadius: '50%', background: 'white', transition: 'left .2s', display: 'block' }} />
    </button>
  );
}

export default function WisdomForm() {
  const { id }   = useParams();
  const navigate = useNavigate();
  const isEdit   = Boolean(id);
  const heroRef  = useRef(null);

  const [form,        setForm]        = useState(EMPTY);
  const [items,       setItems]       = useState([]);
  const [heroUrl,     setHeroUrl]     = useState('');
  const [heroFile,    setHeroFile]    = useState(null);
  const [heroPreview, setHeroPreview] = useState('');
  const [removeHero,  setRemoveHero]  = useState(false);
  const [loading,     setLoading]     = useState(isEdit);
  const [saving,      setSaving]      = useState(false);

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const { data: p } = await wisdomFetch(`/api/wisdom/admin/${id}`);
        setForm({
          title: p.title ?? '', slug: p.slug ?? '', menuLabel: p.menuLabel ?? '', eyebrow: p.eyebrow ?? '',
          layout: p.layout ?? 'spaces', tagline: p.tagline ?? '', intro: p.intro ?? '',
          footnoteTitle: p.footnoteTitle ?? '', footnote: p.footnote ?? '', closingText: p.closingText ?? '',
          metaTitle: p.metaTitle ?? '', metaDescription: p.metaDescription ?? '',
          order: String(p.order ?? 0), isActive: p.isActive ?? true,
        });
        setItems((p.items || []).map((i) => ({
          ...EMPTY_ITEM, ...i,
          keywords: (i.keywords || []).join(', '),
          crystals: (i.crystals || []).join(', '),
        })));
        setHeroUrl(p.heroImage?.url || '');
      } catch (err) {
        toast.error(err.message || 'Failed to load page');
        navigate('/wisdom-admin');
      } finally { setLoading(false); }
    })();
  }, [id, isEdit, navigate]);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const updateItem = (idx, patch) => setItems((arr) => arr.map((it, i) => (i === idx ? { ...it, ...patch } : it)));
  const removeItem = (idx) => setItems((arr) => arr.filter((_, i) => i !== idx));
  const moveItem   = (idx, dir) => setItems((arr) => {
    const j = idx + dir;
    if (j < 0 || j >= arr.length) return arr;
    const next = [...arr];
    [next[idx], next[j]] = [next[j], next[idx]];
    return next;
  });

  const pickHero = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setHeroFile(f); setHeroPreview(URL.createObjectURL(f)); setRemoveHero(false);
    e.target.value = '';
  };
  const clearHero = () => { setHeroFile(null); setHeroPreview(''); setRemoveHero(true); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required'); return; }

    setSaving(true);
    try {
      const fd = new FormData();
      ['title', 'menuLabel', 'eyebrow', 'layout', 'tagline', 'intro', 'footnoteTitle', 'footnote',
        'closingText', 'metaTitle', 'metaDescription', 'order'].forEach((k) => fd.append(k, form[k] ?? ''));
      if (!isEdit) fd.append('slug', form.slug.trim() || autoSlug(form.title));
      fd.append('isActive', String(form.isActive));
      fd.append('items', JSON.stringify(items.filter((i) => i.title.trim())));
      if (heroFile) fd.append('heroImage', heroFile);
      if (removeHero && !heroFile) fd.append('removeHeroImage', 'true');

      await wisdomFetch(isEdit ? `/api/wisdom/${id}` : '/api/wisdom', { method: isEdit ? 'PUT' : 'POST', body: fd });
      toast.success(isEdit ? 'Page updated' : 'Page created');
      navigate('/wisdom-admin');
    } catch (err) {
      toast.error(err.message || 'Save failed');
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 12, color: '#9b82c4' }}>
        <Spinner size={28} /><span>Loading page…</span>
      </div>
    );
  }

  const fields     = ITEM_FIELDS[form.layout] || [];
  const heroShown  = heroPreview || (removeHero ? '' : heroUrl);

  return (
    <form onSubmit={handleSubmit} noValidate className={styles.root}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{isEdit ? 'Edit page' : 'Add page'}</h1>
          <p className={styles.pageSubtitle}>{isEdit ? `Editing: ${form.title}` : 'Crystal Wisdom page'}</p>
        </div>
        <div className={styles.pageActions}>
          <button type="button" className={styles.btn} onClick={() => navigate('/wisdom-admin')}>Cancel</button>
          <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`} disabled={saving}>
            {saving && <Spinner size={14} />}
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create page'}
          </button>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.main}>

          <div className={styles.card}>
            <div className={styles.cardHeader}>Page content</div>
            <div className={styles.grid2}>
              <div className={styles.formGroup}>
                <label>Title *</label>
                <input value={form.title} onChange={set('title')} placeholder="Chakra Connection" />
              </div>
              <div className={styles.formGroup}>
                <label>Menu label</label>
                <input value={form.menuLabel} onChange={set('menuLabel')} placeholder="Chakra Connection" />
              </div>
              <div className={styles.formGroup}>
                <label>Small heading above title</label>
                <input value={form.eyebrow} onChange={set('eyebrow')} placeholder="CRYSTAL WISDOM" />
              </div>
              <div className={styles.formGroup}>
                <label>Layout</label>
                <select value={form.layout} onChange={set('layout')}>
                  {LAYOUTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </div>
              <div className={`${styles.formGroup} ${styles.fullCol}`}>
                <label>Tagline</label>
                <input value={form.tagline} onChange={set('tagline')} placeholder="Seven energy centres. Seven paths to balance" />
              </div>
              <div className={`${styles.formGroup} ${styles.fullCol}`}>
                <label>Introduction</label>
                <textarea rows={6} value={form.intro} onChange={set('intro')} placeholder="Intro text…" />
                <span className={styles.hint}>Leave a blank line between paragraphs.</span>
              </div>
              {!isEdit && (
                <div className={styles.formGroup}>
                  <label>Slug (URL)</label>
                  <input value={form.slug} onChange={set('slug')} placeholder="auto from title" />
                  <span className={styles.hint}>Cannot be changed after saving, because menu links use it.</span>
                </div>
              )}
            </div>
          </div>

          {fields.length > 0 && (
            <div className={styles.card}>
              <div className={styles.cardHeader}>Cards</div>
              {items.map((it, i) => (
                <div key={i} className={styles.arrayRow}>
                  <div className={styles.stackFields}>
                    {fields.map(([key, label, ph, kind]) => (
                      <div key={key} className={styles.formGroup}>
                        <label>{label}</label>
                        {kind === 'area' ? (
                          <textarea rows={2} placeholder={ph} value={it[key]} onChange={(e) => updateItem(i, { [key]: e.target.value })} />
                        ) : kind === 'color' ? (
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input type="color" value={it[key] || '#7B4BA0'} onChange={(e) => updateItem(i, { [key]: e.target.value })}
                              style={{ width: 44, height: 36, padding: 2, border: '1px solid #e8e0f0', borderRadius: 4, cursor: 'pointer' }} />
                            <input style={{ flex: 1 }} placeholder={ph} value={it[key]} onChange={(e) => updateItem(i, { [key]: e.target.value })} />
                          </div>
                        ) : (
                          <input placeholder={ph} value={it[key]} onChange={(e) => updateItem(i, { [key]: e.target.value })} />
                        )}
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <button type="button" className={styles.removeBtn} onClick={() => moveItem(i, -1)} disabled={i === 0} title="Move up">↑</button>
                    <button type="button" className={styles.removeBtn} onClick={() => moveItem(i, 1)} disabled={i === items.length - 1} title="Move down">↓</button>
                    <button type="button" className={styles.removeBtn} onClick={() => removeItem(i)} title="Remove">✕</button>
                  </div>
                </div>
              ))}
              <button type="button" className={styles.addRowBtn} onClick={() => setItems((a) => [...a, { ...EMPTY_ITEM }])}>+ Add card</button>
            </div>
          )}

          <div className={styles.card}>
            <div className={styles.cardHeader}>Closing section</div>
            <div className={styles.stack}>
              <div className={styles.formGroup}>
                <label>Closing lines</label>
                <textarea rows={3} value={form.closingText} onChange={set('closingText')} placeholder="Nature creates the crystal…" />
                <span className={styles.hint}>Each line break shows as a new line.</span>
              </div>
              <div className={styles.formGroup}>
                <label>Note heading</label>
                <input value={form.footnoteTitle} onChange={set('footnoteTitle')} placeholder="A Gentle Reminder" />
              </div>
              <div className={styles.formGroup}>
                <label>Note text</label>
                <textarea rows={3} value={form.footnote} onChange={set('footnote')} />
              </div>
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>SEO</div>
            <div className={styles.stack}>
              <div className={styles.formGroup}>
                <label>Meta title</label>
                <input value={form.metaTitle} onChange={set('metaTitle')} />
              </div>
              <div className={styles.formGroup}>
                <label>Meta description</label>
                <textarea rows={2} value={form.metaDescription} onChange={set('metaDescription')} />
              </div>
            </div>
          </div>
        </div>

        <div className={styles.sidebar}>
          <div className={styles.card}>
            <div className={styles.cardHeader}>Visibility</div>
            <div className={styles.toggleList}>
              <div className={styles.toggleRow}>
                <span className={styles.toggleLabel}>Published (visible on site)</span>
                <Toggle checked={form.isActive} onChange={(v) => setForm((f) => ({ ...f, isActive: v }))} />
              </div>
            </div>
            <div className={styles.formGroup} style={{ marginTop: 12 }}>
              <label>Menu order</label>
              <input type="number" min="0" value={form.order} onChange={set('order')} />
            </div>
          </div>

          <div className={styles.card}>
            <div className={styles.cardHeader}>Hero image</div>
            <p className={styles.hint} style={{ marginBottom: 10 }}>Shown at the top of the page. Optional.</p>
            {heroShown && (
              <div style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', marginBottom: 10 }}>
                <img src={heroShown} alt="Hero" style={{ width: '100%', display: 'block' }} />
                <button type="button" onClick={clearHero}
                  style={{ position: 'absolute', top: 8, right: 8, background: 'rgba(220,50,50,0.9)', border: 'none',
                    borderRadius: 4, color: '#fff', cursor: 'pointer', fontSize: 11, padding: '3px 9px' }}>Remove</button>
              </div>
            )}
            <div className={styles.uploadZone} onClick={() => heroRef.current?.click()}>
              <span>{heroShown ? 'Click to replace image' : 'Click to upload image'}</span>
              <span className={styles.uploadHint}>JPG / PNG / WebP</span>
            </div>
            <input ref={heroRef} type="file" accept="image/*" onChange={pickHero} style={{ display: 'none' }} />
          </div>
        </div>
      </div>
    </form>
  );
}
