import { z } from 'zod';
import { router, publicProcedure, protectedProcedure } from '../trpc';
import { prisma } from '@repo/db';
import { hashPassword, verifyPassword, signJwt } from '../lib/auth';
import { TRPCError } from '@trpc/server';

// Reusable Zod schemas
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72), // bcrypt max 72 bytes
  phoneNumber: z.string().min(6).max(20) // naive validation for MVP
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72)
});

export const authRouter = router({
  register: publicProcedure
    .input(registerSchema)
    .mutation(async ({ input }: { input: z.infer<typeof registerSchema> }) => {
      console.log('[AUTH] Register attempt:', { email: input.email, phoneNumber: input.phoneNumber });
      const existing = await prisma.user.findUnique({ where: { email: input.email } });
      if (existing) {
        console.log('[AUTH] Registration failed: Email already exists');
        throw new TRPCError({ code: 'CONFLICT', message: 'Email already in use' });
      }
      console.log('[AUTH] Hashing password...');
      const passwordHash = await hashPassword(input.password);
      console.log('[AUTH] Creating user in database...');
      const user = await prisma.user.create({
        data: {
          email: input.email,
          password: passwordHash,
          phoneNumber: input.phoneNumber,
        },
        select: { id: true, email: true, phoneNumber: true, createdAt: true }
      });
      console.log('[AUTH] User created:', user.id);
      const token = signJwt(user.id);
      console.log('[AUTH] JWT signed, registration complete');
      return { 
        user: {
          ...user,
          createdAt: user.createdAt.toISOString()
        }, 
        token 
      };
    }),

  login: publicProcedure
    .input(loginSchema)
    .mutation(async ({ input }: { input: z.infer<typeof loginSchema> }) => {
      const user = await prisma.user.findUnique({ where: { email: input.email } });
      if (!user) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
      }
      const valid = await verifyPassword(input.password, user.password);
      if (!valid) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid credentials' });
      }
      const token = signJwt(user.id);
      return { 
        user: { 
          id: user.id, 
          email: user.email, 
          phoneNumber: user.phoneNumber, 
          createdAt: user.createdAt.toISOString() 
        }, 
        token 
      };
    }),

  getMe: protectedProcedure
    .query(async ({ ctx }: { ctx: any }) => {
      const userId = ctx.user!.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, phoneNumber: true, createdAt: true }
      });
      if (!user) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'User not found' });
      }
      return { user };
    })
});
