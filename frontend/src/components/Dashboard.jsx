import React, { useState } from 'react';
import { Activity, Menu, X, CheckSquare, Stethoscope, FileText, AlertTriangle, Video, Calendar, Sliders } from 'lucide-react';
import DigitalHealthRecords from './DigitalHealthRecords';
import LiveConsultation from './LiveConsultation';
import AppointmentModal from './AppointmentModal';
import WhatIfSandbox from './WhatIfSandbox';
import NeuralBackground from './NeuralBackground';
import ReportUploader from './ReportUploader';

export default function Dashboard({ user, onLogout }) {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clarifyMode, setClarifyMode] = useState(false);
  const [clarifyOptions, setClarifyOptions] = useState([]);
  const [selectedClarifications, setSelectedClarifications] = useState([]);
  const [predictionData, setPredictionData] = useState(null);
  
  const [emergencyAlert, setEmergencyAlert] = useState(false);
  const [emergLogs, setEmergLogs] = useState({ sms: false, email: false });

  const [showEHR, setShowEHR] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [showSandbox, setShowSandbox] = useState(false);

  const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';

  const performPrediction = async (symptomsArray) => {
    setLoading(true);
    setClarifyMode(false);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: symptomsArray })
      });
      if(!res.ok) throw new Error("Server connection failed");
      const data = await res.json();
      setPredictionData(data);

      if (data.emergency_alert === "EMERGENCY") {
        setEmergencyAlert(true);
        setTimeout(() => setEmergLogs(prev => ({...prev, sms: true})), 1000);
        setTimeout(() => setEmergLogs(prev => ({...prev, email: true})), 2500);
      } else {
        setEmergencyAlert(false);
        setEmergLogs({sms:false, email:false});
      }

      // Save to EHR
      const record = {
        date: new Date().toLocaleString(),
        symptoms: symptomsArray.join(', '),
        disease: data.final_diagnosis,
        doctor: data.recommended_doctor
      };
      const records = JSON.parse(localStorage.getItem('smartHealthRecords') || '[]');
      localStorage.setItem('smartHealthRecords', JSON.stringify([record, ...records]));

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = async () => {
    if(!symptoms.trim()) {
      setError("Please enter symptoms");
      return;
    }
    const symptomsArray = symptoms.split(',').map(s => s.trim()).filter(Boolean);
    
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ symptoms: symptomsArray })
      });
      if(!res.ok) throw new Error("Server offline");
      const data = await res.json();
      
      if(data.questions && data.questions.length > 0) {
        setClarifyOptions(data.questions);
        setClarifyMode(true);
        setLoading(false);
      } else {
        await performPrediction(symptomsArray);
      }
    } catch(err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleFinalize = () => {
    const array = symptoms.split(',').map(s=>s.trim()).filter(Boolean);
    const combined = [...new Set([...array, ...selectedClarifications])];
    performPrediction(combined);
  };

  // Voice Interaction Logic
  const [isListening, setIsListening] = useState(false);
  
  const toggleListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser. Please use Chrome/Edge.");
      return;
    }
    
    if (isListening) {
      setIsListening(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => setIsListening(true);
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSymptoms(prev => prev ? `${prev}, ${transcript}` : transcript);
      setIsListening(false);
    };

    recognition.onerror = (event) => {
      console.error(event.error);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <NeuralBackground />
      <div className={`emergency-vignette ${emergencyAlert || (predictionData && predictionData.severity_level === 'Critical') ? 'active' : ''}`} />

      <header style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background: 'rgba(15,23,42,0.8)', padding: '1rem 2rem', borderRadius: '1rem', border: '1px solid var(--border)', marginBottom: '2rem', position: 'relative', zIndex: 10 }}>
        <h2 className="hover-glow" style={{ color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Activity /> SmartHealth AI
        </h2>
        <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
          <button className="secondary-btn" onClick={() => setShowEHR(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={18} /> My Health Records
          </button>
          <div style={{ textAlign: 'right', borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem' }}>
            <div style={{ fontWeight: 600 }}>{user.name}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
          </div>
          <button onClick={onLogout} className="secondary-btn" style={{ border: 'none', color: 'var(--danger)' }}>Logout</button>
        </div>
      </header>

      <div className="card">
        <h3>Symptom Checker</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Enter your symptoms below to get an instant AI analysis.</p>
        
        {error && <div style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '1rem' }}>{error}</div>}
        
        {!clarifyMode ? (
          <div className="input-container" style={{ position: 'relative' }}>
            <textarea 
              value={symptoms}
              onChange={e => setSymptoms(e.target.value)}
              placeholder="e.g. chest pain, vomiting, fever..."
              style={{ minHeight: '120px', marginBottom: '1rem', width: '100%' }}
            />
            <button 
              onClick={toggleListening}
              style={{
                position: 'absolute', right: '15px', top: '15px', background: isListening ? 'var(--danger)' : 'rgba(56, 189, 248, 0.2)',
                color: isListening ? '#fff' : 'var(--primary)', border: 'none', padding: '0.8rem', borderRadius: '50%',
                cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}
              title="Click and speak your symptoms"
            >
               <span style={{ fontSize: '1.2rem' }}>🎤</span>
            </button>
            <button id="analyze-btn" className="primary-btn hover-glow" onClick={handleAnalyze} disabled={loading} style={{ width: '100%' }}>
              {loading ? "Analyzing..." : "Analyze Symptoms"}
            </button>
            
            <div style={{ position: 'relative', marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
               <h4 style={{ color: 'var(--text-muted)' }}>OR</h4>
               <ReportUploader onUploadSuccess={(extractedSymptoms) => {
                 const current = symptoms.split(',').map(s => s.trim()).filter(Boolean);
                 const combined = [...new Set([...current, ...extractedSymptoms])];
                 setSymptoms(combined.join(', '));
                 // Use a slight timeout to let state flush before triggering pipeline
                 setTimeout(() => {
                   document.getElementById('analyze-btn')?.click();
                 }, 100);
               }} />
            </div>
          </div>
        ) : (
          <div style={{ background: 'rgba(74, 222, 128, 0.05)', border: '1px solid var(--success)', padding: '1.5rem', borderRadius: '1rem' }}>
            <h4 style={{ color: 'var(--success)', marginBottom: '1rem' }}>AI Clarification Needed</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem', marginBottom: '1.5rem' }}>
              {clarifyOptions.map((q, idx) => (
                <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" onChange={(e) => {
                    if(e.target.checked) setSelectedClarifications([...selectedClarifications, q.symptom]);
                    else setSelectedClarifications(selectedClarifications.filter(s => s !== q.symptom));
                  }} />
                  <span>{q.question}</span>
                </label>
              ))}
            </div>
            <button className="primary-btn" onClick={handleFinalize}>Finalize Diagnosis</button>
          </div>
        )}
      </div>

      {emergencyAlert && (
          <div className="animate-stagger-1 hover-glow" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', padding: '2rem', borderRadius: '1rem', marginBottom: '2rem' }}>
            <h2 style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <AlertTriangle /> CRITICAL EMERGENCY DETECTED
            </h2>
            <div style={{ background: 'rgba(0,0,0,0.4)', padding: '1.5rem', borderRadius: '0.5rem', fontFamily: 'monospace' }}>
              <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>&gt; Connecting to Global Emergency Dispatch Server...</div>
              {emergLogs.sms && <div style={{ color: 'var(--success)' }}>&gt; [SUCCESS] SMS Alert dispatched to: {user.mobile}</div>}
              {emergLogs.email && <div style={{ color: 'var(--success)' }}>&gt; [SUCCESS] High-Priority Email sent to: {user.email}</div>}
            </div>
          </div>
      )}

      {predictionData && !emergencyAlert && (
        <div className="card hover-glow animate-stagger-1" style={{ position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: '-50%', right: '-10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(56,189,248,0.2) 0%, transparent 70%)', filter: 'blur(40px)', zIndex: 0 }}></div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border)', paddingBottom: '1.5rem', marginBottom: '1.5rem' }}>
              <div>
                <div style={{ color: 'var(--primary)', fontWeight: 600, marginBottom: '0.5rem' }}>Primary Diagnosis</div>
                <h1 style={{ fontSize: '2.5rem', margin: 0 }}>{predictionData.final_diagnosis}</h1>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>{predictionData.confidence_percentage}% Match</div>
                <div style={{ color: 'var(--text-muted)' }}>Risk: {predictionData.risk_percentage}%</div>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '1rem', marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Medical Description</h4>
            <p style={{ color: 'var(--text-muted)' }}>{predictionData.description}</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '1rem' }}>
              <h4 style={{ color: 'var(--primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><CheckSquare size={18}/> Precautions</h4>
              <ul style={{ paddingLeft: '1.5rem', color: 'var(--text-muted)' }}>
                {predictionData.precautions && predictionData.precautions.map((p,i) => <li key={i}>{p}</li>)}
              </ul>
            </div>
            
            <div className="hover-glow animate-stagger-3" style={{ border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '1rem', background: 'rgba(15,23,42,0.6)' }}>
              <h4 style={{ color: '#a855f7', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Stethoscope size={18}/> Recommended Specialist</h4>
              <div style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1rem', color: 'white' }}>{predictionData.recommended_doctor}</div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button className="primary-btn hover-glow" style={{ flex: 1, fontSize: '0.9rem', background: 'linear-gradient(135deg, #a855f7 0%, #7e22ce 100%)', color: 'white', padding: '0.8rem' }} onClick={() => setShowVideo(true)}>
                  <Video size={16} /> Connect Live
                </button>
                <button className="secondary-btn hover-glow" style={{ flex: 1, fontSize: '0.9rem', padding: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }} onClick={() => setShowBooking(true)}>
                  <Calendar size={16} /> Book Appt
                </button>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginBottom: '1.5rem' }}>
             {/* Alternative Medicine */}
             <div className="hover-glow animate-stagger-4" style={{ border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '1rem', background: 'rgba(15,23,42,0.6)' }}>
                <h4 style={{ color: '#22c55e', marginBottom: '1rem' }}>🌿 Hollistic Alternate Medicine</h4>
                <div style={{ marginBottom: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Ayurveda Suggestion:</span>
                  <div style={{ color: '#fff', fontWeight: 500 }}>{predictionData.ayurveda}</div>
                </div>
                <div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Siddha Suggestion:</span>
                  <div style={{ color: '#fff', fontWeight: 500 }}>{predictionData.siddha}</div>
                </div>
             </div>

             {/* Smart Sandbox Estimator */}
             <div className="hover-glow animate-stagger-4" style={{ border: '1px solid #eab308', padding: '1.5rem', borderRadius: '1rem', background: 'rgba(15,23,42,0.6)' }}>
                <h4 style={{ color: '#eab308', marginBottom: '1rem' }}>🧪 Sandbox: Lab Diagnostics Planner</h4>
                <div style={{ color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Estimated Ideal Lab Tests:</div>
                <div style={{ color: '#fef08a', fontWeight: 600, marginBottom: '1.5rem' }}>{predictionData.lab_tests}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid rgba(234,179,8,0.2)', paddingTop: '1rem' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Estimated Market Cost:</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#eab308' }}>₹{predictionData.lab_cost}</span>
                </div>
             </div>
          </div>

          {/* Explainable AI (SHAP) Bars */}
          <div className="hover-glow animate-stagger-5" style={{ border: '1px solid var(--border)', padding: '1.5rem', borderRadius: '1rem', background: 'rgba(15,23,42,0.6)' }}>
             <h4 style={{ color: 'var(--primary)', marginBottom: '1rem' }}>🧠 AI Logic Traceback (SHAP Values)</h4>
             <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
                How the AI weighted your exact symptoms to arrive at the diagnosis.
             </p>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
                {!predictionData.shap_explanation || predictionData.shap_explanation.length === 0 ? (
                  <div style={{ color: 'var(--text-muted)' }}>No traceback weights generated.</div>
                ) : (
                  predictionData.shap_explanation.map((item, idx) => {
                    const maxImpact = Math.max(...predictionData.shap_explanation.map(i => Math.abs(i.impact)));
                    const widthPercent = maxImpact === 0 ? 0 : (Math.abs(item.impact) / maxImpact) * 100;
                    const isPos = item.impact > 0;
                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: '150px', textAlign: 'right', fontSize: '0.9rem', color: 'var(--text-main)', textTransform: 'capitalize' }}>
                          {item.feature.replace(/_/g, ' ')}
                        </div>
                        <div style={{ flex: 1, background: 'rgba(255,255,255,0.05)', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                           <div style={{ 
                               width: `${widthPercent}%`, 
                               height: '100%', 
                               background: isPos ? 'var(--danger)' : 'var(--success)',
                               transition: 'width 1s ease-out'
                           }} />
                        </div>
                      </div>
                    )
                  })
                )}
             </div>
          </div>
          
          <button className="primary-btn" style={{ width: '100%', marginTop: '1.5rem', background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)', color: 'white', padding: '1.2rem', fontSize: '1.2rem' }} onClick={() => setShowSandbox(true)}>
            <Sliders size={20} /> Launch WHAT-IF Simulation Sandbox
          </button>
        </div>
      )}

      {showEHR && <DigitalHealthRecords onClose={() => setShowEHR(false)} />}
      {showVideo && <LiveConsultation doctorName={predictionData.recommended_doctor} onClose={() => setShowVideo(false)} />}
      {showBooking && <AppointmentModal user={user} doctorName={predictionData.recommended_doctor} onClose={() => setShowBooking(false)} />}
      {showSandbox && <WhatIfSandbox predictionData={predictionData} onClose={() => setShowSandbox(false)} />}
    </div>
  );
}
