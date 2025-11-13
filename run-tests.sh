#!/bin/bash
# Combined script to ensure server is running and test it

cd /Users/rafael.murad/Documents/Training/whatsapp-reminder-app

echo "🚀 Starting development server..."
echo ""

# Start server in background if not already running
if ! lsof -i :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
  echo "Starting pnpm dev in background..."
  pnpm dev > /tmp/whatsapp-dev-server.log 2>&1 &
  SERVER_PID=$!
  echo "Server PID: $SERVER_PID"
  echo ""
  
  # Wait for server to be ready
  echo "Waiting for server to start..."
  RETRIES=30
  while [ $RETRIES -gt 0 ]; do
    if curl -s http://localhost:3000 >/dev/null 2>&1; then
      echo "✅ Server is ready!"
      echo ""
      break
    fi
    echo -n "."
    sleep 1
    RETRIES=$((RETRIES - 1))
  done
  
  if [ $RETRIES -eq 0 ]; then
    echo ""
    echo "❌ Server failed to start within 30 seconds"
    echo "Check logs at: /tmp/whatsapp-dev-server.log"
    tail -50 /tmp/whatsapp-dev-server.log
    exit 1
  fi
else
  echo "✅ Server is already running on port 3000"
  echo ""
fi

# Run the tests
echo "🧪 Running API tests..."
echo ""
node test-api.mjs

# Capture test exit code
TEST_EXIT_CODE=$?

echo ""
if [ $TEST_EXIT_CODE -eq 0 ]; then
  echo "✅ All tests completed successfully!"
else
  echo "❌ Tests failed with exit code: $TEST_EXIT_CODE"
fi

exit $TEST_EXIT_CODE
