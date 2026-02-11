import { create } from "zustand";
import { persist } from "zustand/middleware";
import { CartItemType } from "@/lib/types"; // Import shared type
import { CURRENCIES, CurrencyCode } from "@/lib/constants";

interface CartStore {
  items: CartItemType[];
  currency: CurrencyCode;
  isOpen: boolean;
  addItem: (item: CartItemType) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  toggleCart: () => void;
  closeCart: () => void;
  setCurrency: (currency: CurrencyCode) => void;
  total: () => number;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      currency: CURRENCIES.NGN, // Use constant default
      isOpen: false,

      addItem: (item) => {
        const currentItems = get().items;
        const exists = currentItems.find((i) => i._id === item._id);
        if (exists) {
            set({ isOpen: true }); 
            return; 
        }
        set({ items: [...currentItems, item], isOpen: true });
      },

      removeItem: (id) => {
        set({ items: get().items.filter((i) => i._id !== id) });
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set({ isOpen: !get().isOpen }),
      
      closeCart: () => set({ isOpen: false }),

      setCurrency: (currency) => set({ currency }),

      total: () => {
        const { items, currency } = get();
        // Uses shared logic, no more magic strings
        return items.reduce((sum, item) => sum + (currency === CURRENCIES.NGN ? item.priceNGN : item.priceUSD), 0);
      },
    }),
    {
      name: "cart-storage",
    }
  )
);