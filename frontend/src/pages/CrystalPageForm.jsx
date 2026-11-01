import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Spinner, Toggle } from '../components/ui';
import {
  fetchCrystalPageById, createCrystalPage, updateCrystalPage, imgSrc,
} from '../api/crystalPages';
import styles from './CrystalPageForm.module.css';

// ── Section types (match the PDF structure) ──────────────────────────────────
const SECTION_TYPES = [
  { value: 'text',   label: 'Text',          hint: 'Heading + paragraphs (e.g. "Formed by nature. Shaped by time.")' },
  { value: 'cards',  label: 'Cards grid',    hint: 'Grid of cards (zodiac signs, spaces, care tips, crystals)' },
  { value: 'list',   label: 'Stacked list',  hint: 'Full-width rows with accent colour (chakras)' },
  { value: 'quote',  label: 'Closing lines', hint: 'Centred italic lines ("Created by the Earth. Chosen by you.")' },
  { value: 'notice', label: 'Notice box',    hint: 'Highlighted note (e.g. "A Gentle Reminder")' },
];
const usesItems = (t) => t === 'cards' || t === 'list';
const usesBody  = (t) => t === 'text' || t === 'notice';
const usesLines = (t) => t === 'quote' || t === 'notice';

const blankItem = () => ({
  title: '', subtitle: '', tagline: '', description: '',
  chipsLabel: '', chipsText: '', details: [], note: '', icon: '', color: '',
  imageUrl: '', publicId: '', _file: null, _preview: '', _open: true,
});
const blankSection = (type) => ({
  type, eyebrow: '', heading: '', body: '', linesText: '',
  items: usesItems(type) ? [blankItem()] : [], _open: true,
});

const EMPTY = {
  title: '', slug: '', eyebrow: '', intro: '',
  menuLabel: '', menuSubtitle: '', showInMenu: true,
  color: '#7B4BA0', isActive: true, order: '0',
  metaTitle: '', metaDescription: '',
};

const autoSlug = (t) =>
  t.toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-');

const move = (arr, i, dir) => {
  const j = i + dir;
  if (j < 0 || j >= arr.length) return arr;
  const copy = [...arr];
  [copy[i], copy[j]] = [copy[j], copy[i]];
  return copy;
};

// server → editable state
const fromServerSection = (s) => ({
  type: s.type || 'text',
  eyebrow: s.eyebrow || '', heading: s.heading || '', body: s.body || '',
  linesText: (s.lines || []).join('\n'),
  items: (s.items || []).map((it) => ({
    ...blankItem(), ...it,
    chipsText: (it.chips || []).join(', '),
    details: it.details || [],
    _open: false,
  })),
  _open: false,
});

