import test from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { existsSync, mkdtempSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'
import os from 'node:os'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const serverDir = path.resolve(__dirname, '..')

async function importModule(relativePath) {
  const filePath = path.join(serverDir, relativePath)
  assert.ok(existsSync(filePath), `${relativePath} should exist`)
  return import(pathToFileURL(filePath).href)
}

async function withServer(server, callback) {
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })

  const address = server.address()
  assert.ok(address && typeof address === 'object')

  try {
    await callback(`http://127.0.0.1:${address.port}`)
  } finally {
    await new Promise((resolve, reject) => {
      server.close((error) => {
        if (error) {
          reject(error)
          return
        }

        resolve()
      })
    })
  }
}

function createTestConfig(overrides = {}) {
  const databaseDir = mkdtempSync(path.join(os.tmpdir(), 'rgw-license-tests-'))
  return {
    port: 0,
    adminToken: 'top-secret',
    databaseUrl: path.join(databaseDir, 'license.db'),
    ...overrides,
  }
}

test('route modules expose the expected public and admin handlers', async () => {
  const [{ handleAccessStatus, handleRedeemCode, handleGenerateCheck, handleGenerateCommit }, { handleCreateRedeemCodes, handleListRedeemCodes, handleDisableRedeemCode }] =
    await Promise.all([
      importModule('routes/publicAccess.js'),
      importModule('routes/adminRedeemCodes.js'),
    ])

  assert.equal(typeof handleAccessStatus, 'function')
  assert.equal(typeof handleRedeemCode, 'function')
  assert.equal(typeof handleGenerateCheck, 'function')
  assert.equal(typeof handleGenerateCommit, 'function')
  assert.equal(typeof handleCreateRedeemCodes, 'function')
  assert.equal(typeof handleListRedeemCodes, 'function')
  assert.equal(typeof handleDisableRedeemCode, 'function')
})

test('GET /api/access-status returns guest access payload', async () => {
  const { createServer } = await importModule('proxy.js')

  const server = createServer(
    createTestConfig({ freeLimit: 10 }),
    {
      publicAccess: {
        getAccessStatus: async ({ deviceId }) => ({
          device_id: deviceId,
          licensed: false,
          generateUsed: 1,
          generateFreeLimit: 10,
          generateRemaining: 9,
          mode: 'guest',
        }),
      },
    },
  )

  await withServer(server, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/access-status?deviceId=guest-device`)
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('content-type'), 'application/json; charset=utf-8')

    const payload = await response.json()
    assert.deepEqual(payload, {
      device_id: 'guest-device',
      licensed: false,
      generateUsed: 1,
      generateFreeLimit: 10,
      generateRemaining: 9,
      mode: 'guest',
    })
  })
})

test('admin create redeem-code route requires x-admin-token', async () => {
  const { createServer } = await importModule('proxy.js')

  const server = createServer(
    createTestConfig(),
    {
      adminRedeemCodes: {
        createRedeemCodes: async () => {
          throw new Error('should not reach admin service without token')
        },
      },
    },
  )

  await withServer(server, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/admin/redeem-codes/create`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ durationDays: 30, quantity: 2 }),
    })

    assert.equal(response.status, 401)
    const payload = await response.json()
    assert.deepEqual(payload, {
      ok: false,
      error: {
        code: 'UNAUTHORIZED',
        message: 'admin token required',
      },
    })
  })
})

