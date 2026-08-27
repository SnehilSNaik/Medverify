import api from './api';

export const adminService = {
  getStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data.data;
  },
  getHospitals: async () => {
    const response = await api.get('/admin/hospitals');
    return response.data.data;
  },
  createHospital: async (data) => {
    const response = await api.post('/admin/hospitals', data);
    return response.data.data;
  },
  updateHospital: async (id, data) => {
    const response = await api.put(`/admin/hospitals/${id}`, data);
    return response.data.data;
  },
  toggleHospital: async (id) => {
    const response = await api.post(`/admin/hospitals/${id}/toggle-active`);
    return response.data.data;
  },
  regenerateKeys: async (id) => {
    const response = await api.post(`/admin/hospitals/${id}/regenerate-keys`);
    return response.data.data;
  },
  getUsers: async () => {
    const response = await api.get('/admin/users');
    return response.data.data;
  },
  createVerifier: async (data) => {
    const response = await api.post('/admin/users/verifier', data);
    return response.data.data;
  },
  getLogs: async () => {
    const response = await api.get('/admin/verification-logs');
    return response.data.data;
  },
  getAuditLogs: async () => {
    const response = await api.get('/admin/audit-logs');
    return response.data.data;
  }
};
