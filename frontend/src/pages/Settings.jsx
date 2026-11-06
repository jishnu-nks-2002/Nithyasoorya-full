import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { fetchAdminConfig, updateSettings } from '../api/galleryHero';
import { updatePassword, updateProfile } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import { Card, CardHeader, Button, FormGroup, PageHeader, Spinner } from '../components/ui';
import styles from './Settings.module.css';

/* Password input with a show / hide toggle */
function PasswordInput({ value, onChange, placeholder, autoComplete }) {
  const [show, setShow] = useState(false);

  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        style={{ paddingRight: 44 }}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? 'Hide password' : 'Show password'}
        title={show ? 'Hide password' : 'Show password'}
        style={{
          position: 'absolute',
          right: 12,
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'none',
          border: 'none',
          padding: 4,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#8a8a94',
        }}
      >
        {show ? (
          /* eye-off */
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
            <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
            <line x1="1" y1="1" x2="23" y2="23" />
          </svg>
        ) : (
          /* eye */
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        )}
      </button>
    </div>
  );
}

export default function Settings() {
  const { admin, login } = useAuth();
  const [loading, setLoading] = useState(true);

  const [hero, setHero] = useState({
    verticalText: '',
    leftLabel: '',
    ctaText: '',
    ctaLink: '',
    autoPlayInterval: 5000,
  });
  const [savingHero, setSavingHero] = useState(false);

  const [profile, setProfile] = useState({ name: '', email: '' });
  const [savingProfile, setSavingProfile] = useState(false);

  const [pwd, setPwd] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [savingPwd, setSavingPwd] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchAdminConfig();
        const d = res.data.data;
        setHero({
          verticalText: d.verticalText || '',
          leftLabel: d.leftLabel || '',
          ctaText: d.ctaText || '',
          ctaLink: d.ctaLink || '',
          autoPlayInterval: d.autoPlayInterval || 5000,
        });
      } catch {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    })();
    if (admin) setProfile({ name: admin.name || '', email: admin.email || '' });
  }, [admin]);

  const handleSaveHero = async (e) => {
    e.preventDefault();
    setSavingHero(true);
    try {
      await updateSettings({
        ...hero,
        autoPlayInterval: Number(hero.autoPlayInterval),
      });
      toast.success('Hero settings saved');
    } catch {
      toast.error('Failed to save hero settings');
    } finally {
      setSavingHero(false);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile(profile);
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleSavePwd = async (e) => {
    e.preventDefault();
    if (pwd.newPassword !== pwd.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (pwd.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setSavingPwd(true);
    try {
      await updatePassword({ currentPassword: pwd.currentPassword, newPassword: pwd.newPassword });
      toast.success('Password updated');
      setPwd({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally {
      setSavingPwd(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loadingWrap}>
        <Spinner size={28} />
        <span>Loading settings...</span>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        subtitle="Configure account"
      />

      {/* ── Hero Section Settings ── */}
      

      {/* ── API Reference ── */}
      <Card className={styles.card}>
        <CardHeader title="API endpoints reference" />
        <div className={styles.apiTable}>
          {[
            ['GET',    'Public hero config',           '/api/gallery-hero',                  false],
            ['GET',    'Admin hero config',             '/api/gallery-hero/admin',            true],
            ['PUT',    'Update hero settings',          '/api/gallery-hero/settings',         true],
            ['POST',   'Add slide (multipart)',         '/api/gallery-hero/slides',           true],
            ['PUT',    'Edit slide (multipart)',        '/api/gallery-hero/slides/:id',       true],
            ['PUT',    'Reorder slides',               '/api/gallery-hero/slides/reorder',   true],
            ['PUT',    'Update video poster',          '/api/gallery-hero/slides/:id/poster',true],
            ['DELETE', 'Delete slide',                 '/api/gallery-hero/slides/:id',       true],
            ['POST',   'Login',                        '/api/auth/login',                    false],
            ['GET',    'Get current admin',            '/api/auth/me',                       true],
            ['PUT',    'Update profile',               '/api/auth/update-profile',           true],
            ['PUT',    'Update password',              '/api/auth/update-password',          true],
          ].map(([method, label, path, auth]) => (
            <div key={path + method} className={styles.apiRow}>
              <span className={`${styles.methodBadge} ${styles[`method_${method.toLowerCase()}`]}`}>{method}</span>
              <span className={styles.apiLabel}>{label}</span>
              <code className={styles.apiPath}>{path}</code>
              {auth && <span className={styles.authTag}>🔒</span>}
            </div>
          ))}
        </div>
      </Card>

      {/* ── Profile ── */}
      <Card className={styles.card}>
        <CardHeader title="Profile" />
        <form onSubmit={handleSaveProfile} className={styles.form}>
          <div className={styles.formGrid}>
            <FormGroup label="Name">
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                placeholder="Admin"
              />
            </FormGroup>
            <FormGroup label="Email">
              <input
                type="email"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="admin@example.com"
              />
            </FormGroup>
          </div>
          <div className={styles.formFooter}>
            <Button type="submit" variant="primary" loading={savingProfile}>
              Update profile
            </Button>
          </div>
        </form>
      </Card>

      {/* ── Change Password ── */}
      <Card>
        <CardHeader title="Change password" />
        <form onSubmit={handleSavePwd} className={styles.form}>
          <div className={styles.formGrid}>
            <FormGroup label="Current password">
              <PasswordInput
                value={pwd.currentPassword}
                onChange={(e) => setPwd({ ...pwd, currentPassword: e.target.value })}
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </FormGroup>
            <FormGroup label="New password">
              <PasswordInput
                value={pwd.newPassword}
                onChange={(e) => setPwd({ ...pwd, newPassword: e.target.value })}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </FormGroup>
            <FormGroup label="Confirm new password">
              <PasswordInput
                value={pwd.confirmPassword}
                onChange={(e) => setPwd({ ...pwd, confirmPassword: e.target.value })}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </FormGroup>
          </div>
          <div className={styles.formFooter}>
            <Button type="submit" variant="primary" loading={savingPwd}>
              Update password
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}