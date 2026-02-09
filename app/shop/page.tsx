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
    <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-6">
      <div className="container mx-auto">
        
        {/* Header Section */}
        <div className="mb-16 text-center max-w-2xl mx-auto">
          <span className="text-[#d4af37] text-xs font-bold tracking-[0.2em] uppercase mb-4 block">The Archive</span>
          <h1 className="text-4xl md:text-6xl font-serif text-white mb-6">Complete Collection.</h1>
          <p className="text-gray-400 text-sm leading-relaxed">
            Browse our full catalog of articulation guides, vocabulary enhancers, and speech mastery tools.
          </p>
        </div>

        {/* Loading State */}
        {loading ? (
           <div className="flex justify-center py-20">
             <Loader2 className="animate-spin text-[#d4af37]" size={40} />
           </div>
        ) : (
          /* Product Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
                  transition={{ delay: i * 0.1 }}
                  className="group relative bg-[#111] border border-white/5 p-4 rounded-2xl flex flex-col hover:border-[#d4af37]/30 transition-all duration-500 hover:-translate-y-1"
                >
                    {/* Image Frame */}
                    <div className="relative w-full aspect-[4/5] bg-[#0a0a0a] rounded-xl overflow-hidden mb-6 flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-colors">
                      {book.image ? (
                        <Image
                          src={book.image} 
                          alt={book.title}
                          fill
                          className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      ) : (
                        <span className="text-gray-700 text-xs uppercase tracking-widest">No Cover</span>
                      )}
                      
                      {/* Price Tag */}
                      <div className="absolute top-3 right-3 bg-black/80 backdrop-blur-md border border-white/10 px-3 py-1 rounded-full">
                         <span className="text-[#d4af37] font-bold font-mono text-sm">
                           {currency === 'NGN' ? '₦' : '$'}{currency === 'NGN' ? book.priceNGN.toLocaleString() : book.priceUSD}
                         </span>
                      </div>
                    </div>

                    {/* Info */}
                    <div className="flex-1 flex flex-col">
                       <span className="text-[10px] uppercase tracking-widest text-gray-500 mb-2">{(book as any).category || 'Digital'}</span>
                       <h3 className="text-xl font-serif text-white mb-4 line-clamp-2 group-hover:text-[#d4af37] transition-colors">
                         {book.title}
                       </h3>
                       
                       <button 
                          onClick={() => addItem(book)}
                          className="mt-auto w-full py-4 bg-white/5 hover:bg-[#d4af37] hover:text-black transition-all border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 group-hover:border-[#d4af37]"
                       >
                          <ShoppingBag size={16} />
                          Add to Cart
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