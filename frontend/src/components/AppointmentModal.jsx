import React, { useState } from 'react';
import { X, Calendar as CalIcon, Clock } from 'lucide-react';

export default function AppointmentModal({ doctorName, user, onClose }) {
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [success, setSuccess] = useState(false);

  // Generate Dummy Doctors
  const doctorDB = {
    "Cardiologist": ["Dr. Sarah Chen", "Dr. Marcus Johnson", "Dr. Aarav Patel"],
    "Gastroenterologist": ["Dr. Emily Wong", "Dr. David Smith", "Dr. Elena Rodriguez"],
    "Neurologist": ["Dr. Robert Ford", "Dr. Alice Morgan"],
    "General Physician": ["Dr. James Wilson", "Dr. Lisa Cuddy", "Dr. Eric Foreman"],
    "Pulmonologist": ["Dr. John Watson", "Dr. Gregory House"],
    "Orthopedist": ["Dr. Stephen Strange", "Dr. Tony Stark"]
  };
  
  // Try to find a matching list, otherwise fallback to General Physician pool
  const availableDoctors = doctorDB[doctorName] || doctorDB["General Physician"];

  // Generate next 7 days
  const today = new Date();
  const dates = [];
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  
  for(let i=0; i<7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    dates.push({
      dayStr: days[d.getDay()],
      dateNum: d.getDate(),
      monthStr: months[d.getMonth()],
      fullDate: d.toDateString()
    });
  }

  const timeslots = ['09:00 AM', '10:30 AM', '02:00 PM', '04:15 PM'];

  const handleBook = () => {
    if(!selectedDoctor) {
      alert("Please select a specific doctor.");
      return;
    }
    if(!selectedDate || !selectedTime) {
      alert("Please select a date and time");
      return;
    }
    setSuccess(true);
    setTimeout(() => {
      onClose();
    }, 4000);
  };

  return (
    <div className="modal-overlay active">
      <div className="modal-content" style={{ maxWidth: '600px', background: '#0f172a' }}>
        <button onClick={onClose} style={{ position: 'absolute', right: '1.5rem', top: '1.5rem', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
          <X size={24} />
        </button>
        
        {!success ? (
          <>
            <h2 style={{ color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CalIcon /> Book Appointment
            </h2>
            <div style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Specialty Needed: <b style={{color: 'var(--primary)'}}>{doctorName}</b></div>
            
            <h4 style={{ color: 'white', marginBottom: '1rem' }}>1. Select a Specialist</h4>
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              {availableDoctors.map((doc, idx) => (
                <div 
                  key={idx} 
                  onClick={() => setSelectedDoctor(doc)}
                  className="hover-glow"
                  style={{ 
                    whiteSpace: 'nowrap', padding: '1rem 1.5rem', borderRadius: '0.8rem', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid',
                    borderColor: selectedDoctor === doc ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                    background: selectedDoctor === doc ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255,255,255,0.02)',
                    color: selectedDoctor === doc ? 'var(--primary)' : 'white'
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{doc}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>⭐ 4.{8 - (idx % 3)} Rating</div>
                </div>
              ))}
            </div>

            <h4 style={{ color: 'white', marginBottom: '1rem' }}>2. Select Date</h4>
            <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              {dates.map((d, i) => (
                <div 
                  key={i} 
                  onClick={() => setSelectedDate(d.fullDate)}
                  className="hover-glow"
                  style={{ 
                    minWidth: '80px', padding: '1rem', borderRadius: '0.8rem', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s', border: '1px solid',
                    borderColor: selectedDate === d.fullDate ? 'var(--primary)' : 'rgba(255,255,255,0.1)',
                    background: selectedDate === d.fullDate ? 'rgba(56, 189, 248, 0.1)' : 'rgba(255,255,255,0.02)',
                    color: selectedDate === d.fullDate ? 'var(--primary)' : 'white'
                  }}
                >
                  <div style={{ fontSize: '0.8rem' }}>{d.dayStr}</div>
                  <div style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0.2rem 0' }}>{d.dateNum}</div>
                  <div style={{ fontSize: '0.8rem' }}>{d.monthStr}</div>
                </div>
              ))}
            </div>

            {selectedDate && (
              <>
                <h4 style={{ color: 'white', marginBottom: '1rem' }}>Select Time Slot</h4>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
                  {timeslots.map((t, i) => (
                    <button 
                      key={i} 
                      onClick={() => setSelectedTime(t)}
                      style={{
                        padding: '0.8rem 1.2rem', borderRadius: '0.5rem', border: '1px solid var(--primary)', cursor: 'pointer', background: selectedTime === t ? 'var(--primary)' : 'transparent', color: selectedTime === t ? '#0c4a6e' : 'var(--primary)'
                      }}
                    >
                      <Clock size={14} style={{ display: 'inline', marginRight: '5px' }} /> {t}
                    </button>
                  ))}
                </div>
              </>
            )}

            <button className="primary-btn" style={{ width: '100%' }} onClick={handleBook}>Confirm Appointment</button>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ width: '60px', height: '60px', background: 'var(--success)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
              <CalIcon color="#000" size={30} />
            </div>
            <h2 style={{ color: 'white', marginBottom: '1rem' }}>Booking Confirmed!</h2>
            <p style={{ color: 'white', fontSize: '1.2rem', fontWeight: 600 }}>{selectedDoctor}</p>
            <p style={{ color: 'var(--text-muted)' }}>{doctorName}</p>
            <p style={{ color: 'var(--primary)', fontWeight: 600, margin: '1rem 0 1.5rem' }}>{selectedDate} at {selectedTime}</p>
            <div style={{ background: 'rgba(168, 85, 247, 0.15)', padding: '1rem', borderRadius: '0.5rem', color: '#e9d5ff' }}>
              📱 Notification sent to {user?.mobile || user?.email || 'your device'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
