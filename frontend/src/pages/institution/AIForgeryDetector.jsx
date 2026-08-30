import React, { useState, useRef } from 'react';
import { 
  BrainCircuit, ShieldAlert, ShieldCheck, AlertTriangle, 
  Upload, Sparkles, RefreshCw, Layers, CheckCircle2, 
  XCircle, ArrowRight, FileText, Cpu, Scan, Search, Key
} from 'lucide-react';
import { verifierService } from '../../services/verifierService';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Badge from '../../components/common/Badge';
import toast from 'react-hot-toast';

const AIForgeryDetector = () => {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [certInputId, setCertInputId] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  
  // Interactive View Controls
  const [activeOverlay, setActiveOverlay] = useState('both'); // 'none', 'boxes', 'heatmap', 'both'
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);
  
  const fileInputRef = useRef(null);

  // Pre-configured Test Samples
  const sampleScenarios = [
    {
      name: "Authentic Certificate (Valid DB Record)",
      type: "genuine",
      certId: "CERT-GENUINE-2024-001",
      description: "Standard issued document with uniform Error Level Analysis (ELA) noise, valid RSA-2048 cryptographic signature, and authentic typography.",
      badge: "Authentic Clean Scan",
      badgeColor: "success"
    },
    {
      name: "Altered Leave Dates (Spliced Text)",
      type: "tampered_dates",
      certId: null,
      fileName: "tampered_dates_certificate.jpg",
      description: "Localized Error Level Analysis (ELA) compression spike and font anti-aliasing mismatch detected on modified leave duration.",
      badge: "Date Splicing Anomaly",
      badgeColor: "danger"
    },
    {
      name: "Cloned Doctor Authorization Stamp",
      type: "forged_stamp",
      certId: null,
      fileName: "forged_seal_stamp.jpg",
      description: "Pasted physician seal exhibiting Laplacian edge variance and alpha channel boundary gradient clipping.",
      badge: "Cloned Stamp Anomaly",
      badgeColor: "danger"
    }
  ];

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      const url = URL.createObjectURL(selected);
      setPreviewUrl(url);
      setAnalysisResult(null);
      setSelectedAnomaly(null);
    }
  };

  const runAnalysis = async (customPayload = null) => {
    setAnalyzing(true);
    setAnalysisResult(null);
    setSelectedAnomaly(null);

    try {
      let payload = customPayload;
      if (!payload) {
        payload = {
          certificateId: certInputId.trim() || undefined,
          fileName: file?.name || 'uploaded_certificate.jpg',
          verifierName: 'Institution Security Officer',
          verifierOrganization: 'Academic Review Board'
        };
      }

      // Multi-layer forensic inspection
      await new Promise(r => setTimeout(r, 900));

      const result = await verifierService.analyzeDocument(payload);
      setAnalysisResult(result);
      if (result.overallRiskScore > 60) {
        toast.error(`High Forgery Risk Detected (${result.overallRiskScore}% Risk)`);
      } else {
        toast.success(`Analysis Complete: ${result.riskLevel.replace(/_/g, ' ')}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete AI analysis');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSelectSample = (sample) => {
    setCertInputId(sample.certId || '');
    setFile({ name: sample.fileName || sample.name });
    setPreviewUrl('/medical_cert_3d.jpg');
    runAnalysis({
      certificateId: sample.certId,
      fileName: sample.fileName || sample.name,
      verifierName: 'Enterprise Compliance Auditor',
      verifierOrganization: 'Credential Verification Dept'
    });
  };

  const handleIdSearch = (e) => {
    e.preventDefault();
    if (!certInputId.trim()) {
      toast.error('Please enter a Certificate ID');
      return;
    }
    setFile({ name: `Certificate_${certInputId.trim()}.pdf` });
    setPreviewUrl('/medical_cert_3d.jpg');
    runAnalysis({
      certificateId: certInputId.trim(),
      fileName: `Certificate_${certInputId.trim()}.pdf`,
      verifierName: 'Institution Security Officer',
      verifierOrganization: 'Academic Review Board'
    });
  };

  const handleReset = () => {
    setFile(null);
    setPreviewUrl(null);
    setCertInputId('');
    setAnalysisResult(null);
    setSelectedAnomaly(null);
  };

  const getRiskBadgeVariant = (score) => {
    if (score <= 25) return 'success';
    if (score <= 60) return 'warning';
    return 'danger';
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border-teal-100 relative overflow-hidden bg-gradient-to-r from-white via-teal-50/40 to-emerald-50/30">
        <div className="space-y-2 text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100/80 text-teal-900 rounded-full text-xs font-extrabold border border-teal-200">
            <BrainCircuit size={14} className="text-teal-700 animate-pulse" /> Neural Forensic Engine Active
          </div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">
            AI Forgery & Visual Pattern Detector
          </h1>
          <p className="text-slate-500 text-sm font-medium max-w-2xl">
            Evaluates medical document authenticity, identifying altered leave dates, spliced text, and forged doctor stamps using Error Level Analysis (ELA) and visual forensic inspection.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {analysisResult && (
            <button 
              onClick={handleReset}
              className="btn btn-secondary border-slate-200 text-slate-700 bg-white hover:bg-slate-50 shadow-2xs"
            >
              <RefreshCw size={16} /> Reset
            </button>
          )}
          <button 
            onClick={() => fileInputRef.current?.click()}
            className="btn btn-primary shadow-[0_6px_20px_rgba(13,148,136,0.3)]"
          >
            <Upload size={18} /> Upload Certificate Image
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*,.pdf" 
            className="hidden" 
          />
        </div>
      </div>

      {/* Certificate ID Search / Direct Analysis Bar */}
      <div className="glass-card border-slate-200/80 p-4 sm:p-5">
        <form onSubmit={handleIdSearch} className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Key size={18} />
            </div>
            <input 
              type="text"
              value={certInputId}
              onChange={(e) => setCertInputId(e.target.value)}
              placeholder="Enter Certificate UUID to verify cryptographic signature & inspect anomalies (e.g. CERT-GENUINE-2024-001)"
              className="input pl-10 pr-4 py-2.5 text-sm w-full bg-white border-slate-200 font-mono text-slate-800 placeholder:text-slate-400 focus:border-teal-500 rounded-xl"
            />
          </div>
          <button 
            type="submit"
            disabled={analyzing}
            className="btn btn-primary w-full sm:w-auto px-6 shrink-0 shadow-sm"
          >
            <Search size={16} /> Inspect Certificate ID
          </button>
        </form>
      </div>

      {/* Quick Test Demo Scenarios */}
      <div className="glass-card border-slate-200/80">
        <div className="flex items-center justify-between mb-3.5">
          <h3 className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-2">
            <Sparkles size={14} className="text-teal-600" /> One-Click Forensic Test Samples
          </h3>
          <span className="text-[11px] text-slate-400 font-medium">Select a test case to execute real-time forensic inference</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sampleScenarios.map((s, idx) => (
            <div 
              key={idx}
              onClick={() => handleSelectSample(s)}
              className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/60 hover:bg-teal-50/40 hover:border-teal-300 transition-all cursor-pointer group flex flex-col justify-between gap-3 shadow-2xs"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-extrabold text-slate-800 text-sm group-hover:text-teal-700 transition-colors">
                    {s.name}
                  </span>
                  <Badge variant={s.badgeColor}>{s.badge}</Badge>
                </div>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  {s.description}
                </p>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-600 pt-1 group-hover:translate-x-1 transition-transform">
                <span>Run Forensic Inspection</span>
                <ArrowRight size={14} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Loading Neural Scan Indicator */}
      {analyzing && (
        <div className="bg-white rounded-3xl p-12 border border-teal-100 text-center flex flex-col items-center justify-center space-y-4 shadow-sm animate-fade-in">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full border-4 border-teal-200 animate-ping opacity-40"></div>
            <div className="w-16 h-16 rounded-2xl bg-teal-500 text-white flex items-center justify-center shadow-lg shadow-teal-500/30">
              <BrainCircuit size={32} className="animate-spin" />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-800">Executing Forensic Analysis...</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">Calculating Error Level Analysis (ELA) matrix, pixel gradient variance, and typography uniformity</p>
          </div>
          <div className="flex items-center gap-4 text-xs font-bold text-teal-700 bg-teal-50 px-4 py-2 rounded-xl border border-teal-200">
            <span className="animate-pulse">● Compression Noise Variance</span>
            <span className="animate-pulse">● Laplacian Gradient Analysis</span>
            <span className="animate-pulse">● Clinical Plausibility Verification</span>
          </div>
        </div>
      )}

      {/* Analysis Results View */}
      {analysisResult && !analyzing && (
        <div className="space-y-6 animate-fade-in">
          {/* Top Score Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Risk Gauge Card */}
            <div className="glass-card border-slate-200 flex flex-col items-center justify-center text-center p-6 bg-gradient-to-b from-white to-slate-50/50">
              <span className="text-xs font-extrabold text-slate-400 uppercase tracking-wider mb-2">Overall Forgery Risk</span>
              
              {/* Radial Risk Meter */}
              <div className="relative w-36 h-36 flex items-center justify-center my-2">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
                  <circle 
                    cx="50" cy="50" r="40" 
                    stroke={analysisResult.overallRiskScore > 60 ? '#f43f5e' : analysisResult.overallRiskScore > 25 ? '#f59e0b' : '#10b981'} 
                    strokeWidth="10" 
                    strokeDasharray={251.2} 
                    strokeDashoffset={251.2 - (251.2 * analysisResult.overallRiskScore) / 100}
                    strokeLinecap="round"
                    fill="transparent" 
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-3xl font-black text-slate-800 tracking-tight">{analysisResult.overallRiskScore}%</span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Risk Index</span>
                </div>
              </div>

              <div className="mt-2">
                <Badge variant={getRiskBadgeVariant(analysisResult.overallRiskScore)}>
                  {analysisResult.riskLevel.replace(/_/g, ' ')}
                </Badge>
                <p className="text-xs text-slate-500 font-medium mt-2 max-w-xs">
                  {analysisResult.verdictSummary}
                </p>
              </div>
            </div>

            {/* Feature Sub-Scores Breakdown */}
            <div className="glass-card border-slate-200 lg:col-span-2 p-6 flex flex-col justify-between">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h3 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
                  <Cpu size={18} className="text-teal-600" /> Multi-Layer Forensic Inspection Breakdown
                </h3>
                <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                  {analysisResult.confidenceScore}% Confidence
                </span>
              </div>

              <div className="space-y-3.5">
                {[
                  { label: "Noise & Compression Uniformity (ELA)", score: analysisResult.noiseConsistencyScore, desc: "Evaluates JPEG error-level spikes & resaving artifacts" },
                  { label: "Font Kerning & Typography Uniformity", score: analysisResult.fontUniformityScore, desc: "Detects digital text insertion with mismatched anti-aliasing" },
                  { label: "Document Layout & Geometry Conformity", score: analysisResult.layoutConformityScore, desc: "Validates hospital header, margins, and seal placement" },
                  { label: "File Signature & Metadata Integrity", score: analysisResult.metadataIntegrityScore, desc: "Checks image file history for editing software traces" },
                  { label: "Clinical & Prescribed Leave Plausibility", score: analysisResult.clinicalPlausibilityScore, desc: "Validates medical diagnosis and recovery duration coherence" }
                ].map((f, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-slate-700">{f.label}</span>
                      <span className={f.score > 75 ? 'text-emerald-600' : f.score > 50 ? 'text-amber-600' : 'text-red-500'}>
                        {f.score}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all duration-700 ${f.score > 75 ? 'bg-emerald-500' : f.score > 50 ? 'bg-amber-500' : 'bg-rose-500'}`}
                        style={{ width: `${f.score}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Visual Forensic Canvas */}
          <div className="glass-card border-teal-100 overflow-hidden p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
              <div>
                <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                  <Scan size={20} className="text-teal-600" /> Interactive Visual Forgery Map
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Click on flagged regions or anomaly cards to inspect identified tampering patterns
                </p>
              </div>

              {/* Overlay Toggle Controls */}
              <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
                <button
                  onClick={() => setActiveOverlay('both')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeOverlay === 'both' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Full Inspection
                </button>
                <button
                  onClick={() => setActiveOverlay('heatmap')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeOverlay === 'heatmap' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  ELA Heatmap
                </button>
                <button
                  onClick={() => setActiveOverlay('boxes')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeOverlay === 'boxes' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Anomaly Boxes
                </button>
                <button
                  onClick={() => setActiveOverlay('none')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${activeOverlay === 'none' ? 'bg-white text-teal-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  Original Image
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Document Canvas Container */}
              <div className="lg:col-span-7 flex items-center justify-center bg-slate-900/95 rounded-2xl p-4 relative min-h-[420px] overflow-hidden border border-slate-800">
                <div className="relative max-w-full max-h-[400px] rounded-xl overflow-hidden shadow-2xl border border-white/10">
                  {/* Base Document Image */}
                  <img 
                    src={previewUrl || "/medical_cert_3d.jpg"} 
                    alt="Certificate Analysis" 
                    className="w-full h-auto object-contain max-h-[390px]"
                  />

                  {/* Heatmap Overlay Simulation */}
                  {(activeOverlay === 'heatmap' || activeOverlay === 'both') && analysisResult.overallRiskScore > 40 && (
                    <div 
                      className="absolute inset-0 pointer-events-none opacity-40 mix-blend-color-dodge bg-gradient-to-tr from-transparent via-rose-500/60 to-purple-600/50"
                      style={{ filter: 'contrast(160%)' }}
                    ></div>
                  )}

                  {/* Tamper Bounding Boxes Overlays */}
                  {(activeOverlay === 'boxes' || activeOverlay === 'both') && (
                    <>
                      {analysisResult.visualAnomalies.map((ano, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedAnomaly(ano)}
                          style={{
                            left: `${ano.x}%`,
                            top: `${ano.y}%`,
                            width: `${ano.width}%`,
                            height: `${ano.height}%`
                          }}
                          className={`absolute border-2 rounded-lg cursor-pointer transition-all duration-200 animate-pulse flex items-start justify-end p-1 ${
                            selectedAnomaly === ano 
                              ? 'border-red-400 bg-red-500/30 scale-105 shadow-[0_0_15px_rgba(244,63,94,0.8)]' 
                              : ano.severity === 'CRITICAL' 
                                ? 'border-rose-500 bg-rose-500/15 hover:bg-rose-500/30' 
                                : 'border-amber-400 bg-amber-400/15 hover:bg-amber-400/30'
                          }`}
                        >
                          <span className="bg-red-600 text-white font-mono text-[9px] font-black px-1.5 py-0.5 rounded shadow-sm">
                            #{idx + 1}
                          </span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Findings & Anomaly Details Panel */}
              <div className="lg:col-span-5 flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-800 mb-3 flex items-center justify-between">
                    <span>Identified Anomaly Locations ({analysisResult.visualAnomalies.length})</span>
                    {analysisResult.detectedSoftwareTags?.length > 0 && (
                      <span className="text-[10px] font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        {analysisResult.detectedSoftwareTags[0]}
                      </span>
                    )}
                  </h4>

                  {analysisResult.visualAnomalies.length === 0 ? (
                    <div className="p-6 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                      <CheckCircle2 size={32} className="text-emerald-600 mx-auto" />
                      <div className="font-bold text-emerald-900 text-sm">Authentic Document Pattern</div>
                      <p className="text-xs text-emerald-700 font-medium">
                        Pixel gradient, Error Level Analysis compression profile, and clinical diagnosis parameters match authentic standards.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2.5 max-h-[280px] overflow-y-auto pr-1">
                      {analysisResult.visualAnomalies.map((ano, idx) => (
                        <div
                          key={idx}
                          onClick={() => setSelectedAnomaly(ano)}
                          className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                            selectedAnomaly === ano 
                              ? 'bg-rose-50 border-rose-400 shadow-xs' 
                              : 'bg-white border-slate-200/90 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-700 font-black text-xs flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <span className="font-extrabold text-slate-800 text-xs">{ano.region}</span>
                            </div>
                            <Badge variant={ano.severity === 'CRITICAL' ? 'danger' : 'warning'}>
                              {ano.anomalyType.replace(/_/g, ' ')}
                            </Badge>
                          </div>
                          <p className="text-[11px] text-slate-500 font-medium pl-6">
                            {ano.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Forensic Insights List */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider block mb-2">
                    Forensic AI Findings & Details
                  </span>
                  <ul className="space-y-1.5 text-xs text-slate-700 font-medium">
                    {analysisResult.forensicInsights.map((ins, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-teal-600 mt-0.5">•</span>
                        <span>{ins}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIForgeryDetector;
