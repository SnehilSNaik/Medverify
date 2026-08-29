import React, { useEffect, useRef, useState } from 'react';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import { Camera, StopCircle, Smartphone, Upload, CheckCircle2, AlertTriangle, Sparkles, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

const QRScanner = ({ onResult }) => {
  const [mode, setMode] = useState('camera'); // 'camera' | 'upload' | 'demo'
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, []);

  const startScanning = () => {
    setScanning(true);
    setError('');
    
    setTimeout(() => {
      try {
        scannerRef.current = new Html5QrcodeScanner(
          "reader",
          { 
            fps: 10, 
            qrbox: { width: 220, height: 220 },
            aspectRatio: 1.0,
            showTorchButtonIfSupported: true
          },
          false
        );
        
        scannerRef.current.render(
          (decodedText) => {
            stopScanning();
            onResult(decodedText);
          },
          (err) => {}
        );
      } catch (err) {
        setError('Camera access denied or unavailable. You can upload an image or choose demo certificates below.');
        setScanning(false);
      }
    }, 100);
  };

  const stopScanning = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().then(() => {
        setScanning(false);
      }).catch(err => console.error(err));
    } else {
      setScanning(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      const html5Qrcode = new Html5Qrcode("reader-file-temp");
      const decodedText = await html5Qrcode.scanFile(file, true);
      toast.success("QR Code detected from image!");
      onResult(decodedText);
    } catch (err) {
      toast.error("Could not find a valid QR Code in the uploaded image.");
    }
  };

  const sampleDemoCertificates = [
    {
      id: "8c1b9007-46de-4e9c-a8ba-b1abb37f869c",
      patient: "Alex Johnson (City General Hospital)",
      status: "GENUINE",
      desc: "Valid signed certificate with active RSA signature"
    },
    {
      id: "fake-cert-uuid-9999-tampered-hash",
      patient: "Tampered Test Certificate",
      status: "TAMPERED",
      desc: "Simulates modified diagnosis text or invalid signature"
    }
  ];

  return (
    <div className="w-full flex flex-col items-center">
      <div id="reader-file-temp" className="hidden"></div>

      {/* Mode Selector Tabs */}
      <div className="flex bg-rose-50/70 p-1.5 rounded-2xl border border-rose-100 mb-6 w-full max-w-md shadow-xs">
        <button
          type="button"
          onClick={() => { stopScanning(); setMode('camera'); }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${mode === 'camera' ? 'bg-white text-rose-600 shadow-sm border border-rose-100' : 'text-slate-600 hover:text-rose-600'}`}
        >
          <Camera size={14} /> Phone Camera
        </button>
        <button
          type="button"
          onClick={() => { stopScanning(); setMode('upload'); }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${mode === 'upload' ? 'bg-white text-rose-600 shadow-sm border border-rose-100' : 'text-slate-600 hover:text-rose-600'}`}
        >
          <Upload size={14} /> Upload Image
        </button>
        <button
          type="button"
          onClick={() => { stopScanning(); setMode('demo'); }}
          className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${mode === 'demo' ? 'bg-white text-rose-600 shadow-sm border border-rose-100' : 'text-slate-600 hover:text-rose-600'}`}
        >
          <Sparkles size={14} /> Quick Demo
        </button>
      </div>

      {/* MODE 1: Camera Scanner wrapped in clean Smartphone Mockup */}
      {mode === 'camera' && (
        <div className="w-full max-w-[340px] flex flex-col items-center animate-fade-in">
          <div className="w-full bg-white p-3.5 rounded-[40px] border-4 border-slate-200 shadow-[0_20px_50px_rgba(244,63,94,0.15)] relative overflow-hidden">
            {/* Phone Notch */}
            <div className="w-24 h-4 bg-slate-100 rounded-full mx-auto mb-2 flex items-center justify-center gap-1.5 border border-slate-200">
              <div className="w-2 h-2 rounded-full bg-slate-300"></div>
              <div className="w-8 h-1 rounded-full bg-slate-300"></div>
            </div>

            {/* Display Screen */}
            <div className="bg-rose-50/50 rounded-[30px] overflow-hidden min-h-[350px] flex flex-col items-center justify-center relative p-3 border border-rose-100">
              {!scanning ? (
                <div 
                  onClick={startScanning}
                  className="flex flex-col items-center justify-center text-center p-6 cursor-pointer group"
                >
                  <div className="w-20 h-20 rounded-3xl bg-white border-2 border-rose-200 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-rose-500 transition-all shadow-[0_8px_20px_rgba(244,63,94,0.15)] text-rose-500">
                    <Smartphone size={36} />
                  </div>
                  <span className="text-slate-800 font-extrabold text-base mb-1">Tap to Open Camera</span>
                  <p className="text-xs text-slate-500 max-w-[200px] leading-relaxed font-medium">
                    Point your smartphone camera at any MedVerify QR Code
                  </p>
                  <span className="mt-4 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-full text-xs shadow-[0_4px_14px_rgba(244,63,94,0.3)]">
                    Scan with Camera
                  </span>
                </div>
              ) : (
                <div className="w-full relative">
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-rose-500 to-transparent shadow-[0_0_15px_#f43f5e] z-20 animate-bounce"></div>
                  <div id="reader" className="w-full rounded-2xl overflow-hidden bg-black"></div>
                  
                  <button 
                    type="button"
                    onClick={stopScanning}
                    className="mt-3 w-full py-2.5 bg-red-500 hover:bg-red-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <StopCircle size={14} /> Close Camera
                  </button>
                </div>
              )}
            </div>

            {/* Home Indicator */}
            <div className="w-20 h-1 bg-slate-300 rounded-full mx-auto mt-2.5"></div>
          </div>
          <p className="text-xs text-slate-400 mt-3 font-medium text-center">📱 Works seamlessly on any mobile phone or browser camera</p>
        </div>
      )}

      {/* MODE 2: Upload QR Code Image */}
      {mode === 'upload' && (
        <div className="w-full max-w-md animate-fade-in">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            className="hidden" 
          />
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-rose-300 rounded-3xl p-10 flex flex-col items-center justify-center text-center bg-rose-50/40 hover:bg-rose-50/80 transition-all cursor-pointer group shadow-sm"
          >
            <div className="w-16 h-16 rounded-2xl bg-white border border-rose-200 flex items-center justify-center mb-4 group-hover:scale-110 transition-all text-rose-500 shadow-sm">
              <Upload size={28} />
            </div>
            <h4 className="text-slate-800 font-extrabold text-base mb-1">Select Certificate QR Image</h4>
            <p className="text-xs text-slate-500 font-medium">Click to upload a PNG or JPG containing a certificate QR Code</p>
          </div>
        </div>
      )}

      {/* MODE 3: Instant Demo Simulation */}
      {mode === 'demo' && (
        <div className="w-full max-w-md space-y-3 animate-fade-in">
          <p className="text-xs text-slate-500 font-medium mb-2 text-center">
            Tap a simulated mobile scan below to test verification logic:
          </p>
          {sampleDemoCertificates.map((sample, idx) => (
            <div 
              key={idx}
              onClick={() => onResult(sample.id)}
              className="p-4 bg-white border border-rose-100 hover:border-rose-300 rounded-2xl cursor-pointer transition-all flex items-center justify-between group shadow-sm hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${sample.status === 'GENUINE' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                  {sample.status === 'GENUINE' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-sm group-hover:text-rose-600 transition-colors">{sample.patient}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{sample.desc}</div>
                </div>
              </div>
              <span className="text-xs text-rose-600 font-bold group-hover:translate-x-1 transition-transform">
                Scan →
              </span>
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-4 text-xs text-red-600 font-semibold text-center">{error}</p>}
    </div>
  );
};

export default QRScanner;
