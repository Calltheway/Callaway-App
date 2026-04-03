'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Product } from '@/lib/products';
import { useCartStore } from '@/store/cartStore';

interface Props {
  product: Product;
  index?: number;
}

export default function ProductCard({ product, index = 0 }: Props) {
  const [liked, setLiked]             = useState(false);
  const [imgIndex, setImgIndex]       = useState(0);
  const [selectedSize, setSize]       = useState('');
  const [sizePickerOpen, setSizePicker] = useState(false);
  const { addItem } = useCartStore();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!selectedSize) {
      setSizePicker(true);
      return;
    }
    addItem(product, selectedSize, product.colors[0].name);
    setSizePicker(false);
  };

  const handleSizeSelect = (size: string, e: React.MouseEvent) => {
    e.preventDefault();
    setSize(size);
    addItem(product, size, product.colors[0].name);
    setSizePicker(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="product-card group"
    >
      <Link href={`/product/${product.id}`}>
        <div className="rounded-2xl overflow-hidden" style={{ background: '#111121', border: '1px solid rgba(255,255,255,0.07)' }}>
          {/* Image */}
          <div className="relative aspect-[4/5] overflow-hidden bg-lumis-card">
            <Image
              src={product.images[imgIndex] ?? product.images[0]}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap">
              {product.badges.map(b => (
                <span key={b} className={`badge-${b}`}>{b}</span>
              ))}
            </div>

            {/* Like button */}
            <button
              onClick={e => { e.preventDefault(); setLiked(v => !v); }}
              className="absolute top-3 right-3 w-8 h-8 rounded-xl flex items-center justify-center glass opacity-0 group-hover:opacity-100 transition-all duration-200"
            >
              <Heart size={15} className={liked ? 'fill-red-400 text-red-400' : 'text-lumis-text'} />
            </button>

            {/* Image switcher dots */}
            {product.images.length > 1 && (
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                {product.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={e => { e.preventDefault(); setImgIndex(i); }}
                    className="w-1.5 h-1.5 rounded-full transition-all"
                    style={{ background: i === imgIndex ? '#a78bfa' : 'rgba(255,255,255,0.4)' }}
                  />
                ))}
              </div>
            )}

            {/* Quick actions */}
            <div className="absolute bottom-0 left-0 right-0 p-3 flex gap-2 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button
                onClick={handleAddToCart}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2"
                style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}
              >
                <ShoppingBag size={14} />
                Add to Cart
              </button>
              <Link
                href={`/tryon?product=${product.id}`}
                onClick={e => e.stopPropagation()}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lumis-text glass flex-shrink-0"
                title="Try On"
              >
                <Eye size={16} />
              </Link>
            </div>
          </div>

          {/* Size picker popup */}
          <AnimatePresence>
            {sizePickerOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                className="px-4 py-3 border-t"
                style={{ borderColor: 'rgba(139,92,246,0.3)', background: 'rgba(139,92,246,0.05)' }}
                onClick={e => e.preventDefault()}
              >
                <p className="text-xs text-lumis-muted mb-2 font-medium">Select a size:</p>
                <div className="flex flex-wrap gap-1.5">
                  {product.sizes.map(size => (
                    <button
                      key={size}
                      onClick={e => handleSizeSelect(size, e)}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium text-lumis-muted hover:text-lumis-text transition-all"
                      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Info */}
          <div className="p-4">
            <p className="text-lumis-dim text-xs mb-1 font-medium tracking-wide uppercase" style={{ fontSize: '0.65rem' }}>
              {product.brand}
            </p>
            <h3 className="text-lumis-text font-semibold text-sm leading-snug mb-2 group-hover:text-lumis-violet-bright transition-colors line-clamp-2">
              {product.name}
            </h3>

            {/* Colors */}
            <div className="flex items-center gap-1.5 mb-3">
              {product.colors.map(c => (
                <div
                  key={c.name}
                  title={c.name}
                  className="w-3.5 h-3.5 rounded-full border border-lumis-border"
                  style={{ background: c.hex }}
                />
              ))}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-lumis-text">${product.price.toLocaleString()}</span>
                {product.originalPrice && (
                  <span className="text-lumis-dim text-sm line-through">${product.originalPrice.toLocaleString()}</span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <Star size={11} className="fill-lumis-gold text-lumis-gold" />
                <span className="text-xs text-lumis-muted">{product.rating}</span>
                <span className="text-xs text-lumis-dim">({product.reviews})</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
