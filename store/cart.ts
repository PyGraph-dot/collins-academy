import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CartItem {
  _id: string; // MongoDB ID
  title: string;
  priceNGN: number;
  priceUSD: number;
  image: string;
  fileUrl?: string; // The PDF link
}

interface CartStore {
  items: CartItem[];
  currency: 'NGN' | 'USD';
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  clearCart: () => void; // <--- WE ADDED THIS LINE (The missing Type)
  toggleCart: () => void;
  setCurrency: (currency: 'NGN' | 'USD') => void;
  total: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      currency: 'NGN',
      isOpen: false,

      addItem: (item) => {
        const currentItems = get().items;
        const exists = currentItems.find((i) => i._id === item._id);
        if (exists) return; // Don't add duplicates
        set({ items: [...currentItems, item], isOpen: true });
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i._id !== id) });
      },

      // <--- WE ADDED THIS FUNCTION
      clearCart: () => {
        set({ items: [] });
      },

      toggleCart: () => set({ isOpen: !get().isOpen }),

      setCurrency: (currency) => set({ currency }),

      total: () => {
        const { items, currency } = get();
        return items.reduce((sum, item) => sum + (currency === 'NGN' ? item.priceNGN : item.priceUSD), 0);
      },
    }),
    {
      name: "cart-storage", // Save to localStorage so cart survives refresh
    }
  )
);