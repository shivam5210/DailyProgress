import { motion } from 'framer-motion';

export default function BurningLeaf({ side = 'left' }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: side === 'left' ? -100 : 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 1.5, ease: 'easeOut' }}
      style={{
        position: 'fixed',
        bottom: '5vh',
        [side]: '2vw',
        zIndex: 5,
        width: '200px',
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}
    >
      <div style={{ position: 'relative' }}>
        {/* Mirror for right side */}
        <motion.img
          src="/leaf.png"
          alt="Burning Leaf"
          style={{
            width: '100%',
            filter: 'drop-shadow(0 0 15px rgba(188,255,71,0.4))',
            transform: side === 'right' ? 'scaleX(-1)' : 'none'
          }}
          animate={{
            y: [0, -10, 0],
            rotate: [0, 2, -2, 0]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />

        {/* Animated Fire/Burn effects at the bottom/edges */}
        <motion.div
          style={{
            position: 'absolute',
            bottom: '10%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '60px',
            height: '60px',
            background: 'radial-gradient(circle, #FF4D00 20%, transparent 70%)',
            filter: 'blur(10px)',
            mixBlendMode: 'screen',
            zIndex: -1
          }}
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 0.5,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
        
        {/* Smoke swirls (CSS simulated) */}
        <motion.div
          style={{
            position: 'absolute',
            top: '-20%',
            right: side === 'left' ? '10%' : 'auto',
            left: side === 'right' ? '10%' : 'auto',
            width: '4px',
            height: '4px',
            background: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            boxShadow: '0 0 20px 10px rgba(255,255,255,0.05)'
          }}
          animate={{
            y: [0, -100],
            x: [0, 20, -20, 10],
            opacity: [0, 0.5, 0],
            scale: [1, 5]
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'linear'
          }}
        />
      </div>

      {/* Glow aura beneath */}
      <div style={{
        marginTop: '-20px',
        width: '100px',
        height: '20px',
        background: 'radial-gradient(ellipse at center, rgba(188,255,71,0.2) 0%, transparent 80%)',
        borderRadius: '50%',
        filter: 'blur(5px)'
      }} />
    </motion.div>
  );
}
