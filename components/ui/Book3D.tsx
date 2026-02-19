"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, RotateCcw, Play, Headphones, BookOpen, Film, X } from "lucide-react";
import Image from "next/image";
import { ProductType, CartItemType } from "@/lib/types"; 

interface BookProps {
  book: ProductType | CartItemType;
  addItem: (item: any) => void;
  currency: string;
}

export default function Book3D({ book, addItem, currency }: BookProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false); 
  
  const type = (book as any).productType || 'ebook';
  const preview = (book as any).previewUrl;

  return (
    <>
      <div 
        className="group relative w-full h-[320px] md:h-[500px] flex-shrink-0 perspective-1000 cursor-pointer"
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
          <div className="absolute inset-0 bg-card border border-border p-2.5 md:p-4 rounded-xl md:rounded-2xl flex flex-col justify-between backface-hidden shadow-sm transition-colors" style={{ backfaceVisibility: "hidden" }}>
            
            <div className="relative w-full h-[150px] md:h-[300px] bg-black/5 dark:bg-black/40 rounded-lg md:rounded-xl overflow-hidden mb-2 md:mb-6 border border-border flex items-center justify-center">
              {type === 'video' ? (
                  <div className="absolute inset-0 w-full h-full group-hover:scale-105 transition-transform duration-700">
                      {book.image && <Image src={book.image} alt={book.title} fill className="object-cover opacity-80" />}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-10 h-10 md:w-16 md:h-16 bg-gold text-black rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.4)] backdrop-blur-md">
                              <Play fill="black" size={18} className="md:w-6 md:h-6 ml-1" />
                          </div>
                      </div>
                  </div>
              ) : type === 'audio' ? (
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black group-hover:scale-105 transition-transform duration-700">
                      {book.image && <Image src={book.image} alt={book.title} fill className="object-cover opacity-50 blur-sm" />}
                      <div className="relative w-20 h-20 md:w-32 md:h-32 rounded-full border-2 md:border-4 border-gold shadow-2xl overflow-hidden animate-[spin_20s_linear_infinite]">
                          {book.image && <Image src={book.image} alt="vinyl" fill className="object-cover" />}
                      </div>
                  </div>
              ) : (
                  book.image ? (
                    <Image src={book.image} alt={book.title} fill className="object-contain p-2 md:p-4 group-hover:scale-105 transition-transform duration-500" />
                  ) : <span className="font-serif text-lg md:text-2xl opacity-20">COLLINS</span>
              )}

              {/* MOBILE SCALED BADGES */}
              <div className="absolute top-2 left-2 md:top-3 md:left-3 px-1.5 py-1 md:px-2 md:py-1.5 rounded bg-background/90 backdrop-blur-md border border-border text-[8px] md:text-[10px] uppercase font-bold tracking-widest flex items-center gap-1 shadow-sm">
                  {type === 'video' && <><Film size={10} className="md:w-3 md:h-3 text-purple-500"/> VIDEO</>}
                  {type === 'audio' && <><Headphones size={10} className="md:w-3 md:h-3 text-blue-500"/> AUDIO</>}
                  {type === 'ebook' && <><BookOpen size={10} className="md:w-3 md:h-3 text-yellow-500"/> PDF</>}
              </div>
              <div className="absolute top-2 right-2 md:top-3 md:right-3 p-1 rounded-full bg-black/50 text-white/50"><RotateCcw size={10} className="md:w-3 md:h-3" /></div>
            </div>

            <div className="flex-1 flex flex-col justify-end">
                <div className="flex justify-between items-start mb-1 md:mb-2">
                   <span className="text-[8px] md:text-[10px] uppercase tracking-widest text-muted-foreground truncate max-w-[60%]">{(book as any).category || 'Premium Asset'}</span>
                   <span className="text-gold text-xs md:text-lg font-bold font-serif">{currency === 'NGN' ? '₦' : '$'}{currency === 'NGN' ? book.priceNGN.toLocaleString() : book.priceUSD}</span>
                </div>
                <h3 className="text-sm md:text-xl font-serif text-card-foreground mb-2 md:mb-4 line-clamp-2 leading-tight">{book.title}</h3>
                <div className="w-full py-1.5 md:py-3 bg-background/50 border border-border rounded md:rounded-lg text-[8px] md:text-xs font-bold uppercase tracking-widest flex items-center justify-center text-muted-foreground group-hover:border-gold group-hover:text-card-foreground transition-colors">Tap for Details</div>
            </div>
          </div>

          {/* === BACK FACE === */}
          <div className="absolute inset-0 bg-card border border-gold/50 p-4 md:p-8 rounded-xl md:rounded-2xl flex flex-col items-center justify-center text-center backface-hidden shadow-[0_0_30px_rgba(212,175,55,0.15)]" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
              <div className="w-6 md:w-12 h-1 bg-gold mb-3 md:mb-6 rounded-full" />
              <h4 className="text-sm md:text-lg font-serif text-card-foreground mb-2 md:mb-4">{type === 'video' ? 'Masterclass Details' : type === 'audio' ? 'Audio Drill' : 'Synopsis'}</h4>
              <p className="text-muted-foreground text-[10px] md:text-sm leading-relaxed mb-3 md:mb-6 line-clamp-4 md:line-clamp-6">{(book as any).description || "Master the art of spoken influence."}</p>
              
              {preview && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setShowTrailer(true); }} 
                    className="mb-3 md:mb-4 px-3 py-1.5 md:px-4 md:py-2 bg-gold/10 border border-gold/20 rounded md:rounded-lg text-[9px] md:text-xs font-bold uppercase tracking-widest text-gold flex items-center gap-1 md:gap-2 hover:bg-gold hover:text-black transition-colors"
                  >
                    <Play size={10} className="md:w-3 md:h-3" fill="currentColor"/> {type === 'video' ? 'Watch Trailer' : 'Listen'}
                  </button>
              )}

              <div className="text-lg md:text-2xl font-serif text-card-foreground mb-3 md:mb-8">{currency === 'NGN' ? '₦' : '$'}{currency === 'NGN' ? book.priceNGN.toLocaleString() : book.priceUSD}</div>
              <button onClick={(e) => { e.stopPropagation(); addItem(book); }} className="w-full py-2.5 md:py-4 bg-gold text-black font-bold uppercase tracking-widest text-[9px] md:text-xs rounded md:rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-1.5 md:gap-2 shadow-lg"><ShoppingBag size={12} className="md:w-4 md:h-4" /> Add to Cart</button>
          </div>
        </motion.div>
      </div>

      {/* === CINEMATIC TRAILER MODAL === */}
      <AnimatePresence>
        {showTrailer && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-card border border-border rounded-2xl overflow-hidden shadow-2xl"
            >
              <div className="flex justify-between items-center p-4 border-b border-border bg-background/50">
                 <div>
                   <span className="text-[10px] text-gold font-bold uppercase tracking-widest">Teaser Preview</span>
                   <h3 className="font-serif text-foreground text-sm md:text-lg">{book.title}</h3>
                 </div>
                 <button onClick={() => setShowTrailer(false)} className="p-2 bg-white/5 hover:bg-red-500 hover:text-white rounded-full transition-colors">
                    <X size={20} />
                 </button>
              </div>

              <div className="bg-black w-full aspect-video flex items-center justify-center relative">
                 {type === 'video' ? (
                    <video src={preview} controls controlsList="nodownload" className="w-full h-full object-contain" autoPlay />
                 ) : (
                    <div className="w-full p-8 md:p-12 flex flex-col items-center">
                         <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-gold shadow-[0_0_50px_rgba(212,175,55,0.3)] animate-[spin_20s_linear_infinite] mb-6 overflow-hidden relative bg-gray-900">
                            <Headphones size={30} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-gold/50" />
                         </div>
                        <audio src={preview} controls controlsList="nodownload" className="w-full max-w-md" autoPlay />
                    </div>
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}