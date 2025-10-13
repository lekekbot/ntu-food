# ✅ Supabase Migration Checklist

Use this checklist to track your migration progress.

---

## 📋 Pre-Migration Checklist

- [x] Supabase account created
- [x] Supabase project created (Project Ref: dhmwuixxxsxkyfjdblqu)
- [x] Database password obtained
- [x] Migration files prepared
- [x] Backend configuration updated

---

## 🗄️ Database Migration

### Step 1: Run SQL Migration in Supabase

- [ ] Open Supabase Dashboard: https://supabase.com/dashboard/project/dhmwuixxxsxkyfjdblqu
- [ ] Go to "SQL Editor" (left sidebar)
- [ ] Click "New Query"
- [ ] Open file: `backend/supabase_migration.sql`
- [ ] Copy entire file contents
- [ ] Paste into Supabase SQL Editor
- [ ] Click "Run" or press `Ctrl+Enter`
- [ ] Wait for "Success. No rows returned" message
- [ ] Go to "Table Editor" to verify

### Verify Tables Created:
- [ ] users
- [ ] stalls
- [ ] menu_items
- [ ] orders
- [ ] order_items
- [ ] queue_entries
- [ ] otp_verifications

---

## 🐍 Python Dependencies

### Step 2: Install PostgreSQL Packages

- [ ] Open terminal
- [ ] Navigate to backend: `cd backend`
- [ ] Install psycopg2-binary: `pip install psycopg2-binary`
- [ ] Install supabase: `pip install supabase`
- [ ] Or install all: `pip install -r requirements.txt`
- [ ] Verify installation: `python -c "import psycopg2; print('✅ Installed')"`

---

## ⚙️ Configuration

### Step 3: Verify Environment Variables

- [ ] Check `.env` file exists: `ls backend/.env`
- [ ] Verify DATABASE_URL is set to Supabase PostgreSQL
- [ ] Verify SUPABASE_URL is set
- [ ] Verify SUPABASE_KEY is set
- [ ] Verify EMAIL_TESTING_MODE is set to false

**Expected .env contents:**
```env
DATABASE_URL=postgresql://postgres:Ajite$h0812@db.dhmwuixxxsxkyfjdblqu.supabase.co:5432/postgres
SUPABASE_URL=https://dhmwuixxxsxkyfjdblqu.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
EMAIL_TESTING_MODE=false
```

---

## 🌱 Seed Initial Data

### Step 4: Populate Database

- [ ] Open terminal in backend directory
- [ ] Run seed script: `python seed_supabase.py`
- [ ] Wait for success message
- [ ] Verify output shows:
  - [ ] ✓ Admin user created
  - [ ] ✓ 3 test students created
  - [ ] ✓ 3 stalls created
  - [ ] ✓ 15 menu items created

### Verify in Supabase:
- [ ] Go to Supabase Dashboard → Table Editor
- [ ] Check `users` table: Should have 4 rows
- [ ] Check `stalls` table: Should have 3 rows
- [ ] Check `menu_items` table: Should have 15 rows

---

## 🔌 Test Connection

### Step 5: Verify Database Connection

- [ ] Run test script: `python test_supabase_connection.py`
- [ ] Check for "✅ CONNECTION TEST SUCCESSFUL" message
- [ ] Verify it shows correct table count
- [ ] Verify it shows record counts for each table

**If connection fails:**
- [ ] Check internet connection
- [ ] Verify Supabase project is not paused
- [ ] Check DATABASE_URL in .env
- [ ] Verify password is correct in DATABASE_URL

---

## 🚀 Restart Backend Server

### Step 6: Start Backend with Supabase

- [ ] Stop current backend server (Ctrl+C)
- [ ] Navigate to backend: `cd backend`
- [ ] Start server: `python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`
- [ ] Wait for "Application startup complete" message
- [ ] Check for no database errors in console
- [ ] Test health endpoint: `curl http://localhost:8000/health`
- [ ] Should return: `{"status":"healthy"}`

---

## 🧪 Test Application

### Step 7: Admin Panel Testing

- [ ] Open browser: http://localhost:5174/admin/login
- [ ] Login with:
  - Email: admin@ntu.edu.sg
  - Password: admin123
- [ ] Verify dashboard loads
- [ ] Check statistics show:
  - [ ] 4 users
  - [ ] 3 stalls
  - [ ] 15 menu items
- [ ] Test stall management:
  - [ ] View stalls list
  - [ ] Edit a stall
  - [ ] Changes save successfully
- [ ] Test menu management:
  - [ ] View menu items
  - [ ] Edit an item
  - [ ] Toggle availability
- [ ] Check browser console for errors (should be none)

### Step 8: Student Portal Testing

- [ ] Open new browser tab: http://localhost:5174/login
- [ ] Login with:
  - Email: test.student@e.ntu.edu.sg
  - Password: testpassword123
