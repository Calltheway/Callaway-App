'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDopamindStore, LEVEL_NAMES, LEVEL_XP_THRESHOLDS } from '@/store/useDopamindStore';
import StreakCounter from '@/components/StreakCounter';
import BrainHealingMap from '@/components/BrainHealingMap';
import BottomNav from '@/components/BottomNav';
import RelapseModal from '@/components/RelapseModal';
import XPToast from '@/components/XPToast';
import { AlertOctagon, Brain, MessageCircle, Zap, Shield, ChevronRight, Users } from 'lucide-react';

const BENEFITS = [
  { day: 3,  icon: '😌', title: 'Brain fog lifts',                desc: 'Mental clarity begins returning' },
  { day: 7,  icon: '🧠', title: 'PIED symptoms begin reversing',  desc: 'Physical healing has begun' },
  { day: 14, icon: '⚡', title: 'Prefrontal cortex reactivating', desc: 'Better decisions, sharper focus' },
  { day: 30, icon: '🔄', title: 'Dopamine receptors regenerating', desc: 'Natural pleasures feel rewarding again' },
  { day: 90, icon: '🦁', title: 'Full neural rewiring complete',   desc: 'A new baseline of freedom' },
];

const DAILY_MISSIONS = [
  'Complete a 10-minute Theta brainwave session',
  'Write 3 things you are grateful for today',
  'Identify your top trigger and make a plan to avoid it',
  'Do 20 pushups when an urge hits',
  'Call or message your accountability partner',
  'Read one article about neuroplasticity',
  'Practice the 4-7-8 breathing technique for 5 minutes',
];

const BRAIN_MILESTONES: Record<number, string> = {
  7:  'Day 7: PIED symptoms begin reversing',
  14: 'Day 14: Prefrontal cortex is regenerating',
  30: 'Day 30: Dopamine receptors regenerating',
  90: 'Day 90: Full neural rewiring complete',
};

