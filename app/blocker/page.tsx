'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Shield,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Lock,
  Smartphone,
  Wifi,
  Users,
  Timer,
  CheckCircle,
} from 'lucide-react';

interface BlockCategory {
  id: string;
  label: string;
  desc: string;
  icon: string;
  enabled: boolean;
}

const INITIAL_CATEGORIES: BlockCategory[] = [
  {
    id: 'adult',
    label: 'Adult Content Sites',
    desc: 'All pornographic and explicit adult content sites and apps',
    icon: '🔞',
    enabled: true,
  },
  {
    id: 'social',
    label: 'Social Media',
    desc: 'Instagram, TikTok, Twitter/X — high-trigger scrolling feeds',
    icon: '📱',
    enabled: false,
  },
  {
    id: 'dating',
    label: 'Dating Apps',
    desc: 'Tinder, Bumble, Hinge — apps that can trigger compulsive swiping',
    icon: '💔',
    enabled: false,
  },
  {
    id: 'forums',
    label: 'Forums & Imageboards',
    desc: 'Reddit and similar communities with unmoderated image content',
    icon: '💬',
    enabled: false,
  },
  {
    id: 'messaging',
    label: 'Anonymous Messaging',
    desc: 'Omegle and similar anonymous chat platforms',
    icon: '👤',
    enabled: false,
  },
];

const FOCUS_DURATIONS = [10, 20, 30];

const DNS_BLOCKERS = [
  {
    name: 'CleanBrowsing',
    desc: 'Family-safe DNS filter with automatic adult content blocking. Free tier available.',
    tag: 'Most Popular',
    tagColor: 'from-violet-600 to-violet-400',
  },
  {
    name: 'OpenDNS FamilyShield',
    desc: 'Cisco-backed DNS that automatically blocks adult content. Simple one-click setup.',
    tag: 'Easy Setup',
    tagColor: 'from-cyan-600 to-cyan-400',
  },
  {
    name: 'NextDNS',
    desc: 'Highly customizable DNS with detailed logs and blocklists. 300k queries/month free.',
    tag: 'Most Control',
    tagColor: 'from-emerald-600 to-emerald-400',
  },
];

