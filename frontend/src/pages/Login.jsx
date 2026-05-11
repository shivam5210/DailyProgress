import { useState } from 'react';
import { supabase } from '../api/client';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setMessage('');
    
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin + '/dashboard'
      }
    });
    
    if (error) {
      setMessage('Error: ' + error.message);
    } else {
      setMessage('Check your email for the magic login link!');
    }
    setLoading(false);
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-void)' }}>
      <motion.div 
        className="glass-card"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: 'center', maxWidth: '400px', width: '100%' }}
      >
        <h1 style={{ color: 'var(--accent-lime)', marginBottom: '1rem', fontSize: '2rem' }}>AI GOAL TRACKER</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Define your problems. Let the AI calculate your trajectory. Complete them.
        </p>
        
        <form onSubmit={handleEmailLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <input 
            type="email" 
            placeholder="Enter your email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input-field"
            required
            style={{ textAlign: 'center', fontSize: '1.1rem' }}
          />
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'SENDING...' : 'SEND MAGIC LINK'}
          </button>
        </form>
        {message && (
          <p style={{ marginTop: '1.5rem', color: message.includes('Error') ? 'var(--accent-orange)' : 'var(--accent-lime)' }}>
            {message}
          </p>
        )}
      </motion.div>
    </div>
  );
}
