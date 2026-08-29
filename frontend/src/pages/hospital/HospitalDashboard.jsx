import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hospitalService } from '../../services/hospitalService';
import StatsCard from '../../components/dashboard/StatsCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FileText, Stethoscope, FilePlus2, ShieldCheck, Activity, HeartPulse, Sparkles, Building2, Plus } from 'lucide-react';

const HospitalDashboard = () => {
  const [stats, setStats] = useState({
    totalCertificates: 0,
    activeDoctors: 0,
    activeCertificates: 0,
    revokedCertificates: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [certs, doctors] = await Promise.all([
          hospitalService.getCertificates(),
          hospitalService.getDoctors()
        ]);
        
        const certList = certs || [];
        const docList = doctors || [];

        setStats({
          totalCertificates: certList.length,
          activeDoctors: docList.filter(d => d.active).length,
          activeCertificates: certList.filter(c => c.status === 'ACTIVE').length,
          revokedCertificates: certList.filter(c => c.status === 'REVOKED').length
        });
      } catch (error) {
        console.error("Error fetching hospital stats", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      {/* Top Hero Banner with 3D Hospital Model */}
      <div className="glass-panel p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-emerald-100/90 relative overflow-hidden bg-gradient-to-r from-white via-emerald-50/30 to-rose-50/20">
        <div className="flex-1 space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100/70 text-emerald-800 rounded-full text-xs font-extrabold border border-emerald-200">
            <HeartPulse size={14} className="text-emerald-600 animate-pulse" /> Authorized Healthcare Institution
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            Hospital Operations Hub
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-xl">
            Issue medical certificates and manage doctor registry.
          </p>
          <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-3">
            <button onClick={() => navigate('/hospital/issue')} className="btn btn-mint shadow-[0_6px_20px_rgba(16,185,129,0.35)]">
              <Plus size={18} /> Issue Certificate
            </button>
            <button onClick={() => navigate('/hospital/doctors')} className="btn btn-secondary">
              <Stethoscope size={18} /> Doctor Registry
            </button>
          </div>
        </div>

        {/* 3D Realistic Hospital Asset */}
        <div className="w-36 h-36 relative animate-float shrink-0">
          <img 
            src="/medical_hospital_3d.jpg" 
            alt="3D Hospital" 
            className="w-full h-full object-contain rounded-3xl drop-shadow-[0_16px_20px_rgba(0,0,0,0.15)]"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <div onClick={() => navigate('/hospital/certificates')} className="cursor-pointer transition-transform hover:-translate-y-1">
          <StatsCard title="Total Issued" value={stats.totalCertificates} icon={FileText} color="primary" />
        </div>
        <div onClick={() => navigate('/hospital/doctors')} className="cursor-pointer transition-transform hover:-translate-y-1">
          <StatsCard title="Active Doctors" value={stats.activeDoctors} icon={Stethoscope} color="info" />
        </div>
        <div onClick={() => navigate('/hospital/certificates')} className="cursor-pointer transition-transform hover:-translate-y-1">
          <StatsCard title="Active & Valid" value={stats.activeCertificates} icon={ShieldCheck} color="success" />
        </div>
        <div onClick={() => navigate('/hospital/certificates')} className="cursor-pointer transition-transform hover:-translate-y-1">
          <StatsCard title="Revoked" value={stats.revokedCertificates} icon={Activity} color="warning" />
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="glass-card border-emerald-100 lg:col-span-2">
          <h2 className="text-lg font-extrabold text-slate-800 mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-rose-500" /> Fast Operations
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div 
              onClick={() => navigate('/hospital/issue')}
              className="p-5 border-2 border-dashed border-rose-200 bg-rose-50/40 rounded-2xl flex flex-col items-center justify-center gap-2.5 cursor-pointer hover:bg-rose-100/50 hover:border-rose-400 transition-all text-center group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-rose-200 text-rose-600 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                <FilePlus2 size={24} />
              </div>
              <div>
                <span className="font-bold text-slate-800 text-sm block">Issue Certificate</span>
                <span className="text-[11px] text-slate-500 font-medium">New Medical Certificate</span>
              </div>
            </div>
            
            <div 
              onClick={() => navigate('/hospital/doctors')}
              className="p-5 border border-pink-200 bg-pink-50/40 rounded-2xl flex flex-col items-center justify-center gap-2.5 cursor-pointer hover:bg-pink-100/50 hover:border-pink-400 transition-all text-center group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-pink-200 text-pink-600 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                <Stethoscope size={24} />
              </div>
              <div>
                <span className="font-bold text-slate-800 text-sm block">Doctor Registry</span>
                <span className="text-[11px] text-slate-500 font-medium">Add & Manage Doctors</span>
              </div>
            </div>

            <div 
              onClick={() => navigate('/hospital/certificates')}
              className="p-5 border border-emerald-200 bg-emerald-50/40 rounded-2xl flex flex-col items-center justify-center gap-2.5 cursor-pointer hover:bg-emerald-100/50 hover:border-emerald-400 transition-all text-center group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-emerald-200 text-emerald-700 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>
              <div>
                <span className="font-bold text-slate-800 text-sm block">Certificate Records</span>
                <span className="text-[11px] text-slate-500 font-medium">View & Download</span>
              </div>
            </div>
          </div>
        </div>

        {/* Security Engine Card */}
        <div className="glass-card border-emerald-100">
          <h2 className="text-lg font-extrabold text-slate-800 mb-4 flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-600" /> Security Status
          </h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-xs">
                  <ShieldCheck size={20} />
                </div>
                <div>
                  <div className="font-extrabold text-emerald-900 text-sm">Digital Signature Active</div>
                  <div className="text-xs text-emerald-700 font-medium">Hospital Keys Configured</div>
                </div>
              </div>
              <div className="text-[10px] font-black text-emerald-800 bg-white px-2.5 py-1 rounded-full border border-emerald-300">
                ACTIVE
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
