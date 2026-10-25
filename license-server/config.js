import fs from 'node:fs'
import path from 'node:path'

function loadEnvFile() {
  const customPath = process.env.ER_SYSTEM_ENV_PATH
  const defaultPath = path.resolve(process.cwd(), '.env')
  const targetPath = customPath && fs.existsSync(customPath) ? customPath : (fs.existsSync(defaultPath) ? defaultPath : null)

  if (targetPath) {
    try {
      const content = fs.readFileSync(targetPath, 'utf8')
      for (const line of content.split(/\r?\n/)) {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) continue
        const eqIdx = trimmed.indexOf('=')
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim()
          let val = trimmed.slice(eqIdx + 1).trim()
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1)
          }
          if (process.env[key] === undefined) {
            process.env[key] = val
          }
        }
      }
    } catch {
      // Ignore env read failure
    }
  }
}

loadEnvFile()

export function getConfig(env = process.env) {
  return {
    port: Number.parseInt(env.PORT ?? '3001', 10),
    databaseUrl: env.DATABASE_URL ?? '',
    adminToken: env.ADMIN_TOKEN ?? '',
    xianyuUrl: env.XIANYU_URL ?? '',
    freeLimit: Number.parseInt(env.FREE_LIMIT ?? '20', 10),
  }
}

