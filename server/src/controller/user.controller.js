import jwt from "jsonwebtoken";
import crypto from "crypto";
import bcrypt from "bcrypt";

import { ApiError } from "#util/ApiError.js";
import { asyncHandler } from "#util/asyncHandler.js";
import { ApiResponse } from "#util/ApiResponse.js";
import logger from "#util/logger.js";
import { sendEmail, emailVerificationMailgen, forgetPasswordMailgen } from "#util/mail.js";
import prisma from "#db/index.db.js";
import { redisClient, healthCheck } from "#db/redis.db.js";

import { SALT_ROUNDS } from "#constant.js";

const DUMMY_HASH = "$2b$12$L8O7j6i5h4g3f2e1d0c9b8a7f6e5d4c3b2a109876543210987654"; 

const hashPassword = async (password) => {
  return await bcrypt.hash(password, SALT_ROUNDS);
};

const isPasswordCorrect = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

const safeCompare = (a, b) => {
  const bufA = Buffer.from(a || '');
  const bufB = Buffer.from(b || '');
  if (bufA.length !== bufB.length) {
    crypto.timingSafeEqual(bufA, bufA); 
    return false;
  }
  return crypto.timingSafeEqual(bufA, bufB);
};

const generateTokens = (userId, email) => {
  const accessToken = jwt.sign(
    { id: userId, email },
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
  );
  const refreshToken = jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
  );
  return { accessToken, refreshToken };
};

const generateAccessAndRefreshTokens = async (userId, email) => {
  try {
    const { accessToken, refreshToken } = generateTokens(userId, email);

    await prisma.user.update({
      where: { id: userId },
      data: {
        refreshToken,
        forgetPasswordToken: null,
        forgetPasswordExpiry: null
      }
    });

    return { accessToken, refreshToken };
  } catch (error) {
    throw ApiError.internal("Something went wrong while generating access and refresh tokens", [error]);
  }
};

const registerEmail = asyncHandler(async (req, res) => {
  const { email } = req.body;

  if (!email) throw ApiError.badRequest("Email is empty");

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw ApiError.conflict("User already exists with this email");

  sendRegistrationTokens(email, req).catch(err => logger.error("Background error in sendRegistrationTokens", { email, error: err.message }));

  return ApiResponse
    .success({}, "OTP and verification link sent to email", 200)
    .withRequest(req)
    .send(res);
});

const resendEmailVerification = asyncHandler(async (req, res) => {
  const { email } = req.body || {};
  if (!email) throw ApiError.badRequest("Email is empty");

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) throw ApiError.conflict("User already exists with this email");

  sendRegistrationTokens(email, req).catch(err => logger.error("Background error in sendRegistrationTokens (resend)", { email, error: err.message }));

  return ApiResponse
    .success({}, "OTP and verification link sent to email", 200)
    .withRequest(req)
    .send(res);
});

const verifyEmailByLink = asyncHandler(async (req, res) => {
  const { email, unHashedToken } = req.query;

  if (!email || !unHashedToken) {
    throw ApiError.badRequest("Email or unHashedToken is empty");
  }

  const hashedToken = crypto.createHash("sha256").update(unHashedToken).digest("hex");

  await healthCheck();
  const key = `email:verify:${email}`;
  const data = await redisClient.hgetall(key);

  if (!data || Object.keys(data).length === 0) {
    throw ApiError.notFound("Verification token not found or expired");
  }
  if (data.hashedToken !== hashedToken) {
    throw ApiError.unauthorized("Invalid verification token");
  }

  const registrationToken = issueRegistrationToken(email);
  const expiryStr = process.env.REGISTRATION_TOKEN_EXPIRY;
  const maxAge = parseInt(expiryStr);

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    maxAge
  };

  return res
    .cookie("registrationToken", registrationToken, options)
    .redirect(
      `${process.env.FRONTEND_URL}/register?verified=true&email=${encodeURIComponent(email)}`
    );
});

const verifyEmailByOTP = asyncHandler(async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp || Number(otp) >= 999999 || Number(otp) <= 100000) {
    throw ApiError.badRequest("Email or otp is empty or incomplete");
  }

  await healthCheck();
  const key = `email:verify:${email}`;
  const data = await redisClient.hgetall(key);

  if (!data || Object.keys(data).length === 0) {
    throw ApiError.notFound("OTP not found or expired");
  }
  if (!safeCompare(String(data.otp), String(otp))) {
    throw ApiError.unauthorized("Invalid OTP");
  }

  await redisClient.del(key);

  const registrationToken = issueRegistrationToken(email);
  const expiryStr = process.env.REGISTRATION_TOKEN_EXPIRY;
  const maxAge = parseInt(expiryStr);

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    maxAge
  };

  return ApiResponse
    .success({}, "Email verified successfully", 200)
    .withRequest(req)
    .send(res.cookie("registrationToken", registrationToken, options));
});

