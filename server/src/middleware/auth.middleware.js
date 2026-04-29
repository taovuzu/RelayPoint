import jwt from "jsonwebtoken";
import { asyncHandler } from "#util/asyncHandler.js";
import { ApiError } from "#util/ApiError.js";
import envConfig from "#config/env.config.js";

const verifyJWT = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    throw new ApiError(401, "JsonWebTokenError");
  }

  try {
    const decoded = jwt.verify(token, envConfig.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      throw new ApiError(401, { message: "TokenExpiredError", jwtExpired: true });
    }
    throw new ApiError(401, "JsonWebTokenError");
  }
});

const getUserLoggedInOrNot = asyncHandler(async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) return next();
  try {
    const decoded = jwt.verify(token, envConfig.ACCESS_TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    next();
  }
});

const verifyCSRF = asyncHandler(async (req, res, next) => {
  const method = (req.method || '').toUpperCase();
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return next();
  }

  const cookieToken = req.cookies && req.cookies['csrf-token'];
  const headerToken = req.headers && (req.headers['x-csrf-token'] || req.headers['X-CSRF-Token']);

  if (!cookieToken || !headerToken || String(cookieToken) !== String(headerToken)) {
    throw new ApiError(403, "Invalid CSRF token");
  }
  next();
});

export { verifyJWT, getUserLoggedInOrNot, verifyCSRF };

// ref: https://www.jwt.io/introduction#how-json-web-tokens-work
// ref: https://www.npmjs.com/package/jsonwebtoken
