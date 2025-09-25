import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAuthApi } from '../../services/adminApi';
import './AdminLogin.css';

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await adminAuthApi.login(email, password);

      localStorage.setItem('admin_token', data.access_token);

      const profile = await adminAuthApi.getProfile();

      if (profile.role !== 'admin') {
        localStorage.removeItem('admin_token');
        setError('Access denied. Admin privileges required.');
        setLoading(false);
        return;
      }

      localStorage.setItem('admin_user', JSON.stringify(profile));

      navigate('/admin/dashboard');
    } catch (err: any) {
      localStorage.removeItem('admin_token');
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  const handleSeedAdmin = async () => {
    try {
      const result = await adminAuthApi.seedAdmin();
      alert(`Admin account created!\nEmail: ${result.email}\nPassword: ${result.password}`);
    } catch (err: any) {
      alert(err.response?.data?.detail || 'Failed to create admin account');
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-card">
        <div className="admin-login-header">
          <h1>🔐 Admin Portal</h1>
          <p>NTU Food Management System</p>
        </div>

        <form onSubmit={handleLogin} className="admin-login-form">
          <div className="form-group">
            <label htmlFor="email">Admin Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ntu.edu.sg"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? 'Logging in...' : 'Login to Admin Panel'}
          </button>
        </form>

        <div className="admin-login-footer">
          <button onClick={handleSeedAdmin} className="seed-button">
            Create Default Admin Account
          </button>
          <p className="back-link">
            <a href="/login">← Back to Student Login</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;