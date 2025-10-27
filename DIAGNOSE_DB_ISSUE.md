# Diagnosing Database Issue

## Problem
The `carfaxUrl` column is not being added during build.

## What to Check

### 1. Check DATABASE_URL in Vercel

Go to Vercel → Your Project → Settings → Environment Variables

**Check:**
- Is DATABASE_URL set? ✅
- Does it include `?pgbouncer=true&connection_limit=1`? ⚠️
- Is it enabled for **Production**, **Preview**, AND **Development**? ⚠️

### 2. Check Build Logs

Look at the latest deployment logs in Vercel:

**Look for:**
- Does it show `prisma db push` running?
- Does it show any errors from `prisma db push`?
- Does the build complete successfully?

### 3. Possible Issues

**Issue 1: DATABASE_URL missing Border Parameters**
If your DATABASE_URL is:
```
postgresql://postgres:[YOUR-PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres
```

It needs to be:
```
postgresql://postgres:[YOUR-PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

**Issue 2: Environment Scope**
Make sure DATABASE_URL is enabled for **all three environments** (Production, Preview, Development)

**Issue 3: Build Timing**
The `prisma db push` might be running before Prisma Client is fully ready.

## Quick Fix Options

### Option 1: Manual Database Change (Fastest)
Add the column manually in Supabase:

1. Go to Supabase → Your Project → SQL Editor
2. Run this SQL:
```sql
ALTER TABLE "vehicles" ADD COLUMN IF NOT EXISTS "carfaxUrl" TEXT;
```
3. Click "Run"

### Option 2: Fix Vercel Environment Variable
1. Update DATABASE_URL to include query parameters
2. Enable for all environments
3. Redeploy

### Option 3: Use Migrations Instead
Create a proper migration file instead of using `prisma db push`.

## Recommended Solution
**Use Option 1** (Manual SQL) to fix it immediately, then we can properly set up the build process.

