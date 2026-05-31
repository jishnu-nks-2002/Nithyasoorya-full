// frontend/src/api/gallery.js

const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'http://localhost:5000';

function authHeaders() {
  const token = localStorage.getItem('gh_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

/** GET /api/gallery  – optionally pass { isActive, type, limit, page } */
export async function fetchGalleryItems(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${API_BASE}/api/gallery${qs ? `?${qs}` : ''}`, {
    headers: authHeaders(),
  });
  return res.json();
}

/**
 * POST /api/gallery  – upload multiple files at once.
 * @param {FileList|File[]} files
 * @param {{ alt?, isActive?, order? }} meta
 */
export async function uploadGalleryFiles(files, meta = {}) {
  const fd = new FormData();
  Array.from(files).forEach(f => fd.append('files', f));
  if (meta.alt      !== undefined) fd.append('alt',      meta.alt);
  if (meta.isActive !== undefined) fd.append('isActive', String(meta.isActive));
  if (meta.order    !== undefined) fd.append('order',    String(meta.order));

  const res = await fetch(`${API_BASE}/api/gallery`, {
    method: 'POST',
    headers: authHeaders(),
    body: fd,
  });
  return res.json();
}

/** PUT /api/gallery/:id  – edit metadata and/or replace file */
export async function updateGalleryItem(id, formData) {
  const res = await fetch(`${API_BASE}/api/gallery/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: formData,
  });
  return res.json();
}

/** DELETE /api/gallery/:id */
export async function deleteGalleryItem(id) {
  const res = await fetch(`${API_BASE}/api/gallery/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  return res.json();
}

/** DELETE /api/gallery/bulk  – { ids: string[] } */
export async function bulkDeleteGalleryItems(ids) {
  const res = await fetch(`${API_BASE}/api/gallery/bulk`, {
    method: 'DELETE',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });
  return res.json();
}

/** PATCH /api/gallery/:id/toggle */
export async function toggleGalleryItem(id) {
  const res = await fetch(`${API_BASE}/api/gallery/${id}/toggle`, {
    method: 'PATCH',
    headers: authHeaders(),
  });
  return res.json();
}

/** PATCH /api/gallery/reorder  – items: [{ id, order }] */
export async function reorderGalleryItems(items) {
  const res = await fetch(`${API_BASE}/api/gallery/reorder`, {
    method: 'PATCH',
    headers: { ...authHeaders(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ items }),
  });
  return res.json();
}