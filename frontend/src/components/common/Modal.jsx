import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      <div className="bg-white border border-rose-100 rounded-3xl w-full max-w-lg relative animate-slide-up flex flex-col max-h-[90vh] shadow-[0_20px_50px_rgba(244,63,94,0.15)] overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-rose-100 bg-rose-50/40">
          <h3 className="text-lg font-bold text-slate-800">{title}</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-rose-600 transition-colors p-1.5 rounded-lg hover:bg-white"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
