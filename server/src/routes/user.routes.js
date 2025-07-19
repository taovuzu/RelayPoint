import { Router } from "express";
import { registerUser, registerEmail, verifyEmailByLink, verifyEmailByOTP, loginUser, refreshAccessToken, logoutUser, userSocialLogin, forgotPasswordRequest, changeCurrentPassword, resetForgottenPassword, getCurrentUser, resendEmailVerification } from "../controllers/user.controller.js";
import { verifyJWT, verifyCSRF } from "../middlewares/auth.middleware.js";
import { emailValidator, usernameValidator, passwordValidator, userLoginValidator, userRegisterValidator, changeCurrentPasswordValidator, resetForgottenPasswordValidator } from "../validators/user.validator.js";
import { validate } from "../validators/validate.js";
import passport from "passport";
import { sensitiveRateLimiter } from "../middlewares/rateLimit.middleware.js";
import "../middlewares/passport.js";

const router = Router();

const SENSITIVE_WINDOW_MS = Number(process.env.SENSITIVE_RATE_LIMIT_WINDOW_MS) || (10 * 60 * 1000);
const SENSITIVE_MAX = Number(process.env.SENSITIVE_RATE_LIMIT_MAX_REQUESTS) || 10;

router.route("/register-email").post(sensitiveRateLimiter({ max: SENSITIVE_MAX, windowMs: SENSITIVE_WINDOW_MS }), emailValidator(), validate, registerEmail);
router.route("/register-user").post(sensitiveRateLimiter({ max: SENSITIVE_MAX, windowMs: SENSITIVE_WINDOW_MS }), userRegisterValidator(), validate, registerUser);
router.route("/verify-email-link").get(verifyEmailByLink);
router.route("/verify-email-otp").post(sensitiveRateLimiter({ max: SENSITIVE_MAX, windowMs: SENSITIVE_WINDOW_MS }), verifyEmailByOTP);
router.route("/login").post(sensitiveRateLimiter({ max: SENSITIVE_MAX, windowMs: SENSITIVE_WINDOW_MS }), userLoginValidator(), loginUser);
router.route("/resend-verification").post(sensitiveRateLimiter({ max: SENSITIVE_MAX, windowMs: SENSITIVE_WINDOW_MS }), resendEmailVerification);
router.route("/request-password-reset").post(sensitiveRateLimiter({ max: SENSITIVE_MAX, windowMs: SENSITIVE_WINDOW_MS }), emailValidator(), validate, forgotPasswordRequest);
router.route("/reset-forgot-password").post(sensitiveRateLimiter({ max: SENSITIVE_MAX, windowMs: SENSITIVE_WINDOW_MS }), resetForgottenPasswordValidator(), validate, resetForgottenPassword);

router.route("/logout").post(verifyJWT, verifyCSRF, logoutUser);
router.route("/change-password").post(verifyJWT, verifyCSRF, changeCurrentPasswordValidator(), validate, changeCurrentPassword);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/refresh-access-token").get(refreshAccessToken);

router.route("/google").get(
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false
  }),
  (req, res) => {
    res.send("Redirecting to google...");
  }
);

router.route("/google/callback").get(
  passport.authenticate("google", { session: false }),
  userSocialLogin
);

export default router;