import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { Building2, Plus, Key, Power, Search } from 'lucide-react';
import toast from 'react-hot-toast';

const Hospitals = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', licenseNumber: '', email: '', phone: '', address: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchHospitals = async () => {
    try {
      const data = await adminService.getHospitals();
      setHospitals(data || []);
    } catch (error) {
      toast.error('Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHospitals();
  }, []);

  const handleAddHospital = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminService.createHospital(formData);
      toast.success('Hospital registered successfully with RSA key pair');
      setIsModalOpen(false);
      setFormData({ name: '', licenseNumber: '', email: '', phone: '', address: '' });
      fetchHospitals();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create hospital');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      await adminService.toggleHospital(id);
      toast.success('Hospital status updated');
      fetchHospitals();
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  const handleRegenerateKeys = async (id) => {
    if (window.confirm('Are you sure? Regenerating RSA keys will mean previously issued certificates from this hospital can no longer be verified with the old key.')) {
      try {
        await adminService.regenerateKeys(id);
        toast.success('Cryptographic RSA keys regenerated successfully');
        fetchHospitals();
      } catch (error) {
        toast.error('Failed to regenerate keys');
      }
    }
  };

  const filtered = hospitals.filter(h => 
    (h.name && h.name.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (h.licenseNumber && h.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><Building2 className="text-[#00d4ff]"/> Hospitals Management</h1>
          <p className="text-gray-400 text-sm mt-1">Register and manage authorized healthcare institutions & RSA keys</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <Plus size={18} /> Register Hospital
        </button>
      </div>

      <div className="glass-panel p-4 mb-6 flex items-center gap-2">
        <Search size={18} className="text-gray-400" />
        <input 
          type="text" 
          placeholder="Search by name or license number..." 
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
                <th>Institution Name</th>
                <th>License No.</th>
                <th>Contact</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(hospital => (
                <tr key={hospital.id}>
                  <td className="font-medium text-white">{hospital.name}</td>
                  <td className="font-mono text-sm text-gray-300">{hospital.licenseNumber}</td>
                  <td className="text-sm">
                    <div className="text-gray-300">{hospital.email}</div>
                    <div className="text-gray-500 text-xs mt-1">{hospital.phone}</div>
                  </td>
                  <td>
                    <Badge variant={hospital.active ? 'success' : 'danger'}>
                      {hospital.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleToggle(hospital.id)}
                        className={`btn btn-ghost p-2 ${hospital.active ? 'text-[#ef4444] hover:text-[#dc2626]' : 'text-[#10b981] hover:text-[#059669]'}`}
                        title={hospital.active ? "Deactivate" : "Activate"}
                      >
                        <Power size={18} />
                      </button>
                      <button 
                        onClick={() => handleRegenerateKeys(hospital.id)}
                        className="btn btn-ghost p-2 text-[#f59e0b] hover:text-[#d97706]"
                        title="Regenerate RSA Keypair"
                      >
                        <Key size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center text-gray-500 py-8">No hospitals found matching criteria</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Register New Hospital">
        <form onSubmit={handleAddHospital} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Hospital Name *</label>
            <input required type="text" className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. Metro General Hospital" />
          </div>
          <div className="form-group">
            <label className="form-label">License Number *</label>
            <input required type="text" className="form-input" value={formData.licenseNumber} onChange={e => setFormData({...formData, licenseNumber: e.target.value})} placeholder="e.g. HOSP-2024-889" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Email *</label>
              <input required type="email" className="form-input" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="hospital@domain.com" />
            </div>
            <div className="form-group">
              <label className="form-label">Phone *</label>
              <input required type="text" className="form-input" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="+1-555-0199" />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Address *</label>
            <textarea required className="form-input min-h-[80px]" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Full official address..."></textarea>
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Generating RSA Keys...' : 'Register Institution'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Hospitals;
