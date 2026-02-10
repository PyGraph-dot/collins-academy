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
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void; // <--- This function is required for Success Page
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
        if (exists) {
            set({ isOpen: true }); // Just open cart if already added
            return; 
        }
        set({ items: [...currentItems, item], isOpen: true });
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i._id !== id) });
      },

      clearCart: () => {
        set({ items: [] });
      },

      toggleCart: () => set({ isOpen: !get().isOpen }),
      
      // <--- Forces the drawer closed (Used in Success Page)
      closeCart: () => set({ isOpen: false }),

      setCurrency: (currency) => set({ currency }),

      total: () => {
        const { items, currency } = get();
        return items.reduce((sum, item) => sum + (currency === 'NGN' ? item.priceNGN : item.priceUSD), 0);
      },
    }),
    {
      name: "cart-storage",
    }
  )
);