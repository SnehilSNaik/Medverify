import api from './api';

export const hospitalService = {
  getDoctors: async () => {
    const response = await api.get('/hospital/doctors');
    return response.data.data;
  },
  addDoctor: async (data) => {
    const response = await api.post('/hospital/doctors', data);
    return response.data.data;
  },
  updateDoctor: async (id, data) => {
    const response = await api.put(`/hospital/doctors/${id}`, data);
    return response.data.data;
  },
  toggleDoctor: async (id) => {
    const response = await api.post(`/hospital/doctors/${id}/toggle-active`);
    return response.data.data;
  },
  getCertificates: async () => {
    const response = await api.get('/hospital/certificates');
    return response.data.data;
  },
  issueCertificate: async (data) => {
    const response = await api.post('/hospital/certificates', data);
    return response.data.data;
  },
  revokeCertificate: async (id) => {
    const response = await api.post(`/hospital/certificates/${id}/revoke`);
    return response.data.data;
  },
  downloadPDF: async (id) => {
    const response = await api.get(`/hospital/certificates/${id}/pdf`, { responseType: 'blob' });
    return response.data;
  },
  getQR: async (id) => {
    const response = await api.get(`/hospital/certificates/${id}/qr`, { responseType: 'blob' });
    return response.data;
  }
};
