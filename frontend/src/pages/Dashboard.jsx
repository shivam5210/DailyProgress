import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import ParticleCanvas from '../components/ParticleCanvas';
import CountUp from '../components/CountUp';

const C=['#BCFF47','#00E5CC','#9B7FFF','#FF6B2B','#3DFF8F'];
const CD=['rgba(188,255,71,0.07)','rgba(0,229,204,0.07)','rgba(155,127,255,0.07)','rgba(255,107,43,0.07)','rgba(61,255,143,0.07)'];

function Ring({value=0,color='#BCFF47',size=110}){
  const sw=size*0.08,r=(size-sw)/2,circ=2*Math.PI*r,off=circ-(Math.min(value,100)/100)*circ;
  return(
    <svg width={size} height={size} style={{display:'block',margin:'0 auto'}}>
      <defs><filter id={`g-${color.replace('#','')}`}><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={sw}/>
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
        strokeLinecap="round" strokeDasharray={circ}
        initial={{strokeDashoffset:circ}} animate={{strokeDashoffset:off}}
        transition={{duration:1.8,ease:[0.16,1,0.3,1]}}
        style={{transform:'rotate(-90deg)',transformOrigin:'center'}}
        filter={`url(#g-${color.replace('#','')})`}/>
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        style={{fontFamily:'Outfit',fontWeight:800,fontSize:size*0.22,fill:color,filter:`drop-shadow(0 0 8px ${color}88)`}}>{value}%</text>
    </svg>
  );
}

