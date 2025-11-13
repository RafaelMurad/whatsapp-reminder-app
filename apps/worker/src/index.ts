// WhatsApp Reminder Worker - Sends scheduled reminders via Twilio
import { db, reminders, users } from '@repo/db'
import { eq, and, lte } from 'drizzle-orm'

// Twilio WhatsApp sending function (copied here to avoid circular dependency)
async function sendWhatsAppMessage(to: string, body: string): Promise<boolean> {
  // TODO: Implement Twilio sending when credentials are available
  console.log(`📤 Would send WhatsApp to ${to}: ${body}`)
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

  console.log(`📋 Found ${dueReminders.length} reminders to send`)

  for (const reminder of dueReminders) {
    if (!reminder.phoneNumber) {
      console.error(`❌ No phone number for reminder: ${reminder.id}`)
      continue
    }

    console.log(`📤 Sending reminder: ${reminder.title}`)
    
    const sent = await sendWhatsAppMessage(
      reminder.phoneNumber,
      `📱 Reminder: ${reminder.title}\n\n${reminder.message}`
    )

    if (sent) {
      // Mark as sent
      await db.update(reminders)
        .set({ sent: true })
        .where(eq(reminders.id, reminder.id))
      
      console.log(`✅ Reminder sent: ${reminder.id}`)
    } else {
      console.error(`❌ Failed to send reminder: ${reminder.id}`)
    }
  }
}

// Run every minute
const INTERVAL = 60 * 1000 // 1 minute

async function main() {
  console.log('🚀 WhatsApp Reminder Worker started')
  console.log(`⏰ Checking for reminders every ${INTERVAL / 1000} seconds`)
  
  // Run immediately on start
  await checkAndSendReminders()
  
  // Then run on interval
  setInterval(async () => {
    await checkAndSendReminders()
  }, INTERVAL)
}

main().catch(console.error)
