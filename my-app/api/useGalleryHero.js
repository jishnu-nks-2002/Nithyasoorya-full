// hooks/useGalleryHero.js
import { useState, useEffect } from 'react';
import axios from 'axios';

// Hardcode temporarily to confirm it works, then move back to env var
const API_BASE = 'http://localhost:5000/api';

export function useGalleryHero() {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  useEffect(() => {
    const url = `${API_BASE}/gallery-hero`;
    console.log('[useGalleryHero] fetching:', url); // 👈 confirm the URL in console

    axios
      .get(url)
      .then((res) => setData(res.data.data))
      .catch((err) => setError('Failed to load hero: ' + err.message))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}