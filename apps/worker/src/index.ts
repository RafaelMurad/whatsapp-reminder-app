// WhatsApp Reminder Worker - FREE WhatsApp integration via whatsapp-web.js
// No Twilio costs! Uses your own WhatsApp account.
// Supports: Time-based reminders, Location-based triggers, Webhooks

import { db, reminders, users } from '@repo/db'
import { eq, and, lte } from 'drizzle-orm'
import { createServer, IncomingMessage, ServerResponse } from 'http'
import {
  initializeWhatsApp,
  sendWhatsAppMessage,
  getWhatsAppStatus,
  getWhatsAppQR,
  whatsappClient
} from './whatsapp-client.js'
import {
  processLocationUpdate,
  setGeofence,
  removeGeofence,
  getAllGeofences,
  getGeofence,
  generateGeofenceId,
  getLastLocation,
  type Geofence,
  type LocationUpdate
} from './location-service.js'

const PORT = parseInt(process.env.WORKER_PORT || '3001', 10)
const API_KEY = process.env.WORKER_API_KEY || '' // Optional API key for webhook security

// Helper to parse JSON body
async function parseBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = ''
    req.on('data', chunk => body += chunk)
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {})
      } catch {
        reject(new Error('Invalid JSON'))
      }
    })
    req.on('error', reject)
  })
}

// Verify API key if configured
function verifyApiKey(req: IncomingMessage): boolean {
  if (!API_KEY) return true // No key configured = no auth required
  const authHeader = req.headers['authorization'] || req.headers['x-api-key']
  const urlKey = new URL(req.url || '/', `http://localhost`).searchParams.get('key')
  return authHeader === `Bearer ${API_KEY}` || authHeader === API_KEY || urlKey === API_KEY
}

// JSON response helper
function jsonResponse(res: ServerResponse, status: number, data: any) {
  res.writeHead(status, { 'Content-Type': 'application/json' })
  res.end(JSON.stringify(data))
}

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
      await db.update(reminders)
        .set({ sent: true })
        .where(eq(reminders.id, reminder.id))
      console.log(`[Worker] Reminder ${reminder.id} sent successfully`)
    } else {
      console.error(`[Worker] Failed to send reminder ${reminder.id}`)
    }
  }
}

