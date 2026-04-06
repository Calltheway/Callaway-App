'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useDopamindStore } from '@/store/useDopamindStore';
import { ArrowLeft, Waves, Wind, Dumbbell, Zap } from 'lucide-react';
import XPToast from '@/components/XPToast';

type InterventionId = 'brainwave' | 'hrv' | 'pushups' | 'pattern';

export default function SOSPage() {
  const router = useRouter();
  const { epilepsySafeMode, addXP } = useDopamindStore();

  const [active, setActive] = useState<InterventionId | null>(null);
  const [completed, setCompleted] = useState(false);
  const [xpToast, setXpToast] = useState<{ amount: number; label: string } | null>(null);

  // Pushup challenge state
  const [pushupCount, setPushupCount] = useState(0);
  const [pushupActive, setPushupActive] = useState(false);
  const pushupInterval = useRef<NodeJS.Timeout | null>(null);

  // Pattern interrupt state
  const [patternPhase, setPatternPhase] = useState<'flash' | 'redirect' | null>(null);
  const [flashToggle, setFlashToggle] = useState(false);
  const [flashCount, setFlashCount] = useState(0);

  function handleCompletion(label: string) {
    addXP(25);
    setXpToast({ amount: 25, label });
    setCompleted(true);
  }

  function startPushups() {
    setPushupActive(true);
    setPushupCount(0);
    setActive('pushups');
    pushupInterval.current = setInterval(() => {
      setPushupCount((prev) => {
        if (prev >= 19) {
          clearInterval(pushupInterval.current!);
          setTimeout(() => handleCompletion('Physical Snap'), 500);
          return 20;
        }
        return prev + 1;
      });
    }, 1500);
  }

  function startPatternInterrupt() {
    if (epilepsySafeMode) {
      router.push('/brainwave?mode=theta');
      return;
    }
    setActive('pattern');
    setPatternPhase('flash');
    setFlashCount(0);
    let count = 0;
    const flashInterval = setInterval(() => {
      setFlashToggle((t) => !t);
      count++;
      setFlashCount(count);
      if (count >= 6) {
        clearInterval(flashInterval);
        setPatternPhase('redirect');
        setTimeout(() => {
          router.push('/brainwave?mode=theta');
        }, 1500);
      }
    }, 500);
  }

  useEffect(() => {
    return () => {
      if (pushupInterval.current) clearInterval(pushupInterval.current);
    };
  }, []);

  if (completed) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex flex-col items-center justify-center p-6 text-center">
        {xpToast && <XPToast amount={xpToast.amount} label={xpToast.label} onDone={() => setXpToast(null)} />}
        <div className="text-6xl mb-6 animate-bounce">🏆</div>
        <h1 className="text-3xl font-black text-white mb-3">Urge Defeated!</h1>
        <p className="text-[#00D4FF] font-bold text-lg mb-4">+25 XP Earned</p>
        <p className="text-gray-400 text-sm leading-relaxed mb-8 max-w-xs">
          You faced the urge and chose your values. That's what warriors do. Every win rewires your brain.
        </p>
        <div className="space-y-3 w-full max-w-xs">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-[#00D4FF] text-[#0A0E1A] font-bold py-4 rounded-2xl hover:bg-[#00B8E0] transition-all"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => router.push('/journal')}
            className="w-full border border-[#1E2A3A] text-gray-300 py-3 rounded-2xl hover:border-gray-500 transition-all text-sm"
          >
            Log what happened
          </button>
        </div>
      </div>
    );
  }

  // Pattern interrupt full screen
  if (active === 'pattern' && patternPhase === 'flash') {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center transition-colors duration-100"
        style={{ backgroundColor: flashToggle ? '#FFFFFF' : '#000000' }}
      >
        <div className="text-center" style={{ color: flashToggle ? '#000000' : '#FFFFFF' }}>
          <p className="text-6xl font-black mb-4">STOP</p>
          <p className="text-xl font-bold">Pattern Interrupt</p>
          <p className="text-sm mt-2 opacity-60">{Math.ceil((6 - flashCount) / 2)}s...</p>
        </div>
      </div>
    );
  }

  if (active === 'pattern' && patternPhase === 'redirect') {
    return (
      <div className="fixed inset-0 bg-[#0A0E1A] flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🧠</div>
          <p className="text-white font-bold text-xl">Redirecting to Theta session...</p>
        </div>
      </div>
    );
  }

  // Pushup challenge
  if (active === 'pushups') {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-black text-white mb-2">Physical Snap</h1>
        <p className="text-gray-400 text-sm mb-8">Channel that energy into your body</p>

        <div className="relative w-48 h-48 mb-8">
          <svg className="w-full h-full -rotate-90">
            <circle cx="96" cy="96" r="88" fill="none" stroke="#1E2A3A" strokeWidth="8" />
            <circle
              cx="96" cy="96" r="88" fill="none"
              stroke="#00D4FF" strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 88}`}
              strokeDashoffset={`${2 * Math.PI * 88 * (1 - pushupCount / 20)}`}
              className="transition-all duration-300"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-5xl font-black text-white">{pushupCount}</span>
            <span className="text-gray-400 text-sm">/ 20</span>
          </div>
        </div>

        <p className="text-[#00D4FF] font-bold text-lg mb-2">
          {pushupCount < 20 ? 'Keep going!' : 'DONE! 💪'}
        </p>
        <p className="text-gray-500 text-sm mb-8">
          {pushupCount < 10
            ? 'Focus on your body, not the urge'
            : pushupCount < 20
            ? "You're almost there!"
            : 'You crushed it!'}
        </p>

        <button
          onClick={() => {
            if (pushupInterval.current) clearInterval(pushupInterval.current);
            setActive(null);
          }}
          className="text-gray-500 text-sm hover:text-gray-300"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      {xpToast && <XPToast amount={xpToast.amount} label={xpToast.label} onDone={() => setXpToast(null)} />}

      {/* Header */}
      <div className="bg-[#060912] border-b border-red-900/50 px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-black text-white">SOS — I Need Help Now</h1>
          <p className="text-red-400 text-xs">Choose an intervention below</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">
        {/* Warning */}
        <div className="bg-red-900/20 border border-red-800/50 rounded-xl p-3 text-center">
          <p className="text-red-300 text-sm font-semibold">The urge will pass. You are not your cravings.</p>
          <p className="text-red-400/60 text-xs mt-1">Average craving duration: 15-20 minutes</p>
        </div>

        {/* Intervention 1: Brainwave */}
        <button
          onClick={() => router.push('/brainwave?mode=theta')}
          className="w-full bg-[#111827] border border-[#1E2A3A] rounded-2xl p-5 text-left hover:border-[#00D4FF]/50 transition-all active:scale-95"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-blue-900/30 border border-blue-700/30 flex items-center justify-center flex-shrink-0">
              <Waves size={26} className="text-blue-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg">Brainwave Session</h3>
              <p className="text-gray-400 text-sm">6 Hz Theta — Urge Dissolve mode</p>
              <p className="text-blue-400 text-xs mt-1">Dissolves cravings in 5-15 minutes</p>
            </div>
            <div className="text-gray-600">→</div>
          </div>
        </button>

        {/* Intervention 2: HRV */}
        <button
          onClick={() => router.push('/hrv')}
          className="w-full bg-[#111827] border border-[#1E2A3A] rounded-2xl p-5 text-left hover:border-green-500/50 transition-all active:scale-95"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-green-900/30 border border-green-700/30 flex items-center justify-center flex-shrink-0">
              <Wind size={26} className="text-green-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg">HRV Breathwork</h3>
              <p className="text-gray-400 text-sm">4-7-8 breathing with camera PPG</p>
              <p className="text-green-400 text-xs mt-1">Activates parasympathetic nervous system</p>
            </div>
            <div className="text-gray-600">→</div>
          </div>
        </button>

        {/* Intervention 3: Pushups */}
        <button
          onClick={startPushups}
          className="w-full bg-[#111827] border border-[#1E2A3A] rounded-2xl p-5 text-left hover:border-orange-500/50 transition-all active:scale-95"
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-orange-900/30 border border-orange-700/30 flex items-center justify-center flex-shrink-0">
              <Dumbbell size={26} className="text-orange-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg">Physical Snap</h3>
              <p className="text-gray-400 text-sm">20 pushup challenge</p>
              <p className="text-orange-400 text-xs mt-1">Flood body with endorphins, redirect energy</p>
            </div>
            <div className="text-gray-600">→</div>
          </div>
        </button>

        {/* Intervention 4: Pattern Interrupt */}
        <button
          onClick={startPatternInterrupt}
          className={`w-full bg-[#111827] rounded-2xl p-5 text-left transition-all active:scale-95 ${
            epilepsySafeMode
              ? 'border border-yellow-800/50 opacity-70'
              : 'border border-[#1E2A3A] hover:border-yellow-500/50'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-yellow-900/30 border border-yellow-700/30 flex items-center justify-center flex-shrink-0">
              <Zap size={26} className="text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-bold text-lg">Pattern Interrupt</h3>
              <p className="text-gray-400 text-sm">
                {epilepsySafeMode ? 'Disabled (Safe Mode) → Theta session' : '3-second high-contrast flash → Theta session'}
              </p>
              <p className="text-yellow-400 text-xs mt-1">
                {epilepsySafeMode ? 'Safe mode redirects to audio-only session' : 'Breaks neural craving loop instantly'}
              </p>
            </div>
            <div className="text-gray-600">→</div>
          </div>
          {epilepsySafeMode && (
            <p className="text-yellow-600 text-xs mt-2">⚠️ Flash disabled — Epilepsy Safe Mode active</p>
          )}
        </button>

        {/* Crisis resources */}
        <div className="bg-[#111827] border border-[#1E2A3A] rounded-xl p-4">
          <p className="text-gray-400 text-xs text-center mb-2">If you're in crisis:</p>
          <div className="flex gap-3 justify-center text-xs text-[#00D4FF]">
            <span>988 — Crisis Lifeline</span>
            <span>·</span>
            <span>Crisis Text Line: Text HOME to 741741</span>
          </div>
        </div>

        <p className="text-center text-xs text-gray-700">
          Not a substitute for professional help. If in immediate danger, call 911.
        </p>
      </div>
    </div>
  );
}
