import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui';
import styles from './Login.module.css';

export default function Login() {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const res = await login(form.email, form.password);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo mark */}
        <div className={styles.logoWrap}>
          <div className={styles.logo}>
            <svg width="20" height="20" viewBox="0 0 16 16" fill="none" stroke="white" strokeWidth="1.5">
              <rect x="1" y="3" width="14" height="10" rx="1.5" />
              <path d="M6.5 6l3 2-3 2V6z" fill="white" stroke="none" />
            </svg>
          </div>
        </div>

        <h1 className={styles.heading}>Gallery Hero Admin</h1>
        <p className={styles.subheading}>Sign in to manage your hero section</p>

        {error && <div className={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label className={styles.label}>Email address</label>
            <input
              type="email"
              autoComplete="email"
              placeholder="admin@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%', justifyContent: 'center' }}>
            Sign in
          </Button>
        </form>

        <p className={styles.hint}>
          First time? Run <code>npm run seed</code> in the backend to create your admin account.
        </p>
      </div>
    </div>
  );
}
