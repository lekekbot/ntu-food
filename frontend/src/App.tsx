import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './components/Login';
import Register from './components/Register';
import StallList from './components/StallList';
import MenuView from './components/MenuView';
import OrderForm from './components/OrderForm';
import QueueStatus from './components/QueueStatus';
import OrderList from './components/OrderList';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

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
      </Router>
    </AuthProvider>
  );
}

export default App;
