# Vercel Deployment Guide for Luxor Auto Sales

## Environment Variables Required

Add these environment variables in your Vercel project settings:

### Database
```
DATABASE_URL=postgresql://user:password@host:5432/dbname
```

### Authentication
```
JWT_SECRET=your-secure-random-string-min-32-characters
JWT_EXPIRES_IN=7d
ADMIN_EMAIL=your@email.com
ADMIN_PASSWORD=your-secure-password
```

### Email Notifications (Gmail)
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_TO=recipient@email.com
```

### Image Storage - Cloudflare R2 (Recommended)
```
R2_ACCOUNT_ID=your-account-id
R2_ACCESS_KEY_ID=your-access-key
R2_SECRET_ACCESS_KEY=your-secret-key
R2_BUCKET=luxor-auto-sale-images
R2_PUBLIC_URL=https://your-public-url.com
```

### Image Storage - AWS S3 (Alternative)
```
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=luxor-auto-sale-images
```

## Deployment Steps

1. **Push code to GitHub** (if not already done)
2. **Import project in Vercel**
   - Go to https://vercel.com
   - Click "Add New Project"
   - Import from GitHub
3. **Add Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add all variables listed above
4. **Configure Build Settings**
   - Framework Preset: **Next.js**
   - Root Directory: **./** (leave empty)
   - Build Command: **npm run build**
   - Output Directory: **.next**
5. **Deploy!**

## Troubleshooting

### Image Upload Issues

If you get errors like "Credential access key has length 20, should be 32":

1. Check that ALL R2 environment variables are set in Vercel
2. Verify the variable names are EXACTLY as listed above (case-sensitive)
3. Make sure there are no extra spaces in the values
4. Redeploy after adding environment variables

### Environment Variables Not Loading

Vercel environment variables are loaded at build time. After adding new variables:
1. Go to Deployments tab
2. Click the three dots on the latest deployment
3. Click "Redeploy"

### Contact Form Error

The contact form was fixed in commit `1ab896f`. Make sure your deployment is up to date.

## Post-Deployment

1. Test the contact form
2. Test image uploads in the admin panel
3. Test all three submission forms (Contact, Financing, Trade-in)
4. Verify email notifications are working

## Need Help?

Check the deployment logs in Vercel Dashboard → Deployments → View Logs
