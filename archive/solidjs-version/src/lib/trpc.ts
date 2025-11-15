// This file creates the "waiter" that connects your components to the backend

import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '@repo/api';

// CONCEPT: "Proxy Client"
// A proxy is like a stand-in/representative
// This client PRETENDS to be your backend router, but actually sends HTTP requests
// When you call client.auth.login.mutate(...), it:
// 1. Knows the shape of auth.login (from AppRouter type)
// 2. Serializes your input to JSON
// 3. Sends HTTP POST to /api/trpc/auth.login
// 4. Deserializes the response
// 5. Returns typed data

// CONCEPT: "httpBatchLink"
// "Batch" means grouping multiple requests into one HTTP call
// Example: If you call client.auth.getMe() and client.reminder.getAll() at the same time,
// it sends ONE HTTP request with both, not two separate requests
// This is faster (fewer network round-trips)

export const trpc = createTRPCProxyClient<AppRouter>({
  links: [
    httpBatchLink({
      // Where is the backend? (the route we just created)
      url: '/api/trpc',
      
      // Headers to send with EVERY request
      // This function runs before each batch of requests
      headers() {
        // Get the stored JWT token (we'll create this helper next)
        const token = getToken();
        
        // If we have a token, send it in the Authorization header
        // Format: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        // The backend's createContext will extract and verify this
        if (token) {
          return {
            Authorization: `Bearer ${token}`,
          };
        }
        
        // No token? Send empty headers (for public procedures like register/login)
        return {};
      },
    }),
  ],
});

// ============================================================================
// TOKEN HELPERS (localStorage-based for MVP)
// ============================================================================

// SECURITY NOTE (read this!):
// localStorage is convenient but has risks:
// ✅ PRO: Simple, persists across page refreshes
// ❌ CON: Accessible to any JavaScript (including malicious scripts via XSS attacks)
//
// For MVP this is FINE. Post-MVP upgrade: use httpOnly cookies
// (cookies that JavaScript can't read, only the browser sends automatically)

const TOKEN_KEY = 'auth_token';

/**
 * Get the stored JWT token
 * ANALOGY: Checking your wallet for your membership card
 */
export function getToken(): string | null {
  // Check if we're in the browser (not server-side rendering)
  if (typeof window === 'undefined') return null;
  
  return localStorage.getItem(TOKEN_KEY);
}

/**
 * Save a JWT token (after successful login/register)
 * ANALOGY: Putting your membership card in your wallet
 */
export function setToken(token: string): void {
  if (typeof window === 'undefined') return;
  
  localStorage.setItem(TOKEN_KEY, token);
}

/**
 * Remove the JWT token (on logout or if it expires)
 * ANALOGY: Throwing away an expired membership card
 */
export function clearToken(): void {
  if (typeof window === 'undefined') return;
  
  localStorage.removeItem(TOKEN_KEY);
}
