import api from './api';

export const verificationService = {
  verify: async (data) => {
    const response = await api.post('/verify', data);
    return response.data.data;
  }
};
