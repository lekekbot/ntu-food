# 🔐 NTU Food Admin Panel - Complete Guide

## ✅ System Overview

The admin panel is a **comprehensive database management system** with full CRUD operations and real-time synchronization. All changes made through the admin panel are **immediately persisted to the SQLite database** and visible to students in real-time.

## 🚀 Quick Start

### 1. Start the Servers

```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev
```

### 2. Create Admin Account

```bash
cd backend
python seed_admin.py
```

**Default Admin Credentials:**
- Email: `admin@ntu.edu.sg`
- Password: `admin123`

### 3. Access Admin Panel

Open your browser and navigate to:
```
http://localhost:5173/admin/login
```

## 📋 Features with Database Persistence

### 1. 👥 User Management
**URL:** `/admin/users`

**Database Operations:**
- ✅ **View Users** - Query: `SELECT * FROM users`
- ✅ **Edit User** - Query: `UPDATE users SET name=?, phone=?, role=?, is_active=? WHERE id=?`
- ✅ **Activate/Deactivate** - Query: `UPDATE users SET is_active=? WHERE id=?`
- ✅ **Delete User** - Query: `DELETE FROM users WHERE id=?`

**Filter Options:**
- Role (Student, Stall Owner, Admin)
- Active Status

**Persistence Verification:**
1. Edit a user in admin panel
2. Check student login - changes are immediate
3. Restart servers - changes persist

---

### 2. 🏪 Stall Management
**URL:** `/admin/stalls`

**Database Operations:**
- ✅ **Create Stall** - Query: `INSERT INTO stalls (name, location, ...) VALUES (...)`
- ✅ **Edit Stall** - Query: `UPDATE stalls SET name=?, location=?, is_open=? WHERE id=?`
- ✅ **Delete Stall** - Query: `DELETE FROM stalls WHERE id=?` (cascade deletes menu items)
- ✅ **Toggle Open/Close** - Query: `UPDATE stalls SET is_open=? WHERE id=?`

**Editable Fields:**
- Name, Location, Cuisine Type
- Opening/Closing Hours
- Average Prep Time
- Max Concurrent Orders
- Rating, Description, Image URL

**Persistence Verification:**
1. Create a new stall in admin panel
2. Go to student app (`/stalls`) - new stall appears immediately
3. Close a stall - students can't order from it
4. Restart servers - all changes persist

---

### 3. 📋 Menu Management
**URL:** `/admin/menu`

**Database Operations:**
- ✅ **Create Menu Item** - Query: `INSERT INTO menu_items (stall_id, name, price, ...) VALUES (...)`
- ✅ **Edit Item** - Query: `UPDATE menu_items SET name=?, price=?, is_available=? WHERE id=?`
- ✅ **Delete Item** - Query: `DELETE FROM menu_items WHERE id=?`
- ✅ **Toggle Availability** - Query: `UPDATE menu_items SET is_available=? WHERE id=?`

**Editable Fields:**
- Name, Description, Category
- Price (students see updated prices)
- Preparation Time
- Availability Status
- Image URL

**Persistence Verification:**
1. Add a new menu item with price $5.00
2. Student opens stall menu - item appears with correct price
3. Update price to $6.00 - students see new price immediately
4. Disable item - students can't order it
5. Restart servers - all changes persist

---

### 4. 📦 Order Management
**URL:** `/admin/orders`

**Database Operations:**
- ✅ **View Orders** - Query: `SELECT * FROM orders WHERE ...`
- ✅ **Update Status** - Queries:
  ```sql
  UPDATE orders SET status=?, updated_at=? WHERE id=?
  UPDATE queue_entries SET status=? WHERE order_id=?
  ```
- ✅ **Delete Order** - Query: `DELETE FROM orders WHERE id=?`

**Status Workflow:**
- Pending → Preparing → Ready → Completed
- Any → Cancelled

**Filter Options:**
- Status (Pending, Preparing, Ready, Completed, Cancelled)
- Stall
- Date Range

**Persistence Verification:**
1. Student places an order
2. Admin updates status to "Preparing"
3. Student sees updated status in queue
4. Admin marks as "Ready"
5. Student receives notification
6. All updates persist to database

---

### 5. 📊 Analytics Dashboard
**URL:** `/admin/dashboard`

**Real-time Database Queries:**

**Dashboard Stats:**
```sql
SELECT COUNT(*) FROM users
SELECT COUNT(*) FROM stalls
SELECT COUNT(*) FROM orders
SELECT SUM(total_amount) FROM orders WHERE status='completed'
SELECT COUNT(*) FROM orders WHERE DATE(created_at)=CURRENT_DATE
```

**Popular Items:**
```sql
SELECT
  menu_items.name,
  stalls.name as stall_name,
  COUNT(order_items.id) as order_count,
  SUM(order_items.quantity) as total_quantity,
  SUM(order_items.quantity * order_items.unit_price) as total_revenue
FROM menu_items
JOIN order_items ON menu_items.id = order_items.menu_item_id
JOIN orders ON order_items.order_id = orders.id
WHERE orders.status = 'completed'
GROUP BY menu_items.id
ORDER BY total_quantity DESC
LIMIT 10
```

