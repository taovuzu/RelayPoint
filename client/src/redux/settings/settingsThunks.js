import { createAsyncThunk } from '@reduxjs/toolkit';
import { request } from '@/request';

const handleError = (err, rejectWithValue) => {
  return rejectWithValue(
    err.response?.data || { message: err.message, success: false, statusCode: 500, errors: [] }
  );
};

export const updateProfile = createAsyncThunk('settings/updateProfile', async (profileData, { rejectWithValue }) => {
  try {
    const response = await request.patch('/api/v1/users/profile', profileData);
    return response.data;
  } catch (err) {
    return handleError(err, rejectWithValue);
  }
});

export const changePassword = createAsyncThunk('settings/changePassword', async (passwordData, { rejectWithValue }) => {
  try {
    const response = await request.post('/api/v1/users/change-password', passwordData);
    return response.data;
  } catch (err) {
    return handleError(err, rejectWithValue);
  }
});

