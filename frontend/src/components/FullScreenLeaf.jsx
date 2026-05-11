import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FullScreenLeaf() {
  const [activeVeins, setActiveVeins] = useState(new Set());
  const [igniteBurst, setIgniteBurst] = useState(false);

  // Vein network with connectivity
  const veins = [
    { id: 1, d: "M 500 500 L 500 100", connections: [2, 3] },
    { id: 2, d: "M 500 100 L 300 50", connections: [1] },
    { id: 3, d: "M 500 100 L 700 50", connections: [1] },
    { id: 4, d: "M 500 500 L 200 200", connections: [5] },
    { id: 5, d: "M 200 200 L 100 150", connections: [4] },
    { id: 6, d: "M 500 500 L 800 200", connections: [7] },
    { id: 7, d: "M 800 200 L 900 150", connections: [6] },
    { id: 8, d: "M 500 500 L 150 500", connections: [9] },
    { id: 9, d: "M 150 500 L 50 550", connections: [8] },
    { id: 10, d: "M 500 500 L 850 500", connections: [11] },
    { id: 11, d: "M 850 500 L 950 550", connections: [10] },
    { id: 12, d: "M 500 500 L 250 850", connections: [] },
    { id: 13, d: "M 500 500 L 750 850", connections: [] },
  ];

  const igniteVein = (id) => {
    setActiveVeins(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    
    // Spread to connections
    const vein = veins.find(v => v.id === id);
    if (vein && vein.connections) {
      vein.connections.forEach(connId => {
        if (!activeVeins.has(connId)) {
          setTimeout(() => igniteVein(connId), 150);
        }
      });
    }
  };

  const handleLeafClick = () => {
    setIgniteBurst(true);
    veins.forEach(v => igniteVein(v.id));
    setTimeout(() => {
      setIgniteBurst(false);
      setActiveVeins(new Set());
    }, 3000);
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: -1,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden', backgroundColor: '#04040A'
    }} onClick={handleLeafClick}>
      
      {/* SVG Filters for Heat Distortion */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <filter id="heat">
          <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="3" seed="1">
            <animate attributeName="seed" from="1" to="100" dur="2s" repeatCount="indefinite" />
          </feTurbulence>
          <feDisplacementMap in="SourceGraphic" scale="15" />
        </filter>
      </svg>

      <motion.div className="heat-distort" style={{ width:'100%', height:'100%', position:'relative' }}>
        <motion.img
          src="/hero-leaf.png"
          alt="Hero Leaf"
          initial={{ scale: 1.2, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.9 }}
          transition={{ duration: 3, ease: 'easeOut' }}
          style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'brightness(0.7) contrast(1.2)' }}
        />

        <svg viewBox="0 0 1000 1000" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
          {veins.map((vein) => (
            <g key={vein.id} onMouseEnter={() => igniteVein(vein.id)}>
              <path d={vein.d} stroke="transparent" strokeWidth="60" fill="none" style={{ cursor: 'pointer', pointerEvents: 'all' }} />
              <motion.path
                d={vein.d}
                stroke={activeVeins.has(vein.id) ? '#FF3D00' : 'rgba(255,123,0,0.05)'}
                strokeWidth={activeVeins.has(vein.id) ? "5" : "2"}
                fill="none"
                animate={{
                  stroke: activeVeins.has(vein.id) ? ['#FF3D00', '#FFB347', '#FF3D00'] : 'rgba(255,123,0,0.05)',
                  filter: activeVeins.has(vein.id) ? 'blur(2px) drop-shadow(0 0 15px #FF3D00)' : 'none'
                }}
                transition={{ duration: 0.8, repeat: activeVeins.has(vein.id) ? Infinity : 0 }}
              />
              {activeVeins.has(vein.id) && (
                <motion.circle r="4" fill="#FFF">
                  <animateMotion path={vein.d} dur="0.6s" repeatCount="indefinite" />
                </motion.circle>
              )}
            </g>
          ))}
        </svg>
      </motion.div>

      {/* Holographic HUD Overlays */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none' }}>
        <motion.div initial={{opacity:0, x:-50}} animate={{opacity:0.6, x:0}} style={{position:'absolute', top:'10%', left:'5%'}}>
          <div className="hud-label">SYSTEM_CORE: ACTIVE</div>
          <div className="hud-label" style={{fontSize:'0.5rem'}}>TEMP: 1450K | SYNC: 98.4%</div>
          <div style={{width:100, height:2, background:'var(--fire)', marginTop:4}}/>
        </motion.div>
        
        <motion.div initial={{opacity:0, x:50}} animate={{opacity:0.6, x:0}} style={{position:'absolute', bottom:'15%', right:'5%', textAlign:'right'}}>
          <div className="hud-label">AI_CMD_CENTER_v4.2</div>
          <div className="hud-label" style={{fontSize:'0.5rem'}}>SCANNING_VEINS... [OK]</div>
          <div style={{width:120, height:1, background:'var(--fire)', marginTop:4, marginLeft:'auto'}}/>
        </motion.div>
      </div>

      {/* Bottom Fire Gradient (Fire Rain atmosphere) */}
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '40vh',
        background: 'linear-gradient(to top, rgba(255,77,0,0.15), transparent)',
        pointerEvents: 'none'
      }} />

      {/* Vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(circle, transparent 20%, rgba(3,3,8,0.8) 100%)',
        pointerEvents: 'none'
      }} />
    </div>
  );
}