function Clock(){
  const [t,setT]=useState(new Date());
  useEffect(()=>{const i=setInterval(()=>setT(new Date()),1000);return()=>clearInterval(i)},[]);
  return <span style={{fontFamily:'DM Mono',fontSize:'0.78rem',color:'var(--muted)',letterSpacing:'0.12em'}}>{t.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</span>
}

export default function Dashboard({session}){
  const [goals,setGoals]=useState([]);
  const [checkins,setCheckins]=useState([]);
  const [loadingGoals,setLoadingGoals]=useState(true);
  const [activeTab,setActiveTab]=useState('today');
  const [aiResult,setAiResult]=useState(null);
  const [aiLoading,setAiLoading]=useState(false);
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);
  const [showOnboard,setShowOnboard]=useState(false);
  const [problemsText,setProblemsText]=useState('');
  const [onboardLoading,setOnboardLoading]=useState(false);
  const [logs,setLogs]=useState({});
  const [mood,setMood]=useState(3);
  const [journal,setJournal]=useState('');
  const [toast,setToast]=useState(null);
  const [error,setError]=useState(null);
  const loaded=useRef(false);

  const user=session?.user;
  const name=user?.user_metadata?.full_name?.split(' ')[0]||user?.email?.split('@')[0]||'Founder';
  const overall=goals.length?Math.round(goals.reduce((a,g)=>a+(g.current_progress||0),0)/goals.length):0;

  useEffect(()=>{if(loaded.current)return;loaded.current=true;loadAll()},[]);

  async function loadAll(){
    setLoadingGoals(true);
    setError(null);
    try{
      const [gr,cr]=await Promise.all([
        api.get('/goals').catch(err=>{
          console.error('Goals fetch error:', err.message);
          return {data:[]};
        }),
        api.get('/checkins').catch(err=>{
          console.error('Checkins fetch error:', err.message);
          return {data:[]};
        })
      ]);
      setGoals(gr.data||[]);
      setCheckins(cr.data||[]);
      if(!(gr.data||[]).length)setShowOnboard(true);
    } catch(err){
      setError(err.message);
      showT('Failed to load data','red');
    } finally{
      setLoadingGoals(false);
    }
  }

  async function handleOnboard(e){
    e.preventDefault();
    setOnboardLoading(true);
    setError(null);
    try{
      for(const line of problemsText.split('\n').map(l=>l.trim()).filter(Boolean)){
        await api.post('/goals',{title:line,description:'',goal_type:'reduce'}).catch(err=>{
          console.error('Goal creation error:', err.message);
        });
      }
      showT('Goals locked in! Let\'s go 🚀','lime');
      setShowOnboard(false);
      await loadAll();
    } catch(err){
      setError(err.message);
      showT('Error setting up goals','red');
    } finally{
      setOnboardLoading(false);
    }
  }

  async function handleCheckin(){
    if(!goals.length){
      showT('No goals to check in','red');
      return;
    }
    setSaving(true);
    setError(null);
    try{
      await api.post('/checkins',{
        date:new Date().toISOString().split('T')[0],
        mood,
        journal_note:journal,
        logs:goals.map(g=>({goal_id:g.id,value:logs[g.id]||0}))
      });
      setSaved(true);
      showT('✅ Check-in saved!','lime');
      setTimeout(()=>setSaved(false),3500);
      await loadAll();
    } catch(err){
      setError(err.message);
      showT('Error saving check-in','red');
    } finally{
      setSaving(false);
    }
  }

  async function handleRunAI(){
    setAiLoading(true);
    setActiveTab('ai');
    setError(null);
    try{
      const{data}=await api.post('/engine/analyze');
      setAiResult(data);
      const{data:u}=await api.get('/goals');
      setGoals(u||[]);
      showT('AI analysis complete ⚡','lime');
    } catch(err){
      setError(err.message);
      showT('AI analysis failed','red');
    } finally{
      setAiLoading(false);
    }
  }

  function showT(msg,type='lime'){
    setToast({msg,type});
    setTimeout(()=>setToast(null),3500);
  }

  if(!user){
    return(
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',color:'var(--text)'}}>
        <div style={{textAlign:'center'}}>
          <h2>Please log in to continue</h2>
          <p>Session not available</p>
        </div>
      </div>
    );
  }

  return(
    <div style={{minHeight:'100vh',position:'relative'}}>
      <div className="mesh-bg"><div className="mesh-blob"/><div className="mesh-blob"/><div className="mesh-blob"/><div className="mesh-blob"/></div>
      <div className="grid-overlay"/><ParticleCanvas/>

      {/* Toast */}
      <AnimatePresence>{toast&&(
        <motion.div className="toast" initial={{opacity:0,y:-40,scale:0.85}} animate={{opacity:1,y:0,scale:1}} exit={{opacity:0,y:-20}}
          style={{background:toast.type==='lime'?'linear-gradient(135deg,#BCFF47,#8EE800)':'linear-gradient(135deg,#FF4757,#FF1E30)',color:toast.type==='lime'?'#030308':'#fff'}}>
          {toast.msg}</motion.div>
      )}</AnimatePresence>

      {/* Error Alert */}
      <AnimatePresence>{error&&(
        <motion.div initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} exit={{opacity:0}}
          style={{position:'fixed',top:20,left:20,right:20,background:'rgba(255,71,87,0.9)',color:'white',padding:'1rem',borderRadius:8,zIndex:1000,maxWidth:400}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            <span>⚠️ {error}</span>
            <button onClick={()=>setError(null)} style={{background:'none',border:'none',color:'white',cursor:'pointer',fontSize:'1.2rem'}}>
              ✕
            </button>
          </div>
        </motion.div>
      )}</AnimatePresence>

      <div style={{maxWidth:1040,margin:'0 auto',padding:'2rem 1.5rem 5rem',position:'relative',zIndex:1}}>
        {/* Header */}
        <motion.header initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} transition={{duration:0.7}}
          style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'2.5rem',flexWrap:'wrap',gap:'1.2rem'}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:'0.8rem',marginBottom:'0.4rem'}}>
              <div style={{width:44,height:44,borderRadius:14,background:'linear-gradient(135deg,rgba(188,255,71,0.15),rgba(0,229,204,0.1))',border:'1px solid rgba(188,255,71,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.3rem',boxShadow:'0 0 24px rgba(188,255,71,0.1)'}}>🎯</div>
              <div>
                <h1 style={{fontSize:'1.7rem',lineHeight:1}}>Hey, <span style={{color:'#BCFF47'}}>{name}</span></h1>
                <div style={{display:'flex',alignItems:'center',gap:'1rem',marginTop:'0.3rem'}}>
                  <p className="label">{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</p>
                  <Clock/>
                  <span className="status-dot" style={{background:'var(--lime)'}}/>
                </div>
              </div>
            </div>
          </div>
          <div style={{display:'flex',gap:'0.8rem',alignItems:'stretch'}}>
            {/* Stats */}
            <div className="gradient-border" style={{borderRadius:18,padding:1}}>
              <div className="glass" style={{padding:'1rem 1.5rem',textAlign:'center',borderRadius:17}}>
                <div className="num glow-lime" style={{fontSize:'2.5rem',color:'var(--lime)'}}><CountUp target={overall} suffix="%"/></div>
                <div className="label">Overall</div>
              </div>
            </div>
            <div className="glass" style={{padding:'1rem 1.5rem',textAlign:'center'}}>
              <div className="num" style={{fontSize:'2.5rem',color:'var(--orange)'}}>🔥<CountUp target={checkins.length}/></div>
              <div className="label">Streak</div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
              <button className="btn btn-lime" onClick={handleRunAI} disabled={aiLoading} style={{padding:'0.65rem 1.2rem',fontSize:'0.76rem'}}>
                {aiLoading?'⏳':'⚡'} AI Analysis</button>
            </div>
          </div>
        </motion.header>

        {/* Goal Cards */}
        {loadingGoals?(
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'1rem',marginBottom:'2.5rem'}}>
            {[1,2,3,4].map(i=><div key={i} className="sk" style={{height:160}}/>) }
          </div>
        ):goals.length>0&&(
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'1rem',marginBottom:'2.5rem'}}>
            {goals.map((goal,i)=>(
              <motion.div key={goal.id} initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{delay:i*0.08}}
                whileHover={{scale:1.04,translateY:-8}} className="glass"
                style={{padding:'1.5rem',background:CD[i%5],borderColor:`${C[i%5]}25`,cursor:'default',position:'relative'}}>
                {(goal.current_progress||0)>=100&&<span className="floating-badge" style={{background:C[i%5],color:'#030308'}}>🏆 DONE</span>}
                <p className="label" style={{color:C[i%5],marginBottom:'0.5rem'}}>Goal {i+1}</p>
                <p style={{fontSize:'0.82rem',fontWeight:500,lineHeight:1.5,marginBottom:'1rem',minHeight:40}}>{goal.title}</p>
                <div className="num" style={{fontSize:'2.8rem',color:C[i%5],textShadow:`0 0 24px ${C[i%5]}80`}}>
                  <CountUp target={goal.current_progress||0} suffix="%"/></div>
                <div className="pbar" style={{marginTop:'0.8rem'}}>
                  <motion.div className="pbar-fill" initial={{width:0}} animate={{width:`${goal.current_progress||0}%`}}
                    transition={{duration:1.6,ease:[0.16,1,0.3,1]}}
                    style={{background:`linear-gradient(90deg,${C[i%5]}88,${C[i%5]})`,boxShadow:`0 0 10px ${C[i%5]}`}}/>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Tabs & Content - Simplified for brevity */}
        <div style={{marginBottom:'1.8rem'}}>
          <div className="tab-bar">
            {[{id:'today',l:'📋 Today'},{id:'history',l:'📈 History'},{id:'ai',l:'🤖 AI'}].map(t=>(
              <button key={t.id} className={`tab ${activeTab===t.id?'active':''}`} onClick={()=>setActiveTab(t.id)}>{t.l}</button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.25}}>
            {activeTab==='today'&&(
              <div className="gradient-border">
                <div className="glass" style={{padding:'2.5rem'}}>
                  {goals.length===0?(
                    <div style={{textAlign:'center',padding:'3rem'}}>
                      <p style={{color:'var(--muted)',marginBottom:'1.5rem'}}>No goals yet.</p>
                      <button className="btn btn-lime" onClick={()=>setShowOnboard(true)}>+ Set Up Goals</button>
                    </div>
                  ):(
                    <div style={{display:'flex',flexDirection:'column',gap:'2rem'}}>
                      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
                        <h2 style={{fontSize:'1.3rem'}}>📋 Daily Check-in</h2>
                        {saved&&<span className="badge" style={{background:'rgba(188,255,71,0.08)',color:'var(--lime)',border:'1px solid rgba(188,255,71,0.2)'}}>✅ Saved</span>}
                      </div>
                      {goals.map((goal,i)=>(
                        <motion.div key={goal.id} initial={{opacity:0,x:-16}} animate={{opacity:1,x:0}} transition={{delay:i*0.07}}
                          style={{padding:'1.5rem',background:CD[i%5],borderRadius:18,border:`1px solid ${C[i%5]}20`}}>
                          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'1rem'}}>
                            <label className="label" style={{color:C[i%5],fontSize:'0.75rem'}}>{goal.title}</label>
                            <span className="num" style={{fontSize:'1.6rem',color:C[i%5],textShadow:`0 0 16px ${C[i%5]}`}}>{logs[goal.id]||0}%</span>
                          </div>
                          <input type="range" min={0} max={100} value={logs[goal.id]||0}
                            onChange={e=>setLogs(p=>({...p,[goal.id]:parseInt(e.target.value)}))} style={{width:'100%'}}/>
                        </motion.div>
                      ))}
                      <div>
                        <label className="label" style={{display:'block',marginBottom:'1rem'}}>Mood</label>
                        <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>
                          {['😔','😐','🙂','😊','🔥'].map((e,i)=>(
                            <motion.button key={i} whileHover={{scale:1.25}} whileTap={{scale:0.85}} onClick={()=>setMood(i+1)}
                              style={{fontSize:'1.8rem',width:56,height:56,borderRadius:16,border:`2px solid ${mood===i+1?'var(--lime)':'var(--border)'}`,background:mood===i+1?'rgba(188,255,71,0.08)':'transparent',cursor:'pointer',boxShadow:mood===i+1?'0 0 24px rgba(188,255,71,0.35)':'none',transition:'all 0.2s'}}>{e}</motion.button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="label" style={{display:'block',marginBottom:'0.6rem'}}>Journal & Thoughts</label>
                        <textarea className="input" rows={3} value={journal} onChange={e=>setJournal(e.target.value)}
                          placeholder="What did you build today? Wins, struggles, thoughts..."/>
                      </div>
                      <motion.button className="btn btn-lime" onClick={handleCheckin} disabled={saving||saved}
                        whileHover={{scale:1.04}} whileTap={{scale:0.96}}
                        style={{alignSelf:'flex-start',padding:'1rem 2.5rem',fontSize:'0.95rem'}}>
                        {saved?'✅ Saved!':saving?'⏳ Saving...':'💾 Save Check-in'}
                      </motion.button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Onboarding Modal */}
      <AnimatePresence>{showOnboard&&(
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          style={{position:'fixed',inset:0,background:'rgba(3,3,8,0.94)',backdropFilter:'blur(16px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999,padding:'1.5rem'}}>
          <motion.div initial={{scale:0.8,y:50}} animate={{scale:1,y:0}} exit={{scale:0.9,opacity:0}} transition={{type:'spring',stiffness:180,damping:20}}>
            <div className="gradient-border">
              <div className="glass" style={{maxWidth:540,width:'100%',padding:'3rem'}}>
                <div style={{fontSize:'3.5rem',marginBottom:'1rem'}}>👋</div>
                <h2 style={{fontSize:'2rem',marginBottom:'0.5rem'}}>Welcome, <span style={{color:'#BCFF47'}}>{name}!</span></h2>
                <p style={{color:'var(--muted)',lineHeight:1.85,marginBottom:'2rem',fontSize:'0.92rem'}}>
                  List your <strong style={{color:'var(--text)'}}>4–5 problems</strong> you want to crush. One per line.
                </p>
                <form onSubmit={handleOnboard} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                  <textarea className="input" rows={7} required value={problemsText} onChange={e=>setProblemsText(e.target.value)}
                    placeholder={"Quit smoking (20/day)\nQuit weed\nBuild startup contacts\nShip daily\nGym 5x/week"}/>
                  <button type="submit" className="btn btn-lime" disabled={onboardLoading} style={{padding:'1.1rem',fontSize:'0.95rem'}}>
                    {onboardLoading?'⏳ Setting up...':'🚀 Start Tracking'}
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>
    </div>
  );
}