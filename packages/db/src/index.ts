// Drizzle ORM Database Client with libSQL
import { drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client'
import * as schema from './schema'

// Create or connect to SQLite database using libSQL (pure JavaScript, no native binaries)
const client = createClient({
  url: 'file:./packages/db/data/dev.db',
})

// Create Drizzle instance
export const db = drizzle(client, { schema })

// Re-export schema and types
export * from './schema'
