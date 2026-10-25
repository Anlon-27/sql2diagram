import {
  handleAccessStatus,
  handleRedeemCode,
  handleGenerateCheck,
  handleGenerateCommit,
} from './publicAccess.js'
import {
  handleCreateRedeemCodes,
  handleListRedeemCodes,
  handleDisableRedeemCode,
  handleListUsages,
  handleUnbindDevice,
  handleResetGuestUsage,
} from './adminRedeemCodes.js'

async function readJsonBody(request) {
  if (request.method === 'GET' || request.method === 'HEAD') {
    return null
  }

  const chunks = []
  for await (const chunk of request) {
    chunks.push(chunk)
  }

  if (chunks.length === 0) {
    return null
  }

  const raw = Buffer.concat(chunks).toString('utf8').trim()
  if (!raw) {
    return null
  }

  return JSON.parse(raw)
}

function bootstrapBody(config) {
  return {
    ok: true,
    service: 'license-server',
    port: config.port,
  }
}

function notFound(pathname) {
  return {
    status: 404,
    body: {
      ok: false,
      error: {
        code: 'NOT_FOUND',
        message: `no route for ${pathname}`,
      },
    },
  }
}

function badRequest(message) {
  return {
    status: 400,
    body: {
      ok: false,
      error: {
        code: 'BAD_REQUEST',
        message,
      },
    },
  }
}

export function createRouteHandler({ config, deps }) {
  return async function routeRequest(request) {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1')
    let body = null

    try {
      body = await readJsonBody(request)
    } catch {
      return badRequest('request body must be valid JSON')
    }

    const context = {
      request,
      pathname: url.pathname,
      query: url.searchParams,
      body,
      params: {},
      config,
      deps,
    }

    if (request.method === 'GET' && url.pathname === '/') {
      return {
        status: 200,
        body: bootstrapBody(config),
      }
    }

    if (request.method === 'GET' && url.pathname === '/api/access-status') {
      return handleAccessStatus(context)
    }

    if (request.method === 'POST' && url.pathname === '/api/redeem-code') {
      return handleRedeemCode(context)
    }

    if (request.method === 'POST' && url.pathname === '/api/generate/check') {
      return handleGenerateCheck(context)
    }

    if (request.method === 'POST' && url.pathname === '/api/generate/commit') {
      return handleGenerateCommit(context)
    }

    if (request.method === 'POST' && url.pathname === '/api/admin/redeem-codes/create') {
      return handleCreateRedeemCodes(context)
    }

    if (request.method === 'GET' && url.pathname === '/api/admin/redeem-codes') {
      return handleListRedeemCodes(context)
    }

    if (request.method === 'POST' && url.pathname === '/api/admin/redeem-codes/disable') {
      return handleDisableRedeemCode(context)
    }

    if (request.method === 'GET' && url.pathname === '/api/admin/usages') {
      return handleListUsages(context)
    }

    if (request.method === 'POST' && url.pathname === '/api/admin/redeem-codes/unbind-device') {
      return handleUnbindDevice(context)
    }

    if (request.method === 'POST' && url.pathname === '/api/admin/usages/reset') {
      return handleResetGuestUsage(context)
    }

    return notFound(url.pathname)
  }
}
