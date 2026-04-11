'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard,
  MessageSquare,
  Sparkles,
  Plug,
  User,
  LogOut,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

// ── Navigation items ──────────────────────────────────────────────
const NAV_ITEMS = [
  { href: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/chat',         label: 'Oracle Chat',  icon: MessageSquare   },
  { href: '/insights',     label: 'Insights',     icon: Sparkles        },
  { href: '/integrations', label: 'Integrations', icon: Plug            },
  { href: '/profile',      label: 'Profile',      icon: User            },
] as const;

// ── Types ─────────────────────────────────────────────────────────
interface OracleSidebarProps {
  /** Life Score 0–100, shown in the bottom pill */
  lifeScore?: number;
  /** Authenticated user's display name */
  userName?: string;
  /** Authenticated user's email (fallback display) */
  userEmail?: string;
  /** Authenticated user's avatar URL */
  avatarUrl?: string;
}

// ── Life Score ring ───────────────────────────────────────────────
function LifeScorePill({ score }: { score: number }) {
  // Clamp to [0, 100]
  const clamped = Math.max(0, Math.min(100, score));
  const radius  = 14;
  const circ    = 2 * Math.PI * radius;
  const dash    = (clamped / 100) * circ;

  return (
    <div className="flex items-center gap-2.5">
      {/* SVG ring */}
      <div className="relative w-9 h-9 flex-shrink-0">
        <svg width="36" height="36" viewBox="0 0 36 36" className="-rotate-90">
          {/* Track */}
          <circle
            cx="18" cy="18" r={radius}
            fill="none"
            stroke="rgba(0,229,204,0.12)"
            strokeWidth="3"
          />
          {/* Progress */}
          <circle
            cx="18" cy="18" r={radius}
            fill="none"
            stroke="#00E5CC"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${circ}`}
            style={{ transition: 'stroke-dasharray 0.6s ease' }}
          />
        </svg>
        {/* Score label */}
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-semibold text-oracle-teal leading-none">
          {clamped}
        </span>
      </div>

      <div className="min-w-0">
        <p className="oracle-label text-[10px]">Life Score</p>
        <p className="text-oracle-bright text-xs font-semibold font-mono">{clamped} / 100</p>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export function OracleSidebar({
  lifeScore = 0,
  userName,
  userEmail,
  avatarUrl,
}: OracleSidebarProps) {
  const path   = usePathname();
  const router = useRouter();

  const displayName = userName || userEmail?.split('@')[0] || 'Oracle User';
  const initials    = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/sign-in');
  };

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-oracle-navy border-r border-oracle-border flex flex-col z-30">

      {/* ── Logo ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-oracle-border">
        {/* Teal "O" glyph */}
        <div className="w-8 h-8 rounded-lg bg-oracle-teal flex items-center justify-center flex-shrink-0">
          <span className="font-display font-bold text-oracle-base text-base leading-none select-none">
            O
          </span>
        </div>
        <span className="font-display font-bold text-oracle-bright text-xl tracking-wide">
          Oracle
        </span>
      </div>

      {/* ── Navigation ───────────────────────────────────────────── */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(`${href}/`);

          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 relative',
                active
                  ? 'bg-oracle-teal/10 text-oracle-teal border-l-2 border-oracle-teal pl-[10px]'
                  : 'text-oracle-muted hover:text-oracle-text hover:bg-oracle-teal/5 border-l-2 border-transparent pl-[10px]',
              )}
            >
              <Icon
                size={17}
                className={clsx(
                  'flex-shrink-0 transition-colors',
                  active ? 'text-oracle-teal' : 'text-oracle-muted group-hover:text-oracle-text',
                )}
              />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* ── Bottom section ───────────────────────────────────────── */}
      <div className="px-4 py-4 border-t border-oracle-border space-y-4">

        {/* Life Score pill */}
        <div className="px-2">
          <LifeScorePill score={lifeScore} />
        </div>

        {/* User avatar / name */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-oracle-card border border-oracle-border flex-shrink-0 overflow-hidden">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-[11px] font-semibold font-mono text-oracle-teal">
                  {initials}
                </span>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-oracle-bright text-xs font-semibold truncate">{displayName}</p>
            {userEmail && (
              <p className="text-oracle-muted text-[10px] truncate">{userEmail}</p>
            )}
          </div>
        </div>

        {/* Sign out */}
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-oracle-muted hover:text-oracle-crimson hover:bg-oracle-crimson/5 transition-all duration-150 text-xs font-medium"
        >
          <LogOut size={14} className="flex-shrink-0" />
          <span>Sign out</span>
        </button>
      </div>
    </aside>
  );
}
