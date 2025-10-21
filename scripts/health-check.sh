#!/bin/bash

# Health Check Script for Luxor Auto Sale
# Run this to verify everything is working correctly

set -e

echo "🏥 Luxor Auto Sale - Health Check"
echo "==================================="
echo ""

# Colors
RED='\033[0:31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Check Node.js
echo "Checking Node.js..."
if command -v node &> /dev/null; then
    echo -e "${GREEN}✓${NC} Node.js $(node -v)"
else
    echo -e "${RED}✗${NC} Node.js not found"
    ((ERRORS++))
fi

# Check npm
echo "Checking npm..."
if command -v npm &> /dev/null; then
    echo -e "${GREEN}✓${NC} npm $(npm -v)"
else
    echo -e "${RED}✗${NC} npm not found"
    ((ERRORS++))
fi

# Check .env file
echo "Checking .env file..."
if [ -f .env ]; then
    echo -e "${GREEN}✓${NC} .env file exists"
    
    # Check critical environment variables
    if grep -q "DATABASE_URL" .env; then
        echo -e "${GREEN}✓${NC} DATABASE_URL configured"
    else
        echo -e "${RED}✗${NC} DATABASE_URL not found in .env"
        ((ERRORS++))
    fi
    
    if grep -q "JWT_SECRET" .env; then
        echo -e "${GREEN}✓${NC} JWT_SECRET configured"
    else
        echo -e "${YELLOW}⚠${NC} JWT_SECRET not found (optional for dev)"
    fi
else
    echo -e "${RED}✗${NC} .env file not found"
    ((ERRORS++))
fi

# Check node_modules
echo "Checking dependencies..."
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✓${NC} node_modules exists"
else
    echo -e "${RED}✗${NC} node_modules not found - run: npm install"
    ((ERRORS++))
fi

# Check Prisma Client
echo "Checking Prisma Client..."
if [ -d "node_modules/@prisma/client" ] && [ -d "node_modules/.prisma" ]; then
    echo -e "${GREEN}✓${NC} Prisma Client generated"
else
    echo -e "${RED}✗${NC} Prisma Client not generated - run: npm run db:generate"
    ((ERRORS++))
fi

# Check build
echo "Checking build..."
if [ -d ".next" ]; then
    echo -e "${GREEN}✓${NC} Application has been built"
else
    echo -e "${YELLOW}⚠${NC} Application not built yet - run: npm run build"
fi

# Try to connect to database
echo "Checking database connection..."
if command -v npx &> /dev/null && [ -f .env ]; then
    if npx prisma db execute --stdin <<< "SELECT 1" &> /dev/null; then
        echo -e "${GREEN}✓${NC} Database connection successful"
    else
        echo -e "${RED}✗${NC} Cannot connect to database"
        echo "   Check your DATABASE_URL in .env"
        ((ERRORS++))
    fi
else
    echo -e "${YELLOW}⚠${NC} Skipping database check"
fi

# Check critical files
echo "Checking project files..."
CRITICAL_FILES=(
    "package.json"
    "tsconfig.json"
    "next.config.js"
    "tailwind.config.ts"
    "prisma/schema.prisma"
    "src/app/page.tsx"
    "src/lib/prisma.ts"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✓${NC} $file"
    else
        echo -e "${RED}✗${NC} Missing: $file"
        ((ERRORS++))
    fi
done

echo ""
echo "================================="

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✓ Health Check Passed!${NC}"
    echo "Your system is ready to run."
    echo ""
    echo "To start development:"
    echo "  npm run dev"
    echo ""
    echo "To start production:"
    echo "  npm run build"
    echo "  npm start"
    exit 0
else
    echo -e "${RED}✗ Health Check Failed${NC}"
    echo "Found $ERRORS error(s). Please fix them before continuing."
    exit 1
fi

