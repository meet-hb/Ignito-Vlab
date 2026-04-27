import { APP_ENV } from '../config/env';
import { apiRequest } from '../lib/apiClient';
import { MOCK_USER } from '../constants/mockData';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function loginWithCredentials({ email, password }) {
  if (APP_ENV.useMockApi) {
    await wait(350);

    if (email === 'admin@ignito.com' && password === 'admin123') {
      return { user: MOCK_USER, token: 'demo-token' };
    }

    throw new Error('Invalid credentials');
  }

  return apiRequest('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}
