# 📧 Gmail SMTP Setup Guide for NTU Food App

Complete guide to configure Gmail SMTP for sending real OTP emails in your NTU Food application.

---

## 🎯 Overview

Your NTU Food app now uses **Gmail SMTP** to send professional, branded OTP verification emails. This guide will help you set up Gmail App Passwords for secure email sending.

**Features Implemented:**
- ✅ Gmail SMTP with TLS encryption
- ✅ Professional HTML email templates with NTU Food branding
- ✅ Automatic retry on failure (up to 2 attempts)
- ✅ Rate limiting (max 3 emails per 5 minutes per address)
- ✅ Error handling and logging
- ✅ Plain text fallback for email clients
- ✅ Mobile-responsive email design

---

## 📋 Prerequisites

- Gmail account (any Gmail address)
- 2-Step Verification enabled on your Google account
- Access to Google Account settings

---

## 🔧 Step 1: Enable 2-Step Verification

Gmail App Passwords require 2-Step Verification to be enabled.

### 1.1 Check if 2-Step Verification is Enabled

1. Go to: **https://myaccount.google.com/security**
2. Look for **"2-Step Verification"** section
3. If it says **"On"**, you're good to go! Skip to Step 2.
4. If it says **"Off"**, follow the steps below

### 1.2 Enable 2-Step Verification

1. Click **"2-Step Verification"**
2. Click **"Get Started"**
3. Sign in to your Google account if prompted
4. Follow the on-screen instructions:
   - Enter your phone number
   - Choose how to receive codes (Text or Call)
   - Verify the code sent to your phone
   - Click **"Turn On"**

✅ **2-Step Verification is now enabled!**

---

## 🔐 Step 2: Generate Gmail App Password

### 2.1 Navigate to App Passwords Page

**Direct Link:** https://myaccount.google.com/apppasswords

Or manually:
1. Go to: **https://myaccount.google.com/**
2. Click **"Security"** in the left sidebar
3. Scroll down to **"2-Step Verification"** section
4. Click **"App passwords"**

### 2.2 Create App Password

1. You may be asked to sign in again - enter your Gmail password
2. On the App Passwords page:
   - **App name:** Enter `NTU Food` or `NTU Food OTP Emails`
   - Click **"Create"**

3. **Copy the 16-character password** displayed on screen
   - It will look like: `abcd efgh ijkl mnop` (4 groups of 4 characters)
   - **IMPORTANT:** You won't be able to see this password again!
   - Save it securely

4. Click **"Done"**

✅ **App Password created successfully!**

---

## ⚙️ Step 3: Configure NTU Food Backend

### 3.1 Update `.env` File

1. Open your backend `.env` file:
   ```bash
   cd backend
   nano .env  # or use your favorite editor
   ```

2. Update the Gmail SMTP configuration:
   ```bash
   # Email Configuration
   EMAIL_TESTING_MODE=false  # Set to false to send real emails
   USE_SUPABASE_EMAIL=false  # Use Gmail instead of Supabase

   # Gmail SMTP Configuration
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_EMAIL=your-gmail@gmail.com  # Replace with your Gmail address
   SMTP_PASSWORD=abcd efgh ijkl mnop  # Replace with your 16-character App Password
   SMTP_FROM_NAME=NTU Food
   APP_URL=http://localhost:5173
   ```

3. **Replace** `your-gmail@gmail.com` with your actual Gmail address
4. **Replace** `abcd efgh ijkl mnop` with your actual App Password (include spaces or not - both work)
5. Save the file (Ctrl+O, Enter, Ctrl+X for nano)

### 3.2 Restart Backend Server

```bash
# Stop the current backend server (Ctrl+C)
# Then restart it:
cd backend
python3 -m uvicorn app.main:app --reload
```

---

## 🧪 Step 4: Test Email Sending

### 4.1 Test Registration with Real Email

1. Open your NTU Food app: **http://localhost:5173/register**

