import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, api } from '../api/client';
import ParticleCanvas from '../components/ParticleCanvas';
import CountUp from '../components/CountUp';

const C = ['#BCFF47','#00E5CC','#9B7FFF','#FF6B2B','#3DFF8F'];
const CD = ['rgba(188,255,71,0.1)','rgba(0,229,204,0.1)','rgba(155,127,255,0.1)','rgba(255,107,43,0.1)','rgba(61,255,143,0.1)'];

function Ring({ value=0, color='#BCFF47', size=100 }) {
  const sw = size * 0.09;
  const r = (size - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(value, 100) / 100) * circ;
  return (
    <svg width={size} height={size} style={{ display:'block', margin:'0 auto', filter:`drop-shadow(0 0 10px ${color}55)` }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={sw}/>
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={sw}
        strokeLinecap="round" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }} animate={{ strokeDashoffset: offset }}
        transition={{ duration:1.6, ease:[0.16,1,0.3,1] }}
        style={{ transform:'rotate(-90deg)', transformOrigin:'center', filter:`drop-shadow(0 0 6px ${color})` }} />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:size*0.2, fill:color }}>
        {value}%
      </text>
    </svg>
  );
}

function Clock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => { const t = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(t); }, []);
  return (
    <span style={{ fontFamily:'DM Mono', fontSize:'0.8rem', color:'var(--muted)', letterSpacing:'0.1em' }}>
      {time.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit', second:'2-digit' })}
    </span>
  );
}

