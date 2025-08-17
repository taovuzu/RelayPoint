import request from '@/request/request';

export const getAvailableTriggers = () => request.trigger.getAvailable();
export const getTriggerById = (triggerId) => request.trigger.getById(triggerId);
