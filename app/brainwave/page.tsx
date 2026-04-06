'use client';

import { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useUnhookedStore } from '@/store/useUnhookedStore';
import { ArrowLeft, Play, Square, Volume2, VolumeX } from 'lucide-react';
import XPToast from '@/components/XPToast';

const MODES = [
  { id: 'theta',  label: 'Theta Calm',    hz: 6,  base: 200, desc: 'Urge Dissolve',  colors: ['#0A1628', '#001F3F', '#003366'], textColor: '#00D4FF' },
  { id: 'alpha',  label: 'Alpha Focus',   hz: 10, base: 220, desc: 'Dopamine Reset', colors: ['#0A1A0A', '#003300', '#004400'], textColor: '#00FF88' },
  { id: 'gamma',  label: 'Gamma Rewire',  hz: 40, base: 200, desc: 'Deep Rewire',    colors: ['#1A0A28', '#2D0060', '#4400AA'], textColor: '#AA44FF' },
  { id: 'delta',  label: 'Delta Sleep',   hz: 2,  base: 150, desc: 'Sleep Repair',   colors: ['#05050F', '#0A0A1E', '#10102D'], textColor: '#8888FF' },
  { id: 'beta',   label: 'Beta Power',    hz: 14, base: 230, desc: 'Morning Power',  colors: ['#1A0A00', '#331500', '#662200'], textColor: '#FFD700' },
];

const SESSION_DURATIONS = [
  { label: '5 min',  seconds: 300 },
  { label: '10 min', seconds: 600 },
  { label: '20 min', seconds: 1200 },
];

