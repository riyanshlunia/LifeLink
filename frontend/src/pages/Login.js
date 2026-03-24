import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { FiHeart, FiMail, FiLock } from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  if (isAuthenticated) {
    if (user.role === 'admin') return <Navigate to="/dashboard" replace />;
    if (user.role === 'hospital_staff') return <Navigate to="/hospital-dashboard" replace />;
    if (user.role === 'doctor') return <Navigate to="/doctor-dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const userData = await login(email, password);
      toast.success('Login successful!');
      
      // Navigate based on role
      if (userData.role === 'admin') {
        navigate('/dashboard');
      } else if (userData.role === 'hospital_staff') {
        navigate('/hospital-dashboard');
      } else if (userData.role === 'doctor') {
        navigate('/doctor-dashboard');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const demoAccounts = [
    { email: 'admin@hospital.com', password: 'Admin@123', role: 'Admin' },
    { email: 'staff1@hospital.com', password: 'Staff@123', role: 'Hospital Staff' },
    { email: 'doctor1@hospital.com', password: 'Doctor@123', role: 'Doctor' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] relative overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-zinc-800 blur-3xl opacity-20"></div>
        <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-zinc-800 blur-3xl opacity-20"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 rounded-full bg-zinc-900 blur-3xl opacity-20"></div>
      </div>

      <div className="max-w-md w-full relative z-10 px-4">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl mb-4">
            <FiHeart className="text-3xl text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
            LifeLink
          </h1>
          <p className="text-zinc-500 text-sm font-medium uppercase tracking-wider">Organ Donation Management</p>
        </div>

        {/* Login Form */}
        <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl shadow-2xl border border-zinc-800 p-8">
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white">Welcome back</h2>
            <p className="text-zinc-400 text-sm mt-1">Please sign in to access your dashboard</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-medium text-zinc-300 block mb-1.5">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-zinc-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-zinc-600 transition-colors placeholder-zinc-600"
                  placeholder="name@hospital.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-zinc-300 block mb-1.5">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-zinc-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-white focus:outline-none focus:border-zinc-600 transition-colors placeholder-zinc-600"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-white text-black font-bold py-2.5 rounded-lg hover:bg-zinc-200 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Signing in...
                </span>
              ) : 'Sign In'}
            </button>
          </form>

          {/* Demo Accounts */}
          <div className="mt-8 pt-6 border-t border-zinc-800">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-4">Quick Access</p>
            <div className="grid grid-cols-1 gap-2">
              {demoAccounts.map((account, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setEmail(account.email);
                    setPassword(account.password);
                  }}
                  className="flex items-center justify-between p-2.5 bg-zinc-950 hover:bg-zinc-800 rounded-lg text-sm group transition-all border border-zinc-800 hover:border-zinc-700"
                >
                  <div className="flex flex-col items-start">
                    <span className="font-medium text-zinc-300 group-hover:text-white">{account.role}</span>
                    <span className="text-xs text-zinc-500">{account.email}</span>
                  </div>
                  <div className="text-xs font-bold text-black bg-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                    Autofill
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-zinc-500 text-xs mt-8">
          © 2026 LifeLink System. Secure & Confidential.
        </p>
      </div>
    </div>
  );
};

export default Login;
