import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogOut, User, KeyRound, Lock, Eye, EyeOff, Loader2, AlertTriangle, CheckCircle2, HeartPulse } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import Badge from './Badge';
import Modal from './Modal';
import toast from 'react-hot-toast';

const Navbar = () => {
  const { user, logout, setAuth, accessToken } = useAuth();
  const navigate = useNavigate();

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.mustChangePassword) {
      setIsPasswordModalOpen(true);
    }
  }, [user?.mustChangePassword]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in all fields');
      return;
    }
    if (newPassword.length < 8) {
      toast.error('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      toast.success('Password updated successfully!');
      
      if (user) {
        setAuth({ ...user, mustChangePassword: false }, accessToken);
      }

      setIsPasswordModalOpen(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeVariant = (role) => {
    if (role === 'HOSPITAL') return 'pink';
    if (role === 'STUDENT') return 'purple';
    if (role === 'VERIFIER') return 'emerald';
    return 'default';
  };

  return (
    <>
      <nav className="h-16 fixed top-0 right-0 left-0 md:left-[260px] border-b border-slate-200/80 z-30 px-6 flex items-center justify-between backdrop-blur-md bg-white/85 shadow-sm">
        <div className="flex items-center gap-2.5 md:hidden">
          <div className="w-8 h-8 rounded-xl brand-mark flex items-center justify-center text-white shadow-xs">
            <HeartPulse size={18} />
          </div>
          <span className="font-black text-lg gradient-text-mint">MedVerify</span>
        </div>
        
        <div className="hidden md:flex items-center gap-3">
          {user?.mustChangePassword ? (
            <div className="flex items-center gap-1.5 px-3.5 py-1 bg-amber-50 border border-amber-200 rounded-xl text-amber-700 text-xs font-bold animate-pulse">
              <AlertTriangle size={14} className="text-amber-500" />
              <span>Password change recommended</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full shadow-2xs">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span className="text-xs font-bold text-emerald-800">System Online</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <>
              <div className="flex flex-col items-end mr-1">
                <span className="text-sm font-extrabold text-slate-800">{user.username}</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <Badge variant={getBadgeVariant(user.role)}>
                    {user.role}
                  </Badge>
                </div>
              </div>

              <div className="w-9 h-9 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-2xs font-bold">
                <User size={18} />
              </div>

              {/* Change Password Button */}
              <button 
                onClick={() => setIsPasswordModalOpen(true)}
                className="p-2 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl transition-all border border-transparent hover:border-emerald-200"
                title="Change Password"
              >
                <KeyRound size={18} />
              </button>

              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all border border-transparent hover:border-red-200"
                title="Logout"
              >
                <LogOut size={18} />
              </button>
            </>
          )}
        </div>
      </nav>

      {/* Change Password Modal */}
      <Modal 
        isOpen={isPasswordModalOpen} 
        onClose={() => !user?.mustChangePassword && setIsPasswordModalOpen(false)}
        title="Change Account Password"
      >
        <form onSubmit={handlePasswordChange} className="space-y-4">
          {user?.mustChangePassword && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-amber-800 text-xs leading-relaxed font-medium">
              <AlertTriangle size={16} className="shrink-0 mt-0.5 text-amber-600" />
              <span>For security compliance, this account requires an immediate password update upon first login.</span>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Current Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock size={16} />
              </span>
              <input
                type={showCurrent ? "text" : "password"}
                className="form-input pl-10 pr-10"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">New Password (min 8 chars)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <KeyRound size={16} />
              </span>
              <input
                type={showNew ? "text" : "password"}
                className="form-input pl-10 pr-10"
                placeholder="Enter new strong password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-400">
                <Lock size={16} />
              </span>
              <input
                type="password"
                className="form-input pl-10 pr-4"
                placeholder="Re-type new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1 text-slate-600 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={12} className={newPassword.length >= 8 ? "text-emerald-600 font-bold" : "text-slate-400"} />
              <span>At least 8 characters long</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={12} className={newPassword && newPassword === confirmPassword ? "text-emerald-600 font-bold" : "text-slate-400"} />
              <span>Passwords match</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            {!user?.mustChangePassword && (
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="btn btn-ghost"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="btn btn-mint"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : 'Update Password'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default Navbar;
