# Vercel Environment Variables Setup Guide

## 1. NEXT_PUBLIC_APP_URL

This is your Vercel deployment URL. You'll get this after you deploy your app to Vercel.

### How to get it:
1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Select your project (Luxor Auto Sales)
3. Go to **Settings** → **Domains**
4. You'll see your default Vercel domain (e.g., `luxor-auto-sale.vercel.app`)
5. Use that as your `NEXT_PUBLIC_APP_URL`

**Example:**
```
NEXT_PUBLIC_APP_URL=https://luxor-auto-sale.vercel.app
```

---

## 2. DATABASE_URL

This is your Supabase PostgreSQL connection string.

### How to get it from Supabase:

1. **Go to Supabase Dashboard**: https://app.supabase.com
2. **Select your project** (or create one if you haven't)
3. Go to **Project Settings** (gear icon in sidebar)
4. Click on **Database** in the left menu
5. Scroll down to find **Connection string**
6. Under **Connection pooling**, copy the **URI** connection string
7. Replace the password part (it might show `[YOUR-PASSWORD]`) with your actual database password

**Example format:**
```
postgresql://postgres:[YOUR-PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres
```

**To get your actual password:**
- In the same Supabase page, look for **Database Settings**
- Find the **Database password** section
- If you haven't set one, you can reset it here

---

## Complete Vercel Environment Variables Setup

Here's how to add all environment variables in Vercel:

### Steps:
1. Go to https://vercel.com/dashboard
2. Select your **Luxor Auto Sales** project
3. Go to **Settings** → **Environment Variables**
4. Add each variable one by one:

### Required Variables:

```
DATABASE_URL=postgresql://postgres:[PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres
```

```
NEXT_PUBLIC_APP_URL=https://your-app.vercel.app
```

```
NODE_ENV=production
```

```
JWT_SECRET=generate-a-random-32-character-improvedrandomstring
```

```
JWT_EXPIRES_IN=7d
```

```
ADMIN_EMAIL=owner@luxorautosale.com
```

```
ADMIN_PASSWORD=your-secure-password-here
```

### Optional but Recommended:

```
EMAIL_USER=your-gmail@gmail.com
```

```
EMAIL_APP_PASSWORD=your-gmail-app-password
```

```
AWS_ACCESS_KEY_ID=your-key
```

```
AWS_SECRET_ACCESS_KEY=your-secret
```

```
AWS_REGION=us-east-1
```

```
AWS_S3_BUCKET=luxor-auto-sale-images
```

Or for Cloudflare R2:

```
R2_ACCOUNT_ID=your-account-id
```

```
R2_ACCESS_KEY_ID=your-access-key
```

```
R2_SECRET_ACCESS_KEY=your-secret
```

```
R2_BUCKET=luxor-auto-sale-images
```

### How to generate JWT_SECRET:
Use this command in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Or use an online generator like: https://randomkeygen.com/

---

## Important Notes:

1. **After adding variables**, make sure to:
   - Click **Save** for each variable
   - Redeploy your app (go to **Deployments** → click on the three dots → **Redeploy**)

2. **Variable scopes**: Select **Production**, **Preview**, and **Development** for all variables

3. **Never commit your `.env` file** with real passwords to GitHub!

4. **For Supabase passwords**: If you reset your database password in Supabase, make sure to update it in Vercel as well

---

## Quick Checklist:

- [ ] Got DATABASE_URL from Supabase
- [ ] Got NEXT_PUBLIC_APP_URL from Vercel domains
- [ ] Generated a secure JWT_SECRET
- [ ] Added all environment variables in Vercel
- [ ] Redeployed the application
- [ ] Tested the deployed app

---

## Troubleshooting:

### If the app says "Vehicle not found":
- Check that `NEXT_PUBLIC_APP_URL` is set correctly in Vercel
- Make sure there's no trailing slash in the URL
- Redeploy after changing environment variables

### If the database connection fails:
- Verify DATABASE_URL is correct
- Check the database password in Supabase
- Make sure the Supabase project is active

### If emails don't work:
- Set up Gmail App Password: https://support.google.com/accounts/answer/185833
- Make sure 2FA is enabled on your Gmail account before generating app password