export default function Dashboard({ session }) {
  const [goals, setGoals] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [activeTab, setActiveTab] = useState('today');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showOnboard, setShowOnboard] = useState(false);
  const [problemsText, setProblemsText] = useState('');
  const [onboardLoading, setOnboardLoading] = useState(false);
  const [logs, setLogs] = useState({});
  const [mood, setMood] = useState(3);
  const [journal, setJournal] = useState('');
  const [toast, setToast] = useState(null);
  const loaded = useRef(false);

  const user = session.user;
  const name = user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Founder';
  const overall = goals.length ? Math.round(goals.reduce((a,g) => a+(g.current_progress||0),0)/goals.length) : 0;
  const streak = checkins.length;

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;
    loadAll();
  }, []);

  async function loadAll() {
    setLoadingGoals(true);
    try {
      const [gr, cr] = await Promise.all([
        api.get('/goals').catch(() => ({ data:[] })),
        api.get('/checkins').catch(() => ({ data:[] }))
      ]);
      setGoals(gr.data || []);
      setCheckins(cr.data || []);
      if (!(gr.data||[]).length) setShowOnboard(true);
    } finally { setLoadingGoals(false); }
  }

  async function handleOnboard(e) {
    e.preventDefault();
    setOnboardLoading(true);
    const lines = problemsText.split('\n').map(l=>l.trim()).filter(Boolean);
    for (const line of lines) await api.post('/goals', { title:line, description:'', goal_type:'reduce' }).catch(()=>{});
    showToast('Goals set! Time to conquer them 🚀','lime');
    setShowOnboard(false);
    await loadAll();
    setOnboardLoading(false);
  }

  async function handleCheckin() {
    if (!goals.length) return;
    setSaving(true);
    try {
      await api.post('/checkins', {
        date: new Date().toISOString().split('T')[0], mood, journal_note: journal,
        logs: goals.map(g => ({ goal_id:g.id, value:logs[g.id]||0 }))
      });
      setSaved(true);
      showToast('✅ Check-in saved!','lime');
    } catch { showToast('Error saving','red'); }
    setSaving(false);
  }

  async function handleRunAI() {
    setAiLoading(true); setActiveTab('ai');
    try {
      const { data } = await api.post('/engine/analyze');
      setAiResult(data);
      const { data:updated } = await api.get('/goals');
      setGoals(updated||[]);
      showToast('AI analysis complete ⚡','lime');
    } catch { showToast('AI failed — check API keys','red'); }
    setAiLoading(false);
  }

  function showToast(msg, type='lime') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  return (
    <div style={{ minHeight:'100vh', position:'relative' }}>
      <div className="aurora">
        <div className="aurora-layer"/><div className="aurora-layer"/>
        <div className="aurora-layer"/><div className="aurora-layer"/>
      </div>
      <ParticleCanvas />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div className="toast" initial={{ opacity:0, y:-30, scale:0.9 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, y:-20 }}
            style={{ background:toast.type==='lime'?'linear-gradient(135deg,#BCFF47,#8EE800)':'linear-gradient(135deg,#FF4757,#FF1E30)',
                     color:toast.type==='lime'?'#04040A':'#fff' }}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding Modal */}
      <AnimatePresence>
        {showOnboard && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, background:'rgba(4,4,10,0.92)', backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:'1.5rem' }}>
            <motion.div className="glass glass-lime" initial={{ scale:0.8, y:40 }} animate={{ scale:1, y:0 }} exit={{ scale:0.9, opacity:0 }}
              transition={{ type:'spring', stiffness:200, damping:20 }} style={{ maxWidth:520, width:'100%', padding:'3rem' }}>
              <div style={{ fontSize:'3rem', marginBottom:'1rem' }}>👋</div>
              <h2 style={{ fontSize:'1.8rem', marginBottom:'0.5rem' }}>
                Welcome, <span style={{ color:'var(--lime)' }} className="glow-lime">{name}!</span>
              </h2>
              <p style={{ color:'var(--muted)', lineHeight:1.8, marginBottom:'1.8rem', fontSize:'0.92rem' }}>
                List your <strong style={{ color:'var(--text)' }}>4–5 problems</strong> you want to fix. One per line.<br/>
                AI will track your daily progress on each one.
              </p>
              <form onSubmit={handleOnboard} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                <textarea className="input" rows={7} required value={problemsText} onChange={e=>setProblemsText(e.target.value)}
                  placeholder={"e.g.:\nQuit smoking (currently 20/day)\nQuit weed\nBuild startup contacts\nWork on vsquaree daily\nHit the gym 5x/week"} />
                <button type="submit" className="btn btn-lime" disabled={onboardLoading} style={{ padding:'1.1rem', fontSize:'0.95rem' }}>
                  {onboardLoading ? '⏳ Setting up...' : '🚀 Start Tracking'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ maxWidth:1000, margin:'0 auto', padding:'2rem 1.5rem 5rem', position:'relative', zIndex:1 }}>

        {/* ── HEADER ── */}
        <motion.header initial={{ opacity:0, y:-20 }} animate={{ opacity:1, y:0 }} transition={{ duration:0.6 }}
          style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2.5rem', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'0.8rem', marginBottom:'0.3rem' }}>
              <motion.span animate={{ rotate:[0,10,-8,0] }} transition={{ repeat:Infinity, duration:4, ease:'easeInOut' }} style={{ fontSize:'1.8rem' }}>🎯</motion.span>
              <div>
                <h1 style={{ fontSize:'1.6rem', lineHeight:1 }}>
                  Hey, <span style={{ color:'var(--lime)' }} className="glow-lime">{name}</span> 👋
                </h1>
                <div style={{ display:'flex', alignItems:'center', gap:'1rem', marginTop:'0.3rem' }}>
                  <p className="label">{new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})}</p>
                  <Clock />
                </div>
              </div>
            </div>
          </div>

          {/* Stats cluster */}
          <div style={{ display:'flex', gap:'0.75rem', alignItems:'stretch' }}>
            {/* Overall score */}
            <motion.div className="glass glass-lime" whileHover={{ scale:1.04 }} style={{ padding:'1rem 1.4rem', textAlign:'center', minWidth:100 }}>
              <div className="num glow-lime" style={{ fontSize:'2.2rem', color:'var(--lime)' }}>
                <CountUp target={overall} suffix="%" />
              </div>
              <div className="label">Overall</div>
            </motion.div>
            {/* Streak */}
            <motion.div className="glass" whileHover={{ scale:1.04 }} style={{ padding:'1rem 1.4rem', textAlign:'center', minWidth:80 }}>
              <div className="num" style={{ fontSize:'2.2rem', color:'var(--orange)' }}>
                🔥<CountUp target={streak} />
              </div>
              <div className="label">Streak</div>
            </motion.div>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
              <button className="btn btn-lime" onClick={handleRunAI} disabled={aiLoading}
                style={{ padding:'0.65rem 1.2rem', fontSize:'0.78rem', whiteSpace:'nowrap' }}>
                {aiLoading ? '⏳ Analyzing...' : '⚡ AI Analysis'}
              </button>
              <button className="btn btn-ghost" onClick={() => supabase.auth.signOut()}
                style={{ padding:'0.6rem 1.2rem', fontSize:'0.78rem' }}>
                Sign Out
              </button>
            </div>
          </div>
        </motion.header>

        {/* ── GOAL CARDS ── */}
        {loadingGoals ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(170px,1fr))', gap:'1rem', marginBottom:'2rem' }}>
            {[1,2,3,4].map(i=><div key={i} className="sk" style={{ height:140 }}/>)}
          </div>
        ) : goals.length > 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(175px,1fr))', gap:'1rem', marginBottom:'2.5rem' }}>
            {goals.map((goal,i) => (
              <motion.div key={goal.id} className="glass" initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.08 }}
                whileHover={{ scale:1.03, translateY:-6 }}
                style={{ padding:'1.4rem', background:CD[i%5], border:`1px solid ${C[i%5]}30`, cursor:'default', position:'relative' }}>
                {(goal.current_progress||0)===100 && (
                  <span className="floating-badge" style={{ background:C[i%5], color:'#04040A' }}>🏆 DONE</span>
                )}
                <p className="label" style={{ color:C[i%5], marginBottom:'0.5rem' }}>Goal {i+1}</p>
                <p style={{ fontSize:'0.82rem', fontWeight:500, lineHeight:1.5, marginBottom:'1rem', minHeight:40 }}>{goal.title}</p>
                <div className="num" style={{ fontSize:'2.6rem', color:C[i%5], textShadow:`0 0 20px ${C[i%5]}80` }}>
                  <CountUp target={goal.current_progress||0} suffix="%" />
                </div>
                <div className="pbar" style={{ marginTop:'0.8rem' }}>
                  <motion.div className="pbar-fill" initial={{ width:0 }} animate={{ width:`${goal.current_progress||0}%` }}
                    transition={{ duration:1.4, ease:[0.16,1,0.3,1] }}
                    style={{ background:`linear-gradient(90deg,${C[i%5]}99,${C[i%5]})`, boxShadow:`0 0 8px ${C[i%5]}` }} />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── TABS ── */}
        <div style={{ marginBottom:'1.8rem' }}>
          <div className="tab-bar">
            {[{id:'today',l:'📋 Today'},{id:'history',l:'📈 History'},{id:'ai',l:'🤖 AI'}].map(t=>(
              <button key={t.id} className={`tab ${activeTab===t.id?'active':''}`} onClick={()=>setActiveTab(t.id)}>{t.l}</button>
            ))}
          </div>
        </div>

        {/* ── TAB CONTENT ── */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-8 }} transition={{ duration:0.22 }}>

            {/* TODAY */}
            {activeTab==='today' && (
              <div className="glass" style={{ padding:'2.5rem' }}>
                {goals.length===0 ? (
                  <div style={{ textAlign:'center', padding:'3rem' }}>
                    <p style={{ color:'var(--muted)', marginBottom:'1.5rem' }}>No goals yet.</p>
                    <button className="btn btn-lime" onClick={()=>setShowOnboard(true)}>+ Set Up Goals</button>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:'2rem' }}>
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                      <h2 style={{ fontSize:'1.25rem' }}>📋 Daily Check-in</h2>
                      {saved && <span className="badge" style={{ background:'var(--c0d)', color:'var(--lime)', border:'1px solid rgba(188,255,71,0.2)' }}>✅ Saved today</span>}
                    </div>

                    {goals.map((goal,i) => (
                      <motion.div key={goal.id} initial={{ opacity:0, x:-12 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.06 }}
                        style={{ padding:'1.5rem', background:CD[i%5], borderRadius:16, border:`1px solid ${C[i%5]}22` }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
                          <label className="label" style={{ color:C[i%5], fontSize:'0.75rem' }}>{goal.title}</label>
                          <span className="num" style={{ fontSize:'1.5rem', color:C[i%5], textShadow:`0 0 12px ${C[i%5]}` }}>
                            {logs[goal.id]||0}%
                          </span>
                        </div>
                        <input type="range" min={0} max={100} value={logs[goal.id]||0}
                          onChange={e=>setLogs(p=>({...p,[goal.id]:parseInt(e.target.value)}))}
                          style={{ width:'100%', accentColor:C[i%5] }} />
                      </motion.div>
                    ))}

                    {/* Mood */}
                    <div>
                      <label className="label" style={{ display:'block', marginBottom:'1rem' }}>How are you feeling?</label>
                      <div style={{ display:'flex', gap:'0.75rem', flexWrap:'wrap' }}>
                        {['😔','😐','🙂','😊','🔥'].map((e,i)=>(
                          <motion.button key={i} whileHover={{ scale:1.2 }} whileTap={{ scale:0.9 }}
                            onClick={()=>setMood(i+1)}
                            style={{
                              fontSize:'1.7rem', width:54, height:54, borderRadius:14,
                              border:`2px solid ${mood===i+1?'var(--lime)':'var(--border)'}`,
                              background:mood===i+1?'rgba(188,255,71,0.1)':'transparent',
                              cursor:'pointer',
                              boxShadow:mood===i+1?'0 0 20px rgba(188,255,71,0.35)':'none',
                              transition:'all 0.2s'
                            }}>{e}</motion.button>
                        ))}
                      </div>
                    </div>

                    {/* Journal */}
                    <div>
                      <label className="label" style={{ display:'block', marginBottom:'0.6rem' }}>Journal & Notes</label>
                      <textarea className="input" rows={3} value={journal} onChange={e=>setJournal(e.target.value)}
                        placeholder="What did you build today? Any wins, struggles, or thoughts..." />
                    </div>

                    <motion.button className="btn btn-lime" onClick={handleCheckin} disabled={saving||saved}
                      whileHover={{ scale:1.03 }} whileTap={{ scale:0.97 }}
                      style={{ alignSelf:'flex-start', padding:'0.95rem 2.5rem', fontSize:'0.95rem', position:'relative', overflow:'hidden' }}>
                      {!saving && !saved && <span style={{ position:'absolute', top:0, left:'-100%', width:'60%', height:'100%', background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.25),transparent)', animation:'shine 2s ease-in-out infinite' }} />}
                      {saved ? '✅ Already saved today!' : saving ? '⏳ Saving...' : '💾 Save Check-in'}
                    </motion.button>
                  </div>
                )}
              </div>
            )}

            {/* HISTORY */}
            {activeTab==='history' && (
              <div className="glass" style={{ padding:'2rem' }}>
                <h2 style={{ fontSize:'1.25rem', marginBottom:'1.5rem' }}>📈 Check-in History</h2>
                {checkins.length===0 ? (
                  <div style={{ textAlign:'center', padding:'3rem', color:'var(--muted)' }}>No history yet. Complete your first check-in!</div>
                ) : (
                  <div style={{ overflowX:'auto' }}>
                    <table className="dt">
                      <thead><tr><th>Date</th><th>Mood</th><th>Score</th><th>Notes</th></tr></thead>
                      <tbody>
                        {checkins.slice(0,14).map((c,i)=>(
                          <motion.tr key={c.id} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.04 }}>
                            <td style={{ color:'var(--teal)', fontWeight:500, fontFamily:'DM Mono' }}>{c.date}</td>
                            <td style={{ fontSize:'1.25rem' }}>{['😔','😐','🙂','😊','🔥'][c.mood-1]||'—'}</td>
                            <td><span className="badge" style={{ background:'rgba(188,255,71,0.08)', color:'var(--lime)', border:'1px solid rgba(188,255,71,0.15)' }}>{c.overall_score||0}%</span></td>
                            <td style={{ color:'var(--muted)', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{c.journal_note||'—'}</td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* AI */}
            {activeTab==='ai' && (
              <div>
                {!aiResult && !aiLoading && (
                  <motion.div className="glass glass-lime" initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }}
                    style={{ padding:'4rem 2rem', textAlign:'center' }}>
                    <motion.div animate={{ y:[0,-10,0], rotate:[0,5,-5,0] }} transition={{ repeat:Infinity, duration:3 }}
                      style={{ fontSize:'5rem', marginBottom:'1.5rem', display:'inline-block', filter:'drop-shadow(0 0 24px rgba(188,255,71,0.5))' }}>🤖</motion.div>
                    <h2 style={{ fontSize:'1.8rem', marginBottom:'0.75rem' }}>AI Progress Analysis</h2>
                    <p style={{ color:'var(--muted)', marginBottom:'2.5rem', maxWidth:380, margin:'0 auto 2.5rem', lineHeight:1.85 }}>
                      Analyzes your last 7 days of check-ins, calculates real success percentages, and gives you Hinglish feedback on each goal.
                    </p>
                    <motion.button className="btn btn-lime" onClick={handleRunAI} whileHover={{ scale:1.06 }} whileTap={{ scale:0.95 }}
                      style={{ padding:'1.1rem 3rem', fontSize:'1rem', position:'relative', overflow:'hidden' }}>
                      <span style={{ position:'absolute', top:0, left:'-100%', width:'60%', height:'100%', background:'linear-gradient(90deg,transparent,rgba(255,255,255,0.3),transparent)', animation:'shine 2s ease-in-out infinite' }} />
                      ⚡ Run AI Analysis
                    </motion.button>
                  </motion.div>
                )}

                {aiLoading && (
                  <div className="glass" style={{ padding:'4rem 2rem', textAlign:'center' }}>
                    <motion.div animate={{ scale:[1,1.15,1], opacity:[1,0.6,1] }} transition={{ repeat:Infinity, duration:1.2 }}
                      style={{ fontSize:'4rem', display:'inline-block', marginBottom:'1.5rem' }}>⚡</motion.div>
                    <h2 style={{ color:'var(--lime)', fontSize:'1.5rem' }} className="glow-lime">AI analyzing<span className="loading-dots"/></h2>
                    <p style={{ color:'var(--muted)', margin:'0.5rem 0 2rem' }}>Calculating your 7-day trajectory...</p>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:'1rem', maxWidth:600, margin:'0 auto' }}>
                      {[1,2,3,4].map(i=><div key={i} className="sk" style={{ height:160 }}/>)}
                    </div>
                  </div>
                )}

                {aiResult && !aiLoading && (
                  <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1.2rem' }}>
                      {goals.map((goal,i) => {
                        const upd = (aiResult.updates||[]).find(u=>u.goal_id===goal.id);
                        return (
                          <motion.div key={goal.id} className="glass" whileHover={{ scale:1.03, translateY:-4 }}
                            initial={{ opacity:0, scale:0.9 }} animate={{ opacity:1, scale:1 }} transition={{ delay:i*0.1 }}
                            style={{ padding:'2rem 1.5rem', textAlign:'center', background:CD[i%5], border:`1px solid ${C[i%5]}25` }}>
                            <Ring value={goal.current_progress||0} color={C[i%5]} size={100} />
                            <p style={{ marginTop:'1.2rem', fontWeight:600, fontSize:'0.9rem', lineHeight:1.5 }}>{goal.title}</p>
                            {upd && <p style={{ color:'var(--muted)', fontSize:'0.78rem', marginTop:'0.6rem', lineHeight:1.7, fontStyle:'italic' }}>"{upd.feedback}"</p>}
                          </motion.div>
                        );
                      })}
                    </div>
                    <button className="btn btn-ghost" onClick={handleRunAI} style={{ alignSelf:'flex-start' }}>🔄 Refresh Analysis</button>
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
