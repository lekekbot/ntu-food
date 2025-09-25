# ✅ Admin Panel Testing Checklist

## Prerequisites
- [ ] Backend server running on http://localhost:8000
- [ ] Frontend server running on http://localhost:5173
- [ ] Admin account created (run `python seed_admin.py`)

## 🔐 1. Admin Authentication

### Login Test
- [ ] Navigate to http://localhost:5173/admin/login
- [ ] Enter email: `admin@ntu.edu.sg`
- [ ] Enter password: `admin123`
- [ ] Click "Login to Admin Panel"
- [ ] ✅ Should redirect to /admin/dashboard
- [ ] ✅ Should see welcome message with admin name

### Login Validation
- [ ] Try logging in with wrong password
- [ ] ✅ Should show error: "Login failed. Please check your credentials."
- [ ] Try logging in with student account
- [ ] ✅ Should show error: "Access denied. Admin privileges required."

## 📊 2. Dashboard & Analytics

### Dashboard Load
- [ ] Navigate to /admin/dashboard
- [ ] ✅ Should see stats cards with numbers
- [ ] ✅ Should see "Total Users" count
- [ ] ✅ Should see "Total Stalls" count
- [ ] ✅ Should see "Total Orders" count
- [ ] ✅ Should see "Total Revenue" in dollars

### Analytics Tables
- [ ] ✅ Should see "Popular Items" table with data
- [ ] ✅ Should see "Stall Performance" table
- [ ] ✅ Should see "Recent Activity" feed
- [ ] ✅ Numbers should match database counts

## 👥 3. User Management

### View Users
- [ ] Click "Users" in sidebar
- [ ] ✅ Should see table of all users
- [ ] ✅ Should see columns: ID, Name, Email, Role, Status
- [ ] ✅ Should see filter dropdowns (Role, Status)

### Filter Users
- [ ] Select filter "Role: Student"
- [ ] ✅ Table updates to show only students
- [ ] Select filter "Status: Active"
- [ ] ✅ Table updates to show only active users

### Edit User
- [ ] Click ✏️ (edit) button on any user
- [ ] ✅ Modal opens with user details
- [ ] Change name to "Test User Updated"
- [ ] Click "💾 Save to Database"
- [ ] ✅ See success message: "User updated successfully in database!"
- [ ] ✅ Table refreshes with new name

### Activate/Deactivate User
- [ ] Click 🔒/🔓 button on any user
- [ ] ✅ See confirmation message
- [ ] ✅ Status badge changes color
- [ ] ✅ Table refreshes

### Database Persistence - User
- [ ] Edit a user's name
- [ ] Restart backend server (Ctrl+C, then restart)
- [ ] Refresh admin panel
- [ ] ✅ User's new name still shows (persisted!)

## 🏪 4. Stall Management

### View Stalls
- [ ] Click "Stalls" in sidebar
- [ ] ✅ Should see stall cards in grid
- [ ] ✅ Each card shows: Name, Location, Rating, Hours

### Create Stall
- [ ] Click "+ Add New Stall" button
- [ ] Fill in:
  - Name: "Test Food Court"
  - Location: "Test Building"
  - Cuisine Type: "Mixed"
  - Opening Time: 08:00
  - Closing Time: 20:00
- [ ] Click "💾 Create Stall in Database"
- [ ] ✅ See success: "Stall created successfully in database!"
- [ ] ✅ New stall card appears

### Verify Student Sees New Stall
- [ ] Open new tab: http://localhost:5173/login
- [ ] Login as student: `test.student@e.ntu.edu.sg` / `testpassword123`
- [ ] Browse stalls
- [ ] ✅ "Test Food Court" appears in stall list!

### Edit Stall
- [ ] In admin panel, click "✏️ Edit" on "Test Food Court"
- [ ] Change name to "Updated Test Stall"
- [ ] Change rating to 4.5
- [ ] Click "💾 Save to Database"
- [ ] ✅ See success message
- [ ] ✅ Card updates with new name

### Verify Edit in Student App
- [ ] Refresh student app stall list
- [ ] ✅ Stall name shows "Updated Test Stall"

### Toggle Open/Closed
- [ ] Click "🔒 Close" on the stall
- [ ] ✅ Badge changes to "Closed"
- [ ] Check student app
- [ ] ✅ Stall shows as closed or grayed out

### Delete Stall
- [ ] Click "🗑️ Delete" on test stall
- [ ] ✅ Confirm deletion dialog appears
- [ ] Confirm deletion
- [ ] ✅ Stall removed from admin panel
- [ ] Check student app
- [ ] ✅ Stall no longer visible

### Database Persistence - Stall
- [ ] Create a new stall "Persistence Test"
- [ ] Restart both backend and frontend
- [ ] Check admin panel
- [ ] ✅ "Persistence Test" stall still exists

