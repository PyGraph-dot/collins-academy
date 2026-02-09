"use client";
import Header from "@/components/layout/Header";
import { ReactLenis } from '@studio-freight/react-lenis';
import { motion } from "framer-motion";
import { Check, ArrowRight, MessageCircle } from "lucide-react";
import MagneticButton from "@/components/ui/MagneticButton";

const tiers = [
  {
    name: "The Cohort",
    price: "₦150,000",
    duration: "6 Weeks",
    description: "Group immersion for professionals who need to speak with impact.",
    features: ["Weekly Live Masterclasses", "Peer Accountability Group", "homework Review", "Certificate of Completion"],
    cta: "Join Waitlist",
    color: "bg-[#1A1A1A]",
    border: "border-white/10"
  },
  {
    name: "Private Counsel",
    price: "₦500,000",
    duration: "Monthly",
    description: "Direct 1-on-1 access to Collins for executives and public figures.",
    features: ["Direct WhatsApp Access", "Speech Audits (Unlimited)", "Crisis Communication Prep", "Personal Branding Strategy"],
    cta: "Apply for Access",
    color: "bg-[#d4af37]/10",
    border: "border-[#d4af37]/50"
  }
];

export default function Academy() {
  return (
    <ReactLenis root>
      <main className="bg-[#0a0a0a] min-h-screen">
        <Header />
        
        {/* Hero Section */}
        <section className="pt-40 pb-20 px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="text-[#d4af37] text-xs font-bold tracking-[0.2em] uppercase">The Inner Circle</span>
            <h1 className="text-5xl md:text-7xl font-serif text-white mt-4 mb-6">
              Mastery requires <br />
              <span className="italic text-gray-500">proximity.</span>
            </h1>
            <p className="text-gray-400 max-w-xl mx-auto text-lg leading-relaxed">
              For those who need more than a book. Step into the arena of high-level discourse with personalized guidance.
            </p>
          </motion.div>
        </section>

        {/* Pricing Cards */}
        <section className="pb-32 px-6">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
            {tiers.map((tier, i) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2, duration: 0.8 }}
                className={`relative p-8 md:p-12 rounded-2xl border ${tier.border} ${tier.color} backdrop-blur-sm group hover:-translate-y-2 transition-transform duration-500`}
              >
                {/* Shine Effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 bg-gradient-to-b from-white to-transparent transition-opacity duration-500 rounded-2xl pointer-events-none" />

                <div className="relative z-10">
                  <h3 className="text-3xl font-serif text-white mb-2">{tier.name}</h3>
                  <div className="flex items-baseline gap-2 mb-6">
                    <span className="text-[#d4af37] text-xl font-bold">{tier.price}</span>
                    <span className="text-gray-500 text-sm">/ {tier.duration}</span>
                  </div>
                  <p className="text-gray-400 text-sm mb-8 min-h-[48px]">{tier.description}</p>

                  <ul className="space-y-4 mb-10">
                    {tier.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-3 text-sm text-gray-300">
                        <Check size={16} className="text-[#d4af37] mt-0.5" />
                        {feat}
                      </li>
                    ))}
                  </ul>

                  <MagneticButton className="w-full">
                    <button className="w-full py-4 bg-white text-black font-bold uppercase tracking-wider text-xs rounded-lg hover:bg-[#d4af37] transition-colors flex items-center justify-center gap-2">
                      {tier.name === "Private Counsel" ? <MessageCircle size={16} /> : null}
                      {tier.cta} <ArrowRight size={16} />
                    </button>
                  </MagneticButton>
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </main>
    </ReactLenis>
  );
}