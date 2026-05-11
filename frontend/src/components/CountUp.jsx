import { useEffect, useRef, useState } from 'react';

export default function CountUp({ target = 0, duration = 1400, suffix = '' }) {
  const [display, setDisplay] = useState(0);
  const startRef = useRef(null);
  const prevTarget = useRef(0);

  useEffect(() => {
    const from = prevTarget.current;
    prevTarget.current = target;
    if (from === target) return;

    startRef.current = null;
    const step = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3); // cubic ease-out
      setDisplay(Math.round(from + (target - from) * ease));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration]);

  return <>{display}{suffix}</>;
}
