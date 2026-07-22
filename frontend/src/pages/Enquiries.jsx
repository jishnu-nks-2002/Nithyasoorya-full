import { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { Card, Button, Badge, PageHeader, EmptyState, Spinner } from '../components/ui';
import './Enquiries.css';

const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'http://localhost:5000';

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_BADGE = { New: 'success', Contacted: 'warning', Closed: 'default' };

const STATUS_STYLE = {
  New:       { bg: '#e8f5e9', color: '#2e7d32', border: '#a5d6a7' },
  Contacted: { bg: '#fff8e1', color: '#f57f17', border: '#ffe082' },
  Closed:    { bg: '#f3f4f6', color: '#6b7280', border: '#d1d5db' },
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

// ── Single expandable row ─────────────────────────────────────────────────────
function EnquiryRow({ item, onStatusChange, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const [updating, setUpdating] = useState(false);

  const handleStatus = async (newStatus) => {
    if (newStatus === item.status || updating) return;
    setUpdating(true);
    try {
      const token = localStorage.getItem('gh_token');
      const res   = await fetch(`${API_BASE}/api/enquiries/${item._id}/status`, {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) { onStatusChange(item._id, newStatus); toast.success(`Marked as ${newStatus}`); }
      else toast.error(data.message || 'Update failed');
    } catch { toast.error('Network error'); }
    finally { setUpdating(false); }
  };

  return (
    <>
      {/* ── Clickable summary row ── */}
      <div
        className={`tableRow enquiryRow${expanded ? ' enquiryRowOpen' : ''}`}
        onClick={() => setExpanded(v => !v)}
        style={{ cursor: 'pointer' }}
      >
        {/* Expand arrow */}
        <div style={{ width: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
            stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"
            style={{ transition: 'transform 0.2s', transform: expanded ? 'rotate(90deg)' : 'rotate(0deg)', opacity: 0.45 }}>
            <polyline points="4,2 8,6 4,10"/>
          </svg>
        </div>

        {/* Product */}
        <div style={{ flex: 2, minWidth: 0 }}>
          <div className="itemName">{item.productName}</div>
          <div className="itemMeta">{item.productCategory} · {item.productPrice}</div>
        </div>

        {/* Customer */}
        <div style={{ width: 150, minWidth: 0 }}>
          <div className="itemName" style={{ fontSize: 13 }}>{item.name}</div>
          <div className="itemMeta" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.email}</div>
        </div>

        {/* Phone */}
        <span className="cellText" style={{ width: 120 }}>{item.phone || '—'}</span>

        {/* Status */}
        <span style={{ width: 100 }}>
          <Badge variant={STATUS_BADGE[item.status] || 'default'}>{item.status}</Badge>
        </span>

        {/* Date */}
        <span className="cellText" style={{ width: 150, fontSize: 11, color: 'var(--text-hint)' }}>
          {formatDate(item.createdAt)}
        </span>
      </div>

      {/* ── Expanded detail ── */}
      {expanded && (
        <div className="enquiryDetail" onClick={e => e.stopPropagation()}>

          {/* Left: message + product link */}
          <div style={{ flex: 2, minWidth: 200 }}>
            <div className="enquiryDetailLabel">Message</div>
            <p className="enquiryDetailText">
              {item.message || <em style={{ color: 'var(--text-hint)' }}>No message provided.</em>}
            </p>
            <a href={`/product/${item.productSlug}`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 8, fontSize: 11, color: 'var(--color-accent)', textDecoration: 'none' }}>
              View product page
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3"/>
              </svg>
            </a>
          </div>

          {/* Right: status + action buttons */}
          <div style={{ flexShrink: 0 }}>
            <div className="enquiryDetailLabel">Update Status</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
              {['New', 'Contacted', 'Closed'].map(s => {
                const sc     = STATUS_STYLE[s];
                const active = item.status === s;
                return (
                  <button key={s}
                    disabled={active || updating}
                    onClick={() => handleStatus(s)}
                    style={{
                      fontSize: 9, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase',
                      padding: '5px 16px', borderRadius: 20,
                      cursor:     active || updating ? 'default' : 'pointer',
                      border:     `1px solid ${active ? sc.border : 'var(--color-border)'}`,
                      background: active ? sc.bg : 'transparent',
                      color:      active ? sc.color : 'var(--text-muted)',
                      opacity:    updating ? 0.5 : 1,
                      transition: 'all 0.18s ease',
                    }}
                  >{s}</button>
                );
              })}
            </div>

            {/* Quick action links */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {/* Email reply */}
              <a
                href={`mailto:${item.email}?subject=Re: ${encodeURIComponent(item.productName)}&body=Hi ${encodeURIComponent(item.name)},%0A%0AThank you for your enquiry about ${encodeURIComponent(item.productName)}.%0A%0A`}
                style={actionBtnStyle('#185fa5')}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                Reply by Email
              </a>

              {/* WhatsApp */}
              {item.phone && (
                <a
                  href={`https://wa.me/${item.phone.replace(/[^0-9]/g, '')}?text=Hi ${encodeURIComponent(item.name)}, thank you for your interest in ${encodeURIComponent(item.productName)}!`}
                  target="_blank" rel="noopener noreferrer"
                  style={actionBtnStyle('#25D366')}
                >
                  <svg width="11" height="11" viewBox="0 0 32 32" fill="currentColor">
                    <path d="M16 0C7.164 0 0 7.163 0 16c0 2.822.737 5.469 2.027 7.773L0 32l8.469-2.004A15.943 15.943 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0z"/>
                  </svg>
                  WhatsApp
                </a>
              )}

              {/* Delete */}
              <button onClick={() => onDelete(item._id)} style={actionBtnStyle('#ef4444', true)}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/>
                  <path d="M10 11v6M14 11v6M9 6V4h6v2"/>
                </svg>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Shared action button style helper
function actionBtnStyle(color, isButton = false) {
  return {
    display:        'inline-flex',
    alignItems:     'center',
    gap:            5,
    fontSize:       9,
    fontWeight:     700,
    letterSpacing:  '0.14em',
    textTransform:  'uppercase',
    padding:        '6px 14px',
    borderRadius:   20,
    textDecoration: 'none',
    cursor:         'pointer',
    transition:     'opacity 0.18s',
    border:         `1px solid ${color}`,
    color,
    background:     'transparent',
  };
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function Enquiries() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab,     setTab]     = useState('all');
  const [search,  setSearch]  = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const token  = localStorage.getItem('gh_token'); // ✅ FIXED: was 'token'
      const params = new URLSearchParams();
      if (tab !== 'all') params.set('status', tab);
      const res  = await fetch(`${API_BASE}/api/enquiries?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) setItems(data.data);
      else toast.error('Failed to load enquiries');
    } catch { toast.error('Network error'); }
    finally { setLoading(false); }
  }, [tab]);

  useEffect(() => { load(); }, [load]);

  const handleStatusChange = (id, newStatus) =>
    setItems(prev => prev.map(i => i._id === id ? { ...i, status: newStatus } : i));

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this enquiry? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('gh_token'); // ✅ consistent
      const res   = await fetch(`${API_BASE}/api/enquiries/${id}`, {
        method: 'DELETE', headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) { setItems(prev => prev.filter(i => i._id !== id)); toast.success('Deleted'); }
      else toast.error(data.message || 'Delete failed');
    } catch { toast.error('Network error'); }
  };

  // Local search
  const displayed = items.filter(i => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      i.name.toLowerCase().includes(q)        ||
      i.email.toLowerCase().includes(q)       ||
      i.productName.toLowerCase().includes(q) ||
      (i.phone || '').includes(q)
    );
  });

  const counts = {
    all:       items.length,
    New:       items.filter(i => i.status === 'New').length,
    Contacted: items.filter(i => i.status === 'Contacted').length,
    Closed:    items.filter(i => i.status === 'Closed').length,
  };

  const TABS = [
    { key: 'all',       label: 'All' },
    { key: 'New',       label: 'New' },
    { key: 'Contacted', label: 'Contacted' },
    { key: 'Closed',    label: 'Closed' },
  ];

  return (
    <div>
      <PageHeader title="Enquiries" subtitle="Customer product enquiries from the website">
        <Button onClick={load}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Refresh
        </Button>
      </PageHeader>

      {/* ── Tabs ── */}
      <div className="tabBar">
        {TABS.map(({ key, label }) => (
          <button key={key} className={`tab ${tab === key ? 'tabActive' : ''}`} onClick={() => setTab(key)}>
            {label}
            <span className="tabCount">{counts[key] ?? 0}</span>
          </button>
        ))}
      </div>

      {/* ── Search bar ── */}
      <div className="searchBar">
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"
          style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-hint)' }}>
          <circle cx="6.5" cy="6.5" r="5"/><path d="M10.5 10.5l3 3"/>
        </svg>
        <input
          style={{ paddingLeft: 32 }}
          placeholder="Search by name, email, phone, product…"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="loadingWrap"><Spinner size={26}/><span>Loading…</span></div>
      ) : displayed.length === 0 ? (
        <Card>
          <EmptyState
            icon="📭"
            title="No enquiries found"
            subtitle={
              tab !== 'all'
                ? `No ${tab} enquiries yet.`
                : 'Customer enquiries from your product pages will appear here.'
            }
          />
        </Card>
      ) : (
        <div className="table">
          <div className="tableHead">
            <span style={{ width: 28 }}></span>
            <span style={{ flex: 2 }}>Product</span>
            <span style={{ width: 150 }}>Customer</span>
            <span style={{ width: 120 }}>Phone</span>
            <span style={{ width: 100 }}>Status</span>
            <span style={{ width: 150 }}>Received</span>
          </div>

          {displayed.map(item => (
            <EnquiryRow
              key={item._id}
              item={item}
              onStatusChange={handleStatusChange}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {!loading && displayed.length > 0 && (
        <p style={{ fontSize: 12, color: 'var(--text-hint)', textAlign: 'right', marginTop: 10 }}>
          Showing {displayed.length} of {items.length} enquiries
        </p>
      )}
    </div>
  );
}