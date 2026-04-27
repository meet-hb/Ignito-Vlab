import { APP_ENV } from '../config/env';
import { apiRequest } from '../lib/apiClient';
import { MOCK_LABS, MOCK_LAB_DETAILS, MOCK_LAB_SESSION, MOCK_SUB_LABS } from '../constants/mockData';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchLabs() {
  if (APP_ENV.useMockApi) {
    await wait(250);
    return MOCK_LABS;
  }

  return apiRequest('/labs');
}

export async function fetchSubLabs() {
  if (APP_ENV.useMockApi) {
    await wait(250);
    return MOCK_SUB_LABS;
  }

  return apiRequest('/labs/sub-labs');
}

export async function fetchLabDetails(labId) {
  if (APP_ENV.useMockApi) {
    await wait(250);
    return { success: true, lab: MOCK_LAB_DETAILS[labId] || MOCK_LAB_DETAILS.p1 || Object.values(MOCK_LAB_DETAILS)[0] };
  }

  return apiRequest(`/labs/${labId}`);
}

export async function startLabSession(payload) {
  if (APP_ENV.useMockApi) {
    await wait(400);
    return {
      success: true,
      sessionId: `sess_${Math.random().toString(36).slice(2, 8)}`,
      labId: payload.labId,
      status: 'starting',
      message: 'Lab provisioning started',
      estimatedReadyInSeconds: 120,
    };
  }

  return apiRequest('/lab-sessions', {
    method: 'POST',
    body: payload,
  });
}

export async function fetchLabSessionStatus(sessionId) {
  if (APP_ENV.useMockApi) {
    await wait(400);
    return {
      ...MOCK_LAB_SESSION,
      sessionId,
    };
  }

  return apiRequest(`/lab-sessions/${sessionId}`);
}

export async function stopLabSession(sessionId) {
  if (APP_ENV.useMockApi) {
    await wait(250);
    return {
      success: true,
      sessionId,
      status: 'stopped',
      message: 'Lab stopped successfully',
    };
  }

  return apiRequest(`/lab-sessions/${sessionId}/stop`, {
    method: 'POST',
    body: { sessionId },
  });
}
