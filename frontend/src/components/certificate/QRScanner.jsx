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
          (err) => {
            // Silently ignore frame scan retries
          }
        );
      } catch (err) {
        setError('Camera access denied or unavailable. You can upload an image or click demo certificates below.');
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

  // Image Upload QR decoding
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

  // Pre-configured Demo Certificate UUIDs for instant demonstration
  const sampleDemoCertificates = [
    {
      id: "79fca1d5-0550-4ba7-898b-c9201e440a36",
      patient: "Jane Doe (City General)",
      status: "GENUINE",
      desc: "Valid signed certificate issued by Dr. John Smith"
    },
    {
      id: "fake-cert-uuid-9999-tampered-hash",
      patient: "Unknown Patient (Tampered Test)",
      status: "TAMPERED",
      desc: "Simulates modified diagnosis text or invalid signature"
    }
  ];

  return (
    <div className="w-full flex flex-col items-center">
      {/* Hidden container for file scan processing */}
      <div id="reader-file-temp" className="hidden"></div>

      {/* Mode Selector Tabs */}
      <div className="flex bg-[rgba(0,0,0,0.4)] p-1 rounded-xl border border-[rgba(255,255,255,0.1)] mb-6 w-full max-w-md">
        <button
          type="button"
          onClick={() => { stopScanning(); setMode('camera'); }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${mode === 'camera' ? 'bg-[#00d4ff] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
        >
          <Camera size={14} /> Phone Camera
        </button>
        <button
          type="button"
          onClick={() => { stopScanning(); setMode('upload'); }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${mode === 'upload' ? 'bg-[#00d4ff] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
        >
          <Upload size={14} /> Upload Image
        </button>
        <button
          type="button"
          onClick={() => { stopScanning(); setMode('demo'); }}
          className={`flex-1 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${mode === 'demo' ? 'bg-[#00d4ff] text-black shadow-md' : 'text-gray-400 hover:text-white'}`}
        >
          <Sparkles size={14} /> Mobile Demo
        </button>
      </div>

      {/* MODE 1: Camera Scanner wrapped in a Mobile Phone Device Mockup Frame */}
      {mode === 'camera' && (
        <div className="w-full max-w-[340px] flex flex-col items-center">
          {/* Smartphone Frame Outer Shell */}
          <div className="w-full bg-[#1e293b] p-3 rounded-[38px] border-4 border-[#334155] shadow-[0_25px_60px_rgba(0,0,0,0.7)] relative overflow-hidden">
            {/* Phone Speaker Notch */}
            <div className="w-28 h-4 bg-[#0f172a] rounded-full mx-auto mb-2 flex items-center justify-center gap-1.5 border border-[#334155]">
              <div className="w-2.5 h-2.5 rounded-full bg-[#1e293b]"></div>
              <div className="w-10 h-1 rounded-full bg-[#334155]"></div>
            </div>

            {/* Smartphone Display Screen */}
            <div className="bg-[#0a0f1e] rounded-[28px] overflow-hidden min-h-[360px] flex flex-col items-center justify-center relative p-3 border border-[rgba(255,255,255,0.1)]">
              {!scanning ? (
                <div 
                  onClick={startScanning}
                  className="flex flex-col items-center justify-center text-center p-6 cursor-pointer group"
                >
                  <div className="w-20 h-20 rounded-full bg-[rgba(0,212,255,0.1)] border-2 border-[rgba(0,212,255,0.3)] flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-[#00d4ff] transition-all shadow-[0_0_20px_rgba(0,212,255,0.2)]">
                    <Smartphone size={38} className="text-[#00d4ff]" />
                  </div>
                  <span className="text-white font-bold text-base mb-1">Tap Screen to Scan</span>
                  <p className="text-xs text-gray-400 max-w-[200px] leading-relaxed">
                    Point smartphone camera at any MedVerify QR Code
                  </p>
                  <span className="mt-4 px-3 py-1.5 bg-[#00d4ff] text-black font-semibold rounded-full text-xs shadow-md">
                    Open Camera
                  </span>
                </div>
              ) : (
                <div className="w-full relative">
                  {/* Animated Scanner Radar Line */}
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[#00d4ff] to-transparent shadow-[0_0_15px_#00d4ff] z-20 animate-bounce"></div>
                  <div id="reader" className="w-full rounded-2xl overflow-hidden"></div>
                  
                  <button 
                    type="button"
                    onClick={stopScanning}
                    className="mt-3 w-full py-2 bg-[#ef4444] text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-md"
                  >
                    <StopCircle size={14} /> Close Phone Camera
                  </button>
                </div>
              )}
            </div>

            {/* Phone Home Indicator Bar */}
            <div className="w-24 h-1 bg-gray-600 rounded-full mx-auto mt-2"></div>
          </div>
          <p className="text-xs text-gray-400 mt-3 text-center">📱 Works on any Mobile Phone or Web Browser Camera</p>
        </div>
      )}

      {/* MODE 2: Upload QR Code Image */}
      {mode === 'upload' && (
        <div className="w-full max-w-md">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            accept="image/*" 
            className="hidden" 
          />
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[rgba(0,212,255,0.4)] rounded-2xl p-10 flex flex-col items-center justify-center text-center bg-[rgba(0,212,255,0.03)] hover:bg-[rgba(0,212,255,0.07)] transition-all cursor-pointer group"
          >
            <div className="w-16 h-16 rounded-full bg-[rgba(0,212,255,0.1)] border border-[rgba(0,212,255,0.3)] flex items-center justify-center mb-4 group-hover:scale-110 transition-all">
              <Upload size={30} className="text-[#00d4ff]" />
            </div>
            <h4 className="text-white font-semibold text-base mb-1">Select QR Code Image</h4>
            <p className="text-xs text-gray-400">Click to upload a PNG or JPG containing a certificate QR Code</p>
          </div>
        </div>
      )}

      {/* MODE 3: One-Tap Mobile Demo Simulation */}
      {mode === 'demo' && (
        <div className="w-full max-w-md space-y-3">
          <p className="text-xs text-gray-400 mb-2 text-center">
            Tap a simulated mobile scan below to instantly test verification logic:
          </p>
          {sampleDemoCertificates.map((sample, idx) => (
            <div 
              key={idx}
              onClick={() => onResult(sample.id)}
              className="p-4 glass-card border border-[rgba(255,255,255,0.1)] hover:border-[#00d4ff] rounded-xl cursor-pointer transition-all flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${sample.status === 'GENUINE' ? 'bg-[rgba(16,185,129,0.1)] text-[#10b981]' : 'bg-[rgba(239,68,68,0.1)] text-[#ef4444]'}`}>
                  {sample.status === 'GENUINE' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                </div>
                <div>
                  <div className="font-semibold text-white text-sm group-hover:text-[#00d4ff] transition-colors">{sample.patient}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{sample.desc}</div>
                </div>
              </div>
              <span className="text-xs text-[#00d4ff] font-medium group-hover:translate-x-1 transition-transform">
                Scan →
              </span>
            </div>
          ))}
        </div>
      )}

      {error && <p className="mt-4 text-xs text-[#ef4444] text-center">{error}</p>}
    </div>
  );
};

export default QRScanner;
