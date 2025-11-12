import twilio from 'twilio';

// Twilio client singleton
let twilioClient: ReturnType<typeof twilio> | null = null;

/**
 * Get or create Twilio client
 */
function getTwilioClient() {
  if (twilioClient) return twilioClient;

  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;

  if (!accountSid || !authToken) {
    throw new Error('Missing Twilio credentials. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env');
  }

  twilioClient = twilio(accountSid, authToken);
  return twilioClient;
}

/**
 * Send a WhatsApp reminder message
 * 
 * @param to - Recipient phone number (must be in E.164 format, e.g., +14155551234)
 * @param message - Message content to send
 * @returns Message SID from Twilio
 */
export async function sendWhatsAppReminder(to: string, message: string): Promise<string> {
  const client = getTwilioClient();
  const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

  if (!fromNumber) {
    throw new Error('Missing TWILIO_WHATSAPP_NUMBER in .env');
  }

  try {
    const result = await client.messages.create({
      from: `whatsapp:${fromNumber}`,
      to: `whatsapp:${to}`,
      body: message,
    });

    console.log(`[WhatsApp] Message sent to ${to}, SID: ${result.sid}`);
    return result.sid;
  } catch (error: any) {
    console.error(`[WhatsApp] Failed to send message to ${to}:`, error.message);
    throw new Error(`WhatsApp send failed: ${error.message}`);
  }
}

/**
 * Format reminder for WhatsApp message
 */
export function formatReminderMessage(title: string, message: string): string {
  return `🔔 *Reminder: ${title}*\n\n${message}`;
}
