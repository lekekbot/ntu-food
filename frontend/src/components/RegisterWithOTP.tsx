import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const RegisterWithOTP = () => {
  const navigate = useNavigate();
  // const { login } = useAuth();

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
  // TEMPORARY: Accept any valid email (NTU email servers block unknown senders)
  // TO REVERT: Uncomment the NTU domain check when NTU IT whitelists the sender
  const validateEmail = (email) => {
    // Basic email format validation only
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';

    // TO REVERT TO NTU-ONLY: Uncomment code below and delete the "return '';" above
    // const emailLower = email.toLowerCase();
    // if (!emailLower.endsWith('@e.ntu.edu.sg') && !emailLower.endsWith('@ntu.edu.sg')) {
    //   return 'Please use your NTU email address (@e.ntu.edu.sg or @ntu.edu.sg)';
    // }
    // return '';
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
      const response = await fetch('https://ntu-food-production.up.railway.app/api/auth/otp/register', {
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
      const response = await fetch('https://ntu-food-production.up.railway.app/api/auth/otp/verify-otp', {
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
      const response = await fetch('https://ntu-food-production.up.railway.app/api/auth/otp/resend-otp', {
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
    <div className="w-full min-h-screen flex overflow-hidden font-sans bg-white">
      <div className="flex w-full min-h-screen max-md:flex-col">
        {/* Left side - Branding */}
        <div className="flex-[0_0_60%] bg-gradient-to-br from-blue-900 via-blue-500 to-orange-500 flex flex-col justify-center items-center p-12 text-white relative overflow-hidden max-lg:flex-[0_0_50%] max-md:flex-none max-md:min-h-[40vh] max-md:p-8">
          {/* Grid pattern overlay */}
          <div className="absolute inset-0 opacity-30 pointer-events-none" style={{
            backgroundImage: `url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(255,255,255,0.1)" stroke-width="0.5"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>')`
          }}></div>

          <div className="relative z-10 text-center max-w-[500px]">
            <div className="text-6xl font-black mb-6 bg-gradient-to-br from-white to-amber-300 bg-clip-text text-transparent max-[480px]:text-5xl">
              🍽️
            </div>
            <h1 className="text-4xl font-bold mb-4 drop-shadow-md max-[480px]:text-3xl">
              NTU Food
            </h1>
            <p className="text-xl opacity-90 mb-8 leading-relaxed">
              Join the smart food ordering revolution at NTU
            </p>
            <ul className="list-none p-0 m-0">
              <li className="flex items-center mb-4 text-lg opacity-90 before:content-['✓'] before:bg-white/20 before:text-white before:w-6 before:h-6 before:rounded-full before:flex before:items-center before:justify-center before:mr-3 before:font-bold before:text-sm">
                Exclusive for NTU students and staff
              </li>
              <li className="flex items-center mb-4 text-lg opacity-90 before:content-['✓'] before:bg-white/20 before:text-white before:w-6 before:h-6 before:rounded-full before:flex before:items-center before:justify-center before:mr-3 before:font-bold before:text-sm">
                Secure email verification
              </li>
              <li className="flex items-center mb-4 text-lg opacity-90 before:content-['✓'] before:bg-white/20 before:text-white before:w-6 before:h-6 before:rounded-full before:flex before:items-center before:justify-center before:mr-3 before:font-bold before:text-sm">
                Skip queues, save time
              </li>
              <li className="flex items-center mb-4 text-lg opacity-90 before:content-['✓'] before:bg-white/20 before:text-white before:w-6 before:h-6 before:rounded-full before:flex before:items-center before:justify-center before:mr-3 before:font-bold before:text-sm">
                Real-time order tracking
              </li>
            </ul>
          </div>
        </div>

        {/* Right side - Registration Form or OTP */}
        <div className="flex-[0_0_40%] bg-white flex flex-col justify-center p-12 min-w-0 max-lg:flex-[0_0_50%] max-md:flex-1 max-md:min-h-[60vh] max-[480px]:p-6">
          <div className="max-w-[420px] w-full mx-auto max-[480px]:m-4 max-[480px]:p-8">
            {step === 1 ? (
              // Step 1: Registration Form
              <>
                <div className="text-center mb-12">
                  <h1 className="text-blue-900 text-4xl font-extrabold m-0 mb-2 bg-gradient-to-br from-blue-900 to-blue-500 bg-clip-text text-transparent max-[480px]:text-3xl">
                    Create Account
                  </h1>
                  <h2 className="text-slate-500 text-lg font-medium m-0">
                    Register with your NTU credentials
                  </h2>
                </div>

                <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-6">
                  {error && (
                    <div className="bg-gradient-to-br from-red-50 to-red-100 text-red-600 px-5 py-4 rounded-xl border border-red-200 text-[0.95rem] font-medium mb-2">
                      {error}
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <label htmlFor="name" className="font-semibold text-gray-700 text-[0.95rem] tracking-wide">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      required
                      className="px-5 py-4 border-2 border-gray-200 rounded-xl text-base transition-all duration-200 bg-gray-50 min-h-[56px] focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] focus:-translate-y-0.5 max-[480px]:px-4 max-[480px]:py-3.5"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="ntu_email" className="font-semibold text-gray-700 text-[0.95rem] tracking-wide">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      id="ntu_email"
                      name="ntu_email"
                      value={formData.ntu_email}
                      onChange={handleChange}
                      placeholder="your.email@gmail.com"
                      required
                      className="px-5 py-4 border-2 border-gray-200 rounded-xl text-base transition-all duration-200 bg-gray-50 min-h-[56px] focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] focus:-translate-y-0.5 max-[480px]:px-4 max-[480px]:py-3.5"
                    />
                    <small className="block text-slate-400 text-sm mt-1">Use any email you can access (Gmail, Yahoo, etc.)</small>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="student_id" className="font-semibold text-gray-700 text-[0.95rem] tracking-wide">
                      Student/Staff ID *
                    </label>
                    <input
                      type="text"
                      id="student_id"
                      name="student_id"
                      value={formData.student_id}
                      onChange={handleChange}
                      placeholder="U1234567A"
                      maxLength={9}
                      style={{ textTransform: 'uppercase' }}
                      required
                      className="px-5 py-4 border-2 border-gray-200 rounded-xl text-base transition-all duration-200 bg-gray-50 min-h-[56px] focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] focus:-translate-y-0.5 max-[480px]:px-4 max-[480px]:py-3.5"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="phone" className="font-semibold text-gray-700 text-[0.95rem] tracking-wide">
                      Singapore Mobile Number *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handlePhoneChange}
                      placeholder="+65 9123 4567"
                      required
                      className="px-5 py-4 border-2 border-gray-200 rounded-xl text-base transition-all duration-200 bg-gray-50 min-h-[56px] focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] focus:-translate-y-0.5 max-[480px]:px-4 max-[480px]:py-3.5"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="password" className="font-semibold text-gray-700 text-[0.95rem] tracking-wide">
                      Password *
                    </label>
                    <input
                      type="password"
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 8 characters"
                      required
                      className="px-5 py-4 border-2 border-gray-200 rounded-xl text-base transition-all duration-200 bg-gray-50 min-h-[56px] focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] focus:-translate-y-0.5 max-[480px]:px-4 max-[480px]:py-3.5"
                    />
                    <small className="block text-slate-400 text-sm mt-1">
                      Must contain uppercase, lowercase, and numbers
                    </small>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="confirmPassword" className="font-semibold text-gray-700 text-[0.95rem] tracking-wide">
                      Confirm Password *
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Re-enter your password"
                      required
                      className="px-5 py-4 border-2 border-gray-200 rounded-xl text-base transition-all duration-200 bg-gray-50 min-h-[56px] focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] focus:-translate-y-0.5 max-[480px]:px-4 max-[480px]:py-3.5"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label htmlFor="dietary_preferences" className="font-semibold text-gray-700 text-[0.95rem] tracking-wide">
                      Dietary Preferences (Optional)
                    </label>
                    <textarea
                      id="dietary_preferences"
                      name="dietary_preferences"
                      value={formData.dietary_preferences}
                      onChange={handleChange}
                      placeholder="e.g., Vegetarian, No pork, Halal, etc."
                      rows={3}
                      className="px-5 py-4 border-2 border-gray-200 rounded-xl text-base transition-all duration-200 bg-gray-50 focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] focus:-translate-y-0.5"
                    />
                  </div>

                  <button
                    type="submit"
                    className="bg-gradient-to-br from-blue-900 to-blue-500 text-white border-none px-8 py-5 rounded-xl text-lg font-semibold cursor-pointer transition-all duration-300 min-h-[56px] mt-2 uppercase tracking-wider hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_12px_24px_-8px_rgba(59,130,246,0.4)] hover:enabled:bg-gradient-to-br hover:enabled:from-blue-800 hover:enabled:to-blue-600 active:enabled:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none max-[480px]:px-6 max-[480px]:py-4 max-[480px]:text-base"
                    disabled={loading}
                  >
                    {loading ? 'Sending OTP...' : 'Send Verification Code'}
                  </button>
                </form>

                <div className="text-center mt-8 pt-8 border-t border-gray-100">
                  <p className="text-slate-500 m-0 text-base">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="text-blue-500 no-underline font-semibold transition-colors duration-200 hover:text-blue-800 hover:underline"
                    >
                      Sign in
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              // Step 2: OTP Verification
              <div className="w-full max-w-[480px] mx-auto">
                {/* Testing Mode Banner - Only show if testing_otp is provided */}
                {testingOtp && (
                  <div className="bg-gradient-to-br from-amber-100 to-amber-400 border-2 border-amber-500 rounded-xl p-4 mb-6 text-center shadow-[0_4px_12px_rgba(245,158,11,0.15)]">
                    <h3 className="text-amber-900 text-lg font-bold m-0 mb-2 flex items-center justify-center gap-2">
                      🧪 Demo Mode Active
                    </h3>
                    <p className="text-amber-950 text-[0.95rem] m-0 leading-normal">
                      In production, the OTP would be emailed to you. For this demo, it's displayed below.
                    </p>
                  </div>
                )}

                <div className="text-center mb-12">
                  <h1 className="text-blue-900 text-4xl font-extrabold m-0 mb-2 bg-gradient-to-br from-blue-900 to-blue-500 bg-clip-text text-transparent max-[480px]:text-3xl">
                    Verify Your Email
                  </h1>
                  <h2 className="text-slate-500 text-lg font-medium m-0">
                    Enter the 6-digit code {testingOtp ? 'shown below' : 'sent to'}
                  </h2>
                  <p className="text-blue-500 font-semibold text-lg my-2">{userEmail}</p>
                </div>

                {/* Testing OTP Display - Only show if testing_otp is provided */}
                {testingOtp && (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-[3px] border-blue-500 rounded-2xl p-6 my-6 text-center relative shadow-[0_8px_25px_rgba(59,130,246,0.15)] before:content-['🔐'] before:absolute before:top-[-15px] before:left-1/2 before:-translate-x-1/2 before:bg-white before:px-2 before:text-2xl">
                    <div className="text-blue-800 text-base font-semibold m-0 mb-4 uppercase tracking-wider">
                      Your Verification Code
                    </div>
                    <div className="font-mono text-[2.5rem] font-bold text-blue-900 tracking-[8px] my-2 p-3 bg-white rounded-xl border-2 border-dashed border-blue-300 inline-block min-w-[200px] shadow-[0_4px_12px_rgba(59,130,246,0.1)] max-[480px]:text-[2rem] max-[480px]:tracking-[4px] max-[480px]:min-w-[160px]">
                      {testingOtp}
                    </div>
                    <button
                      type="button"
                      className={`${copySuccess ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 animate-[copySuccess_0.3s_ease]' : 'bg-gradient-to-br from-green-500 to-green-600'} text-white border-none py-3 px-6 rounded-lg text-[0.95rem] font-semibold cursor-pointer transition-all duration-200 mt-4 inline-flex items-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(16,185,129,0.3)] active:translate-y-0`}
                      onClick={copyOtpToClipboard}
                    >
                      {copySuccess ? '✅ Copied & Auto-filled!' : '📋 Copy & Auto-fill OTP'}
                    </button>
                    <div className="bg-gradient-to-br from-slate-50 to-slate-200 border-l-4 border-slate-500 rounded-lg p-4 mt-4 text-slate-600 text-sm">
                      <strong className="text-slate-800">Demo Note:</strong> In production, this code would be sent to your NTU email address.
                      Click the button above to automatically fill the verification fields below.
                    </div>
                  </div>
                )}

                <form onSubmit={handleOtpSubmit} className="flex flex-col gap-6">
                  {error && (
                    <div className="bg-gradient-to-br from-red-50 to-red-100 text-red-600 px-5 py-4 rounded-xl border border-red-200 text-[0.95rem] font-medium mb-2">
                      {error}
                    </div>
                  )}

                  <div className="flex gap-3 justify-center my-8 max-[480px]:gap-2">
                    {otp.map((digit, index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onPaste={index === 0 ? handleOtpPaste : undefined}
                        required
                        className="w-[55px] h-[55px] border-2 border-gray-200 rounded-xl text-2xl font-semibold text-center transition-all duration-200 bg-gray-50 text-blue-900 focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] focus:-translate-y-0.5 valid:border-green-500 valid:bg-green-50 max-[480px]:w-[45px] max-[480px]:h-[45px] max-[480px]:text-xl"
                      />
                    ))}
                  </div>

                  <button
                    type="submit"
                    className="bg-gradient-to-br from-blue-900 to-blue-500 text-white border-none px-8 py-5 rounded-xl text-lg font-semibold cursor-pointer transition-all duration-300 min-h-[56px] mt-2 uppercase tracking-wider hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_12px_24px_-8px_rgba(59,130,246,0.4)] hover:enabled:bg-gradient-to-br hover:enabled:from-blue-800 hover:enabled:to-blue-600 active:enabled:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none max-[480px]:px-6 max-[480px]:py-4 max-[480px]:text-base"
                    disabled={loading}
                  >
                    {loading ? 'Verifying...' : 'Verify & Create Account'}
                  </button>

                  <div className="flex gap-4 mt-4 max-[480px]:flex-col">
                    <button
                      type="button"
                      className="flex-1 py-3.5 px-6 border-2 border-gray-200 rounded-xl bg-white text-slate-500 font-semibold text-[0.95rem] cursor-pointer transition-all duration-200 hover:enabled:border-blue-500 hover:enabled:text-blue-500 hover:enabled:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed max-[480px]:w-full"
                      onClick={handleResendOtp}
                      disabled={resendTimer > 0 || loading}
                    >
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                    </button>

                    <button
                      type="button"
                      className="flex-1 py-3.5 px-6 border-2 border-gray-200 rounded-xl bg-white text-slate-500 font-semibold text-[0.95rem] cursor-pointer transition-all duration-200 hover:enabled:border-blue-500 hover:enabled:text-blue-500 hover:enabled:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed max-[480px]:w-full"
                      onClick={() => setStep(1)}
                      disabled={loading}
                    >
                      ← Back to Registration
                    </button>
                  </div>
                </form>

                <div className="bg-gradient-to-br from-slate-50 to-indigo-50 rounded-xl p-5 mt-8 text-center">
                  {testingOtp ? (
                    <>
                      <p className="my-2 text-slate-600 text-[0.95rem] font-semibold text-slate-700">
                        🧪 Demo Mode: OTP is displayed above
                      </p>
                      <p className="my-2 text-slate-600 text-[0.95rem]">
                        The code expires in 10 minutes
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="my-2 text-slate-600 text-[0.95rem] font-semibold text-slate-700">
                        📧 Check your email inbox
                      </p>
                      <p className="my-2 text-slate-600 text-[0.95rem]">
                        We've sent a verification code to your email. The code expires in 10 minutes.
                      </p>
                      <p className="my-2 text-amber-600 text-sm font-medium">
                        ⚠️ Don't forget to check your spam folder!
                      </p>
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
