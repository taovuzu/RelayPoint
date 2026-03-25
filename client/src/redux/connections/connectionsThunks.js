import { createAsyncThunk } from '@reduxjs/toolkit';
import { request } from '@/request';

const handleError = (err, rejectWithValue) => {
  return rejectWithValue(
    err.response?.data || { message: err.message, success: false, statusCode: 500, errors: [] }
  );
};

export const fetchConnections = createAsyncThunk('connections/fetchAll', async (_, { rejectWithValue }) => {
  try {
    const response = await request.get('/api/v1/connections');
    return response.data;
  } catch (err) {
    return handleError(err, rejectWithValue);
  }
});

export const getSessionToken = createAsyncThunk('connections/getSessionToken', async (_, { rejectWithValue }) => {
  try {
    const response = await request.post('/api/v1/connections/session-token');
    return response.data;
  } catch (err) {
    return handleError(err, rejectWithValue);
  }
});

export const deleteConnection = createAsyncThunk('connections/delete', async (id, { rejectWithValue }) => {
  try {
    await request.delete(`/api/v1/connections/${id}`);
    return { data: { id } };
  } catch (err) {
    return handleError(err, rejectWithValue);
  }
});
export const createConnection = createAsyncThunk('connections/create', async (connectionData, { rejectWithValue }) => {
  try {
    const response = await request.post('/api/v1/connections', connectionData);
    return response.data;
  } catch (err) {
    return handleError(err, rejectWithValue);
  }
});