## 📋 5. Menu Management

### View Menu Items
- [ ] Click "Menu Items" in sidebar
- [ ] ✅ Should see table of all menu items
- [ ] ✅ Columns: Stall, Name, Price, Category, Available

### Filter by Stall
- [ ] Select a stall from dropdown
- [ ] ✅ Table updates to show only that stall's items

### Create Menu Item
- [ ] Click "+ Add Menu Item"
- [ ] Fill in:
  - Stall: Select any stall
  - Name: "Test Burger"
  - Price: 8.50
  - Category: "Main Course"
  - Preparation Time: 15
- [ ] Check "Available for orders"
- [ ] Click "💾 Create in Database"
- [ ] ✅ See success message
- [ ] ✅ Item appears in table

### Verify Student Sees Menu Item
- [ ] In student app, click on the stall
- [ ] ✅ "Test Burger - $8.50" appears in menu

### Update Price
- [ ] In admin panel, click ✏️ on "Test Burger"
- [ ] Change price from 8.50 to 9.00
- [ ] Click "💾 Save to Database"
- [ ] ✅ See success message

### Verify Price Update
- [ ] In student app, refresh stall menu
- [ ] ✅ Price now shows "$9.00"
- [ ] Add to cart
- [ ] ✅ Cart shows $9.00

### Toggle Availability
- [ ] In admin panel, click 🔒 on "Test Burger"
- [ ] ✅ Badge changes to "Unavailable"
- [ ] In student app, refresh menu
- [ ] ✅ Item is grayed out or says "Unavailable"
- [ ] Try to add to cart
- [ ] ✅ Can't add disabled items

### Delete Menu Item
- [ ] Click 🗑️ on "Test Burger"
- [ ] Confirm deletion
- [ ] ✅ Item removed from table
- [ ] Check student app
- [ ] ✅ Item no longer in menu

### Database Persistence - Menu
- [ ] Create item: "Persistence Burger - $10.00"
- [ ] Restart servers
- [ ] Check admin panel
- [ ] ✅ Item still exists with correct price

## 📦 6. Order Management

### Prerequisites - Create Order as Student
- [ ] In student app, add items to cart
- [ ] Place an order
- [ ] Note the order number (e.g., ORD-20250925-001)

### View Orders
- [ ] In admin panel, click "Orders" in sidebar
- [ ] ✅ Should see table of all orders
- [ ] ✅ Should see the order you just placed

### Filter Orders
- [ ] Select "Status: Pending"
- [ ] ✅ Table shows only pending orders
- [ ] Select a specific stall
- [ ] ✅ Table shows only that stall's orders

### Update Order Status
- [ ] Find your test order
- [ ] Change status dropdown from "Pending" to "Preparing"
- [ ] ✅ See success: "Order status updated to preparing in database!"

### Verify Status in Student App
- [ ] In student app, go to Queue Status
- [ ] ✅ Status shows "PREPARING"

### Complete Order Workflow
- [ ] Admin: Change status to "Ready"
- [ ] Student: Check queue → ✅ Shows "READY"
- [ ] Admin: Change status to "Completed"
- [ ] Student: Check orders → ✅ Shows "COMPLETED"

### Delete Order
- [ ] Click 🗑️ on any old order
- [ ] Confirm deletion
- [ ] ✅ Order removed from table
- [ ] ✅ Order removed from database

### Database Persistence - Orders
- [ ] Update an order status to "Preparing"
- [ ] Restart backend server
- [ ] Check admin panel
- [ ] ✅ Order still shows "Preparing" status

## 🔄 7. Real-time Synchronization Tests

### Test 1: Price Update Flow
1. [ ] Admin: Create item "Sync Test - $5.00"
2. [ ] Student: See item at $5.00
3. [ ] Admin: Update price to $6.00
4. [ ] Student: Refresh → ✅ Price shows $6.00
5. [ ] Student: Add to cart → ✅ Cart shows $6.00

### Test 2: Stall Creation Flow
1. [ ] Admin: Create stall "Sync Stall"
2. [ ] Student: Refresh stalls
3. [ ] ✅ "Sync Stall" appears immediately
4. [ ] Restart both servers
5. [ ] ✅ Stall still exists

### Test 3: Order Status Flow
1. [ ] Student: Place order
2. [ ] Admin: Update to "Preparing"
3. [ ] Student: Check queue → ✅ Shows "Preparing"
4. [ ] Admin: Update to "Ready"
5. [ ] Student: Auto-refresh → ✅ Shows "Ready" (within 30s)

