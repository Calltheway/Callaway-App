'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDopamindStore } from '@/store/useDopamindStore';
import { getSupabaseBrowser } from '@/lib/supabase';
import { CheckCircle, ArrowRight, ArrowLeft, AlertTriangle, Brain, Zap, Heart, Eye, Shield } from 'lucide-react';

const TOTAL_STEPS = 7;

const MOTIVATIONS = [
  { id: 'energy',       emoji: '⚡', label: 'More Energy',       desc: 'Reclaim your vitality' },
  { id: 'relationships', emoji: '❤️', label: 'Better Relationships', desc: 'Connect deeper with others' },
  { id: 'focus',        emoji: '🎯', label: 'Mental Clarity',    desc: 'Sharpen your focus' },
  { id: 'self-respect', emoji: '🦁', label: 'Self-Respect',      desc: 'Become who you want to be' },
  { id: 'confidence',   emoji: '💪', label: 'Confidence',         desc: 'Own every room you walk into' },
  { id: 'purpose',      emoji: '🌟', label: 'Life Purpose',       desc: 'Build something that matters' },
];

const YBOCS_QUESTIONS = [
  { id: 'time', label: 'Time occupied by urges', desc: 'How much of your day do urges consume?' },
  { id: 'interference', label: 'Interference with daily life', desc: 'How much does it disrupt work/school/social?' },
  { id: 'distress', label: 'Distress from urges', desc: 'How much anxiety/distress do urges cause?' },
  { id: 'resistance', label: 'Resistance to urges', desc: 'How hard do you try to resist?' },
  { id: 'control', label: 'Control over behavior', desc: 'How much control do you have over the behavior?' },
];

const SCALE_LABELS: Record<number, string> = { 0: 'None', 1: 'Mild', 2: 'Moderate', 3: 'Severe', 4: 'Extreme' };