// HTTP API Server with webhooks
function createAPIServer() {
  const server = createServer(async (req, res) => {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Api-Key')

    if (req.method === 'OPTIONS') {
      res.writeHead(200)
      res.end()
      return
    }

    const url = new URL(req.url || '/', `http://localhost:${PORT}`)

    try {
      // ============ PUBLIC ENDPOINTS ============

      // Health check
      if (url.pathname === '/health') {
        return jsonResponse(res, 200, { status: 'ok', whatsapp: getWhatsAppStatus() })
      }

      // WhatsApp status
      if (url.pathname === '/status') {
        const status = getWhatsAppStatus()
        const qr = getWhatsAppQR()
        const phoneNumber = whatsappClient.getPhoneNumber()
        const location = getLastLocation()

        return jsonResponse(res, 200, {
          status,
          phoneNumber,
          hasQR: !!qr,
          qrDataUrl: qr?.dataUrl || null,
          lastLocation: location,
          geofencesCount: getAllGeofences().length,
          instructions: status === 'qr_ready'
            ? 'Scan the QR code with WhatsApp (Linked Devices > Link a Device)'
            : status === 'ready'
              ? 'WhatsApp connected and ready to send messages'
              : 'Initializing WhatsApp connection...'
        })
      }

      // QR code page
      if (url.pathname === '/qr') {
        return serveQRPage(res)
      }

      // ============ WEBHOOK ENDPOINTS (require API key if configured) ============

      // Trigger a message immediately (for Tasker/Shortcuts/IFTTT)
      if (url.pathname === '/trigger' && req.method === 'POST') {
        if (!verifyApiKey(req)) {
          return jsonResponse(res, 401, { error: 'Unauthorized - Invalid API key' })
        }

        const body = await parseBody(req)
        const { message, to, title } = body

        if (!message) {
          return jsonResponse(res, 400, { error: 'Missing "message" field' })
        }

        const phoneNumber = to || whatsappClient.getPhoneNumber()
        if (!phoneNumber) {
          return jsonResponse(res, 400, { error: 'Missing "to" field and no default phone' })
        }

        const fullMessage = title ? `📱 ${title}\n\n${message}` : message
        const sent = await sendWhatsAppMessage(phoneNumber, fullMessage)

        return jsonResponse(res, sent ? 200 : 500, {
          success: sent,
          message: sent ? 'Message sent' : 'Failed to send message'
        })
      }

      // Location update (for Tasker/Shortcuts with GPS)
      if (url.pathname === '/location' && req.method === 'POST') {
        if (!verifyApiKey(req)) {
          return jsonResponse(res, 401, { error: 'Unauthorized - Invalid API key' })
        }

        const body = await parseBody(req)
        const { latitude, longitude, lat, lon, lng } = body

        const finalLat = latitude ?? lat
        const finalLon = longitude ?? lon ?? lng

        if (typeof finalLat !== 'number' || typeof finalLon !== 'number') {
          return jsonResponse(res, 400, { error: 'Missing latitude/longitude' })
        }

        const locationUpdate: LocationUpdate = {
          latitude: finalLat,
          longitude: finalLon,
          timestamp: new Date(),
          source: 'webhook'
        }

        const triggers = processLocationUpdate(locationUpdate, sendWhatsAppMessage)

        return jsonResponse(res, 200, {
          success: true,
          location: { latitude: finalLat, longitude: finalLon },
          triggeredGeofences: triggers.map(t => ({
            name: t.geofence.name,
            event: t.event
          }))
        })
      }

      // ============ GEOFENCE MANAGEMENT ============

      // List all geofences
      if (url.pathname === '/geofences' && req.method === 'GET') {
        return jsonResponse(res, 200, { geofences: getAllGeofences() })
      }

      // Create a geofence
      if (url.pathname === '/geofences' && req.method === 'POST') {
        if (!verifyApiKey(req)) {
          return jsonResponse(res, 401, { error: 'Unauthorized' })
        }

        const body = await parseBody(req)
        const { name, latitude, longitude, radiusMeters, message, phoneNumber, triggerOn, cooldownMinutes } = body

        if (!name || !latitude || !longitude || !message) {
          return jsonResponse(res, 400, {
            error: 'Missing required fields: name, latitude, longitude, message'
          })
        }

        const geofence: Geofence = {
          id: generateGeofenceId(),
          name,
          latitude,
          longitude,
          radiusMeters: radiusMeters || 100,
          message,
          phoneNumber: phoneNumber || whatsappClient.getPhoneNumber() || '',
          triggerOn: triggerOn || 'enter',
          enabled: true,
          cooldownMinutes: cooldownMinutes || 30
        }

        setGeofence(geofence)

        return jsonResponse(res, 201, { success: true, geofence })
      }

      // Delete a geofence
      if (url.pathname.startsWith('/geofences/') && req.method === 'DELETE') {
        if (!verifyApiKey(req)) {
          return jsonResponse(res, 401, { error: 'Unauthorized' })
        }

        const id = url.pathname.split('/')[2]
        const deleted = removeGeofence(id)

        return jsonResponse(res, deleted ? 200 : 404, {
          success: deleted,
          message: deleted ? 'Geofence deleted' : 'Geofence not found'
        })
      }

      // ============ DOCUMENTATION PAGE ============

      if (url.pathname === '/docs' || url.pathname === '/') {
        return serveDocsPage(res)
      }

      // 404
      return jsonResponse(res, 404, { error: 'Not found' })

    } catch (error) {
      console.error('[Worker] API error:', error)
      return jsonResponse(res, 500, { error: 'Internal server error' })
    }
  })

  server.listen(PORT, () => {
    console.log(`[Worker] API server running at http://localhost:${PORT}`)
    console.log(`[Worker] Documentation at http://localhost:${PORT}/docs`)
    console.log(`[Worker] QR code at http://localhost:${PORT}/qr`)
  })

  return server
}

