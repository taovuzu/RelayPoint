import { createAsyncThunk } from '@reduxjs/toolkit';
import { request } from '@/request';

const handleError = (err, rejectWithValue) => {
  return rejectWithValue(
    err.response?.data || { message: err.message, success: false, statusCode: 500, errors: [] }
  );
};

export const fetchWorkflows = createAsyncThunk('workflows/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const response = await request.get('/api/v1/workflows', { params });
    return response.data;
  } catch (err) {
    return handleError(err, rejectWithValue);
  }
});

export const fetchWorkflowById = createAsyncThunk('workflows/fetchById', async (id, { rejectWithValue }) => {
  try {
    const response = await request.get(`/api/v1/workflows/${id}`);
    return response.data;
  } catch (err) {
    return handleError(err, rejectWithValue);
  }
});

export const deleteWorkflow = createAsyncThunk('workflows/delete', async (id, { rejectWithValue }) => {
  try {
    await request.delete(`/api/v1/workflows/${id}`);
    return { data: { id } };
  } catch (err) {
    return handleError(err, rejectWithValue);
  }
});

export const toggleWorkflow = createAsyncThunk('workflows/toggle', async (id, { rejectWithValue }) => {
  try {
    const response = await request.patch(`/api/v1/workflows/${id}/toggle`);
    return response.data;
  } catch (err) {
    return handleError(err, rejectWithValue);
  }
});

export const pollWorkflowRun = createAsyncThunk('workflows/pollRun', async (id, { rejectWithValue }) => {
  try {
    const response = await request.get(`/api/v1/workflows/${id}`);
    return response.data;
  } catch (err) {
    return handleError(err, rejectWithValue);
  }
});