function drawMandala(
  ctx: CanvasRenderingContext2D,
  time: number,
  freq: number,
  progress: number,
  safeMode: boolean
) {
  const w = ctx.canvas.width;
  const h = ctx.canvas.height;
  const cx = w / 2;
  const cy = h / 2;

  ctx.clearRect(0, 0, w, h);

  const r = Math.round(255 * (1 - progress));
  const g = Math.round(212 * progress);
  const b = Math.round(255 * progress);

  const arms = 8;
  const layers = 5;
  const slowFreq = safeMode ? 0.2 : freq;

  for (let layer = 1; layer <= layers; layer++) {
    const radius = layer * Math.min(w, h) * 0.08;
    const rotation = time * slowFreq * 0.1 * (layer % 2 === 0 ? 1 : -1);

    for (let arm = 0; arm < arms; arm++) {
      const angle = (arm / arms) * Math.PI * 2 + rotation;
      const pulse = safeMode ? 0 : Math.sin(time * slowFreq * Math.PI * 2) * 5;

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(
        radius * 0.3, -(radius * 0.2 + pulse),
        radius * 0.7, -(radius * 0.3 + pulse),
        radius + pulse, 0
      );
      ctx.bezierCurveTo(
        radius * 0.7, radius * 0.3 + pulse,
        radius * 0.3, radius * 0.2 + pulse,
        0, 0
      );

      const alpha = 0.6 - (layer - 1) * 0.1;
      ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }
  }

  // Center orb
  const orbRadius = 20 + (safeMode ? 0 : Math.sin(time * slowFreq * Math.PI * 2) * 5);
  const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbRadius * 2);
  gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0.9)`);
  gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, 0.3)`);
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.beginPath();
  ctx.arc(cx, cy, orbRadius * 2, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Particles
  if (!safeMode) {
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2 + time * slowFreq * 0.5;
      const dist = 30 + Math.sin(time * slowFreq * Math.PI * 2 + i) * 15;
      const px = cx + Math.cos(angle) * dist;
      const py = cy + Math.sin(angle) * dist;
      const pAlpha = (Math.sin(time * slowFreq * Math.PI * 2 + i * 0.8) + 1) / 2 * 0.7;
      ctx.beginPath();
      ctx.arc(px, py, 2, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${pAlpha})`;
      ctx.fill();
    }
  }
}

function BrainwaveInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { epilepsySafeMode, addXP, userId } = useUnhookedStore();

  const initialMode = searchParams.get('mode') || 'theta';
  const [selectedMode, setSelectedMode] = useState(initialMode);
  const [selectedDuration, setSelectedDuration] = useState(SESSION_DURATIONS[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [voiceMessages, setVoiceMessages] = useState<string[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [xpToast, setXpToast] = useState<{ amount: number } | null>(null);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorsRef = useRef<{ stop: () => void }[]>([]);
  const animFrameRef = useRef<number>(0);
  const pulseFrameRef = useRef<number>(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const startTimeRef = useRef<number>(0);
  const sessionStartRef = useRef<number>(0);

  const mode = MODES.find((m) => m.id === selectedMode) || MODES[0];

  // Fetch voice coach messages
  useEffect(() => {
    if (!isPlaying) return;
    async function fetchMessages() {
      try {
        const res = await fetch(`/api/voice-coach?mode=${selectedMode}&sessionMinutes=0&streakDays=0`);
        const data = await res.json();
        if (data.messages) setVoiceMessages(data.messages);
      } catch { /* ignore */ }
    }
    fetchMessages();
  }, [isPlaying, selectedMode]);

  // Cycle through voice messages
  useEffect(() => {
    if (!isPlaying || voiceMessages.length === 0) return;
    let msgIdx = 0;
    setCurrentMessage(voiceMessages[0]);
    const interval = setInterval(() => {
      msgIdx = (msgIdx + 1) % voiceMessages.length;
      setCurrentMessage(voiceMessages[msgIdx]);
    }, 18000);
    return () => clearInterval(interval);
  }, [isPlaying, voiceMessages]);

  function createBinauralBeat(ctx: AudioContext, baseFreq: number, beatFreq: number) {
    const merger = ctx.createChannelMerger(2);

    const leftOsc = ctx.createOscillator();
    const leftGain = ctx.createGain();
    leftOsc.frequency.value = baseFreq;
    leftOsc.type = 'sine';
    leftGain.gain.value = 0.3;
    leftOsc.connect(leftGain);
    leftGain.connect(merger, 0, 0);

    const rightOsc = ctx.createOscillator();
    const rightGain = ctx.createGain();
    rightOsc.frequency.value = baseFreq + beatFreq;
    rightOsc.type = 'sine';
    rightGain.gain.value = 0.3;
    rightOsc.connect(rightGain);
    rightGain.connect(merger, 0, 1);

    merger.connect(ctx.destination);
    leftOsc.start();
    rightOsc.start();

    return {
      stop: () => {
        try { leftOsc.stop(); rightOsc.stop(); merger.disconnect(); } catch { /* ignore */ }
      }
    };
  }

  function createIsochronicTone(ctx: AudioContext, freq: number, pulseFreq: number) {
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    osc.frequency.value = freq + 50;
    osc.type = 'sine';
    gainNode.gain.value = 0;

    const pulsePeriod = 1 / pulseFreq;
    const currentTime = ctx.currentTime;
    const maxPulses = Math.min(600, Math.ceil(selectedDuration.seconds * pulseFreq));
    for (let i = 0; i < maxPulses; i++) {
      gainNode.gain.setValueAtTime(0.15, currentTime + i * pulsePeriod);
      gainNode.gain.setValueAtTime(0, currentTime + i * pulsePeriod + pulsePeriod * 0.5);
    }

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start();
    return { stop: () => { try { osc.stop(); gainNode.disconnect(); } catch { /* ignore */ } } };
  }

  const startSession = useCallback(() => {
    setIsPlaying(true);
    setElapsed(0);
    sessionStartRef.current = Date.now();

    // Audio
    if (audioEnabled) {
      try {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        audioCtxRef.current = ctx;
        const bb = createBinauralBeat(ctx, mode.base, mode.hz);
        const iso = createIsochronicTone(ctx, mode.base, mode.hz);
        oscillatorsRef.current = [bb, iso];
      } catch (e) {
        console.warn('Audio init failed:', e);
      }
    }

    // Screen pulse
    startTimeRef.current = performance.now();
    const animatePulse = (ts: number) => {
      const elapsedSec = (ts - startTimeRef.current) / 1000;
      if (overlayRef.current && !epilepsySafeMode) {
        const opacity = (Math.sin(2 * Math.PI * mode.hz * elapsedSec) + 1) / 2 * 0.35;
        overlayRef.current.style.opacity = String(opacity);
      }
      pulseFrameRef.current = requestAnimationFrame(animatePulse);
    };
    pulseFrameRef.current = requestAnimationFrame(animatePulse);

    // Mandala canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx2d = canvas.getContext('2d');
      if (ctx2d) {
        let t = 0;
        const animateMandala = () => {
          const progress = Math.min(1, (Date.now() - sessionStartRef.current) / (selectedDuration.seconds * 1000));
          drawMandala(ctx2d, t, mode.hz, progress, epilepsySafeMode);
          t += 0.016;
          animFrameRef.current = requestAnimationFrame(animateMandala);
        };
        animateMandala();
      }
    }
  }, [audioEnabled, mode, epilepsySafeMode, selectedDuration]);

  // Session timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next >= selectedDuration.seconds) {
          stopSession(true);
          return selectedDuration.seconds;
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, selectedDuration]);

  function stopSession(completed = false) {
    setIsPlaying(false);

    oscillatorsRef.current.forEach((o) => o.stop());
    oscillatorsRef.current = [];

    try { audioCtxRef.current?.close(); } catch { /* ignore */ }
    cancelAnimationFrame(animFrameRef.current);
    cancelAnimationFrame(pulseFrameRef.current);
    if (overlayRef.current) overlayRef.current.style.opacity = '0';

    if (completed) {
      const xpEarned = Math.round(selectedDuration.seconds / 60) * 15;
      addXP(xpEarned);
      setXpToast({ amount: xpEarned });

      // Log session to Supabase
      try {
        fetch('/api/coach', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionLog: true, mode: selectedMode, duration: selectedDuration.seconds, userId }),
        }).catch(() => {});
      } catch { /* ignore */ }
    }
  }

  useEffect(() => {
    return () => {
      stopSession(false);
    };
  }, []);

  // Canvas resize
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);
    return () => window.removeEventListener('resize', resize);
  }, []);

  const progressPercent = (elapsed / selectedDuration.seconds) * 100;
  const remainingSeconds = selectedDuration.seconds - elapsed;
  const remainingMin = Math.floor(remainingSeconds / 60);
  const remainingSec = remainingSeconds % 60;

  const circumference = 2 * Math.PI * 120;
  const dashOffset = circumference * (1 - progressPercent / 100);

  if (isPlaying) {
    return (
      <div
        className="fixed inset-0 flex flex-col items-center justify-center overflow-hidden"
        style={{ background: `radial-gradient(ellipse at center, ${mode.colors[1]} 0%, ${mode.colors[0]} 100%)` }}
      >
        {xpToast && <XPToast amount={xpToast.amount} label="Session complete" onDone={() => setXpToast(null)} />}

        {/* Screen pulse overlay */}
        <div
          ref={overlayRef}
          className="absolute inset-0 pointer-events-none"
          style={{ backgroundColor: mode.textColor, opacity: 0 }}
        />

        {/* Mandala canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />

        {/* Progress ring */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 5 }}>
          <circle
            cx="50%"
            cy="50%"
            r="48%"
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="3"
          />
          <circle
            cx="50%"
            cy="50%"
            r="48%"
            fill="none"
            stroke={mode.textColor}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${circumference}`}
            strokeDashoffset={`${dashOffset}`}
            transform="rotate(-90)"
            style={{ transformOrigin: 'center', opacity: 0.5 }}
          />
        </svg>

        {/* Top controls */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between z-20">
          <button
            onClick={() => stopSession(false)}
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-all"
          >
            <ArrowLeft size={18} />
          </button>
          <div className="text-center">
            <p className="text-white/80 font-bold text-sm">{mode.label}</p>
            <p className="text-white/50 text-xs">{mode.desc}</p>
          </div>
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className="w-10 h-10 rounded-full bg-black/30 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/50 transition-all"
          >
            {audioEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
        </div>

        {/* Center timer */}
        <div className="relative z-10 text-center">
          <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Remaining</p>
          <p className="text-white font-black text-5xl tabular-nums">
            {String(remainingMin).padStart(2, '0')}:{String(remainingSec).padStart(2, '0')}
          </p>
          <p className="text-white/50 text-sm mt-1">{mode.hz} Hz · {epilepsySafeMode ? 'Safe Mode' : 'Full Mode'}</p>
        </div>

        {/* Voice coach message */}
        {currentMessage && (
          <div className="absolute bottom-32 left-8 right-8 z-20 text-center">
            <p
              className="text-white/70 text-sm italic leading-relaxed animate-pulse"
              style={{ textShadow: `0 0 20px ${mode.textColor}` }}
            >
              "{currentMessage}"
            </p>
          </div>
        )}

        {/* Stop button */}
        <button
          onClick={() => stopSession(false)}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 w-16 h-16 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/50 transition-all"
        >
          <Square size={20} />
        </button>

        {epilepsySafeMode && (
          <div className="absolute bottom-4 left-0 right-0 text-center z-20">
            <p className="text-yellow-400/60 text-xs">Epilepsy Safe Mode Active</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      {xpToast && <XPToast amount={xpToast.amount} label="Session complete" onDone={() => setXpToast(null)} />}

      {/* Header */}
      <div className="bg-[#060912] border-b border-[#1E2A3A] px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-lg font-black text-white">Brainwave Entrainment</h1>
          <p className="text-gray-500 text-xs">Neural rewiring through sound & light</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {epilepsySafeMode && (
          <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-3">
            <p className="text-yellow-400 text-xs">
              ⚠️ Epilepsy Safe Mode: Screen pulse disabled. Audio entrainment fully active.
            </p>
          </div>
        )}

        {/* Mode selector */}
        <div>
          <h2 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Entrainment Mode</h2>
          <div className="space-y-2">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => setSelectedMode(m.id)}
                className={`w-full p-4 rounded-2xl border text-left transition-all flex items-center gap-4 ${
                  selectedMode === m.id
                    ? 'bg-[#00D4FF]/10 border-[#00D4FF]'
                    : 'bg-[#111827] border-[#1E2A3A] hover:border-gray-600'
                }`}
              >
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: m.colors[1] + '80', border: `1px solid ${m.textColor}40` }}
                >
                  <span className="font-black text-sm" style={{ color: m.textColor }}>{m.hz}Hz</span>
                </div>
                <div className="flex-1">
                  <p className="text-white font-bold text-sm">{m.label}</p>
                  <p className="text-gray-500 text-xs">{m.desc}</p>
                </div>
                {selectedMode === m.id && (
                  <div className="w-2 h-2 rounded-full bg-[#00D4FF]" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Duration selector */}
        <div>
          <h2 className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-3">Session Duration</h2>
          <div className="flex gap-3">
            {SESSION_DURATIONS.map((d) => (
              <button
                key={d.label}
                onClick={() => setSelectedDuration(d)}
                className={`flex-1 py-3 rounded-xl border text-sm font-bold transition-all ${
                  selectedDuration.label === d.label
                    ? 'bg-[#00D4FF] text-[#0A0E1A] border-[#00D4FF]'
                    : 'bg-[#111827] border-[#1E2A3A] text-gray-400 hover:border-gray-600'
                }`}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>

        {/* Audio toggle */}
        <div className="bg-[#111827] border border-[#1E2A3A] rounded-2xl p-4 flex items-center justify-between">
          <div>
            <p className="text-white font-semibold text-sm">Binaural Audio</p>
            <p className="text-gray-500 text-xs">Requires headphones for best results</p>
          </div>
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`w-12 h-6 rounded-full transition-all relative ${audioEnabled ? 'bg-[#00D4FF]' : 'bg-[#1E2A3A]'}`}
          >
            <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all ${audioEnabled ? 'right-0.5' : 'left-0.5'}`} />
          </button>
        </div>

        {/* Science brief */}
        <div className="bg-[#111827] border border-[#1E2A3A] rounded-2xl p-4">
          <p className="text-[#00D4FF] font-bold text-sm mb-2">How it works</p>
          <p className="text-gray-400 text-xs leading-relaxed">
            {mode.id === 'theta' && 'Theta waves (4-8 Hz) are associated with deep relaxation and reduced cravings. The entrainment guides your brain into this calm state, where urges naturally dissolve.'}
            {mode.id === 'alpha' && 'Alpha waves (8-12 Hz) promote relaxed focus and dopamine rebalancing. Regular sessions help restore your brain\'s natural reward sensitivity.'}
            {mode.id === 'gamma' && 'Gamma waves (30-100 Hz) are linked to cognitive enhancement and neural plasticity. This mode accelerates the rewiring of habitual neural pathways.'}
            {mode.id === 'delta' && 'Delta waves (0.5-4 Hz) dominate during deep sleep. This mode promotes deep restoration and HGH release critical for neural repair.'}
            {mode.id === 'beta' && 'Beta waves (13-30 Hz) promote alertness and motivation. Morning sessions build the mental energy to choose your values over impulses.'}
          </p>
        </div>

        {/* Start button */}
        <button
          onClick={startSession}
          className="w-full py-5 bg-[#00D4FF] text-[#0A0E1A] font-black text-xl rounded-2xl hover:bg-[#00B8E0] transition-all active:scale-95 flex items-center justify-center gap-3 shadow-lg"
          style={{ boxShadow: '0 0 30px rgba(0,212,255,0.3)' }}
        >
          <Play size={24} fill="currentColor" />
          Begin Session
        </button>

        <p className="text-center text-xs text-gray-700">
          Use headphones for full binaural beat effect. Volume at 50-70%. Not for use while driving.
        </p>
      </div>
    </div>
  );
}

export default function BrainwavePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0A0E1A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/30 flex items-center justify-center animate-pulse">
            <span className="text-2xl font-black text-[#00D4FF]">🧠</span>
          </div>
          <p className="text-gray-400 text-sm">Loading Brainwave Engine...</p>
        </div>
      </div>
    }>
      <BrainwaveInner />
    </Suspense>
  );
}
