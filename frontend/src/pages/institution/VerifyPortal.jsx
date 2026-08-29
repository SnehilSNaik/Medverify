import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, ScanLine, Keyboard, ArrowLeft, CheckCircle2, ShieldCheck, HeartPulse } from 'lucide-react';
import { verificationService } from '../../services/verificationService';
import QRScanner from '../../components/certificate/QRScanner';
import CertificateCard from '../../components/certificate/CertificateCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const VerifyPortal = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('scan');
  const [scannedId, setScannedId] = useState('');
  
  const [formData, setFormData] = useState({
    certificateId: '',
    verifierName: user?.username || '',
    verifierOrganization: user?.organizationName || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleQRResult = (text) => {
    let id = text;
    try {
      if (text.startsWith('http')) {
        const url = new URL(text);
        const parts = url.pathname.split('/');
        id = parts[parts.length - 1];
      }
    } catch (e) {}
    
    setScannedId(id);
    setFormData(prev => ({ ...prev, certificateId: id }));
    toast.success('QR Code Scanned Successfully');
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleVerify = async (e) => {
    if (e) e.preventDefault();
    
    if (!formData.certificateId || !formData.verifierName || !formData.verifierOrganization) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);
    setResult(null);
    
    try {
      const response = await verificationService.verify({
        certificateId: formData.certificateId.trim(),
        verifierName: formData.verifierName.trim(),
        verifierOrganization: formData.verifierOrganization.trim()
      });
      setResult(response);
      const statusResult = response.result || response.status;
      if (statusResult === 'GENUINE') toast.success('Certificate Verified as Genuine!');
      else if (statusResult === 'TAMPERED') toast.error('WARNING: Certificate signature tampered!');
      else if (statusResult === 'REVOKED') toast.error('Certificate has been revoked');
      else toast.error('Certificate not found');
    } catch (error) {
      setResult({
        result: 'NOT_FOUND',
        message: error.response?.data?.message || 'Verification failed'
      });
      toast.error('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2.5">
            <ShieldCheck className="text-teal-600" size={28} /> Verify Medical Certificate
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Verify the validity of submitted medical certificates</p>
        </div>
      </div>

      {!result && !loading && (
        <div className="bg-white rounded-3xl overflow-hidden border border-teal-100 shadow-sm">
          <div className="flex border-b border-teal-100 bg-teal-50/40">
            <button 
              type="button"
              className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold text-sm transition-all ${activeTab === 'scan' ? 'bg-white text-teal-700 border-b-2 border-teal-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              onClick={() => setActiveTab('scan')}
            >
              <ScanLine size={18} /> Live QR Scanner
            </button>
            <button 
              type="button"
              className={`flex-1 py-4 flex items-center justify-center gap-2 font-bold text-sm transition-all ${activeTab === 'manual' ? 'bg-white text-teal-700 border-b-2 border-teal-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
              onClick={() => setActiveTab('manual')}
            >
              <Keyboard size={18} /> Enter Certificate ID
            </button>
          </div>

          <div className="p-8">
            {activeTab === 'scan' && (
              <div className="animate-fade-in space-y-6">
                <QRScanner onResult={handleQRResult} />
                {scannedId && (
                  <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 text-center">
                    <p className="text-xs text-teal-700 font-bold uppercase tracking-wider">Scanned Certificate ID</p>
                    <p className="font-mono text-teal-900 font-bold text-sm mt-1">{scannedId}</p>
                  </div>
                )}
              </div>
            )}

            <form onSubmit={handleVerify} className="mt-8 space-y-6">
              {activeTab === 'manual' && (
                <div className="form-group animate-fade-in">
                  <label className="form-label">Certificate UUID *</label>
                  <input 
                    type="text" 
                    name="certificateId" 
                    className="form-input font-mono text-sm py-3" 
                    placeholder="Enter 36-character UUID (e.g. 8c1b9007-46de-4e9c-a8ba-b1abb37f869c)"
                    value={formData.certificateId}
                    onChange={handleChange}
                    required
                  />
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                <div className="form-group">
                  <label className="form-label">Verifier Name *</label>
                  <input 
                    type="text" name="verifierName" className="form-input" 
                    placeholder="Your full name"
                    value={formData.verifierName}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Organization Name *</label>
                  <input 
                    type="text" name="verifierOrganization" className="form-input" 
                    placeholder="Your college or company name"
                    value={formData.verifierOrganization}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="w-full py-3.5 text-base font-bold rounded-xl flex items-center justify-center gap-2 text-white bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 shadow-[0_6px_22px_rgba(13,148,136,0.35)] transition-all cursor-pointer"
                disabled={loading || (!formData.certificateId && activeTab === 'manual')}
              >
                <ShieldCheck size={20} /> Verify Authenticity Now
              </button>
            </form>
          </div>
        </div>
      )}

      {loading && (
        <div className="bg-white border border-teal-100 rounded-3xl p-16 flex flex-col items-center justify-center min-h-[380px] shadow-sm">
          <LoadingSpinner />
          <p className="mt-6 text-teal-700 font-extrabold animate-pulse text-lg">Running Cryptographic Verification...</p>
          <p className="text-slate-400 text-xs mt-1.5 text-center max-w-sm font-medium">Re-computing SHA-256 hash and verifying RSA digital signature</p>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-6 animate-fade-in">
          <button 
            onClick={() => { setResult(null); setScannedId(''); setFormData({...formData, certificateId: ''}); setActiveTab('scan'); }}
            className="btn btn-secondary"
          >
            <ArrowLeft size={16} /> Verify Another Certificate
          </button>
          <CertificateCard result={result} />
        </div>
      )}
    </div>
  );
};

export default VerifyPortal;
