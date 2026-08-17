import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, Image as ImageIcon, CheckCircle, AlertCircle, Loader } from 'lucide-react';

export default function ReportUploader({ onUploadSuccess }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [detectedType, setDetectedType] = useState(null);
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
    
    const isImage = selectedFile.type.startsWith('image/');
    const isPdfOrTxt = selectedFile.type === 'application/pdf' || selectedFile.type === 'text/plain';

    // Validate
    if (!isImage && !isPdfOrTxt) {
      setStatus('error');
      setErrorMessage('Supported formats: PDF, TXT, PNG, JPG, JPEG, WEBP');
      return;
    }
    if (selectedFile.size > 15 * 1024 * 1024) {
      setStatus('error');
      setErrorMessage('File exceeds maximum size of 15MB.');
      return;
    }
    
    setFile(selectedFile);
    if (isImage) {
      setPreviewUrl(URL.createObjectURL(selectedFile));
    } else {
      setPreviewUrl(null);
    }

    setStatus('uploading');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      setTimeout(() => setStatus('processing'), 600);
      
      const API_BASE = window.location.hostname === 'localhost' ? 'http://localhost:5000' : 'https://smart-healthcare-platform-2.onrender.com';
      
      let res;
      try {
        res = await fetch(`${API_BASE}/upload-report`, {
          method: 'POST',
          body: formData,
        });
      } catch (networkErr) {
        // Fallback to local server if production server is unreachable
        res = await fetch('http://localhost:5000/upload-report', {
          method: 'POST',
          body: formData,
        });
      }
      
      if (!res.ok) throw new Error("Connection failed or server rejected file");
      
      const data = await res.json();
      
      if(data.error) throw new Error(data.error);

      if (data.image_type) {
        setDetectedType(data.image_type);
      }

      setStatus('success');
      setTimeout(() => {
         if (data.extracted_symptoms && data.extracted_symptoms.length > 0) {
           onUploadSuccess(data.extracted_symptoms);
           setStatus('idle');
           setFile(null);
           setPreviewUrl(null);
         } else {
           setStatus('error');
           setErrorMessage("No pathological symptoms could be extracted from this image/report. Try manual entry.");
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
          accept=".pdf,.txt,.png,.jpg,.jpeg,.webp"
          onChange={handleFileChange}
        />
        
        {status === 'idle' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <UploadCloud size={40} color="var(--primary)" style={{ opacity: 0.9 }} />
              <ImageIcon size={40} color="#a855f7" style={{ opacity: 0.9 }} />
            </div>
            <h4 style={{ color: 'white', marginBottom: '0.5rem' }}>Upload Medical Report or Skin Photo</h4>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Drag & drop lab reports (PDF/Image) or photos of skin symptoms.</p>
            <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)', padding: '0.3rem 0.8rem', borderRadius: '1rem', color: 'var(--primary)' }}>PDF</span>
              <span style={{ fontSize: '0.75rem', background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.3)', padding: '0.3rem 0.8rem', borderRadius: '1rem', color: '#c084fc' }}>PNG / JPG</span>
              <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.1)', padding: '0.3rem 0.8rem', borderRadius: '1rem', color: 'gray' }}>WEBP / TXT</span>
            </div>
          </>
        )}

        {(status === 'uploading' || status === 'processing') && (
          <div style={{ animation: 'pulseVignette 2s infinite', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             {previewUrl && (
               <img 
                 src={previewUrl} 
                 alt="Preview" 
                 style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '0.8rem', marginBottom: '1rem', border: '2px solid var(--primary)' }} 
               />
             )}
             <Loader size={40} color="var(--primary)" className="spin" style={{ animation: 'spin 2s linear infinite', marginBottom: '1rem' }} />
             <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
             <h4 style={{ color: 'var(--primary)' }}>{status === 'uploading' ? 'Uploading securely...' : 'Hybrid Image & Vision Analysis in Progress...'}</h4>
             <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.5rem' }}>Scanning document OCR & visual symptom traits</p>
          </div>
        )}

        {status === 'success' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
             {previewUrl && (
               <img 
                 src={previewUrl} 
                 alt="Preview" 
                 style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '0.8rem', marginBottom: '0.8rem', border: '2px solid var(--success)' }} 
               />
             )}
             <CheckCircle size={44} color="var(--success)" style={{ marginBottom: '0.5rem' }} />
             <h4 style={{ color: 'var(--success)' }}>Analysis Complete!</h4>
             {detectedType && (
               <div style={{ fontSize: '0.85rem', color: '#4ade80', background: 'rgba(34,197,94,0.15)', padding: '0.3rem 0.8rem', borderRadius: '1rem', marginTop: '0.5rem' }}>
                 Detected Mode: {detectedType}
               </div>
             )}
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
              onClick={(e) => { e.stopPropagation(); setStatus('idle'); setFile(null); setPreviewUrl(null); }}
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

