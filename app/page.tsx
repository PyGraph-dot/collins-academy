import connectDB from "@/lib/db";
import Product from "@/models/Product";
import Hero from "@/components/home/Hero";
import Library from "@/components/home/Library";
import LeadMagnet from "@/components/home/LeadMagnet";
// FIX: Import the wrapper, not the library directly
import SmoothScrolling from "@/components/ui/SmoothScrolling"; 
import Header from "@/components/layout/Header";

// CACHING STRATEGY: Revalidate every hour
export const revalidate = 3600; 

async function getData() {
  await connectDB();

  // Parallel Data Fetching
  const productsPromise = Product.find({ isPublished: true })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();
  
  const [products] = await Promise.all([productsPromise]);

  return {
    products: JSON.parse(JSON.stringify(products)),
    dailyDrop: null, 
  };
}

export default async function Home() {
  const { products, dailyDrop } = await getData();

  return (
    // FIX: Use the Client Component wrapper
    <SmoothScrolling>
      <main className="bg-background text-foreground min-h-screen transition-colors duration-500">
        <Header />
        
        <Hero dailyDrop={dailyDrop} />
        
        <Library products={products} />
        
        <LeadMagnet />
        
        <footer className="py-12 text-center text-muted-foreground text-sm border-t border-border">
          <p>© 2026 The Collins Academy. All rights reserved.</p>
        </footer>
      </main>
    </SmoothScrolling>
  );
}