**Stall Performance:**
```sql
SELECT
  stalls.name,
  COUNT(orders.id) as total_orders,
  SUM(orders.total_amount) as total_revenue,
  AVG(orders.total_amount) as avg_order_value,
  COUNT(DISTINCT orders.user_id) as unique_customers
FROM stalls
LEFT JOIN orders ON stalls.id = orders.stall_id
GROUP BY stalls.id
ORDER BY total_revenue DESC
```

---

## 🔄 Database Synchronization Flow

### Example: Adding a New Stall

**Admin Panel → Database → Student App**

1. **Admin Action:**
   - Navigate to `/admin/stalls`
   - Click "Add New Stall"
   - Fill in: Name="New Food Court", Location="South Spine"
   - Click "Create Stall in Database"

2. **Backend Processing:**
   ```python
   db_stall = Stall(
       name="New Food Court",
       location="South Spine",
       ...
   )
   db.add(db_stall)
   db.commit()  # ← Database write happens here
   db.refresh(db_stall)
   ```

3. **Database State:**
   ```sql
   INSERT INTO stalls (name, location, opening_time, closing_time, ...)
   VALUES ('New Food Court', 'South Spine', ...)
   ```

4. **Student App:**
   - Student refreshes `/stalls` page
   - API call: `GET /api/stalls/`
   - Query: `SELECT * FROM stalls WHERE is_open=true`
   - New stall appears immediately

5. **Verification:**
   - Stop both frontend and backend servers
   - Restart both servers
   - Check student app - stall still exists
   - Check admin panel - stall data intact

---

## 🧪 Testing Database Persistence

### Test 1: Stall Creation Persistence

```bash
# Step 1: Create stall via admin panel
1. Login to /admin/login
2. Go to /admin/stalls
3. Create stall: "Test Stall" at "Test Location"
4. Note the stall ID

# Step 2: Verify in student app
1. Open /stalls in student app
2. Confirm "Test Stall" appears

# Step 3: Restart servers
1. Kill both frontend and backend
2. Restart both
3. Check /stalls again
4. Stall should still exist

# Step 4: Check database directly
cd backend
sqlite3 ntu_food.db
SELECT * FROM stalls WHERE name='Test Stall';
```

### Test 2: Menu Price Update Synchronization

```bash
# Step 1: Update price via admin panel
1. Login to admin panel
2. Go to /admin/menu
3. Edit item: "Chicken Rice" - change price from $4.00 to $4.50
4. Click "Save to Database"

# Step 2: Verify in student app
1. Open stall menu in student app
2. Confirm "Chicken Rice" shows $4.50

# Step 3: Verify database
cd backend
sqlite3 ntu_food.db
SELECT name, price FROM menu_items WHERE name='Chicken Rice';
# Should show: Chicken Rice|4.50
```

### Test 3: Order Status Update Workflow

```bash
# Step 1: Student places order
1. Student logs in
2. Adds items to cart
3. Places order
4. Note order number (e.g., ORD-20250925-001)

# Step 2: Admin updates status
1. Admin goes to /admin/orders
2. Find order ORD-20250925-001
3. Change status from "Pending" to "Preparing"

# Step 3: Verify student sees update
1. Student checks /queue-status
2. Status should show "Preparing"

# Step 4: Verify database
cd backend
sqlite3 ntu_food.db
SELECT order_number, status FROM orders WHERE order_number='ORD-20250925-001';
# Should show: ORD-20250925-001|preparing
```

---

## 💾 Database Schema Reference

### Tables Modified by Admin Panel

**users**
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY,
    ntu_email VARCHAR UNIQUE NOT NULL,
    student_id VARCHAR UNIQUE NOT NULL,
    name VARCHAR NOT NULL,
    phone VARCHAR NOT NULL,
    role VARCHAR CHECK(role IN ('student', 'stall_owner', 'admin')),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at DATETIME,
    updated_at DATETIME
);
```

**stalls**
```sql
CREATE TABLE stalls (
    id INTEGER PRIMARY KEY,
    name VARCHAR NOT NULL,
    location VARCHAR NOT NULL,
    opening_time TIME,
    closing_time TIME,
    avg_prep_time INTEGER DEFAULT 15,
    max_concurrent_orders INTEGER DEFAULT 10,
    description VARCHAR,
    cuisine_type VARCHAR,
    image_url VARCHAR,
    is_open BOOLEAN DEFAULT TRUE,
    rating FLOAT DEFAULT 0.0,
    owner_id INTEGER REFERENCES users(id)
);
```

**menu_items**
```sql
CREATE TABLE menu_items (
    id INTEGER PRIMARY KEY,
    stall_id INTEGER REFERENCES stalls(id) ON DELETE CASCADE,
    name VARCHAR NOT NULL,
    description VARCHAR,
    price FLOAT NOT NULL,
    category VARCHAR,
    image_url VARCHAR,
    is_available BOOLEAN DEFAULT TRUE,
    preparation_time INTEGER DEFAULT 10
);
```

**orders**
```sql
CREATE TABLE orders (
    id INTEGER PRIMARY KEY,
    order_number VARCHAR UNIQUE NOT NULL,
    user_id INTEGER REFERENCES users(id),
    stall_id INTEGER REFERENCES stalls(id),
    status VARCHAR CHECK(status IN ('pending', 'preparing', 'ready', 'completed', 'cancelled')),
    total_amount FLOAT NOT NULL,
    pickup_time DATETIME,
    created_at DATETIME,
    updated_at DATETIME
);
```

---

## 🔐 Security Features

### Admin Authentication
- JWT tokens with role-based access control
- Separate admin login endpoint: `/api/auth/login`
- Admin role validation on all protected routes
- Token stored in `localStorage` as `admin_token`

### Authorization Checks
```python
async def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required"
        )
    return current_user
