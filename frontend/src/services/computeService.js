import { APP_ENV } from '../config/env';
import { apiRequest } from '../lib/apiClient';
import { MOCK_CREATE_INSTANCE_OPTIONS, MOCK_INSTANCES } from '../constants/mockData';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchInstances() {
  if (APP_ENV.useMockApi) {
    await wait(250);
    return MOCK_INSTANCES;
  }

  return apiRequest('/compute/instances');
}

export async function fetchInstanceCatalog() {
  if (APP_ENV.useMockApi) {
    await wait(200);
    return MOCK_CREATE_INSTANCE_OPTIONS;
  }

  return apiRequest('/compute/catalog');
}

export async function createInstance(payload) {
  if (APP_ENV.useMockApi) {
    await wait(400);
    return {
      success: true,
      instanceId: `i-${Math.random().toString(16).slice(2, 10)}`,
      request: payload,
    };
  }

  return apiRequest('/compute/instances', {
    method: 'POST',
    body: payload,
  });
}
