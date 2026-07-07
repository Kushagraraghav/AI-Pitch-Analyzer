import axios from 'axios';

const rawBase = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const base = rawBase.replace(/\/$/, '');
const apiClient = axios.create({
  baseURL: `${base}/api`,
});

apiClient.interceptors.request.use((config) => {
  config.headers = config.headers || {};
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default apiClient;
