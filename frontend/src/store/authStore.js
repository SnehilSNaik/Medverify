import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      linkedCertificates: [],
      setAuth: (user, token) => set({ user, accessToken: token, isAuthenticated: !!user }),
      logout: () => set({ user: null, accessToken: null, isAuthenticated: false }),
      addLinkedCertificate: (certId) => {
        const current = get().linkedCertificates;
        if (!current.includes(certId)) {
          set({ linkedCertificates: [...current, certId] });
        }
      },
      removeLinkedCertificate: (certId) => {
        set({ linkedCertificates: get().linkedCertificates.filter(id => id !== certId) });
      },
    }),
    {
      name: 'medverify-auth',
    }
  )
);

export default useAuthStore;
