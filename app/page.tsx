import connectDB from "@/lib/db";
import Product from "@/models/Product";
import DailyDrop from "@/models/DailyDrop"; // <--- IMPORT THE MODEL
import Hero from "@/components/home/Hero";
import Library from "@/components/home/Library";
import LeadMagnet from "@/components/home/LeadMagnet";
import SmoothScrolling from "@/components/ui/SmoothScrolling";
import Header from "@/components/layout/Header";

// CACHING STRATEGY: Revalidate every hour
export const revalidate = 3600; 

async function getData() {
  await connectDB();

  // 1. Fetch Products
  const productsPromise = Product.find({ isPublished: true })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  // 2. Fetch the Latest Daily Drop (The Fix)
  const dailyDropPromise = DailyDrop.findOne()
    .sort({ createdAt: -1 }) // Get the newest one
    .lean();
  
  // Run both queries at the same time for speed
  const [products, dailyDrop] = await Promise.all([
    productsPromise, 
    dailyDropPromise
  ]);

  return {
    // We must stringify to pass MongoDB objects (like _id and Date) to the frontend
    products: JSON.parse(JSON.stringify(products)),
    dailyDrop: dailyDrop ? JSON.parse(JSON.stringify(dailyDrop)) : null,
  };
}

export default async function Home() {
  const { products, dailyDrop } = await getData();

  return (
    <SmoothScrolling>
      <main className="bg-background text-foreground min-h-screen transition-colors duration-500">
        <Header />
        
        {/* Now we pass the REAL audio data to the Hero */}
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
