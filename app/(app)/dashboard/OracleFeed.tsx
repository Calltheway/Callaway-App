'use client';

import { useState } from 'react';
import type { OracleInsight } from '@/lib/oracle';

// ── Types ──────────────────────────────────────────────────────────

interface OracleFeedProps {
  insights: OracleInsight[];
}

// ── Severity configuration ─────────────────────────────────────────

const SEVERITY_CONFIG = {
  alert: {
    icon:        '🔴',
    borderColor: '#EF4444',
    badgeClass:  'bg-oracle-crimson/10 text-oracle-crimson border border-oracle-crimson/20',
    label:       'Alert',
  },
  warning: {
    icon:        '🟡',
    borderColor: '#F59E0B',
    badgeClass:  'bg-oracle-amber/10 text-oracle-amber border border-oracle-amber/20',
    label:       'Warning',
  },
  info: {
    icon:        '🟢',
    borderColor: '#00E5CC',
    badgeClass:  'bg-oracle-teal/10 text-oracle-teal border border-oracle-teal/20',
    label:       'Info',
  },
} as const;

// ── Action type → compact icon mapping ────────────────────────────

const ACTION_ICONS: Record<string, string> = {
  cancel:    '✕',
  negotiate: '↔',
  reflect:   '◎',
  connect:   '⤷',
  exercise:  '◈',
  sleep:     '◐',
  invest:    '↑',
  call:      '◉',
  review:    '≡',
};

// ── Insight card ───────────────────────────────────────────────────

interface InsightCardProps {
  insight: OracleInsight;
  /** First card starts expanded */
  defaultExpanded?: boolean;
}

function InsightCard({ insight, defaultExpanded = false }: InsightCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const cfg            = SEVERITY_CONFIG[insight.severity];
  const confidencePct  = Math.round(insight.confidence * 100);
  const actionIcon     = insight.actionType
    ? (ACTION_ICONS[insight.actionType] ?? '→')
    : '→';

  return (
    <div
      className="oracle-card border-l-2 overflow-hidden transition-shadow duration-200 hover:shadow-oracle-lg"
      style={{ borderLeftColor: cfg.borderColor }}
    >
      {/* ── Card header — always visible, acts as toggle ─────────── */}
      <button
        className="w-full text-left px-5 pt-4 pb-3 flex items-start gap-3 focus:outline-none focus-visible:ring-1 focus-visible:ring-oracle-teal focus-visible:ring-inset"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        aria-controls={`insight-body-${insight.title}`}
      >
        {/* Severity icon */}
        <span className="text-base leading-none mt-0.5 shrink-0 select-none" aria-hidden="true">
          {cfg.icon}
        </span>

        {/* Category / severity badges + title */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className={`oracle-label text-[10px] px-2 py-0.5 rounded-full ${cfg.badgeClass}`}>
              {insight.category.toUpperCase()}
            </span>
            <span className={`oracle-label text-[10px] px-2 py-0.5 rounded-full ${cfg.badgeClass} opacity-70`}>
              {cfg.label}
            </span>
          </div>
          <p className="text-oracle-bright font-semibold text-sm leading-snug pr-2">
            {insight.title}
          </p>
        </div>

        {/* Confidence + chevron */}
        <div className="shrink-0 flex flex-col items-end gap-1.5 ml-2">
          <span className="font-mono text-xs text-oracle-muted whitespace-nowrap">
            {confidencePct}%{' '}
            <span className="text-[10px] text-oracle-muted/60">conf.</span>
          </span>
          <svg
            className={`w-3.5 h-3.5 text-oracle-muted transition-transform duration-200 ${
              expanded ? 'rotate-180' : ''
            }`}
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </button>

      {/* ── Expandable body ──────────────────────────────────────── */}
      {expanded && (
        <div
          id={`insight-body-${insight.title}`}
          className="px-5 pb-5"
        >
          <div className="border-t border-oracle-border mb-3" />

          {/* Insight content */}
          <p className="text-oracle-text text-sm leading-relaxed mb-3">
            {insight.content}
          </p>

          {/* Data points */}
          {insight.dataPoints.length > 0 && (
            <ul className="space-y-1 mb-4">
              {insight.dataPoints.map((point, i) => (
                <li
                  key={i}
                  className="flex items-start gap-2 font-mono text-xs text-oracle-muted"
                >
                  <span className="text-oracle-teal/60 mt-0.5 shrink-0" aria-hidden="true">
                    ▸
                  </span>
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          )}

          {/* Action button */}
          {insight.action && (
            <div className="flex justify-end mt-1">
              <button
                className="inline-flex items-center gap-1.5 text-xs font-mono font-medium
                           border border-oracle-border text-oracle-text
                           px-3 py-1.5 rounded-lg
                           hover:border-oracle-teal/40 hover:text-oracle-teal
                           transition-all duration-150
                           focus:outline-none focus-visible:ring-1 focus-visible:ring-oracle-teal"
              >
                <span className="text-oracle-teal" aria-hidden="true">
                  {actionIcon}
                </span>
                {insight.action}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Oracle Feed ────────────────────────────────────────────────────

export function OracleFeed({ insights }: OracleFeedProps) {
  const alertCount = insights.filter((i) => i.severity === 'alert').length;

  return (
    <div className="space-y-4">

      {/* ── Section header ────────────────────────────────────────── */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="oracle-label mb-1">Oracle Feed</p>
          <h2 className="font-display text-xl font-semibold text-oracle-bright">
            AI-powered insights about your life
          </h2>
        </div>

        {alertCount > 0 && (
          <span className="shrink-0 flex items-center gap-1.5 font-mono text-xs text-oracle-crimson
                           bg-oracle-crimson/10 border border-oracle-crimson/20
                           px-3 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-oracle-crimson animate-pulse-slow inline-block" />
            {alertCount} alert{alertCount !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Insight cards ─────────────────────────────────────────── */}
      {insights.length > 0 ? (
        <div className="space-y-3">
          {insights.map((insight, i) => (
            <InsightCard
              key={`${insight.category}-${i}`}
              insight={insight}
              defaultExpanded={i === 0}
            />
          ))}
        </div>
      ) : (
        <div className="oracle-card p-10 text-center">
          <p className="text-oracle-muted text-sm">
            No insights available yet. Connect more data sources to enable Oracle analysis.
          </p>
        </div>
      )}

    </div>
  );
}
