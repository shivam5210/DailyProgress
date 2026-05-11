import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase, api } from '../api/client';

const COLORS = ['var(--lime)','var(--teal)','var(--violet)','var(--orange)','var(--green)'];
const COLORS_DIM = ['var(--lime-dim)','var(--teal-dim)','var(--violet-dim)','rgba(255,107,43,0.12)','rgba(61,255,143,0.12)'];

function Ring({ value=0, color='var(--lime)', size=90, strokeWidth=8 }) {
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (Math.min(value,100) / 100) * circ;
  return (
    <svg width={size} height={size} style={{ display:'block', margin:'0 auto', transform:'rotate(-90deg)' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={strokeWidth} />
      <motion.circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={strokeWidth}
        strokeLinecap="round" strokeDasharray={circ}
        initial={{ strokeDashoffset: circ }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration:1.4, ease:'easeOut' }}
        style={{ filter:`drop-shadow(0 0 8px ${color})` }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        style={{ fontFamily:'Space Grotesk', fontWeight:700, fontSize:size*0.2, fill:color, transform:'rotate(90deg)', transformOrigin:'center', filter:`drop-shadow(0 0 6px ${color})` }}>
        {value}%
      </text>
    </svg>
  );
}

export default function Dashboard({ session }) {
  const [goals, setGoals] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [loadingGoals, setLoadingGoals] = useState(true);
  const [activeTab, setActiveTab] = useState('today');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [savingCheckin, setSavingCheckin] = useState(false);
  const [checkinSaved, setCheckinSaved] = useState(false);
  const [showOnboard, setShowOnboard] = useState(false);
  const [problemsText, setProblemsText] = useState('');
  const [onboardLoading, setOnboardLoading] = useState(false);
  const [todayLogs, setTodayLogs] = useState({});
  const [mood, setMood] = useState(3);
  const [journal, setJournal] = useState('');
  const [toast, setToast] = useState(null);
  const loaded = useRef(false);

  const user = session.user;
  const name = user.user_metadata?.full_name?.split(' ')[0] || user.email?.split('@')[0] || 'Founder';
  const overall = goals.length ? Math.round(goals.reduce((a,g) => a + (g.current_progress||0), 0) / goals.length) : 0;
  const todayStr = new Date().toISOString().split('T')[0];

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
    } finally {
      setLoadingGoals(false);
    }
  }

  async function handleOnboard(e) {
    e.preventDefault();
    if (!problemsText.trim()) return;
    setOnboardLoading(true);
    const lines = problemsText.split('\n').map(l=>l.trim()).filter(Boolean);
    for (const line of lines) {
      await api.post('/goals', { title:line, description:'', goal_type:'reduce' }).catch(()=>{});
    }
    showToast('Goals created! Start your first check-in 🚀','lime');
    setShowOnboard(false);
    await loadAll();
    setOnboardLoading(false);
  }

  async function handleCheckin() {
    if (!goals.length) return;
    setSavingCheckin(true);
    const logs = goals.map(g => ({ goal_id:g.id, value:todayLogs[g.id] !== undefined ? todayLogs[g.id] : 0 }));
    try {
      await api.post('/checkins', { date:todayStr, mood, journal_note:journal, logs });
      setCheckinSaved(true);
      showToast('✅ Check-in saved!','lime');
    } catch(e) { showToast('Error saving check-in','red'); }
    setSavingCheckin(false);
  }

  async function handleRunAI() {
    setAiLoading(true); setActiveTab('ai');
    try {
      const { data } = await api.post('/engine/analyze');
      setAiResult(data);
      const { data:updated } = await api.get('/goals');
      setGoals(updated||[]);
      showToast('AI analysis complete! ⚡','lime');
    } catch(e) { showToast('AI analysis failed','red'); }
    setAiLoading(false);
  }

  function showToast(msg, type='lime') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  const tabs = [
    { id:'today', label:'📋 Today' },
    { id:'history', label:'📈 History' },
    { id:'ai', label:'🤖 AI' },
  ];

  return (
    <div style={{ minHeight:'100vh', position:'relative' }}>
      <div className="orb orb-1" /><div className="orb orb-2" /><div className="orb orb-3" />

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div className="toast"
            initial={{ opacity:0, y:-30, scale:0.9 }}
            animate={{ opacity:1, y:0, scale:1 }}
            exit={{ opacity:0, y:-20, scale:0.95 }}
            style={{ background: toast.type==='lime' ? 'var(--lime)' : 'var(--red)', color: toast.type==='lime' ? 'var(--bg)' : '#fff' }}>
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Onboarding Modal */}
      <AnimatePresence>
        {showOnboard && (
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
            style={{ position:'fixed', inset:0, background:'rgba(4,4,10,0.9)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:999, padding:'1.5rem', backdropFilter:'blur(8px)' }}>
            <motion.div className="glass glass-lime" initial={{ scale:0.85, y:30 }} animate={{ scale:1, y:0 }} exit={{ scale:0.9, opacity:0 }}
              style={{ maxWidth:520, width:'100%', padding:'2.5rem' }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'0.5rem' }}>
                <span style={{ fontSize:'2rem' }}>👋</span>
                <h2 style={{ fontSize:'1.6rem' }}>Welcome, <span style={{ color:'var(--lime)' }}>{name}!</span></h2>
              </div>
              <p style={{ color:'var(--muted)', marginBottom:'1.5rem', lineHeight:1.75, fontSize:'0.92rem' }}>
                List your <strong style={{ color:'var(--text)' }}>4–5 problems</strong> you want to fix, one per line.<br/>
                The AI will track your daily progress on each one.
              </p>
              <form onSubmit={handleOnboard} style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
                <textarea className="input" rows={6} required value={problemsText} onChange={e=>setProblemsText(e.target.value)}
                  placeholder={"e.g.:\nQuit smoking (currently 20/day)\nQuit weed\nBuild startup contacts\nWork on vsquaree daily\nHit the gym"} />
                <button type="submit" className="btn btn-lime" disabled={onboardLoading} style={{ fontSize:'0.95rem', padding:'1rem' }}>
                  {onboardLoading ? '⏳ Creating goals...' : '🚀 Start Tracking'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={{ maxWidth:980, margin:'0 auto', padding:'1.5rem 1.5rem 4rem', position:'relative', zIndex:1 }}>

        {/* ── HEADER ── */}
        <motion.header initial={{ opacity:0, y:-16 }} animate={{ opacity:1, y:0 }}
          style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'2.5rem', flexWrap:'wrap', gap:'1rem' }}>
          <div>
            <div style={{ display:'flex', alignItems:'center', gap:'0.7rem', marginBottom:'0.25rem' }}>
              <span style={{ fontSize:'1.6rem' }}>🎯</span>
              <h1 style={{ fontSize:'1.5rem' }}>
                Hey, <span style={{ color:'var(--lime)' }} className="glow-text">{name}</span>
              </h1>
            </div>
            <p className="label" style={{ marginLeft:'2.4rem' }}>
              {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
            </p>
          </div>
          <div style={{ display:'flex', gap:'0.75rem', alignItems:'center' }}>
            {/* Overall score bubble */}
            <div className="glass" style={{ padding:'0.75rem 1.2rem', textAlign:'center', borderColor:'rgba(188,255,71,0.15)' }}>
              <div className="num" style={{ fontSize:'1.8rem', color:'var(--lime)', textShadow:'0 0 20px rgba(188,255,71,0.4)' }}>{overall}%</div>
              <div className="label">OVERALL</div>
            </div>
            <button className="btn btn-ghost" onClick={() => supabase.auth.signOut()}>Sign Out</button>
          </div>
        </motion.header>

        {/* ── GOAL CARDS ── */}
        {loadingGoals ? (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(170px, 1fr))', gap:'1rem', marginBottom:'2rem' }}>
            {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height:130 }} />)}
          </div>
        ) : goals.length > 0 && (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(170px, 1fr))', gap:'1rem', marginBottom:'2.5rem' }}>
            {goals.map((goal, i) => (
              <motion.div key={goal.id} className="glass" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:i*0.07 }}
                style={{ padding:'1.3rem', background:COLORS_DIM[i%5], borderColor:`${COLORS[i%5]}30` }}>
                <p className="label" style={{ color:COLORS[i%5], marginBottom:'0.5rem' }}>GOAL {i+1}</p>
                <p style={{ fontSize:'0.82rem', fontWeight:500, marginBottom:'1rem', lineHeight:1.5, minHeight:36 }}>{goal.title}</p>
                <div className="num" style={{ fontSize:'2.4rem', color:COLORS[i%5], textShadow:`0 0 20px ${COLORS[i%5]}80` }}>
                  {goal.current_progress||0}%
                </div>
                <div className="progress-bar" style={{ marginTop:'0.75rem' }}>
                  <motion.div className="progress-fill"
                    initial={{ width:0 }} animate={{ width:`${goal.current_progress||0}%` }} transition={{ duration:1.2, ease:'easeOut' }}
                    style={{ background:COLORS[i%5], boxShadow:`0 0 8px ${COLORS[i%5]}` }} />
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* ── TABS ── */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem', flexWrap:'wrap', gap:'1rem' }}>
          <div className="tab-bar">
            {tabs.map(t => (
              <button key={t.id} className={`tab ${activeTab===t.id?'active':''}`} onClick={() => setActiveTab(t.id)}>
                {t.label}
              </button>
            ))}
          </div>
          <button className="btn btn-lime" onClick={handleRunAI} disabled={aiLoading}
            style={{ padding:'0.65rem 1.4rem', fontSize:'0.82rem' }}>
            {aiLoading ? '⏳ Analyzing...' : '⚡ Run AI Analysis'}
          </button>
        </div>

        {/* ── TAB CONTENT ── */}
        <AnimatePresence mode="wait">
          <motion.div key={activeTab} initial={{ opacity:0, x:12 }} animate={{ opacity:1, x:0 }} exit={{ opacity:0, x:-12 }} transition={{ duration:0.22 }}>

            {/* TODAY */}
            {activeTab==='today' && (
              <div className="glass" style={{ padding:'2rem' }}>
                {goals.length===0 ? (
                  <div style={{ textAlign:'center', padding:'3rem' }}>
                    <p style={{ color:'var(--muted)', marginBottom:'1.5rem' }}>No goals set up yet.</p>
                    <button className="btn btn-lime" onClick={() => setShowOnboard(true)}>+ Set Up Goals</button>
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', gap:'2rem' }}>
                    <div>
                      <h2 style={{ fontSize:'1.2rem', marginBottom:'1.5rem', display:'flex', alignItems:'center', gap:'0.5rem' }}>
                        📋 <span>Daily Check-in</span>
                        {checkinSaved && <span className="badge" style={{ background:'var(--lime-dim)', color:'var(--lime)', border:'1px solid rgba(188,255,71,0.2)', marginLeft:'0.5rem' }}>✅ Saved</span>}
                      </h2>
                      <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
                        {goals.map((goal,i) => (
                          <div key={goal.id} style={{ padding:'1.2rem', background:COLORS_DIM[i%5], borderRadius:14, border:`1px solid ${COLORS[i%5]}25` }}>
                            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.75rem' }}>
                              <label className="label" style={{ color:COLORS[i%5] }}>{goal.title}</label>
                              <span className="num" style={{ fontSize:'1.3rem', color:COLORS[i%5] }}>{todayLogs[goal.id]||0}%</span>
                            </div>
                            <input type="range" min={0} max={100} value={todayLogs[goal.id]||0}
                              onChange={e => setTodayLogs(p => ({...p, [goal.id]:parseInt(e.target.value)}))}
                              style={{ width:'100%', accentColor:COLORS[i%5] }} />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Mood */}
                    <div>
                      <label className="label" style={{ display:'block', marginBottom:'1rem' }}>How was your day?</label>
                      <div style={{ display:'flex', gap:'0.75rem' }}>
                        {['😔','😐','🙂','😊','🔥'].map((e,i) => (
                          <button key={i} onClick={() => setMood(i+1)}
                            style={{
                              fontSize:'1.6rem', width:52, height:52, borderRadius:14,
                              border:`2px solid ${mood===i+1?'var(--lime)':'var(--border)'}`,
                              background:mood===i+1?'var(--lime-dim)':'transparent',
                              cursor:'pointer', transition:'all 0.2s',
                              transform:mood===i+1?'scale(1.2)':'scale(1)',
                              boxShadow:mood===i+1?'0 0 16px rgba(188,255,71,0.3)':'none'
                            }}>{e}</button>
                        ))}
                      </div>
                    </div>

                    {/* Journal */}
                    <div>
                      <label className="label" style={{ display:'block', marginBottom:'0.6rem' }}>Notes & Journal</label>
                      <textarea className="input" rows={3} value={journal} onChange={e=>setJournal(e.target.value)}
                        placeholder="What did you build today? Any wins or struggles?" />
                    </div>

                    <button className="btn btn-lime" onClick={handleCheckin} disabled={savingCheckin||checkinSaved}
                      style={{ alignSelf:'flex-start', padding:'0.9rem 2.2rem', fontSize:'0.95rem' }}>
                      {checkinSaved ? '✅ Already saved today!' : savingCheckin ? '⏳ Saving...' : '💾 Save Check-in'}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* HISTORY */}
            {activeTab==='history' && (
              <div className="glass" style={{ padding:'2rem' }}>
                <h2 style={{ fontSize:'1.2rem', marginBottom:'1.5rem' }}>📈 Check-in History</h2>
                {checkins.length===0 ? (
                  <div style={{ textAlign:'center', padding:'3rem', color:'var(--muted)' }}>
                    No history yet. Complete your first check-in!
                  </div>
                ) : (
                  <div style={{ overflowX:'auto' }}>
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Date</th><th>Mood</th><th>Notes</th><th>Score</th>
                        </tr>
                      </thead>
                      <tbody>
                        {checkins.slice(0,14).map((c,i) => (
                          <motion.tr key={c.id} initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }} transition={{ delay:i*0.04 }}>
                            <td style={{ color:'var(--teal)', fontWeight:500 }}>{c.date}</td>
                            <td style={{ fontSize:'1.2rem' }}>{['😔','😐','🙂','😊','🔥'][c.mood-1]||'—'}</td>
                            <td style={{ color:'var(--muted)', maxWidth:200, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                              {c.journal_note||'—'}
                            </td>
                            <td>
                              <span className="badge" style={{ background:'var(--lime-dim)', color:'var(--lime)', border:'1px solid rgba(188,255,71,0.15)' }}>
                                {c.overall_score||0}%
                              </span>
                            </td>
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
                  <div className="glass glass-lime" style={{ padding:'4rem 2rem', textAlign:'center' }}>
                    <motion.div animate={{ rotate:[0,5,-5,0] }} transition={{ repeat:Infinity, duration:3 }} style={{ fontSize:'4rem', marginBottom:'1.5rem', display:'inline-block' }}>🤖</motion.div>
                    <h2 style={{ marginBottom:'0.75rem', fontSize:'1.5rem' }}>AI Progress Analysis</h2>
                    <p style={{ color:'var(--muted)', marginBottom:'2.5rem', maxWidth:380, margin:'0 auto 2.5rem', lineHeight:1.8 }}>
                      The AI analyzes your last 7 days, calculates real success percentages, and gives Hinglish feedback.
                    </p>
                    <button className="btn btn-lime" onClick={handleRunAI} style={{ padding:'1rem 2.5rem', fontSize:'1rem' }}>
                      ⚡ Run AI Analysis
                    </button>
                  </div>
                )}

                {aiLoading && (
                  <div className="glass" style={{ padding:'4rem 2rem', textAlign:'center' }}>
                    <motion.div animate={{ scale:[1,1.1,1], opacity:[1,0.7,1] }} transition={{ repeat:Infinity, duration:1.5 }}
                      style={{ fontSize:'3.5rem', marginBottom:'1rem', display:'inline-block' }}>⚡</motion.div>
                    <h2 style={{ color:'var(--lime)', marginBottom:'0.5rem' }}>AI is analyzing<span className="loading-dots" /></h2>
                    <p style={{ color:'var(--muted)', marginBottom:'2rem' }}>Calculating your trajectory...</p>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(150px, 1fr))', gap:'1rem', maxWidth:600, margin:'0 auto' }}>
                      {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height:120 }} />)}
                    </div>
                  </div>
                )}

                {aiResult && !aiLoading && (
                  <div style={{ display:'flex', flexDirection:'column', gap:'1.5rem' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'1.2rem' }}>
                      {goals.map((goal,i) => {
                        const upd = (aiResult.updates||[]).find(u=>u.goal_id===goal.id);
                        return (
                          <motion.div key={goal.id} className="glass" initial={{ opacity:0, scale:0.92 }} animate={{ opacity:1, scale:1 }} transition={{ delay:i*0.1 }}
                            style={{ padding:'1.8rem', textAlign:'center', background:COLORS_DIM[i%5], borderColor:`${COLORS[i%5]}25` }}>
                            <Ring value={goal.current_progress||0} color={COLORS[i%5]} size={90} />
                            <p style={{ marginTop:'1rem', fontWeight:600, fontSize:'0.88rem', lineHeight:1.4 }}>{goal.title}</p>
                            {upd && <p style={{ color:'var(--muted)', fontSize:'0.78rem', marginTop:'0.6rem', lineHeight:1.6 }}>{upd.feedback}</p>}
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
