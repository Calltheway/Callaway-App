'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useDopamindStore } from '@/store/useDopamindStore';
import { ArrowLeft, Camera, CameraOff, Heart } from 'lucide-react';
import XPToast from '@/components/XPToast';

type Phase = 'idle' | 'permission' | 'breathing' | 'done';
type BreathPhase = 'inhale' | 'hold' | 'exhale' | 'rest';

const BREATH_SEQUENCE: { phase: BreathPhase; duration: number; label: string }[] = [
  { phase: 'inhale', duration: 4, label: 'Breathe In' },
  { phase: 'hold',   duration: 7, label: 'Hold' },
  { phase: 'exhale', duration: 8, label: 'Breathe Out' },
  { phase: 'rest',   duration: 2, label: 'Rest' },
];

export default function HRVPage() {
  const router = useRouter();
  const { addXP } = useDopamindStore();

  const [phase, setPhase] = useState<Phase>('idle');
  const [cameraError, setCameraError] = useState('');
  const [bpm, setBpm] = useState<number | null>(null);
  const [resilience, setResilience] = useState(0);
  const [breathPhaseIdx, setBreathPhaseIdx] = useState(0);
  const [breathProgress, setBreathProgress] = useState(0);
  const [breathCount, setBreathCount] = useState(0);
  const [sessionData, setSessionData] = useState<number[]>([]);
  const [xpToast, setXpToast] = useState<{ amount: number } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animFrameRef = useRef<number>(0);
  const breathTimerRef = useRef<NodeJS.Timeout | null>(null);

  // PPG data
  const samplesRef = useRef<number[]>([]);
  const lastPeakTimeRef = useRef<number>(0);
  const bpmValuesRef = useRef<number[]>([]);
  const rmssdValuesRef = useRef<number[]>([]);
  const lastBpmRef = useRef<number>(0);

  async function requestCamera() {
    setPhase('permission');
    setCameraError('');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' }, width: 320, height: 240 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setPhase('breathing');
      startPPG();
      startBreathingTimer();
    } catch (err) {
      setCameraError('Camera access denied. You can still do the breathing exercise manually.');
      setPhase('breathing');
      startBreathingTimer();
    }
  }

  function startPPG() {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = 20;
    canvas.height = 20;
    const ctx = canvas.getContext('2d')!;

    function sampleFrame() {
      if (!video || video.readyState < 2) {
        animFrameRef.current = requestAnimationFrame(sampleFrame);
        return;
      }
      try {
        ctx.drawImage(
          video,
          Math.max(0, video.videoWidth / 2 - 10),
          Math.max(0, video.videoHeight / 2 - 10),
          20, 20,
          0, 0, 20, 20
        );
        const imageData = ctx.getImageData(0, 0, 20, 20);
        let redSum = 0;
        for (let i = 0; i < imageData.data.length; i += 4) {
          redSum += imageData.data[i];
        }
        const redAvg = redSum / (20 * 20);
        samplesRef.current.push(redAvg);
        if (samplesRef.current.length > 300) samplesRef.current.shift();

        // Peak detection
        if (samplesRef.current.length > 10) {
          const mean = samplesRef.current.reduce((a, b) => a + b) / samplesRef.current.length;
          const recent = samplesRef.current.slice(-5);
          const recentMean = recent.reduce((a, b) => a + b) / recent.length;
          const now = Date.now();

          if (recentMean > mean * 1.01 && now - lastPeakTimeRef.current > 400) {
            const interval = now - lastPeakTimeRef.current;
            const newBpm = 60000 / interval;

            if (newBpm > 40 && newBpm < 180 && lastPeakTimeRef.current > 0) {
              bpmValuesRef.current.push(newBpm);
              if (bpmValuesRef.current.length > 10) bpmValuesRef.current.shift();

              // RMSSD calculation
              if (bpmValuesRef.current.length >= 2) {
                const intervals = bpmValuesRef.current.map((b) => 60000 / b);
                let ssSum = 0;
                for (let i = 1; i < intervals.length; i++) {
                  ssSum += Math.pow(intervals[i] - intervals[i - 1], 2);
                }
                const rmssd = Math.sqrt(ssSum / (intervals.length - 1));
                rmssdValuesRef.current.push(rmssd);
                if (rmssdValuesRef.current.length > 20) rmssdValuesRef.current.shift();

                // Resilience score: normalize RMSSD 0-100 (20ms = low, 60ms = high)
                const avgRmssd = rmssdValuesRef.current.reduce((a, b) => a + b) / rmssdValuesRef.current.length;
                const score = Math.min(100, Math.max(0, Math.round((avgRmssd - 10) / 50 * 100)));
                setResilience(score);
              }

              const avgBpm = Math.round(bpmValuesRef.current.slice(-5).reduce((a, b) => a + b) / Math.min(5, bpmValuesRef.current.length));
              setBpm(avgBpm);
              lastBpmRef.current = avgBpm;
              setSessionData((prev) => [...prev.slice(-60), avgBpm]);
            }
            lastPeakTimeRef.current = now;
          }
        }
      } catch { /* ignore canvas errors */ }

      animFrameRef.current = requestAnimationFrame(sampleFrame);
    }

    animFrameRef.current = requestAnimationFrame(sampleFrame);
  }

  function startBreathingTimer() {
    let phaseIdx = 0;
    let elapsed = 0;
    let cycles = 0;

    function tick() {
      const current = BREATH_SEQUENCE[phaseIdx];
      elapsed++;
      setBreathProgress((elapsed / current.duration) * 100);

      if (elapsed >= current.duration) {
        elapsed = 0;
        phaseIdx = (phaseIdx + 1) % BREATH_SEQUENCE.length;
        setBreathPhaseIdx(phaseIdx);
        if (phaseIdx === 0) {
          cycles++;
          setBreathCount(cycles);
          if (cycles >= 6) {
            finishSession();
            return;
          }
        }
      }

      breathTimerRef.current = setTimeout(tick, 1000);
    }

    breathTimerRef.current = setTimeout(tick, 1000);
  }

  function finishSession() {
    setPhase('done');
    addXP(20);
    setXpToast({ amount: 20 });
    cancelAnimationFrame(animFrameRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
  }

  useEffect(() => {
    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const currentBreath = BREATH_SEQUENCE[breathPhaseIdx];
  const circleScale = currentBreath.phase === 'inhale'
    ? 1 + (breathProgress / 100) * 0.6
    : currentBreath.phase === 'exhale'
    ? 1.6 - (breathProgress / 100) * 0.6
    : currentBreath.phase === 'hold'
    ? 1.6
    : 1;

  if (phase === 'done') {
    const avgBpm = sessionData.length > 0
      ? Math.round(sessionData.reduce((a, b) => a + b) / sessionData.length)
      : null;

    return (
      <div className="min-h-screen bg-[#0A0E1A] flex flex-col items-center justify-center p-6 text-center">
        {xpToast && <XPToast amount={xpToast.amount} label="HRV Session" onDone={() => setXpToast(null)} />}
        <div className="text-5xl mb-4">💚</div>
        <h1 className="text-2xl font-black text-white mb-2">Your nervous system is now in recovery mode</h1>
        <p className="text-gray-400 text-sm mb-6 leading-relaxed max-w-xs">
          6 complete breath cycles activated your parasympathetic nervous system. The urge chemicals are being flushed.
        </p>

        {avgBpm && (
          <div className="bg-[#111827] border border-[#1E2A3A] rounded-2xl p-5 mb-6 w-full max-w-xs">
            <div className="flex justify-around">
              <div className="text-center">
                <p className="text-3xl font-black text-[#00D4FF]">{avgBpm}</p>
                <p className="text-gray-500 text-xs">Avg BPM</p>
              </div>
              <div className="w-px bg-[#1E2A3A]" />
              <div className="text-center">
                <p className="text-3xl font-black text-green-400">{resilience}</p>
                <p className="text-gray-500 text-xs">Resilience Score</p>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-3 w-full max-w-xs">
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full bg-[#00D4FF] text-[#0A0E1A] font-bold py-4 rounded-2xl hover:bg-[#00B8E0] transition-all"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => { setPhase('idle'); setBreathCount(0); setBreathPhaseIdx(0); setBreathProgress(0); setSessionData([]); }}
            className="w-full border border-[#1E2A3A] text-gray-300 py-3 rounded-2xl text-sm hover:border-gray-500 transition-all"
          >
            Do Another Round
          </button>
        </div>
      </div>
    );
  }

  if (phase === 'idle' || phase === 'permission') {
    return (
      <div className="min-h-screen bg-[#0A0E1A]">
        <div className="bg-[#060912] border-b border-[#1E2A3A] px-4 py-4 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-lg font-black text-white">HRV Breathwork</h1>
            <p className="text-gray-500 text-xs">4-7-8 breathing with live heart rate</p>
          </div>
        </div>

        <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-green-900/20 border border-green-700/30 flex items-center justify-center">
              <Heart size={36} className="text-green-400" />
            </div>
            <h2 className="text-2xl font-black text-white mb-2">Regulate Your Nervous System</h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              The 4-7-8 breathing technique activates your vagus nerve, stopping the craving response at its source. With camera access, we'll measure your heart rate variability in real time.
            </p>
          </div>

          <div className="bg-[#111827] border border-[#1E2A3A] rounded-2xl p-5 space-y-3">
            <h3 className="text-white font-bold">The 4-7-8 Pattern</h3>
            {BREATH_SEQUENCE.filter(s => s.phase !== 'rest').map((s) => (
              <div key={s.phase} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#060912] flex items-center justify-center text-[#00D4FF] font-black text-sm">
                  {s.duration}
                </div>
                <div>
                  <p className="text-white text-sm font-semibold capitalize">{s.label}</p>
                  <p className="text-gray-500 text-xs">{s.duration} seconds</p>
                </div>
              </div>
            ))}
            <p className="text-gray-500 text-xs">6 cycles · ~5 minutes total</p>
          </div>

          {cameraError && (
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-xl p-3">
              <p className="text-yellow-400 text-xs">{cameraError}</p>
            </div>
          )}

          <button
            onClick={requestCamera}
            disabled={phase === 'permission'}
            className="w-full py-4 bg-[#00D4FF] text-[#0A0E1A] font-bold rounded-2xl hover:bg-[#00B8E0] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Camera size={20} />
            {phase === 'permission' ? 'Requesting camera...' : 'Begin with Camera PPG'}
          </button>

          <button
            onClick={() => { setPhase('breathing'); startBreathingTimer(); }}
            className="w-full py-3 border border-[#1E2A3A] text-gray-400 rounded-2xl hover:border-gray-600 transition-all text-sm"
          >
            Begin without camera
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A]">
      <div className="bg-[#060912] border-b border-[#1E2A3A] px-4 py-4 flex items-center gap-3">
        <button
          onClick={() => {
            cancelAnimationFrame(animFrameRef.current);
            if (breathTimerRef.current) clearTimeout(breathTimerRef.current);
            streamRef.current?.getTracks().forEach((t) => t.stop());
            router.back();
          }}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-black text-white">Breathing Session</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Camera preview */}
        {streamRef.current && (
          <div className="relative mx-auto w-32 h-32 rounded-2xl overflow-hidden border border-[#1E2A3A]">
            <video ref={videoRef} className="w-full h-full object-cover" playsInline muted />
            {bpm && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                <Heart size={16} className="text-red-400 mb-1 animate-pulse" />
                <p className="text-white font-black text-lg">{bpm}</p>
                <p className="text-gray-400 text-xs">BPM</p>
              </div>
            )}
          </div>
        )}

        {/* Breathing circle */}
        <div className="flex flex-col items-center py-8">
          <div className="relative flex items-center justify-center w-64 h-64">
            <div
              className="absolute w-48 h-48 rounded-full border-4 border-[#00D4FF]/30 bg-[#00D4FF]/5 transition-transform ease-in-out"
              style={{
                transform: `scale(${circleScale})`,
                transitionDuration: `${currentBreath.duration * 1000}ms`,
              }}
            />
            <div className="relative text-center z-10">
              <p className="text-4xl font-black text-white">{currentBreath.duration - Math.floor(breathProgress / 100 * currentBreath.duration)}</p>
              <p className="text-[#00D4FF] font-bold mt-1">{currentBreath.label}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-[#111827] border border-[#1E2A3A] rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-[#00D4FF]">{breathCount}</p>
            <p className="text-gray-500 text-xs">Cycles</p>
          </div>
          <div className="bg-[#111827] border border-[#1E2A3A] rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-red-400">{bpm || '--'}</p>
            <p className="text-gray-500 text-xs">BPM</p>
          </div>
          <div className="bg-[#111827] border border-[#1E2A3A] rounded-xl p-3 text-center">
            <p className="text-2xl font-black text-green-400">{resilience}</p>
            <p className="text-gray-500 text-xs">Resilience</p>
          </div>
        </div>

        <div className="h-1.5 bg-[#1E2A3A] rounded-full overflow-hidden">
          <div
            className="h-full bg-green-400 rounded-full transition-all duration-200"
            style={{ width: `${(breathCount / 6) * 100}%` }}
          />
        </div>
        <p className="text-center text-gray-500 text-xs">{breathCount} / 6 cycles</p>
      </div>
    </div>
  );
}
