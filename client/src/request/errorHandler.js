import { notifyError } from '../utils/notify';
import codeMessage from './codeMessage';

const makeErrorResult = (message, code) => ({
  success: false,
  result: null,
  message,
  error: message,
  code
});


const errorHandler = (error) => {
  const suppress = Boolean(error?.config?.__suppressNotify);
  if (!navigator.onLine) {
    if (!suppress) notifyError('No internet connection', 'network');
    return makeErrorResult('Cannot connect to the server, Check your internet network', 'NETWORK_OFFLINE');
  }

  const { response } = error || {};

  if (!response) {
    if (!suppress) notifyError('Server connection failed', 'server');
    return makeErrorResult('Cannot connect to the server, Contact your Account administrator', 'NO_RESPONSE');
  }

  if (response?.data?.jwtExpired || response?.data?.message === "TokenExpiredError") {
    window.location.href = "/logout";
  }

  if (response?.status) {
    const errorText = response.data?.message || codeMessage[response.status] || 'Unexpected error';
    if (!suppress) notifyError(errorText, `error_${response.status}`);

    return {
      success: false,
      message: errorText,
      error: errorText,
      code: response?.data?.code || `HTTP_${response.status}`,
      result: null
    };
  }

  if (!suppress) notifyError('Server connection failed', 'server');
  return makeErrorResult('Cannot connect to the server, Try again later', 'UNKNOWN');
};

export default errorHandler;
