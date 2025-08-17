import request from '@/request/request';

export const getAvailableActions = () => request.action.getAvailable();
export const getActionById = (actionId) => request.action.getById(actionId);
