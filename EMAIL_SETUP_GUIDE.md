# 📧 Email Notifications Setup Guide

## ✅ **Email Notifications Are Now Configured!**

Your website now sends email notifications whenever someone submits a form. Here's how to set it up:

## 🔧 **Gmail Setup (Required)**

### **Step 1: Enable 2-Factor Authentication**
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** if not already enabled
3. This is required to generate App Passwords

### **Step 2: Generate App Password**
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click **2-Step Verification** → **App passwords**
3. Select **Mail** and **Other (Custom name)**
4. Enter "Luxor Auto Sales Website"
5. Copy the **16-character password** (e.g., `abcd efgh ijkl mnop`)

### **Step 3: Update Environment Variables**
Add these to your `.env` file:

```env
# Email Notifications
EMAIL_USER="your-email@gmail.com"
EMAIL_APP_PASSWORD="your-16-character-app-password"
ADMIN_EMAIL="owner@luxorautosale.com"
```

**Replace:**
- `your-email@gmail.com` with your Gmail address
- `your-16-character-app-password` with the App Password from Step 2
- `owner@luxorautosale.com` with your business email

### **Step 4: Restart Your Server**
```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

## 📧 **What You'll Receive**

### **Contact Form Notifications:**
- **Subject:** "New Contact Form Submission from [Name]"
- **Includes:** Name, email, phone, message
- **Action:** Contact the customer within 24 hours

### **Financing Application Notifications:**
- **Subject:** "New Financing Application from [Name]"
- **Includes:** Full name, email, phone, vehicle interest
- **Action:** Contact applicant within 24 hours

### **Trade-In Request Notifications:**
- **Subject:** "New Trade-In Appraisal Request - [Vehicle]"
- **Includes:** Vehicle details, mileage, condition, contact email
- **Action:** Send appraisal offer within 24 hours

## 🧪 **Testing Email Notifications**

### **Test All Forms:**
1. **Contact Form:** Fill out the "Get In Touch" form
2. **Financing Form:** Fill out the "Get Preapproved" form  
3. **Trade-In Form:** Fill out the "Get Your Instant Appraisal" form

### **Check Your Email:**
- You should receive professional HTML emails
- Each email includes all form details
- Emails are sent to your `ADMIN_EMAIL` address

### **Check Server Logs:**
Look for these messages in your terminal:
- ✅ `Contact form email notification sent`
- ✅ `Financing application email notification sent`
- ✅ `Trade-in request email notification sent`

## 🔍 **Troubleshooting**

### **If No Emails Are Received:**

1. **Check Environment Variables:**
   ```bash
   # Make sure these are set in your .env file:
   EMAIL_USER="your-email@gmail.com"
   EMAIL_APP_PASSWORD="your-16-character-app-password"
   ADMIN_EMAIL="your-business-email@domain.com"
   ```

2. **Check Gmail App Password:**
   - Make sure you're using the **App Password**, not your regular password
   - App passwords are 16 characters with spaces: `abcd efgh ijkl mnop`
   - Remove spaces when entering: `abcdefghijklmnop`

3. **Check Gmail Security:**
   - Make sure 2-Factor Authentication is enabled
   - Check if Gmail is blocking the emails (check Spam folder)

4. **Check Server Logs:**
   - Look for error messages in your terminal
   - Check if the email service is failing

### **Common Issues:**

- **"Invalid login"** → Wrong App Password
- **"Less secure app"** → Use App Password, not regular password
- **"Authentication failed"** → Check 2FA is enabled
- **No emails received** → Check Spam folder, verify ADMIN_EMAIL

## 📱 **Email Features**

### **Professional HTML Emails:**
- ✅ Clean, branded design
- ✅ All form details included
- ✅ Action items highlighted
- ✅ Mobile-friendly format

### **Smart Error Handling:**
- ✅ Forms still work if email fails
- ✅ Detailed error logging
- ✅ Graceful fallback

### **Security:**
- ✅ Uses Gmail App Passwords (secure)
- ✅ No plain text passwords
- ✅ Encrypted SMTP connection

## 🚀 **Next Steps**

1. **Set up your Gmail App Password** (5 minutes)
2. **Update your .env file** (2 minutes)
3. **Restart your server** (1 minute)
4. **Test all three forms** (5 minutes)
5. **Check your email** for notifications!

## 📞 **Support**

If you need help setting up email notifications:
1. Check the troubleshooting section above
2. Verify your Gmail App Password is correct
3. Make sure 2-Factor Authentication is enabled
4. Check your server logs for error messages

Your website is now ready to send you instant notifications for all form submissions! 🚗✨
