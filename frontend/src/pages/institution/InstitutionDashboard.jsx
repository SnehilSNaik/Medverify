import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../../components/dashboard/StatsCard';
import Badge from '../../components/common/Badge';
import { ShieldCheck, ScanLine, Activity, AlertTriangle, XCircle, Search, FileText, Sparkles, Building2 } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const InstitutionDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      {/* Top Hero Banner with 3D Shield Model */}
      <div className="glass-panel p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-emerald-100/90 relative overflow-hidden bg-gradient-to-r from-white via-teal-50/30 to-emerald-50/20">
        <div className="flex-1 space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100/70 text-emerald-800 rounded-full text-xs font-extrabold border border-emerald-200">
            <ShieldCheck size={14} className="text-emerald-600" /> Institutional Verification Authority
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Institutional Verification Center
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-xl">
            Welcome, <span className="text-teal-700 font-extrabold">{user?.username}</span> — verify medical certificates and manage verification logs.
          </p>
          <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-3">
            <button onClick={() => navigate('/institution/verify')} className="btn btn-mint shadow-[0_6px_20px_rgba(13,148,136,0.35)]">
              <ScanLine size={18} /> Launch Scanner
            </button>
            <button onClick={() => navigate('/institution/history')} className="btn btn-secondary">
              <Activity size={18} /> Verification Logs
            </button>
          </div>
        </div>

        {/* 3D Realistic Shield Asset */}
        <div className="w-36 h-36 relative animate-float shrink-0">
          <img 
            src="/medical_shield_3d.jpg" 
            alt="3D Shield" 
            className="w-full h-full object-contain rounded-3xl drop-shadow-[0_16px_20px_rgba(0,0,0,0.15)]"
          />
        </div>
      </div>

      {/* Main Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Verify Certificate Card */}
        <div 
          onClick={() => navigate('/institution/verify')}
          className="glass-card border-teal-100 p-8 cursor-pointer group hover:border-teal-300 transition-all"
        >
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs shrink-0">
              <ScanLine size={30} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-extrabold text-slate-800 mb-2 group-hover:text-teal-700 transition-colors">Verify a Medical Certificate</h2>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                Scan a QR code or enter a certificate UUID to check authenticity.
              </p>
              <div className="mt-5">
                <span className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white text-xs font-bold rounded-xl shadow-[0_4px_16px_rgba(13,148,136,0.3)]">
                  <ScanLine size={15} /> Start Verification →
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Verification History Card */}
        <div 
          onClick={() => navigate('/institution/history')}
          className="glass-card border-slate-200 p-8 cursor-pointer group hover:border-slate-300 transition-all"
        >
          <div className="flex items-start gap-5">
            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs shrink-0">
              <Activity size={30} />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-extrabold text-slate-800 mb-2 group-hover:text-teal-700 transition-colors">Verification Logs & History</h2>
              <p className="text-sm text-slate-500 leading-relaxed font-medium">
                View the complete audit log of all certificates checked by your organization.
              </p>
              <div className="mt-5">
                <span className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-white border border-slate-300 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-2xs">
                  <Activity size={15} /> View History Log →
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionDashboard;
