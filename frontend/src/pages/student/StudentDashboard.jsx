import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { studentService } from '../../services/studentService';
import StatsCard from '../../components/dashboard/StatsCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FileText, Link2, ShieldCheck, AlertTriangle, GraduationCap, QrCode, Download, HeartPulse, Sparkles, Plus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const StudentDashboard = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user, linkedCertificates } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const certs = await studentService.fetchAllLinkedCertificates();
        setCertificates(certs);
      } catch (error) {
        console.error("Error fetching certificates", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [linkedCertificates]);

  const stats = {
    total: certificates.length,
    active: certificates.filter(c => c.result === 'GENUINE' && c.status !== 'REVOKED').length,
    revoked: certificates.filter(c => c.result === 'REVOKED' || c.status === 'REVOKED').length,
    expired: certificates.filter(c => {
      if (!c.expiryDate) return false;
      return new Date(c.expiryDate) < new Date();
    }).length
  };

  if (loading) return <LoadingSpinner fullScreen />;

  return (
    <div className="space-y-6">
      {/* Top Hero Banner with 3D Certificate Model */}
      <div className="glass-panel p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-pink-100/90 relative overflow-hidden bg-gradient-to-r from-white via-pink-50/30 to-emerald-50/20">
        <div className="flex-1 space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-pink-100/70 text-pink-800 rounded-full text-xs font-extrabold border border-pink-200">
            <GraduationCap size={14} className="text-pink-600" /> Student & Employee Records Vault
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            My Personal Health Vault
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-xl">
            Manage, view, and share your verified medical certificates.
          </p>
          <div className="pt-2 flex flex-wrap justify-center md:justify-start gap-3">
            <button onClick={() => navigate('/student/link')} className="btn btn-primary shadow-[0_6px_20px_rgba(236,72,153,0.35)]">
              <Plus size={18} /> Link New Certificate
            </button>
            <button onClick={() => navigate('/student/certificates')} className="btn btn-secondary">
              <FileText size={18} /> View My Records
            </button>
          </div>
        </div>

        {/* 3D Realistic Certificate Asset */}
        <div className="w-36 h-36 relative animate-float shrink-0">
          <img 
            src="/medical_cert_3d.jpg" 
            alt="3D Certificate" 
            className="w-full h-full object-contain rounded-3xl drop-shadow-[0_16px_20px_rgba(0,0,0,0.15)]"
          />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatsCard title="Total Linked" value={stats.total} icon={FileText} color="secondary" />
        <StatsCard title="Active & Genuine" value={stats.active} icon={ShieldCheck} color="success" />
        <StatsCard title="Revoked" value={stats.revoked} icon={AlertTriangle} color="warning" />
        <StatsCard title="Expired" value={stats.expired} icon={AlertTriangle} color="danger" />
      </div>

      {/* Action & Guide Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="glass-card border-pink-100">
          <h2 className="text-lg font-extrabold text-slate-800 mb-4 flex items-center gap-2">
            <Sparkles size={18} className="text-pink-600" /> Fast Actions
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div 
              onClick={() => navigate('/student/link')}
              className="p-5 border-2 border-dashed border-pink-200 bg-pink-50/40 rounded-2xl flex flex-col items-center justify-center gap-2.5 cursor-pointer hover:bg-pink-100/50 hover:border-pink-400 transition-all text-center group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-pink-200 text-pink-600 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                <Link2 size={24} />
              </div>
              <div>
                <span className="font-bold text-slate-800 text-sm block">Link Certificate</span>
                <span className="text-[11px] text-slate-500 font-medium">By UUID or QR Scan</span>
              </div>
            </div>
            <div 
              onClick={() => navigate('/student/certificates')}
              className="p-5 border border-slate-200 bg-slate-50/50 rounded-2xl flex flex-col items-center justify-center gap-2.5 cursor-pointer hover:bg-slate-100/70 hover:border-slate-300 transition-all text-center group"
            >
              <div className="w-12 h-12 rounded-2xl bg-white border border-slate-200 text-slate-600 shadow-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>
              <div>
                <span className="font-bold text-slate-800 text-sm block">My Certificates</span>
                <span className="text-[11px] text-slate-500 font-medium">Download PDFs & Share</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Instructions */}
        <div className="glass-card border-pink-100">
          <h2 className="text-lg font-extrabold text-slate-800 mb-4">Quick Guide</h2>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-pink-50/50 border border-pink-100 rounded-xl">
              <div className="w-7 h-7 rounded-xl bg-pink-100 flex items-center justify-center text-pink-700 text-xs font-bold shrink-0">1</div>
              <div>
                <div className="text-sm font-bold text-slate-800">Obtain Certificate</div>
                <div className="text-xs text-slate-500 font-medium">Get certificate UUID from your hospital</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-pink-50/50 border border-pink-100 rounded-xl">
              <div className="w-7 h-7 rounded-xl bg-pink-100 flex items-center justify-center text-pink-700 text-xs font-bold shrink-0">2</div>
              <div>
                <div className="text-sm font-bold text-slate-800">Link Record</div>
                <div className="text-xs text-slate-500 font-medium">Link certificate to vault via UUID or QR scan</div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-pink-50/50 border border-pink-100 rounded-xl">
              <div className="w-7 h-7 rounded-xl bg-pink-100 flex items-center justify-center text-pink-700 text-xs font-bold shrink-0">3</div>
              <div>
                <div className="text-sm font-bold text-slate-800">Share or Download</div>
                <div className="text-xs text-slate-500 font-medium">Download PDF or copy verification link</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
