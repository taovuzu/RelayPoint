import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import connectionService from "../../services/connection.service.js";

export const fetchConnections = createAsyncThunk(
  "connections/fetchAll",
  async (_, { rejectWithValue }) => {
    try {
      const response = await connectionService.getAllConnections();
      return response.data.connections || [];
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteConnection = createAsyncThunk(
  "connections/delete",
  async (connectionId, { rejectWithValue }) => {
    try {
      await connectionService.deleteConnection(connectionId);
      return connectionId;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const testConnection = createAsyncThunk(
  "connections/test",
  async (connectionId, { rejectWithValue }) => {
    try {
      const response = await connectionService.testConnection(connectionId);
      return { connectionId, result: response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchGoogleStatus = createAsyncThunk(
  "connections/googleStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await connectionService.getGoogleStatus();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchSolanaStatus = createAsyncThunk(
  "connections/solanaStatus",
  async (_, { rejectWithValue }) => {
    try {
      const response = await connectionService.getSolanaStatus();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const connectionsSlice = createSlice({
  name: "connections",
  initialState: {
    connections: [],
    googleStatus: { connected: false },
    solanaStatus: { connected: false },
    status: "idle", // 'idle' | 'loading' | 'succeeded' | 'failed'
    error: null,
  },
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    updateGoogleStatus: (state, action) => {
      state.googleStatus = action.payload;
    },
    updateSolanaStatus: (state, action) => {
      state.solanaStatus = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchConnections.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchConnections.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.connections = action.payload;
      })
      .addCase(fetchConnections.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.payload;
      })
      .addCase(deleteConnection.fulfilled, (state, action) => {
        state.connections = state.connections.filter(
          (conn) => conn._id !== action.payload
        );
      })
      .addCase(testConnection.fulfilled, (state, action) => {
        const connection = state.connections.find(conn => conn._id === action.payload.connectionId);
        if (connection) {
          connection.lastTested = new Date().toISOString();
          connection.isValid = action.payload.result.isValid;
        }
      })
      .addCase(fetchGoogleStatus.fulfilled, (state, action) => {
        state.googleStatus = action.payload;
      })
      .addCase(fetchSolanaStatus.fulfilled, (state, action) => {
        state.solanaStatus = action.payload;
      });
  },
});

export const { clearError, updateGoogleStatus, updateSolanaStatus } = connectionsSlice.actions;
export default connectionsSlice.reducer;
