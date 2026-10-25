function requireGuestUsageDb(db) {
  if (!db || typeof db.getGuestUsage !== 'function' || typeof db.saveGuestUsage !== 'function') {
    throw new TypeError('guest usage db adapter must provide getGuestUsage and saveGuestUsage')
  }

  return db
}

export function buildGuestStatus(row, freeLimit) {
  const generateUsed = Number(row?.generate_used ?? 0)
  const normalizedLimit = Math.max(0, Number(freeLimit ?? 0))
  const remaining = Math.max(0, normalizedLimit - generateUsed)

  return {
    device_id: row?.device_id ?? null,
    licensed: false,
    generateUsed,
    generateFreeLimit: normalizedLimit,
    generateRemaining: remaining,
    mode: remaining > 0 ? 'guest' : 'guest_limited',
  }
}

export async function getGuestUsage(db, deviceId) {
  return requireGuestUsageDb(db).getGuestUsage(deviceId)
}

export async function incrementGuestUsage(db, deviceId, amount = 1) {
  const adapter = requireGuestUsageDb(db)
  const current = (await adapter.getGuestUsage(deviceId)) ?? {
    device_id: deviceId,
    generate_used: 0,
  }

  const next = {
    device_id: deviceId,
    generate_used: Number(current.generate_used ?? 0) + Number(amount ?? 1),
  }

  return adapter.saveGuestUsage(next)
}