test('POST /api/generate/check returns injected service result', async () => {
  const { createServer } = await importModule('proxy.js')

  const server = createServer(
    createTestConfig(),
    {
      publicAccess: {
        checkGenerate: async ({ deviceId }) => ({
          ok: true,
          allowed: true,
          reason: 'guest-within-limit',
          access: {
            device_id: deviceId,
            licensed: false,
            generateUsed: 2,
            generateFreeLimit: 10,
            mode: 'guest',
            generateRemaining: 8,
          },
        }),
      },
    },
  )

  await withServer(server, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/generate/check`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ deviceId: 'device-check-1' }),
    })

    assert.equal(response.status, 200)
    const payload = await response.json()
    assert.deepEqual(payload, {
      ok: true,
      allowed: true,
      reason: 'guest-within-limit',
      access: {
        device_id: 'device-check-1',
        licensed: false,
        generateUsed: 2,
        generateFreeLimit: 10,
        mode: 'guest',
        generateRemaining: 8,
      },
    })
  })
})

test('POST /api/redeem-code returns licensed payload shape', async () => {
  const { createServer } = await importModule('proxy.js')

  const server = createServer(
    createTestConfig({ freeLimit: 10 }),
    {
      publicAccess: {
        redeemCode: async ({ deviceId, code }) => ({
          ok: true,
          licensed: true,
          deviceId: deviceId,
          code,
          expiresAt: '2026-07-20T23:59:59.000Z',
        }),
      },
    },
  )

  await withServer(server, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/redeem-code`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ code: 'RGW-30D-ABCD-1234', deviceId: 'redeem-device-1' }),
    })

    assert.equal(response.status, 200)
    const payload = await response.json()
    assert.deepEqual(payload, {
      ok: true,
      licensed: true,
      deviceId: 'redeem-device-1',
      code: 'RGW-30D-ABCD-1234',
      expiresAt: '2026-07-20T23:59:59.000Z',
    })
  })
})

test('redeemed device stays licensed for access-status and generate-check', async () => {
  const { createServer } = await importModule('proxy.js')

  const server = createServer(createTestConfig({ freeLimit: 10 }))

  await withServer(server, async (baseUrl) => {
    const createResponse = await fetch(`${baseUrl}/api/admin/redeem-codes/create`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-admin-token': 'top-secret',
      },
      body: JSON.stringify({ durationDays: 30, quantity: 1, maxDevices: 2, note: 'test' }),
    })
    assert.equal(createResponse.status, 200)
    const createPayload = await createResponse.json()
    const createdCode = createPayload.codes?.[0]?.code
    assert.ok(createdCode, 'expected created redeem code')

    const redeemResponse = await fetch(`${baseUrl}/api/redeem-code`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ code: createdCode, deviceId: 'licensed-device-1' }),
    })
    assert.equal(redeemResponse.status, 200)
    const redeemPayload = await redeemResponse.json()
    assert.equal(redeemPayload.licensed, true)
    assert.equal(redeemPayload.deviceId, 'licensed-device-1')

    const accessStatusResponse = await fetch(`${baseUrl}/api/access-status?deviceId=licensed-device-1`)
    assert.equal(accessStatusResponse.status, 200)
    const accessStatusPayload = await accessStatusResponse.json()
    assert.equal(accessStatusPayload.licensed, true)
    assert.equal(accessStatusPayload.mode, 'licensed')
    assert.equal(accessStatusPayload.generateRemaining, null)

    const generateCheckResponse = await fetch(`${baseUrl}/api/generate/check`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ deviceId: 'licensed-device-1' }),
    })
    assert.equal(generateCheckResponse.status, 200)
    const generateCheckPayload = await generateCheckResponse.json()
    assert.equal(generateCheckPayload.ok, true)
    assert.equal(generateCheckPayload.allowed, true)
    assert.equal(generateCheckPayload.access?.licensed, true)
    assert.equal(generateCheckPayload.access?.mode, 'licensed')
  })
})

