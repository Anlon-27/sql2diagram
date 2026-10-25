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

function createGuestUsageDb(seed = []) {
  const state = new Map(seed.map((row) => [row.device_id, { ...row }]))

  return {
    async getGuestUsage(deviceId) {
      const row = state.get(deviceId)
      return row ? { ...row } : null
    },
    async saveGuestUsage(row) {
      state.set(row.device_id, { ...row })
      return { ...row }
    },
  }
}

test('buildGuestStatus returns guest while free quota remains', async () => {
  const { buildGuestStatus } = await importModule('services/guestUsage.js')

  const status = buildGuestStatus({ device_id: 'guest-1', generate_used: 1 }, 3)

  assert.deepEqual(status, {
    device_id: 'guest-1',
    licensed: false,
    generateUsed: 1,
    generateFreeLimit: 3,
    generateRemaining: 2,
    mode: 'guest',
  })
})

test('buildAccessStatus returns guest_limited when guest usage reaches the free limit', async () => {
  const { buildAccessStatus } = await importModule('services/accessStatus.js')

  const status = buildAccessStatus({
    guestRow: { device_id: 'guest-2', generate_used: 3 },
    freeLimit: 3,
  })

  assert.deepEqual(status, {
    device_id: 'guest-2',
    licensed: false,
    generateUsed: 3,
    generateFreeLimit: 3,
    generateRemaining: 0,
    mode: 'guest_limited',
  })
})

test('incrementGuestUsage creates and then updates guest usage rows through the db adapter', async () => {
  const { getGuestUsage, incrementGuestUsage } = await importModule('services/guestUsage.js')

  const db = createGuestUsageDb()

  const first = await incrementGuestUsage(db, 'device-77')
  const second = await incrementGuestUsage(db, 'device-77', 2)
  const row = await getGuestUsage(db, 'device-77')

  assert.deepEqual(first, {
    device_id: 'device-77',
    generate_used: 1,
  })
  assert.deepEqual(second, {
    device_id: 'device-77',
    generate_used: 3,
  })
  assert.deepEqual(row, {
    device_id: 'device-77',
    generate_used: 3,
  })
})

test('getAccessStatus reads guest usage from db and builds the guest status payload', async () => {
  const { getAccessStatus } = await importModule('services/accessStatus.js')

  const db = createGuestUsageDb([{ device_id: 'device-88', generate_used: 2 }])

  const status = await getAccessStatus({
    db,
    deviceId: 'device-88',
    freeLimit: 3,
  })

  assert.deepEqual(status, {
    device_id: 'device-88',
    licensed: false,
    generateUsed: 2,
    generateFreeLimit: 3,
    generateRemaining: 1,
    mode: 'guest',
  })
})
