# 🚀 Quick Deployment Checklist

## ✅ Pre-Deployment (Complete)
- [x] Build passes without errors
- [x] Database configured for Turso support
- [x] Vercel preset configured
- [x] Environment variables documented
- [x] Production optimizations applied
- [x] Navigation and UI complete
- [x] API endpoints tested locally

## 📋 Deploy to Vercel (Do These Steps)

### 1. Set Up Turso Database (5 minutes)
```bash
# Install Turso CLI
brew install tursodatabase/tap/turso

# Login
turso auth login

# Create database
turso db create whatsapp-reminder-app

# Get credentials (save these!)
turso db show whatsapp-reminder-app --url
turso db tokens create whatsapp-reminder-app

# Push schema
pnpm db:push
```

### 2. Deploy to Vercel (5 minutes)
1. Go to https://vercel.com
2. Click "New Project"
3. Import your GitHub repository
4. **Framework Preset:** Other
5. **Build Command:** `pnpm build`
6. **Install Command:** `pnpm install`
7. Click "Deploy"

### 3. Configure Environment Variables
In Vercel → Project Settings → Environment Variables:

```env
DATABASE_URL=libsql://[from-turso].turso.io
TURSO_AUTH_TOKEN=[from-turso]
JWT_SECRET=[run: openssl rand -base64 32]
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=+14155238886
```

### 4. Redeploy
After adding environment variables:
- Go to Deployments tab
- Click "..." on latest deployment
- Click "Redeploy"

## ✨ That's It!

Your app will be live at: `https://[your-project].vercel.app`

## 🔍 Verify Deployment
- [ ] Homepage loads
- [ ] Can register new account
- [ ] Can login
- [ ] Can create reminder
- [ ] Dashboard displays correctly

## 🐛 Troubleshooting

**Build fails:**
- Check Vercel build logs
- Verify all dependencies in package.json

**Database errors:**
- Verify DATABASE_URL is correct
- Check TURSO_AUTH_TOKEN is set
- Ensure schema was pushed: `pnpm db:push`

**App works but no data saves:**
- Verify Turso database is accessible
- Check Function logs in Vercel

## 📚 Full Documentation
See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.