// Serve QR code page
function serveQRPage(res: ServerResponse) {
  const qr = getWhatsAppQR()
  const status = getWhatsAppStatus()

  if (qr?.dataUrl) {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(`<!DOCTYPE html>
<html><head>
  <title>WhatsApp QR Code</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f0f2f5; }
    .container { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; max-width: 400px; }
    img { max-width: 280px; margin: 1rem 0; }
    h1 { color: #128C7E; margin-bottom: 0.5rem; }
    p { color: #667781; line-height: 1.5; }
    .steps { text-align: left; margin-top: 1rem; }
    .steps li { margin: 0.5rem 0; }
    .refresh { margin-top: 1rem; padding: 0.5rem 1rem; background: #128C7E; color: white; border: none; border-radius: 6px; cursor: pointer; }
  </style>
  <script>setTimeout(() => location.reload(), 5000);</script>
</head><body>
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
</body></html>`)
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' })
    res.end(`<!DOCTYPE html>
<html><head>
  <title>WhatsApp Status</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f0f2f5; }
    .container { background: white; padding: 2rem; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
    .status { display: inline-block; padding: 0.5rem 1rem; border-radius: 20px; font-weight: bold; margin: 1rem 0; }
    .ready { background: #dcf8c6; color: #128C7E; }
    .connecting { background: #fff3cd; color: #856404; }
  </style>
  <script>setTimeout(() => location.reload(), 3000);</script>
</head><body>
  <div class="container">
    <h1>WhatsApp Connection</h1>
    <div class="status ${status === 'ready' ? 'ready' : 'connecting'}">
      ${status === 'ready' ? 'Connected!' : 'Connecting...'}
    </div>
    <p>${status === 'ready' ? 'WhatsApp is ready to send reminders!' : 'Please wait...'}</p>
  </div>
</body></html>`)
  }
}

