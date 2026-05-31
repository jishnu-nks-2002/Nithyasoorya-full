import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchProductsAdmin, deleteProduct, reorderProducts } from '../api/products';
import { Card, Button, Badge, PageHeader, EmptyState, Spinner } from '../components/ui';
import './Products.css';

const AVAIL_COLOR = { Available: 'success', Inquire: 'warning', 'Sold Out': 'danger' };

const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'http://localhost:5000';

export default function Products() {
  const navigate = useNavigate();
  const [items,      setItems]      = useState([]);
  const [categories, setCategories] = useState([]);   // dynamic from API
  const [loading,    setLoading]    = useState(true);
  const [tab,        setTab]        = useState('all');
  const [search,     setSearch]     = useState('');
  const [deleting,   setDeleting]   = useState(null);
  const [dragging,   setDragging]   = useState(null);
  const [dragOver,   setDragOver]   = useState(null);

  // ── Fetch categories once on mount ────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API_BASE}/api/categories`);
        const data = await res.json();
        if (data.success) setCategories(data.data || []);
      } catch {
        toast.error('Failed to load categories');
      }
    })();
  }, []);

  // ── Fetch products whenever tab / search changes ───────────────────────────
  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (tab !== 'all') params.category = tab;
      if (search)        params.search   = search;
      const res = await fetchProductsAdmin(params);
      setItems(res.data.data);
    } catch { toast.error('Failed to load products'); }
    finally  { setLoading(false); }
  }, [tab, search]);

  useEffect(() => { load(); }, [load]);

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await deleteProduct(id);
      setItems((p) => p.filter((i) => i._id !== id));
      toast.success('Product deleted');
    } catch { toast.error('Delete failed'); }
    finally { setDeleting(null); }
  };

  // ── Drag-to-reorder ───────────────────────────────────────────────────────
  const onDragStart = (e, idx) => { setDragging(idx); e.dataTransfer.effectAllowed = 'move'; };
  const onDragOver  = (e, idx) => { e.preventDefault(); setDragOver(idx); };
  const onDrop      = async (e, targetIdx) => {
    e.preventDefault();
    if (dragging === null || dragging === targetIdx) { setDragging(null); setDragOver(null); return; }
    const reordered = [...items];
    const [moved] = reordered.splice(dragging, 1);
    reordered.splice(targetIdx, 0, moved);
    setItems(reordered);
    setDragging(null); setDragOver(null);
    try {
      await reorderProducts(reordered.map((i) => i._id));
      toast.success('Order saved');
    } catch { toast.error('Reorder failed'); load(); }
  };

  // ── Tab counts ────────────────────────────────────────────────────────────
  const countFor = (catName) =>
    catName === 'all'
      ? items.length
      : items.filter((i) => i.category === catName).length;

  // All tab labels: "all" + every category name
  const tabs = ['all', ...categories.map((c) => c.name)];

  return (
    <div>
      <PageHeader title="Products" subtitle="Manage your product catalogue">
        <Button variant="primary" onClick={() => navigate('/products/new')}>
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3v10M3 8h10"/>
          </svg>
          Add product
        </Button>
      </PageHeader>

      {/* ── Dynamic category tabs ── */}
      <div className="tabBar">
        {tabs.map((t) => (
          <button
            key={t}
            className={`tab ${tab === t ? 'tabActive' : ''}`}
            onClick={() => setTab(t)}
          >
            {t === 'all' ? 'All' : t}
            <span className="tabCount">{countFor(t)}</span>
          </button>
        ))}
      </div>

      {/* ── Search ── */}
      <div className="searchBar">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
          style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-hint)' }}>
          <circle cx="6.5" cy="6.5" r="5"/><path d="M10.5 10.5l3 3"/>
        </svg>
        <input
          style={{ paddingLeft: 32 }}
          placeholder="Search by name, series, material…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="loadingWrap"><Spinner size={26}/><span>Loading…</span></div>
      ) : items.length === 0 ? (
        <Card>
          <EmptyState
            icon="📦"
            title="No products yet"
            subtitle="Add your first product to get started."
            action={<Button variant="primary" onClick={() => navigate('/products/new')}>Add product</Button>}
          />
        </Card>
      ) : (
        <div className="table">
          <div className="tableHead">
            <span style={{ width: 48 }}></span>
            <span style={{ flex: 2 }}>Name</span>
            <span style={{ width: 120 }}>Category</span>
            <span style={{ width: 130 }}>Series</span>
            <span style={{ width: 80 }}>Price</span>
            <span style={{ width: 90 }}>Availability</span>
            <span style={{ width: 70 }}>Status</span>
            <span style={{ width: 130 }}>Actions</span>
          </div>

          {items.map((item, idx) => (
            <div
              key={item._id}
              className={`tableRow ${dragOver === idx ? 'dragOver' : ''} ${dragging === idx ? 'dragging' : ''}`}
              draggable
              onDragStart={(e) => onDragStart(e, idx)}
              onDragOver={(e)  => onDragOver(e, idx)}
              onDrop={(e)      => onDrop(e, idx)}
              onDragEnd={() => { setDragging(null); setDragOver(null); }}
            >
              {/* Drag handle + thumbnail */}
              <div className="thumbCol">
                <div className="dragHandle" title="Drag to reorder">
                  <svg width="10" height="10" viewBox="0 0 10 12" fill="currentColor">
                    <circle cx="3" cy="2" r="1"/><circle cx="7" cy="2" r="1"/>
                    <circle cx="3" cy="6" r="1"/><circle cx="7" cy="6" r="1"/>
                    <circle cx="3" cy="10" r="1"/><circle cx="7" cy="10" r="1"/>
                  </svg>
                </div>
                <div className="thumb">
                  {item.images?.[0]?.url
                    ? <img src={item.images.find(i => i.isPrimary)?.url || item.images[0].url} alt={item.name}/>
                    : <span>📷</span>}
                </div>
              </div>

              <div style={{ flex: 2, minWidth: 0 }}>
                <div className="itemName">{item.name}</div>
                <div className="itemMeta">{item.material || '—'}</div>
              </div>

              <span style={{ width: 120 }}>
                <Badge variant="info">{item.category}</Badge>
              </span>

              <span className="cellText" style={{ width: 130 }}>{item.series || '—'}</span>
              <span className="cellText" style={{ width: 80, fontWeight: 600 }}>
                {item.priceDisplay || `₹${item.price}`}
              </span>

              <span style={{ width: 90 }}>
                <Badge variant={AVAIL_COLOR[item.availability] || 'default'}>{item.availability}</Badge>
              </span>

              <span style={{ width: 70 }}>
                <Badge variant={item.isActive ? 'success' : 'warning'}>
                  {item.isActive ? 'Live' : 'Hidden'}
                </Badge>
              </span>

              <div style={{ width: 130, display: 'flex', gap: 6 }}>
                <Button size="sm" onClick={() => navigate(`/products/edit/${item._id}`)}>Edit</Button>
                <Button size="sm" variant="danger" loading={deleting === item._id}
                  onClick={() => handleDelete(item._id, item.name)}>Del</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}