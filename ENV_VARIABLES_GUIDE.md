# Environment Variables Complete Reference

## Required Variables by Environment

### Development
```bash
# .env file
NODE_ENV=development

# Database (uses local SQLite by default)
# DATABASE_URL=file:./packages/db/data/dev.db  (auto-detected, can be omitted)

# Authentication
JWT_SECRET=your-secret-key-at-least-32-chars-recommended-64

# Twilio (Optional for development, but needed to test WhatsApp)
TWILIO_ACCOUNT_SID=your_sandbox_sid
TWILIO_AUTH_TOKEN=your_sandbox_token
TWILIO_WHATSAPP_NUMBER=+14155238886  # Twilio sandbox number
```

### Staging/Testing
```bash
NODE_ENV=staging

# Must use external database
DATABASE_URL=postgresql://user:pass@host/dbname
# OR
DATABASE_URL=libsql://your-database.turso.io?authToken=token

# Must have real Twilio credentials
JWT_SECRET=<64-char-random-hex>
TWILIO_ACCOUNT_SID=<real-account-sid>
TWILIO_AUTH_TOKEN=<real-auth-token>
TWILIO_WHATSAPP_NUMBER=<your-approved-whatsapp-number>

# Optional but recommended
SENTRY_DSN=https://key@sentry.io/project
LOG_LEVEL=debug
```

### Production
```bash
NODE_ENV=production

# REQUIRED - External database with backups
DATABASE_URL=libsql://your-database.turso.io?authToken=token

# REQUIRED - Real Twilio Business Account
JWT_SECRET=<64-char-random-hex-use-crypto-randomBytes>
TWILIO_ACCOUNT_SID=<your-real-account-sid>
TWILIO_AUTH_TOKEN=<your-real-auth-token>
TWILIO_WHATSAPP_NUMBER=<your-approved-business-whatsapp-number>

# REQUIRED - CORS configuration
ALLOWED_ORIGINS=https://yourdomain.com,https://api.yourdomain.com

# REQUIRED - Error tracking
SENTRY_DSN=https://key@sentry.io/project

# RECOMMENDED - Logging
LOG_LEVEL=info

# RECOMMENDED - Worker configuration
NODE_ENV=production
WORKER_CONCURRENCY=10
REMINDER_CHECK_INTERVAL=60000  # milliseconds

# OPTIONAL - Database backups
DATABASE_BACKUP_ENABLED=true
DATABASE_BACKUP_SCHEDULE="0 2 * * *"  # 2 AM daily
```

---

## Detailed Variable Descriptions

### Core Authentication
| Variable | Required | Type | Example | Notes |
|----------|----------|------|---------|-------|
| `JWT_SECRET` | Yes | String | `221559ea4bdaddcfbca73ab71d5bf563e267f1a92775aea06e69c80b3f97f28b` | Must be 64+ chars. Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

### Database
| Variable | Required | Environment | Type | Example | Notes |
|----------|----------|-------------|------|---------|-------|
| `DATABASE_URL` | No* | Dev | String | `file:./packages/db/data/dev.db` | Auto-detected if omitted in dev. Required for prod. |
| `DATABASE_URL` | Yes | Production | String | `libsql://your-db.turso.io?authToken=token` | Use Turso (recommended) or PostgreSQL |
| `DATABASE_BACKUP_ENABLED` | No | All | Boolean | `true` | Enable automated backups |
| `DATABASE_BACKUP_SCHEDULE` | No | All | Cron | `0 2 * * *` | When to backup (cron format) |

### Twilio WhatsApp Integration
| Variable | Required | Environment | Type | Example | Notes |
|----------|----------|-------------|------|---------|-------|
| `TWILIO_ACCOUNT_SID` | No | Dev | String | `AC123456789abcdef123456789abcdef1` | Get from: https://console.twilio.com |
| `TWILIO_ACCOUNT_SID` | Yes | Prod | String | `AC123456789abcdef123456789abcdef1` | Must be real account, not sandbox |
| `TWILIO_AUTH_TOKEN` | No | Dev | String | `your_auth_token_here` | Get from: https://console.twilio.com - NEVER commit to git! |
| `TWILIO_AUTH_TOKEN` | Yes | Prod | String | `your_auth_token_here` | Keep secret - rotate regularly |
| `TWILIO_WHATSAPP_NUMBER` | No | Dev | E.164 | `+14155238886` | Sandbox number provided by Twilio |
| `TWILIO_WHATSAPP_NUMBER` | Yes | Prod | E.164 | `+1234567890` | Must be approved business number |

