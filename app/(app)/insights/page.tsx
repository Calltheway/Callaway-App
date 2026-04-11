'use client';

import { useState } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Zap } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────

type Category = 'all' | 'financial' | 'social' | 'health' | 'behavioral' | 'emotional' | 'growth';
type Severity  = 'info' | 'warning' | 'alert';

interface MockInsight {
  id:         string;
  category:   Exclude<Category, 'all'>;
  severity:   Severity;
  title:      string;
  content:    string;
  confidence: number;
  dataPoints: string[];
  action?:    string;
  week:       string;
}

// ── Mock Data ─────────────────────────────────────────────────────

const MOCK_INSIGHTS: MockInsight[] = [
  {
    id:         'insight-1',
    category:   'social',
    severity:   'alert',
    title:      'Isolation Index +34%',
    content:
      "You've cancelled plans with friends 4 times this month vs 1 time last month. Your response rate to social messages has dropped from 94% to 61%. This pattern correlates strongly with increased work hours and signals a growing disconnection from your support network.",
    confidence: 0.91,
    dataPoints: [
      '4 cancellations in 28 days',
      '61% message response rate (↓33%)',
      '23% increase in solo evenings',
    ],
    action: 'Schedule 1 social commitment this week you won\'t cancel',
    week:   'Apr 7–13',
  },
  {
    id:         'insight-2',
    category:   'health',
    severity:   'warning',
    title:      'Sleep dropped 41 min since job change',
    content:
      'Since March 12, your average sleep has declined from 7h 18m to 6h 37m. This coincides exactly with your new job start date. Your calendar shows meetings scheduled before 8am on 3 days per week, compressing your sleep window significantly.',
    confidence: 0.88,
    dataPoints: [
      'Avg sleep: 6h 37m (↓41min)',
      'Pre-8am meetings: 3×/week',
      'Job start date: March 12',
    ],
    action: 'Block 10:30pm–6:30am as sacred sleep window',
    week:   'Mar 31–Apr 6',
  },
  {
    id:         'insight-3',
    category:   'financial',
    severity:   'info',
    title:      'Savings rate improved 8% vs last quarter',
    content:
      'Your savings rate has climbed to 23% from 15% last quarter — a genuine improvement. Dining out dropped $340/month since you started meal prepping. However, streaming subscriptions have quietly crept to $87/month across 4 services you haven\'t used in 45+ days.',
    confidence: 0.95,
    dataPoints: [
      'Savings rate: 23% (↑8%)',
      'Dining savings: $340/mo',
      '4 unused subscriptions: $87/mo',
    ],
    action: 'Cancel the 4 dormant streaming subscriptions',
    week:   'Apr 7–13',
  },
  {
    id:         'insight-4',
    category:   'behavioral',
    severity:   'warning',
    title:      'Self-sabotage pattern before major milestones',
    content:
      'Before your last 3 major presentations or deadlines, you show a consistent pattern: sleep drops 45min, alcohol consumption increases, and you cancel social plans. Your next major deadline is in 11 days — this pattern is already starting.',
    confidence: 0.82,
    dataPoints: [
      'Pattern detected over 3 consecutive events',
      'Next deadline: 11 days out',
      'Sleep/alcohol correlation: r=0.87',
    ],
    action: 'Set a pre-deadline ritual — sleep 30 min earlier 3 days before',
    week:   'Mar 31–Apr 6',
  },
  {
    id:         'insight-5',
    category:   'emotional',
    severity:   'info',
    title:      'Positive emotional momentum building',
    content:
      'Your journaling entries show a shift toward more future-oriented language over the past 2 weeks. Words like "excited", "opportunity", and "planning" are up 40%. This is a strong signal of growing psychological safety and forward momentum.',
    confidence: 0.76,
    dataPoints: [
      'Future-oriented words: +40%',
      'Anxiety language: −18%',
      'Journal consistency: 6/7 days',
    ],
    action: 'Capture this momentum — write your 90-day vision this weekend',
    week:   'Apr 7–13',
  },
  {
    id:         'insight-6',
    category:   'growth',
    severity:   'info',
    title:      'Learning cadence at 3-year high',
    content:
      'You\'ve read 2.4 books/month this quarter — your highest rate since 2021. Time spent on courses and skill-building content is up 60%. This investment is already showing up in your promotion-track performance metrics.',
    confidence: 0.84,
    dataPoints: [
      'Books/month: 2.4 (3-yr high)',
      'Course hours: +60% vs Q4',
      'Skill score: 78/100',
    ],
    action: 'Maintain pace — protect 45 min daily reading block',
    week:   'Apr 7–13',
  },
  {
    id:         'insight-7',
    category:   'financial',
    severity:   'warning',
    title:      'Impulse spending spikes every Sunday',
    content:
      'Analysis of your transaction data shows a clear weekly pattern: 67% of unplanned purchases occur on Sunday evenings between 8–11pm. This correlates with your Sunday anxiety pattern and appears to be emotional spending triggered by work anticipation.',
    confidence: 0.79,
    dataPoints: [
      '67% of impulse buys on Sunday PM',
      'Average impulse spend: $43',
      'Total last month: $172 on Sundays',
    ],
    action: 'Replace Sunday PM shopping with a walk or journaling',
    week:   'Mar 31–Apr 6',
  },
  {
    id:         'insight-8',
    category:   'health',
    severity:   'info',
    title:      'HRV recovery trend is improving',
    content:
      'Your morning HRV has increased from 42ms to 58ms over the past 6 weeks, indicating improving cardiovascular resilience. This aligns with your increased walking and the reduction in late-night alcohol consumption you\'ve achieved.',
    confidence: 0.87,
    dataPoints: [
      'HRV: 42ms → 58ms (+38%)',
      'Weekly walks: 4.2 avg',
      'Late-night alcohol: −60%',
    ],
    week: 'Apr 7–13',
  },
];

