import { buildApiUrl } from '../config/env';

const defaultHeaders = {
  'Content-Type': 'application/json',
};

export class ApiError extends Error {
  constructor(message, status, payload) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

export async function apiRequest(path, options = {}) {
  const { headers, body, ...restOptions } = options;

  const response = await fetch(buildApiUrl(path), {
    ...restOptions,
    headers: {
      ...defaultHeaders,
      ...headers,
    },
    body: body && typeof body !== 'string' ? JSON.stringify(body) : body,
  });

  const contentType = response.headers.get('content-type') || '';
  const payload = contentType.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof payload === 'object' && payload?.message
        ? payload.message
        : `Request failed with status ${response.status}`;
    throw new ApiError(message, response.status, payload);
  }

  return payload;
}
