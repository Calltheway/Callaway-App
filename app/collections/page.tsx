import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';

export const metadata = {
  title: 'Collections — LUMIS',
  description: 'Explore our curated fashion collections.',
};

const collections = [
  {
    id: 'luxury',
    name: 'Luxury Atelier',
    desc: 'Handcrafted pieces from the world\'s finest ateliers. For those who understand that true luxury is in the details.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=600&fit=crop&q=80',
    count: 3,
    gradient: 'from-yellow-900/40 to-amber-900/20',
  },
  {
    id: 'streetwear',
    name: 'Street Code',
    desc: 'Urban aesthetics meet premium construction. Wear the future of the city.',
    image: 'https://images.unsplash.com/photo-1523398519-b2fd34dc2f38?w=800&h=600&fit=crop&q=80',
    count: 3,
    gradient: 'from-violet-900/40 to-indigo-900/20',
  },
  {
    id: 'outerwear',
    name: 'The Outer Layer',
    desc: 'When the first thing the world sees sets the tone. Coats and jackets engineered for impact.',
    image: 'https://images.unsplash.com/photo-1539109136-081f16c6e26c?w=800&h=600&fit=crop&q=80',
    count: 2,
    gradient: 'from-slate-900/60 to-gray-900/30',
  },
  {
    id: 'mens',
    name: "Men's Essentials",
    desc: 'Refined basics that do the heavy lifting. Every man\'s wardrobe, elevated.',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&h=600&fit=crop&q=80',
    count: 3,
    gradient: 'from-blue-900/40 to-cyan-900/20',
  },
  {
    id: 'womens',
    name: "Women's Edit",
    desc: 'Feminine power in every stitch. Versatile pieces that move with you.',
    image: 'https://images.unsplash.com/photo-1568252154048-4a1aa9f6c745?w=800&h=600&fit=crop&q=80',
    count: 3,
    gradient: 'from-rose-900/40 to-pink-900/20',
  },
  {
    id: 'accessories',
    name: 'The Finishing Touch',
    desc: 'Accessories that turn an outfit into a statement.',
    image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?w=800&h=600&fit=crop&q=80',
    count: 3,
    gradient: 'from-teal-900/40 to-emerald-900/20',
  },
];

export default function CollectionsPage() {
  return (
    <main className="min-h-screen pt-28 pb-20 px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-12 text-center">
          <h1 className="font-display font-bold text-4xl md:text-5xl text-lumis-text mb-4">
            Our <span className="text-gradient-violet">Collections</span>
          </h1>
          <p className="text-lumis-muted text-lg max-w-xl mx-auto">
            Carefully curated worlds of style, each with its own story to tell.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {collections.map(col => (
            <Link
              key={col.id}
              href={`/shop?cat=${col.id}`}
              className="group relative rounded-3xl overflow-hidden aspect-[4/3] block hover:scale-[1.02] transition-transform duration-300"
            >
              <Image src={col.image} alt={col.name} fill className="object-cover transition-transform duration-700 group-hover:scale-110" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
              <div className={`absolute inset-0 bg-gradient-to-t ${col.gradient} to-transparent`} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6">
                <p className="text-white/60 text-xs font-medium uppercase tracking-widest mb-1">{col.count} Pieces</p>
                <h2 className="font-display font-bold text-white text-xl mb-1">{col.name}</h2>
                <p className="text-white/70 text-sm leading-relaxed line-clamp-2">{col.desc}</p>
                <div className="flex items-center gap-1 mt-3 text-white/80 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                  <span>Explore</span>
                  <ArrowRight size={14} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
