import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, User, Loader2, KeyRound, Eye, EyeOff, AlertCircle, Building2, GraduationCap, ShieldCheck, HeartPulse } from 'lucide-react';
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

      if (response.user.mustChangePassword) {
        toast('🔒 Please change your password for security', { duration: 5000 });
      } else {
        toast.success(`Welcome back, ${response.user.username}!`);
      }

      if (response.user.role === ROLES.HOSPITAL) {
        navigate('/hospital/dashboard');
      } else if (response.user.role === ROLES.STUDENT) {
        navigate('/student/dashboard');
      } else if (response.user.role === ROLES.VERIFIER) {
        navigate('/institution/dashboard');
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
    <div className="auth-shell min-h-screen flex items-center justify-center relative overflow-hidden p-4">

      <div className="auth-card w-full max-w-5xl flex flex-col md:flex-row bg-white rounded-[28px] overflow-hidden z-10">
        
        {/* Left Branding Side */}
        <div className="auth-aside hidden md:flex md:w-1/2 text-white flex-col justify-between p-10 relative overflow-hidden">
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full border border-white/10"></div>
          <div className="absolute -left-24 bottom-4 w-56 h-56 rounded-full border border-white/10"></div>
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-11 h-11 rounded-2xl brand-mark flex items-center justify-center">
              <HeartPulse size={24} className="text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight text-white">MedVerify</span>
          </div>

          <div className="my-auto py-8 relative z-10 flex flex-col items-center text-center">
            {/* 3D Realistic Floating Shield Image */}
            <div className="w-44 h-44 mb-6 relative animate-float">
              <img 
                src="/medical_shield_3d.jpg" 
                alt="3D Medical Shield" 
                className="w-full h-full object-contain rounded-3xl drop-shadow-[0_20px_25px_rgba(0,0,0,0.35)]" 
              />
            </div>

            <p className="text-[11px] uppercase tracking-[0.2em] text-teal-200 font-bold mb-3">Secure medical records</p>
            <h1 className="text-3xl font-black text-white mb-3 leading-tight tracking-tight">
              Trust, verified.
            </h1>
            <p className="text-emerald-50 text-sm font-medium">
              Issue, protect, and verify medical certificates with confidence.
            </p>
          </div>

          <div className="text-xs text-emerald-100/80 border-t border-white/20 pt-3 relative z-10 text-center font-medium">
            MedVerify Platform
          </div>
        </div>

        {/* Right Form Side */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-white">
          <div className="md:hidden flex items-center justify-center mb-6 gap-2">
          <div className="w-10 h-10 rounded-2xl brand-mark flex items-center justify-center text-white shadow-sm">
              <HeartPulse size={22} />
            </div>
            <h1 className="text-2xl font-black gradient-text">MedVerify</h1>
          </div>

          <div className="mb-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-teal-700 mb-2">Welcome back</p>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sign in to MedVerify</h2>
            <p className="text-slate-500 text-sm font-medium mt-1">Access your secure workspace.</p>
          </div>

          {error && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2.5 text-red-700 text-xs font-semibold animate-shake">
              <AlertCircle size={16} className="shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Username</label>
              <div className="field-with-icon relative">
                <span className="field-icon absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <User size={18} />
                </span>
                <input 
                  type="text" 
                  className="form-input"
                  placeholder="Enter your username" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="field-with-icon field-with-icon--action relative">
                <span className="field-icon absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                  <Lock size={18} />
                </span>
                <input 
                  type={showPassword ? "text" : "password"} 
                  className="form-input"
                  placeholder="Enter password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-mint w-full py-3.5 text-base mt-2"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Sign In'}
            </button>
          </form>

          {/* Register Section */}
          <div className="mt-6 pt-5 border-t border-emerald-100/80">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 text-center">New User? Register As:</p>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => navigate('/signup/hospital')}
                className="py-2.5 px-2 bg-rose-50/60 border border-rose-100 hover:border-rose-300 rounded-2xl flex flex-col items-center gap-1.5 text-center transition-all hover:bg-rose-100/70 group shadow-2xs"
              >
                <div className="w-8 h-8 rounded-xl bg-white border border-rose-200 text-rose-600 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 size={17} />
                </div>
                <span className="text-[11px] font-bold text-slate-700">Hospital</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/signup/student')}
                className="py-2.5 px-2 bg-pink-50/60 border border-pink-100 hover:border-pink-300 rounded-2xl flex flex-col items-center gap-1.5 text-center transition-all hover:bg-pink-100/70 group shadow-2xs"
              >
                <div className="w-8 h-8 rounded-xl bg-white border border-pink-200 text-pink-600 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  <GraduationCap size={17} />
                </div>
                <span className="text-[11px] font-bold text-slate-700">Student</span>
              </button>
              <button
                type="button"
                onClick={() => navigate('/signup/institution')}
                className="py-2.5 px-2 bg-emerald-50/60 border border-emerald-100 hover:border-emerald-300 rounded-2xl flex flex-col items-center gap-1.5 text-center transition-all hover:bg-emerald-100/70 group shadow-2xs"
              >
                <div className="w-8 h-8 rounded-xl bg-white border border-emerald-200 text-emerald-600 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                  <ShieldCheck size={17} />
                </div>
                <span className="text-[11px] font-bold text-slate-700">Verifier</span>
              </button>
            </div>
          </div>

          <div className="mt-4 pt-3 text-center">
            <button 
              type="button"
              onClick={() => navigate('/verify')} 
              className="text-xs text-emerald-700 hover:text-emerald-900 font-bold transition-colors underline"
            >
              Public Certificate Verifier →
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;
