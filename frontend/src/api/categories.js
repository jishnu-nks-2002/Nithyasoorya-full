import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

// attach token on every request
API.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('gh_token'); // ← was 'adminToken'
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const fetchCategories      = ()       => API.get('/categories');
export const fetchCategoriesAdmin = ()       => API.get('/categories/all');
export const fetchCategoryById    = (id)     => API.get(`/categories/${id}`);
export const createCategory       = (data)   => API.post('/categories', data);
export const updateCategory       = (id, data) => API.put(`/categories/${id}`, data);
export const deleteCategory       = (id)     => API.delete(`/categories/${id}`);
export const reorderCategories    = (ids)    => API.put('/categories/reorder', { orderedIds: ids });