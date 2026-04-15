'use client';

import { useRef } from 'react';

interface TiltCardProps {
  children:   React.ReactNode;
  className?: string;
  intensity?: number;  // degrees max tilt, default 10
}

export function TiltCard({ children, className = '', intensity = 10 }: TiltCardProps) {
  const cardRef  = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left)  / rect.width;   // 0 → 1
    const y = (e.clientY - rect.top)   / rect.height;  // 0 → 1
    const rotX =  (y - 0.5) * -intensity * 2;
    const rotY =  (x - 0.5) *  intensity * 2;

    el.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(12px)`;

    if (glareRef.current) {
      glareRef.current.style.opacity = '1';
      glareRef.current.style.background =
        `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.10) 0%, transparent 65%)`;
    }
  };

  const onLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)';
    if (glareRef.current) glareRef.current.style.opacity = '0';
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className={`relative ${className}`}
      style={{
        transition:      'transform 0.12s ease-out',
        transformStyle:  'preserve-3d',
        willChange:      'transform',
      }}
    >
      {/* Glare overlay */}
      <div
        ref={glareRef}
        className="absolute inset-0 pointer-events-none z-10 transition-opacity duration-300"
        style={{ opacity: 0, borderRadius: 'inherit' }}
      />
      {children}
    </div>
  );
}
