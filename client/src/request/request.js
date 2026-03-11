import axios from 'axios';
import envConfig from '@/shared/config/env';
import { getCookie } from '@/shared/lib/cookies';

const request = axios.create({
  baseURL: envConfig.VITE_API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

request.interceptors.request.use((config) => {
  const csrfToken = getCookie('csrf-token');
  if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method)) {
    config.headers['X-CSRF-Token'] = csrfToken;
  }
  return config;
});

request.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.data) {
      error.message = error.response.data.message || error.message;
      error.errors = error.response.data.errors || [];
    }
    return Promise.reject(error);
  }
);

export { request };
export default request;

// ref: https://axios-http.com/docs/intro
