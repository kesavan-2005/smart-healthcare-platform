import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function ReportUploader({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState('idle'); // idle, uploading, processing, success, error
  const [errorMessage, setErrorMessage] = useState('');
  
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const processFile = async (selectedFile) => {
    if (!selectedFile) return;
    
    // Validate
    if (selectedFile.type !== 'application/pdf' && selectedFile.type !== 'text/plain') {
      setStatus('error');
      setErrorMessage('Only PDF and TXT files are supported for OCR scanning.');
      return;
    }
    if (selectedFile.size > 10 * 1024 * 1024) {
      setStatus('error');
      setErrorMessage('File exceeds maximum size of 10MB.');
      return;
    }
    
    setFile(selectedFile);
    setStatus('uploading');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      // Simulate slight delay for effect if upload is instant
      setTimeout(() => setStatus('processing'), 800);
      
      const API_BASE = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000';
      const res = await fetch(`${API_BASE}/upload-report`, {
        method: 'POST',
        body: formData,
      });
      
      if (!res.ok) throw new Error("Connection failed or server rejected file");
      
      const data = await res.json();
      
      if(data.error) throw new Error(data.error);

      setStatus('success');
      setTimeout(() => {
         if (data.extracted_symptoms && data.extracted_symptoms.length > 0) {
           onUploadSuccess(data.extracted_symptoms);
           setStatus('idle');
           setFile(null);
         } else {
           setStatus('error');
           setErrorMessage("No pathological symptoms could be extracted from this report. Try manual entry.");
         }
      }, 1500);

    } catch(err) {
      setStatus('error');
      setErrorMessage(err.message);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if(e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if(e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem' }}>
      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => status !== 'uploading' && status !== 'processing' && fileInputRef.current?.click()}
        className={`hover-glow ${isDragging ? 'dragging' : ''}`}
        style={{
          border: `2px dashed ${isDragging ? 'var(--primary)' : 'rgba(255,255,255,0.2)'}`,
          background: isDragging ? 'rgba(56, 189, 248, 0.05)' : 'rgba(15,23,42,0.4)',
          borderRadius: '1rem',
          padding: '2.5rem 1rem',
          textAlign: 'center',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          style={{ display: 'none' }} 
          accept=".pdf,.txt"
          onChange={handleFileChange}
        />
        
        {status === 'idle' && (
          <>
            <UploadCloud size={48} color="var(--primary)" style={{ opacity: 0.8, marginBottom: '1rem' }} />
            <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Upload Medical Report (PDF)</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Drag & drop your lab results, or click to browse.</p>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '0.3rem 0.8rem', borderRadius: '1rem', color: 'gray' }}>PDF</span>
              <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '0.3rem 0.8rem', borderRadius: '1rem', color: 'gray' }}>TXT</span>
            </div>
          </>
        )}

        {(status === 'uploading' || status === 'processing') && (
          <div style={{ animation: 'pulseVignette 2s infinite' }}>
             <Loader size={40} color="var(--primary)" className="spin" style={{ animation: 'spin 2s linear infinite', marginBottom: '1rem' }} />
             <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
             <h4 style={{ color: 'var(--primary)' }}>{status === 'uploading' ? 'Uploading securely...' : 'NLP Deep Extraction in Progress...'}</h4>
             <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Scanning document for pathological entities</p>
          </div>
        )}

        {status === 'success' && (
          <div>
             <CheckCircle size={48} color="var(--success)" style={{ marginBottom: '1rem' }} />
             <h4 style={{ color: 'var(--success)' }}>Scan Complete!</h4>
             <p style={{ color: 'white', marginTop: '0.5rem' }}>{file?.name}</p>
             <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Injecting symptoms into AI Pipeline...</p>
          </div>
        )}

        {status === 'error' && (
          <div>
            <AlertCircle size={48} color="var(--danger)" style={{ marginBottom: '1rem' }} />
            <h4 style={{ color: 'var(--danger)' }}>Upload Failed</h4>
            <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>{errorMessage}</p>
            <button 
              onClick={(e) => { e.stopPropagation(); setStatus('idle'); setFile(null); }}
              style={{ marginTop: '1rem', background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', padding: '0.5rem 1rem', borderRadius: '0.5rem', cursor: 'pointer' }}
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
