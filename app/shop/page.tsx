"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, Loader2 } from "lucide-react";
import Image from "next/image";
import { useCart, CartItem } from "@/store/cart";

export default function ShopPage() {
  const { addItem, currency } = useCart();
  const [products, setProducts] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products", { cache: 'no-store' });
        const data = await res.json();
        if (data && Array.isArray(data)) setProducts(data);
      } catch (error) {
        console.error("Failed to fetch shop", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-4 md:px-6">
      <div className="container mx-auto">
        
        {/* Header Section */}
        <div className="mb-12 text-center max-w-2xl mx-auto">
          <span className="text-[#d4af37] text-[10px] font-bold tracking-[0.2em] uppercase mb-3 block">The Archive</span>
          <h1 className="text-3xl md:text-5xl font-serif text-white mb-4">Complete Collection.</h1>
        </div>

        {/* Loading State */}
        {loading ? (
           <div className="flex justify-center py-20">
             <Loader2 className="animate-spin text-[#d4af37]" size={32} />
           </div>
        ) : (
          /* Product Grid - NOW 2 COLUMNS ON MOBILE */
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
            {products.length === 0 ? (
               <div className="text-gray-500 text-center col-span-full py-20 border border-white/10 rounded-xl">
                 No products found.
               </div>
            ) : (
              products.map((book, i) => (
                <motion.div
                  key={book._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="group relative bg-[#111] border border-white/5 p-3 md:p-4 rounded-xl flex flex-col hover:border-[#d4af37]/30 transition-all duration-500"
                >
                    {/* Image Frame - More Compact */}
                    <div className="relative w-full aspect-[3/4] bg-[#0a0a0a] rounded-lg overflow-hidden mb-3 flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-colors">
                      {book.image ? (
                        <Image
                          src={book.image} 
                          alt={book.title}
                          fill
                          className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        />
                      ) : (
                        <span className="text-gray-700 text-[10px] uppercase tracking-widest">No Cover</span>
                      )}
                      
                      {/* Price Tag - Smaller & Cleaner */}
                      <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-full">
                         <span className="text-[#d4af37] font-bold font-mono text-[10px] md:text-xs">
                           {currency === 'NGN' ? '₦' : '$'}{currency === 'NGN' ? book.priceNGN.toLocaleString() : book.priceUSD}
                         </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col">
                       <span className="text-[9px] md:text-[10px] uppercase tracking-widest text-gray-500 mb-1">{(book as any).category || 'Digital'}</span>
                       <h3 className="text-sm md:text-lg font-serif text-white mb-3 line-clamp-2 leading-tight group-hover:text-[#d4af37] transition-colors min-h-[2.5em]">
                         {book.title}
                       </h3>
                       
                       <button 
                          onClick={() => addItem(book)}
                          className="mt-auto w-full py-2.5 bg-white/5 hover:bg-[#d4af37] hover:text-black transition-all border border-white/10 rounded-md text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-1.5 group-hover:border-[#d4af37]"
                       >
                          <ShoppingBag size={14} />
                          <span className="hidden md:inline">Add to Cart</span>
                          <span className="md:hidden">Add</span>
                       </button>
                    </div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}