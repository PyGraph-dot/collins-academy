"use client";
import Header from "@/components/layout/Header";
import { ReactLenis } from '@studio-freight/react-lenis';
import { motion } from "framer-motion";
import { ArrowRight, Instagram, Twitter, Youtube } from "lucide-react";
import MagneticButton from "@/components/ui/MagneticButton";
import Link from "next/link";

export default function About() {
  return (
    <ReactLenis root>
      <main className="bg-[#0a0a0a] min-h-screen">
        <Header />

        {/* Section 1: The Manifesto */}
        <section className="pt-40 pb-20 px-6">
          <div className="max-w-4xl mx-auto">
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-[#d4af37] text-xs font-bold tracking-[0.2em] uppercase block mb-6"
            >
              The Philosophy
            </motion.span>
            
            <h1 className="text-4xl md:text-6xl font-serif text-white leading-[1.1] mb-12">
              <span className="block overflow-hidden">
                <motion.span 
                  initial={{ y: 50 }} 
                  animate={{ y: 0 }} 
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="block"
                >
                  English is not just a language.
                </motion.span>
              </span>
              <span className="block overflow-hidden">
                <motion.span 
                  initial={{ y: 50 }} 
                  animate={{ y: 0 }} 
                  transition={{ duration: 0.8, delay: 0.1, ease: "easeOut" }}
                  className="block italic text-gray-500"
                >
                  It is a currency.
                </motion.span>
              </span>
            </h1>

            <div className="grid md:grid-cols-2 gap-12 text-gray-400 leading-relaxed text-lg">
              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.6 }}
              >
                In a globalized world, the way you articulate your thoughts determines your value. It dictates whether you are heard, respected, and paid. My mission is not to teach you "grammar"—it is to teach you **authority**.
              </motion.p>
              <motion.p 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                transition={{ delay: 0.8 }}
              >
                From the bustling streets of Lagos to boardrooms in London, I have spent the last decade deconstructing the nuance of spoken English. I help ambitious professionals bridge the gap between their competence and their confidence.
              </motion.p>
            </div>
          </div>
        </section>

        {/* Section 2: The Stats (Social Proof) */}
        <section className="py-20 border-y border-white/5 bg-[#0d0d0d]">
          <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            {[
              { label: "Students Taught", value: "170k+" },
              { label: "Viral Views", value: "50M+" },
              { label: "Books Published", value: "3" },
              { label: "Years Active", value: "10+" },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-serif text-white mb-2">{stat.value}</div>
                <div className="text-xs text-[#d4af37] uppercase tracking-widest">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Section 3: The Story / Connect */}
        <section className="py-32 px-6">
          <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-16">
            {/* Image Placeholder */}
            <div className="w-full md:w-1/2 aspect-[3/4] bg-[#111] relative overflow-hidden rounded-lg group">
              <div className="absolute inset-0 bg-gray-800 animate-pulse" /> 
              {/* Replace with actual image later */}
              <div className="absolute bottom-6 left-6 z-10">
                <p className="text-white font-serif text-xl">Collins.</p>
                <p className="text-xs text-[#d4af37] uppercase tracking-widest">Educator & Author</p>
              </div>
            </div>

            <div className="w-full md:w-1/2">
              <h2 className="text-3xl font-serif text-white mb-6">Connect Beyond the Classroom.</h2>
              <p className="text-gray-400 mb-8">
                I share daily insights on nuance, vocabulary, and diction across all platforms. Join the conversation where it happens.
              </p>

              <div className="flex gap-4 mb-12">
                {[
                  { icon: <Instagram size={20} />, link: "#" },
                  { icon: <Twitter size={20} />, link: "#" },
                  { icon: <Youtube size={20} />, link: "#" },
                ].map((social, i) => (
                  <a 
                    key={i} 
                    href={social.link} 
                    className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-[#d4af37] hover:text-black hover:border-transparent transition-all"
                  >
                    {social.icon}
                  </a>
                ))}
              </div>

              <Link href="/academy">
                <MagneticButton>
                   <button className="px-8 py-4 bg-white text-black font-bold uppercase tracking-wider rounded-lg hover:bg-[#d4af37] transition-colors flex items-center gap-2">
                     Work with me <ArrowRight size={16} />
                   </button>
                </MagneticButton>
              </Link>
            </div>
          </div>
        </section>

      </main>
    </ReactLenis>
  );
}