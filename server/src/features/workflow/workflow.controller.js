import { asyncHandler } from '#util/asyncHandler.js';
import { ApiResponse } from '#util/ApiResponse.js';
import * as workflowService from './workflow.service.js';

export const createWorkflow = asyncHandler(async (req, res) => {
  const workflow = await workflowService.createWorkflow(req.user.id, req.body);
  return ApiResponse.created(workflow, 'Workflow created successfully').withRequest(req).send(res);
});

export const getWorkflows = asyncHandler(async (req, res) => {
  const { page, limit } = req.query;
  const result = await workflowService.getWorkflows(req.user.id, { page, limit });
  return ApiResponse.success(result, 'Workflows fetched successfully').withRequest(req).send(res);
});

export const getWorkflowById = asyncHandler(async (req, res) => {
  const workflow = await workflowService.getWorkflowById(req.user.id, req.params.id);
  return ApiResponse.success(workflow, 'Workflow fetched successfully').withRequest(req).send(res);
});

export const updateWorkflow = asyncHandler(async (req, res) => {
  const workflow = await workflowService.updateWorkflow(req.user.id, req.params.id, req.body);
  return ApiResponse.success(workflow, 'Workflow updated successfully').withRequest(req).send(res);
});

export const deleteWorkflow = asyncHandler(async (req, res) => {
  const result = await workflowService.deleteWorkflow(req.user.id, req.params.id);
  return ApiResponse.success(result, 'Workflow deleted successfully').withRequest(req).send(res);
});

export const toggleWorkflow = asyncHandler(async (req, res) => {
  const result = await workflowService.toggleWorkflow(req.user.id, req.params.id);
  return ApiResponse.success(result, 'Workflow toggled successfully').withRequest(req).send(res);
});

