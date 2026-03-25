/**
 * @file connection.types.js
 * @description JSDoc type definitions for Third-Party Service Connections.
 * @module entities/connection/model/connection.types
 */

/**
 * @typedef {Object} Connection
 * @property {string} id - Connection UUID.
 * @property {'GMAIL' | 'SLACK' | 'GITHUB' | 'NOTION'} service - The service type.
 * @property {string} accountIdentifier - User-friendly ID (e.g., email or username).
 * @property {boolean} isActive - Whether the connection is authenticated and ready.
 * @property {string} createdAt - ISO date string.
 * @property {string} [lastUsedAt] - ISO date string of last action execution.
 */

export {};
