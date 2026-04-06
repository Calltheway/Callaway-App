'use client';

interface BrainHealingMapProps {
  streakDays: number;
}

export default function BrainHealingMap({ streakDays }: BrainHealingMapProps) {
  const healingPercent = Math.min(100, Math.round((streakDays / 90) * 100));

  // Determine which regions are lit
  const prefrontalLit  = streakDays >= 7;
  const limbicCalm     = streakDays >= 14;
  const rewardRewired  = streakDays >= 30;
  const fullIlluminated = streakDays >= 90;

  const milestones = [
    { day: 3,  label: 'Brain fog lifts',        unlocked: streakDays >= 3 },
    { day: 7,  label: 'Prefrontal cortex wakes', unlocked: prefrontalLit },
    { day: 14, label: 'Limbic system calms',     unlocked: limbicCalm },
    { day: 30, label: 'Reward circuits rewire',  unlocked: rewardRewired },
    { day: 90, label: 'Full brain illuminated',  unlocked: fullIlluminated },
  ];

  return (
    <div className="bg-[#111827] border border-[#1E2A3A] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-white font-bold">Brain Healing Map</h3>
        <span className="text-[#00D4FF] font-black text-lg">{healingPercent}%</span>
      </div>

      {/* SVG Brain */}
      <div className="flex justify-center mb-5">
        <svg width="200" height="160" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Brain outline */}
          <path
            d="M100 20 C60 20 30 45 30 75 C30 95 40 110 55 120 C60 130 70 140 80 140 L120 140 C130 140 140 130 145 120 C160 110 170 95 170 75 C170 45 140 20 100 20 Z"
            stroke="#1E2A3A"
            strokeWidth="2"
            fill={fullIlluminated ? 'rgba(0,212,255,0.08)' : 'rgba(6,9,18,0.6)'}
            className={fullIlluminated ? 'neural-path' : ''}
          />

          {/* Brain folds */}
          <path d="M70 60 Q80 50 90 60 Q100 70 110 60 Q120 50 130 60" stroke="#1E2A3A" strokeWidth="1.5" fill="none" />
          <path d="M55 85 Q65 75 75 85 Q85 95 95 85" stroke="#1E2A3A" strokeWidth="1.5" fill="none" />
          <path d="M110 85 Q120 95 130 85 Q140 75 145 85" stroke="#1E2A3A" strokeWidth="1.5" fill="none" />

          {/* Center divider */}
          <path d="M100 25 L100 135" stroke="#1E2A3A" strokeWidth="1" strokeDasharray="4,4" />

          {/* Prefrontal cortex (front of brain) */}
          {prefrontalLit && (
            <ellipse
              cx="100" cy="45" rx="25" ry="15"
              fill="rgba(0,100,255,0.25)"
              stroke="#0064FF"
              strokeWidth="1.5"
              className="neural-path"
            />
          )}

          {/* Limbic system (center) */}
          {limbicCalm && (
            <ellipse
              cx="100" cy="85" rx="20" ry="12"
              fill="rgba(0,200,100,0.25)"
              stroke="#00C864"
              strokeWidth="1.5"
              className="neural-path"
            />
          )}

          {/* Reward circuits (nucleus accumbens area) */}
          {rewardRewired && (
            <g>
              <circle cx="80" cy="100" r="8" fill="rgba(255,215,0,0.2)" stroke="#FFD700" strokeWidth="1.5" className="neural-path" />
              <circle cx="120" cy="100" r="8" fill="rgba(255,215,0,0.2)" stroke="#FFD700" strokeWidth="1.5" className="neural-path" />
              <line x1="88" y1="100" x2="112" y2="100" stroke="#FFD700" strokeWidth="1" strokeDasharray="3,2" />
            </g>
          )}

          {/* Neural pathways that grow with streak */}
          {streakDays >= 3 && (
            <g>
              <path d="M100 45 Q90 65 80 100" stroke={limbicCalm ? '#00C864' : '#1E2A3A'} strokeWidth="1" fill="none" strokeDasharray="3,3" className={streakDays >= 7 ? 'neural-path' : ''} />
              <path d="M100 45 Q110 65 120 100" stroke={limbicCalm ? '#00C864' : '#1E2A3A'} strokeWidth="1" fill="none" strokeDasharray="3,3" className={streakDays >= 7 ? 'neural-path' : ''} />
            </g>
          )}

          {/* Full illumination aura */}
          {fullIlluminated && (
            <ellipse cx="100" cy="80" rx="70" ry="60" fill="none" stroke="rgba(0,212,255,0.3)" strokeWidth="2" className="neural-path" />
          )}

          {/* Day marker dots */}
          {milestones.map((m, i) => (
            <circle
              key={m.day}
              cx={50 + i * 25}
              cy={148}
              r={5}
              fill={m.unlocked ? '#00D4FF' : '#1E2A3A'}
              stroke={m.unlocked ? '#00D4FF' : '#1E2A3A'}
            />
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="space-y-2">
        {milestones.map((m) => (
          <div key={m.day} className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${m.unlocked ? 'bg-[#00D4FF]' : 'bg-[#1E2A3A]'}`} />
            <span className={`text-xs ${m.unlocked ? 'text-white' : 'text-gray-600'}`}>
              Day {m.day}: {m.label}
            </span>
            {m.unlocked && <span className="text-[#00D4FF] text-xs ml-auto">✓</span>}
            {!m.unlocked && streakDays < m.day && (
              <span className="text-gray-600 text-xs ml-auto">{m.day - streakDays}d left</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
