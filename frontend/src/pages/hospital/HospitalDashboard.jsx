import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hospitalService } from '../../services/hospitalService';
import StatsCard from '../../components/dashboard/StatsCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { FileText, Stethoscope, FilePlus2, ShieldCheck, Activity } from 'lucide-react';

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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Hospital Operations Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Manage medical certificates, doctor registry, and digital signatures</p>
        </div>
        <button onClick={() => navigate('/hospital/issue')} className="btn btn-primary">
          <FilePlus2 size={18} /> Issue New Certificate
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard title="Total Issued" value={stats.totalCertificates} icon={FileText} color="primary" />
        <StatsCard title="Active Doctors" value={stats.activeDoctors} icon={Stethoscope} color="info" />
        <StatsCard title="Active Certificates" value={stats.activeCertificates} icon={ShieldCheck} color="success" />
        <StatsCard title="Revoked" value={stats.revokedCertificates} icon={Activity} color="warning" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
        <div className="glass-card">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            <div 
              onClick={() => navigate('/hospital/issue')}
              className="p-4 border border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.05)] rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-[rgba(0,212,255,0.1)] transition-colors text-center"
            >
              <FilePlus2 className="text-[#00d4ff]" size={32} />
              <span className="font-medium text-white">Issue Certificate</span>
            </div>
            <div 
              onClick={() => navigate('/hospital/certificates')}
              className="p-4 border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] rounded-xl flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-[rgba(255,255,255,0.05)] transition-colors text-center"
            >
              <FileText className="text-gray-300" size={32} />
              <span className="font-medium text-white">View Records</span>
            </div>
          </div>
        </div>

        <div className="glass-card">
          <h2 className="text-lg font-semibold text-white mb-4">Cryptographic Security Status</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[rgba(16,185,129,0.05)] border border-[rgba(16,185,129,0.2)] rounded-lg">
              <div className="flex items-center gap-3">
                <ShieldCheck className="text-[#10b981]" size={24} />
                <div>
                  <div className="font-medium text-[#10b981]">RSA Keys Active</div>
                  <div className="text-xs text-gray-400">Hospital digital signature keys configured</div>
                </div>
              </div>
              <div className="text-xs font-bold text-[#10b981] bg-[rgba(16,185,129,0.1)] px-2.5 py-1 rounded border border-[rgba(16,185,129,0.3)]">SECURE</div>
            </div>
            <p className="text-sm text-gray-400">
              All certificates issued are cryptographically signed using SHA-256 and RSA-2048. Modifying any field invalidates the signature instantly, guaranteeing authenticity.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
