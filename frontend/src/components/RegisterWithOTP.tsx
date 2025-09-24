import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Auth.css';
import './OTPVerification.css';

const RegisterWithOTP = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Form states
  const [step, setStep] = useState(1); // 1: Registration, 2: OTP Verification
  const [formData, setFormData] = useState({
    ntu_email: '',
    student_id: '',
    name: '',
    phone: '',
    password: '',
    confirmPassword: '',
    dietary_preferences: ''
  });

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [userEmail, setUserEmail] = useState('');
  const [testingOtp, setTestingOtp] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  // Validation functions
  const validateEmail = (email) => {
    const emailLower = email.toLowerCase();
    if (!emailLower.endsWith('@e.ntu.edu.sg') && !emailLower.endsWith('@ntu.edu.sg')) {
      return 'Please use your NTU email address (@e.ntu.edu.sg or @ntu.edu.sg)';
    }
    return '';
  };

  const validateStudentId = (id) => {
    const pattern = /^[US]\d{7}[A-Z]$/i;
    if (!pattern.test(id)) {
      return 'Invalid NTU student ID format (e.g., U1234567A)';
    }
    return '';
  };

  const validatePhone = (phone) => {
    const cleanPhone = phone.replace(/[\s-]/g, '');
    const pattern = /^(\+65)?[89]\d{7}$/;
    if (!pattern.test(cleanPhone)) {
      return 'Please enter a valid Singapore mobile number';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (password.length < 8) return 'Password must be at least 8 characters';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter';
    if (!/\d/.test(password)) return 'Password must contain at least one number';
    return '';
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    setError('');
  };

  // Handle phone number formatting
  const handlePhoneChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');

    // Add +65 prefix if not present
    if (!value.startsWith('65')) {
      value = '65' + value;
    }

    // Limit to Singapore phone number length
    if (value.length > 10) {
      value = value.slice(0, 10);
    }

    // Format as +65 XXXX XXXX
    if (value.length > 2) {
      const formatted = '+' + value.slice(0, 2) + ' ' +
                       (value.length > 6 ? value.slice(2, 6) + ' ' + value.slice(6) : value.slice(2));
      setFormData({ ...formData, phone: formatted });
    } else {
      setFormData({ ...formData, phone: '+65 ' });
    }
  };

  // Handle registration form submission
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validate all fields
    const emailError = validateEmail(formData.ntu_email);
    if (emailError) {
      setError(emailError);
      setLoading(false);
      return;
    }

    const idError = validateStudentId(formData.student_id);
    if (idError) {
      setError(idError);
      setLoading(false);
      return;
    }

    const phoneError = validatePhone(formData.phone);
    if (phoneError) {
      setError(phoneError);
      setLoading(false);
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setError(passwordError);
      setLoading(false);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/auth/otp/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ntu_email: formData.ntu_email,
          student_id: formData.student_id.toUpperCase(),
          name: formData.name,
          phone: formData.phone.replace(/\s/g, ''),
          password: formData.password,
          dietary_preferences: formData.dietary_preferences
        })
      });

      const data = await response.json();

      if (response.ok) {
        setUserEmail(formData.ntu_email);
        // Store testing OTP if provided
        if (data.testing_otp) {
          setTestingOtp(data.testing_otp);
        }
        setStep(2);
        startResendTimer();
      } else {
        setError(data.detail || 'Registration failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input changes
  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }

      setError('');
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text');
    const digits = pastedData.replace(/\D/g, '').slice(0, 6);

    if (digits.length === 6) {
      const newOtp = digits.split('');
      setOtp(newOtp);
    }
  };

  // Handle OTP verification
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      setError('Please enter all 6 digits');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/api/auth/otp/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          otp_code: otpCode
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and redirect
        localStorage.setItem('token', data.access_token);
        navigate('/stalls');
      } else {
        setError(data.detail || 'Invalid OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:8000/api/auth/otp/resend-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail
        })
      });

      const data = await response.json();

      if (response.ok) {
        setOtp(['', '', '', '', '', '']);
        // Update testing OTP if provided
        if (data.testing_otp) {
          setTestingOtp(data.testing_otp);
        }
        startResendTimer();
        setError('');
        alert('New OTP generated!');
      } else {
        setError(data.detail || 'Failed to resend OTP');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Copy OTP to clipboard and auto-fill
  const copyOtpToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(testingOtp);
      setCopySuccess(true);

      // Auto-fill OTP inputs
      const otpArray = testingOtp.split('');
      setOtp(otpArray);

      // Reset copy success after animation
      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = testingOtp;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopySuccess(true);

      // Auto-fill OTP inputs
      const otpArray = testingOtp.split('');
      setOtp(otpArray);

      setTimeout(() => {
        setCopySuccess(false);
      }, 2000);
    }
  };

  // Start resend timer
  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
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
              Join the smart food ordering revolution at NTU
            </p>
            <ul className="branding-features">
              <li>Exclusive for NTU students and staff</li>
              <li>Secure email verification</li>
              <li>Skip queues, save time</li>
              <li>Real-time order tracking</li>
            </ul>
          </div>
        </div>

        {/* Right side - Registration Form or OTP */}
        <div className="auth-form-section">
          <div className="auth-form-container">
            {step === 1 ? (
              // Step 1: Registration Form
              <>
                <div className="auth-header">
                  <h1>Create Account</h1>
                  <h2>Register with your NTU credentials</h2>
                </div>

                <form onSubmit={handleRegisterSubmit} className="auth-form">
                  {error && <div className="error-message">{error}</div>}

                  <div className="form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="ntu_email">NTU Email Address *</label>
                    <input
                      type="email"
                      id="ntu_email"
                      name="ntu_email"
                      value={formData.ntu_email}
                      onChange={handleChange}
                      placeholder="your.name@e.ntu.edu.sg"
                      required
                    />
                    <small className="form-hint">Use your official NTU email</small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="student_id">Student/Staff ID *</label>
                    <input
                      type="text"
                      id="student_id"
                      name="student_id"
                      value={formData.student_id}
                      onChange={handleChange}
                      placeholder="U1234567A"
                      maxLength="9"
                      style={{ textTransform: 'uppercase' }}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="phone">Singapore Mobile Number *</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      placeholder="+65 9123 4567"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Password *</label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 8 characters"
                      required
                    />
                    <small className="form-hint">
                      Must contain uppercase, lowercase, and numbers
                    </small>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmPassword">Confirm Password *</label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="dietary_preferences">Dietary Preferences (Optional)</label>
                    <textarea
                      id="dietary_preferences"
                      name="dietary_preferences"
                      value={formData.dietary_preferences}
                      onChange={handleChange}
                      placeholder="e.g., Vegetarian, No pork, Halal, etc."
                      rows="3"
                    />
                  </div>

                  <button
                    type="submit"
                    className="auth-button"
                    disabled={loading}
                  >
                    {loading ? 'Sending OTP...' : 'Send Verification Code'}
                  </button>
                </form>

                <div className="auth-footer">
                  <p>
                    Already have an account?{' '}
                    <Link to="/login" className="auth-link">
                      Sign in
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              // Step 2: OTP Verification
              <div className="otp-verification">
                {/* Testing Mode Banner */}
                {testingOtp && (
                  <div className="testing-mode-banner">
                    <h3>🧪 Demo Mode Active</h3>
                    <p>In production, the OTP would be emailed to you. For this demo, it's displayed below.</p>
                  </div>
                )}

                <div className="auth-header">
                  <h1>Verify Your Email</h1>
                  <h2>Enter the 6-digit code {testingOtp ? 'shown below' : 'sent to'}</h2>
                  <p className="user-email">{userEmail}</p>
                </div>

                {/* Testing OTP Display */}
                {testingOtp && (
                  <div className="otp-display-box">
                    <div className="otp-display-title">Your Verification Code</div>
                    <div className="otp-display-code">{testingOtp}</div>
                    <button
                      type="button"
                      className={`copy-otp-button ${copySuccess ? 'copied' : ''}`}
                      onClick={copyOtpToClipboard}
                    >
                      {copySuccess ? '✅ Copied & Auto-filled!' : '📋 Copy & Auto-fill OTP'}
                    </button>
                    <div className="otp-demo-note">
                      <strong>Demo Note:</strong> In production, this code would be sent to your NTU email address.
                      Click the button above to automatically fill the verification fields below.
                    </div>
                  </div>
                )}

                <form onSubmit={handleOtpSubmit} className="otp-form">
                  {error && <div className="error-message">{error}</div>}

                  <div className="otp-input-group">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength="1"
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onPaste={index === 0 ? handleOtpPaste : undefined}
                        className="otp-input"
                        required
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="auth-button"
                    disabled={loading}
                  >
                    {loading ? 'Verifying...' : 'Verify & Create Account'}
                  </button>

                  <div className="otp-actions">
                    <button
                      type="button"
                      className="resend-button"
                      onClick={handleResendOtp}
                      disabled={resendTimer > 0 || loading}
                    >
                      {resendTimer > 0
                        ? `Resend in ${resendTimer}s`
                        : 'Resend Code'}
                    </button>

                    <button
                      type="button"
                      className="back-button"
                      onClick={() => setStep(1)}
                      disabled={loading}
                    >
                      ← Back to Registration
                    </button>
                  </div>
                </form>

                <div className="otp-info">
                  {testingOtp ? (
                    <>
                      <p>🧪 Demo Mode: OTP is displayed above</p>
                      <p>The code expires in 10 minutes</p>
                    </>
                  ) : (
                    <>
                      <p>📧 Check your NTU email inbox</p>
                      <p>The code expires in 10 minutes</p>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterWithOTP;