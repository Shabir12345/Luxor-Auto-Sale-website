# DATABASE_URL Fix

## 🚨 The Problem

Your current DATABASE_URL is missing important query parameters:

**Your current URL:**
```
postgresql://postgres:[YOUR-PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres
```

**What's missing:** The `?pgbouncer=true&connection_limit=1` at the end

## ✅ The Correct Format

Your DATABASE_URL should be:

```
postgresql://postgres:[YOUR-PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

## 🔧 Where to Fix

1. **In your local `.env` file**
2. **In Vercel** (Settings → Environment Variables)

## 📝 Complete DATABASE_URL

```
postgresql://postgres:[YOUR-PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

## ⚠️ Why This Matters

- `pgbouncer=true` - Tells Prisma to use connection pooling
- `connection_limit=1` - Limits connections (important for serverless/Vercel)

Without these parameters, Prisma won't be able to connect properly to Supabase.

## 🚀 Next Steps

1. Update your `.env` file with the complete URL
2. Update Vercel environment variables with the complete URL
3. Regenerate Prisma Client: `npx prisma generate`
4. Restart your dev server
5. Redeploy on Vercel

