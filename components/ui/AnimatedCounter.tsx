'use client';

import { useEffect, useRef, useState } from 'react';

interface AnimatedCounterProps {
  value:     number;
  prefix?:   string;
  suffix?:   string;
  duration?: number;    // ms
  decimals?: number;
}

export function AnimatedCounter({
  value,
  prefix   = '',
  suffix   = '',
  duration = 1600,
  decimals = 0,
}: AnimatedCounterProps) {
  const [current,  setCurrent]  = useState(0);
  const spanRef    = useRef<HTMLSpanElement>(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = spanRef.current;
    if (!el) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setCurrent(value);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting || startedRef.current) return;
        startedRef.current = true;

        const start = performance.now();
        const tick  = (now: number) => {
          const elapsed  = now - start;
          const progress = Math.min(elapsed / duration, 1);
          const eased    = 1 - Math.pow(1 - progress, 3); // ease-out cubic
          setCurrent(parseFloat((eased * value).toFixed(decimals)));
          if (progress < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
        observer.disconnect();
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, duration, decimals]);

  const display = decimals > 0
    ? current.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })
    : current.toLocaleString('en-US');

  return (
    <span ref={spanRef}>
      {prefix}{display}{suffix}
    </span>
  );
}
