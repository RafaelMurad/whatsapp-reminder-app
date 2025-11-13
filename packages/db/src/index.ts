import { PrismaClient } from '@prisma/client'

// Create a single instance of PrismaClient
// This prevents creating multiple connections in development (hot reload)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error', 'warn'],
})

// In development, save the instance to prevent hot-reload issues
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Export Prisma types for use in other packages
export * from '@prisma/client'
