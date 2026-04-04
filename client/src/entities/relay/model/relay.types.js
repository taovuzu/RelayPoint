/**
 * @file relay.types.js
 * @description JSDoc type definitions for Workflow/Relay entities.
 * @module entities/relay/model/relay.types
 */

/**
 * @typedef {Object} Trigger
 * @property {string} id - Trigger type (e.g., 'webhook').
 * @property {Object} config - Type-specific configuration.
 */

/**
 * @typedef {Object} Action
 * @property {string} id - Action type key (e.g., 'send-email').
 * @property {number} order - Execution sequence index (0-indexed).
 * @property {Object} config - Type-specific configuration (e.g., to, subject, body).
 */

/**
 * @typedef {Object} Relay
 * @property {string} id - Workflow UUID.
 * @property {string} name - User-defined name.
 * @property {string} [description] - Optional description.
 * @property {boolean} active - Current operational status.
 * @property {string} webhookUrl - Public URL for webhook triggers.
 * @property {Trigger} trigger - Trigger definition.
 * @property {Action[]} actions - Ordered list of execution steps.
 * @property {number} runCount - Total number of workflow runs.
 * @property {number} successCount - Number of successful runs.
 * @property {number} failureCount - Number of failed runs.
 * @property {string|null} lastRunAt - ISO date string of most recent run.
 * @property {string} createdAt - ISO date string.
 * @property {string} updatedAt - ISO date string.
 */

export {};
