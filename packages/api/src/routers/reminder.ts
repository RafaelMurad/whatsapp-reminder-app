import { z } from 'zod'
import { router, protectedProcedure } from '../trpc'
import { db, reminders } from '@repo/db'
import { eq, and, desc } from 'drizzle-orm'

export const reminderRouter = router({
  // GET /api/reminder/list
  list: protectedProcedure
    .query(async ({ ctx }) => {
      return await db.select()
        .from(reminders)
        .where(eq(reminders.userId, ctx.user.userId))
        .orderBy(desc(reminders.scheduledFor))
    }),

  // GET /api/reminder/byId
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const [reminder] = await db.select()
        .from(reminders)
        .where(and(
          eq(reminders.id, input.id),
          eq(reminders.userId, ctx.user.userId)
        ))
        .limit(1)

      if (!reminder) {
        throw new Error('Reminder not found')
      }

      return reminder
    }),

  // POST /api/reminder/create
  create: protectedProcedure
    .input(z.object({
      title: z.string().trim().min(1, 'Title is required').max(100, 'Title must be less than 100 characters'),
      message: z.string().trim().min(1, 'Message is required').max(500, 'Message must be less than 500 characters'),
      scheduledFor: z.string().datetime(), // ISO 8601 string
    }))
    .mutation(async ({ input, ctx }) => {
      const [reminder] = await db.insert(reminders).values({
        title: input.title,
        message: input.message,
        scheduledFor: new Date(input.scheduledFor),
        userId: ctx.user.userId,
        sent: false,
      }).returning()

      return reminder
    }),

  // PATCH /api/reminder/update
  update: protectedProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().trim().min(1).max(100).optional(),
      message: z.string().trim().min(1).max(500).optional(),
      scheduledFor: z.string().datetime().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const [existing] = await db.select()
        .from(reminders)
        .where(and(
          eq(reminders.id, input.id),
          eq(reminders.userId, ctx.user.userId)
        ))
        .limit(1)

      if (!existing) {
        throw new Error('Reminder not found')
      }

      // Update
      const [updated] = await db.update(reminders)
        .set({
          title: input.title,
          message: input.message,
          scheduledFor: input.scheduledFor ? new Date(input.scheduledFor) : undefined,
        })
        .where(eq(reminders.id, input.id))
        .returning()

      return updated
    }),

  // DELETE /api/reminder/delete
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Verify ownership
      const [reminder] = await db.select()
        .from(reminders)
        .where(and(
          eq(reminders.id, input.id),
          eq(reminders.userId, ctx.user.userId)
        ))
        .limit(1)

      if (!reminder) {
        throw new Error('Reminder not found')
      }

      // Delete
      await db.delete(reminders).where(eq(reminders.id, input.id))

      return { success: true }
    }),
})
