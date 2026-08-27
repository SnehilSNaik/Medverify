import React, { useState, useEffect } from 'react';
import { adminService } from '../../services/adminService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import { Users as UsersIcon, UserPlus } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../utils/constants';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchUsers = async () => {
    try {
      const data = await adminService.getUsers();
      setUsers(data || []);
    } catch (error) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateVerifier = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await adminService.createVerifier(formData);
      toast.success('Verifier user created successfully');
      setIsModalOpen(false);
      setFormData({ username: '', email: '', password: '' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create verifier account');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2"><UsersIcon className="text-[#00d4ff]"/> System Accounts</h1>
          <p className="text-gray-400 text-sm mt-1">Manage platform access and role-based permissions</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary">
          <UserPlus size={18} /> Add Verifier Account
        </button>
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Associated Entity</th>
                <th>Status</th>
                <th>Created Date</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td className="font-medium text-white">{user.username}</td>
                  <td className="text-sm text-gray-300">{user.email}</td>
                  <td>
                    <Badge variant={
                      user.role === 'ADMIN' ? 'danger' : 
                      user.role === 'HOSPITAL' ? 'info' : 'warning'
                    }>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="text-sm text-gray-300">
                    {user.hospitalName ? user.hospitalName : 
                     user.role === 'ADMIN' ? 'System Administration' : 'Public Verifier'}
                  </td>
                  <td>
                    <Badge variant={user.active ? 'success' : 'danger'}>
                      {user.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="text-sm text-gray-400">{formatDate(user.createdAt)}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center text-gray-500 py-8">No users found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Verifier Account">
        <form onSubmit={handleCreateVerifier} className="space-y-4">
          <div className="form-group">
            <label className="form-label">Username *</label>
            <input required type="text" className="form-input" placeholder="e.g. verifier_company" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Email *</label>
            <input required type="email" className="form-input" placeholder="verifier@organization.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Password *</label>
            <input required type="password" className="form-input" placeholder="Minimum 6 characters" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} minLength={6} />
          </div>
          <div className="flex justify-end gap-3 mt-6">
            <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Users;
