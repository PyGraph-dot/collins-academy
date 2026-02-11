"use client";

import { motion } from "framer-motion";
import Book3D from "@/components/ui/Book3D";
import { useCart } from "@/store/cart";
import { ProductType } from "@/lib/types";

// Expert Note: We accept the pure data as props. 
// This component doesn't fetch; it just renders.
export default function ProductGrid({ products }: { products: ProductType[] }) {
  const { addItem, currency } = useCart();

  if (!products || products.length === 0) {
    return (
      <div className="col-span-full text-center py-20 border border-dashed border-border rounded-xl bg-card text-muted-foreground">
        No products found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
      {products.map((book, i) => (
        <motion.div
          key={book._id}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05 }}
        >
          {/* We pass the book data down. Book3D will handle the specific cart types. */}
          <Book3D book={book} addItem={addItem} currency={currency} />
        </motion.div>
      ))}
    </div>
  );
}