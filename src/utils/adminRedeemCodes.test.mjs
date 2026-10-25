import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ADMIN_PAGE_PASSWORD,
  ADMIN_RUNTIME_TOKEN,
  ADMIN_STORAGE_KEY,
  buildCreateRedeemCodesPayload,
  clearStoredAdminToken,
  getStoredAdminToken,
  persistAdminToken,
  resolveAdminToken
} from './licenseClient.js';

class MemoryStorage {
  constructor(initialEntries = {}) {
    this.store = new Map(Object.entries(initialEntries));
  }

  getItem(key) {
    return this.store.has(key) ? this.store.get(key) : null;
  }

  setItem(key, value) {
    this.store.set(key, String(value));
  }

  removeItem(key) {
    this.store.delete(key);
  }
}

function installWindow(storageEntries = {}) {
  const previousWindow = globalThis.window;
  globalThis.window = {
    localStorage: new MemoryStorage(storageEntries)
  };

  return () => {
    globalThis.window = previousWindow;
  };
}

test('buildCreateRedeemCodesPayload keeps duration and quantity', () => {
  const payload = buildCreateRedeemCodesPayload({
    durationDays: 30,
    quantity: 10,
    maxDevices: 2,
    note: 'Standard Monthly'
  });

  assert.deepEqual(payload, {
    durationDays: 30,
    quantity: 10,
    maxDevices: 2,
    note: 'Standard Monthly'
  });
});

test('resolveAdminToken returns runtime admin token only for matching page password', () => {
  assert.equal(resolveAdminToken('wrong-password'), '');
  assert.equal(resolveAdminToken(''), '');
});

test('persisted admin token survives refresh through localStorage helpers', () => {
  const restoreWindow = installWindow();

  try {
    assert.equal(ADMIN_STORAGE_KEY, 'rgw_admin_token');
    assert.equal(getStoredAdminToken(), '');

    persistAdminToken('test-token');

    assert.equal(getStoredAdminToken(), 'test-token');
  } finally {
    restoreWindow();
  }
});

test('clearStoredAdminToken removes persisted admin login state', () => {
  const restoreWindow = installWindow({
    rgw_admin_token: 'test-token'
  });

  try {
    assert.equal(getStoredAdminToken(), 'test-token');

    clearStoredAdminToken();

    assert.equal(getStoredAdminToken(), '');
  } finally {
    restoreWindow();
  }
});
