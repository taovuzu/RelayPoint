import request from '@/request/request';

export const registerEmail = ({ email }) => request.auth.registerEmail(email);
export const registerUser = ({ registerData }) => request.auth.registerUser(registerData);
export const resendVerification = ({ email }) => request.auth.resendVerification(email);
export const verifyEmailByLink = ({ email, unHashedToken }) => request.auth.verifyEmailByLink(email, unHashedToken);
export const verifyEmailByOTP = ({ email, otp }) => request.auth.verifyEmailByOTP(email, otp);
export const login = ({ loginData }) => request.auth.login(loginData);
export const requestPasswordReset = ({ email }) => request.auth.requestPasswordReset(email);
export const refreshAccessToken = () => request.auth.refreshAccessToken();
export const logout = () => request.auth.logout();
export const getCurrentUser = () => request.auth.getCurrentUser();
export const changeCurrentPassword = ({ oldPassword, newPassword }) => request.auth.changeCurrentPassword(oldPassword, newPassword);
export const resetPasswordWithToken = ({ email, unHashedToken, newPassword }) => request.auth.resetPasswordWithToken(email, unHashedToken, newPassword);
export const googleLogin = () => request.auth.googleLogin();