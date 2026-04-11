'use client';

import { useState } from 'react';
import { Target, Shield, Bell, BellOff, Check, ChevronRight } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────

type RelStatus   = 'single' | 'relationship' | 'married' | 'complicated';
type JobType     = 'remote' | 'hybrid' | 'in-office' | 'self-employed' | 'looking';
type LifeStage   = 'student' | 'early-career' | 'mid-career' | 'senior' | 'retired';

interface Notifications {
  dailyDigest:    boolean;
  realTimeAlerts: boolean;
  weeklyReport:   boolean;
  patternAlerts:  boolean;
}

interface LifeContextForm {
  goals:       string;
  fears:       string;
  relStatus:   RelStatus | '';
  jobType:     JobType   | '';
  lifeStage:   LifeStage | '';
  lifeEvents:  string[];
}

const LIFE_EVENTS = [
  'New job', 'Relationship change', 'Health challenge', 'Moving',
  'Financial shift', 'Loss / grief', 'Having children', 'Starting a business',
];

const REL_OPTIONS: { value: RelStatus; label: string }[] = [
  { value: 'single',        label: 'Single' },
  { value: 'relationship',  label: 'In a relationship' },
  { value: 'married',       label: 'Married' },
  { value: 'complicated',   label: 'Complicated' },
];

const JOB_OPTIONS: { value: JobType; label: string }[] = [
  { value: 'remote',         label: 'Remote' },
  { value: 'hybrid',         label: 'Hybrid' },
  { value: 'in-office',      label: 'In-office' },
  { value: 'self-employed',  label: 'Self-employed' },
  { value: 'looking',        label: 'Looking' },
];

const STAGE_OPTIONS: { value: LifeStage; label: string }[] = [
  { value: 'student',       label: 'Student' },
  { value: 'early-career',  label: 'Early career' },
  { value: 'mid-career',    label: 'Mid-career' },
  { value: 'senior',        label: 'Senior' },
  { value: 'retired',       label: 'Retired' },
];

const PAST_REPORTS = [
  { date: 'Apr 7, 2026',  score: 71, summary: 'High productivity week, social reserves strained.' },
  { date: 'Mar 31, 2026', score: 68, summary: 'Sleep improving, financial momentum building.' },
  { date: 'Mar 24, 2026', score: 65, summary: 'Work-life balance challenge detected.' },
];

