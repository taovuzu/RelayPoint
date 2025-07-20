import axios from 'axios';
import { API_BASE_URL } from '../config/serverApiConfig';
import errorHandler from './errorHandler';
import successHandler from './successHandler';
import { getCsrfToken } from '../utils/csrf';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 10000
});

axiosInstance.interceptors.request.use((config) => {
  try { console.log('[request] request', { method: config.method, url: config.url, baseURL: config.baseURL }); } catch (_) {}
  const needsCsrf = ['post', 'put', 'patch', 'delete'].includes((config.method || '').toLowerCase());
  if (needsCsrf) {
    const token = getCsrfToken();
    if (token) config.headers['X-CSRF-Token'] = token;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    try { console.error('[request] response error', error?.response || error?.message); } catch (_) {}
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      const isRefreshRequest = typeof originalRequest.url === 'string' && originalRequest.url.includes('users/refresh');
      if (isRefreshRequest) {
        try { console.warn('[request] refresh endpoint returned 401'); } catch (_) {}
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      try {
        try { console.log('[request] attempting refresh-access-token'); } catch (_) {}
        await axiosInstance.get('users/refresh-access-token');
        try { console.log('[request] refresh successful, retrying original request'); } catch (_) {}
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        try { console.error('[request] refresh failed', refreshError?.response || refreshError?.message); } catch (_) {}
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

const sendRequest = async (method, url, data = null, config = {}, successOptions) => {
  try {
    try { console.log('[request] send', { method, url, data }); } catch (_) {}
    const response = await axiosInstance({ method, url, data, ...config });
    if (successOptions) successHandler(response, successOptions);
    try { console.log('[request] response', { status: response?.status, data: response?.data }); } catch (_) {}
    return response.data;
  } catch (error) {
    const handled = errorHandler(error);
    try { console.error('[request] handled error', handled); } catch (_) {}
    return handled;
  }
};

const buildQuery = (options = {}) =>
Object.entries(options).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join('&');

// Generic request function for all API calls
const apiRequest = async (method, endpoint, data = {}, successOptions = {}) => {
  try {
    try { console.log('[apiRequest]', { method, endpoint, data }); } catch (_) {}
    const response = await axiosInstance({ 
      method, 
      url: endpoint, 
      data, 
      headers: { 'Content-Type': 'application/json' }, 
      withCredentials: true,
      ...(successOptions?.suppressNotify && { __suppressNotify: true })
    });
    const payload = response?.data || {};
    try { console.log('[apiRequest] response', { status: response?.status, payload }); } catch (_) {}

    if (successOptions && !successOptions.suppressNotify) {
      successHandler({ data: payload, status: response.status }, successOptions);
    }

    return {
      success: payload?.success === true,
      message: payload?.message || '',
      result: payload?.data ?? null,
      statusCode: payload?.statusCode || response?.status
    };
  } catch (error) {
    const handled = errorHandler(error);
    try { console.error('[apiRequest] error handled', handled); } catch (_) {}
    if (handled && typeof handled === 'object') {
      return {
        success: false,
        error: handled?.error || handled?.message || 'Request failed',
        message: handled?.message || 'Request failed'
      };
    }
    return { success: false, error: 'Request failed', message: 'Request failed' };
  }
};

const request = {
  // Legacy methods for backward compatibility
  create: (p) =>
  sendRequest('post', `${p.entity}/create`, p.jsonData, {}, { notifyOnSuccess: true, notifyOnFailed: true }),

  createAndUpload: (p) =>
  sendRequest('post', `${p.entity}/create`, p.jsonData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }, { notifyOnSuccess: true, notifyOnFailed: true }),

  read: (p) =>
  sendRequest('get', `${p.entity}/read/${p.id}`, null, {}, { notifyOnSuccess: false, notifyOnFailed: true }),

  update: (p) =>
  sendRequest('patch', `${p.entity}/update/${p.id}`, p.jsonData, {}, { notifyOnSuccess: true, notifyOnFailed: true }),

  updateAndUpload: (p) =>
  sendRequest('patch', `${p.entity}/update/${p.id}`, p.jsonData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }, { notifyOnSuccess: true, notifyOnFailed: true }),

  delete: (p) =>
  sendRequest('delete', `${p.entity}/delete/${p.id}`, null, {}, { notifyOnSuccess: true, notifyOnFailed: true }),

  filter: (p) => {
    const query = buildQuery({
      ...(p.options.filter && { filter: p.options.filter }),
      ...(p.options.equal && { equal: p.options.equal })
    });
    return sendRequest('get', `${p.entity}/filter?${query}`, null, {}, { notifyOnSuccess: false, notifyOnFailed: false });
  },

  search: (p) =>
  sendRequest('get', `${p.entity}/search?${buildQuery(p.options)}`, null, {}, { notifyOnSuccess: false, notifyOnFailed: false }),

  list: (p) =>
  sendRequest('get', `${p.entity}/list?${buildQuery(p.options)}`, null, {}, { notifyOnSuccess: false, notifyOnFailed: false }),

  listAll: (p) =>
  sendRequest('get', `${p.entity}/listAll?${buildQuery(p.options)}`, null, {}, { notifyOnSuccess: false, notifyOnFailed: false }),

  post: (p) => {
    const config = {};
    const isFileUpload = p.jsonData instanceof FormData;
    if (isFileUpload) {
      config.headers = {};
    }
    if (p.onUploadProgress) {
      config.onUploadProgress = p.onUploadProgress;
    }
    return sendRequest('post', p.entity, p.jsonData, config);
  },

  get: (p) => sendRequest('get', p.entity),

  patch: (p) =>
  sendRequest('patch', p.entity, p.jsonData, {}, { notifyOnSuccess: true, notifyOnFailed: true }),

  upload: (p) =>
  sendRequest('patch', `${p.entity}/upload/${p.id}`, p.jsonData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }, { notifyOnSuccess: true, notifyOnFailed: true }),

  source: () => axios.CancelToken.source(),

  summary: (p) =>
  sendRequest('get', `${p.entity}/summary?${buildQuery(p.options)}`, null, {}, { notifyOnSuccess: false, notifyOnFailed: false }),

  mail: (p) =>
  sendRequest('post', `${p.entity}/mail/`, p.jsonData, {}, { notifyOnSuccess: true, notifyOnFailed: true }),

  convert: (p) =>
  sendRequest('get', `${p.entity}/convert/${p.id}`, null, {}, { notifyOnSuccess: true, notifyOnFailed: true }),

  // ===== AUTHENTICATION ENDPOINTS =====
  auth: {
    registerEmail: (email) =>
      apiRequest('post', 'users/register-email', { email }, { notifyOnSuccess: false, notifyOnFailed: false }),

    registerUser: (registerData) =>
      apiRequest('post', 'users/register-user', registerData, { notifyOnSuccess: false, notifyOnFailed: false }),

    resendVerification: (email) =>
      apiRequest('post', 'users/resend-verification', { email }, { notifyOnSuccess: false, notifyOnFailed: false }),

    verifyEmailByLink: (email, unHashedToken) =>
      apiRequest('get', `users/verify-email-link?email=${encodeURIComponent(email)}&unHashedToken=${encodeURIComponent(unHashedToken)}&response=json`, null, { notifyOnSuccess: false, notifyOnFailed: false }),

    verifyEmailByOTP: (email, otp) =>
      apiRequest('post', 'users/verify-email-otp', { email, otp }, { notifyOnSuccess: false, notifyOnFailed: false }),

    login: (loginData) =>
      apiRequest('post', 'users/login', loginData, { notifyOnSuccess: false, notifyOnFailed: false }),

    requestPasswordReset: (email) =>
      apiRequest('post', 'users/request-password-reset', { email }, { notifyOnSuccess: false, notifyOnFailed: false }),

    refreshAccessToken: () =>
      apiRequest('get', 'users/refresh-access-token', {}, { notifyOnSuccess: false, notifyOnFailed: false }),

    logout: () =>
      apiRequest('post', 'users/logout', {}, { notifyOnSuccess: false, notifyOnFailed: false }),

    getCurrentUser: () =>
      apiRequest('get', 'users/current-user', {}, { notifyOnSuccess: false, notifyOnFailed: false, suppressNotify: true }),

    changeCurrentPassword: (oldPassword, newPassword) =>
      apiRequest('post', 'users/change-password', { oldPassword, newPassword }, { notifyOnSuccess: false, notifyOnFailed: false }),

    resetPasswordWithToken: (email, unHashedToken, newPassword) =>
      apiRequest('post', 'users/reset-forgot-password', { email, unHashedToken, newPassword }, { notifyOnSuccess: false, notifyOnFailed: false }),

    googleLogin: () => {
      window.location.href = `${API_BASE_URL}users/google`;
    }
  },

  // ===== RELAY ENDPOINTS =====
  relay: {
    create: (relayData) =>
      apiRequest('post', 'relays/', relayData, { notifyOnSuccess: true, notifyOnFailed: true }),

    getUserRelays: (options = {}) => {
      const queryParams = new URLSearchParams();
      if (options.limit) queryParams.append('limit', options.limit);
      if (options.offset) queryParams.append('offset', options.offset);
      if (options.status) queryParams.append('status', options.status);
      
      const query = queryParams.toString();
      const endpoint = query ? `relays/?${query}` : 'relays/';
      
      return apiRequest('get', endpoint, {}, { notifyOnSuccess: false, notifyOnFailed: true });
    },

    get: (relayId) =>
      apiRequest('get', `relays/${relayId}`, {}, { notifyOnSuccess: false, notifyOnFailed: true }),

    update: (relayId, relayData) =>
      apiRequest('put', `relays/${relayId}`, relayData, { notifyOnSuccess: true, notifyOnFailed: true }),

    delete: (relayId) =>
      apiRequest('delete', `relays/${relayId}`, {}, { notifyOnSuccess: true, notifyOnFailed: true }),

    toggle: (relayId) =>
      apiRequest('patch', `relays/${relayId}/toggle`, {}, { notifyOnSuccess: true, notifyOnFailed: true }),

    getRuns: (relayId, options = {}) => {
      const queryParams = new URLSearchParams();
      if (options.limit) queryParams.append('limit', options.limit);
      if (options.offset) queryParams.append('offset', options.offset);
      if (options.status) queryParams.append('status', options.status);
      
      const query = queryParams.toString();
      const endpoint = query ? `relays/${relayId}/runs?${query}` : `relays/${relayId}/runs`;
      
      return apiRequest('get', endpoint, {}, { notifyOnSuccess: false, notifyOnFailed: true });
    },

    test: (relayId, testData = {}) =>
      apiRequest('post', `relays/${relayId}/test`, testData, { notifyOnSuccess: true, notifyOnFailed: true })
  },

  // ===== ACTION ENDPOINTS =====
  action: {
    getAvailable: () =>
      apiRequest('get', 'actions/available', {}, { notifyOnSuccess: false, notifyOnFailed: true }),

    getById: (actionId) =>
      apiRequest('get', `actions/${actionId}`, {}, { notifyOnSuccess: false, notifyOnFailed: true })
  },

  // ===== TRIGGER ENDPOINTS =====
  trigger: {
    getAvailable: () =>
      apiRequest('get', 'triggers/available', {}, { notifyOnSuccess: false, notifyOnFailed: true }),

    getById: (triggerId) =>
      apiRequest('get', `triggers/${triggerId}`, {}, { notifyOnSuccess: false, notifyOnFailed: true })
  },

  // ===== SUGGESTER ENDPOINTS =====
  suggester: {
    suggest: (prompt) =>
      apiRequest('post', 'suggester/suggest', { prompt }, { notifyOnSuccess: false, notifyOnFailed: true })
  },

  // ===== WEBHOOK ENDPOINTS =====
  webhook: {
    getUrl: (relayId) =>
      apiRequest('get', `hooks/url/${relayId}`, {}, { notifyOnSuccess: false, notifyOnFailed: true }),

    regenerateUrl: (relayId) =>
      apiRequest('post', `hooks/regenerate/${relayId}`, {}, { notifyOnSuccess: true, notifyOnFailed: true }),

    // Public webhook endpoint (no auth required)
    catch: (userId, relayId, webhookData) =>
      sendRequest('post', `hooks/catch/${userId}/${relayId}`, webhookData, {}, { notifyOnSuccess: false, notifyOnFailed: false })
  },

  // ===== CONNECTION ENDPOINTS =====
  connection: {
    getAll: () =>
      apiRequest('get', 'connections', {}, { notifyOnSuccess: false, notifyOnFailed: true }),

    get: (connectionId) =>
      apiRequest('get', `connections/${connectionId}`, {}, { notifyOnSuccess: false, notifyOnFailed: true }),

    create: (connectionData) =>
      apiRequest('post', 'connections', connectionData, { notifyOnSuccess: true, notifyOnFailed: true }),

    update: (connectionId, connectionData) =>
      apiRequest('put', `connections/${connectionId}`, connectionData, { notifyOnSuccess: true, notifyOnFailed: true }),

    delete: (connectionId) =>
      apiRequest('delete', `connections/${connectionId}`, {}, { notifyOnSuccess: true, notifyOnFailed: true }),

    test: (connectionId) =>
      apiRequest('post', `connections/${connectionId}/test`, {}, { notifyOnSuccess: true, notifyOnFailed: true })
  },

  // ===== GOOGLE CONNECTION ENDPOINTS =====
  googleConnection: {
    getStatus: () =>
      apiRequest('get', 'connections/google/status', {}, { notifyOnSuccess: false, notifyOnFailed: true }),

    startAuth: () => {
      const cleanBaseUrl = API_BASE_URL.endsWith('/') ? API_BASE_URL.slice(0, -1) : API_BASE_URL;
      window.location.href = `${cleanBaseUrl}/connections/google/auth`;
    },

    disconnect: () =>
      apiRequest('delete', 'connections/google/disconnect', {}, { notifyOnSuccess: true, notifyOnFailed: true })
  },

  // ===== GMAIL ENDPOINTS =====
  gmail: {
    test: () =>
      apiRequest('post', 'gmail/test', {}, { notifyOnSuccess: true, notifyOnFailed: true })
  },

  // ===== GOOGLE SHEETS ENDPOINTS =====
  sheets: {
    test: () =>
      apiRequest('post', 'sheets/test', {}, { notifyOnSuccess: true, notifyOnFailed: true }),

    extractId: (url) =>
      apiRequest('post', 'sheets/extract-id', { url }, { notifyOnSuccess: false, notifyOnFailed: true }),

    getSpreadsheetMetadata: (spreadsheetId) =>
      apiRequest('get', `sheets/spreadsheet/${spreadsheetId}/metadata`, {}, { notifyOnSuccess: false, notifyOnFailed: true }),

    getSheetData: (spreadsheetId, range) =>
      apiRequest('get', `sheets/spreadsheet/${spreadsheetId}/data?range=${encodeURIComponent(range)}`, {}, { notifyOnSuccess: false, notifyOnFailed: true }),

    appendRow: (spreadsheetId, range, values) =>
      apiRequest('post', `sheets/spreadsheet/${spreadsheetId}/append`, { range, values }, { notifyOnSuccess: true, notifyOnFailed: true }),

    updateCells: (spreadsheetId, range, values) =>
      apiRequest('put', `sheets/spreadsheet/${spreadsheetId}/update`, { range, values }, { notifyOnSuccess: true, notifyOnFailed: true }),

    getRowCount: (spreadsheetId, sheetName) =>
      apiRequest('get', `sheets/spreadsheet/${spreadsheetId}/row-count?sheetName=${encodeURIComponent(sheetName)}`, {}, { notifyOnSuccess: false, notifyOnFailed: true })
  },

  // ===== WEBHOOK ENDPOINTS =====
  webhook: {
    generateUrl: (relayId) =>
      apiRequest('post', `webhooks/relay/${relayId}/generate-url`, {}, { notifyOnSuccess: true, notifyOnFailed: true }),

    getTriggerInfo: (triggerId) =>
      apiRequest('get', `webhooks/trigger/${triggerId}/info`, {}, { notifyOnSuccess: false, notifyOnFailed: true }),

    testTrigger: (triggerId, testData) =>
      apiRequest('post', `webhooks/trigger/${triggerId}/test`, testData, { notifyOnSuccess: true, notifyOnFailed: true })
  },

  // ===== SOLANA ENDPOINTS =====
  solana: {
    getStatus: () =>
      apiRequest('get', 'solana/status', {}, { notifyOnSuccess: false, notifyOnFailed: true }),

    connect: (privateKey) =>
      apiRequest('post', 'solana/connect', { privateKey }, { notifyOnSuccess: true, notifyOnFailed: true }),

    disconnect: () =>
      apiRequest('delete', 'solana/disconnect', {}, { notifyOnSuccess: true, notifyOnFailed: true }),

    testConnection: () =>
      apiRequest('post', 'solana/test-connection', {}, { notifyOnSuccess: true, notifyOnFailed: true }),

    getBalance: () =>
      apiRequest('get', 'solana/balance', {}, { notifyOnSuccess: false, notifyOnFailed: true }),

    sendSol: (recipient, amount) =>
      apiRequest('post', 'solana/send', { recipient, amount }, { notifyOnSuccess: true, notifyOnFailed: true }),

    getTransaction: (signature) =>
      apiRequest('get', `solana/transaction/${signature}`, {}, { notifyOnSuccess: false, notifyOnFailed: true }),

    getAccountInfo: () =>
      apiRequest('get', 'solana/account', {}, { notifyOnSuccess: false, notifyOnFailed: true }),

    getNetworkInfo: () =>
      apiRequest('get', 'solana/network', {}, { notifyOnSuccess: false, notifyOnFailed: true }),

    validateAddress: (address) =>
      apiRequest('post', 'solana/validate-address', { address }, { notifyOnSuccess: false, notifyOnFailed: true })
  },

  // ===== HEALTH ENDPOINTS =====
  health: {
    getStatus: () =>
      apiRequest('get', 'health/', {}, { notifyOnSuccess: false, notifyOnFailed: false }),

    getRedis: () =>
      apiRequest('get', 'health/redis', {}, { notifyOnSuccess: false, notifyOnFailed: false }),

    getMongoDB: () =>
      apiRequest('get', 'health/mongodb', {}, { notifyOnSuccess: false, notifyOnFailed: false }),

    getAll: () =>
      apiRequest('get', 'health/all', {}, { notifyOnSuccess: false, notifyOnFailed: false })
  }
};

export default request;
