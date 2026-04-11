'use client';

import { useEffect, useRef, useState } from 'react';

// ── Types ──────────────────────────────────────────────────────────

interface LifeScoreGaugeProps {
  overall:      number;
  financial:    number;
  social:       number;
  health:       number;
  productivity: number;
  emotional:    number;
  growth:       number;
}

// ── Helpers ────────────────────────────────────────────────────────

/** Returns the raw hex color for a score value */
function scoreHex(score: number): string {
  if (score >= 70) return '#00E5CC';   // oracle-teal
  if (score >= 40) return '#F59E0B';   // oracle-amber
  return '#EF4444';                    // oracle-crimson
}

/** Returns the Tailwind bg class for a score value */
function scoreBgClass(score: number): string {
  if (score >= 70) return 'bg-oracle-teal';
  if (score >= 40) return 'bg-oracle-amber';
  return 'bg-oracle-crimson';
}

/** Human-readable status label */
function scoreLabel(score: number): string {
  if (score >= 80) return 'Thriving';
  if (score >= 70) return 'Strong';
  if (score >= 55) return 'Moderate';
  if (score >= 40) return 'Strained';
  return 'Critical';
}

// ── Sub-score bar ─────────────────────────────────────────────────

interface SubScoreBarProps {
  label: string;
  value: number;
}

function SubScoreBar({ label, value }: SubScoreBarProps) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-1">
        <span className="oracle-label text-[10px] truncate">{label}</span>
        <span
          className="font-mono text-xs font-medium shrink-0"
          style={{ color: scoreHex(value) }}
        >
          {value}
        </span>
      </div>
      <div className="h-1.5 rounded-full bg-oracle-border overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${scoreBgClass(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────

export function LifeScoreGauge({
  overall,
  financial,
  social,
  health,
  productivity,
  emotional,
  growth,
}: LifeScoreGaugeProps) {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [animatedDash,  setAnimatedDash]  = useState(0);
  const rafRef       = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // SVG geometry
  const RADIUS       = 80;
  const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 502.65
  const DURATION     = 1500; // ms

  // Animate arc from 0 → overall on mount (or when `overall` changes)
  useEffect(() => {
    // Reset refs so re-runs start fresh
    startTimeRef.current = null;

    const targetDash = (overall / 100) * CIRCUMFERENCE;

    const tick = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed  = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / DURATION, 1);

      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);

      setAnimatedScore(Math.round(eased * overall));
      setAnimatedDash(eased * targetDash);

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [overall]);

  const arcColor         = scoreHex(overall);
  const strokeDashoffset = CIRCUMFERENCE - animatedDash;

  const subScores: { label: string; value: number }[] = [
    { label: 'Financial',    value: financial    },
    { label: 'Social',       value: social       },
    { label: 'Health',       value: health       },
    { label: 'Productivity', value: productivity },
    { label: 'Emotional',    value: emotional    },
    { label: 'Growth',       value: growth       },
  ];

  return (
    <div className="oracle-card p-6 h-full flex flex-col">

      {/* Section label */}
      <p className="oracle-label mb-4">Life Score</p>

      {/* ── SVG Gauge ───────────────────────────────────────────── */}
      <div className="flex justify-center">
        <svg
          viewBox="0 0 200 200"
          className="w-44 h-44"
          aria-label={`Life score: ${overall} out of 100`}
          role="img"
        >
          <defs>
            {/* Soft glow behind the arc */}
            <filter id="ls-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Background track */}
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke="#1E293B"
            strokeWidth="8"
          />

          {/* Animated score arc — origin at 12 o'clock */}
          <circle
            cx="100"
            cy="100"
            r={RADIUS}
            fill="none"
            stroke={arcColor}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            strokeDashoffset={strokeDashoffset}
            transform="rotate(-90 100 100)"
            filter="url(#ls-glow)"
            style={{ transition: 'stroke 0.4s ease' }}
          />

          {/* Score number */}
          <text
            x="100"
            y="92"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#F1F5F9"
            fontSize="38"
            fontWeight="700"
            fontFamily="'DM Mono', monospace"
          >
            {animatedScore}
          </text>

          {/* "LIFE SCORE" label */}
          <text
            x="100"
            y="116"
            textAnchor="middle"
            dominantBaseline="middle"
            fill="#64748B"
            fontSize="9"
            fontFamily="'DM Mono', monospace"
            letterSpacing="2.5"
          >
            LIFE SCORE
          </text>

          {/* Status label (Thriving / Strong / etc.) */}
          <text
            x="100"
            y="132"
            textAnchor="middle"
            dominantBaseline="middle"
            fill={arcColor}
            fontSize="9"
            fontFamily="'DM Mono', monospace"
          >
            {scoreLabel(overall)}
          </text>
        </svg>
      </div>

      {/* ── Sub-score grid ──────────────────────────────────────── */}
      <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-3 flex-1">
        {subScores.map(({ label, value }) => (
          <SubScoreBar key={label} label={label} value={value} />
        ))}
      </div>

    </div>
  );
}
