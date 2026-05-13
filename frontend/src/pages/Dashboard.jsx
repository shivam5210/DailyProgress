import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api/client';
import ParticleCanvas from '../components/ParticleCanvas';
import CountUp from '../components/CountUp';
import GodCore from '../components/GodCore';
import VoiceRecorder from '../components/VoiceRecorder';
import AIChat from '../components/AIChat';
import LiveTimetable from '../components/LiveTimetable';
import TrajectoryChart from '../components/TrajectoryChart';
import { useGodSounds } from '../utils/SoundManager';
import { Zap, History, Layout, Cpu, RefreshCw, Trash2, Mic, CheckCircle2, Calendar, Activity, ShieldCheck, Terminal } from 'lucide-react';

const C=['#BCFF47','#00E5CC','#9B7FFF','#FF6B2B','#3DFF8F'];
const CD=['rgba(188,255,71,0.05)','rgba(0,229,204,0.05)','rgba(155,127,255,0.05)','rgba(255,107,43,0.05)','rgba(61,255,143,0.05)'];

function Clock(){
  const [t,setT]=useState(new Date());
  useEffect(()=>{const i=setInterval(()=>setT(new Date()),1000);return()=>clearInterval(i)},[]);
  return <span className="hud-label" style={{fontSize:'0.75rem',color:'var(--muted)'}}>{t.toLocaleTimeString('en-IN',{hour:'2-digit',minute:'2-digit',second:'2-digit'})}</span>
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
  const [logs,setLogs] = useState({});
  const [mood,setMood]=useState(3);
  const [journal,setJournal]=useState('');
  const [toast,setToast]=useState(null);
  const [diagnostics, setDiagnostics] = useState({ cpu: 12, mem: 45, neural: 88 });
  const loaded=useRef(false);
  
  const { playClick, playSuccess, playError, playHover, playAI } = useGodSounds();

  const user=session?.user;
  const name=user?.user_metadata?.full_name?.split(' ')[0]||user?.email?.split('@')[0]||'Founder';
  const overall=goals.length?Math.round(goals.reduce((a,g)=>a+(g.current_progress||0),0)/goals.length):0;

  useEffect(()=>{if(loaded.current)return;loaded.current=true;loadAll()},[]);

  useEffect(() => {
    const i = setInterval(() => {
      setDiagnostics({
        cpu: Math.floor(Math.random() * 20) + 10,
        mem: Math.floor(Math.random() * 10) + 40,
        neural: 85 + Math.floor(Math.random() * 10)
      });
    }, 3000);
    return () => clearInterval(i);
  }, []);

  async function loadAll(){
    setLoadingGoals(true);
    if (user?.id) {
      await api.post('/auth/sync', { 
        id: user.id, 
        email: user.email, 
        full_name: user.user_metadata?.full_name, 
        avatar_url: user.user_metadata?.avatar_url 
      }).catch(err => console.error("Sync error", err));
    }

    try {
      const [gr, cr] = await Promise.all([
        api.get('/goals'),
        api.get('/checkins')
      ]);
      setGoals(gr.data?.data || []);
      setCheckins(cr.data?.data || []);
      if (gr.data?.data?.length === 0) setShowOnboard(true);
    } catch (err) {
      console.error("Data fetch error", err);
    }
    setLoadingGoals(false);
  }

  async function handleOnboard(e){
    e.preventDefault();setOnboardLoading(true);playClick();
    const lines = problemsText.split('\n').map(l=>l.trim()).filter(Boolean);
    for(const line of lines) {
      try {
        const [title, desc] = line.split('|').map(s => s.trim());
        await api.post('/goals',{title: title,description: desc || '',goal_type: 'build'});
      } catch (err) { console.error(err); }
    }
    playSuccess(); showT('System Initialized. Goals Locked.','var(--lime)');
    setShowOnboard(false);await loadAll();setOnboardLoading(false);
  }

  async function handleCheckin(){
    if(!goals.length) return showT('No goals available','var(--red)');
    setSaving(true);playClick();
    try{
      await api.post('/checkins',{
        date:new Date().toISOString().split('T')[0],
        mood,
        journal_note:journal,
        logs:goals.map(g=>({goal_id:g.id,value:logs[g.id]||0}))
      });
      setSaved(true);playSuccess();
      showT('✅ Progress Synced!','var(--lime)');
      setTimeout(()=>setSaved(false),3500);
      await loadAll();
    } catch(err){
      playError();
      showT('Sync Error','var(--red)');
    } finally{ setSaving(false); }
  }

  async function handleRunAI(){
    setAiLoading(true);playAI();setActiveTab('ai');
    try{
      const{data}=await api.post('/engine/analyze');
      setAiResult(data);
      const goalsRes = await api.get('/goals');
      setGoals(goalsRes.data?.data || []);
      showT('AI Trajectory Calculated ⚡','var(--lime)');
    } catch(err){
      playError();
      showT('AI Engine Offline','var(--red)');
    } finally{ setAiLoading(false); }
  }

  function showT(msg,type='var(--lime)'){
    setToast({msg,type});
    setTimeout(()=>setToast(null),3500);
  }

  if(!user) return <div className="loading-screen"><div className="loading-dots">Authenticating</div></div>;

  return(
    <div style={{minHeight:'100vh',position:'relative', overflowX: 'hidden'}}>
      <GodCore progress={overall} />
      <AIChat />
      <div className="mesh-bg"><div className="mesh-blob" style={{background:'var(--lime)',top:'-10%',left:'-10%',width:'50%',height:'50%'}}/><div className="mesh-blob" style={{background:'var(--teal)',bottom:'-10%',right:'-10%',width:'40%',height:'40%'}}/></div>
      <div style={{position:'fixed',inset:0,background:'radial-gradient(circle at center,transparent 0%,var(--bg) 100%)',pointerEvents:'none'}}/>

      {/* Diagnostic HUD */}
      <div style={{ position: 'fixed', top: '2rem', right: '2rem', zIndex: 10, display: 'flex', gap: '2rem' }}>
        <div className="glass" style={{ padding: '0.8rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <Activity size={14} color="var(--lime)" />
          <span className="hud-label" style={{ fontSize: '0.65rem' }}>Neural: {diagnostics.neural}%</span>
        </div>
        <div className="glass" style={{ padding: '0.8rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <ShieldCheck size={14} color="var(--teal)" />
          <span className="hud-label" style={{ fontSize: '0.65rem' }}>Security: ACTIVE</span>
        </div>
      </div>

      {/* Toast */}
      <AnimatePresence>{toast&&(
        <motion.div className="toast" initial={{opacity:0,y:-40}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-20}}
          style={{background:toast.type.includes('red')?'linear-gradient(135deg,#FF4757,#FF1E30)':'linear-gradient(135deg,#BCFF47,#8EE800)',color:'#030308'}}>
          {toast.msg}</motion.div>
      )}</AnimatePresence>

      <div style={{maxWidth:1100,margin:'0 auto',padding:'3rem 1.5rem',position:'relative',zIndex:1}}>
        {/* Header */}
        <motion.header initial={{opacity:0,y:-20}} animate={{opacity:1,y:0}}
          style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'4rem',flexWrap:'wrap',gap:'2rem'}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:'1.2rem',marginBottom:'0.5rem'}}>
              <motion.div whileHover={{rotate:180}} className="flex-center" style={{width:54,height:54,borderRadius:16,background:'rgba(255,255,255,0.03)',border:'1px solid var(--glass-stroke)',fontSize:'1.5rem'}}>🎯</motion.div>
              <div>
                <h1 style={{fontSize:'2.2rem',fontWeight:900,letterSpacing:'-0.03em',margin:0}}>Commander <span className="holo-text">{name}</span></h1>
                <div style={{display:'flex',alignItems:'center',gap:'1.5rem',marginTop:'0.5rem'}}>
                  <p className="hud-label">{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</p>
                  <Clock/>
                  <span className="status-dot" style={{color:'var(--lime)'}}/>
                </div>
              </div>
            </div>
          </div>

          <div style={{display:'flex',gap:'1rem'}}>
            <div className="glass" style={{padding:'1.2rem 2rem',textAlign:'center'}}>
              <div className="hud-label" style={{marginBottom:'0.5rem'}}>Global Progress</div>
              <div style={{fontSize:'2.8rem',fontWeight:900,color:'var(--lime)'}} className="text-glow"><CountUp target={overall} suffix="%"/></div>
            </div>
            <div className="glass" style={{padding:'1.2rem 2rem',textAlign:'center'}}>
              <div className="hud-label" style={{marginBottom:'0.5rem'}}>System Streak</div>
              <div style={{fontSize:'2.8rem',fontWeight:900,color:'var(--orange)'}} className="text-glow">🔥<CountUp target={checkins.length}/></div>
            </div>
          </div>
        </motion.header>

        {/* Action Bar */}
        <div style={{display:'flex',gap:'1rem',marginBottom:'3rem',justifyContent:'flex-end'}}>
          <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} className="btn btn-lime" onClick={handleRunAI} disabled={aiLoading}>
            <Cpu size={18} /> {aiLoading?'Analyzing...':'Run Deep AI Analysis'}
          </motion.button>
          <motion.button whileHover={{scale:1.05}} whileTap={{scale:0.95}} className="btn" style={{background:'rgba(255,255,255,0.05)',color:'var(--muted)'}} onClick={() => { playClick(); setShowOnboard(true); }}>
            <RefreshCw size={18} /> Reset System
          </motion.button>
        </div>

        {/* Trajectory & Diagnostics */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '2rem', marginBottom: '4rem' }}>
          <TrajectoryChart />
          <div className="glass" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="hud-label" style={{ color: 'var(--muted)' }}>System Diagnostics</div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
               <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                   <span className="hud-label" style={{ fontSize: '0.6rem' }}>Core Latency</span>
                   <span className="num" style={{ color: 'var(--lime)' }}>14ms</span>
                 </div>
                 <div className="pbar" style={{ height: 4 }}><div className="pbar-fill" style={{ width: '14%', background: 'var(--lime)' }} /></div>
               </div>
               <div>
                 <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                   <span className="hud-label" style={{ fontSize: '0.6rem' }}>Memory Pressure</span>
                   <span className="num" style={{ color: 'var(--orange)' }}>{diagnostics.mem}%</span>
                 </div>
                 <div className="pbar" style={{ height: 4 }}><div className="pbar-fill" style={{ width: `${diagnostics.mem}%`, background: 'var(--orange)' }} /></div>
               </div>
               <div style={{ marginTop: 'auto', padding: '1rem', background: 'rgba(188,255,71,0.02)', borderRadius: '12px', border: '1px solid var(--lime-glow)' }}>
                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', color: 'var(--lime)' }}>
                   <Terminal size={14} />
                   <span className="hud-label" style={{ fontSize: '0.6rem' }}>God Mode Status: STABLE</span>
                 </div>
               </div>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(240px,1fr))',gap:'1.5rem',marginBottom:'4rem'}}>
          {loadingGoals ? [1,2,3,4].map(i=><div key={i} className="glass sk" style={{height:220}}/>) : goals.map((goal,i)=>(
            <motion.div key={goal.id} initial={{opacity:0,scale:0.9}} animate={{opacity:1,scale:1}} transition={{delay:i*0.1}}
              whileHover={{translateY:-10,borderColor:C[i%5]}} className="glass"
              style={{padding:'2rem',background:CD[i%5]}}>
              <div className="glass-inner-glow"/>
              <p className="hud-label" style={{color:C[i%5],marginBottom:'1rem'}}>Sector {i+1}</p>
              <h3 style={{fontSize:'1.1rem',margin:'0 0 1.5rem',height:'3rem',overflow:'hidden'}}>{goal.title}</h3>
              <div style={{fontSize:'3rem',fontWeight:900,color:C[i%5],marginBottom:'1.5rem'}} className="text-glow">
                <CountUp target={goal.current_progress||0} suffix="%"/>
              </div>
              <div className="pbar" style={{height:8,background:'rgba(255,255,255,0.03)'}}>
                <motion.div className="pbar-fill" initial={{width:0}} animate={{width:`${goal.current_progress||0}%`}}
                  style={{background:C[i%5],boxShadow:`0 0 15px ${C[i%5]}`}} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex-center" style={{marginBottom:'3rem'}}>
          <div className="tab-bar">
            {[{id:'today',l:'Daily Deck',i:<Layout size={16}/>},
              {id:'strategy',l:'Neural Strategy',i:<Calendar size={16}/>},
              {id:'history',l:'Temporal Logs',i:<History size={16}/>},
              {id:'ai',l:'Core Intelligence',i:<Zap size={16}/>}].map(t=>(
              <button key={t.id} className={`tab ${activeTab===t.id?'active':''}`} onClick={()=>{playClick();setActiveTab(t.id)}}>
                <div style={{display:'flex',alignItems:'center',gap:'0.6rem'}}>{t.i} {t.l}</div>
              </button>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-10}}>
            {activeTab==='strategy' && <LiveTimetable />}
            {activeTab==='today' && (
              <div className="glass" style={{padding:'3rem'}}>
                <div className="glass-inner-glow"/>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'3rem'}}>
                  <h2 style={{fontSize:'1.8rem',margin:0}}>Operational Check-in</h2>
                  {saved && <span className="neon-lime" style={{fontSize:'0.9rem',display:'flex',alignItems:'center',gap:'0.5rem'}}><CheckCircle2 size={16}/> Uplink Established</span>}
                </div>
                
                <div style={{display:'flex',flexDirection:'column',gap:'2.5rem'}}>
                  {goals.map((goal,i)=>(
                    <div key={goal.id} style={{padding:'2rem',background:'rgba(255,255,255,0.01)',borderRadius:24,border:'1px solid var(--glass-stroke)'}}>
                      <div style={{display:'flex',justifyContent:'space-between',marginBottom:'1.5rem'}}>
                        <label className="hud-label" style={{color:C[i%5]}}>{goal.title}</label>
                        <span style={{fontSize:'1.8rem',fontWeight:900,color:C[i%5]}}>{logs[goal.id]||0}%</span>
                      </div>
                      <input type="range" value={logs[goal.id]||0} onChange={e=>setLogs(p=>({...p,[goal.id]:parseInt(e.target.value)}))} style={{width:'100%'}}/>
                    </div>
                  ))}

                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'2rem'}}>
                    <div>
                      <label className="hud-label" style={{display:'block',marginBottom:'1.5rem'}}>Neural State (Mood)</label>
                      <div style={{display:'flex',gap:'1rem'}}>
                        {['😔','😐','🙂','😊','🔥'].map((e,i)=>(
                          <motion.button key={i} whileHover={{scale:1.2}} whileTap={{scale:0.9}} onClick={()=>{playClick();setMood(i+1)}}
                            style={{fontSize:'2rem',width:64,height:64,borderRadius:20,border:`2px solid ${mood===i+1?'var(--lime)':'transparent'}`,background:mood===i+1?'rgba(188,255,71,0.1)':'rgba(255,255,255,0.02)',cursor:'pointer'}}>
                            {e}
                          </motion.button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="hud-label" style={{display:'block',marginBottom:'1.5rem'}}>Temporal Journal</label>
                      <VoiceRecorder onTranscript={setJournal} />
                      <textarea className="input" style={{marginTop:'1rem',minHeight:120}} value={journal} onChange={e=>setJournal(e.target.value)} placeholder="Manual entry override..." />
                    </div>
                  </div>

                  <motion.button className="btn btn-lime" onClick={handleCheckin} disabled={saving||saved} style={{alignSelf:'flex-start',padding:'1.2rem 4rem'}}>
                    {saving?'Encrypting...':'Sync to Core'}
                  </motion.button>
                </div>
              </div>
            )}

            {activeTab==='ai' && (
              <div className="glass" style={{padding:'3rem'}}>
                <div className="glass-inner-glow"/>
                <div style={{display:'flex',alignItems:'center',gap:'1rem',marginBottom:'2rem'}}>
                  <Cpu className="neon-lime" />
                  <h2 style={{fontSize:'1.8rem',margin:0}}>Predictive Intelligence Report</h2>
                </div>
                {aiLoading ? (
                  <div className="sk" style={{height:300}}/>
                ) : aiResult ? (
                  <div style={{lineHeight:1.8,fontSize:'1.1rem',color:'rgba(255,255,255,0.9)',whiteSpace:'pre-wrap',fontFamily:'Inter, sans-serif'}}>
                    {aiResult.deepAnalysis}
                  </div>
                ) : (
                  <div style={{textAlign:'center',padding:'5rem',color:'var(--muted)'}}>
                    <Zap size={48} style={{marginBottom:'1rem',opacity:0.2}}/>
                    <p>Core Intelligence awaiting command. Run analysis to generate trajectory.</p>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Onboarding */}
      <AnimatePresence>
        {showOnboard && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} className="flex-center" style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.95)',zIndex:1000,backdropFilter:'blur(20px)'}}>
            <motion.div initial={{scale:0.9,y:20}} animate={{scale:1,y:0}} className="glass" style={{maxWidth:600,padding:'4rem',textAlign:'center'}}>
              <div style={{fontSize:'4rem',marginBottom:'2rem'}}>👑</div>
              <h2 style={{fontSize:'2.5rem',fontWeight:900,marginBottom:'1rem'}}>Initiate <span className="holo-text">God Mode</span></h2>
              <p style={{color:'var(--muted)',marginBottom:'3rem',lineHeight:1.6}}>Define your 4-5 core operational objectives. The AI will monitor your trajectory and enforce progress.</p>
              <textarea className="input" rows={6} value={problemsText} onChange={e=>setProblemsText(e.target.value)} placeholder={"Objective 1\nObjective 2\n..."} style={{textAlign:'center',marginBottom:'2rem'}} />
              <button className="btn btn-lime" style={{width:'100%'}} onClick={handleOnboard} disabled={onboardLoading}>
                {onboardLoading?'Calibrating System...':'Engage Life OS'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}