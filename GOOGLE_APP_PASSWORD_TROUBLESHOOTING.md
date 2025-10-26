# Troubleshooting: App Passwords Not Showing in Google Account

If you enabled 2-Step Verification but don't see the "App Passwords" option, follow these steps.

## Why App Passwords Might Not Appear

1. **Account verification not complete** - Google may need time to finalize security settings
2. **Additional verification required** - Google may need to verify your identity first
3. **Using a Workspace account** - Some Workspace accounts require admin approval
4. **Browser/cache issues** - Try a different browser or clear cache

## Step-by-Step Fix

### Option 1: Wait and Try Again

1. Log out of your Google account completely
2. Wait **15-20 minutes** after enabling 2-Step Verification
3. Log back in and navigate to:
   - **myaccount.google.com**
   - **Security** → **2-Step Verification**
   - Look for **App Passwords** at the bottom

### Option 2: Complete Additional Verification

Sometimes Google requires extra verification:

1. In your Google Account Security page, look for any **"Verify account"** prompts
2. Complete the verification process (may involve phone number, backup email, etc.)
3. Return to **Security** → **2-Step Verification**
4. **App Passwords** should now appear

### Option 3: Direct Link to App Passwords

Try accessing App Passwords directly:
- Go to: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)

### Option 4: Use "Less Secure App Access" (Older Method)

If App Passwords still don't appear and you have an older Google account:

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Search for "Less secure app access" in the search bar
3. Enable it temporarily
4. Use your regular Gmail password (not recommended but may work)

⚠️ **Note**: This method is less secure and Google is phasing it out. Prefer App Passwords when possible.

### Option 5: Generate Password via Mobile App

If you have the Google app on your phone:

1. Open the Google app
2. Tap your profile picture → **Manage your Google Account**
3. Go to **Security** → **2-Step Verification**
4. Tap **App Passwords**
5. Select **Mail** and **Other (Custom name)**
6. Enter "Luxor Auto Sales Website"
7. Copy the 16-character password

## For Workspace/Organizational Accounts

If you're using a Google Workspace account (email@company.com):

1. App Passwords may be disabled by your administrator
2. Contact your IT admin to enable App Passwords
3. Or request access to generate app-specific passwords

## Alternative: Use a Different Email Provider

If you continue having issues with Google App Passwords:

### Option A: Use SendGrid (Free for 100 emails/day)
- Sign up at [SendGrid.com](https://sendgrid.com)
- Verify your account
- Get an API key
- Update the email configuration in the codebase

### Option B: Use Mailgun (Free tier available)
- Sign up at [Mailgun.com](https://mailgun.com)
- Verify domain
- Get SMTP credentials
- Update email service configuration

### Option C: Use Your Domain's Email (Host-specific)
- If you have hosting (cPanel, etc.), use your domain's email
- Contact your hosting provider for SMTP settings
- Update the `EMAIL_USER` and email service in the code

## What To Do Right Now

1. **Try the direct link**: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. **If that doesn't work**, wait 20 minutes and try again
3. **Check for verification prompts** in your Google Account Security page
4. **Let me know what you see** - I can guide you based on your specific situation

## Quick Checklist

- [ ] 2-Step Verification is enabled
- [ ] Waited at least 15 minutes after enabling 2FA
- [ ] Checked for any verification prompts
- [ ] Tried the direct App Passwords link
- [ ] Cleared browser cache/cookies
- [ ] Tried a different browser
- [ ] Checked if account is a personal account (not Workspace with restrictions)

Let me know what happens when you try the direct link!
