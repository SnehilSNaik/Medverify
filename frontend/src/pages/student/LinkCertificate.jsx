import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Link2, Shield, ScanLine, Keyboard, CheckCircle2, AlertTriangle, Loader2, ArrowLeft } from 'lucide-react';
import { studentService } from '../../services/studentService';
import { useAuth } from '../../hooks/useAuth';
import QRScanner from '../../components/certificate/QRScanner';
import toast from 'react-hot-toast';

const LinkCertificate = () => {
  const [activeTab, setActiveTab] = useState('manual');
  const [certificateId, setCertificateId] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const { addLinkedCertificate, linkedCertificates } = useAuth();
  const navigate = useNavigate();

  const handleQRResult = (text) => {
    let id = text;
    try {
      if (text.startsWith('http')) {
        const url = new URL(text);
        const parts = url.pathname.split('/');
        id = parts[parts.length - 1];
      }
    } catch (e) {}
    setCertificateId(id);
    setActiveTab('manual');
    toast.success('QR Code scanned — certificate UUID captured');
  };

  const handleVerifyAndPreview = async (e) => {
    if (e) e.preventDefault();
    if (!certificateId.trim()) {
      toast.error('Please enter a certificate ID');
      return;
    }

    if (linkedCertificates.includes(certificateId.trim())) {
      toast.error('This certificate is already linked to your vault');
      return;
    }

    setLoading(true);
    setError('');
    setPreview(null);

    try {
      const result = await studentService.verifyCertificate(certificateId.trim());
      setPreview(result);
    } catch (err) {
      setError('Could not find this certificate. Please check the UUID and try again.');
      toast.error('Certificate not found');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmLink = () => {
    addLinkedCertificate(certificateId.trim());
    toast.success('Certificate linked to your vault!');
    navigate('/student/certificates');
  };

  const getStatusInfo = (result) => {
    const status = result?.result || result?.status;
    if (status === 'GENUINE') return { color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0', label: 'Verified Genuine ✓', icon: CheckCircle2 };
    if (status === 'TAMPERED') return { color: '#ef4444', bg: '#fef2f2', border: '#fecaca', label: 'Tampered Signature ✗', icon: AlertTriangle };
    if (status === 'REVOKED') return { color: '#f59e0b', bg: '#fffbeb', border: '#fde68a', label: 'Revoked Certificate', icon: AlertTriangle };
    return { color: '#64748b', bg: '#f8fafc', border: '#e2e8f0', label: 'Not Found', icon: AlertTriangle };
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <button onClick={() => navigate('/student/dashboard')} className="btn btn-ghost p-2 text-slate-400 hover:text-slate-800">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2.5">
            <Link2 className="text-pink-600" /> Link Certificate to Vault
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Add a medical certificate to your personal records via UUID or QR scan</p>
        </div>
      </div>

      {!preview && (
        <div className="bg-white rounded-3xl overflow-hidden border border-pink-100 shadow-sm">
          <div className="flex border-b border-pink-100 bg-pink-50/40">
            <button 
              type="button"
              className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold text-sm transition-all ${activeTab === 'manual' ? 'bg-white text-pink-600 border-b-2 border-pink-500 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              onClick={() => setActiveTab('manual')}
            >
              <Keyboard size={18} /> Enter Certificate UUID
            </button>
            <button 
              type="button"
              className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold text-sm transition-all ${activeTab === 'scan' ? 'bg-white text-pink-600 border-b-2 border-pink-500 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              onClick={() => setActiveTab('scan')}
            >
              <ScanLine size={18} /> Scan QR Code
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'scan' && (
              <div className="animate-fade-in">
                <QRScanner onResult={handleQRResult} />
              </div>
            )}

            {activeTab === 'manual' && (
              <form onSubmit={handleVerifyAndPreview} className="animate-fade-in space-y-6">
                <div className="form-group">
                  <label className="form-label">Certificate UUID *</label>
                  <input 
                    type="text" 
                    className="form-input font-mono text-sm py-3" 
                    placeholder="e.g. 8c1b9007-46de-4e9c-a8ba-b1abb37f869c"
                    value={certificateId}
                    onChange={(e) => setCertificateId(e.target.value)}
                    required
                  />
                  <p className="text-xs text-slate-400 mt-1.5 font-medium">Found in your paper certificate header or underneath the QR code</p>
                </div>

                {error && (
                  <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-red-700 text-xs font-semibold">
                    <AlertTriangle size={15} />
                    <span>{error}</span>
                  </div>
                )}

                <button 
                  type="submit" 
                  className="btn btn-primary w-full py-3.5 text-base font-bold shadow-[0_6px_22px_rgba(236,72,153,0.35)]"
                  disabled={loading || !certificateId.trim()}
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : (
                    <>
                      <Shield size={20} /> Verify & Preview Certificate
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Preview Card */}
      {preview && !loading && (
        <div className="animate-slide-up space-y-4">
          <div className="bg-white rounded-3xl p-6 border-2 shadow-md" style={{ borderColor: getStatusInfo(preview).border }}>
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
              {React.createElement(getStatusInfo(preview).icon, { size: 28, style: { color: getStatusInfo(preview).color } })}
              <div>
                <h3 className="text-lg font-extrabold" style={{ color: getStatusInfo(preview).color }}>{getStatusInfo(preview).label}</h3>
                <p className="text-xs text-slate-500 font-medium">{preview.message || 'Cryptographic record found'}</p>
              </div>
            </div>

            {preview.patientName && (
              <div className="grid grid-cols-2 gap-4 text-sm mb-4 p-4 bg-slate-50 rounded-2xl">
                <div>
                  <span className="text-slate-400 text-xs font-semibold block">Patient Name</span>
                  <p className="text-slate-800 font-bold mt-0.5">{preview.patientName}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-xs font-semibold block">Issuing Hospital</span>
                  <p className="text-slate-800 font-bold mt-0.5">{preview.hospitalName}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-xs font-semibold block">Doctor</span>
                  <p className="text-slate-800 font-bold mt-0.5">{preview.doctorName}</p>
                </div>
                <div>
                  <span className="text-slate-400 text-xs font-semibold block">Diagnosis</span>
                  <p className="text-slate-800 font-bold mt-0.5">{preview.disease}</p>
                </div>
              </div>
            )}

            <div className="font-mono text-xs text-pink-700 bg-pink-50 border border-pink-200 p-3 rounded-xl break-all font-bold">
              {certificateId}
            </div>
          </div>

          <div className="flex gap-4">
            <button 
              onClick={() => { setPreview(null); setCertificateId(''); setError(''); }}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirmLink}
              className="btn btn-primary flex-1 shadow-[0_6px_22px_rgba(236,72,153,0.35)]"
            >
              <Link2 size={18} /> Confirm & Link Certificate
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LinkCertificate;
