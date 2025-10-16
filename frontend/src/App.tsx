import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import CartDrawer from './components/CartDrawer';
import Login from './components/Login';
import RegisterWithOTP from './components/RegisterWithOTP';
import StallList from './components/StallList';
import MenuView from './components/MenuView';
import OrderForm from './components/OrderForm';
import QueueStatus from './components/QueueStatus';
import OrderList from './components/OrderList';
import AdminLogin from './components/admin/AdminLogin';
import AdminDashboard from './components/admin/AdminDashboard';
import UserManagement from './components/admin/UserManagement';
import AllAccounts from './components/admin/AllAccounts';
import StallManagement from './components/admin/StallManagement';
import MenuManagement from './components/admin/MenuManagement';
import OrderManagement from './components/admin/OrderManagement';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <Router>
            <div className="app">
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<RegisterWithOTP />} />

                {/* Admin routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin/dashboard" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/accounts" element={<AllAccounts />} />
                <Route path="/admin/stalls" element={<StallManagement />} />
                <Route path="/admin/menu" element={<MenuManagement />} />
                <Route path="/admin/orders" element={<OrderManagement />} />

                {/* Protected routes */}
                <Route path="/stalls" element={
                  <ProtectedRoute>
                    <StallList />
                  </ProtectedRoute>
                } />

                <Route path="/stalls/:stallId/menu" element={
                  <ProtectedRoute>
                    <MenuView />
                  </ProtectedRoute>
                } />

                <Route path="/place-order" element={
                  <ProtectedRoute>
                    <OrderForm />
                  </ProtectedRoute>
                } />

                <Route path="/queue-status" element={
                  <ProtectedRoute>
                    <QueueStatus />
                  </ProtectedRoute>
                } />

                <Route path="/orders" element={
                  <ProtectedRoute>
                    <OrderList />
                  </ProtectedRoute>
                } />

                {/* Default redirect */}
                <Route path="/" element={<Navigate to="/stalls" replace />} />

                {/* 404 fallback */}
                <Route path="*" element={<Navigate to="/stalls" replace />} />
              </Routes>
            </div>
            {/* Global Cart Drawer - Available on all pages */}
            <CartDrawer />
          </Router>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
