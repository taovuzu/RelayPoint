import { createAsyncThunk } from '@reduxjs/toolkit';
import { request } from '@/request';

const handleError = (err, rejectWithValue) => {
  return rejectWithValue(
    err.response?.data || { message: err.message, success: false, statusCode: 500, errors: [] }
  );
};

export const fetchSystemHealth = createAsyncThunk('app/fetchSystemHealth', async (_, { rejectWithValue }) => {
  try {
    const response = await request.get('/api/v1/health');
    return response.data;
  } catch (err) {
    return handleError(err, rejectWithValue);
  }
});

// ref: https://redux-toolkit.js.org/api/createSlice
// ref: https://redux-toolkit.js.org/api/createAsyncThunk