// ── Toggle Switch ─────────────────────────────────────────────────

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent
        transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-oracle-teal focus:ring-offset-2 focus:ring-offset-oracle-base
        ${enabled ? 'bg-oracle-teal' : 'bg-oracle-border'}`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200
          ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );
}

// ── Select ────────────────────────────────────────────────────────

function Select<T extends string>({
  value, onChange, options, placeholder,
}: {
  value:       T | '';
  onChange:    (v: T) => void;
  options:     { value: T; label: string }[];
  placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
      className="bg-oracle-navy border border-oracle-border text-oracle-bright rounded-xl px-4 py-3 w-full
        focus:border-oracle-teal outline-none text-sm transition-colors"
    >
      <option value="" disabled>{placeholder}</option>
      {options.map(({ value: v, label }) => (
        <option key={v} value={v}>{label}</option>
      ))}
    </select>
  );
}

// ── Main Page ─────────────────────────────────────────────────────

export default function ProfilePage() {
  const [form, setForm] = useState<LifeContextForm>({
    goals:      '',
    fears:      '',
    relStatus:  '',
    jobType:    '',
    lifeStage:  '',
    lifeEvents: [],
  });

  const [notifications, setNotifications] = useState<Notifications>({
    dailyDigest:    true,
    realTimeAlerts: false,
    weeklyReport:   true,
    patternAlerts:  true,
  });

  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);

  function toggleEvent(event: string) {
    setForm((f) => ({
      ...f,
      lifeEvents: f.lifeEvents.includes(event)
        ? f.lifeEvents.filter((e) => e !== event)
        : [...f.lifeEvents, event],
    }));
  }

  function setNotif(key: keyof Notifications, value: boolean) {
    setNotifications((n) => ({ ...n, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    try {
      await fetch('/api/oracle/profile', {
        method:  'PUT',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({
          goals:       form.goals,
          fears:       form.fears,
          lifeContext: {
            relStatus:   form.relStatus,
            jobType:     form.jobType,
            lifeStage:   form.lifeStage,
            lifeEvents:  form.lifeEvents,
          },
          notificationPreferences: notifications,
        }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  }

  const inputClass = `bg-oracle-navy border border-oracle-border text-oracle-bright rounded-xl px-4 py-3
    w-full focus:border-oracle-teal outline-none text-sm transition-colors resize-none placeholder:text-oracle-muted`;

  return (
    <div className="space-y-10">
      {/* Header */}
      <header>
        <p className="oracle-label mb-2">Your Profile</p>
        <h1 className="font-display text-3xl font-bold text-oracle-bright">Life Context</h1>
        <p className="text-oracle-muted mt-1 max-w-xl">
          Help Oracle understand you more deeply. The richer your context, the sharper the insights.
        </p>
      </header>

      <div className="grid grid-cols-3 gap-8">
        {/* ── Left: Goals & Context (2/3) ──────────────────────────── */}
        <div className="col-span-2 space-y-8">

          {/* Goals */}
          <div className="oracle-card p-6 space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <Target size={16} className="text-oracle-teal" />
              <h2 className="text-oracle-bright font-semibold">Your Goals</h2>
            </div>
            <div>
              <label className="oracle-label block mb-2">
                What are you trying to achieve in the next 12 months?
              </label>
              <textarea
                rows={4}
                value={form.goals}
                onChange={(e) => setForm((f) => ({ ...f, goals: e.target.value }))}
                placeholder="e.g., Get promoted, run a marathon, save $20k, improve my relationships, write a book..."
                className={inputClass}
              />
            </div>
            <div>
              <label className="oracle-label block mb-2">
                What are your biggest fears or concerns right now?
              </label>
              <textarea
                rows={3}
                value={form.fears}
                onChange={(e) => setForm((f) => ({ ...f, fears: e.target.value }))}
                placeholder="e.g., Burning out, not having enough money saved, losing important relationships..."
                className={inputClass}
              />
            </div>
          </div>

          {/* Life Context */}
          <div className="oracle-card p-6 space-y-5">
            <div className="flex items-center gap-2 mb-2">
              <Shield size={16} className="text-oracle-teal" />
              <h2 className="text-oracle-bright font-semibold">Life Context</h2>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="oracle-label block mb-2">Relationship Status</label>
                <Select
                  value={form.relStatus}
                  onChange={(v) => setForm((f) => ({ ...f, relStatus: v }))}
                  options={REL_OPTIONS}
                  placeholder="Select..."
                />
              </div>
              <div>
                <label className="oracle-label block mb-2">Job Type</label>
                <Select
                  value={form.jobType}
                  onChange={(v) => setForm((f) => ({ ...f, jobType: v }))}
                  options={JOB_OPTIONS}
                  placeholder="Select..."
                />
              </div>
              <div>
                <label className="oracle-label block mb-2">Life Stage</label>
                <Select
                  value={form.lifeStage}
                  onChange={(v) => setForm((f) => ({ ...f, lifeStage: v }))}
                  options={STAGE_OPTIONS}
                  placeholder="Select..."
                />
              </div>
            </div>

            <div>
              <label className="oracle-label block mb-3">Major Life Events (select all that apply)</label>
              <div className="flex flex-wrap gap-2">
                {LIFE_EVENTS.map((event) => {
                  const active = form.lifeEvents.includes(event);
                  return (
                    <button
                      key={event}
                      onClick={() => toggleEvent(event)}
                      className={`text-sm px-4 py-2 rounded-full border transition-all duration-150 ${
                        active
                          ? 'bg-oracle-teal/10 border-oracle-teal/40 text-oracle-teal'
                          : 'bg-oracle-card border-oracle-border text-oracle-muted hover:border-oracle-teal/30'
                      }`}
                    >
                      {active && <Check size={11} className="inline mr-1" />}
                      {event}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Save button */}
          <div className="flex items-center gap-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="oracle-btn-primary flex items-center gap-2"
            >
              {saving ? (
                <>
                  <span className="w-4 h-4 border-2 border-oracle-base/30 border-t-oracle-base rounded-full animate-spin" />
                  Saving…
                </>
              ) : saved ? (
                <>
                  <Check size={15} />
                  Saved!
                </>
              ) : (
                'Update Oracle\'s Context'
              )}
            </button>
            {saved && (
              <span className="text-sm text-oracle-teal">
                Oracle will use this in your next analysis
              </span>
            )}
          </div>
        </div>

        {/* ── Right: Notifications + Report History (1/3) ───────────── */}
        <div className="col-span-1 space-y-6">

          {/* Notifications */}
          <div className="oracle-card p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Bell size={14} className="text-oracle-teal" />
              <h2 className="text-oracle-bright font-semibold text-sm">Notifications</h2>
            </div>

            {([
              { key: 'dailyDigest',    label: 'Daily digest',              sub: '6:00 AM every day',   icon: Bell },
              { key: 'realTimeAlerts', label: 'Real-time alerts',          sub: 'Critical insights only', icon: BellOff },
              { key: 'weeklyReport',   label: 'Weekly Oracle report',      sub: 'Sunday 8:00 PM',      icon: Bell },
              { key: 'patternAlerts',  label: 'Pattern detection alerts',  sub: 'When new patterns emerge', icon: Bell },
            ] as { key: keyof Notifications; label: string; sub: string; icon: typeof Bell }[]).map(
              ({ key, label, sub }) => (
                <div key={key} className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-oracle-text text-sm font-medium">{label}</p>
                    <p className="text-oracle-muted text-xs">{sub}</p>
                  </div>
                  <Toggle
                    enabled={notifications[key]}
                    onChange={(v) => setNotif(key, v)}
                  />
                </div>
              ),
            )}
          </div>

          {/* Report History */}
          <div className="oracle-card p-5 space-y-3">
            <h2 className="text-oracle-bright font-semibold text-sm mb-4">Report History</h2>
            {PAST_REPORTS.map((report) => (
              <div
                key={report.date}
                className="flex items-start justify-between gap-2 py-2.5 border-b border-oracle-border/50 last:border-0 cursor-pointer hover:bg-oracle-border/10 rounded-lg px-1 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-oracle-text text-xs font-medium">{report.date}</p>
                  <p className="text-oracle-muted text-xs mt-0.5 line-clamp-2 leading-relaxed">{report.summary}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className="font-mono text-xs font-semibold"
                    style={{ color: report.score >= 70 ? '#00E5CC' : report.score >= 50 ? '#F59E0B' : '#EF4444' }}
                  >
                    {report.score}
                  </span>
                  <ChevronRight size={12} className="text-oracle-muted" />
                </div>
              </div>
            ))}
          </div>

          {/* Danger zone */}
          <div className="oracle-card p-5 border-oracle-crimson/20">
            <h2 className="text-oracle-crimson font-semibold text-sm mb-3">Danger Zone</h2>
            <p className="text-oracle-muted text-xs mb-4 leading-relaxed">
              Permanently delete your Oracle account and all associated data. This cannot be undone.
            </p>
            <button className="text-xs text-oracle-crimson border border-oracle-crimson/30 px-4 py-2 rounded-xl hover:bg-oracle-crimson/10 transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
