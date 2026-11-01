import axios from 'axios';

export const ROOT = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const API = axios.create({ baseURL: `${ROOT}/api` });

API.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('gh_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

// Uploaded images are stored as relative paths (/uploads/...) — prefix the API host
export const imgSrc = (u) => (u && u.startsWith('/') ? `${ROOT}${u}` : u || '');

export const fetchCrystalPagesAdmin = ()        => API.get('/crystal-pages/admin/all');
export const fetchCrystalPageById   = (id)      => API.get(`/crystal-pages/id/${id}`);
export const createCrystalPage      = (fd)      => API.post('/crystal-pages', fd);
export const updateCrystalPage      = (id, fd)  => API.put(`/crystal-pages/${id}`, fd);
export const toggleCrystalPage      = (id)      => API.patch(`/crystal-pages/${id}/toggle`);
export const deleteCrystalPage      = (id)      => API.delete(`/crystal-pages/${id}`);
