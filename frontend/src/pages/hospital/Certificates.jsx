import React, { useState, useEffect } from 'react';
import { hospitalService } from '../../services/hospitalService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { FileText, QrCode, Download, Ban, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/constants';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [qrBlobUrl, setQrBlobUrl] = useState(null);
  const [selectedCert, setSelectedCert] = useState(null);

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
  }, []);

  const handleRevoke = async (certId) => {
    if (window.confirm('Are you sure you want to revoke this certificate? This action cannot be undone.')) {
      try {
        await hospitalService.revokeCertificate(certId);
        toast.success('Certificate revoked successfully');
        fetchCertificates();
      } catch (error) {
        toast.error('Failed to revoke certificate');
      }
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

  const handleDownloadPDF = async (certId) => {
    try {
      const blob = await hospitalService.downloadPDF(certId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Medical_Certificate_${certId.substring(0,8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  const filtered = certificates.filter(c => 
    (c.certificateId && c.certificateId.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (c.patientName && c.patientName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.doctorName && c.doctorName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><FileText className="text-[#00d4ff]"/> Issued Certificates</h1>
          <p className="text-gray-400 text-sm mt-1">Manage and track all issued medical certificates</p>
        </div>
      </div>

      <div className="glass-panel p-4 mb-6 flex items-center gap-2">
        <Search size={18} className="text-gray-400" />
        <input 
          type="text" 
          placeholder="Search by ID, Patient, or Doctor Name..." 
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
                <th>Certificate ID</th>
                <th>Patient Details</th>
                <th>Doctor</th>
                <th>Dates</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(cert => (
                <tr key={cert.id || cert.certificateId}>
                  <td className="font-mono text-xs text-[#00d4ff]">{cert.certificateId ? `${cert.certificateId.substring(0,12)}...` : 'N/A'}</td>
                  <td>
                    <div className="font-medium text-white">{cert.patientName}</div>
                    <div className="text-xs text-gray-500">{cert.age} yrs • {cert.gender}</div>
                  </td>
                  <td className="text-sm text-gray-300">{cert.doctorName}</td>
                  <td className="text-xs text-gray-400 whitespace-nowrap">
                    <div><span className="text-gray-500">Iss:</span> {formatDate(cert.issueDate)}</div>
                    <div><span className="text-gray-500">Exp:</span> {formatDate(cert.expiryDate)}</div>
                  </td>
                  <td>
                    <Badge variant={cert.status === 'ACTIVE' ? 'success' : 'warning'}>
                      {cert.status}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleViewQR(cert)} className="btn btn-ghost p-2 text-[#00d4ff]" title="View QR">
                        <QrCode size={18} />
                      </button>
                      <button onClick={() => handleDownloadPDF(cert.certificateId)} className="btn btn-ghost p-2 text-white" title="Download PDF">
                        <Download size={18} />
                      </button>
                      {cert.status === 'ACTIVE' && (
                        <button onClick={() => handleRevoke(cert.certificateId)} className="btn btn-ghost p-2 text-[#ef4444] hover:text-[#dc2626]" title="Revoke Certificate">
                          <Ban size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-gray-500 py-8">No certificates found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={qrModalOpen} onClose={() => setQrModalOpen(false)} title="Certificate QR Code">
        {selectedCert && (
          <div className="flex flex-col items-center">
            <div className="bg-white p-4 rounded-xl mb-6">
              {qrBlobUrl ? (
                <img src={qrBlobUrl} alt="QR Code" className="w-48 h-48" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center text-gray-400">Loading...</div>
              )}
            </div>
            <p className="text-sm text-gray-400 mb-1">Patient: <span className="text-white">{selectedCert.patientName}</span></p>
            <p className="text-xs font-mono text-[#00d4ff] bg-[rgba(0,212,255,0.1)] p-2 rounded mt-2 break-all text-center w-full">
              {selectedCert.certificateId}
            </p>
            <div className="mt-6 flex gap-4 w-full">
              <button className="btn btn-secondary flex-1" onClick={() => setQrModalOpen(false)}>Close</button>
              <button className="btn btn-primary flex-1" onClick={() => {
                const a = document.createElement('a');
                a.href = qrBlobUrl;
                a.download = `QR_${selectedCert.certificateId.substring(0,8)}.png`;
                a.click();
              }}>
                <Download size={18} /> Save Image
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Certificates;