- [ ] Verify homepage loads
- [ ] Browse stalls:
  - [ ] Should see 3 stalls
  - [ ] Click on "Western Food Paradise"
  - [ ] Should see 5 menu items
- [ ] Test ordering:
  - [ ] Add item to cart
  - [ ] Go to cart
  - [ ] Place order
  - [ ] Note order number
  - [ ] Go to "My Orders"
  - [ ] Should see new order

### Step 9: Verify in Supabase

- [ ] Go to Supabase Dashboard → Table Editor
- [ ] Check `orders` table:
  - [ ] Should have the new order
  - [ ] Verify order details are correct
- [ ] Check `order_items` table:
  - [ ] Should have order line items
- [ ] Check `queue_entries` table:
  - [ ] Should have queue entry for order

### Step 10: Test Real-Time Updates

- [ ] Keep both admin and student portals open
- [ ] In admin panel:
  - [ ] Go to Orders
  - [ ] Find the test order
  - [ ] Change status to "Preparing"
- [ ] In student portal:
  - [ ] Go to "Queue Status"
  - [ ] Status should update to "PREPARING"
- [ ] In admin panel:
  - [ ] Change status to "Ready"
- [ ] In student portal:
  - [ ] Status should update to "READY"

---

## 📧 Email Configuration (Optional)

### Step 11: Configure Supabase Email

**Option A: Use Supabase Email Service**
- [ ] Go to Supabase Dashboard → Authentication → Providers
- [ ] Enable "Email" provider
- [ ] Configure email templates
- [ ] Test OTP email sending

**Option B: Use Custom SMTP**
- [ ] Add SMTP settings to .env:
  - SMTP_HOST
  - SMTP_PORT
  - SMTP_USERNAME
  - SMTP_PASSWORD
  - SENDER_EMAIL
- [ ] For Gmail: Generate App Password
- [ ] Test email sending

### Test Email OTP:
- [ ] Try registering new user
- [ ] Should receive OTP email
- [ ] Verify OTP works
- [ ] Check `otp_verifications` table in Supabase

---

## 🔒 Security Checklist

### Step 12: Security Configuration

- [ ] Change admin password (Security → Users → Edit admin)
- [ ] Generate strong SECRET_KEY in .env
- [ ] Review Supabase RLS policies
- [ ] Configure Row Level Security rules
- [ ] Set up Supabase API key restrictions
- [ ] Enable 2FA on Supabase account
- [ ] Review and customize access policies

---

## ✅ Final Verification

### Step 13: Complete Testing

- [ ] All CRUD operations work:
  - [ ] Create new stall
  - [ ] Edit stall details
  - [ ] Delete test stall
  - [ ] Create menu item
  - [ ] Update menu item
  - [ ] Delete test item
- [ ] Order flow works end-to-end
- [ ] Queue management works
- [ ] Admin dashboard statistics are accurate
- [ ] No errors in browser console
- [ ] No errors in backend logs
- [ ] Data persists after backend restart

### Performance Check:
- [ ] App loads quickly
- [ ] Database queries are fast
- [ ] No timeout errors
- [ ] Supabase dashboard shows query metrics

---

## 📊 Post-Migration

### Step 14: Monitoring and Optimization

- [ ] Review Supabase Dashboard → Database → Postgres Logs
- [ ] Check query performance
- [ ] Monitor database size
- [ ] Set up Supabase alerts
- [ ] Configure backup schedule
- [ ] Document any custom configurations
- [ ] Update team on new database setup

---

## 🎉 Migration Complete!

Once all checkboxes above are checked, your migration is complete!

### Success Indicators:
✅ All tables created in Supabase
✅ Initial data seeded successfully
✅ Backend connects to Supabase without errors
✅ Admin panel works perfectly
✅ Student portal works perfectly
✅ Orders can be placed and processed
✅ Data persists across server restarts
✅ No errors in console or logs

---

## 📝 Notes and Issues

**Use this space to track any issues or notes during migration:**

```
Date: ___________
Issue: ___________________________________________________________
Solution: _________________________________________________________

Date: ___________
Issue: ___________________________________________________________
Solution: _________________________________________________________

Date: ___________
Issue: ___________________________________________________________
Solution: _________________________________________________________
```

---

## 📚 Reference Documents

- **Detailed Guide:** `SUPABASE_MIGRATION_GUIDE.md`
- **Quick Summary:** `MIGRATION_SUMMARY.md`
- **SQL Script:** `backend/supabase_migration.sql`
- **Seed Script:** `backend/seed_supabase.py`
- **Test Script:** `backend/test_supabase_connection.py`

---

**Migration Date:** ___________
**Completed By:** ___________
**Status:** ☐ In Progress  ☐ Completed  ☐ Issues Found

---

*Tip: Print this checklist or keep it open in a separate window as you perform the migration.*
