// Drizzle ORM Database Client with libSQL
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema'
import path from 'path'
import { fileURLToPath } from 'url'

// Find project root (works in both dev and build)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '../../..')
const dbPath = path.join(projectRoot, 'packages/db/data/dev.db')

// Create or connect to SQLite database using libSQL (pure JavaScript, no native binaries)
// Prefer DATABASE_URL env variable, fallback to computed path
const client = createClient({
  url: process.env.DATABASE_URL || `file:${dbPath}`,
})

// Create Drizzle instance
export const db = drizzle(client, { schema })

// Re-export schema and types
export * from './schema'
