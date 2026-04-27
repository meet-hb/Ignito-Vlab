import { apiRequest } from '../lib/apiClient';

export async function loginWithCredentials({ email, password }) {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}
