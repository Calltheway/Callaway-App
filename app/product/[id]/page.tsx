'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ShoppingBag, Eye, Star, ArrowLeft, Heart, Share2, Shield, Truck, RotateCcw, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getProductById, products } from '@/lib/products';
import { useCartStore } from '@/store/cartStore';
import ProductCard from '@/components/ProductCard';

interface Props {
  params: { id: string };
}

export default function ProductPage({ params }: Props) {
  const product = getProductById(params.id);
  if (!product) notFound();

  const [selectedColor, setColor]   = useState(product.colors[0]);
  const [selectedSize, setSize]     = useState('');
  const [imgIndex, setImgIndex]     = useState(0);
  const [liked, setLiked]           = useState(false);
  const [detailsOpen, setDetails]   = useState(false);
  const [sizeError, setSizeError]   = useState(false);
  const { addItem } = useCartStore();

  const handleAddToCart = () => {
    if (!selectedSize) { setSizeError(true); return; }
    addItem(product, selectedSize, selectedColor.name);
    setSizeError(false);
  };

  // Related products (same category, different item)
  const related = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <main className="min-h-screen pt-24 pb-20">
      {/* Back */}
      <div className="px-4 sm:px-6 max-w-7xl mx-auto mb-6">
        <Link href="/shop" className="inline-flex items-center gap-2 text-lumis-muted hover:text-lumis-text text-sm transition-colors">
          <ArrowLeft size={16} /> Back to Shop
        </Link>
      </div>

      <div className="px-4 sm:px-6 max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-10 xl:gap-16 mb-20">

          {/* Images */}
          <div className="space-y-3">
            <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-lumis-card">
              <AnimatePresence mode="wait">
                <motion.div
                  key={imgIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="absolute inset-0"
                >
                  <Image
                    src={product.images[imgIndex]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                </motion.div>
              </AnimatePresence>

              {/* Badges */}
              <div className="absolute top-4 left-4 flex gap-2">
                {product.badges.map(b => <span key={b} className={`badge-${b}`}>{b}</span>)}
                {discount && <span className="badge-sale">-{discount}%</span>}
              </div>

              {/* Like */}
              <button
                onClick={() => setLiked(v => !v)}
                className="absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center glass"
              >
                <Heart size={18} className={liked ? 'fill-red-400 text-red-400' : 'text-lumis-text'} />
              </button>
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className="relative rounded-xl overflow-hidden flex-shrink-0 transition-all"
                    style={{
                      width: 72, height: 90,
                      border: `2px solid ${i === imgIndex ? 'rgba(139,92,246,0.8)' : 'rgba(255,255,255,0.1)'}`,
                    }}
                  >
                    <Image src={img} alt="" fill className="object-cover" sizes="72px" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div>
            <p className="text-lumis-dim text-sm font-medium tracking-wide uppercase mb-2" style={{ fontSize: '0.7rem', letterSpacing: '0.1em' }}>
              {product.brand}
            </p>
            <h1 className="font-display font-bold text-3xl md:text-4xl text-lumis-text mb-3 leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} size={14} className={i < Math.round(product.rating) ? 'fill-lumis-gold text-lumis-gold' : 'text-lumis-dim'} />
                ))}
              </div>
              <span className="text-lumis-muted text-sm">{product.rating} · {product.reviews} reviews</span>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display font-bold text-3xl text-lumis-text">${product.price.toLocaleString()}</span>
              {product.originalPrice && (
                <span className="text-lumis-dim text-xl line-through">${product.originalPrice.toLocaleString()}</span>
              )}
              {discount && (
                <span className="badge-sale">Save {discount}%</span>
              )}
            </div>

            <p className="text-lumis-muted leading-relaxed mb-7">{product.description}</p>

            {/* Colors */}
            <div className="mb-5">
              <p className="text-sm font-medium text-lumis-text mb-2.5">
                Color: <span className="text-lumis-muted">{selectedColor.name}</span>
              </p>
              <div className="flex gap-2">
                {product.colors.map(c => (
                  <button
                    key={c.name}
                    onClick={() => setColor(c)}
                    title={c.name}
                    className="w-8 h-8 rounded-full transition-all"
                    style={{
                      background: c.hex,
                      border: `2px solid ${selectedColor.name === c.name ? 'rgba(139,92,246,0.9)' : 'rgba(255,255,255,0.1)'}`,
                      outline: selectedColor.name === c.name ? '2px solid rgba(139,92,246,0.4)' : 'none',
                      outlineOffset: '2px',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Sizes */}
            <div className="mb-7">
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-sm font-medium text-lumis-text">
                  Size: {selectedSize && <span className="text-lumis-violet-bright">{selectedSize}</span>}
                </p>
                <button className="text-xs text-lumis-muted hover:text-lumis-text transition-colors">Size Guide</button>
              </div>
              <div className="flex flex-wrap gap-2">
                {product.sizes.map(size => (
                  <button
                    key={size}
                    onClick={() => { setSize(size); setSizeError(false); }}
                    className="px-3.5 py-2 rounded-xl text-sm font-medium transition-all"
                    style={selectedSize === size
                      ? { background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)', color: 'white', border: '1px solid transparent' }
                      : { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#94a3b8' }
                    }
                  >
                    {size}
                  </button>
                ))}
              </div>
              {sizeError && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-xs mt-2">
                  Please select a size before adding to cart
                </motion.p>
              )}
            </div>

            {/* Actions */}
            <div className="flex gap-3 mb-7">
              <button
                onClick={handleAddToCart}
                className="btn-primary flex-1 flex items-center justify-center gap-2 py-4"
              >
                <ShoppingBag size={18} />
                Add to Cart
              </button>
              <Link
                href={`/tryon?product=${product.id}`}
                className="btn-ghost flex items-center gap-2 px-5 py-4"
              >
                <Eye size={18} />
                <span className="hidden sm:block">Try On</span>
              </Link>
              <button className="w-14 h-14 rounded-xl flex items-center justify-center text-lumis-muted hover:text-lumis-text hover:bg-lumis-surface transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
                <Share2 size={18} />
              </button>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 mb-7">
              {[
                { icon: Truck,    text: 'Free shipping over $500' },
                { icon: RotateCcw, text: 'Free returns, 30 days'  },
                { icon: Shield,   text: 'Authentic guarantee'     },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="text-center p-3 rounded-xl"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <Icon size={16} className="mx-auto mb-1.5 text-lumis-muted" />
                  <p className="text-xs text-lumis-dim leading-tight">{text}</p>
                </div>
              ))}
            </div>

            {/* AI Try-On CTA */}
            <div className="flex items-center gap-3 p-4 rounded-2xl mb-5"
              style={{ background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}>
              <Sparkles size={18} className="text-lumis-violet flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-lumis-text mb-0.5">Not sure if it's right for you?</p>
                <p className="text-xs text-lumis-muted">Use AI Try-On to see how this looks on you</p>
              </div>
              <Link href={`/tryon?product=${product.id}`} className="text-xs font-semibold text-lumis-violet-bright hover:underline whitespace-nowrap">
                Try it →
              </Link>
            </div>

            {/* Details accordion */}
            <button
              onClick={() => setDetails(v => !v)}
              className="w-full flex items-center justify-between py-4 text-left"
              style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
            >
              <span className="font-medium text-lumis-text text-sm">Product Details & Care</span>
              {detailsOpen ? <ChevronUp size={16} className="text-lumis-muted" /> : <ChevronDown size={16} className="text-lumis-muted" />}
            </button>
            <AnimatePresence>
              {detailsOpen && (
                <motion.ul
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden space-y-2 pb-4"
                >
                  {product.details.map(d => (
                    <li key={d} className="flex items-start gap-2.5 text-sm text-lumis-muted">
                      <span className="w-1.5 h-1.5 rounded-full bg-lumis-violet flex-shrink-0 mt-1.5" />
                      {d}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section>
            <h2 className="font-display font-bold text-2xl text-lumis-text mb-7">
              You May Also <span className="text-gradient-violet">Like</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {related.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} />
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
