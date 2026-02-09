"use client";
import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import { useCart, Product } from "@/store/cart";

export default function Library() {
  const containerRef = useRef(null);
  const { addItem, currency } = useCart();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch Data from API
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products");
        const data = await res.json();
        
        // Only set products if we actually got data back
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

  return (
    <section id="library" ref={containerRef} className="py-24 md:py-32 bg-[#0a0a0a] overflow-hidden relative">
      <div className="container mx-auto px-6 mb-12 flex flex-col md:flex-row items-end justify-between gap-6">
        <div>
          <span className="text-[#d4af37] text-xs font-bold tracking-widest uppercase mb-2 block">The Collection</span>
          <h2 className="text-3xl md:text-5xl font-serif text-white">Essential Reading.</h2>
        </div>
        <button className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
          View all resources <ArrowRight size={14} />
        </button>
      </div>

      <div className="overflow-x-auto md:overflow-visible pb-12 px-6 md:px-0 -mx-6 md:mx-0 scrollbar-hide snap-x snap-mandatory">
        
        {loading ? (
           <div className="w-full h-[400px] flex items-center justify-center">
             <Loader2 className="animate-spin text-[#d4af37]" size={40} />
           </div>
        ) : (
          <div className="flex md:grid md:grid-cols-3 gap-6 md:gap-8 w-max md:w-full px-6 md:px-0">
            {products.length === 0 ? (
               <div className="text-gray-500 text-sm italic col-span-3 text-center py-20">
                 No books available yet. Check back soon.
               </div>
            ) : (
              products.map((book, i) => (
                <motion.div
                  key={book._id || book.id}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="group relative w-[280px] md:w-[320px] flex-shrink-0 snap-center"
                >
                  <div className="relative bg-[#111] border border-white/5 p-4 rounded-2xl h-[520px] flex flex-col justify-between transition-transform duration-500 hover:-translate-y-2 hover:border-[#d4af37]/30">
                    
                    {/* 1. THE STANDARD FRAME (Fixed Height + Center Content) */}
                    <div className="relative w-full h-[320px] bg-[#0a0a0a] rounded-xl overflow-hidden mb-6 flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-colors">
                      
                      {book.image ? (
                        // The Image sits INSIDE the frame, never stretching
                        <img 
                          src={book.image} 
                          alt={book.title} 
                          className="w-full h-full object-contain p-2 shadow-2xl transition-transform duration-500 group-hover:scale-105"
                        />
                      ) : (
                        // Fallback for missing images
                        <div className="w-full h-full flex flex-col items-center justify-center text-gray-700">
                           <span className="font-serif text-4xl opacity-20">{i + 1}</span>
                           <span className="text-[10px] uppercase tracking-widest mt-2 opacity-40">No Cover</span>
                        </div>
                      )}

                      {/* Glossy overlay for premium feel */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
                    </div>

                    {/* 2. THE CONTENT (Always aligned) */}
                    <div className="flex-1 flex flex-col justify-end">
                       <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] uppercase tracking-widest text-gray-500">{book.category || 'Book'}</span>
                          <span className="text-[#d4af37] text-lg font-bold font-serif">
                            {currency === 'NGN' ? '₦' : '$'}{currency === 'NGN' ? book.priceNGN.toLocaleString() : book.priceUSD}
                          </span>
                       </div>
                       
                       <h3 className="text-xl font-serif text-white mb-6 line-clamp-2 min-h-[3.5rem] leading-tight">
                         {book.title}
                       </h3>
                       
                       <button 
                          onClick={() => addItem(book)}
                          className="w-full py-4 bg-white/5 hover:bg-[#d4af37] hover:text-black transition-all border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 group-hover:border-[#d4af37]"
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