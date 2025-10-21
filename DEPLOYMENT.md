# Deployment Guide - Luxor Auto Sale

Complete step-by-step guide for deploying your vehicle inventory system to production.

## 🎯 Pre-Deployment Checklist

Before deploying, ensure you have:

- [ ] PostgreSQL database (production)
- [ ] S3 or R2 storage configured
- [ ] Domain name ready
- [ ] SSL certificate (auto-provisioned by most platforms)
- [ ] All environment variables ready
- [ ] Changed default admin password
- [ ] Tested locally with production-like data

## 🚀 Deployment Options

### Option 1: Vercel (Recommended for Next.js)

**Pros**: Automatic, fast, free tier, great DX
**Best for**: Quick deployment, automatic scaling

#### Steps:

1. **Prepare Repository**
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-github-url>
git push -u origin main
```

2. **Create Vercel Project**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repository
   - Select "Next.js" framework

3. **Configure Environment Variables**

In Vercel dashboard, add these environment variables:

```env
# Database
DATABASE_URL=postgresql://user:pass@host:5432/dbname?sslmode=require

# App
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://yourdomain.com

# Auth
JWT_SECRET=<generate-secure-random-32+chars>
JWT_EXPIRES_IN=7d

# Admin
ADMIN_EMAIL=owner@luxorautosale.com
ADMIN_PASSWORD=<secure-password>

# Storage (R2)
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET=luxor-auto-sale-images
R2_PUBLIC_URL=https://images.yourdomain.com
```

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Visit your deployment URL

5. **Set Up Custom Domain**
   - Go to Project Settings > Domains
   - Add your domain: `luxorautosale.com`
   - Add www subdomain: `www.luxorautosale.com`
   - Update DNS records as instructed

6. **Run Database Migrations**

After first deployment:

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Link project
vercel link

# Run migration
vercel env pull .env.local
npm run db:push
npm run db:seed
```

---

### Option 2: Railway

**Pros**: Easy PostgreSQL setup, free tier
**Best for**: All-in-one solution with database

#### Steps:

1. **Create Railway Account**
   - Sign up at https://railway.app

2. **Create New Project**
   - Click "New Project"
   - Select "Provision PostgreSQL"
   - Note the connection URL

3. **Add Web Service**
   - Click "New Service"
   - Select "GitHub Repo"
   - Choose your repository

4. **Configure Environment**

In Railway service settings:

```env
DATABASE_URL=${{Postgres.DATABASE_URL}}
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://luxorautosales.up.railway.app
JWT_SECRET=<your-secret>
# ... add all other variables
```

5. **Set Build Command**
```bash
npm run build && npm run db:push && npm run db:seed
```

6. **Deploy**
   - Railway auto-deploys on git push
   - Get public URL from dashboard
   - Add custom domain if needed

---

### Option 3: DigitalOcean App Platform

**Pros**: Good performance, managed database, predictable pricing
**Best for**: Scalable production apps

#### Steps:

1. **Create App**
   - Go to https://cloud.digitalocean.com/apps
   - Click "Create App"
   - Select GitHub repository

2. **Add Database**
   - Click "Add Database"
   - Select "PostgreSQL"
   - Choose plan (Basic $15/mo recommended)

3. **Configure App**

Build Command:
```bash
npm run build
```

Run Command:
```bash
npm start
```

Environment Variables:
```env
DATABASE_URL=${db.DATABASE_URL}
NODE_ENV=production
# ... add all other variables
```

4. **Add Post-Deploy Job**

Create `.do/deploy.sh`:
```bash
#!/bin/bash
npm run db:push
npm run db:seed
```

5. **Deploy & Add Domain**
   - App auto-deploys
   - Add custom domain in settings
   - SSL auto-provisioned

---

### Option 4: Self-Hosted (VPS)

**Pros**: Full control, cost-effective for multiple apps
**Best for**: Experienced users wanting full control

#### Prerequisites:
- Ubuntu 22.04 VPS (DigitalOcean, Linode, Vultr)
- Domain name pointed to VPS IP
- SSH access

#### Complete Setup:

**1. Initial Server Setup**

```bash
# SSH into server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Create app user
adduser luxor
usermod -aG sudo luxor
su - luxor
```

**2. Install Dependencies**

```bash
# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx

# Install PM2 for process management
sudo npm install -g pm2
```

**3. Setup PostgreSQL**

```bash
# Create database
sudo -u postgres psql

CREATE DATABASE luxor_auto_sales;
CREATE USER luxor WITH ENCRYPTED PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE luxor_auto_sales TO luxor;
\q
```

**4. Deploy Application**

```bash
# Clone repository
cd /home/luxor
git clone <your-repo-url> app
cd app

# Install dependencies
npm install

# Create .env file
nano .env
# Paste your environment variables

# Build application
npm run build

# Setup database
npm run db:push
npm run db:seed

# Start with PM2
pm2 start npm --name "luxor-app" -- start
pm2 save
pm2 startup
```

