import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, SearchX, FileText, User, Calendar, Building, Stethoscope } from 'lucide-react';
import { formatDate } from '../../utils/constants';

const CertificateCard = ({ result }) => {
  if (!result) return null;

  // The backend VerifyResponse returns properties directly or in result object
  const status = result.result || result.status || 'NOT_FOUND';
  const message = result.message || 'Verification complete';

  const statusConfig = {
    GENUINE: { icon: CheckCircle, color: '#10b981', bg: 'rgba(16,185,129,0.1)', border: 'rgba(16,185,129,0.3)', shadow: 'rgba(16,185,129,0.2)', title: 'Verified Genuine Certificate' },
    TAMPERED: { icon: AlertTriangle, color: '#ef4444', bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)', shadow: 'rgba(239,68,68,0.2)', title: 'Tampered / Invalid Signature' },
    REVOKED: { icon: XCircle, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', border: 'rgba(245,158,11,0.3)', shadow: 'rgba(245,158,11,0.2)', title: 'Certificate Revoked' },
    NOT_FOUND: { icon: SearchX, color: '#94a3b8', bg: 'rgba(148,163,184,0.1)', border: 'rgba(148,163,184,0.3)', shadow: 'rgba(148,163,184,0.2)', title: 'Certificate Not Found' }
  };

  const config = statusConfig[status] || statusConfig.NOT_FOUND;
  const StatusIcon = config.icon;

  const data = result;

  return (
    <div className="w-full max-w-2xl mx-auto animate-slide-up">
      <div 
        className="glass-panel overflow-hidden border-t-4"
        style={{ borderTopColor: config.color, boxShadow: `0 8px 32px 0 ${config.shadow}` }}
      >
        <div className="p-6 border-b border-[rgba(255,255,255,0.05)] flex items-center gap-4 bg-[rgba(255,255,255,0.02)]">
          <div className="p-3 rounded-full" style={{ backgroundColor: config.bg, color: config.color }}>
            <StatusIcon size={32} />
          </div>
          <div>
            <h2 className="text-2xl font-bold" style={{ color: config.color }}>{config.title}</h2>
            <p className="text-gray-300 mt-1 text-sm">{message}</p>
          </div>
        </div>

        {status !== 'NOT_FOUND' && data.patientName && (
          <div className="p-6 grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-[rgba(255,255,255,0.1)] pb-2 flex items-center gap-2">
                <User size={18} className="text-[#00d4ff]" /> Patient Details
              </h3>
              <div>
                <p className="text-sm text-gray-400">Name</p>
                <p className="font-medium text-white">{data.patientName}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">Age</p>
                  <p className="font-medium text-white">{data.age}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Gender</p>
                  <p className="font-medium text-white">{data.gender}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white border-b border-[rgba(255,255,255,0.1)] pb-2 flex items-center gap-2">
                <FileText size={18} className="text-[#00d4ff]" /> Medical Details
              </h3>
              <div>
                <p className="text-sm text-gray-400">Diagnosis / Condition</p>
                <p className="font-medium text-white">{data.disease}</p>
              </div>
              <div>
                <p className="text-sm text-gray-400">Treatment Plan</p>
                <p className="font-medium text-white" title={data.treatment}>{data.treatment}</p>
              </div>
            </div>

            <div className="space-y-4 md:col-span-2">
              <h3 className="text-lg font-semibold text-white border-b border-[rgba(255,255,255,0.1)] pb-2 flex items-center gap-2">
                <Building size={18} className="text-[#00d4ff]" /> Issuance & Security Info
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-400 flex items-center gap-1"><Building size={14}/> Hospital</p>
                  <p className="font-medium text-white">{data.hospitalName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 flex items-center gap-1"><Stethoscope size={14}/> Authorizing Doctor</p>
                  <p className="font-medium text-white">{data.doctorName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 flex items-center gap-1"><FileText size={14}/> Certificate ID</p>
                  <p className="font-mono text-xs mt-1 text-[#00d4ff] bg-[rgba(0,212,255,0.1)] p-1 rounded break-all">{data.certificateId}</p>
                </div>
              </div>
            </div>
            
            <div className="space-y-4 md:col-span-2">
               <div className="grid grid-cols-2 gap-4">
                 <div className="bg-[rgba(255,255,255,0.03)] p-3 rounded-lg border border-[rgba(255,255,255,0.05)]">
                   <p className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={12}/> Issue Date</p>
                   <p className="font-medium text-white mt-1">{formatDate(data.issueDate)}</p>
                 </div>
                 <div className="bg-[rgba(255,255,255,0.03)] p-3 rounded-lg border border-[rgba(255,255,255,0.05)]">
                   <p className="text-xs text-gray-400 flex items-center gap-1"><Calendar size={12}/> Expiry Date</p>
                   <p className="font-medium text-white mt-1">{formatDate(data.expiryDate)}</p>
                 </div>
               </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateCard;
