import 'dotenv/config';
import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import twilio from 'twilio';

// Initialize Prisma
const prisma = new PrismaClient({
  log: ['query', 'error', 'warn'],
});

// Initialize Twilio
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

// Helper functions
async function sendWhatsAppReminder(to: string, message: string): Promise<string> {
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER!;
  
  console.log(`[WhatsApp] Attempting to send message:`);
  console.log(`  From: whatsapp:${fromNumber}`);
  console.log(`  To: whatsapp:${to}`);
  console.log(`  Body: ${message.substring(0, 50)}...`);
  
  try {
    const result = await twilioClient.messages.create({
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${to}`,
      body: message,
    });

    console.log(`[WhatsApp] ✅ SUCCESS! Message sent, SID: ${result.sid}`);
    console.log(`[WhatsApp] Status: ${result.status}`);
    console.log(`[WhatsApp] Error code: ${result.errorCode || 'none'}`);
    console.log(`[WhatsApp] Error message: ${result.errorMessage || 'none'}`);
    return result.sid;
  } catch (error: any) {
    console.error(`[WhatsApp] ❌ FAILED to send message to ${to}`);
    console.error(`[WhatsApp] Error:`, error);
    console.error(`[WhatsApp] Error message:`, error.message);
    console.error(`[WhatsApp] Error code:`, error.code);
    throw new Error(`WhatsApp send failed: ${error.message}`);
  }
}

function formatReminderMessage(title: string, message: string): string {
  return `🔔 *Reminder: ${title}*\n\n${message}`;
}

/**
 * Background worker that sends due reminders via WhatsApp
 * 
 * Runs every minute to check for reminders that:
 * - Are scheduled for now or in the past
 * - Haven't been sent yet (sent = false)
 */

async function processReminders() {
  console.log('[Worker] Checking for due reminders...');

  try {
    // Find reminders that are due and haven't been sent
    const dueReminders = await prisma.reminder.findMany({
      where: {
        scheduledFor: {
          lte: new Date(), // Scheduled for now or earlier
        },
        sent: false,
      },
      include: {
        user: {
          select: {
            phoneNumber: true,
            email: true,
          },
        },
      },
    });

    console.log(`[Worker] Found ${dueReminders.length} due reminder(s)`);

    // Process each reminder
    for (const reminder of dueReminders) {
      try {
        // Format and send WhatsApp message
        const message = formatReminderMessage(reminder.title, reminder.message);
        await sendWhatsAppReminder(reminder.user.phoneNumber, message);

        // Mark as sent
        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { sent: true },
        });

        console.log(`[Worker] ✅ Sent reminder "${reminder.title}" to ${reminder.user.email}`);
      } catch (error: any) {
        console.error(`[Worker] ❌ Failed to send reminder ${reminder.id}:`, error.message);
        // Don't mark as sent if failed - will retry next cycle
      }
    }
  } catch (error: any) {
    console.error('[Worker] Error processing reminders:', error.message);
  }
}

// Run every minute: '* * * * *'
// Format: minute hour day month weekday
console.log('[Worker] Starting reminder worker...');
console.log('[Worker] DATABASE_URL:', process.env.DATABASE_URL || '(missing)');
console.log('[Worker] Cron schedule: Every minute');

// Run immediately on startup (for testing)
processReminders();

// Then run every minute
cron.schedule('* * * * *', processReminders);

console.log('[Worker] Worker is running! Press Ctrl+C to stop.');
