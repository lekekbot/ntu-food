# 🚀 NTU Food App - Supabase Migration Guide

Complete step-by-step guide to migrate your NTU Food app from SQLite to Supabase PostgreSQL.

---

## 📋 Prerequisites

Before starting the migration:

- ✅ Supabase account created
- ✅ Supabase project created (Project Ref: `dhmwuixxxsxkyfjdblqu`)
- ✅ Database password set
- ✅ Supabase credentials available

---

## 🎯 Migration Steps

### Step 1: Run SQL Migration Script in Supabase

1. **Open Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard
   - Select your project: `dhmwuixxxsxkyfjdblqu`

2. **Open SQL Editor:**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Run Migration Script:**
   - Open the file: `backend/supabase_migration.sql`
   - Copy the entire contents
   - Paste into Supabase SQL Editor
   - Click "Run" or press `Ctrl+Enter`

4. **Verify Tables Created:**
   - Go to "Table Editor" in Supabase dashboard
   - You should see these tables:
     - ✅ users
     - ✅ stalls
     - ✅ menu_items
     - ✅ orders
     - ✅ order_items
     - ✅ queue_entries
     - ✅ otp_verifications

---

### Step 2: Install PostgreSQL Dependencies

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install new dependencies:**
   ```bash
   pip install psycopg2-binary supabase
   ```

   Or install all requirements:
   ```bash
   pip install -r requirements.txt
   ```

3. **Verify installation:**
   ```bash
   python -c "import psycopg2; print('✅ PostgreSQL driver installed')"
   ```

---

### Step 3: Update Environment Variables

The `.env` file has already been created with your Supabase credentials:

```bash
# Verify .env file exists
cat backend/.env
```

**Expected contents:**
```env
DATABASE_URL=postgresql://postgres:Ajite$h0812@db.dhmwuixxxsxkyfjdblqu.supabase.co:5432/postgres
SUPABASE_URL=https://dhmwuixxxsxkyfjdblqu.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EMAIL_TESTING_MODE=false
```

**Important:** The backend will automatically read from `.env` file. No code changes needed!

---

### Step 4: Restart Backend Server

1. **Stop the current backend server:**
   - Press `Ctrl+C` in the terminal running uvicorn

2. **Restart backend:**
   ```bash
   cd backend
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Check for successful connection:**
   - Look for: `INFO: Started server process`
   - No database errors should appear
   - Check: http://localhost:8000/health (should return `{"status":"healthy"}`)

---

### Step 5: Seed Initial Data

1. **Run the seed script:**
   ```bash
   cd backend
   python seed_supabase.py
   ```

2. **Expected output:**
   ```
   ============================================================
   SEEDING SUPABASE DATABASE
   ============================================================

   📝 Creating admin user...
      ✓ Admin user created

   📝 Creating test student accounts...
      ✓ Created: Test Student (test.student@e.ntu.edu.sg)
      ✓ Created: John Doe (john.doe@e.ntu.edu.sg)
      ✓ Created: Jane Smith (jane.smith@e.ntu.edu.sg)

   📝 Creating food stalls...
      ✓ Created: Western Food Paradise
      ✓ Created: Hainanese Chicken Rice
      ✓ Created: Mala Xiang Guo

   📝 Creating menu items...
      ✓ Created 5 items for Western Food Paradise
      ✓ Created 5 items for Hainanese Chicken Rice
      ✓ Created 5 items for Mala Xiang Guo

   ✅ DATABASE SEEDED SUCCESSFULLY!
   ============================================================
   ```

3. **Verify in Supabase:**
   - Go to Supabase Dashboard → Table Editor
   - Check `users` table: Should have 4 users (1 admin + 3 students)
   - Check `stalls` table: Should have 3 stalls
   - Check `menu_items` table: Should have 15 items

---

### Step 6: Test Database Connection

1. **Test health endpoint:**
   ```bash
   curl http://localhost:8000/health
   ```
   Expected: `{"status":"healthy"}`

2. **Test API docs:**
   - Open: http://localhost:8000/docs
   - Should load FastAPI interactive documentation
   - Try executing any GET endpoint

3. **Test database query:**
   ```bash
   curl http://localhost:8000/api/stalls
   ```
   Should return list of 3 stalls

---

### Step 7: Test Admin Login

1. **Open Admin Panel:**
   ```
   http://localhost:5174/admin/login
   ```

2. **Login with:**
   ```
   Email: admin@ntu.edu.sg
   Password: admin123
   ```

3. **Verify Dashboard:**
   - Should see: 4 users, 3 stalls, 15 menu items
   - All statistics should be populated from Supabase
   - No errors in browser console

---

### Step 8: Test Student Portal

1. **Open Student Portal:**
   ```
   http://localhost:5174/login
   ```

2. **Login with:**
   ```
   Email: test.student@e.ntu.edu.sg
   Password: testpassword123
   ```

3. **Test functionality:**
   - Browse stalls → Should see 3 stalls
   - Click on a stall → Should see menu items
   - Add item to cart → Should work
   - Place order → Should create order in Supabase

4. **Verify in Supabase:**
   - Go to Supabase Dashboard → Table Editor → `orders`
   - Should see the new order
   - Check `order_items` and `queue_entries` tables

---

## 🔧 Supabase Email Configuration (Real OTP)

To send real OTP emails (not testing mode):

### Option 1: Use Supabase Email Service (Recommended)

1. **Enable Email Auth in Supabase:**
   - Dashboard → Authentication → Providers
   - Enable "Email" provider
   - Configure email templates

2. **Update OTP Email Template:**
   - Dashboard → Authentication → Email Templates
   - Select "Magic Link"
   - Update template to show OTP code

3. **Update backend email service:**
   - Edit `backend/app/services/email_service.py`
   - Use Supabase client to send OTP emails

### Option 2: Use Custom SMTP (Gmail/SendGrid)

1. **Update .env file:**
   ```env
   EMAIL_TESTING_MODE=false
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USERNAME=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   SENDER_EMAIL=NTU Food <noreply@ntufood.com>
   ```

2. **For Gmail:**
   - Enable 2FA on your Google account
   - Generate App Password: https://myaccount.google.com/apppasswords
   - Use App Password in SMTP_PASSWORD

3. **Test email sending:**
   - Try registering a new user
   - Should receive real OTP email

---

## 📊 Verify Migration Success

Run these checks to ensure everything is working:

### ✅ Database Connectivity
```bash
# Test connection
curl http://localhost:8000/health

