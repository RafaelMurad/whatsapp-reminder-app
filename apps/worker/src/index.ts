// WhatsApp Reminder Worker - FREE WhatsApp integration via whatsapp-web.js
// No Twilio costs! Uses your own WhatsApp account.

import { db, reminders, users } from '@repo/db'
import { eq, and, lte } from 'drizzle-orm'
import { createServer } from 'http'
import {
  initializeWhatsApp,
  sendWhatsAppMessage,
  getWhatsAppStatus,
  getWhatsAppQR,
  whatsappClient
} from './whatsapp-client.js'

const PORT = parseInt(process.env.WORKER_PORT || '3001', 10)

// Check and send due reminders
async function checkAndSendReminders() {
  const status = getWhatsAppStatus()

  if (status !== 'ready') {
    console.log(`[Worker] WhatsApp not ready (${status}), skipping reminder check`)
    return
  }

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
      console.log(`[Worker] Reminder ${reminder.id} sent successfully`)
    } else {
      console.error(`[Worker] Failed to send reminder ${reminder.id}`)
    }
  }
}

// Simple HTTP API for status and QR code
function createAPIServer() {
  const server = createServer((req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

    if (req.method === 'OPTIONS') {
      res.writeHead(200)
      res.end()
      return
    }

    const url = new URL(req.url || '/', `http://localhost:${PORT}`)

    // Health check
    if (url.pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({ status: 'ok', whatsapp: getWhatsAppStatus() }))
      return
    }

    // WhatsApp status
    if (url.pathname === '/status') {
      const status = getWhatsAppStatus()
      const qr = getWhatsAppQR()
      const phoneNumber = whatsappClient.getPhoneNumber()

      res.writeHead(200, { 'Content-Type': 'application/json' })
      res.end(JSON.stringify({
        status,
        phoneNumber,
        hasQR: !!qr,
        qrDataUrl: qr?.dataUrl || null,
        instructions: status === 'qr_ready'
          ? 'Scan the QR code with WhatsApp (Linked Devices > Link a Device)'
          : status === 'ready'
            ? 'WhatsApp connected and ready to send messages'
            : 'Initializing WhatsApp connection...'
      }))
      return
    }

    // QR code image (for direct browser access)
    if (url.pathname === '/qr') {
      const qr = getWhatsAppQR()
      if (qr?.dataUrl) {
        // Redirect to data URL or send HTML with QR
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>WhatsApp QR Code</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: system-ui, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: #f0f2f5;
              }
              .container {
                background: white;
                padding: 2rem;
                border-radius: 12px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                text-align: center;
                max-width: 400px;
              }
              img { max-width: 280px; margin: 1rem 0; }
              h1 { color: #128C7E; margin-bottom: 0.5rem; }
              p { color: #667781; line-height: 1.5; }
              .steps { text-align: left; margin-top: 1rem; }
              .steps li { margin: 0.5rem 0; }
              .refresh {
                margin-top: 1rem;
                padding: 0.5rem 1rem;
                background: #128C7E;
                color: white;
                border: none;
                border-radius: 6px;
                cursor: pointer;
              }
            </style>
            <script>
              // Auto-refresh every 5 seconds to check if connected
              setTimeout(() => location.reload(), 5000);
            </script>
          </head>
          <body>
            <div class="container">
              <h1>Link WhatsApp</h1>
              <p>Scan this QR code to connect your WhatsApp</p>
              <img src="${qr.dataUrl}" alt="WhatsApp QR Code" />
              <ol class="steps">
                <li>Open WhatsApp on your phone</li>
                <li>Tap <strong>Menu</strong> or <strong>Settings</strong></li>
                <li>Tap <strong>Linked Devices</strong></li>
                <li>Tap <strong>Link a Device</strong></li>
                <li>Point your phone at this QR code</li>
              </ol>
              <button class="refresh" onclick="location.reload()">Refresh</button>
            </div>
          </body>
          </html>
        `)
      } else {
        const status = getWhatsAppStatus()
        res.writeHead(200, { 'Content-Type': 'text/html' })
        res.end(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>WhatsApp Status</title>
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              body {
                font-family: system-ui, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                margin: 0;
                background: #f0f2f5;
              }
              .container {
                background: white;
                padding: 2rem;
                border-radius: 12px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
                text-align: center;
              }
              .status {
                display: inline-block;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-weight: bold;
                margin: 1rem 0;
              }
              .ready { background: #dcf8c6; color: #128C7E; }
              .connecting { background: #fff3cd; color: #856404; }
              .disconnected { background: #f8d7da; color: #721c24; }
            </style>
            <script>
              // Auto-refresh every 3 seconds
              setTimeout(() => location.reload(), 3000);
            </script>
          </head>
          <body>
            <div class="container">
              <h1>WhatsApp Connection</h1>
              <div class="status ${status === 'ready' ? 'ready' : status === 'disconnected' ? 'disconnected' : 'connecting'}">
                ${status === 'ready' ? 'Connected' : status === 'disconnected' ? 'Disconnected' : 'Connecting...'}
              </div>
              <p>${status === 'ready'
            ? 'WhatsApp is connected and ready to send reminders!'
            : status === 'connecting'
              ? 'Please wait while connecting to WhatsApp...'
              : 'WhatsApp is not connected. Restart the worker to reconnect.'
          }</p>
            </div>
          </body>
          </html>
        `)
      }
      return
    }

    // 404
    res.writeHead(404, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ error: 'Not found' }))
  })

  server.listen(PORT, () => {
    console.log(`[Worker] API server running at http://localhost:${PORT}`)
    console.log(`[Worker] View QR code at http://localhost:${PORT}/qr`)
    console.log(`[Worker] Check status at http://localhost:${PORT}/status`)
  })

  return server
}

// Run every minute
const INTERVAL = 60 * 1000 // 1 minute

async function main() {
  console.log('=========================================')
  console.log('  WhatsApp Reminder Worker (FREE)')
  console.log('  No Twilio costs - uses your WhatsApp!')
  console.log('=========================================\n')

  // Start API server first
  createAPIServer()

  // Initialize WhatsApp connection
  console.log('[Worker] Initializing WhatsApp connection...')
  console.log('[Worker] If first time, scan QR code when it appears\n')

  try {
    await initializeWhatsApp()
  } catch (error) {
    console.error('[Worker] Failed to initialize WhatsApp:', error)
    console.log('[Worker] Will retry in 30 seconds...')
    setTimeout(main, 30000)
    return
  }

  // Wait for WhatsApp to be ready before starting reminder checks
  whatsappClient.on('ready', () => {
    console.log('\n[Worker] WhatsApp ready - starting reminder scheduler')
    console.log('[Worker] Checking reminders every 60 seconds...\n')

    // Run immediately on ready
    checkAndSendReminders()

    // Then run on interval
    setInterval(async () => {
      await checkAndSendReminders()
    }, INTERVAL)
  })

  // Handle reconnection
  whatsappClient.on('disconnected', (reason) => {
    console.log('[Worker] WhatsApp disconnected, will try to reconnect...')
    setTimeout(async () => {
      try {
        await initializeWhatsApp()
      } catch (error) {
        console.error('[Worker] Reconnection failed:', error)
      }
    }, 10000)
  })
}

main().catch(console.error)
