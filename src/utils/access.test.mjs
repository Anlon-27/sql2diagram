import test from 'node:test';
import assert from 'node:assert/strict';

import { buildAccessStatePayload, loadAccessState } from './access.js';

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
}

function installWindow({ userAgent = 'test-agent', storageEntries = {}, randomUUID = () => 'device-test-1' } = {}) {
  const storage = new MemoryStorage(storageEntries);
  const previousWindow = globalThis.window;
  const previousCrypto = globalThis.crypto;
  const previousCryptoDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'crypto');

  globalThis.window = {
    localStorage: storage,
    navigator: { userAgent }
  };
  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    writable: true,
    value: { randomUUID }
  });

  return () => {
    globalThis.window = previousWindow;
    if (previousCryptoDescriptor) {
      Object.defineProperty(globalThis, 'crypto', previousCryptoDescriptor);
    } else {
      globalThis.crypto = previousCrypto;
    }
  };
}

test('buildAccessStatePayload preserves access-status fields from API', () => {
  const payload = buildAccessStatePayload(
    {
      licensed: true,
      expiresAt: '2026-07-20T23:59:59.000Z',
      generateUsed: 19,
      generateRemaining: 1
    },
    {
      deviceId: 'dev_123',
      userAgent: 'agent/1.0'
    }
  );

  assert.deepEqual(payload, {
    licensed: true,
    expiresAt: '2026-07-20T23:59:59.000Z',
    guest: {
      deviceId: 'dev_123',
      userAgent: 'agent/1.0',
      quota: {
        generateUsed: 19,
        generateRemaining: 1
      }
    }
  });
});

test('loadAccessState reuses persisted deviceId and maps API payload', async () => {
  const restoreWindow = installWindow({
    userAgent: 'ua-test',
    storageEntries: { rgw_device_id: 'persisted-device' }
  });
  const previousFetch = globalThis.fetch;

  globalThis.fetch = async (url) => {
    assert.equal(url, '/api/access-status?deviceId=persisted-device');
    return {
      ok: true,
      async json() {
        return {
          licensed: false,
          expiresAt: null,
          generateUsed: 3,
          generateRemaining: 17
        };
      }
    };
  };

  try {
    const state = await loadAccessState();

    assert.equal(state.ready, true);
    assert.equal(state.licensed, false);
    assert.equal(state.expiresAt, null);
    assert.equal(state.guest.deviceId, 'persisted-device');
    assert.equal(state.guest.userAgent, 'ua-test');
    assert.equal(state.guest.quota.generateUsed, 3);
    assert.equal(state.guest.quota.generateRemaining, 17);
  } finally {
    globalThis.fetch = previousFetch;
    restoreWindow();
  }
});

test('loadAccessState falls back to standalone licensed payload when request fails', async () => {
  const restoreWindow = installWindow({
    userAgent: 'ua-fallback',
    randomUUID: () => 'generated-device'
  });
  const previousFetch = globalThis.fetch;

  globalThis.fetch = async () => {
    throw new Error('network down');
  };

  try {
    const state = await loadAccessState();

    assert.equal(state.ready, true);
    assert.equal(state.licensed, true);
    assert.equal(state.expiresAt, null);
    assert.equal(state.guest.deviceId, 'generated-device');
    assert.equal(state.guest.userAgent, 'ua-fallback');
    assert.equal(state.guest.quota.generateUsed, 0);
    assert.equal(state.guest.quota.generateRemaining, 999);
  } finally {
    globalThis.fetch = previousFetch;
    restoreWindow();
  }
});

test('shouldShowActivateButton returns false when guest still has free trial remaining', async () => {
  const { shouldShowActivateButton } = await import('./access.js');

  assert.equal(shouldShowActivateButton(null), false);
  assert.equal(shouldShowActivateButton({ licensed: true }), false);
  assert.equal(shouldShowActivateButton({ licensed: false, guest: { quota: { generateRemaining: 3 } } }), false);
  assert.equal(shouldShowActivateButton({ licensed: false, guest: { quota: { generateRemaining: 1 } } }), false);
});

test('shouldShowActivateButton returns true only when guest quota is exhausted (<= 0)', async () => {
  const { shouldShowActivateButton } = await import('./access.js');

  assert.equal(shouldShowActivateButton({ licensed: false, guest: { quota: { generateRemaining: 0 } } }), true);
  assert.equal(shouldShowActivateButton({ licensed: false, guest: { quota: { generateRemaining: -1 } } }), true);
});
