import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import { FileText, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/constants';

const VerificationLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await adminService.getLogs();
        setLogs(data || []);
      } catch (error) {
        toast.error('Failed to load verification logs');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => {
    const res = log.verificationResult || log.result;
    const matchesSearch = (log.certificateId && log.certificateId.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (log.verifierName && log.verifierName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (log.verifierOrganization && log.verifierOrganization.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filter === 'ALL' || res === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><FileText className="text-[#00d4ff]"/> Verification Audit Logs</h1>
          <p className="text-gray-400 text-sm mt-1">Track all certificate verification attempts globally in real-time</p>
        </div>
        
        <div className="flex gap-2">
          <select 
            className="form-select w-40 text-sm"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="ALL">All Results</option>
            <option value="GENUINE">Genuine</option>
            <option value="TAMPERED">Tampered</option>
            <option value="REVOKED">Revoked</option>
            <option value="NOT_FOUND">Not Found</option>
          </select>
        </div>
      </div>

      <div className="glass-panel p-4 mb-6 flex items-center gap-2">
        <Search size={18} className="text-gray-400" />
        <input 
          type="text" 
          placeholder="Search by Certificate ID, Verifier Name, or Organization..." 
          className="bg-transparent border-none outline-none text-white w-full text-sm"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Certificate ID</th>
                <th>Result</th>
                <th>Verifier Details</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => {
                const res = log.verificationResult || log.result;
                return (
                  <tr key={log.id}>
                    <td className="text-sm text-gray-300 whitespace-nowrap">{formatDate(log.verifiedAt || log.verificationTime)}</td>
                    <td className="font-mono text-xs text-[#00d4ff]">
                      {log.certificateId ? `${log.certificateId.substring(0, 16)}...` : 'Unknown'}
                    </td>
                    <td>
                      <Badge variant={
                        res === 'GENUINE' ? 'success' : 
                        res === 'TAMPERED' ? 'danger' : 
                        res === 'REVOKED' ? 'warning' : 'default'
                      }>
                        {res}
                      </Badge>
                    </td>
                    <td className="text-sm">
                      <div className="text-white font-medium">{log.verifierName || 'Anonymous'}</div>
                      <div className="text-gray-500 text-xs">{log.verifierOrganization || 'N/A'}</div>
                    </td>
                    <td className="font-mono text-xs text-gray-400">{log.ipAddress || '127.0.0.1'}</td>
                  </tr>
                );
              })}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-8">No audit logs match criteria</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default VerificationLogs;
