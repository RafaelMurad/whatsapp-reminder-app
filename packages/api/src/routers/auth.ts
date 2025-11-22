import { z } from 'zod'
import { router, publicProcedure, protectedProcedure } from '../trpc'
import { db, users } from '@repo/db'
import { eq } from 'drizzle-orm'
import { hashPassword, verifyPassword, signJwt } from '../lib/auth'

export const authRouter = router({
  // POST /api/auth/register
  register: publicProcedure
    .input(z.object({
      email: z.string().trim().toLowerCase().email(),
      password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .max(72, 'Password too long')
        .refine(pwd => /[A-Z]/.test(pwd), 'Password must contain at least one uppercase letter')
        .refine(pwd => /[0-9]/.test(pwd), 'Password must contain at least one number'),
      phoneNumber: z.string().trim().regex(/^\+[1-9]\d{1,14}$/, 'Must be valid E.164 format (e.g., +1234567890)'),
    }))
    .mutation(async ({ input }) => {
      // Check if user exists
      const existing = await db.select().from(users).where(eq(users.email, input.email)).limit(1)
      if (existing.length > 0) {
        throw new Error('Email already registered')
      }

      // Hash password and create user
      const hashedPassword = await hashPassword(input.password)
      const [user] = await db.insert(users).values({
        email: input.email,
        password: hashedPassword,
        phoneNumber: input.phoneNumber,
      }).returning({
        id: users.id,
        email: users.email,
        phoneNumber: users.phoneNumber,
        createdAt: users.createdAt,
      })

      if (!user) {
        throw new Error('Failed to create user')
      }

      // Return JWT token
      const token = signJwt({ userId: user.id, email: user.email })
      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          phoneNumber: user.phoneNumber
        }
      }
    }),

  // POST /api/auth/login
  login: publicProcedure
    .input(z.object({
      email: z.string().trim().toLowerCase().email(),
      password: z.string(),
    }))
    .mutation(async ({ input }) => {
      // Find user
      const [user] = await db.select().from(users).where(eq(users.email, input.email)).limit(1)
      if (!user) {
        throw new Error('Invalid credentials')
      }

      // Verify password
      const valid = await verifyPassword(input.password, user.password)
      if (!valid) {
        throw new Error('Invalid credentials')
      }

      // Return JWT token
      const token = signJwt({ userId: user.id, email: user.email })
      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          phoneNumber: user.phoneNumber
        }
      }
    }),

  // GET /api/auth/me
  me: protectedProcedure
    .query(async ({ ctx }) => {
      // ctx.user is guaranteed to exist (protected procedure)
      const [user] = await db.select({
        id: users.id,
        email: users.email,
        phoneNumber: users.phoneNumber,
        createdAt: users.createdAt,
      }).from(users).where(eq(users.id, ctx.user.userId)).limit(1)

      if (!user) {
        throw new Error('User not found')
      }

      return user
    }),
})
