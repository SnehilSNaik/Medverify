import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, Loader2, KeyRound, Eye, EyeOff, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/constants';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!username || !password) {
      toast.error('Please enter both username and password');
      return;
    }

    setLoading(true);
    setError('');
    try {
      const response = await authService.login(username, password);
      setAuth(response.user, response.accessToken);

      // Check if user must change password on first login
      if (response.user.mustChangePassword) {
        toast('🔒 Please change your password for security', { duration: 5000 });
      } else {
        toast.success(`Welcome back, ${response.user.username}!`);
      }

      if (response.user.role === ROLES.ADMIN) {
        navigate('/admin/dashboard');
      } else if (response.user.role === ROLES.HOSPITAL) {
        navigate('/hospital/dashboard');
      } else {
        navigate('/verify');
      }
    } catch (error) {
      const message = error.response?.data?.message || 'Invalid username or password';
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] relative overflow-hidden p-4">
      {/* Dynamic ambient glowing background */}
      <div className="absolute top-[-15%] left-[-15%] w-[500px] h-[500px] bg-[#00d4ff] opacity-15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[500px] h-[500px] bg-[#7c3aed] opacity-15 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="w-full max-w-4xl flex flex-col md:flex-row glass-panel overflow-hidden z-10 border border-[rgba(255,255,255,0.12)] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        {/* Left Branding Side */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-[rgba(0,212,255,0.08)] via-[rgba(10,15,30,0.5)] to-[rgba(124,58,237,0.1)] flex-col justify-between p-10 border-r border-[rgba(255,255,255,0.08)] relative">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.25)] rounded-xl">
              <Shield size={28} className="text-[#00d4ff]" />
            </div>
            <span className="text-2xl font-bold gradient-text tracking-wide">MedVerify</span>
          </div>

          <div className="my-auto py-8">
            <div className="w-16 h-16 bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)] rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,212,255,0.2)]">
              <KeyRound size={32} className="text-[#00d4ff]" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3 leading-tight">Securing Medical Truth & Integrity</h1>
            <p className="text-gray-400 text-sm leading-relaxed">
              Cryptographically verified medical certificates using SHA-256 hashing and RSA 2048-bit digital signatures to eliminate forgery.
            </p>

            {/* Security Features */}
            <div className="mt-8 space-y-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Security Features:</p>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-[#00d4ff]"></div>
                <span>RSA 2048-bit Digital Signatures</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-[#7c3aed]"></div>
                <span>SHA-256 Certificate Hashing</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-[#22c55e]"></div>
                <span>Account Lockout & Rate Limiting</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-300">
                <div className="w-1.5 h-1.5 rounded-full bg-[#f59e0b]"></div>
                <span>Complete Audit Trail Logging</span>
              </div>
            </div>
          </div>

          <div className="text-xs text-gray-500 border-t border-[rgba(255,255,255,0.05)] pt-4">
            Protected by Cryptographic Signatures • MedVerify Platform
          </div>
        </div>

        {/* Right Form Side */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-[rgba(10,15,30,0.85)] backdrop-blur-2xl">
          <div className="md:hidden flex items-center justify-center mb-6 gap-2">
            <Shield className="text-[#00d4ff]" size={28} />
            <h1 className="text-2xl font-bold gradient-text">MedVerify</h1>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">Welcome Back</h2>
            <p className="text-gray-400 text-sm">Sign in to your authorized account</p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] rounded-xl flex items-center gap-2 text-[#ef4444] text-sm">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <User size={18} />
                </span>
                <input 
                  type="text" 
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.12)] focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] text-white rounded-xl py-3 pl-11 pr-4 text-sm outline-none transition-all placeholder:text-gray-600" 
                  placeholder="Enter username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-500">
                  <Lock size={18} />
                </span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.12)] focus:border-[#00d4ff] focus:ring-1 focus:ring-[#00d4ff] text-white rounded-xl py-3 pl-11 pr-12 text-sm outline-none transition-all placeholder:text-gray-600" 
                  placeholder="Enter password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[#00d4ff] to-[#0077ff] hover:from-[#00b8e6] hover:to-[#0066ee] text-white font-semibold rounded-xl text-sm transition-all shadow-[0_4px_20px_rgba(0,212,255,0.35)] flex items-center justify-center gap-2 mt-2"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In to Portal'}
            </button>
          </form>

          {/* New Account / Sign up Prompt */}
          <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.08)] flex items-center justify-between text-xs">
            <span className="text-gray-400">Don't have an account?</span>
            <button
              type="button"
              onClick={() => navigate('/signup')}
              className="text-[#00d4ff] hover:text-white font-semibold underline transition-colors"
            >
              Register Organization →
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-[rgba(255,255,255,0.05)] text-center">
            <p className="text-xs text-gray-400">Need to verify a medical certificate without logging in?</p>
            <button 
              type="button"
              onClick={() => navigate('/verify')} 
              className="mt-1.5 text-xs text-gray-300 hover:text-[#00d4ff] font-medium transition-colors underline"
            >
              Open Public Verifier Portal →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
