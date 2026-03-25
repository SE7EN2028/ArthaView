import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001/api',
  timeout: 10000,
});

export const getTransactions = (params = {}) =>
  api.get('/transactions', { params }).then(r => r.data);

export const addTransaction = (data) =>
  api.post('/transactions', data).then(r => r.data);

export const updateTransaction = (id, data) =>
  api.put(`/transactions/${id}`, data).then(r => r.data);

export const deleteTransaction = (id) =>
  api.delete(`/transactions/${id}`).then(r => r.data);

export const clearAllTransactions = () =>
  api.delete(`/transactions`).then(r => r.data);

export const getSummary = () =>
  api.get('/analytics/summary').then(r => r.data);

export const getTrend = () =>
  api.get('/analytics/trend').then(r => r.data);

export const getCategories = () =>
  api.get('/analytics/categories').then(r => r.data);

export const getAnomalies = () =>
  api.get('/analytics/anomalies').then(r => r.data);

export const getRecommendations = () =>
  api.get('/analytics/recommendations').then(r => r.data);

export const getHealthScore = () =>
  api.get('/analytics/health-score').then(r => r.data);

export const uploadCSV = (file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/upload/csv', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
};

export const uploadPDF = (file) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/upload/pdf', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }).then(r => r.data);
};

export default api;
