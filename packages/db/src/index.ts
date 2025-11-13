// Drizzle ORM Database Client with libSQL
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

// Find project root (works in both dev and build)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '../../..')

// Load environment variables from project root
config({ path: path.join(projectRoot, '.env') })

const dbPath = path.join(projectRoot, 'packages/db/data/dev.db')

// Create or connect to SQLite database using libSQL
// Supports both local development (file:) and production (libsql: with Turso)
const url = process.env.DATABASE_URL || `file:${dbPath}`
const authToken = process.env.TURSO_AUTH_TOKEN

const client = createClient({
  url,
  authToken: authToken || undefined, // Only needed for Turso (libsql://)
})

// Create Drizzle instance
export const db = drizzle(client, { schema })

// Re-export schema and types
export * from './schema'
