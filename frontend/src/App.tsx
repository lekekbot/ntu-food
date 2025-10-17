import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import CartDrawer from './components/CartDrawer';
import Login from './components/Login';
import RegisterWithOTP from './components/RegisterWithOTP';
import StallList from './components/StallList';
import MenuView from './components/MenuView';
import Checkout from './components/Checkout';
import OrderConfirmation from './components/OrderConfirmation';
import OrderForm from './components/OrderForm';
import QueueStatus from './components/QueueStatus';
import OrderList from './components/OrderList';
import OrderTracking from './components/OrderTracking';
import StallOwnerDashboard from './components/stallowner/StallOwnerDashboard';
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

                {/* Stall Owner routes */}
                <Route path="/stall-owner/dashboard" element={
                  <ProtectedRoute>
                    <StallOwnerDashboard />
                  </ProtectedRoute>
                } />

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

                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } />

                <Route path="/order-confirmation" element={
                  <ProtectedRoute>
                    <OrderConfirmation />
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

                <Route path="/order-tracking/:orderId" element={
                  <ProtectedRoute>
                    <OrderTracking />
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
            {/* Toast Notifications */}
            <Toaster position="top-right" />
          </Router>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
