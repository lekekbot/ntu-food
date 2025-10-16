# 🚀 Quick Start - Admin Panel Test Guide

## ⚡ 5-Minute Setup

### Backend/Frontend (No Docker)

Run servers locally without Docker:

```bash
# Terminal 1: Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
./entrypoint.sh

# Terminal 2: Frontend
cd frontend
npm install
npm run dev
```

API will be at `http://localhost:8000` and frontend at `http://localhost:5173`.

### 1. Open Admin Panel
```
http://localhost:5173/admin/login
```

### 2. Login
```
Email: admin@ntu.edu.sg
Password: admin123
```

### 3. Test Database Persistence

## 🧪 Quick Tests

### Test 1: Create a Stall (30 seconds)

1. **Admin Panel** → Go to "Stalls" tab
2. Click "+ Add New Stall"
3. Fill in:
   - Name: "Quick Test Stall"
   - Location: "Test Location"
   - Cuisine Type: "Asian"
   - Price: Leave defaults
4. Click "💾 Create Stall in Database"
5. See success message: "✅ Stall created successfully in database!"

**Verify in Student App:**
1. Open new tab: `http://localhost:5173/login`
2. Login with: `test.student@e.ntu.edu.sg` / `testpassword123`
3. Browse stalls → See "Quick Test Stall" immediately!

**Verify Persistence:**
1. Kill both frontend and backend (Ctrl+C in terminals)
2. Restart both servers
3. Check student app → Stall still there!

---

### Test 2: Add Menu Item (30 seconds)

1. **Admin Panel** → Go to "Menu Items" tab
2. Click "+ Add Menu Item"
3. Fill in:
   - Stall: Select "Quick Test Stall"
   - Name: "Test Burger"
   - Price: 8.50
   - Category: "Main Course"
4. Click "💾 Create in Database"

**Verify in Student App:**
1. Click on "Quick Test Stall" in student app
2. See "Test Burger - $8.50" in menu immediately!

---

### Test 3: Update Menu Price (30 seconds)

1. **Admin Panel** → Menu Items tab
2. Find "Test Burger"
3. Click ✏️ Edit
4. Change price from $8.50 to $9.00
5. Click "💾 Save to Database"

**Verify in Student App:**
1. Refresh stall menu
2. Price now shows $9.00
3. Try adding to cart → Uses new price!

---

### Test 4: Manage Order (1 minute)

**Step 1: Student places order**
1. Student app → Add "Test Burger" to cart
2. Place order
3. Note order number (e.g., ORD-20250925-001)

**Step 2: Admin processes order**
1. Admin Panel → Orders tab
2. Find the order
3. Change status dropdown: Pending → Preparing
4. See success: "✅ Order status updated to preparing in database!"

**Step 3: Verify real-time sync**
1. Student app → Queue Status
2. Status now shows "PREPARING"
3. Change to "Ready" in admin
4. Student sees "READY" immediately!

---

### Test 5: Disable Menu Item (30 seconds)

1. **Admin Panel** → Menu Items
2. Find "Test Burger"
3. Click 🔒 (Toggle availability)
4. See: "✅ Item disabled in database!"

**Verify in Student App:**
1. Go to stall menu
2. "Test Burger" is grayed out or hidden
3. Can't add to cart anymore!

---

## 🎯 Database Verification (Advanced)

Check the actual database file:

```bash
cd backend
sqlite3 ntu_food.db

# View all stalls
SELECT id, name, location, is_open FROM stalls;

# View all menu items
SELECT id, stall_id, name, price, is_available FROM menu_items;

# View all orders
SELECT order_number, status, total_amount FROM orders;

# Exit
.quit
```

---

## 📊 Analytics Dashboard

**Admin Panel** → Dashboard (Overview tab)

You'll see real-time stats:
- ✅ Total users in database
- ✅ Total stalls
- ✅ Total orders & revenue
- ✅ Today's orders & revenue
- ✅ Popular menu items (sorted by sales)
- ✅ Stall performance metrics
- ✅ Recent activity feed

**All data pulled directly from database with SQL queries!**

---

## 🔄 Complete Workflow Test

### Scenario: New Stall Setup (3 minutes)

1. **Create Stall**
   - Admin → Stalls → Add "Pizza Paradise"
   - Location: "North Spine"
   - Cuisine: "Italian"

2. **Add Menu Items**
   - Admin → Menu → Add:
     - Margherita Pizza - $12.00
     - Pepperoni Pizza - $14.00
     - Garlic Bread - $4.50

3. **Student Orders**
   - Student → Browse stalls
   - Select "Pizza Paradise"
   - Add Pepperoni Pizza + Garlic Bread
   - Total: $18.50
   - Place order

4. **Admin Processes**
   - Admin → Orders → Find order
   - Update: Pending → Preparing
   - Wait 5 seconds
   - Update: Preparing → Ready

5. **Student Receives**
   - Student → Queue Status
   - See order ready for pickup

6. **Admin Completes**
   - Admin → Orders
   - Update: Ready → Completed

7. **Check Analytics**
   - Admin → Dashboard
   - See revenue increased by $18.50
   - See "Pepperoni Pizza" in popular items

**Everything persisted to database! Restart servers and all data remains!**

---

## 🎨 UI Elements to Try

### User Management
- Filter by role (Student, Stall Owner, Admin)
- Filter by status (Active/Inactive)
- Edit user details
- Activate/Deactivate accounts
- Delete users (except admins)

### Stall Management
- Create/Edit/Delete stalls
- Toggle open/closed status
- Update operating hours
- Change ratings

### Menu Management
- Add items to any stall
- Update prices in real-time
- Toggle item availability
- Organize by category

### Order Management
- View all orders
- Filter by status/stall/date
- Update order status
- Delete orders

---

## ✅ Checklist - Confirm These Work

- [ ] Admin login with credentials
- [ ] Dashboard loads with statistics
- [ ] Create a new stall → appears in student app
- [ ] Add menu item → student can order it
- [ ] Update price → student sees new price
- [ ] Disable item → student can't order
- [ ] Process order → student sees status updates
- [ ] All changes persist after server restart
- [ ] Analytics show correct numbers
- [ ] Filters and search work
- [ ] Delete operations work
- [ ] Error messages appear for invalid actions

---

## 🎉 Success Indicators

If you see these, everything is working:

✅ Green success messages after each action
✅ Changes appear immediately in student app
✅ Data persists after server restart
✅ Analytics update in real-time
✅ No console errors
✅ All CRUD operations work
✅ Database file grows in size as you add data

---

## 📍 Important URLs

- **Admin Login:** http://localhost:5173/admin/login
- **Admin Dashboard:** http://localhost:5173/admin/dashboard
- **Student Login:** http://localhost:5173/login
- **API Docs:** http://localhost:8000/docs
- **Health Check:** http://localhost:8000/health

---

## 🆘 Quick Troubleshooting

**Can't login?**
```bash
cd backend
python seed_admin.py
```

**Changes not appearing?**
- Refresh browser (Ctrl+F5)
- Check backend console for errors
- Verify both servers running

**Database issues?**
- Check `backend/ntu_food.db` exists
- Restart backend server

---

## 🎯 Next Steps

After confirming everything works:

1. **Change admin password** (User Management → Edit your account)
2. **Create stall owners** (User Management → Add users with role "Stall Owner")
3. **Set up real stalls** (Add actual NTU food stalls)
4. **Populate menus** (Add real menu items with prices)
5. **Test with students** (Have students place real orders)
6. **Monitor analytics** (Track sales and performance)

Enjoy your fully functional, database-persistent admin panel! 🎉