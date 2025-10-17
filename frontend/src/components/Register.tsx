import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    ntu_email: '',
    student_id: '',
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dietary_preferences: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (!formData.ntu_email.endsWith('@e.ntu.edu.sg')) {
      setError('Please use a valid NTU email address (@e.ntu.edu.sg)');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    const registrationData = { ...formData };
    delete registrationData.confirmPassword;
    const result = await register(registrationData);

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
              Join thousands of NTU students who skip the queue with smart food ordering
            </p>
            <ul className="branding-features">
              <li>Instant access to all campus stalls</li>
              <li>Secure NTU student verification</li>
              <li>Personalized order preferences</li>
              <li>Real-time pickup notifications</li>
            </ul>
          </div>
        </div>

        {/* Right side - Registration Form */}
        <div className="auth-form-section">
          <div className="auth-form-container">
            <div className="auth-header">
              <h1>NTU Food</h1>
              <h2>Create your student account</h2>
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
                <label htmlFor="student_id">Student ID</label>
                <input
                  type="text"
                  id="student_id"
                  name="student_id"
                  value={formData.student_id}
                  onChange={handleChange}
                  placeholder="U2024001A"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+65 9123 4567"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="dietary_preferences">Dietary Preferences (Optional)</label>
                <input
                  type="text"
                  id="dietary_preferences"
                  name="dietary_preferences"
                  value={formData.dietary_preferences}
                  onChange={handleChange}
                  placeholder="e.g., Vegetarian, Halal, No spicy food"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Create Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter a secure password (6+ characters)"
                  required
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm your password"
                  required
                />
              </div>

              <button
                type="submit"
                className="auth-button"
                disabled={loading}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            <div className="auth-footer">
              <p>
                Already have an account?{' '}
                <Link to="/login" className="auth-link">
                  Sign in instead
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;