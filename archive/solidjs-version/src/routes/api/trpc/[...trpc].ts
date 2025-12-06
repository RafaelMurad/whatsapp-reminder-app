// This file handles ALL requests to /api/trpc/* 
// (the [...trpc] syntax means "catch everything after /api/trpc/")

import { fetchRequestHandler } from '@trpc/server/adapters/fetch';
import type { APIEvent } from '@solidjs/start/server';
import { appRouter, createContext } from '@repo/api';

// ANALOGY: This is the "kitchen door" where HTTP requests arrive
// fetchRequestHandler is like a translator that:
// 1. Receives raw HTTP (Request object)
// 2. Extracts the procedure name (e.g., "auth.login")
// 3. Calls your router
// 4. Converts the result back to HTTP (Response object)

function handler(event: APIEvent) {
  return fetchRequestHandler({
    // The base path (tells tRPC that /api/trpc is the root)
    // So /api/trpc/auth.login → calls router.auth.login
    endpoint: '/api/trpc',
    
    // The HTTP request object (contains headers, body, method)
    req: event.request,
    
    // Which router handles the request? (your appRouter with auth + reminder)
    router: appRouter,
    
    // Create context for this request (extracts JWT, provides prisma)
    // REMEMBER: context.ts checks for Authorization header and decodes user
    createContext: async () => {
      // Extract headers from the incoming request
      const headers = event.request.headers;
      
      // Call our createContext function (from packages/api/src/context.ts)
      // This will:
      // 1. Look for "Authorization: Bearer <token>" header
      // 2. Verify JWT and extract user ID (or null if no token)
      // 3. Return { prisma, user }
      return createContext({ headers });
    },
    
    // Error handling (optional, for debugging)
    onError({ error, path }: { error: any; path?: string }) {
      console.error(`tRPC Error on ${path}:`, error);
    },
  });
}

// SolidStart expects GET and POST exports for API routes
// Both use the same handler (tRPC works with both methods)
export const GET = handler;
export const POST = handler;
