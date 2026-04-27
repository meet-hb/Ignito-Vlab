const trimTrailingSlash = (value) => value.replace(/\/+$/, '');

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

export const APP_ENV = {
  apiBaseUrl: rawApiBaseUrl ? trimTrailingSlash(rawApiBaseUrl) : '',
  useMockApi: import.meta.env.VITE_USE_MOCK_API !== 'false',
  appName: import.meta.env.VITE_APP_NAME || 'Vlab',
};

export const buildApiUrl = (path) => {
  if (!APP_ENV.apiBaseUrl) {
    return path;
  }

  return `${APP_ENV.apiBaseUrl}${path.startsWith('/') ? path : `/${path}`}`;
};
