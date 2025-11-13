// Drizzle ORM Schema - Database Structure
// Learn more: https://orm.drizzle.team/docs/sql-schema-declaration

import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

// User table - People who use the app
export const users = sqliteTable('users', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text('email').notNull().unique(),
  password: text('password').notNull(), // Will be hashed with bcrypt
  phoneNumber: text('phone_number').notNull(), // For WhatsApp notifications (e.g., "+1234567890")
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// Reminder table - Things users want to be reminded about
export const reminders = sqliteTable('reminders', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text('title').notNull(), // Short description (e.g., "Take medicine")
  message: text('message').notNull(), // Full reminder text
  scheduledFor: integer('scheduled_for', { mode: 'timestamp' }).notNull(), // When to send the WhatsApp message
  sent: integer('sent', { mode: 'boolean' }).notNull().default(false), // Track if already sent
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
})

// Type exports for use in application code
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Reminder = typeof reminders.$inferSelect
export type NewReminder = typeof reminders.$inferInsert
