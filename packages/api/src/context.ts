import type { inferAsyncReturnType } from '@trpc/server';
import { prisma } from '@repo/db';
import jwt from 'jsonwebtoken';

// Shape of the user we attach to context (minimal for now)
export interface AuthUser {
  id: string;
}

// Extract bearer token from Authorization header
function getTokenFromHeader(headers: Headers | Record<string, string | string[] | undefined>): string | null {
  // Normalized access: handle Fetch API Headers or Node-style header object
  let raw: string | undefined;
  if (headers instanceof Headers) {
    raw = headers.get('authorization') || undefined;
  } else {
    const h = headers['authorization'];
    raw = Array.isArray(h) ? h[0] : h;
  }
  if (!raw) return null;
  const parts = raw.trim().split(/\s+/);
  if (parts.length !== 2) return null;
  const [scheme, token] = parts as [string, string];
  if (!scheme || scheme.toLowerCase() !== 'bearer') return null;
  return token || null;
}

// Verify & decode JWT returning the user id or null
function decodeUser(token: string | null): AuthUser | null {
  if (!token) return null;
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // In early dev we prefer failing loudly when secret missing
    console.warn('[tRPC context] Missing JWT_SECRET environment variable');
    return null;
  }
  try {
    const payload = jwt.verify(token, secret) as { userId?: string; iat?: number; exp?: number };
    if (!payload.userId) return null;
    return { id: payload.userId };
  } catch {
    // Expired / malformed tokens just yield unauthenticated context
    return null;
  }
}

// Factory to create context for each request
export async function createContext(opts: { headers: Headers }) {
  console.log('[CONTEXT] Creating tRPC context...');
  const token = getTokenFromHeader(opts.headers);
  console.log('[CONTEXT] Token from header:', token ? 'present' : 'missing');
  
  const user = decodeUser(token);
  if (user) {
    console.log('[CONTEXT] Authenticated user:', user.id);
  } else {
    console.log('[CONTEXT] No authenticated user');
  }

  return { prisma, user };
}

export type Context = inferAsyncReturnType<typeof createContext>;
