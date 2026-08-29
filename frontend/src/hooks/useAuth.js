import useAuthStore from '../store/authStore';

export const useAuth = () => {
  const { user, isAuthenticated, accessToken, setAuth, logout, linkedCertificates, addLinkedCertificate, removeLinkedCertificate } = useAuthStore();
  
  return {
    user,
    isAuthenticated,
    accessToken,
    setAuth,
    logout,
    isHospital: user?.role === 'HOSPITAL',
    isStudent: user?.role === 'STUDENT',
    isVerifier: user?.role === 'VERIFIER',
    linkedCertificates,
    addLinkedCertificate,
    removeLinkedCertificate,
  };
};
