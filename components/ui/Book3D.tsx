"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ShoppingBag, RotateCcw } from "lucide-react";
import Image from "next/image";
// Expert: We import the shared types to ensure type safety across the app
import { ProductType, CartItemType } from "@/lib/types"; 

interface BookProps {
  // Flexibility: Accepts a full Product (from Shop) or a partial Item (from Cart)
  book: ProductType | CartItemType;
  addItem: (item: any) => void;
  currency: string;
}

export default function Book3D({ book, addItem, currency }: BookProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="group relative w-full h-[360px] md:h-[520px] flex-shrink-0 perspective-1000 cursor-pointer"
      onMouseEnter={() => setIsFlipped(true)}
      onMouseLeave={() => setIsFlipped(false)}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <motion.div
        className="relative w-full h-full"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* === FRONT FACE === */}
        <div 
          className="absolute inset-0 bg-card border border-border p-3 md:p-4 rounded-xl md:rounded-2xl flex flex-col justify-between backface-hidden shadow-sm transition-colors"
          style={{ backfaceVisibility: "hidden" }} 
        >
          <div className="relative w-full h-[180px] md:h-[320px] bg-background/50 dark:bg-black/40 rounded-lg md:rounded-xl overflow-hidden mb-3 md:mb-6 flex items-center justify-center border border-border transition-colors">
            {book.image ? (
              <Image 
                src={book.image} 
                alt={book.title} 
                fill 
                className="object-contain p-2 md:p-4" 
                sizes="(max-width: 768px) 50vw, 33vw" 
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground">
                 <span className="font-serif text-2xl md:text-4xl opacity-20">COLLINS</span>
                 <span className="text-[8px] uppercase tracking-widest mt-2 opacity-40">No Cover</span>
              </div>
            )}
            
            <div className="absolute top-2 right-2 p-1 rounded-full bg-black/10 dark:bg-black/50 text-foreground/50 dark:text-white/30">
                <RotateCcw size={10} className="md:w-3 md:h-3" />
            </div>
          </div>

          <div className="flex-1 flex flex-col justify-end">
              <div className="flex justify-between items-start mb-2 md:mb-3">
                 <span className="text-[8px] md:text-[10px] uppercase tracking-widest text-muted-foreground truncate max-w-[60%]">
                   {(book as any).category || 'Book'}
                 </span>
                 <span className="text-gold text-sm md:text-lg font-bold font-serif">
                   {currency === 'NGN' ? '₦' : '$'}{currency === 'NGN' ? book.priceNGN.toLocaleString() : book.priceUSD}
                 </span>
              </div>
              
              <h3 className="text-sm md:text-xl font-serif text-card-foreground mb-3 md:mb-6 line-clamp-2 leading-tight min-h-[2.5rem] md:min-h-[3rem]">
                {book.title}
              </h3>
              
              <div className="w-full py-2 md:py-4 bg-background/50 border border-border rounded md:rounded-lg text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 text-muted-foreground group-hover:border-gold group-hover:text-card-foreground transition-colors">
                 Tap to Flip
              </div>
          </div>
        </div>

        {/* === BACK FACE === */}
        <div 
          className="absolute inset-0 bg-card border border-gold/50 p-4 md:p-8 rounded-xl md:rounded-2xl flex flex-col items-center justify-center text-center backface-hidden shadow-[0_0_30px_rgba(212,175,55,0.15)]"
          style={{ 
            backfaceVisibility: "hidden", 
            transform: "rotateY(180deg)" 
          }} 
        >
            <div className="w-8 md:w-12 h-1 bg-gold mb-4 md:mb-6 rounded-full" />

            <h4 className="text-sm md:text-lg font-serif text-card-foreground mb-2 md:mb-4">Synopsis</h4>
            
            <p className="text-muted-foreground text-xs md:text-sm leading-relaxed mb-4 md:mb-8 line-clamp-6 md:line-clamp-[8]">
              {(book as any).description || "Master the art of spoken influence. This resource deconstructs the mechanics of elite articulation."}
            </p>

            <div className="text-lg md:text-2xl font-serif text-card-foreground mb-4 md:mb-8">
               {currency === 'NGN' ? '₦' : '$'}{currency === 'NGN' ? book.priceNGN.toLocaleString() : book.priceUSD}
            </div>

            <button 
              onClick={(e) => {
                 e.stopPropagation(); 
                 addItem(book);
              }}
              className="w-full py-3 md:py-4 bg-gold text-black font-bold uppercase tracking-widest text-[10px] md:text-xs rounded md:rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-lg"
            >
              <ShoppingBag size={14} className="md:w-4 md:h-4" />
              Add
            </button>
        </div>
      </motion.div>
    </div>
  );
}