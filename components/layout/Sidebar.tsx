'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { clsx } from 'clsx';
import { LayoutDashboard, AlertCircle, TrendingUp, Settings, Shield } from 'lucide-react';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/issues',    label: 'Issues',    icon: AlertCircle     },
  { href: '/history',   label: 'History',   icon: TrendingUp      },
  { href: '/settings',  label: 'Settings',  icon: Settings        },
];

export function Sidebar({ issueCount }: { issueCount?: number }) {
  const path = usePathname();

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-navy-900 flex flex-col z-30">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
        <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-black text-sm">
          K
        </div>
        <span className="text-white font-bold text-lg tracking-wide">Keeper</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = path.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'bg-emerald-500 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/10',
              )}
            >
              <Icon size={18} />
              <span>{label}</span>
              {label === 'Issues' && issueCount !== undefined && issueCount > 0 && (
                <span className="ml-auto bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">
                  {issueCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Security badge */}
      <div className="px-4 py-4 border-t border-white/10">
        <div className="flex items-center gap-2 text-white/40 text-xs">
          <Shield size={12} />
          <span>Read-only · Bank-level security</span>
        </div>
      </div>
    </aside>
  );
}
