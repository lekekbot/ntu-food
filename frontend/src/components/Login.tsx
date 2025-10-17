import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

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
    <div className="w-full min-h-screen flex overflow-hidden font-sans bg-white">
      <div className="flex w-full min-h-screen">
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
              Smart food ordering for Nanyang Technological University students
            </p>
            <ul className="list-none p-0 m-0">
              <li className="flex items-center mb-4 text-lg opacity-90 before:content-['✓'] before:bg-white/20 before:text-white before:w-6 before:h-6 before:rounded-full before:flex before:items-center before:justify-center before:mr-3 before:font-bold before:text-sm">
                Skip the queues with virtual ordering
              </li>
              <li className="flex items-center mb-4 text-lg opacity-90 before:content-['✓'] before:bg-white/20 before:text-white before:w-6 before:h-6 before:rounded-full before:flex before:items-center before:justify-center before:mr-3 before:font-bold before:text-sm">
                Real-time order tracking
              </li>
              <li className="flex items-center mb-4 text-lg opacity-90 before:content-['✓'] before:bg-white/20 before:text-white before:w-6 before:h-6 before:rounded-full before:flex before:items-center before:justify-center before:mr-3 before:font-bold before:text-sm">
                Smart queue management
              </li>
              <li className="flex items-center mb-4 text-lg opacity-90 before:content-['✓'] before:bg-white/20 before:text-white before:w-6 before:h-6 before:rounded-full before:flex before:items-center before:justify-center before:mr-3 before:font-bold before:text-sm">
                Campus-wide stall selection
              </li>
            </ul>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="flex-[0_0_40%] bg-white flex flex-col justify-center p-12 min-w-0 max-lg:flex-[0_0_50%] max-md:flex-1 max-md:min-h-[60vh] max-[480px]:p-6">
          <div className="max-w-[420px] w-full mx-auto max-[480px]:m-4 max-[480px]:p-8">
            <div className="text-center mb-12">
              <h1 className="text-blue-900 text-4xl font-extrabold m-0 mb-2 bg-gradient-to-br from-blue-900 to-blue-500 bg-clip-text text-transparent max-[480px]:text-3xl">
                NTU Food
              </h1>
              <h2 className="text-slate-500 text-lg font-medium m-0">
                Welcome back! Please sign in to your account
              </h2>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {error && (
                <div className="bg-gradient-to-br from-red-50 to-red-100 text-red-600 px-5 py-4 rounded-xl border border-red-200 text-[0.95rem] font-medium mb-2">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label htmlFor="ntu_email" className="font-semibold text-gray-700 text-[0.95rem] tracking-wide">
                  NTU Email Address
                </label>
                <input
                  type="email"
                  id="ntu_email"
                  name="ntu_email"
                  value={formData.ntu_email}
                  onChange={handleChange}
                  placeholder="your.name@e.ntu.edu.sg"
                  required
                  className="px-5 py-4 border-2 border-gray-200 rounded-xl text-base transition-all duration-200 bg-gray-50 min-h-[56px] focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] focus:-translate-y-0.5 invalid:border-red-500 valid:border-green-500 focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 max-[480px]:px-4 max-[480px]:py-3.5"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="password" className="font-semibold text-gray-700 text-[0.95rem] tracking-wide">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  required
                  className="px-5 py-4 border-2 border-gray-200 rounded-xl text-base transition-all duration-200 bg-gray-50 min-h-[56px] focus:outline-none focus:border-blue-500 focus:bg-white focus:shadow-[0_0_0_4px_rgba(59,130,246,0.1)] focus:-translate-y-0.5 invalid:border-red-500 valid:border-green-500 focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 max-[480px]:px-4 max-[480px]:py-3.5"
                />
              </div>

              <button
                type="submit"
                className="bg-gradient-to-br from-blue-900 to-blue-500 text-white border-none px-8 py-5 rounded-xl text-lg font-semibold cursor-pointer transition-all duration-300 min-h-[56px] mt-2 uppercase tracking-wider hover:enabled:-translate-y-0.5 hover:enabled:shadow-[0_12px_24px_-8px_rgba(59,130,246,0.4)] hover:enabled:bg-gradient-to-br hover:enabled:from-blue-800 hover:enabled:to-blue-600 active:enabled:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2 max-[480px]:px-6 max-[480px]:py-4 max-[480px]:text-base"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="text-center mt-8 pt-8 border-t border-gray-100">
              <p className="text-slate-500 m-0 text-base">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-blue-500 no-underline font-semibold transition-colors duration-200 hover:text-blue-800 hover:underline focus-visible:outline-2 focus-visible:outline-blue-500 focus-visible:outline-offset-2"
                >
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
