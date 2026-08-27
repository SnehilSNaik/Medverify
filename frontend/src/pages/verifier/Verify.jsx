import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, ScanLine, Keyboard, ArrowLeft, Smartphone, QrCode, CheckCircle2 } from 'lucide-react';
import { verificationService } from '../../services/verificationService';
import QRScanner from '../../components/certificate/QRScanner';
import CertificateCard from '../../components/certificate/CertificateCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import toast from 'react-hot-toast';
import { useAuth } from '../../hooks/useAuth';

const Verify = () => {
  const { certificateId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('scan'); // 'scan' | 'manual'
  const [scannedId, setScannedId] = useState('');
  
  const [formData, setFormData] = useState({
    certificateId: certificateId || '',
    verifierName: user?.username || '',
    verifierOrganization: user?.hospitalName || (user?.role === 'ADMIN' ? 'System Admin' : '')
  });
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    if (certificateId) {
      setActiveTab('manual');
      setFormData(prev => ({ ...prev, certificateId }));
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
    } catch (e) {
      // Ignore
    }
    
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
      toast.error('Please fill all required fields (Certificate ID, Verifier Name, Organization)');
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
      else if (statusResult === 'TAMPERED') toast.error('WARNING: Certificate signature tampered or invalid!');
      else if (statusResult === 'REVOKED') toast.error('Certificate has been revoked by hospital');
      else toast.error('Certificate not found');
    } catch (error) {
      setResult({
        result: 'NOT_FOUND',
        message: error.response?.data?.message || 'Could not connect to verification server or certificate ID invalid.'
      });
      toast.error('Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0f1e] py-10 px-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#00d4ff] opacity-5 rounded-full blur-[100px] pointer-events-none"></div>
      
      <div className="max-w-4xl mx-auto relative z-10">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Shield size={36} className="text-[#00d4ff]" />
            <div>
              <h1 className="text-2xl font-bold gradient-text">MedVerify Public Verification Portal</h1>
              <p className="text-gray-400 text-sm">SHA-256 Hash & RSA Cryptographic Signature Authentication</p>
            </div>
          </div>
          {isAuthenticated ? (
            <button onClick={() => navigate(-1)} className="btn btn-ghost border border-[rgba(255,255,255,0.1)]">
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
          ) : (
            <button onClick={() => navigate('/login')} className="btn btn-secondary">
              Login to Staff Portal
            </button>
          )}
        </div>

        {/* Mobile Phone Verification Demonstration Hero Banner */}
        <div className="glass-panel p-6 mb-8 border border-[rgba(0,212,255,0.2)] bg-[rgba(0,212,255,0.03)] flex flex-col md:flex-row items-center gap-6 rounded-2xl">
          <div className="md:w-1/3 w-full rounded-xl overflow-hidden border border-[rgba(255,255,255,0.1)] shadow-lg">
            <img 
              src="/phone_qr_scan_demo.jpg" 
              alt="Smartphone QR Scanner Demo" 
              className="w-full h-44 object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
          <div className="md:w-2/3 w-full space-y-2">
            <div className="flex items-center gap-2">
              <Smartphone className="text-[#00d4ff]" size={20} />
              <span className="text-xs font-bold uppercase tracking-wider text-[#00d4ff]">Smartphone Scan & Verify</span>
            </div>
            <h3 className="text-xl font-bold text-white">Verify Any Medical Certificate with Your Phone</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Every official MedVerify certificate includes a secure QR Code. Scan it using your smartphone camera to instantly verify its SHA-256 hash and RSA digital signature in real time.
            </p>
            <div className="flex flex-wrap gap-4 pt-2 text-xs text-gray-400">
              <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-[#10b981]" /> Zero App Install Needed</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-[#10b981]" /> Instant Tamper Detection</span>
              <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-[#10b981]" /> RSA 2048-Bit Signed</span>
            </div>
          </div>
        </div>

        {!result && !loading && (
          <div className="glass-panel overflow-hidden mb-8">
            <div className="flex border-b border-[rgba(255,255,255,0.1)]">
              <button 
                type="button"
                className={`flex-1 py-4 flex items-center justify-center gap-2 font-medium transition-colors ${activeTab === 'scan' ? 'bg-[rgba(0,212,255,0.1)] text-[#00d4ff] border-b-2 border-[#00d4ff]' : 'text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.02)]'}`}
                onClick={() => setActiveTab('scan')}
              >
                <ScanLine size={18} /> Phone Camera / Demo Scanner
              </button>
              <button 
                type="button"
                className={`flex-1 py-4 flex items-center justify-center gap-2 font-medium transition-colors ${activeTab === 'manual' ? 'bg-[rgba(0,212,255,0.1)] text-[#00d4ff] border-b-2 border-[#00d4ff]' : 'text-gray-400 hover:text-white hover:bg-[rgba(255,255,255,0.02)]'}`}
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
                    <div className="bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-300">Scanned Certificate ID:</p>
                      <p className="font-mono text-[#10b981] font-bold text-lg">{scannedId}</p>
                    </div>
                  )}
                </div>
              )}

              <form onSubmit={handleVerify} className="mt-8 space-y-6">
                {activeTab === 'manual' && (
                  <div className="form-group animate-fade-in">
                    <label className="form-label">Certificate ID (UUID) *</label>
                    <input 
                      type="text" 
                      name="certificateId" 
                      className="form-input font-mono" 
                      placeholder="e.g. 79fca1d5-0550-4ba7-898b-c9201e440a36"
                      value={formData.certificateId}
                      onChange={handleChange}
                      required
                    />
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[rgba(255,255,255,0.1)]">
                  <div className="form-group">
                    <label className="form-label">Verifier Name *</label>
                    <input 
                      type="text" 
                      name="verifierName" 
                      className="form-input" 
                      placeholder="Your full name (e.g. Inspector Officer)"
                      value={formData.verifierName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Organization / Company *</label>
                    <input 
                      type="text" 
                      name="verifierOrganization" 
                      className="form-input" 
                      placeholder="e.g. Acme Corp / University Admissions"
                      value={formData.verifierOrganization}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary w-full py-3.5 text-base mt-4 shadow-[0_0_25px_rgba(0,212,255,0.35)] hover:shadow-[0_0_35px_rgba(0,212,255,0.5)] font-semibold rounded-xl flex items-center justify-center gap-2"
                  disabled={loading || (!formData.certificateId && activeTab === 'manual')}
                >
                  <Shield size={20} /> Verify Authenticity Now
                </button>
              </form>
            </div>
          </div>
        )}

        {loading && (
          <div className="glass-panel p-16 flex flex-col items-center justify-center min-h-[400px]">
            <LoadingSpinner />
            <p className="mt-6 text-[#00d4ff] font-medium animate-pulse text-lg">Running Cryptographic Verification...</p>
            <p className="text-gray-400 text-sm mt-2 text-center max-w-sm">Re-computing SHA-256 hash and verifying RSA 2048-bit digital signature with hospital public key</p>
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
    </div>
  );
};

export default Verify;
