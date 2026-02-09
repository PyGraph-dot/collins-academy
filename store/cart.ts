import { create } from 'zustand';

export interface Product {
  id: string;
  _id?: string; // <--- MongoDB document ID
  title: string;
  priceNGN: number;
  priceUSD: number;
  image: string;
  // Optional extra fields
  volume?: string;
  color?: string;
}

interface CartItem extends Product {
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  currency: 'NGN' | 'USD';
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  toggleCart: () => void;
  setCurrency: (currency: 'NGN' | 'USD') => void;
  total: () => number;
}

export const useCart = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  currency: 'NGN', // Default to Naira

  addItem: (product) => set((state) => {
    const existing = state.items.find(i => i.id === product.id);
    if (existing) {
      return {
        items: state.items.map(i => 
          i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        ),
        isOpen: true // Auto-open cart when adding
      };
    }
    return { 
      items: [...state.items, { ...product, quantity: 1 }], 
      isOpen: true 
    };
  }),

  removeItem: (id) => set((state) => ({
    // Check against BOTH id and _id to be safe
    items: state.items.filter(i => (i._id || i.id) !== id)
  })),

  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  
  setCurrency: (currency) => set({ currency }),

  total: () => {
    const { items, currency } = get();
    return items.reduce((sum, item) => {
      const price = currency === 'NGN' ? item.priceNGN : item.priceUSD;
      return sum + (price * item.quantity);
    }, 0);
  }
}));