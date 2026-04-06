'use client';

import { useRouter } from 'next/navigation';
import { useUnhookedStore, LEVEL_NAMES, LEVEL_XP_THRESHOLDS } from '@/store/useUnhookedStore';
import { getSupabaseBrowser } from '@/lib/supabase';
import BottomNav from '@/components/BottomNav';
import { ArrowLeft, Shield, Star, LogOut, Zap, Crown, AlertTriangle } from 'lucide-react';

const ACHIEVEMENTS = [
  { id: 'first_day',    label: 'First Day',      emoji: '🌱', desc: 'Started your journey',         unlockDays: 0 },
  { id: 'one_week',     label: 'One Week',        emoji: '🔥', desc: '7 days clean',                 unlockDays: 7 },
  { id: 'two_weeks',    label: 'Fortnight',       emoji: '⚡', desc: '14 days of neuroplasticity',   unlockDays: 14 },
  { id: 'one_month',    label: 'Month Warrior',   emoji: '🦁', desc: '30 days of rewiring',          unlockDays: 30 },
  { id: 'ninety_days',  label: 'Legend',          emoji: '🏆', desc: '90 days — brain fully healed', unlockDays: 90 },
  { id: 'brainwave',    label: 'Neural Pioneer',  emoji: '🧠', desc: 'Completed first brainwave session', unlockXP: 15 },
  { id: 'journaler',    label: 'Self-Aware',      emoji: '✍️', desc: 'Logged 5 journal entries',     unlockXP: 75 },
];

