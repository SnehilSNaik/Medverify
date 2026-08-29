import React from 'react';
import { HeartPulse } from 'lucide-react';

const LoadingSpinner = ({ fullScreen = false }) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-3">
      <div className="relative flex items-center justify-center">
        <div className="animate-spin rounded-full h-14 w-14 border-4 border-rose-100 border-t-rose-500"></div>
        <HeartPulse size={20} className="absolute text-rose-500 animate-pulse" />
      </div>
      <div className="gradient-text font-bold text-sm tracking-wide animate-pulse">MedVerify Health</div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/90 backdrop-blur-sm z-50">
        {spinner}
      </div>
    );
  }

  return <div className="flex justify-center p-8">{spinner}</div>;
};

export default LoadingSpinner;
