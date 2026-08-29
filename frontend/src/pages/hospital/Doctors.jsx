import React, { useState, useEffect } from 'react';
import { hospitalService } from '../../services/hospitalService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { Stethoscope, Plus, Power, Edit2, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);
  const [formData, setFormData] = useState({ name: '', registrationNumber: '', specialization: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchDoctors = async () => {
    try {
      const data = await hospitalService.getDoctors();
      setDoctors(data || []);
    } catch (error) {
      toast.error('Failed to load doctors list');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleOpenModal = (doctor = null) => {
    if (doctor) {
      setEditingDoctor(doctor);
      setFormData({
        name: doctor.name,
        registrationNumber: doctor.registrationNumber,
        specialization: doctor.specialization,
        phone: doctor.phone || ''
      });
    } else {
      setEditingDoctor(null);
      setFormData({ name: '', registrationNumber: '', specialization: '', phone: '' });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (editingDoctor) {
        await hospitalService.updateDoctor(editingDoctor.id, formData);
        toast.success('Doctor updated successfully');
      } else {
        await hospitalService.addDoctor(formData);
        toast.success('Doctor registered to hospital');
      }
      setIsModalOpen(false);
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await hospitalService.toggleDoctor(id);
      toast.success('Status updated');
      fetchDoctors();
    } catch (error) {
      toast.error('Failed to toggle status');
    }
  };

  const filtered = doctors.filter(d => 
    (d.name && d.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (d.registrationNumber && d.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (d.specialization && d.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2.5">
            <Stethoscope className="text-rose-500"/> Authorized Doctors Registry
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Manage licensed medical practitioners authorized to sign medical certificates</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn btn-primary shadow-[0_6px_20px_rgba(244,63,94,0.35)]">
          <Plus size={18} /> Add Doctor
        </button>
      </div>

      <div className="bg-white border border-rose-100 p-4 rounded-2xl flex items-center gap-3 shadow-xs">
        <Search size={18} className="text-slate-400" />
        <input 
          type="text" 
          placeholder="Search by doctor name, specialization, or medical registration no..." 
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
                <th>Doctor Name</th>
                <th>Reg. Number</th>
                <th>Specialization</th>
                <th>Contact</th>
                <th>Signing Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(doc => (
                <tr key={doc.id}>
                  <td className="font-bold text-slate-800 flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center font-bold text-xs">
                      {doc.name ? doc.name.replace(/^(Dr\.\s*|Dr\s*)/i, '').charAt(0) : 'D'}
                    </div>
                    <span>{doc.name}</span>
                  </td>
                  <td>
                    <span className="font-mono text-xs font-semibold text-rose-600 bg-rose-50/80 border border-rose-200/60 px-2.5 py-1 rounded-lg inline-block">
                      {doc.registrationNumber}
                    </span>
                  </td>
                  <td className="text-xs text-slate-700 font-semibold">{doc.specialization}</td>
                  <td className="text-xs text-slate-500 font-medium">{doc.phone || 'N/A'}</td>
                  <td>
                    <Badge variant={doc.active ? 'success' : 'danger'}>
                      {doc.active ? 'Authorized' : 'Suspended'}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleOpenModal(doc)}
                        className="p-2 text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all border border-transparent hover:border-rose-200"
                        title="Edit Doctor"
                      >
                        <Edit2 size={15} />
                      </button>
                      <button 
                        onClick={() => handleToggle(doc.id)}
                        className={`p-2 rounded-xl transition-all border ${doc.active ? 'text-red-500 hover:bg-red-50 border-red-200/50' : 'text-emerald-600 hover:bg-emerald-50 border-emerald-200/50'}`}
                        title={doc.active ? "Suspend Signing Authority" : "Restore Signing Authority"}
                      >
                        <Power size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-12">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 text-rose-500 flex items-center justify-center shadow-xs">
                        <Stethoscope size={30} />
                      </div>
                      <div className="text-slate-800 font-bold text-base">
                        {searchTerm ? 'No matching doctors found' : 'No Doctors Registered Yet'}
                      </div>
                      <p className="text-slate-500 text-xs max-w-sm font-medium">
                        {searchTerm 
                          ? `No doctors match "${searchTerm}". Try adjusting your search query.` 
                          : 'Register licensed medical practitioners authorized to digitally sign medical certificates for your hospital.'}
                      </p>
                      <button 
                        onClick={() => handleOpenModal()} 
                        className="btn btn-primary mt-2 shadow-[0_4px_16px_rgba(244,63,94,0.3)]"
                      >
                        <Plus size={16} /> Register First Doctor
                      </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Add / Edit Doctor Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingDoctor ? "Edit Doctor Profile" : "Register Doctor to Hospital"}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <input required type="text" className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Dr. John Smith, MD" />
          </div>
          <div className="form-group">
            <label className="form-label">Medical Registration / License No. *</label>
            <input required type="text" className="form-input" value={formData.registrationNumber} onChange={e => setFormData({...formData, registrationNumber: e.target.value})} placeholder="e.g. MED-REG-10499" />
          </div>
          <div className="form-group">
            <label className="form-label">Specialization / Department *</label>
            <input required type="text" className="form-input" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} placeholder="e.g. General Medicine / Pulmonology" />
          </div>
          <div className="form-group">
            <label className="form-label">Contact Phone</label>
            <input type="text" className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1-555-0101" />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : (editingDoctor ? 'Update Doctor' : 'Register Doctor')}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Doctors;
