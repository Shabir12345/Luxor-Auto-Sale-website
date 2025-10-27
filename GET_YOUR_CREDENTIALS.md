# Where to Get Your Environment Variables

## 📋 Quick Reference

### 1️⃣ DATABASE_URL (from Supabase)

**Step 1:** Go to https://app.supabase.com

**Step 2:** Click on your project

**Step 3:** Click the **⚙️ Settings** icon (bottom left sidebar)

**Step 4:** Click **Database** in the settings menu

**Step 5:** Scroll down to **Connection string** section

**Step 6:** Under **Connection pooling**, you'll see something like:
```
postgresql://postgres:[YOUR-PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres
```

**Step 7:** Copy this entire string

**Step 8:** Replace `[YOUR-PASSWORD]` with your actual database password
- If you don't know your password, look for "Database password" in the same page
- Or reset it by clicking "Reset database password"

✅ **Your DATABASE_URL should look like:**
```
postgresql://postgres:MySecurePassword123@aws-1-us-east-1.pooler.supabase.com:6543/postgres
```

---

### 2️⃣ NEXT_PUBLIC_APP_URL (from Vercel)

**Option A:** If you already deployed to Vercel

1. Go to https://vercel.com/dashboard
2. Click on your project
3. Go to **Settings** → **Domains**
4. You'll see your domain, e.g., `luxor-auto-sale.vercel.app`
5. Use it as: `https://luxor-auto-sale.vercel.app`

**Option B:** If you haven't deployed yet

1. First, deploy your app to Vercel:
   - Go to https://vercel.com
   - Click "Add New" → "Project"
   - Import from GitHub
   - Select your repository
   - Click "Deploy"
2. After deployment, you'll get a URL
3. Use that URL as your `NEXT_PUBLIC_APP_URL`

---

### 3️⃣ JWT_SECRET (Generate it)

Run this command in your terminal:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

This will output something like:
```
a3b4c5d6e7f8g9h0i1j2k3l4m5n6o7p8q9r0s1t2u3v4w5x6y7z8
```

Copy this entire string and use it as your `JWT_SECRET`

---

## 🔧 Complete Example for Vercel

Once you have all the values, add them to Vercel:

1. Go to Vercel → Your Project → **Settings** → **Environment Variables**
2. Add each variable:

| Variable Name | Where to Get | Example Value |
|--------------|--------------|---------------|
| `DATABASE_URL` | Supabase → Settings → Database | `postgresql://postgres:pass@host:6543/db` |
| `NEXT_PUBLIC_APP_URL` | Vercel → Settings → Domains | `https://luxor-auto-sale.vercel.app` |
| `NODE_ENV` | Static | `production` |
| `JWT_SECRET` | Generate with node command | `a3b4c5d6e7f8...` (64 chars) |
| `JWT_EXPIRES_IN` | Static | `7d` |
| `ADMIN_EMAIL` | Your choice | `owner@luxorautosale.com` |
| `ADMIN_PASSWORD` | Your choice | `YourSecurePassword123!` |
| `EMAIL_USER` | Your Gmail | `yourname@gmail.com` |
| `EMAIL_APP_PASSWORD` | Google Account → App Passwords | `abcd efgh ijkl mnop` |

---

## ⚠️ Important Reminders

✅ **Do:**
- Copy the connection string from "Connection pooling" (port 6543)
- Use https:// in your VERCEL_APP_URL
- Generate a strong, random JWT_SECRET
- Set scopes to Production, Preview, and Development

❌ **Don't:**
- Use `localhost:3000` in production
- Use simple passwords for JWT_SECRET
- Commit your real .env file to GitHub
- Forget to redeploy after adding variables

---

## 📺 Visual Guide

```
1. Supabase Dashboard
   └── Your Project
       └── ⚙️ Settings
           └── Database
               └── Connection string (pooling)
                   └── [COPY THIS]

2. Vercel Dashboard
   └── Your Project
       └── Settings
           └── Domains
               └── [COPY YOUR DOMAIN]

3. Your Terminal
   └── Run: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
       └── [COPY THE OUTPUT]
```

---

## 🆘 Still Need Help?

Check the detailed guide: [VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md)

