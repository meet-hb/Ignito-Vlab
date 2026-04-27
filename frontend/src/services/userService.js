import { APP_ENV } from '../config/env';
import { apiRequest } from '../lib/apiClient';

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const MOCK_USERS = [
  { id: 1, name: 'ayushi trivedi ayushi trivedi', email: 'ayushi.hackberrysoftech@gmail.com', role: 'Tenant User', status: 'CONFIRMED', enabled: 'True', created: '20-01-2026', updated: '20-01-2026' },
  { id: 2, name: 'Hackberrysoftech Hackberrysoftech', email: 'hackberry123@gmail.com', role: 'Tenant User', status: 'CONFIRMED', enabled: 'True', created: '16-01-2026', updated: '16-01-2026' },
  { id: 3, name: 'Ankur Patel', email: 'info@hackberrysoftech.com', role: 'Tenant Admin', status: 'CONFIRMED', enabled: 'True', created: '23-07-2025', updated: '29-09-2025' },
  { id: 4, name: 'Jalpa Rajpuriya Jalpa Rajpuriya', email: 'jalpa.rajpuriya@hackberrysoftech.in', role: 'Tenant User', status: 'CONFIRMED', enabled: 'True', created: '10-12-2025', updated: '10-12-2025' },
  { id: 5, name: 'Jp Jp', email: 'jalparajpuriya@gmail.com', role: 'Tenant User', status: 'CONFIRMED', enabled: 'True', created: '05-02-2026', updated: '05-02-2026' },
  { id: 6, name: 'Jayesh Chaudhary', email: 'jayesh_chaudhary@hackberrysoftech.in', role: 'Tenant Admin', status: 'CONFIRMED', enabled: 'True', created: '24-07-2025', updated: '24-07-2025' },
  { id: 7, name: 'manish123@gmail.com manish123@gmail.com', email: 'manish123@gmail.com', role: 'Tenant User', status: 'CONFIRMED', enabled: 'True', created: '24-02-2026', updated: '24-02-2026' },
  { id: 8, name: 'Mansi Patel Mansi Patel', email: 'mansi.ahajoliya@hackberrysoftech.in', role: 'Tenant User', status: 'CONFIRMED', enabled: 'True', created: '12-02-2026', updated: '12-02-2026' },
  { id: 9, name: 'Meet Nayak', email: 'meet.nayak@hackberrysoftech.in', role: 'Tenant Admin', status: 'CONFIRMED', enabled: 'True', created: '24-07-2025', updated: '24-07-2025' },
  { id: 10, name: 'Neha P Neha P', email: 'nehapatiavr.hackberrysoftech@gmail.com', role: 'Tenant User', status: 'CONFIRMED', enabled: 'True', created: '11-02-2026', updated: '11-02-2026' },
];

export async function fetchUsers() {
  if (APP_ENV.useMockApi) {
    await wait(300);
    return {
      success: true,
      users: MOCK_USERS,
    };
  }

  return apiRequest('/users');
}

export async function createUser(payload) {
  if (APP_ENV.useMockApi) {
    await wait(400);
    return {
      success: true,
      message: 'User created successfully',
    };
  }

  return apiRequest('/users', {
    method: 'POST',
    body: payload,
  });
}

export async function updateUserStatus(userId, status) {
  if (APP_ENV.useMockApi) {
    await wait(300);
    return {
      success: true,
      message: `User ${userId} status updated to ${status}`,
    };
  }

  return apiRequest(`/users/${userId}/status`, {
    method: 'PATCH',
    body: { status },
  });
}
