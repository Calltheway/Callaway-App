'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import {
  LayoutDashboard, MessageSquare, Sparkles, Plug, User, LogOut,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard',    label: 'Dashboard',    icon: LayoutDashboard },
  { href: '/chat',         label: 'Oracle Chat',  icon: MessageSquare   },
  { href: '/insights',     label: 'Insights',     icon: Sparkles        },
  { href: '/integrations', label: 'Integrations', icon: Plug            },
  { href: '/profile',      label: 'Profile',      icon: User            },
] as const;

interface OracleSidebarProps {
  lifeScore?: number;
  userName?:  string;
  userEmail?: string;
  avatarUrl?: string;
}

function LifeScorePill({ score }: { score: number }) {
  const clamped = Math.max(0, Math.min(100, score));
  const radius  = 14;
  const circ    = 2 * Math.PI * radius;
  const dash    = (clamped / 100) * circ;
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative w-9 h-9 flex-shrink-0">
        <svg width="36" height="36" viewBox="0 0 36 36" className="-rotate-90">
          <circle cx="18" cy="18" r={radius} fill="none" stroke="rgba(0,229,204,0.12)" strokeWidth="3" />
          <circle cx="18" cy="18" r={radius} fill="none" stroke="#00E5CC" strokeWidth="3"
            strokeLinecap="round" strokeDasharray={`${dash} ${circ}`} />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-[10px] font-mono font-semibold text-oracle-teal">
          {clamped}
        </span>
      </div>
      <div>
        <p className="oracle-label text-[10px]">Life Score</p>
        <p className="text-oracle-bright text-xs font-semibold font-mono">{clamped} / 100</p>
      </div>
    </div>
  );
}

export function OracleSidebar({ lifeScore = 0, userName, userEmail, avatarUrl }: OracleSidebarProps) {
  const path        = usePathname();
  const displayName = userName || userEmail?.split('@')[0] || 'Oracle User';
  const initials    = displayName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <aside className="fixed inset-y-0 left-0 w-64 flex flex-col z-30"
      style={{ backgroundColor: '#0D1421', borderRight: '1px solid #1E293B' }}>

      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6" style={{ borderBottom: '1px solid #1E293B' }}>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: '#00E5CC' }}>
          <span className="font-display font-bold text-sm leading-none select-none"
            style={{ color: '#080C14' }}>O</span>
        </div>
        <span className="font-display font-bold text-xl tracking-wide text-oracle-bright">Oracle</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = path === href || path.startsWith(`${href}/`);
          return (
            <Link key={href} href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                'border-l-2 pl-[10px]',
                active
                  ? 'border-oracle-teal text-oracle-teal bg-oracle-teal/10'
                  : 'border-transparent text-oracle-muted hover:text-oracle-text hover:bg-white/5',
              )}>
              <Icon size={17} className={clsx('flex-shrink-0', active ? 'text-oracle-teal' : 'text-oracle-muted')} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="px-4 py-4 space-y-4" style={{ borderTop: '1px solid #1E293B' }}>
        <div className="px-2"><LifeScorePill score={lifeScore} /></div>

        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center"
            style={{ backgroundColor: '#111827', border: '1px solid #1E293B' }}>
            {avatarUrl
              // eslint-disable-next-line @next/next/no-img-element
              ? <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
              : <span className="text-[11px] font-semibold font-mono text-oracle-teal">{initials}</span>
            }
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-oracle-bright text-xs font-semibold truncate">{displayName}</p>
            {userEmail && <p className="text-oracle-muted text-[10px] truncate">{userEmail}</p>}
          </div>
        </div>

        <Link href="/sign-in"
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-oracle-muted hover:text-oracle-crimson text-xs font-medium transition-all">
          <LogOut size={14} />
          <span>Sign out</span>
        </Link>
      </div>
    </aside>
  );
}
