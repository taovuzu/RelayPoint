import { createAsyncThunk } from '@reduxjs/toolkit';
import { request } from '@/request';

export const fetchRelays = createAsyncThunk(
  'relay/fetchRelays',
  async (_, { rejectWithValue }) => {
    try {
      const data = await request.relay.getUserRelays();
      if (data?.success === true) {
        return data.result?.relays || [];
      }
      return rejectWithValue(data?.error || 'Failed to fetch relays');
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to fetch relays');
    }
  }
);

export const toggleRelay = createAsyncThunk(
  'relay/toggleRelay',
  async (relayId, { rejectWithValue }) => {
    try {
      const data = await request.relay.toggle(relayId);
      if (data?.success === true) {
        return { relayId };
      }
      return rejectWithValue(data?.error || 'Failed to toggle relay');
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to toggle relay');
    }
  }
);

export const deleteRelay = createAsyncThunk(
  'relay/deleteRelay',
  async (relayId, { rejectWithValue }) => {
    try {
      const data = await request.relay.delete(relayId);
      if (data?.success === true) {
        return { relayId };
      }
      return rejectWithValue(data?.error || 'Failed to delete relay');
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to delete relay');
    }
  }
);

export const suggestRelay = createAsyncThunk(
  'relay/suggestRelay',
  async (prompt, { rejectWithValue }) => {
    try {
      const data = await request.suggester.suggest(prompt);
      if (data?.success === true) {
        return data.result;
      }
      return rejectWithValue(data?.error || 'Failed to suggest relay');
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to suggest relay');
    }
  }
);

export const createRelay = createAsyncThunk(
  'relay/createRelay',
  async (relayData, { rejectWithValue }) => {
    try {
      const data = await request.relay.create(relayData);
      if (data?.success === true) {
        return data.result?.relay || null;
      }
      return rejectWithValue(data?.error || 'Failed to create relay');
    } catch (error) {
      return rejectWithValue(error?.message || 'Failed to create relay');
    }
  }
);

export const clearSuggestion = createAsyncThunk('relay/clearSuggestion', async () => null);


