# 🚀 Deployment Guide - Vercel

## Prerequisites
- GitHub account
- Vercel account (free tier is fine)
- Turso account for cloud database (free tier available)

## Step 1: Set Up Turso Database

### Option A: Using Turso CLI (Recommended)
```bash
# Install Turso CLI (macOS)
brew install tursodatabase/tap/turso

# Sign up / login
turso auth signup
# or
turso auth login

# Create database
turso db create whatsapp-reminder-app

# Get database URL
turso db show whatsapp-reminder-app --url
# Copy this - looks like: libsql://[name]-[org].turso.io

# Create auth token
turso db tokens create whatsapp-reminder-app
# Copy this token - you'll need it for Vercel
```

### Option B: Using Turso Web Dashboard
1. Go to https://turso.tech
2. Sign up for free account
3. Create new database: `whatsapp-reminder-app`
4. Copy the **Database URL** (libsql://...)
5. Generate and copy an **Auth Token**

## Step 2: Push Database Schema

```bash
# From project root
pnpm db:push
```

This creates the tables in your Turso database.

## Step 3: Deploy to Vercel

### Via Vercel Dashboard
1. Go to https://vercel.com
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: Other
   - **Root Directory**: `./`
   - **Build Command**: `pnpm build`
   - **Output Directory**: `apps/web/.output/public`
   - **Install Command**: `pnpm install`

### Set Environment Variables
In Vercel Project Settings → Environment Variables, add:

```env
# Database (from Turso)
DATABASE_URL=libsql://[your-database].turso.io
TURSO_AUTH_TOKEN=[your-token-from-turso]

# Authentication (generate a secure random string)
JWT_SECRET=[generate-with: openssl rand -base64 32]

# Twilio WhatsApp (optional - get from https://console.twilio.com)
TWILIO_ACCOUNT_SID=your_account_sid_here
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=+14155238886
```

### Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Visit your app at `https://[your-project].vercel.app`

## Step 4: Test Your Deployment

1. Visit your deployed URL
2. Click "Register" and create an account
3. Test creating a reminder
4. Verify everything works!

## Troubleshooting

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all environment variables are set
- Verify pnpm version compatibility

### Database Connection Issues
- Verify `DATABASE_URL` starts with `libsql://`
- Check `TURSO_AUTH_TOKEN` is set correctly
- Run `turso db show [db-name]` to verify database exists

### App Loads But Errors
- Check Vercel Function logs
- Verify JWT_SECRET is set
- Check browser console for errors

## Local Development

For local development, keep using the file-based SQLite:

```env
DATABASE_URL="file:./packages/db/data/dev.db"
TURSO_AUTH_TOKEN=""
JWT_SECRET="dev-secret-key"
```

## Continuous Deployment

Once connected to GitHub:
- Push to `main` branch → Auto-deploy to production
- Create PR → Get preview deployment
- Merge PR → Update production

## Database Management

### View Data
```bash
turso db shell whatsapp-reminder-app
```

### Backup
```bash
turso db dump whatsapp-reminder-app > backup.sql
```

### Migrate Schema
```bash
pnpm db:push
```

## Need Help?

- [Vercel Documentation](https://vercel.com/docs)
- [Turso Documentation](https://docs.turso.tech)
- [SolidStart Deployment](https://start.solidjs.com/core-concepts/deployment)
