import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// ── Backend URL ───────────────────────────────────────────────────────────────
// Production: Render deployment
// NOTE: Render free tier may spin down after inactivity — first request can take ~30s.
const BASE_URL = 'https://lessongen-ghana.onrender.com/api';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 90000, // 90s to allow Render cold-start spin-up
  headers: { 'Content-Type': 'application/json' },
});

// ── Request Interceptor — attach JWT ─────────────────────────────────────────
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync('lg_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch { /* ignore */ }
  return config;
});

// ── Response Interceptor — handle 401 ────────────────────────────────────────
api.interceptors.response.use(
  res => res,
  async (err) => {
    if (err.response?.status === 401) {
      try {
        await SecureStore.deleteItemAsync('lg_token');
        await SecureStore.deleteItemAsync('lg_user');
      } catch { /* ignore */ }
    }
    return Promise.reject(err);
  }
);

// ── API Methods ───────────────────────────────────────────────────────────────
export const authAPI = {
  login:    (d) => api.post('/auth/login', d),
  register: (d) => api.post('/auth/register', d),
  me:       ()  => api.get('/auth/me'),
};

export const lessonsAPI = {
  generate: (d)  => api.post('/lessons/generate', d),
  list:     (p)  => api.get('/lessons', { params: p }),
  get:      (id) => api.get(`/lessons/${id}`),
  delete:   (id) => api.delete(`/lessons/${id}`),
};

export const exportAPI = {
  docx: (id) => api.post(`/exports/docx/${id}`, {}, { responseType: 'arraybuffer', timeout: 120000 }),
};

export const paymentAPI = {
  paystackInit: (plan) => api.post('/payments/paystack/initialize', { plan }),
};

export const schemeAPI = {
  upload:        (formData) => api.post('/scheme/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 120000 }),
  paste:         (data)     => api.post('/scheme/paste', data, { timeout: 120000 }),
  list:          ()         => api.get('/scheme/list'),
  getById:       (id)       => api.get(`/scheme/${id}`),
  getWeekly:     (classCode, subject, term) => api.get('/scheme/weekly', { params: { classCode, subject, term } }),
  delete:        (id)       => api.delete(`/scheme/${id}`),
  generateRange: (data)     => api.post('/scheme/generate-range', data, { timeout: 180000 }),
};

export default api;
