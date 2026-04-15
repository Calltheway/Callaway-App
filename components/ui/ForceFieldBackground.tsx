'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;  y: number;
  ox: number; oy: number;
  vx: number; vy: number;
  size: number;
  alpha: number;
  hue: number;
}

export function ForceFieldBackground({
  spacing       = 14,
  forceRadius   = 180,
  forceStrength = 12,
  className     = '',
}: {
  spacing?:       number;
  forceRadius?:   number;
  forceStrength?: number;
  className?:     string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef  = useRef({ x: -9999, y: -9999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let particles: Particle[] = [];
    let raf: number;
    let smoothX = -9999;
    let smoothY = -9999;

    const build = () => {
      particles = [];
      const sp = Math.max(6, spacing);
      for (let y = 0; y < canvas.height; y += sp) {
        for (let x = 0; x < canvas.width; x += sp) {
          const ox = x + (Math.random() - 0.5) * sp * 0.9;
          const oy = y + (Math.random() - 0.5) * sp * 0.9;
          const r  = Math.random();
          const hue = r < 0.65 ? 151 : r < 0.85 ? 210 : 270; // green / blue / purple
          particles.push({
            x: ox, y: oy, ox, oy,
            vx: 0,  vy: 0,
            size:  Math.random() * 1.8 + 0.6,
            alpha: Math.random() * 0.55 + 0.2,
            hue,
          });
        }
      }
    };

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      build();
    };

    const tick = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      smoothX += (mouseRef.current.x - smoothX) * 0.12;
      smoothY += (mouseRef.current.y - smoothY) * 0.12;

      for (const p of particles) {
        const dx = p.x - smoothX;
        const dy = p.y - smoothY;
        const d  = Math.sqrt(dx * dx + dy * dy);

        if (d < forceRadius && d > 0.1) {
          const f = forceStrength / (d * 0.35);
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
        }

        // Friction + spring back to origin
        p.vx = p.vx * 0.88 + (p.ox - p.x) * 0.04;
        p.vy = p.vy * 0.88 + (p.oy - p.y) * 0.04;
        p.x += p.vx;
        p.y += p.vy;

        // Grow particles near cursor
        let sz = p.size;
        if (d < forceRadius) sz *= 1 + 1.8 * (1 - d / forceRadius);

        ctx.beginPath();
        ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
        ctx.shadowBlur   = sz * 4;
        ctx.shadowColor  = `hsla(${p.hue},80%,55%,0.9)`;
        ctx.fillStyle    = `hsla(${p.hue},80%,55%,${p.alpha})`;
        ctx.fill();
      }

      raf = requestAnimationFrame(tick);
    };

    const onMove = (e: MouseEvent) => { mouseRef.current = { x: e.clientX, y: e.clientY }; };

    resize();
    tick();
    window.addEventListener('resize',    resize);
    window.addEventListener('mousemove', onMove);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize',    resize);
      window.removeEventListener('mousemove', onMove);
    };
  }, [spacing, forceRadius, forceStrength]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none z-0 ${className}`}
    />
  );
}

export default ForceFieldBackground;
