'use client';

import { useEffect, useState } from 'react';

interface XPToastProps {
  amount: number;
  label?: string;
  onDone?: () => void;
}

export default function XPToast({ amount, label, onDone }: XPToastProps) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setVisible(false);
      onDone?.();
    }, 2500);
    return () => clearTimeout(timer);
  }, [onDone]);

  if (!visible) return null;

  return (
    <div className="xp-toast fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="bg-[#FFD700] text-[#0A0E1A] font-black px-6 py-3 rounded-full text-lg shadow-2xl flex items-center gap-2">
        <span>⚡</span>
        <span>+{amount} XP</span>
        {label && <span className="font-medium text-sm opacity-80">· {label}</span>}
      </div>
    </div>
  );
}
