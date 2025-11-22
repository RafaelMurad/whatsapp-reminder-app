// WhatsApp Web Client - FREE WhatsApp integration using whatsapp-web.js
// Works by connecting to WhatsApp Web - user scans QR once, then it maintains session

import pkg from 'whatsapp-web.js'
const { Client, LocalAuth } = pkg
import qrcode from 'qrcode-terminal'
import QRCode from 'qrcode'
import { EventEmitter } from 'events'

export type WhatsAppStatus =
  | 'disconnected'
  | 'connecting'
  | 'qr_ready'
  | 'authenticated'
  | 'ready'
  | 'auth_failure'

interface WhatsAppClientEvents {
  'status_change': (status: WhatsAppStatus) => void
  'qr': (qr: string, qrDataUrl: string) => void
  'ready': () => void
  'disconnected': (reason: string) => void
  'message_sent': (to: string, body: string) => void
  'message_failed': (to: string, error: string) => void
}

class WhatsAppClient extends EventEmitter {
  private client: InstanceType<typeof Client> | null = null
  private status: WhatsAppStatus = 'disconnected'
  private currentQR: string | null = null
  private currentQRDataUrl: string | null = null
  private phoneNumber: string | null = null

  constructor() {
    super()
  }

  getStatus(): WhatsAppStatus {
    return this.status
  }

  getCurrentQR(): { qr: string; dataUrl: string } | null {
    if (this.currentQR && this.currentQRDataUrl) {
      return { qr: this.currentQR, dataUrl: this.currentQRDataUrl }
    }
    return null
  }

  getPhoneNumber(): string | null {
    return this.phoneNumber
  }

  private setStatus(status: WhatsAppStatus) {
    this.status = status
    this.emit('status_change', status)
    console.log(`[WhatsApp] Status: ${status}`)
  }

  async initialize(): Promise<void> {
    if (this.client) {
      console.log('[WhatsApp] Client already initialized')
      return
    }

    this.setStatus('connecting')

    // LocalAuth stores session in .wwebjs_auth folder
    // This means user only needs to scan QR once!
    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: './.wwebjs_auth'
      }),
      puppeteer: {
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      }
    })

    // QR Code event - displayed in terminal and available via API
    this.client.on('qr', async (qr) => {
      this.setStatus('qr_ready')
      this.currentQR = qr

      // Generate QR as data URL for web display
      try {
        this.currentQRDataUrl = await QRCode.toDataURL(qr)
      } catch (err) {
        console.error('[WhatsApp] Failed to generate QR data URL:', err)
        this.currentQRDataUrl = null
      }

      // Display QR in terminal
      console.log('\n[WhatsApp] Scan this QR code with your phone:')
      qrcode.generate(qr, { small: true })
      console.log('\nOpen WhatsApp > Linked Devices > Link a Device\n')

      this.emit('qr', qr, this.currentQRDataUrl || '')
    })

    // Authentication successful
    this.client.on('authenticated', () => {
      this.setStatus('authenticated')
      this.currentQR = null
      this.currentQRDataUrl = null
      console.log('[WhatsApp] Authenticated successfully!')
    })

    // Authentication failure
    this.client.on('auth_failure', (msg) => {
      this.setStatus('auth_failure')
      console.error('[WhatsApp] Authentication failed:', msg)
    })

    // Client is ready to send messages
    this.client.on('ready', async () => {
      this.setStatus('ready')
      this.currentQR = null
      this.currentQRDataUrl = null

      // Get the connected phone number
      const info = this.client?.info
      if (info) {
        this.phoneNumber = info.wid.user
        console.log(`[WhatsApp] Connected as: +${this.phoneNumber}`)
      }

      this.emit('ready')
    })

    // Disconnected
    this.client.on('disconnected', (reason) => {
      this.setStatus('disconnected')
      this.phoneNumber = null
      console.log('[WhatsApp] Disconnected:', reason)
      this.emit('disconnected', reason)
    })

    // Start the client
    try {
      await this.client.initialize()
    } catch (error) {
      console.error('[WhatsApp] Failed to initialize:', error)
      this.setStatus('disconnected')
      throw error
    }
  }

  async sendMessage(phoneNumber: string, message: string): Promise<boolean> {
    if (this.status !== 'ready' || !this.client) {
      console.error('[WhatsApp] Cannot send message - client not ready')
      return false
    }

    try {
      // Format phone number: remove + and add @c.us suffix
      // WhatsApp Web uses format: 1234567890@c.us
      const formattedNumber = phoneNumber.replace(/\+/g, '').replace(/\D/g, '')
      const chatId = `${formattedNumber}@c.us`

      console.log(`[WhatsApp] Sending message to ${formattedNumber}...`)

      await this.client.sendMessage(chatId, message)

      console.log(`[WhatsApp] Message sent to ${formattedNumber}`)
      this.emit('message_sent', phoneNumber, message)
      return true
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error'
      console.error(`[WhatsApp] Failed to send message:`, error)
      this.emit('message_failed', phoneNumber, errorMsg)
      return false
    }
  }

  // Send message to yourself (for self-reminders)
  async sendToSelf(message: string): Promise<boolean> {
    if (!this.phoneNumber) {
      console.error('[WhatsApp] Cannot send to self - phone number not available')
      return false
    }
    return this.sendMessage(this.phoneNumber, message)
  }

  async logout(): Promise<void> {
    if (this.client) {
      try {
        await this.client.logout()
        console.log('[WhatsApp] Logged out successfully')
      } catch (error) {
        console.error('[WhatsApp] Logout error:', error)
      }
    }
    this.setStatus('disconnected')
    this.phoneNumber = null
  }

  async destroy(): Promise<void> {
    if (this.client) {
      try {
        await this.client.destroy()
      } catch (error) {
        console.error('[WhatsApp] Destroy error:', error)
      }
      this.client = null
    }
    this.setStatus('disconnected')
    this.phoneNumber = null
  }
}

// Singleton instance
export const whatsappClient = new WhatsAppClient()

// Export for direct use
export async function sendWhatsAppMessage(to: string, body: string): Promise<boolean> {
  return whatsappClient.sendMessage(to, body)
}

export async function initializeWhatsApp(): Promise<void> {
  return whatsappClient.initialize()
}

export function getWhatsAppStatus(): WhatsAppStatus {
  return whatsappClient.getStatus()
}

export function getWhatsAppQR(): { qr: string; dataUrl: string } | null {
  return whatsappClient.getCurrentQR()
}
