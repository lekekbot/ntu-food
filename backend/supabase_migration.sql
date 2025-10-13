-- =====================================================
-- NTU FOOD APP - SUPABASE MIGRATION SCRIPT
-- =====================================================
-- Run this script in Supabase SQL Editor
-- This will create all tables, enums, indexes, and constraints
-- =====================================================

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS otp_verifications CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS queue_entries CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS menu_items CASCADE;
DROP TABLE IF EXISTS stalls CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Drop existing enums if they exist
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS order_status CASCADE;
DROP TYPE IF EXISTS queue_status CASCADE;

-- =====================================================
-- CREATE ENUMS
-- =====================================================

CREATE TYPE user_role AS ENUM ('student', 'stall_owner', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled');
CREATE TYPE queue_status AS ENUM ('waiting', 'preparing', 'ready', 'collected', 'cancelled');

-- =====================================================
-- CREATE TABLES
-- =====================================================

-- Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    ntu_email VARCHAR(255) UNIQUE NOT NULL,
    student_id VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    dietary_preferences TEXT,
    hashed_password VARCHAR(255) NOT NULL,
    role user_role DEFAULT 'student',
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Stalls Table
CREATE TABLE stalls (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    opening_time TIME,
    closing_time TIME,
    avg_prep_time INTEGER DEFAULT 15,
    max_concurrent_orders INTEGER DEFAULT 10,
    description TEXT,
    cuisine_type VARCHAR(100),
    image_url TEXT,
    is_open BOOLEAN DEFAULT true,
    rating DECIMAL(3,2) DEFAULT 0.0,
    owner_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Menu Items Table
CREATE TABLE menu_items (
    id SERIAL PRIMARY KEY,
    stall_id INTEGER NOT NULL REFERENCES stalls(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    prep_time INTEGER DEFAULT 10,
    category VARCHAR(100),
    is_available BOOLEAN DEFAULT true,
    description TEXT,
    image_url TEXT,
    is_vegetarian BOOLEAN DEFAULT false,
    is_halal BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stall_id INTEGER NOT NULL REFERENCES stalls(id) ON DELETE CASCADE,
    total_amount DECIMAL(10,2) NOT NULL,
    status order_status DEFAULT 'pending',
    queue_number INTEGER,
    pickup_time TIMESTAMP,
    order_number VARCHAR(50),
    special_instructions TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id INTEGER NOT NULL REFERENCES menu_items(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    special_requests TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Queue Entries Table
CREATE TABLE queue_entries (
    id SERIAL PRIMARY KEY,
    stall_id INTEGER NOT NULL REFERENCES stalls(id) ON DELETE CASCADE,
    order_id INTEGER UNIQUE NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    queue_position INTEGER NOT NULL,
    estimated_wait_time INTEGER,
    status queue_status DEFAULT 'waiting',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ready_at TIMESTAMP,
    collected_at TIMESTAMP
);

-- OTP Verifications Table
CREATE TABLE otp_verifications (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    otp_code VARCHAR(10) NOT NULL,
    student_id VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    dietary_preferences TEXT DEFAULT '',
    hashed_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    attempts INTEGER DEFAULT 0,
    is_used BOOLEAN DEFAULT false
);

-- =====================================================
-- CREATE INDEXES
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_ntu_email ON users(ntu_email);
CREATE INDEX idx_users_student_id ON users(student_id);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Stalls indexes
CREATE INDEX idx_stalls_owner_id ON stalls(owner_id);
CREATE INDEX idx_stalls_is_open ON stalls(is_open);
CREATE INDEX idx_stalls_location ON stalls(location);

-- Menu items indexes
CREATE INDEX idx_menu_items_stall_id ON menu_items(stall_id);
CREATE INDEX idx_menu_items_is_available ON menu_items(is_available);
CREATE INDEX idx_menu_items_category ON menu_items(category);

-- Orders indexes
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_stall_id ON orders(stall_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_order_number ON orders(order_number);
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- Order items indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_menu_item_id ON order_items(menu_item_id);

-- Queue entries indexes
CREATE INDEX idx_queue_entries_stall_id ON queue_entries(stall_id);
CREATE INDEX idx_queue_entries_order_id ON queue_entries(order_id);
CREATE INDEX idx_queue_entries_status ON queue_entries(status);

-- OTP verifications indexes
CREATE INDEX idx_otp_verifications_email ON otp_verifications(email);
CREATE INDEX idx_otp_verifications_expires_at ON otp_verifications(expires_at);

-- =====================================================
-- CREATE FUNCTIONS & TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for users table
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger for orders table
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables for security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE stalls ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE queue_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE otp_verifications ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (you can customize these later)
-- For now, we'll allow all authenticated users to read/write
-- You should customize these policies based on your security requirements

-- Users policies
CREATE POLICY "Allow all operations for authenticated users" ON users
    FOR ALL USING (true) WITH CHECK (true);

-- Stalls policies
CREATE POLICY "Allow all operations for authenticated users" ON stalls
    FOR ALL USING (true) WITH CHECK (true);

-- Menu items policies
CREATE POLICY "Allow all operations for authenticated users" ON menu_items
    FOR ALL USING (true) WITH CHECK (true);

-- Orders policies
CREATE POLICY "Allow all operations for authenticated users" ON orders
    FOR ALL USING (true) WITH CHECK (true);

-- Order items policies
CREATE POLICY "Allow all operations for authenticated users" ON order_items
    FOR ALL USING (true) WITH CHECK (true);

-- Queue entries policies
CREATE POLICY "Allow all operations for authenticated users" ON queue_entries
    FOR ALL USING (true) WITH CHECK (true);

-- OTP verifications policies
CREATE POLICY "Allow all operations for authenticated users" ON otp_verifications
    FOR ALL USING (true) WITH CHECK (true);

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Uncomment these to verify the migration was successful
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
-- SELECT * FROM users;
-- SELECT * FROM stalls;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Next steps:
-- 1. Run the seed script to populate initial data
-- 2. Test database connection from backend
-- 3. Verify all CRUD operations work
-- =====================================================
