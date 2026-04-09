'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Brain, AlertOctagon, Shield, User } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', icon: Home,         label: 'Home' },
  { href: '/brainwave', icon: Brain,        label: 'Brainwave' },
  { href: '/sos',       icon: AlertOctagon, label: 'SOS',     isSOS: true },
  { href: '/blocker',   icon: Shield,       label: 'Blocker' },
  { href: '/profile',   icon: User,         label: 'Profile' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 backdrop-blur-xl bg-[#050810]/90 border-t border-white/[0.06]">
      <div className="max-w-lg mx-auto flex items-end">
        {NAV_ITEMS.map(({ href, icon: Icon, label, isSOS }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center transition-all ${
                isSOS ? 'pb-1' : 'py-3'
              } ${!isSOS ? (active ? 'text-violet-400' : 'text-white/25 hover:text-white/50') : ''}`}
            >
              {isSOS ? (
                <div className={`w-14 h-14 -mt-5 rounded-full flex items-center justify-center shadow-2xl transition-all border-4 border-[#050810] ${
                  active
                    ? 'bg-red-500'
                    : 'bg-gradient-to-br from-red-600 to-red-500 hover:brightness-110'
                }`}
                  style={{ boxShadow: '0 0 24px rgba(220,38,38,0.5)' }}
                >
                  <Icon size={22} className="text-white" />
                </div>
              ) : (
                <Icon size={22} />
              )}
              <span className={`text-xs mt-1 font-semibold ${
                isSOS ? 'text-red-400' : active ? 'text-violet-400' : 'text-white/25'
              }`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
