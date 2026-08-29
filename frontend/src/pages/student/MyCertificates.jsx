import React, { useState, useEffect } from 'react';
import { studentService } from '../../services/studentService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { FileText, QrCode, Download, Link2Off, Search, Copy, ExternalLink, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/constants';
import { useAuth } from '../../hooks/useAuth';
import api from '../../services/api';

const MyCertificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const { linkedCertificates, removeLinkedCertificate } = useAuth();

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrBlobUrl, setQrBlobUrl] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const certs = await studentService.fetchAllLinkedCertificates();
      setCertificates(certs);
    } catch (error) {
      toast.error('Failed to load certificates');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
    return () => {
      if (qrBlobUrl) URL.revokeObjectURL(qrBlobUrl);
    };
  }, [linkedCertificates]);

  const handleUnlink = (certId) => {
    if (window.confirm('Remove this certificate from your linked records? You can re-link it anytime.')) {
      removeLinkedCertificate(certId);
      toast.success('Certificate unlinked');
    }
  };

  const handleViewQR = async (cert) => {
    try {
      const blob = await api.get(`/hospital/certificates/${cert.certificateId}/qr`, { responseType: 'blob' });
      const url = URL.createObjectURL(blob.data);
      setQrBlobUrl(url);
      setSelectedCert(cert);
      setQrModalOpen(true);
    } catch (error) {
      toast.error('QR code not available — certificate may not be public');
    }
  };

  const handleDownloadPDF = async (certId) => {
    try {
      const response = await api.get(`/hospital/certificates/${certId}/pdf`, { responseType: 'blob' });
      const url = URL.createObjectURL(response.data);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Medical_Certificate_${certId.substring(0,8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('PDF downloaded');
    } catch (error) {
      toast.error('PDF download not available for this certificate');
    }
  };

  const handleCopyLink = (certId) => {
    const verifyUrl = `${window.location.origin}/verify/${certId}`;
    navigator.clipboard.writeText(verifyUrl).then(() => {
      toast.success('Verification link copied to clipboard!');
    }).catch(() => {
      toast.error('Failed to copy link');
    });
  };

  const getResultBadge = (cert) => {
    const status = cert.result || cert.status;
    if (status === 'GENUINE') return <Badge variant="success">Genuine ✓</Badge>;
    if (status === 'TAMPERED') return <Badge variant="danger">Tampered ✗</Badge>;
    if (status === 'REVOKED') return <Badge variant="warning">Revoked</Badge>;
    return <Badge variant="default">Not Found</Badge>;
  };

  const filtered = certificates.filter(c =>
    (c.certificateId && c.certificateId.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.patientName && c.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.hospitalName && c.hospitalName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2.5">
            <FileText className="text-pink-600" /> My Linked Certificates
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">View, download official PDFs, and copy verified share links</p>
        </div>
      </div>

      <div className="bg-white border border-pink-100 p-4 rounded-2xl flex items-center gap-3 shadow-xs">
        <Search size={18} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Search by Patient Name, Hospital, or Certificate UUID..." 
          className="bg-transparent border-none outline-none text-slate-800 w-full text-sm font-medium placeholder:text-slate-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? <LoadingSpinner /> : (
        <>
          {filtered.length === 0 ? (
            <div className="glass-card text-center py-14 border-pink-100">
              <div className="w-16 h-16 rounded-3xl bg-pink-50 flex items-center justify-center mx-auto mb-4 text-pink-500 border border-pink-100">
                <FileText size={32} />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">No Certificates Linked Yet</h3>
              <p className="text-slate-500 text-sm mb-4 font-medium">Link your medical certificates by entering the UUID or scanning the QR code.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {filtered.map(cert => (
                <div key={cert.certificateId} className="glass-card border-pink-100 animate-fade-in hover:border-pink-300">
                  <div className="flex items-start justify-between mb-3.5">
                    <div>
                      <h3 className="font-extrabold text-slate-800 text-base">{cert.patientName || 'Medical Record'}</h3>
                      <p className="text-xs font-semibold text-rose-600 mt-0.5">{cert.hospitalName || 'Verified Healthcare Center'}</p>
                    </div>
                    {getResultBadge(cert)}
                  </div>

                  {cert.result !== 'NOT_FOUND' && (
                    <div className="grid grid-cols-2 gap-3 text-xs mb-3.5 p-3.5 bg-pink-50/40 rounded-2xl border border-pink-100/70">
                      <div>
                        <span className="text-slate-400 font-semibold block">Doctor</span>
                        <p className="text-slate-800 font-bold mt-0.5">{cert.doctorName || 'Authorized Physician'}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block">Diagnosis</span>
                        <p className="text-slate-800 font-bold mt-0.5 truncate" title={cert.disease}>{cert.disease || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block">Issue Date</span>
                        <p className="text-slate-700 font-medium mt-0.5">{formatDate(cert.issueDate)}</p>
                      </div>
                      <div>
                        <span className="text-slate-400 font-semibold block">Expiry Date</span>
                        <p className="text-slate-700 font-medium mt-0.5">{formatDate(cert.expiryDate)}</p>
                      </div>
                    </div>
                  )}

                  <div className="font-mono text-[11px] text-slate-600 bg-slate-50 border border-slate-200/80 px-3 py-1.5 rounded-xl mb-3.5 truncate font-medium" title={cert.certificateId}>
                    ID: {cert.certificateId}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <button onClick={() => handleViewQR(cert)} className="btn btn-ghost p-2 text-pink-600 hover:bg-pink-50 rounded-xl text-xs font-bold" title="View QR Code">
                      <QrCode size={17} />
                    </button>
                    <button onClick={() => handleDownloadPDF(cert.certificateId)} className="btn btn-ghost p-2 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-bold" title="Download PDF">
                      <Download size={17} />
                    </button>
                    <button onClick={() => handleCopyLink(cert.certificateId)} className="btn btn-ghost p-2 text-emerald-600 hover:bg-emerald-50 rounded-xl text-xs font-bold" title="Copy Verification Link">
                      <Share2 size={17} />
                    </button>
                    <div className="flex-1"></div>
                    <button onClick={() => handleUnlink(cert.certificateId)} className="btn btn-ghost p-2 text-red-500 hover:bg-red-50 rounded-xl text-xs font-bold" title="Unlink Record">
                      <Link2Off size={17} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* QR Modal */}
      <Modal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} title="Certificate QR Code">
        {selectedCert && (
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-2xl mb-4 border border-slate-200 shadow-sm">
              {qrBlobUrl ? (
                <img src={qrBlobUrl} alt="QR Code" className="w-48 h-48 rounded-xl" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-400 font-medium">Loading QR...</div>
              )}
            </div>
            <p className="text-sm font-bold text-slate-800 mb-1">{selectedCert.patientName}</p>
            <p className="text-xs font-mono text-pink-700 bg-pink-50 p-2.5 rounded-xl break-all text-center w-full border border-pink-200 font-bold mt-2">
              {selectedCert.certificateId}
            </p>
            <div className="mt-6 flex gap-3 w-full">
              <button className="btn btn-secondary flex-1" onClick={() => setQrModalOpen(false)}>Close</button>
              <button className="btn btn-primary flex-1" onClick={() => handleCopyLink(selectedCert.certificateId)}>
                <Copy size={16} /> Copy Link
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default MyCertificates;
