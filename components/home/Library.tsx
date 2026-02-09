"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCart, CartItem } from "@/store/cart";

export default function Library() {
  const containerRef = useRef(null);
  const { addItem, toggleCart, currency } = useCart();
  const [products, setProducts] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data from API
  useEffect(() => {
    async function fetchProducts() {
      try {
        // We keep 'no-store' to fix the caching issue
        const res = await fetch("/api/products", { cache: 'no-store' });
        const data = await res.json();
        
        if (data && Array.isArray(data)) {
          setProducts(data);
        }
      } catch (error) {
        console.error("Failed to fetch products", error);
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

  return (
    <section id="library" ref={containerRef} className="py-24 md:py-32 bg-[#0a0a0a] overflow-hidden relative">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-[#d4af37]/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="container mx-auto px-6 mb-16 flex flex-col md:flex-row items-end justify-between gap-6 relative z-10">
        <div>
          <span className="text-[#d4af37] text-xs font-bold tracking-[0.2em] uppercase mb-4 block">The Collection</span>
          <h2 className="text-4xl md:text-5xl font-serif text-white">Essential Reading.</h2>
        </div>
        <Link href="/shop" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2 border-b border-transparent hover:border-[#d4af37] pb-1">
           View all resources <ArrowRight size={14} />
        </Link>
      </div>

      <div className="overflow-x-auto md:overflow-visible pb-12 px-6 md:px-0 -mx-6 md:mx-0 scrollbar-hide snap-x snap-mandatory container mx-auto relative z-10">
        
        {loading ? (
           <div className="w-full h-[400px] flex items-center justify-center">
             <Loader2 className="animate-spin text-[#d4af37]" size={40} />
           </div>
        ) : (
          <div className="flex md:grid md:grid-cols-3 gap-6 md:gap-8 w-max md:w-full px-6 md:px-0">
            {products.length === 0 ? (
               <div className="text-gray-500 text-sm italic col-span-3 text-center py-20 w-full border border-white/10 rounded-xl bg-[#111]">
                 No books available yet. Check back soon.
               </div>
            ) : (
              products.map((book, i) => (
                <motion.div
                  key={book._id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative w-[300px] md:w-full flex-shrink-0 snap-center h-full"
                >
                  <div className="relative bg-[#111] border border-white/5 p-4 rounded-2xl h-full flex flex-col justify-between transition-all duration-500 hover:-translate-y-2 hover:border-[#d4af37]/30 hover:shadow-2xl hover:shadow-[#d4af37]/5">
                    
                    {/* 1. THE IMAGE FRAME */}
                    <div className="relative w-full aspect-[4/5] bg-[#0a0a0a] rounded-xl overflow-hidden mb-6 flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-colors">
                      
                      {book.image ? (
                        // We use object-cover for full bleed, or object-contain if you want padding
                        <img 
                          src={book.image} 
                          alt={book.title} 
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-700">
                           <span className="font-serif text-4xl opacity-20">{i + 1}</span>
                           <span className="text-[10px] uppercase tracking-widest mt-2 opacity-40">No Cover</span>
                        </div>
                      )}

                      {/* Glossy overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                      
                      {/* Price Badge on Image */}
                      <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full">
                         <span className="text-[#d4af37] font-bold font-mono text-sm">
                           {currency === 'NGN' ? '₦' : '$'}{currency === 'NGN' ? book.priceNGN.toLocaleString() : book.priceUSD}
                         </span>
                      </div>
                    </div>

                    {/* 2. THE CONTENT */}
                    <div className="flex-1 flex flex-col">
                        <div className="mb-4">
                           <span className="text-[10px] uppercase tracking-widest text-gray-500 mb-2 block">{(book as any).category || 'Digital Edition'}</span>
                           <h3 className="text-xl font-serif text-white line-clamp-2 leading-tight group-hover:text-[#d4af37] transition-colors">
                             {book.title}
                           </h3>
                        </div>
                        
                        <button 
                           onClick={() => handleAddToCart(book)}
                           className="mt-auto w-full py-4 bg-white/5 hover:bg-[#d4af37] hover:text-black transition-all border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 group-hover:border-[#d4af37]"
                        >
                           <ShoppingBag size={16} />
                           Add to Cart
                        </button>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}