import api from './api';

export const authService = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', { username, password });
    const data = response.data.data;
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: {
        username: data.username,
        email: data.email,
        role: data.role,
        hospitalId: data.hospitalId
      }
    };
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data.data;
  }
};
