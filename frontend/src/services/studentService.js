import api from './api';
import useAuthStore from '../store/authStore';

export const studentService = {
  // Verify a certificate by ID using the public verification endpoint
  verifyCertificate: async (certificateId) => {
    const response = await api.post('/verify', {
      certificateId,
      verifierName: 'Certificate Owner',
      verifierOrganization: 'Self-Verification'
    });
    return response.data.data;
  },

  // Get all linked certificate IDs from local storage
  getLinkedCertificateIds: () => {
    return useAuthStore.getState().linkedCertificates || [];
  },

  // Link a certificate to the student's account (stores in local storage)
  linkCertificate: (certificateId) => {
    useAuthStore.getState().addLinkedCertificate(certificateId);
  },

  // Unlink a certificate from the student's account
  unlinkCertificate: (certificateId) => {
    useAuthStore.getState().removeLinkedCertificate(certificateId);
  },

  // Fetch details for all linked certificates by verifying each one
  fetchAllLinkedCertificates: async () => {
    const ids = useAuthStore.getState().linkedCertificates || [];
    const results = [];

    for (const certId of ids) {
      try {
        const result = await api.post('/verify', {
          certificateId: certId,
          verifierName: 'Certificate Owner',
          verifierOrganization: 'Self-Verification'
        });
        const data = result.data.data;
        results.push({
          ...data,
          certificateId: certId,
          linked: true,
        });
      } catch (err) {
        results.push({
          certificateId: certId,
          result: 'NOT_FOUND',
          message: 'Certificate not found or server unavailable',
          linked: true,
        });
      }
    }

    return results;
  }
};
