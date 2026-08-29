import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, SearchX, FileText, User, Calendar, Building, Stethoscope, ShieldCheck, Award } from 'lucide-react';
import { formatDate } from '../../utils/constants';

const CertificateCard = ({ result }) => {
  if (!result) return null;

  const status = result.result || result.status || 'NOT_FOUND';
  const message = result.message || 'Cryptographic verification complete';

  const statusConfig = {
    GENUINE: { 
      icon: CheckCircle, 
      color: '#10b981', 
      bg: '#ecfdf5', 
      border: '#a7f3d0', 
      badgeText: 'text-emerald-700', 
      title: 'Verified Genuine Certificate',
      subtitle: 'Cryptographic SHA-256 Hash & RSA-2048 Digital Signature Match'
    },
    TAMPERED: { 
      icon: AlertTriangle, 
      color: '#ef4444', 
      bg: '#fef2f2', 
      border: '#fecaca', 
      badgeText: 'text-red-700', 
      title: 'Tampered / Invalid Signature',
      subtitle: 'Warning: Certificate data was modified or signed by an unauthorized key'
    },
    REVOKED: { 
      icon: XCircle, 
      color: '#f59e0b', 
      bg: '#fffbeb', 
      border: '#fde68a', 
      badgeText: 'text-amber-700', 
      title: 'Certificate Revoked',
      subtitle: 'This medical certificate has been officially revoked by the issuing hospital'
    },
    NOT_FOUND: { 
      icon: SearchX, 
      color: '#64748b', 
      bg: '#f8fafc', 
      border: '#e2e8f0', 
      badgeText: 'text-slate-700', 
      title: 'Certificate Not Found',
      subtitle: 'No cryptographic record matches the provided Certificate UUID'
    }
  };

  const config = statusConfig[status] || statusConfig.NOT_FOUND;
  const StatusIcon = config.icon;
  const data = result;

  return (
    <div className="w-full max-w-2xl mx-auto animate-slide-up">
      <div 
        className="bg-white rounded-3xl overflow-hidden border-2 shadow-[0_20px_50px_rgba(244,63,94,0.1)] relative"
        style={{ borderColor: config.color }}
      >
        {/* Top Status Banner */}
        <div 
          className="p-6 flex items-center gap-4 border-b"
          style={{ backgroundColor: config.bg, borderColor: config.border }}
        >
          <div 
            className="p-3 rounded-2xl bg-white shadow-sm flex items-center justify-center"
            style={{ color: config.color }}
          >
            <StatusIcon size={32} />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold" style={{ color: config.color }}>{config.title}</h2>
              <span className="text-[11px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white border" style={{ borderColor: config.border, color: config.color }}>
                {status}
              </span>
            </div>
            <p className="text-slate-600 text-xs mt-1 font-medium">{config.subtitle}</p>
          </div>
        </div>

        {/* Certificate Body */}
        {status !== 'NOT_FOUND' && data.patientName && (
          <div className="p-7 space-y-6 bg-white">
            {/* Header Stamp */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-50 rounded-xl text-rose-600">
                  <Award size={20} />
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-600">Official Medical Record</span>
                  <p className="text-sm font-bold text-slate-800">{data.hospitalName || 'Verified Healthcare Center'}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Verification ID</span>
                <p className="font-mono text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded">
                  {data.certificateId ? data.certificateId.substring(0, 13) + '...' : 'N/A'}
                </p>
              </div>
            </div>

            {/* Patient & Diagnosis Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-4 bg-rose-50/40 rounded-2xl border border-rose-100/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                  <User size={14} /> Patient Information
                </h4>
                <div>
                  <span className="text-[11px] text-slate-500 font-medium">Full Name</span>
                  <p className="text-base font-bold text-slate-800">{data.patientName}</p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500 font-medium">Age</span>
                    <p className="font-bold text-slate-800">{data.age} yrs</p>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium">Gender</span>
                    <p className="font-bold text-slate-800">{data.gender}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <FileText size={14} /> Medical Condition
                </h4>
                <div>
                  <span className="text-[11px] text-slate-500 font-medium">Diagnosis</span>
                  <p className="text-base font-bold text-slate-800">{data.disease}</p>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500 font-medium">Prescription & Leave</span>
                  <p className="text-xs text-slate-600 line-clamp-2">{data.treatment}</p>
                </div>
              </div>
            </div>

            {/* Doctor & Validity Info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-slate-50/70 rounded-2xl border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 font-medium flex items-center gap-1"><Stethoscope size={13} className="text-rose-500" /> Physician</span>
                <p className="font-bold text-slate-800 mt-0.5">{data.doctorName || 'Authorized Physician'}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium flex items-center gap-1"><Calendar size={13} className="text-rose-500" /> Issue Date</span>
                <p className="font-bold text-slate-800 mt-0.5">{formatDate(data.issueDate)}</p>
              </div>
              <div>
                <span className="text-slate-400 font-medium flex items-center gap-1"><Calendar size={13} className="text-rose-500" /> Expiry Date</span>
                <p className="font-bold text-slate-800 mt-0.5">{formatDate(data.expiryDate)}</p>
              </div>
            </div>

            {/* Cryptographic Key Verification Stamp */}
            <div className="p-3 bg-emerald-50/60 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-emerald-800 font-semibold">
                <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
                <span>Hospital RSA-2048 Signature Verified</span>
              </div>
              <span className="font-mono text-[10px] text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200 font-bold">
                SHA-256 MATCH
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CertificateCard;
