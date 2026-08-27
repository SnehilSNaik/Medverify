export const ROLES = {
  ADMIN: 'ADMIN',
  HOSPITAL: 'HOSPITAL',
  VERIFIER: 'VERIFIER'
};

export const CERTIFICATE_STATUS = {
  ACTIVE: 'ACTIVE',
  REVOKED: 'REVOKED'
};

export const VERIFICATION_RESULT = {
  GENUINE: 'GENUINE',
  TAMPERED: 'TAMPERED',
  REVOKED: 'REVOKED',
  NOT_FOUND: 'NOT_FOUND'
};

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

export const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

export const formatStatus = (status) => {
  if (!status) return '';
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase().replace('_', ' ');
};