### Test 4: Item Availability Flow
1. [ ] Admin: Disable a popular item
2. [ ] Student: Refresh menu
3. [ ] ✅ Item grayed out/unavailable
4. [ ] Admin: Re-enable item
5. [ ] Student: Refresh → ✅ Item available again

## 💾 8. Database Persistence Tests

### Test 1: Restart Backend
- [ ] Create stall, menu item, edit user
- [ ] Kill backend (Ctrl+C)
- [ ] Restart backend
- [ ] Check admin panel
- [ ] ✅ All changes still present

### Test 2: Restart Both Servers
- [ ] Make several changes in admin panel
- [ ] Kill both frontend and backend
- [ ] Restart both
- [ ] Check admin and student apps
- [ ] ✅ All data intact

### Test 3: Direct Database Check
```bash
cd backend
sqlite3 ntu_food.db
SELECT * FROM stalls WHERE name LIKE '%Test%';
SELECT * FROM menu_items WHERE name LIKE '%Test%';
SELECT * FROM users WHERE role='admin';
.quit
```
- [ ] ✅ See your test data in database

## 🎨 9. UI/UX Tests

### Loading States
- [ ] Create new stall (observe button)
- [ ] ✅ Button shows "Creating..." or disabled state
- [ ] After success
- [ ] ✅ Button returns to normal

### Error Handling
- [ ] Try to create stall with empty name
- [ ] ✅ See error message
- [ ] Try to delete admin user
- [ ] ✅ See error: "Cannot delete admin users"

### Confirmations
- [ ] Click delete on any item
- [ ] ✅ Confirmation dialog appears
- [ ] Click cancel
- [ ] ✅ Item not deleted

### Filters Work
- [ ] User management: Filter by role
- [ ] ✅ Results update
- [ ] Menu management: Filter by stall
- [ ] ✅ Results update
- [ ] Order management: Filter by status
- [ ] ✅ Results update

### Modals
- [ ] Open edit modal
- [ ] ✅ Click outside modal → Closes
- [ ] Open edit modal
- [ ] ✅ Click cancel → Closes
- [ ] Open edit modal
- [ ] Make changes and save
- [ ] ✅ Modal closes after success

## 🔐 10. Security Tests

### Admin Access Only
- [ ] Logout from admin
- [ ] Login as student
- [ ] Try to navigate to /admin/dashboard
- [ ] ✅ Should redirect or show error

### JWT Token
- [ ] Login to admin
- [ ] Open browser DevTools → Application → Local Storage
- [ ] ✅ See `admin_token` stored
- [ ] Clear local storage
- [ ] Refresh page
- [ ] ✅ Redirected to login

### Role Validation
- [ ] Check network requests in DevTools
- [ ] ✅ All admin API calls have Authorization header
- [ ] ✅ Header format: "Bearer [token]"

## 📊 11. Analytics Accuracy

### Dashboard Stats Match Database
```bash
cd backend
sqlite3 ntu_food.db

# Count users
SELECT COUNT(*) FROM users;
# Compare with dashboard "Total Users"

# Count stalls
SELECT COUNT(*) FROM stalls;
# Compare with dashboard "Total Stalls"

# Count orders
SELECT COUNT(*) FROM orders;
# Compare with dashboard "Total Orders"

# Sum revenue
SELECT SUM(total_amount) FROM orders WHERE status='completed';
# Compare with dashboard "Total Revenue"
```

- [ ] ✅ All numbers match

### Popular Items
- [ ] In database, note which items sold most
- [ ] Check admin dashboard "Popular Items"
- [ ] ✅ Top items match database

## ✅ Final Verification

### Complete Workflow
1. [ ] Admin creates stall "Final Test Stall"
2. [ ] Admin adds 3 menu items
3. [ ] Student browses and sees all 3 items
4. [ ] Student places order with 2 items
5. [ ] Admin sees order in Orders tab
6. [ ] Admin updates status: Pending → Preparing → Ready
7. [ ] Student sees all status updates
8. [ ] Admin checks analytics - revenue increased
9. [ ] Restart both servers
10. [ ] ✅ Everything still works, all data persists

### Success Criteria
- [ ] ✅ All CRUD operations work
- [ ] ✅ Changes persist to database
- [ ] ✅ Student app syncs in real-time
- [ ] ✅ Analytics show correct data
- [ ] ✅ No console errors
- [ ] ✅ All filters work
- [ ] ✅ All modals work
- [ ] ✅ Security checks pass
- [ ] ✅ Can restart servers without data loss

---

## 🎉 If All Checked - SYSTEM IS READY!

**The admin panel is fully functional with:**
- ✅ Complete database persistence
- ✅ Real-time synchronization
- ✅ Full CRUD operations
- ✅ Secure authentication
- ✅ Analytics and reporting
- ✅ Production-ready code

**Congratulations!** 🚀