import React from 'react';
import { NavLink } from 'react-router-dom';
import { Shield, LayoutDashboard, FileText, Stethoscope, FilePlus2, ScanLine, Link2, HeartPulse, Sparkles, Building2, Activity, ShieldCheck } from 'lucide-react';
import { ROLES } from '../../utils/constants';

const Sidebar = ({ role }) => {
  const hospitalLinks = [
    { to: '/hospital/dashboard', icon: <LayoutDashboard size={19} />, label: 'Dashboard' },
    { to: '/hospital/doctors', icon: <Stethoscope size={19} />, label: 'Doctor Registry' },
    { to: '/hospital/certificates', icon: <FileText size={19} />, label: 'Certificates' },
    { to: '/hospital/issue', icon: <FilePlus2 size={19} />, label: 'Issue Certificate' },
  ];

  const studentLinks = [
    { to: '/student/dashboard', icon: <LayoutDashboard size={19} />, label: 'My Vault' },
    { to: '/student/certificates', icon: <FileText size={19} />, label: 'My Certificates' },
    { to: '/student/link', icon: <Link2 size={19} />, label: 'Link Certificate' },
  ];

  const institutionLinks = [
    { to: '/institution/dashboard', icon: <LayoutDashboard size={19} />, label: 'Dashboard' },
    { to: '/institution/verify', icon: <ScanLine size={19} />, label: 'Verify Certificate' },
    { to: '/institution/history', icon: <Activity size={19} />, label: 'Verification Logs' },
  ];

  const links = role === ROLES.HOSPITAL ? hospitalLinks : role === ROLES.STUDENT ? studentLinks : institutionLinks;

  const roleMeta = {
    [ROLES.HOSPITAL]: { label: 'Hospital Portal', pillClass: 'bg-rose-50 text-rose-700 border-rose-200 shadow-xs', iconImg: '/medical_hospital_3d.jpg' },
    [ROLES.STUDENT]: { label: 'Student Vault', pillClass: 'bg-pink-50 text-pink-700 border-pink-200 shadow-xs', iconImg: '/medical_cert_3d.jpg' },
    [ROLES.VERIFIER]: { label: 'Institution Portal', pillClass: 'bg-emerald-50 text-emerald-800 border-emerald-200 shadow-xs', iconImg: '/medical_shield_3d.jpg' },
  };

  const meta = roleMeta[role] || roleMeta[ROLES.HOSPITAL];

  return (
    <aside className="fixed left-0 top-0 h-screen w-[260px] bg-slate-950 text-slate-100 border-r border-slate-800 z-40 flex flex-col hidden md:flex shadow-2xl">
      {/* Brand Header */}
      <div className="h-16 flex items-center gap-3 border-b border-slate-800 px-6">
        <div className="w-9 h-9 rounded-xl brand-mark flex items-center justify-center text-white">
          <HeartPulse size={20} className="animate-pulse" />
        </div>
        <div>
          <span className="font-black text-xl tracking-tight text-white">MedVerify</span>
          <span className="block text-[10px] uppercase font-bold text-teal-300 tracking-wider">Health Trust</span>
        </div>
      </div>

      {/* Role Pill with realistic avatar badge */}
      <div className="px-5 pt-4 pb-2">
        <div className="px-3 py-2 rounded-xl text-[11px] font-bold tracking-wide flex items-center justify-center gap-2 border border-slate-700 bg-slate-900 text-slate-200">
          <img src={meta.iconImg} alt="Role Icon" className="w-5 h-5 rounded-md object-contain shadow-2xs" />
          <span>{meta.label}</span>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-3 px-4 flex flex-col gap-1.5 overflow-y-auto">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-teal-500/15 text-teal-200 border border-teal-400/20 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`
            }
          >
            {link.icon}
            <span>{link.label}</span>
          </NavLink>
        ))}
        
        <div className="mt-auto pt-4 border-t border-slate-800">
          <NavLink
            to="/verify"
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <ScanLine size={16} />
            <span>Public Scanner</span>
          </NavLink>
        </div>
      </div>
      
      {/* Footer */}
      <div className="p-4 text-xs text-center text-slate-500 border-t border-slate-800 font-medium">
        &copy; {new Date().getFullYear()} MedVerify • Cryptographic Trust
      </div>
    </aside>
  );
};

export default Sidebar;
