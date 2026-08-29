import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Shield, Lock, User, Mail, Building2, Phone, MapPin, 
  FileBadge, CheckCircle2, Eye, EyeOff, Loader2, KeyRound, 
  AlertCircle, Stethoscope, HeartPulse
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import { ROLES } from '../../utils/constants';

const HospitalSignup = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [hospitalName, setHospitalName] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !email || !password || !confirmPassword || !hospitalName || !licenseNumber) {
      setError('Please fill in all mandatory fields');
      toast.error('Please fill in all mandatory fields');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      toast.error('Password must be at least 8 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username: username.trim(),
        email: email.trim(),
        password,
        role: ROLES.HOSPITAL,
        hospitalName: hospitalName.trim(),
        licenseNumber: licenseNumber.trim(),
        phone: phone.trim(),
        address: address.trim(),
      };

      const response = await authService.signup(payload);
      setAuth(response.user, response.accessToken);
      toast.success(`Hospital registered! Welcome, ${response.user.username}`);
      navigate('/hospital/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your details.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50/60 via-white to-pink-50/50 relative overflow-hidden p-4 py-8">
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-rose-200/40 opacity-50 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-pink-200/30 opacity-50 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-4xl flex flex-col md:flex-row bg-white rounded-3xl overflow-hidden z-10 border border-rose-100 shadow-[0_20px_60px_-15px_rgba(244,63,94,0.18)]">
        
        {/* Left Branding Side */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-rose-500 via-pink-500 to-rose-600 text-white flex-col justify-between p-8 relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white">
              <HeartPulse size={24} />
            </div>
            <span className="text-2xl font-extrabold text-white tracking-tight">MedVerify</span>
          </div>

          <div className="my-auto py-8 relative z-10 flex flex-col items-center text-center">
            <div className="w-16 h-16 mb-6 rounded-2xl border border-white/25 bg-white/10 flex items-center justify-center">
              <Building2 size={30} strokeWidth={1.5} />
            </div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-rose-100 font-bold mb-3">Organization access</p>
            <h2 className="text-2xl font-black text-white mb-2 leading-tight">Hospital Portal</h2>
            <p className="text-rose-100 text-xs font-medium">
              Medical Organization Registration
            </p>
          </div>

          <div className="text-[11px] text-rose-100/80 border-t border-white/20 pt-3 relative z-10 text-center font-medium">
            MedVerify Platform
          </div>
        </div>

        {/* Right Form Side */}
        <div className="w-full md:w-7/12 p-6 md:p-8 flex flex-col justify-center bg-white overflow-y-auto max-h-[90vh]">
          <div className="md:hidden flex items-center justify-center mb-4 gap-2">
            <div className="p-2 bg-gradient-to-tr from-rose-500 to-pink-500 rounded-xl text-white">
              <HeartPulse size={22} />
            </div>
            <h1 className="text-xl font-extrabold gradient-text">MedVerify</h1>
          </div>

          <div className="mb-5">
            <h2 className="text-xl font-extrabold text-slate-800 tracking-tight">Register Hospital Organization</h2>
            <p className="text-slate-500 text-xs font-medium">Create your hospital account to start issuing secure medical certificates</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-red-700 text-xs font-semibold">
              <AlertCircle size={15} className="shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-3.5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label">Hospital Name *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Building2 size={15} /></span>
                  <input type="text" className="form-input pl-9" placeholder="e.g. St. Jude Hospital" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="form-label">License Number *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><FileBadge size={15} /></span>
                  <input type="text" className="form-input pl-9" placeholder="e.g. MED-LIC-2024-99" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} required />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label">Username *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><User size={15} /></span>
                  <input type="text" className="form-input pl-9" placeholder="e.g. st_marys_admin" value={username} onChange={(e) => setUsername(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="form-label">Email Address *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Mail size={15} /></span>
                  <input type="email" className="form-input pl-9" placeholder="hospital@domain.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label">Phone</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Phone size={15} /></span>
                  <input type="text" className="form-input pl-9" placeholder="+1-555-0199" value={phone} onChange={(e) => setPhone(e.target.value)} />
                </div>
              </div>
              <div>
                <label className="form-label">Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><MapPin size={15} /></span>
                  <input type="text" className="form-input pl-9" placeholder="742 Medical Drive" value={address} onChange={(e) => setAddress(e.target.value)} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="form-label">Password (min 8) *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Lock size={15} /></span>
                  <input type={showPassword ? "text" : "password"} className="form-input pl-9 pr-9" placeholder="Create password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>
              <div>
                <label className="form-label">Confirm Password *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400"><Lock size={15} /></span>
                  <input type={showPassword ? "text" : "password"} className="form-input pl-9 pr-3" placeholder="Repeat password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
                </div>
              </div>
            </div>

            {password && (
              <div className="flex items-center gap-4 text-[11px] font-semibold text-slate-500 pt-0.5">
                <span className={`flex items-center gap-1 ${password.length >= 8 ? 'text-emerald-600' : 'text-slate-400'}`}>
                  <CheckCircle2 size={12} /> 8+ chars
                </span>
                <span className={`flex items-center gap-1 ${password && password === confirmPassword ? 'text-emerald-600' : 'text-slate-400'}`}>
                  <CheckCircle2 size={12} /> Passwords match
                </span>
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full py-3 mt-2 shadow-[0_6px_20px_rgba(244,63,94,0.35)]" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={16} /> : (
                <>
                  <KeyRound size={14} />
                  <span>Register Hospital Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-rose-100 flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-500">Already registered?</span>
            <Link to="/login" className="text-rose-600 hover:text-rose-800 underline transition-colors">
              Sign In Here →
            </Link>
          </div>

          <div className="mt-3 pt-3 border-t border-rose-50 text-center">
            <p className="text-[11px] text-slate-400 mb-1.5 font-medium">Not a hospital?</p>
            <div className="flex items-center justify-center gap-3 text-[11px] font-bold">
              <Link to="/signup/student" className="text-pink-600 hover:text-pink-800 transition-colors">Student / Employee →</Link>
              <span className="text-slate-300">|</span>
              <Link to="/signup/institution" className="text-teal-600 hover:text-teal-800 transition-colors">Institution / Verifier →</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalSignup;