const FEATURED_INSIGHT: MockInsight = MOCK_INSIGHTS[0];

// Life score trend data
const SCORE_HISTORY = [
  { week: 'W1', score: 65 },
  { week: 'W2', score: 68 },
  { week: 'W3', score: 71 },
  { week: 'W4', score: 74 },
];

// Category dimension sub-scores
const SUB_SCORES = [
  { label: 'Financial', value: 68, color: '#F59E0B' },
  { label: 'Social',    value: 54, color: '#EF4444' },
  { label: 'Health',    value: 79, color: '#00E5CC' },
  { label: 'Emotional', value: 65, color: '#A78BFA' },
  { label: 'Growth',    value: 82, color: '#34D399' },
];

// ── Constants ─────────────────────────────────────────────────────

const CATEGORIES: { label: string; value: Category }[] = [
  { label: 'All',         value: 'all' },
  { label: 'Financial',   value: 'financial' },
  { label: 'Social',      value: 'social' },
  { label: 'Health',      value: 'health' },
  { label: 'Behavioral',  value: 'behavioral' },
  { label: 'Emotional',   value: 'emotional' },
  { label: 'Growth',      value: 'growth' },
];

const SEVERITY_STYLES: Record<Severity, { border: string; badge: string; dot: string }> = {
  alert: {
    border: '#EF4444',
    badge:  'bg-oracle-crimson/10 text-oracle-crimson border border-oracle-crimson/20',
    dot:    'bg-oracle-crimson',
  },
  warning: {
    border: '#F59E0B',
    badge:  'bg-oracle-amber/10 text-oracle-amber border border-oracle-amber/20',
    dot:    'bg-oracle-amber',
  },
  info: {
    border: '#00E5CC',
    badge:  'bg-oracle-teal/10 text-oracle-teal border border-oracle-teal/20',
    dot:    'bg-oracle-teal',
  },
};

// ── Sub-components ────────────────────────────────────────────────

interface InsightCardProps {
  insight: MockInsight;
}

