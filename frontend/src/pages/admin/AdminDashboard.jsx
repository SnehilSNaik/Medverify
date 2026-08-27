import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import StatsCard from '../../components/dashboard/StatsCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { 
  FileText, Building2, AlertTriangle, ShieldCheck, Activity, 
  XCircle, ShieldAlert, History, Lock, Server, CheckCircle2 
} from 'lucide-react';
import { formatDate } from '../../utils/constants';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [logs, setLogs] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('audit'); // 'audit' or 'verifications'
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, logsData, auditData] = await Promise.all([
          adminService.getStats(),
          adminService.getLogs(),
          adminService.getAuditLogs().catch(() => [])
        ]);
        setStats(statsData);
        setLogs(logsData || []);
        setAuditLogs(auditData || []);
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2.5">
            <ShieldCheck className="text-[#00d4ff]" size={28} />
            Security & Platform Overview
          </h1>
          <p className="text-gray-400 text-sm mt-1">Real-time cryptographic audit trail, fraud telemetry, and system metrics</p>
        </div>

        <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.08] px-3 py-1.5 rounded-xl">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-xs text-gray-300 font-medium">Protection Systems Active</span>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard title="Total Certificates" value={stats.totalCertificates} icon={FileText} color="primary" />
        <StatsCard title="Registered Hospitals" value={stats.totalHospitals} icon={Building2} color="secondary" />
        <StatsCard title="Fraud / Tamper Attempts" value={stats.fraudAttempts || stats.tamperedVerifications} icon={AlertTriangle} color="danger" />
        <StatsCard title="Total Verifications" value={stats.totalVerifications} icon={Activity} color="info" />
        <StatsCard title="Revoked Certificates" value={stats.revokedCertificates} icon={XCircle} color="warning" />
        <StatsCard title="Genuine Certificates" value={stats.genuineVerifications} icon={ShieldCheck} color="success" />
      </div>

      {/* Security Engine Telemetry Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card p-4 flex items-center gap-3 border border-cyan-500/20">
          <div className="p-2.5 bg-cyan-500/10 rounded-xl text-cyan-400">
            <Lock size={20} />
          </div>
          <div>
            <div className="text-xs text-gray-400">Brute-Force Guard</div>
            <div className="text-sm font-semibold text-white">Sliding Rate Limiter Active</div>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3 border border-emerald-500/20">
          <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-400">
            <Server size={20} />
          </div>
          <div>
            <div className="text-xs text-gray-400">Digital Signatures</div>
            <div className="text-sm font-semibold text-white">RSA-2048 / SHA-256</div>
          </div>
        </div>

        <div className="glass-card p-4 flex items-center gap-3 border border-purple-500/20">
          <div className="p-2.5 bg-purple-500/10 rounded-xl text-purple-400">
            <ShieldAlert size={20} />
          </div>
          <div>
            <div className="text-xs text-gray-400">Account Protection</div>
            <div className="text-sm font-semibold text-white">Auto 15-Min Lockout (5 Fails)</div>
          </div>
        </div>
      </div>

      {/* Tabbed Activity / Audit Section */}
      <div className="mt-8 glass-card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-4 border-b border-white/[0.08]">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'audit'
                  ? 'bg-gradient-to-r from-[#00d4ff]/20 to-[#0077ff]/20 border border-[#00d4ff]/40 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <History size={16} className={activeTab === 'audit' ? 'text-[#00d4ff]' : ''} />
              Live Security Audit Trail
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-white/10">{auditLogs.length}</span>
            </button>
            <button
              onClick={() => setActiveTab('verifications')}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${
                activeTab === 'verifications'
                  ? 'bg-gradient-to-r from-[#00d4ff]/20 to-[#0077ff]/20 border border-[#00d4ff]/40 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Activity size={16} className={activeTab === 'verifications' ? 'text-[#00d4ff]' : ''} />
              Recent Verifications
              <span className="ml-1 px-1.5 py-0.5 rounded-full text-[10px] bg-white/10">{logs.length}</span>
            </button>
          </div>
        </div>

        {activeTab === 'audit' ? (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Severity</th>
                  <th>Action</th>
                  <th>Actor</th>
                  <th>Details</th>
                  <th>IP Address</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs && auditLogs.length > 0 ? (
                  auditLogs.slice(0, 15).map((log) => (
                    <tr key={log.id}>
                      <td>
                        <Badge variant={
                          log.severity === 'CRITICAL' ? 'danger' :
                          log.severity === 'WARNING' ? 'warning' : 'info'
                        }>
                          {log.severity}
                        </Badge>
                      </td>
                      <td className="font-mono text-xs text-[#00d4ff] font-medium">
                        {log.action}
                      </td>
                      <td className="text-sm">
                        <span className="text-white font-medium">{log.username}</span>
                        {log.role && <span className="text-gray-500 text-xs ml-1">({log.role})</span>}
                      </td>
                      <td className="text-sm text-gray-300 max-w-xs truncate" title={log.details}>
                        {log.details || 'N/A'}
                      </td>
                      <td className="text-xs font-mono text-gray-400">{log.ipAddress || 'system'}</td>
                      <td className="text-xs text-gray-400">{formatDate(log.timestamp)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-gray-500 py-6">
                      No security audit events recorded yet. Activity will appear here automatically.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Certificate ID</th>
                  <th>Result</th>
                  <th>Verifier</th>
                  <th>Organization</th>
                  <th>IP Address</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {logs && logs.length > 0 ? (
                  logs.slice(0, 15).map((log) => (
                    <tr key={log.id}>
                      <td className="font-mono text-xs text-gray-300">
                        {log.certificateId ? `${log.certificateId.substring(0, 16)}...` : 'N/A'}
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
                      <td className="text-xs font-mono text-gray-400">{log.ipAddress || 'N/A'}</td>
                      <td className="text-sm text-gray-400">{formatDate(log.verifiedAt)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-gray-500 py-6">No recent verification activity</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
