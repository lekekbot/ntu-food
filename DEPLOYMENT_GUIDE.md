# NTU Food - Production Deployment Guide
## 100% FREE Forever - No Credit Card Required

Deploy your complete food ordering system for **$0/month** using:
- **Render.com** (Backend) - Free forever, no credit card
- **Vercel** (Frontend) - Free forever
- **Supabase** (PostgreSQL Database) - Free forever

Total deployment time: **~20 minutes**

---

## Prerequisites
- GitHub account (free)
- Gmail account (for sending OTP emails)

---

## Part 1: Set Up Supabase Database (5 minutes)

### Step 1: Create Supabase Project
1. Go to **https://supabase.com** and sign up (no credit card required)
2. Click **"New Project"**
3. Fill in:
   - **Name:** ntu-food-db
   - **Database Password:** Choose a strong password (save it!)
   - **Region:** Choose closest to you (e.g., Southeast Asia)
4. Click **"Create new project"**
5. Wait 2-3 minutes for database setup

### Step 2: Get Database Connection String
1. In your Supabase project, go to **Settings** (gear icon)
2. Click **"Database"** in left sidebar
3. Scroll down to **"Connection string"**
4. Select **"URI"** tab
5. Copy the connection string - looks like:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijk.supabase.co:5432/postgres
   ```
6. Replace `[YOUR-PASSWORD]` with your actual database password
7. **Save this connection string** - you'll need it for Render

**Example:**
```
postgresql://postgres:MySecurePass123@db.abcdefghijk.supabase.co:5432/postgres
```

---

## Part 2: Push Code to GitHub (3 minutes)

### If you haven't pushed to GitHub yet:
```bash
# Navigate to your project
cd /Users/ajitesh/Desktop/My\ Projects/NTU_Food/ntu-food

# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Ready for Render.com deployment"

# Create a new repository on GitHub (https://github.com/new)
# Name it: ntu-food
# Don't add README, .gitignore, or license

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/ntu-food.git
git branch -M main
git push -u origin main
```

---

## Part 3: Deploy Backend to Render (7 minutes)

### Step 1: Create Render Account
1. Go to **https://render.com**
2. Click **"Get Started for Free"**
3. Sign up with GitHub (recommended) - **No credit card required!**

### Step 2: Create Web Service
1. Click **"New +"** in top right
2. Select **"Web Service"**
3. Click **"Connect account"** to connect GitHub
4. Find and select your **ntu-food** repository
5. Click **"Connect"**

### Step 3: Configure Service
Render will auto-detect `render.yaml`, but verify these settings:

- **Name:** `ntu-food-backend` (or your choice)
- **Region:** Choose closest to you
- **Branch:** `main`
- **Root Directory:** Leave blank (render.yaml is in root)
- **Runtime:** Python 3
- **Build Command:** `pip install -r backend/requirements.txt`
- **Start Command:** `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- **Plan:** **Free** (select this!)

### Step 4: Set Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**

Add these **required** variables:

```bash
# 1. Database (from Supabase - Part 1)
DATABASE_URL=postgresql://postgres:YourPassword@db.xxx.supabase.co:5432/postgres

# 2. Security (generate new key)
SECRET_KEY=<run command: openssl rand -hex 32>

# 3. Environment
ENVIRONMENT=production

# 4. Email Configuration
EMAIL_TESTING_MODE=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-gmail@gmail.com
SMTP_PASSWORD=<Gmail App Password - see below>
SMTP_FROM_NAME=NTU Food

# 5. CORS (temporary - will update after Vercel deployment)
CORS_ORIGINS=http://localhost:5173

# Other defaults (optional - Render sets these from render.yaml)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
USE_SUPABASE_EMAIL=false
```

### Step 5: Generate Gmail App Password
1. Go to **https://myaccount.google.com/apppasswords**
2. Sign in to your Gmail account
3. App: Select **"Mail"**
4. Device: Select **"Other"** and type **"NTU Food"**
5. Click **"Generate"**
6. Copy the **16-character password** (e.g., `abcd efgh ijkl mnop`)
7. Use this as `SMTP_PASSWORD` in Render (no spaces)

### Step 6: Generate SECRET_KEY
Run this in your terminal:
```bash
openssl rand -hex 32
```
Copy the output and use it as `SECRET_KEY` in Render.

### Step 7: Deploy
1. Click **"Create Web Service"**
2. Render will start building and deploying (5-7 minutes)
3. Watch the logs for progress
4. Wait for **"Your service is live"** message

### Step 8: Get Your Backend URL
1. Once deployed, copy your Render URL from the top of the page
2. It will look like: `https://ntu-food-backend.onrender.com`
3. **Test it:** Visit `https://ntu-food-backend.onrender.com/health`
   - Should return: `{"status":"healthy"}`
4. **Save this URL** - you'll need it for Vercel

