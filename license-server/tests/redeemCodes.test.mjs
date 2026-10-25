import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { existsSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const serverDir = path.resolve(__dirname, '..')

async function importModule(relativePath) {
  const filePath = path.join(serverDir, relativePath)
  assert.ok(existsSync(filePath), `${relativePath} should exist`)
  return import(pathToFileURL(filePath).href)
}

function createFakeDeviceDb(rows = []) {
  const state = rows.map((row) => ({ ...row }))

  return {
    async listRedeemCodeDevices(redeemCodeId) {
      return state
        .filter((row) => row.redeem_code_id === redeemCodeId)
        .sort((left, right) => String(left.first_seen_at).localeCompare(String(right.first_seen_at)))
        .map((row) => ({ ...row }))
    },
    async touchRedeemCodeDevice(redeemCodeId, deviceId, timestamp) {
      const row = state.find(
        (item) => item.redeem_code_id === redeemCodeId && item.device_id === deviceId,
      )
      if (!row) {
        return null
      }

      row.last_seen_at = timestamp
      return { ...row }
    },
    async deleteRedeemCodeDevice(redeemCodeId, deviceId) {
      const index = state.findIndex(
        (item) => item.redeem_code_id === redeemCodeId && item.device_id === deviceId,
      )
      if (index >= 0) {
        state.splice(index, 1)
      }
    },
    async insertRedeemCodeDevice(record) {
      state.push({ ...record })
      return { ...record }
    },
    snapshot() {
      return state.map((row) => ({ ...row }))
    },
  }
}

test('createCodeValue returns the expected RGW code format for a duration without relying on Math.random', async () => {
  const { createCodeValue } = await importModule('services/redeemCodes.js')

  const originalRandom = Math.random
  Math.random = () => {
    throw new Error('Math.random should not be used here')
  }

  try {
    const code = createCodeValue(30)
    assert.match(code, /^RGW-30D-[A-Z0-9]{4}-[A-Z0-9]{4}$/)
  } finally {
    Math.random = originalRandom
  }
})

test('activateCodeRecord marks an unused record active and computes expiry from duration_days', async () => {
  const { activateCodeRecord } = await importModule('services/redeemCodes.js')

  const now = new Date('2026-06-20T12:00:00.000Z')
  const record = {
    id: 9,
    code: 'RGW-30D-ABCD-EFGH',
    duration_days: 30,
    status: 'unused',
    max_devices: null,
    note: 'promo',
  }

  const activated = activateCodeRecord(record, now)

  assert.deepEqual(activated, {
    id: 9,
    code: 'RGW-30D-ABCD-EFGH',
    duration_days: 30,
    status: 'active',
    activated_at: '2026-06-20T12:00:00.000Z',
    expires_at: '2026-07-20T12:00:00.000Z',
    max_devices: 2,
    note: 'promo',
  })
})

test('attachDeviceWithRollover refreshes last_seen_at when the device is already attached', async () => {
  const { attachDeviceWithRollover } = await importModule('services/redeemCodes.js')

  const db = createFakeDeviceDb([
    {
      redeem_code_id: 41,
      device_id: 'device-a',
      first_seen_at: '2026-06-01T00:00:00.000Z',
      last_seen_at: '2026-06-05T00:00:00.000Z',
    },
  ])

  const result = await attachDeviceWithRollover(db, 41, 'device-a', 2, new Date('2026-06-20T08:30:00.000Z'))

  assert.equal(result.replacedDeviceId, null)
  assert.deepEqual(result.deviceRecord, {
    redeem_code_id: 41,
    device_id: 'device-a',
    first_seen_at: '2026-06-01T00:00:00.000Z',
    last_seen_at: '2026-06-20T08:30:00.000Z',
  })
  assert.equal(db.snapshot().length, 1)
})

test('attachDeviceWithRollover removes the oldest device when max_devices is full', async () => {
  const { attachDeviceWithRollover } = await importModule('services/redeemCodes.js')

  const db = createFakeDeviceDb([
    {
      redeem_code_id: 99,
      device_id: 'device-oldest',
      first_seen_at: '2026-06-01T00:00:00.000Z',
      last_seen_at: '2026-06-02T00:00:00.000Z',
    },
    {
      redeem_code_id: 99,
      device_id: 'device-keep',
      first_seen_at: '2026-06-03T00:00:00.000Z',
      last_seen_at: '2026-06-03T00:00:00.000Z',
    },
  ])

  const result = await attachDeviceWithRollover(db, 99, 'device-new', 2, new Date('2026-06-20T09:00:00.000Z'))

  assert.equal(result.replacedDeviceId, 'device-oldest')
  assert.deepEqual(result.deviceRecord, {
    redeem_code_id: 99,
    device_id: 'device-new',
    first_seen_at: '2026-06-20T09:00:00.000Z',
    last_seen_at: '2026-06-20T09:00:00.000Z',
  })
  assert.deepEqual(db.snapshot(), [
    {
      redeem_code_id: 99,
      device_id: 'device-keep',
      first_seen_at: '2026-06-03T00:00:00.000Z',
      last_seen_at: '2026-06-03T00:00:00.000Z',
    },
    {
      redeem_code_id: 99,
      device_id: 'device-new',
      first_seen_at: '2026-06-20T09:00:00.000Z',
      last_seen_at: '2026-06-20T09:00:00.000Z',
    },
  ])
})
