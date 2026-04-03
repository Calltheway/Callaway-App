import Link from 'next/link';
import { Cpu, Instagram, Twitter, Youtube, ArrowRight } from 'lucide-react';

const links = {
  Shop:    [{ label: 'New Arrivals', href: '/shop?filter=new' }, { label: "Men's",  href: '/shop?cat=mens' }, { label: "Women's", href: '/shop?cat=womens' }, { label: 'Streetwear', href: '/shop?cat=streetwear' }, { label: 'Luxury',   href: '/shop?cat=luxury' }],
  Company: [{ label: 'About',        href: '#' }, { label: 'Careers',   href: '#' }, { label: 'Press',     href: '#' }, { label: 'Sustainability', href: '#' }],
  Support: [{ label: 'Help Center',  href: '#' }, { label: 'Returns',   href: '#' }, { label: 'Sizing',    href: '#' }, { label: 'Contact',   href: '#' }],
};

export default function Footer() {
  return (
    <footer className="relative border-t" style={{ borderColor: 'rgba(255,255,255,0.07)', background: '#030309' }}>
      {/* Top glow */}
      <div className="absolute inset-x-0 top-0 h-px"
        style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.5), rgba(6,182,212,0.3), transparent)' }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-8">

        {/* Newsletter */}
        <div className="mb-16 p-8 rounded-3xl relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.12) 0%, rgba(6,182,212,0.08) 100%)', border: '1px solid rgba(139,92,246,0.2)' }}>
          {/* BG orbs */}
          <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full opacity-30 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 70%)' }} />

          <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <h3 className="font-display font-bold text-2xl text-lumis-text mb-2">
                The future of fashion, <span className="text-gradient-violet">in your inbox</span>
              </h3>
              <p className="text-lumis-muted text-sm">Early access to drops, AI styling tips, and exclusive offers.</p>
            </div>
            <div className="flex gap-2 w-full md:w-auto">
              <input
                type="email"
                placeholder="your@email.com"
                className="input-lumis flex-1 md:w-64 text-sm"
              />
              <button className="btn-primary flex-shrink-0 flex items-center gap-2 px-5 py-3 text-sm">
                Join <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>

        {/* Main links */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}>
                <Cpu size={18} className="text-white" />
              </div>
              <span className="font-display font-bold text-xl text-lumis-text">
                LUM<span className="text-gradient-violet">IS</span>
              </span>
            </Link>
            <p className="text-lumis-muted text-sm leading-relaxed max-w-xs mb-6">
              The world's first AI-native fashion house. Powered by Claude, designed for the future.
            </p>
            <div className="flex gap-3">
              {[Instagram, Twitter, Youtube].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 rounded-xl flex items-center justify-center text-lumis-dim hover:text-lumis-text transition-all"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="font-semibold text-lumis-text text-sm mb-4 tracking-wider uppercase"
                style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>{section}</h4>
              <ul className="space-y-2.5">
                {items.map(({ label, href }) => (
                  <li key={label}>
                    <Link href={href} className="text-lumis-muted hover:text-lumis-text text-sm transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <p className="text-lumis-dim text-xs">
            © 2026 LUMIS Inc. All rights reserved. AI-powered fashion for the future.
          </p>
          <div className="flex items-center gap-1 text-xs text-lumis-dim">
            <span>Powered by</span>
            <span className="text-lumis-violet-bright font-semibold ml-1">Claude AI</span>
            <span className="mx-2 opacity-40">·</span>
            <Link href="#" className="hover:text-lumis-muted transition-colors">Privacy</Link>
            <span className="mx-2 opacity-40">·</span>
            <Link href="#" className="hover:text-lumis-muted transition-colors">Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
