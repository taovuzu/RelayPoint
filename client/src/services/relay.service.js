import request from '@/request/request';

export const createRelay = (relayData) => request.relay.create(relayData);
export const getUserRelays = (options = {}) => request.relay.getUserRelays(options);
export const getRelay = (relayId) => request.relay.get(relayId);
export const updateRelay = (relayId, relayData) => request.relay.update(relayId, relayData);
export const deleteRelay = (relayId) => request.relay.delete(relayId);
export const toggleRelay = (relayId) => request.relay.toggle(relayId);
export const getRelayRuns = (relayId, options = {}) => request.relay.getRuns(relayId, options);
export const testRelay = (relayId, testData = {}) => request.relay.test(relayId, testData);
