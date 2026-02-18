const TOKEN_KEY = 'auth_token';
const TOKEN_EXPIRES_AT_KEY = 'auth_token_expires_at';
const EXPIRY_SKEW_MS = 30 * 1000;

function parseJwtExp(token) {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const normalized = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=');
    const payload = JSON.parse(atob(padded));
    if (!payload?.exp || typeof payload.exp !== 'number') return null;
    return payload.exp * 1000;
  } catch {
    return null;
  }
}

function getStoredExpiryMs() {
  const value = localStorage.getItem(TOKEN_EXPIRES_AT_KEY);
  if (!value) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/**
 * Service for managing JWT authentication token in localStorage.
 * Includes expiry persistence to avoid sending stale tokens.
 */
export const tokenService = {
  getToken() {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return null;

    if (this.isTokenExpired(token)) {
      this.removeToken();
      return null;
    }

    return token;
  },

  setToken(token, expiresInSeconds = null) {
    localStorage.setItem(TOKEN_KEY, token);
    const expiresAt =
      Number.isFinite(expiresInSeconds) && expiresInSeconds > 0
        ? Date.now() + expiresInSeconds * 1000
        : parseJwtExp(token);

    if (expiresAt) {
      localStorage.setItem(TOKEN_EXPIRES_AT_KEY, String(expiresAt));
    } else {
      localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
    }
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
  },

  isTokenExpired(token = localStorage.getItem(TOKEN_KEY)) {
    if (!token) return true;
    const expiresAt = getStoredExpiryMs() || parseJwtExp(token);
    if (!expiresAt) return false;
    return Date.now() >= expiresAt - EXPIRY_SKEW_MS;
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};
