import axios from 'axios';

const ROOT = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');
const API = axios.create({ baseURL: `${ROOT}/api` });

API.interceptors.request.use((cfg) => {
  const token = localStorage.getItem('gh_token'); // ← was 'adminToken'
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

export const fetchProducts      = (params) => API.get('/products', { params });
export const fetchProductsAdmin = (params) => API.get('/products/admin', { params });
export const fetchProductBySlug = (slug)   => API.get(`/products/slug/${slug}`);
export const fetchProductById   = (id)     => API.get(`/products/id/${id}`);
export const fetchMeta          = (params) => API.get('/products/meta', { params });
export const createProduct      = (fd)     => API.post('/products', fd);
export const updateProduct      = (id, fd) => API.put(`/products/${id}`, fd);
export const deleteProduct      = (id)     => API.delete(`/products/${id}`);
export const deleteProductImage = (id, imgId) => API.delete(`/products/${id}/images/${imgId}`);
export const setPrimaryImage    = (id, imgId) => API.put(`/products/${id}/images/${imgId}/primary`);
export const reorderProducts    = (ids)    => API.put('/products/reorder', { orderedIds: ids });