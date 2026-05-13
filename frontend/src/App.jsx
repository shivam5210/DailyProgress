import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './api/client';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './index.css';
import FullScreenLeaf from './components/FullScreenLeaf';

function App() {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    }).catch(() => setSession(null));

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div className="loading-screen" style={{ background: '#030308', color: '#BCFF47', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'DM Mono', fontSize: '1.2rem', letterSpacing: '0.2em' }}>
        INITIALIZING COMMAND CENTER...
      </div>
    );
  }

  return (
    <Router>
      <FullScreenLeaf />
      <Routes>
        <Route path="/" element={!session ? <Login /> : <Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={session ? <Dashboard session={session} /> : <Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;