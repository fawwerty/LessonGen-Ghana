import axios from 'axios';

const rawBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';
const cleanBaseUrl = rawBaseUrl.endsWith('/api') ? rawBaseUrl : rawBaseUrl.replace(/\/$/, '') + '/api';

const API = axios.create({
  baseURL: cleanBaseUrl,
  timeout: 60000,
});

API.interceptors.request.use(config => {
  const token = localStorage.getItem('lg_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('lg_token');
      localStorage.removeItem('lg_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  login: (data) => API.post('/auth/login', data),
  register: (data) => API.post('/auth/register', data),
  me: () => API.get('/auth/me'),
};

export const lessonsAPI = {
  generate: (data) => API.post('/lessons/generate', data),
  generateBatch: (dataArray) => API.post('/lessons/generate', dataArray),
  list: (params) => API.get('/lessons', { params }),
  get: (id) => API.get(`/lessons/${id}`),
  getBatch: (id) => API.get(`/lessons/batch/${id}`),
  delete: (id) => API.delete(`/lessons/${id}`),
};

export const exportAPI = {
  docx: (lessonId) => API.post(`/exports/docx/${lessonId}`, {}, { responseType: 'blob' }),
  docxBatch: (batchId) => API.post(`/exports/batch/${batchId}`, {}, { responseType: 'blob' }),
};

export const paymentAPI = {
  paystackInit: (plan) => API.post('/payments/paystack/initialize', { plan }),
  paystackVerify: (reference) => API.post('/payments/paystack/verify', { reference }),
};

export const curriculumAPI = {
  subjects: (classCode) => API.get(`/curriculum/subjects/${classCode}`),
  lookup: (params) => API.get('/curriculum/lookup', { params }),
};

export const adminAPI = {
  stats: () => API.get('/admin/stats'),
  users: () => API.get('/admin/users'),
};

export const schemeAPI = {
  upload:        (formData) => API.post('/scheme/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 120000 }),
  paste:         (data)     => API.post('/scheme/paste', data, { timeout: 120000 }),
  list:          ()         => API.get('/scheme/list'),
  getById:       (id)       => API.get(`/scheme/${id}`),
  getWeekly:     (classCode, subject, term) => API.get('/scheme/weekly', { params: { classCode, subject, term } }),
  delete:        (id)       => API.delete(`/scheme/${id}`),
  generateRange: (data)     => API.post('/scheme/generate-range', data, { timeout: 180000 }),
};

export const timetableAPI = {
  upload: (formData) => API.post('/timetable/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 120000 }),
  get: (classCode) => API.get(`/timetable/${classCode}`),
  delete: (classCode) => API.delete(`/timetable/${classCode}`),
};

export default API;

