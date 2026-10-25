import http from 'node:http'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { getConfig } from './config.js'
import { createCodeValue, activateCodeRecord } from './services/redeemCodes.js'
import { getAccessStatus as getGuestAccessStatus } from './services/accessStatus.js'
import { incrementGuestUsage } from './services/guestUsage.js'
import { createRouteHandler } from './routes/index.js'
import { createDb } from './db.js'

function createGuestUsageDb(db) {
  return {
    async getGuestUsage(deviceId) {
      const res = await db.query('SELECT * FROM guest_usage WHERE device_id = ?', [deviceId])
      return res.rows[0] || null
    },
    async saveGuestUsage(row) {
      const nowStr = new Date().toISOString()
      await db.query(`
        INSERT INTO guest_usage (device_id, generate_used, created_at, updated_at)
        VALUES (?, ?, ?, ?)
        ON CONFLICT(device_id) DO UPDATE SET
          generate_used = excluded.generate_used,
          updated_at = ?
      `, [row.device_id, row.generate_used, nowStr, nowStr, nowStr])
      return row
    },
  }
}

function createGuestIpUsageDb(db) {
  return {
    async getGuestIpUsage(ipKey, periodKey) {
      if (!ipKey || !periodKey) {
        return null
      }

      const res = await db.query(
        'SELECT * FROM guest_ip_usage WHERE ip_key = ? AND period_key = ?',
        [ipKey, periodKey],
      )
      return res.rows[0] || null
    },
    async saveGuestIpUsage(row) {
      const nowStr = new Date().toISOString()
      await db.query(`
        INSERT INTO guest_ip_usage (ip_key, period_key, generate_used, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(ip_key, period_key) DO UPDATE SET
          generate_used = excluded.generate_used,
          updated_at = ?
      `, [row.ip_key, row.period_key, row.generate_used, nowStr, nowStr, nowStr])
      return row
    },
  }
}

function createLicenseDb(db) {
  return {
    async getLicense(deviceId) {
      if (!deviceId) {
        return null
      }

      const res = await db.query(`
        SELECT c.*, d.device_id
        FROM redeem_codes c
        JOIN redeem_code_devices d ON c.id = d.redeem_code_id
        WHERE d.device_id = ? AND c.status = 'active'
        ORDER BY c.expires_at DESC
      `, [deviceId])

      const row = res.rows[0]
      if (!row) {
        return null
      }

      if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) {
        return null
      }

      return {
        device_id: deviceId,
        code: row.code,
        status: row.status,
        expires_at: row.expires_at,
      }
    },
    async saveLicense(row) {
      if (!row?.device_id || !row?.code) {
        return null
      }

      const codeRes = await db.query('SELECT id FROM redeem_codes WHERE code = ?', [row.code])
      const codeRow = codeRes.rows[0]
      if (!codeRow) {
        return null
      }

      const redeemCodeId = codeRow.id
      const nowStr = new Date().toISOString()

      await db.query(`
        INSERT INTO redeem_code_devices (redeem_code_id, device_id, first_seen_at, last_seen_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(redeem_code_id, device_id) DO UPDATE SET
          last_seen_at = ?,
          updated_at = ?
      `, [redeemCodeId, row.device_id, nowStr, nowStr, nowStr, nowStr, nowStr])

      return row
    },
  }
}

