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
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState<string | null>(null); // Track which file is downloading

  useEffect(() => {
    // 1. Force the cart drawer to close immediately
    closeCart();

    if (!reference) {
       setError("No payment reference found. Please complete your payment first.");
       setLoading(false);
       return;
    }

    async function verifyPayment() {
      try {
        console.log("🔄 Verifying payment with reference:", reference);
        
        const res = await fetch(`/api/payment/verify?reference=${reference}`);
        const data = await res.json();
        
        console.log("📦 API Response:", data);

        if (!res.ok) {
          throw new Error(data.error || `Verification failed with status ${res.status}`);
        }

        if (data.success && data.order) {
          console.log("✓ Order verified:", data.order);
          setOrder(data.order);
          clearCart(); 
        } else {
          throw new Error(data.error || "Unexpected response format from verification API");
        }
      } catch (err: any) {
        console.error("❌ Verification error:", err);
        setError(err.message || "Failed to verify payment. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    verifyPayment();
  }, [reference]); // Only depend on reference, not on clearCart/closeCart

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

  // Show error if verification failed
  if (error) {
    return (
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-8 text-red-500">
          <CheckCircle size={40} />
        </div>
        <h1 className="text-4xl font-serif text-white mb-4">Payment Verification Failed</h1>
        <p className="text-red-400 mb-8">{error}</p>
        
        <div className="bg-[#111] border border-red-500/30 rounded-2xl p-8 mb-8">
          <p className="text-sm text-gray-400 mb-4">What you can do:</p>
          <ul className="text-left text-sm text-gray-300 space-y-2">
            <li>✓ Check that your payment was processed by your bank</li>
            <li>✓ Contact support with your reference code if you have one</li>
            <li>✓ Try accessing the success page again in a few moments</li>
          </ul>
        </div>

        <div className="flex gap-4 justify-center">
          <Link href="/shop" className="px-6 py-3 bg-[#d4af37] text-black font-bold rounded-lg hover:bg-white transition-colors">
            Return to Shop
          </Link>
          <Link href="/" className="px-6 py-3 border border-white/20 text-white font-bold rounded-lg hover:border-[#d4af37] transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  // Show access restricted if no order
  if (!order) {
      return (
          <div className="text-center py-20">
              <h1 className="text-2xl font-serif text-white mb-4">Access Restricted</h1>
              <p className="text-gray-400 mb-6">This page requires a valid payment reference.</p>
              <Link href="/shop" className="text-[#d4af37] underline hover:text-white transition-colors">Return to Shop</Link>
          </div>
      );
  }

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
           <p className="text-[10px] text-gray-600">Order Ref: {order.transactionId || order._id}</p>
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