/**
 * @file relay-run.types.js
 * @description JSDoc type definitions for Workflow Execution (RelayRun) entities.
 * @module entities/relay-run/model/relay-run.types
 */

/**
 * @typedef {Object} ExecutionHistoryEntry
 * @property {number} stageIndex - Index of the action in the workflow.
 * @property {string} actionId - Type of action performed.
 * @property {'SUCCESS' | 'FAILURE'} status - Result of this specific step.
 * @property {string} timestamp - ISO date string.
 * @property {number} duration - Milliseconds taken for this step.
 * @property {string} [error] - Error message if status is FAILURE.
 */

/**
 * @typedef {Object} RelayRun
 * @property {string} id - Execution run UUID.
 * @property {'PENDING' | 'PROCESS' | 'SUCCESS' | 'FAILURE'} status - Overall run status.
 * @property {number} currentStage - Index of the next/current step being executed.
 * @property {Object} triggerMetadata - The original payload that fired the run.
 * @property {ExecutionHistoryEntry[]} executionHistory - Detailed step-by-step audit log.
 * @property {number} totalDuration - Total milliseconds from start to terminal state.
 * @property {string} startedAt - ISO date string.
 * @property {string} [completedAt] - ISO date string of terminal state.
 * @property {string} [errorMessage] - Global error message if status is FAILURE.
 */

export {};
