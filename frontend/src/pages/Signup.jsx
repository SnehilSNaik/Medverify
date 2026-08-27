import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Shield, Lock, User, Mail, Building2, Phone, MapPin, 
  FileBadge, CheckCircle2, Eye, EyeOff, Loader2, KeyRound, 
  AlertCircle, ShieldCheck, UserCheck 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { authService } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import { ROLES } from '../utils/constants';

const Signup = () => {
  const [role, setRole] = useState(ROLES.VERIFIER); // VERIFIER or HOSPITAL
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Verifier specific
  const [organizationName, setOrganizationName] = useState('');

  // Hospital specific
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

    if (!username || !email || !password || !confirmPassword) {
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

    if (role === ROLES.HOSPITAL && (!hospitalName || !licenseNumber)) {
      setError('Hospital Name and License Number are mandatory for medical centers');
      toast.error('Hospital Name and License Number are required');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        username: username.trim(),
        email: email.trim(),
        password,
        role,
        organizationName: role === ROLES.VERIFIER ? organizationName.trim() : undefined,
        hospitalName: role === ROLES.HOSPITAL ? hospitalName.trim() : undefined,
        licenseNumber: role === ROLES.HOSPITAL ? licenseNumber.trim() : undefined,
        phone: role === ROLES.HOSPITAL ? phone.trim() : undefined,
        address: role === ROLES.HOSPITAL ? address.trim() : undefined,
      };

      const response = await authService.signup(payload);
      setAuth(response.user, response.accessToken);

      toast.success(`Account registered successfully! Welcome, ${response.user.username}`);

      if (response.user.role === ROLES.HOSPITAL) {
        navigate('/hospital/dashboard');
      } else {
        navigate('/verify');
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed. Please check your details.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e] relative overflow-hidden p-4 py-8">
      {/* Ambient background glows */}
      <div className="absolute top-[-15%] left-[-15%] w-[550px] h-[550px] bg-[#00d4ff] opacity-15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute bottom-[-15%] right-[-15%] w-[550px] h-[550px] bg-[#7c3aed] opacity-15 rounded-full blur-[140px] pointer-events-none"></div>

      <div className="w-full max-w-4xl flex flex-col md:flex-row glass-panel overflow-hidden z-10 border border-[rgba(255,255,255,0.12)] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        {/* Left Branding Side */}
        <div className="hidden md:flex md:w-5/12 bg-gradient-to-br from-[rgba(0,212,255,0.08)] via-[rgba(10,15,30,0.5)] to-[rgba(124,58,237,0.1)] flex-col justify-between p-8 border-r border-[rgba(255,255,255,0.08)] relative">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.25)] rounded-xl">
              <Shield size={26} className="text-[#00d4ff]" />
            </div>
            <span className="text-2xl font-bold gradient-text tracking-wide">MedVerify</span>
          </div>

          <div className="my-auto py-6">
            <div className="w-14 h-14 bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.2)] rounded-2xl flex items-center justify-center mb-5 shadow-[0_0_30px_rgba(0,212,255,0.2)]">
              <ShieldCheck size={28} className="text-[#00d4ff]" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2 leading-tight">Join the Verified Medical Trust Network</h2>
            <p className="text-gray-400 text-xs leading-relaxed mb-6">
              Create an authenticated portal account to issue cryptographically signed medical certificates or verify certificates with zero tamper risk.
            </p>

            <div className="space-y-2.5">
              <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl flex items-start gap-3">
                <div className="p-1.5 bg-[#00d4ff]/10 rounded-lg text-[#00d4ff] mt-0.5">
                  <Building2 size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">For Hospitals & Clinics</h4>
                  <p className="text-[11px] text-gray-400">Automated 2048-bit RSA keypair generation & tamper-proof PDF issuance.</p>
                </div>
              </div>

              <div className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl flex items-start gap-3">
                <div className="p-1.5 bg-[#7c3aed]/10 rounded-lg text-[#a855f7] mt-0.5">
                  <UserCheck size={16} />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">For Colleges & Enterprises</h4>
                  <p className="text-[11px] text-gray-400">Instant QR camera scanning, cryptographic validation, and audit tracking.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-gray-500 border-t border-[rgba(255,255,255,0.05)] pt-3">
            Protected by Cryptographic Signatures • MedVerify Platform
          </div>
        </div>

        {/* Right Form Side */}
        <div className="w-full md:w-7/12 p-6 md:p-8 flex flex-col justify-center bg-[rgba(10,15,30,0.85)] backdrop-blur-2xl overflow-y-auto max-h-[90vh]">
          <div className="md:hidden flex items-center justify-center mb-4 gap-2">
            <Shield className="text-[#00d4ff]" size={26} />
            <h1 className="text-xl font-bold gradient-text">MedVerify</h1>
          </div>

          <div className="mb-5">
            <h2 className="text-xl font-bold text-white mb-1">Create an Account</h2>
            <p className="text-gray-400 text-xs">Select your organization type and get started</p>
          </div>

          {/* Role Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-black/40 border border-white/[0.08] rounded-xl mb-5">
            <button
              type="button"
              onClick={() => { setRole(ROLES.VERIFIER); setError(''); }}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                role === ROLES.VERIFIER
                  ? 'bg-gradient-to-r from-[#00d4ff]/20 to-[#0077ff]/20 border border-[#00d4ff]/40 text-white shadow-[0_0_15px_rgba(0,212,255,0.2)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <UserCheck size={14} className={role === ROLES.VERIFIER ? 'text-[#00d4ff]' : ''} />
              Verifier / Enterprise
            </button>
            <button
              type="button"
              onClick={() => { setRole(ROLES.HOSPITAL); setError(''); }}
              className={`py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                role === ROLES.HOSPITAL
                  ? 'bg-gradient-to-r from-[#00d4ff]/20 to-[#0077ff]/20 border border-[#00d4ff]/40 text-white shadow-[0_0_15px_rgba(0,212,255,0.2)]'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Building2 size={14} className={role === ROLES.HOSPITAL ? 'text-[#00d4ff]' : ''} />
              Hospital / Clinic
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-red-400 text-xs">
              <AlertCircle size={15} className="shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-3.5">
            {/* Account Credentials Group */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Username *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <User size={15} />
                  </span>
                  <input 
                    type="text" 
                    className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.12)] focus:border-[#00d4ff] text-white rounded-xl py-2 pl-9 pr-3 text-xs outline-none transition-all placeholder:text-gray-600" 
                    placeholder="e.g. st_marys_admin" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Email Address *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <Mail size={15} />
                  </span>
                  <input 
                    type="email" 
                    className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.12)] focus:border-[#00d4ff] text-white rounded-xl py-2 pl-9 pr-3 text-xs outline-none transition-all placeholder:text-gray-600" 
                    placeholder="official@domain.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Role-Specific Fields */}
            {role === ROLES.VERIFIER ? (
              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Organization / University Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <Building2 size={15} />
                  </span>
                  <input 
                    type="text" 
                    className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.12)] focus:border-[#00d4ff] text-white rounded-xl py-2 pl-9 pr-3 text-xs outline-none transition-all placeholder:text-gray-600" 
                    placeholder="e.g. Oxford University / Tech Corp" 
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                  />
                </div>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Hospital Name *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                        <Building2 size={15} />
                      </span>
                      <input 
                        type="text" 
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.12)] focus:border-[#00d4ff] text-white rounded-xl py-2 pl-9 pr-3 text-xs outline-none transition-all placeholder:text-gray-600" 
                        placeholder="e.g. St. Jude Hospital" 
                        value={hospitalName}
                        onChange={(e) => setHospitalName(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-gray-400 mb-1 uppercase tracking-wider">License Number *</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                        <FileBadge size={15} />
                      </span>
                      <input 
                        type="text" 
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.12)] focus:border-[#00d4ff] text-white rounded-xl py-2 pl-9 pr-3 text-xs outline-none transition-all placeholder:text-gray-600" 
                        placeholder="e.g. MED-LIC-2024-99" 
                        value={licenseNumber}
                        onChange={(e) => setLicenseNumber(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Phone</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                        <Phone size={15} />
                      </span>
                      <input 
                        type="text" 
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.12)] focus:border-[#00d4ff] text-white rounded-xl py-2 pl-9 pr-3 text-xs outline-none transition-all placeholder:text-gray-600" 
                        placeholder="+1-555-0199" 
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Address</label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                        <MapPin size={15} />
                      </span>
                      <input 
                        type="text" 
                        className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.12)] focus:border-[#00d4ff] text-white rounded-xl py-2 pl-9 pr-3 text-xs outline-none transition-all placeholder:text-gray-600" 
                        placeholder="742 Medical Drive, Suite 100" 
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Password Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Password (min 8) *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <Lock size={15} />
                  </span>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.12)] focus:border-[#00d4ff] text-white rounded-xl py-2 pl-9 pr-9 text-xs outline-none transition-all placeholder:text-gray-600" 
                    placeholder="Create password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-500 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-gray-400 mb-1 uppercase tracking-wider">Confirm Password *</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                    <Lock size={15} />
                  </span>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.12)] focus:border-[#00d4ff] text-white rounded-xl py-2 pl-9 pr-3 text-xs outline-none transition-all placeholder:text-gray-600" 
                    placeholder="Repeat password" 
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Password Match Indicator */}
            {password && (
              <div className="flex items-center gap-4 text-[11px] text-gray-400 pt-0.5">
                <span className={`flex items-center gap-1 ${password.length >= 8 ? 'text-emerald-400' : 'text-gray-500'}`}>
                  <CheckCircle2 size={12} /> 8+ chars
                </span>
                <span className={`flex items-center gap-1 ${password && password === confirmPassword ? 'text-emerald-400' : 'text-gray-500'}`}>
                  <CheckCircle2 size={12} /> Passwords match
                </span>
              </div>
            )}

            <button 
              type="submit" 
              className="w-full py-3 px-4 bg-gradient-to-r from-[#00d4ff] to-[#0077ff] hover:from-[#00b8e6] hover:to-[#0066ee] text-white font-semibold rounded-xl text-xs transition-all shadow-[0_4px_20px_rgba(0,212,255,0.35)] flex items-center justify-center gap-2 mt-2"
              disabled={loading}
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : (
                <>
                  <KeyRound size={14} />
                  <span>Register {role === ROLES.HOSPITAL ? 'Hospital' : 'Verifier'} Account</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-4 pt-4 border-t border-[rgba(255,255,255,0.08)] flex items-center justify-between text-xs">
            <span className="text-gray-400">Already registered?</span>
            <Link to="/login" className="text-[#00d4ff] hover:text-white font-medium underline transition-colors">
              Sign In Here →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Signup;
