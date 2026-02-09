"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, ArrowRight, Loader2, Star } from "lucide-react";
import Link from "next/link";
import { useCart, CartItem } from "@/store/cart";

export default function Library() {
  const { addItem, toggleCart, currency } = useCart();
  const [products, setProducts] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch('/api/products', { cache: 'no-store' });
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error("Failed to load library", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  const handleAddToCart = (product: CartItem) => {
    addItem(product);
    toggleCart();
  };

  if (loading) {
    return (
      <section className="py-32 bg-[#0a0a0a] flex justify-center">
        <Loader2 className="animate-spin text-[#d4af37]" size={40} />
      </section>
    );
  }

  return (
    <section className="py-32 px-6 bg-[#0a0a0a] relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#d4af37]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-16 flex justify-between items-end">
          <div>
            <span className="text-[#d4af37] text-sm tracking-[0.2em] uppercase font-bold mb-4 block">The Collection</span>
            <h2 className="text-4xl md:text-6xl font-serif text-white leading-tight">
              Essential <span className="italic text-gray-400">Reading.</span>
            </h2>
          </div>
          <Link href="/shop" className="hidden md:flex text-white hover:text-[#d4af37] transition-colors uppercase tracking-widest text-xs border-b border-transparent hover:border-[#d4af37] pb-1 items-center gap-2">
             View all <ArrowRight size={14} />
          </Link>
        </div>

        {/* Product Grid */}
        {products.length === 0 ? (
          <div className="text-center text-gray-500 py-20 border border-white/10 rounded-xl bg-[#111]">
            <p>No books found. Please check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((book) => (
              <div 
                key={book._id} 
                className="group relative bg-[#111] border border-white/10 rounded-xl overflow-hidden hover:border-[#d4af37]/50 transition-all duration-500 hover:shadow-2xl hover:shadow-[#d4af37]/10 flex flex-col h-full"
              >
                {/* Image Area - Fixed Aspect Ratio */}
                <div className="aspect-square relative overflow-hidden bg-gray-900 border-b border-white/5">
                  {book.image ? (
                    <img 
                      src={book.image} 
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700">No Cover</div>
                  )}

                  {/* Dark Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#111] via-transparent to-transparent opacity-60" />

                  {/* Top Badge */}
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#d4af37] text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-lg">
                      <Star size={10} fill="black" /> Vol. 1
                    </span>
                  </div>
                </div>

                {/* Content Area - Flex Grow to push button down */}
                <div className="p-6 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl text-white font-serif leading-snug group-hover:text-[#d4af37] transition-colors line-clamp-1">
                      {book.title}
                    </h3>
                    <p className="text-[#d4af37] font-bold text-lg font-mono whitespace-nowrap ml-4">
                      {currency === 'NGN' ? '₦' : '$'}{currency === 'NGN' ? book.priceNGN.toLocaleString() : book.priceUSD}
                    </p>
                  </div>

                  {/* Description - Strictly limited to 2 lines */}
                  <p className="text-gray-400 text-sm line-clamp-2 mb-6 leading-relaxed">
                    {(book as any).description || "Master the art of English syntax with this comprehensive guide."}
                  </p>

                  {/* Button - Pushed to bottom with mt-auto */}
                  <button 
                    onClick={() => handleAddToCart(book)}
                    className="mt-auto w-full bg-white/5 hover:bg-[#d4af37] text-white hover:text-black border border-white/10 hover:border-[#d4af37] py-3 rounded-lg font-bold uppercase tracking-wider text-xs transition-all duration-300 flex items-center justify-center gap-2"
                  >
                    <ShoppingBag size={16} /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}