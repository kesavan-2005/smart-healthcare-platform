import React, { useState } from 'react';
import { Stethoscope } from 'lucide-react';

export default function Login({ onLogin }) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [formData, setFormData] = useState({
    fullname: '',
    mobile: '',
    email: '',
    password: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    let name = "Patient User";
    let mobile = "+91 0000000000";

    if (!isLoginMode) {
      name = formData.fullname;
      mobile = formData.mobile;
    } else {
      const existing = JSON.parse(localStorage.getItem('smartHealthUser'));
      if(existing) {
        name = existing.name;
        mobile = existing.mobile;
      }
    }

    const userData = {
      name,
      email: formData.email,
      mobile,
      loggedIn: true
    };
    
    localStorage.setItem('smartHealthUser', JSON.stringify(userData));
    onLogin(userData);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', width: '100%', padding: '1rem' }}>
      <div className="card" style={{ maxWidth: '450px', width: '100%', animation: 'slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Stethoscope size={48} color="var(--primary)" style={{ filter: 'drop-shadow(0 0 15px rgba(56, 189, 248, 0.5))', marginBottom: '1rem' }} />
          <h2 className="logo-text" style={{ fontSize: '1.8rem' }}>SmartHealth AI</h2>
          <p style={{ color: 'var(--text-muted)' }}>Intelligent Diagnostic Platform</p>
        </div>

        <form onSubmit={handleSubmit} className="input-container">
          {!isLoginMode && (
            <>
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Full Name</label>
                <input required type="text" placeholder="e.g. John Doe" value={formData.fullname} onChange={e => setFormData({...formData, fullname: e.target.value})} />
              </div>
              <div style={{ marginBottom: '1.2rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Mobile Number</label>
                <input required type="tel" placeholder="+91 9876543210" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
              </div>
            </>
          )}

          <div style={{ marginBottom: '1.2rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Email Address</label>
            <input required type="email" placeholder="name@domain.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          
          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Password</label>
            <input required type="password" placeholder="••••••••" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>

          <button type="submit" className="primary-btn" style={{ width: '100%' }}>
            {isLoginMode ? 'Sign In' : 'Register & Secure Profile'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isLoginMode ? 'New to SmartHealth? ' : 'Already have an account? '}
            <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 600 }} onClick={() => setIsLoginMode(!isLoginMode)}>
              {isLoginMode ? 'Create an Account' : 'Sign In Here'}
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
