# CRITICAL: Vercel Environment Variable Fix

## 🚨 The Problem

The `carfaxUrl` column doesn't exist in your Supabase database. This is because the build is failing on the `prisma db push` step.

## 🔧 The Fix

You need to add environment variables to Vercel **before the build runs**.

### Required Environment Variables for Build

The build script runs `prisma db push`, which needs a connection to your Supabase database.

**Add this to Vercel → Settings → Environment Variables:**

```
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

**Make sure:**
1. The DATABASE_URL is set for **Production, Preview, AND Development** environments
2. The complete URL includes `?pgbouncer=true&connection_limit=1`
3. The password is correct: `L.uxor2@25qwe`

### Steps:

1. Go to https://vercel.com/dashboard
2. Select your project (Luxor Auto Sales)
3. Go to **Settings** → **Environment Variables**
4. Find `DATABASE_URL` or add it if missing
5. Make sure the value is:
   ```
   postgresql://postgres.turiynixgwejighknptw:L.uxor2@25qwe@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
   ```
6. Make sure all three environment scopes are checked:
   - ☑ Production
   - ☑ Preview  
   - ☑ Development
7. Click **Save**
8. Go to **Deployments** → click **⋮** → **Redeploy**

## ⚠️ Why This Is Needed

The build script runs:
```bash
prisma generate && prisma db push --skip-generate && next build
```

The `prisma db push` step tries to add the `carfaxUrl` column to your database, but it needs `DATABASE_URL` to connect to Supabase.

Without the `DATABASE_URL` in Vercel, the build fails at the `prisma db push` step, so the column never gets added.

## ✅ After Setting This Up

1. The build will run `prisma db push` successfully
2. The `carfaxUrl` column will be added to your database
3. Vehicle detail pages will work again
4. The admin dashboard will work

---

## Alternative Quick Fix (If Above Doesn't Work)

If you want to temporarily work around this, you can remove `carfaxUrl` from the Prisma schema until we fix the Vercel build.

But the proper fix is to ensure DATABASE_URL is set correctly in Vercel.

