import React from 'react';
import { X, Calendar } from 'lucide-react';

export default function DigitalHealthRecords({ onClose }) {
  const records = JSON.parse(localStorage.getItem('smartHealthRecords') || '[]');

  return (
    <div className="modal-overlay active" onClick={(e) => { if(e.target.className.includes('modal-overlay')) onClose() }}>
      <div className="modal-content" style={{ maxWidth: '700px' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={24} />
        </button>
        <h2 style={{ fontSize: '1.5rem', color: 'var(--text-main)', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar /> Digital Health Records
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
          {records.length === 0 ? (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>
              No diagnostic records found. Run a prediction to save it!
            </div>
          ) : (
            records.map((rec, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', background: 'rgba(255,255,255,0.02)', padding: '1.5rem', border: '1px solid var(--border)', borderRadius: '1rem' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{rec.date}</div>
                <div style={{ fontSize: '1.1rem', color: 'white', fontWeight: 700 }}>{rec.disease}</div>
                <div style={{ color: '#a855f7', fontSize: '0.9rem' }}>🩺 Assigned: {rec.doctor}</div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '0.4rem', fontSize: '0.8rem', color: '#cbd5e1', marginTop: '0.5rem' }}>
                  <i>Symptoms:</i> {rec.symptoms}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
