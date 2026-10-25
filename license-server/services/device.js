export function toIsoTimestamp(value = new Date()) {
  if (value instanceof Date) {
    return value.toISOString()
  }

  return new Date(value).toISOString()
}

export function buildDeviceRecord(redeemCodeId, deviceId, now = new Date()) {
  const timestamp = toIsoTimestamp(now)

  return {
    redeem_code_id: redeemCodeId,
    device_id: deviceId,
    first_seen_at: timestamp,
    last_seen_at: timestamp,
  }
}
