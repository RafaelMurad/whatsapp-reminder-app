#!/bin/bash

# Get local IP address
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    LOCAL_IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1)
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    LOCAL_IP=$(hostname -I | awk '{print $1}')
else
    LOCAL_IP="localhost"
fi

echo "🚀 Starting dev server..."
echo "📱 Open on your phone: http://${LOCAL_IP}:3000"
echo ""

# Start Next.js dev server with host binding
cd apps/web && pnpm dev --hostname 0.0.0.0
