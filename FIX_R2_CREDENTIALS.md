# 🔧 Fix: R2 Credential Access Key Length Error

## ❌ Error You're Seeing
```
Upload failed: InvalidArgument - Credential access key has length 20, should be 32
```

## 🔍 What This Means

Cloudflare R2 access keys must be **exactly 32 characters**. Your current `R2_ACCESS_KEY_ID` is only 20 characters, which is the length of AWS S3 access keys.

**Important:** Cloudflare R2 and AWS S3 use different credential formats:
- **AWS S3 access keys:** 20 characters
- **Cloudflare R2 access keys:** 32 characters

## ✅ How to Fix

### Step 1: Get Your Correct R2 Credentials

1. **Go to Cloudflare Dashboard**
   - Navigate to: https://dash.cloudflare.com
   - Go to **R2** in the sidebar

2. **Create or View API Tokens**
   - Click on **Manage R2 API Tokens**
   - Either create a **new API token** or view an existing one
   - When creating, ensure you give it **Read & Write** permissions for your bucket

3. **Copy the Credentials**
   - You'll see:
     - **Access Key ID** (should be 32 characters)
     - **Secret Access Key** (longer string)
   - **Note:** The Access Key ID should be exactly 32 characters

### Step 2: Update Your Environment Variables

Update your `.env` file (or Vercel environment variables) with the correct values:

```env
R2_ACCOUNT_ID=b8b4f26e4b7e2e01428cfb560cb0410d
R2_ACCESS_KEY_ID=your-32-character-access-key-here
R2_SECRET_ACCESS_KEY=your-secret-access-key-here
R2_BUCKET=luxor-auto-sale-images
R2_PUBLIC_URL=https://pub-3cba356b1f804de7a4236ec05edff5ee.r2.dev
```

**Important Checks:**
- ✅ `R2_ACCESS_KEY_ID` must be **exactly 32 characters**
- ✅ No spaces before or after the values
- ✅ No quotes around the values (unless your deployment platform requires them)

### Step 3: If Using Vercel

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Find `R2_ACCESS_KEY_ID` and update it with your 32-character key
4. **Save** the variable
5. **Redeploy** your application (Deployments → Redeploy)

### Step 4: Restart Your Development Server

If running locally:
```bash
# Stop your server (Ctrl+C)
# Then restart
npm run dev
```

## 🔍 Verify Your Configuration

The application will now:
1. **Check the credential length** before attempting uploads
2. **Show helpful error messages** if credentials are wrong
3. **Automatically fall back to local filesystem** if R2 credentials are invalid (so uploads still work!)

## 🎯 What Changed in the Code

The storage configuration now:
- ✅ Validates R2 access key length (must be 32 characters)
- ✅ Provides clear error messages
- ✅ Automatically falls back to local storage if R2 credentials are invalid
- ✅ Prioritizes R2 credentials when `R2_ACCOUNT_ID` is set
- ✅ Better separation between AWS S3 and Cloudflare R2 configurations

## 🚨 Common Mistakes

1. **Using AWS credentials for R2** - AWS keys are 20 chars, R2 keys are 32 chars
2. **Copying the wrong value** - Make sure you're copying the Access Key ID, not the Secret
3. **Extra spaces** - Check for leading/trailing spaces in your env variables
4. **Not redeploying** - After changing env vars in Vercel, you must redeploy

## ✅ After Fixing

Once you've updated your credentials:
1. The error should disappear
2. Uploads should work with R2
3. Images will be stored in your Cloudflare R2 bucket
4. They'll be accessible via your `R2_PUBLIC_URL`

## 🆘 Still Having Issues?

If you're still getting errors:
1. Check the server console logs - they'll show the length of your access key
2. Verify your R2_ACCOUNT_ID matches your Cloudflare account
3. Make sure your R2 API token has the correct permissions
4. Try creating a new R2 API token if the old one might be invalid

