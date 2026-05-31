import axios from 'axios';

// FIX 1: Fall back to the actual backend port, not empty string.
// Empty string sends requests to the Vite dev server (port 5173), not Express (port 5000).
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('gh_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global 401 handler — clear token and reload to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('gh_token');
      localStorage.removeItem('gh_admin');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;