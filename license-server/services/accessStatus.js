import { buildGuestStatus, getGuestUsage } from './guestUsage.js'

export function buildAccessStatus({ guestRow, freeLimit }) {
  return buildGuestStatus(guestRow, freeLimit)
}

export async function getAccessStatus({ db, deviceId, freeLimit }) {
  const guestRow = await getGuestUsage(db, deviceId)
  return buildAccessStatus({ guestRow, freeLimit })
}
