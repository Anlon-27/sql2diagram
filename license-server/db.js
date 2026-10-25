import path from 'node:path'
import { fileURLToPath } from 'node:url'

export function createDb({ databaseUrl } = {}) {
  let dbInstance = null
  let connected = false

  const dbPath = databaseUrl || path.resolve(
    path.dirname(fileURLToPath(import.meta.url)),
    'license.db'
  )

  // 动态获取驱动实例以实现环境后备
  async function getDbInstance() {
    if (dbInstance) return dbInstance

    // 1. 优先尝试 Node.js 原生内置的 node:sqlite
    try {
      const { DatabaseSync } = await import('node:sqlite')
      dbInstance = new DatabaseSync(dbPath)
      return dbInstance
    } catch (sqliteError) {
      // 2. 环境不支持则后备加载 better-sqlite3
      try {
        const { default: Database } = await import('better-sqlite3')
        dbInstance = new Database(dbPath)
        return dbInstance
      } catch (err) {
        throw new Error(
          'Failed to load SQLite driver. Neither "node:sqlite" nor "better-sqlite3" is available. ' +
          'node:sqlite error: ' + (sqliteError?.message ?? String(sqliteError)) +
          '; better-sqlite3 error: ' + err.message
        )
      }
    }
  }

  return {
    async connect() {
      await getDbInstance()
      connected = true
      return { ok: true, databaseUrl: dbPath }
    },
    async disconnect() {
      connected = false
      return { ok: true }
    },
    async query(sql, params = []) {
      const db = await getDbInstance()
      try {
        const stmt = db.prepare(sql)
        const normalized = sql.trim().toLowerCase()
        const isSelectLike = normalized.startsWith('select') || normalized.startsWith('pragma') || normalized.startsWith('with')
        if (isSelectLike) {
          const rows = stmt.all(...params)
          return { rows, rowCount: rows.length }
        }
        const result = stmt.run(...params)
        return { rows: [], rowCount: Number(result?.changes ?? 0) }
      } catch (error) {
        console.error('SQL query failed:', sql, error)
        throw error
      }
    },
    async exec(sql) {
      const db = await getDbInstance()
      try {
        db.exec(sql)
        return { ok: true }
      } catch (error) {
        console.error('SQL exec failed:', sql, error)
        throw error
      }
    },
    getStatus() {
      return connected ? 'connected' : 'idle'
    },
    async getRawDb() {
      return getDbInstance()
    }
  }
}