---

## Part 4: Deploy Frontend to Vercel (5 minutes)

### Step 1: Create Vercel Account
1. Go to **https://vercel.com**
2. Click **"Sign Up"**
3. Sign up with GitHub (recommended) - **No credit card required!**

### Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Import your **ntu-food** repository
3. Click **"Import"**

### Step 3: Configure Build Settings
- **Framework Preset:** Vite (auto-detected)
- **Root Directory:** Click **"Edit"** → Enter `frontend`
- **Build Command:** `npm run build` (auto-detected)
- **Output Directory:** `dist` (auto-detected)
- **Install Command:** `npm install` (auto-detected)

### Step 4: Add Environment Variable
Before deploying, add your backend URL:

1. Click **"Environment Variables"**
2. Add:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://ntu-food-backend.onrender.com` (your Render URL from Part 3)
   - **Environment:** Select all (Production, Preview, Development)
3. Click **"Add"**

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes for build and deployment
3. Once complete, Vercel will show your live URL
4. Click the URL to visit your app!

### Step 6: Get Your Frontend URL
1. Copy your Vercel URL (e.g., `https://ntu-food.vercel.app`)
2. **Save this URL** - you need it for CORS update

---

## Part 5: Update CORS Settings (2 minutes)

Now that you have your Vercel URL, update the backend CORS:

### Update in Render:
1. Go back to **Render Dashboard**
2. Click on your **ntu-food-backend** service
3. Click **"Environment"** in left sidebar
4. Find `CORS_ORIGINS` variable
5. Click **"Edit"**
6. Update value to include your Vercel URL:
   ```
   https://ntu-food.vercel.app,https://ntu-food-*.vercel.app,http://localhost:5173
   ```
   *(Include the `*` version for Vercel preview deployments)*
7. Click **"Save Changes"**

### Also update these (optional but recommended):
- `FRONTEND_URL`: `https://ntu-food.vercel.app`
- `APP_URL`: `https://ntu-food.vercel.app`

### Render will auto-redeploy (1-2 minutes)

---

## Part 6: Verify Deployment (3 minutes)

### Test Backend
1. **Health Check:**
   - Visit: `https://your-backend.onrender.com/health`
   - Should return: `{"status":"healthy"}`

2. **API Documentation:**
   - Visit: `https://your-backend.onrender.com/docs`
   - Should show interactive API docs

### Test Frontend
1. Visit your Vercel URL
2. Try to **register** with your NTU email (`yourname@e.ntu.edu.sg`)
3. Check your **Gmail inbox** for OTP code
4. Enter OTP and complete registration
5. Try **logging in**
6. Browse **stalls** and **menu items**
7. Place a **test order**

### Create Admin Account
Visit this URL in your browser:
```
https://your-backend.onrender.com/api/admin/seed-admin
```

Or use curl:
```bash
curl -X POST https://your-backend.onrender.com/api/admin/seed-admin
```

**Default Admin Login:**
- Email: `admin@ntu.edu.sg`
- Password: `admin123`
- **⚠️ IMPORTANT: Change this password immediately!**

---

## Understanding Free Tier Limitations

### Render Free Tier Sleep Mode
- **Sleep After:** 15 minutes of inactivity
- **Wake Up Time:** ~30 seconds on first request
- **Perfect for:** Demos, MVPs, development, personal projects
- **User Experience:** First visitor after sleep sees loading, subsequent visits are instant

### How to Keep Service Awake (Optional)
If you want to avoid cold starts:

**Option 1: Cron Job Pinging (Free)**
1. Go to **https://cron-job.org** (free, no signup needed)
2. Create a new cron job:
   - **URL:** `https://your-backend.onrender.com/health`
   - **Interval:** Every 14 minutes
   - **Method:** GET
3. This keeps your service awake during active hours

**Option 2: UptimeRobot (Free)**
1. Go to **https://uptimerobot.com** (free)
2. Add new monitor:
   - **URL:** `https://your-backend.onrender.com/health`
   - **Interval:** 5 minutes (free tier allows)

**Note:** Render free tier has 750 hours/month free (enough for 24/7 if needed)

### Database Limits (Supabase Free Tier)
- **Database Size:** 500 MB
- **API Requests:** 50,000/month
- **Authentication:** Unlimited
- **File Storage:** 1 GB

This is more than enough for a demo/MVP application with hundreds of users!

---

## Post-Deployment Checklist

- [ ] Backend deployed to Render
- [ ] Supabase PostgreSQL connected
- [ ] All environment variables set in Render
- [ ] Gmail App Password configured
- [ ] Backend health check returns 200
- [ ] Frontend deployed to Vercel
- [ ] `VITE_API_URL` set in Vercel
- [ ] CORS origins updated with Vercel URL
- [ ] Registration with OTP email works
- [ ] Login works
- [ ] Can browse stalls and menu
- [ ] Can place an order
- [ ] Admin account created
- [ ] Admin panel accessible
- [ ] Stall owner dashboard works

