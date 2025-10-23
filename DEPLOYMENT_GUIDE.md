# 🚀 Deployment Guide - Launch Your Website Online

## 🎯 **Recommended: Vercel (Easiest & Best for Next.js)**

### **Why Vercel?**
- ✅ **Made for Next.js** - Perfect integration
- ✅ **Free tier** - No cost for small websites  
- ✅ **Automatic deployments** - Push to GitHub = auto deploy
- ✅ **Built-in database** - Can use Vercel Postgres
- ✅ **Custom domains** - Use your own domain name
- ✅ **SSL certificates** - Automatic HTTPS

---

## 📋 **Step 1: Prepare Your Code**

### **1.1 Commit All Changes**
```bash
git add .
git commit -m "Ready for production deployment"
git push origin main
```

### **1.2 Test Production Build**
```bash
npm run build
```
*This should complete without errors*

---

## 🚀 **Step 2: Deploy to Vercel**

### **2.1 Create Vercel Account**
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub (recommended)
3. Connect your GitHub account

### **2.2 Import Your Project**
1. Click **"New Project"**
2. Import your GitHub repository
3. Vercel will auto-detect it's a Next.js app
4. Click **"Deploy"**

### **2.3 Configure Environment Variables**
In Vercel dashboard, go to **Settings** → **Environment Variables**:

```env
# Database
DATABASE_URL="your-production-database-url"

# App
NODE_ENV="production"
NEXT_PUBLIC_APP_URL="https://your-domain.vercel.app"

# Authentication
JWT_SECRET="your-production-secret-key-min-32-chars"
JWT_EXPIRES_IN="7d"

# Admin Credentials
ADMIN_EMAIL="your-business-email@domain.com"
ADMIN_PASSWORD="your-secure-password"

# Image Storage (Cloudflare R2)
R2_ACCOUNT_ID="your-r2-account-id"
R2_ACCESS_KEY_ID="your-r2-access-key"
R2_SECRET_ACCESS_KEY="your-r2-secret-key"
R2_BUCKET="luxor-auto-sale-images"
R2_PUBLIC_URL="https://your-r2-domain.com"

# Email Notifications
EMAIL_USER="your-email@gmail.com"
EMAIL_APP_PASSWORD="your-gmail-app-password"
ADMIN_EMAIL="your-business-email@domain.com"
```

---

## 🗄️ **Step 3: Set Up Production Database**

### **Option A: Vercel Postgres (Recommended)**
1. In Vercel dashboard → **Storage** → **Create Database**
2. Choose **Postgres**
3. Copy the connection string
4. Add as `DATABASE_URL` in environment variables

### **Option B: Supabase (Current Setup)**
- Keep your existing Supabase database
- Update `DATABASE_URL` in Vercel with your Supabase connection string

### **3.1 Run Database Migrations**
```bash
# In Vercel dashboard, go to Functions tab
# Or run locally with production DATABASE_URL:
npx prisma db push
npx prisma generate
```

---

## 🌐 **Step 4: Custom Domain (Optional)**

### **4.1 Add Custom Domain**
1. In Vercel dashboard → **Settings** → **Domains**
2. Add your domain (e.g., `luxorautosale.com`)
3. Follow DNS configuration instructions

### **4.2 DNS Configuration**
- **A Record:** `@` → Vercel IP
- **CNAME:** `www` → `cname.vercel-dns.com`

---

## 📧 **Step 5: Configure Email Notifications**

### **5.1 Gmail App Password**
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification**
3. Generate **App Password** for "Mail"
4. Use this password in `EMAIL_APP_PASSWORD`

### **5.2 Test Email Notifications**
- Submit test forms on your live website
- Check your email for notifications

---

## 🔧 **Step 6: Final Configuration**

### **6.1 Update Image URLs**
- Make sure `R2_PUBLIC_URL` points to your production image storage
- Test image uploads in admin panel

### **6.2 Test All Features**
- ✅ Homepage loads correctly
- ✅ Vehicle inventory displays
- ✅ Contact form works
- ✅ Financing form works  
- ✅ Trade-in form works
- ✅ Admin login works
- ✅ Image uploads work
- ✅ Email notifications work

---

## 🚀 **Alternative Deployment Options**

### **Option B: Netlify**
- Good for static sites
- Requires more configuration for Next.js
- Free tier available

### **Option C: Railway**
- Good for full-stack apps
- Built-in database options
- Simple deployment

### **Option D: DigitalOcean App Platform**
- More control over server
- Good for complex applications
- Paid service

---

## 📱 **Post-Deployment Checklist**

### **✅ Test Everything:**
- [ ] Website loads at your domain
- [ ] All pages work correctly
- [ ] Contact form sends emails
- [ ] Admin panel accessible
- [ ] Image uploads work
- [ ] Mobile responsive
- [ ] Fast loading times

### **✅ SEO Setup:**
- [ ] Google Analytics (if configured)
- [ ] Google Search Console
- [ ] Meta tags and descriptions
- [ ] Sitemap.xml (auto-generated)

### **✅ Security:**
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] Admin password changed
- [ ] JWT secret is secure
- [ ] Environment variables protected

---

## 🆘 **Troubleshooting**

### **Common Issues:**

**Build Fails:**
- Check all environment variables are set
- Ensure database is accessible
- Check for TypeScript errors

**Images Not Loading:**
- Verify `R2_PUBLIC_URL` is correct
- Check R2 bucket permissions
- Test image upload in admin

**Email Not Working:**
- Verify Gmail App Password
- Check `EMAIL_USER` and `EMAIL_APP_PASSWORD`
- Test with a simple form submission

**Database Connection Issues:**
- Verify `DATABASE_URL` is correct
- Check database is accessible from Vercel
- Run `npx prisma db push` to sync schema

---

## 🎉 **You're Live!**

Once deployed, your website will be available at:
- **Vercel URL:** `https://your-project.vercel.app`
- **Custom Domain:** `https://your-domain.com` (if configured)

### **Next Steps:**
1. **Test everything** on the live site
2. **Set up Google Analytics** for tracking
3. **Configure Google Search Console** for SEO
4. **Share your website** with customers!

---

## 📞 **Need Help?**

If you encounter any issues:
1. Check the Vercel deployment logs
2. Verify all environment variables
3. Test locally with production settings
4. Check the troubleshooting section above

**Your Luxor Auto Sales website is ready to go live!** 🚗✨
