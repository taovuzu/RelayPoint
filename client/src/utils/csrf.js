export function getCsrfToken() {
  const parts = document.cookie.split(';');
  for (const part of parts) {
    const [name, value] = part.trim().split('=');
    if (name === 'csrf-token') return decodeURIComponent(value || '');
  }
  return null;
}

export function setCsrfToken(token) {
  document.cookie = `csrf-token=${encodeURIComponent(token)}; path=/; secure; samesite=strict`;
}

export function clearCsrfToken() {
  document.cookie = 'csrf-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}
