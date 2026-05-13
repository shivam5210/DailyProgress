import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
      <div className="loading-screen" style={{ background: 'var(--bg)', color: 'var(--lime)', height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1.5rem' }}>
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }} 
          animate={{ opacity: [0, 1, 0.5, 1], scale: [0.8, 1.1, 1] }} 
          transition={{ duration: 2, repeat: Infinity }}
          className="holo-text"
          style={{ fontSize: '1.5rem', letterSpacing: '0.4em' }}
        >
          GOD MODE INITIALIZING
        </motion.div>
        <div style={{ width: '200px', height: '2px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', overflow: 'hidden' }}>
          <motion.div 
            initial={{ left: '-100%' }} 
            animate={{ left: '100%' }} 
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            style={{ width: '100%', height: '100%', background: 'var(--lime)', position: 'relative', boxShadow: '0 0 15px var(--lime)' }}
          />
        </div>
        <p className="hud-label" style={{ opacity: 0.5 }}>Connecting to Core Intelligence...</p>
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