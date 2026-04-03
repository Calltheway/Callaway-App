'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Sparkles } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useCartStore } from '@/store/cartStore';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getSubtotal, getTotal } = useCartStore();
  const subtotal = getSubtotal();
  const total    = getTotal();
  const shipping = total - subtotal;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-[60]"
            style={{ background: 'rgba(3,3,9,0.7)', backdropFilter: 'blur(8px)' }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md z-[70] flex flex-col"
            style={{ background: '#0d0d1a', borderLeft: '1px solid rgba(255,255,255,0.07)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-lumis-violet" />
                <h2 className="font-display font-semibold text-lg text-lumis-text">Your Cart</h2>
                {items.length > 0 && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full text-white"
                    style={{ background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)' }}>
                    {items.reduce((s, i) => s + i.quantity, 0)}
                  </span>
                )}
              </div>
              <button onClick={closeCart} className="p-2 rounded-xl text-lumis-muted hover:text-lumis-text hover:bg-lumis-surface transition-all">
                <X size={18} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center gap-6 py-12">
                  <div className="w-20 h-20 rounded-2xl flex items-center justify-center"
                    style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                    <ShoppingBag size={32} className="text-lumis-violet opacity-60" />
                  </div>
                  <div>
                    <p className="text-lumis-text font-semibold text-lg mb-1">Your cart is empty</p>
                    <p className="text-lumis-muted text-sm">Discover your next statement piece</p>
                  </div>
                  <Link href="/shop" onClick={closeCart} className="btn-primary text-sm px-6 py-3 inline-flex items-center gap-2">
                    Explore Shop <ArrowRight size={16} />
                  </Link>
                </div>
              ) : (
                <AnimatePresence initial={false}>
                  {items.map(item => (
                    <motion.div
                      key={`${item.product.id}-${item.size}-${item.color}`}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="flex gap-4 p-3 rounded-2xl"
                      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
                    >
                      {/* Product image */}
                      <div className="relative w-20 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-lumis-card">
                        <Image
                          src={item.product.images[0]}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>

                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${item.product.id}`} onClick={closeCart}>
                          <p className="font-medium text-lumis-text text-sm hover:text-lumis-violet-bright transition-colors line-clamp-2">
                            {item.product.name}
                          </p>
                        </Link>
                        <p className="text-lumis-dim text-xs mt-0.5">{item.product.brand}</p>
                        <div className="flex gap-2 mt-1">
                          <span className="text-xs text-lumis-muted">{item.size}</span>
                          <span className="text-lumis-dim text-xs">·</span>
                          <span className="text-xs text-lumis-muted">{item.color}</span>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <span className="font-semibold text-lumis-text text-sm">
                            ${(item.product.price * item.quantity).toLocaleString()}
                          </span>

                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity - 1)}
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-lumis-muted hover:text-lumis-text hover:bg-lumis-surface transition-all"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-6 text-center text-sm font-medium text-lumis-text">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.size, item.color, item.quantity + 1)}
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-lumis-muted hover:text-lumis-text hover:bg-lumis-surface transition-all"
                            >
                              <Plus size={12} />
                            </button>
                            <button
                              onClick={() => removeItem(item.product.id, item.size, item.color)}
                              className="w-6 h-6 rounded-lg flex items-center justify-center text-lumis-dim hover:text-red-400 hover:bg-red-500/10 transition-all ml-1"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="px-6 py-5 space-y-4" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm text-lumis-muted">
                    <span>Subtotal</span>
                    <span>${subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm text-lumis-muted">
                    <span>Shipping</span>
                    <span>{shipping === 0 ? <span className="text-emerald-400 font-medium">Free</span> : `$${shipping}`}</span>
                  </div>
                  {shipping > 0 && (
                    <p className="text-xs text-lumis-dim">
                      Free shipping on orders over $500
                    </p>
                  )}
                  <div className="flex justify-between font-bold text-lumis-text pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                    <span>Total</span>
                    <span className="text-gradient-violet">${total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Try-on CTA */}
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs"
                  style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <Sparkles size={14} className="text-lumis-violet flex-shrink-0" />
                  <span className="text-lumis-muted">
                    Try your items on with <span className="text-lumis-violet-bright">AI Virtual Try-On</span>
                  </span>
                </div>

                <button className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-4">
                  Checkout · ${total.toLocaleString()} <ArrowRight size={16} />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
