import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SALT_ROUNDS = 10; // bcrypt cost factor (balance speed & security for MVP)
const JWT_EXPIRY = '7d'; // token life span

// Hash a plaintext password
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

// Compare supplied password with stored hash
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// Sign a JWT containing the userId and email
export function signJwt(payload: { userId: string; email: string }): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing JWT_SECRET environment variable');
  return jwt.sign(payload, secret, { expiresIn: JWT_EXPIRY });
}

// Verify and decode a JWT; returns userId or null
export function verifyJwt(token: string): { userId: string } | null {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('Missing JWT_SECRET environment variable');
  try {
    const payload = jwt.verify(token, secret) as { userId?: string };
    if (!payload.userId) return null;
    return { userId: payload.userId };
  } catch {
    return null; // expired / invalid token
  }
}

// Helper to safely pull bearer token from Authorization header ("Bearer <token>")
export function extractBearer(headerValue: string | undefined | null): string | null {
  if (!headerValue) return null;
  const parts = headerValue.trim().split(/\s+/);
  if (parts.length !== 2) return null;
  const [scheme, token] = parts as [string, string];
  if (scheme.toLowerCase() !== 'bearer') return null;
  return token || null;
}
