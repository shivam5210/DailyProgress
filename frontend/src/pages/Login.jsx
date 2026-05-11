import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '../api/client';
import { motion, AnimatePresence } from 'framer-motion';
import ParticleCanvas from '../components/ParticleCanvas';

function TypeWriter({ text, speed=60, delay=0 }) {
  const [displayed, setDisplayed] = useState('');
  useEffect(() => {
    let i=0; const t=setTimeout(()=>{
      const iv=setInterval(()=>{ setDisplayed(text.slice(0,++i)); if(i>=text.length) clearInterval(iv); },speed);
      return ()=>clearInterval(iv);
    },delay);
    return ()=>clearTimeout(t);
  },[text,speed,delay]);
  return <>{displayed}<span style={{ opacity:displayed.length<text.length?1:0, animation:'blink 0.8s step-end infinite' }}>|</span></>;
}

function MagneticButton({ children, ...props }) {
  const ref=useRef(null);
  const handleMove=useCallback(e=>{
    if(!ref.current) return;
    const rect=ref.current.getBoundingClientRect();
    const x=e.clientX-rect.left-rect.width/2, y=e.clientY-rect.top-rect.height/2;
    ref.current.style.transform=`translate(${x*0.2}px,${y*0.2}px) scale(1.04)`;
  },[]);
  const handleLeave=useCallback(()=>{if(ref.current) ref.current.style.transform='translate(0,0) scale(1)'},[]);
  return <button ref={ref} onMouseMove={handleMove} onMouseLeave={handleLeave} style={{ transition:'transform 0.2s ease-out', ...props.style }} {...props}>{children}</button>;
}

const FEATURES=['🎯 Dynamic Goals','🤖 AI Engine','📊 Live %','📧 100% Email','🌙 Dark Mode','⚡ Real-time'];

