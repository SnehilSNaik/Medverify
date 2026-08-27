import useAuthStore from '../store/authStore';

export const useAuth = () => {
  const { user, isAuthenticated, accessToken, setAuth, logout } = useAuthStore();
  
  return {
    user,
    isAuthenticated,
    accessToken,
    setAuth,
    logout,
    isAdmin: user?.role === 'ADMIN',
    isHospital: user?.role === 'HOSPITAL',
    isVerifier: user?.role === 'VERIFIER'
  };
};
