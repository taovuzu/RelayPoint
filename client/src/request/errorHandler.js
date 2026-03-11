import request from './request';
import codeMessage from './codeMessage';

let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed() {
  refreshSubscribers.forEach(cb => cb());
  refreshSubscribers = [];
}

function addSubscriber(cb) {
  refreshSubscribers.push(cb);
}

export function setupErrorHandler(store, logoutAction) {
  request.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (originalRequest.url?.includes('/refresh-access-token')) {
          return Promise.reject(error);
        }

        if (isRefreshing) {
          return new Promise((resolve) => {
            addSubscriber(() => resolve(request(originalRequest)));
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          await request.get('/api/v1/users/refresh-access-token');
          isRefreshing = false;
          onRefreshed();
          return request(originalRequest);
        } catch (refreshError) {
          isRefreshing = false;
          refreshSubscribers = [];
          store.dispatch(logoutAction());
          window.location.href = '/login';
          return Promise.reject(refreshError);
        }
      }

      const message = error.response?.data?.message || codeMessage[error.response?.status] || 'Network error';
      error.message = message;

      return Promise.reject(error);
    }
  );
}

// ref: https://axios-http.com/docs/interceptors

