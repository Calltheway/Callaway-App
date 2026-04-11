// Server Component — no 'use client' needed

// ── Local types ────────────────────────────────────────────────────
// (mirrors OraclePattern from @/lib/oracle — defined locally to keep
//  this component free of server-only imports)

interface OraclePattern {
  name:        string;
  description: string;
  /** e.g. "Weekly" | "Monthly" | "Seasonal" */
  frequency?:  string;
  category:    string;
  severity:    string;
}

interface PatternAlertsProps {
  patterns: OraclePattern[];
}

// ── Severity → visual styles ───────────────────────────────────────

const SEVERITY_STYLES: Record<
  string,
  { borderColor: string; badgeClass: string; dotClass: string }
> = {
  alert: {
    borderColor: '#EF4444',
    badgeClass:  'bg-oracle-crimson/10 text-oracle-crimson border border-oracle-crimson/20',
    dotClass:    'bg-oracle-crimson',
  },
  warning: {
    borderColor: '#F59E0B',
    badgeClass:  'bg-oracle-amber/10 text-oracle-amber border border-oracle-amber/20',
    dotClass:    'bg-oracle-amber',
  },
  info: {
    borderColor: '#00E5CC',
    badgeClass:  'bg-oracle-teal/10 text-oracle-teal border border-oracle-teal/20',
    dotClass:    'bg-oracle-teal',
  },
};

// ── Category → compact icon ────────────────────────────────────────

const CATEGORY_ICONS: Record<string, string> = {
  behavioral: '◎',
  emotional:  '◐',
  financial:  '◈',
  social:     '⤷',
  health:     '◉',
};

// ── Individual pattern card ────────────────────────────────────────

interface PatternCardProps {
  pattern: OraclePattern;
}

function PatternCard({ pattern }: PatternCardProps) {
  const styles = SEVERITY_STYLES[pattern.severity] ?? SEVERITY_STYLES.info;
  const icon   = CATEGORY_ICONS[pattern.category] ?? '◇';

  return (
    <div
      className="oracle-card border-l-2 px-4 py-3.5 transition-shadow duration-150 hover:shadow-oracle-lg"
      style={{ borderLeftColor: styles.borderColor }}
    >
      {/* Top row: icon + name */}
      <div className="flex items-start gap-2.5 mb-1.5">
        <span
          className="text-oracle-muted text-base leading-none mt-0.5 shrink-0 select-none"
          aria-hidden="true"
        >
          {icon}
        </span>
        <p className="text-oracle-bright text-sm font-semibold leading-snug flex-1 min-w-0">
          {pattern.name}
        </p>
      </div>

      {/* Description */}
      <p className="text-oracle-muted text-xs leading-relaxed mb-3 pl-[1.625rem]">
        {pattern.description}
      </p>

      {/* Footer: category + severity badges */}
      <div className="flex items-center gap-2 pl-[1.625rem] flex-wrap">
        <span className={`oracle-label text-[9px] px-2 py-0.5 rounded-full ${styles.badgeClass}`}>
          {pattern.category.toUpperCase()}
        </span>

        <span className="flex items-center gap-1 oracle-label text-[9px] text-oracle-muted/60">
          <span
            className={`w-1 h-1 rounded-full inline-block shrink-0 ${styles.dotClass}`}
            aria-hidden="true"
          />
          {pattern.severity.toUpperCase()}
        </span>

        {pattern.frequency && (
          <span className="oracle-label text-[9px] text-oracle-muted/50">
            {pattern.frequency}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Pattern Alerts section ─────────────────────────────────────────

export function PatternAlerts({ patterns }: PatternAlertsProps) {
  return (
    <div className="space-y-4">

      {/* Section header */}
      <div>
        <p className="oracle-label mb-1">Detected Patterns</p>
        <h2 className="font-display text-xl font-semibold text-oracle-bright">
          Pattern Alerts
        </h2>
      </div>

      {/* Pattern cards */}
      {patterns.length > 0 ? (
        <div className="space-y-3">
          {patterns.map((pattern, i) => (
            <PatternCard key={`${pattern.name}-${i}`} pattern={pattern} />
          ))}
        </div>
      ) : (
        <div className="oracle-card p-6 text-center">
          <p className="text-oracle-muted text-xs">
            No recurring patterns detected yet. Oracle needs more data to identify behavioural cycles.
          </p>
        </div>
      )}

      {/* Footer note */}
      {patterns.length > 0 && (
        <p className="oracle-label text-[10px] text-center text-oracle-muted/50 pt-1">
          Patterns derived from cross-domain life analysis
        </p>
      )}

    </div>
  );
}
