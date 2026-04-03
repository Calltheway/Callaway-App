'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingBag, Search, Menu, X, Sparkles, Cpu } from 'lucide-react';
import { useCartStore } from '@/store/cartStore';
import { motion, AnimatePresence } from 'framer-motion';

const navLinks = [
  { href: '/shop',        label: 'Shop'        },
  { href: '/collections', label: 'Collections' },
  { href: '/tryon',       label: 'AI Try-On'   },
];

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false);
  const [mobileOpen, setMobile]   = useState(false);
  const [searchOpen, setSearch]   = useState(false);
  const [query, setQuery]         = useState('');
  const pathname  = usePathname();
  const { toggleCart, getItemCount } = useCartStore();
  const count = getItemCount();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobile(false); }, [pathname]);

  return (
    <>
      {/* Search overlay */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-start justify-center pt-24"
            style={{ background: 'rgba(3,3,9,0.92)', backdropFilter: 'blur(20px)' }}
            onClick={() => setSearch(false)}
          >
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="w-full max-w-2xl mx-4"
              onClick={e => e.stopPropagation()}
            >
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-lumis-dim" size={20} />
                <input
                  autoFocus
                  type="text"
                  placeholder="Search LUMIS — try 'black blazer' or 'oversized hoodie'…"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && query.trim()) {
                      window.location.href = `/shop?q=${encodeURIComponent(query)}`;
                    }
                    if (e.key === 'Escape') setSearch(false);
                  }}
                  className="w-full pl-12 pr-4 py-4 rounded-2xl text-lg text-lumis-text outline-none"
                  style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(139,92,246,0.4)' }}
                />
                <button onClick={() => setSearch(false)} className="absolute right-4 top-1/2 -translate-y-1/2 text-lumis-dim hover:text-lumis-text">
                  <X size={18} />
                </button>
              </div>
              <p className="text-center text-lumis-dim text-sm mt-4">
                Press <kbd className="px-2 py-0.5 rounded bg-lumis-surface text-lumis-muted text-xs font-mono">Enter</kbd> to search · <kbd className="px-2 py-0.5 rounded bg-lumis-surface text-lumis-muted text-xs font-mono">Esc</kbd> to close
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <header
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
        style={scrolled
          ? { background: 'rgba(3,3,9,0.85)', backdropFilter: 'blur(24px)', borderBottom: '1px solid rgba(255,255,255,0.06)' }
          : { background: 'transparent' }
        }
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 md:h-20">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 100%)' }}>
                <Cpu size={18} className="text-white" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2), transparent)' }} />
              </div>
              <span className="font-display font-700 text-xl tracking-tight text-lumis-text">
                LUM<span className="text-gradient-violet">IS</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ href, label }) => {
                const active = pathname === href || pathname.startsWith(href + '/');
                return (
                  <Link
                    key={href}
                    href={href}
                    className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                      active ? 'text-lumis-text' : 'text-lumis-muted hover:text-lumis-text'
                    }`}
                  >
                    {active && (
                      <motion.span
                        layoutId="nav-pill"
                        className="absolute inset-0 rounded-lg"
                        style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.25)' }}
                      />
                    )}
                    {label === 'AI Try-On' && (
                      <Sparkles size={12} className="inline mr-1 text-lumis-cyan" />
                    )}
                    <span className="relative">{label}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearch(true)}
                className="p-2.5 rounded-xl text-lumis-muted hover:text-lumis-text transition-colors hover:bg-lumis-surface"
                aria-label="Search"
              >
                <Search size={20} />
              </button>

              <button
                onClick={toggleCart}
                className="relative p-2.5 rounded-xl text-lumis-muted hover:text-lumis-text transition-colors hover:bg-lumis-surface"
                aria-label="Cart"
              >
                <ShoppingBag size={20} />
                {count > 0 && (
                  <motion.span
                    key={count}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-0.5 -right-0.5 w-5 h-5 rounded-full text-white text-xs font-bold flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}
                  >
                    {count}
                  </motion.span>
                )}
              </button>

              <button
                onClick={() => setMobile(v => !v)}
                className="md:hidden p-2.5 rounded-xl text-lumis-muted hover:text-lumis-text transition-colors"
              >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden"
              style={{ background: 'rgba(13,13,26,0.95)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="px-4 py-4 flex flex-col gap-1">
                {navLinks.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="px-4 py-3 rounded-xl text-lumis-muted hover:text-lumis-text hover:bg-lumis-surface transition-all font-medium"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}
