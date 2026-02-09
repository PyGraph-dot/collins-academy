"use client";

import { useEffect, useState } from "react";
import { ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCart, CartItem } from "@/store/cart";

export default function Library() {
  const { addItem, toggleCart, currency } = useCart();
  const [products, setProducts] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        // We add 'no-store' to ensure we always get fresh data
        const res = await fetch('/api/products', { cache: 'no-store' });
        const data = await res.json();
        console.log("Books loaded:", data); // Check your browser console!
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
        <div className="mb-20">
          <span className="text-[#d4af37] text-sm tracking-[0.2em] uppercase font-bold mb-4 block">The Collection</span>
          <h2 className="text-4xl md:text-6xl font-serif text-white leading-tight">
            Essential <span className="italic text-gray-400">Reading.</span>
          </h2>
          {/* DEBUG TEXT: If this shows 0, the fetch failed. If it shows 1, the book is there. */}
          <p className="text-gray-600 text-xs mt-4">Loaded {products.length} Items</p>
        </div>

        {products.length === 0 ? (
          <div className="text-center text-gray-500 py-20 border border-white/10 rounded-xl">
            <p>No books found in database.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
            {products.map((book) => (
              <div key={book._id} className="group cursor-pointer">
                {/* Book Cover */}
                <div className="relative aspect-[3/4] bg-[#111] mb-8 overflow-hidden rounded-sm border border-white/5 group-hover:border-[#d4af37]/30 transition-colors duration-500">
                  {book.image ? (
                    <img 
                      src={book.image} 
                      alt={book.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-700">Cover Image</div>
                  )}
                  
                  {/* Overlay Button */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-[2px]">
                    <button 
                      onClick={() => handleAddToCart(book)}
                      className="bg-white text-black px-8 py-3 rounded-full font-bold uppercase tracking-wider text-xs hover:bg-[#d4af37] transition-colors flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 duration-300"
                    >
                      <ShoppingBag size={14} /> Add to Cart
                    </button>
                  </div>
                </div>

                {/* Book Info */}
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <h3 className="text-xl text-white font-serif mb-2 leading-snug group-hover:text-[#d4af37] transition-colors">
                      {book.title}
                    </h3>
                    <p className="text-gray-500 text-sm line-clamp-2 leading-relaxed">
                      {/* FIX: Handle description safely */}
                      {(book as any).description || "A comprehensive guide to mastering English grammar."}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="block text-[#d4af37] font-bold text-lg">
                      {currency === 'NGN' ? '₦' : '$'}{currency === 'NGN' ? book.priceNGN.toLocaleString() : book.priceUSD}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-20 text-center">
          <Link href="/shop" className="text-white hover:text-[#d4af37] transition-colors uppercase tracking-widest text-xs border-b border-transparent hover:border-[#d4af37] pb-1 inline-flex items-center gap-2">
            View all resources <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </section>
  );
}