test('server defaults guest free limit to 20 when config does not override it', async () => {
  const { createServer } = await importModule('proxy.js')

  const server = createServer(createTestConfig())

  await withServer(server, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/access-status?deviceId=default-limit-device`)
    assert.equal(response.status, 200)

    const payload = await response.json()
    assert.equal(payload.generateFreeLimit, 20)
    assert.equal(payload.generateRemaining, 20)
    assert.equal(payload.generateUsed, 0)
  })
})

test('GET /api/admin/usages returns paginated usage records', async () => {
  const { createServer } = await importModule('proxy.js')

  const server = createServer(
    createTestConfig(),
    {
      adminRedeemCodes: {
        listUsages: async ({ query }) => ({
          ok: true,
          usages: [
            {
              id: 21,
              deviceId: 'device-21',
              generateUsed: 7,
              createdAt: '2026-07-27T02:00:00.000Z',
              updatedAt: '2026-07-27T03:00:00.000Z',
            },
          ],
          summary: {
            totalDevices: 41,
            totalGenerates: 168,
          },
          pagination: {
            page: Number(query.get('page')),
            pageSize: Number(query.get('pageSize')),
            total: 41,
            totalPages: 3,
          },
        }),
      },
    },
  )

  await withServer(server, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/admin/usages?page=2&pageSize=20`, {
      headers: {
        'x-admin-token': 'top-secret',
      },
    })

    assert.equal(response.status, 200)
    const payload = await response.json()
    assert.deepEqual(payload, {
      ok: true,
      usages: [
        {
          id: 21,
          deviceId: 'device-21',
          generateUsed: 7,
          createdAt: '2026-07-27T02:00:00.000Z',
          updatedAt: '2026-07-27T03:00:00.000Z',
        },
      ],
      summary: {
        totalDevices: 41,
        totalGenerates: 168,
      },
      pagination: {
        page: 2,
        pageSize: 20,
        total: 41,
        totalPages: 3,
      },
    })
  })
})

test('GET /api/access-status sets an httpOnly guest cookie when guest identity is missing', async () => {
  const { createServer } = await importModule('proxy.js')

  const server = createServer(createTestConfig({ freeLimit: 10 }))

  await withServer(server, async (baseUrl) => {
    const response = await fetch(`${baseUrl}/api/access-status`, {
      headers: {
        'x-forwarded-for': '203.0.113.10',
      },
    })

    assert.equal(response.status, 200)
    const setCookie = response.headers.get('set-cookie')
    assert.ok(setCookie, 'expected guest cookie to be issued')
    assert.match(setCookie, /rgw_guest_id=/)
    assert.match(setCookie, /HttpOnly/i)
    assert.match(setCookie, /SameSite=Lax/i)
    assert.match(setCookie, /Path=\//i)
  })
})

test('guest free quota is capped per IP even when cookie and device id change', async () => {
  const { createServer } = await importModule('proxy.js')

  const server = createServer(createTestConfig({ freeLimit: 10 }))

  await withServer(server, async (baseUrl) => {
    const headers = {
      'content-type': 'application/json',
      'x-forwarded-for': '198.51.100.24',
    }

    for (let index = 0; index < 10; index += 1) {
      const response = await fetch(`${baseUrl}/api/generate/commit`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ deviceId: `incognito-device-${index}` }),
      })

      assert.equal(response.status, 200)
    }

    const blockedCheck = await fetch(`${baseUrl}/api/generate/check`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ deviceId: 'incognito-device-next' }),
    })

    assert.equal(blockedCheck.status, 200)
    const blockedPayload = await blockedCheck.json()
    assert.equal(blockedPayload.allowed, false)
    assert.equal(blockedPayload.reason, 'guest-limit-reached')
    assert.equal(blockedPayload.access.generateFreeLimit, 10)
    assert.equal(blockedPayload.access.generateRemaining, 0)

    const blockedCommit = await fetch(`${baseUrl}/api/generate/commit`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ deviceId: 'incognito-device-next' }),
    })

    assert.equal(blockedCommit.status, 400)
    const blockedCommitPayload = await blockedCommit.json()
    assert.equal(blockedCommitPayload.ok, false)
    assert.equal(blockedCommitPayload.error?.code, 'GENERATE_LIMIT_REACHED')
    assert.equal(blockedCommitPayload.access.generateRemaining, 0)
  })
})
