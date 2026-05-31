import { useState, useCallback } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function useContact() {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const [success, setSuccess] = useState(false);

  const submit = useCallback(async (formData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(formData),
      });
      if (!res.ok) throw new Error('Submission failed');
      setSuccess(true);
      return true;
    } catch (err) {
      setError(err.message || 'Something went wrong');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return { submit, loading, error, success, reset };
}