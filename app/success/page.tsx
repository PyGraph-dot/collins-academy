"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, Download, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/store/cart";

// 1. The Component that reads the URL
function SuccessContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const { clearCart, closeCart } = useCart(); 
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [downloading, setDownloading] = useState<string | null>(null); // Track which file is downloading

  useEffect(() => {
    // 1. Force the cart drawer to close immediately
    closeCart();

    if (!reference) {
       setLoading(false);
       return;
    }

    async function verifyPayment() {
      try {
        const res = await fetch(`/api/payment/verify?reference=${reference}`);
        const data = await res.json();

        if (data.success) {
          setOrder(data.order);
          clearCart(); 
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    verifyPayment();
  }, [reference, closeCart, clearCart]);

  // --- NEW: Force Download & Rename Function ---
  const handleDownload = async (url: string, title: string) => {
    try {
      setDownloading(title);
      // 1. Fetch the file as a "blob" (raw data)
      const response = await fetch(url);
      const blob = await response.blob();
      
      // 2. Create a temporary link to that blob
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${title}.pdf`; // <--- This forces the browser to rename it
      
      // 3. Click it programmatically
      document.body.appendChild(link);
      link.click();
      
      // 4. Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (e) {
      console.error("Download failed, opening in new tab", e);
      window.open(url, '_blank');
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <Loader2 className="animate-spin text-[#d4af37]" size={48} />
        <p className="text-sm uppercase tracking-widest text-gray-500">Verifying Payment...</p>
      </div>
    );
  }

  if (!order && !loading && !reference) {
      return (
          <div className="text-center py-20">
              <h1 className="text-2xl font-serif text-white mb-4">Access Restricted</h1>
              <Link href="/shop" className="text-[#d4af37] underline">Return to Shop</Link>
          </div>
      )
  }

  if (!order) return null;

  return (
    <div className="max-w-2xl mx-auto text-center">
      <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 text-green-500">
         <CheckCircle size={40} />
      </div>

      <h1 className="text-4xl font-serif text-white mb-4">Payment Successful.</h1>
      <p className="text-gray-400 mb-12">
        Thank you for your purchase. Your resources are ready for immediate download below.
      </p>

      <div className="bg-[#111] border border-white/10 rounded-2xl p-8 text-left">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Your Downloads</h3>
        
        <div className="space-y-4">
          {order.items.map((item: any, i: number) => (
            <div key={i} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-16 bg-black rounded overflow-hidden flex-shrink-0 border border-white/10">
                    {item.productId?.image ? (
                      <img src={item.productId.image} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center"><BookOpen size={16} className="text-gray-600"/></div>
                    )}
                 </div>
                 <div>
                   <h4 className="font-bold font-serif text-white">{item.title}</h4>
                   <p className="text-xs text-gray-500 uppercase tracking-wider">PDF Guide</p>
                 </div>
              </div>

              {item.productId?.fileUrl ? (
                <button 
                  onClick={() => handleDownload(item.productId.fileUrl, item.title)}
                  disabled={downloading === item.title}
                  className="flex items-center gap-2 bg-[#d4af37] text-black px-5 py-3 rounded-lg font-bold text-sm hover:bg-white transition-colors disabled:opacity-50"
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

        <div className="mt-8 pt-6 border-t border-white/10 text-center">
           <p className="text-xs text-gray-500 mb-2">A receipt has been sent to <span className="text-white">{order.customerEmail}</span></p>
           <p className="text-[10px] text-gray-600">Order Ref: {order.transactionId}</p>
        </div>
      </div>

      <Link href="/library" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mt-12 transition-colors">
         Return to Library <ArrowRight size={16} />
      </Link>
    </div>
  );
}

// 2. The Main Page that Wraps it in Suspense
export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-20 px-6">
      <Suspense fallback={
         <div className="flex justify-center pt-20">
            <Loader2 className="animate-spin text-[#d4af37]" size={40} />
         </div>
      }>
        <SuccessContent />
      </Suspense>
    </div>
  );
}