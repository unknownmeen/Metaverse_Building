import { t } from './i18n';
import { toastService } from './toastService';
import { tokenService } from './tokenService';

/**
 * Known GraphQL error codes from Apollo/NestJS.
 */
const AUTH_ERROR_CODES = ['UNAUTHENTICATED', 'UNAUTHORIZED'];
let redirectingToLogin = false;

/**
 * Known backend error message substrings mapped to translation keys.
 */
const MESSAGE_PATTERNS = [
  { pattern: /unauthorized|unauthenticated/i, key: 'errors.auth.unauthorized' },
  { pattern: /forbidden/i, key: 'errors.auth.forbidden' },
  { pattern: /invalid credentials|invalid password|wrong password/i, key: 'errors.auth.invalid_credentials' },
  { pattern: /token.*expir/i, key: 'errors.auth.token_expired' },
  { pattern: /not found/i, key: null },
  { pattern: /validation|invalid/i, key: 'errors.validation.invalid_input' },
];

/**
 * Determine if the error is an authentication error that requires re-login.
 */
function isAuthError(graphQLErrors) {
  return graphQLErrors?.some((err) => {
    const code = err.extensions?.code;
    return AUTH_ERROR_CODES.includes(code);
  });
}

function isAuthNetworkError(networkError) {
  if (!networkError) return false;
  return (
    networkError.statusCode === 401 ||
    /unauthorized|unauthenticated|token|jwt.*expir|expired/i.test(networkError.message || '')
  );
}

function redirectToLogin() {
  if (redirectingToLogin) return;
  redirectingToLogin = true;
  window.location.href = '/login';
}

/**
 * Try to match a backend error message to a translated message.
 */
function translateErrorMessage(message) {
  if (!message) return null;

  for (const { pattern, key } of MESSAGE_PATTERNS) {
    if (pattern.test(message)) {
      return key ? t(key) : null;
    }
  }

  return null;
}

/**
 * Extract the best user-facing message from a GraphQL error.
 */
function getGraphQLErrorMessage(graphQLErrors) {
  if (!graphQLErrors?.length) return null;

  const firstError = graphQLErrors[0];
  const translated = translateErrorMessage(firstError.message);
  if (translated) return translated;

  return firstError.message || t('errors.unknown');
}

/**
 * Extract a user-facing message from a network error.
 */
function getNetworkErrorMessage(networkError) {
  if (!networkError) return null;

  if (networkError.message?.includes('Failed to fetch')) {
    return t('errors.network.default');
  }
  if (networkError.message?.includes('CORS')) {
    return t('errors.network.cors');
  }
  if (networkError.message?.includes('timeout')) {
    return t('errors.network.timeout');
  }
  if (networkError.statusCode === 0 || networkError.message?.includes('ERR_CONNECTION_REFUSED')) {
    return t('errors.network.server_down');
  }

  return t('errors.network.default');
}

/**
 * Global Apollo error handler.
 * Called automatically from the Apollo error link for every failed request.
 */
export function handleApolloError({ graphQLErrors, networkError }) {
  if (graphQLErrors) {
    if (isAuthError(graphQLErrors)) {
      tokenService.removeToken();
      toastService.error(t('errors.auth.token_expired'));
      redirectToLogin();
      return;
    }

    const message = getGraphQLErrorMessage(graphQLErrors);
    if (message) {
      toastService.error(message);
    }
  }

  if (networkError) {
    if (isAuthNetworkError(networkError)) {
      tokenService.removeToken();
      toastService.error(t('errors.auth.token_expired'));
      redirectToLogin();
      return;
    }
    const message = getNetworkErrorMessage(networkError);
    toastService.error(message);
  }
}

/**
 * Handle an error from a component-level mutation/action.
 * Returns a translated user-facing message string.
 *
 * @param {Error} error - The caught error
 * @param {string} contextKey - A translation key prefix (e.g. 'errors.mission.create_failed')
 * @param {object} options - { showToast: boolean }
 */
export function handleError(error, contextKey = null, { showToast = true } = {}) {
  let message;

  if (error?.graphQLErrors?.length) {
    if (isAuthError(error.graphQLErrors)) {
      tokenService.removeToken();
      message = t('errors.auth.token_expired');
      if (showToast) toastService.error(message);
      window.location.href = '/login';
      return message;
    }

    const translated = getGraphQLErrorMessage(error.graphQLErrors);
    message = translated || (contextKey ? t(contextKey) : t('errors.unknown'));
  } else if (error?.networkError) {
    if (isAuthNetworkError(error.networkError)) {
      tokenService.removeToken();
      message = t('errors.auth.token_expired');
      if (showToast) toastService.error(message);
      redirectToLogin();
      return message;
    }
    message = getNetworkErrorMessage(error.networkError);
  } else {
    message = contextKey ? t(contextKey) : t('errors.unknown');
  }

  if (showToast) {
    toastService.error(message);
  }

  return message;
}
