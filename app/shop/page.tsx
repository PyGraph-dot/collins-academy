"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import Book3D from "@/components/ui/Book3D";
import { useCart, CartItem } from "@/store/cart";
import Header from "@/components/layout/Header";

export default function ShopPage() {
  const [products, setProducts] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, currency } = useCart();

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await fetch("/api/products", { cache: "no-store" });
        const data = await res.json();
        if (Array.isArray(data)) setProducts(data);
      } catch (error) {
        console.error("Failed to fetch products");
      } finally {
        setLoading(false);
      }
    }
    fetchProducts();
  }, []);

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header />
      
      {/* HERO SECTION */}
      <section className="pt-32 md:pt-40 pb-12 md:pb-20 px-6 text-center relative overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-gold opacity-5 blur-[100px] md:blur-[150px] rounded-full pointer-events-none" />
         
         <motion.h1 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           className="text-3xl md:text-6xl font-serif text-foreground mb-4 md:mb-6 relative z-10"
         >
           The Academy <span className="text-gold italic">Library</span>
         </motion.h1>
         <motion.p 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="text-muted-foreground max-w-xl mx-auto text-sm md:text-lg relative z-10"
         >
           Curated resources designed to dismantle poor communication habits.
         </motion.p>
      </section>

      {/* PRODUCTS GRID */}
      <section className="container mx-auto px-4 md:px-6 pb-32">
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-gold" size={40} />
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
            {products.length === 0 ? (
               <div className="col-span-full text-center py-20 border border-dashed border-border rounded-xl text-muted-foreground">
                  No products found.
               </div>
            ) : (
              products.map((book, i) => (
                <motion.div
                  key={book._id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Book3D book={book} addItem={addItem} currency={currency} />
                </motion.div>
              ))
            )}
          </div>
        )}
      </section>
    </main>
  );
}