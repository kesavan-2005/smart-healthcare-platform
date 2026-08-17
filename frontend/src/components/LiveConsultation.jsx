import React, { useState } from 'react';
import { X, Video } from 'lucide-react';

export default function LiveConsultation({ doctorName, onClose }) {
  const [activeRoom, setActiveRoom] = useState(null);

  // Mock list for now
  const coreSpec = doctorName.includes("Cardiologist") ? "Cardiologist" : "General Physician";
  const mockDoctors = ["Dr. Sarah Jenkins", "Dr. Amit Patel", "Dr. Emily Chen"];

  if (activeRoom) {
    const cleanDocName = activeRoom.replace(/[^a-zA-Z]/g, "");
    const roomUrl = `https://meet.jit.si/SmartHealthConsult_${cleanDocName}_PatientRoom#config.prejoinPageEnabled=false`;
    return (
      <div className="modal-overlay active">
        <div style={{ width: '90%', height: '90vh', background: '#000', borderRadius: '1rem', overflow: 'hidden', position: 'relative' }}>
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '1rem', background: 'rgba(0,0,0,0.8)', display: 'flex', justifyContent: 'space-between', zIndex: 10 }}>
            <div style={{ color: '#fff' }}>Live Room: <span style={{ color: '#a855f7' }}>{activeRoom}</span></div>
            <button onClick={onClose} style={{ background: 'var(--danger)', color: '#fff', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}>Leave Call</button>
          </div>
          <iframe src={roomUrl} style={{ width: '100%', height: '100%', border: 'none', marginTop: '60px' }} allow="camera; microphone; fullscreen; display-capture"></iframe>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay active" onClick={(e) => { if(e.target.className.includes('modal-overlay')) onClose() }}>
      <div className="modal-content" style={{ maxWidth: '800px', background: '#0f172a' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={24} />
        </button>
        <h2 style={{ color: 'white', marginBottom: '1.5rem', textAlign: 'center' }}>Select Doctor to Initiate Call</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center' }}>
          {mockDoctors.map((doc, i) => (
            <button 
              key={i} 
              onClick={() => setActiveRoom(doc)}
              style={{ background: 'linear-gradient(145deg, rgba(168, 85, 247, 0.1) 0%, rgba(15, 23, 42, 0.6) 100%)', border: '1px solid rgba(168, 85, 247, 0.5)', color: 'white', padding: '1.5rem', borderRadius: '1rem', cursor: 'pointer', flex: '1 1 200px', transition: 'all 0.2s', boxShadow: '0 4px 15px rgba(0,0,0,0.3)' }}
            >
              <span style={{ fontSize: '2rem' }}>📞</span><br/>
              Call <b>{doc}</b><br/>
              <span style={{ fontSize: '0.9rem', color: '#d8b4fe' }}>{coreSpec}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
