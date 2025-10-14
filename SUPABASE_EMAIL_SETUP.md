# 📧 Supabase Email Configuration Guide

Complete guide to enable real email OTP sending for NTU Food App using Supabase Auth.

---

## 🎯 Overview

Your NTU Food app is now configured to send real OTP emails via Supabase Auth. This guide will walk you through the Supabase dashboard configuration.

**What's Been Implemented:**
- ✅ Supabase Python client integrated
- ✅ Backend OTP routes updated to use Supabase Auth
- ✅ Frontend updated to hide test OTPs in production
- ✅ Environment variables configured
- ✅ Professional email templates created

---

## 📋 Prerequisites

Before you begin, ensure you have:
- ✅ Supabase account with active project
- ✅ Project URL and Anon Key (already in your .env)
- ✅ Access to Supabase Dashboard

Your current Supabase project:
- **URL:** `https://dhmwuixxxsxkyfjdblqu.supabase.co`
- **Region:** AWS ap-south-1 (Mumbai)

---

## 🔧 Step 1: Configure Supabase Auth Settings

### 1.1 Enable Email Authentication

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `dhmwuixxxsxkyfjdblqu`
3. Navigate to: **Authentication → Providers**
4. Find **Email** in the provider list
5. Ensure **Email** is **ENABLED** (toggle switch ON)

### 1.2 Configure Email Settings

Still in **Authentication** section:
1. Click on **Email Templates** in the left sidebar
2. You'll see several email templates:
   - Confirm signup
   - Magic Link
   - Change Email Address
   - Reset Password

---

## 📝 Step 2: Customize OTP Email Template

### 2.1 Navigate to Magic Link Template

1. In **Email Templates**, click on **"Magic Link"**
2. This is the template Supabase uses for OTP emails

### 2.2 Customize the Template

Replace the default template with this NTU Food branded template:

```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #f4f7fa;">
    <table role="presentation" style="width: 100%; border-collapse: collapse; background-color: #f4f7fa; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table role="presentation" style="max-width: 600px; width: 100%; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); overflow: hidden;">

                    <!-- Header -->
                    <tr>
                        <td style="padding: 40px 30px; background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #f97316 100%); text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700;">🍽️ NTU Food</h1>
                            <p style="margin: 10px 0 0 0; color: #ffffff; font-size: 16px;">Smart Food Ordering for NTU</p>
                        </td>
                    </tr>

                    <!-- Content -->
                    <tr>
                        <td style="padding: 40px 30px;">
                            <h2 style="margin: 0 0 20px 0; color: #1e3a8a; font-size: 24px;">Verify Your Email</h2>

                            <p style="margin: 0 0 20px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                                Hello,
                            </p>

                            <p style="margin: 0 0 30px 0; color: #64748b; font-size: 16px; line-height: 1.6;">
                                Thank you for registering with NTU Food. To complete your registration, please use the link below:
                            </p>

                            <!-- CTA Button -->
                            <table role="presentation" style="width: 100%; margin: 30px 0;">
                                <tr>
                                    <td align="center">
                                        <a href="{{ .ConfirmationURL }}" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #1e3a8a, #3b82f6); color: #ffffff; text-decoration: none; border-radius: 8px; font-size: 16px; font-weight: 600;">
                                            Verify Email Address
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 30px 0 20px 0; color: #64748b; font-size: 14px; line-height: 1.6;">
                                Or copy and paste this link into your browser:
                            </p>
                            <p style="margin: 0 0 20px 0; color: #3b82f6; font-size: 12px; word-break: break-all;">
                                {{ .ConfirmationURL }}
                            </p>

                            <!-- Security Notice -->
                            <table role="presentation" style="width: 100%; margin: 30px 0;">
                                <tr>
                                    <td style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 6px;">
                                        <p style="margin: 0; color: #92400e; font-size: 14px;">
                                            <strong>🔒 Security:</strong> If you didn't request this, please ignore this email.
                                        </p>
                                    </td>
                                </tr>
                            </table>

                            <p style="margin: 30px 0 0 0; color: #64748b; font-size: 16px;">
                                Best regards,<br>
                                <strong style="color: #1e3a8a;">The NTU Food Team</strong>
                            </p>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px; background-color: #f8fafc; text-align: center;">
                            <p style="margin: 0 0 10px 0; color: #94a3b8; font-size: 14px;">
                                © 2025 NTU Food - Nanyang Technological University
                            </p>
                            <p style="margin: 0; color: #94a3b8; font-size: 12px;">
                                This is an automated email. Please do not reply.
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
```

### 2.3 Configure Template Variables

