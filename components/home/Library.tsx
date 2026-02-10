"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowRight, Loader2, RotateCcw } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart, CartItem } from "@/store/cart";

// --- 3D BOOK COMPONENT ---
// This component handles the flip logic independently
const Book3D = ({ book, addItem, currency }: { book: any, addItem: any, currency: string }) => {
  return (
    <div className="group relative w-[280px] md:w-[320px] h-[480px] flex-shrink-0 perspective-1000 snap-center cursor-pointer">
      
      {/* INNER CONTAINER (The flipper) */}
      <div className="relative w-full h-full transition-all duration-700 transform-style-3d group-hover:rotate-y-180">
        
        {/* === FRONT FACE (The Cover) === */}
        <div className="absolute inset-0 backface-hidden">
          <div className="relative w-full h-full bg-[#111] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
            {/* Glossy Reflection Overlay */}
            <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent z-20 pointer-events-none" />
            
            {/* Image */}
            {book.image ? (
              <Image
                src={book.image}
                alt={book.title}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-700 bg-[#0a0a0a]">
                <span className="font-serif text-4xl opacity-20">COLLINS</span>
              </div>
            )}

            {/* Title Overlay (Bottom) */}
            <div className="absolute bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black/90 to-transparent z-10">
               <h3 className="text-xl font-serif text-white leading-tight line-clamp-2">{book.title}</h3>
               <p className="text-[#d4af37] text-sm font-bold mt-2">
                 {currency === 'NGN' ? '₦' : '$'}{currency === 'NGN' ? book.priceNGN.toLocaleString() : book.priceUSD}
               </p>
            </div>
            
            {/* Hint Icon */}
            <div className="absolute top-4 right-4 text-white/50 bg-black/50 p-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 md:opacity-100 transition-opacity">
               <RotateCcw size={14} />
            </div>
          </div>
        </div>

        {/* === BACK FACE (The Description & Actions) === */}
        <div className="absolute inset-0 h-full w-full rounded-xl bg-[#0a0a0a] border border-[#d4af37]/30 p-8 text-center flex flex-col items-center justify-center rotate-y-180 backface-hidden shadow-[0_0_30px_rgba(212,175,55,0.1)]">
            
            {/* Decoration */}
            <div className="w-12 h-1 bg-[#d4af37] mb-6 rounded-full" />

            <h4 className="text-lg font-serif text-white mb-4">Synopsis</h4>
            
            {/* Description Text */}
            <p className="text-gray-400 text-sm leading-relaxed mb-8 line-clamp-6">
              {book.description || "Master the art of spoken influence. This resource deconstructs the mechanics of elite articulation, giving you the tools to command any room you enter. A must-read for the modern orator."}
            </p>

            {/* Price again */}
            <div className="text-2xl font-serif text-white mb-8">
               {currency === 'NGN' ? '₦' : '$'}{currency === 'NGN' ? book.priceNGN.toLocaleString() : book.priceUSD}
            </div>

            {/* Action Button */}
            <button 
              onClick={(e) => {
                 e.stopPropagation(); // Prevent flip jitter
                 addItem(book);
              }}
              className="w-full py-4 bg-[#d4af37] text-black font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-[#d4af37]/20"
            >
              <ShoppingBag size={16} />
              Add to Library
            </button>

        </div>
      </div>
    </div>
  );
};


// --- MAIN LIBRARY SECTION ---
export default function Library() {
  const containerRef = useRef(null);
  const { addItem, currency } = useCart();
  const [products, setProducts] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

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

  return (
    <section id="library" ref={containerRef} className="py-24 md:py-32 bg-[#0a0a0a] overflow-hidden relative">
      
      {/* Background Noise Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />

      {/* Header */}
      <div className="container mx-auto px-6 mb-16 flex flex-col md:flex-row items-end justify-between gap-6 relative z-10">
        <div>
          <span className="text-[#d4af37] text-xs font-bold tracking-widest uppercase mb-2 block">The Collection</span>
          <h2 className="text-3xl md:text-5xl font-serif text-white">Essential Reading.</h2>
        </div>
        <Link href="/shop" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
          View all resources <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* SCROLL CONTAINER */}
      <div className="overflow-x-auto md:overflow-visible pb-12 px-6 md:px-0 -mx-6 md:mx-0 scrollbar-hide snap-x snap-mandatory relative z-10">
        
        {loading ? (
           <div className="w-full h-[400px] flex items-center justify-center">
             <Loader2 className="animate-spin text-[#d4af37]" size={40} />
           </div>
        ) : (
          <div className="flex md:grid md:grid-cols-3 gap-8 w-max md:w-full px-6 md:px-0 container mx-auto justify-items-center">
            {products.length === 0 ? (
               <div className="text-gray-500 text-sm italic col-span-3 text-center py-20 w-full border border-dashed border-white/10 rounded-xl">
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
                >
                  {/* RENDER THE 3D BOOK */}
                  <Book3D book={book} addItem={addItem} currency={currency} />
                </motion.div>
              ))
            )}
          </div>
        )}
      </div>
    </section>
  );
}