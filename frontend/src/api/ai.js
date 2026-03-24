// AI API helpers
import axios from 'axios';

const api = axios.create({ baseURL: 'http://localhost:5001/api', timeout: 30000 });

export const chatWithAI = (message, history = []) =>
  api.post('/ai/chat', { message, history }).then(r => r.data);

export const getQuickInsights = () =>
  api.get('/ai/quick-insights').then(r => r.data);