### Error Tracking & Monitoring
| Variable | Required | Type | Example | Notes |
|----------|----------|------|---------|-------|
| `SENTRY_DSN` | No | Dev | String | (N/A) | Not needed in dev, optional for staging |
| `SENTRY_DSN` | Recommended | Prod | String | `https://abc123@sentry.io/123456` | Get from Sentry project settings |
| `LOG_LEVEL` | No | All | String | `info` | Options: `error`, `warn`, `info`, `debug`, `trace` |
| `NODE_ENV` | Recommended | All | String | `production` | Used by logging and feature flags |

### CORS & Security
| Variable | Required | Environment | Type | Example | Notes |
|----------|----------|-------------|------|---------|-------|
| `ALLOWED_ORIGINS` | No | Dev | CSV | `http://localhost:3000,http://localhost:5173` | Comma-separated domain list |
| `ALLOWED_ORIGINS` | Yes | Prod | CSV | `https://app.example.com,https://api.example.com` | Required for cross-origin requests |
| `JWT_EXPIRY` | No | All | Duration | `7d` | Token expiration time |
| `BCRYPT_ROUNDS` | No | All | Number | `10` | Password hashing strength (10=default, 12=slow but more secure) |

### Worker & Background Jobs
| Variable | Required | Type | Example | Notes |
|----------|----------|------|---------|-------|
| `WORKER_CONCURRENCY` | No | Number | `10` | Parallel reminders to process |
| `REMINDER_CHECK_INTERVAL` | No | Number | `60000` | How often to check (milliseconds) |
| `WORKER_TIMEOUT` | No | Number | `30000` | Max time per reminder (milliseconds) |
| `WORKER_MAX_RETRIES` | No | Number | `3` | Failed messages retry count |

### Email Service (When Implemented)
| Variable | Required | Type | Example | Notes |
|----------|----------|------|---------|-------|
| `SMTP_HOST` | No | String | `smtp.gmail.com` | Email provider host |
| `SMTP_PORT` | No | Number | `587` | Email provider port |
| `SMTP_USER` | No | String | `noreply@example.com` | Email sender address |
| `SMTP_PASSWORD` | No | String | (secret) | Email provider password/token |
| `SENDGRID_API_KEY` | No | String | `SG.xxx...` | If using SendGrid instead of SMTP |

---

## How to Generate Secrets

### JWT_SECRET (Required)
```bash
# Generate 64-character hex string
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or using openssl
openssl rand -hex 32
```

### Database URL (Turso)
```bash
# 1. Sign up at https://turso.tech
# 2. Create database: turso db create my-reminder-db
# 3. Get connection string: turso db show my-reminder-db --url
# 4. Get auth token: turso db tokens create my-reminder-db

# Result: libsql://my-db-xxxx.turso.io?authToken=your_token_here
```

### Database URL (PostgreSQL/Supabase)
```bash
# PostgreSQL: postgresql://username:password@host:port/database
# Example: postgresql://user:pass@db.example.com:5432/reminder_app

# Supabase: Same format as PostgreSQL, get from:
# https://app.supabase.com/project/[id]/settings/database
```

### Twilio Credentials
1. Go to https://console.twilio.com
2. Copy Account SID (top left, "Account")
3. Copy Auth Token (next to Account SID)
4. Enable WhatsApp (Products > Messaging > Try it out > WhatsApp)
5. Get sandbox number from WhatsApp settings

---

## Validation in Code

Current validation (see `packages/api/src/lib/env.ts`):

```typescript
const requiredEnvVars = [
  'JWT_SECRET'  // <-- ONLY THIS IS REQUIRED!
]

// MISSING VALIDATIONS IN PRODUCTION:
// - Should require Twilio vars if NODE_ENV=production
// - Should require DATABASE_URL if NODE_ENV=production
// - Should validate JWT_SECRET length (currently warning only)
```

### Startup Validation Needed
```typescript
export function validateEnvProduction(): EnvValidationResult {
  const required = [
    'JWT_SECRET',
    'TWILIO_ACCOUNT_SID',
    'TWILIO_AUTH_TOKEN',
    'TWILIO_WHATSAPP_NUMBER',
    'DATABASE_URL',
    'SENTRY_DSN',
    'ALLOWED_ORIGINS',
  ]
  
  for (const envVar of required) {
    if (!process.env[envVar]) {
      throw new Error(`Missing required env var in production: ${envVar}`)
    }
  }
}
```

---

## Setup Instructions by Platform

### Vercel (Frontend + API)
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables:
   - `JWT_SECRET`
   - `TWILIO_ACCOUNT_SID`
   - `TWILIO_AUTH_TOKEN`
   - `TWILIO_WHATSAPP_NUMBER`
   - `DATABASE_URL`
   - `SENTRY_DSN`
   - `ALLOWED_ORIGINS`
4. Deploy

### Railway (Worker)
1. Create new Railway project
2. Deploy from GitHub
3. Set environment variables (same as Vercel)
4. Configure as cron job or persistent service

