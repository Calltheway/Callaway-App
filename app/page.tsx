import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Sparkles, Eye, Shield, Zap, Star, TrendingUp } from 'lucide-react';
import Hero from '@/components/Hero';
import ProductCard from '@/components/ProductCard';
import { getFeaturedProducts, getTrendingProducts } from '@/lib/products';

export const metadata = {
  title: 'LUMIS — AI-Powered Fashion for the Future',
  description: 'Shop the future of fashion with AI-powered styling, virtual try-on, and personalized recommendations powered by Claude.',
};

const whyLumis = [
  {
    icon: Sparkles,
    color: '#8b5cf6',
    title: 'AI Personal Stylist',
    desc: 'ARIA, your Claude-powered fashion assistant, learns your style and suggests outfits curated perfectly for you — 24/7.',
  },
  {
    icon: Eye,
    color: '#06b6d4',
    title: 'Virtual Try-On',
    desc: 'Upload your photo and see yourself in any piece from the collection. AI analyzes fit, color harmony, and overall look.',
  },
  {
    icon: Zap,
    color: '#f59e0b',
    title: 'Instant Curation',
    desc: 'Natural language search powered by AI. Say "oversized black jacket for a night out" and get perfect matches instantly.',
  },
  {
    icon: Shield,
    color: '#10b981',
    title: 'Premium Quality',
    desc: 'Every LUMIS piece is sourced from the world\'s finest mills and ateliers. No compromise, ever.',
  },
];

const testimonials = [
  { name: 'Sophia R.',  role: 'Creative Director',     text: 'ARIA styled me for a major client presentation. The outfit was perfect and I closed the deal. This is next-level.',      avatar: 'SR', rating: 5 },
  { name: 'Marcus J.', role: 'Architect',              text: 'Virtual try-on saved me three returns. I saw exactly how the Obsidian Trench would look on me — incredible technology.',   avatar: 'MJ', rating: 5 },
  { name: 'Aiko T.',   role: 'Fashion Photographer',   text: 'As someone who lives in fashion, I\'m impressed. The AI actually understands style nuance, not just keywords.',           avatar: 'AT', rating: 5 },
];

