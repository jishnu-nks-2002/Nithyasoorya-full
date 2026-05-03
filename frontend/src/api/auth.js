import api from './axios';

export const login = (email, password) => api.post('/api/auth/login', { email, password });
export const getMe = () => api.get('/api/auth/me');
export const updatePassword = (data) => api.put('/api/auth/update-password', data);
export const updateProfile = (data) => api.put('/api/auth/update-profile', data);
