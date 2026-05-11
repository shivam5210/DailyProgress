import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase, api } from '../api/client';

export default function Dashboard({ session }) {
  const [goals, setGoals] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [loadingGoals, setLoadingGoals] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [activeTab, setActiveTab] = useState('today');
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [savingCheckin, setSavingCheckin] = useState(false);
  const [checkinSaved, setCheckinSaved] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [problemsText, setProblemsText] = useState('');
  const [onboardLoading, setOnboardLoading] = useState(false);
  const [todayLogs, setTodayLogs] = useState({});
  const [mood, setMood] = useState(3);
  const [journalNote, setJournalNote] = useState('');
  const [toast, setToast] = useState(null);

  const user = session.user;
  const displayName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'Founder';

  // Load data on first render
  useState(() => {
    loadAll();
  }, []);

  async function loadAll() {
    if (initialized) return;
    setInitialized(true);
    setLoadingGoals(true);
    try {
      const [goalsRes, checkinsRes] = await Promise.all([
        api.get('/goals').catch(() => ({ data: [] })),
        api.get('/checkins').catch(() => ({ data: [] }))
      ]);
      setGoals(goalsRes.data || []);
      setCheckins(checkinsRes.data || []);
      if ((goalsRes.data || []).length === 0) setShowOnboarding(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingGoals(false);
    }
  }

  async function handleOnboard(e) {
    e.preventDefault();
    if (!problemsText.trim()) return;
    setOnboardLoading(true);
    const lines = problemsText.split('\n').map(l => l.trim()).filter(Boolean);
    try {
      for (const line of lines) {
        await api.post('/goals', {
          title: line,
          description: '',
          goal_type: 'reduce'
        });
      }
      showToast('Goals created! Start your first check-in.', 'lime');
      setShowOnboarding(false);
      loadAll();
    } catch (e) {
      showToast('Error creating goals: ' + e.message, 'red');
    } finally {
      setOnboardLoading(false);
    }
  }

  async function handleCheckin() {
    if (goals.length === 0) return;
    setSavingCheckin(true);
    const today = new Date().toISOString().split('T')[0];
    const logs = goals.map(g => ({
      goal_id: g.id,
      value: todayLogs[g.id] !== undefined ? todayLogs[g.id] : 0
    }));
    try {
      await api.post('/checkins', { date: today, mood, journal_note: journalNote, logs });
      setCheckinSaved(true);
      showToast('✅ Check-in saved!', 'lime');
    } catch (e) {
      showToast('Error saving check-in', 'red');
    } finally {
      setSavingCheckin(false);
    }
  }

  async function handleRunAI() {
    setAiLoading(true);
    setActiveTab('ai');
    try {
      const { data } = await api.post('/engine/analyze');
      setAiResult(data);
      const { data: updatedGoals } = await api.get('/goals');
      setGoals(updatedGoals || []);
      showToast('AI analysis complete!', 'lime');
    } catch (e) {
      showToast('AI analysis failed: ' + e.message, 'red');
    } finally {
      setAiLoading(false);
    }
  }

  function showToast(msg, type = 'lime') {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  const handleLogout = () => supabase.auth.signOut();

  const today = new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  const overallAvg = goals.length > 0 ? Math.round(goals.reduce((a, g) => a + (g.current_progress || 0), 0) / goals.length) : 0;

  // Colors for goals
  const goalColors = ['var(--accent-lime)', 'var(--accent-teal)', 'var(--accent-violet)', 'var(--accent-orange)', 'var(--accent-green)'];

  return (
    <div style={{ minHeight: '100vh', maxWidth: 960, margin: '0 auto', padding: '1.5rem' }}>
      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            position: 'fixed', top: '1.5rem', left: '50%', transform: 'translateX(-50%)',
            background: toast.type === 'lime' ? 'var(--accent-lime)' : 'var(--accent-red)',
            color: 'var(--bg-void)', padding: '0.75rem 1.5rem', borderRadius: '999px',
            fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '0.9rem',
            zIndex: 9999, boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
          }}
        >{toast.msg}</motion.div>
      )}

      {/* Onboarding Modal */}
      {showOnboarding && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(4,4,10,0.92)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: '1.5rem' }}>
          <motion.div className="glass" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} style={{ maxWidth: 500, width: '100%', padding: '2.5rem' }}>
            <h2 style={{ marginBottom: '0.5rem', color: 'var(--accent-lime)' }}>👋 Welcome, {displayName}!</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: 1.7 }}>
              List your <strong style={{ color: 'var(--text-primary)' }}>4–5 problems</strong> you want to fix, one per line.<br />
              The AI will track your daily progress toward solving each one.
            </p>
            <form onSubmit={handleOnboard} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <textarea
                className="input"
                placeholder={"e.g.:\nQuit smoking (currently 20/day)\nQuit weed\nBuild startup contacts\nWork on vsquaree daily"}
                value={problemsText}
                onChange={(e) => setProblemsText(e.target.value)}
                rows={6}
                required
              />
              <button type="submit" className="btn btn-lime" disabled={onboardLoading}>
                {onboardLoading ? '⏳ Creating goals...' : '🚀 Start Tracking'}
              </button>
            </form>
          </motion.div>
        </div>
      )}

      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🎯</span>
            <h1 style={{ fontSize: '1.4rem', color: 'var(--text-primary)' }}>
              Hey, <span style={{ color: 'var(--accent-lime)' }}>{displayName}</span>
            </h1>
          </div>
          <p className="label" style={{ marginLeft: '2.3rem', marginTop: '0.2rem' }}>{today}</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1.8rem', fontFamily: 'Space Grotesk', fontWeight: 700, color: 'var(--accent-lime)', lineHeight: 1 }}>{overallAvg}%</div>
            <div className="label">OVERALL</div>
          </div>
          <button className="btn btn-ghost" onClick={handleLogout}>Sign Out</button>
        </div>
      </header>

      {/* Goal Cards Row */}
      {loadingGoals ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[1, 2, 3, 4].map(i => <div key={i} className="skeleton" style={{ height: 120 }} />)}
        </div>
      ) : goals.length > 0 ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {goals.map((goal, i) => (
            <motion.div key={goal.id} className="glass" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}
              style={{ padding: '1.2rem', cursor: 'default' }}>
              <p className="label" style={{ marginBottom: '0.6rem', color: goalColors[i % goalColors.length] }}>
                GOAL {i + 1}
              </p>
              <p style={{ fontSize: '0.85rem', fontWeight: 500, marginBottom: '0.8rem', lineHeight: 1.4 }}>{goal.title}</p>
              <div style={{ fontSize: '2.2rem', fontFamily: 'Space Grotesk', fontWeight: 700, color: goalColors[i % goalColors.length], lineHeight: 1 }}>
                {goal.current_progress || 0}%
              </div>
              <div style={{ marginTop: '0.6rem', height: 3, background: 'rgba(255,255,255,0.08)', borderRadius: 9999 }}>
                <div style={{ width: `${goal.current_progress || 0}%`, height: '100%', background: goalColors[i % goalColors.length], borderRadius: 9999, transition: 'width 1s ease' }} />
              </div>
            </motion.div>
          ))}
        </div>
      ) : null}

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', background: 'var(--bg-card)', padding: '0.4rem', borderRadius: 999, width: 'fit-content', border: '1px solid var(--border-dim)' }}>
        {['today', 'history', 'ai'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              fontFamily: 'Space Grotesk', fontWeight: 600, fontSize: '0.85rem',
              padding: '0.5rem 1.2rem', borderRadius: 999, border: 'none', cursor: 'pointer',
              letterSpacing: '0.05em', transition: 'all 0.2s',
              background: activeTab === tab ? 'var(--accent-lime)' : 'transparent',
              color: activeTab === tab ? 'var(--bg-void)' : 'var(--text-muted)'
            }}>
            {tab === 'today' ? '📋 TODAY' : tab === 'history' ? '📈 HISTORY' : '🤖 AI ANALYSIS'}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <motion.div key={activeTab} initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25 }}>

        {/* TODAY TAB */}
        {activeTab === 'today' && (
          <div className="glass" style={{ padding: '2rem' }}>
            <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>📋 Daily Check-in</h2>
            {goals.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p style={{ color: 'var(--text-muted)' }}>No goals set up yet.</p>
                <button className="btn btn-lime" onClick={() => setShowOnboarding(true)} style={{ marginTop: '1rem' }}>+ Add Goals</button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {/* Goals Input */}
                {goals.map((goal, i) => (
                  <div key={goal.id}>
                    <label className="label" style={{ display: 'block', marginBottom: '0.5rem', color: goalColors[i % goalColors.length] }}>
                      {goal.title}
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <input type="range" min={0} max={100} value={todayLogs[goal.id] || 0}
                        onChange={(e) => setTodayLogs(p => ({ ...p, [goal.id]: parseInt(e.target.value) }))}
                        style={{ flex: 1, accentColor: goalColors[i % goalColors.length] }}
                      />
                      <span style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '1.1rem', minWidth: 45, textAlign: 'right', color: goalColors[i % goalColors.length] }}>
                        {todayLogs[goal.id] || 0}%
                      </span>
                    </div>
                  </div>
                ))}

                {/* Mood */}
                <div>
                  <label className="label" style={{ display: 'block', marginBottom: '0.75rem' }}>Mood Today</label>
                  <div style={{ display: 'flex', gap: '0.75rem' }}>
                    {['😔', '😐', '🙂', '😊', '🔥'].map((emoji, i) => (
                      <button key={i} onClick={() => setMood(i + 1)}
                        style={{
                          fontSize: '1.5rem', width: 48, height: 48, borderRadius: 12,
                          border: `2px solid ${mood === i + 1 ? 'var(--accent-lime)' : 'var(--border-dim)'}`,
                          background: mood === i + 1 ? 'rgba(188,255,71,0.1)' : 'transparent',
                          cursor: 'pointer', transition: 'all 0.2s',
                          transform: mood === i + 1 ? 'scale(1.15)' : 'scale(1)'
                        }}>
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Journal */}
                <div>
                  <label className="label" style={{ display: 'block', marginBottom: '0.5rem' }}>Notes / Wins / Journal</label>
                  <textarea className="input" rows={3} placeholder="What did you accomplish today? Any struggles?"
                    value={journalNote} onChange={(e) => setJournalNote(e.target.value)} />
                </div>

                {/* Save */}
                <button className="btn btn-lime" onClick={handleCheckin} disabled={savingCheckin || checkinSaved}
                  style={{ alignSelf: 'flex-start', padding: '0.85rem 2rem', fontSize: '1rem' }}>
                  {checkinSaved ? '✅ Saved!' : savingCheckin ? '⏳ Saving...' : '💾 Save Check-in'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {activeTab === 'history' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="glass" style={{ padding: '1.5rem' }}>
              <h2 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>📈 Recent Check-ins</h2>
              {checkins.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No history yet. Complete your first check-in!</p>
              ) : (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid var(--border-dim)' }}>
                        <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, fontFamily: 'DM Mono' }}>DATE</th>
                        <th style={{ padding: '0.75rem', textAlign: 'center', color: 'var(--text-muted)', fontWeight: 500, fontFamily: 'DM Mono' }}>MOOD</th>
                        <th style={{ padding: '0.75rem', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 500, fontFamily: 'DM Mono' }}>NOTES</th>
                      </tr>
                    </thead>
                    <tbody>
                      {checkins.slice(0, 14).map((c) => (
                        <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                          <td style={{ padding: '0.75rem', color: 'var(--accent-teal)' }}>{c.date}</td>
                          <td style={{ padding: '0.75rem', textAlign: 'center', fontSize: '1.2rem' }}>
                            {['😔', '😐', '🙂', '😊', '🔥'][c.mood - 1] || '—'}
                          </td>
                          <td style={{ padding: '0.75rem', color: 'var(--text-muted)', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {c.journal_note || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI TAB */}
        {activeTab === 'ai' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {!aiResult && !aiLoading && (
              <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🤖</div>
                <h2 style={{ marginBottom: '0.75rem' }}>AI Progress Analysis</h2>
                <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: 1.7, maxWidth: 400, margin: '0 auto 2rem' }}>
                  The AI will analyze your last 7 days of check-ins, calculate real success percentages for each goal, and give you Hinglish feedback.
                </p>
                <button className="btn btn-lime" onClick={handleRunAI} style={{ padding: '1rem 2.5rem', fontSize: '1rem' }}>
                  ⚡ Run AI Analysis
                </button>
              </div>
            )}

            {aiLoading && (
              <div className="glass" style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚡</div>
                <h2 style={{ color: 'var(--accent-lime)' }}>AI is thinking<span className="loading-dots" /></h2>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem' }}>Analyzing your 7-day trajectory...</p>
                <div style={{ marginTop: '2rem', display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                  {[0,1,2,3].map(i => <div key={i} className="skeleton" style={{ width: 120, height: 100, borderRadius: 12 }} />)}
                </div>
              </div>
            )}

            {aiResult && !aiLoading && (
              <>
                {/* Goal Percentages */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
                  {goals.map((goal, i) => {
                    const update = (aiResult.updates || []).find(u => u.goal_id === goal.id);
                    return (
                      <motion.div key={goal.id} className="glass" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                        style={{ padding: '1.5rem', textAlign: 'center' }}>
                        <Ring value={goal.current_progress || 0} color={goalColors[i % goalColors.length]} size={80} />
                        <p style={{ marginTop: '1rem', fontWeight: 600, fontSize: '0.9rem' }}>{goal.title}</p>
                        {update && <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '0.5rem', lineHeight: 1.5 }}>{update.feedback}</p>}
                      </motion.div>
                    );
                  })}
                </div>
                {/* Re-run */}
                <button className="btn btn-ghost" onClick={handleRunAI} style={{ alignSelf: 'flex-start' }}>
                  🔄 Run Again
                </button>
              </>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

// SVG Ring Component
function Ring({ value, color, size = 80 }) {
  const r = size * 0.4;
  const circumference = 2 * Math.PI * r;
  const dashOffset = circumference - (value / 100) * circumference;

  return (
    <svg width={size} height={size} style={{ display: 'block', margin: '0 auto' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={size * 0.1} />
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={size * 0.1}
        strokeDasharray={circumference} strokeDashoffset={dashOffset}
        strokeLinecap="round"
        style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', transition: 'stroke-dashoffset 1s ease' }}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
        style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: size * 0.22, fill: color }}>
        {value}%
      </text>
    </svg>
  );
}
