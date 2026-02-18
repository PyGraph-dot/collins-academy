"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, CheckCircle, Download, ArrowRight, BookOpen, Music, Video, Lock } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/store/cart";
import Header from "@/components/layout/Header";

// Enhanced Interface to include Product Type
interface OrderItem {
  title: string;
  productId: {
    image?: string;
    fileUrl?: string;
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

  // --- POLY-FORMAT SECURE DOWNLOAD HANDLER ---
  const handleDownload = async (fileUrl: string, title: string, productType: string = 'ebook') => {
    try {
      setDownloading(title);

      // 1. Determine Correct Extension based on product type
      let ext = 'pdf';
      if (productType === 'video') ext = 'mp4';
      if (productType === 'audio') ext = 'mp3';

      // 2. Clean the title to prevent ".mp4.pdf" mutations or broken characters
      const cleanTitle = title.replace(/\.[^/.]+$/, "").replace(/[^a-z0-9]/gi, '_').toLowerCase();
      const finalFileName = `${cleanTitle}.${ext}`;

      // 3. Construct the Secure Proxy URL
      // We pass the Order ID so the server can verify this user actually paid
      const secureUrl = `/api/secure-download?file=${encodeURIComponent(fileUrl)}&orderId=${order._id}`;
      
      // 4. Trigger Download via Hidden Link (Reliable for large files)
      const link = document.createElement('a');
      link.href = secureUrl;
      link.setAttribute('download', finalFileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (e) {
      console.error("Download failed", e);
      alert("Download failed. Please contact support.");
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
    <div className="max-w-3xl mx-auto text-center pt-20 pb-20">
      <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 text-green-500">
         <CheckCircle size={40} />
      </div>

      <h1 className="text-4xl font-serif text-foreground mb-4">Payment Successful.</h1>
      <p className="text-muted-foreground mb-12 max-w-lg mx-auto">
        Welcome to the Academy. Your secure resources have been unlocked below.
      </p>

      {/* DOWNLOADS CARD */}
      <div className="bg-card border border-border rounded-2xl p-6 md:p-8 text-left shadow-2xl">
        <div className="flex justify-between items-center mb-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Unlocked Resources</h3>
            <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-1 rounded-full border border-green-500/20">PAID</span>
        </div>
        
        <div className="space-y-4">
          {order.items.map((item: OrderItem, i: number) => {
            // Determine Type for Icon & Label
            const type = item.productId?.productType || 'ebook';
            
            return (
              <div key={i} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-background/50 p-4 rounded-xl border border-border hover:border-gold/30 transition-colors">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-16 bg-background rounded overflow-hidden flex-shrink-0 border border-border relative">
                      {item.productId?.image ? (
                        <img src={item.productId.image} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-900">
                            {type === 'video' ? <Video size={16} className="text-gray-500"/> : 
                             type === 'audio' ? <Music size={16} className="text-gray-500"/> : 
                             <BookOpen size={16} className="text-gray-500"/>}
                        </div>
                      )}
                   </div>
                   <div>
                     <h4 className="font-bold font-serif text-foreground text-lg">{item.title}</h4>
                     <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase tracking-wider">
                        {type === 'video' && <Video size={12} />}
                        {type === 'audio' && <Music size={12} />}
                        {type === 'ebook' && <BookOpen size={12} />}
                        <span>{type === 'ebook' ? 'PDF Guide' : type === 'video' ? 'Video Course' : 'Audio Drill'}</span>
                     </div>
                   </div>
                </div>

                 {item.productId?.fileUrl ? (
                   <button 
                     // Pass the 'type' to ensure it gets the right extension
                     onClick={() => handleDownload(item.productId.fileUrl!, item.title, type)}
                     disabled={!!downloading}
                     className="flex items-center justify-center gap-2 bg-gold text-black px-6 py-3 rounded-lg font-bold text-sm hover:bg-white transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed min-w-[140px]"
                   >
                    {downloading === item.title ? (
                        <>
                            <Loader2 className="animate-spin" size={18} />
                            <span>Securing...</span>
                        </>
                    ) : (
                        <>
                            <Download size={18} />
                            <span>Download</span>
                        </>
                    )}
                  </button>
                ) : (
                  <span className="text-xs text-red-500 bg-red-500/10 px-3 py-1 rounded-full">Processing...</span>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t border-border text-center">
           <p className="text-xs text-muted-foreground mb-2">
                Receipt sent to <span className="text-foreground font-bold">{order.customerEmail}</span>
           </p>
           <p className="text-[10px] text-muted-foreground opacity-50">
                Transaction ID: {order.transactionId || order._id}
           </p>
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