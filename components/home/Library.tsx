"use client";

import { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { useCart, CartItem } from "@/store/cart";
import Book3D from "@/components/ui/Book3D";

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
          setProducts(data.slice(0, 3));
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
    // UPDATED: Dynamic Background
    <section id="library" ref={containerRef} className="py-24 md:py-32 bg-background overflow-hidden relative transition-colors duration-300">
      
      {/* Noise Texture */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
           style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }} 
      />

      <div className="container mx-auto px-6 mb-12 flex flex-col md:flex-row items-end justify-between gap-6 relative z-10">
        <div>
          <span className="text-gold text-xs font-bold tracking-widest uppercase mb-2 block">The Collection</span>
          <h2 className="text-3xl md:text-5xl font-serif text-foreground">Essential Reading.</h2>
        </div>
        <Link href="/shop" className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-2 group">
          View all resources <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      <div className="overflow-x-auto md:overflow-visible pb-12 px-6 md:px-0 -mx-6 md:mx-0 scrollbar-hide snap-x snap-mandatory relative z-10">
        
        {loading ? (
           <div className="w-full h-[400px] flex items-center justify-center">
             <Loader2 className="animate-spin text-gold" size={40} />
           </div>
        ) : (
          <div className="flex md:grid md:grid-cols-3 gap-6 md:gap-8 w-max md:w-full px-6 md:px-0 container mx-auto">
            {products.length === 0 ? (
               // UPDATED: Empty state styling
               <div className="text-muted-foreground text-sm italic col-span-3 text-center py-20 w-full border border-dashed border-border rounded-xl bg-card">
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
                  className="w-[280px] md:w-full flex-shrink-0 snap-center"
                >
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