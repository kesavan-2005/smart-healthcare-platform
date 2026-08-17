import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import Dashboard from './components/Dashboard';

export default function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const session = JSON.parse(localStorage.getItem('smartHealthUser'));
    if (session && session.loggedIn) {
      setUser(session);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('smartHealthUser');
    setUser(null);
  };

  return (
    <div>
      {!user ? (
        <Login onLogin={(u) => setUser(u)} />
      ) : (
        <Dashboard user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}