export default function Login() {
  const [email,setEmail]=useState(''); const [loading,setLoading]=useState(false);
  const [sent,setSent]=useState(false); const [error,setError]=useState('');
  const cardRef=useRef(null);

  const handleLogin=async(e)=>{
    e.preventDefault();setLoading(true);setError('');
    const{error}=await supabase.auth.signInWithOtp({email,options:{emailRedirectTo:window.location.origin+'/dashboard'}});
    error?setError(error.message):setSent(true);setLoading(false);
  };

  const handleTilt=e=>{
    if(!cardRef.current) return;
    const r=cardRef.current.getBoundingClientRect();
    const x=((e.clientX-r.left)/r.width-0.5)*18, y=((e.clientY-r.top)/r.height-0.5)*-18;
    cardRef.current.style.transform=`perspective(1000px) rotateX(${y}deg) rotateY(${x}deg) scale(1.02)`;
  };
  const resetTilt=()=>{if(cardRef.current) cardRef.current.style.transform='perspective(1000px) rotateX(0) rotateY(0) scale(1)'};

  return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'2rem', position:'relative' }}>
      <div className="mesh-bg"><div className="mesh-blob"/><div className="mesh-blob"/><div className="mesh-blob"/><div className="mesh-blob"/></div>
      <div className="grid-overlay"/>
      <ParticleCanvas/>

      <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:1}} style={{width:'100%',maxWidth:480,position:'relative',zIndex:2}}>
        {/* Floating status bar */}
        <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} transition={{delay:0.2}}
          style={{display:'flex',justifyContent:'center',marginBottom:'2.5rem'}}>
          <div style={{display:'flex',alignItems:'center',gap:'0.6rem',background:'rgba(255,255,255,0.03)',border:'1px solid var(--border)',borderRadius:999,padding:'0.4rem 1rem',backdropFilter:'blur(12px)'}}>
            <span className="status-dot" style={{background:'var(--lime)'}}/>
            <span style={{fontSize:'0.72rem',color:'var(--muted)',letterSpacing:'0.1em',fontFamily:'DM Mono'}}>SYSTEM ONLINE</span>
          </div>
        </motion.div>

        {/* Hero text */}
        <motion.div initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} transition={{delay:0.3,duration:1,ease:[0.16,1,0.3,1]}}
          style={{textAlign:'center',marginBottom:'4rem'}}>
          <h1 className="white-neon" style={{fontSize:'clamp(3rem,8vw,5.5rem)',lineHeight:0.9,marginBottom:'1.5rem',fontWeight:900,letterSpacing:'-0.05em'}}>
            Track Every<br/>
            <span style={{fontSize:'0.8em',opacity:0.9}}>Goal.</span>
          </h1>
          <p style={{color:'var(--muted)',fontSize:'1rem',lineHeight:1.8,maxWidth:420,margin:'0 auto',fontFamily:'DM Mono',letterSpacing:'-0.02em'}}>
            Your AI-powered command center for conquering habits, destroying addictions, building momentum, and becoming unstoppable.
          </p>
        </motion.div>

        {/* Card with gradient animated border */}
        <motion.div initial={{opacity:0,y:30,scale:0.98}} animate={{opacity:1,y:0,scale:1}} transition={{delay:0.5,duration:0.8}}>
          <div className="gradient-border" style={{ background:'linear-gradient(135deg,var(--fire),rgba(255,255,255,0.2),var(--lava))' }}>
            <div ref={cardRef} className="glass" onMouseMove={handleTilt} onMouseLeave={resetTilt}
              style={{padding:'3.5rem',transition:'transform 0.15s ease-out'}}>
              <AnimatePresence mode="wait">
                {!sent?(
                  <motion.div key="form" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0,x:-20}}>
                    <div style={{textAlign:'center',marginBottom:'2rem'}}>
                      <p className="hud-label" style={{fontSize:'0.7rem',color:'var(--text)',opacity:0.8}}>✉️ AUTH_MODE: MAGIC_LINK</p>
                    </div>
                    <form onSubmit={handleLogin} style={{display:'flex',flexDirection:'column',gap:'1.2rem'}}>
                      <input type="email" className="input" placeholder="you@example.com" value={email}
                        onChange={e=>setEmail(e.target.value)} required 
                        style={{textAlign:'center',fontSize:'1.1rem',background:'rgba(255,255,255,0.02)',borderColor:'rgba(255,255,255,0.1)'}}/>
                      <MagneticButton type="submit" className="btn btn-fire" disabled={loading}
                        style={{width:'100%',padding:'1.2rem',fontSize:'1rem'}}>
                        {loading?'INITIATING...':'⚡ ACCESS COMMAND CENTER'}
                      </MagneticButton>
                    </form>
                    <div className="divider" style={{opacity:0.3}}/>
                    <p style={{textAlign:'center',color:'var(--muted)',fontSize:'0.65rem',letterSpacing:'0.2em',textTransform:'uppercase'}}>SECURE_ENCRYPTED_ACCESS</p>
                  </motion.div>
                ):(
                  <motion.div key="sent" initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} style={{textAlign:'center',padding:'2rem 0'}}>
                    <h3 className="white-neon" style={{fontSize:'2rem',marginBottom:'1rem'}}>LINK_SENT</h3>
                    <p style={{color:'var(--muted)',fontSize:'0.95rem',lineHeight:1.8}}>DEPLOYED_TO:<br/><strong style={{color:'var(--text)'}}>{email}</strong></p>
                    <button className="btn btn-ghost" onClick={()=>setSent(false)} style={{marginTop:'2rem',fontSize:'0.7rem'}}>RETRY_CONNECTION</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* Feature chips */}
        <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{delay:0.8}}
          style={{display:'flex',gap:'0.4rem',justifyContent:'center',flexWrap:'wrap',marginTop:'2rem'}}>
          {FEATURES.map((f,i)=>(
            <motion.span key={i} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{delay:0.9+i*0.06}}
              whileHover={{scale:1.1,y:-3,borderColor:'rgba(188,255,71,0.3)'}}
              style={{fontSize:'0.72rem',color:'black',background:'rgba(255,255,255,0.03)',
                border:'1px solid var(--border)',padding:'0.3rem 0.8rem',borderRadius:999,cursor:'default',transition:'all 0.2s',textShadow:'0 0 5px white'}}>{f}</motion.span>
          ))}
        </motion.div>

        {/* Bottom brand line */}
        <motion.p initial={{opacity:0}} animate={{opacity:1}} transition={{delay:1.2}}
          style={{textAlign:'center',marginTop:'2.5rem',fontSize:'0.7rem',letterSpacing:'0.2em',color:'black',textTransform:'uppercase',fontFamily:'DM Mono',textShadow:'0 0 5px white'}}>
          Built with ❤️ for founders
        </motion.p>
      </motion.div>
    </div>
  );
}
