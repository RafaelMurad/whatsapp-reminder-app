#!/bin/bash
# Test script to verify API is working

echo "🧪 Testing WhatsApp Reminder API"
echo "================================"
echo ""

# Check if server is running
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo "❌ Server is NOT running on port 3000"
  echo ""
  echo "Please start the server first:"
  echo "  pnpm dev"
  echo ""
  exit 1
fi

echo "✅ Server is running"
echo ""

# Test register
echo "📝 Testing REGISTER..."
TEST_EMAIL="test$(date +%s)@example.com"
REGISTER_RESULT=$(curl -s -X POST "http://localhost:3000/api/trpc/auth.register" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"password123\",\"phoneNumber\":\"+1234567890\"}")

if echo "$REGISTER_RESULT" | grep -q "token"; then
  echo "✅ Register works!"
  TOKEN=$(echo "$REGISTER_RESULT" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
  EMAIL="$TEST_EMAIL"
else
  echo "❌ Register failed"
  echo "Response: $REGISTER_RESULT"
  exit 1
fi

echo ""

# Test login
echo "🔐 Testing LOGIN..."
LOGIN_RESULT=$(curl -s -X POST http://localhost:3000/api/trpc/auth.login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"password123\"}")

if echo "$LOGIN_RESULT" | grep -q "token"; then
  echo "✅ Login works!"
else
  echo "❌ Login failed"
  echo "Response: $LOGIN_RESULT"
  exit 1
fi

echo ""

# Test me endpoint
echo "👤 Testing ME (auth check)..."
ME_RESULT=$(curl -s -X GET "http://localhost:3000/api/trpc/auth.me" \
  -H "Authorization: Bearer $TOKEN")

if echo "$ME_RESULT" | grep -q "$EMAIL"; then
  echo "✅ Auth check works!"
else
  echo "❌ Auth check failed"
  echo "Response: $ME_RESULT"
  exit 1
fi

echo ""

# Test create reminder
echo "📅 Testing CREATE REMINDER..."
REMINDER_RESULT=$(curl -s -X POST http://localhost:3000/api/trpc/reminder.create \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Test Reminder","message":"This is a test","scheduledFor":"2025-11-20T10:00:00Z"}')

if echo "$REMINDER_RESULT" | grep -q "Test Reminder"; then
  echo "✅ Create reminder works!"
else
  echo "❌ Create reminder failed"
  echo "Response: $REMINDER_RESULT"
  exit 1
fi

echo ""

# Test list reminders
echo "📋 Testing LIST REMINDERS..."
LIST_RESULT=$(curl -s -X GET "http://localhost:3000/api/trpc/reminder.list" \
  -H "Authorization: Bearer $TOKEN")

if echo "$LIST_RESULT" | grep -q "Test Reminder"; then
  echo "✅ List reminders works!"
else
  echo "❌ List reminders failed"
  echo "Response: $LIST_RESULT"
  exit 1
fi

echo ""
echo "================================"
echo "🎉 ALL API TESTS PASSED!"
echo "================================"
