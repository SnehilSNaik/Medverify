import React from 'react';
import { useNavigate } from 'react-router-dom';
import StatsCard from '../../components/dashboard/StatsCard';
import Badge from '../../components/common/Badge';
import { ShieldCheck, ScanLine, Activity, AlertTriangle, XCircle, Search, FileText, Sparkles, Building2, BrainCircuit } from 'lucide-react';
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
            Welcome, <span className="text-teal-700 font-extrabold">{user?.username}</span> — verify medical certificates, detect visual forgeries with AI, and view verification logs.
          </p>
          <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-3">
            <button onClick={() => navigate('/institution/verify')} className="btn btn-mint shadow-[0_6px_20px_rgba(13,148,136,0.35)]">
              <ScanLine size={18} /> Launch Scanner
            </button>
            <button onClick={() => navigate('/institution/ai-detector')} className="btn btn-primary shadow-[0_6px_20px_rgba(13,148,136,0.25)]">
              <BrainCircuit size={18} /> AI Forgery Detector
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Verify Certificate Card */}
        <div 
          onClick={() => navigate('/institution/verify')}
          className="glass-card border-teal-100 p-6 cursor-pointer group hover:border-teal-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs shrink-0">
              <ScanLine size={24} />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-extrabold text-slate-800 mb-1.5 group-hover:text-teal-700 transition-colors">Verify Certificate</h2>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Scan QR code or enter UUID to verify cryptographic authenticity.
              </p>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 group-hover:translate-x-1 transition-transform">
              Launch Scanner →
            </span>
          </div>
        </div>

        {/* AI Forgery Detector Card */}
        <div 
          onClick={() => navigate('/institution/ai-detector')}
          className="glass-card border-purple-100 bg-gradient-to-b from-white to-purple-50/20 p-6 cursor-pointer group hover:border-purple-300 transition-all flex flex-col justify-between relative overflow-hidden"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs shrink-0">
              <BrainCircuit size={24} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-base font-extrabold text-slate-800 group-hover:text-purple-700 transition-colors">AI Forgery Detector</h2>
                <Badge variant="primary">New</Badge>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                Detect spliced dates, forged seals, and compression noise anomalies (ELA).
              </p>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-purple-100">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700 group-hover:translate-x-1 transition-transform">
              Run Forensic Scan →
            </span>
          </div>
        </div>

        {/* Verification History Card */}
        <div 
          onClick={() => navigate('/institution/history')}
          className="glass-card border-slate-200 p-6 cursor-pointer group hover:border-slate-300 transition-all flex flex-col justify-between"
        >
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs shrink-0">
              <Activity size={24} />
            </div>
            <div className="flex-1">
              <h2 className="text-base font-extrabold text-slate-800 mb-1.5 group-hover:text-teal-700 transition-colors">Audit History Logs</h2>
              <p className="text-xs text-slate-500 leading-relaxed font-medium">
                View complete audit trail of verified certificates and IP telemetry.
              </p>
            </div>
          </div>
          <div className="mt-5 pt-3 border-t border-slate-100">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-700 group-hover:translate-x-1 transition-transform">
              View History Log →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstitutionDashboard;
