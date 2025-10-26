# Vercel Environment Variables Checklist

Add ALL of these in Vercel: Settings → Environment Variables → Add Environment Variables

## Database (CRITICAL)
```
DATABASE_URL=postgresql://postgres.turiynixgwejighknptw:l.UXOR2025AUTO@db.turiynixgwejighknptw.supabase.co:5432/postgres
```

## Authentication
```
JWT_SECRET=6b3ebd31185d3c41db006b8e79e18056353466c4ffab2a9a69f9959c703f0a13
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=owner@luxorautosale.com
ADMIN_PASSWORD=L.uxor2@25
```

## Cloudflare R2 (Image Storage)
```
R2_ACCOUNT_ID=b8b4f26e4b7e2e01428cfb560cb0410d
R2_ACCESS_KEY_ID=94184cc8c979d40f349e7ad35654bfc1
R2_SECRET_ACCESS_KEY=526beedc9383ba073b98a2dee589445880c055c23035dd79e053eccb5c4f78c0
R2_BUCKET=luxor-auto-sale-images
R2_PUBLIC_URL=https://pub-3cba356b1f804de7a4236ec05edff5ee.r2.dev
```

## Email (Optional but recommended)
```
EMAIL_USER=shabir@nextscaledigital.com
EMAIL_APP_PASSWORD=unwbrugmdtxutcin
```

## App Settings
```
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://luxor-auto-sale-website.vercel.app
```

## Rate Limiting
```
RATE_LIMIT_MAX_REQUESTS=100
RATE_LIMIT_WINDOW_MS=900000
```

## After Adding Variables:
1. Save all variables
2. Redeploy the site (Deployments → Redeploy)
3. Wait for build to complete
4. Test the site
