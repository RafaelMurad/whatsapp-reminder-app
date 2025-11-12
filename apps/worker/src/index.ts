import cron from 'node-cron';
import { prisma } from '@repo/db';
import { sendWhatsAppReminder, formatReminderMessage } from '@repo/api/services/whatsapp';

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
console.log('[Worker] Cron schedule: Every minute');

// Run immediately on startup (for testing)
processReminders();

// Then run every minute
cron.schedule('* * * * *', processReminders);

console.log('[Worker] Worker is running! Press Ctrl+C to stop.');
