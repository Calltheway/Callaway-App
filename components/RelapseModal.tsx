'use client';

import { useState } from 'react';
import { X, Heart } from 'lucide-react';
import { useDopamindStore } from '@/store/useDopamindStore';
import { getSupabaseBrowser } from '@/lib/supabase';

interface RelapseModalProps {
  onClose: () => void;
}

const TRIGGERS = [
  'Stress / Anxiety', 'Boredom', 'Loneliness', 'Fatigue',
  'After a hard day', 'Social pressure', 'Triggered by content', 'Other',
];

export default function RelapseModal({ onClose }: RelapseModalProps) {
  const { logRelapse, userId } = useDopamindStore();
  const [trigger, setTrigger] = useState('');
  const [mood, setMood] = useState(5);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit() {
    if (!trigger) return;
    setSaving(true);

    logRelapse({ trigger, mood, note });

    try {
      const supabase = getSupabaseBrowser();
      if (userId) {
        await supabase.from('relapses').insert({
          user_id: userId,
          trigger,
          mood,
          note,
        });
      }
    } catch { /* ignore */ }

    setSaving(false);
    setDone(true);
  }

  if (done) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <div className="bg-[#111827] border border-[#1E2A3A] rounded-2xl p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">💙</div>
          <h2 className="text-2xl font-black text-white mb-3">You're still a warrior</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-6">
            Every attempt builds strength. Logging this is an act of courage. Your journey continues now — the clock resets and you come back stronger.
          </p>
          <p className="text-[#00D4FF] font-bold text-sm mb-6">
            "Fall down seven times, stand up eight."
          </p>
          <button
            onClick={onClose}
            className="w-full bg-[#00D4FF] text-[#0A0E1A] font-bold py-3 rounded-xl hover:bg-[#00B8E0] transition-all"
          >
            Continue My Journey
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#111827] border border-[#1E2A3A] rounded-2xl p-6 max-w-sm w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Heart size={20} className="text-[#00D4FF]" />
            <h2 className="text-lg font-bold text-white">Log Relapse</h2>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <p className="text-gray-400 text-sm mb-5 leading-relaxed">
          Logging is brave. Be honest — this data helps you understand your patterns.
        </p>

        {/* Trigger */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">What triggered it?</label>
          <div className="grid grid-cols-2 gap-2">
            {TRIGGERS.map((t) => (
              <button
                key={t}
                onClick={() => setTrigger(t)}
                className={`text-xs py-2 px-3 rounded-lg border transition-all text-left ${
                  trigger === t
                    ? 'bg-[#00D4FF]/10 border-[#00D4FF] text-white'
                    : 'bg-[#060912] border-[#1E2A3A] text-gray-400 hover:border-gray-600'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Mood */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Mood level: <span className="text-[#00D4FF]">{mood}/10</span>
          </label>
          <input
            type="range"
            min={1}
            max={10}
            value={mood}
            onChange={(e) => setMood(Number(e.target.value))}
            className="w-full accent-[#00D4FF]"
          />
          <div className="flex justify-between text-xs text-gray-600 mt-1">
            <span>Very low</span>
            <span>Very high</span>
          </div>
        </div>

        {/* Note */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-300 mb-2">Note (optional)</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="What would you do differently next time?"
            rows={3}
            className="w-full px-4 py-3 bg-[#060912] border border-[#1E2A3A] rounded-xl text-white placeholder-gray-600 focus:outline-none focus:border-[#00D4FF] text-sm resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!trigger || saving}
          className="w-full bg-[#00D4FF] text-[#0A0E1A] font-bold py-3 rounded-xl hover:bg-[#00B8E0] transition-all disabled:opacity-40"
        >
          {saving ? 'Logging...' : 'Log & Reset Streak'}
        </button>
      </div>
    </div>
  );
}
