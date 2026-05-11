import { useEffect, useRef } from 'react';

export default function ParticleCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animId;
    let W, H;
    const PARTICLE_COUNT = 90;
    const particles = [];

    const COLORS = ['#BCFF47', '#00E5CC', '#9B7FFF', '#FF6B2B', '#3DFF8F'];

    function resize() {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    }

    class Particle {
      constructor() { this.reset(); }
      reset() {
        this.x = Math.random() * W;
        this.y = Math.random() * H;
        this.vx = (Math.random() - 0.5) * 0.4;
        this.vy = (Math.random() - 0.5) * 0.4;
        this.r = Math.random() * 1.5 + 0.5;
        this.color = COLORS[Math.floor(Math.random() * COLORS.length)];
        this.alpha = Math.random() * 0.5 + 0.2;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = Math.random() * 0.02 + 0.005;
      }
      update() {
        this.x += this.vx; this.y += this.vy;
        this.pulse += this.pulseSpeed;
        if (this.x < 0 || this.x > W || this.y < 0 || this.y > H) this.reset();
      }
      draw() {
        if (!isFinite(this.x) || !isFinite(this.y)) return;
        const a = this.alpha * (0.6 + 0.4 * Math.sin(this.pulse));
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r * (0.8 + 0.2 * Math.sin(this.pulse)), 0, Math.PI * 2);
        ctx.fillStyle = this.color + Math.floor(a * 255).toString(16).padStart(2, '0');
        ctx.shadowBlur = 12;
        ctx.shadowColor = this.color;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }

    class Comet {
      constructor() { this.reset(); }
      reset() {
        const spawnSide = Math.random();
        if (spawnSide < 0.5) {
          this.x = Math.random() * (W * 0.4) - 100;
          this.y = -50;
        } else {
          this.x = -50;
          this.y = Math.random() * (H * 0.4) - 100;
        }
        this.speed = Math.random() * 4 + 6;
        this.angle = Math.PI / 4 + (Math.random() - 0.5) * 0.2;
        this.vx = Math.cos(this.angle) * this.speed;
        this.vy = Math.sin(this.angle) * this.speed;
        this.size = Math.random() * 2 + 1;
        this.color = ['#FF4D00', '#FF8E00', '#FFCC00'][Math.floor(Math.random() * 3)];
      }
      update() {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x > W + 200 || this.y > H + 200) this.reset();
      }
      draw() {
        if (!isFinite(this.x) || !isFinite(this.y) || !isFinite(this.vx) || !isFinite(this.vy)) return;
        ctx.save();
        const grad = ctx.createLinearGradient(this.x, this.y, this.x - this.vx * 12, this.y - this.vy * 12);
        grad.addColorStop(0, this.color);
        grad.addColorStop(1, 'transparent');
        ctx.beginPath();
        ctx.strokeStyle = grad;
        ctx.lineWidth = this.size;
        ctx.lineCap = 'round';
        ctx.moveTo(this.x, this.y);
        ctx.lineTo(this.x - this.vx * 10, this.y - this.vy * 10);
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.color;
        ctx.stroke();
        ctx.restore();
      }
    }

    resize();
    const comets = [];
    for (let i = 0; i < 5; i++) comets.push(new Comet());

    for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());

    function drawLines() {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.12;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(188,255,71,${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
    }

    function loop() {
      ctx.clearRect(0, 0, W, H);
      particles.forEach(p => { p.update(); p.draw(); });
      comets.forEach(c => { c.update(); c.draw(); });
      drawLines();
      animId = requestAnimationFrame(loop);
    }

    loop();
    window.addEventListener('resize', resize);
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <canvas ref={canvasRef}
      style={{ position:'fixed', inset:0, pointerEvents:'none', zIndex:0, opacity:0.7 }} />
  );
}
