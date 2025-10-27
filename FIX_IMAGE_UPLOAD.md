# Fix Image Upload Error

## 🚨 The Error

```
InvalidArgument: Credential access key has length 20, should be 32
```

**What this means:** Your Cloudflare R2 credentials are wrong.

## 🔧 The Fix

You need to get the correct R2 Access Key ID and Secret Access Key.

### How to Get Correct R2 Credentials

1. **Go to Cloudflare Dashboard**: https://dash.cloudflare.com
2. **Go to R2**: Click "R2" in the left sidebar
3. **Manage R2 API Tokens**: 
   - Click "Manage R2 API Tokens"
   - Or go to: https://dash.cloudflare.com/profile/api-tokens
4. **Create API Token**:
   - Click "Create Token"
   - Use the "Edit Cloudflare Workers" template
   - Or create a custom token with R2 permissions
5. **Get the Credentials**:
   - You'll get an **Access Key ID** (should be ~32 characters)
   - You'll get a **Secret Access Key** (should be ~40 characters)

### Add to Vercel

1. Go to Vercel → Your Project → Settings → Environment Variables
2. Update these variables:

```
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-32-character-access-key
R2_SECRET_ACCESS_KEY=your-40-character-secret-key
R2_BUCKET=luxor-auto-sale-images
R2_PUBLIC_URL=https://your-bucket.r2.dev  (optional, if you set up a custom domain)
```

3. **Save**
4. **Redeploy**

## ⚠️ Common Mistakes

- Using R2 **API Token** instead of **Access Key ID + Secret**
- Using a token that's only 20 characters (those are API tokens, not access keys)
- Not setting `R2_ACCOUNT_ID`

## 📝 Format Check

**R2 Access Key ID**: Should be ~32 characters, like:
```
abcdefghijklmnopqrstuvwxyz123456
```

**NOT** like this (20 chars):
```
abcdefghijklmnopqrst
```

## 🔄 Alternative: Use Local Storage Temporarily

If you don't have R2 set up yet, you can temporarily disable cloud storage.

The app will automatically fall back to local filesystem storage on Vercel (though this won't work well for production).

## ✅ After Fixing

1. Try uploading an image again
2. It should work without errors
3. Images will be stored in your R2 bucket

