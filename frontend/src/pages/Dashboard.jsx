import { useState, useEffect } from 'react';
import { supabase, api } from '../api/client';
import { motion } from 'framer-motion';

export default function Dashboard({ session }) {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const { data } = await api.get('/goals');
      setGoals(data);
    } catch (error) {
      console.error("Error fetching goals", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleRunAI = async () => {
    try {
      setLoading(true);
      await api.post('/engine/analyze');
      fetchGoals(); // Refresh goals after AI updates %
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading data...</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h1 style={{ color: 'var(--text-primary)' }}>
          WELCOME, <span style={{ color: 'var(--accent-lime)' }}>{session.user.user_metadata.full_name?.toUpperCase() || 'FOUNDER'}</span>
        </h1>
        <button onClick={handleLogout} className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--card-border)', color: 'var(--text-muted)' }}>
          LOGOUT
        </button>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {goals.length === 0 ? (
          <div className="glass-card" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1rem' }}>No Goals Found</h3>
            <p style={{ color: 'var(--text-muted)' }}>You haven't set up any goals yet. The onboarding flow will handle this in full production.</p>
          </div>
        ) : (
          goals.map((goal, idx) => (
            <motion.div 
              key={goal.id} 
              className="glass-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <h3 style={{ color: 'var(--accent-teal)', marginBottom: '0.5rem' }}>{goal.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>{goal.description}</p>
              
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
                <span style={{ fontSize: '3rem', fontFamily: 'Space Grotesk', fontWeight: '700', lineHeight: 1 }}>
                  {goal.current_progress || 0}
                </span>
                <span style={{ color: 'var(--text-muted)', paddingBottom: '0.5rem' }}>%</span>
              </div>
              <div style={{ width: '100%', height: '4px', background: 'rgba(255,255,255,0.1)', marginTop: '1rem', borderRadius: '2px' }}>
                <div style={{ width: `${goal.current_progress || 0}%`, height: '100%', background: 'var(--accent-lime)', borderRadius: '2px', transition: 'width 1s ease' }}></div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      <div style={{ textAlign: 'center', marginTop: '4rem' }}>
        <button onClick={handleRunAI} className="btn-primary">
          RUN DAILY AI ANALYSIS
        </button>
      </div>
    </div>
  );
}
