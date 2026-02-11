import { Metadata } from "next";
import connectDB from "@/lib/db";
import Product from "@/models/Product";
import ProductGrid from "@/components/shop/ProductGrid";
import { Loader2 } from "lucide-react";
import { Suspense } from "react";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "Shop | The Collins Academy",
  description: "Curated resources designed to dismantle poor communication habits.",
};

// ISR: Cache this page for 60 seconds, then regenerate on the next visit.
// This makes the shop incredibly fast while keeping data fresh.
export const revalidate = 60;

async function getProducts() {
  await connectDB();
  
  // Performance: .lean() returns plain JS objects, bypassing Mongoose hydration overhead.
  const products = await Product.find({ isPublished: true })
    .sort({ createdAt: -1 })
    .lean();

  // Serialization: Convert MongoDB Objects (like _id and Dates) to strings
  return JSON.parse(JSON.stringify(products));
}

export default async function ShopPage() {
  // This runs on the Server. Instant Data Access.
  const products = await getProducts();

  return (
    <main className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header is safe to include here or in layout */}
      <Header />
      
      {/* HERO SECTION - Static Server Rendered */}
      <section className="pt-32 md:pt-40 pb-12 md:pb-20 px-6 text-center relative overflow-hidden">
         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-gold opacity-5 blur-[100px] md:blur-[150px] rounded-full pointer-events-none" />
         
         <h1 className="text-3xl md:text-6xl font-serif text-foreground mb-4 md:mb-6 relative z-10">
           The Academy <span className="text-gold italic">Library</span>
         </h1>
         <p className="text-muted-foreground max-w-xl mx-auto text-sm md:text-lg relative z-10">
           Curated resources designed to dismantle poor communication habits.
         </p>
      </section>

      {/* PRODUCTS GRID - Client Island with Suspense */}
      <section className="container mx-auto px-4 md:px-6 pb-32">
        <Suspense fallback={
           <div className="flex justify-center py-20">
             <Loader2 className="animate-spin text-gold" size={40} />
           </div>
        }>
           <ProductGrid products={products} />
        </Suspense>
      </section>
    </main>
  );
}