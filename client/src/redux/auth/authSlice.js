import { createSlice } from '@reduxjs/toolkit';
import {
  login,
  logout,
  updateProfile,
  registerEmail,
  registerUser,
  verifyEmailByLink,
  verifyEmailByOTP,
  resendVerification,
  requestPasswordReset,
  refreshAccessToken,
  getCurrentUser,
  changeCurrentPassword,
  resetPasswordWithToken,
  googleLogin,
  clearEmailRegistrationStep
} from './authThunks.js';

const INITIAL_STATE = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isSuccess: false,
  registrationStep: 'email',
  registrationEmail: null,
  errorMessage: "",
  validationErrors: []
};

const authSlice = createSlice({
  name: 'auth',
  initialState: INITIAL_STATE,
  reducers: {
    clearError: (state) => {
      state.errorMessage = "";
      state.validationErrors = [];
    },
    resetRegistration: (state) => {
      state.registrationStep = 'email';
      state.registrationEmail = null;
    }
  },
  extraReducers: (builder) => {
    const handlePending = (state) => {
      state.isLoading = true;
      state.isSuccess = false;
      state.errorMessage = "";
      state.validationErrors = [];
    };

    const handleRejected = (state, action) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.errorMessage = action.payload?.message || "An unexpected error occurred";
      state.validationErrors = action.payload?.errors || [];
    };

    const handleAuthFulfilled = (state, action) => {
      // Map straight to the backend's explicit data.user structure!
      state.user = action.payload?.data?.user || action.payload?.user || null;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.isSuccess = true;
      state.errorMessage = "";
      state.validationErrors = [];
    };

    builder.addCase(clearEmailRegistrationStep.fulfilled, (state) => {
      state.registrationStep = 'email';
      state.registrationEmail = null;
    });

    // registerEmail (Step 1)
    builder
      .addCase(registerEmail.pending, handlePending)
      .addCase(registerEmail.fulfilled, (state, action) => {
        state.registrationStep = 'otp';
        // Grab email from action arguments (what user typed in) or response payload if backend echoes it
        state.registrationEmail = action.meta.arg || action.payload?.data?.email || null;
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(registerEmail.rejected, handleRejected);

    // verifyEmailByOTP (Step 2)
    builder
      .addCase(verifyEmailByOTP.pending, handlePending)
      .addCase(verifyEmailByOTP.fulfilled, (state) => {
        state.registrationStep = 'account';
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(verifyEmailByOTP.rejected, handleRejected);

    // registerUser (Step 3)
    builder
      .addCase(registerUser.pending, handlePending)
      .addCase(registerUser.fulfilled, (state, action) => {
        state.user = action.payload?.data?.user || action.payload?.user || null;
        state.isAuthenticated = true;
        state.registrationStep = 'email'; // Reset after success
        state.registrationEmail = null;
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        handleRejected(state, action);
      });

    // verifyEmailByLink
    builder
      .addCase(verifyEmailByLink.pending, handlePending)
      .addCase(verifyEmailByLink.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(verifyEmailByLink.rejected, handleRejected);

    // resendVerification
    builder
      .addCase(resendVerification.pending, handlePending)
      .addCase(resendVerification.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(resendVerification.rejected, handleRejected);

    // requestPasswordReset
    builder
      .addCase(requestPasswordReset.pending, handlePending)
      .addCase(requestPasswordReset.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(requestPasswordReset.rejected, handleRejected);

    // refreshAccessToken
    builder
      .addCase(refreshAccessToken.pending, handlePending)
      .addCase(refreshAccessToken.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(refreshAccessToken.rejected, handleRejected);

    // getCurrentUser
    builder
      .addCase(getCurrentUser.pending, handlePending)
      .addCase(getCurrentUser.fulfilled, handleAuthFulfilled)
      .addCase(getCurrentUser.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        handleRejected(state, action);
      });

    // changeCurrentPassword
    builder
      .addCase(changeCurrentPassword.pending, handlePending)
      .addCase(changeCurrentPassword.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(changeCurrentPassword.rejected, handleRejected);

    // resetPasswordWithToken
    builder
      .addCase(resetPasswordWithToken.pending, handlePending)
      .addCase(resetPasswordWithToken.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
      })
      .addCase(resetPasswordWithToken.rejected, handleRejected);

    // googleLogin
    builder
      .addCase(googleLogin.pending, handlePending)
      .addCase(googleLogin.fulfilled, handleAuthFulfilled)
      .addCase(googleLogin.rejected, handleRejected);

    // login
    builder
      .addCase(login.pending, handlePending)
      .addCase(login.fulfilled, handleAuthFulfilled)
      .addCase(login.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        handleRejected(state, action);
      });

    // logout
    builder
      .addCase(logout.pending, handlePending)
      .addCase(logout.fulfilled, () => {
        return INITIAL_STATE;
      })
      .addCase(logout.rejected, (state, action) => {
        state.user = null;
        state.isAuthenticated = false;
        handleRejected(state, action);
      });

    // updateProfile
    builder
      .addCase(updateProfile.pending, handlePending)
      .addCase(updateProfile.fulfilled, handleAuthFulfilled)
      .addCase(updateProfile.rejected, handleRejected);
  },
  selectors: {
    selectAuthState: (state) => state,
    selectCurrentUser: (state) => state.user,
    selectIsAuthenticated: (state) => state.isAuthenticated,
    selectIsLoading: (state) => state.isLoading,
    selectIsSuccess: (state) => state.isSuccess,
    selectRegistrationStep: (state) => state.registrationStep,
    selectRegistrationEmail: (state) => state.registrationEmail,
    selectErrorMessage: (state) => state.errorMessage,
    selectValidationErrors: (state) => state.validationErrors
  }
});

export const { clearError, resetRegistration } = authSlice.actions;

export const {
  selectAuthState,
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectIsSuccess,
  selectRegistrationStep,
  selectRegistrationEmail,
  selectErrorMessage,
  selectValidationErrors
} = authSlice.selectors;

export default authSlice.reducer;

// ref: https://redux-toolkit.js.org/api/createSlice
// ref: https://redux-toolkit.js.org/api/createAsyncThunk
