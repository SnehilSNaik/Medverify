import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
      <div className="glass-panel p-12 text-center max-w-md animate-slide-up flex flex-col items-center">
        <ShieldAlert size={64} className="text-[#ef4444] mb-6 drop-shadow-[0_0_15px_rgba(239,68,68,0.5)]" />
        <h1 className="text-3xl font-bold text-white mb-2">Access Denied</h1>
        <p className="text-gray-400 mb-8">You do not have permission to view this page. Please contact your administrator if you believe this is a mistake.</p>
        <button onClick={() => navigate(-1)} className="btn btn-secondary w-full justify-center">
          Go Back
        </button>
      </div>
    </div>
  );
};

export default Unauthorized;
