# Luxor Auto Sale - Complete Management System

A modern, full-stack vehicle inventory management system built with Next.js 14, TypeScript, Prisma, and PostgreSQL.

## 🚀 Features

### Public Website
- **Responsive Design**: Mobile-first, works on all devices
- **Vehicle Inventory**: Browse, search, and filter available vehicles
- **SEO Optimized**: Dynamic sitemaps, structured data, Open Graph tags
- **Vehicle Detail Pages**: Rich vehicle information with image galleries
- **Fast Performance**: Image optimization, lazy loading, caching

### Admin Portal
- **Secure Authentication**: JWT-based auth with role-based access
- **Vehicle Management**: Full CRUD operations for inventory
- **Image Upload**: S3/R2 integration with automatic resizing
- **Photo Management**: Multiple photos per vehicle with drag-to-reorder
- **Status Tracking**: Draft, Available, Pending, Sold
- **Activity Logging**: Full audit trail of all actions

### Technical Highlights
- **TypeScript**: Full type safety across the stack
- **Prisma ORM**: Type-safe database queries
- **API Routes**: RESTful APIs with validation
- **Image CDN**: Cloudflare R2 or AWS S3 support
- **Security**: HTTP security headers, rate limiting, input validation
- **Accessibility**: WCAG 2.1 AA compliant

## 📋 Prerequisites

- Node.js 18+ and npm 9+
- PostgreSQL 14+ database
- AWS S3 or Cloudflare R2 account (for image storage)
- Domain name (for production deployment)

## 🛠️ Installation

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd luxor-auto-sale
npm install
```

### 2. Environment Configuration

Create a `.env` file in the root directory:

```bash
cp env.example .env
```

Edit `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/luxor_auto_sales"

# App
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Authentication
JWT_SECRET="your-secure-random-string-min-32-characters"
JWT_EXPIRES_IN="7d"

# Admin Credentials
ADMIN_EMAIL="owner@luxorautosale.com"
ADMIN_PASSWORD="change-me-on-first-login"

# Image Storage (Cloudflare R2 recommended)
R2_ACCOUNT_ID="your-r2-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key"
R2_SECRET_ACCESS_KEY="your-r2-secret-key"
R2_BUCKET="luxor-auto-sales-images"
R2_PUBLIC_URL="https://images.luxorautosales.com"

# OR AWS S3
# AWS_ACCESS_KEY_ID="your-aws-key"
# AWS_SECRET_ACCESS_KEY="your-aws-secret"
# AWS_REGION="us-east-1"
# AWS_S3_BUCKET="luxor-auto-sale-images"
```

### 3. Database Setup

```bash
# Generate Prisma client
npm run db:generate

# Create database tables
npm run db:push

# Seed initial data (creates admin user and sample vehicles)
npm run db:seed
```

### 4. Run Development Server

```bash
npm run dev
```

Visit:
- **Public Site**: http://localhost:3000
- **Admin Portal**: http://localhost:3000/admin
- **Admin Login**: Use credentials from `.env` file

## 📦 Deployment

### Option 1: Vercel (Recommended)

1. **Push code to GitHub**
2. **Import project in Vercel**
3. **Add environment variables** in Vercel dashboard
4. **Deploy!**

Vercel will automatically:
- Build the Next.js app
- Set up SSL certificates
- Configure CDN and edge caching
- Enable automatic deployments on git push

### Option 2: Railway

1. **Create new project in Railway**
2. **Add PostgreSQL database**
3. **Add Next.js service from GitHub**
4. **Set environment variables**
5. **Deploy**

### Option 3: DigitalOcean App Platform

1. **Create new App**
2. **Connect GitHub repository**
3. **Add PostgreSQL database**
4. **Configure environment variables**
5. **Deploy**

### Option 4: Self-Hosted (Docker)

```bash
# Build production image
docker build -t luxor-auto-sales .

