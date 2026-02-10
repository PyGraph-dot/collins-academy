"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CheckCircle, Download, ArrowRight, BookOpen } from "lucide-react";
import Link from "next/link";
import { useCart } from "@/store/cart";

export default function SuccessPage() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference"); // Get Paystack Ref from URL
  const router = useRouter();
  const { clearCart } = useCart();
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);

  useEffect(() => {
    if (!reference) {
        router.push("/shop"); // No reference? Go back to shop.
        return;
    }

    async function verifyPayment() {
      try {
        const res = await fetch(`/api/payment/verify?reference=${reference}`);
        const data = await res.json();

        if (data.success) {
          setOrder(data.order);
          clearCart(); // Payment worked, clear the cart
        } else {
          alert("Payment verification failed!");
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    }

    verifyPayment();
  }, [reference]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white gap-4">
        <Loader2 className="animate-spin text-[#d4af37]" size={48} />
        <p className="text-sm uppercase tracking-widest text-gray-500">Verifying Payment...</p>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white pt-32 pb-20 px-6">
      <div className="max-w-2xl mx-auto text-center">
        
        {/* Success Icon */}
        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-8 text-green-500">
           <CheckCircle size={40} />
        </div>

        <h1 className="text-4xl font-serif mb-4">Payment Successful.</h1>
        <p className="text-gray-400 mb-12">
          Thank you for your purchase. Your resources are ready for immediate download below.
        </p>

        {/* DOWNLOAD CARD */}
        <div className="bg-[#111] border border-white/10 rounded-2xl p-8 text-left">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 mb-6">Your Downloads</h3>
          
          <div className="space-y-4">
            {order.items.map((item: any, i: number) => (
              <div key={i} className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-16 bg-black rounded overflow-hidden flex-shrink-0 border border-white/10">
                      {/* Using the populated product image if available, else placeholder */}
                      {item.productId?.image ? (
                        <img src={item.productId.image} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center"><BookOpen size={16} className="text-gray-600"/></div>
                      )}
                   </div>
                   <div>
                     <h4 className="font-bold font-serif">{item.title}</h4>
                     <p className="text-xs text-gray-500 uppercase tracking-wider">PDF Guide</p>
                   </div>
                </div>

                {item.productId?.fileUrl ? (
                  <a 
                    href={item.productId.fileUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#d4af37] text-black px-5 py-3 rounded-lg font-bold text-sm hover:bg-white transition-colors"
                  >
                    <Download size={18} /> Download
                  </a>
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

        {/* Home Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white mt-12 transition-colors">
           Return to Library <ArrowRight size={16} />
        </Link>

      </div>
    </div>
  );
}