### Turso (Database)
1. Sign up at https://turso.tech
2. Create database: `turso db create reminder-app`
3. Get token: `turso db tokens create reminder-app`
4. Use URL in `DATABASE_URL`

### Sentry (Error Tracking)
1. Sign up at https://sentry.io
2. Create project (select "Node.js")
3. Copy DSN to `SENTRY_DSN`

---

## Security Best Practices

### DO:
- ✅ Generate new `JWT_SECRET` for each environment
- ✅ Use 64+ character random strings
- ✅ Store in environment variables, never in code
- ✅ Rotate secrets regularly (at least quarterly)
- ✅ Use different secrets per environment
- ✅ Log which secrets are being used (not values!) on startup
- ✅ Use managed secrets (Vercel, Railway, Render)

### DON'T:
- ❌ Commit `.env` file to git
- ❌ Commit auth tokens to git
- ❌ Reuse same secret across environments
- ❌ Use short or predictable strings
- ❌ Share credentials in Slack/email
- ❌ Use default values in production
- ❌ Log secret values anywhere

### .env.example
Only list variable names, never values:
```bash
# ✅ GOOD:
DATABASE_URL=postgresql://user:pass@host/db
JWT_SECRET=your-secret-key-here

# ❌ BAD:
DATABASE_URL=postgresql://admin:password123@prod.db.com/app
JWT_SECRET=abcd1234
```

---

## Testing Variable Configuration

```bash
# Check if all required vars are set
node -e "
const required = ['JWT_SECRET', 'NODE_ENV'];
const missing = required.filter(v => !process.env[v]);
console.log(missing.length ? 'Missing: ' + missing.join(', ') : 'All good!');
"

# Show non-secret values
echo "NODE_ENV: $NODE_ENV"
echo "Log Level: $LOG_LEVEL"
echo "Twilio Number: $TWILIO_WHATSAPP_NUMBER"
echo "Database: ${DATABASE_URL%\?*}"  # Show without token
```

---

## Troubleshooting

### "Missing JWT_SECRET"
- Add to `.env` file
- Or set in terminal: `export JWT_SECRET=your-secret`
- Check with: `echo $JWT_SECRET`

### "Twilio credentials not configured"
- Warning is normal in dev
- Add to `.env` for testing
- Required in production!

### "Invalid DATABASE_URL"
- Check format: `libsql://...` or `postgresql://...`
- Verify token/password is included
- Test connection: `psql [DATABASE_URL]`

### "CORS blocked in production"
- Set `ALLOWED_ORIGINS` env var
- Use comma-separated list: `http://localhost:3000,https://app.com`
- Check it's being passed to tRPC cors config

---

## Complete .env Example (Development)

```bash
# .env.development
NODE_ENV=development
LOG_LEVEL=debug

# Database - auto-detected in dev, optional
# DATABASE_URL=file:./packages/db/data/dev.db

# Authentication - must be set
JWT_SECRET=221559ea4bdaddcfbca73ab71d5bf563e267f1a92775aea06e69c80b3f97f28b

# Twilio - optional for dev unless testing WhatsApp
TWILIO_ACCOUNT_SID=your_sandbox_sid
TWILIO_AUTH_TOKEN=your_sandbox_token
TWILIO_WHATSAPP_NUMBER=+14155238886

# Optional - CORS (usually localhost:3000 for dev)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Optional - Error tracking (skip in dev)
# SENTRY_DSN=

# Worker
WORKER_CONCURRENCY=1
REMINDER_CHECK_INTERVAL=60000
```

---

## Complete .env Example (Production)

```bash
# .env.production
NODE_ENV=production
LOG_LEVEL=info

# Database - REQUIRED for production
DATABASE_URL=libsql://my-db-xyz.turso.io?authToken=token_here

# Authentication - MUST be strong random value
JWT_SECRET=<use-crypto-randomBytes-32>

# Twilio - REQUIRED for production
TWILIO_ACCOUNT_SID=AC1234567890abcdef1234567890abcd
TWILIO_AUTH_TOKEN=your_real_auth_token_here
TWILIO_WHATSAPP_NUMBER=+1234567890

# CORS - REQUIRED if frontend on different domain
ALLOWED_ORIGINS=https://app.example.com,https://api.example.com

# Error tracking - REQUIRED in production
SENTRY_DSN=https://key@sentry.io/projectid

# Worker configuration
WORKER_CONCURRENCY=10
REMINDER_CHECK_INTERVAL=60000
WORKER_MAX_RETRIES=3

# Database
DATABASE_BACKUP_ENABLED=true
DATABASE_BACKUP_SCHEDULE=0 2 * * *
```

---

**Report Generated:** November 22, 2025