# Run with docker-compose
docker-compose up -d
```

## 📊 Database Management

### View Database
```bash
npm run db:studio
```

### Create Migration
```bash
npm run db:migrate
```

### Reset Database (⚠️ Deletes all data!)
```bash
npx prisma migrate reset
```

## 🔐 Security

### Before Going Live:

1. **Change Admin Password**: Login and change the default password immediately
2. **Update JWT Secret**: Generate a secure random string (min 32 characters)
3. **Enable HTTPS**: Always use SSL certificates in production
4. **Configure CORS**: Restrict API access to your domain
5. **Set up Backups**: Enable automatic database backups
6. **Monitor Logs**: Set up error tracking (Sentry recommended)

### Security Features Included:

- ✅ Password hashing with bcrypt (12 rounds)
- ✅ JWT authentication with expiry
- ✅ HTTP security headers
- ✅ Input validation with Zod
- ✅ SQL injection protection (Prisma)
- ✅ XSS protection
- ✅ CSRF protection
- ✅ Rate limiting ready
- ✅ Activity logging

## 🖼️ Image Storage Setup

### Cloudflare R2 (Recommended - Free 10GB)

1. **Sign up** at https://cloudflare.com
2. **Create R2 bucket**: `luxor-auto-sales-images`
3. **Get API tokens**: Generate access key and secret
4. **Set up public domain**: Connect custom domain for public access
5. **Update .env** with R2 credentials

### AWS S3

1. **Create S3 bucket**
2. **Enable public access** for the bucket
3. **Create IAM user** with S3 permissions
4. **Generate access keys**
5. **Update .env** with AWS credentials

## 🎨 Customization

### Branding

Update these files:
- `src/app/layout.tsx` - Site title and meta tags
- `src/app/globals.css` - Brand colors
- `tailwind.config.ts` - Theme colors
- `public/` - Logo and favicon files

### Content

- **Homepage**: Edit `src/app/page.tsx`
- **About**: Create `src/app/about/page.tsx`
- **Contact**: Add contact form to homepage or create separate page

## 📱 Admin Portal Guide

### Adding a Vehicle

1. **Login** to admin portal
2. **Click "Add New Vehicle"**
3. **Fill in vehicle details**:
   - VIN (required, 17 characters)
   - Year, Make, Model (required)
   - Price and Mileage (required)
   - Technical specs (optional)
   - Description (optional)
4. **Set status** (Draft, Available, Pending, Sold)
5. **Click "Create Vehicle"**
6. **Upload photos** from the vehicle detail page

### Managing Photos

1. **Open vehicle** in admin portal
2. **Click "Manage Photos"**
3. **Upload new photos** (drag & drop supported)
4. **Set primary photo** (shown in listings)
5. **Reorder photos** (drag to reorder)
6. **Delete photos** as needed

### Status Management

- **Draft**: Not visible on public site
- **Available**: Listed in public inventory
- **Pending**: Sale in progress (marked as pending)
- **Sold**: Archived (not shown in listings)

## 🔧 Maintenance

### Regular Tasks

**Daily**:
- Check admin dashboard for new inquiries
- Update vehicle statuses as needed

**Weekly**:
- Review activity logs for suspicious activity
- Check database backups
- Update vehicle photos and descriptions

**Monthly**:
- Review and update pricing
- Archive sold vehicles
- Check site analytics
- Update dependencies: `npm update`

### Monitoring

Set up monitoring for:
- **Uptime**: Use UptimeRobot or Pingdom
- **Errors**: Configure Sentry for error tracking
- **Analytics**: Add Google Analytics ID to `.env`
- **Performance**: Monitor Core Web Vitals

## 🆘 Troubleshooting

### Database Connection Issues
```bash
# Check database is running
psql -U postgres -l

# Test connection
npm run db:studio
```

### Image Upload Fails
- Check S3/R2 credentials in `.env`
- Verify bucket permissions
- Check file size limits (10MB default)

### Admin Login Not Working
- Verify JWT_SECRET is set
- Check admin email/password in database
- Clear browser localStorage and try again

### Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Rebuild
npm run build
```

## 📞 Support

For issues or questions:
1. Check this README
2. Review error logs
3. Check GitHub Issues
4. Contact developer

## 📄 License

Proprietary - All rights reserved by Luxor Auto Sales

## 🙏 Credits

Built with:
- Next.js 14
- TypeScript
- Prisma ORM
- PostgreSQL
- Tailwind CSS
- AWS SDK / Cloudflare R2

---

**Last Updated**: January 2025
**Version**: 1.0.0

---

**Business Name**: Luxor Auto Sale (singular)
