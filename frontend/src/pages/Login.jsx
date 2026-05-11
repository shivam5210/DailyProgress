import { useState } from 'react';
import { supabase } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true); setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + '/dashboard' }
    });
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'1.5rem', position:'relative' }}>
      {/* Animated orbs */}
      <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />

      <motion.div initial={{ opacity:0, y:40, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} transition={{ duration:0.7, ease:[0.16,1,0.3,1] }}
        style={{ width:'100%', maxWidth:440, position:'relative', zIndex:2 }}>

        {/* Top badge */}
        <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.2 }}
          style={{ textAlign:'center', marginBottom:'2rem' }}>
          <span className="badge" style={{ background:'var(--lime-dim)', color:'var(--lime)', border:'1px solid rgba(188,255,71,0.2)' }}>
            ⚡ AI-Powered Goal Tracker
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }}
          style={{ textAlign:'center', marginBottom:'2.5rem' }}>
          <h1 style={{ fontSize:'3rem', color:'var(--text)', marginBottom:'0.5rem', lineHeight:1.1 }}>
            Track Every<br/><span style={{ color:'var(--lime)' }} className="glow-text">Goal.</span>
          </h1>
          <p style={{ color:'var(--muted)', fontSize:'0.95rem', lineHeight:1.7, maxWidth:320, margin:'0 auto' }}>
            Define your problems. Check in daily. Let AI calculate your real progress.
          </p>
        </motion.div>

        {/* Card */}
        <motion.div className="glass glass-lime" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }}
          style={{ padding:'2.5rem' }}>
          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.div key="form" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}>
                <p className="label" style={{ textAlign:'center', marginBottom:'1.5rem' }}>Sign in with your email</p>
                <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                  <input type="email" className="input" placeholder="you@example.com" value={email}
                    onChange={(e) => setEmail(e.target.value)} required
                    style={{ textAlign:'center', fontSize:'1.05rem', letterSpacing:'0.02em' }} />
                  <button type="submit" className="btn btn-lime" disabled={loading} style={{ width:'100%', padding:'1rem', fontSize:'0.95rem' }}>
                    {loading ? '⏳ Sending link...' : '✉️  Send Magic Link'}
                  </button>
                </form>
                {error && (
                  <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }}
                    style={{ color:'var(--red)', marginTop:'1rem', textAlign:'center', fontSize:'0.82rem' }}>
                    ⚠️ {error}
                  </motion.p>
                )}
                <div className="divider" />
                <p style={{ textAlign:'center', color:'var(--muted)', fontSize:'0.78rem', lineHeight:1.6 }}>
                  No password · No credit card · Just results
                </p>
              </motion.div>
            ) : (
              <motion.div key="sent" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} style={{ textAlign:'center', padding:'1rem 0' }}>
                <motion.div animate={{ rotate:[0,10,-10,0], scale:[1,1.1,1] }} transition={{ duration:0.6 }}
                  style={{ fontSize:'3.5rem', marginBottom:'1.2rem', display:'inline-block' }}>📬</motion.div>
                <h3 style={{ color:'var(--lime)', marginBottom:'0.75rem', fontSize:'1.3rem' }}>Magic link sent!</h3>
                <p style={{ color:'var(--muted)', fontSize:'0.9rem', lineHeight:1.7 }}>
                  Check your inbox at<br/>
                  <strong style={{ color:'var(--text)', display:'block', marginTop:'0.3rem' }}>{email}</strong>
                </p>
                <button className="btn btn-ghost" onClick={() => setSent(false)} style={{ marginTop:'1.5rem', fontSize:'0.82rem' }}>
                  ← Use different email
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Feature pills */}
        <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.6 }}
          style={{ display:'flex', gap:'0.6rem', justifyContent:'center', flexWrap:'wrap', marginTop:'2rem' }}>
          {['🎯 Dynamic Goals','🤖 AI Analysis','📧 100% Celebration','📈 Daily Tracking'].map((f,i) => (
            <span key={i} style={{ fontSize:'0.75rem', color:'var(--muted)', background:'rgba(255,255,255,0.04)', border:'1px solid var(--border)', padding:'0.3rem 0.8rem', borderRadius:999 }}>{f}</span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
