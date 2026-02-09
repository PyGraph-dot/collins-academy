"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Home, Loader2, Download } from "lucide-react";
import { useCart } from "@/store/cart";

function SuccessContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const reference = searchParams.get("reference"); // Get Paystack Transaction ID
  const [verifying, setVerifying] = useState(true);

  useEffect(() => {
    if (reference) {
      // In a real app, we would verify this ID with the backend here.
      // For now, we simulate a check and clear the cart.
      setTimeout(() => {
        clearCart(); // Empty the cart because they paid
        setVerifying(false);
      }, 1500);
    }
  }, [reference, clearCart]);

  if (verifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-white space-y-4">
        <Loader2 className="animate-spin text-[#d4af37]" size={48} />
        <h2 className="text-xl font-serif animate-pulse">Verifying Payment...</h2>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center max-w-lg mx-auto bg-[#111] p-8 rounded-2xl border border-white/10 shadow-2xl">
      <div className="bg-green-500/10 p-4 rounded-full mb-6">
        <CheckCircle className="text-green-500" size={64} />
      </div>
      
      <h1 className="text-3xl font-serif text-white mb-2">Payment Successful!</h1>
      <p className="text-gray-400 mb-8">
        Your transaction reference is: <br />
        <span className="text-[#d4af37] font-mono text-sm">{reference}</span>
      </p>

      <div className="bg-white/5 p-6 rounded-xl w-full mb-8 border border-white/5">
        <h3 className="text-white font-bold mb-2">What happens next?</h3>
        <p className="text-sm text-gray-400 leading-relaxed">
          Your digital files have been sent to your email address. 
          Please check your inbox (and spam folder) for the download links.
        </p>
      </div>

      <Link 
        href="/"
        className="flex items-center gap-2 bg-[#d4af37] text-black px-8 py-3 rounded-full font-bold hover:bg-white transition-colors"
      >
        <Home size={18} /> Back to Library
      </Link>
    </div>
  );
}

export default function SuccessPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20 px-6 flex items-center justify-center">
      <Suspense fallback={<div className="text-white">Loading...</div>}>
        <SuccessContent />
      </Suspense>
    </div>
  );
}