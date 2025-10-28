# 🚀 Deploy Now - 100% FREE

## Deploy in 20 Minutes - No Credit Card Required!

**Cost: $0/month forever** using:
- Render.com (Backend)
- Vercel (Frontend)
- Supabase (Database)

---

## ✅ Your App is Ready!

All deployment files have been configured:
- ✅ `render.yaml` - Render.com configuration
- ✅ Backend optimized for Render + Supabase
- ✅ Frontend configured for Vercel
- ✅ Environment variables documented
- ✅ Production build working

---

## 🎯 Quick Deploy Steps

### 1️⃣ Set Up Supabase Database (5 min)

**Create Database:**
1. Go to https://supabase.com (free, no credit card)
2. Sign up → **New Project**
3. Name: `ntu-food-db`
4. Password: **Choose strong password & save it!**
5. Region: Southeast Asia (or closest)
6. Wait 2-3 min for setup

**Get Connection String:**
1. Settings → Database → Connection string
2. Select **"URI"** tab
3. Copy connection string:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```
4. Replace `[YOUR-PASSWORD]` with your actual password
5. **Save this!** You'll need it for Render

---

### 2️⃣ Push to GitHub (3 min)

```bash
# If not already done:
git add .
git commit -m "Ready for Render deployment"
git push origin main

# If no GitHub repo yet:
# 1. Create repo on GitHub: https://github.com/new
# 2. Name it: ntu-food
# 3. Run:
git remote add origin https://github.com/YOUR_USERNAME/ntu-food.git
git branch -M main
git push -u origin main
```

---

### 3️⃣ Deploy Backend to Render (7 min)

**Create Account:**
1. Go to https://render.com
2. **"Get Started for Free"** (no credit card!)
3. Sign up with GitHub

**Deploy Service:**
1. **New +** → **Web Service**
2. Connect GitHub → Select `ntu-food` repo
3. Configure:
   - Name: `ntu-food-backend`
   - Plan: **FREE**
   - Build: `pip install -r backend/requirements.txt`
   - Start: `cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT`

**Set Environment Variables:**
Click **Advanced** → Add these variables:

```bash
# Database (from Supabase Step 1)
DATABASE_URL=postgresql://postgres:YourPass@db.xxx.supabase.co:5432/postgres

# Security (generate: openssl rand -hex 32)
SECRET_KEY=<paste generated key>

# Environment
ENVIRONMENT=production
EMAIL_TESTING_MODE=false

# Email (Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-gmail@gmail.com
SMTP_PASSWORD=<Gmail App Password - see below>
SMTP_FROM_NAME=NTU Food

# CORS (temporary - update after Vercel)
CORS_ORIGINS=http://localhost:5173
```

**Get Gmail App Password:**
1. https://myaccount.google.com/apppasswords
2. App: Mail | Device: Other ("NTU Food")
3. Generate → Copy 16-char password
4. Use as `SMTP_PASSWORD` (remove spaces)

**Deploy:**
- Click **"Create Web Service"**
- Wait 5-7 min
- Copy your URL: `https://ntu-food-backend.onrender.com`
- Test: Visit `/health` - should return `{"status":"healthy"}`

---

### 4️⃣ Deploy Frontend to Vercel (5 min)

**Create Account:**
1. Go to https://vercel.com
2. Sign up with GitHub (free, no credit card!)

**Deploy:**
1. **Add New** → **Project**
2. Import `ntu-food` repository
3. Configure:
   - Framework: Vite (auto-detected)
   - **Root Directory:** `frontend` ⚠️ Important!
   - Build: `npm run build`
   - Output: `dist`

**Add Environment Variable:**
1. Before deploying, add:
   - Name: `VITE_API_URL`
   - Value: `https://ntu-food-backend.onrender.com` (your Render URL)
   - Environment: All (Production, Preview, Development)