// Serve documentation page
function serveDocsPage(res: ServerResponse) {
  const apiKeyNote = API_KEY
    ? 'API key is REQUIRED for write operations. Use header `Authorization: Bearer YOUR_KEY` or query param `?key=YOUR_KEY`'
    : 'No API key configured. Set WORKER_API_KEY env var for security.'

  res.writeHead(200, { 'Content-Type': 'text/html' })
  res.end(`<!DOCTYPE html>
<html><head>
  <title>WhatsApp Reminder Worker - API Docs</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <style>
    body { font-family: system-ui, sans-serif; max-width: 900px; margin: 0 auto; padding: 2rem; background: #f5f5f5; }
    h1 { color: #128C7E; }
    h2 { color: #075E54; border-bottom: 2px solid #128C7E; padding-bottom: 0.5rem; margin-top: 2rem; }
    h3 { color: #333; }
    .card { background: white; padding: 1.5rem; border-radius: 8px; margin: 1rem 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    code { background: #e8e8e8; padding: 0.2rem 0.4rem; border-radius: 4px; font-size: 0.9em; }
    pre { background: #1e1e1e; color: #d4d4d4; padding: 1rem; border-radius: 8px; overflow-x: auto; }
    .method { display: inline-block; padding: 0.2rem 0.5rem; border-radius: 4px; font-weight: bold; margin-right: 0.5rem; }
    .get { background: #61affe; color: white; }
    .post { background: #49cc90; color: white; }
    .delete { background: #f93e3e; color: white; }
    .endpoint { font-family: monospace; font-size: 1.1em; }
    .note { background: #fff3cd; border-left: 4px solid #ffc107; padding: 1rem; margin: 1rem 0; }
    .success { background: #d4edda; border-left: 4px solid #28a745; padding: 1rem; margin: 1rem 0; }
    table { width: 100%; border-collapse: collapse; margin: 1rem 0; }
    th, td { text-align: left; padding: 0.5rem; border-bottom: 1px solid #ddd; }
    th { background: #f8f8f8; }
  </style>
</head><body>
  <h1>WhatsApp Reminder Worker API</h1>
  <p>FREE WhatsApp integration - no Twilio costs!</p>

  <div class="note"><strong>Security:</strong> ${apiKeyNote}</div>

  <h2>Location-Based Reminders</h2>
  <div class="success">
    <strong>3 Ways to Trigger Location Reminders:</strong>
    <ol>
      <li><strong>Webhook from Phone</strong> - Tasker/Shortcuts sends GPS to <code>/location</code></li>
      <li><strong>WhatsApp Live Location</strong> - Share live location to yourself, worker monitors it</li>
      <li><strong>IFTTT/Home Assistant</strong> - External services call the webhook</li>
    </ol>
  </div>

  <h2>Endpoints</h2>

  <div class="card">
    <h3><span class="method get">GET</span> <span class="endpoint">/status</span></h3>
    <p>Get WhatsApp connection status</p>
    <pre>curl http://localhost:${PORT}/status</pre>
  </div>

  <div class="card">
    <h3><span class="method get">GET</span> <span class="endpoint">/qr</span></h3>
    <p>View QR code to link WhatsApp (open in browser)</p>
  </div>

  <div class="card">
    <h3><span class="method post">POST</span> <span class="endpoint">/trigger</span></h3>
    <p>Send a message immediately. Perfect for Tasker/Shortcuts/IFTTT.</p>
    <pre>{
  "message": "Don't forget to buy milk!",
  "to": "+1234567890",  // optional, defaults to your number
  "title": "Grocery"    // optional
}</pre>
    <p><strong>Example (curl):</strong></p>
    <pre>curl -X POST http://localhost:${PORT}/trigger \\
  -H "Content-Type: application/json" \\
  -d '{"message": "Hello from Tasker!"}'</pre>
  </div>

  <div class="card">
    <h3><span class="method post">POST</span> <span class="endpoint">/location</span></h3>
    <p>Report your current location. Triggers any matching geofences.</p>
    <pre>{
  "latitude": 37.7749,
  "longitude": -122.4194
}</pre>
    <p><strong>Tasker HTTP Request:</strong></p>
    <pre>URL: http://YOUR_SERVER:${PORT}/location
Method: POST
Body: {"latitude": %LOCN, "longitude": %LOCO}</pre>
  </div>

  <div class="card">
    <h3><span class="method get">GET</span> <span class="endpoint">/geofences</span></h3>
    <p>List all configured geofences</p>
  </div>

  <div class="card">
    <h3><span class="method post">POST</span> <span class="endpoint">/geofences</span></h3>
    <p>Create a location-based reminder (geofence)</p>
    <pre>{
  "name": "Grocery Store",
  "latitude": 37.7749,
  "longitude": -122.4194,
  "radiusMeters": 100,
  "message": "Buy milk and eggs!",
  "triggerOn": "enter",  // "enter", "exit", or "both"
  "cooldownMinutes": 30  // prevent repeated triggers
}</pre>
  </div>

  <div class="card">
    <h3><span class="method delete">DELETE</span> <span class="endpoint">/geofences/:id</span></h3>
    <p>Delete a geofence</p>
  </div>

  <h2>Setup Guide</h2>

  <div class="card">
    <h3>Option 1: Phone Automation (Tasker/Shortcuts)</h3>
    <p>Your phone sends GPS coordinates to the worker.</p>
    <table>
      <tr><th>Platform</th><th>App</th><th>Setup</th></tr>
      <tr><td>Android</td><td>Tasker</td><td>Profile: Location > Task: HTTP POST to /location</td></tr>
      <tr><td>Android</td><td>Automate</td><td>Flow: Location changed > HTTP request</td></tr>
      <tr><td>iOS</td><td>Shortcuts</td><td>Automation: Arrive/Leave > Run shortcut with HTTP</td></tr>
      <tr><td>Samsung</td><td>Bixby Routines</td><td>Condition: Location > Action: HTTP request</td></tr>
    </table>
  </div>

  <div class="card">
    <h3>Option 2: WhatsApp Live Location</h3>
    <p>Share your live location to yourself or a dedicated chat. The worker monitors it!</p>
    <ol>
      <li>Open WhatsApp chat (to yourself or a contact)</li>
      <li>Tap Attach > Location > Share Live Location</li>
      <li>Worker receives updates and checks geofences</li>
    </ol>
  </div>

  <div class="card">
    <h3>Option 3: IFTTT / Home Assistant</h3>
    <p>Use external services that support webhooks.</p>
    <ul>
      <li><strong>IFTTT:</strong> Location trigger > Webhook action</li>
      <li><strong>Home Assistant:</strong> Zone enter/exit automation > REST command</li>
      <li><strong>Owntracks:</strong> Configure webhook URL</li>
    </ul>
  </div>

</body></html>`)
}

// Run every minute
const INTERVAL = 60 * 1000

async function main() {
  console.log('================================================')
  console.log('  WhatsApp Reminder Worker (FREE)')
  console.log('  Supports: Time + Location based reminders')
  console.log('================================================\n')

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

  // Listen for live location updates from WhatsApp
  whatsappClient.on('location_received', (latitude, longitude, from) => {
    const locationUpdate: LocationUpdate = {
      latitude,
      longitude,
      timestamp: new Date(),
      source: 'whatsapp_live'
    }
    processLocationUpdate(locationUpdate, sendWhatsAppMessage)
  })

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
