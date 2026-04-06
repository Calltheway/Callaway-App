'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDopamindStore } from '@/store/useDopamindStore';
import { getSupabaseBrowser } from '@/lib/supabase';
import { ArrowLeft, Plus, Brain, ChevronDown, ChevronUp } from 'lucide-react';
import BottomNav from '@/components/BottomNav';
import XPToast from '@/components/XPToast';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface JournalEntry {
  id: string;
  mood: number;
  energy: number;
  urge_intensity: number;
  trigger_location: string;
  trigger_activity: string;
  trigger_emotion: string;
  notes: string;
  created_at: string;
}

const MOOD_EMOJIS = ['😭', '😢', '😟', '😕', '😐', '🙂', '😊', '😄', '😁', '🤩'];
const LOCATIONS = ['Home', 'Work', 'Outside', 'Social', 'Commuting', 'Online', 'Other'];
const EMOTIONS = ['Bored', 'Stressed', 'Lonely', 'Anxious', 'Tired', 'Angry', 'Excited', 'Sad', 'Happy'];
const ACTIVITIES = ['Browsing phone', 'Working', 'Watching TV', 'Nothing', 'Socializing', 'Exercising', 'Eating', 'Relaxing'];

const PROMPTS_BY_STAGE = [
  { maxDays: 7, prompt: "What's the hardest moment you've had today, and how did you handle it?" },
  { maxDays: 14, prompt: "What positive changes are you noticing in yourself so far?" },
  { maxDays: 30, prompt: "Describe a situation where you chose your values over the urge. How did that feel?" },
  { maxDays: 90, prompt: "If you could talk to your past self from 3 months ago, what would you say?" },
  { maxDays: 9999, prompt: "How has your relationship with yourself changed? What does freedom mean to you now?" },
];

