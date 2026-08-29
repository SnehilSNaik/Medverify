import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/common/ProtectedRoute';

// Layouts/Common
import Navbar from './components/common/Navbar';
import Sidebar from './components/common/Sidebar';

// Pages
import Login from './pages/Login';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';
import Verify from './pages/verifier/Verify';

// Signup Pages
import HospitalSignup from './pages/signup/HospitalSignup';
import StudentSignup from './pages/signup/StudentSignup';
import InstitutionSignup from './pages/signup/InstitutionSignup';

// Hospital Pages
import HospitalDashboard from './pages/hospital/HospitalDashboard';
import Doctors from './pages/hospital/Doctors';
import Certificates from './pages/hospital/Certificates';
import IssueCertificate from './pages/hospital/IssueCertificate';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import MyCertificates from './pages/student/MyCertificates';
import LinkCertificate from './pages/student/LinkCertificate';

// Institution Pages
import InstitutionDashboard from './pages/institution/InstitutionDashboard';
import VerifyPortal from './pages/institution/VerifyPortal';
import VerificationHistory from './pages/institution/VerificationHistory';

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
      
      {/* 3 Separate Signup Pages */}
      <Route path="/signup/hospital" element={<HospitalSignup />} />
      <Route path="/signup/student" element={<StudentSignup />} />
      <Route path="/signup/institution" element={<InstitutionSignup />} />
      {/* Legacy redirect */}
      <Route path="/signup" element={<Navigate to="/signup/hospital" replace />} />
      <Route path="/register" element={<Navigate to="/signup/hospital" replace />} />
      
      {/* Public / Verifier routes */}
      <Route path="/verify" element={<Verify />} />
      <Route path="/verify/:certificateId" element={<Verify />} />

      {/* Hospital Routes */}
      <Route path="/hospital" element={<ProtectedRoute allowedRoles={[ROLES.HOSPITAL]} />}>
        <Route path="" element={<Navigate to="/hospital/dashboard" replace />} />
        <Route path="dashboard" element={<AppLayout role={ROLES.HOSPITAL}><HospitalDashboard /></AppLayout>} />
        <Route path="doctors" element={<AppLayout role={ROLES.HOSPITAL}><Doctors /></AppLayout>} />
        <Route path="certificates" element={<AppLayout role={ROLES.HOSPITAL}><Certificates /></AppLayout>} />
        <Route path="issue" element={<AppLayout role={ROLES.HOSPITAL}><IssueCertificate /></AppLayout>} />
      </Route>

      {/* Student Routes */}
      <Route path="/student" element={<ProtectedRoute allowedRoles={[ROLES.STUDENT]} />}>
        <Route path="" element={<Navigate to="/student/dashboard" replace />} />
        <Route path="dashboard" element={<AppLayout role={ROLES.STUDENT}><StudentDashboard /></AppLayout>} />
        <Route path="certificates" element={<AppLayout role={ROLES.STUDENT}><MyCertificates /></AppLayout>} />
        <Route path="link" element={<AppLayout role={ROLES.STUDENT}><LinkCertificate /></AppLayout>} />
      </Route>

      {/* Institution / Company Routes */}
      <Route path="/institution" element={<ProtectedRoute allowedRoles={[ROLES.VERIFIER]} />}>
        <Route path="" element={<Navigate to="/institution/dashboard" replace />} />
        <Route path="dashboard" element={<AppLayout role={ROLES.VERIFIER}><InstitutionDashboard /></AppLayout>} />
        <Route path="verify" element={<AppLayout role={ROLES.VERIFIER}><VerifyPortal /></AppLayout>} />
        <Route path="history" element={<AppLayout role={ROLES.VERIFIER}><VerificationHistory /></AppLayout>} />
      </Route>

      <Route path="/unauthorized" element={<Unauthorized />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
