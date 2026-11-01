import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Card, Badge, Button, PageHeader, EmptyState, Spinner } from '../components/ui';
import {
  fetchCrystalPagesAdmin, toggleCrystalPage, deleteCrystalPage, imgSrc,
} from '../api/crystalPages';
import styles from './StonesList.module.css';   // same list look as the Crystals (stones) list

export default function CrystalPagesList() {
  const navigate = useNavigate();

  const [pages,    setPages]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all'); // all | published | draft | menu

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await fetchCrystalPagesAdmin();
      setPages(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to load pages');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleToggle = async (page) => {
    setToggling(page._id);
    try {
      await toggleCrystalPage(page._id);
      setPages((prev) => prev.map((p) => (p._id === page._id ? { ...p, isActive: !p.isActive } : p)));
      toast.success(`${page.title} ${page.isActive ? 'set to draft' : 'published'}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Toggle failed');
    } finally {
      setToggling(null);
    }
  };

  const handleDelete = async (page) => {
    if (!window.confirm(`Delete "${page.title}"? This cannot be undone.`)) return;
    setDeleting(page._id);
    try {
      await deleteCrystalPage(page._id);
      setPages((prev) => prev.filter((p) => p._id !== page._id));
      toast.success(`"${page.title}" deleted`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  const filtered = pages
    .filter((p) => {
      const q = search.toLowerCase();
      if (q && !p.title.toLowerCase().includes(q) && !p.slug.includes(q)) return false;
      if (filter === 'published') return p.isActive;
      if (filter === 'draft')     return !p.isActive;
      if (filter === 'menu')      return p.showInMenu;
      return true;
    })
    .sort((a, b) => a.order - b.order);

  return (
    <div>
      <PageHeader
        title="Crystal Wisdom Pages"
        subtitle={`${pages.length} page${pages.length !== 1 ? 's' : ''} · shown under Crystal Wisdom on the website`}
      >
        <Button variant="primary" onClick={() => navigate('/crystal-pages/new')}>+ Add page</Button>
      </PageHeader>

      <div className={styles.statsRow}>
        {[
          { label: 'Total',     value: pages.length },
          { label: 'Published', value: pages.filter((p) => p.isActive).length,  color: 'var(--success)' },
          { label: 'Draft',     value: pages.filter((p) => !p.isActive).length, color: 'var(--warning)' },
          { label: 'In menu',   value: pages.filter((p) => p.showInMenu && p.isActive).length, color: '#7B4BA0' },
        ].map(({ label, value, color }) => (
          <div key={label} className={styles.statCard}>
            <span className={styles.statValue} style={{ color }}>{value}</span>
            <span className={styles.statLabel}>{label}</span>
          </div>
        ))}
      </div>

      <Card>
        <div className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <input
              className={styles.searchInput}
              placeholder="Search pages…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className={styles.filterTabs}>
            {[['all', 'All'], ['published', 'Published'], ['draft', 'Draft'], ['menu', 'In menu']].map(([f, label]) => (
              <button
                key={f}
                className={`${styles.filterTab} ${filter === f ? styles.filterTabActive : ''}`}
                onClick={() => setFilter(f)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className={styles.centerState}><Spinner size={24} /><span>Loading pages…</span></div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="🔮"
            title={search || filter !== 'all' ? 'No pages match your filter' : 'No pages yet'}
            subtitle={search || filter !== 'all' ? 'Try clearing the search or filter.' : 'Create your first Crystal Wisdom page, or run npm run seed:crystal-pages.'}
            action={!search && filter === 'all' && (
              <Button variant="primary" onClick={() => navigate('/crystal-pages/new')}>Add first page</Button>
            )}
          />
        ) : (
          <div className={styles.list}>
            <div className={styles.listHeader}>
              <span style={{ flex: '0 0 52px' }} />
              <span style={{ flex: 1 }}>Page</span>
              <span style={{ flex: '0 0 150px' }}>URL</span>
              <span style={{ flex: '0 0 90px' }}>Status</span>
              <span style={{ flex: '0 0 80px', textAlign: 'right' }}>Actions</span>
            </div>

            {filtered.map((page) => (
              <div key={page._id} className={styles.row}>
                <div className={styles.thumb} style={{ background: page.heroImageUrl ? undefined : page.color || '#7B4BA0' }}>
                  {page.heroImageUrl
                    ? <img src={imgSrc(page.heroImageUrl)} alt={page.title} />
                    : <span className={styles.thumbInitial}>{page.title?.charAt(0) ?? '✦'}</span>}
                </div>

                <div className={styles.nameCol}>
                  <span className={styles.name}>{page.title}</span>
                  {page.menuSubtitle && <span className={styles.subtitle}>{page.menuSubtitle}</span>}
                  {page.showInMenu && <span className={styles.featuredBadge}>☰ In menu</span>}
                </div>

                <div style={{ flex: '0 0 150px' }}>
                  <Badge variant="default">
                    {page.slug === 'crystal-wisdom' ? '/crystal-wisdom' : `/crystal-wisdom/${page.slug}`}
                  </Badge>
                </div>

                <div style={{ flex: '0 0 90px' }}>
                  <button
                    className={`${styles.statusToggle} ${page.isActive ? styles.statusPublished : styles.statusDraft}`}
                    onClick={() => handleToggle(page)}
                    disabled={toggling === page._id}
                    title={page.isActive ? 'Click to set draft' : 'Click to publish'}
                  >
                    {toggling === page._id ? <Spinner size={11} /> : page.isActive ? 'Published' : 'Draft'}
                  </button>
                </div>

                <div className={styles.actions}>
                  <button className={styles.actionBtn} onClick={() => navigate(`/crystal-pages/${page._id}/edit`)} title="Edit">
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M11.5 1.5l3 3-9 9H2.5v-3l9-9z" />
                    </svg>
                  </button>
                  <button
                    className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                    onClick={() => handleDelete(page)}
                    disabled={deleting === page._id}
                    title="Delete"
                  >
                    {deleting === page._id ? <Spinner size={11} /> : (
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" strokeLinecap="round" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filtered.length > 0 && (
          <div className={styles.footer}>Showing {filtered.length} of {pages.length} page{pages.length !== 1 ? 's' : ''}</div>
        )}
      </Card>
    </div>
  );
}
