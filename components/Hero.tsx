'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Zap, Eye } from 'lucide-react';

const stats = [
  { value: '20K+',   label: 'Items Curated'    },
  { value: '98%',    label: 'Style Match Rate'  },
  { value: '4.9★',   label: 'Average Rating'    },
  { value: '< 2s',   label: 'AI Response Time'  },
];

const features = [
  { icon: Sparkles, label: 'AI Style Assistant',   color: '#8b5cf6' },
  { icon: Eye,      label: 'Virtual Try-On',        color: '#06b6d4' },
  { icon: Zap,      label: 'Instant Recommendations', color: '#f59e0b' },
];

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Particle effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    interface Particle { x: number; y: number; vx: number; vy: number; size: number; opacity: number; color: string; }
    const colors = ['139,92,246', '6,182,212', '245,158,11'];
    const particles: Particle[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.5 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)],
    }));

    let frame: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.opacity})`;
        ctx.fill();
      });

      // Draw connecting lines
      particles.forEach((p, i) => {
        particles.slice(i + 1).forEach(q => {
          const dist = Math.hypot(p.x - q.x, p.y - q.y);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.strokeStyle = `rgba(139,92,246,${0.1 * (1 - dist / 100)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
      });
      frame = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(frame); window.removeEventListener('resize', resize); };
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20">
      {/* Canvas particles */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* Background gradient orbs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.6) 0%, transparent 70%)', animation: 'float 8s ease-in-out infinite' }} />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.6) 0%, transparent 70%)', animation: 'float 10s ease-in-out infinite reverse' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-5 blur-3xl"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.4) 0%, transparent 70%)' }} />
      </div>

      {/* Grid overlay */}
      <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
          style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)' }}
        >
          <span className="w-2 h-2 rounded-full bg-lumis-cyan animate-pulse" />
          <span className="text-sm font-medium text-lumis-violet-bright">AI-Powered Fashion · Powered by Claude</span>
          <Sparkles size={14} className="text-lumis-cyan" />
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display font-bold leading-tight mb-6"
          style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', letterSpacing: '-0.02em' }}
        >
          <span className="text-lumis-text">Dress the Future.</span>
          <br />
          <span className="shimmer-text">Powered by AI.</span>
        </motion.h1>

        {/* Sub */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lumis-muted text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10"
        >
          LUMIS is the world's first AI-native fashion house. Our Claude-powered stylist knows your taste,
          body, and lifestyle — finding you the perfect outfit before you even know you need it.
        </motion.p>

        {/* Feature pills */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 mb-10"
        >
          {features.map(({ icon: Icon, label, color }) => (
            <div
              key={label}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium"
              style={{ background: `rgba(${color === '#8b5cf6' ? '139,92,246' : color === '#06b6d4' ? '6,182,212' : '245,158,11'},0.1)`, border: `1px solid ${color}40`, color }}
            >
              <Icon size={14} />
              {label}
            </div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Link href="/shop" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4">
            Shop the Collection <ArrowRight size={18} />
          </Link>
          <Link href="/tryon" className="btn-ghost inline-flex items-center gap-2 text-base px-8 py-4">
            <Eye size={18} />
            Try On with AI
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto"
        >
          {stats.map(({ value, label }) => (
            <div
              key={label}
              className="py-4 rounded-2xl text-center"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="font-display font-bold text-2xl text-gradient-violet mb-1">{value}</div>
              <div className="text-xs text-lumis-dim">{label}</div>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="text-lumis-dim text-xs tracking-widest uppercase">Explore</span>
        <div className="w-px h-12 relative overflow-hidden rounded-full" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <div className="absolute inset-x-0 h-6 rounded-full"
            style={{ background: 'linear-gradient(to bottom, transparent, rgba(139,92,246,0.8), transparent)', animation: 'scan 2s ease-in-out infinite' }} />
        </div>
      </motion.div>
    </section>
  );
}
