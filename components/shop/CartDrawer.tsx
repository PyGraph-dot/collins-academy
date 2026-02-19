"use client";

import { useState } from "react";
import { useCart } from "@/store/cart";
import { X, ShoppingBag, Trash2, Loader2, CreditCard, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CartDrawer() {
  const { items, isOpen, toggleCart, removeItem, currency, setCurrency } = useCart();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);

  const totalAmount = items.reduce((acc, item) => {
    const price = currency === 'NGN' ? item.priceNGN : item.priceUSD;
    return acc + price;
  }, 0);

  const handleCheckout = async () => {
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // THE FIX: Route the checkout through the backend so the Interceptor can do its job
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, items, currency }),
      });
      
      const data = await res.json();

      if (!res.ok) {
         // The Interceptor caught a duplicate, or Paystack failed
         setError(data.error || "Checkout failed. Please try again.");
         setLoading(false);
         return;
      }

      if (data.url) {
         // Redirect to secure Paystack hosted checkout
         window.location.href = data.url;
      }

    } catch (error: any) {
      console.error("Checkout Error:", error);
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <>
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
              className="fixed right-0 top-0 h-full w-full max-w-md bg-card border-l border-border z-[70] p-6 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
                <h2 className="text-2xl font-serif text-foreground flex items-center gap-2">
                  <ShoppingBag className="text-gold" size={24} /> 
                  Cart
                </h2>
                <button onClick={toggleCart} className="p-2 hover:bg-background/10 rounded-full transition text-foreground">
                  <X size={20} />
                </button>
              </div>

              <div className="flex bg-background p-1 rounded-lg mb-6 w-fit border border-border">
                 {['NGN', 'USD'].map((curr) => (
                   <button
                     key={curr}
                     onClick={() => setCurrency(curr as 'NGN' | 'USD')}
                     className={`px-4 py-1 text-xs font-bold rounded-md transition-all ${currency === curr ? 'bg-gold text-black' : 'text-muted-foreground hover:text-foreground'}`}
                   >
                     {curr}
                   </button>
                 ))}
              </div>

              <div className="flex-1 overflow-y-auto space-y-6">
                {items.length === 0 ? (
                  <div className="text-center text-muted-foreground mt-20">
                    <p>Your cart is empty.</p>
                  </div>
                ) : (
                  items.map((item) => (
                    <div key={item._id} className="flex gap-4 bg-background/50 p-3 rounded-lg border border-border">
                      <div className="w-16 h-20 bg-background rounded-md overflow-hidden flex-shrink-0 border border-border">
                         {item.image ? (
                           <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                         ) : (
                           <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">IMG</div>
                         )}
                      </div>
                      
                      <div className="flex-1">
                        <h3 className="font-medium text-foreground font-serif line-clamp-2">{item.title}</h3>
                        <p className="text-gold text-sm mt-1 font-bold">
                          {currency === 'NGN' ? '₦' : '$'}{currency === 'NGN' ? item.priceNGN.toLocaleString() : item.priceUSD}
                        </p>
                      </div>
                      
                      <button 
                        type="button" 
                        onClick={() => removeItem(item._id)} 
                        className="text-muted-foreground hover:text-red-500 p-2"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              {items.length > 0 && (
                <div className="border-t border-border pt-6 mt-6 space-y-4">
                  <div className="flex justify-between items-center text-xl font-serif text-foreground">
                    <span>Total</span>
                    <span className="text-gold">
                      {currency === 'NGN' ? '₦' : '$'}{totalAmount.toLocaleString()}
                    </span>
                  </div>

                  <div>
                    <label className="text-xs uppercase text-muted-foreground mb-1 block">Email for Receipt</label>
                    <input 
                      type="email" 
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => {
                          setEmail(e.target.value);
                          if (error) setError(null); // Clear error on typing
                      }}
                      className="w-full bg-background border border-border p-3 rounded text-foreground text-sm focus:border-gold outline-none"
                    />
                  </div>

                  {/* DYNAMIC ERROR BOX */}
                  {error && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs p-3 rounded-lg flex items-start gap-2">
                          <AlertCircle size={14} className="mt-0.5 shrink-0" />
                          <p>{error}</p>
                      </div>
                  )}

                  <button 
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full py-4 bg-gold hover:bg-gold/90 text-black font-bold uppercase tracking-wider transition-colors rounded-sm flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : <><CreditCard size={18} /> Pay Now</>}
                  </button>
                  
                  <p className="text-center text-[10px] text-muted-foreground mt-4 uppercase tracking-widest">
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