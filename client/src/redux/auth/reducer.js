import { createSlice, isPending, isFulfilled, isRejected } from '@reduxjs/toolkit';
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
  clearEmailRegistrationStep
} from
  './actions';

const INITIAL_STATE = {
  current: {},
  isLoggedIn: false,
  isLoading: false,
  isSuccess: false,
  emailRegistrationStep: false,
  error: null
};

const authSlice = createSlice({
  name: 'auth',
  initialState: INITIAL_STATE,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(logout.fulfilled, () => { try { console.log('[auth/reducer] logout.fulfilled'); } catch (_) { }; return INITIAL_STATE; })
      .addCase(getCurrentUser.rejected, (state) => {
        try { console.warn('[auth/reducer] getCurrentUser.rejected'); } catch (_) { }
        state.isLoading = false;
        state.isLoggedIn = false;
        state.current = {};
        state.error = 'Session validation failed';
      })
      .addCase(clearEmailRegistrationStep.fulfilled, (state) => {
        state.emailRegistrationStep = false;
      })
      .addCase(registerEmail.fulfilled, (state) => {
        try { console.log('[auth/reducer] registerEmail.fulfilled'); } catch (_) { }
        state.emailRegistrationStep = true;
      })
      .addCase(registerEmail.rejected, (state) => {
        try { console.warn('[auth/reducer] registerEmail.rejected'); } catch (_) { }
        state.emailRegistrationStep = false;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        try { console.log('[auth/reducer] registerUser.fulfilled'); } catch (_) { }
        state.current = action.payload;
        state.isLoggedIn = true;
        state.emailRegistrationStep = false;
      })
      .addCase(registerUser.rejected, (state) => {
        try { console.warn('[auth/reducer] registerUser.rejected'); } catch (_) { }
        state.emailRegistrationStep = false;
        return INITIAL_STATE;
      })
      .addCase(verifyEmailByLink.fulfilled, (state) => {
        try { console.log('[auth/reducer] verifyEmailByLink.fulfilled'); } catch (_) { }
        state.isLoggedIn = false;
      })
      .addCase(verifyEmailByOTP.fulfilled, (state) => {
        try { console.log('[auth/reducer] verifyEmailByOTP.fulfilled'); } catch (_) { }
        state.isLoggedIn = false;
      })
      .addCase(verifyEmailByOTP.rejected, (state) => {
        try { console.warn('[auth/reducer] verifyEmailByOTP.rejected'); } catch (_) { }
        return INITIAL_STATE;
      })
      .addCase(resendVerification.fulfilled, (state) => {
        try { console.log('[auth/reducer] resendVerification.fulfilled'); } catch (_) { }
        state.emailRegistrationStep = true;
      })
      .addCase(getCurrentUser.fulfilled, (state, action) => {
        try { console.log('[auth/reducer] getCurrentUser.fulfilled'); } catch (_) { }
        state.current = action.payload;
        state.isLoggedIn = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        try { console.log('[auth/reducer] login.fulfilled'); } catch (_) { }
        state.current = action.payload;
        state.isLoggedIn = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        try { console.log('[auth/reducer] updateProfile.fulfilled'); } catch (_) { }
        state.current = action.payload;
        state.isLoggedIn = true;
      })
      .addCase(logout.rejected, (state) => {
        state.isLoading = false;
      })
      .addCase(resetPasswordWithToken.pending, (state) => {
        state.isLoading = true;
        state.isSuccess = false;
        state.error = null;
      })
      .addCase(resetPasswordWithToken.fulfilled, (state) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.error = null;
      })
      .addCase(resetPasswordWithToken.rejected, (state, action) => {
        state.isLoading = false;
        state.isSuccess = false;
        state.error = action.payload || "Password reset failed";
      });

    const isAuthPending = (action) => action.type.startsWith('auth/') && action.type.endsWith('/pending');
    const isAuthFulfilled = (action) => action.type.startsWith('auth/') && action.type.endsWith('/fulfilled');
    const isAuthRejected = (action) => action.type.startsWith('auth/') && action.type.endsWith('/rejected');

    builder
      .addMatcher(isAuthPending, (state) => {
        try { console.log('[auth/reducer] pending'); } catch (_) { }
        state.isLoading = true;
        state.isSuccess = false;
        state.error = null;
      })
      .addMatcher(isAuthFulfilled, (state) => {
        try { console.log('[auth/reducer] fulfilled'); } catch (_) { }
        state.isLoading = false;
        state.isSuccess = true;
        state.error = null;
      })
      .addMatcher(isAuthRejected, (state, action) => {
        try { console.warn('[auth/reducer] rejected', action.payload || action.error?.message); } catch (_) { }
        state.isLoading = false;
        state.isSuccess = false;
        state.error = action.payload || 'An error occurred';
      });
  }
});

export default authSlice.reducer;