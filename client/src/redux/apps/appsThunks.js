import { createAsyncThunk } from '@reduxjs/toolkit';
import { request } from '@/request';

export const fetchApps = createAsyncThunk('apps/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await request.get('/api/v1/apps');
    return response.data.data;
  } catch (err) {
    return rejectWithValue(
      err.response?.data || { message: err.message, success: false, statusCode: 500, errors: [] }
    );
  }
});
