/**
 * @file user.types.js
 * @description JSDoc type definitions for the User entity.
 * @module entities/user/model/user.types
 */

/**
 * @typedef {Object} User
 * @property {string} id - Unique identifier from backend.
 * @property {string} fullName - User's full name.
 * @property {string} email - Primary contact email.
 * @property {'PASSWORD' | 'GOOGLE'} loginType - Primary authentication method.
 * @property {boolean} isEmailVerified - Verification status.
 * @property {string} createdAt - ISO date string.
 * @property {string} lastLoginAt - ISO date string of last session start.
 */

export {}; // Type-only file
