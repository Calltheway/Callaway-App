'use client';

import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ProductCard from './ProductCard';
import { products, categories, getProductsByCategory, type Category } from '@/lib/products';

interface Props {
  initialQuery?: string;
  initialCategory?: Category;
}

const sortOptions = [
  { value: 'featured',  label: 'Featured'    },
  { value: 'price-asc', label: 'Price: Low → High' },
  { value: 'price-desc',label: 'Price: High → Low' },
  { value: 'rating',    label: 'Highest Rated' },
  { value: 'newest',    label: 'Newest'       },
];

export default function ProductGrid({ initialQuery = '', initialCategory = 'all' }: Props) {
  const [query, setQuery]        = useState(initialQuery);
  const [category, setCategory]  = useState<Category>(initialCategory);
  const [sort, setSort]          = useState('featured');
  const [filtersOpen, setFilters]= useState(false);
  const [maxPrice, setMaxPrice]  = useState(2000);

  const filtered = useMemo(() => {
    let list = getProductsByCategory(category);

    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.aiTags.some(t => t.includes(q))
      );
    }

    list = list.filter(p => p.price <= maxPrice);

    switch (sort) {
      case 'price-asc':  return [...list].sort((a, b) => a.price - b.price);
      case 'price-desc': return [...list].sort((a, b) => b.price - a.price);
      case 'rating':     return [...list].sort((a, b) => b.rating - a.rating);
      case 'newest':     return [...list].filter(p => p.badges.includes('new')).concat(list.filter(p => !p.badges.includes('new')));
      default:           return [...list].sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
    }
  }, [query, category, sort, maxPrice]);

  return (
    <div className="space-y-6">
      {/* Search + Sort bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-lumis-dim" size={16} />
          <input
            type="text"
            placeholder="Search for items, styles, or occasions…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="input-lumis pl-10 text-sm"
          />
          {query && (
            <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-lumis-dim hover:text-lumis-muted">
              <X size={14} />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="input-lumis text-sm px-3 py-2.5 cursor-pointer"
            style={{ width: 'auto' }}
          >
            {sortOptions.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>

          <button
            onClick={() => setFilters(v => !v)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
              filtersOpen ? 'text-lumis-violet-bright' : 'text-lumis-muted hover:text-lumis-text'
            }`}
            style={{ background: filtersOpen ? 'rgba(139,92,246,0.15)' : 'rgba(255,255,255,0.05)', border: `1px solid ${filtersOpen ? 'rgba(139,92,246,0.4)' : 'rgba(255,255,255,0.1)'}` }}
          >
            <SlidersHorizontal size={15} />
            Filters
          </button>
        </div>
      </div>

      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setCategory(cat.id)}
            className="flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200"
            style={category === cat.id
              ? { background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', color: 'white' }
              : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }
            }
          >
            {cat.label}
            <span className="ml-1.5 text-xs opacity-60">({cat.count})</span>
          </button>
        ))}
      </div>

      {/* Advanced filters panel */}
      <AnimatePresence>
        {filtersOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 rounded-2xl space-y-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-lumis-text">Max Price</span>
                  <span className="text-sm font-bold text-lumis-violet-bright">${maxPrice.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min={50} max={2000} step={50}
                  value={maxPrice}
                  onChange={e => setMaxPrice(+e.target.value)}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{ accentColor: '#8b5cf6', background: `linear-gradient(to right, #8b5cf6 ${((maxPrice - 50) / 1950) * 100}%, rgba(255,255,255,0.1) 0%)` }}
                />
                <div className="flex justify-between text-xs text-lumis-dim mt-1">
                  <span>$50</span><span>$2,000</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-lumis-muted text-sm">
          <span className="text-lumis-text font-semibold">{filtered.length}</span> items found
          {query && <span> for "<span className="text-lumis-violet-bright">{query}</span>"</span>}
        </p>
        {(query || category !== 'all' || maxPrice < 2000) && (
          <button
            onClick={() => { setQuery(''); setCategory('all'); setMaxPrice(2000); }}
            className="text-xs text-lumis-dim hover:text-lumis-muted flex items-center gap-1 transition-colors"
          >
            <X size={12} /> Clear filters
          </button>
        )}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="py-20 text-center">
          <div className="text-5xl mb-4">🔍</div>
          <p className="text-lumis-text font-semibold text-lg mb-2">No items found</p>
          <p className="text-lumis-muted text-sm mb-6">Try adjusting your search or filters</p>
          <button onClick={() => { setQuery(''); setCategory('all'); setMaxPrice(2000); }} className="btn-ghost text-sm px-6 py-3">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-5">
          {filtered.map((product, i) => (
            <ProductCard key={product.id} product={product} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