```

### Protected Operations
- ✅ Can't delete admin users
- ✅ Cascade deletes for stalls (removes menu items)
- ✅ Transaction safety for multi-step operations
- ✅ Input validation on all fields

---

## 🎯 API Endpoints Reference

### Admin Authentication
```
POST /api/admin/seed-admin        - Create default admin account
POST /api/auth/login               - Admin login (same as students)
GET  /api/auth/me                  - Get current user profile
```

### User Management
```
GET    /api/admin/users            - List all users (with filters)
GET    /api/admin/users/{id}       - Get specific user
PUT    /api/admin/users/{id}       - Update user (DB UPDATE)
DELETE /api/admin/users/{id}       - Delete user (DB DELETE)
```

### Stall Management
```
GET    /api/admin/stalls           - List all stalls
POST   /api/admin/stalls           - Create stall (DB INSERT)
PUT    /api/admin/stalls/{id}      - Update stall (DB UPDATE)
DELETE /api/admin/stalls/{id}      - Delete stall (DB DELETE + CASCADE)
```

### Menu Management
```
GET    /api/admin/menu-items       - List all menu items
POST   /api/admin/menu-items       - Create item (DB INSERT)
PUT    /api/admin/menu-items/{id}  - Update item (DB UPDATE)
DELETE /api/admin/menu-items/{id}  - Delete item (DB DELETE)
```

### Order Management
```
GET    /api/admin/orders           - List all orders (with filters)
GET    /api/admin/orders/{id}      - Get specific order
PUT    /api/admin/orders/{id}/status - Update order status (DB UPDATE)
DELETE /api/admin/orders/{id}      - Delete order (DB DELETE)
```

### Analytics
```
GET /api/admin/analytics/dashboard       - Dashboard statistics
GET /api/admin/analytics/popular-items   - Top selling items
GET /api/admin/analytics/stall-performance - Revenue by stall
GET /api/admin/analytics/recent-activity - Recent orders
```

---

## 🎨 UI Features

### Visual Confirmations
- ✅ Success alerts: "User updated successfully in database!"
- ✅ Error alerts: "Failed to update: [reason]"
- ✅ Confirmation dialogs: "Delete X? This will permanently remove from database"
- ✅ Loading states during database operations
- ✅ Real-time table updates after changes

### Color Coding
- 🟢 Green: Active, Available, Completed
- 🔵 Blue: Preparing, In Progress
- 🟠 Orange: Pending, Warning
- 🔴 Red: Inactive, Cancelled, Delete
- 🟣 Purple: Admin role

### Filters & Search
- User management: Filter by role, active status
- Order management: Filter by status, stall, date
- Menu management: Filter by stall

---

## 📱 Mobile Responsiveness

The admin panel is optimized for desktop use but includes responsive design:
- Grid layouts adapt to screen size
- Tables scroll horizontally on small screens
- Modal forms stack vertically on mobile
- Touch-friendly button sizes

---

## 🐛 Troubleshooting

### Issue: Changes not appearing in student app

**Solution:**
1. Check browser console for API errors
2. Verify backend is running (http://localhost:8000/health)
3. Check database file exists: `backend/ntu_food.db`
4. Refresh student app (Ctrl+F5)

### Issue: "Admin access required" error

**Solution:**
1. Verify you're logged in as admin
2. Check localStorage has `admin_token`
3. Re-login at `/admin/login`
4. Verify user role in database:
   ```sql
   SELECT role FROM users WHERE ntu_email='admin@ntu.edu.sg';
   ```

### Issue: Database locked error

**Solution:**
1. Close any open database connections
2. Restart backend server
3. Check no other process is using the database

---

## 📚 Additional Resources

- **Backend API Docs:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc
- **Database File:** `backend/ntu_food.db`
- **Admin Panel:** http://localhost:5173/admin/login
- **Student App:** http://localhost:5173/login

---

## ✨ Summary

The NTU Food Admin Panel provides:

✅ **Full Database Persistence** - All changes write directly to SQLite
✅ **Real-time Synchronization** - Students see changes immediately
✅ **Comprehensive CRUD** - Create, Read, Update, Delete on all entities
✅ **Transaction Safety** - Rollback on errors, cascade deletes
✅ **Role-based Security** - Admin-only access with JWT authentication
✅ **Rich Analytics** - Real-time reports and performance metrics
✅ **User-friendly UI** - Visual feedback, confirmations, filters

**Every admin action = Immediate database update = Instant student visibility**