export default function DashboardPage() {
  const router = useRouter();
  const store = useDopamindStore();
  const { streakDays, userName, xpTotal, level, sobrietyStartDate, addXP } = store;

  const [showRelapse, setShowRelapse] = useState(false);
  const [xpToast, setXpToast] = useState<{ amount: number; label: string } | null>(null);

  const levelName = LEVEL_NAMES[level] || 'Slave';
  const nextLevelXP = LEVEL_XP_THRESHOLDS[Math.min(level + 1, 5)] || LEVEL_XP_THRESHOLDS[5];
  const currentLevelXP = LEVEL_XP_THRESHOLDS[level];
  const xpProgress = nextLevelXP > currentLevelXP
    ? ((xpTotal - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100
    : 100;

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

  const healingMilestone = Object.entries(BRAIN_MILESTONES)
    .reverse()
    .find(([day]) => streakDays >= parseInt(day));

  const todayMission = DAILY_MISSIONS[new Date().getDay() % DAILY_MISSIONS.length];

  const QUICK_ACTIONS = [
    {
      label: 'SOS Panic',
      sub: 'Urge help now',
      href: '/sos',
      gradient: 'from-red-600 to-red-500',
      glow: 'rgba(220,38,38,0.4)',
      Icon: AlertOctagon,
    },
    {
      label: 'Brainwave',
      sub: 'Neural session',
      href: '/brainwave',
      gradient: 'from-cyan-600 to-cyan-400',
      glow: 'rgba(0,212,255,0.35)',
      Icon: Brain,
    },
    {
      label: 'Block Apps',
      sub: 'Shield triggers',
      href: '/blocker',
      gradient: 'from-violet-600 to-violet-400',
      glow: 'rgba(124,58,237,0.35)',
      Icon: Shield,
    },
    {
      label: 'AI Coach',
      sub: '24/7 support',
      href: '/coach',
      gradient: 'from-emerald-600 to-emerald-400',
      glow: 'rgba(16,185,129,0.35)',
      Icon: MessageCircle,
    },
  ];

  return (
    <div className="min-h-screen bg-[#050810] pb-28">
      {xpToast && (
        <XPToast
          amount={xpToast.amount}
          label={xpToast.label}
          onDone={() => setXpToast(null)}
        />
      )}
      {showRelapse && <RelapseModal onClose={() => setShowRelapse(false)} />}

      {/* Header */}
      <div className="bg-[#050810]/90 backdrop-blur-xl border-b border-white/[0.06] px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <p className="text-[#94A3B8] text-sm">{greeting()},</p>
            <h1 className="text-xl font-black text-white">{userName || 'Warrior'}</h1>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1.5 justify-end">
              <Zap size={14} className="text-amber-400" />
              <span className="text-amber-400 font-black text-sm">{xpTotal} XP</span>
            </div>
            <span className="text-[#94A3B8]/60 text-xs">{levelName}</span>
          </div>
        </div>
        <div className="max-w-lg mx-auto mt-3">
          <div className="flex justify-between text-xs text-[#94A3B8]/50 mb-1.5">
            <span>Level {level}: {levelName}</span>
            <span>{xpTotal} / {nextLevelXP} XP</span>
          </div>
          <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-violet-500 to-cyan-400 rounded-full transition-all duration-700"
              style={{ width: `${Math.min(100, xpProgress)}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">

        {/* Hero Streak */}
        <div className="glass p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 gradient-hero pointer-events-none" />
          <div className="relative z-10">
            <p className="text-[#94A3B8] text-xs font-bold uppercase tracking-widest mb-2">Days Porn-Free</p>
            <StreakCounter />
            <div className="mt-4">
              {streakDays === 0 ? (
                <p className="text-[#94A3B8] text-sm">Every second you stay clean is a victory. Start now.</p>
              ) : healingMilestone ? (
                <div className="inline-block glass-sm px-4 py-2 mt-1">
                  <p className="gradient-text text-sm font-bold">{healingMilestone[1]}</p>
                </div>
              ) : (
                <p className="text-cyan-400 text-sm font-semibold">Your brain is healing — keep going.</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-[#94A3B8] text-xs font-bold uppercase tracking-widest mb-3">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            {QUICK_ACTIONS.map(({ label, sub, href, gradient, glow, Icon }) => (
              <button
                key={href}
                onClick={() => router.push(href)}
                className="glass glass-hover rounded-2xl p-4 text-left transition-all active:scale-95"
              >
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center mb-3`}
                  style={{ boxShadow: `0 0 20px ${glow}` }}
                >
                  <Icon size={20} className="text-white" />
                </div>
                <p className="text-white font-black text-sm">{label}</p>
                <p className="text-[#94A3B8]/60 text-xs mt-0.5">{sub}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Benefits Unlocked — horizontal scroll */}
        <div>
          <h2 className="text-[#94A3B8] text-xs font-bold uppercase tracking-widest mb-3">Benefits Unlocked</h2>
          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'none' }}>
            {BENEFITS.map((b) => {
              const unlocked = streakDays >= b.day;
              return (
                <div
                  key={b.day}
                  className={`flex-shrink-0 w-36 p-4 rounded-2xl border transition-all ${
                    unlocked
                      ? 'bg-violet-600/10 border-violet-500/40'
                      : 'bg-white/[0.02] border-white/[0.05] opacity-50'
                  }`}
                >
                  <span className="text-2xl">{b.icon}</span>
                  <p className={`font-bold text-xs mt-2 ${unlocked ? 'text-white' : 'text-[#94A3B8]'}`}>
                    Day {b.day}
                  </p>
                  <p className={`text-xs mt-1 leading-tight ${unlocked ? 'text-[#94A3B8]' : 'text-[#94A3B8]/40'}`}>
                    {b.title}
                  </p>
                  {unlocked && (
                    <div className="mt-2 text-cyan-400 text-xs font-bold">Unlocked ✓</div>
                  )}
                  {!unlocked && (
                    <div className="mt-2 text-[#94A3B8]/30 text-xs">{b.day - streakDays}d left</div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's Mission */}
        <div className="card-gradient-border p-5">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-orange-400 flex items-center justify-center">
              <Zap size={12} className="text-white" />
            </div>
            <p className="text-[#94A3B8] text-xs font-bold uppercase tracking-wider">Today&apos;s Mission</p>
          </div>
          <p className="text-white font-bold">{todayMission}</p>
          <p className="text-[#94A3B8]/60 text-xs mt-2">Complete daily missions to earn XP and build momentum</p>
        </div>

        {/* Brain Healing Map */}
        <BrainHealingMap streakDays={streakDays} />

        {/* Community teaser */}
        <button
          onClick={() => router.push('/community')}
          className="w-full glass glass-hover rounded-2xl p-4 flex items-center gap-3 transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600/20 to-cyan-400/10 border border-cyan-400/30 flex items-center justify-center flex-shrink-0">
            <Users size={18} className="text-cyan-400" />
          </div>
          <div className="text-left flex-1">
            <p className="text-white font-bold text-sm">Community Board</p>
            <p className="text-[#94A3B8]/60 text-xs">Warriors sharing wins anonymously</p>
          </div>
          <ChevronRight size={16} className="text-[#94A3B8]/30" />
        </button>

        {/* Relapse log */}
        <button
          onClick={() => setShowRelapse(true)}
          className="w-full py-3 border border-white/[0.06] rounded-xl text-[#94A3B8]/50 hover:text-[#94A3B8] hover:border-white/[0.1] text-sm transition-all"
        >
          Log a relapse (compassionate reset)
        </button>

        <p className="text-center text-xs text-white/20 leading-relaxed">
          Not a substitute for professional medical advice. If in crisis, call 988.
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
