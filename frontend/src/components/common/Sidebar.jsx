import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, LayoutDashboard, Building2, Users, FileText, Stethoscope, FilePlus2, ScanLine } from 'lucide-react';
import { ROLES } from '../../utils/constants';

const Sidebar = ({ role }) => {
  const adminLinks = [
    { to: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/admin/hospitals', icon: <Building2 size={20} />, label: 'Hospitals' },
    { to: '/admin/users', icon: <Users size={20} />, label: 'Users' },
    { to: '/admin/logs', icon: <FileText size={20} />, label: 'Verification Logs' },
  ];

  const hospitalLinks = [
    { to: '/hospital/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { to: '/hospital/doctors', icon: <Stethoscope size={20} />, label: 'Doctors' },
    { to: '/hospital/certificates', icon: <FileText size={20} />, label: 'Certificates' },
    { to: '/hospital/issue', icon: <FilePlus2 size={20} />, label: 'Issue Certificate' },
  ];

  const links = role === ROLES.ADMIN ? adminLinks : hospitalLinks;

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] glass-panel border-y-0 border-l-0 rounded-none z-40 flex flex-col hidden md:flex bg-[#0a0f1e]">
      <div className="h-16 flex items-center justify-center gap-2 border-b border-[rgba(255,255,255,0.1)] px-4">
        <Shield className="text-[#00d4ff]" size={28} />
        <span className="font-bold text-xl gradient-text tracking-wide">MedVerify</span>
      </div>

      <div className="flex-1 py-6 px-4 flex flex-col gap-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-[rgba(0,212,255,0.1)] text-[#00d4ff] border border-[rgba(0,212,255,0.2)]'
                  : 'text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)] border border-transparent'
              }`
            }
          >
            {link.icon}
            <span className="font-medium">{link.label}</span>
          </NavLink>
        ))}
        
        <div className="mt-8 pt-6 border-t border-[rgba(255,255,255,0.1)]">
          <NavLink
            to="/verify"
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.05)] border border-transparent transition-all"
          >
            <ScanLine size={20} />
            <span className="font-medium">Public Verify</span>
          </NavLink>
        </div>
      </div>
      
      <div className="p-4 text-xs text-center text-gray-500 border-t border-[rgba(255,255,255,0.1)]">
        &copy; {new Date().getFullYear()} MedVerify
      </div>
    </aside>
  );
};

export default Sidebar;
