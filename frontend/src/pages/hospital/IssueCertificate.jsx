import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hospitalService } from '../../services/hospitalService';
import { User, FileText, ShieldCheck, Download, Stethoscope } from 'lucide-react';
import toast from 'react-hot-toast';

const IssueCertificate = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [qrBlobUrl, setQrBlobUrl] = useState(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    patientName: '',
    age: '',
    gender: 'MALE',
    disease: '',
    treatment: '',
    doctorId: '',
    issueDate: new Date().toISOString().split('T')[0],
    expiryDate: ''
  });

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const data = await hospitalService.getDoctors();
        setDoctors((data || []).filter(d => d.active));
      } catch (error) {
        toast.error('Failed to load doctors list');
      } finally {
        setLoading(false);
      }
    };
    fetchDoctors();
    
    return () => {
      if (qrBlobUrl) URL.revokeObjectURL(qrBlobUrl);
    };
  }, [qrBlobUrl]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.doctorId) {
      toast.error('Please select an authorizing doctor');
      return;
    }
    
    setSubmitting(true);
    try {
      const payload = {
        patientName: formData.patientName.trim(),
        age: parseInt(formData.age, 10),
        gender: formData.gender,
        disease: formData.disease.trim(),
        treatment: formData.treatment.trim(),
        doctorId: parseInt(formData.doctorId, 10),
        issueDate: formData.issueDate,
        expiryDate: formData.expiryDate || formData.issueDate
      };

      const result = await hospitalService.issueCertificate(payload);
      toast.success('Certificate issued and digitally signed with RSA-256');
      setSuccessData(result);
      
      // Fetch the QR code for display
      if (result.certificateId) {
        try {
          const qrBlob = await hospitalService.getQR(result.certificateId);
          setQrBlobUrl(URL.createObjectURL(qrBlob));
        } catch (qrErr) {
          console.warn('Could not fetch QR code image', qrErr);
        }
      }
      
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to issue certificate');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!successData?.certificateId) return;
    try {
      const blob = await hospitalService.downloadPDF(successData.certificateId);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Medical_Certificate_${successData.certificateId.substring(0,8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Failed to download PDF');
    }
  };

  if (successData) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <div className="glass-panel p-8 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-[rgba(16,185,129,0.1)] rounded-full flex items-center justify-center mb-6 border border-[#10b981]">
            <ShieldCheck size={40} className="text-[#10b981]" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">Certificate Issued & Digitally Signed</h2>
          <p className="text-gray-400 mb-8">RSA signature generated using hospital private key.</p>
          
          <div className="w-full bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.05)] rounded-xl p-6 mb-8">
            <p className="text-sm text-gray-400 mb-1">Unique Certificate ID (UUID)</p>
            <p className="font-mono text-lg text-[#00d4ff] bg-[rgba(0,212,255,0.05)] py-2 px-4 rounded-lg break-all border border-[rgba(0,212,255,0.2)]">
              {successData.certificateId}
            </p>
            
            <div className="mt-6 flex justify-center">
              <div className="bg-white p-4 rounded-xl shadow-lg">
                {qrBlobUrl ? (
                  <img src={qrBlobUrl} alt="QR Code" className="w-48 h-48" />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-gray-800 font-medium">Loading QR...</div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4 w-full">
            <button onClick={() => setSuccessData(null)} className="btn btn-secondary flex-1">
              Issue Another
            </button>
            <button onClick={handleDownloadPDF} className="btn btn-primary flex-1">
              <Download size={18} /> Download Official PDF
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2"><ShieldCheck className="text-[#00d4ff]"/> Issue Secure Certificate</h1>
        <p className="text-gray-400 text-sm mt-1">Fill in the medical details to generate an RSA digitally signed medical certificate</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-[rgba(255,255,255,0.1)] pb-2">
            <User size={18} className="text-[#00d4ff]" /> Patient Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input required type="text" name="patientName" className="form-input" value={formData.patientName} onChange={handleChange} placeholder="Patient's full legal name" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Age *</label>
                <input required type="number" name="age" min="0" max="150" className="form-input" value={formData.age} onChange={handleChange} placeholder="e.g. 28" />
              </div>
              <div className="form-group">
                <label className="form-label">Gender *</label>
                <select required name="gender" className="form-select" value={formData.gender} onChange={handleChange}>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-[rgba(255,255,255,0.1)] pb-2">
            <FileText size={18} className="text-[#00d4ff]" /> Medical Information
          </h3>
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">Diagnosis / Condition *</label>
              <input required type="text" name="disease" className="form-input" value={formData.disease} onChange={handleChange} placeholder="e.g. Acute Typhoid Fever" />
            </div>
            <div className="form-group">
              <label className="form-label">Recommended Treatment / Medical Leave *</label>
              <textarea required name="treatment" className="form-input min-h-[100px]" value={formData.treatment} onChange={handleChange} placeholder="e.g. Advised complete bed rest for 7 days with antibiotic course..."></textarea>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2 border-b border-[rgba(255,255,255,0.1)] pb-2">
            <Stethoscope size={18} className="text-[#00d4ff]" /> Authorization & Dates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="form-group md:col-span-1">
              <label className="form-label">Authorizing Doctor *</label>
              <select required name="doctorId" className="form-select" value={formData.doctorId} onChange={handleChange} disabled={loading}>
                <option value="">Select Doctor</option>
                {doctors.map(d => (
                  <option key={d.id} value={d.id}>{d.name} ({d.specialization})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Issue Date *</label>
              <input required type="date" name="issueDate" className="form-input" value={formData.issueDate} onChange={handleChange} />
            </div>
            <div className="form-group">
              <label className="form-label">Expiry Date *</label>
              <input required type="date" name="expiryDate" className="form-input" value={formData.expiryDate} onChange={handleChange} min={formData.issueDate} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <button type="button" onClick={() => navigate('/hospital/dashboard')} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary px-8" disabled={submitting}>
            {submitting ? 'Signing Certificate...' : 'Issue & Sign Certificate'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default IssueCertificate;
