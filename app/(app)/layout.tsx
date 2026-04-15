'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShieldAlert, TrendingUp, MessageCircle, User, Shield } from 'lucide-react';
import { Particles } from '@/components/ui/Particles';

const NAV = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/findings',  label: 'Findings',  icon: ShieldAlert     },
  { href: '/invest',    label: 'Invest',    icon: TrendingUp      },
  { href: '/chat',      label: 'Ask AI',    icon: MessageCircle   },
  { href: '/profile',   label: 'Profile',   icon: User            },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="flex min-h-screen bg-keeper-void">
      {/* ── Animated background ────────────────────────── */}
      <Particles count={50} />
      <div className="fixed inset-0 bg-grid pointer-events-none opacity-60 z-0" />

      {/* Vivid ambient orbs */}
      <div className="fixed top-0 right-0 w-[700px] h-[700px] rounded-full bg-keeper-green/15 blur-[130px] pointer-events-none z-0 animate-float-slow" />
      <div className="fixed bottom-0 left-60 w-[500px] h-[500px] rounded-full bg-keeper-blue/12 blur-[100px] pointer-events-none z-0 animate-float" />
      <div className="fixed top-1/2 left-1/3 w-[400px] h-[400px] rounded-full bg-keeper-purple/8 blur-[100px] pointer-events-none z-0" />

      {/* Global scan line */}
      <div className="scan-line z-20" style={{ top: 0, position: 'fixed' }} />

      {/* ── Sidebar ────────────────────────────────────── */}
      <aside className="fixed inset-y-0 left-0 w-60 flex flex-col z-30 bg-keeper-deep/85 backdrop-blur-xl border-r border-keeper-border/50">

        {/* Logo */}
        <div className="relative flex items-center gap-3 px-6 py-5 border-b border-keeper-border/40">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-16 h-16 rounded-full bg-keeper-green/25 blur-2xl pointer-events-none" />
          <div className="relative w-9 h-9 rounded-xl bg-keeper-green flex items-center justify-center shadow-glow-green shrink-0">
            <span className="text-keeper-void font-black text-base">K</span>
          </div>
          <div className="relative">
            <span className="text-keeper-bright font-bold text-lg tracking-wide">Keeper</span>
            <p className="mono-label -mt-0.5">Money Intelligence</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-keeper-green/12 border border-keeper-green/25 text-keeper-green shadow-glow-sm'
                    : 'text-keeper-text hover:text-keeper-bright hover:bg-keeper-card/50 border border-transparent'
                }`}
              >
                <Icon size={17} className={active ? 'text-keeper-green' : ''} />
                <span>{label}</span>
                {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-keeper-green animate-pulse" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-keeper-border/40">
          <div className="flex items-center gap-2 text-keeper-muted text-xs">
            <Shield size={11} />
            <span>Read-only · Bank-level security</span>
          </div>
        </div>
      </aside>

      {/* ── Main ───────────────────────────────────────── */}
      <main className="relative z-10 ml-60 flex-1 min-h-screen">
        <div className="max-w-4xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
