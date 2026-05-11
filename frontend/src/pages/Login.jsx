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
        <motion.div initial={{opacity:0,y:40}} animate={{opacity:1,y:0}} transition={{delay:0.3,duration:1.2,ease:[0.16,1,0.3,1]}}
          style={{textAlign:'center',marginBottom:'5rem'}}>
          <h1 className="black-text" style={{fontSize:'clamp(3.5rem,10vw,6.5rem)',lineHeight:0.85,marginBottom:'2rem'}}>
            TRACK EVERY<br/>
            GOAL.
          </h1>
          <p className="black-text" style={{fontSize:'1.1rem',lineHeight:1.6,maxWidth:460,margin:'0 auto',fontFamily:'DM Mono',letterSpacing:'-0.01em'}}>
            AI-powered command center for conquering habits, destroying addictions, and becoming unstoppable.
          </p>
        </motion.div>

        {/* Card with high-contrast light glass */}
        <motion.div initial={{opacity:0,y:40,scale:0.98}} animate={{opacity:1,y:0,scale:1}} transition={{delay:0.6,duration:1}}>
          <div className="gradient-border" style={{ background:'white', padding:'2px' }}>
            <div ref={cardRef} className="light-glass" onMouseMove={handleTilt} onMouseLeave={resetTilt}
              style={{padding:'4rem 3.5rem',borderRadius:'22px',transition:'transform 0.2s'}}>
              
              <AnimatePresence mode="wait">
                {!sent?(
                  <motion.div key="form" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0,y:-20}}>
                    <div style={{textAlign:'center',marginBottom:'2.5rem'}}>
                      <p style={{color:'black',fontWeight:800,letterSpacing:'0.2em',fontSize:'0.7rem'}}>✉️ ACCESS_ID REQUIRED</p>
                    </div>
                    <form onSubmit={handleLogin} style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
                      <input type="email" className="input" placeholder="YOU@EXAMPLE.COM" value={email}
                        onChange={e=>setEmail(e.target.value)} required 
                        style={{textAlign:'center',fontSize:'1.1rem',background:'white',color:'black',borderColor:'black',borderWidth:'2px',borderRadius:'12px',fontWeight:700}}/>
                      <MagneticButton type="submit" className="btn" disabled={loading}
                        style={{width:'100%',background:'black',color:'white',borderRadius:'12px',padding:'1.2rem',fontWeight:800,fontSize:'1rem'}}>
                        {loading?'VERIFYING...':'ACTIVATE COMMAND CENTER →'}
                      </MagneticButton>
                    </form>
                    <div className="divider" style={{background:'rgba(0,0,0,0.1)',margin:'2.5rem 0'}}/>
                    <p style={{textAlign:'center',fontSize:'0.6rem',color:'black',opacity:0.6,fontWeight:700,letterSpacing:'0.1em'}}>ENCRYPTED MAGIC LINK ACCESS</p>
                  </motion.div>
                ):(
                  <motion.div key="sent" initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} style={{textAlign:'center',padding:'2rem 0'}}>
                    <h3 style={{fontSize:'2.5rem',marginBottom:'1rem',color:'black',fontWeight:900}}>LINK SENT</h3>
                    <p style={{color:'black',fontSize:'1.1rem',lineHeight:1.8,fontWeight:600}}>Check your inbox at:<br/><span style={{textDecoration:'underline'}}>{email}</span></p>
                    <button className="btn" onClick={()=>setSent(false)} style={{marginTop:'2.5rem',background:'black',color:'white',fontSize:'0.7rem',borderRadius:'8px'}}>RETRY EMAIL</button>
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
