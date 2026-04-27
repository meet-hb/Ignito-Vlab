import { apiRequest } from '../lib/apiClient';

export async function fetchFiles() {
  return apiRequest('/files');
}

export async function fetchFileContent(path) {
  return apiRequest(`/files/content?path=${encodeURIComponent(path)}`);
}

export async function saveFile(payload) {
  return apiRequest('/save', {
    method: 'POST',
    body: payload,
  });
}

export async function runFile(payload) {
  return apiRequest('/run', {
    method: 'POST',
    body: payload,
  });
}

export function connectTerminalStream({ sessionId, runId, onMessage }) {
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  // Use backend host (8080) for websocket
  const host = 'localhost:8080'; 
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
