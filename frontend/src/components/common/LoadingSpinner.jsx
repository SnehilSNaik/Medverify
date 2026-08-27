import React from 'react';

const LoadingSpinner = ({ fullScreen = false }) => {
  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-400" style={{ borderColor: 'var(--accent-primary)', borderBottomColor: 'transparent' }}></div>
      <div className="gradient-text font-semibold animate-pulse">MedVerify</div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[#0a0f1e] z-50">
        {spinner}
      </div>
    );
  }

  return <div className="flex justify-center p-8">{spinner}</div>;
};

export default LoadingSpinner;
