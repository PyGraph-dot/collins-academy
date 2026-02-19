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
  const [showTrailer, setShowTrailer] = useState(false); // NEW: Trailer State
  
  const type = (book as any).productType || 'ebook';
  const preview = (book as any).previewUrl;

  return (
    <>
      <div 
        className="group relative w-full h-[400px] md:h-[520px] flex-shrink-0 perspective-1000 cursor-pointer"
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
          <div className="absolute inset-0 bg-card border border-border p-3 md:p-4 rounded-xl md:rounded-2xl flex flex-col justify-between backface-hidden shadow-sm transition-colors" style={{ backfaceVisibility: "hidden" }}>
            
            <div className="relative w-full h-[220px] md:h-[320px] bg-black/5 dark:bg-black/40 rounded-lg md:rounded-xl overflow-hidden mb-3 md:mb-6 border border-border flex items-center justify-center">
              {type === 'video' ? (
                  <div className="absolute inset-0 w-full h-full group-hover:scale-105 transition-transform duration-700">
                      {book.image && <Image src={book.image} alt={book.title} fill className="object-cover opacity-80" />}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <div className="w-16 h-16 bg-gold text-black rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.4)] backdrop-blur-md">
                              <Play fill="black" size={24} className="ml-1" />
                          </div>
                      </div>
                  </div>
              ) : type === 'audio' ? (
                  <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-900 to-black group-hover:scale-105 transition-transform duration-700">
                      {book.image && <Image src={book.image} alt={book.title} fill className="object-cover opacity-50 blur-sm" />}
                      <div className="relative w-32 h-32 rounded-full border-4 border-gold shadow-2xl overflow-hidden animate-[spin_20s_linear_infinite]">
                          {book.image && <Image src={book.image} alt="vinyl" fill className="object-cover" />}
                      </div>
                  </div>
              ) : (
                  book.image ? (
                    <Image src={book.image} alt={book.title} fill className="object-contain p-4 group-hover:scale-105 transition-transform duration-500" />
                  ) : <span className="font-serif text-2xl opacity-20">COLLINS</span>
              )}

              <div className="absolute top-3 left-3 px-2 py-1.5 rounded bg-background/90 backdrop-blur-md border border-border text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5 shadow-sm">
                  {type === 'video' && <><Film size={12} className="text-purple-500"/> VIDEO</>}
                  {type === 'audio' && <><Headphones size={12} className="text-blue-500"/> AUDIO</>}
                  {type === 'ebook' && <><BookOpen size={12} className="text-yellow-500"/> PDF</>}
              </div>
              <div className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white/50"><RotateCcw size={12} /></div>
            </div>

            <div className="flex-1 flex flex-col justify-end">
                <div className="flex justify-between items-start mb-2">
                   <span className="text-[10px] uppercase tracking-widest text-muted-foreground truncate">{(book as any).category || 'Premium Resource'}</span>
                   <span className="text-gold text-lg font-bold font-serif">{currency === 'NGN' ? '₦' : '$'}{currency === 'NGN' ? book.priceNGN.toLocaleString() : book.priceUSD}</span>
                </div>
                <h3 className="text-lg md:text-xl font-serif text-card-foreground mb-4 line-clamp-2 leading-tight">{book.title}</h3>
                <div className="w-full py-3 bg-background/50 border border-border rounded-lg text-xs font-bold uppercase tracking-widest flex items-center justify-center text-muted-foreground group-hover:border-gold group-hover:text-card-foreground transition-colors">Tap for Details</div>
            </div>
          </div>

          {/* === BACK FACE === */}
          <div className="absolute inset-0 bg-card border border-gold/50 p-6 md:p-8 rounded-xl md:rounded-2xl flex flex-col items-center justify-center text-center backface-hidden shadow-[0_0_30px_rgba(212,175,55,0.15)]" style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}>
              <div className="w-12 h-1 bg-gold mb-6 rounded-full" />
              <h4 className="text-lg font-serif text-card-foreground mb-4">{type === 'video' ? 'Masterclass Details' : type === 'audio' ? 'Audio Drill Details' : 'Synopsis'}</h4>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6 line-clamp-6">{(book as any).description || "Master the art of spoken influence."}</p>
              
              {/* THE TRAILER BUTTON UPDATE */}
              {preview && (
                  <button 
                    onClick={(e) => { 
                      e.stopPropagation(); // Stop card from flipping
                      setShowTrailer(true); 
                    }} 
                    className="mb-4 px-4 py-2 bg-gold/10 border border-gold/20 rounded-lg text-xs font-bold uppercase tracking-widest text-gold flex items-center gap-2 hover:bg-gold hover:text-black transition-colors"
                  >
                    <Play size={14} fill="currentColor"/> {type === 'video' ? 'Watch Trailer' : 'Listen to Sample'}
                  </button>
              )}

              <div className="text-2xl font-serif text-card-foreground mb-8">{currency === 'NGN' ? '₦' : '$'}{currency === 'NGN' ? book.priceNGN.toLocaleString() : book.priceUSD}</div>
              <button onClick={(e) => { e.stopPropagation(); addItem(book); }} className="w-full py-4 bg-gold text-black font-bold uppercase tracking-widest text-xs rounded-lg hover:bg-white transition-colors flex items-center justify-center gap-2 shadow-lg"><ShoppingBag size={16} /> Add to Cart</button>
          </div>
        </motion.div>
      </div>

      {/* === CINEMATIC TRAILER MODAL === */}
      <AnimatePresence>
        {showTrailer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/95 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-4xl bg-card border border-border rounded-2xl overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="flex justify-between items-center p-4 border-b border-border bg-background/50">
                 <div>
                   <span className="text-[10px] text-gold font-bold uppercase tracking-widest">Teaser Preview</span>
                   <h3 className="font-serif text-foreground text-lg">{book.title}</h3>
                 </div>
                 <button onClick={() => setShowTrailer(false)} className="p-2 bg-white/5 hover:bg-red-500 hover:text-white rounded-full transition-colors">
                    <X size={20} />
                 </button>
              </div>

              {/* Player */}
              <div className="bg-black w-full aspect-video flex items-center justify-center">
                 {type === 'video' ? (
                    <video src={preview} controls controlsList="nodownload" className="w-full h-full object-contain" autoPlay />
                 ) : (
                    <audio src={preview} controls controlsList="nodownload" className="w-full max-w-md" autoPlay />
                 )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}