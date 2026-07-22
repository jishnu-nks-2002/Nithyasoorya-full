import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { fetchAdminConfig } from '../api/galleryHero';
import { fetchContacts } from '../api/contact';
import {
  Card, CardHeader, StatCard, Badge, Button,
  PageHeader, EmptyState, Spinner,
} from '../components/ui';
import styles from './Dashboard.module.css';

const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'http://localhost:5000';

export default function Dashboard() {
  const [data,            setData]            = useState(null);
  const [loading,         setLoading]         = useState(true);
  const [contacts,        setContacts]        = useState([]);
  const [contactsLoading, setContactsLoading] = useState(true);

  // ── Stones state ──────────────────────────────────────────────────────────
  const [stones,        setStones]        = useState([]);
  const [stonesLoading, setStonesLoading] = useState(true);

  const navigate = useNavigate();

  // Load gallery config
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchAdminConfig();
        setData(res.data.data);
      } catch {
        toast.error('Failed to load config');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Load contacts
  useEffect(() => {
    (async () => {
      try {
        const res = await fetchContacts();
        setContacts(res.data.data);
      } catch { /* non-critical */ }
      finally   { setContactsLoading(false); }
    })();
  }, []);

  // Load stones
  useEffect(() => {
    (async () => {
      try {
        const res  = await fetch(`${API_BASE}/api/stones?limit=100`);
        const data = await res.json();
        if (data.success) setStones(data.data);
      } catch { /* non-critical */ }
      finally   { setStonesLoading(false); }
    })();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <Spinner size={28} />
        <span>Loading dashboard...</span>
      </div>
    );
  }

  const slides       = data?.slides || [];
  const activeSlides = slides.filter((s) => s.isActive);
  const images       = slides.filter((s) => s.type === 'image');
  const videos       = slides.filter((s) => s.type === 'video');
  const unread       = contacts.filter((c) => !c.read).length;

  // Stones derived stats
  const activeStones   = stones.filter((s) => s.isActive);
  const featuredStones = stones.filter((s) => s.isFeatured);
  const stoneCategories = [...new Set(stones.map((s) => s.category).filter(Boolean))];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your Gallery Hero configuration"
      >
        <Button onClick={() => navigate('/slides')}>Manage slides</Button>
        <Button variant="primary" onClick={() => navigate('/settings')}>Settings</Button>
      </PageHeader>

      {/* ── SLIDE STATS ── */}
      <div className={styles.statsGrid}>
        <StatCard label="Total slides" value={slides.length} />
        <StatCard label="Active"       value={activeSlides.length} color="var(--success)" />
        <StatCard label="Images"       value={images.length}       color="var(--info)" />
        <StatCard label="Videos"       value={videos.length}       color="var(--warning)" />
      </div>

      {/* ── HERO CONFIG ── */}
      <Card className={styles.card}>
        <CardHeader title="Hero configuration">
          <Button size="sm" onClick={() => navigate('/settings')}>Edit</Button>
        </CardHeader>
        <div className={styles.configTable}>
          {[
            ['Vertical text',     data?.verticalText],
            ['Left label',        data?.leftLabel],
            ['CTA text',          data?.ctaText],
            ['CTA link',          data?.ctaLink],
            ['Autoplay interval', data?.autoPlayInterval ? `${data.autoPlayInterval}ms` : '—'],
            ['Status',            null],
          ].map(([key, val]) => (
            <div key={key} className={styles.configRow}>
              <span className={styles.configKey}>{key}</span>
              {key === 'Status' ? (
                <Badge variant={data?.isActive ? 'success' : 'warning'}>
                  {data?.isActive ? 'Active' : 'Inactive'}
                </Badge>
              ) : (
                <span className={styles.configVal}>{val || '—'}</span>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* ── SLIDES LIST ── */}
      <Card>
        <CardHeader title="Slides overview">
          <Button size="sm" onClick={() => navigate('/slides')}>Manage</Button>
        </CardHeader>

        {slides.length === 0 ? (
          <EmptyState
            icon="🖼"
            title="No slides yet"
            subtitle="Head to Manage Slides to add your first slide."
            action={
              <Button variant="primary" onClick={() => navigate('/slides')}>
                Add first slide
              </Button>
            }
          />
        ) : (
          <div>
            {[...slides].sort((a, b) => a.order - b.order).map((slide) => (
              <div key={slide._id} className={styles.slideRow}>
                <span className={styles.orderBadge}>{slide.order + 1}</span>
                <div className={styles.slideThumb}>
                  {slide.src
                    ? <img src={slide.src} alt={slide.alt} />
                    : <span>{slide.type === 'video' ? '🎬' : '🖼'}</span>}
                </div>
                <div className={styles.slideInfo}>
                  <div className={styles.slideName}>{slide.title || 'Untitled'}</div>
                  <div className={styles.slideMeta}>
                    <Badge variant="default">{slide.type}</Badge>
                  </div>
                </div>
                <Badge variant={slide.isActive ? 'success' : 'warning'}>
                  {slide.isActive ? 'Active' : 'Hidden'}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* ══════════════════════════════════════════════
          ── STONES SECTION ──
      ══════════════════════════════════════════════ */}

      {/* Stone stats row */}
      <div className={styles.sectionLabel}>Sacred Stones</div>
      <div className={styles.statsGrid}>
        <StatCard label="Total stones"    value={stones.length} />
        <StatCard label="Published"       value={activeStones.length}   color="var(--success)" />
        <StatCard label="Featured"        value={featuredStones.length} color="#7B4BA0" />
        <StatCard label="Categories"      value={stoneCategories.length} color="var(--info)" />
      </div>

      {/* Stones list card */}
      <Card>
        <CardHeader title="Stones collection">
          <Button size="sm" onClick={() => navigate('/stones-admin/new')}>+ Add stone</Button>
          <Button size="sm" onClick={() => navigate('/stones-admin')}>Manage all</Button>
        </CardHeader>

        {stonesLoading ? (
          <div className={styles.contactsLoading}>
            <Spinner size={18} />
            <span>Loading stones…</span>
          </div>
        ) : stones.length === 0 ? (
          <EmptyState
            icon="💎"
            title="No stones yet"
            subtitle="Add your first sacred stone to the collection."
            action={
              <Button variant="primary" onClick={() => navigate('/stones-admin/new')}>
                Add first stone
              </Button>
            }
          />
        ) : (
          <div>
            {/* Category breakdown bar */}
            {stoneCategories.length > 0 && (
              <div className={styles.stoneCategories}>
                {stoneCategories.map((cat) => {
                  const count = stones.filter((s) => s.category === cat).length;
                  return (
                    <div key={cat} className={styles.stoneCategoryChip}>
                      <span className={styles.stoneCategoryDot} />
                      <span className={styles.stoneCategoryName}>{cat}</span>
                      <span className={styles.stoneCategoryCount}>{count}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Stone rows — latest 6 */}
            <div className={styles.stoneList}>
              {[...stones]
                .sort((a, b) => a.order - b.order || new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 6)
                .map((stone) => {
                  const primaryImg = stone.images?.find((i) => i.isPrimary) || stone.images?.[0];
                  return (
                    <div
                      key={stone._id}
                      className={styles.stoneRow}
                      onClick={() => navigate(`/stones-admin/${stone._id}/edit`)}
                    >
                      {/* Colour swatch / thumbnail */}
                      <div
                        className={styles.stoneThumb}
                        style={{ background: primaryImg ? undefined : stone.color || '#7B4BA0' }}
                      >
                        {primaryImg
                          ? <img src={primaryImg.url} alt={stone.name} />
                          : <span className={styles.stoneThumbInitial}>
                              {stone.name?.charAt(0) ?? '✦'}
                            </span>}
                      </div>

                      {/* Info */}
                      <div className={styles.stoneInfo}>
                        <div className={styles.stoneInfoTop}>
                          <span className={styles.stoneName}>{stone.name}</span>
                          {stone.isFeatured && (
                            <span className={styles.stoneFeaturedBadge}>Featured</span>
                          )}
                        </div>
                        <div className={styles.stoneMeta}>
                          {stone.subtitle && (
                            <span className={styles.stoneSubtitle}>{stone.subtitle}</span>
                          )}
                          {stone.category && (
                            <Badge variant="default">{stone.category}</Badge>
                          )}
                        </div>
                      </div>

                      {/* Right side */}
                      <div className={styles.stoneRight}>
                        <Badge variant={stone.isActive ? 'success' : 'warning'}>
                          {stone.isActive ? 'Published' : 'Draft'}
                        </Badge>
                        <span className={styles.stoneEditHint}>Edit →</span>
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Footer */}
            {stones.length > 6 && (
              <div className={styles.contactsFooter}>
                <button
                  className={styles.viewMoreBtn}
                  onClick={() => navigate('/stones-admin')}
                >
                  View {stones.length - 6} more stone{stones.length - 6 !== 1 ? 's' : ''} →
                </button>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* ── CONTACTS SNAPSHOT ── */}
      <Card className={styles.contactsCard}>
        <CardHeader title="Recent Inquiries">
          <Button size="sm" onClick={() => navigate('/contacts')}>View all</Button>
        </CardHeader>

        {contactsLoading ? (
          <div className={styles.contactsLoading}>
            <Spinner size={18} />
            <span>Loading inquiries…</span>
          </div>
        ) : contacts.length === 0 ? (
          <EmptyState
            icon="✉️"
            title="No inquiries yet"
            subtitle="Contact form submissions will appear here."
            action={
              <Button variant="primary" onClick={() => navigate('/contacts')}>
                View Contacts
              </Button>
            }
          />
        ) : (
          <div>
            {unread > 0 && (
              <div className={styles.unreadBanner}>
                <span className={styles.unreadBannerText}>
                  🔔 {unread} unread {unread === 1 ? 'inquiry' : 'inquiries'} awaiting review
                </span>
                <Button size="sm" onClick={() => navigate('/contacts')}>Review</Button>
              </div>
            )}

            <div className={styles.contactStatsRow}>
              <div className={styles.contactStat}>
                <span className={styles.contactStatValue}>{contacts.length}</span>
                <span className={styles.contactStatLabel}>Total</span>
              </div>
              <div className={styles.contactStatDivider} />
              <div className={styles.contactStat}>
                <span className={styles.contactStatValue} style={{ color: '#6b3fa0' }}>{unread}</span>
                <span className={styles.contactStatLabel}>Unread</span>
              </div>
              <div className={styles.contactStatDivider} />
              <div className={styles.contactStat}>
                <span className={styles.contactStatValue} style={{ color: '#2e7d32' }}>{contacts.length - unread}</span>
                <span className={styles.contactStatLabel}>Read</span>
              </div>
              <div className={styles.contactStatDivider} />
              <div className={styles.contactStat}>
                <span className={styles.contactStatValue} style={{ color: '#1565c0' }}>
                  {contacts.filter((c) => {
                    const d   = new Date(c.createdAt);
                    const now = new Date();
                    return d.getFullYear() === now.getFullYear()
                        && d.getMonth()    === now.getMonth()
                        && d.getDate()     === now.getDate();
                  }).length}
                </span>
                <span className={styles.contactStatLabel}>Today</span>
              </div>
            </div>

            <div className={styles.contactList}>
              {contacts.slice(0, 5).map((c) => (
                <div
                  key={c._id}
                  className={`${styles.contactRow} ${!c.read ? styles.contactRowUnread : ''}`}
                  onClick={() => navigate('/contacts')}
                >
                  <div className={styles.avatar}>{c.name.charAt(0).toUpperCase()}</div>
                  <div className={styles.contactInfo}>
                    <div className={styles.contactInfoTop}>
                      <span className={`${styles.contactName} ${!c.read ? styles.contactNameBold : ''}`}>
                        {c.name}
                      </span>
                      {!c.read && <span className={styles.unreadDot} />}
                    </div>
                    <div className={styles.contactEmail}>{c.email}</div>
                  </div>
                  <div className={styles.contactRight}>
                    <span className={styles.contactTypeBadge}>{c.type}</span>
                    <span className={styles.contactDate}>
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {contacts.length > 5 && (
              <div className={styles.contactsFooter}>
                <button className={styles.viewMoreBtn} onClick={() => navigate('/contacts')}>
                  View {contacts.length - 5} more inquiry{contacts.length - 5 !== 1 ? 'inquiries' : ''} →
                </button>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}