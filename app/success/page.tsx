"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, ArrowRight, Lock, ShieldCheck, Play, Headphones, BookOpen } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/store/cart";
import Header from "@/components/layout/Header";

// Enhanced Interface to include Product Type
interface OrderItem {
  title: string;
  productId: {
    image?: string;
    productType?: 'ebook' | 'audio' | 'video';
  };
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const { clearCart, closeCart } = useCart(); 
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    closeCart();
    if (!reference) {
       setError("No payment reference found.");
       setLoading(false);
       return;
    }

    async function verifyPayment() {
      try {
        const res = await fetch(`/api/payment/verify?reference=${reference}`);
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.error || "Verification failed");

        if (data.success && data.order) {
          setOrder(data.order);
          clearCart(); 
        } else {
          throw new Error(data.error || "Order not found");
        }
      } catch (err: any) {
        setError(err.message || "Failed to verify payment.");
      } finally {
        setLoading(false);
      }
    }
    verifyPayment();
  }, [reference]);


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-32 min-h-[60vh]">
        <Loader2 className="animate-spin text-gold" size={48} />
        <p className="text-sm uppercase tracking-widest text-muted-foreground">Securing Your Assets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center pt-32 pb-20 px-4">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 text-red-500">
          <Lock size={40} />
        </div>
        <h1 className="text-3xl md:text-4xl font-serif text-foreground mb-4">Verification Failed</h1>
        <p className="text-red-400 mb-8">{error}</p>
        <Link href="/shop" className="px-6 py-3 bg-gold text-black font-bold rounded-lg hover:bg-white transition-colors">
          Return to Shop
        </Link>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-3xl mx-auto text-center pt-24 md:pt-32 pb-20 px-4">
      <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 text-green-500 border border-green-500/20 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
         <CheckCircle size={40} />
      </div>

      <h1 className="text-4xl md:text-5xl font-serif text-foreground mb-4">Payment Successful.</h1>
      <p className="text-muted-foreground mb-12 max-w-lg mx-auto">
        Your transaction is complete. Your resources have been securely encrypted and deposited into your private learning vault.
      </p>

      {/* SECURE VAULT CARD */}
      <div className="bg-card border border-border rounded-2xl p-6 md:p-10 text-left shadow-2xl relative overflow-hidden">
        
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gold/5 blur-[80px] rounded-full pointer-events-none" />

        <div className="flex justify-between items-center mb-8 pb-6 border-b border-border relative z-10">
            <div className="flex items-center gap-3">
                <ShieldCheck className="text-gold" size={24} />
                <h3 className="text-sm font-bold uppercase tracking-widest text-foreground">Assets Secured</h3>
            </div>
            <span className="text-[10px] bg-green-500/10 text-green-500 px-3 py-1 rounded-full border border-green-500/20 font-bold tracking-wider">VERIFIED</span>
        </div>
        
        <div className="space-y-4 mb-10 relative z-10">
          {order.items.map((item: OrderItem, i: number) => {
             const type = item.productId?.productType || 'ebook';
             
             return (
              <div key={i} className="flex items-center justify-between gap-4 bg-background/50 p-4 rounded-xl border border-border hover:border-gold/30 transition-colors">
                   <div className="flex items-center gap-4">
                       <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center border border-white/5 text-muted-foreground">
                           {type === 'video' ? <Play size={16}/> : type === 'audio' ? <Headphones size={16}/> : <BookOpen size={16}/>}
                       </div>
                       <div>
                           <h4 className="font-bold font-serif text-foreground text-base md:text-lg">{item.title}</h4>
                           <span className="text-[10px] uppercase tracking-widest text-muted-foreground">
                               {type === 'video' ? 'Video Masterclass' : type === 'audio' ? 'Audio Drill' : 'PDF Guide'}
                           </span>
                       </div>
                   </div>
                   <div className="hidden md:flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-gold bg-gold/10 px-3 py-1 rounded-full">
                       <Lock size={10} /> Secured
                   </div>
              </div>
             );
          })}
        </div>

        <div className="relative z-10 flex flex-col items-center border-t border-border pt-8">
            <Link 
                href="/library"
                className="w-full md:w-auto px-8 py-4 bg-gold text-black font-bold uppercase tracking-widest rounded-lg hover:bg-white transition-all hover:scale-105 flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(212,175,55,0.3)]"
            >
                Enter My Vault <ArrowRight size={18} />
            </Link>
            <p className="mt-6 text-xs text-muted-foreground">
                Access your resources anytime using <span className="text-foreground font-bold">{order.customerEmail}</span>
            </p>
            <p className="text-[10px] text-muted-foreground opacity-50 mt-2">
                Transaction ID: {order.transactionId || order._id}
            </p>
        </div>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      <Header />
      <Suspense fallback={
         <div className="flex justify-center pt-40 min-h-screen bg-background">
            <Loader2 className="animate-spin text-gold" size={40} />
         </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}