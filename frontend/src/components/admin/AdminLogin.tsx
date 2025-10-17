import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAuthApi } from '../../services/adminApi';

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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#667eea] to-[#764ba2] p-5">
      <div className="bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.3)] p-10 w-full max-w-[450px]">
        <div className="text-center mb-[30px]">
          <h1 className="text-[#667eea] m-0 mb-2.5 text-[32px]">🔐 Admin Portal</h1>
          <p className="text-gray-600 m-0 text-base">NTU Food Management System</p>
        </div>

        <form onSubmit={handleLogin} className="mb-6">
          <div className="mb-5">
            <label htmlFor="email" className="block mb-2 text-gray-800 font-semibold text-sm">
              Admin Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@ntu.edu.sg"
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-[15px] transition-colors duration-300 box-border focus:outline-none focus:border-[#667eea]"
            />
          </div>

          <div className="mb-5">
            <label htmlFor="password" className="block mb-2 text-gray-800 font-semibold text-sm">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-[15px] transition-colors duration-300 box-border focus:outline-none focus:border-[#667eea]"
            />
          </div>

          {error && (
            <div className="bg-red-50 text-red-800 p-3 rounded-lg mb-4 text-sm border-l-4 border-red-800">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-br from-[#667eea] to-[#764ba2] text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-200 hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_6px_20px_rgba(102,126,234,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Login to Admin Panel'}
          </button>
        </form>

        <div className="text-center pt-5 border-t border-gray-300">
          <button
            onClick={handleSeedAdmin}
            className="py-2.5 px-5 bg-gray-100 border border-gray-300 rounded-md text-[13px] cursor-pointer mb-4 transition-colors duration-200 hover:bg-gray-300"
          >
            Create Default Admin Account
          </button>
          <p className="mt-4">
            <a href="/login" className="text-[#667eea] no-underline text-sm hover:underline">
              ← Back to Student Login
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
