'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUnhookedStore } from '@/store/useUnhookedStore';
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
  { id: 'pornography', label: 'Pornography', emoji: '🔒' },
  { id: 'social-media', label: 'Social Media', emoji: '📱' },
  { id: 'gaming', label: 'Gaming', emoji: '🎮' },
  { id: 'substances', label: 'Substances', emoji: '🍃' },
  { id: 'gambling', label: 'Gambling', emoji: '🎲' },
  { id: 'other', label: 'Other habit', emoji: '🔗' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const store = useUnhookedStore();

  const [step, setStep] = useState(1);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [epilepsyAcknowledged, setEpilepsyAcknowledged] = useState(false);
  const [selectedMotivations, setSelectedMotivations] = useState<string[]>([]);
  const [ybocsAnswers, setYbocsAnswers] = useState<Record<string, number>>({});
  const [recoveryStyle, setRecoveryStyle] = useState<'solo' | 'community'>('solo');
  const [commitmentMinutes, setCommitmentMinutes] = useState(15);
  const [userName, setUserName] = useState('');
  const [sobrietyDate, setSobrietyDate] = useState(new Date().toISOString().split('T')[0]);
  const [habitType, setHabitType] = useState('');
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
    <div className="min-h-screen bg-[#0A0E1A] flex flex-col">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-10 bg-[#060912] border-b border-[#1E2A3A]">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          {step > 1 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div className="flex-1">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Step {step} of {TOTAL_STEPS}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 bg-[#1E2A3A] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#00D4FF] rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 pt-24 pb-10">

        {/* Step 1: Age Confirmation */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#00D4FF]/10 border border-[#00D4FF]/30 flex items-center justify-center">
                <Shield className="text-[#00D4FF]" size={28} />
              </div>
              <h1 className="text-3xl font-black text-white mb-2">Before we begin</h1>
              <p className="text-gray-400">This app contains content and exercises for adults dealing with compulsive behaviors.</p>
            </div>

            <div className="bg-[#111827] border border-[#1E2A3A] rounded-2xl p-6 space-y-4">
              <label className="flex items-start gap-4 cursor-pointer">
                <div
                  className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${ageConfirmed ? 'bg-[#00D4FF] border-[#00D4FF]' : 'border-[#1E2A3A]'}`}
                  onClick={() => setAgeConfirmed(!ageConfirmed)}
                >
                  {ageConfirmed && <CheckCircle size={14} className="text-[#0A0E1A]" />}
                </div>
                <span className="text-white text-sm leading-relaxed">
                  I confirm that I am <strong>18 years of age or older</strong> and I am voluntarily using this app to support my personal recovery journey.
                </span>
              </label>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-2xl p-4">
              <p className="text-yellow-400 text-xs leading-relaxed">
                <strong>Medical Disclaimer:</strong> Unhooked is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for medical conditions. If you are in crisis, call 988 (Suicide & Crisis Lifeline) or 911.
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Epilepsy Warning */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center">
                <AlertTriangle className="text-yellow-400" size={28} />
              </div>
              <h1 className="text-3xl font-black text-white mb-2">Safety Warning</h1>
              <p className="text-gray-400">Photosensitivity & Epilepsy Notice</p>
            </div>

            <div className="bg-yellow-900/20 border border-yellow-600/50 rounded-2xl p-5 space-y-3">
              <p className="text-yellow-300 font-bold text-sm">⚠️ Important: Read before proceeding</p>
              <p className="text-gray-300 text-sm leading-relaxed">
                Unhooked's brainwave entrainment features include <strong>screen pulse effects</strong> and <strong>visual flashing patterns</strong> at various frequencies. These effects are designed to support neural entrainment but may not be suitable for everyone.
              </p>
              <p className="text-gray-300 text-sm leading-relaxed">
                Do NOT use the visual entrainment features if you have:
              </p>
              <ul className="text-gray-400 text-sm space-y-1">
                <li>• Epilepsy or a history of seizures</li>
                <li>• Photosensitive conditions</li>
                <li>• Been advised to avoid flashing lights</li>
                <li>• A family history of photosensitive epilepsy</li>
              </ul>
            </div>

            <div className="bg-[#111827] border border-[#1E2A3A] rounded-2xl p-5 space-y-4">
              <p className="text-white font-semibold text-sm">Enable Epilepsy Safe Mode?</p>
              <p className="text-gray-400 text-xs">Safe Mode disables all screen flashing and fast visual effects. Audio brainwave entrainment (binaural beats) still works fully.</p>

              <div className="flex gap-3">
                <button
                  onClick={() => setEpilepsySafe(true)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${epilepsySafe ? 'bg-yellow-500/20 border-yellow-500 text-yellow-300' : 'border-[#1E2A3A] text-gray-400 hover:border-yellow-800'}`}
                >
                  Yes — Enable Safe Mode
                </button>
                <button
                  onClick={() => setEpilepsySafe(false)}
                  className={`flex-1 py-3 rounded-xl border text-sm font-semibold transition-all ${!epilepsySafe ? 'bg-[#00D4FF]/10 border-[#00D4FF] text-[#00D4FF]' : 'border-[#1E2A3A] text-gray-400 hover:border-gray-600'}`}
                >
                  No — Full Experience
                </button>
              </div>
            </div>

            <label className="flex items-start gap-3 cursor-pointer bg-[#111827] border border-[#1E2A3A] rounded-2xl p-4">
              <div
                className={`mt-0.5 w-6 h-6 rounded-lg border-2 flex items-center justify-center flex-shrink-0 transition-all ${epilepsyAcknowledged ? 'bg-[#00D4FF] border-[#00D4FF]' : 'border-[#1E2A3A]'}`}
                onClick={() => setEpilepsyAcknowledged(!epilepsyAcknowledged)}
              >
                {epilepsyAcknowledged && <CheckCircle size={14} className="text-[#0A0E1A]" />}
              </div>
              <span className="text-white text-sm leading-relaxed">
                I have read the safety warning and understand the risks. I acknowledge my {epilepsySafe ? 'Epilepsy Safe Mode preference' : 'choice to use the full experience'}.
              </span>
            </label>
          </div>
        )}

        {/* Step 3: Motivations */}
        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-white mb-2">Why are you here?</h1>
              <p className="text-gray-400">Select all that resonate with you. These fuel your journey.</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {MOTIVATIONS.map((m) => (
                <button
                  key={m.id}
                  onClick={() => toggleMotivation(m.id)}
                  className={`p-4 rounded-2xl border-2 text-left transition-all active:scale-95 ${
                    selectedMotivations.includes(m.id)
                      ? 'bg-[#00D4FF]/10 border-[#00D4FF]'
                      : 'bg-[#111827] border-[#1E2A3A] hover:border-gray-600'
                  }`}
                >
                  <div className="text-2xl mb-2">{m.emoji}</div>
                  <div className="text-white font-semibold text-sm">{m.label}</div>
                  <div className="text-gray-400 text-xs mt-1">{m.desc}</div>
                  {selectedMotivations.includes(m.id) && (
                    <CheckCircle size={16} className="text-[#00D4FF] mt-2" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: YBOCS Assessment */}
        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-white mb-2">Habit Assessment</h1>
              <p className="text-gray-400 text-sm">Rate each area from 0 (none) to 4 (extreme). This helps us personalize your recovery plan.</p>
            </div>
            <div className="space-y-4">
              {YBOCS_QUESTIONS.map((q) => (
                <div key={q.id} className="bg-[#111827] border border-[#1E2A3A] rounded-2xl p-5">
                  <p className="text-white font-semibold text-sm mb-1">{q.label}</p>
                  <p className="text-gray-500 text-xs mb-4">{q.desc}</p>
                  <div className="flex gap-2">
                    {[0, 1, 2, 3, 4].map((val) => (
                      <button
                        key={val}
                        onClick={() => setYbocs(q.id, val)}
                        className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                          ybocsAnswers[q.id] === val
                            ? 'bg-[#00D4FF] text-[#0A0E1A]'
                            : 'bg-[#060912] text-gray-500 hover:bg-[#1E2A3A]'
                        }`}
                      >
                        {val}
                      </button>
                    ))}
                  </div>
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>None</span>
                    <span>Extreme</span>
                  </div>
                  {ybocsAnswers[q.id] !== undefined && (
                    <p className="text-[#00D4FF] text-xs mt-2">
                      {SCALE_LABELS[ybocsAnswers[q.id]]}
                    </p>
                  )}
                </div>
              ))}
            </div>
            {Object.keys(ybocsAnswers).length === YBOCS_QUESTIONS.length && (
              <div className="bg-[#111827] border border-[#1E2A3A] rounded-2xl p-4 text-center">
                <p className="text-gray-400 text-xs mb-1">Your severity score</p>
                <p className="text-3xl font-black text-[#00D4FF]">{ybocsSeverity}<span className="text-lg text-gray-500">/20</span></p>
                <p className="text-gray-500 text-xs mt-1">
                  {ybocsSeverity <= 7 ? 'Mild — You can do this' : ybocsSeverity <= 14 ? 'Moderate — This app will really help' : 'Severe — You\'ve made the right choice coming here'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Recovery Style */}
        {step === 5 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-white mb-2">Your recovery style</h1>
              <p className="text-gray-400">How do you prefer to heal?</p>
            </div>
            <div className="space-y-3">
              <button
                onClick={() => setRecoveryStyle('solo')}
                className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${recoveryStyle === 'solo' ? 'bg-[#00D4FF]/10 border-[#00D4FF]' : 'bg-[#111827] border-[#1E2A3A] hover:border-gray-600'}`}
              >
                <div className="text-3xl mb-2">⚔️</div>
                <h3 className="text-white font-bold text-lg">Solo Warrior</h3>
                <p className="text-gray-400 text-sm mt-1">Private, focused recovery. Your journey is your own. No community feed, full anonymity.</p>
              </button>
              <button
                onClick={() => setRecoveryStyle('community')}
                className={`w-full p-5 rounded-2xl border-2 text-left transition-all ${recoveryStyle === 'community' ? 'bg-[#00D4FF]/10 border-[#00D4FF]' : 'bg-[#111827] border-[#1E2A3A] hover:border-gray-600'}`}
              >
                <div className="text-3xl mb-2">🤝</div>
                <h3 className="text-white font-bold text-lg">Community Driven</h3>
                <p className="text-gray-400 text-sm mt-1">Accountability partners, group challenges, anonymous wins feed. Stronger together.</p>
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Daily Commitment */}
        {step === 6 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-white mb-2">Daily commitment</h1>
              <p className="text-gray-400">How much time can you dedicate each day to your recovery?</p>
            </div>
            <div className="space-y-3">
              {[
                { min: 5, label: '5 minutes', desc: 'Quick sessions — perfect for busy days', icon: '⚡' },
                { min: 15, label: '15 minutes', desc: 'Recommended — one brainwave session + check-in', icon: '🎯' },
                { min: 30, label: '30 minutes', desc: 'Full protocol — brainwave + HRV + journal', icon: '🧠' },
              ].map((opt) => (
                <button
                  key={opt.min}
                  onClick={() => setCommitmentMinutes(opt.min)}
                  className={`w-full p-5 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${commitmentMinutes === opt.min ? 'bg-[#00D4FF]/10 border-[#00D4FF]' : 'bg-[#111827] border-[#1E2A3A] hover:border-gray-600'}`}
                >
                  <span className="text-2xl">{opt.icon}</span>
                  <div>
                    <h3 className="text-white font-bold">{opt.label}</h3>
                    <p className="text-gray-400 text-sm">{opt.desc}</p>
                  </div>
                  {commitmentMinutes === opt.min && (
                    <CheckCircle size={20} className="text-[#00D4FF] ml-auto" />
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 7: Name + Date + Habit */}
        {step === 7 && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-black text-white mb-2">Almost there</h1>
              <p className="text-gray-400">Tell us about yourself so we can personalize your journey.</p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Your first name</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="What should we call you?"
                  className="w-full px-4 py-3 bg-[#111827] border border-[#1E2A3A] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#00D4FF] transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">What are you working to overcome?</label>
                <div className="grid grid-cols-2 gap-2">
                  {HABIT_TYPES.map((h) => (
                    <button
                      key={h.id}
                      onClick={() => setHabitType(h.id)}
                      className={`p-3 rounded-xl border text-left text-sm transition-all ${habitType === h.id ? 'bg-[#00D4FF]/10 border-[#00D4FF] text-white' : 'bg-[#111827] border-[#1E2A3A] text-gray-400 hover:border-gray-600'}`}
                    >
                      <span className="mr-2">{h.emoji}</span>{h.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Sobriety start date</label>
                <input
                  type="date"
                  value={sobrietyDate}
                  onChange={(e) => setSobrietyDate(e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 bg-[#111827] border border-[#1E2A3A] rounded-xl text-white focus:outline-none focus:border-[#00D4FF] transition-colors"
                />
                <p className="text-gray-500 text-xs mt-1">When did you start this recovery attempt? (can be today)</p>
              </div>
            </div>

            <div className="bg-[#111827] border border-[#1E2A3A] rounded-2xl p-4 text-center">
              <p className="text-gray-400 text-sm">Starting your journey as</p>
              <p className="text-2xl font-black text-[#00D4FF] mt-1">{userName || '...'}</p>
              <p className="text-gray-500 text-xs mt-1">
                {habitType ? `Overcoming ${HABIT_TYPES.find(h => h.id === habitType)?.label}` : ''}
              </p>
            </div>
          </div>
        )}

        {/* CTA Button */}
        <div className="mt-8">
          {step < TOTAL_STEPS ? (
            <button
              onClick={() => setStep((s) => s + 1)}
              disabled={!canProceed()}
              className="w-full flex items-center justify-center gap-2 bg-[#00D4FF] text-[#0A0E1A] font-bold py-4 rounded-xl hover:bg-[#00B8E0] transition-all disabled:opacity-40 disabled:cursor-not-allowed text-lg"
            >
              Continue <ArrowRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleComplete}
              disabled={!canProceed() || saving}
              className="w-full flex items-center justify-center gap-2 bg-[#00D4FF] text-[#0A0E1A] font-bold py-4 rounded-xl hover:bg-[#00B8E0] transition-all disabled:opacity-40 disabled:cursor-not-allowed text-lg"
            >
              {saving ? (
                <span className="animate-spin w-5 h-5 border-2 border-[#0A0E1A] border-t-transparent rounded-full" />
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
