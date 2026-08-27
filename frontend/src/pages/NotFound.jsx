import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchX } from 'lucide-react';

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
      <div className="glass-panel p-12 text-center max-w-md animate-fade-in flex flex-col items-center">
        <SearchX size={64} className="text-[#94a3b8] mb-6" />
        <h1 className="text-4xl font-bold text-white mb-2">404</h1>
        <h2 className="text-xl font-medium text-gray-300 mb-4">Page Not Found</h2>
        <p className="text-gray-400 mb-8">The page you are looking for doesn't exist or has been moved.</p>
        <button onClick={() => navigate('/login')} className="btn btn-primary w-full justify-center">
          Go to Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
