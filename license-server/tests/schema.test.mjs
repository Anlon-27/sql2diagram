import test from 'node:test'
import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const serverDir = path.resolve(__dirname, '..')

function readServerFile(relativePath) {
  const filePath = path.join(serverDir, relativePath)
  assert.ok(existsSync(filePath), `${relativePath} should exist`)
  return readFileSync(filePath, 'utf8')
}

async function importModule(relativePath) {
  const filePath = path.join(serverDir, relativePath)
  assert.ok(existsSync(filePath), `${relativePath} should exist`)
  return import(pathToFileURL(filePath).href)
}

test('package.json migrate script runs the migration runner', () => {
  const pkg = JSON.parse(readServerFile('package.json'))
  assert.equal(pkg.scripts?.migrate, 'node scripts/run-migrations.mjs')
})

test('paid license schema defines required tables and key columns', () => {
  const sql = readServerFile('sql/001_paid_license_schema.sql')

  assert.match(sql, /create\s+table\s+if\s+not\s+exists\s+guest_usage\b/i)
  assert.match(sql, /\bguest_usage\b[\s\S]*\bdevice_id\s+TEXT\s+not\s+null\s+unique\b/i)
  assert.match(sql, /\bguest_usage\b[\s\S]*\bgenerate_used\s+int(?:eger)?\s+not\s+null\s+default\s+0\b/i)
  assert.doesNotMatch(sql, /\bguest_usage\b[\s\S]*\bfingerprint\b/i)
  assert.doesNotMatch(sql, /\bguest_usage\b[\s\S]*\bused_count\b/i)

  assert.match(sql, /create\s+table\s+if\s+not\s+exists\s+redeem_codes\b/i)
  assert.match(sql, /\bredeem_codes\b[\s\S]*\bcode\s+TEXT\s+not\s+null\s+unique\b/i)
  assert.match(sql, /\bredeem_codes\b[\s\S]*\bduration_days\s+int(?:eger)?\s+not\s+null\b/i)
  assert.match(sql, /\bredeem_codes\b[\s\S]*\bstatus\s+TEXT\s+not\s+null\b/i)
  assert.match(sql, /\bredeem_codes\b[\s\S]*\bactivated_at\s+TEXT\b/i)
  assert.match(sql, /\bredeem_codes\b[\s\S]*\bexpires_at\s+TEXT\b/i)
  assert.match(sql, /\bredeem_codes\b[\s\S]*\bmax_devices\s+int(?:eger)?\s+not\s+null\s+default\s+2\b/i)
  assert.match(sql, /\bredeem_codes\b[\s\S]*\bnote\s+TEXT\b/i)
  assert.doesNotMatch(sql, /\bredeem_codes\b[\s\S]*\bplan_name\b/i)
  assert.doesNotMatch(sql, /\bredeem_codes\b[\s\S]*\bredeemed_at\b/i)

  assert.match(sql, /create\s+table\s+if\s+not\s+exists\s+redeem_code_devices\b/i)
  assert.match(sql, /\bredeem_code_devices\b[\s\S]*\bredeem_code_id\b/i)
  assert.match(sql, /\bredeem_code_devices\b[\s\S]*\bdevice_id\s+TEXT\s+not\s+null\b/i)
  assert.match(sql, /\bredeem_code_devices\b[\s\S]*\bfirst_seen_at\s+TEXT\b/i)
  assert.match(sql, /\bredeem_code_devices\b[\s\S]*\blast_seen_at\s+TEXT\b/i)
  assert.match(sql, /\bredeem_code_devices\b[\s\S]*\bcreated_at\s+TEXT\b/i)
  assert.match(sql, /\bredeem_code_devices\b[\s\S]*\bupdated_at\s+TEXT\b/i)
  assert.match(sql, /\bunique\s*\(\s*redeem_code_id\s*,\s*device_id\s*\)/i)
  assert.doesNotMatch(sql, /\bredeem_code_devices\b[\s\S]*\bdevice_fingerprint\b/i)
  assert.doesNotMatch(sql, /\bredeem_code_devices\b[\s\S]*\bbound_at\b/i)
})

test('runMigrations loads the SQL file and executes it with db.exec when available', async () => {
  const { runMigrations } = await importModule('scripts/run-migrations.mjs')

  const calls = []
  const db = {
    async connect() {
      calls.push(['connect'])
    },
    async exec(sql) {
      calls.push(['exec', sql])
      return { ok: true }
    },
    async disconnect() {
      calls.push(['disconnect'])
    },
  }

  const result = await runMigrations({ db })

  assert.equal(result.executor, 'exec')
  assert.equal(calls[0][0], 'connect')
  assert.equal(calls[1][0], 'exec')
  assert.match(calls[1][1], /create\s+table\s+if\s+not\s+exists\s+guest_usage\b/i)
  assert.equal(calls[2][0], 'disconnect')
})

test('runMigrations falls back to db.query when exec is unavailable', async () => {
  const { runMigrations } = await importModule('scripts/run-migrations.mjs')

  const calls = []
  const db = {
    async query(sql) {
      calls.push(['query', sql])
      return { rowCount: 0 }
    },
  }

  const result = await runMigrations({ db })

  assert.equal(result.executor, 'query')
  assert.equal(calls.length, 1)
  assert.equal(calls[0][0], 'query')
  assert.match(calls[0][1], /create\s+table\s+if\s+not\s+exists\s+redeem_codes\b/i)
})
