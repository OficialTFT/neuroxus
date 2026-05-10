import { Database } from 'arangojs'

interface DatabaseConfig {
  url: string
  user: string
  password: string
  dbName: string
  timeout: number
}

let db: Database | null = null

function loadConfig(): DatabaseConfig {
  const url = process.env.ARANGO_URL
  const user = process.env.ARANGO_USER
  const password = process.env.ARANGO_PASS
  const dbName = process.env.DB_NAME ?? 'knowledgebase'
  const timeout = Number.parseInt(process.env.ARANGO_TIMEOUT ?? '30000', 10)

  if (!url || !user || !password) {
    throw new Error(
      'Missing ArangoDB configuration. Ensure ARANGO_URL, ARANGO_USER, and ARANGO_PASS are set in .env',
    )
  }

  return { url, user, password, dbName, timeout }
}

export function getDatabase(): Database {
  if (db) {
    return db
  }

  const config = loadConfig()

  const base = new Database({
    url: config.url,
    arangoVersion: 31100,
  })

  base.useBasicAuth(config.user, config.password)

  db = base.database(config.dbName)

  return db
}

export async function getConnectionStatus(): Promise<{
  connected: boolean
  db: string
  latency: string
  error?: string
}> {
  const start = performance.now()

  try {
    const database = getDatabase()
    await database.query('RETURN 1')
    const latency = `${(performance.now() - start).toFixed(0)}ms`

    return {
      connected: true,
      db: loadConfig().dbName,
      latency,
    }
  } catch (error) {
    const latency = `${(performance.now() - start).toFixed(0)}ms`
    const message = error instanceof Error ? error.message : 'Unknown error'

    return {
      connected: false,
      db: loadConfig().dbName,
      latency,
      error: message,
    }
  } finally {
    // noop
  }
}

export function disconnect(): void {
  if (db) {
    try {
      db.close()
    } catch {
      // close may not be available or needed in all versions
    }
    db = null
  }
}
