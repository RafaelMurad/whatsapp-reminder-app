import { fetchRequestHandler } from '@trpc/server/adapters/fetch'
import { appRouter, createContext } from '@repo/api'
import type { APIEvent } from '@solidjs/start/server'

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
      console.error(`❌ tRPC Error on ${path}:`, error)
    },
  })

  return response
}
