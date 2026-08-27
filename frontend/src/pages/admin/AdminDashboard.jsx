import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import StatsCard from '../../components/dashboard/StatsCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { FileText, Building2, AlertTriangle, ShieldCheck, Activity, XCircle } from 'lucide-react';
import { formatDate } from '../../utils/constants';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, logsData] = await Promise.all([
          adminService.getStats(),
          adminService.getLogs()
        ]);
        setStats(statsData);
        setLogs(logsData || []);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner fullScreen />;
  if (!stats) return <div className="text-center text-red-500 py-12">Failed to load dashboard</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Platform Overview</h1>
          <p className="text-gray-400 text-sm mt-1">System-wide metrics and cryptographic activities</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard title="Total Certificates" value={stats.totalCertificates} icon={FileText} color="primary" />
        <StatsCard title="Total Hospitals" value={stats.totalHospitals} icon={Building2} color="secondary" />
        <StatsCard title="Fraud Attempts" value={stats.fraudAttempts || stats.tamperedVerifications} icon={AlertTriangle} color="danger" />
        <StatsCard title="Total Verifications" value={stats.totalVerifications} icon={Activity} color="info" />
        <StatsCard title="Revoked Certificates" value={stats.revokedCertificates} icon={XCircle} color="warning" />
        <StatsCard title="Genuine Verifications" value={stats.genuineVerifications} icon={ShieldCheck} color="success" />
      </div>

      <div className="mt-8 glass-card">
        <h2 className="text-lg font-semibold text-white mb-4">Recent Verification Activity</h2>
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Certificate ID</th>
                <th>Result</th>
                <th>Verifier</th>
                <th>Organization</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {logs && logs.length > 0 ? (
                logs.slice(0, 10).map((log) => (
                  <tr key={log.id}>
                    <td className="font-mono text-xs text-gray-300">
                      {log.certificateId ? `${log.certificateId.substring(0, 12)}...` : 'N/A'}
                    </td>
                    <td>
                      <Badge variant={
                        log.verificationResult === 'GENUINE' ? 'success' : 
                        log.verificationResult === 'TAMPERED' ? 'danger' : 
                        log.verificationResult === 'REVOKED' ? 'warning' : 'default'
                      }>
                        {log.verificationResult}
                      </Badge>
                    </td>
                    <td className="text-sm">{log.verifierName || 'Anonymous'}</td>
                    <td className="text-sm text-gray-400">{log.verifierOrganization || 'N/A'}</td>
                    <td className="text-sm text-gray-400">{formatDate(log.verifiedAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-4">No recent verification activity</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
