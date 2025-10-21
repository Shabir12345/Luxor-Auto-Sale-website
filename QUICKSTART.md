# Quick Start Guide - Luxor Auto Sale

Get up and running in 10 minutes!

## 🚀 Prerequisites

- **Node.js 18+** - [Download here](https://nodejs.org/)
- **PostgreSQL database** - [Get free one here](https://neon.tech) or [install locally](https://www.postgresql.org/download/)
- **Code editor** - VS Code recommended

## ⚡ Fast Setup (5 Minutes)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
# Copy example environment file
cp env.example .env

# Edit .env and add your database URL
nano .env  # or use any text editor
```

**Minimum required in `.env`:**
```env
DATABASE_URL="postgresql://user:password@localhost:5432/luxor_auto_sales"
JWT_SECRET="your-secret-min-32-characters-change-this"
```

### 3. Setup Database

```bash
# Create tables
npm run db:push

# Add sample data (optional but recommended for testing)
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit **http://localhost:3000** 🎉

## 🔑 Default Login

- **URL**: http://localhost:3000/admin
- **Email**: `owner@luxorautosale.com`
- **Password**: `change-me-on-first-login`

⚠️ **Change this password immediately!**

## 📚 Next Steps

### Test the System

1. **Browse Homepage**: http://localhost:3000
2. **View Inventory**: http://localhost:3000/inventory
3. **Login to Admin**: http://localhost:3000/admin
4. **Add a Vehicle**: Click "Add New Vehicle"
5. **Upload Photos**: Add images to your vehicle

### Customize for Your Business

1. **Update Branding**:
   - Edit company name in `src/app/layout.tsx`
   - Update colors in `tailwind.config.ts`
   - Add your logo to `public/` folder

2. **Configure Image Storage** (for production):
   - Sign up for [Cloudflare R2](https://cloudflare.com) (10GB free)
   - Add R2 credentials to `.env`
   - See [Storage Setup](#image-storage-setup)

3. **Prepare for Launch**:
   - Read `DEPLOYMENT.md` for deployment options
   - Read `OWNER_GUIDE.md` for daily operations
   - Change admin password
   - Add real inventory

## 💾 Database Options

### Option 1: Free Cloud Database (Easiest)

**Neon (Recommended)**:
1. Go to https://neon.tech
2. Sign up (free)
3. Create database
4. Copy connection string
5. Paste in `.env` as `DATABASE_URL`

**Supabase**:
1. Go to https://supabase.com
2. Create project
3. Get connection string from Settings > Database
4. Update `.env`

### Option 2: Local PostgreSQL

**Mac (Homebrew)**:
```bash
brew install postgresql@15
brew services start postgresql@15
createdb luxor_auto_sales
```

**Ubuntu/Debian**:
```bash
sudo apt install postgresql postgresql-contrib
sudo -u postgres createdb luxor_auto_sales
```

**Windows**:
- Download from https://www.postgresql.org/download/windows/
- Run installer
- Create database using pgAdmin

## 🖼️ Image Storage Setup

### Development (No Setup Needed)

For local development, you can use placeholder URLs. The seed script already includes sample images from Unsplash.

### Production (Cloudflare R2 - Recommended)

**Free 10GB storage!**

1. **Sign up**: https://cloudflare.com
2. **Create R2 Bucket**:
   - Go to R2
   - Click "Create bucket"
   - Name it: `luxor-auto-sale-images`
3. **Generate API Token**:
   - Go to R2 API Tokens
   - Create token with read/write permissions
   - Save credentials
4. **Add to `.env`**:
```env
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET=luxor-auto-sale-images
R2_PUBLIC_URL=https://your-bucket-url.r2.dev
```

### Alternative: AWS S3

```env
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=us-east-1
AWS_S3_BUCKET=luxor-auto-sale-images
```

## 🚢 Deployment (10 Minutes)

### Vercel (Recommended - Easiest)

1. **Push to GitHub**:
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_URL
git push -u origin main
```

2. **Deploy to Vercel**:
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variables from `.env`
   - Click "Deploy"

3. **Setup Database**:
   - Use Neon, Supabase, or Railway for database
   - Add `DATABASE_URL` to Vercel environment variables

4. **Run Migrations**:
```bash
npm install -g vercel
vercel login
vercel link
vercel env pull .env.local
npm run db:push
npm run db:seed
```

Done! Your site is live at `yourproject.vercel.app`

### Railway (Easiest with Database)

1. Sign up at https://railway.app
2. Click "New Project" > "Provision PostgreSQL"
3. Click "New Service" > "GitHub Repo"
4. Select your repository
5. Add environment variables
6. Deploy automatically!

## 🛠️ Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Database
npm run db:generate      # Generate Prisma Client
npm run db:push          # Update database schema
npm run db:seed          # Add sample data
npm run db:studio        # Open database GUI

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # Check TypeScript types
npm run format           # Format code with Prettier
```

## ❓ Troubleshooting

### "Cannot connect to database"

**Check**:
- Is PostgreSQL running?
- Is `DATABASE_URL` in `.env` correct?
- Can you connect with: `npm run db:studio`

**Fix**:
```bash
# Test connection
npm run db:studio
# If fails, check your DATABASE_URL format
```

### "Module not found" errors

**Fix**:
```bash
# Clear and reinstall
rm -rf node_modules package-lock.json .next
npm install
```

### "Port 3000 already in use"

**Fix**:
```bash
# Kill process on port 3000 (Mac/Linux)
lsof -ti:3000 | xargs kill

# Or use different port
PORT=3001 npm run dev
```

### Build fails

**Fix**:
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

### Images not uploading

**Check**:
- Is R2/S3 configured in `.env`?
- Are credentials correct?
- Is file size under 10MB?
- Is file format JPEG/PNG/WebP?

## 📖 Learn More

- **Setup Guide**: `README.md`
- **User Manual**: `OWNER_GUIDE.md`
- **Deployment Guide**: `DEPLOYMENT.md`
- **Project Overview**: `PROJECT_SUMMARY.md`

## 🆘 Get Help

1. Check the documentation files
2. Run health check: `chmod +x scripts/health-check.sh && ./scripts/health-check.sh`
3. Check error logs in terminal
4. Search error messages online
5. Contact your developer

## 🎉 You're All Set!

Your vehicle inventory management system is ready to use.

**What's included**:
- ✅ Beautiful public website
- ✅ Full-featured admin portal
- ✅ Image upload & management
- ✅ Search and filters
- ✅ SEO optimized
- ✅ Mobile responsive
- ✅ Secure authentication
- ✅ Ready to deploy

**Start adding vehicles and start selling!** 🚗💨

---

**Last Updated**: January 2025

