import { apiRequest } from '../lib/apiClient';

export async function fetchLabs() {
  return apiRequest('/labs');
}

export async function fetchSubLabs() {
  return apiRequest('/labs/sub-labs');
}

export async function fetchLabDetails(labId) {
  return apiRequest(`/labs/${labId}`);
}

export async function startLabSession(payload) {
  return apiRequest('/lab-sessions', {
    method: 'POST',
    body: payload,
  });
}

export async function fetchLabSessionStatus(sessionId) {
  return apiRequest(`/lab-sessions/${sessionId}`);
}

export async function fetchUserActiveSession(userId) {
  return apiRequest(`/lab-sessions/user/${userId}`);
}

export async function stopLabSession(sessionId) {
  return apiRequest(`/lab-sessions/${sessionId}/stop`, {
    method: 'POST',
    body: { sessionId },
  });
}
