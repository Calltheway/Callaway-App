'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  r: number; alpha: number;
  colorR: number; colorG: number; colorB: number;
}

export function Particles({ count = 70 }: { count?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Mix of green, blue, purple particles
    const palette = [
      [0, 232, 122],   // keeper-green
      [0, 136, 255],   // keeper-blue
      [124, 58, 237],  // keeper-purple
      [0, 232, 122],   // double green weight
    ];

    const particles: Particle[] = Array.from({ length: count }, () => {
      const [colorR, colorG, colorB] = palette[Math.floor(Math.random() * palette.length)];
      return {
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        r: Math.random() * 1.8 + 0.4,
        alpha: Math.random() * 0.45 + 0.1,
        colorR, colorG, colorB,
      };
    });

    let raf: number;

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.shadowBlur = 8;
        ctx.shadowColor = `rgba(${p.colorR},${p.colorG},${p.colorB},0.8)`;
        ctx.fillStyle   = `rgba(${p.colorR},${p.colorG},${p.colorB},${p.alpha})`;
        ctx.fill();

        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0)              p.x = canvas.width;
        if (p.x > canvas.width)   p.x = 0;
        if (p.y < 0)              p.y = canvas.height;
        if (p.y > canvas.height)  p.y = 0;
      }

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
    };
  }, [count]);

  return (
    <canvas
      ref={ref}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.6 }}
    />
  );
}
