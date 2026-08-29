import React, { useState, useEffect } from 'react';
import { hospitalService } from '../../services/hospitalService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { FileText, Download, QrCode, XCircle, Search, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/constants';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [qrBlobUrl, setQrBlobUrl] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const fetchCertificates = async () => {
    try {
      const data = await hospitalService.getCertificates();
      setCertificates(data || []);
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
  }, [qrBlobUrl]);

  const handleRevoke = async (id) => {
    if (window.confirm('Are you sure you want to revoke this certificate? This action cannot be undone.')) {
      try {
        await hospitalService.revokeCertificate(id);
        toast.success('Certificate revoked');
        fetchCertificates();
      } catch (error) {
        toast.error('Failed to revoke certificate');
      }
    }
  };

  const handleDownloadPDF = async (id, patientName) => {
    try {
      const blob = await hospitalService.downloadPDF(id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Certificate_${patientName.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  const handleViewQR = async (cert) => {
    try {
      const blob = await hospitalService.getQR(cert.certificateId);
      const url = URL.createObjectURL(blob);
      setQrBlobUrl(url);
      setSelectedCert(cert);
      setQrModalOpen(true);
    } catch (error) {
      toast.error('Failed to load QR code');
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    toast.success('Certificate UUID copied!');
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filtered = certificates.filter(c => 
    (c.patientName && c.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.certificateId && c.certificateId.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.disease && c.disease.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2.5">
            <FileText className="text-rose-500"/> Issued Certificates Repository
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">View, download, manage QR codes and revoke hospital certificates</p>
        </div>
      </div>

      <div className="bg-white border border-rose-100 p-4 rounded-2xl flex items-center gap-3 shadow-xs">
        <Search size={18} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Search by Patient Name, Diagnosis, or Certificate UUID..." 
          className="bg-transparent border-none outline-none text-slate-800 w-full text-sm font-medium placeholder:text-slate-400"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="table-container shadow-xs">
          <table className="data-table">
            <thead>
              <tr>
                <th>Certificate ID</th>
                <th>Patient Details</th>
                <th>Diagnosis</th>
                <th>Doctor</th>
                <th>Issue Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(cert => (
                <tr key={cert.id}>
                  <td className="font-mono text-xs font-bold text-rose-600">
                    <div className="flex items-center gap-1.5">
                      <span>{cert.certificateId.substring(0, 10)}...</span>
                      <button 
                        onClick={() => copyToClipboard(cert.certificateId)}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1"
                        title="Copy UUID"
                      >
                        {copiedId === cert.certificateId ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className="font-bold text-slate-800">{cert.patientName}</div>
                    <div className="text-xs text-slate-500 font-medium">{cert.age} yrs, {cert.gender}</div>
                  </td>
                  <td className="text-xs text-slate-600 max-w-[200px] truncate font-medium" title={cert.disease}>
                    {cert.disease}
                  </td>
                  <td className="text-xs text-slate-700 font-semibold">{cert.doctorName}</td>
                  <td className="text-xs text-slate-500 whitespace-nowrap font-medium">{formatDate(cert.issueDate)}</td>
                  <td>
                    <Badge variant={cert.status === 'ACTIVE' ? 'success' : 'danger'}>
                      {cert.status}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex items-center gap-1.5">
                      <button 
                        onClick={() => handleViewQR(cert)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="View QR Code"
                      >
                        <QrCode size={17} />
                      </button>
                      <button 
                        onClick={() => handleDownloadPDF(cert.certificateId, cert.patientName)}
                        className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                        title="Download PDF"
                      >
                        <Download size={17} />
                      </button>
                      {cert.status === 'ACTIVE' && (
                        <button 
                          onClick={() => handleRevoke(cert.certificateId)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Revoke Certificate"
                        >
                          <XCircle size={17} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center text-slate-400 py-10 font-medium">No certificates found matching criteria</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* QR Modal */}
      <Modal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} title="Certificate QR Matrix">
        {selectedCert && (
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-2xl mb-4 border border-slate-200 shadow-sm">
              {qrBlobUrl ? (
                <img src={qrBlobUrl} alt="QR Code" className="w-48 h-48 rounded-xl" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-slate-400">Loading...</div>
              )}
            </div>
            <p className="text-sm font-bold text-slate-800 mb-1">{selectedCert.patientName}</p>
            <p className="text-xs text-slate-500 mb-3">{selectedCert.disease}</p>
            <p className="text-xs font-mono text-rose-600 bg-rose-50 p-2.5 rounded-xl break-all text-center w-full border border-rose-100 font-bold">
              {selectedCert.certificateId}
            </p>
            <div className="mt-6 flex gap-3 w-full">
              <button className="btn btn-secondary flex-1" onClick={() => setQrModalOpen(false)}>Close</button>
              <button className="btn btn-primary flex-1" onClick={() => copyToClipboard(selectedCert.certificateId)}>
                <Copy size={16} /> Copy UUID
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Certificates;
