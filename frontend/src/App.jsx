import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';

// Layouts/Common
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';

// Pages
import Login from './pages/Login';
import Signup from './pages/Signup';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';
import Verify from './pages/verifier/Verify';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import Hospitals from './pages/admin/Hospitals';
import Users from './pages/admin/Users';
import VerificationLogs from './pages/admin/VerificationLogs';

// Hospital Pages
import HospitalDashboard from './pages/hospital/HospitalDashboard';
import Doctors from './pages/hospital/Doctors';
import Certificates from './pages/hospital/Certificates';
import IssueCertificate from './pages/hospital/IssueCertificate';

import { ROLES } from './utils/constants';

const AppLayout = ({ children, role }) => {
  return (
    <div className="app-layout">
      <Sidebar role={role} />
      <div className="w-full">
        <Navbar />
        <main className="main-content pt-20">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/register" element={<Signup />} />
      
      {/* Public / Verifier routes */}
      <Route path="/verify" element={<Verify />} />
      <Route path="/verify/:certificateId" element={<Verify />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={[ROLES.ADMIN]} />}>
        <Route path="" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<AppLayout role={ROLES.ADMIN}><AdminDashboard /></AppLayout>} />
        <Route path="hospitals" element={<AppLayout role={ROLES.ADMIN}><Hospitals /></AppLayout>} />
        <Route path="users" element={<AppLayout role={ROLES.ADMIN}><Users /></AppLayout>} />
        <Route path="logs" element={<AppLayout role={ROLES.ADMIN}><VerificationLogs /></AppLayout>} />
      </Route>

      {/* Hospital Routes */}
      <Route path="/hospital" element={<ProtectedRoute allowedRoles={[ROLES.HOSPITAL]} />}>
        <Route path="" element={<Navigate to="/hospital/dashboard" replace />} />
        <Route path="dashboard" element={<AppLayout role={ROLES.HOSPITAL}><HospitalDashboard /></AppLayout>} />
        <Route path="doctors" element={<AppLayout role={ROLES.HOSPITAL}><Doctors /></AppLayout>} />
        <Route path="certificates" element={<AppLayout role={ROLES.HOSPITAL}><Certificates /></AppLayout>} />
        <Route path="issue" element={<AppLayout role={ROLES.HOSPITAL}><IssueCertificate /></AppLayout>} />
      </Route>

      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