export default function JournalPage() {
  const router = useRouter();
  const { streakDays, userId, addXP } = useDopamindStore();

  const [view, setView] = useState<'checkin' | 'entries'>('checkin');
  const [mood, setMood] = useState(5);
  const [energy, setEnergy] = useState(5);
  const [urgeIntensity, setUrgeIntensity] = useState(3);
  const [location, setLocation] = useState('');
  const [activity, setActivity] = useState('');
  const [emotion, setEmotion] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [loadingEntries, setLoadingEntries] = useState(false);
  const [xpToast, setXpToast] = useState<{ amount: number } | null>(null);
  const [aiInsight, setAiInsight] = useState('');
  const [loadingInsight, setLoadingInsight] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const prompt = PROMPTS_BY_STAGE.find((p) => streakDays <= p.maxDays)?.prompt || PROMPTS_BY_STAGE[0].prompt;

  useEffect(() => {
    if (view === 'entries') loadEntries();
  }, [view]);

  async function loadEntries() {
    setLoadingEntries(true);
    try {
      const supabase = getSupabaseBrowser();
      const { data, error } = await supabase
        .from('journal_entries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(30);
      if (!error && data) setEntries(data as JournalEntry[]);
    } catch { /* use local */ }
    setLoadingEntries(false);
  }

  async function handleSave() {
    setSaving(true);
    const entry = {
      user_id: userId,
      mood,
      energy,
      urge_intensity: urgeIntensity,
      trigger_location: location,
      trigger_activity: activity,
      trigger_emotion: emotion,
      notes,
    };

    try {
      const supabase = getSupabaseBrowser();
      const { data } = await supabase.from('journal_entries').insert(entry).select().single();

      // Check daily journal streak
      const lastJournal = localStorage.getItem('lastJournalDate');
      const today = new Date().toDateString();
      if (lastJournal !== today) {
        localStorage.setItem('lastJournalDate', today);
        addXP(15);
        setXpToast({ amount: 15 });
      }
    } catch {
      addXP(15);
      setXpToast({ amount: 15 });
    }

    setSaving(false);
    setSaved(true);
  }

  async function loadAiInsight() {
    setLoadingInsight(true);
    setAiInsight('');
    try {
      const res = await fetch('/api/journal-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entries: entries.slice(0, 7),
          userName: 'User',
          streakDays,
        }),
      });
      const data = await res.json();
      setAiInsight(data.insight || 'Keep journaling to unlock pattern analysis.');
    } catch {
      setAiInsight('Connect to enable AI insights. Your patterns will be analyzed here.');
    }
    setLoadingInsight(false);
  }

  const chartData = entries.slice(0, 14).reverse().map((e, i) => ({
    day: `D${i + 1}`,
    mood: e.mood,
    urge: e.urge_intensity,
  }));

  if (saved) {
    return (
      <div className="min-h-screen bg-[#0A0E1A] flex flex-col items-center justify-center p-6 text-center pb-24">
        {xpToast && <XPToast amount={xpToast.amount} label="Journal entry" onDone={() => setXpToast(null)} />}
        <div className="text-5xl mb-4">✍️</div>
        <h1 className="text-2xl font-black text-white mb-2">Entry Saved</h1>
        <p className="text-gray-400 text-sm mb-6">Your awareness is your superpower.</p>
        <div className="space-y-3 w-full max-w-xs">
          <button
            onClick={() => { setSaved(false); setView('entries'); }}
            className="w-full bg-[#00D4FF] text-[#0A0E1A] font-bold py-3 rounded-2xl hover:bg-[#00B8E0] transition-all"
          >
            View Past Entries
          </button>
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full border border-[#1E2A3A] text-gray-300 py-3 rounded-2xl text-sm hover:border-gray-500 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0E1A] pb-24">
      {xpToast && <XPToast amount={xpToast.amount} label="Journal entry" onDone={() => setXpToast(null)} />}

      <div className="bg-[#060912] border-b border-[#1E2A3A] px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-lg font-black text-white">Journal</h1>
        <div className="ml-auto flex gap-2">
          <button
            onClick={() => setView('checkin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === 'checkin' ? 'bg-[#00D4FF] text-[#0A0E1A]' : 'text-gray-400 hover:text-white'}`}
          >
            Check-in
          </button>
          <button
            onClick={() => setView('entries')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${view === 'entries' ? 'bg-[#00D4FF] text-[#0A0E1A]' : 'text-gray-400 hover:text-white'}`}
          >
            History
          </button>
        </div>
      </div>

      {view === 'checkin' && (
        <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
          {/* Mood */}
          <div className="bg-[#111827] border border-[#1E2A3A] rounded-2xl p-5">
            <label className="block text-sm font-semibold text-white mb-3">
              How are you feeling? <span className="text-3xl">{MOOD_EMOJIS[mood - 1]}</span>
            </label>
            <input type="range" min={1} max={10} value={mood} onChange={(e) => setMood(Number(e.target.value))} className="w-full accent-[#00D4FF]" />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>Very low</span>
              <span className="text-[#00D4FF] font-bold">{mood}/10</span>
              <span>Very high</span>
            </div>
          </div>

          {/* Energy */}
          <div className="bg-[#111827] border border-[#1E2A3A] rounded-2xl p-5">
            <label className="block text-sm font-semibold text-white mb-3">⚡ Energy level</label>
            <input type="range" min={1} max={10} value={energy} onChange={(e) => setEnergy(Number(e.target.value))} className="w-full accent-[#FFD700]" />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>Depleted</span>
              <span className="text-[#FFD700] font-bold">{energy}/10</span>
              <span>Energized</span>
            </div>
          </div>

          {/* Urge intensity */}
          <div className="bg-[#111827] border border-[#1E2A3A] rounded-2xl p-5">
            <label className="block text-sm font-semibold text-white mb-3">🔥 Current urge intensity</label>
            <input type="range" min={0} max={10} value={urgeIntensity} onChange={(e) => setUrgeIntensity(Number(e.target.value))} className="w-full accent-red-500" />
            <div className="flex justify-between text-xs text-gray-600 mt-1">
              <span>No urge</span>
              <span className="text-red-400 font-bold">{urgeIntensity}/10</span>
              <span>Intense</span>
            </div>
            {urgeIntensity >= 7 && (
              <button onClick={() => router.push('/sos')} className="mt-3 w-full py-2 bg-red-600/20 border border-red-600/50 rounded-xl text-red-400 text-xs font-semibold hover:bg-red-600/30 transition-all">
                High urge detected — Go to SOS →
              </button>
            )}
          </div>

          {/* Triggers */}
          <div className="bg-[#111827] border border-[#1E2A3A] rounded-2xl p-5 space-y-4">
            <p className="text-white font-semibold text-sm">Trigger context</p>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">Where are you?</label>
              <div className="flex flex-wrap gap-2">
                {LOCATIONS.map((l) => (
                  <button key={l} onClick={() => setLocation(l)} className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${location === l ? 'bg-[#00D4FF]/10 border-[#00D4FF] text-white' : 'bg-[#060912] border-[#1E2A3A] text-gray-500 hover:border-gray-600'}`}>{l}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">What are you doing?</label>
              <div className="flex flex-wrap gap-2">
                {ACTIVITIES.map((a) => (
                  <button key={a} onClick={() => setActivity(a)} className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${activity === a ? 'bg-[#00D4FF]/10 border-[#00D4FF] text-white' : 'bg-[#060912] border-[#1E2A3A] text-gray-500 hover:border-gray-600'}`}>{a}</button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 mb-2 block">Emotional state</label>
              <div className="flex flex-wrap gap-2">
                {EMOTIONS.map((e) => (
                  <button key={e} onClick={() => setEmotion(e)} className={`px-3 py-1.5 rounded-lg text-xs border transition-all ${emotion === e ? 'bg-[#00D4FF]/10 border-[#00D4FF] text-white' : 'bg-[#060912] border-[#1E2A3A] text-gray-500 hover:border-gray-600'}`}>{e}</button>
                ))}
              </div>
            </div>
          </div>

          {/* Journal text */}
          <div className="bg-[#111827] border border-[#1E2A3A] rounded-2xl p-5">
            <label className="block text-sm font-semibold text-white mb-1">Journal Entry</label>
            <p className="text-gray-500 text-xs mb-3 italic">"{prompt}"</p>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Write freely here..."
              rows={5}
              className="w-full bg-[#060912] border border-[#1E2A3A] rounded-xl p-3 text-white placeholder-gray-700 text-sm focus:outline-none focus:border-[#00D4FF] resize-none"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full py-4 bg-[#00D4FF] text-[#0A0E1A] font-bold rounded-2xl hover:bg-[#00B8E0] transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Entry'}
          </button>
        </div>
      )}

      {view === 'entries' && (
        <div className="max-w-lg mx-auto px-4 py-6 space-y-5">
          {/* Mood chart */}
          {chartData.length > 1 && (
            <div className="bg-[#111827] border border-[#1E2A3A] rounded-2xl p-5">
              <p className="text-white font-bold text-sm mb-3">Mood & Urge Trend</p>
              <ResponsiveContainer width="100%" height={100}>
                <LineChart data={chartData}>
                  <XAxis dataKey="day" tick={{ fill: '#6B7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis hide domain={[0, 10]} />
                  <Tooltip contentStyle={{ background: '#111827', border: '1px solid #1E2A3A', borderRadius: 8, color: '#fff', fontSize: 12 }} />
                  <Line type="monotone" dataKey="mood" stroke="#00D4FF" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="urge" stroke="#EF4444" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
              <div className="flex gap-4 text-xs mt-2">
                <span className="text-[#00D4FF]">— Mood</span>
                <span className="text-red-400">— Urge</span>
              </div>
            </div>
          )}

          {/* AI Insight */}
          <div className="bg-[#111827] border border-[#1E2A3A] rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-white font-bold text-sm flex items-center gap-2">
                <Brain size={16} className="text-[#00D4FF]" /> AI Pattern Analysis
              </p>
              <button
                onClick={loadAiInsight}
                disabled={loadingInsight || entries.length < 2}
                className="text-xs bg-[#00D4FF]/10 border border-[#00D4FF]/30 text-[#00D4FF] px-3 py-1 rounded-lg hover:bg-[#00D4FF]/20 disabled:opacity-50 transition-all"
              >
                {loadingInsight ? 'Analyzing...' : 'Get Insight'}
              </button>
            </div>
            {aiInsight ? (
              <p className="text-gray-300 text-sm leading-relaxed">{aiInsight}</p>
            ) : (
              <p className="text-gray-600 text-sm">{entries.length < 2 ? 'Add more entries to unlock pattern analysis.' : 'Click "Get Insight" to analyze your patterns with AI.'}</p>
            )}
          </div>

          {/* Entries list */}
          {loadingEntries ? (
            <div className="text-center py-8 text-gray-500">Loading entries...</div>
          ) : entries.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-3">No entries yet</p>
              <button onClick={() => setView('checkin')} className="text-[#00D4FF] text-sm">Start your first check-in →</button>
            </div>
          ) : (
            <div className="space-y-3">
              {entries.map((entry) => {
                const isExpanded = expandedId === entry.id;
                const date = new Date(entry.created_at);
                return (
                  <div key={entry.id} className="bg-[#111827] border border-[#1E2A3A] rounded-2xl overflow-hidden">
                    <button
                      className="w-full p-4 flex items-center gap-3 text-left"
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    >
                      <span className="text-2xl">{MOOD_EMOJIS[entry.mood - 1]}</span>
                      <div className="flex-1">
                        <p className="text-white font-semibold text-sm">
                          {date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                        <p className="text-gray-500 text-xs">
                          Mood {entry.mood}/10 · Urge {entry.urge_intensity}/10 · Energy {entry.energy}/10
                        </p>
                      </div>
                      {isExpanded ? <ChevronUp size={16} className="text-gray-600" /> : <ChevronDown size={16} className="text-gray-600" />}
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 space-y-2 border-t border-[#1E2A3A] pt-3">
                        {entry.trigger_location && <p className="text-gray-400 text-xs">📍 {entry.trigger_location} · {entry.trigger_activity} · {entry.trigger_emotion}</p>}
                        {entry.notes && <p className="text-gray-300 text-sm leading-relaxed">{entry.notes}</p>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      <BottomNav />
    </div>
  );
}
