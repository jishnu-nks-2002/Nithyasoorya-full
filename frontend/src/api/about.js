import axios from "./axios";

const BASE = "/api/about";

export const getAboutPage = () =>
  axios.get(BASE).then((r) => r.data.data);

export const updateHero = (payload) =>
  axios.put(`${BASE}/hero`, payload).then((r) => r.data.data);

// FIX 2: Do NOT set Content-Type manually for FormData requests.
// When you set it yourself, the `boundary` parameter (which multer needs
// to split fields) is missing and the upload silently fails.
// Axios + the browser will set the correct header automatically.
export const updateAboutSection = (formData) =>
  axios.put(`${BASE}/about-section`, formData).then((r) => r.data.data);

export const updateArtist = (formData) =>
  axios.put(`${BASE}/artist`, formData).then((r) => r.data.data);