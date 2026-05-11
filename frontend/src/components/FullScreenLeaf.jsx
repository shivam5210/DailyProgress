import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function FullScreenLeaf() {
  const [activeVein, setActiveVein] = useState(null);

  // Approximate vein paths for a cannabis leaf structure
  const veins = [
    { id: 1, d: "M 500 500 L 500 100", label: "Top Central" },
    { id: 2, d: "M 500 500 L 250 200", label: "Top Left" },
    { id: 3, d: "M 500 500 L 750 200", label: "Top Right" },
    { id: 4, d: "M 500 500 L 150 450", label: "Bottom Left Upper" },
    { id: 5, d: "M 500 500 L 850 450", label: "Bottom Right Upper" },
    { id: 6, d: "M 500 500 L 250 800", label: "Bottom Left Lower" },
    { id: 7, d: "M 500 500 L 750 800", label: "Bottom Right Lower" },
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: -1,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      backgroundColor: '#030308'
    }}>
      {/* The Hero Image */}
      <motion.img
        src="/hero-leaf.png"
        alt="Hero Leaf"
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.85 }}
        transition={{ duration: 2, ease: 'easeOut' }}
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          filter: 'brightness(0.6) saturate(1.2) contrast(1.1)',
        }}
      />

      {/* SVG Vein Overlay */}
      <svg
        viewBox="0 0 1000 1000"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none'
        }}
      >
        {veins.map((vein) => (
          <g key={vein.id}>
            {/* Hit area for mouse */}
            <path
              d={vein.d}
              stroke="transparent"
              strokeWidth="40"
              fill="none"
              style={{ pointerEvents: 'all', cursor: 'pointer' }}
              onMouseEnter={() => setActiveVein(vein.id)}
              onMouseLeave={() => setActiveVein(null)}
            />
            
            {/* Visual vein line */}
            <motion.path
              d={vein.d}
              stroke={activeVein === vein.id ? '#FF4D00' : 'rgba(188,255,71,0.05)'}
              strokeWidth={activeVein === vein.id ? "4" : "2"}
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ 
                pathLength: activeVein === vein.id ? 1 : 0,
                stroke: activeVein === vein.id ? '#FF4D00' : 'rgba(188,255,71,0.05)',
                filter: activeVein === vein.id ? 'blur(2px) drop-shadow(0 0 10px #FF4D00)' : 'none'
              }}
              transition={{ duration: 0.5 }}
            />

            {/* Fire pulses along the vein when active */}
            <AnimatePresence>
              {activeVein === vein.id && (
                <motion.circle
                  r="6"
                  fill="#FFCC00"
                  style={{ filter: 'drop-shadow(0 0 15px #FF4D00)' }}
                  animate={{
                    offsetDistance: ["0%", "100%"],
                    opacity: [0, 1, 0]
                  }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                >
                  <animateMotion path={vein.d} dur="1s" repeatCount="indefinite" />
                </motion.circle>
              )}
            </AnimatePresence>
          </g>
        ))}
      </svg>

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
