"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import Image from "next/image"; // <--- NEW IMPORT
import { useCart, CartItem } from "@/store/cart";

export default function Library() {
  const containerRef = useRef(null);
  const { addItem, currency } = useCart();
  const [products, setProducts] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [flipped, setFlipped] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function fetchProducts() {
      try {
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

  const toggleFlip = (id: string) => {
    setFlipped((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <section id="library" ref={containerRef} className="py-24 md:py-32 bg-[#0a0a0a] overflow-hidden relative">
      {/* Header */}
      <div className="container mx-auto px-6 mb-12 flex flex-col md:flex-row items-end justify-between gap-6">
        <div>
          <span className="text-[#d4af37] text-xs font-bold tracking-widest uppercase mb-2 block">The Collection</span>
          <h2 className="text-3xl md:text-5xl font-serif text-white">Essential Reading.</h2>
        </div>
        <Link href="/shop" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2">
          View all resources <ArrowRight size={14} />
        </Link>
      </div>

      {/* HORIZONTAL SCROLL CONTAINER */}
      <div className="overflow-x-auto md:overflow-visible pb-12 px-6 md:px-0 -mx-6 md:mx-0 scrollbar-hide snap-x snap-mandatory">
        
        {loading ? (
           <div className="w-full h-[400px] flex items-center justify-center">
             <Loader2 className="animate-spin text-[#d4af37]" size={40} />
           </div>
        ) : (
          <div className="flex md:grid md:grid-cols-3 gap-6 md:gap-8 w-max md:w-full px-6 md:px-0 container mx-auto">
            {products.length === 0 ? (
               <div className="text-gray-500 text-sm italic col-span-3 text-center py-20 w-full">
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
                  className="group relative w-[280px] md:w-full flex-shrink-0 snap-center h-[520px]"
                  onMouseEnter={() => toggleFlip(book._id)}
                  onMouseLeave={() => toggleFlip(book._id)}
                  onClick={() => toggleFlip(book._id)}
                >
                  {/* 3D FLIP CONTAINER */}
                  <motion.div
                    animate={{ rotateY: flipped.has(book._id) ? 180 : 0 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 200, damping: 30 }}
                    style={{
                      transformStyle: "preserve-3d",
                      perspective: "1200px",
                    } as React.CSSProperties}
                    className="relative w-full h-full"
                  >
                    {/* FRONT: BOOK COVER */}
                    <motion.div
                      style={{
                        backfaceVisibility: "hidden",
                      } as React.CSSProperties}
                      className="absolute inset-0 bg-[#111] border border-white/5 p-4 rounded-2xl flex flex-col justify-between transition-transform duration-500 hover:border-[#d4af37]/30 group-hover:-translate-y-2"
                    >
                      {/* IMAGE CONTAINER */}
                      <div className="relative w-full h-[320px] bg-[#0a0a0a] rounded-xl overflow-hidden mb-6 flex items-center justify-center border border-white/5 group-hover:border-white/10 transition-colors">
                        {book.image ? (
                          <Image
                            src={book.image}
                            alt={book.title}
                            fill
                            className="object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-gray-700">
                            <span className="font-serif text-4xl opacity-20">{i + 1}</span>
                            <span className="text-[10px] uppercase tracking-widest mt-2 opacity-40">No Cover</span>
                          </div>
                        )}
                        {/* Glossy overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-10" />
                      </div>

                      {/* CONTENT - FRONT */}
                      <div className="flex-1 flex flex-col justify-end">
                        <div className="flex justify-between items-start mb-3">
                          <span className="text-[10px] uppercase tracking-widest text-gray-500">{(book as any).category || 'Book'}</span>
                          <span className="text-[#d4af37] text-lg font-bold font-serif">
                            {currency === 'NGN' ? '₦' : '$'}{currency === 'NGN' ? book.priceNGN.toLocaleString() : book.priceUSD}
                          </span>
                        </div>
                        <h3 className="text-xl font-serif text-white mb-6 line-clamp-2 leading-tight min-h-[3rem]">
                          {book.title}
                        </h3>
                        {/* Flip Hint */}
                        <div className="text-center text-[10px] text-gray-600 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">
                          Click to explore
                        </div>
                      </div>
                    </motion.div>

                    {/* BACK: DESCRIPTION & ACTION */}
                    <motion.div
                      style={{
                        backfaceVisibility: "hidden",
                        rotateY: 180,
                      } as React.CSSProperties}
                      className="absolute inset-0 bg-[#111] border border-white/5 p-6 rounded-2xl flex flex-col justify-between transition-transform duration-500 hover:border-[#d4af37]/30 group-hover:-translate-y-2"
                    >
                      {/* BACK CONTENT */}
                      <div>
                        <h3 className="text-xl font-serif text-[#d4af37] mb-4 leading-tight">
                          {book.title}
                        </h3>
                        <p className="text-sm text-gray-300 leading-relaxed mb-6 line-clamp-6 h-[150px] overflow-y-auto">
                          {(book as any).description || "Elevate your communication skills with this essential guide to mastering the art of articulation."}
                        </p>
                      </div>

                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <span className="text-[10px] uppercase tracking-widest text-gray-500">{(book as any).category || 'Book'}</span>
                          <span className="text-[#d4af37] text-lg font-bold font-serif">
                            {currency === 'NGN' ? '₦' : '$'}{currency === 'NGN' ? book.priceNGN.toLocaleString() : book.priceUSD}
                          </span>
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            addItem(book);
                          }}
                          className="w-full py-4 bg-[#d4af37] hover:bg-white text-black transition-all border border-[#d4af37] rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                        >
                          <ShoppingBag size={16} />
                          Add to Cart
                        </button>
                      </div>
                    </motion.div>
                  </motion.div>
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}