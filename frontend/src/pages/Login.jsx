import { supabase } from '../api/client';
import { motion } from 'framer-motion';

export default function Login() {
  const handleGoogleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: window.location.origin + '/dashboard'
      }
    });
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
        <button className="btn-primary" onClick={handleGoogleLogin} style={{ width: '100%' }}>
          SIGN IN WITH GOOGLE
        </button>
      </motion.div>
    </div>
  );
}
