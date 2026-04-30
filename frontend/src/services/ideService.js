import { apiRequest } from '../lib/apiClient';

// Helper to get sessionId from URL or state
const getActiveSessionId = () => {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('sessionId') || localStorage.getItem('activeVlabSessionId');
};

export async function fetchFiles() {
  const sessionId = getActiveSessionId();
  return apiRequest('/files', {
    headers: { 'x-session-id': sessionId }
  });
}

export async function fetchFileContent(path) {
  const sessionId = getActiveSessionId();
  return apiRequest(`/files/content?path=${encodeURIComponent(path)}`, {
    headers: { 'x-session-id': sessionId }
  });
}

export async function saveFile(payload) {
  const sessionId = getActiveSessionId();
  return apiRequest('/save', {
    method: 'POST',
    headers: { 'x-session-id': sessionId },
    body: payload,
  });
}

export async function runFile(payload) {
  const sessionId = getActiveSessionId();
  return apiRequest('/run', {
    method: 'POST',
    headers: { 'x-session-id': sessionId },
    body: payload,
  });
}

export async function deleteFile(path) {
  const sessionId = getActiveSessionId();
  return apiRequest(`/files?path=${encodeURIComponent(path)}`, {
    method: 'DELETE',
    headers: { 'x-session-id': sessionId },
  });
}

export function connectTerminalStream({ sessionId, runId, onMessage }) {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  // Use current window host (with port 8080) for websocket
  const host = `${window.location.hostname}:8080`; 
  const socket = new WebSocket(`${protocol}//${host}/ws/terminal?sessionId=${encodeURIComponent(sessionId)}&runId=${encodeURIComponent(runId || '')}`);

  socket.onmessage = (event) => {
    try {
      onMessage?.(JSON.parse(event.data));
    } catch {
      onMessage?.({ type: 'stdout', data: event.data });
    }
  };

  return socket;
}
