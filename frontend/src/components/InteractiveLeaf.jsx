import { useState, useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function InteractiveLeaf({ side = 'left' }) {
  const [isBurning, setIsBurning] = useState(false);
  const ref = useRef(null);

  // 3D Tilt Logic
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['15deg', '-15deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['-15deg', '15deg']);

  const handleMouseMove = (e) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  const triggerBurn = () => {
    setIsBurning(true);
    setTimeout(() => setIsBurning(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: side === 'left' ? -200 : 200 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        bottom: '40px',
        [side]: '40px',
        zIndex: 1000,
        width: '240px',
        perspective: '1000px'
      }}
    >
      <motion.div
        ref={ref}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={triggerBurn}
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          cursor: 'pointer',
          position: 'relative'
        }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Main Leaf Image */}
        <motion.img
          src="/3d-leaf.png"
          alt="3D Cannabis Leaf"
          style={{
            width: '100%',
            filter: isBurning 
              ? 'drop-shadow(0 0 30px #FF4D00) brightness(1.5) saturate(2)' 
              : 'drop-shadow(0 0 15px rgba(188,255,71,0.3))',
            transition: 'filter 0.3s ease',
            transform: side === 'right' ? 'scaleX(-1)' : 'none'
          }}
          animate={isBurning ? {
            scale: [1, 1.05, 1],
            rotate: [0, 2, -2, 0]
          } : {
            y: [0, -10, 0]
          }}
          transition={isBurning ? { duration: 0.2, repeat: 10 } : { duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        {/* Fire Sparks Overlay when burning */}
        {isBurning && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
            {[...Array(12)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, scale: 0, x: 0, y: 0 }}
                animate={{ 
                  opacity: 0, 
                  scale: Math.random() * 2, 
                  x: (Math.random() - 0.5) * 200, 
                  y: (Math.random() - 1) * 200 
                }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  left: '50%',
                  top: '50%',
                  width: '6px',
                  height: '6px',
                  backgroundColor: i % 2 === 0 ? '#FF4D00' : '#FFCC00',
                  borderRadius: '50%',
                  boxShadow: '0 0 10px #FF4D00'
                }}
              />
            ))}
          </div>
        )}

        {/* Constant Glow Aura */}
        <div style={{
          position: 'absolute',
          bottom: '-20px',
          left: '50%',
          transform: 'translateX(-50%) translateZ(-50px)',
          width: '140px',
          height: '30px',
          background: isBurning 
            ? 'radial-gradient(ellipse at center, rgba(255,77,0,0.4) 0%, transparent 80%)'
            : 'radial-gradient(ellipse at center, rgba(188,255,71,0.2) 0%, transparent 80%)',
          borderRadius: '50%',
          filter: 'blur(10px)',
          transition: 'background 0.3s ease'
        }} />
      </motion.div>
    </motion.div>
  );
}