export default function HomePage() {
  const featured = getFeaturedProducts();
  const trending = getTrendingProducts();

  return (
    <main>
      {/* Hero */}
      <Hero />

      {/* Featured Products */}
      <section className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Star size={14} className="text-lumis-gold" />
              <span className="text-sm font-medium text-lumis-muted uppercase tracking-wider" style={{ fontSize: '0.7rem', letterSpacing: '0.12em' }}>
                Editor's Picks
              </span>
            </div>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-lumis-text">
              Featured <span className="text-gradient-violet">Collection</span>
            </h2>
          </div>
          <Link href="/shop" className="hidden sm:flex btn-ghost items-center gap-2 text-sm px-5 py-2.5">
            View All <ArrowRight size={15} />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {featured.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>

        <div className="sm:hidden mt-6 text-center">
          <Link href="/shop" className="btn-ghost inline-flex items-center gap-2 text-sm px-6 py-3">
            View All <ArrowRight size={15} />
          </Link>
        </div>
      </section>

      {/* AI Try-On Banner */}
      <section className="py-8 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="relative rounded-3xl overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15) 0%, rgba(6,182,212,0.1) 50%, rgba(139,92,246,0.05) 100%)', border: '1px solid rgba(139,92,246,0.25)' }}>

            {/* BG decoration */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -right-32 -top-32 w-96 h-96 rounded-full opacity-20 blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.7) 0%, transparent 70%)' }} />
              <div className="absolute -left-20 -bottom-20 w-64 h-64 rounded-full opacity-15 blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.7) 0%, transparent 70%)' }} />
              <div className="absolute inset-0 bg-grid opacity-20" />
            </div>

            <div className="relative flex flex-col md:flex-row items-center gap-8 px-8 py-10 md:px-12 md:py-14">
              {/* Text */}
              <div className="flex-1 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-4 text-sm"
                  style={{ background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.3)' }}>
                  <Sparkles size={14} className="text-lumis-violet" />
                  <span className="text-lumis-violet-bright font-medium">New: AI Virtual Try-On</span>
                </div>
                <h2 className="font-display font-bold text-3xl md:text-4xl text-lumis-text mb-4">
                  See yourself in{' '}
                  <span className="text-gradient-violet">every piece</span>
                </h2>
                <p className="text-lumis-muted leading-relaxed mb-6 max-w-md">
                  Upload your photo, pick any item from the LUMIS collection, and our Claude AI will give you a detailed style analysis — exactly how it looks on you, styling tips included.
                </p>
                <Link href="/tryon" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4">
                  <Eye size={18} />
                  Try It Now — Free
                </Link>
              </div>

              {/* Visual */}
              <div className="flex-shrink-0 flex gap-3">
                {[
                  'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=180&h=240&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1594938298603-c8148c4b2d5f?w=180&h=240&fit=crop&q=80',
                  'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=180&h=240&fit=crop&q=80',
                ].map((src, i) => (
                  <div
                    key={i}
                    className="relative rounded-2xl overflow-hidden flex-shrink-0 hidden sm:block"
                    style={{
                      width: 120, height: 160,
                      transform: `rotate(${[-3, 0, 3][i]}deg)`,
                      border: '2px solid rgba(255,255,255,0.1)',
                      animation: `float ${6 + i * 1.5}s ease-in-out infinite`,
                    }}
                  >
                    <Image src={src} alt="" fill className="object-cover" sizes="120px" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} className="text-lumis-cyan" />
              <span className="text-sm font-medium text-lumis-muted uppercase tracking-wider" style={{ fontSize: '0.7rem', letterSpacing: '0.12em' }}>
                Right Now
              </span>
            </div>
            <h2 className="font-display font-bold text-3xl md:text-4xl text-lumis-text">
              Trending <span className="text-gradient-violet">This Week</span>
            </h2>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {trending.slice(0, 4).map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      </section>

      {/* Why LUMIS */}
      <section className="py-24 px-4 sm:px-6" style={{ borderTop: '1px solid rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="font-display font-bold text-3xl md:text-4xl text-lumis-text mb-4">
              Why <span className="text-gradient-violet">LUMIS</span>
            </h2>
            <p className="text-lumis-muted text-lg max-w-xl mx-auto">
              We're not just a fashion store. We're the future of how you discover, experience, and wear clothing.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {whyLumis.map(({ icon: Icon, color, title, desc }) => (
              <div
                key={title}
                className="p-6 rounded-3xl transition-all duration-300 hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                  <Icon size={22} style={{ color }} />
                </div>
                <h3 className="font-display font-semibold text-lumis-text mb-2">{title}</h3>
                <p className="text-lumis-muted text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-display font-bold text-3xl md:text-4xl text-lumis-text">
            What Our <span className="text-gradient-violet">Clients Say</span>
          </h2>
        </div>

        <div className="grid sm:grid-cols-3 gap-5">
          {testimonials.map(({ name, role, text, avatar, rating }) => (
            <div
              key={name}
              className="p-6 rounded-3xl"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
            >
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: rating }).map((_, i) => (
                  <Star key={i} size={14} className="fill-lumis-gold text-lumis-gold" />
                ))}
              </div>
              <p className="text-lumis-muted text-sm leading-relaxed mb-6 italic">"{text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm text-white"
                  style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}>
                  {avatar}
                </div>
                <div>
                  <p className="font-semibold text-lumis-text text-sm">{name}</p>
                  <p className="text-lumis-dim text-xs">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="p-10 rounded-3xl relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(6,182,212,0.1))', border: '1px solid rgba(139,92,246,0.25)' }}>
            <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
            <div className="relative">
              <div className="font-display font-bold text-4xl md:text-5xl text-lumis-text mb-4">
                Your next <span className="shimmer-text">favorite outfit</span>
                <br />is waiting.
              </div>
              <p className="text-lumis-muted mb-8 text-lg">Let AI find it for you.</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href="/shop" className="btn-primary inline-flex items-center gap-2 text-base px-8 py-4">
                  Shop Now <ArrowRight size={18} />
                </Link>
                <Link href="/tryon" className="btn-ghost inline-flex items-center gap-2 text-base px-8 py-4">
                  <Eye size={18} />
                  Virtual Try-On
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
