import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Shield, ScanLine, Keyboard, ArrowLeft, HeartPulse, CheckCircle2, ShieldCheck, Sparkles, Building2, User, KeyRound } from 'lucide-react';
import { verificationService } from '../../services/verificationService';
import QRScanner from '../../components/certificate/QRScanner';
import CertificateCard from '../../components/certificate/CertificateCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const Verify = () => {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  
  const [activeTab, setActiveTab] = useState(certificateId ? 'manual' : 'scan');
  const [scannedId, setScannedId] = useState(certificateId || '');
  
  const [formData, setFormData] = useState({
    certificateId: certificateId || '',
    verifierName: user?.username || '',
    verifierOrganization: user?.organizationName || user?.hospitalName || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (certificateId) {
      setFormData(prev => ({ ...prev, certificateId }));
      setScannedId(certificateId);
    }
  }, [certificateId]);

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
      toast.error('Please fill in all verification fields');
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
    <div className="public-shell min-h-screen flex flex-col justify-between p-4 md:p-8 relative">

      {/* Header Bar */}
      <header className="portal-header max-w-5xl w-full mx-auto flex items-center justify-between py-4 mb-4 border-b relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl brand-mark flex items-center justify-center text-white shadow-sm">
            <HeartPulse size={22} className="animate-pulse" />
          </div>
          <div>
            <span className="font-black text-xl tracking-tight gradient-text-mint">MedVerify</span>
            <span className="text-[10px] uppercase font-extrabold text-slate-400 block tracking-wider">Public Verification Portal</span>
          </div>
        </div>

        <div>
          {isAuthenticated ? (
            <button 
              onClick={() => {
                if (user?.role === 'HOSPITAL') navigate('/hospital/dashboard');
                else if (user?.role === 'STUDENT') navigate('/student/dashboard');
                else navigate('/institution/dashboard');
              }}
              className="btn btn-secondary text-xs font-extrabold"
            >
              Go to Dashboard →
            </button>
          ) : (
            <Link to="/login" className="btn btn-secondary text-xs font-extrabold">
              Sign In to Portal →
            </Link>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-4xl w-full mx-auto flex-1 my-auto relative z-10">
        <div className="text-center mb-7 flex flex-col items-center">
          {/* Floating 3D Shield */}
          <div className="w-20 h-20 mb-3 animate-float">
            <img 
              src="/medical_shield_3d.jpg" 
              alt="3D Shield" 
              className="w-full h-full object-contain rounded-2xl drop-shadow-[0_10px_15px_rgba(0,0,0,0.15)]"
            />
          </div>

          <div className="trust-chip inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] uppercase tracking-wider font-bold mb-3"><ShieldCheck size={13} /> Secure verification</div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
            Verify a certificate
          </h1>
          <p className="text-slate-500 text-sm max-w-lg mx-auto font-medium">
            Scan a certificate QR code or enter the certificate UUID below.
          </p>
        </div>

        {!result && !loading && (
          <div className="verification-card bg-white overflow-hidden">
            <div className="flex border-b border-slate-200 bg-slate-50/70">
              <button 
                type="button"
                className={`flex-1 py-4 flex items-center justify-center gap-2 font-extrabold text-sm transition-all ${activeTab === 'scan' ? 'bg-white text-emerald-800 border-b-2 border-emerald-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                onClick={() => setActiveTab('scan')}
              >
                <ScanLine size={18} /> Phone Camera Scanner
              </button>
              <button 
                type="button"
                className={`flex-1 py-4 flex items-center justify-center gap-2 font-extrabold text-sm transition-all ${activeTab === 'manual' ? 'bg-white text-emerald-800 border-b-2 border-emerald-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'}`}
                onClick={() => setActiveTab('manual')}
              >
                <Keyboard size={18} /> Enter Certificate UUID
              </button>
            </div>

            <div className="p-8">
              {activeTab === 'scan' && (
                <div className="animate-fade-in space-y-6">
                  <QRScanner onResult={handleQRResult} />
                  {scannedId && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center">
                      <p className="text-xs text-emerald-700 font-bold uppercase tracking-wider">Scanned Certificate UUID</p>
                      <p className="font-mono text-emerald-900 font-bold text-sm mt-1">{scannedId}</p>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleVerify} className="mt-8 space-y-5">
                {activeTab === 'manual' && (
                  <div className="form-group animate-fade-in">
                    <label className="form-label">Certificate UUID *</label>
                    <input 
                      type="text" 
                      name="certificateId" 
                      className="form-input font-mono text-sm py-3" 
                      placeholder="e.g. 8c1b9007-46de-4e9c-a8ba-b1abb37f869c"
                      value={formData.certificateId}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-100">
                  <div className="form-group">
                    <label className="form-label">Your Full Name *</label>
                    <input 
                      type="text" name="verifierName" className="form-input" 
                      placeholder="e.g. HR Manager / Registrar"
                      value={formData.verifierName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Your Organization *</label>
                    <input 
                      type="text" name="verifierOrganization" className="form-input" 
                      placeholder="e.g. Acme Corp / Stanford University"
                      value={formData.verifierOrganization}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-mint w-full py-3.5 text-base font-extrabold shadow-[0_6px_22px_rgba(16,185,129,0.35)]"
                  disabled={loading || (!formData.certificateId && activeTab === 'manual')}
                >
                  <ShieldCheck size={20} /> Verify Authenticity Now
                </button>
              </form>
            </div>
          </div>
        )}

        {loading && (
          <div className="bg-white border border-emerald-100 rounded-3xl p-16 flex flex-col items-center justify-center min-h-[380px] shadow-sm">
            <LoadingSpinner />
            <p className="mt-6 text-emerald-700 font-extrabold animate-pulse text-lg">Running Cryptographic Verification...</p>
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
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center py-4 border-t border-emerald-100 text-xs text-slate-400 font-medium mt-8 relative z-10">
        MedVerify Platform
      </footer>
    </div>
  );
};

export default Verify;
