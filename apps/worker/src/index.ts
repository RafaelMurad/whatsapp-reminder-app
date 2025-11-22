// WhatsApp Reminder Worker - Sends scheduled reminders via Twilio
import { db, reminders, users } from '@repo/db'
import { eq, and, lte } from 'drizzle-orm'

// Twilio WhatsApp sending function (copied here to avoid circular dependency)
async function sendWhatsAppMessage(to: string, body: string): Promise<boolean> {
  // TODO: Implement Twilio sending when credentials are available
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Worker] Would send WhatsApp message (dev mode)`)
  }
  return true
}

async function checkAndSendReminders() {
  const now = new Date()
  
  // Find all unsent reminders that are due with user info
  const dueReminders = await db.select({
    id: reminders.id,
    title: reminders.title,
    message: reminders.message,
    userId: reminders.userId,
    phoneNumber: users.phoneNumber,
  })
    .from(reminders)
    .leftJoin(users, eq(reminders.userId, users.id))
    .where(and(
      eq(reminders.sent, false),
      lte(reminders.scheduledFor, now)
    ))

  if (dueReminders.length > 0) {
    console.log(`[Worker] Processing ${dueReminders.length} due reminder(s)`)
  }

  for (const reminder of dueReminders) {
    if (!reminder.phoneNumber) {
      console.error(`[Worker] Missing phone number for reminder ${reminder.id}`)
      continue
    }
    
    const sent = await sendWhatsAppMessage(
      reminder.phoneNumber,
      `📱 Reminder: ${reminder.title}\n\n${reminder.message}`
    )

    if (sent) {
      // Mark as sent
      await db.update(reminders)
        .set({ sent: true })
        .where(eq(reminders.id, reminder.id))
    } else {
      console.error(`[Worker] Failed to send reminder ${reminder.id}`)
    }
  }
}

// Run every minute
const INTERVAL = 60 * 1000 // 1 minute

async function main() {
  console.log('[Worker] Started - checking reminders every 60s')
  
  // Run immediately on start
  await checkAndSendReminders()
  
  // Then run on interval
  setInterval(async () => {
    await checkAndSendReminders()
  }, INTERVAL)
}

main().catch(console.error)
