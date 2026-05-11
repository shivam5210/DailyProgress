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
        <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:0.3,duration:0.7,ease:[0.16,1,0.3,1]}}
          style={{textAlign:'center',marginBottom:'3rem'}}>
          <div style={{position:'relative',display:'inline-block',marginBottom:'1rem'}}>
            <div style={{width:80,height:80,borderRadius:22,margin:'0 auto',
              background:'linear-gradient(135deg,rgba(188,255,71,0.15),rgba(0,229,204,0.15),rgba(155,127,255,0.15))',
              border:'1px solid rgba(188,255,71,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2.2rem',
              boxShadow:'0 0 60px rgba(188,255,71,0.12),inset 0 1px 0 rgba(255,255,255,0.1)'}}>🎯</div>
            <div style={{position:'absolute',inset:-6,borderRadius:28,border:'1px solid rgba(188,255,71,0.2)'}} className="pulse-ring"/>
            <div style={{position:'absolute',inset:-6,borderRadius:28,border:'1px solid rgba(0,229,204,0.15)',animationDelay:'0.8s'}} className="pulse-ring"/>
            <div style={{position:'absolute',inset:-6,borderRadius:28,border:'1px solid rgba(155,127,255,0.12)',animationDelay:'1.6s'}} className="pulse-ring"/>
          </div>
          <h1 className="black-text" style={{fontSize:'clamp(2.5rem,6vw,3.8rem)',lineHeight:1.05,marginBottom:'0.6rem'}}>
            <TypeWriter text="Track Every" speed={50}/>
            <br/>
            Goal.
          </h1>
          <p className="black-text" style={{fontSize:'0.95rem',lineHeight:1.8,maxWidth:340,margin:'0 auto',textShadow:'0 0 10px rgba(255,255,255,0.5)'}}>
            Your AI-powered command center for conquering habits, building momentum, and becoming unstoppable.
          </p>
        </motion.div>

        {/* Card with gradient animated border */}
        <motion.div initial={{opacity:0,y:30,scale:0.95}} animate={{opacity:1,y:0,scale:1}} transition={{delay:0.5,duration:0.7,ease:[0.16,1,0.3,1]}}>
          <div className="gradient-border" style={{ background:'linear-gradient(135deg,var(--fire),var(--amber),var(--lava))' }}>
            <div ref={cardRef} className="glass" onMouseMove={handleTilt} onMouseLeave={resetTilt}
              style={{padding:'2.8rem',transition:'transform 0.12s ease-out',willChange:'transform'}}>
              <AnimatePresence mode="wait">
                {!sent?(
                  <motion.div key="form" initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0,x:-30}}>
                    <div style={{textAlign:'center',marginBottom:'1.8rem'}}>
                      <p className="label black-text" style={{textShadow:'0 0 10px white'}}>✉️ &nbsp;No password needed — magic link login</p>
                    </div>
                    <form onSubmit={handleLogin} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                      <input type="email" className="input" placeholder="you@example.com" value={email}
                        onChange={e=>setEmail(e.target.value)} required style={{textAlign:'center',fontSize:'1.05rem',borderColor:'var(--fire)'}}/>
                      <MagneticButton type="submit" className="btn btn-fire" disabled={loading}
                        style={{width:'100%',padding:'1.1rem',fontSize:'0.95rem'}}>
                        <span style={{position:'absolute',top:0,left:'-100%',width:'50%',height:'100%',background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)',animation:'shine 2.5s ease-in-out infinite'}}/>
                        {loading?'⏳ Sending...':'⚡ Send Magic Link'}
                      </MagneticButton>
                    </form>
                    {error&&<motion.p initial={{opacity:0}} animate={{opacity:1}} style={{color:'var(--red)',marginTop:'1rem',textAlign:'center',fontSize:'0.82rem'}}>⚠️ {error}</motion.p>}
                    <div className="divider"/>
                    <p style={{textAlign:'center',color:'var(--muted)',fontSize:'0.74rem',letterSpacing:'0.05em'}}>No password · No credit card · Instant access</p>
                  </motion.div>
                ):(
                  <motion.div key="sent" initial={{opacity:0,scale:0.85}} animate={{opacity:1,scale:1}} style={{textAlign:'center',padding:'1.5rem 0'}}>
                    <motion.div animate={{y:[0,-12,0],rotate:[0,8,-8,0]}} transition={{duration:0.8}} style={{fontSize:'4.5rem',marginBottom:'1.2rem',display:'inline-block'}}>📬</motion.div>
                    <h3 style={{marginBottom:'0.6rem',fontSize:'1.5rem'}} className="black-text">Link Sent!</h3>
                    <p className="black-text" style={{fontSize:'0.92rem',lineHeight:1.8,textShadow:'0 0 8px white'}}>Check your inbox at<br/><strong style={{color:'black',fontSize:'1rem'}}>{email}</strong></p>
                    <button className="btn btn-ghost" onClick={()=>setSent(false)} style={{marginTop:'1.8rem'}}>← Different email</button>
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
