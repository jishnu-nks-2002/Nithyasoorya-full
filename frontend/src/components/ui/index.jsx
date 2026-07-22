import styles from './ui.module.css';

/* ── Button ── */
export function Button({ children, variant = 'default', size = 'md', loading = false, className = '', ...props }) {
  return (
    <button
      className={`${styles.btn} ${styles[`btn_${variant}`]} ${styles[`btn_${size}`]} ${className}`}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && <span className={styles.spinner} />}
      {children}
    </button>
  );
}

/* ── Badge ── */
export function Badge({ children, variant = 'default' }) {
  return <span className={`${styles.badge} ${styles[`badge_${variant}`]}`}>{children}</span>;
}

/* ── Card ── */
export function Card({ children, className = '', ...props }) {
  return <div className={`${styles.card} ${className}`} {...props}>{children}</div>;
}

/* ── Card Header ── */
export function CardHeader({ title, children }) {
  return (
    <div className={styles.cardHeader}>
      <h2 className={styles.cardTitle}>{title}</h2>
      {children && <div className={styles.cardHeaderActions}>{children}</div>}
    </div>
  );
}

/* ── Stat Card ── */
export function StatCard({ label, value, color }) {
  return (
    <div className={styles.statCard}>
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue} style={color ? { color } : undefined}>{value}</div>
    </div>
  );
}

/* ── Form Group ── */
export function FormGroup({ label, children, hint }) {
  return (
    <div className={styles.formGroup}>
      {label && <label className={styles.label}>{label}</label>}
      {children}
      {hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
}

/* ── Page Header ── */
export function PageHeader({ title, subtitle, children }) {
  return (
    <div className={styles.pageHeader}>
      <div>
        <h1 className={styles.pageTitle}>{title}</h1>
        {subtitle && <p className={styles.pageSubtitle}>{subtitle}</p>}
      </div>
      {children && <div className={styles.pageHeaderActions}>{children}</div>}
    </div>
  );
}

/* ── Empty State ── */
export function EmptyState({ icon, title, subtitle, action }) {
  return (
    <div className={styles.emptyState}>
      {icon && <div className={styles.emptyIcon}>{icon}</div>}
      <p className={styles.emptyTitle}>{title}</p>
      {subtitle && <p className={styles.emptySubtitle}>{subtitle}</p>}
      {action && <div style={{ marginTop: '1rem' }}>{action}</div>}
    </div>
  );
}

/* ── Spinner ── */
export function Spinner({ size = 20 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      style={{ animation: 'spin 0.7s linear infinite' }}
    >
      <path d="M12 2a10 10 0 0 1 10 10" strokeLinecap="round" />
    </svg>
  );
}

/* ── Toggle ── */
export function Toggle({ checked, onChange, id }) {
  return (
    <label className={styles.toggle} htmlFor={id}>
      <input type="checkbox" id={id} checked={checked} onChange={onChange} className={styles.toggleInput} />
      <span className={styles.toggleTrack}>
        <span className={styles.toggleThumb} />
      </span>
    </label>
  );
}