# Expected: {"status":"healthy"}
```

### ✅ Data Populated
```bash
# Check users
curl http://localhost:8000/api/users

# Check stalls
curl http://localhost:8000/api/stalls

# Check menu items
curl http://localhost:8000/api/menu
```

### ✅ Supabase Dashboard
- Go to: https://supabase.com/dashboard/project/dhmwuixxxsxkyfjdblqu
- Table Editor: All tables should have data
- API: Should show generated REST API endpoints
- Authentication: Can enable for future features

### ✅ Application Features
- [ ] Admin can login
- [ ] Admin dashboard shows correct statistics
- [ ] Admin can create/edit/delete stalls
- [ ] Admin can manage menu items
- [ ] Students can login
- [ ] Students can browse stalls
- [ ] Students can place orders
- [ ] Queue system works
- [ ] Order status updates in real-time

---

## 🐛 Troubleshooting

### Issue: "Connection refused" or "Cannot connect to database"

**Solution:**
1. Check Supabase project is not paused (free tier pauses after 1 week inactivity)
2. Verify DATABASE_URL in `.env` is correct
3. Check password has special characters properly escaped
4. Test connection from Supabase dashboard

### Issue: "psycopg2 not found"

**Solution:**
```bash
pip install psycopg2-binary
```

### Issue: "Table does not exist"

**Solution:**
1. Re-run migration script in Supabase SQL Editor
2. Check for errors in SQL execution
3. Verify tables exist in Supabase Table Editor

### Issue: "Authentication failed"

**Solution:**
1. Check password in DATABASE_URL
2. Reset database password in Supabase Dashboard → Settings → Database
3. Update DATABASE_URL with new password

### Issue: "No data showing in app"

**Solution:**
1. Re-run seed script: `python seed_supabase.py`
2. Check data exists in Supabase Table Editor
3. Restart backend server
4. Clear browser cache and refresh

### Issue: "OTP emails not sending"

**Solution:**
1. Check EMAIL_TESTING_MODE in .env
2. If using SMTP, verify credentials
3. Check Supabase email configuration
4. Look for errors in backend logs

---

## 🎉 Migration Complete!

Your NTU Food app is now running on Supabase PostgreSQL!

### Benefits of Supabase:
- ✅ Cloud-hosted database (no local SQLite file)
- ✅ Automatic backups
- ✅ Real-time subscriptions (for future features)
- ✅ Built-in authentication (can integrate later)
- ✅ Auto-generated REST API
- ✅ GraphQL support
- ✅ Storage for images (can add later)
- ✅ Edge functions (serverless)

### Next Steps:
1. **Change admin password** (Security!)
2. **Configure email sending** for real OTP
3. **Add SSL/TLS** for production deployment
4. **Set up Row Level Security (RLS)** policies for data protection
5. **Enable Supabase Auth** for simplified authentication
6. **Add file uploads** using Supabase Storage
7. **Implement real-time updates** using Supabase Realtime

---

## 📚 Resources

- **Supabase Docs:** https://supabase.com/docs
- **SQLAlchemy + PostgreSQL:** https://docs.sqlalchemy.org/en/20/dialects/postgresql.html
- **FastAPI Database:** https://fastapi.tiangolo.com/tutorial/sql-databases/
- **Supabase Python Client:** https://supabase.com/docs/reference/python/introduction

---

## 🆘 Support

If you encounter issues:

1. Check Supabase status: https://status.supabase.com/
2. Review backend logs for detailed error messages
3. Check Supabase Dashboard → Logs → Postgres Logs
4. Verify environment variables are correct

---

**Migration Date:** 2025-10-13
**Supabase Project:** dhmwuixxxsxkyfjdblqu
**Status:** ✅ Complete

---
