# Quick Start: Where to Get Your Environment Variables

## 🎯 TL;DR - Quick Answers

### 1. DATABASE_URL
**Where:** Supabase Dashboard → Project Settings → Database → Connection string

**Example:**
```
postgresql://postgres:YOUR_PASSWORD@aws-1-us-east-1.pooler.supabase.com:6543/postgres
```

📌 **Tip:** Use the "Connection pooling" URI (port 6543), not the direct connection (port 5432)

---

### 2. NEXT_PUBLIC_APP_URL
**Where:** Vercel Dashboard → Your Project → Settings → Domains

**Example:**
```
https://luxor-auto-sale-xyz.vercel.app
```

📌 **Tip:** This will be your default Vercel domain, or your custom domain if you added one

---

### 3. JWT_SECRET
**Generate one now:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Or visit: https://randomkeygen.com/

**Should be:** At least 32 characters long

---

## 🚀 Vercel Setup Steps

1. **Get DATABASE_URL** from Supabase (see above)
2. **Get NEXT_PUBLIC_APP_URL** from Vercel (deploy first if you haven't)
3. **Generate JWT_SECRET** (use command above)
4. **Go to Vercel** → Your Project → Settings → Environment Variables
5. **Add all variables** from your `.env` file
6. **Redeploy** your app

---

## ⚠️ Important

- Replace `localhost:3000` with your actual Vercel URL
- Replace the placeholder DATABASE_URL with your real Supabase connection string
- Never commit your real `.env` file to GitHub!

---

For detailed instructions, see [VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md)

