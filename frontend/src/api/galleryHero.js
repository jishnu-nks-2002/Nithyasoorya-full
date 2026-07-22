import api from './axios';

export const fetchAdminConfig = () => api.get('/api/gallery-hero/admin');
export const fetchPublicConfig = () => api.get('/api/gallery-hero');

export const updateSettings = (data) => api.put('/api/gallery-hero/settings', data);

export const addSlide = (formData) =>
  api.post('/api/gallery-hero/slides', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateSlide = (slideId, formData) =>
  api.put(`/api/gallery-hero/slides/${slideId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const updateSlidePoster = (slideId, formData) =>
  api.put(`/api/gallery-hero/slides/${slideId}/poster`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export const deleteSlide = (slideId) => api.delete(`/api/gallery-hero/slides/${slideId}`);

export const reorderSlides = (orderedIds) =>
  api.put('/api/gallery-hero/slides/reorder', { orderedIds });
