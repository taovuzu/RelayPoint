import envConfig from "@/shared/config/env.js";

export function successHandler(response) {
  if (envConfig.VITE_ENV === 'development') {
    console.debug(`[API] ${response.config.method?.toUpperCase()} ${response.config.url} →`, response.status);
  }
  return response;
}

