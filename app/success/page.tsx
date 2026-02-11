"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, Download, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/store/cart";
import Header from "@/components/layout/Header"; // Add Header for consistency

function SuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const { clearCart, closeCart } = useCart(); 
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

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

  const handleDownload = async (url: string, title: string) => {
    try {
      setDownloading(title);
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${title}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      window.open(url, '_blank');
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 min-h-[60vh]">
        <Loader2 className="animate-spin text-gold" size={48} />
        <p className="text-sm uppercase tracking-widest text-muted-foreground">Verifying Payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center pt-20">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 text-red-500">
          <CheckCircle size={40} />
        </div>
        <h1 className="text-4xl font-serif text-foreground mb-4">Payment Verification Failed</h1>
        <p className="text-red-400 mb-8">{error}</p>
        <Link href="/shop" className="px-6 py-3 bg-gold text-black font-bold rounded-lg hover:bg-white transition-colors">
          Return to Shop
        </Link>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-2xl mx-auto text-center pt-20 pb-20">
      <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 text-green-500">
         <CheckCircle size={40} />
      </div>

      <h1 className="text-4xl font-serif text-foreground mb-4">Payment Successful.</h1>
      <p className="text-muted-foreground mb-12">
        Thank you for your purchase. Your resources are ready for immediate download below.
      </p>

      {/* UPDATED: Card Container */}
      <div className="bg-card border border-border rounded-2xl p-8 text-left shadow-lg">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">Your Downloads</h3>
        
        <div className="space-y-4">
          {order.items.map((item: any, i: number) => (
            <div key={i} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-background/50 p-4 rounded-xl border border-border">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-16 bg-background rounded overflow-hidden flex-shrink-0 border border-border">
                    {item.productId?.image ? (
                      <img src={item.productId.image} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><BookOpen size={16} className="text-muted-foreground"/></div>
                    )}
                 </div>
                 <div>
                   <h4 className="font-bold font-serif text-foreground">{item.title}</h4>
                   <p className="text-xs text-muted-foreground uppercase tracking-wider">PDF Guide</p>
                 </div>
              </div>

              {item.productId?.fileUrl ? (
                <button 
                  onClick={() => handleDownload(item.productId.fileUrl, item.title)}
                  disabled={downloading === item.title}
                  className="flex items-center gap-2 bg-gold text-black px-5 py-3 rounded-lg font-bold text-sm hover:bg-foreground hover:text-background transition-colors disabled:opacity-50"
                >
                  {downloading === item.title ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                  <span>{downloading === item.title ? "Saving..." : "Download"}</span>
                </button>
              ) : (
                <span className="text-xs text-red-500">File not available</span>
              )}
            </div>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center">
           <p className="text-xs text-muted-foreground mb-2">A receipt has been sent to <span className="text-foreground">{order.customerEmail}</span></p>
           <p className="text-[10px] text-muted-foreground">Order Ref: {order.transactionId || order._id}</p>
        </div>
      </div>

      <Link href="/library" className="inline-flex items-center gap-2 text-muted-foreground hover:text-gold mt-12 transition-colors">
         Return to Library <ArrowRight size={16} />
      </Link>
    </div>
  );
}

export default function SuccessPage() {
  return (
    // UPDATED: Main background
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 px-6">
      <Header />
      <Suspense fallback={
         <div className="flex justify-center pt-40">
            <Loader2 className="animate-spin text-gold" size={40} />
         </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}