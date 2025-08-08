import { AVAILABLE_TRIGGERS } from '../constants.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

export const getAvailableTriggers = asyncHandler(async (req, res) => {
  const triggers = Object.values(AVAILABLE_TRIGGERS);
  return ApiResponse
    .success(triggers, 'Available triggers fetched successfully')
    .withRequest(req)
    .send(res);
});

export const getTriggerById = asyncHandler(async (req, res) => {
  const { triggerId } = req.params;

  const trigger = AVAILABLE_TRIGGERS[triggerId];
  if (!trigger) {
    throw ApiError.notFound(`Trigger with ID '${triggerId}' not found`);
  }

  return ApiResponse
    .success(trigger, 'Trigger fetched successfully')
    .withRequest(req)
    .send(res);
});