const registerUser = asyncHandler(async (req, res) => {
  const { fullName, password } = req.body;

  if (!fullName || !password) {
    throw ApiError.badRequest("All fields are required");
  }

  const token = req.cookies?.registrationToken;
  if (!token) {
    throw ApiError.unauthorized("Missing registration token. Verify email first.");
  }

  const secret = process.env.REGISTRATION_TOKEN_SECRET;
  let decoded;
  try {
    decoded = jwt.verify(token, secret);
  } catch (e) {
    throw ApiError.unauthorized("Invalid or expired registration token");
  }

  const email = decoded?.email;
  if (!email) throw ApiError.unauthorized("Invalid registration token payload");

  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw ApiError.conflict("Account already exists with this email");
  }

  let newUser;
  try {
    const hashedPassword = await hashPassword(password);
    newUser = await prisma.user.create({
      data: {
        email,
        fullName,
        password: hashedPassword,
        loginType: "EMAIL_PASSWORD",
        isEmailVerified: true
      }
    });
  } catch (error) {
    throw ApiError.internal("Failed to create user", [error]);
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(newUser.id, newUser.email);

  const createdUser = await prisma.user.findUnique({
    where: { id: newUser.id }
  });
  delete createdUser.password;
  delete createdUser.refreshToken;

  const options = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' };
  const csrfToken = crypto.randomBytes(100).toString('hex');
  const csrfCookie = { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' };

  const response = ApiResponse.created({ user: createdUser }, "Account created successfully").withRequest(req);
  return res
    .status(response.statusCode)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .cookie("csrf-token", csrfToken, csrfCookie)
    .clearCookie("registrationToken", options)
    .json(response.toJSON());
});

const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  const isValid = user && user.password
    ? await isPasswordCorrect(password, user.password)
    : await isPasswordCorrect(password, DUMMY_HASH);

  if (!user || !isValid) {
    throw ApiError.unauthorized("Invalid credentials");
  }

  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user.id, user.email);

  const loggedInUser = { ...user };
  delete loggedInUser.password;
  delete loggedInUser.refreshToken;
  delete loggedInUser.forgetPasswordToken;
  delete loggedInUser.forgetPasswordExpiry;

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
  };
  const csrfToken = crypto.randomBytes(100).toString('hex');
  const csrfCookie = { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' };

  const response = ApiResponse.success({ user: loggedInUser }, "User loggedIn successfully", 200).withRequest(req);
  return res
    .status(response.statusCode)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .cookie("csrf-token", csrfToken, csrfCookie)
    .json(response.toJSON());
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken = req.cookies?.refreshToken;

  if (!incomingRefreshToken) {
    throw ApiError.unauthorized("Unauthorized request");
  }

  try {
    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await prisma.user.findUnique({ where: { id: decodedToken?.id } });

    if (!user) {
      throw ApiError.unauthorized("Invalid refresh tokens");
    }
    if (!safeCompare(incomingRefreshToken, user.refreshToken)) {
      throw ApiError.unauthorized("Refresh token is expired or used");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user.id, user.email);

    const options = {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
    };
    const csrfToken = crypto.randomBytes(100).toString('hex');
    const csrfCookie = { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' };

    const response = ApiResponse.success({}, "Refreshed accessToken successfully", 200).withRequest(req);
    return res
      .status(response.statusCode)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .cookie("csrf-token", csrfToken, csrfCookie)
      .json(response.toJSON());

  } catch (error) {
    throw ApiError.unauthorized("Either invalid or expired refresh tokens");
  }
});

const logoutUser = asyncHandler(async (req, res) => {
  if (req.user?.id) {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { refreshToken: null }
    });
  }

  const response = ApiResponse.success({}, "User loggedOut successfully", 200).withRequest(req);
  return res
    .status(response.statusCode)
    .clearCookie("accessToken", { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', path: "/" })
    .clearCookie("refreshToken", { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', path: "/" })
    .clearCookie("csrf-token", { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', path: "/" })
    .json(response.toJSON());
});

const userSocialLogin = asyncHandler(async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user?.id } });

  if (!user) {
    throw ApiError.notFound("In social login request can not get user.id or user does not exists");
  }
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user.id, user.email);

  const csrfToken = crypto.randomBytes(100).toString('hex');
  const csrfCookie = { httpOnly: false, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' };

  return res.
    status(200).
    cookie("accessToken", accessToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' }).
    cookie("refreshToken", refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax' }).
    cookie("csrf-token", csrfToken, csrfCookie).
    redirect(`${process.env.CLIENT_SSO_REDIRECT_URL}/auth/callback?success=true`);
});

const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await prisma.user.findUnique({ where: { id: req.user?.id } });

  if (!user) throw ApiError.notFound("User not found");

  const isPasswordValid = await isPasswordCorrect(oldPassword, user.password);
  if (!isPasswordValid) {
    throw ApiError.conflict("Old password is wrong");
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedPassword }
  });

  return ApiResponse
    .success({}, "User password changed successfully", 200)
    .withRequest(req)
    .send(res);
});

