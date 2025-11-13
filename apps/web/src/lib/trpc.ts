import { createTRPCProxyClient, httpBatchLink } from '@trpc/client'
import { QueryClient } from '@tanstack/solid-query'
import type { AppRouter } from '@repo/api'

// Get the API base URL (defaults to current origin + /api/trpc)
const getBaseUrl = () => {
  if (typeof window !== 'undefined') return '' // browser uses relative URL
  return `http://localhost:${process.env.PORT ?? 3000}` // SSR uses localhost
}

// Create tRPC client with Solid Query
export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      url: `${getBaseUrl()}/api/trpc`,
      headers() {
        // Get auth token from localStorage (client-side only)
        if (typeof window === 'undefined') return {}
        const token = localStorage.getItem('auth_token')
        return token ? { Authorization: `Bearer ${token}` } : {}
      },
    }),
  ],
})

// Create Solid Query client for caching
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
      gcTime: 1000 * 60 * 10,   // Cache persists for 10 minutes
    },
  },
})

// Helper to save auth token
export function setAuthToken(token: string) {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token)
  }
}

// Helper to remove auth token
export function clearAuthToken() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token')
  }
}

// Helper to get current token
export function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token')
  }
  return null
}
