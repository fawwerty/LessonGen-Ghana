import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

// Use machine's local IP for development; update to production URL for EAS builds
const BASE = 'http://172.20.10.10:4000/api'; 

const api = axios.create({ baseURL: BASE, timeout: 60000 });

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('lg_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(res => res, async (err) => {
  if (err.response?.status === 401) {
    await SecureStore.deleteItemAsync('lg_token');
    await SecureStore.deleteItemAsync('lg_user');
  }
  return Promise.reject(err);
});

export const authAPI = {
  login: (d) => api.post('/auth/login', d),
  register: (d) => api.post('/auth/register', d),
  me: () => api.get('/auth/me'),
};
export const lessonsAPI = {
  generate: (d) => api.post('/lessons/generate', d),
  list: (p) => api.get('/lessons', { params: p }),
  get: (id) => api.get(`/lessons/${id}`),
  delete: (id) => api.delete(`/lessons/${id}`),
};
export const exportAPI = {
  docx: (id) => api.post(`/exports/docx/${id}`, {}, { responseType: 'arraybuffer' }),
};
export const paymentAPI = {
  paystackInit: (plan) => api.post('/payments/paystack/initialize', { plan }),
};
export default api;
