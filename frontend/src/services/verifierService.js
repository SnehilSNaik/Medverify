import api from './api';

export const verifierService = {
  // Run AI Forgery & Visual Pattern Analysis
  analyzeDocument: async (payload) => {
    const response = await api.post('/verifier/ai-analyze', payload);
    return response.data.data;
  },

  // Public fallback AI analysis
  analyzeDocumentPublic: async (payload) => {
    const response = await api.post('/verify/ai-analyze', payload);
    return response.data.data;
  },

  // Perform standard authenticated verification
  verifyCertificate: async (data) => {
    const response = await api.post('/verifier/verify', data);
    return response.data.data;
  },

  // Get verification history logs
  getHistory: async () => {
    const response = await api.get('/admin/verification-logs');
    return response.data.data;
  },

  // Get forensic benchmark rules
  getDataset: async () => {
    const response = await api.get('/verifier/dataset');
    return response.data.data;
  },

  // Get forensic model weights and metrics
  getModelInfo: async () => {
    const response = await api.get('/verifier/model-info');
    return response.data.data;
  }
};
