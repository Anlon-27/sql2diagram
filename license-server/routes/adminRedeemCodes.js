function getAdminToken(request) {
  return request.headers['x-admin-token'] ?? ''
}

function unauthorized() {
  return {
    status: 401,
    body: {
      ok: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'admin token required',
      },
    },
  }
}

function ensureAdmin(request, config) {
  const expectedToken = config?.adminToken ?? ''
  const token = getAdminToken(request)

  if (!expectedToken || token !== expectedToken) {
    return unauthorized()
  }

  return null
}

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

export async function handleCreateRedeemCodes({ request, body, deps, config }) {
  const authError = ensureAdmin(request, config)
  if (authError) {
    return authError
  }

  if (typeof deps.adminRedeemCodes?.createRedeemCodes !== 'function') {
    return notImplemented('createRedeemCodes')
  }

  return {
    status: 200,
    body: await deps.adminRedeemCodes.createRedeemCodes({
      body,
      config,
    }),
  }
}

export async function handleListRedeemCodes({ request, query, deps, config }) {
  const authError = ensureAdmin(request, config)
  if (authError) {
    return authError
  }

  if (typeof deps.adminRedeemCodes?.listRedeemCodes !== 'function') {
    return notImplemented('listRedeemCodes')
  }

  return {
    status: 200,
    body: await deps.adminRedeemCodes.listRedeemCodes({
      query,
      config,
    }),
  }
}

export async function handleDisableRedeemCode({ request, body, deps, config }) {
  const authError = ensureAdmin(request, config)
  if (authError) {
    return authError
  }

  if (typeof deps.adminRedeemCodes?.disableRedeemCode !== 'function') {
    return notImplemented('disableRedeemCode')
  }

  return {
    status: 200,
    body: await deps.adminRedeemCodes.disableRedeemCode({
      code: body?.code ?? null,
      config,
    }),
  }
}

export async function handleListUsages({ request, query, deps, config }) {
  const authError = ensureAdmin(request, config)
  if (authError) {
    return authError
  }

  if (typeof deps.adminRedeemCodes?.listUsages !== 'function') {
    return notImplemented('listUsages')
  }

  return {
    status: 200,
    body: await deps.adminRedeemCodes.listUsages({
      query,
      config,
    }),
  }
}

export async function handleUnbindDevice({ request, body, deps, config }) {
  const authError = ensureAdmin(request, config)
  if (authError) {
    return authError
  }

  if (typeof deps.adminRedeemCodes?.unbindDevice !== 'function') {
    return notImplemented('unbindDevice')
  }

  return {
    status: 200,
    body: await deps.adminRedeemCodes.unbindDevice({
      code: body?.code ?? null,
      deviceId: body?.deviceId ?? null,
      config,
    }),
  }
}

export async function handleResetGuestUsage({ request, body, deps, config }) {
  const authError = ensureAdmin(request, config)
  if (authError) {
    return authError
  }

  if (typeof deps.adminRedeemCodes?.resetGuestUsage !== 'function') {
    return notImplemented('resetGuestUsage')
  }

  return {
    status: 200,
    body: await deps.adminRedeemCodes.resetGuestUsage({
      deviceId: body?.deviceId ?? null,
      config,
    }),
  }
}
