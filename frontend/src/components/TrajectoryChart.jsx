import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';

export default function TrajectoryChart({ data }) {
  // Mocking some trajectory data if none provided
  const chartData = data || [
    { name: 'Day 1', actual: 20, predicted: 22 },
    { name: 'Day 2', actual: 35, predicted: 38 },
    { name: 'Day 3', actual: 45, predicted: 50 },
    { name: 'Day 4', actual: 58, predicted: 62 },
    { name: 'Day 5', actual: null, predicted: 75 },
    { name: 'Day 6', actual: null, predicted: 88 },
    { name: 'Day 7', actual: null, predicted: 100 },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass" 
      style={{ padding: '2rem', height: '400px', border: '1px solid var(--glass-stroke)' }}
    >
      <div className="hud-label" style={{ marginBottom: '2rem', color: 'var(--lime)', display: 'flex', justifyContent: 'space-between' }}>
        <span>Trajectory Analysis</span>
        <span style={{ fontSize: '0.6rem', opacity: 0.5 }}>Neural Prediction Active</span>
      </div>
      
      <ResponsiveContainer width="100%" height="80%">
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--lime)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--lime)" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorPred" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--teal)" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="var(--teal)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis 
            dataKey="name" 
            stroke="rgba(255,255,255,0.3)" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
          />
          <YAxis 
            stroke="rgba(255,255,255,0.3)" 
            fontSize={10} 
            tickLine={false} 
            axisLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip 
            contentStyle={{ background: '#030308', border: '1px solid var(--glass-stroke)', borderRadius: '12px' }}
            itemStyle={{ fontSize: '0.8rem' }}
          />
          <Area 
            type="monotone" 
            dataKey="predicted" 
            stroke="var(--teal)" 
            strokeWidth={2}
            strokeDasharray="5 5"
            fillOpacity={1} 
            fill="url(#colorPred)" 
          />
          <Area 
            type="monotone" 
            dataKey="actual" 
            stroke="var(--lime)" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorActual)" 
            dot={{ r: 4, fill: 'var(--lime)', strokeWidth: 0 }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
      
      <div style={{ display: 'flex', gap: '2rem', marginTop: '1.5rem', justifyContent: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 12, height: 2, background: 'var(--lime)' }} />
          <span className="hud-label" style={{ fontSize: '0.6rem' }}>Historical Progress</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <div style={{ width: 12, height: 2, background: 'var(--teal)', borderStyle: 'dashed' }} />
          <span className="hud-label" style={{ fontSize: '0.6rem' }}>AI Prediction</span>
        </div>
      </div>
    </motion.div>
  );
}
