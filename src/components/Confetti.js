import React, { useEffect, useRef } from 'react';

const COLORS = ['#ffffff', '#e0e0e0', '#ff9f0a', '#30d158', '#4d96ff', '#c77dff', '#ff6b6b', '#ffd93d'];

export default function Confetti() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 140 }, (_, i) => ({
      x:       Math.random() * canvas.width,
      y:       -20 - Math.random() * 120,
      r:       2.5 + Math.random() * 5,
      color:   COLORS[Math.floor(Math.random() * COLORS.length)],
      vx:      (Math.random() - 0.5) * 4,
      vy:      1.5 + Math.random() * 4,
      spin:    (Math.random() - 0.5) * 0.25,
      angle:   Math.random() * Math.PI * 2,
      shape:   i % 3 === 0 ? 'circle' : 'rect',
      opacity: 1,
      wobble:  Math.random() * Math.PI * 2,
      wobbleSpeed: 0.05 + Math.random() * 0.05,
    }));

    let frame;
    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach(p => {
        if (p.y > canvas.height + 20 || p.opacity <= 0.02) return;
        alive = true;

        p.y       += p.vy;
        p.x       += p.vx + Math.sin(p.wobble) * 0.8;
        p.vy      += 0.055;
        p.angle   += p.spin;
        p.wobble  += p.wobbleSpeed;
        p.opacity -= 0.006;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle   = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.angle);

        if (p.shape === 'rect') {
          ctx.fillRect(-p.r, -p.r * 0.5, p.r * 2, p.r);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      if (alive) frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9999 }}
    />
  );
}
