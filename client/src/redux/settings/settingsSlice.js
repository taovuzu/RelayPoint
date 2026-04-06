import { createSlice } from '@reduxjs/toolkit';
import { updateProfile, changePassword } from './settingsThunks';

const INITIAL_STATE = {
  preferences: {},
  isLoading: false,
  errorMessage: "",
  validationErrors: []
};

const settingsSlice = createSlice({
  name: 'settings',
  initialState: INITIAL_STATE,
  reducers: {
    clearSettingsError: (state) => {
      state.errorMessage = "";
      state.validationErrors = [];
    },
    updateLocalPreferences: (state, action) => {
      state.preferences = { ...state.preferences, ...action.payload };
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
      .addCase(updateProfile.pending, handlePending)
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.preferences = { ...state.preferences, ...action.payload.data };
      })
      .addCase(updateProfile.rejected, handleRejected)
      
      .addCase(changePassword.pending, handlePending)
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(changePassword.rejected, handleRejected);
  },
  selectors: {
    selectSettingsState: (state) => state,
    selectPreferences: (state) => state.preferences,
    selectSettingsLoading: (state) => state.isLoading,
    selectSettingsErrorMessage: (state) => state.errorMessage,
    selectSettingsValidationErrors: (state) => state.validationErrors
  }
});

export const { clearSettingsError, updateLocalPreferences } = settingsSlice.actions;

export const {
  selectSettingsState,
  selectPreferences,
  selectSettingsLoading,
  selectSettingsErrorMessage,
  selectSettingsValidationErrors
} = settingsSlice.selectors;

export default settingsSlice.reducer;

