import { APP_ENV } from '../config/env';
import { apiRequest } from '../lib/apiClient';
import { MOCK_IDE_FILES, MOCK_RUN_RESPONSE, MOCK_TERMINAL_EVENTS } from '../constants/mockData';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchFiles() {
  if (APP_ENV.useMockApi) {
    await wait(200);
    return {
      success: true,
      files: MOCK_IDE_FILES.map(({ content, language, ...file }) => file),
    };
  }

  return apiRequest('/files');
}

export async function fetchFileContent(path) {
  if (APP_ENV.useMockApi) {
    await wait(150);
    const file = MOCK_IDE_FILES.find((item) => item.path === path) || MOCK_IDE_FILES[0];
    return {
      success: true,
      path: file.path,
      content: file.content,
      language: file.language,
    };
  }

  return apiRequest(`/files/content?path=${encodeURIComponent(path)}`);
}

export async function saveFile(payload) {
  if (APP_ENV.useMockApi) {
    await wait(150);
    return {
      success: true,
      message: 'File saved successfully',
      ...payload,
    };
  }

  return apiRequest('/save', {
    method: 'POST',
    body: payload,
  });
}

export async function runFile(payload) {
  if (APP_ENV.useMockApi) {
    await wait(200);
    return MOCK_RUN_RESPONSE;
  }

  return apiRequest('/run', {
    method: 'POST',
    body: payload,
  });
}

export function connectTerminalStream({ sessionId, runId, onMessage }) {
  if (APP_ENV.useMockApi) {
    let index = 0;
    const interval = setInterval(() => {
      if (index >= MOCK_TERMINAL_EVENTS.length) {
        clearInterval(interval);
        return;
      }

      const event = {
        ...MOCK_TERMINAL_EVENTS[index],
        sessionId,
        runId: runId || MOCK_TERMINAL_EVENTS[index].runId,
      };
      onMessage?.(event);
      index += 1;
    }, 500);

    return {
      close: () => clearInterval(interval),
      send: () => {},
    };
  }

  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host;
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