2. Click **Deploy**
3. Wait 2-3 min
4. Copy your Vercel URL: `https://ntu-food.vercel.app`

---

### 5️⃣ Update CORS (2 min)

**Update Render:**
1. Render Dashboard → `ntu-food-backend`
2. Environment → Find `CORS_ORIGINS`
3. Edit value:
   ```
   https://ntu-food.vercel.app,https://ntu-food-*.vercel.app,http://localhost:5173
   ```
4. Save → Wait 1-2 min for auto-redeploy

---

### 6️⃣ Test Your App! (3 min)

**Backend:**
- Health: `https://your-backend.onrender.com/health`
- Docs: `https://your-backend.onrender.com/docs`

**Frontend:**
1. Visit your Vercel URL
2. Register with NTU email
3. Check Gmail for OTP
4. Login and test ordering!

**Create Admin:**
Visit: `https://your-backend.onrender.com/api/admin/seed-admin`

Login with:
- Email: `admin@ntu.edu.sg`
- Password: `admin123`
- ⚠️ Change password immediately!

---

## 📋 Environment Variables Checklist

### Render Backend
```bash
✅ DATABASE_URL          # From Supabase
✅ SECRET_KEY            # openssl rand -hex 32
✅ ENVIRONMENT=production
✅ EMAIL_TESTING_MODE=false
✅ SMTP_EMAIL            # Your Gmail
✅ SMTP_PASSWORD         # Gmail App Password
✅ SMTP_HOST=smtp.gmail.com
✅ SMTP_PORT=587
✅ CORS_ORIGINS          # Your Vercel URL
```

### Vercel Frontend
```bash
✅ VITE_API_URL          # Your Render backend URL
```

---

## ⚡ Important Notes

### Free Tier Sleep Mode (Render)
- Service sleeps after **15 min** of inactivity
- Wakes in **~30 seconds** on first request
- Perfect for demos and MVPs!

**Keep Awake (Optional):**
- Use https://cron-job.org (free)
- Ping `/health` every 14 minutes

### Free Tier Limits
- **Render:** 750 hours/month (enough for 24/7)
- **Supabase:** 500 MB database, 50K requests/month
- **Vercel:** 100 GB bandwidth
- **Perfect for:** Demos, MVPs, student projects

---

## 🐛 Quick Troubleshooting

**Backend won't deploy:**
- Check Render logs
- Verify `render.yaml` exists in repo root
- Ensure all env vars are set

**Database errors:**
- Verify Supabase connection string
- Check password (no special chars that need escaping)

**Email OTP not working:**
- Use Gmail **App Password** (not regular password)
- Set `EMAIL_TESTING_MODE=false`

**CORS errors:**
- Add Vercel URL to `CORS_ORIGINS` in Render
- Include `*.vercel.app` for preview deployments
- Wait for Render auto-redeploy

**Frontend build fails:**
- Set Root Directory to `frontend` in Vercel
- Verify `VITE_API_URL` is set

---

## 📚 Full Documentation

For detailed instructions: **Read DEPLOYMENT_GUIDE.md**

---

## 🎉 You're All Set!

Your complete food ordering system is now live at:
- **Frontend:** https://your-app.vercel.app
- **Backend:** https://your-backend.onrender.com
- **Database:** Supabase PostgreSQL

**Total Cost: $0/month** 🎊

Share your Vercel URL and start taking orders!

---

## 🔑 Generate Commands

**SECRET_KEY:**
```bash
openssl rand -hex 32
```

**Gmail App Password:**
https://myaccount.google.com/apppasswords

---

## Next Steps

1. Change admin password
2. Seed test stalls and menu items
3. Invite stall owners
4. Start taking orders!

**Optional:**
- Set up custom domain (free on both platforms)
- Configure cron job to keep Render awake
- Monitor logs in Render and Vercel dashboards

---

**Questions?** Check DEPLOYMENT_GUIDE.md for comprehensive troubleshooting!
