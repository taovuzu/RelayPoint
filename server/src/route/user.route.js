import { Router } from "express";
import { registerUser, registerEmail, verifyEmailByLink, verifyEmailByOTP, loginUser, refreshAccessToken, logoutUser, userSocialLogin, forgotPasswordRequest, verifyPasswordResetLink, changeCurrentPassword, resetForgottenPassword, getCurrentUser, resendEmailVerification } from "#controller/user.controller.js";
import { verifyJWT, verifyCSRF } from "../middleware/auth.middleware.js";
import { emailValidator, userLoginValidator, userRegisterValidator, changeCurrentPasswordValidator, resetForgottenPasswordValidator } from "#validator/user.validator.js";
import passport from "passport";
import { sensitiveRateLimiter } from "#middleware/rateLimit.middleware.js";
import "#middleware/passport.js";

const router = Router();

router.route("/register-email").post(sensitiveRateLimiter({ max: 20, windowMs: 15 * 60 * 1000 }), emailValidator, registerEmail);
router.route("/register-user").post(sensitiveRateLimiter({ max: 30, windowMs: 15 * 60 * 1000 }), userRegisterValidator, registerUser);
router.route("/verify-email-link").get(verifyEmailByLink);
router.route("/verify-email-otp").post(sensitiveRateLimiter({ max: 10, windowMs: 10 * 60 * 1000 }), verifyEmailByOTP);
router.route("/login").post(sensitiveRateLimiter({ max: 10, windowMs: 10 * 60 * 1000 }), userLoginValidator, loginUser);
router.route("/resend-verification").post(sensitiveRateLimiter({ max: 10, windowMs: 15 * 60 * 1000 }), resendEmailVerification);
router.route("/request-password-reset").post(sensitiveRateLimiter({ max: 10, windowMs: 15 * 60 * 1000 }), emailValidator, forgotPasswordRequest);
router.route("/verify-password-reset").get(verifyPasswordResetLink);
router.route("/reset-forgot-password").post(sensitiveRateLimiter({ max: 10, windowMs: 15 * 60 * 1000 }), resetForgottenPasswordValidator, resetForgottenPassword);

router.route("/logout").post(verifyCSRF, logoutUser);
router.route("/change-password").post(verifyJWT, verifyCSRF, changeCurrentPasswordValidator, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/refresh-access-token").get(refreshAccessToken);

router.route("/google").get(
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false
  })
);

router.route("/google/callback").get(
  passport.authenticate("google", { session: false }),
  userSocialLogin
);

export default router;
