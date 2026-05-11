import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, api } from '../api/client';
import ParticleCanvas from '../components/ParticleCanvas';
import CountUp from '../components/CountUp';
import BurningLeaf from '../components/BurningLeaf';

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
  return <span style={{fontFamily:'DM Mono',fontSize:'0.78rem',color:'var(--muted)',letterSpacing:'0.12em'}}>{t.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</span>;
}

export default function Dashboard({session}){
  const [goals,setGoals]=useState([]);const [checkins,setCheckins]=useState([]);
  const [loadingGoals,setLoadingGoals]=useState(true);const [activeTab,setActiveTab]=useState('today');
  const [aiResult,setAiResult]=useState(null);const [aiLoading,setAiLoading]=useState(false);
  const [saving,setSaving]=useState(false);const [saved,setSaved]=useState(false);
  const [showOnboard,setShowOnboard]=useState(false);const [problemsText,setProblemsText]=useState('');
  const [onboardLoading,setOnboardLoading]=useState(false);
  const [logs,setLogs]=useState({});const [mood,setMood]=useState(3);const [journal,setJournal]=useState('');
  const [toast,setToast]=useState(null);const loaded=useRef(false);

  const user=session.user;
  const name=user.user_metadata?.full_name?.split(' ')[0]||user.email?.split('@')[0]||'Founder';
  const overall=goals.length?Math.round(goals.reduce((a,g)=>a+(g.current_progress||0),0)/goals.length):0;

  useEffect(()=>{if(loaded.current)return;loaded.current=true;loadAll()},[]);

  async function loadAll(){
    setLoadingGoals(true);
    const [gr,cr]=await Promise.all([api.get('/goals').catch(()=>({data:[]})),api.get('/checkins').catch(()=>({data:[]}))]);
    setGoals(gr.data||[]);setCheckins(cr.data||[]);
    if(!(gr.data||[]).length)setShowOnboard(true);
    setLoadingGoals(false);
  }

  async function handleOnboard(e){
    e.preventDefault();setOnboardLoading(true);
    for(const line of problemsText.split('\n').map(l=>l.trim()).filter(Boolean))
      await api.post('/goals',{title:line,description:'',goal_type:'reduce'}).catch(()=>{});
    showT('Goals locked in! Let\'s go 🚀','lime');setShowOnboard(false);await loadAll();setOnboardLoading(false);
  }

  async function handleCheckin(){
    if(!goals.length)return;setSaving(true);
    try{
      await api.post('/checkins',{date:new Date().toISOString().split('T')[0],mood,journal_note:journal,
        logs:goals.map(g=>({goal_id:g.id,value:logs[g.id]||0}))});
      setSaved(true);showT('✅ Check-in saved!','lime');
    }catch{showT('Error saving','red');}setSaving(false);
  }

  async function handleRunAI(){
    setAiLoading(true);setActiveTab('ai');
    try{const{data}=await api.post('/engine/analyze');setAiResult(data);
      const{data:u}=await api.get('/goals');setGoals(u||[]);showT('AI analysis complete ⚡','lime');
    }catch{showT('AI analysis failed','red');}setAiLoading(false);
  }

  function showT(msg,type='lime'){setToast({msg,type});setTimeout(()=>setToast(null),3500)}

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

      {/* Onboarding */}
      <AnimatePresence>{showOnboard&&(
        <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}
          style={{position:'fixed',inset:0,background:'rgba(3,3,8,0.94)',backdropFilter:'blur(16px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:999,padding:'1.5rem'}}>
          <motion.div initial={{scale:0.8,y:50}} animate={{scale:1,y:0}} exit={{scale:0.9,opacity:0}} transition={{type:'spring',stiffness:180,damping:20}}>
            <div className="gradient-border">
              <div className="glass" style={{maxWidth:540,width:'100%',padding:'3rem'}}>
                <div style={{fontSize:'3.5rem',marginBottom:'1rem'}}>👋</div>
                <h2 style={{fontSize:'2rem',marginBottom:'0.5rem'}}>Welcome, <span className="holo-text">{name}!</span></h2>
                <p style={{color:'var(--muted)',lineHeight:1.85,marginBottom:'2rem',fontSize:'0.92rem'}}>
                  List your <strong style={{color:'var(--text)'}}>4–5 problems</strong> you want to crush. One per line.
                </p>
                <form onSubmit={handleOnboard} style={{display:'flex',flexDirection:'column',gap:'1rem'}}>
                  <textarea className="input" rows={7} required value={problemsText} onChange={e=>setProblemsText(e.target.value)}
                    placeholder={"Quit smoking (20/day)\nQuit weed\nBuild startup contacts\nShip vsquaree daily\nGym 5x/week"}/>
                  <button type="submit" className="btn btn-lime" disabled={onboardLoading} style={{padding:'1.1rem',fontSize:'0.95rem'}}>
                    {onboardLoading?'⏳ Setting up...':'🚀 Start Tracking'}</button>
                </form>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}</AnimatePresence>

      <div style={{maxWidth:1040,margin:'0 auto',padding:'2rem 1.5rem 5rem',position:'relative',zIndex:1}}>

        {/* ── HEADER ── */}
        <motion.header initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}} transition={{duration:0.7}}
          style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'2.5rem',flexWrap:'wrap',gap:'1.2rem'}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:'0.8rem',marginBottom:'0.4rem'}}>
              <div style={{width:44,height:44,borderRadius:14,background:'linear-gradient(135deg,rgba(188,255,71,0.15),rgba(0,229,204,0.1))',
                border:'1px solid rgba(188,255,71,0.2)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.3rem',
                boxShadow:'0 0 24px rgba(188,255,71,0.1)'}}>🎯</div>
              <div>
                <h1 style={{fontSize:'1.7rem',lineHeight:1}}>Hey, <span className="holo-text">{name}</span></h1>
                <div style={{display:'flex',alignItems:'center',gap:'1rem',marginTop:'0.3rem'}}>
                  <p className="label">{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</p>
                  <Clock/>
                  <span className="status-dot" style={{background:'var(--lime)'}}/>
                </div>
              </div>
            </div>
          </div>
          <div style={{display:'flex',gap:'0.8rem',alignItems:'stretch'}}>
            {/* Overall */}
            <div className="gradient-border" style={{borderRadius:18,padding:1}}>
              <div className="glass" style={{padding:'1rem 1.5rem',textAlign:'center',borderRadius:17}}>
                <div className="num glow-lime" style={{fontSize:'2.5rem',color:'var(--lime)'}}><CountUp target={overall} suffix="%"/></div>
                <div className="label">Overall</div>
              </div>
            </div>
            {/* Streak */}
            <div className="glass" style={{padding:'1rem 1.5rem',textAlign:'center'}}>
              <div className="num" style={{fontSize:'2.5rem',color:'var(--orange)'}}>🔥<CountUp target={checkins.length}/></div>
              <div className="label">Streak</div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'0.5rem'}}>
              <button className="btn btn-lime" onClick={handleRunAI} disabled={aiLoading} style={{padding:'0.65rem 1.2rem',fontSize:'0.76rem'}}>
                {aiLoading?'⏳':'⚡'} AI Analysis</button>
              <button className="btn btn-ghost" onClick={()=>supabase.auth.signOut()} style={{padding:'0.6rem 1.2rem',fontSize:'0.76rem'}}>Sign Out</button>
            </div>
          </div>
        </motion.header>

        {/* ── GOAL CARDS ── */}
        {loadingGoals?(
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:'1rem',marginBottom:'2.5rem'}}>
            {[1,2,3,4].map(i=><div key={i} className="sk" style={{height:160}}/>)}</div>
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
                    style={{background:`linear-gradient(90deg,${C[i%5]}88,${C[i%5]})`,boxShadow:`0 0 10px ${C[i%5]}`}}/></div>
              </motion.div>
            ))}</div>
        )}

        {/* ── TABS ── */}
        <div style={{marginBottom:'1.8rem'}}>
          <div className="tab-bar">
            {[{id:'today',l:'📋 Today'},{id:'history',l:'📈 History'},{id:'ai',l:'🤖 AI'}].map(t=>(
              <button key={t.id} className={`tab ${activeTab===t.id?'active':''}`} onClick={()=>setActiveTab(t.id)}>{t.l}</button>
            ))}</div></div>

        {/* ── CONTENT ── */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.25}}>

            {activeTab==='today'&&(
              <div className="gradient-border"><div className="glass" style={{padding:'2.5rem'}}>
                {goals.length===0?(
                  <div style={{textAlign:'center',padding:'3rem'}}>
                    <p style={{color:'var(--muted)',marginBottom:'1.5rem'}}>No goals yet.</p>
                    <button className="btn btn-lime" onClick={()=>setShowOnboard(true)}>+ Set Up Goals</button></div>
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
                      <label className="label" style={{display:'block',marginBottom:'1rem'}}>How are you feeling?</label>
                      <div style={{display:'flex',gap:'0.75rem',flexWrap:'wrap'}}>
                        {['😔','😐','🙂','😊','🔥'].map((e,i)=>(
                          <motion.button key={i} whileHover={{scale:1.25}} whileTap={{scale:0.85}} onClick={()=>setMood(i+1)}
                            style={{fontSize:'1.8rem',width:56,height:56,borderRadius:16,
                              border:`2px solid ${mood===i+1?'var(--lime)':'var(--border)'}`,
                              background:mood===i+1?'rgba(188,255,71,0.08)':'transparent',cursor:'pointer',
                              boxShadow:mood===i+1?'0 0 24px rgba(188,255,71,0.35)':'none',transition:'all 0.2s'}}>{e}</motion.button>
                        ))}</div></div>
                    <div><label className="label" style={{display:'block',marginBottom:'0.6rem'}}>Journal & Thoughts</label>
                      <textarea className="input" rows={3} value={journal} onChange={e=>setJournal(e.target.value)}
                        placeholder="What did you build today? Wins, struggles, thoughts..."/></div>
                    <motion.button className="btn btn-lime" onClick={handleCheckin} disabled={saving||saved}
                      whileHover={{scale:1.04}} whileTap={{scale:0.96}}
                      style={{alignSelf:'flex-start',padding:'1rem 2.5rem',fontSize:'0.95rem',position:'relative',overflow:'hidden'}}>
                      {!saving&&!saved&&<span style={{position:'absolute',top:0,left:'-100%',width:'50%',height:'100%',background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)',animation:'shine 2s ease-in-out infinite'}}/>}
                      {saved?'✅ Saved!':saving?'⏳ Saving...':'💾 Save Check-in'}</motion.button>
                  </div>
                )}
              </div></div>
            )}

            {activeTab==='history'&&(
              <div className="glass" style={{padding:'2rem'}}>
                <h2 style={{fontSize:'1.3rem',marginBottom:'1.5rem'}}>📈 History</h2>
                {checkins.length===0?<div style={{textAlign:'center',padding:'3rem',color:'var(--muted)'}}>No history yet.</div>:(
                  <div style={{overflowX:'auto'}}>
                    <table className="dt"><thead><tr><th>Date</th><th>Mood</th><th>Score</th><th>Notes</th></tr></thead>
                      <tbody>{checkins.slice(0,14).map((c,i)=>(
                        <motion.tr key={c.id} initial={{opacity:0,x:-12}} animate={{opacity:1,x:0}} transition={{delay:i*0.04}}>
                          <td style={{color:'var(--teal)',fontWeight:500,fontFamily:'DM Mono'}}>{c.date}</td>
                          <td style={{fontSize:'1.3rem'}}>{['😔','😐','🙂','😊','🔥'][c.mood-1]||'—'}</td>
                          <td><span className="badge" style={{background:'rgba(188,255,71,0.08)',color:'var(--lime)',border:'1px solid rgba(188,255,71,0.12)'}}>{c.overall_score||0}%</span></td>
                          <td style={{color:'var(--muted)',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{c.journal_note||'—'}</td>
                        </motion.tr>))}</tbody></table></div>)}
              </div>
            )}

            {activeTab==='ai'&&(
              <div>
                {!aiResult&&!aiLoading&&(
                  <div className="gradient-border"><div className="glass" style={{padding:'5rem 2rem',textAlign:'center'}}>
                    <motion.div animate={{y:[0,-14,0],rotate:[0,8,-8,0]}} transition={{repeat:Infinity,duration:3.5}}
                      style={{fontSize:'5.5rem',marginBottom:'1.8rem',display:'inline-block',filter:'drop-shadow(0 0 32px rgba(188,255,71,0.4))'}}>🤖</motion.div>
                    <h2 style={{fontSize:'2rem',marginBottom:'0.8rem'}}>AI <span className="holo-text">Analysis</span></h2>
                    <p style={{color:'var(--muted)',marginBottom:'3rem',maxWidth:400,margin:'0 auto 3rem',lineHeight:1.9}}>
                      Analyzes your 7-day trajectory, calculates real success %, and gives you personalized Hinglish feedback.</p>
                    <motion.button className="btn btn-lime" onClick={handleRunAI} whileHover={{scale:1.08}} whileTap={{scale:0.95}}
                      style={{padding:'1.2rem 3.5rem',fontSize:'1rem',position:'relative',overflow:'hidden'}}>
                      <span style={{position:'absolute',top:0,left:'-100%',width:'50%',height:'100%',background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.35),transparent)',animation:'shine 2s ease-in-out infinite'}}/>
                      ⚡ Run AI Analysis</motion.button>
                  </div></div>
                )}
                {aiLoading&&(
                  <div className="glass" style={{padding:'5rem 2rem',textAlign:'center'}}>
                    <motion.div animate={{scale:[1,1.2,1],opacity:[1,0.5,1]}} transition={{repeat:Infinity,duration:1.2}}
                      style={{fontSize:'4.5rem',display:'inline-block',marginBottom:'1.5rem'}}>⚡</motion.div>
                    <h2 className="glow-lime" style={{color:'var(--lime)',fontSize:'1.6rem'}}>Analyzing<span className="loading-dots"/></h2>
                    <p style={{color:'var(--muted)',margin:'0.5rem 0 2.5rem'}}>Calculating trajectory...</p>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',gap:'1.2rem',maxWidth:640,margin:'0 auto'}}>
                      {[1,2,3,4].map(i=><div key={i} className="sk" style={{height:180}}/>)}</div>
                  </div>
                )}
                {aiResult&&!aiLoading&&(
                  <div style={{display:'flex',flexDirection:'column',gap:'1.5rem'}}>
                    <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))',gap:'1.2rem'}}>
                      {goals.map((goal,i)=>{
                        const upd=(aiResult.updates||[]).find(u=>u.goal_id===goal.id);
                        return(
                          <motion.div key={goal.id} whileHover={{scale:1.04,translateY:-6}}
                            initial={{opacity:0,scale:0.88}} animate={{opacity:1,scale:1}} transition={{delay:i*0.12}}
                            className="glass" style={{padding:'2rem 1.5rem',textAlign:'center',background:CD[i%5],borderColor:`${C[i%5]}22`}}>
                            <Ring value={goal.current_progress||0} color={C[i%5]} size={110}/>
                            <p style={{marginTop:'1.2rem',fontWeight:600,fontSize:'0.92rem',lineHeight:1.5}}>{goal.title}</p>
                            {upd&&<p style={{color:'var(--muted)',fontSize:'0.78rem',marginTop:'0.7rem',lineHeight:1.75,fontStyle:'italic'}}>"{upd.feedback}"</p>}
                          </motion.div>);
                      })}</div>
                    <button className="btn btn-ghost" onClick={handleRunAI}>🔄 Refresh</button>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
