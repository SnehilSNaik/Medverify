import React, { useState, useEffect } from 'react';
import { hospitalService } from '../../services/hospitalService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { Stethoscope, Plus, Power, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const Doctors = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', registrationNumber: '', specialization: '', phone: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchDoctors = async () => {
    try {
      const data = await hospitalService.getDoctors();
      setDoctors(data || []);
    } catch (error) {
      toast.error('Failed to load doctors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await hospitalService.addDoctor(formData);
      toast.success('Doctor added successfully');
      setIsModalOpen(false);
      setFormData({ name: '', registrationNumber: '', specialization: '', phone: '' });
      fetchDoctors();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to add doctor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await hospitalService.toggleDoctor(id);
      toast.success('Doctor status updated');
      fetchDoctors();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const filtered = doctors.filter(d => 
    (d.name && d.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (d.registrationNumber && d.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Stethoscope className="text-[#00d4ff]"/> Doctor Directory</h1>
          <p className="text-gray-400 text-sm mt-1">Manage medical professionals authorized to issue certificates</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={18} /> Add Doctor
        </button>
      </div>

      <div className="glass-panel p-4 mb-6 flex items-center gap-2">
        <Search size={18} className="text-gray-400" />
        <input 
          type="text" 
          placeholder="Search by name or reg number..." 
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
                <th>Doctor Name</th>
                <th>Reg. Number</th>
                <th>Specialization</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(doctor => (
                <tr key={doctor.id}>
                  <td className="font-medium text-white">{doctor.name}</td>
                  <td className="font-mono text-sm text-gray-300">{doctor.registrationNumber}</td>
                  <td className="text-sm text-gray-300">{doctor.specialization}</td>
                  <td className="text-sm text-gray-400">{doctor.phone || 'N/A'}</td>
                  <td>
                    <Badge variant={doctor.active ? 'success' : 'danger'}>
                      {doctor.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td>
                    <button 
                      onClick={() => handleToggle(doctor.id)}
                      className={`btn btn-ghost p-2 ${doctor.active ? 'text-[#ef4444] hover:text-[#dc2626]' : 'text-[#10b981] hover:text-[#059669]'}`}
                      title={doctor.active ? "Deactivate" : "Activate"}
                    >
                      <Power size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-gray-500 py-8">No doctors found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Medical Professional">
        <form onSubmit={handleAddDoctor} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Full Name * (with Dr. prefix)</label>
            <input required type="text" className="form-input" placeholder="e.g. Dr. Jane Smith" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Medical Registration Number *</label>
            <input required type="text" className="form-input" placeholder="e.g. DR-2024-991" value={formData.registrationNumber} onChange={e => setFormData({...formData, registrationNumber: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Specialization *</label>
              <input required type="text" className="form-input" placeholder="e.g. General Medicine" value={formData.specialization} onChange={e => setFormData({...formData, specialization: e.target.value})} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number *</label>
              <input required type="text" className="form-input" placeholder="e.g. +1-555-0199" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Adding...' : 'Add Doctor'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Doctors;