export default function ProfilePage() {
  const router = useRouter();
  const store = useUnhookedStore();
  const {
    userName, streakDays, xpTotal, level, isPremium,
    epilepsySafeMode, setEpilepsySafeMode,
    habitType, motivations, recoveryStyle, relapseLog,
    signOut,
  } = store;

  const levelName = LEVEL_NAMES[level] || 'Slave';
  const nextLevel = Math.min(level + 1, 5);
  const nextLevelXP = LEVEL_XP_THRESHOLDS[nextLevel];
  const currentLevelXP = LEVEL_XP_THRESHOLDS[level];
  const xpProgress = nextLevelXP > currentLevelXP
    ? Math.min(100, ((xpTotal - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100)
    : 100;

  async function handleSignOut() {
    try {
      const supabase = getSupabaseBrowser();
      await supabase.auth.signOut();
    } catch { /* ignore */ }
    signOut();
    router.replace('/auth');
  }

  const unlockedAchievements = ACHIEVEMENTS.filter(
    (a) => (a.unlockDays !== undefined && streakDays >= a.unlockDays) ||
            (a.unlockXP !== undefined && xpTotal >= a.unlockXP)
  );

  return (
    <div className="min-h-screen bg-[#0A0E1A] pb-24">
      {/* Header */}
      <div className="bg-[#060912] border-b border-[#1E2A3A] px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-black text-white">Profile</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
        {/* Profile hero */}
        <div className="bg-[#111827] border border-[#1E2A3A] rounded-2xl p-6 text-center">
          <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-gradient-to-br from-[#00D4FF]/20 to-[#FFD700]/20 border-2 border-[#00D4FF]/40 flex items-center justify-center">
            <span className="text-3xl font-black text-white">{(userName || 'W')[0].toUpperCase()}</span>
          </div>
          <h2 className="text-2xl font-black text-white">{userName || 'Warrior'}</h2>
          <p className="text-gray-400 text-sm capitalize">{recoveryStyle} recovery · {habitType || 'Recovery'} freedom</p>
          <div className="flex justify-center gap-4 mt-4">
            <div className="text-center">
              <p className="text-2xl font-black text-[#00D4FF]">{streakDays}</p>
              <p className="text-gray-500 text-xs">Days Clean</p>
            </div>
            <div className="w-px bg-[#1E2A3A]" />
            <div className="text-center">
              <p className="text-2xl font-black text-[#FFD700]">{xpTotal}</p>
              <p className="text-gray-500 text-xs">Total XP</p>
            </div>
            <div className="w-px bg-[#1E2A3A]" />
            <div className="text-center">
              <p className="text-2xl font-black text-white">{unlockedAchievements.length}</p>
              <p className="text-gray-500 text-xs">Badges</p>
            </div>
          </div>
        </div>

        {/* Level */}
        <div className="bg-[#111827] border border-[#1E2A3A] rounded-2xl p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-[#FFD700]" />
              <p className="text-white font-bold">Level {level}: {levelName}</p>
            </div>
            <span className="text-gray-400 text-xs">{xpTotal} / {nextLevelXP} XP</span>
          </div>
          <div className="h-2 bg-[#060912] rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#00D4FF] to-[#FFD700] rounded-full transition-all duration-500" style={{ width: `${xpProgress}%` }} />
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            {['Slave', 'Awakened', 'Warrior', 'Champion', 'Legend', 'Free'].map((name, i) => (
              <span key={name} className={i <= level ? 'text-[#00D4FF]' : ''}>{name}</span>
            ))}
          </div>
        </div>

        {/* Achievements */}
        <div className="bg-[#111827] border border-[#1E2A3A] rounded-2xl p-5">
          <h3 className="text-white font-bold mb-3 flex items-center gap-2">
            <Star size={16} className="text-[#FFD700]" /> Achievements
          </h3>
          <div className="grid grid-cols-3 gap-3">
            {ACHIEVEMENTS.map((a) => {
              const unlocked = unlockedAchievements.some((u) => u.id === a.id);
              return (
                <div
                  key={a.id}
                  className={`flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
                    unlocked ? 'bg-[#060912] border-[#00D4FF]/30' : 'bg-[#060912]/50 border-[#1E2A3A] opacity-40'
                  }`}
                >
                  <span className="text-2xl mb-1">{a.emoji}</span>
                  <p className="text-white text-xs font-semibold">{a.label}</p>
                  <p className="text-gray-600 text-xs">{a.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Epilepsy Safe Mode */}
        <div className="bg-[#111827] border border-[#1E2A3A] rounded-2xl p-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <AlertTriangle size={20} className="text-yellow-400 flex-shrink-0" />
              <div>
                <p className="text-white font-bold">Epilepsy Safe Mode</p>
                <p className="text-gray-500 text-xs mt-0.5">Disables all screen flashing and fast visual effects. Audio entrainment remains fully active.</p>
              </div>
            </div>
            <button
              onClick={() => setEpilepsySafeMode(!epilepsySafeMode)}
              className={`w-12 h-6 rounded-full transition-all relative flex-shrink-0 mt-1 ${epilepsySafeMode ? 'bg-yellow-500' : 'bg-[#1E2A3A]'}`}
            >
              <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${epilepsySafeMode ? 'right-0.5' : 'left-0.5'}`} />
            </button>
          </div>
          {epilepsySafeMode && (
            <p className="text-yellow-400/70 text-xs mt-3 border-t border-yellow-900/30 pt-3">
              Safe Mode Active — Visual effects are disabled for your safety.
            </p>
          )}
        </div>

        {/* Subscription */}
        <div className={`bg-[#111827] border rounded-2xl p-5 ${isPremium ? 'border-[#FFD700]/40' : 'border-[#1E2A3A]'}`}>
          <div className="flex items-center gap-3 mb-3">
            <Crown size={20} className={isPremium ? 'text-[#FFD700]' : 'text-gray-500'} />
            <div>
              <p className="text-white font-bold">{isPremium ? 'Premium Member' : 'Free Plan'}</p>
              <p className="text-gray-500 text-xs">{isPremium ? 'Full access to all features' : 'Upgrade for unlimited AI coaching & community'}</p>
            </div>
          </div>
          {!isPremium && (
            <button className="w-full py-3 bg-[#FFD700] text-[#0A0E1A] font-bold rounded-xl hover:bg-yellow-400 transition-all text-sm">
              Upgrade to Premium
            </button>
          )}
        </div>

        {/* Motivations */}
        {motivations.length > 0 && (
          <div className="bg-[#111827] border border-[#1E2A3A] rounded-2xl p-5">
            <h3 className="text-white font-bold text-sm mb-3">Your Motivations</h3>
            <div className="flex flex-wrap gap-2">
              {motivations.map((m) => (
                <span key={m} className="bg-[#00D4FF]/10 border border-[#00D4FF]/30 text-[#00D4FF] text-xs px-3 py-1.5 rounded-full capitalize">
                  {m.replace(/-/g, ' ')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Relapse history */}
        {relapseLog.length > 0 && (
          <div className="bg-[#111827] border border-[#1E2A3A] rounded-2xl p-5">
            <h3 className="text-white font-bold text-sm mb-3">Relapse Log <span className="text-gray-500 font-normal text-xs">(Each one taught you something)</span></h3>
            <div className="space-y-2">
              {relapseLog.slice(0, 5).map((r) => (
                <div key={r.id} className="flex items-start gap-3 py-2 border-t border-[#1E2A3A] first:border-0 first:pt-0">
                  <div className="w-2 h-2 rounded-full bg-[#1E2A3A] mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-gray-400 text-xs">{new Date(r.timestamp).toLocaleDateString()}</p>
                    <p className="text-gray-300 text-sm">{r.trigger}</p>
                    {r.note && <p className="text-gray-600 text-xs mt-0.5 italic">"{r.note}"</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 py-3 border border-[#1E2A3A] rounded-2xl text-gray-400 hover:text-red-400 hover:border-red-800 transition-all text-sm"
        >
          <LogOut size={16} /> Sign Out
        </button>

        <p className="text-center text-xs text-gray-700">
          Unhooked v1.0 · Not a substitute for professional medical advice
        </p>
      </div>

      <BottomNav />
    </div>
  );
}
