#!/bin/bash

# Luxor Auto Sale - Initial Setup Script
# This script helps you get started quickly

set -e

echo "🚗 Luxor Auto Sale - Setup Script"
echo "===================================="
echo ""

# Check Node.js version
echo "Checking Node.js version..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version must be 18 or higher. Current: $(node -v)"
    exit 1
fi
echo "✅ Node.js $(node -v) detected"
echo ""

# Check npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed"
    exit 1
fi
echo "✅ npm $(npm -v) detected"
echo ""

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    if [ -f env.example ]; then
        cp env.example .env
        echo "✅ .env file created from env.example"
        echo "⚠️  Please edit .env file with your configuration before continuing"
        echo ""
        read -p "Press Enter once you've configured .env (or Ctrl+C to exit)..."
    else
        echo "❌ env.example file not found"
        exit 1
    fi
else
    echo "✅ .env file already exists"
fi
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
npm install
echo "✅ Dependencies installed"
echo ""

# Generate Prisma Client
echo "🔄 Generating Prisma Client..."
npm run db:generate
echo "✅ Prisma Client generated"
echo ""

# Ask if user wants to setup database
read -p "Do you want to setup the database now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗄️  Setting up database..."
    
    # Push schema
    echo "Creating database tables..."
    npm run db:push
    echo "✅ Database schema created"
    echo ""
    
    # Seed data
    read -p "Do you want to add sample data? (y/n) " -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "🌱 Seeding database..."
        npm run db:seed
        echo "✅ Database seeded"
        echo ""
        
        echo "📝 Default Admin Credentials:"
        echo "   Email: owner@luxorautosale.com"
        echo "   Password: change-me-on-first-login"
        echo ""
        echo "⚠️  IMPORTANT: Change this password after first login!"
    fi
fi
echo ""

# Build application
read -p "Do you want to build the application now? (y/n) " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🏗️  Building application..."
    npm run build
    echo "✅ Build complete"
fi
echo ""

echo "✨ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Start development server: npm run dev"
echo "2. Open http://localhost:3000"
echo "3. Login to admin: http://localhost:3000/admin"
echo "4. Read OWNER_GUIDE.md for usage instructions"
echo "5. Read DEPLOYMENT.md when ready to deploy"
echo ""
echo "Happy selling! 🚗💨"

