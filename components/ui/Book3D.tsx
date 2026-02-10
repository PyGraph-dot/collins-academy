"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, RotateCcw } from "lucide-react";
import Image from "next/image";

interface BookProps {
  book: any;
  addItem: (item: any) => void;
  currency: string;
}

export default function Book3D({ book, addItem, currency }: BookProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="group relative w-full h-[520px] flex-shrink-0 perspective-1000 cursor-pointer"
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
          style={{ backfaceVisibility: "hidden" }} 
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
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none z-10" />
            
            <div className="absolute top-2 right-2 p-1 rounded-full bg-black/50 text-white/30">
                <RotateCcw size={12} />
            </div>
          </div>

          {/* CONTENT SECTION */}
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
            transform: "rotateY(180deg)" 
          }} 
        >
            <div className="w-12 h-1 bg-[#d4af37] mb-6 rounded-full" />

            <h4 className="text-lg font-serif text-white mb-4">Synopsis</h4>
            
            <p className="text-gray-400 text-sm leading-relaxed mb-8 line-clamp-[8]">
              {book.description || "Master the art of spoken influence. This resource deconstructs the mechanics of elite articulation, giving you the tools to command any room you enter. A must-read for the modern orator."}
            </p>

            <div className="text-2xl font-serif text-white mb-8">
               {currency === 'NGN' ? '₦' : '$'}{currency === 'NGN' ? book.priceNGN.toLocaleString() : book.priceUSD}
            </div>

            <button 
              onClick={(e) => {
                 e.stopPropagation(); 
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
}