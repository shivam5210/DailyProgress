import { useState, useRef } from 'react';
import { supabase } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import ParticleCanvas from '../components/ParticleCanvas';

const FEATURES = [
  { icon:'🎯', label:'Dynamic Goals' },
  { icon:'🤖', label:'AI Analysis' },
  { icon:'📈', label:'Daily Tracking' },
  { icon:'📧', label:'100% Celebration' },
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const cardRef = useRef(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + '/dashboard' }
    });
    if (error) setError(error.message);
    else setSent(true);
    setLoading(false);
  };

  // 3D tilt on mouse move
  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
    cardRef.current.style.transform = `perspective(800px) rotateX(${y}deg) rotateY(${x}deg) scale(1.01)`;
  };
  const handleMouseLeave = () => {
    if (cardRef.current) cardRef.current.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
  };

  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'2rem', position:'relative', overflow:'hidden' }}>
      {/* Aurora + Particles */}
      <div className="aurora">
        <div className="aurora-layer" /><div className="aurora-layer" />
        <div className="aurora-layer" /><div className="aurora-layer" />
      </div>
      <ParticleCanvas />

      <motion.div initial={{ opacity:0, y:50 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.8, ease:[0.16,1,0.3,1] }}
        style={{ width:'100%', maxWidth:460, position:'relative', zIndex:2 }}>

        {/* Logo mark */}
        <motion.div initial={{ opacity:0, scale:0.5 }} animate={{ opacity:1, scale:1 }} transition={{ delay:0.1, type:'spring', stiffness:200 }}
          style={{ textAlign:'center', marginBottom:'2rem' }}>
          <div style={{ position:'relative', display:'inline-block' }}>
            <div style={{
              width:72, height:72, borderRadius:20, margin:'0 auto 1rem',
              background:'linear-gradient(135deg,rgba(188,255,71,0.18),rgba(155,127,255,0.18))',
              border:'1px solid rgba(188,255,71,0.25)',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'2rem',
              boxShadow:'0 0 40px rgba(188,255,71,0.15), inset 0 1px 0 rgba(255,255,255,0.1)'
            }}>🎯</div>
            {/* Pulse rings */}
            <div style={{ position:'absolute', inset:-4, borderRadius:24, border:'1px solid rgba(188,255,71,0.25)' }} className="pulse-ring" />
            <div style={{ position:'absolute', inset:-4, borderRadius:24, border:'1px solid rgba(188,255,71,0.15)', animationDelay:'0.6s' }} className="pulse-ring" />
          </div>

          <motion.h1 initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.25 }}
            style={{ fontSize:'3rem', lineHeight:1.05, marginBottom:'0.5rem' }}>
            AI Goal<br/>
            <span style={{ color:'var(--lime)', WebkitBackgroundClip:'text' }} className="glow-lime">Tracker.</span>
          </motion.h1>
          <motion.p initial={{ opacity:0 }} animate={{ opacity:1 }} transition={{ delay:0.35 }}
            style={{ color:'var(--muted)', fontSize:'0.92rem', lineHeight:1.75 }}>
            Define problems · Check in daily · Let AI track progress
          </motion.p>
        </motion.div>

        {/* Card with 3D tilt */}
        <motion.div ref={cardRef} className="glass glass-lime tilt" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
          initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4, duration:0.6, ease:[0.16,1,0.3,1] }}
          style={{ padding:'2.5rem', transition:'transform 0.15s ease', willChange:'transform' }}>

          <AnimatePresence mode="wait">
            {!sent ? (
              <motion.div key="form" initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0, x:-20 }}>
                <p className="label" style={{ textAlign:'center', marginBottom:'1.5rem' }}>
                  ✉️ &nbsp;Sign in with your email — no password needed
                </p>
                <form onSubmit={handleLogin} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                  <div style={{ position:'relative' }}>
                    <input type="email" className="input" placeholder="you@example.com"
                      value={email} onChange={e=>setEmail(e.target.value)} required
                      style={{ textAlign:'center', fontSize:'1.05rem', paddingRight:'1rem' }} />
                  </div>
                  <button type="submit" className="btn btn-lime" disabled={loading}
                    style={{ width:'100%', padding:'1.05rem', fontSize:'0.95rem', position:'relative', overflow:'hidden' }}>
                    {/* Shine sweep on load */}
                    {!loading && <span style={{
                      position:'absolute', top:0, left:'-100%', width:'60%', height:'100%',
                      background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)',
                      animation:'shine 2.5s ease-in-out infinite',
                    }} />}
                    {loading ? '⏳  Sending...' : '⚡  Send Magic Link'}
                  </button>
                </form>
                {error && (
                  <motion.p initial={{ opacity:0, y:5 }} animate={{ opacity:1, y:0 }}
                    style={{ color:'var(--red)', marginTop:'1rem', textAlign:'center', fontSize:'0.82rem' }}>
                    ⚠️ {error}
                  </motion.p>
                )}
                <div className="divider" />
                <p style={{ textAlign:'center', color:'var(--muted)', fontSize:'0.76rem' }}>
                  No password · No credit card · Instant access
                </p>
              </motion.div>
            ) : (
              <motion.div key="sent" initial={{ opacity:0, scale:0.9, y:20 }} animate={{ opacity:1, scale:1, y:0 }}
                style={{ textAlign:'center', padding:'1rem 0' }}>
                <motion.div animate={{ y:[0,-8,0], rotate:[0,5,-5,0] }} transition={{ duration:0.7 }}
                  style={{ fontSize:'4rem', marginBottom:'1.2rem', display:'inline-block' }}>📬</motion.div>
                <h3 style={{ color:'var(--lime)', marginBottom:'0.75rem', fontSize:'1.4rem' }} className="glow-lime">
                  Link sent!
                </h3>
                <p style={{ color:'var(--muted)', fontSize:'0.9rem', lineHeight:1.8 }}>
                  Check your inbox at<br/>
                  <strong style={{ color:'var(--text)', fontSize:'1rem' }}>{email}</strong>
                </p>
                <button className="btn btn-ghost" onClick={()=>setSent(false)} style={{ marginTop:'1.8rem', fontSize:'0.82rem' }}>
                  ← Different email
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Feature chips */}
        <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.65 }}
          style={{ display:'flex', gap:'0.5rem', justifyContent:'center', flexWrap:'wrap', marginTop:'1.8rem' }}>
          {FEATURES.map((f,i) => (
            <motion.span key={i} whileHover={{ scale:1.08, y:-2 }} style={{
              fontSize:'0.75rem', color:'var(--muted)',
              background:'rgba(255,255,255,0.035)', border:'1px solid var(--border)',
              padding:'0.3rem 0.9rem', borderRadius:999,
              cursor:'default', transition:'border-color 0.2s',
              display:'flex', alignItems:'center', gap:'0.35rem'
            }} onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(188,255,71,0.25)'}
               onMouseLeave={e=>e.currentTarget.style.borderColor='var(--border)'}>
              {f.icon} {f.label}
            </motion.span>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
