'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Brain, AlertOctagon, BookOpen, User } from 'lucide-react';

const NAV_ITEMS = [
  { href: '/dashboard', icon: Home,          label: 'Home' },
  { href: '/brainwave', icon: Brain,         label: 'Brainwave' },
  { href: '/sos',       icon: AlertOctagon,  label: 'SOS' },
  { href: '/journal',   icon: BookOpen,      label: 'Journal' },
  { href: '/profile',   icon: User,          label: 'Profile' },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[#060912] border-t border-[#1E2A3A] z-40">
      <div className="max-w-lg mx-auto flex">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || pathname.startsWith(href + '/');
          const isSOS = href === '/sos';
          return (
            <Link
              key={href}
              href={href}
              className={`flex-1 flex flex-col items-center justify-center py-3 transition-all ${
                isSOS ? '' : active ? 'text-[#00D4FF]' : 'text-gray-600 hover:text-gray-400'
              }`}
            >
              {isSOS ? (
                <div className={`w-12 h-12 -mt-4 rounded-full flex items-center justify-center shadow-lg transition-all ${
                  active ? 'bg-red-500' : 'bg-red-600 hover:bg-red-500'
                }`}>
                  <Icon size={22} className="text-white" />
                </div>
              ) : (
                <Icon size={22} />
              )}
              <span className={`text-xs mt-1 font-medium ${isSOS ? 'text-red-400' : ''}`}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