function InsightCard({ insight }: InsightCardProps) {
  const [expanded, setExpanded] = useState(false);
  const styles = SEVERITY_STYLES[insight.severity];
  const confidencePct = Math.round(insight.confidence * 100);

  return (
    <div
      className="oracle-card border-l-2 overflow-hidden transition-shadow duration-200 hover:shadow-oracle-lg cursor-pointer"
      style={{ borderLeftColor: styles.border }}
      onClick={() => setExpanded((v) => !v)}
    >
      <div className="px-4 py-3 flex items-start gap-3">
        <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${styles.dot}`} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${styles.badge}`}>
              {insight.category.toUpperCase()}
            </span>
            <span className="text-oracle-muted text-[10px] font-mono">{insight.week}</span>
          </div>
          <p className="text-oracle-bright text-sm font-semibold leading-snug">{insight.title}</p>

          {expanded && (
            <div className="mt-3 space-y-3">
              <p className="text-oracle-text text-xs leading-relaxed">{insight.content}</p>
              <ul className="space-y-1">
                {insight.dataPoints.map((pt, i) => (
                  <li key={i} className="flex items-start gap-1.5 font-mono text-[11px] text-oracle-muted">
                    <span className="text-oracle-teal/60 shrink-0 mt-0.5">▸</span>
                    {pt}
                  </li>
                ))}
              </ul>
              {insight.action && (
                <p className="text-xs text-oracle-teal font-mono">→ {insight.action}</p>
              )}
            </div>
          )}
        </div>

        <div className="shrink-0 text-right">
          <span className="font-mono text-xs text-oracle-muted">{confidencePct}%</span>
          <svg
            className={`w-3 h-3 text-oracle-muted mt-1 ml-auto transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
    </div>
  );
}

// Custom Recharts tooltip
function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-oracle-card border border-oracle-border rounded-lg px-3 py-2 shadow-oracle-lg">
      <p className="oracle-label text-[10px] mb-0.5">{label}</p>
      <p className="text-oracle-teal font-mono text-sm font-bold">{payload[0].value}</p>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────

export default function InsightsPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const filtered =
    activeCategory === 'all'
      ? MOCK_INSIGHTS
      : MOCK_INSIGHTS.filter((i) => i.category === activeCategory);

  const alertCount   = filtered.filter((i) => i.severity === 'alert').length;
  const warningCount = filtered.filter((i) => i.severity === 'warning').length;

  return (
    <div className="space-y-8">

      {/* ── Page header ──────────────────────────────────────────── */}
      <header>
        <p className="oracle-label mb-2">Oracle Intelligence</p>
        <h1 className="font-display text-3xl font-bold text-oracle-bright">
          Insights
        </h1>
        <p className="text-oracle-muted text-sm mt-1">
          Deep pattern analysis across all dimensions of your life
        </p>
      </header>

      {/* ── Insight of the Week — featured card ──────────────────── */}
      <div
        className="relative oracle-card border-l-4 overflow-hidden"
        style={{ borderLeftColor: '#00E5CC' }}
      >
        {/* Teal gradient accent */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'linear-gradient(90deg, rgba(0,229,204,0.06) 0%, transparent 60%)',
          }}
        />

        <div className="relative px-6 py-5">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-oracle-teal/20 border border-oracle-teal/30 flex items-center justify-center">
                <Zap className="w-3.5 h-3.5 text-oracle-teal" />
              </div>
              <span className="oracle-label text-oracle-teal">Insight of the Week</span>
            </div>
            <span className="font-mono text-xs text-oracle-muted">
              {Math.round(FEATURED_INSIGHT.confidence * 100)}% confidence
            </span>
          </div>

          <h2 className="font-display text-xl font-bold text-oracle-bright mb-2">
            {FEATURED_INSIGHT.title}
          </h2>
          <p className="text-oracle-text text-sm leading-relaxed mb-4 max-w-2xl">
            {FEATURED_INSIGHT.content}
          </p>

          <div className="flex flex-wrap gap-2 mb-4">
            {FEATURED_INSIGHT.dataPoints.map((pt, i) => (
              <span
                key={i}
                className="font-mono text-[11px] text-oracle-muted bg-oracle-border/40 px-2.5 py-1 rounded-md"
              >
                {pt}
              </span>
            ))}
          </div>

          {FEATURED_INSIGHT.action && (
            <button className="oracle-btn-primary text-sm px-4 py-2">
              → {FEATURED_INSIGHT.action}
            </button>
          )}
        </div>
      </div>

      {/* ── Category filter tabs ─────────────────────────────────── */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setActiveCategory(value)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              activeCategory === value
                ? 'bg-oracle-teal text-oracle-base font-semibold'
                : 'bg-oracle-card border border-oracle-border text-oracle-muted hover:text-oracle-text hover:border-oracle-teal/30'
            }`}
          >
            {label}
          </button>
        ))}

        {/* Alert summary */}
        {(alertCount > 0 || warningCount > 0) && (
          <div className="ml-auto flex items-center gap-2 text-xs font-mono">
            {alertCount > 0 && (
              <span className="text-oracle-crimson bg-oracle-crimson/10 border border-oracle-crimson/20 px-2.5 py-1 rounded-full">
                {alertCount} alert{alertCount !== 1 ? 's' : ''}
              </span>
            )}
            {warningCount > 0 && (
              <span className="text-oracle-amber bg-oracle-amber/10 border border-oracle-amber/20 px-2.5 py-1 rounded-full">
                {warningCount} warning{warningCount !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Two-column: insight list (2/3) + chart (1/3) ─────────── */}
      <div className="grid grid-cols-3 gap-6">

        {/* Left — insight list */}
        <div className="col-span-2 space-y-3">
          {filtered.length === 0 ? (
            <div className="oracle-card p-10 text-center">
              <p className="text-oracle-muted text-sm">
                No insights in this category yet.
              </p>
            </div>
          ) : (
            filtered.map((insight) => (
              <InsightCard key={insight.id} insight={insight} />
            ))
          )}
        </div>

        {/* Right — chart panel */}
        <div className="col-span-1 space-y-4">

          {/* Life Score trend chart */}
          <div className="oracle-card p-4">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-4 h-4 text-oracle-teal" />
              <div>
                <p className="oracle-label text-[10px]">Life Score Trend</p>
                <p className="text-oracle-bright text-sm font-semibold">Last 4 weeks</p>
              </div>
            </div>

            <ResponsiveContainer width="100%" height={160}>
              <LineChart
                data={SCORE_HISTORY}
                margin={{ top: 4, right: 4, left: -28, bottom: 0 }}
              >
                <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="week"
                  tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'DM Mono' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  domain={[60, 80]}
                  tick={{ fill: '#64748B', fontSize: 11, fontFamily: 'DM Mono' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke="#00E5CC"
                  strokeWidth={2}
                  dot={{ fill: '#00E5CC', r: 4, strokeWidth: 0 }}
                  activeDot={{ fill: '#00E5CC', r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-oracle-border">
              <span className="text-oracle-muted text-xs font-mono">Current</span>
              <span className="text-oracle-teal font-mono font-bold text-lg">74</span>
            </div>
          </div>

          {/* Sub-score breakdown */}
          <div className="oracle-card p-4">
            <p className="oracle-label mb-3">Score Breakdown</p>
            <div className="space-y-3">
              {SUB_SCORES.map(({ label, value, color }) => (
                <div key={label}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-oracle-muted text-xs">{label}</span>
                    <span className="font-mono text-xs" style={{ color }}>
                      {value}
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-oracle-border overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${value}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick stats */}
          <div className="oracle-card p-4">
            <p className="oracle-label mb-3">This Period</p>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-oracle-muted text-xs">Total insights</span>
                <span className="text-oracle-bright font-mono text-sm">{MOCK_INSIGHTS.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-oracle-muted text-xs">Avg confidence</span>
                <span className="text-oracle-bright font-mono text-sm">
                  {Math.round(
                    (MOCK_INSIGHTS.reduce((s, i) => s + i.confidence, 0) /
                      MOCK_INSIGHTS.length) *
                      100,
                  )}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-oracle-muted text-xs">Alerts requiring action</span>
                <span className="text-oracle-crimson font-mono text-sm">
                  {MOCK_INSIGHTS.filter((i) => i.severity === 'alert').length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-oracle-muted text-xs">Score delta (4wk)</span>
                <span className="text-oracle-teal font-mono text-sm">+9 pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
