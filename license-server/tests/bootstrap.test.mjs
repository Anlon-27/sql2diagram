import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const serverDir = path.resolve(__dirname, '..')

async function importModule(relativePath) {
  const filePath = path.join(serverDir, relativePath)
  assert.ok(existsSync(filePath), `${relativePath} should exist`)
  return import(pathToFileURL(filePath).href)
}

test('package.json declares an ESM workspace with required scripts', () => {
  const packagePath = path.join(serverDir, 'package.json')
  assert.ok(existsSync(packagePath), 'package.json should exist')

  const pkg = JSON.parse(readFileSync(packagePath, 'utf8'))

  assert.equal(pkg.type, 'module')
  assert.equal(typeof pkg.scripts?.dev, 'string')
  assert.equal(typeof pkg.scripts?.test, 'string')
  assert.equal(typeof pkg.scripts?.migrate, 'string')
})

test('getConfig reads environment overrides', async () => {
  const { getConfig } = await importModule('config.js')

  const saved = {
    PORT: process.env.PORT,
    DATABASE_URL: process.env.DATABASE_URL,
    ADMIN_TOKEN: process.env.ADMIN_TOKEN,
    XIANYU_URL: process.env.XIANYU_URL,
    FREE_LIMIT: process.env.FREE_LIMIT,
  }

  try {
    process.env.PORT = '4310'
    process.env.DATABASE_URL = 'postgres://demo/license'
    process.env.ADMIN_TOKEN = 'secret-token'
    process.env.XIANYU_URL = 'https://example.test/xianyu'
    process.env.FREE_LIMIT = '3'

    const config = getConfig()

    assert.deepEqual(config, {
      port: 4310,
      databaseUrl: 'postgres://demo/license',
      adminToken: 'secret-token',
      xianyuUrl: 'https://example.test/xianyu',
      freeLimit: 3,
    })
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) {
        delete process.env[key]
      } else {
        process.env[key] = value
      }
    }
  }
})

test('createDb exposes the minimum database interface', async () => {
  const { createDb } = await importModule('db.js')

  const db = createDb({ databaseUrl: 'postgres://placeholder/license' })

  assert.equal(typeof db.connect, 'function')
  assert.equal(typeof db.disconnect, 'function')
  assert.equal(typeof db.query, 'function')
  assert.equal(typeof db.getStatus, 'function')
  assert.equal(db.getStatus(), 'idle')
})

test('proxy serves the bootstrap JSON payload', async () => {
  const [{ createServer }, { getConfig }] = await Promise.all([
    importModule('proxy.js'),
    importModule('config.js'),
  ])

  process.env.PORT = '0'
  const config = getConfig()
  const server = createServer(config)

  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })

  const address = server.address()
  assert.ok(address && typeof address === 'object')

  try {
    const response = await fetch(`http://127.0.0.1:${address.port}/`)
    assert.equal(response.status, 200)
    assert.equal(response.headers.get('content-type'), 'application/json; charset=utf-8')

    const body = await response.json()
    assert.deepEqual(body, {
      ok: true,
      service: 'license-server',
      port: config.port,
    })
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
})

test('proxy entrypoint detection resolves relative argv paths to the server file url', () => {
  const relativeArgvPath = 'proxy.js'
  const resolvedHref = pathToFileURL(path.resolve(serverDir, relativeArgvPath)).href

  assert.equal(
    resolvedHref,
    pathToFileURL(path.join(serverDir, 'proxy.js')).href,
  )
})
