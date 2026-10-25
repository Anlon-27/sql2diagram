import { reactive } from 'vue';
import { fetchAccessStatus } from './licenseClient.js';

const accessState = reactive({
  ready: false,
  licensed: false,
  expiresAt: null,
  guest: null
});

function getDeviceContext() {
  if (typeof window === 'undefined') {
    return { deviceId: '', userAgent: '' };
  }

  let deviceId = '';
  try {
    const key = 'rgw_device_id';
    deviceId = window.localStorage.getItem(key) || '';
    if (!deviceId) {
      deviceId = (typeof crypto !== 'undefined' && crypto?.randomUUID)
        ? crypto.randomUUID()
        : `dev_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
      window.localStorage.setItem(key, deviceId);
    }
  } catch {
    deviceId = '';
  }

  return { deviceId, userAgent: window.navigator?.userAgent || '' };
}

function applyAccessState(payload) {
  accessState.ready = true;
  accessState.licensed = Boolean(payload?.licensed);
  accessState.expiresAt = payload?.expiresAt ?? null;
  accessState.guest = payload?.guest || null;
  return accessState;
}

export function buildAccessStatePayload(statusPayload = {}, deviceContext = {}) {
  return {
    licensed: Boolean(statusPayload?.licensed),
    expiresAt: statusPayload?.expiresAt ?? null,
    guest: {
      deviceId: deviceContext?.deviceId || '',
      userAgent: deviceContext?.userAgent || '',
      quota: {
        generateUsed: statusPayload?.generateUsed ?? 0,
        generateRemaining: statusPayload?.generateRemaining ?? 0
      }
    }
  };
}

export async function loadAccessState() {
  const deviceContext = getDeviceContext();

  try {
    const statusPayload = await fetchAccessStatus(deviceContext.deviceId);
    return applyAccessState(buildAccessStatePayload(statusPayload, deviceContext));
  } catch {
    return applyAccessState(buildAccessStatePayload({
      licensed: true,
      generateRemaining: 999
    }, deviceContext));
  }
}

export function getRemainingTimeText(expiresAt) {
  if (!expiresAt) return '永久授权';
  const expires = new Date(expiresAt).getTime();
  const now = Date.now();
  const diffMs = expires - now;

  if (diffMs <= 0) return '已过期';

  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays > 365 * 10) return '永久授权';

  if (diffDays > 30) {
    const months = Math.floor(diffDays / 30);
    const days = diffDays % 30;
    return days > 0 ? `${months}个月${days}天` : `${months}个月`;
  }

  if (diffMs < 1000 * 60 * 60 * 24) {
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    if (hours > 0) return `${hours}小时`;
    const mins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    return `${mins}分钟`;
  }

  return `${diffDays}天`;
}

export function shouldShowActivateButton(accessState) {
  if (!accessState || typeof accessState !== 'object') return false;
  if (accessState.licensed) return false;
  const remaining = accessState.guest?.quota?.generateRemaining;
  if (typeof remaining === 'number') {
    return remaining <= 0;
  }
  return false;
}
