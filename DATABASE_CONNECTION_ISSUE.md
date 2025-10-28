# Database Connection Issue - Wrong Hostname

## 🚨 The Problem

The error shows it's trying to connect to:
```
25waqsqx-1-us-east-1.pooler.supabase.com
```

But your project URL is:
```
turiynixgwejighknptw.supabase.co
```

The DATABASE_URL in Vercel is using the wrong hostname. It should use the connection pooling URL from Supabase.

## 🔧 The Fix

### Get the Correct DATABASE_URL from Supabase:

1. Go to https://app.supabase.com
2. Select your project
3. Go to **Settings** → **Database**
4. Scroll down to **Connection string**
5. Under **Connection pooling**, copy the **URI** string

It should look like:
```
postgresql://postgres.turiynixgwejighknptw:[YOUR-PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres
```

### Important Points:

1. **Use "Connection pooling"** - NOT the direct connection
2. **Port should be 6543** (not 5432)
3. **Host should be** `aws-1-us-east-1.pooler.supabase.com`
4. **Add query parameters**: `?pgbouncer=true&connection_limit=1`

### Complete Format:

```
postgresql://postgres.turiynixgwejighknptw:[YOUR-PASSWORD]@aws-1-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1
```

### Update in Vercel:

1. Go to Vercel → Settings → Environment Variables
2. Update `DATABASE_URL` with the correct URL from Supabase
3. Make sure to use the **connection pooling** URI
4. Enable for Production, Preview, and Development
5. Save and Redeploy

## ⚠️ Common Mistakes

- ❌ Using direct connection (port 5432)
- ❌ Wrong hostname (`25waqsqx` instead of `turiynixgwejighknptw`)
- ❌ Missing query parameters
- ❌ Using an old/invalid password

## ✅ After Fixing

The database connection will work and all errors will be resolved.

