import { AVAILABLE_ACTIONS } from '../constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

export const getAvailableActions = asyncHandler(async (req, res) => {
  const actions = Object.values(AVAILABLE_ACTIONS);
  return ApiResponse
    .success(actions, 'Available actions fetched successfully')
    .withRequest(req)
    .send(res);
});

export const getActionById = asyncHandler(async (req, res) => {
  const { actionId } = req.params;
  
  const action = AVAILABLE_ACTIONS[actionId];
  if (!action) {
    throw ApiError.notFound(`Action with ID '${actionId}' not found`);
  }
  
  return ApiResponse
    .success(action, 'Action fetched successfully')
    .withRequest(req)
    .send(res);
});
