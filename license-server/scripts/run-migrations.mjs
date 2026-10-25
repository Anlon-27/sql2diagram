import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { getConfig } from '../config.js'
import { createDb } from '../db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const defaultSqlFilePath = path.resolve(__dirname, '../sql/001_paid_license_schema.sql')

export async function runMigrations({
  db = createDb({ databaseUrl: getConfig().databaseUrl }),
  sqlFilePath = defaultSqlFilePath,
} = {}) {
  const sql = await readFile(sqlFilePath, 'utf8')
  const executorName = typeof db.exec === 'function' ? 'exec' : typeof db.query === 'function' ? 'query' : null

  if (!executorName) {
    throw new TypeError('db must expose an exec(sql) or query(sql) function')
  }

  if (typeof db.connect === 'function') {
    await db.connect()
  }

  try {
    await db[executorName](sql)
    return {
      executor: executorName,
      sqlFilePath,
      statementBytes: Buffer.byteLength(sql),
    }
  } finally {
    if (typeof db.disconnect === 'function') {
      await db.disconnect()
    }
  }
}

if (import.meta.url === new URL(process.argv[1], 'file:').href) {
  runMigrations()
    .then((result) => {
      console.log(`Applied migrations from ${result.sqlFilePath} via db.${result.executor}()`)
    })
    .catch((error) => {
      console.error(error)
      process.exitCode = 1
    })
}