**5. Configure Nginx**

```bash
sudo nano /etc/nginx/sites-available/luxorautosale.com
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name luxorautosale.com www.luxorautosale.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    client_max_body_size 10M;
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/luxorautosale.com /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**6. Setup SSL**

```bash
sudo certbot --nginx -d luxorautosale.com -d www.luxorautosale.com
```

Follow prompts to setup automatic SSL renewal.

**7. Setup Firewall**

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

**8. Automatic Deployments**

Create deploy script:
```bash
nano /home/luxor/deploy.sh
```

```bash
#!/bin/bash
cd /home/luxor/app
git pull
npm install
npm run build
npm run db:push
pm2 restart luxor-app
```

Make executable:
```bash
chmod +x /home/luxor/deploy.sh
```

Deploy with:
```bash
./deploy.sh
```

---

## 🗄️ Database Hosting Options

### Recommended Providers:

1. **Neon** (Free tier available)
   - Serverless PostgreSQL
   - Great for Vercel deployments
   - https://neon.tech

2. **Supabase** (Free tier available)
   - PostgreSQL with extras
   - Good for low-traffic sites
   - https://supabase.com

3. **Railway** (PostgreSQL included)
   - Simple setup
   - Good pricing
   - https://railway.app

4. **DigitalOcean Managed Database**
   - Reliable, good support
   - Starts at $15/mo
   - https://digitalocean.com

5. **AWS RDS**
   - Enterprise-grade
   - More expensive
   - https://aws.amazon.com/rds

---

## 📦 Image Storage Setup

### Cloudflare R2 (Recommended)

**Pros**: Free 10GB, fast, S3-compatible

1. **Create R2 Bucket**
```bash
# Login to Cloudflare dashboard
# Go to R2
# Create bucket: luxor-auto-sale-images
```

2. **Generate API Token**
```bash
# In R2 settings
# Click "Manage R2 API Tokens"
# Create new token with read/write permissions
# Save credentials
```

3. **Setup Custom Domain**
```bash
# Add custom domain: images.luxorautosale.com
# Update DNS CNAME record
```

4. **Add to .env**
```env
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_key
R2_SECRET_ACCESS_KEY=your_secret
R2_BUCKET=luxor-auto-sale-images
R2_PUBLIC_URL=https://images.luxorautosale.com
```

### AWS S3 (Alternative)

1. **Create S3 Bucket**
2. **Enable public access**
3. **Create IAM user with S3 permissions**
4. **Add credentials to .env**

---

## 🔐 Security Hardening

### After Deployment:

1. **Change Admin Password Immediately**
```bash
# Login to admin portal
# Go to Profile > Change Password
```

2. **Rotate JWT Secret**
```bash
# Generate new secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# Update in environment variables
# Redeploy
```

3. **Enable Rate Limiting**

Install package:
```bash
npm install express-rate-limit
```

Add to API routes as needed.

4. **Setup Error Monitoring**

Sentry:
```bash
npm install @sentry/nextjs
npx @sentry/wizard --integration nextjs
```

5. **Configure Backups**

Database backups (daily):
```bash
# Add to crontab
0 2 * * * pg_dump luxor_auto_sales > /backup/db_$(date +\%Y\%m\%d).sql
```

6. **Setup Monitoring**

Uptime monitoring:
- https://uptimerobot.com (free)
- https://pingdom.com

---

## 📊 Post-Deployment

### Verify Everything Works:

- [ ] Homepage loads
- [ ] Inventory page shows vehicles
- [ ] Vehicle detail pages work
- [ ] Admin login works
- [ ] Can create new vehicle
- [ ] Image upload works
- [ ] Search/filters work
- [ ] Sitemap accessible (/sitemap.xml)
- [ ] Robots.txt accessible (/robots.txt)
- [ ] SSL certificate valid
- [ ] Mobile responsive
- [ ] Performance good (PageSpeed Insights)

### Submit to Search Engines:

1. **Google Search Console**
   - Add property
   - Verify ownership
   - Submit sitemap

2. **Bing Webmaster Tools**
   - Add site
   - Verify
   - Submit sitemap

---

## 🆘 Common Issues

### Build Fails

**Issue**: "Cannot find module"
```bash
# Solution: Clear cache and rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Fails

**Issue**: "Connection refused"
```bash
# Check DATABASE_URL format
# Ensure database allows connections from your server IP
# For serverless: Add ?connection_limit=1 to URL
```

### Images Not Loading

**Issue**: 403 or 404 on images
```bash
# Check R2/S3 bucket permissions
# Verify R2_PUBLIC_URL is correct
# Check CORS settings on bucket
```

### Admin Can't Login

**Issue**: "Invalid credentials"
```bash
# Reset admin password via database
npm run db:studio
# Or run seed script again
npm run db:seed
```

---

## 📞 Support

If you need help with deployment:

1. Check error logs
2. Review this guide
3. Search GitHub Issues
4. Contact developer

---

**Last Updated**: January 2025

