import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter, createContext } from '@repo/api'
import type { APIEvent } from '@solidjs/start/server'
import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Load environment variables from .env file
const __dirname = path.dirname(fileURLToPath(import.meta.url))
const projectRoot = path.resolve(__dirname, '../../../..')
config({ path: path.join(projectRoot, '.env') })

// SolidStart API route handler for tRPC
// Handles all tRPC requests at /api/trpc/*
export async function GET(event: APIEvent) {
  return handleRequest(event)
}

export async function POST(event: APIEvent) {
  return handleRequest(event)
}

async function handleRequest(event: APIEvent) {
  const response = await fetchRequestHandler({
    endpoint: '/api/trpc',
    req: event.request,
    router: appRouter,
    createContext: () => createContext({ headers: event.request.headers }),
    onError({ error, path }) {
      console.error(`❌ tRPC Error on ${path}:`)
      console.error('Error message:', error.message)
      console.error('Error code:', error.code)
      if (error.cause) {
        console.error('Caused by:', error.cause)
      }
      console.error('Full error:', error)
    },
  })

  return response
}
