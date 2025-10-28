# Database URL Update Required

## 🚨 Issue

Your Supabase project ID changed after resetting the password:
- Old ID: `turiynixgwejighknptw`
- New ID: `25waqsqx`

The `DATABASE_URL` in Vercel needs to be updated with the new project ID.

## 🔧 How to Fix

### Step 1: Get the New DATABASE_URL from Supabase

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Settings** → **Database**
4. Scroll down to **Connection string**
5. Under **Connection pooling**, copy the **URI**

It should look like:
```
postgresql://postgres.[NEW-PROJECT-ID]:[YOUR-NEW-PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres
```

### Step 2: Make Sure It Includes Query Parameters

Add `?pgbouncer=true&connection_limit=1` to the end:
```
postgresql://postgres.[NEW-PROJECT-ID]:[YOUR-NEW-PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

### Step 3: Update in Vercel

1. Go to https://vercel.com/dashboard
2. Your project → **Settings** → **Environment Variables**
3. Find `DATABASE_URL`
4. Replace with the new URL (with new project ID and password)
5. Make sure all three environments are checked:
   - ☑ Production
   - ☑ Preview
   - ☑ Development
6. Click **Save**
7. Go to **Deployments** → Click **⋮** → **Redeploy**

## ⚠️ Important

The project ID in the URL changed because Supabase recreated your database connection. Make sure to use the **complete new URL** from Supabase.

## ✅ After Updating

- Vehicles will load properly
- The app will connect to the database
- All errors will be resolved

