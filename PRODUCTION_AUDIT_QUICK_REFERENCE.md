# QUICK REFERENCE: Production Readiness Issues

## Critical Issues (MUST FIX BEFORE LAUNCH)

### 1. Twilio Worker Incomplete ⚠️ 🔴
**File:** `apps/worker/src/index.ts:6-12`  
**Problem:** Worker returns `true` without sending messages (has TODO)  
**Impact:** Reminders never actually sent to users  
**Fix Time:** 2-4 hours  

```typescript
// CURRENT (BROKEN):
async function sendWhatsAppMessage(to: string, body: string): Promise<boolean> {
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Worker] Would send WhatsApp message (dev mode)`)
  }
  return true  // <-- FAKE!
}

// SHOULD BE:
async function sendWhatsAppMessage(to: string, body: string): Promise<boolean> {
  if (!client) return false
  try {
    const message = await client.messages.create({
      from: `whatsapp:${whatsappNumber}`,
      to: `whatsapp:${to}`,
      body,
    })
    console.log(`WhatsApp sent: ${message.sid}`)
    return true
  } catch (error) {
    console.error('Failed to send:', error)
    return false  // Should retry!
  }
}
```

### 2. Missing Twilio Env Validation 🔴
**File:** `packages/api/src/lib/env.ts`  
**Problem:** Only JWT_SECRET is required, Twilio vars are optional  
**Impact:** App starts without Twilio credentials in production  
**Fix Time:** 30 minutes  

```typescript
// CURRENT:
const requiredEnvVars = ['JWT_SECRET'] as const;

// SHOULD BE:
const requiredEnvVars = [
  'JWT_SECRET',
  process.env.NODE_ENV === 'production' ? 'TWILIO_ACCOUNT_SID' : undefined,
  process.env.NODE_ENV === 'production' ? 'TWILIO_AUTH_TOKEN' : undefined,
  process.env.NODE_ENV === 'production' ? 'TWILIO_WHATSAPP_NUMBER' : undefined,
].filter(Boolean) as const;
```

### 3. No Email Verification 🔴
**Status:** Not implemented  
**Impact:** Users can register with fake emails, no way to verify phone ownership  
**Fix Time:** 3-5 hours  
**Required for:** Verifying user's WhatsApp phone number matches

### 4. No Password Reset 🔴
**Status:** Not implemented  
**Impact:** Users can't recover lost passwords  
**Fix Time:** 3-5 hours  

### 5. No Rate Limiting 🔴
**Status:** Feature flag exists but not implemented  
**Impact:** No protection against abuse (unlimited login attempts, API calls)  
**Fix Time:** 2-3 hours  
**Required endpoints:**
- `auth.register`: 3 attempts/hour per IP
- `auth.login`: 5 attempts/15 min per IP  
- `reminder.create`: 100/day per user
- All API: 1000/hour per user

### 6. No Deployment Config 🔴
**Missing Files:**
- ❌ `vercel.json` - Vercel configuration
- ❌ `Dockerfile` - Worker containerization
- ❌ `.github/workflows/` - CI/CD pipelines
**Fix Time:** 3-4 hours combined

### 7. No Error Monitoring 🔴
**Status:** Only console.log  
**Impact:** Can't see production errors, no alerting  
**Fix Time:** 2-3 hours  
**Recommended:** Sentry (free tier available)

---

## Security Issues (MUST FIX)

### 8. No CORS Configuration 🔴
**Impact:** Frontend/API on different domains won't work  
**File:** Need middleware in tRPC setup  
**Fix Time:** 30 minutes  

### 9. No Audit Logging 🔴
**Impact:** Can't track who did what, compliance issues  
**Fix Time:** 4-6 hours  
**Must log:** auth, reminder CRUD, failed attempts

### 10. JWT in localStorage (No httpOnly) 🟡
**Risk:** XSS attacks can steal tokens  
**Note:** Can't use httpOnly with tRPC client library directly  
**Workaround:** Consider switching to auth library with secure storage

---

## High Priority (Strongly Recommended)

### 11. Database Backups Missing
**Status:** Not configured  
**Fix Time:** 2 hours for Turso setup
**Recommended:** Turso (free tier, automatic backups)

### 12. No Health Check Endpoints
**Status:** Not implemented  
**Fix Time:** 1 hour  
**Required for:** Load balancers, monitoring

### 13. No Structured Logging
**Status:** Only console.log  
**Fix Time:** 2-3 hours  
**Recommended:** Winston or Pino

### 14. Twilio Credentials Not Validated at Startup
**Status:** Silent failure if missing  
**Fix Time:** 1 hour  

### 15. No Message Retry Logic
**Status:** Single attempt only  
**Impact:** Lost messages if temporary failure  
**Fix Time:** 2-3 hours  
**Required:** Exponential backoff (1s, 5s, 30s, 5min)

---

## Environment Variables Checklist

```bash
# REQUIRED FOR PRODUCTION
✅ JWT_SECRET                 (64+ char hex) - SET
❌ TWILIO_ACCOUNT_SID         - NOT VALIDATED
❌ TWILIO_AUTH_TOKEN          - NOT VALIDATED  
❌ TWILIO_WHATSAPP_NUMBER     - NOT VALIDATED
❌ DATABASE_URL               - Optional but needed for prod
❌ NODE_ENV                   - Should be "production"
❌ SENTRY_DSN                 - Error monitoring (recommended)
❌ ALLOWED_ORIGINS            - CORS configuration
❌ LOG_LEVEL                  - Logging level

