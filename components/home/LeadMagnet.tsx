"use client";
import { motion } from "framer-motion";
import { ArrowRight, Check, Mail } from "lucide-react";
import { useState } from "react";

export default function LeadMagnet() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    // Simulate API call
    setTimeout(() => setStatus("success"), 1500);
  };

  return (
    // UPDATED: Dynamic Background
    <section className="py-24 px-6 bg-background relative overflow-hidden transition-colors duration-300">
      
      {/* Background Decor (Gold Mesh) */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gold opacity-[0.05] dark:opacity-[0.03] blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8 }}
          // UPDATED: Card background and border
          className="bg-card border border-border rounded-2xl p-8 md:p-12 md:flex items-center gap-12 shadow-2xl overflow-hidden relative"
        >
          {/* Subtle Grain Overlay on the card */}
          <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://upload.wikimedia.org/wikipedia/commons/7/76/Noise.png')]" />

          {/* Left: Content */}
          <div className="flex-1 relative z-10 mb-8 md:mb-0">
            <span className="text-gold font-bold tracking-widest text-xs uppercase mb-2 block">
              Free Resource
            </span>
            <h2 className="text-3xl md:text-4xl font-serif text-card-foreground mb-4">
              Are you saying these <br />
              <span className="italic text-muted-foreground">50 words</span> wrong?
            </h2>
            <p className="text-muted-foreground text-sm md:text-base mb-6 leading-relaxed">
              Download the official Collins pronunciation cheatsheet. Correct the common mistakes that undermine your authority.
            </p>
            
            {/* Checklist */}
            <ul className="space-y-3">
              {['Vowel Sounds Guide', 'Stress Patterns', 'Instant PDF Download'].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm text-muted-foreground">
                  <div className="w-5 h-5 rounded-full bg-gold/10 flex items-center justify-center text-gold">
                    <Check size={12} strokeWidth={3} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Right: Input Form */}
          <div className="w-full md:w-[380px] relative z-10">
            {/* UPDATED: Form container using bg-background/50 for contrast against bg-card */}
            <form onSubmit={handleSubmit} className="bg-background/50 p-6 rounded-xl border border-border backdrop-blur-sm shadow-sm">
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="sr-only">Email Address</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-gold transition-colors" size={18} />
                    <input 
                      type="email" 
                      id="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      // UPDATED: Input colors
                      className="w-full bg-background border border-border text-foreground text-sm rounded-lg py-3.5 pl-12 pr-4 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold transition-all placeholder:text-muted-foreground appearance-none"
                    />
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={status !== "idle"}
                  className="w-full bg-gold hover:bg-gold/90 text-black font-bold py-3.5 rounded-lg flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {status === "loading" ? (
                    <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                  ) : status === "success" ? (
                    <>Sent to your inbox <Check size={18} /></>
                  ) : (
                    <>Get the Guide <ArrowRight size={18} /></>
                  )}
                </button>
              </div>
              <p className="text-center text-xs text-muted-foreground mt-4">
                Join 170k+ students. Unsubscribe anytime.
              </p>
            </form>
          </div>

        </motion.div>
      </div>
    </section>
  );
}