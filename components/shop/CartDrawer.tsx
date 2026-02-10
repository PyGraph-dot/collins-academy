"use client";

import { useState } from "react";
import { useCart } from "@/store/cart";
import { X, ShoppingBag, Trash2, Loader2, CreditCard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Script from "next/script";
import { useRouter } from "next/navigation"; // Import useRouter

export default function CartDrawer() {
  const { items, isOpen, toggleCart, removeItem, currency, setCurrency, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const router = useRouter(); // Initialize router

  const totalAmount = items.reduce((acc, item) => {
    const price = currency === 'NGN' ? item.priceNGN : item.priceUSD;
    return acc + price;
  }, 0);

  const handleCheckout = () => {
    if (!email) {
      alert("Please enter your email address.");
      return;
    }

    setLoading(true);

    const publicKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    
    if (!publicKey) {
      setLoading(false);
      alert("Error: Paystack Public Key is missing.");
      return;
    }

    if (typeof (window as any).PaystackPop === 'undefined') {
       setLoading(false);
       alert("Paystack is loading... please wait 2 seconds.");
       return;
    }

    try {
      const handler = (window as any).PaystackPop.setup({
        key: publicKey,
        email: email,
        amount: totalAmount * 100, // kobo
        currency: currency,
        metadata: {
          // 1. Send book IDs so backend can verify and create order
          cart_ids: items.map(item => item._id),
          
          // 2. Display on Paystack Dashboard
          custom_fields: [
            {
               display_name: "Items",
               variable_name: "items",
               value: items.map(i => i.title).join(", ")
            }
          ]
        },
        callback: function(response: any) { 
          // --- SUCCESS! REDIRECT TO THE DEDICATED SUCCESS PAGE ---
          // This keeps the cart simple and uses your existing page logic.
          clearCart();
          toggleCart();
          router.push(`/success?reference=${response.reference}`);
        },
        onClose: function() {
          setLoading(false);
        }
      });

      handler.openIframe();

    } catch (error: any) {
      console.error("Paystack Error:", error);
      setLoading(false);
      alert("Payment Error: " + error.message);
    }
  };

  return (
    <>
      <Script src="https://js.paystack.co/v1/inline.js" strategy="afterInteractive" />

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={toggleCart}
              className="fixed inset-0 bg-black/80 z-[60] backdrop-blur-sm"
            />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-[#111] border-l border-white/10 z-[70] p-6 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                <h2 className="text-2xl font-serif text-white flex items-center gap-2">
                  <ShoppingBag className="text-[#d4af37]" size={24} /> 
                  Cart
                </h2>
                <button onClick={toggleCart} className="p-2 hover:bg-white/10 rounded-full transition text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="flex bg-white/5 p-1 rounded-lg mb-6 w-fit">
                 {['NGN', 'USD'].map((curr) => (
                   <button
                     key={curr}
                     onClick={() => setCurrency(curr as 'NGN' | 'USD')}
                     className={`px-4 py-1 text-xs font-bold rounded-md transition-all ${currency === curr ? 'bg-[#d4af37] text-black' : 'text-gray-400 hover:text-white'}`}
                   >
                     {curr}
                   </button>
                 ))}
              </div>

              <div className="flex-1 overflow-y-auto space-y-6">
                {items.length === 0 ? (
                  <div className="text-center text-gray-500 mt-20">
                    <p>Your cart is empty.</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item._id} className="flex gap-4 bg-white/5 p-3 rounded-lg border border-white/5">
                      <div className="w-16 h-20 bg-gray-800 rounded-md overflow-hidden flex-shrink-0">
                         {item.image ? (
                           <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">IMG</div>
                         )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-white font-serif line-clamp-2">{item.title}</h3>
                        <p className="text-[#d4af37] text-sm mt-1 font-bold">
                          {currency === 'NGN' ? '₦' : '$'}{currency === 'NGN' ? item.priceNGN.toLocaleString() : item.priceUSD}
                        </p>
                      </div>
                      
                      <button onClick={() => removeItem(item._id)} className="text-gray-500 hover:text-red-400 p-2">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {items.length > 0 && (
                <div className="border-t border-white/10 pt-6 mt-6 space-y-4">
                  <div className="flex justify-between items-center text-xl font-serif text-white">
                    <span>Total</span>
                    <span className="text-[#d4af37]">
                      {currency === 'NGN' ? '₦' : '$'}{totalAmount.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <label className="text-xs uppercase text-gray-500 mb-1 block">Email for Receipt</label>
                    <input 
                      type="email" 
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#0a0a0a] border border-white/10 p-3 rounded text-white text-sm focus:border-[#d4af37] outline-none"
                    />
                  </div>

                  <button 
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full py-4 bg-[#d4af37] hover:bg-[#b5952f] text-black font-bold uppercase tracking-wider transition-colors rounded-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <><CreditCard size={18} /> Pay Now</>}
                  </button>
                  
                  <p className="text-center text-[10px] text-gray-500 mt-4 uppercase tracking-widest">
                    Secured by Paystack
                  </p>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}