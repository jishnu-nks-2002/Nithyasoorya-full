import axios from 'axios';
import { useState, useEffect } from 'react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL
  ? `${process.env.NEXT_PUBLIC_API_URL}/api`
  : 'http://localhost:5000/api';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Review {
  _id?: string;
  id?: number;
  name: string;
  title: string;
  location: string;
  rating: number;
  review: string;
  initials: string;
  productImage: string;
  productLabel?: string;
  order?: number;
}

// ── Public hook (used in ReviewSection component) ─────────────────────────────
export function useReviews() {
  const [data, setData]       = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    axios
      .get<{ data: Review[] }>(`${API_BASE}/reviews`)
      .then(res => {
        // supports both { data: [...] } and plain array responses
        const reviews = Array.isArray(res.data)
          ? res.data
          : (res.data.data ?? []);
        setData(reviews);
      })
      .catch(err => setError(err.message ?? 'Failed to fetch reviews'))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

// ── Admin API helpers (used in AdminCMS pages) ────────────────────────────────
const getToken    = () => localStorage.getItem('token');
const authHeaders = () => ({ Authorization: `Bearer ${getToken()}` });

export const reviewsApi = {
  getAll: () =>
    axios.get<{ data: Review[] }>(`${API_BASE}/reviews/admin`, {
      headers: authHeaders(),
    }),

  create: (formData: FormData) =>
    axios.post(`${API_BASE}/reviews`, formData, {
      headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' },
    }),

  update: (id: string, formData: FormData) =>
    axios.put(`${API_BASE}/reviews/${id}`, formData, {
      headers: { ...authHeaders(), 'Content-Type': 'multipart/form-data' },
    }),

  delete: (id: string) =>
    axios.delete(`${API_BASE}/reviews/${id}`, { headers: authHeaders() }),

  reorder: (orderedIds: string[]) =>
    axios.put(
      `${API_BASE}/reviews/reorder`,
      { orderedIds },
      { headers: authHeaders() },
    ),
};