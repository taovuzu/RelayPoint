import { createAsyncThunk } from '@reduxjs/toolkit';
import authService from '@/auth/auth.service';

const handleError = (err, rejectWithValue) => {
  return rejectWithValue(
    err.response?.data || { message: err.message, success: false, statusCode: 500, errors: [] }
  );
};

export const login = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    return await authService.login(credentials);
  } catch (err) {
    return handleError(err, rejectWithValue);
  }
});

export const logout = createAsyncThunk('auth/logout', async (_, { rejectWithValue }) => {
  try {
    return await authService.logout();
  } catch (err) {
    return handleError(err, rejectWithValue);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    return await authService.updateProfile(data);
  } catch (err) {
    return handleError(err, rejectWithValue);
  }
});

export const registerEmail = createAsyncThunk('auth/registerEmail', async (email, { rejectWithValue }) => {
  try {
    return await authService.registerEmail(email);
  } catch (err) {
    return handleError(err, rejectWithValue);
  }
});

export const registerUser = createAsyncThunk('auth/registerUser', async (params, { rejectWithValue }) => {
  try {
    return await authService.registerUser(params);
  } catch (err) {
    return handleError(err, rejectWithValue);
  }
});

export const verifyEmailByLink = createAsyncThunk('auth/verifyEmailByLink', async (token, { rejectWithValue }) => {
  try {
    return await authService.verifyEmailByLink(token);
  } catch (err) {
    return handleError(err, rejectWithValue);
  }
});

export const verifyEmailByOTP = createAsyncThunk('auth/verifyEmailByOTP', async (params, { rejectWithValue }) => {
  try {
    return await authService.verifyEmailByOTP(params);
  } catch (err) {
    return handleError(err, rejectWithValue);
  }
});

export const resendVerification = createAsyncThunk('auth/resendVerification', async (email, { rejectWithValue }) => {
  try {
    return await authService.resendVerification(email);
  } catch (err) {
    return handleError(err, rejectWithValue);
  }
});

export const requestPasswordReset = createAsyncThunk('auth/requestPasswordReset', async (email, { rejectWithValue }) => {
  try {
    return await authService.requestPasswordReset(email);
  } catch (err) {
    return handleError(err, rejectWithValue);
  }
});

export const refreshAccessToken = createAsyncThunk('auth/refreshAccessToken', async (_, { rejectWithValue }) => {
  try {
    return await authService.refreshAccessToken();
  } catch (err) {
    return handleError(err, rejectWithValue);
  }
});

export const getCurrentUser = createAsyncThunk('auth/getCurrentUser', async (_, { rejectWithValue }) => {
  try {
    return await authService.getCurrentUser();
  } catch (err) {
    return handleError(err, rejectWithValue);
  }
});

export const changeCurrentPassword = createAsyncThunk('auth/changeCurrentPassword', async (params, { rejectWithValue }) => {
  try {
    return await authService.changePassword(params);
  } catch (err) {
    return handleError(err, rejectWithValue);
  }
});

export const resetPasswordWithToken = createAsyncThunk('auth/resetPasswordWithToken', async (params, { rejectWithValue }) => {
  try {
    return await authService.resetPasswordWithToken(params);
  } catch (err) {
    return handleError(err, rejectWithValue);
  }
});

export const googleLogin = createAsyncThunk('auth/googleLogin', async (token, { rejectWithValue }) => {
  try {
    return await authService.googleLogin(token);
  } catch (err) {
    return handleError(err, rejectWithValue);
  }
});

export const clearEmailRegistrationStep = createAsyncThunk('auth/clearEmailRegistrationStep', async () => {
  return true;
});


// ref: https://redux-toolkit.js.org/api/createSlice
// ref: https://redux-toolkit.js.org/api/createAsyncThunk
