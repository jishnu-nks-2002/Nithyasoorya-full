import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { fetchContacts, markContactRead, deleteContact } from '../api/contact';
import {
  Card, CardHeader, StatCard, Badge, Button, PageHeader, EmptyState, Spinner,
} from '../components/ui';
import styles from './Contacts.module.css';

const TYPE_META = {
  'Art Acquisition':    { color: '#6b3fa0', bg: '#f3eeff' },
  'Bespoke Commission': { color: '#2e7d32', bg: '#f0faf0' },
  'Exhibition Inquiry': { color: '#1565c0', bg: '#e8f0fe' },
  'General Question':   { color: '#e65100', bg: '#fff3e0' },
  'Press & Media':      { color: '#ad1457', bg: '#fce4ec' },
};

function TypeBadge({ type }) {
  const meta = TYPE_META[type] || { color: '#555', bg: '#f0f0f0' };
  return (
    <span style={{
      display: 'inline-block', padding: '3px 10px', borderRadius: 12,
      fontSize: 11, fontWeight: 500,
      color: meta.color, background: meta.bg,
    }}>
      {type}
    </span>
  );
}

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter,   setFilter]   = useState('All');
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetchContacts();
      setContacts(res.data.data);
    } catch {
      toast.error('Failed to load inquiries');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleSelect = async (c) => {
    setSelected(c);
    if (!c.read) {
      try {
        await markContactRead(c._id);
        setContacts(prev => prev.map(x => x._id === c._id ? { ...x, read: true } : x));
        setSelected(s => s ? { ...s, read: true } : s);
      } catch {
        // silent
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this inquiry permanently?')) return;
    setDeleting(true);
    try {
      await deleteContact(id);
      toast.success('Inquiry deleted');
      setContacts(prev => prev.filter(c => c._id !== id));
      if (selected?._id === id) setSelected(null);
    } catch {
      toast.error('Failed to delete');
    } finally {
      setDeleting(false);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await markContactRead(id);
      setContacts(prev => prev.map(c => c._id === id ? { ...c, read: true } : c));
      if (selected?._id === id) setSelected(s => ({ ...s, read: true }));
      toast.success('Marked as read');
    } catch {
      toast.error('Failed to update');
    }
  };

  const types    = ['All', ...Object.keys(TYPE_META).filter(t => contacts.some(c => c.type === t))];
  const filtered = filter === 'All' ? contacts : contacts.filter(c => c.type === filter);
  const unread   = contacts.filter(c => !c.read).length;
  const total    = contacts.length;

  return (
    <div>
      <PageHeader
        title="Contact Inquiries"
        subtitle={`${unread} unread · ${total} total`}
      >
        <Button onClick={load}>↺ Refresh</Button>
      </PageHeader>

      {/* Stats row */}
      <div className={styles.statsGrid}>
        <StatCard label="Total"   value={total} />
        <StatCard label="Unread"  value={unread}                          color="var(--primary, #6b3fa0)" />
        <StatCard label="Read"    value={total - unread}                  color="var(--success)" />
        <StatCard label="Types"   value={Object.keys(TYPE_META).length}   color="var(--info)" />
      </div>

      {/* Filter chips */}
      <div className={styles.filters}>
        {types.map(t => (
          <button
            key={t}
            className={`${styles.chip} ${filter === t ? styles.chipActive : ''}`}
            onClick={() => setFilter(t)}
          >
            {t}
            {t === 'All'
              ? ` (${total})`
              : ` (${contacts.filter(c => c.type === t).length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className={styles.loadingWrap}><Spinner size={28} /><span>Loading inquiries…</span></div>
      ) : (
        <div className={styles.layout}>

          {/* ── LIST PANEL ── */}
          <div className={styles.listPanel}>
            {filtered.length === 0 ? (
              <EmptyState icon="✉️" title="No inquiries" subtitle="None match the selected filter." />
            ) : filtered.map(c => (
              <div
                key={c._id}
                className={`${styles.card} ${!c.read ? styles.unread : ''} ${selected?._id === c._id ? styles.active : ''}`}
                onClick={() => handleSelect(c)}
              >
                <div className={styles.cardRow}>
                  <span className={styles.cardName}>{c.name}</span>
                  <span className={styles.cardDate}>{new Date(c.createdAt).toLocaleDateString()}</span>
                </div>
                <div className={styles.cardEmail}>{c.email}</div>
                <div className={styles.cardRow} style={{ marginTop: 8 }}>
                  <TypeBadge type={c.type} />
                  {!c.read && <span className={styles.unreadDot} />}
                </div>
              </div>
            ))}
          </div>

          {/* ── DETAIL PANEL ── */}
          <Card className={styles.detailPanel}>
            {selected ? (
              <>
                <div className={styles.detailTop}>
                  <div>
                    <h2 className={styles.detailName}>{selected.name}</h2>
                    <a href={`mailto:${selected.email}`} className={styles.detailEmail}>
                      {selected.email}
                    </a>
                  </div>
                  <div className={styles.detailActions}>
                    {!selected.read && (
                      <Button size="sm" onClick={() => handleMarkRead(selected._id)}>
                        Mark Read
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDelete(selected._id)}
                      disabled={deleting}
                    >
                      {deleting ? 'Deleting…' : 'Delete'}
                    </Button>
                  </div>
                </div>

                <div className={styles.detailMeta}>
                  <TypeBadge type={selected.type} />
                  <span className={styles.metaDate}>
                    {new Date(selected.createdAt).toLocaleString()}
                  </span>
                  <Badge variant={selected.read ? 'success' : 'warning'}>
                    {selected.read ? 'Read' : 'Unread'}
                  </Badge>
                </div>

                <div className={styles.messageBox}>
                  <p className={styles.messageLabel}>Message</p>
                  <p className={styles.messageText}>
                    {selected.message || <em style={{ color: '#bbb' }}>No message provided.</em>}
                  </p>
                </div>

                <div className={styles.replyBar}>
                  
                  <a  href={`mailto:${selected.email}?subject=Re: ${selected.type} - Empavai Studio`}
                    className={styles.replyBtn}
                  >
                    ✉ Reply via Email
                  </a>
                </div>
              </>
            ) : (
              <div className={styles.placeholder}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ddd" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                </svg>
                <p>Select an inquiry to view details</p>
              </div>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}