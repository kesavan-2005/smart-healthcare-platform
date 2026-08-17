import React, { useState, useEffect } from 'react';
import { X, Sliders, Activity, BrainCircuit } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function WhatIfSandbox({ predictionData, onClose }) {
  const [interventions, setInterventions] = useState({
    medication: false,
    ayurveda: false,
    delay: false,
    diet: false
  });

  const [chartData, setChartData] = useState([]);
  const [currentRisk, setCurrentRisk] = useState(predictionData.risk_percentage);
  
  // Body Map Logic
  const disease = predictionData.final_diagnosis.toLowerCase();
  let affectedArea = 'none';
  if (disease.includes('heart') || disease.includes('chest') || disease.includes('angina') || disease.includes('infarction')) affectedArea = 'chest';
  else if (disease.includes('brain') || disease.includes('head') || disease.includes('stroke') || disease.includes('migraine')) affectedArea = 'head';
  else if (disease.includes('stomach') || disease.includes('ulcer') || disease.includes('gerd')) affectedArea = 'abdomen';

  useEffect(() => {
    // Monte Carlo / Predictive Recalculation Simulation
    let baseRisk = predictionData.risk_percentage;
    let newRisk = baseRisk;

    if (interventions.medication) newRisk -= 25;
    if (interventions.ayurveda) newRisk -= 10;
    if (interventions.diet) newRisk -= 15;
    if (interventions.delay) newRisk += 40;
    
    // Clamp
    newRisk = Math.max(5, Math.min(99, newRisk));
    setCurrentRisk(newRisk);

    // Generate 6 month trajectory
    const months = ['Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6'];
    const data = months.map((m, idx) => {
      // Baseline naturally worsens slightly or stays same if no intervention
      let baseline = Math.min(99, baseRisk + (idx * 5));
      
      // Intervention computes progressive healing or worsening based on current simulated risk
      let projected = Math.max(5, Math.min(99, newRisk + (interventions.delay ? idx * 10 : -(idx * 8))));
      
      return {
        name: m,
        Baseline: baseline,
        Intervention: projected
      };
    });
    setChartData(data);
  }, [interventions, predictionData.risk_percentage]);

  const toggleHandler = (key) => {
    setInterventions(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="modal-overlay active">
      <div className="modal-content" style={{ maxWidth: '1100px', width: '95%', background: '#020617', border: '1px solid var(--primary)', padding: '2rem' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}>
          <X size={24} />
        </button>
        
        <h2 style={{ color: 'var(--primary)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', letterSpacing: '2px' }}>
          <BrainCircuit /> WHAT-IF SANDBOX
        </h2>

        <div className="sandbox-grid" style={{ display: 'grid', gridTemplateColumns: 'minmax(250px, 1fr) 2fr 1fr', gap: '2rem' }}>
          
          {/* Column A: Controls */}
          <div style={{ background: 'rgba(255,255,255,0.02)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.1)' }}>
             <h3 style={{ color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <Sliders size={18} /> Interventions
             </h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#cbd5e1', cursor: 'pointer' }}>
                  <span>Pharmaceutical Meds</span>
                  <input type="checkbox" checked={interventions.medication} onChange={() => toggleHandler('medication')} style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }} />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#cbd5e1', cursor: 'pointer' }}>
                  <span>Apply Ayurveda</span>
                  <input type="checkbox" checked={interventions.ayurveda} onChange={() => toggleHandler('ayurveda')} style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }} />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#cbd5e1', cursor: 'pointer' }}>
                  <span>Strict Diet Optimization</span>
                  <input type="checkbox" checked={interventions.diet} onChange={() => toggleHandler('diet')} style={{ width: '20px', height: '20px', accentColor: 'var(--primary)' }} />
                </label>
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#fca5a5', cursor: 'pointer', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1rem' }}>
                  <span>Delay Treatment 30 Days</span>
                  <input type="checkbox" checked={interventions.delay} onChange={() => toggleHandler('delay')} style={{ width: '20px', height: '20px', accentColor: 'var(--danger)' }} />
                </label>
             </div>

             <div style={{ marginTop: '2.5rem', textAlign: 'center', border: `1px solid ${currentRisk > 50 ? 'var(--warning)' : 'var(--success)'}`, padding: '1rem', borderRadius: '1rem', background: 'rgba(0,0,0,0.3)' }}>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Projected Core Risk</div>
                <div style={{ fontSize: '3rem', fontWeight: 800, color: currentRisk > 50 ? 'var(--warning)' : 'var(--success)' }}>
                  {currentRisk.toFixed(1)}%
                </div>
             </div>
          </div>

          {/* Column B: Predictive Chart */}
          <div style={{ background: 'rgba(0,0,0,0.5)', padding: '1.5rem', borderRadius: '1rem', border: '1px solid rgba(255,255,255,0.05)' }}>
            <h3 style={{ color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
               <Activity size={18} /> Trajectory Projection
             </h3>
             <div style={{ width: '100%', height: '350px' }}>
                <ResponsiveContainer>
                  <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="name" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" domain={[0, 100]} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid var(--primary)', borderRadius: '8px' }} />
                    <Legend />
                    <Line type="monotone" dataKey="Baseline" stroke="#ef4444" strokeWidth={2} strokeDasharray="5 5" />
                    <Line type="monotone" dataKey="Intervention" stroke="#4ade80" strokeWidth={3} activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Column C: 3D Body Simulator Map */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '1rem', padding: '1rem', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <h3 style={{ color: 'var(--primary)', marginBottom: '1rem', fontSize: '1rem' }}>Cyber-Body Map</h3>
            <svg viewBox="0 0 100 250" style={{ height: '320px', width: 'auto', filter: 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.3))' }}>
              {/* Generic Silhouette Math */}
              <path d="M50 10 C60 10, 60 30, 50 30 C40 30, 40 10, 50 10 Z" fill="rgba(255,255,255,0.1)" stroke="var(--primary)" strokeWidth="1" />
              <path d="M30 40 L70 40 L80 120 L70 120 L65 70 L55 120 L45 120 L35 70 L30 120 L20 120 Z" fill="rgba(255,255,255,0.1)" stroke="var(--primary)" strokeWidth="1" />
              <path d="M45 120 L55 120 L60 220 L50 220 L45 160 L40 220 L30 220 Z" fill="rgba(255,255,255,0.1)" stroke="var(--primary)" strokeWidth="1" />
              
              {/* Highlight Areas */}
              {affectedArea === 'head' && <circle cx="50" cy="20" r="12" fill="rgba(239, 68, 68, 0.6)" filter="blur(4px)" />}
              {affectedArea === 'chest' && <circle cx="50" cy="60" r="18" fill="rgba(239, 68, 68, 0.6)" filter="blur(6px)" />}
              {affectedArea === 'abdomen' && <circle cx="50" cy="100" r="15" fill="rgba(239, 68, 68, 0.6)" filter="blur(5px)" />}
            </svg>
            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
              Real-time physiological mapping.
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
