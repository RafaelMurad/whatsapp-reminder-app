// Twilio WhatsApp Service
import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const whatsappNumber = process.env.TWILIO_WHATSAPP_NUMBER

if (!accountSid || !authToken || !whatsappNumber) {
  console.warn('⚠️  Twilio credentials not configured. WhatsApp messages will not be sent.')
}

const client = accountSid && authToken ? twilio(accountSid, authToken) : null

export async function sendWhatsAppMessage(to: string, body: string): Promise<boolean> {
  if (!client) {
    console.warn('⚠️  Twilio client not initialized. Skipping WhatsApp message.')
    return false
  }

  try {
    const message = await client.messages.create({
      from: `whatsapp:${whatsappNumber}`,
      to: `whatsapp:${to}`,
      body,
    })

    console.log(`✅ WhatsApp message sent: ${message.sid}`)
    return true
  } catch (error) {
    console.error('❌ Failed to send WhatsApp message:', error)
    return false
  }
}
