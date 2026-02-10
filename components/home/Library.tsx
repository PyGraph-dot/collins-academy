"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, ArrowRight, Loader2, RotateCcw } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useCart, CartItem } from "@/store/cart";

// --- 3D BOOK COMPONENT ---
const Book3D = ({ book, addItem, currency }: { book: any, addItem: any, currency: string }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="group relative w-[280px] md:w-full h-[520px] flex-shrink-0 perspective-1000 snap-center cursor-pointer"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      {/* FLIP CONTAINER */}
      <motion.div
        className="relative w-full h-full"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        
        {/* === FRONT FACE (Original Design) === */}
        <div 
          className="absolute inset-0 bg-[#111] border border-white/5 p-4 rounded-2xl flex flex-col justify-between backface-hidden"
          style={{ backfaceVisibility: "hidden" }} // Critical for hiding back when facing front
        >
          {/* IMAGE CONTAINER */}
          <div className="relative w-full h-[320px] bg-[#0a0a0a] rounded-xl overflow-hidden mb-6 flex items-center justify-center border border-white/5 transition-colors">
            {book.image ? (
              <Image
                src={book.image} 
                alt={book.title}
                fill 
                className="object-contain p-4"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-gray-700">
                 <span className="font-serif text-4xl opacity-20">COLLINS</span>
                 <span className="text-[10px] uppercase tracking-widest mt-2 opacity-40">No Cover</span>
              </div>
            )}
            {/* Subtle overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-10" />
            
            {/* Visual Hint */}
            <div className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white/30">
                <RotateCcw size={12} />
            </div>
          </div>

          {/* CONTENT SECTION (Title, Price, Button) */}
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
              
              {/* Fake Button */}
              <div className="w-full py-4 bg-white/5 border border-white/10 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 text-gray-400 group-hover:border-[#d4af37] group-hover:text-white transition-colors">
                 Tap to Flip
              </div>
          </div>
        </div>

        {/* === BACK FACE (Synopsis) === */}
        <div 
          className="absolute inset-0 bg-[#111] border border-[#d4af37]/50 p-6 md:p-8 rounded-2xl flex flex-col items-center justify-center text-center backface-hidden shadow-[0_0_30px_rgba(212,175,55,0.15)]"
          style={{ 
            backfaceVisibility: "hidden", 
            transform: "rotateY(180deg)" // Critical: Rotates it so it's ready to be seen when flipped
          }} 
        >
            {/* Decoration */}
            <div className="w-12 h-1 bg-[#d4af37] mb-6 rounded-full" />

            <h4 className="text-lg font-serif text-white mb-4">Synopsis</h4>
            
            {/* Description Text */}
            <p className="text-gray-400 text-sm leading-relaxed mb-8 line-clamp-[8]">
              {book.description || "Master the art of spoken influence. This resource deconstructs the mechanics of elite articulation, giving you the tools to command any room you enter. A must-read for the modern orator."}
            </p>

            {/* Price Repeater */}
            <div className="text-2xl font-serif text-white mb-8">
               {currency === 'NGN' ? '₦' : '$'}{currency === 'NGN' ? book.priceNGN.toLocaleString() : book.priceUSD}
            </div>

            {/* REAL ACTION BUTTON */}
            <button 
              onClick={(e) => {
                 e.stopPropagation(); // Stop flip when clicking button
                 addItem(book);
              }}
              className="w-full py-4 bg-[#d4af37] text-black font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <ShoppingBag size={16} />
              Add to Library
            </button>
        </div>

      </motion.div>
    </div>
  );
};

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
      
      {/* Header */}
      <div className="container mx-auto px-6 mb-12 flex flex-col md:flex-row items-end justify-between gap-6 relative z-10">
        <div>
          <span className="text-[#d4af37] text-xs font-bold tracking-widest uppercase mb-2 block">The Collection</span>
          <h2 className="text-3xl md:text-5xl font-serif text-white">Essential Reading.</h2>
        </div>
        <Link href="/shop" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-2 group">
          View all resources <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* HORIZONTAL SCROLL CONTAINER */}
      <div className="overflow-x-auto md:overflow-visible pb-12 px-6 md:px-0 -mx-6 md:mx-0 scrollbar-hide snap-x snap-mandatory relative z-10">
        
        {loading ? (
           <div className="w-full h-[400px] flex items-center justify-center">
             <Loader2 className="animate-spin text-[#d4af37]" size={40} />
           </div>
        ) : (
          <div className="flex md:grid md:grid-cols-3 gap-6 md:gap-8 w-max md:w-full px-6 md:px-0 container mx-auto">
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