"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Home, Loader2, Download, BookOpen } from "lucide-react";
import { useCart } from "@/store/cart";
import Header from "@/components/layout/Header";

function SuccessContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const reference = searchParams.get("reference");
  const [verifying, setVerifying] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setError("No transaction reference found.");
      setVerifying(false);
      return;
    }

    async function verifyPayment() {
      try {
        const res = await fetch(`/api/payment/verify?reference=${reference}`);
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Payment verification failed");
        setOrder(data.order);
        clearCart();
      } catch (err: any) {
        setError(err.message);
      } finally {
        setVerifying(false);
      }
    }
    verifyPayment();
  }, [reference, clearCart]);

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

  if (verifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-foreground space-y-4">
        <Loader2 className="animate-spin text-gold" size={48} />
        <h2 className="text-xl font-serif animate-pulse">Verifying Payment...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center text-center max-w-lg mx-auto bg-red-500/10 p-8 rounded-2xl border border-red-500/30 mt-20">
        <h1 className="text-2xl font-serif text-red-500 mb-4">Verification Failed</h1>
        <p className="text-foreground mb-6">{error}</p>
        <Link href="/shop" className="px-8 py-3 bg-gold text-black rounded-full font-bold hover:bg-foreground hover:text-background transition-colors">
           Back to Shop
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center max-w-lg mx-auto bg-card p-8 rounded-2xl border border-border shadow-2xl mt-20 mb-20">
      <div className="bg-green-500/10 p-4 rounded-full mb-6">
        <CheckCircle className="text-green-500" size={64} />
      </div>
      
      <h1 className="text-3xl font-serif text-foreground mb-2">Payment Successful!</h1>
      <p className="text-muted-foreground mb-8 text-sm">
        Reference: <span className="text-gold font-mono">{reference}</span>
      </p>

      {order && (
        <div className="w-full text-left space-y-6">
           {/* Items List */}
           <div className="bg-background/50 border border-border rounded-xl p-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Your Downloads</h3>
              <div className="space-y-4">
                {order.items.map((item: any, i: number) => (
                  <div key={i} className="flex items-center justify-between gap-4 border-b border-border pb-4 last:border-0 last:pb-0">
                     <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-12 bg-background border border-border rounded flex items-center justify-center flex-shrink-0">
                           <BookOpen size={16} className="text-muted-foreground"/>
                        </div>
                        <div className="truncate">
                           <p className="font-bold text-foreground text-sm truncate">{item.title}</p>
                           <p className="text-[10px] text-muted-foreground uppercase">PDF Guide</p>
                        </div>
                     </div>
                     
                     {item.productId?.fileUrl ? (
                       <button 
                         onClick={() => handleDownload(item.productId.fileUrl, item.title)}
                         disabled={downloading === item.title}
                         className="flex-shrink-0 bg-gold text-black p-2 rounded-lg hover:bg-foreground hover:text-background transition-colors"
                       >
                         {downloading === item.title ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                       </button>
                     ) : <span className="text-[10px] text-red-500">Error</span>}
                  </div>
                ))}
              </div>
           </div>
        </div>
      )}

      <div className="mt-8">
        <Link href="/" className="flex items-center justify-center gap-2 bg-foreground text-background px-8 py-3 rounded-full font-bold hover:bg-gold hover:text-black transition-colors">
          <Home size={18} /> Return Home
        </Link>
      </div>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-background px-6">
      <Header />
      <Suspense fallback={<div className="pt-40 text-center text-foreground">Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}