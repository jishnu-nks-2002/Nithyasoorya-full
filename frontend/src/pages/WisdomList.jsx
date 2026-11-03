import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, Badge, Button, PageHeader, EmptyState, Spinner } from '../components/ui';
import styles from './WisdomList.module.css';
import { wisdomFetch } from '../api/wisdom';

const LAYOUT_LABEL = {
  hub: 'Landing', chakra: 'Chakra cards', zodiac: 'Zodiac grid', spaces: 'Space cards', care: 'Care blocks',
};
const publicPath = (p) => (p.slug === 'crystal-wisdom' ? '/crystal-wisdom' : `/crystal-wisdom/${p.slug}`);

export default function WisdomList() {
  const navigate = useNavigate();
  const [pages,    setPages]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [busy,     setBusy]     = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await wisdomFetch('/api/wisdom/admin/all');
      setPages(data.data);
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const toggle = async (p) => {
    setBusy(p._id);
    try {
      await wisdomFetch(`/api/wisdom/${p._id}`, { method: 'PUT', body: JSON.stringify({ isActive: !p.isActive }) });
      setPages((prev) => prev.map((x) => (x._id === p._id ? { ...x, isActive: !x.isActive } : x)));
      toast.success(`${p.title} ${p.isActive ? 'set to draft' : 'published'}`);
    } catch (err) { toast.error(err.message); }
    finally { setBusy(null); }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.title}"? The menu link for this page will stop working.`)) return;
    setBusy(p._id);
    try {
      await wisdomFetch(`/api/wisdom/${p._id}`, { method: 'DELETE' });
      setPages((prev) => prev.filter((x) => x._id !== p._id));
      toast.success('Page deleted');
    } catch (err) { toast.error(err.message); }
    finally { setBusy(null); }
  };

  return (
    <div>
      <PageHeader title="Crystal Wisdom" subtitle="Chakra, zodiac, spaces and care pages">
        <Button variant="primary" onClick={() => navigate('/wisdom-admin/new')}>+ Add page</Button>
      </PageHeader>

      <Card>
        {loading ? (
          <div className={styles.centerState}><Spinner size={24} /><span>Loading…</span></div>
        ) : pages.length === 0 ? (
          <EmptyState icon="🔮" title="No pages yet" subtitle="Run the seed script or add a page."
            action={<Button variant="primary" onClick={() => navigate('/wisdom-admin/new')}>Add page</Button>} />
        ) : (
          <div className={styles.list}>
            <div className={styles.listHeader}>
              <span style={{ flex: '0 0 52px' }} />
              <span style={{ flex: 1 }}>Page</span>
              <span style={{ flex: '0 0 130px' }}>Layout</span>
              <span style={{ flex: '0 0 90px' }}>Status</span>
              <span style={{ flex: '0 0 80px', textAlign: 'right' }}>Actions</span>
            </div>

            {pages.map((p) => (
              <div key={p._id} className={styles.row}>
                <div className={styles.thumb} style={{ background: p.heroImage?.url ? undefined : '#7B4BA0' }}>
                  {p.heroImage?.url
                    ? <img src={p.heroImage.url} alt={p.title} />
                    : <span className={styles.thumbInitial}>{p.title?.charAt(0) ?? '✦'}</span>}
                </div>

                <div className={styles.nameCol}>
                  <span className={styles.name}>{p.menuLabel || p.title}</span>
                  <span className={styles.subtitle}>{publicPath(p)} · {p.items?.length || 0} cards</span>
                </div>

                <div style={{ flex: '0 0 130px' }}>
                  <Badge variant="default">{LAYOUT_LABEL[p.layout] || p.layout}</Badge>
                </div>

                <div style={{ flex: '0 0 90px' }}>
                  <button
                    className={`${styles.statusToggle} ${p.isActive ? styles.statusPublished : styles.statusDraft}`}
                    onClick={() => toggle(p)} disabled={busy === p._id}
                    title={p.isActive ? 'Click to set draft' : 'Click to publish'}>
                    {p.isActive ? 'Published' : 'Draft'}
                  </button>
                </div>

                <div className={styles.actions}>
                  <button className={styles.actionBtn} onClick={() => navigate(`/wisdom-admin/${p._id}/edit`)} title="Edit">
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M11.5 1.5l3 3-9 9H2.5v-3l9-9z" />
                    </svg>
                  </button>
                  <button className={`${styles.actionBtn} ${styles.actionBtnDanger}`} onClick={() => remove(p)}
                    disabled={busy === p._id} title="Delete">
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
