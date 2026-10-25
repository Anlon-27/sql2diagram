import { randomBytes } from 'node:crypto'
import { buildDeviceRecord, toIsoTimestamp } from './device.js'

function randomChunk() {
  return randomBytes(3).toString('base64url').replace(/[^A-Z0-9]/gi, '').toUpperCase().slice(0, 4).padEnd(4, '0')
}

function addDays(now, durationDays) {
  return new Date(now.getTime() + Number(durationDays) * 24 * 60 * 60 * 1000)
}

function requireRedeemDeviceDb(db) {
  if (
    !db ||
    typeof db.listRedeemCodeDevices !== 'function' ||
    typeof db.touchRedeemCodeDevice !== 'function' ||
    typeof db.deleteRedeemCodeDevice !== 'function' ||
    typeof db.insertRedeemCodeDevice !== 'function'
  ) {
    throw new TypeError(
      'redeem code db adapter must provide listRedeemCodeDevices, touchRedeemCodeDevice, deleteRedeemCodeDevice, and insertRedeemCodeDevice',
    )
  }

  return db
}

export function createCodeValue(durationDays) {
  return `RGW-${Number(durationDays)}D-${randomChunk()}-${randomChunk()}`
}

export function activateCodeRecord(record, now = new Date()) {
  const activatedAt = toIsoTimestamp(now)

  return {
    ...record,
    status: 'active',
    activated_at: activatedAt,
    expires_at: toIsoTimestamp(addDays(now, record.duration_days)),
    max_devices: Number(record.max_devices ?? 2) || 2,
  }
}

export async function attachDeviceWithRollover(
  db,
  redeemCodeId,
  deviceId,
  maxDevices = 2,
  now = new Date(),
) {
  const adapter = requireRedeemDeviceDb(db)
  const timestamp = toIsoTimestamp(now)
  const existing = await adapter.touchRedeemCodeDevice(redeemCodeId, deviceId, timestamp)

  if (existing) {
    return {
      replacedDeviceId: null,
      deviceRecord: existing,
    }
  }

  const deviceRows = await adapter.listRedeemCodeDevices(redeemCodeId)
  let replacedDeviceId = null

  if (deviceRows.length >= maxDevices) {
    const oldest = deviceRows[0]
    replacedDeviceId = oldest.device_id
    await adapter.deleteRedeemCodeDevice(redeemCodeId, oldest.device_id)
  }

  const deviceRecord = buildDeviceRecord(redeemCodeId, deviceId, now)
  await adapter.insertRedeemCodeDevice(deviceRecord)

  return {
    replacedDeviceId,
    deviceRecord,
  }
}
