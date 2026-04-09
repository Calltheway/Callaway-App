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
      <div className="min-h-screen bg-[#050810] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        {xpToast && <XPToast amount={xpToast.amount} label={xpToast.label} onDone={() => setXpToast(null)} />}
        {/* CSS confetti dots */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full"
              style={{
                left: `${(i * 17 + 5) % 100}%`,
                top: '-10px',
                background: i % 3 === 0 ? '#7C3AED' : i % 3 === 1 ? '#00D4FF' : '#F59E0B',
                animation: `confetti-fall ${1.5 + (i % 5) * 0.4}s ease-in ${i * 0.12}s forwards`,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 animate-scale-in">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-emerald-600 to-cyan-500 flex items-center justify-center"
            style={{ boxShadow: '0 0 40px rgba(16,185,129,0.5), 0 0 80px rgba(16,185,129,0.2)' }}>
            <span className="text-4xl">🏆</span>
          </div>
          <h1 className="text-5xl font-black text-white mb-2 leading-none">Urge Defeated</h1>
          <p className="gradient-text font-black text-xl mb-2">+25 XP Earned</p>

          {/* Streak protected badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 glass border-emerald-500/30 rounded-full mb-6 mt-2">
            <span className="text-emerald-400 text-sm font-bold">Streak Protected</span>
            <span className="text-emerald-400">✓</span>
          </div>

          <p className="text-[#94A3B8] text-sm leading-relaxed mb-8 max-w-xs">
            You faced the urge and chose your values. That&apos;s what warriors do. Every win rewires your brain permanently.
          </p>
          <div className="space-y-3 w-full max-w-xs">
            <button
              onClick={() => router.push('/dashboard')}
              className="w-full btn-primary py-4 text-base"
              style={{ boxShadow: '0 0 30px rgba(124,58,237,0.4)' }}
            >
              Back to Dashboard
            </button>
            <button
              onClick={() => router.push('/journal')}
              className="w-full btn-secondary py-3.5 text-sm"
            >
              Log what happened
            </button>
          </div>
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
      <div className="min-h-screen bg-[#050810] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-orange-600/5 rounded-full blur-3xl" />
        </div>
        <h1 className="text-3xl font-black text-white mb-2 relative z-10">Physical Snap</h1>
        <p className="text-[#94A3B8] text-sm mb-8 relative z-10">Channel that energy into your body</p>

        <div className="relative w-52 h-52 mb-8 z-10">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
            <circle
              cx="100" cy="100" r="90" fill="none"
              stroke="url(#pushupGrad)" strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 90}`}
              strokeDashoffset={`${2 * Math.PI * 90 * (1 - pushupCount / 20)}`}
              className="transition-all duration-300"
            />
            <defs>
              <linearGradient id="pushupGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#f97316" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl font-black text-white">{pushupCount}</span>
            <span className="text-[#94A3B8] text-sm">/ 20</span>
          </div>
        </div>

        <p className="text-orange-400 font-black text-xl mb-2">
          {pushupCount < 20 ? 'Keep going!' : 'DONE! 💪'}
        </p>
        <p className="text-[#94A3B8] text-sm mb-8">
          {pushupCount < 10 ? 'Focus on your body, not the urge' : pushupCount < 20 ? "You're almost there!" : 'You crushed it!'}
        </p>
        <button
          onClick={() => { if (pushupInterval.current) clearInterval(pushupInterval.current); setActive(null); }}
          className="text-[#94A3B8]/50 text-sm hover:text-[#94A3B8] transition-colors"
        >
          Cancel
        </button>
      </div>
    );
  }

  const INTERVENTIONS = [
    {
      id: 'brainwave' as InterventionId,
      Icon: Waves,
      title: 'Brainwave Session',
      desc: '6 Hz Theta — Urge Dissolve mode',
      time: '5-15 min',
      timeLabel: 'Dissolves cravings in 5-15 minutes',
      gradient: 'from-blue-600 to-cyan-500',
      glow: 'rgba(0,212,255,0.3)',
      onClick: () => router.push('/brainwave?mode=theta'),
      disabled: false,
    },
    {
      id: 'hrv' as InterventionId,
      Icon: Wind,
      title: 'HRV Breathwork',
      desc: '4-7-8 breathing with camera PPG',
      time: '5 min',
      timeLabel: 'Activates parasympathetic nervous system',
      gradient: 'from-emerald-600 to-green-400',
      glow: 'rgba(16,185,129,0.3)',
      onClick: () => router.push('/hrv'),
      disabled: false,
    },
    {
      id: 'pushups' as InterventionId,
      Icon: Dumbbell,
      title: 'Physical Snap',
      desc: '20 pushup challenge',
      time: '2 min',
      timeLabel: 'Floods body with endorphins, redirects energy',
      gradient: 'from-orange-600 to-red-500',
      glow: 'rgba(234,88,12,0.3)',
      onClick: startPushups,
      disabled: false,
    },
    {
      id: 'pattern' as InterventionId,
      Icon: Zap,
      title: 'Pattern Interrupt',
      desc: epilepsySafeMode ? 'Safe Mode — redirects to Theta session' : '3-second high-contrast flash → Theta',
      time: '30 sec',
      timeLabel: epilepsySafeMode ? 'Audio-only safe redirect' : 'Breaks neural craving loop instantly',
      gradient: 'from-amber-500 to-yellow-400',
      glow: 'rgba(245,158,11,0.3)',
      onClick: startPatternInterrupt,
      disabled: false,
    },
  ];

  return (
    <div className="min-h-screen bg-[#050810] relative overflow-hidden">
      {xpToast && <XPToast amount={xpToast.amount} label={xpToast.label} onDone={() => setXpToast(null)} />}

      {/* Background pulse */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-red-600/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="bg-[#050810]/90 backdrop-blur-xl border-b border-red-500/20 px-4 py-4 flex items-center gap-3 relative z-10">
        <button onClick={() => router.back()} className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[#94A3B8] hover:text-white transition-all">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-2xl font-black text-white">YOU GOT THIS</h1>
          <p className="text-red-400/70 text-xs">The urge will pass. Choose an intervention.</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4 relative z-10">
        {/* Urge banner */}
        <div className="glass border-red-500/20 p-4 text-center">
          <p className="text-red-300 font-bold text-sm">The urge will pass. You are not your cravings.</p>
          <p className="text-red-400/50 text-xs mt-1">Average craving duration: 15-20 minutes</p>
        </div>

        {/* Interventions */}
        {INTERVENTIONS.map((item) => (
          <button
            key={item.id}
            onClick={item.onClick}
            disabled={item.disabled}
            className="w-full glass glass-hover rounded-2xl p-5 text-left transition-all active:scale-95 group"
            style={{ borderColor: item.disabled ? undefined : undefined }}
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-14 h-14 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center flex-shrink-0`}
                style={{ boxShadow: `0 0 20px ${item.glow}` }}
              >
                <item.Icon size={26} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-black text-lg">{item.title}</h3>
                <p className="text-[#94A3B8] text-sm">{item.desc}</p>
                <p className="text-[#94A3B8]/50 text-xs mt-1">{item.timeLabel}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="glass-sm px-2 py-1 rounded-lg">
                  <p className="text-white/50 text-xs font-bold">{item.time}</p>
                </div>
                <p className="text-white/20 text-lg mt-1 group-hover:text-white/50 transition-colors">→</p>
              </div>
            </div>
            {item.id === 'pattern' && epilepsySafeMode && (
              <p className="text-amber-500/60 text-xs mt-3">Flash disabled — Epilepsy Safe Mode active</p>
            )}
          </button>
        ))}

        {/* Crisis resources */}
        <div className="glass p-4">
          <p className="text-[#94A3B8]/50 text-xs text-center mb-2">If you are in crisis:</p>
          <div className="flex gap-3 justify-center text-xs text-cyan-400/70 flex-wrap">
            <span>988 — Crisis Lifeline</span>
            <span className="text-white/20">·</span>
            <span>Text HOME to 741741</span>
          </div>
        </div>

        <p className="text-center text-xs text-white/15">
          Not a substitute for professional help. If in immediate danger, call 911.
        </p>
      </div>
    </div>
  );
}
