export const LICENSE_DIALOG_EVENT = 'rgw:open-license-dialog';
const DEVICE_ID_STORAGE_KEY = 'rgw_device_id';

export function shouldBlockGeneration(status) {
  return status?.licensed !== true && Number(status?.generateRemaining ?? 0) <= 0;
}

export function shouldWarnRemaining(status) {
  const remaining = Number(status?.generateRemaining ?? 0);
  return status?.licensed !== true && remaining > 0 && remaining <= 2;
}

export function buildGenerateDecision(status) {
  if (shouldBlockGeneration(status)) {
    return {
      allowed: false,
      reason: 'FREE_LIMIT_REACHED'
    };
  }

  return {
    allowed: true,
    reason: null
  };
}

export function normalizeAccessPayload(payload = {}) {
  return payload?.access ?? payload;
}

export function openLicenseDialog(detail = {}) {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new CustomEvent(LICENSE_DIALOG_EVENT, { detail }));
}

export function getStoredDeviceId() {
  if (typeof window === 'undefined') {
    return '';
  }

  try {
    return window.localStorage.getItem(DEVICE_ID_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  const body = await response.json();

  if (!response.ok) {
    const message = body?.error?.message || body?.message || `request failed: ${response.status}`;
    throw new Error(message);
  }

  return body;
}

export async function requestGeneratePermission() {
  try {
    const result = await postJson('/api/generate/check', {
      deviceId: getStoredDeviceId()
    });
    const access = result?.access || {};
    const decision = buildGenerateDecision({
      licensed: access.licensed,
      generateRemaining: access.generateRemaining
    });

    return {
      ...decision,
      access,
      raw: result
    };
  } catch {
    return {
      allowed: true,
      reason: null,
      access: {
        licensed: true,
        generateRemaining: 999
      },
      raw: null
    };
  }
}

export async function commitGenerateSuccess() {
  try {
    return await postJson('/api/generate/commit', {
      deviceId: getStoredDeviceId()
    });
  } catch {
    return { ok: true };
  }
}
