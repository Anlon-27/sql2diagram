export const ADMIN_PAGE_PASSWORD = (typeof process !== 'undefined' && process.env?.VITE_ADMIN_PAGE_PASSWORD)
  || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_PAGE_PASSWORD)
  || '';
export const ADMIN_RUNTIME_TOKEN = (typeof process !== 'undefined' && process.env?.VITE_ADMIN_RUNTIME_TOKEN)
  || (typeof import.meta !== 'undefined' && import.meta.env?.VITE_ADMIN_RUNTIME_TOKEN)
  || '';
export const ADMIN_STORAGE_KEY = 'rgw_admin_token';

function getStorage() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage ?? null;
  } catch {
    return null;
  }
}

export function getStoredAdminToken() {
  const storage = getStorage();
  if (!storage) return '';

  try {
    return storage.getItem(ADMIN_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function persistAdminToken(token) {
  const storage = getStorage();
  if (!storage || !token) return;

  try {
    storage.setItem(ADMIN_STORAGE_KEY, token);
  } catch {
    // ignore storage write failures and keep in-memory flow working
  }
}

export function clearStoredAdminToken() {
  const storage = getStorage();
  if (!storage) return;

  try {
    storage.removeItem(ADMIN_STORAGE_KEY);
  } catch {
    // ignore storage cleanup failures
  }
}

export async function fetchAccessStatus(deviceId) {
  const query = deviceId ? `?deviceId=${encodeURIComponent(deviceId)}` : '';
  const response = await fetch(`/api/access-status${query}`);

  if (!response.ok) {
    throw new Error(`access-status request failed: ${response.status}`);
  }

  return response.json();
}

async function postJson(url, payload, headers = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      ...headers
    },
    body: JSON.stringify(payload)
  });

  const body = await response.json();

  if (!response.ok) {
    throw new Error(body?.error?.message || body?.message || `${url} failed: ${response.status}`);
  }

  return body;
}

export function buildCreateRedeemCodesPayload({ durationDays, quantity, maxDevices = 2, note = '' }) {
  return {
    durationDays,
    quantity,
    maxDevices,
    note
  };
}

export function resolveAdminToken(pagePassword) {
  if (!ADMIN_PAGE_PASSWORD || !pagePassword) return '';
  return pagePassword === ADMIN_PAGE_PASSWORD ? ADMIN_RUNTIME_TOKEN : '';
}

export async function redeemLicenseCode({ code, deviceId }) {
  return postJson('/api/redeem-code', { code, deviceId });
}

export async function createRedeemCodes(payload, adminToken) {
  return postJson('/api/admin/redeem-codes/create', payload, {
    'x-admin-token': adminToken
  });
}

export async function listRedeemCodes(adminToken) {
  const response = await fetch('/api/admin/redeem-codes', {
    headers: {
      'x-admin-token': adminToken
    }
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body?.error?.message || body?.message || `list redeem codes failed: ${response.status}`);
  }

  return body;
}

export async function disableRedeemCode(code, adminToken) {
  return postJson('/api/admin/redeem-codes/disable', { code }, {
    'x-admin-token': adminToken
  });
}

export async function listUsages(adminToken, { page = 1, pageSize = 20 } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize)
  });
  const response = await fetch(`/api/admin/usages?${params.toString()}`, {
    headers: {
      'x-admin-token': adminToken
    }
  });

  const body = await response.json();
  if (!response.ok) {
    throw new Error(body?.error?.message || body?.message || `list usages failed: ${response.status}`);
  }

  return body;
}

export async function unbindDevice(code, deviceId, adminToken) {
  return postJson('/api/admin/redeem-codes/unbind-device', { code, deviceId }, {
    'x-admin-token': adminToken
  });
}

export async function resetGuestUsage(deviceId, adminToken) {
  return postJson('/api/admin/usages/reset', { deviceId }, {
    'x-admin-token': adminToken
  });
}
