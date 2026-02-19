import connectDB from "@/lib/db";
import Product from "@/models/Product";
import DailyDrop from "@/models/DailyDrop"; 
import Hero from "@/components/home/Hero";
import Library from "@/components/home/Library";
import LeadMagnet from "@/components/home/LeadMagnet";
import SmoothScrolling from "@/components/ui/SmoothScrolling";
import Header from "@/components/layout/Header";

// CACHING STRATEGY: Revalidate every hour
export const revalidate = 3600; 

async function getData() {
  await connectDB();

  // THE BESTSELLER ALGORITHM
  // Sorts by highest salesCount first. If tied, sorts by newest.
  // Increased limit to 4 to match the new 4-column grid layout.
  const productsPromise = Product.find({ isPublished: true })
    .sort({ salesCount: -1, createdAt: -1 }) 
    .limit(4)
    .lean();

  const dailyDropPromise = DailyDrop.findOne()
    .sort({ createdAt: -1 }) 
    .lean();
  
  const [products, dailyDrop] = await Promise.all([
    productsPromise, 
    dailyDropPromise
  ]);

  return {
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