export default function CrystalPageForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm]         = useState(EMPTY);
  const [sections, setSections] = useState([]);
  const [heroFile, setHeroFile] = useState(null);
  const [heroPreview, setHeroPreview] = useState('');
  const [heroUrl, setHeroUrl]   = useState('');
  const [removeHero, setRemoveHero] = useState(false);
  const [loading, setLoading]   = useState(isEdit);
  const [saving, setSaving]     = useState(false);

  // ── Load (edit) ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        const { data } = await fetchCrystalPageById(id);
        const p = data.data;
        setForm({
          title: p.title ?? '', slug: p.slug ?? '', eyebrow: p.eyebrow ?? '', intro: p.intro ?? '',
          menuLabel: p.menuLabel ?? '', menuSubtitle: p.menuSubtitle ?? '', showInMenu: p.showInMenu ?? true,
          color: p.color ?? '#7B4BA0', isActive: p.isActive ?? true, order: String(p.order ?? 0),
          metaTitle: p.metaTitle ?? '', metaDescription: p.metaDescription ?? '',
        });
        setHeroUrl(p.heroImageUrl || '');
        setSections((p.sections || []).map(fromServerSection));
      } catch {
        toast.error('Failed to load page');
        navigate('/crystal-pages');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit, navigate]);

  // ── Field helpers ───────────────────────────────────────────────────────────
  const set = (key) => (e) =>
    setForm((f) => {
      const next = { ...f, [key]: e.target.value };
      if (key === 'title' && !isEdit) next.slug = autoSlug(e.target.value);
      return next;
    });
  const setVal = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const patchSection = (si, patch) =>
    setSections((arr) => arr.map((s, i) => (i === si ? { ...s, ...patch } : s)));
  const patchItem = (si, ii, patch) =>
    setSections((arr) => arr.map((s, i) => i !== si ? s : {
      ...s, items: s.items.map((it, j) => (j === ii ? { ...it, ...patch } : it)),
    }));

  const changeType = (si, type) =>
    setSections((arr) => arr.map((s, i) => i !== si ? s : {
      ...s, type,
      items: usesItems(type) && s.items.length === 0 ? [blankItem()] : s.items,
    }));

  const pickItemImage = (si, ii, file) => {
    if (!file) return;
    patchItem(si, ii, { _file: file, _preview: URL.createObjectURL(file) });
  };

  // ── Submit ──────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Page title is required'); return; }
    if (!form.slug.trim())  { toast.error('Slug is required'); return; }

    setSaving(true);
    try {
      const fd = new FormData();
      ['title','slug','eyebrow','intro','menuLabel','menuSubtitle','color','order','metaTitle','metaDescription']
        .forEach((k) => fd.append(k, form[k] ?? ''));
      fd.append('isActive', String(form.isActive));
      fd.append('showInMenu', String(form.showInMenu));

      // sections → clean JSON + image files with matching keys
      const keys = [];
      const payload = sections.map((s, si) => ({
        type: s.type, eyebrow: s.eyebrow, heading: s.heading, body: s.body,
        lines: s.linesText.split('\n').map((l) => l.trim()).filter(Boolean),
        items: usesItems(s.type)
          ? s.items.map((it, ii) => {
              if (it._file) { fd.append('itemImages', it._file); keys.push(`${si}.${ii}`); }
              return {
                title: it.title, subtitle: it.subtitle, tagline: it.tagline, description: it.description,
                chipsLabel: it.chipsLabel,
                chips: it.chipsText.split(',').map((c) => c.trim()).filter(Boolean),
                details: (it.details || []).filter((d) => d.label?.trim() || d.value?.trim()),
                note: it.note, icon: it.icon, color: it.color,
                imageUrl: it.imageUrl, publicId: it.publicId,
              };
            })
          : [],
      }));
      fd.append('sections', JSON.stringify(payload));
      fd.append('itemImageKeys', JSON.stringify(keys));

      if (heroFile)   fd.append('heroImage', heroFile);
      if (removeHero && !heroFile) fd.append('removeHero', 'true');

      if (isEdit) await updateCrystalPage(id, fd);
      else        await createCrystalPage(fd);

      toast.success(isEdit ? 'Page updated!' : 'Page created!');
      navigate('/crystal-pages');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}><Spinner size={28} /><span>Loading page…</span></div>
    );
  }

  const heroShown = heroPreview || (!removeHero && heroUrl ? imgSrc(heroUrl) : '');

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} noValidate className={styles.root}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>{isEdit ? `Edit: ${form.title || 'page'}` : 'New Crystal Wisdom page'}</h1>
          <p className={styles.pageSubtitle}>
            Public URL: /crystal-wisdom{form.slug && form.slug !== 'crystal-wisdom' ? `/${form.slug}` : ''}
          </p>
        </div>
        <div className={styles.pageActions}>
          <button type="button" className={styles.btnGhost} onClick={() => navigate('/crystal-pages')}>Cancel</button>
          <button type="submit" className={styles.btnPrimary} disabled={saving}>
            {saving ? <Spinner size={14} /> : isEdit ? 'Save changes' : 'Create page'}
          </button>
        </div>
      </div>

      <div className={styles.body}>
        {/* ── Page details ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Page details</h2>
          <div className={styles.grid2}>
            <label className={styles.field}><span>Title *</span>
              <input value={form.title} onChange={set('title')} placeholder="Chakra Connection" />
            </label>
            <label className={styles.field}><span>Slug *</span>
              <input value={form.slug} onChange={set('slug')} placeholder="chakra-connection" />
            </label>
            <label className={styles.field}><span>Eyebrow (small label)</span>
              <input value={form.eyebrow} onChange={set('eyebrow')} placeholder="Chakra Connection" />
            </label>
            <label className={styles.field}><span>Display order</span>
              <input type="number" value={form.order} onChange={set('order')} />
            </label>
          </div>
          <label className={styles.field}><span>Intro (lead text under the title)</span>
            <textarea rows={3} value={form.intro} onChange={set('intro')}
              placeholder="Seven energy centres. Seven paths to balance" />
          </label>
          <div className={styles.row}>
            <label className={styles.field} style={{ maxWidth: 160 }}><span>Accent colour</span>
              <input type="color" value={form.color} onChange={set('color')} className={styles.colorInput} />
            </label>
            <div className={styles.toggleRow}>
              <Toggle checked={form.isActive} onChange={(v) => setVal('isActive', v)} />
              <span>{form.isActive ? 'Published' : 'Draft (hidden)'}</span>
            </div>
          </div>
        </section>

        {/* ── Menu ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Menu — Crystal Wisdom ›</h2>
          <div className={styles.toggleRow}>
            <Toggle checked={form.showInMenu} onChange={(v) => setVal('showInMenu', v)} />
            <span>Show this page in the Crystal Wisdom dropdown</span>
          </div>
          <div className={styles.grid2}>
            <label className={styles.field}><span>Menu label</span>
              <input value={form.menuLabel} onChange={set('menuLabel')} placeholder="Defaults to the title" />
            </label>
            <label className={styles.field}><span>Menu sub-text</span>
              <input value={form.menuSubtitle} onChange={set('menuSubtitle')} placeholder="Seven energy centres" />
            </label>
          </div>
        </section>

        {/* ── Hero image ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>Hero image</h2>
          <div className={styles.heroRow}>
            <div className={styles.heroPreview} style={{ background: form.color }}>
              {heroShown ? <img src={heroShown} alt="" /> : <span>No image</span>}
            </div>
            <div className={styles.heroActions}>
              <label className={styles.btnGhost}>
                {heroShown ? 'Replace image' : 'Upload image'}
                <input type="file" accept="image/*" hidden onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) { setHeroFile(f); setHeroPreview(URL.createObjectURL(f)); setRemoveHero(false); }
                  e.target.value = '';
                }} />
              </label>
              {heroShown && (
                <button type="button" className={styles.btnDanger} onClick={() => {
                  setHeroFile(null); setHeroPreview(''); setRemoveHero(true);
                }}>Remove</button>
              )}
              <p className={styles.hint}>Optional. Used as the banner behind the page title.</p>
            </div>
          </div>
        </section>

        {/* ── Sections builder ── */}
        <section className={styles.card}>
          <div className={styles.cardHead}>
            <h2 className={styles.cardTitle}>Page content</h2>
            <span className={styles.hint}>{sections.length} section{sections.length !== 1 ? 's' : ''}</span>
          </div>

          {sections.length === 0 && (
            <p className={styles.empty}>No sections yet — add a block below to build the page.</p>
          )}

          {sections.map((s, si) => (
            <div key={si} className={styles.sectionBox}>
              <div className={styles.sectionHead}>
                <button type="button" className={styles.collapseBtn}
                  onClick={() => patchSection(si, { _open: !s._open })}>
                  {s._open ? '▾' : '▸'}
                </button>
                <span className={styles.sectionBadge}>{SECTION_TYPES.find((t) => t.value === s.type)?.label}</span>
                <span className={styles.sectionName}>{s.heading || s.eyebrow || '(untitled section)'}</span>
                {usesItems(s.type) && <span className={styles.hint}>{s.items.length} item{s.items.length !== 1 ? 's' : ''}</span>}
                <span className={styles.spacer} />
                <button type="button" className={styles.iconBtn} title="Move up"
                  onClick={() => setSections((a) => move(a, si, -1))}>↑</button>
                <button type="button" className={styles.iconBtn} title="Move down"
                  onClick={() => setSections((a) => move(a, si, 1))}>↓</button>
                <button type="button" className={`${styles.iconBtn} ${styles.iconDanger}`} title="Delete section"
                  onClick={() => window.confirm('Delete this section?') && setSections((a) => a.filter((_, i) => i !== si))}>✕</button>
              </div>

              {s._open && (
                <div className={styles.sectionBody}>
                  <div className={styles.grid2}>
                    <label className={styles.field}><span>Block type</span>
                      <select value={s.type} onChange={(e) => changeType(si, e.target.value)}>
                        {SECTION_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                      <small className={styles.hint}>{SECTION_TYPES.find((t) => t.value === s.type)?.hint}</small>
                    </label>
                    <label className={styles.field}><span>Small label (optional)</span>
                      <input value={s.eyebrow} onChange={(e) => patchSection(si, { eyebrow: e.target.value })} />
                    </label>
                  </div>
                  <label className={styles.field}><span>Heading (optional)</span>
                    <input value={s.heading} onChange={(e) => patchSection(si, { heading: e.target.value })} />
                  </label>
                  {usesBody(s.type) && (
                    <label className={styles.field}><span>Text (leave a blank line between paragraphs)</span>
                      <textarea rows={6} value={s.body} onChange={(e) => patchSection(si, { body: e.target.value })} />
                    </label>
                  )}
                  {usesLines(s.type) && (
                    <label className={styles.field}><span>Closing lines (one per line)</span>
                      <textarea rows={3} value={s.linesText}
                        placeholder={'Created by the Earth.\nChosen by you.'}
                        onChange={(e) => patchSection(si, { linesText: e.target.value })} />
                    </label>
                  )}

                  {usesItems(s.type) && (
                    <div className={styles.items}>
                      {s.items.map((it, ii) => (
                        <div key={ii} className={styles.itemBox}>
                          <div className={styles.itemHead}>
                            <button type="button" className={styles.collapseBtn}
                              onClick={() => patchItem(si, ii, { _open: !it._open })}>{it._open ? '▾' : '▸'}</button>
                            <span className={styles.itemName}>{it.icon} {it.title || '(untitled item)'}</span>
                            <span className={styles.spacer} />
                            <button type="button" className={styles.iconBtn} title="Move up"
                              onClick={() => patchSection(si, { items: move(s.items, ii, -1) })}>↑</button>
                            <button type="button" className={styles.iconBtn} title="Move down"
                              onClick={() => patchSection(si, { items: move(s.items, ii, 1) })}>↓</button>
                            <button type="button" className={styles.iconBtn} title="Duplicate"
                              onClick={() => patchSection(si, {
                                items: [...s.items.slice(0, ii + 1), { ...it, _file: null, _preview: '', publicId: '', imageUrl: it.imageUrl }, ...s.items.slice(ii + 1)],
                              })}>⧉</button>
                            <button type="button" className={`${styles.iconBtn} ${styles.iconDanger}`} title="Delete item"
                              onClick={() => patchSection(si, { items: s.items.filter((_, j) => j !== ii) })}>✕</button>
                          </div>

                          {it._open && (
                            <div className={styles.itemBody}>
                              <div className={styles.grid3}>
                                <label className={styles.field}><span>Title</span>
                                  <input value={it.title} onChange={(e) => patchItem(si, ii, { title: e.target.value })}
                                    placeholder="ROOT — MULADHARA / ARIES / Amethyst" />
                                </label>
                                <label className={styles.field}><span>Sub-title</span>
                                  <input value={it.subtitle} onChange={(e) => patchItem(si, ii, { subtitle: e.target.value })}
                                    placeholder="March 21–April 19" />
                                </label>
                                <label className={styles.field}><span>Tagline</span>
                                  <input value={it.tagline} onChange={(e) => patchItem(si, ii, { tagline: e.target.value })}
                                    placeholder="Ground • Protect • Belong" />
                                </label>
                              </div>
                              <label className={styles.field}><span>Description</span>
                                <textarea rows={3} value={it.description}
                                  onChange={(e) => patchItem(si, ii, { description: e.target.value })} />
                              </label>
                              <div className={styles.grid3}>
                                <label className={styles.field}><span>Chips label</span>
                                  <input value={it.chipsLabel} onChange={(e) => patchItem(si, ii, { chipsLabel: e.target.value })}
                                    placeholder="Commonly associated crystals" />
                                </label>
                                <label className={styles.field} style={{ gridColumn: 'span 2' }}><span>Chips (comma separated)</span>
                                  <input value={it.chipsText} onChange={(e) => patchItem(si, ii, { chipsText: e.target.value })}
                                    placeholder="Black Tourmaline, Red Jasper, Smoky Quartz" />
                                </label>
                              </div>

                              <div className={styles.field}>
                                <span>Detail rows (label → value)</span>
                                {(it.details || []).map((d, di) => (
                                  <div key={di} className={styles.detailRow}>
                                    <input value={d.label} placeholder="Natural identity"
                                      onChange={(e) => patchItem(si, ii, { details: it.details.map((x, k) => k === di ? { ...x, label: e.target.value } : x) })} />
                                    <input value={d.value} placeholder="A purple variety of quartz."
                                      onChange={(e) => patchItem(si, ii, { details: it.details.map((x, k) => k === di ? { ...x, value: e.target.value } : x) })} />
                                    <button type="button" className={`${styles.iconBtn} ${styles.iconDanger}`}
                                      onClick={() => patchItem(si, ii, { details: it.details.filter((_, k) => k !== di) })}>✕</button>
                                  </div>
                                ))}
                                <button type="button" className={styles.addLink}
                                  onClick={() => patchItem(si, ii, { details: [...(it.details || []), { label: '', value: '' }] })}>
                                  + Add detail row
                                </button>
                              </div>

                              <div className={styles.grid3}>
                                <label className={styles.field}><span>Note (small caution line)</span>
                                  <input value={it.note} onChange={(e) => patchItem(si, ii, { note: e.target.value })}
                                    placeholder="Keep pyrite dry…" />
                                </label>
                                <label className={styles.field}><span>Icon / emoji</span>
                                  <input value={it.icon} onChange={(e) => patchItem(si, ii, { icon: e.target.value })} placeholder="🌙" />
                                </label>
                                <label className={styles.field}><span>Accent colour</span>
                                  <div className={styles.colorRow}>
                                    <input type="color" value={it.color || '#7B4BA0'} className={styles.colorInput}
                                      onChange={(e) => patchItem(si, ii, { color: e.target.value })} />
                                    {it.color && (
                                      <button type="button" className={styles.addLink}
                                        onClick={() => patchItem(si, ii, { color: '' })}>clear</button>
                                    )}
                                  </div>
                                </label>
                              </div>

                              <div className={styles.field}>
                                <span>Image (optional)</span>
                                <div className={styles.itemImageRow}>
                                  {(it._preview || it.imageUrl) && (
                                    <img className={styles.itemThumb} src={it._preview || imgSrc(it.imageUrl)} alt="" />
                                  )}
                                  <label className={styles.btnGhost}>
                                    {(it._preview || it.imageUrl) ? 'Replace' : 'Upload'}
                                    <input type="file" accept="image/*" hidden onChange={(e) => {
                                      pickItemImage(si, ii, e.target.files?.[0]); e.target.value = '';
                                    }} />
                                  </label>
                                  {(it._preview || it.imageUrl) && (
                                    <button type="button" className={styles.btnDanger}
                                      onClick={() => patchItem(si, ii, { _file: null, _preview: '', imageUrl: '', publicId: '' })}>
                                      Remove
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                      <button type="button" className={styles.addItem}
                        onClick={() => patchSection(si, { items: [...s.items, blankItem()] })}>
                        + Add {s.type === 'list' ? 'row' : 'card'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          <div className={styles.addBar}>
            <span>Add block:</span>
            {SECTION_TYPES.map((t) => (
              <button key={t.value} type="button" className={styles.addBlock} title={t.hint}
                onClick={() => setSections((a) => [...a, blankSection(t.value)])}>
                + {t.label}
              </button>
            ))}
          </div>
        </section>

        {/* ── SEO ── */}
        <section className={styles.card}>
          <h2 className={styles.cardTitle}>SEO</h2>
          <label className={styles.field}><span>Meta title</span>
            <input value={form.metaTitle} onChange={set('metaTitle')} placeholder="Chakra Connection | Empavai" />
          </label>
          <label className={styles.field}><span>Meta description</span>
            <textarea rows={2} value={form.metaDescription} onChange={set('metaDescription')} />
          </label>
        </section>
      </div>
    </form>
  );
}
