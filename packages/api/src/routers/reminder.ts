import { z } from 'zod';
import { protectedProcedure, router } from '../trpc';
import { prisma } from '@repo/db';
import { TRPCError } from '@trpc/server';

const createReminderSchema = z.object({
  title: z.string().min(1).max(120),
  message: z.string().min(1).max(500),
  scheduledFor: z.string().datetime().refine((iso) => new Date(iso).getTime() > Date.now(), {
    message: 'scheduledFor must be in the future'
  })
});

const idSchema = z.object({ id: z.string().cuid() });

export const reminderRouter = router({
  create: protectedProcedure
    .input(createReminderSchema)
    .mutation(async ({ ctx, input }) => {
      const reminder = await prisma.reminder.create({
        data: {
          userId: ctx.user!.id,
          title: input.title,
          message: input.message,
          scheduledFor: new Date(input.scheduledFor)
        },
        select: { id: true, title: true, message: true, scheduledFor: true, sent: true, createdAt: true }
      });
      return { reminder };
    }),

  getAll: protectedProcedure
    .query(async ({ ctx }) => {
      const reminders = await prisma.reminder.findMany({
        where: { userId: ctx.user!.id },
        orderBy: { scheduledFor: 'asc' },
        select: { id: true, title: true, message: true, scheduledFor: true, sent: true, createdAt: true }
      });
      return { reminders };
    }),

  delete: protectedProcedure
    .input(idSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await prisma.reminder.findFirst({
        where: { id: input.id, userId: ctx.user!.id },
        select: { id: true }
      });
      if (!existing) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Reminder not found' });
      }
      await prisma.reminder.delete({ where: { id: input.id } });
      return { success: true };
    })
});