# GET THESE FROM:
TWILIO_ACCOUNT_SID   -> https://console.twilio.com (Account SID)
TWILIO_AUTH_TOKEN    -> https://console.twilio.com (Auth Token)
```

---

## Timeline Estimate

**Phase 1 - Critical Fixes:** 1-2 weeks (40-50 hours)
- Twilio worker (4h)
- Email verification (5h)
- Password reset (5h)
- Rate limiting (3h)
- Env validation (1h)
- Error monitoring (3h)
- CORS setup (0.5h)
- CI/CD workflows (4h)
- Deployment config (4h)
- Audit logging (6h)
- Testing (10h)

**Phase 2 - Infrastructure:** 2-3 days (8-12 hours)
- Vercel setup
- Railway/Render worker
- Turso database
- Secrets management
- SSL/HTTPS config

**Phase 3 - Pre-Launch:** 3-5 days (16-20 hours)
- Load testing
- Security audit
- Documentation
- User testing

**TOTAL: 3-4 weeks** (with 2 developers)

---

## Files to Create/Modify

### CREATE:
- [ ] `vercel.json`
- [ ] `Dockerfile`
- [ ] `.github/workflows/ci.yml`
- [ ] `packages/api/src/middleware/rateLimit.ts`
- [ ] `packages/api/src/middleware/cors.ts`
- [ ] `packages/api/src/middleware/audit.ts`
- [ ] `packages/api/src/services/email.ts`
- [ ] `packages/api/src/services/sentry.ts`

### MODIFY:
- [ ] `packages/api/src/lib/env.ts` (add Twilio validation)
- [ ] `apps/worker/src/index.ts` (implement Twilio sending)
- [ ] `packages/api/src/routers/auth.ts` (add email/password endpoints)
- [ ] `packages/api/src/trpc.ts` (add CORS, error handling)
- [ ] `packages/db/src/schema.ts` (add audit tables, indexes)

---

## Next Steps (Priority Order)

1. **TODAY:** Fix Twilio worker TODO
2. **THIS WEEK:** Add email verification + password reset
3. **NEXT WEEK:** Rate limiting + env validation + error monitoring
4. **BEFORE LAUNCH:** Deployment config + security review + testing

---

**Full Report:** See `PRODUCTION_AUDIT_REPORT.md` for detailed analysis
