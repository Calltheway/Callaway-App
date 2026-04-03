import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product } from '@/lib/products';

export interface CartItem {
  product: Product;
  size: string;
  color: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (product: Product, size: string, color: string) => void;
  removeItem: (productId: string, size: string, color: string) => void;
  updateQuantity: (productId: string, size: string, color: string, qty: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;

  // Computed helpers
  getItemCount: () => number;
  getTotal: () => number;
  getSubtotal: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (product, size, color) => {
        set(state => {
          const existing = state.items.find(
            i => i.product.id === product.id && i.size === size && i.color === color
          );
          if (existing) {
            return {
              items: state.items.map(i =>
                i.product.id === product.id && i.size === size && i.color === color
                  ? { ...i, quantity: i.quantity + 1 }
                  : i
              ),
              isOpen: true,
            };
          }
          return { items: [...state.items, { product, size, color, quantity: 1 }], isOpen: true };
        });
      },

      removeItem: (productId, size, color) => {
        set(state => ({
          items: state.items.filter(
            i => !(i.product.id === productId && i.size === size && i.color === color)
          ),
        }));
      },

      updateQuantity: (productId, size, color, qty) => {
        if (qty < 1) {
          get().removeItem(productId, size, color);
          return;
        }
        set(state => ({
          items: state.items.map(i =>
            i.product.id === productId && i.size === size && i.color === color
              ? { ...i, quantity: qty }
              : i
          ),
        }));
      },

      clearCart: () => set({ items: [] }),
      openCart: ()   => set({ isOpen: true }),
      closeCart: ()  => set({ isOpen: false }),
      toggleCart: () => set(state => ({ isOpen: !state.isOpen })),

      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getSubtotal:  () => get().items.reduce((sum, i) => sum + i.product.price * i.quantity, 0),
      getTotal: () => {
        const subtotal = get().getSubtotal();
        const shipping = subtotal > 500 ? 0 : 25;
        return subtotal + shipping;
      },
    }),
    { name: 'lumis-cart' }
  )
);
