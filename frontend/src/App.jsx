import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './api/client';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import './index.css';
import InteractiveLeaf from './components/InteractiveLeaf';

function App() {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    }).catch(() => setSession(null));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return <div className="loading-screen">INITIALIZING<span className="loading-dots" /></div>;
  }

  return (
    <Router>
      <InteractiveLeaf side="left" />
      <InteractiveLeaf side="right" />
      <Routes>
        <Route path="/" element={!session ? <Login /> : <Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={session ? <Dashboard session={session} /> : <Navigate to="/" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
