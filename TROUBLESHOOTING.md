# 🔧 Troubleshooting Guide

## Quick Fix for "500 Error" When Testing API

If `./test-api.sh` shows `❌ Register failed` with status 500, follow these steps:

### Step 1: Kill Everything and Start Fresh

```bash
# Kill all node processes
pkill -9 node

# Wait a moment
sleep 2

# Start fresh
pnpm dev
```

**Wait for this message:**
```
➜ Local:    http://localhost:3000/
```

### Step 2: Run Diagnostics (in a NEW terminal)

```bash
./diagnose.sh
```

This will tell you exactly what's wrong:
- ✅ or ❌ .env file
- ✅ or ❌ JWT_SECRET configured
- ✅ or ❌ Database exists
- ✅ or ❌ Packages built
- ✅ or ❌ Server responding

### Step 3: Check Your Server Terminal

Look at the terminal where `pnpm dev` is running. When you try to register, you should see logs. If you see errors, they'll tell you what's wrong.

Common errors:
- `Missing JWT_SECRET` → Your .env isn't being loaded
- `ConnectionFailed` → Database path is wrong
- `Cannot find module` → Need to rebuild packages

### Step 4: Nuclear Option (If Nothing Works)

```bash
# Stop server
pkill -9 node

# Clean everything
rm -rf node_modules/.vite
rm -rf packages/db/data/dev.db

# Rebuild from scratch
pnpm install
pnpm db:push

# Start fresh
pnpm dev
```

---

## Environment Variable Issues

### Problem: JWT_SECRET not found

**Symptom:** Error says "Missing JWT_SECRET environment variable"

**Fix:**
```bash
# Check if .env exists
cat .env

# If JWT_SECRET looks like "your-super-secret..."
# Generate a new one:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy the output and update JWT_SECRET in .env
```

### Problem: .env not being loaded

**Symptom:** API works in tests but not when you run it manually

**Solution:** Always use `pnpm dev` (which runs `./dev.sh`) - don't use direct commands

```bash
# ✅ Correct (loads .env)
pnpm dev

# ❌ Wrong (doesn't load .env)
pnpm --filter web dev
```

---

## Database Issues

### Problem: Database not found

**Symptom:** Error says "Unable to open connection to local database"

**Fix:**
```bash
# Check database exists
ls -la packages/db/data/dev.db

# If not, create it:
pnpm db:push
```

### Problem: Wrong DATABASE_URL path

**Symptom:** Database exists but still can't connect

**Fix:** Update `.env` to use absolute path:
```bash
DATABASE_URL="file:/home/user/whatsapp-reminder-app/packages/db/data/dev.db"
```

---

## Package Build Issues

### Problem: TypeScript errors about missing types

**Symptom:** Errors like "Cannot find module '@repo/api'"

**Fix:**
```bash
# Rebuild packages
pnpm build:packages

# This runs automatically after 'pnpm install'
# But you can run it manually if needed
```

---

## Still Not Working?

Run this and send me the output:

```bash
./diagnose.sh > diagnosis.txt 2>&1
cat diagnosis.txt
```

Then check your server terminal for any error messages when you try to register.
