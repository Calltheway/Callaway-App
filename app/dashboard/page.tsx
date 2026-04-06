'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDopamindStore, LEVEL_NAMES, LEVEL_XP_THRESHOLDS } from '@/store/useDopamindStore';
import StreakCounter from '@/components/StreakCounter';
import BrainHealingMap from '@/components/BrainHealingMap';
import BottomNav from '@/components/BottomNav';
import RelapseModal from '@/components/RelapseModal';
import XPToast from '@/components/XPToast';
import { AlertOctagon, Brain, BookOpen, MessageCircle, Zap, ChevronRight, Users } from 'lucide-react';

const BENEFITS = [
  { day: 3,  icon: '😌', title: 'Brain fog lifts',        desc: 'Mental clarity begins returning' },
  { day: 7,  icon: '🧠', title: 'Prefrontal cortex reactivates', desc: 'Decision-making improves' },
  { day: 14, icon: '😴', title: 'Sleep quality improves',  desc: 'Deeper, more restorative sleep' },
  { day: 30, icon: '⚡', title: 'Dopamine baseline resets', desc: 'Natural pleasures feel rewarding again' },
  { day: 90, icon: '🦁', title: 'Full neural rewiring',    desc: 'A new baseline of freedom' },
];

export default function DashboardPage() {
  const router = useRouter();
  const store = useDopamindStore();
  const { streakDays, userName, xpTotal, level, isPremium, sobrietyStartDate, addXP } = store;

  const [showRelapse, setShowRelapse] = useState(false);
  const [xpToast, setXpToast] = useState<{ amount: number; label: string } | null>(null);

  const levelName = LEVEL_NAMES[level] || 'Slave';
  const nextLevelXP = LEVEL_XP_THRESHOLDS[Math.min(level + 1, 5)] || LEVEL_XP_THRESHOLDS[5];
  const currentLevelXP = LEVEL_XP_THRESHOLDS[level];
  const xpProgress = nextLevelXP > currentLevelXP
    ? ((xpTotal - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
    : 100;

  // Daily check-in XP
  useEffect(() => {
    const lastCheckin = localStorage.getItem('lastDailyCheckin');
    const today = new Date().toDateString();
    if (lastCheckin !== today && sobrietyStartDate) {
      localStorage.setItem('lastDailyCheckin', today);
      addXP(10);
      setXpToast({ amount: 10, label: 'Daily check-in' });
    }
  }, []);

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const nextBenefit = BENEFITS.find((b) => b.day > streakDays);
  const unlockedBenefits = BENEFITS.filter((b) => b.day <= streakDays);

  return (
    <div className="min-h-screen bg-[#0A0E1A] pb-24">
      {xpToast && (
        <XPToast
          amount={xpToast.amount}
          label={xpToast.label}
          onDone={() => setXpToast(null)}
        />
      )}
      {showRelapse && <RelapseModal onClose={() => setShowRelapse(false)} />}

      {/* Header */}
      <div className="bg-[#060912] border-b border-[#1E2A3A] px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">{greeting()},</p>
            <h1 className="text-xl font-black text-white">{userName || 'Warrior'} 🔥</h1>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              <Zap size={14} className="text-[#FFD700]" />
              <span className="text-[#FFD700] font-bold text-sm">{xpTotal} XP</span>
            </div>
            <span className="text-gray-500 text-xs">{levelName}</span>
          </div>
        </div>

        {/* Level progress */}
        <div className="max-w-lg mx-auto mt-3">
          <div className="flex justify-between text-xs text-gray-600 mb-1">
            <span>Level {level}: {levelName}</span>
            <span>{xpTotal} / {nextLevelXP} XP</span>
          </div>
          <div className="h-1.5 bg-[#1E2A3A] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#00D4FF] to-[#FFD700] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, xpProgress)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">

        {/* Streak Section */}
        <div className="text-center">
          <p className="text-gray-400 text-sm mb-2 uppercase tracking-widest font-semibold">Your Streak</p>
          <StreakCounter />
          {streakDays === 0 && (
            <p className="text-gray-500 text-xs mt-3">Every second you stay clean is a victory.</p>
          )}
          {streakDays > 0 && (
            <p className="text-[#00D4FF] text-sm mt-3 font-semibold">
              {streakDays >= 90 ? "You're FREE. Keep going." :
               streakDays >= 30 ? "Your reward circuits are rewiring!" :
               streakDays >= 14 ? "Your limbic system is calming down" :
               streakDays >= 7  ? "Your prefrontal cortex is coming back online" :
               "Your brain is already healing"}
            </p>
          )}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => router.push('/sos')}
              className="bg-red-600/20 border border-red-600/50 rounded-2xl p-4 text-left hover:bg-red-600/30 transition-all active:scale-95"
            >
              <AlertOctagon size={24} className="text-red-400 mb-2" />
              <p className="text-white font-bold text-sm">SOS Help</p>
              <p className="text-red-400/70 text-xs">I need support now</p>
            </button>

            <button
              onClick={() => router.push('/brainwave')}
              className="bg-[#00D4FF]/10 border border-[#00D4FF]/30 rounded-2xl p-4 text-left hover:bg-[#00D4FF]/20 transition-all active:scale-95"
            >
              <Brain size={24} className="text-[#00D4FF] mb-2" />
              <p className="text-white font-bold text-sm">Brainwave</p>
              <p className="text-[#00D4FF]/70 text-xs">Entrainment session</p>
            </button>

            <button
              onClick={() => router.push('/journal')}
              className="bg-[#111827] border border-[#1E2A3A] rounded-2xl p-4 text-left hover:border-gray-600 transition-all active:scale-95"
            >
              <BookOpen size={24} className="text-purple-400 mb-2" />
              <p className="text-white font-bold text-sm">Journal</p>
              <p className="text-gray-500 text-xs">Daily check-in</p>
            </button>

            <button
              onClick={() => router.push('/coach')}
              className="bg-[#111827] border border-[#1E2A3A] rounded-2xl p-4 text-left hover:border-gray-600 transition-all active:scale-95"
            >
              <MessageCircle size={24} className="text-green-400 mb-2" />
              <p className="text-white font-bold text-sm">AI Coach</p>
              <p className="text-gray-500 text-xs">Get support</p>
            </button>
          </div>
        </div>

        {/* Brain Healing Map */}
        <BrainHealingMap streakDays={streakDays} />

        {/* Benefits timeline */}
        <div>
          <h2 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Benefits Timeline</h2>
          <div className="space-y-2">
            {BENEFITS.map((b) => {
              const unlocked = streakDays >= b.day;
              return (
                <div
                  key={b.day}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                    unlocked
                      ? 'bg-[#111827] border-[#00D4FF]/30'
                      : 'bg-[#111827]/50 border-[#1E2A3A] opacity-60'
                  }`}
                >
                  <span className="text-2xl">{b.icon}</span>
                  <div className="flex-1">
                    <p className={`font-semibold text-sm ${unlocked ? 'text-white' : 'text-gray-500'}`}>
                      Day {b.day}: {b.title}
                    </p>
                    <p className="text-gray-500 text-xs">{b.desc}</p>
                  </div>
                  {unlocked ? (
                    <span className="text-[#00D4FF] text-xs font-bold">✓ Done</span>
                  ) : (
                    <span className="text-gray-600 text-xs">{b.day - streakDays}d</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Community teaser */}
        <button
          onClick={() => router.push('/community')}
          className="w-full bg-[#111827] border border-[#1E2A3A] rounded-2xl p-4 flex items-center gap-3 hover:border-gray-600 transition-all"
        >
          <Users size={20} className="text-[#00D4FF]" />
          <div className="text-left flex-1">
            <p className="text-white font-semibold text-sm">Community Board</p>
            <p className="text-gray-500 text-xs">Warriors sharing wins</p>
          </div>
          <ChevronRight size={16} className="text-gray-600" />
        </button>

        {/* Relapse log button */}
        <button
          onClick={() => setShowRelapse(true)}
          className="w-full py-3 border border-[#1E2A3A] rounded-xl text-gray-500 hover:text-gray-300 hover:border-gray-600 text-sm transition-all"
        >
          Log a relapse (compassionate reset)
        </button>

        {/* Disclaimer */}
        <p className="text-center text-xs text-gray-700 leading-relaxed">
          Not a substitute for professional medical advice. Consult a doctor before use if you have medical conditions. If in crisis, call 988.
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
