// DEPRECATED: Twilio WhatsApp Service
// This service has been replaced with whatsapp-web.js in the worker
// WhatsApp messages are now sent directly from the worker using your own WhatsApp account
// See: apps/worker/src/whatsapp-client.ts

/**
 * @deprecated Use the worker's whatsapp-client.ts instead
 * This was the old Twilio-based implementation that required paid API credits
 * The new implementation uses whatsapp-web.js which is FREE
 */
export async function sendWhatsAppMessage(_to: string, _body: string): Promise<boolean> {
  console.warn('⚠️  This Twilio service is deprecated. Messages are sent via the worker.')
  console.warn('⚠️  Make sure the worker is running: pnpm worker')
  return false
}
