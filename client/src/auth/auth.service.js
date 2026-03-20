import { request } from '@/request';

const authService = {
  login: async (credentials) => {
    const response = await request.post('/api/v1/users/login', credentials);
    return response.data;
  },
  registerEmail: async (email) => {
    const response = await request.post('/api/v1/users/register-email', { email });
    return response.data;
  },
  verifyEmailByOTP: async (params) => {
    const response = await request.post('/api/v1/users/verify-email-otp', params);
    return response.data;
  },
  registerUser: async (params) => {
    const response = await request.post('/api/v1/users/register-user', params);
    return response.data;
  },
  logout: async () => {
    const response = await request.post('/api/v1/users/logout');
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await request.get('/api/v1/users/current-user');
    return response.data;
  },
  changePassword: async (params) => {
    const response = await request.post('/api/v1/users/change-password', params);
    return response.data;
  },
  requestPasswordReset: async (email) => {
    const response = await request.post('/api/v1/users/request-password-reset', { email });
    return response.data;
  },
  resetPassword: async (params) => {
    const response = await request.post('/api/v1/users/reset-forgot-password', params);
    return response.data;
  },
  resetPasswordWithToken: async (params) => {
    const response = await request.post('/api/v1/users/reset-forgot-password', params);
    return response.data;
  },
  resendVerification: async (email) => {
    const response = await request.post('/api/v1/users/resend-verification', { email });
    return response.data;
  },
  refreshAccessToken: async () => {
    const response = await request.get('/api/v1/users/refresh-access-token');
    return response.data;
  },
  verifyEmailByLink: async (params) => {
    const response = await request.get('/api/v1/users/verify-email-link', { params });
    return response.data;
  },
  googleLogin: async () => {
    window.location.href = '/api/v1/users/google';
  },
  updateProfile: async (data) => {
    console.warn('updateProfile not implemented on backend');
    return { success: false, message: 'Not implemented' };
  }
};

export default authService;

