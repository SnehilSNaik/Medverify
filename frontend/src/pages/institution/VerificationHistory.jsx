import React, { useState } from 'react';
import Badge from '../../components/common/Badge';
import { Activity, Search, ShieldCheck, AlertTriangle, XCircle } from 'lucide-react';
import { formatDate } from '../../utils/constants';

const VerificationHistory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('ALL');

  const logs = [];

  const filteredLogs = logs.filter(log => {
    const res = log.verificationResult || log.result;
    const matchesSearch = (log.certificateId && log.certificateId.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          (log.verifierName && log.verifierName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filter === 'ALL' || res === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2.5">
            <Activity className="text-teal-600" /> Verification History & Audit Log
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Track all certificate verification attempts executed by your organization</p>
        </div>
        
        <div className="flex gap-2">
          <select 
            className="form-select w-44 text-xs font-bold"
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

      <div className="bg-white border border-slate-200/80 p-4 rounded-2xl flex items-center gap-3 shadow-xs">
        <Search size={18} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Search by Certificate UUID or Verifier Name..." 
          className="bg-transparent border-none outline-none text-slate-800 w-full text-sm font-medium placeholder:text-slate-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {filteredLogs.length > 0 ? (
        <div className="table-container shadow-xs">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Certificate ID</th>
                <th>Result</th>
                <th>Verifier</th>
                <th>IP Address</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map(log => {
                const res = log.verificationResult || log.result;
                return (
                  <tr key={log.id}>
                    <td className="text-xs text-slate-500 whitespace-nowrap font-medium">{formatDate(log.verifiedAt)}</td>
                    <td className="font-mono text-xs font-bold text-teal-700">
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
                    <td className="text-xs">
                      <div className="font-bold text-slate-800">{log.verifierName || 'Anonymous'}</div>
                      <div className="text-slate-400 text-[11px] font-medium">{log.verifierOrganization || 'N/A'}</div>
                    </td>
                    <td className="font-mono text-xs text-slate-400 font-medium">{log.ipAddress || 'N/A'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/80 rounded-3xl text-center py-16 px-6 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-teal-50 border border-teal-100 flex items-center justify-center mx-auto mb-4 text-teal-600">
            <Activity size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">No Verification Records Yet</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto font-medium">
            Your verification history will appear here once you start verifying medical certificates. Go to the Verify Certificate page to get started.
          </p>
        </div>
      )}
    </div>
  );
};

export default VerificationHistory;
