import { createAsyncThunk } from '@reduxjs/toolkit';
import * as authService from '@/auth';
import { request } from '@/request';

export const clearEmailRegistrationStep = createAsyncThunk(
  'auth/clearEmailRegistrationStep',
  async () => {
    return null;
  }
);

export const registerEmail = createAsyncThunk(
  'auth/registerEmail',
  async ({ email }, { rejectWithValue }) => {
    try {
      try { console.log('[auth/actions] registerEmail start', { email }); } catch (_) {}
      const data = await authService.registerEmail({ email });

      if (data.success === true) {
        try { console.log('[auth/actions] registerEmail success', data?.result); } catch (_) {}
        return data.result;
      }
      try { console.warn('[auth/actions] registerEmail failed', data); } catch (_) {}
      return rejectWithValue(data?.error || 'Email registration failed');
    } catch (error) {
      try { console.error('[auth/actions] registerEmail error', error?.message); } catch (_) {}
      return rejectWithValue(error.response?.data?.message || error.message || 'Email registration failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async ({ registerData }, { rejectWithValue }) => {
    try {
      try { console.log('[auth/actions] registerUser start', registerData); } catch (_) {}
      const data = await authService.registerUser({ registerData });

      if (data.success === true) {
        try { console.log('[auth/actions] registerUser success', data?.result); } catch (_) {}
        return data.result;
      }
      try { console.warn('[auth/actions] registerUser failed', data); } catch (_) {}
      return rejectWithValue(data?.error || 'User registration failed');
    } catch (error) {
      try { console.error('[auth/actions] registerUser error', error?.message); } catch (_) {}
      return rejectWithValue(error.response?.data?.message || error.message || 'User registration failed');
    }
  }
);

export const verifyEmailByLink = createAsyncThunk(
  'auth/verifyEmailByLink',
  async ({ email, unHashedToken }, { rejectWithValue }) => {
    try {
      const data = await authService.verifyEmailByLink({ email, unHashedToken });

      if (data.success === true) {
        return data.result; // { registrationToken, email }
      }
      return rejectWithValue(data?.error || 'Email verification failed');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Email verification failed');
    }
  }
);

export const verifyEmailByOTP = createAsyncThunk(
  'auth/verifyEmailByOTP',
  async ({ email, otp }, { rejectWithValue }) => {
    try {
      const data = await authService.verifyEmailByOTP({ email, otp });

      if (data.success === true) {
        return data.result; // { registrationToken }
      }
      return rejectWithValue(data?.error || 'OTP verification failed');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'OTP verification failed');
    }
  }
);

export const resendVerification = createAsyncThunk(
  'auth/resendVerification',
  async ({ email }, { rejectWithValue }) => {
    try {
      const data = await authService.resendVerification({ email });

      if (data.success === true) {
        return data.result;
      }
      return rejectWithValue(data?.error || 'Email registration failed');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Email registration failed');
    }
  }
);

export const login = createAsyncThunk(
  'auth/login',
  async ({ loginData }, { rejectWithValue }) => {
    try {
      try { console.log('[auth/actions] login start', { email: loginData?.email }); } catch (_) {}
      const data = await authService.login({ loginData });

      if (data.success === true) {
        try { console.log('[auth/actions] login success', data?.result); } catch (_) {}

        return data.result;
      }
      try { console.warn('[auth/actions] login failed', data); } catch (_) {}
      return rejectWithValue(data?.error || 'Login failed');
    } catch (error) {
      try { console.error('[auth/actions] login error', error?.message); } catch (_) {}
      return rejectWithValue(error.response?.data?.message || error.message || 'Login failed');
    }
  }
);

export const requestPasswordReset = createAsyncThunk(
  'auth/requestPasswordReset',
  async ({ email }, { rejectWithValue }) => {
    try {
      const data = await authService.requestPasswordReset({ email });

      if (data.success === true) {
        return data.result;
      }
      return rejectWithValue(data?.error || 'Password reset request failed');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Password reset request failed');
    }
  }
);

export const refreshAccessToken = createAsyncThunk(
  'auth/refreshAccessToken',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.refreshAccessToken();

      if (data.success === true) {
        return data.result;
      }
      return rejectWithValue(data?.error || 'Token refresh failed');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Token refresh failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      try { console.log('[auth/actions] getCurrentUser start'); } catch (_) {}
      const data = await authService.getCurrentUser();

      if (data.success === true) {
        try { console.log('[auth/actions] getCurrentUser success', data?.result); } catch (_) {}
        return data.result;
      }
      try { console.warn('[auth/actions] getCurrentUser failed', data); } catch (_) {}
      return rejectWithValue(data?.error || 'Failed to get current user');
    } catch (error) {
      try { console.error('[auth/actions] getCurrentUser error', error?.message); } catch (_) {}
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to get current user');
    }
  }
);

export const changeCurrentPassword = createAsyncThunk(
  'auth/changeCurrentPassword',
  async ({ oldPassword, newPassword }, { rejectWithValue }) => {
    try {
      const data = await authService.changeCurrentPassword({ oldPassword, newPassword });

      if (data.success === true) {
        return data.result;
      }
      return rejectWithValue(data?.error || 'Password change failed');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Password change failed');
    }
  }
);

export const resetPasswordWithToken = createAsyncThunk(
  "auth/resetPasswordWithToken",
  async ({ email, unHashedToken, newPassword }, { rejectWithValue }) => {
    try {
      const data = await authService.resetPasswordWithToken({
        email,
        unHashedToken,
        newPassword
      });

      if (data.success === true) {
        return data.result;
      }

      return rejectWithValue(data?.error || "Password reset failed");
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      const data = await authService.logout();

      if (data.success === false) {
        return rejectWithValue(data?.error || 'Logout failed');
      }

      return data.result;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Logout failed');
    }
  }
);

export const updateProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ entity, jsonData }, { rejectWithValue }) => {
    try {
      const data = await request.updateAndUpload({ entity, id: '', jsonData });

      if (data.success === true) {
        return data.result;
      }
      return rejectWithValue(data?.error || 'Profile update failed');
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Profile update failed');
    }
  }
);