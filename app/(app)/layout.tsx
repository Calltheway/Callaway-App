import Link from 'next/link';
import { LayoutDashboard, ShieldAlert, TrendingUp, MessageCircle, User, Shield } from 'lucide-react';

const NAV = [
  { href: '/dashboard',  label: 'Dashboard', icon: LayoutDashboard },
  { href: '/findings',   label: 'Findings',  icon: ShieldAlert     },
  { href: '/invest',     label: 'Invest',    icon: TrendingUp      },
  { href: '/chat',       label: 'Ask AI',    icon: MessageCircle   },
  { href: '/profile',    label: 'Profile',   icon: User            },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-keeper-base">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-60 flex flex-col z-30 bg-keeper-surface border-r border-keeper-border">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-keeper-border">
          <div className="w-9 h-9 rounded-xl bg-keeper-green flex items-center justify-center">
            <span className="text-keeper-base font-black text-base">K</span>
          </div>
          <div>
            <span className="text-keeper-bright font-bold text-lg tracking-wide">Keeper</span>
            <p className="keeper-label -mt-0.5">Money Intelligence</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                         text-keeper-text hover:text-keeper-bright hover:bg-keeper-card"
            >
              <Icon size={18} />
              <span>{label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-keeper-border">
          <div className="flex items-center gap-2 text-keeper-muted text-xs">
            <Shield size={11} />
            <span>Read-only · Bank-level security</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-60 flex-1 min-h-screen bg-keeper-base">
        <div className="max-w-4xl mx-auto px-8 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