export default function BlockerPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<BlockCategory[]>(INITIAL_CATEGORIES);
  const [iosExpanded, setIosExpanded] = useState(false);
  const [androidExpanded, setAndroidExpanded] = useState(false);
  const [focusActive, setFocusActive] = useState(false);
  const [focusDuration, setFocusDuration] = useState(10);
  const [focusSecondsLeft, setFocusSecondsLeft] = useState(0);
  const focusInterval = useRef<NodeJS.Timeout | null>(null);

  // Persist categories in localStorage
  useEffect(() => {
    const saved = localStorage.getItem('dopamind-block-categories');
    if (saved) {
      try {
        setCategories(JSON.parse(saved));
      } catch { /* ignore */ }
    }
  }, []);

  function toggleCategory(id: string) {
    setCategories((prev) => {
      const next = prev.map((c) => c.id === id ? { ...c, enabled: !c.enabled } : c);
      localStorage.setItem('dopamind-block-categories', JSON.stringify(next));
      return next;
    });
  }

  function startFocusMode() {
    const totalSeconds = focusDuration * 60;
    setFocusSecondsLeft(totalSeconds);
    setFocusActive(true);
    focusInterval.current = setInterval(() => {
      setFocusSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(focusInterval.current!);
          setFocusActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function endFocusEarly() {
    if (focusInterval.current) clearInterval(focusInterval.current);
    setFocusActive(false);
    setFocusSecondsLeft(0);
  }

  useEffect(() => {
    return () => {
      if (focusInterval.current) clearInterval(focusInterval.current);
    };
  }, []);

  const focusMinLeft = Math.floor(focusSecondsLeft / 60);
  const focusSecLeft = focusSecondsLeft % 60;
  const focusProgress = focusActive ? (1 - focusSecondsLeft / (focusDuration * 60)) : 0;
  const circumference = 2 * Math.PI * 90;

  // Focus mode overlay
  if (focusActive) {
    return (
      <div className="focus-overlay flex flex-col items-center justify-center p-8 text-center">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-violet-600/5 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 w-full max-w-sm">
          {/* Timer ring */}
          <div className="relative w-56 h-56 mx-auto mb-8">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
              <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
              <circle
                cx="100" cy="100" r="90" fill="none"
                stroke="url(#focusGrad)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={`${circumference}`}
                strokeDashoffset={`${circumference * (1 - focusProgress)}`}
                className="transition-all duration-1000"
              />
              <defs>
                <linearGradient id="focusGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#7C3AED" />
                  <stop offset="100%" stopColor="#00D4FF" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-white/40 text-xs uppercase tracking-widest mb-1">Focus Mode</p>
              <p className="text-white font-black text-5xl tabular-nums">
                {String(focusMinLeft).padStart(2, '0')}:{String(focusSecLeft).padStart(2, '0')}
              </p>
              <p className="text-[#94A3B8]/50 text-xs mt-1">remaining</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-3xl font-black text-white mb-2">Stay Strong</h2>
            <p className="text-[#94A3B8]">Focus mode active. You chose this moment. Honor it.</p>
          </div>

          <div className="glass p-4 mb-6">
            <div className="flex items-center gap-3">
              <Shield size={18} className="text-violet-400 flex-shrink-0" />
              <p className="text-[#94A3B8] text-sm">Your block list is active. Triggers are shielded.</p>
            </div>
          </div>

          <button
            onClick={endFocusEarly}
            className="w-full btn-secondary py-3.5 text-sm"
          >
            End Focus Mode Early
          </button>
          <p className="text-white/20 text-xs mt-3">Ending early will not reset your streak.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050810] pb-28">
      {/* Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-violet-600/5 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <div className="bg-[#050810]/80 backdrop-blur-xl border-b border-white/[0.06] px-4 py-4 flex items-center gap-3 relative z-10">
        <button
          onClick={() => router.back()}
          className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[#94A3B8] hover:text-white transition-all"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-600 to-violet-400 flex items-center justify-center"
            style={{ boxShadow: '0 0 20px rgba(124,58,237,0.4)' }}>
            <Shield size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black text-white">Block Temptation</h1>
            <p className="text-[#94A3B8]/60 text-xs">Shield yourself from triggers</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6 relative z-10">

        {/* Block List */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Lock size={14} className="text-[#94A3B8]" />
            <h2 className="text-[#94A3B8] text-xs font-bold uppercase tracking-widest">Block List</h2>
          </div>
          <div className="space-y-2">
            {categories.map((cat) => (
              <div key={cat.id} className="glass glass-hover p-4 flex items-center gap-4">
                <span className="text-2xl flex-shrink-0">{cat.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-bold text-sm">{cat.label}</p>
                  <p className="text-[#94A3B8]/60 text-xs mt-0.5 truncate">{cat.desc}</p>
                </div>
                {/* Toggle switch */}
                <button
                  onClick={() => toggleCategory(cat.id)}
                  className={`w-12 h-6 rounded-full transition-all duration-300 relative flex-shrink-0 ${cat.enabled ? 'bg-gradient-to-r from-violet-600 to-cyan-500' : 'bg-white/[0.08]'}`}
                  style={cat.enabled ? { boxShadow: '0 0 12px rgba(124,58,237,0.4)' } : {}}
                >
                  <div className={`w-5 h-5 rounded-full bg-white absolute top-0.5 transition-all duration-300 shadow-sm ${cat.enabled ? 'right-0.5' : 'left-0.5'}`} />
                </button>
              </div>
            ))}
          </div>
          <p className="text-[#94A3B8]/40 text-xs mt-3 leading-relaxed">
            These categories are saved locally. Combine with system-level controls below for strongest protection.
          </p>
        </section>

        {/* iOS Setup */}
        <section>
          <button
            onClick={() => setIosExpanded(!iosExpanded)}
            className="w-full glass glass-hover p-4 flex items-center gap-3 text-left transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-600/20 to-cyan-400/10 border border-cyan-400/30 flex items-center justify-center flex-shrink-0">
              <Smartphone size={18} className="text-cyan-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">Set Up Screen Time (iOS)</p>
              <p className="text-[#94A3B8]/60 text-xs">Step-by-step device-level blocking</p>
            </div>
            {iosExpanded ? <ChevronUp size={18} className="text-[#94A3B8]/40" /> : <ChevronDown size={18} className="text-[#94A3B8]/40" />}
          </button>

          {iosExpanded && (
            <div className="glass mt-2 p-5 space-y-4 animate-slide-up">
              {[
                { step: 1, title: 'Open Settings', desc: 'Tap the Settings app on your iPhone or iPad home screen.' },
                { step: 2, title: 'Tap Screen Time', desc: 'Scroll down and tap "Screen Time". Enable it if not already on.' },
                { step: 3, title: 'Content & Privacy Restrictions', desc: 'Tap "Content & Privacy Restrictions" and toggle it ON.' },
                { step: 4, title: 'Limit Adult Websites', desc: 'Tap "Content Restrictions" → "Web Content" → select "Limit Adult Websites". iOS will now block explicit content automatically.' },
                { step: 5, title: 'Share with Partner', desc: 'Screenshot your Screen Time settings and send to your accountability partner for verification.' },
              ].map((s) => (
                <div key={s.step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-600 to-cyan-400 flex items-center justify-center text-white font-black text-sm flex-shrink-0 mt-0.5"
                    style={{ boxShadow: '0 0 12px rgba(0,212,255,0.3)' }}>
                    {s.step}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{s.title}</p>
                    <p className="text-[#94A3B8]/70 text-xs mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Android Setup */}
        <section>
          <button
            onClick={() => setAndroidExpanded(!androidExpanded)}
            className="w-full glass glass-hover p-4 flex items-center gap-3 text-left transition-all"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600/20 to-emerald-400/10 border border-emerald-400/30 flex items-center justify-center flex-shrink-0">
              <Smartphone size={18} className="text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="text-white font-bold text-sm">Set Up Digital Wellbeing (Android)</p>
              <p className="text-[#94A3B8]/60 text-xs">Step-by-step device-level blocking</p>
            </div>
            {androidExpanded ? <ChevronUp size={18} className="text-[#94A3B8]/40" /> : <ChevronDown size={18} className="text-[#94A3B8]/40" />}
          </button>

          {androidExpanded && (
            <div className="glass mt-2 p-5 space-y-4 animate-slide-up">
              {[
                { step: 1, title: 'Open Settings', desc: 'Open the Settings app on your Android device.' },
                { step: 2, title: 'Find Digital Wellbeing', desc: 'Tap "Digital Wellbeing & Parental Controls" (may vary by manufacturer).' },
                { step: 3, title: 'Set Up Parental Controls', desc: 'Tap "Parental Controls" and follow setup. Use Google Family Link for stronger enforcement.' },
                { step: 4, title: 'Content Filters', desc: 'In Google Play Store → tap your profile → Settings → Family → turn on content filtering. Set to "Teen" or "Child" level.' },
                { step: 5, title: 'Use a DNS Blocker', desc: 'For network-level blocking, change your DNS settings (see the DNS section below). This blocks content in all browsers and apps.' },
              ].map((s) => (
                <div key={s.step} className="flex gap-4">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-600 to-emerald-400 flex items-center justify-center text-white font-black text-sm flex-shrink-0 mt-0.5"
                    style={{ boxShadow: '0 0 12px rgba(16,185,129,0.3)' }}>
                    {s.step}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{s.title}</p>
                    <p className="text-[#94A3B8]/70 text-xs mt-0.5 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Accountability Partner Passcode */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Users size={14} className="text-[#94A3B8]" />
            <h2 className="text-[#94A3B8] text-xs font-bold uppercase tracking-widest">Accountability Partner Passcode</h2>
          </div>
          <div className="card-gradient-border p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-400/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0">
                <Lock size={18} className="text-amber-400" />
              </div>
              <div>
                <p className="text-white font-black text-sm">The most powerful strategy</p>
                <p className="text-[#94A3B8]/70 text-xs mt-1 leading-relaxed">
                  After setting up Screen Time on iOS, have your accountability partner — not you — set the Screen Time passcode. This means you physically cannot disable your own content filters, no matter how strong the urge feels in the moment.
                </p>
              </div>
            </div>
            <div className="glass-sm p-3 space-y-2">
              {[
                'Choose someone you trust completely',
                'Give them the passcode responsibility, not just knowledge',
                'Agree on a protocol for emergency access',
                'Check in with them weekly about your progress',
              ].map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <CheckCircle size={13} className="text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[#94A3B8]/80 text-xs">{tip}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* DNS Blockers */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Wifi size={14} className="text-[#94A3B8]" />
            <h2 className="text-[#94A3B8] text-xs font-bold uppercase tracking-widest">Recommended DNS Blockers</h2>
          </div>
          <p className="text-[#94A3B8]/50 text-xs mb-3 leading-relaxed">
            DNS blockers work at the network level — blocking content before it even reaches your device. More effective than browser extensions alone.
          </p>
          <div className="space-y-3">
            {DNS_BLOCKERS.map((dns) => (
              <div key={dns.name} className="glass glass-hover p-4">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <p className="text-white font-black text-sm">{dns.name}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${dns.tagColor} text-white font-bold flex-shrink-0`}>
                    {dns.tag}
                  </span>
                </div>
                <p className="text-[#94A3B8]/70 text-xs leading-relaxed">{dns.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Focus Mode */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Timer size={14} className="text-[#94A3B8]" />
            <h2 className="text-[#94A3B8] text-xs font-bold uppercase tracking-widest">Focus Mode</h2>
          </div>
          <div className="glass p-5 space-y-4">
            <div>
              <p className="text-white font-black text-sm mb-1">Launch a distraction-free zone</p>
              <p className="text-[#94A3B8]/60 text-xs">Activates a full-screen overlay that keeps you anchored in the app for a set time. Perfect for high-risk moments.</p>
            </div>
            <div className="flex gap-2">
              {FOCUS_DURATIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => setFocusDuration(d)}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                    focusDuration === d
                      ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white border-transparent'
                      : 'border-white/[0.08] text-[#94A3B8] hover:text-white'
                  }`}
                  style={focusDuration === d ? { boxShadow: '0 0 16px rgba(124,58,237,0.3)' } : {}}
                >
                  {d} min
                </button>
              ))}
            </div>
            <button
              onClick={startFocusMode}
              className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2"
              style={{ boxShadow: '0 0 30px rgba(124,58,237,0.4)' }}
            >
              <Shield size={20} />
              Start {focusDuration}-Minute Focus
            </button>
          </div>
        </section>

        <p className="text-center text-xs text-white/15 leading-relaxed pb-4">
          No blocker is perfect. The strongest blocker is your decision to stay free. Use these as support, not a crutch.
        </p>
      </div>
    </div>
  );
}
