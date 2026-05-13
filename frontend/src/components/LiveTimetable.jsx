import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, Zap, Calendar, CheckCircle2 } from 'lucide-react';
import { api } from '../api/client';

export default function LiveTimetable() {
  const [timetable, setTimetable] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('daily_timetable');
    if (saved) {
      setTimetable(JSON.parse(saved));
      setLoading(false);
    } else {
      fetchTimetable();
    }
  }, []);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/engine/timetable');
      const formatted = data.timetable.map(t => ({ ...t, completed: false }));
      setTimetable(formatted);
      localStorage.setItem('daily_timetable', JSON.stringify(formatted));
    } catch (err) {
      console.error("Timetable failed", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleTask = (index) => {
    const updated = [...timetable];
    updated[index].completed = !updated[index].completed;
    setTimetable(updated);
    localStorage.setItem('daily_timetable', JSON.stringify(updated));
  };

  return (
    <div className="glass" style={{ padding: '2.5rem', border: '1px solid var(--teal-glow)' }}>
      <div className="glass-inner-glow"/>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Calendar className="neon-teal" style={{ color: 'var(--teal)' }} />
          <h2 style={{ fontSize: '1.8rem', margin: 0 }}>Live AI Timetable</h2>
        </div>
        <button className="btn" style={{ fontSize: '0.7rem', padding: '0.6rem 1.2rem', background: 'rgba(255,255,255,0.05)' }} onClick={fetchTimetable}>
          <Zap size={14} /> Recalculate
        </button>
      </div>

      {loading ? (
        <div className="sk" style={{ height: 300 }}/>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {timetable.map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => toggleTask(i)}
              style={{ 
                display: 'flex', 
                gap: '2rem', 
                padding: '1.2rem', 
                background: item.completed ? 'rgba(188, 255, 71, 0.05)' : 'rgba(255,255,255,0.02)', 
                borderRadius: '16px', 
                border: '1px solid',
                borderColor: item.completed ? 'var(--lime)' : 'var(--glass-stroke)',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{ minWidth: '80px', display: 'flex', alignItems: 'center', gap: '0.5rem', color: item.completed ? 'var(--lime)' : 'var(--teal)' }}>
                {item.completed ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                <span className="num" style={{ fontSize: '1.1rem' }}>{item.time}</span>
              </div>
              <div style={{ 
                flex: 1, 
                fontSize: '1rem', 
                fontWeight: 500,
                textDecoration: item.completed ? 'line-through' : 'none',
                opacity: item.completed ? 0.5 : 1
              }}>
                {item.task}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
