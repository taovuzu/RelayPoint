import request from '@/request/request';

export const suggestRelay = (prompt) => request.suggester.suggest(prompt);
