import { NavLink, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { fetchContacts } from '../api/contact';
import styles from './Layout.module.css';

const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'http://localhost:5000';

// ── Nav items ─────────────────────────────────────────────────────────────────
const navItems = [
  {
    to: '/',
    label: 'Dashboard',
    end: true,
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="1" width="6" height="6" rx="1" />
        <rect x="9" y="1" width="6" height="6" rx="1" />
        <rect x="1" y="9" width="6" height="6" rx="1" />
        <rect x="9" y="9" width="6" height="6" rx="1" />
      </svg>
    ),
  },
  {
    to: '/slides',
    label: 'Hero Slides',
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="3" width="14" height="10" rx="1.5" />
        <path d="M6.5 6l3 2-3 2V6z" fill="currentColor" stroke="none" />
      </svg>
    ),
  },
  {
    to: '/products',
    label: 'Products',
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="1" y="1" width="6" height="9" rx="1" />
        <rect x="9" y="6" width="6" height="9" rx="1" />
        <rect x="9" y="1" width="6" height="3" rx="1" />
        <rect x="1" y="12" width="6" height="3" rx="1" />
      </svg>
    ),
  },

  // ── Stones (NEW) ──────────────────────────────────────────────────────────
  {
    to: '/stones-admin',
    label: 'Crystals',
    stonesBadge: true,
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        {/* Diamond / gem shape */}
        <polygon points="8,1 15,6 8,15 1,6" />
        <polyline points="1,6 8,9 15,6" />
      </svg>
    ),
  },

  {
    to: '/about',
    label: 'About Page',
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="5" r="2.2" />
        <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/gallery',
    label: 'Gallery',
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="5" r="2.2" />
        <path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/contacts',
    label: 'Contact',
    badge: true,
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 2H2a1 1 0 00-1 1v8a1 1 0 001 1h3l3 2 3-2h3a1 1 0 001-1V3a1 1 0 00-1-1z" />
        <path d="M5 6h6M5 8.5h4" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/enquiries',
    label: 'Enquiries',
    enquiryBadge: true,
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M14 1H2a1 1 0 00-1 1v9a1 1 0 001 1h3l3 2.5L11 12h3a1 1 0 001-1V2a1 1 0 00-1-1z" />
        <circle cx="8" cy="6.5" r="1.2" fill="currentColor" stroke="none" />
        <path d="M8 8.5v1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/reviews',
    label: 'Reviews',
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 1l2 4 4 .6-3 3 .7 4.4L8 11.8 4.3 13l.7-4.4-3-3 4-.6L8 1z" />
      </svg>
    ),
  },
  {
    to: '/settings',
    label: 'Settings',
    icon: (
      <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="8" r="2.2" />
        <path d="M8 1.5v1.8M8 12.7v1.8M1.5 8h1.8M12.7 8h1.8M3.4 3.4l1.27 1.27M11.33 11.33l1.27 1.27M11.33 4.67l-1.27 1.27M4.67 11.33l-1.27 1.27" />
      </svg>
    ),
  },
];

// ── Layout ────────────────────────────────────────────────────────────────────
export default function Layout({ children }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className={styles.shell}>
      {/* ── Sidebar ── */}
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <div className={styles.brandIcon}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5">
              <rect x="1" y="3" width="14" height="10" rx="1.5" />
              <path d="M6.5 6l3 2-3 2V6z" fill="white" stroke="none" />
            </svg>
          </div>
          <div>
            <div className={styles.brandName}>Gallery Hero</div>
            <div className={styles.brandSub}>Admin Panel</div>
          </div>
        </div>

        <nav className={styles.nav}>
          <div className={styles.navLabel}>Navigation</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `${styles.navItem} ${isActive ? styles.navItemActive : ''}`
              }
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span className={styles.navLabel2}>{item.label}</span>
              {item.badge        && <UnreadBadge />}
              {item.enquiryBadge && <EnquiryBadge />}
              {item.stonesBadge  && <StonesBadge />}
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.adminInfo}>
            <div className={styles.adminAvatar}>
              {admin?.name?.[0]?.toUpperCase() || 'A'}
            </div>
            <div className={styles.adminMeta}>
              <div className={styles.adminName}>{admin?.name || 'Admin'}</div>
              <div className={styles.adminRole}>{admin?.role || 'admin'}</div>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M6 2H3a1 1 0 00-1 1v10a1 1 0 001 1h3M10 11l3-3-3-3M13 8H6" />
            </svg>
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className={styles.main}>
        <div className={styles.content}>{children}</div>
      </main>
    </div>
  );
}

// ── Unread badge for /contacts ────────────────────────────────────────────────
function UnreadBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetchContacts()
      .then(res => {
        const unread = (res.data.data || []).filter(c => !c.read).length;
        setCount(unread);
      })
      .catch(() => {});
  }, []);

  if (count === 0) return null;
  return (
    <span className={styles.unreadBadge}>
      {count > 9 ? '9+' : count}
    </span>
  );
}

// ── Enquiry badge for /enquiries ──────────────────────────────────────────────
function EnquiryBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('gh_token');
    fetch(`${API_BASE}/api/enquiries?status=New`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        if (data.success) setCount(data.count ?? data.data?.length ?? 0);
      })
      .catch(() => {});
  }, []);

  if (count === 0) return null;
  return (
    <span className={styles.unreadBadge}>
      {count > 9 ? '9+' : count}
    </span>
  );
}

// ── Stones badge — shows count of draft (inactive) stones ────────────────────
// Shows when there are stones that are not yet published, as a reminder.
// Change the filter to whatever is meaningful for your workflow.
function StonesBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch(`${API_BASE}/api/stones?limit=100`)
      .then(r => r.json())
      .then(data => {
        if (data.success) {
          // Badge = number of draft (unpublished) stones
          const drafts = (data.data || []).filter(s => !s.isActive).length;
          setCount(drafts);
        }
      })
      .catch(() => {});
  }, []);

  if (count === 0) return null;
  return (
    <span className={styles.unreadBadge} style={{ background: '#7B4BA0' }}>
      {count > 9 ? '9+' : count}
    </span>
  );
}