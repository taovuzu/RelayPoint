import { createSlice } from '@reduxjs/toolkit';
import { fetchConnections, getSessionToken, deleteConnection, createConnection } from './connectionsThunks';

const INITIAL_STATE = {
  connections: [],
  isLoading: false,
  errorMessage: "",
  validationErrors: []
};

const connectionsSlice = createSlice({
  name: 'connections',
  initialState: INITIAL_STATE,
  reducers: {
    clearConnectionsError: (state) => {
      state.errorMessage = "";
      state.validationErrors = [];
    }
  },
  extraReducers: (builder) => {
    const handlePending = (state) => {
      state.isLoading = true;
      state.errorMessage = "";
      state.validationErrors = [];
    };

    const handleRejected = (state, action) => {
      state.isLoading = false;
      state.errorMessage = action.payload?.message || "An unexpected error occurred";
      state.validationErrors = action.payload?.errors || [];
    };

    builder
      .addCase(fetchConnections.pending, handlePending)
      .addCase(fetchConnections.fulfilled, (state, action) => {
        state.isLoading = false;
        state.connections = action.payload.data || [];
      })
      .addCase(fetchConnections.rejected, handleRejected)

      .addCase(getSessionToken.pending, handlePending)
      .addCase(getSessionToken.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(getSessionToken.rejected, handleRejected)

      .addCase(deleteConnection.pending, handlePending)
      .addCase(deleteConnection.fulfilled, (state, action) => {
        state.isLoading = false;
        state.connections = state.connections.filter(c => c.id !== action.payload.data?.id);
      })
      .addCase(deleteConnection.rejected, handleRejected)

      .addCase(createConnection.pending, handlePending)
      .addCase(createConnection.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.data) {
          state.connections.push(action.payload.data);
        }
      })
      .addCase(createConnection.rejected, handleRejected);
  },
  selectors: {
    selectConnectionsState: (state) => state,
    selectConnections: (state) => state.connections,
    selectConnectionsLoading: (state) => state.isLoading,
    selectConnectionsErrorMessage: (state) => state.errorMessage,
    selectConnectionsValidationErrors: (state) => state.validationErrors
  }
});

export const { clearConnectionsError } = connectionsSlice.actions;

export const {
  selectConnectionsState,
  selectConnections,
  selectConnectionsLoading,
  selectConnectionsErrorMessage,
  selectConnectionsValidationErrors
} = connectionsSlice.selectors;

export default connectionsSlice.reducer;