---

## Troubleshooting

### Backend Issues

**Deployment fails on Render:**
- Check build logs in Render dashboard
- Verify `requirements.txt` has all dependencies
- Ensure `render.yaml` is in repository root

**Database connection errors:**
- Verify `DATABASE_URL` is correctly copied from Supabase
- Check password has no special characters that need escaping
- Ensure Supabase project is running (green status)

**Email OTP not sending:**
- Verify Gmail App Password (16 chars, no spaces)
- Check `EMAIL_TESTING_MODE=false` in Render
- View Render logs for email errors
- Ensure "Less secure app access" is NOT needed (App Passwords bypass this)

### Frontend Issues

**Build fails on Vercel:**
- Verify Root Directory is set to `frontend`
- Check `VITE_API_URL` is set in Environment Variables
- Review build logs in Vercel dashboard

**CORS errors in browser:**
- Ensure Vercel URL is in `CORS_ORIGINS` on Render
- Include both production URL and preview URL pattern (`*.vercel.app`)
- Wait for Render auto-redeploy after changing CORS

**App loads but shows errors:**
- Check browser console for errors
- Verify `VITE_API_URL` points to correct Render backend
- Test backend health endpoint directly

### Performance Issues

**App is slow on first load:**
- This is normal! Render free tier sleeps after 15 min
- Service wakes in ~30 seconds
- Consider using cron-job.org to keep awake (see above)

**Subsequent loads also slow:**
- Check Render logs for errors
- Verify database connection is stable
- Monitor Supabase database performance

---

## Environment Variables Quick Reference

### Render Backend (Required)
```bash
DATABASE_URL=postgresql://postgres:password@db.xxx.supabase.co:5432/postgres
SECRET_KEY=<openssl rand -hex 32>
ENVIRONMENT=production
CORS_ORIGINS=https://your-app.vercel.app,https://your-app-*.vercel.app
SMTP_EMAIL=your-gmail@gmail.com
SMTP_PASSWORD=<gmail-app-password>
EMAIL_TESTING_MODE=false
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_FROM_NAME=NTU Food
FRONTEND_URL=https://your-app.vercel.app
APP_URL=https://your-app.vercel.app
```

### Vercel Frontend (Required)
```bash
VITE_API_URL=https://your-backend.onrender.com
```

---

## Continuous Deployment

Both platforms auto-deploy when you push to GitHub:

```bash
# Make changes to your code
git add .
git commit -m "Update feature"
git push origin main
```

- **Render:** Automatically rebuilds and deploys backend
- **Vercel:** Automatically rebuilds and deploys frontend

---

## Custom Domains (Optional)

### Add Custom Domain to Vercel (Free)
1. Go to your project in Vercel
2. Click **"Settings"** → **"Domains"**
3. Add your domain
4. Update DNS records as instructed

### Add Custom Domain to Render (Free)
1. Go to your service in Render
2. Click **"Settings"** → **"Custom Domain"**
3. Add your domain
4. Update DNS records as instructed

---

## Monitoring & Logs

### Render Logs
1. Go to your service dashboard
2. Click **"Logs"** tab
3. View real-time logs
4. Filter by error, warn, info

### Vercel Logs
1. Go to your project dashboard
2. Click **"Deployments"**
3. Click on a deployment
4. View build logs and function logs

---

## Upgrading (When You're Ready)

When your app grows and you need more:

### Render Paid Plans (Starting $7/month)
- No sleep mode
- Faster builds
- More memory/CPU
- Custom domains with SSL

### Supabase Paid Plans (Starting $25/month)
- 8 GB database
- 5M API requests/month
- Better performance

### Vercel Paid Plans (Starting $20/month)
- More bandwidth
- Advanced analytics
- Team collaboration

**For now:** Free tier is perfect for MVP and demo! 🎉

---

## Support & Resources

- **Render Docs:** https://render.com/docs
- **Vercel Docs:** https://vercel.com/docs
- **Supabase Docs:** https://supabase.com/docs
- **FastAPI Docs:** https://fastapi.tiangolo.com
- **Vite Docs:** https://vitejs.dev

---

## Cost Breakdown

| Service | Free Tier | Cost |
|---------|-----------|------|
| Render.com (Backend) | 750 hrs/month, sleeps after 15 min | **$0** |
| Vercel (Frontend) | 100 GB bandwidth, unlimited sites | **$0** |
| Supabase (Database) | 500 MB, 50K requests/month | **$0** |
| **Total** | | **$0/month** |

---

**🎉 Congratulations!**

Your NTU Food ordering system is now live and accessible worldwide - completely free!

Share your Vercel URL with users and start taking orders! 🍜🍔🍕
