'use client';

import { useEffect } from 'react';
import { useUnhookedStore } from '@/store/useUnhookedStore';

export default function StreakCounter() {
  const { streakDays, streakHours, streakMinutes, streakSeconds, tickStreak, sobrietyStartDate } = useUnhookedStore();

  useEffect(() => {
    if (!sobrietyStartDate) return;
    tickStreak();
    const interval = setInterval(tickStreak, 1000);
    return () => clearInterval(interval);
  }, [sobrietyStartDate, tickStreak]);

  const units = [
    { label: 'DAYS', value: streakDays },
    { label: 'HRS', value: streakHours },
    { label: 'MIN', value: streakMinutes },
    { label: 'SEC', value: streakSeconds },
  ];

  return (
    <div className="flex gap-3 justify-center">
      {units.map(({ label, value }) => (
        <div key={label} className="flex flex-col items-center">
          <div className="bg-[#111827] border border-[#1E2A3A] rounded-xl px-4 py-3 min-w-[70px] text-center">
            <span className="text-3xl font-black text-[#00D4FF] tabular-nums leading-none">
              {String(value).padStart(2, '0')}
            </span>
          </div>
          <span className="text-gray-500 text-xs font-bold mt-1 tracking-widest">{label}</span>
        </div>
      ))}
    </div>
  );
}
