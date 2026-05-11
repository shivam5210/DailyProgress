import { useState } from 'react';
import { supabase } from '../api/client';
import { motion } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + '/dashboard' }
    });
    if (error) {
      setError(error.message);
    } else {
      setSent(true);
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '1.5rem', position: 'relative', overflow: 'hidden' }}>
      {/* Background glow orbs */}
      <div style={{ position: 'absolute', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(188,255,71,0.07) 0%, transparent 70%)', top: '10%', left: '20%', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(155,127,255,0.07) 0%, transparent 70%)', bottom: '15%', right: '15%', pointerEvents: 'none' }} />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ width: '100%', maxWidth: 420 }}
      >
        {/* Logo / Brand */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 64, height: 64, borderRadius: 16, marginBottom: '1.2rem',
            background: 'linear-gradient(135deg, rgba(188,255,71,0.15), rgba(155,127,255,0.15))',
            border: '1px solid rgba(188,255,71,0.2)',
            fontSize: '2rem'
          }}>🎯</div>
          <h1 style={{ fontSize: '2rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>AI Goal Tracker</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Define your problems. Let the AI track your journey. Celebrate every win.
          </p>
        </div>

        {/* Card */}
        <div className="glass" style={{ padding: '2rem' }}>
          {!sent ? (
            <>
              <p className="label" style={{ textAlign: 'center', marginBottom: '1.2rem' }}>Enter your email to continue</p>
              <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <input
                  type="email"
                  className="input"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{ textAlign: 'center', fontSize: '1rem' }}
                />
                <button type="submit" className="btn btn-lime" disabled={loading} style={{ width: '100%', fontSize: '1rem', padding: '1rem' }}>
                  {loading ? '⏳ Sending...' : '✉️ Send Magic Link'}
                </button>
              </form>
              {error && <p style={{ color: 'var(--accent-red)', marginTop: '1rem', textAlign: 'center', fontSize: '0.85rem' }}>{error}</p>}
            </>
          ) : (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📬</div>
              <h3 style={{ color: 'var(--accent-lime)', marginBottom: '0.5rem' }}>Check your inbox!</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
                We sent a magic link to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.<br />
                Click it to sign in instantly.
              </p>
              <button className="btn btn-ghost" onClick={() => setSent(false)} style={{ marginTop: '1.5rem' }}>
                ← Use a different email
              </button>
            </motion.div>
          )}
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.78rem' }}>
          No password required. No credit card. Just results.
        </p>
      </motion.div>
    </div>
  );
}
