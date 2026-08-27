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
        hospitalId: data.hospitalId,
        mustChangePassword: data.mustChangePassword,
        lastLoginAt: data.lastLoginAt
      }
    };
  },
  signup: async (signupData) => {
    const response = await api.post('/auth/signup', signupData);
    const data = response.data.data;
    return {
      accessToken: data.accessToken,
      refreshToken: data.refreshToken,
      user: {
        username: data.username,
        email: data.email,
        role: data.role,
        hospitalId: data.hospitalId,
        mustChangePassword: data.mustChangePassword,
        lastLoginAt: data.lastLoginAt
      }
    };
  },
  getMe: async () => {
    const response = await api.get('/auth/me');
    return response.data.data;
  },
  changePassword: async (currentPassword, newPassword) => {
    const response = await api.post('/auth/change-password', { currentPassword, newPassword });
    return response.data;
  }
};