In the template settings, you can also customize:
- **Subject Line:** `Verify your email for NTU Food`
- **From Name:** `NTU Food`
- **From Email:** Your verified sender email

### 2.4 Save the Template

Click **"Save"** at the bottom of the page.

---

## ⚙️ Step 3: Configure Email Service Provider

Supabase needs an email service to send emails. You have two options:

### Option A: Use Supabase's Default Email Service (Development)

**Good for:** Testing and development

Supabase provides a default email service for development:
- ✅ No configuration needed
- ⚠️ Limited to 4 emails per hour
- ⚠️ May end up in spam folder
- 📧 Emails sent from `noreply@mail.supabase.io`

**This is already enabled by default!**

### Option B: Use Custom SMTP Provider (Production - Recommended)

**Good for:** Production deployments

Configure a custom SMTP provider for better deliverability:

1. Go to **Project Settings → Auth → SMTP Settings**
2. Enable **"Enable Custom SMTP"**
3. Configure your SMTP provider:

#### Recommended Providers:

**1. Resend (Recommended for NTU)**
- Website: https://resend.com
- Free tier: 100 emails/day, 3,000/month
- Excellent deliverability
- Easy setup

**Configuration:**
```
SMTP Host: smtp.resend.com
SMTP Port: 587
Username: resend
Password: [Your Resend API Key]
Sender Email: noreply@your-domain.com
Sender Name: NTU Food
```

**2. SendGrid**
- Website: https://sendgrid.com
- Free tier: 100 emails/day
- Good for transactional emails

**Configuration:**
```
SMTP Host: smtp.sendgrid.net
SMTP Port: 587
Username: apikey
Password: [Your SendGrid API Key]
Sender Email: noreply@your-domain.com
```

**3. Amazon SES**
- Website: https://aws.amazon.com/ses/
- Very cheap (€0.10 per 1,000 emails)
- Best for high volume

**Configuration:**
```
SMTP Host: email-smtp.[region].amazonaws.com
SMTP Port: 587
Username: [Your SES SMTP Username]
Password: [Your SES SMTP Password]
```

---

## 🔐 Step 4: Configure Email Auth Settings

### 4.1 Set Email Confirmation

1. Navigate to: **Authentication → Settings**
2. Find **"Email Confirmations"** section
3. Configure:
   - ✅ **Enable email confirmations:** ON
   - **Confirmation URL:** `http://localhost:5173/verify-email` (development)
   - For production: `https://your-domain.com/verify-email`

### 4.2 Set Rate Limiting

To prevent abuse:
1. In **Authentication → Settings**
2. Find **"Rate Limiting"** section
3. Configure:
   - **OTP expiry:** 600 seconds (10 minutes) ✅ Already optimal
   - **Max OTP requests:** 3 per hour (recommended)

---

## 🧪 Step 5: Test Email Delivery

### 5.1 Enable Production Mode

Update your `.env` file:

```bash
# Change from:
EMAIL_TESTING_MODE=true

# To:
EMAIL_TESTING_MODE=false
```

### 5.2 Restart Backend Server

```bash
# Stop the backend (Ctrl+C in the backend terminal)
# Then restart:
cd backend
python app/main.py
```

Or if using uvicorn:
```bash
uvicorn app.main:app --reload
```

### 5.3 Test Registration

1. Open your app: `http://localhost:5173/register`
2. Fill in registration form with a REAL email you can access
3. Submit the form
4. Check your email inbox (and spam folder!)
5. You should receive the OTP email

### 5.4 Verify OTP

1. Copy the OTP from your email
2. Enter it in the verification form
3. Complete registration

---

## 🔍 Step 6: Monitor and Debug

### 6.1 View Email Logs

To see if emails are being sent:
1. Go to: **Authentication → Logs**
2. Filter by: **"Email sent"**
3. Check for any errors

### 6.2 Check Backend Logs

Monitor your backend terminal for:
```
INFO: OTP queued for sending via Supabase to [email]
```

### 6.3 Common Issues

**Issue: Emails not arriving**
- ✅ Check spam folder
- ✅ Verify SMTP settings in Supabase
- ✅ Check Supabase Auth logs for errors
- ✅ Verify `EMAIL_TESTING_MODE=false` in .env
- ✅ Ensure backend server restarted after .env changes

**Issue: Emails in spam**
- ✅ Use custom SMTP provider (Option B above)
- ✅ Configure SPF/DKIM records for your domain
- ✅ Use a verified sender email

**Issue: "Rate limit exceeded"**
- ⏱️ Wait 1 hour before retrying
- 🔧 Adjust rate limits in Supabase Auth settings

