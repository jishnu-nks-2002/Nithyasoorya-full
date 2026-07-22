import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Card, CardHeader, Badge, Button,
  PageHeader, EmptyState, Spinner,
} from '../components/ui';
import styles from './StonesList.module.css';

const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'http://localhost:5000';

// ── helpers ───────────────────────────────────────────────────────────────────
const apiFetch = async (url, options = {}) => {
  const token = localStorage.getItem('gh_token');
  const res   = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...options.headers },
  });
  const data = await res.json();
  if (!res.ok || !data.success) throw new Error(data.message || 'Request failed');
  return data;
};

export default function StonesList() {
  const navigate = useNavigate();

  const [stones,   setStones]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [toggling, setToggling] = useState(null);
  const [search,   setSearch]   = useState('');
  const [filter,   setFilter]   = useState('all'); // 'all' | 'published' | 'draft' | 'featured'

  // ── Fetch ────────────────────────────────────────────────────────────────
  const loadStones = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch('/api/stones?limit=200');
      setStones(data.data);
    } catch (err) {
      toast.error(err.message || 'Failed to load stones');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStones(); }, [loadStones]);

  // ── Toggle published/draft ────────────────────────────────────────────────
  const handleToggle = async (stone) => {
    setToggling(stone._id);
    try {
      await apiFetch(`/api/stones/${stone._id}/toggle`, { method: 'PATCH' });
      setStones(prev => prev.map(s =>
        s._id === stone._id ? { ...s, isActive: !s.isActive } : s
      ));
      toast.success(`${stone.name} ${stone.isActive ? 'set to draft' : 'published'}`);
    } catch (err) {
      toast.error(err.message || 'Toggle failed');
    } finally {
      setToggling(null);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (stone) => {
    if (!window.confirm(`Delete "${stone.name}"? This cannot be undone.`)) return;
    setDeleting(stone._id);
    try {
      await apiFetch(`/api/stones/${stone._id}`, { method: 'DELETE' });
      setStones(prev => prev.filter(s => s._id !== stone._id));
      toast.success(`"${stone.name}" deleted`);
    } catch (err) {
      toast.error(err.message || 'Delete failed');
    } finally {
      setDeleting(null);
    }
  };

  // ── Derived list ──────────────────────────────────────────────────────────
  const filtered = stones
    .filter(s => {
      const q = search.toLowerCase();
      if (q && !s.name.toLowerCase().includes(q) && !s.category?.toLowerCase().includes(q)) return false;
      if (filter === 'published') return s.isActive;
      if (filter === 'draft')     return !s.isActive;
      if (filter === 'featured')  return s.isFeatured;
      return true;
    })
    .sort((a, b) => a.order - b.order || new Date(b.createdAt) - new Date(a.createdAt));

  const totalActive   = stones.filter(s => s.isActive).length;
  const totalDraft    = stones.filter(s => !s.isActive).length;
  const totalFeatured = stones.filter(s => s.isFeatured).length;

  return (
    <div>
      <PageHeader
        title="Sacred Stones"
        subtitle={`${stones.length} stone${stones.length !== 1 ? 's' : ''} in your collection`}
      >
        <Button variant="primary" onClick={() => navigate('/stones-admin/new')}>
          + Add stone
        </Button>
      </PageHeader>

      {/* ── Stats strip ── */}
      <div className={styles.statsRow}>
        {[
          { label: 'Total',    value: stones.length,  color: undefined         },
          { label: 'Published',value: totalActive,    color: 'var(--success)'  },
          { label: 'Draft',    value: totalDraft,     color: 'var(--warning)'  },
          { label: 'Featured', value: totalFeatured,  color: '#7B4BA0'         },
        ].map(({ label, value, color }) => (
          <div key={label} className={styles.statCard}>
            <span className={styles.statValue} style={{ color }}>{value}</span>
            <span className={styles.statLabel}>{label}</span>
          </div>
        ))}
      </div>

      <Card>
        {/* ── Toolbar ── */}
        <div className={styles.toolbar}>
          {/* Search */}
          <div className={styles.searchWrap}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
              style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#a090bb', pointerEvents: 'none' }}>
              <circle cx="6.5" cy="6.5" r="4.5" /><path d="M10.5 10.5l3 3" strokeLinecap="round" />
            </svg>
            <input
              className={styles.searchInput}
              placeholder="Search stones…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {/* Filter tabs */}
          <div className={styles.filterTabs}>
            {['all', 'published', 'draft', 'featured'].map(f => (
              <button
                key={f}
                className={`${styles.filterTab} ${filter === f ? styles.filterTabActive : ''}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* ── List ── */}
        {loading ? (
          <div className={styles.centerState}>
            <Spinner size={24} />
            <span>Loading stones…</span>
          </div>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon="💎"
            title={search || filter !== 'all' ? 'No stones match your filter' : 'No stones yet'}
            subtitle={search || filter !== 'all' ? 'Try clearing the search or filter.' : 'Add your first sacred stone.'}
            action={
              !search && filter === 'all' && (
                <Button variant="primary" onClick={() => navigate('/stones-admin/new')}>
                  Add first stone
                </Button>
              )
            }
          />
        ) : (
          <div className={styles.list}>
            {/* Header row */}
            <div className={styles.listHeader}>
              <span style={{ flex: '0 0 52px' }} />
              <span style={{ flex: 1 }}>Name</span>
              <span style={{ flex: '0 0 130px' }}>Category</span>
              <span style={{ flex: '0 0 90px' }}>Status</span>
              <span style={{ flex: '0 0 80px', textAlign: 'right' }}>Actions</span>
            </div>

            {filtered.map(stone => {
              const primaryImg = stone.images?.find(i => i.isPrimary) ?? stone.images?.[0];
              const isDeleting = deleting === stone._id;
              const isToggling = toggling === stone._id;

              return (
                <div key={stone._id} className={styles.row}>
                  {/* Thumb */}
                  <div
                    className={styles.thumb}
                    style={{ background: primaryImg ? undefined : (stone.color || '#7B4BA0') }}
                  >
                    {primaryImg
                      ? <img src={primaryImg.url} alt={stone.name} />
                      : <span className={styles.thumbInitial}>{stone.name?.charAt(0) ?? '✦'}</span>
                    }
                  </div>

                  {/* Name + subtitle */}
                  <div className={styles.nameCol}>
                    <span className={styles.name}>{stone.name}</span>
                    {stone.subtitle && <span className={styles.subtitle}>{stone.subtitle}</span>}
                    {stone.isFeatured && (
                      <span className={styles.featuredBadge}>✦ Featured</span>
                    )}
                  </div>

                  {/* Category */}
                  <div style={{ flex: '0 0 130px' }}>
                    {stone.category
                      ? <Badge variant="default">{stone.category}</Badge>
                      : <span style={{ color: '#c4b8e0', fontSize: 12 }}>—</span>}
                  </div>

                  {/* Status toggle */}
                  <div style={{ flex: '0 0 90px' }}>
                    <button
                      className={`${styles.statusToggle} ${stone.isActive ? styles.statusPublished : styles.statusDraft}`}
                      onClick={() => handleToggle(stone)}
                      disabled={isToggling}
                      title={stone.isActive ? 'Click to set draft' : 'Click to publish'}
                    >
                      {isToggling
                        ? <Spinner size={11} />
                        : stone.isActive ? 'Published' : 'Draft'
                      }
                    </button>
                  </div>

                  {/* Actions */}
                  <div className={styles.actions}>
                    <button
                      className={styles.actionBtn}
                      onClick={() => navigate(`/stones-admin/${stone._id}/edit`)}
                      title="Edit"
                    >
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M11.5 1.5l3 3-9 9H2.5v-3l9-9z" />
                      </svg>
                    </button>
                    <button
                      className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                      onClick={() => handleDelete(stone)}
                      disabled={isDeleting}
                      title="Delete"
                    >
                      {isDeleting
                        ? <Spinner size={11} />
                        : (
                          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                            <path d="M2 4h12M5 4V2h6v2M6 7v5M10 7v5M3 4l1 10h8l1-10" strokeLinecap="round" />
                          </svg>
                        )
                      }
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer count */}
        {!loading && filtered.length > 0 && (
          <div className={styles.footer}>
            Showing {filtered.length} of {stones.length} stone{stones.length !== 1 ? 's' : ''}
          </div>
        )}
      </Card>
    </div>
  );
}