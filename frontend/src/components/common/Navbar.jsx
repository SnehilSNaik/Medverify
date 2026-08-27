import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Badge from './Badge';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="h-16 fixed top-0 right-0 left-0 md:left-[260px] glass-panel border-x-0 border-t-0 rounded-none z-30 px-6 flex items-center justify-between" style={{ background: 'rgba(10, 15, 30, 0.8)' }}>
      <div className="flex items-center gap-2 md:hidden">
        <Shield className="text-[#00d4ff]" />
        <span className="font-bold text-lg gradient-text">MedVerify</span>
      </div>
      
      <div className="hidden md:block"></div> {/* Spacer */}

      <div className="flex items-center gap-4">
        {user && (
          <>
            <div className="flex flex-col items-end mr-2">
              <span className="text-sm font-medium text-white">{user.username}</span>
              <Badge variant="info" className="scale-75 origin-right">{user.role}</Badge>
            </div>
            <div className="h-8 w-8 rounded-full bg-[rgba(255,255,255,0.1)] flex items-center justify-center border border-[rgba(255,255,255,0.2)]">
              <User size={16} className="text-[#00d4ff]" />
            </div>
            <button 
              onClick={handleLogout}
              className="ml-2 text-gray-400 hover:text-[#ef4444] transition-colors"
              title="Logout"
            >
              <LogOut size={20} />
            </button>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
