import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogOut, User, KeyRound, Lock, Eye, EyeOff, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';
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
    // If account was marked with mustChangePassword, auto-open the change password modal
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
      
      // Update user state so mustChangePassword is false
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

  return (
    <>
      <nav className="h-16 fixed top-0 right-0 left-0 md:left-[260px] glass-panel border-x-0 border-t-0 rounded-none z-30 px-6 flex items-center justify-between" style={{ background: 'rgba(10, 15, 30, 0.8)' }}>
        <div className="flex items-center gap-2 md:hidden">
          <Shield className="text-[#00d4ff]" />
          <span className="font-bold text-lg gradient-text">MedVerify</span>
        </div>
        
        <div className="hidden md:flex items-center gap-3">
          {user?.mustChangePassword && (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-400 text-xs font-medium animate-pulse">
              <AlertTriangle size={14} />
              <span>Password change recommended</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user && (
            <>
              <div className="flex flex-col items-end mr-1">
                <span className="text-sm font-medium text-white">{user.username}</span>
                <div className="flex items-center gap-1">
                  <Badge variant={user.role === 'ADMIN' ? 'danger' : user.role === 'HOSPITAL' ? 'info' : 'warning'} className="scale-75 origin-right">
                    {user.role}
                  </Badge>
                </div>
              </div>

              <div className="h-8 w-8 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center border border-[rgba(255,255,255,0.2)]">
                <User size={16} className="text-[#00d4ff]" />
              </div>

              {/* Change Password Button */}
              <button 
                onClick={() => setIsPasswordModalOpen(true)}
                className="p-1.5 text-gray-400 hover:text-[#00d4ff] hover:bg-white/5 rounded-lg transition-all"
                title="Change Password"
              >
                <KeyRound size={18} />
              </button>

              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="p-1.5 text-gray-400 hover:text-[#ef4444] hover:bg-red-500/10 rounded-lg transition-all"
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
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl flex items-start gap-2.5 text-amber-400 text-xs leading-relaxed">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>For security compliance, this account requires an immediate password update upon first login.</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Current Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <Lock size={16} />
              </span>
              <input
                type={showCurrent ? "text" : "password"}
                className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.12)] focus:border-[#00d4ff] text-white rounded-xl py-2.5 pl-9 pr-10 text-sm outline-none"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">New Password (min 8 chars)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <KeyRound size={16} />
              </span>
              <input
                type={showNew ? "text" : "password"}
                className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.12)] focus:border-[#00d4ff] text-white rounded-xl py-2.5 pl-9 pr-10 text-sm outline-none"
                placeholder="Enter new strong password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">Confirm New Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">
                <Lock size={16} />
              </span>
              <input
                type="password"
                className="w-full bg-[rgba(0,0,0,0.4)] border border-[rgba(255,255,255,0.12)] focus:border-[#00d4ff] text-white rounded-xl py-2.5 pl-9 pr-4 text-sm outline-none"
                placeholder="Re-type new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password complexity helper */}
          <div className="p-3 bg-white/[0.02] border border-white/[0.06] rounded-xl text-xs space-y-1 text-gray-400">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={12} className={newPassword.length >= 8 ? "text-emerald-400" : "text-gray-600"} />
              <span>At least 8 characters long</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={12} className={newPassword && newPassword === confirmPassword ? "text-emerald-400" : "text-gray-600"} />
              <span>Passwords match</span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            {!user?.mustChangePassword && (
              <button
                type="button"
                onClick={() => setIsPasswordModalOpen(false)}
                className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-gradient-to-r from-[#00d4ff] to-[#0077ff] hover:from-[#00b8e6] hover:to-[#0066ee] text-white font-medium rounded-xl text-sm transition-all shadow-[0_4px_15px_rgba(0,212,255,0.3)] flex items-center gap-2"
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
