const TOKEN_KEY = 'auth_token';

/**
 * Service for managing JWT authentication token in localStorage.
 * Single Responsibility: Only handles token storage operations.
 */
export const tokenService = {
  getToken() {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token) {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken() {
    localStorage.removeItem(TOKEN_KEY);
  },

  isAuthenticated() {
    return !!this.getToken();
  },
};