2. Fill in the registration form with **a real email you can access**:
   - Name: Your name
   - NTU Email: Use any valid email for testing (doesn't have to be NTU)
   - Student ID: U1234567A
   - Phone: +65 9123 4567
   - Password: Test1234

3. Click **"Send Verification Code"**

4. Watch the backend terminal for logs:
   ```
   ✅ OTP email sent successfully to test@example.com
   ```

5. **Check your email inbox** (and spam folder!)

6. You should receive a professional NTU Food branded email with your OTP

### 4.2 Verify the Email

1. Open the email
2. You should see:
   - NTU Food header with logo
   - Your name
   - 6-digit OTP code in a prominent box
   - Expiry notice (10 minutes)
   - Security notice
   - Professional footer

3. Copy the OTP code

4. Enter it in the verification form

5. Complete registration

✅ **Success! Email OTP is working!**

---

## 🎨 Email Template Features

Your OTP emails now include:

**Design:**
- Responsive design (looks great on mobile and desktop)
- NTU Food gradient header (blue to orange)
- Large, readable OTP code
- Professional typography

**Security:**
- 10-minute expiration notice
- Security warnings about not sharing OTP
- TLS encryption during sending

**Branding:**
- NTU Food logo (🍽️)
- Consistent color scheme
- Professional footer with NTU info

---

## 🔒 Security Best Practices

### Gmail Account Security

1. **Use a dedicated Gmail account** for your app (not your personal email)
2. **Store App Password securely**
   - Never commit to Git
   - Use environment variables only
   - Don't share with others

3. **Rotate App Passwords regularly**
   - Create new App Password every 3-6 months
   - Revoke old ones from: https://myaccount.google.com/apppasswords

4. **Monitor email sending**
   - Check Gmail **"Sent"** folder periodically
   - Watch for suspicious activity

### Application Security

1. **Rate Limiting** (Already implemented ✅)
   - Max 3 emails per 5 minutes per address
   - Prevents spam and abuse

2. **OTP Security** (Already implemented ✅)
   - 10-minute expiration
   - Max 5 verification attempts
   - Secure random generation

3. **SMTP Security** (Already implemented ✅)
   - TLS encryption
   - Secure SSL context
   - Proper error handling

---

## ⚠️ Troubleshooting

### Problem: "SMTP Authentication failed"

**Causes:**
- Wrong Gmail address
- Wrong App Password
- 2-Step Verification not enabled
- App Password revoked

**Solutions:**
1. Double-check Gmail address in `.env`
2. Verify App Password (no typos, include/exclude spaces consistently)
3. Ensure 2-Step Verification is ON
4. Generate a new App Password if needed

---

### Problem: "Connection timeout"

**Causes:**
- Firewall blocking port 587
- Network issues
- Gmail SMTP temporarily unavailable

**Solutions:**
1. Check firewall settings (allow port 587)
2. Try a different network
3. Wait a few minutes and try again

---

### Problem: Emails going to spam

**Causes:**
- New Gmail account
- High sending volume
- Spam filters

**Solutions:**
1. **Warm up** your Gmail account:
   - Send emails slowly at first
   - Wait 24-48 hours between sending batches
   - Gradually increase volume

2. **Ask recipients to**:
   - Mark email as "Not Spam"
   - Add your Gmail to contacts
   - Create filter to inbox

3. **Use a reputable Gmail account**:
   - Older accounts have better reputation
   - Accounts with normal usage history

4. **Consider paid email service** for production:
   - SendGrid, Mailgun, AWS SES
   - Better deliverability
   - Higher sending limits

---

### Problem: "Too many requests" error

**Cause:** Rate limit exceeded (3 emails per 5 minutes)

**Solution:**
- Wait 5 minutes before trying again
- This is intentional to prevent spam
- Rate limits reset automatically

---

### Problem: Backend shows testing mode despite EMAIL_TESTING_MODE=false

**Cause:** `.env` file not loaded properly

**Solutions:**
1. Restart backend server completely
2. Check `.env` file has no typos
3. Verify `.env` is in backend directory
4. Check terminal logs for "Email Service initialized - Testing Mode: False"

---

## 📊 Gmail Sending Limits

**Daily Limits:**
- **Free Gmail:** 500 emails/day
- **Google Workspace:** 2,000 emails/day

**Rate Limits:**
- Approximately 100-150 emails/hour
- Recommended: 1-2 emails/second

**For Production:**
- Consider upgrading to Google Workspace
- Or use dedicated email service (SendGrid, AWS SES)

---

## 🚀 Production Deployment

When deploying to production:

### 1. Environment Variables

Update your production `.env`:
```bash
EMAIL_TESTING_MODE=false
SMTP_EMAIL=your-production-gmail@gmail.com
SMTP_PASSWORD=your-production-app-password
SMTP_FROM_NAME=NTU Food
APP_URL=https://your-production-domain.com
```

### 2. Email Service Recommendations

For production with high volume, consider:

**SendGrid** (Recommended)
- 100 emails/day free
- Easy setup
- Better deliverability
- $14.95/month for 40,000 emails

**AWS SES**
- $0.10 per 1,000 emails
- Very cheap for high volume
- Requires AWS setup
- Best for scale

**Mailgun**
- 5,000 emails/month free
- Good documentation
- Reliable service

### 3. Domain Email

For professional appearance:
1. Get custom domain (e.g., `ntufood.com`)
2. Set up domain email (`noreply@ntufood.com`)
3. Configure SPF, DKIM, DMARC records
4. Use with SendGrid/AWS SES

---

## ✅ Verification Checklist

Before going live:

- [ ] 2-Step Verification enabled on Gmail
- [ ] App Password generated and saved
- [ ] `.env` file updated with Gmail credentials
- [ ] `EMAIL_TESTING_MODE=false` in `.env`
- [ ] Backend server restarted
- [ ] Test email sent successfully
- [ ] OTP received in inbox
- [ ] Email template looks professional
- [ ] OTP verification works
- [ ] Welcome email sent after registration
- [ ] Rate limiting works (try 4 emails quickly)
- [ ] Error handling works (try wrong OTP)

---

## 📧 Email Template Customization

To customize email templates, edit:
```
backend/app/services/email_service.py
```

**Methods to customize:**
- `_create_otp_email_html()` - OTP email HTML
- `_create_otp_email_text()` - OTP email plain text
- `_create_welcome_email_html()` - Welcome email HTML
- `_create_welcome_email_text()` - Welcome email plain text

**What you can change:**
- Colors and gradients
- Logo and branding
- Text content
- Layout and spacing
- Footer information

---

## 🔗 Useful Links

- **Gmail App Passwords:** https://myaccount.google.com/apppasswords
- **Gmail Security Settings:** https://myaccount.google.com/security
- **2-Step Verification:** https://myaccount.google.com/signinoptions/two-step-verification
- **Gmail SMTP Documentation:** https://support.google.com/mail/answer/7126229

---

## 💡 Tips for Success

1. **Start with testing mode** (`EMAIL_TESTING_MODE=true`) to see OTPs on screen
2. **Test with your personal email** first before using with real users
3. **Check spam folders** - first emails often go there
4. **Monitor Gmail Sent folder** to verify emails are being sent
5. **Keep App Password secure** - treat it like a password
6. **Use dedicated Gmail** for production (not your personal email)
7. **Warm up new Gmail accounts** - send slowly at first
8. **Watch backend logs** for email sending confirmations

---

## 🎉 Success Indicators

You'll know it's working when:

✅ Backend logs show: `✅ OTP email sent successfully to...`
✅ Email appears in recipient's inbox (or spam folder)
✅ Email has professional NTU Food branding
✅ OTP code is displayed prominently
✅ Email is mobile-responsive
✅ OTP verification works correctly
✅ Welcome email is sent after registration

---

## 📞 Support

If you encounter issues:

1. Check this guide's **Troubleshooting** section
2. Review backend logs for error messages
3. Verify Gmail account settings
4. Test with different email addresses
5. Check firewall/network settings

---

**Ready to send emails!** 🚀

Follow the steps above to configure Gmail SMTP and start sending professional OTP emails to your NTU Food users.
