#!/bin/bash
set -e

echo "🚀 Setting up WhatsApp Reminder App..."
echo ""

# Check if .env exists
if [ ! -f .env ]; then
  echo "📝 Creating .env file..."
  cp .env.example .env

  # Generate JWT secret
  JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

  # Update JWT_SECRET in .env
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/your-super-secret-jwt-key-change-this-in-production/$JWT_SECRET/" .env
  else
    # Linux
    sed -i "s/your-super-secret-jwt-key-change-this-in-production/$JWT_SECRET/" .env
  fi

  echo "✅ .env created with secure JWT secret"
else
  echo "✅ .env already exists"
fi

echo ""
echo "📦 Installing dependencies..."
pnpm install

echo ""
echo "🗄️  Setting up database..."
pnpm db:push

echo ""
echo "✅ Setup complete!"
echo ""
echo "To start development:"
echo "  pnpm dev"
echo ""
echo "To open database studio:"
echo "  pnpm db:studio"
