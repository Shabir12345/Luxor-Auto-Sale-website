# How to Get R2 Public URL

## 🎯 R2_PUBLIC_URL is OPTIONAL

You don't necessarily need to set `R2_PUBLIC_URL`. The app will generate URLs automatically.

## 📍 Three Ways to Set Up Public Access

### Option 1: Use Custom Domain (Recommended)

If you set up a custom domain for your R2 bucket:

1. **In Cloudflare Dashboard**:
   - Go to R2 → Your Bucket
   - Click "Settings"
   - Under "Public Access", if you have a custom domain, it looks like:
     ```
     https://images.yourdomain.com
     ```

2. **Set in Vercel**:
   ```
   R2_PUBLIC_URL=https://images.yourdomain.com
   ```

### Option 2: Use Cloudflare R2.dev Domain

Cloudflare provides default public domains:

1. **In Cloudflare Dashboard**:
   - Go to R2 → Your Bucket
   - Click "Settings"
   - Look for "Public URL" or "Public Bucket" setting
   - The URL format is usually:
     ```
     https://pub-xxxxx.r2.dev
     ```

2. **To Enable Public Access**:
   - In bucket settings, enable "Public Access"
   - Cloudflare will give you a public URL like: `https://pub-xxxxx.r2.dev`
   - Make sure your bucket is set to public!

3. **Set in Vercel**:
   ```
   R2_PUBLIC_URL=https://pub-xxxxx.r2.dev
   ```

### Option 3: Don't Set It (Let App Generate URLs)

If you don't set `R2_PUBLIC_URL`, the app will try to construct URLs automatically.

**No action needed** - just leave `R2_PUBLIC_URL` empty in Vercel.

## 🎬 How to Enable Public Access on R2 Bucket

1. Go to https://dash.cloudflare.com
2. Click **R2** in sidebar
3. Click on your bucket (`luxor-auto-sale-images`)
4. Click **Settings**
5. Scroll to **Public Access** section
6. Click **"Allow Access"** or **"Enable Public Access"**
7. Cloudflare will show you the public URL

## ✅ Quick Checklist

- [ ] R2 bucket exists: `luxor-auto-sale-images`
- [ ] Public access is enabled on the bucket
- [ ] Got the public URL (either custom domain or `pub-xxxxx.r2.dev`)
- [ ] Set `R2_PUBLIC_URL` in Vercel (or leave empty)
- Dates in Vercel

## ⚠️ Important Notes

- **Public access is required** for images to be viewable on your website
- The `pub-xxxxx.r2.dev` URL is free and works great
- Custom domains are optional but look more professional
- You can change this later if needed

## 📝 Current Vercel Variables Needed

```
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=[new-credentials-you-rotated]
R2_SECRET_ACCESS_KEY=[new-secret-you-rotated]
R2_BUCKET=luxor-auto-sale-images
R2_PUBLIC_URL=https://pub-xxxxx.r2.dev  (optional)
```