const HABIT_TYPES = [
  { id: 'pornography', label: 'Pornography', emoji: '🔒', desc: 'The most common and most misunderstood addiction of our time' },
  { id: 'social-media', label: 'Social Media', emoji: '📱', desc: 'Endless scrolling wired to the same dopamine loop' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮', desc: 'Achievement loops designed by billion-dollar studios' },
  { id: 'substances', label: 'Substances', emoji: '🍃', desc: 'Chemical dependency affecting brain chemistry' },
  { id: 'gambling', label: 'Gambling', emoji: '🎲', desc: 'Variable reward — the most addictive pattern known' },
  { id: 'other', label: 'Other habit', emoji: '🔗', desc: 'Any compulsive behavior you want to overcome' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const store = useDopamindStore();

  const [step, setStep] = useState(1);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [epilepsyAcknowledged, setEpilepsyAcknowledged] = useState(false);
  const [selectedMotivations, setSelectedMotivations] = useState<string[]>([]);
  const [ybocsAnswers, setYbocsAnswers] = useState<Record<string, number>>({});
  const [recoveryStyle, setRecoveryStyle] = useState<'solo' | 'community'>('solo');
  const [commitmentMinutes, setCommitmentMinutes] = useState(15);
  const [userName, setUserName] = useState('');
  const [sobrietyDate, setSobrietyDate] = useState(new Date().toISOString().split('T')[0]);
  const [habitType, setHabitType] = useState('pornography');
  const [saving, setSaving] = useState(false);
  const [epilepsySafe, setEpilepsySafe] = useState(false);

  const progress = (step / TOTAL_STEPS) * 100;

  function toggleMotivation(id: string) {
    setSelectedMotivations((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  }

  function setYbocs(questionId: string, value: number) {
    setYbocsAnswers((prev) => ({ ...prev, [questionId]: value }));
  }

  const ybocsSeverity = Object.values(ybocsAnswers).reduce((a, b) => a + b, 0);

  async function handleComplete() {
    setSaving(true);
    const profileData = {
      userName,
      sobrietyStartDate: new Date(sobrietyDate).toISOString(),
      habitType,
      motivations: selectedMotivations,
      recoveryStyle,
      dailyCommitmentMinutes: commitmentMinutes,
      ybocsSeverity,
      onboardingComplete: true,
      epilepsySafeMode: epilepsySafe,
      hasSeenEpilepsyWarning: true,
    };

    store.setUserProfile(profileData);
    store.completeOnboarding();
    if (epilepsySafe) store.setEpilepsySafeMode(true);
    store.markEpilepsyWarningShown();

    try {
      const supabase = getSupabaseBrowser();
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('profiles').upsert({
          id: user.id,
          name: userName,
          sobriety_start_date: new Date(sobrietyDate).toISOString(),
          habit_type: habitType,
          motivations: selectedMotivations,
          recovery_style: recoveryStyle,
          daily_commitment_minutes: commitmentMinutes,
          ybocs_severity: ybocsSeverity,
          onboarding_complete: true,
          epilepsy_safe_mode: epilepsySafe,
        });
        store.setUserProfile({ userId: user.id });
      }
    } catch { /* save to localStorage only */ }

    setSaving(false);
    router.push('/dashboard');
  }

  function canProceed() {
    switch (step) {
      case 1: return ageConfirmed;
      case 2: return epilepsyAcknowledged;
      case 3: return selectedMotivations.length > 0;
      case 4: return Object.keys(ybocsAnswers).length === YBOCS_QUESTIONS.length;
      case 5: return true;
      case 6: return true;
      case 7: return userName.trim().length > 0 && habitType.length > 0;
      default: return false;
    }
  }

  return (
    <div className="min-h-screen bg-[#050810] flex flex-col relative overflow-hidden">
      {/* Background atmosphere */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-violet-600/6 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-cyan-500/4 rounded-full blur-3xl" />
      </div>

      {/* Premium step indicator */}
      <div className="fixed top-0 left-0 right-0 z-20 backdrop-blur-xl bg-[#050810]/80 border-b border-white/[0.06]">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            {step > 1 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="w-9 h-9 rounded-xl bg-white/[0.05] border border-white/[0.08] flex items-center justify-center text-[#94A3B8] hover:text-white transition-all flex-shrink-0"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#94A3B8] text-xs font-semibold">Step {step} of {TOTAL_STEPS}</span>
                <span className="gradient-text text-xs font-bold">{Math.round(progress)}%</span>
              </div>
              {/* Step dots */}
              <div className="flex gap-1">
                {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 rounded-full transition-all duration-500 ${
                      i < step ? 'bg-gradient-to-r from-violet-500 to-cyan-500' : 'bg-white/[0.08]'
                    }`}
                    style={{ flex: i < step ? 2 : 1 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 pt-28 pb-10 relative z-10">

        {/* Step 1: Age Confirmation */}
        {step === 1 && (
          <div className="space-y-6 animate-slide-up">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-600/20 to-cyan-500/10 border border-violet-500/30 flex items-center justify-center"
                style={{ boxShadow: '0 0 30px rgba(124,58,237,0.2)' }}>
                <Shield className="text-violet-400" size={28} />
              </div>
              <h1 className="text-4xl font-black text-white mb-3 leading-tight">Before we begin</h1>
              <p className="text-[#94A3B8]">This is a safe space for adults seeking freedom from compulsive behaviors. No judgment, only science.</p>
            </div>

            <div className="glass p-6">
              <label className="flex items-start gap-4 cursor-pointer" onClick={() => setAgeConfirmed(!ageConfirmed)}>
                <div className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${ageConfirmed ? 'bg-gradient-to-br from-violet-600 to-cyan-500 border-transparent' : 'border-white/[0.15]'}`}>
                  {ageConfirmed && <CheckCircle size={14} className="text-white" />}
                </div>
                <span className="text-white text-sm leading-relaxed">
                  I confirm that I am <strong className="text-white">18 years of age or older</strong> and I am voluntarily using this app to support my personal recovery journey.
                </span>
              </label>
            </div>

            <div className="glass border-amber-500/20 p-4">
              <p className="text-amber-400/80 text-xs leading-relaxed">
                <strong className="text-amber-400">Medical Disclaimer:</strong> Dopamind is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider. If you are in crisis, call 988 (Suicide &amp; Crisis Lifeline) or 911.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Epilepsy Warning */}
        {step === 2 && (
          <div className="space-y-6 animate-slide-up">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                <AlertTriangle className="text-amber-400" size={28} />
              </div>
              <h1 className="text-4xl font-black text-white mb-3">Safety First</h1>
              <p className="text-[#94A3B8]">Photosensitivity &amp; Epilepsy Notice</p>
            </div>

            <div className="glass border-amber-500/20 p-5 space-y-3">
              <p className="text-amber-300 font-bold text-sm">Important: Read before proceeding</p>
              <p className="text-[#94A3B8] text-sm leading-relaxed">
                Dopamind's brainwave entrainment features include <strong className="text-white">screen pulse effects</strong> and <strong className="text-white">visual patterns</strong> at various frequencies designed to support neural entrainment.
              </p>
              <p className="text-[#94A3B8] text-sm">Do NOT use visual entrainment if you have:</p>
              <ul className="text-[#94A3B8]/70 text-sm space-y-1">
                <li>• Epilepsy or a history of seizures</li>
                <li>• Photosensitive conditions</li>
                <li>• Been advised to avoid flashing lights</li>
                <li>• A family history of photosensitive epilepsy</li>
              </ul>
            </div>

            <div className="glass p-5 space-y-4">
              <p className="text-white font-bold text-sm">Enable Epilepsy Safe Mode?</p>
              <p className="text-[#94A3B8] text-xs">Safe Mode disables all screen flashing. Audio brainwave entrainment (binaural beats) still works fully.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setEpilepsySafe(true)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${epilepsySafe ? 'bg-amber-500/20 border-amber-500 text-amber-300' : 'border-white/[0.08] text-[#94A3B8] hover:border-amber-800/50'}`}
                >
                  Yes — Safe Mode
                </button>
                <button
                  onClick={() => setEpilepsySafe(false)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${!epilepsySafe ? 'bg-cyan-500/10 border-cyan-500/60 text-cyan-400' : 'border-white/[0.08] text-[#94A3B8] hover:border-white/[0.15]'}`}
                >
                  No — Full Experience
                </button>
              </div>
            </div>

            <div className="glass p-4 cursor-pointer" onClick={() => setEpilepsyAcknowledged(!epilepsyAcknowledged)}>
              <label className="flex items-start gap-3 cursor-pointer">
                <div className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${epilepsyAcknowledged ? 'bg-gradient-to-br from-violet-600 to-cyan-500 border-transparent' : 'border-white/[0.15]'}`}>
                  {epilepsyAcknowledged && <CheckCircle size={14} className="text-white" />}
                </div>
                <span className="text-white text-sm leading-relaxed">
                  I have read the safety warning and acknowledge my {epilepsySafe ? 'Epilepsy Safe Mode preference' : 'choice to use the full experience'}.
                </span>
              </label>
            </div>
          </div>
        )}

        {/* Step 3: Motivations */}
        {step === 3 && (
          <div className="space-y-6 animate-slide-up">
            <div>
              <h1 className="text-4xl font-black text-white mb-3 leading-tight">
                Why are you
                <br /><span className="gradient-text">here?</span>
              </h1>
              <p className="text-[#94A3B8]">Select all that resonate. These become your armor on hard days.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {MOTIVATIONS.map((m) => {
                const selected = selectedMotivations.includes(m.id);
                return (
                  <button
                    key={m.id}
                    onClick={() => toggleMotivation(m.id)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all active:scale-95 ${
                      selected
                        ? 'bg-violet-600/10 border-violet-500/60'
                        : 'glass glass-hover border-transparent'
                    }`}
                  >
                    <div className="text-2xl mb-2">{m.emoji}</div>
                    <div className="text-white font-bold text-sm">{m.label}</div>
                    <div className="text-[#94A3B8] text-xs mt-1">{m.desc}</div>
                    {selected && (
                      <div className="mt-2 w-5 h-5 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center">
                        <CheckCircle size={12} className="text-white" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 4: YBOCS Assessment */}
        {step === 4 && (
          <div className="space-y-6 animate-slide-up">
            <div>
              <h1 className="text-4xl font-black text-white mb-3 leading-tight">
                <span className="gradient-text">Understand</span>
                <br />your patterns
              </h1>
              <p className="text-[#94A3B8] text-sm">Rate each area 0-4. This personalizes your recovery plan with clinical precision.</p>
            </div>
            <div className="space-y-3">
              {YBOCS_QUESTIONS.map((q) => (
                <div key={q.id} className="glass p-5">
                  <p className="text-white font-bold text-sm mb-1">{q.label}</p>
                  <p className="text-[#94A3B8]/70 text-xs mb-4">{q.desc}</p>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3, 4].map((val) => (
                      <button
                        key={val}
                        onClick={() => setYbocs(q.id, val)}
                        className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all ${
                          ybocsAnswers[q.id] === val
                            ? 'bg-gradient-to-r from-violet-600 to-cyan-500 text-white'
                            : 'bg-white/[0.04] text-[#94A3B8] hover:bg-white/[0.08]'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-white/20 mt-1.5">
                    <span>None</span>
                    <span>Extreme</span>
                  </div>
                  {ybocsAnswers[q.id] !== undefined && (
                    <p className="gradient-text text-xs mt-2 font-semibold">
                      {SCALE_LABELS[ybocsAnswers[q.id]]}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {Object.keys(ybocsAnswers).length === YBOCS_QUESTIONS.length && (
              <div className="card-gradient-border p-5 text-center">
                <p className="text-[#94A3B8] text-xs mb-2">Your severity score</p>
                <p className="text-4xl font-black gradient-text">{ybocsSeverity}<span className="text-xl text-white/20">/20</span></p>
                <p className="text-[#94A3B8] text-sm mt-2">
                  {ybocsSeverity <= 7 ? 'Mild — You can absolutely do this' : ybocsSeverity <= 14 ? 'Moderate — This app will make a real difference' : 'Severe — You\'ve made the most important choice coming here'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Recovery Style */}
        {step === 5 && (
          <div className="space-y-6 animate-slide-up">
            <div>
              <h1 className="text-4xl font-black text-white mb-3 leading-tight">
                Your recovery
                <br /><span className="gradient-text">style</span>
              </h1>
              <p className="text-[#94A3B8]">How do you prefer to heal? There is no wrong answer.</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setRecoveryStyle('solo')}
                className={`w-full p-5 rounded-2xl border-2 text-left transition-all active:scale-95 ${recoveryStyle === 'solo' ? 'bg-violet-600/10 border-violet-500/60' : 'glass glass-hover border-transparent'}`}
              >
                <div className="text-3xl mb-3">⚔️</div>
                <h3 className="text-white font-black text-lg">Solo Warrior</h3>
                <p className="text-[#94A3B8] text-sm mt-1">Private, focused recovery. Your journey is your own. Full anonymity, no community feed.</p>
                {recoveryStyle === 'solo' && <div className="mt-3 inline-block px-3 py-1 rounded-full bg-violet-600/20 border border-violet-500/40 text-violet-400 text-xs font-bold">Selected</div>}
              </button>
              <button
                onClick={() => setRecoveryStyle('community')}
                className={`w-full p-5 rounded-2xl border-2 text-left transition-all active:scale-95 ${recoveryStyle === 'community' ? 'bg-violet-600/10 border-violet-500/60' : 'glass glass-hover border-transparent'}`}
              >
                <div className="text-3xl mb-3">🤝</div>
                <h3 className="text-white font-black text-lg">Community Driven</h3>
                <p className="text-[#94A3B8] text-sm mt-1">Accountability partners, group challenges, anonymous wins feed. Stronger together.</p>
                {recoveryStyle === 'community' && <div className="mt-3 inline-block px-3 py-1 rounded-full bg-violet-600/20 border border-violet-500/40 text-violet-400 text-xs font-bold">Selected</div>}
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Daily Commitment */}
        {step === 6 && (
          <div className="space-y-6 animate-slide-up">
            <div>
              <h1 className="text-4xl font-black text-white mb-3 leading-tight">
                Daily
                <br /><span className="gradient-text">commitment</span>
              </h1>
              <p className="text-[#94A3B8]">Consistency beats intensity. How much time can you dedicate daily?</p>
            </div>
            <div className="space-y-3">
              {[
                { min: 5,  label: '5 minutes',  desc: 'Quick sessions — perfect for busy days', icon: '⚡' },
                { min: 15, label: '15 minutes', desc: 'Recommended — one brainwave session + check-in', icon: '🎯' },
                { min: 30, label: '30 minutes', desc: 'Full protocol — brainwave + HRV + journal', icon: '🧠' },
              ].map((opt) => (
                <button
                  key={opt.min}
                  onClick={() => setCommitmentMinutes(opt.min)}
                  className={`w-full p-5 rounded-2xl border-2 text-left transition-all active:scale-95 flex items-center gap-4 ${commitmentMinutes === opt.min ? 'bg-violet-600/10 border-violet-500/60' : 'glass glass-hover border-transparent'}`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <div className="flex-1">
                    <h3 className="text-white font-black">{opt.label}</h3>
                    <p className="text-[#94A3B8] text-sm">{opt.desc}</p>
                  </div>
                  {commitmentMinutes === opt.min && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center flex-shrink-0">
                      <CheckCircle size={14} className="text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 7: Name + Date + Habit */}
        {step === 7 && (
          <div className="space-y-6 animate-slide-up">
            <div>
              <h1 className="text-4xl font-black text-white mb-3 leading-tight">
                Almost
                <br /><span className="gradient-text">there</span>
              </h1>
              <p className="text-[#94A3B8]">Personalize your journey. This stays on your device.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#94A3B8] mb-2 uppercase tracking-wider">Your first name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="What should we call you?"
                  className="w-full px-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white placeholder-white/20 focus:outline-none focus:border-violet-500/60 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-[#94A3B8] mb-2 uppercase tracking-wider">What are you overcoming?</label>
                <div className="space-y-2">
                  {HABIT_TYPES.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => setHabitType(h.id)}
                      className={`w-full p-4 rounded-xl border text-left transition-all flex items-start gap-3 ${habitType === h.id ? 'bg-violet-600/10 border-violet-500/60' : 'glass glass-hover border-transparent'}`}
                    >
                      <span className="text-xl flex-shrink-0">{h.emoji}</span>
                      <div className="flex-1">
                        <p className={`font-bold text-sm ${habitType === h.id ? 'text-white' : 'text-[#94A3B8]'}`}>{h.label}</p>
                        <p className="text-[#94A3B8]/60 text-xs mt-0.5">{h.desc}</p>
                      </div>
                      {habitType === h.id && (
                        <div className="w-5 h-5 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle size={11} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-[#94A3B8] mb-2 uppercase tracking-wider">Sobriety start date</label>
                <input
                  type="date"
                  value={sobrietyDate}
                  onChange={(e) => setSobrietyDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3.5 bg-white/[0.04] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:border-violet-500/60 transition-colors"
                />
                <p className="text-[#94A3B8]/50 text-xs mt-1.5">When did you start this recovery attempt? Can be today.</p>
              </div>
            </div>

            {userName && habitType && (
              <div className="card-gradient-border p-5 text-center animate-scale-in">
                <p className="text-[#94A3B8] text-sm">Starting the journey as</p>
                <p className="text-3xl font-black gradient-text mt-1">{userName}</p>
                <p className="text-[#94A3B8]/60 text-xs mt-1">
                  Overcoming {HABIT_TYPES.find(h => h.id === habitType)?.label} — one day at a time
                </p>
              </div>
            )}
          </div>
        )}

        {/* CTA Button */}
        <div className="mt-8">
          {step < TOTAL_STEPS ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="w-full flex items-center justify-center gap-2 btn-primary py-4 text-lg disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ boxShadow: canProceed() ? '0 0 30px rgba(124,58,237,0.4)' : 'none' }}
            >
              Continue <ArrowRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!canProceed() || saving}
              className="w-full flex items-center justify-center gap-2 btn-primary py-4 text-lg disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ boxShadow: canProceed() ? '0 0 40px rgba(124,58,237,0.5)' : 'none' }}
            >
              {saving ? (
                <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
              ) : (
                <>Start My Journey <ArrowRight size={20} /></>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