function createDefaultDeps(config) {
  const db = createDb({ databaseUrl: config.databaseUrl })
  
  // 在服务启动时，异步执行 SQLite 初始化建表
  db.connect().then(() => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS guest_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id TEXT NOT NULL UNIQUE,
        generate_used INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS redeem_codes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        code TEXT NOT NULL UNIQUE,
        duration_days INTEGER NOT NULL,
        status TEXT NOT NULL,
        activated_at TEXT,
        expires_at TEXT,
        max_devices INTEGER NOT NULL DEFAULT 2,
        note TEXT,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS redeem_code_devices (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        redeem_code_id INTEGER NOT NULL REFERENCES redeem_codes(id) ON DELETE CASCADE,
        device_id TEXT NOT NULL,
        first_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (redeem_code_id, device_id)
      );
      CREATE TABLE IF NOT EXISTS guest_ip_usage (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ip_key TEXT NOT NULL,
        period_key TEXT NOT NULL,
        generate_used INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (ip_key, period_key)
      );
    `).catch(err => console.error('Failed to initialize SQLite tables:', err))
  })

  const guestUsageDb = createGuestUsageDb(db)
  const guestIpUsageDb = createGuestIpUsageDb(db)
  const licenseDb = createLicenseDb(db)
  const freeLimit = Number(config.freeLimit ?? 20)

  function getPeriodKey(now = new Date()) {
    return now.toISOString().slice(0, 10)
  }

  async function getIpUsageStatus(clientIp, now = new Date()) {
    if (!clientIp) {
      return null
    }

    const periodKey = getPeriodKey(now)
    const row = await guestIpUsageDb.getGuestIpUsage(clientIp, periodKey)
    const generateUsed = Number(row?.generate_used ?? 0)
    const generateRemaining = Math.max(0, freeLimit - generateUsed)

    return {
      ipKey: clientIp,
      periodKey,
      generateUsed,
      generateRemaining,
    }
  }

  function mergeGuestAccess(deviceAccess, ipUsageStatus) {
    if (!ipUsageStatus) {
      return deviceAccess
    }

    const generateRemaining = Math.min(
      Number(deviceAccess?.generateRemaining ?? freeLimit),
      Number(ipUsageStatus.generateRemaining ?? freeLimit),
    )
    const generateUsed = Math.min(freeLimit, freeLimit - generateRemaining)

    return {
      ...deviceAccess,
      generateUsed,
      generateFreeLimit: freeLimit,
      generateRemaining,
      mode: generateRemaining > 0 ? 'guest' : 'guest_limited',
    }
  }

  async function incrementGuestIpUsage(clientIp, now = new Date(), amount = 1) {
    if (!clientIp) {
      return null
    }

    const current = (await getIpUsageStatus(clientIp, now)) ?? {
      ipKey: clientIp,
      periodKey: getPeriodKey(now),
      generateUsed: 0,
    }

    return guestIpUsageDb.saveGuestIpUsage({
      ip_key: current.ipKey,
      period_key: current.periodKey,
      generate_used: Number(current.generateUsed ?? 0) + Number(amount ?? 1),
    })
  }

  async function getRedeemCode(code) {
    const res = await db.query('SELECT * FROM redeem_codes WHERE code = ?', [code])
    const row = res.rows[0]
    if (!row) return null
    return {
      id: row.id,
      code: row.code,
      duration_days: Number(row.duration_days),
      max_devices: Number(row.max_devices),
      note: row.note,
      status: row.status,
      created_at: row.created_at,
      activated_at: row.activated_at,
      expires_at: row.expires_at,
    }
  }

  async function saveRedeemCode(record) {
    const nowStr = new Date().toISOString()
    await db.query(`
      INSERT INTO redeem_codes (code, duration_days, max_devices, note, status, created_at, activated_at, expires_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(code) DO UPDATE SET
        status = excluded.status,
        activated_at = excluded.activated_at,
        expires_at = excluded.expires_at,
        updated_at = ?
    `, [
      record.code,
      record.duration_days,
      record.max_devices,
      record.note,
      record.status,
      record.created_at || nowStr,
      record.activated_at || null,
      record.expires_at || null,
      nowStr,
      nowStr
    ])
  }

  async function getLicensedAccess(deviceId) {
    const license = await licenseDb.getLicense(deviceId)
    if (!license || license.status !== 'active') {
      return null
    }

    return {
      device_id: deviceId,
      licensed: true,
      expiresAt: license.expires_at ?? null,
      generateUsed: null,
      generateFreeLimit: null,
      generateRemaining: null,
      mode: 'licensed',
    }
  }

  return {
    publicAccess: {
      async getAccessStatus({ deviceId, clientIp }) {
        const licensedAccess = await getLicensedAccess(deviceId)
        if (licensedAccess) {
          return licensedAccess
        }

        const guestAccess = await getGuestAccessStatus({
          db: guestUsageDb,
          deviceId,
          freeLimit,
        })
        const ipUsageStatus = await getIpUsageStatus(clientIp)
        return mergeGuestAccess(guestAccess, ipUsageStatus)
      },
      async checkGenerate({ deviceId, clientIp }) {
        const licensedAccess = await getLicensedAccess(deviceId)
        if (licensedAccess) {
          return {
            ok: true,
            allowed: true,
            reason: 'licensed',
            access: licensedAccess,
          }
        }

        const deviceAccess = await getGuestAccessStatus({
          db: guestUsageDb,
          deviceId,
          freeLimit,
        })
        const access = mergeGuestAccess(deviceAccess, await getIpUsageStatus(clientIp))

        return {
          ok: true,
          allowed: access.generateRemaining > 0,
          reason: access.generateRemaining > 0 ? 'guest-within-limit' : 'guest-limit-reached',
          access,
        }
      },
      async commitGenerate({ deviceId, clientIp }) {
        const licensedAccess = await getLicensedAccess(deviceId)
        if (licensedAccess) {
          await incrementGuestUsage(guestUsageDb, deviceId, 1)
          return {
            ok: true,
            committed: true,
            access: licensedAccess,
          }
        }

        const deviceAccess = await getGuestAccessStatus({
          db: guestUsageDb,
          deviceId,
          freeLimit,
        })
        const access = mergeGuestAccess(deviceAccess, await getIpUsageStatus(clientIp))

        if (access.generateRemaining <= 0) {
          return {
            ok: false,
            error: {
              code: 'GENERATE_LIMIT_REACHED',
              message: 'guest generate quota exhausted',
            },
            access,
          }
        }

        await incrementGuestUsage(guestUsageDb, deviceId, 1)
        await incrementGuestIpUsage(clientIp)
        const nextDeviceAccess = await getGuestAccessStatus({
          db: guestUsageDb,
          deviceId,
          freeLimit,
        })
        const nextAccess = mergeGuestAccess(nextDeviceAccess, await getIpUsageStatus(clientIp))

        return {
          ok: true,
          committed: true,
          access: nextAccess,
        }
      },
      async redeemCode({ deviceId, code }) {
        const record = await getRedeemCode(code)
        if (!record || record.status === 'disabled') {
          return {
            ok: false,
            error: {
              code: 'REDEEM_CODE_INVALID',
              message: 'redeem code not found',
            },
          }
        }

        const now = new Date()
        const updated = record.status === 'unused'
          ? activateCodeRecord(record, now)
          : { ...record }

        updated.last_device_id = deviceId ?? null
        await saveRedeemCode(updated)

        await licenseDb.saveLicense({
          device_id: deviceId ?? null,
          code,
          status: 'active',
          expires_at: updated.expires_at ?? null,
          redeemed_at: now.toISOString(),
        })

        return {
          ok: true,
          licensed: true,
          code,
          deviceId: deviceId ?? null,
          expiresAt: updated.expires_at ?? null,
          redeemCode: updated,
        }
      },
    },
    adminRedeemCodes: {
      async createRedeemCodes({ body }) {
        const durationDays = Number(body?.durationDays ?? 0)
        const quantity = Number(body?.quantity ?? 1)
        const maxDevices = Number(body?.maxDevices ?? 2)
        const note = body?.note ?? ''
        const created = []

        for (let index = 0; index < quantity; index += 1) {
          const code = createCodeValue(durationDays)
          const record = {
            code,
            duration_days: durationDays,
            max_devices: maxDevices,
            note,
            status: 'unused',
            created_at: new Date().toISOString(),
          }
          await saveRedeemCode(record)
          created.push(record)
        }

        return {
          ok: true,
          items: created,
          codes: created,
        }
      },
      async listRedeemCodes() {
        const res = await db.query('SELECT * FROM redeem_codes ORDER BY id DESC')
        const codes = []
        for (const row of res.rows) {
          const deviceRes = await db.query('SELECT device_id, first_seen_at, last_seen_at FROM redeem_code_devices WHERE redeem_code_id = ?', [row.id])
          codes.push({
            id: row.id,
            code: row.code,
            duration_days: Number(row.duration_days),
            max_devices: Number(row.max_devices),
            note: row.note,
            status: row.status,
            created_at: row.created_at,
            activated_at: row.activated_at,
            expires_at: row.expires_at,
            devices: deviceRes.rows.map(d => ({
              deviceId: d.device_id,
              firstSeenAt: d.first_seen_at,
              lastSeenAt: d.last_seen_at
            }))
          })
        }
        return {
          ok: true,
          codes,
        }
      },
      async disableRedeemCode({ code }) {
        const record = await getRedeemCode(code)
        if (!record) {
          return {
            ok: false,
            error: {
              code: 'REDEEM_CODE_INVALID',
              message: 'redeem code not found',
            },
          }
        }

        const updated = {
          ...record,
          status: 'disabled',
          disabled_at: new Date().toISOString(),
        }
        await saveRedeemCode(updated)

        return {
          ok: true,
          code: updated,
        }
      },
      async listUsages({ query }) {
        const page = Math.max(1, Number.parseInt(query?.get('page') ?? '1', 10) || 1)
        const requestedPageSize = Number.parseInt(query?.get('pageSize') ?? '20', 10) || 20
        const pageSize = Math.min(100, Math.max(1, requestedPageSize))
        const totalRes = await db.query('SELECT COUNT(*) AS total FROM guest_usage')
        const total = Number(totalRes.rows[0]?.total ?? 0)
        const summaryRes = await db.query('SELECT COALESCE(SUM(generate_used), 0) AS totalGenerates FROM guest_usage')
        const totalGenerates = Number(summaryRes.rows[0]?.totalGenerates ?? 0)
        const totalPages = Math.max(1, Math.ceil(total / pageSize))
        const safePage = Math.min(page, totalPages)
        const safeOffset = (safePage - 1) * pageSize
        const res = await db.query(
          'SELECT * FROM guest_usage ORDER BY updated_at DESC LIMIT ? OFFSET ?',
          [pageSize, safeOffset],
        )
        return {
          ok: true,
          usages: res.rows.map(row => ({
            id: row.id,
            deviceId: row.device_id,
            generateUsed: Number(row.generate_used),
            createdAt: row.created_at,
            updatedAt: row.updated_at
          })),
          summary: {
            totalDevices: total,
            totalGenerates,
          },
          pagination: {
            page: safePage,
            pageSize,
            total,
            totalPages,
          },
        }
      },
      async unbindDevice({ code, deviceId }) {
        const codeRes = await db.query('SELECT id FROM redeem_codes WHERE code = ?', [code])
        const codeRow = codeRes.rows[0]
        if (!codeRow) {
          return {
            ok: false,
            error: {
              code: 'REDEEM_CODE_INVALID',
              message: 'redeem code not found',
            },
          }
        }
        const redeemCodeId = codeRow.id
        await db.query('DELETE FROM redeem_code_devices WHERE redeem_code_id = ? AND device_id = ?', [redeemCodeId, deviceId])
        return {
          ok: true,
        }
      },
      async resetGuestUsage({ deviceId }) {
        await db.query('UPDATE guest_usage SET generate_used = 0, updated_at = CURRENT_TIMESTAMP WHERE device_id = ?', [deviceId])
        return {
          ok: true,
        }
      },
    },
  }
}

function mergeDeps(baseDeps, overrides = {}) {
  return {
    ...baseDeps,
    ...overrides,
    publicAccess: {
      ...baseDeps.publicAccess,
      ...(overrides.publicAccess ?? {}),
    },
    adminRedeemCodes: {
      ...baseDeps.adminRedeemCodes,
      ...(overrides.adminRedeemCodes ?? {}),
    },
  }
}

function writeJson(response, status, payload, extraHeaders = {}) {
  const body = JSON.stringify(payload)

  response.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    ...extraHeaders,
  })
  response.end(body)
}

export function createServer(config = getConfig(), deps = {}) {
  const routeRequest = createRouteHandler({
    config,
    deps: mergeDeps(createDefaultDeps(config), deps),
  })

  return http.createServer(async (request, response) => {
    try {
      const result = await routeRequest(request)
      writeJson(response, result.status ?? 200, result.body ?? { ok: true }, result.headers ?? {})
    } catch (error) {
      writeJson(response, 500, {
        ok: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'unexpected error',
        },
      })
    }
  })
}

export function startServer(config = getConfig()) {
  const server = createServer(config)
  return new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(config.port, () => resolve(server))
  })
}

const entryPath = process.argv[1] ? path.resolve(process.argv[1]) : ''
const entryUrl = entryPath ? pathToFileURL(entryPath).href : ''

const isDirectOrPm2 =
  import.meta.url === entryUrl ||
  Boolean(process.env.pm_id !== undefined || process.env.PM2_HOME || process.argv[1]?.includes('proxy.js'))

if (isDirectOrPm2) {
  startServer().then((server) => {
    const addr = server.address()
    const port = typeof addr === 'object' && addr ? addr.port : getConfig().port
    console.log(`🚀 license-server running on port ${port}`)
  }).catch((error) => {
    console.error('Failed to start license-server:', error)
    process.exitCode = 1
  })
}

