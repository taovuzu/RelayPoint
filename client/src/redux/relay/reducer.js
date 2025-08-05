import { createSlice } from '@reduxjs/toolkit';
import {
  fetchRelays,
  toggleRelay,
  deleteRelay,
  suggestRelay,
  createRelay,
  clearSuggestion
} from './actions';

const initialState = {
  relays: [],
  isLoading: false,
  error: null,
  suggestion: null
};

const relaySlice = createSlice({
  name: 'relay',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchRelays.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRelays.fulfilled, (state, action) => {
        state.isLoading = false;
        state.relays = action.payload || [];
      })
      .addCase(fetchRelays.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || action.error?.message || 'Failed to fetch relays';
      })
      .addCase(toggleRelay.fulfilled, (state, action) => {
        const relayId = action.payload?.relayId;
        state.relays = state.relays.map((r) => (r._id === relayId ? { ...r, active: !r.active } : r));
      })
      .addCase(deleteRelay.fulfilled, (state, action) => {
        const relayId = action.payload?.relayId;
        state.relays = state.relays.filter((r) => r._id !== relayId);
      })
      .addCase(suggestRelay.fulfilled, (state, action) => {
        state.suggestion = action.payload;
      })
      .addCase(clearSuggestion.fulfilled, (state) => {
        state.suggestion = null;
      })
      .addCase(createRelay.fulfilled, (state, action) => {
        state.relays.unshift(action.payload);
      });
  }
});

export const reducer = relaySlice.reducer;


