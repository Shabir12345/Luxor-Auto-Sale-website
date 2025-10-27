# 🚨 CRITICAL: Rotate Exposed Credentials

## What Happened

Your sensitive credentials were exposed in public documentation files and committed to GitHub. These have been removed from the repository, **BUT** they're still in Git history.

## ⚠️ Credentials Exposed

- **Database Password**: `L.uxor2@25qwe` (Supabase)
- **Database Password (old)**: `l.UXOR2025AUTO` (Supabase)
- **R2 Access Key**: `94184cc8c979d40f349e7ad35654bfc1` (Cloudflare R2)
- **JWT Secret**: `6b3ebd31185d3c41db006b8e79e18056353466c4ffab2a9a69f9959c703f0a13`

## 🛡️ IMMEDIATE ACTION REQUIRED

### 1. Rotate Supabase Database Password

1. Go to https://app.supabase.com
2. Select your project
3. Settings → Database
4. Click **"Reset Database Password"**
5. Generate a new password
6. Update in:
   - Vercel environment variables
   - Your local `.env` file

### 2. Rotate Cloudflare R2 Credentials

1. Go to https://dash.cloudflare.com
2. R2 → Manage R2 API Tokens
3. **Delete** the old access key: `94184cc8c979d40f349e7ad35654bfc1`
4. Create a new R2 API Token
5. Update in Vercel:
   - `R2_ACCESS_KEY_ID`
   - `R2_SECRET_ACCESS_KEY`

### 3. Generate New JWT Secret

Run this command:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Update in Vercel:
- `JWT_SECRET` = (new generated value)

### 4. Check Google API Keys

If you have Google API keys exposed (mentioned in GitHub alert):
1. Go to https://console.cloud.google.com
2. APIs & Services → Credentials
3. Revoke/delete the old key
4. Create a new one

## 📋 Checklist

- [ ] Reset Supabase database password
- [ ] Update DATABASE_URL in Vercel
- [ ] Delete old R2 access key
- [ ] Create new R2 credentials
- [ ] Update R2 variables in Vercel
- [ ] Generate new JWT_SECRET
- [ ] Update JWT_SECRET in Vercel
- [ ] Check Google API keys (if any)
- [ ] Redeploy Vercel application

## 🔍 What Was Fixed

1. ✅ Removed all exposed credentials from files
2. ✅ Replaced with placeholders like `[REDACTED]`
3. ✅ Committed security fixes to GitHub

## ⚠️ Note About Git History

The credentials are still in Git history. To truly remove them:
1. Consider using `git filter-branch` or BFG Repo Cleaner
2. Or make the repository private
3. For now, rotating all credentials is sufficient security

## 📞 After Rotating

1. Test that your app still works with new credentials
2. Monitor Vercel logs for any issues
3. Check for unauthorized access

只需要立即做所有这些更改！

