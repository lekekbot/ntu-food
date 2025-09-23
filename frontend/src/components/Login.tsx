import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    ntu_email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData);

    if (result.success) {
      navigate('/stalls');
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* Left side - Branding */}
        <div className="auth-branding">
          <div className="branding-content">
            <div className="branding-logo">🍽️</div>
            <h1 className="branding-title">NTU Food</h1>
            <p className="branding-subtitle">
              Smart food ordering for Nanyang Technological University students
            </p>
            <ul className="branding-features">
              <li>Skip the queues with virtual ordering</li>
              <li>Real-time order tracking</li>
              <li>Smart queue management</li>
              <li>Campus-wide stall selection</li>
            </ul>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="auth-form-section">
          <div className="auth-form-container">
            <div className="auth-header">
              <h1>NTU Food</h1>
              <h2>Welcome back! Please sign in to your account</h2>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              {error && <div className="error-message">{error}</div>}

              <div className="form-group">
                <label htmlFor="ntu_email">NTU Email Address</label>
                <input
                  type="email"
                  id="ntu_email"
                  name="ntu_email"
                  value={formData.ntu_email}
                  onChange={handleChange}
                  placeholder="your.name@e.ntu.edu.sg"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <button
                type="submit"
                className="auth-button"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Don't have an account?{' '}
                <Link to="/register" className="auth-link">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;