import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { hospitalService } from '../../services/hospitalService';
import Modal from '../../components/common/Modal';
import { User, FileText, ShieldCheck, Download, Stethoscope, HeartPulse, CheckCircle2, ArrowLeft, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const IssueCertificate = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState(null);
  const [qrBlobUrl, setQrBlobUrl] = useState(null);
  
  // Quick Add Doctor modal state
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [newDoctorData, setNewDoctorData] = useState({ name: '', registrationNumber: '', specialization: '', phone: '' });
  const [addingDoctor, setAddingDoctor] = useState(false);

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
      toast.success('Certificate issued & digitally signed!');
      setSuccessData(result);
      
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
        <div className="bg-white rounded-3xl p-8 text-center flex flex-col items-center border border-emerald-200 shadow-[0_20px_50px_rgba(16,185,129,0.12)]">
          <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mb-5 border-2 border-emerald-300 text-emerald-600 shadow-sm">
            <CheckCircle2 size={42} />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-800 mb-1.5">Certificate Issued & Digitally Signed</h2>
          <p className="text-slate-500 text-sm mb-6 font-medium">RSA-2048 signature generated using hospital cryptographic key.</p>
          
          <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-6 mb-6">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Unique Certificate UUID</p>
            <p className="font-mono text-sm font-bold text-rose-600 bg-white py-2 px-4 rounded-xl break-all border border-rose-100 shadow-2xs">
              {successData.certificateId}
            </p>
            
            <div className="mt-5 flex justify-center">
              <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-sm">
                {qrBlobUrl ? (
                  <img src={qrBlobUrl} alt="QR Code" className="w-44 h-44 rounded-xl" />
                ) : (
                  <div className="w-44 h-44 flex items-center justify-center text-slate-400 font-medium">Loading QR...</div>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-4 w-full">
            <button onClick={() => setSuccessData(null)} className="btn btn-secondary flex-1">
              Issue Another
            </button>
            <button onClick={handleDownloadPDF} className="btn btn-primary flex-1 shadow-[0_6px_20px_rgba(244,63,94,0.35)]">
              <Download size={18} /> Download Official PDF
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleQuickAddDoctor = async (e) => {
    e.preventDefault();
    if (!newDoctorData.name || !newDoctorData.registrationNumber || !newDoctorData.specialization) {
      toast.error('Please fill in all required doctor fields');
      return;
    }
    setAddingDoctor(true);
    try {
      const added = await hospitalService.addDoctor(newDoctorData);
      toast.success(`Dr. ${newDoctorData.name} registered to hospital!`);
      // Refresh doctor list
      const data = await hospitalService.getDoctors();
      const activeList = (data || []).filter(d => d.active);
      setDoctors(activeList);
      // Auto-select the newly added doctor
      if (added?.id) {
        setFormData(prev => ({ ...prev, doctorId: added.id }));
      }
      setIsAddDoctorOpen(false);
      setNewDoctorData({ name: '', registrationNumber: '', specialization: '', phone: '' });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register doctor');
    } finally {
      setAddingDoctor(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2.5">
            <ShieldCheck className="text-rose-500" size={28} /> Issue Secure Certificate
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Fill in the medical details to generate an RSA digitally signed medical certificate</p>
        </div>
        <button onClick={() => navigate('/hospital/dashboard')} className="btn btn-ghost text-xs">
          <ArrowLeft size={16} /> Back to Hub
        </button>
      </div>

      {doctors.length === 0 && !loading && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-800">
          <div className="flex items-center gap-2.5">
            <Stethoscope className="text-amber-600 shrink-0" size={20} />
            <div className="text-xs font-semibold">
              <span className="font-bold">No Authorized Doctors Found:</span> You need at least one registered doctor to issue certificates.
            </div>
          </div>
          <button 
            type="button" 
            onClick={() => setIsAddDoctorOpen(true)}
            className="btn btn-primary text-xs py-2 px-3.5 shadow-xs whitespace-nowrap"
          >
            <Plus size={14} /> Register Doctor Now
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Info Card */}
        <div className="glass-card border-rose-100">
          <h3 className="text-base font-extrabold text-slate-800 mb-4 flex items-center gap-2 border-b border-rose-100 pb-2.5">
            <User size={18} className="text-rose-500" /> Patient Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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

        {/* Medical Info Card */}
        <div className="glass-card border-rose-100">
          <h3 className="text-base font-extrabold text-slate-800 mb-4 flex items-center gap-2 border-b border-rose-100 pb-2.5">
            <FileText size={18} className="text-rose-500" /> Medical Diagnosis & Leave
          </h3>
          <div className="space-y-4">
            <div className="form-group">
              <label className="form-label">Diagnosis / Condition *</label>
              <input required type="text" name="disease" className="form-input" value={formData.disease} onChange={handleChange} placeholder="e.g. Acute Viral Bronchitis" />
            </div>
            <div className="form-group">
              <label className="form-label">Recommended Treatment / Prescribed Leave *</label>
              <textarea required name="treatment" className="form-input min-h-[90px]" value={formData.treatment} onChange={handleChange} placeholder="e.g. Advised complete bed rest for 5 days with oral antibiotics..."></textarea>
            </div>
          </div>
        </div>

        {/* Authorization Card */}
        <div className="glass-card border-rose-100">
          <h3 className="text-base font-extrabold text-slate-800 mb-4 flex items-center gap-2 border-b border-rose-100 pb-2.5">
            <Stethoscope size={18} className="text-rose-500" /> Physician Authorization & Dates
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="form-group md:col-span-1">
              <div className="flex items-center justify-between mb-1">
                <label className="form-label mb-0">Authorizing Doctor *</label>
                <button 
                  type="button" 
                  onClick={() => setIsAddDoctorOpen(true)}
                  className="text-xs font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 transition-colors"
                >
                  <Plus size={13} /> Add Doctor
                </button>
              </div>
              <select required name="doctorId" className="form-select" value={formData.doctorId} onChange={handleChange} disabled={loading}>
                <option value="">{doctors.length === 0 ? "No doctors available (click + Add)" : "Select Doctor"}</option>
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

        {/* Action Buttons */}
        <div className="flex justify-end gap-4 pt-2">
          <button type="button" onClick={() => navigate('/hospital/dashboard')} className="btn btn-secondary">
            Cancel
          </button>
          <button type="submit" className="btn btn-primary px-8 shadow-[0_6px_22px_rgba(244,63,94,0.35)]" disabled={submitting || doctors.length === 0}>
            {submitting ? 'Signing Certificate...' : 'Issue & Sign Certificate'}
          </button>
        </div>
      </form>

      {/* Quick Add Doctor Modal */}
      <Modal isOpen={isAddDoctorOpen} onClose={() => setIsAddDoctorOpen(false)} title="Register Doctor to Hospital">
        <form onSubmit={handleQuickAddDoctor} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input required type="text" className="form-input" value={newDoctorData.name} onChange={e => setNewDoctorData({...newDoctorData, name: e.target.value})} placeholder="e.g. Dr. John Smith, MD" />
          </div>
          <div className="form-group">
            <label className="form-label">Medical Registration / License No. *</label>
            <input required type="text" className="form-input" value={newDoctorData.registrationNumber} onChange={e => setNewDoctorData({...newDoctorData, registrationNumber: e.target.value})} placeholder="e.g. MED-REG-10499" />
          </div>
          <div className="form-group">
            <label className="form-label">Specialization / Department *</label>
            <input required type="text" className="form-input" value={newDoctorData.specialization} onChange={e => setNewDoctorData({...newDoctorData, specialization: e.target.value})} placeholder="e.g. General Medicine / Pulmonology" />
          </div>
          <div className="form-group">
            <label className="form-label">Contact Phone</label>
            <input type="text" className="form-input" value={newDoctorData.phone} onChange={e => setNewDoctorData({...newDoctorData, phone: e.target.value})} placeholder="+1-555-0101" />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" className="btn btn-secondary" onClick={() => setIsAddDoctorOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={addingDoctor}>
              {addingDoctor ? 'Registering...' : 'Register & Select Doctor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default IssueCertificate;
