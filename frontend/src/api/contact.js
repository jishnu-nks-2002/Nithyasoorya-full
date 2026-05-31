import axios from './axios';

export const fetchContacts    = ()        => axios.get('/api/contact');
export const markContactRead  = (id)      => axios.patch(`/api/contact/${id}/read`);
export const deleteContact    = (id)      => axios.delete(`/api/contact/${id}`);
export const submitContact    = (payload) => axios.post('/api/contact', payload);