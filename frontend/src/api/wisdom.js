export const API_BASE =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
  'http://localhost:5000';

export async function wisdomFetch(url, options = {}) {
  const token  = localStorage.getItem('gh_token');
  const isForm = options.body instanceof FormData;
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      ...(isForm || !options.body ? {} : { 'Content-Type': 'application/json' }),
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) throw new Error('Session expired — please log in again');
  if (!res.ok || !data.success) throw new Error(data.message || 'Request failed');
  return data;
}
