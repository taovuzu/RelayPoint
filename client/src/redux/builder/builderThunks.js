import { createAsyncThunk } from '@reduxjs/toolkit';
import { request } from '@/request';

const handleError = (err, rejectWithValue) => {
  return rejectWithValue(
    err.response?.data || { message: err.message, success: false, statusCode: 500, errors: [] }
  );
};

export const saveWorkflow = createAsyncThunk('builder/saveWorkflow', async ({ workflowData, id }, { rejectWithValue }) => {
  try {
    const response = id 
      ? await request.patch(`/api/v1/workflows/${id}`, workflowData)
      : await request.post('/api/v1/workflows', workflowData);
    return response.data;
  } catch (err) {
    return handleError(err, rejectWithValue);
  }
});