---

## 📧 Step 7: Customize Email Content (Advanced)

### 7.1 Add Logo to Email

1. Upload your NTU Food logo to Supabase Storage:
   - Go to **Storage → Create Bucket → "public"**
   - Upload logo image
   - Copy public URL

2. Add to email template:
```html
<img src="YOUR_LOGO_URL" alt="NTU Food" style="max-width: 120px; margin-bottom: 20px;">
```

### 7.2 Personalize Email Content

You can access user metadata in templates:
- `{{ .Email }}` - User's email
- `{{ .ConfirmationURL }}` - Verification link
- `{{ .Token }}` - OTP token
- `{{ .SiteURL }}` - Your app URL

---

## 🚀 Step 8: Production Deployment

When deploying to production:

### 8.1 Update Environment Variables

```bash
# Production .env
DATABASE_URL=postgresql://...your-supabase-db-url...
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
EMAIL_TESTING_MODE=false
USE_SUPABASE_EMAIL=true
FRONTEND_URL=https://your-production-domain.com
```

### 8.2 Update Supabase Redirect URLs

1. Go to **Authentication → URL Configuration**
2. Add production URLs to **"Redirect URLs"**:
   ```
   https://your-domain.com/verify-email
   https://your-domain.com/*
   ```

### 8.3 Configure Domain Email

For professional emails:
1. Get a custom domain (e.g., `ntufood.com`)
2. Configure DNS records:
   - SPF record
   - DKIM record
   - DMARC record
3. Use custom sender email: `noreply@ntufood.com`

---

## ✅ Final Checklist

Before going live, verify:

- [ ] Supabase Auth Email provider is enabled
- [ ] Email template is customized with NTU Food branding
- [ ] SMTP provider is configured (for production)
- [ ] Email confirmation is enabled
- [ ] Rate limiting is configured
- [ ] `EMAIL_TESTING_MODE=false` in .env
- [ ] `USE_SUPABASE_EMAIL=true` in .env
- [ ] Backend server restarted
- [ ] Test email received successfully
- [ ] OTP verification works
- [ ] Production URLs configured in Supabase
- [ ] Email deliverability tested (check spam folder)

---

## 📊 Expected Results

After completing this setup:

### During Registration:
1. User fills registration form
2. Backend generates OTP
3. Supabase Auth sends email
4. User receives professional NTU Food branded email
5. User enters OTP
6. Account is created
7. Welcome email sent (optional)

### User Experience:
- ✨ Professional branded emails
- 📧 Reliable email delivery
- 🔒 Secure OTP verification
- ⚡ Fast email sending (< 5 seconds)
- 📱 Mobile-friendly email design

---

## 🆘 Troubleshooting Guide

### Problem: Backend error "SUPABASE_URL and SUPABASE_KEY must be set"

**Solution:**
```bash
# Verify .env file has these variables
SUPABASE_URL=https://dhmwuixxxsxkyfjdblqu.supabase.co
SUPABASE_KEY=eyJhbGci...
```

### Problem: "Failed to send email via Supabase"

**Solution:**
1. Check Supabase Auth logs
2. Verify SMTP configuration
3. Test with Supabase default email first
4. Check API key permissions

### Problem: OTP emails are slow

**Solution:**
- Switch to custom SMTP provider (Resend, SendGrid)
- Check your network connection
- Verify Supabase project region (ap-south-1 for Asia)

---

## 🔗 Useful Links

- **Supabase Dashboard:** https://supabase.com/dashboard
- **Supabase Auth Docs:** https://supabase.com/docs/guides/auth
- **Email Templates Guide:** https://supabase.com/docs/guides/auth/email-templates
- **SMTP Configuration:** https://supabase.com/docs/guides/auth/auth-smtp

---

## 💡 Tips for Success

1. **Start with testing mode** - Test locally with `EMAIL_TESTING_MODE=true` first
2. **Use real emails** - Test with actual email addresses you can access
3. **Check spam folders** - First emails often go to spam
4. **Monitor logs** - Watch both Supabase and backend logs
5. **Rate limits** - Don't test too frequently (respect 1 minute cooldown)
6. **Custom SMTP** - For production, always use a reliable SMTP provider
7. **Email warmup** - If using new domain, warm up email sending gradually

---

## 🎉 Success!

Once configured, your NTU Food app will:
- ✅ Send professional OTP emails via Supabase
- ✅ Hide test OTPs in production
- ✅ Provide excellent user experience
- ✅ Scale to handle many users
- ✅ Maintain security with OTP verification

Happy coding! 🚀
