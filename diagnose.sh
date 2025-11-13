#!/bin/bash
# Diagnostic script to debug API issues

echo "🔍 API Diagnostics"
echo "=================="
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "❌ .env file missing!"
  echo "Run: cp .env.example .env"
  exit 1
fi

echo "✅ .env file exists"

# Check JWT_SECRET
if grep -q "your-super-secret-jwt-key-change-this-in-production" .env; then
  echo "⚠️  JWT_SECRET still has default value"
  echo "Run: ./setup.sh to generate a secure secret"
else
  echo "✅ JWT_SECRET is configured"
fi

# Check DATABASE_URL
if grep -q "DATABASE_URL" .env; then
  DB_URL=$(grep DATABASE_URL .env | cut -d'=' -f2 | tr -d '"')
  echo "✅ DATABASE_URL: $DB_URL"

  # Extract db path
  DB_PATH=$(echo "$DB_URL" | sed 's/file://')
  if [ -f "$DB_PATH" ]; then
    echo "✅ Database file exists at $DB_PATH"
  else
    echo "❌ Database file NOT found at $DB_PATH"
    echo "Run: pnpm db:push"
    exit 1
  fi
else
  echo "❌ DATABASE_URL not found in .env"
  exit 1
fi

# Check if packages are built
if [ ! -d "packages/db/dist" ]; then
  echo "❌ DB package not built"
  echo "Run: pnpm build:packages"
  exit 1
fi

if [ ! -d "packages/api/dist" ]; then
  echo "❌ API package not built"
  echo "Run: pnpm build:packages"
  exit 1
fi

echo "✅ Packages are built"

# Check if server is running
if curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo "✅ Server is responding on port 3000"
else
  echo "❌ No server on port 3000"
  echo "Run: pnpm dev (in another terminal)"
  exit 1
fi

# Try to get server logs
echo ""
echo "📋 Testing a simple API call..."
RESPONSE=$(curl -s -X POST http://localhost:3000/api/trpc/auth.register \
  -H "Content-Type: application/json" \
  -d '{"email":"diagnostic@test.com","password":"test123456","phoneNumber":"+1234567890"}')

echo "Response: $RESPONSE"

if echo "$RESPONSE" | grep -q "token"; then
  echo ""
  echo "✅ API is working!"
elif echo "$RESPONSE" | grep -q "statusCode"; then
  echo ""
  echo "❌ API returned an error"
  echo ""
  echo "Common issues:"
  echo "1. Check server terminal for error messages"
  echo "2. Ensure .env is loaded (use ./dev.sh not direct pnpm)"
  echo "3. Try: pkill node && pnpm dev"
else
  echo ""
  echo "❓ Unexpected response format"
fi

echo ""
echo "=================="
echo "📝 Next steps if failing:"
echo "1. Look at server terminal for errors"
echo "2. Check: cat .env"
echo "3. Try: rm -rf node_modules/.vite && pnpm dev"
