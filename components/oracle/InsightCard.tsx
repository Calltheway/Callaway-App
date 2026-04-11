'use client';

import { type OracleInsight } from '@/lib/oracle';

interface InsightCardProps {
  insight:   OracleInsight;
  onDismiss?: (title: string) => void;
}

const SEVERITY_STYLES = {
  alert:   { border: 'border-l-oracle-crimson', dot: '🔴', badge: 'bg-oracle-crimson/10 text-oracle-crimson' },
  warning: { border: 'border-l-oracle-amber',   dot: '🟡', badge: 'bg-oracle-amber/10 text-oracle-amber' },
  info:    { border: 'border-l-oracle-teal',    dot: '🟢', badge: 'bg-oracle-teal/10 text-oracle-teal' },
};

const CATEGORY_LABELS: Record<string, string> = {
  financial:  'Financial',
  social:     'Social',
  health:     'Health',
  behavioral: 'Behavioral',
  emotional:  'Emotional',
  growth:     'Growth',
};

const ACTION_ICONS: Record<string, string> = {
  cancel:    '✕',
  negotiate: '↗',
  reflect:   '◉',
  connect:   '♥',
  exercise:  '⚡',
  sleep:     '◐',
  invest:    '$',
  call:      '☎',
  review:    '⊙',
};

export function InsightCard({ insight, onDismiss }: InsightCardProps) {
  const style = SEVERITY_STYLES[insight.severity] ?? SEVERITY_STYLES.info;
  const actionIcon = insight.actionType ? ACTION_ICONS[insight.actionType] : '→';

  return (
    <div className={`oracle-card border-l-4 ${style.border} p-5 hover:border-oracle-border/80 transition-all duration-200`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base leading-none">{style.dot}</span>
          <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-full ${style.badge}`}>
            {CATEGORY_LABELS[insight.category] ?? insight.category}
          </span>
        </div>
        <span className="text-[11px] font-mono text-oracle-muted shrink-0">
          {Math.round(insight.confidence * 100)}% confidence
        </span>
      </div>

      {/* Title */}
      <h3 className="text-oracle-bright font-semibold text-sm leading-snug mb-2">
        {insight.title}
      </h3>

      {/* Content */}
      <p className="text-oracle-text text-sm leading-relaxed mb-3">
        {insight.content}
      </p>

      {/* Data points */}
      {insight.dataPoints.length > 0 && (
        <ul className="space-y-0.5 mb-3">
          {insight.dataPoints.map((point, i) => (
            <li key={i} className="text-oracle-muted text-xs font-mono flex items-start gap-1.5">
              <span className="text-oracle-teal/60 shrink-0">·</span>
              {point}
            </li>
          ))}
        </ul>
      )}

      {/* Action + Dismiss */}
      {insight.action && (
        <div className="flex items-center justify-between pt-2 border-t border-oracle-border/50">
          <span className="text-xs text-oracle-muted">
            <span className="text-oracle-teal mr-1">{actionIcon}</span>
            {insight.action}
          </span>
          {onDismiss && (
            <button
              onClick={() => onDismiss(insight.title)}
              className="text-xs text-oracle-muted hover:text-oracle-text transition-colors"
            >
              Dismiss
            </button>
          )}
        </div>
      )}
    </div>
  );
}
