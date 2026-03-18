import { createSlice } from '@reduxjs/toolkit';
import { fetchSystemHealth } from './appThunks.js';

const INITIAL_STATE = {
  theme: 'dark',
  sidebarCollapsed: false,
  pageTitle: '',
  isSystemHealthy: true,
  isLoading: false,
  errorMessage: "",
  validationErrors: []
};

const appSlice = createSlice({
  name: 'app',
  initialState: INITIAL_STATE,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
    },
    setPageTitle: (state, action) => {
      state.pageTitle = action.payload;
    },
    clearAppError: (state) => {
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
      .addCase(fetchSystemHealth.pending, handlePending)
      .addCase(fetchSystemHealth.fulfilled, (state) => {
        state.isLoading = false;
        state.isSystemHealthy = true;
        state.errorMessage = "";
        state.validationErrors = [];
      })
      .addCase(fetchSystemHealth.rejected, (state, action) => {
        state.isSystemHealthy = false;
        handleRejected(state, action);
      });
  },
  selectors: {
    selectAppState: (state) => state,
    selectTheme: (state) => state.theme,
    selectSidebarCollapsed: (state) => state.sidebarCollapsed,
    selectPageTitle: (state) => state.pageTitle,
    selectIsSystemHealthy: (state) => state.isSystemHealthy,
    selectAppIsLoading: (state) => state.isLoading,
    selectAppErrorMessage: (state) => state.errorMessage,
    selectAppValidationErrors: (state) => state.validationErrors
  }
});

export const { toggleSidebar, setTheme, setPageTitle, clearAppError } = appSlice.actions;

export const {
  selectAppState,
  selectTheme,
  selectSidebarCollapsed,
  selectPageTitle,
  selectIsSystemHealthy,
  selectAppIsLoading,
  selectAppErrorMessage,
  selectAppValidationErrors
} = appSlice.selectors;

export default appSlice.reducer;

// ref: https://redux-toolkit.js.org/api/createSlice
// ref: https://redux-toolkit.js.org/api/createAsyncThunk