const forgotPasswordRequest = asyncHandler(async (req, res) => {
  const { email } = req.body;
  if (!email) throw ApiError.badRequest("Email is empty");

  const user = await prisma.user.findUnique({ where: { email } });

  if (user) {
    const unHashedToken = crypto.randomBytes(20).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(unHashedToken).digest("hex");
    const tokenExpiry = new Date(Date.now() + 20 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        forgetPasswordToken: hashedToken,
        forgetPasswordExpiry: tokenExpiry
      }
    });

    const resetLink = `${process.env.APP_URL}/api/v1/users/verify-password-reset?email=${encodeURIComponent(email)}&unHashedToken=${unHashedToken}`;

    sendEmail({
      email,
      subject: "Password Reset Token",
      mailgenContent: forgetPasswordMailgen(resetLink)
    }).catch(err => logger.error("Background error in forgotPasswordRequest:sendEmail", { email, error: err.message }));
  } else {
    logger.warn(`Password reset requested for non-existent email: ${email}`);
  }

  return ApiResponse
    .success({}, "If an account with that email exists, a password reset link has been sent", 200)
    .withRequest(req)
    .send(res);
});

const verifyPasswordResetLink = asyncHandler(async (req, res) => {
  const { email, unHashedToken } = req.query;

  if (!email || !unHashedToken) {
    throw ApiError.badRequest("Email or unHashedToken is missing");
  }

  const hashedToken = crypto.createHash("sha256").update(unHashedToken).digest("hex");

  const user = await prisma.user.findFirst({
    where: {
      email,
      forgetPasswordToken: hashedToken,
      forgetPasswordExpiry: { gt: new Date() }
    }
  });

  if (!user) {
    throw ApiError.notFound("Invalid or expired reset link");
  }

  const resetCookieToken = jwt.sign({ email, hashedToken }, process.env.REGISTRATION_TOKEN_SECRET, { expiresIn: "15m" });
  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax',
    maxAge: 15 * 60 * 1000
  };

  return res
    .cookie("passwordResetToken", resetCookieToken, options)
    .redirect(`${process.env.FRONTEND_URL}/reset-password`);
});

const resetForgottenPassword = asyncHandler(async (req, res) => {
  const { newPassword } = req.body;
  const token = req.cookies?.passwordResetToken;

  if (!token || !newPassword) {
    throw ApiError.badRequest("Missing new password or expired session");
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.REGISTRATION_TOKEN_SECRET);
  } catch (e) {
    throw ApiError.unauthorized("Expired or invalid reset session");
  }

  const { email, hashedToken } = decoded;

  const user = await prisma.user.findFirst({
    where: {
      email,
      forgetPasswordToken: hashedToken,
      forgetPasswordExpiry: { gt: new Date() }
    }
  });

  if (!user) {
    throw ApiError.notFound("Reset session no longer valid or user deleted");
  }

  const hashedPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      forgetPasswordToken: null,
      forgetPasswordExpiry: null
    }
  });

  return ApiResponse
    .success({}, "Password reset successfully", 200)
    .clearCookie("passwordResetToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax'
    })
    .withRequest(req)
    .send(res);
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return ApiResponse
    .success({ user: req.user }, "current user fetched successfully", 200)
    .withRequest(req)
    .send(res);
});

const sendRegistrationTokens = async (email, req) => {
  const otp = crypto.randomInt(100000, 999999);

  const unHashedToken = crypto.randomBytes(20).toString("hex");
  const hashedToken = crypto.createHash("sha256").update(unHashedToken).digest("hex");

  const expiryMs = Number(process.env.USER_TEMPORARY_TOKEN_EXPIRY);
  const ttlSeconds = Math.ceil(expiryMs / 1000);

  await healthCheck();
  const key = `email:verify:${email}`;
  await redisClient.hset(key, {
    otp: String(otp),
    hashedToken,
    createdAt: new Date().toISOString()
  });
  await redisClient.expire(key, ttlSeconds);

  const verifyUrl = `${process.env.FRONTEND_URL}/api/v1/users/verify-email-link?email=${encodeURIComponent(email)}&unHashedToken=${unHashedToken}`;
  logger.info('Email verification tokens generated', { email, otp });
  sendEmail({
    email: email,
    subject: "Email Verification Tokens",
    mailgenContent: emailVerificationMailgen(verifyUrl, otp)
  }).catch(err => logger.error("Background error in sendRegistrationTokens:sendEmail", { email, error: err.message }));
};

const issueRegistrationToken = (email) => {
  const secret = process.env.REGISTRATION_TOKEN_SECRET;
  return jwt.sign({ email, purpose: "registration" }, secret, { expiresIn: process.env.REGISTRATION_TOKEN_EXPIRY });
};

export { registerUser, registerEmail, verifyEmailByLink, verifyEmailByOTP, loginUser, refreshAccessToken, logoutUser, userSocialLogin, changeCurrentPassword, forgotPasswordRequest, verifyPasswordResetLink, resetForgottenPassword, getCurrentUser, resendEmailVerification };

// ref: https://nodejs.org/api/crypto.html
// ref: https://www.npmjs.com/package/uuid#uuidv4options-buffer-offset
// ref: https://www.npmjs.com/package/jsonwebtoken
// ref: https://www.jwt.io/introduction
// ref: https://www.npmjs.com/package/bcrypt

