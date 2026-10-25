const GUEST_COOKIE_NAME = 'rgw_guest_id'

function notImplemented(name) {
  return {
    status: 501,
    body: {
      ok: false,
      error: {
        code: 'NOT_IMPLEMENTED',
        message: `${name} service is not configured`,
      },
    },
  }
}

function parseCookies(cookieHeader = '') {
  return String(cookieHeader || '')
    .split(';')
    .map((segment) => segment.trim())
    .filter(Boolean)
    .reduce((cookies, segment) => {
      const separatorIndex = segment.indexOf('=')
      if (separatorIndex === -1) return cookies
      const key = segment.slice(0, separatorIndex).trim()
      const value = segment.slice(separatorIndex + 1).trim()
      cookies[key] = decodeURIComponent(value)
      return cookies
    }, {})
}

function createGuestId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }

  return `guest_${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`
}

function serializeGuestCookie(guestId) {
  const maxAge = 60 * 60 * 24 * 365
  return `${GUEST_COOKIE_NAME}=${encodeURIComponent(guestId)}; Path=/; Max-Age=${maxAge}; HttpOnly; SameSite=Lax`
}

function getDeviceContext({ request, body, query }) {
  const cookieHeader = request?.headers?.cookie ?? ''
  const cookies = parseCookies(cookieHeader)
  const cookieDeviceId = cookies[GUEST_COOKIE_NAME] || ''
  const requestDeviceId = body?.deviceId ?? query.get('deviceId') ?? ''

  if (cookieDeviceId) {
    return {
      deviceId: cookieDeviceId,
      headers: {},
    }
  }

  const nextDeviceId = requestDeviceId || createGuestId()
  return {
    deviceId: nextDeviceId,
    headers: {
      'set-cookie': serializeGuestCookie(nextDeviceId),
    },
  }
}

function getClientIp(request) {
  const forwarded = request?.headers?.['x-forwarded-for']
  if (typeof forwarded === 'string' && forwarded.trim()) {
    return forwarded.split(',')[0].trim()
  }

  const realIp = request?.headers?.['x-real-ip']
  if (typeof realIp === 'string' && realIp.trim()) {
    return realIp.trim()
  }

  const cfIp = request?.headers?.['cf-connecting-ip']
  if (typeof cfIp === 'string' && cfIp.trim()) {
    return cfIp.trim()
  }

  return request?.socket?.remoteAddress ?? null
}

export async function handleAccessStatus({ request, query, body, deps, config }) {
  if (typeof deps.publicAccess?.getAccessStatus !== 'function') {
    return notImplemented('getAccessStatus')
  }

  const { deviceId, headers } = getDeviceContext({ request, body, query })
  const result = await deps.publicAccess.getAccessStatus({
    deviceId,
    clientIp: getClientIp(request),
    query,
    body,
    config,
  })

  return {
    status: 200,
    body: result,
    headers,
  }
}

export async function handleRedeemCode({ request, body, deps, config }) {
  if (typeof deps.publicAccess?.redeemCode !== 'function') {
    return notImplemented('redeemCode')
  }

  const { deviceId, headers } = getDeviceContext({ request, body, query: new URLSearchParams() })
  const result = await deps.publicAccess.redeemCode({
    deviceId,
    code: body?.code ?? null,
    clientIp: getClientIp(request),
    body,
    config,
  })

  return {
    status: Number(result?.ok === false && result?.error ? 400 : 200),
    body: result,
    headers,
  }
}

export async function handleGenerateCheck({ request, query, body, deps, config }) {
  if (typeof deps.publicAccess?.checkGenerate !== 'function') {
    return notImplemented('checkGenerate')
  }

  const { deviceId, headers } = getDeviceContext({ request, body, query })
  const result = await deps.publicAccess.checkGenerate({
    deviceId,
    clientIp: getClientIp(request),
    query,
    body,
    config,
  })

  return {
    status: 200,
    body: result,
    headers,
  }
}

export async function handleGenerateCommit({ request, query, body, deps, config }) {
  if (typeof deps.publicAccess?.commitGenerate !== 'function') {
    return notImplemented('commitGenerate')
  }

  const { deviceId, headers } = getDeviceContext({ request, body, query })
  const result = await deps.publicAccess.commitGenerate({
    deviceId,
    clientIp: getClientIp(request),
    query,
    body,
    config,
  })

  return {
    status: Number(result?.ok === false && result?.error ? 400 : 200),
    body: result,
    headers,
  }
}
